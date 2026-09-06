from django.utils import timezone
from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from assistance.models import AssistanceRequest, AssistanceInvitation, AssistanceTransaction, TicketMessage
from assistance.serializers import (
    AssistanceRequestSerializer, AssistanceRequestCreateSerializer,
    AssistanceInvitationSerializer, AssistanceTransactionSerializer,
    TicketMessageSerializer
)
from matching.matching_service import RuleBasedMatchingService
from accounts.models import User
from activity_logs.services import AuditLogger
from notifications.services import NotificationService
from kasandigan_core.permissions import IsBarangayStaffOrAdmin

class AssistanceRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return AssistanceRequestCreateSerializer
        return AssistanceRequestSerializer

    def get_queryset(self):
        user = self.request.user
        scope = self.request.query_params.get('scope')
        status_param = self.request.query_params.get('status')
        category_param = self.request.query_params.get('category')

        if user.role == 'PLATFORM_ADMIN':
            qs = AssistanceRequest.objects.all()
            b_id = self.request.query_params.get('barangay')
            if b_id:
                qs = qs.filter(barangay_id=b_id)
        else:
            # Tenant isolation: user's barangay only
            qs = AssistanceRequest.objects.filter(barangay=user.barangay)

        if scope == 'my_requests':
            qs = qs.filter(requester=user)
        elif scope == 'my_helping':
            qs = qs.filter(assigned_helper=user)
        elif scope == 'open_community':
            # Active requests looking for helpers in the barangay
            qs = qs.filter(status__in=['PENDING', 'MATCHED']).exclude(requester=user)

        if status_param:
            qs = qs.filter(status=status_param)
        if category_param:
            qs = qs.filter(category_id=category_param)

        return qs.select_related('requester', 'assigned_helper', 'category', 'required_skill')

    def perform_create(self, serializer):
        user = self.request.user
        req_obj = serializer.save(
            barangay=user.barangay,
            requester=user,
            status='PENDING'
        )

        AuditLogger.log(
            user=user,
            action='REQUEST_CREATION',
            description=f"Created assistance request '{req_obj.title}' in {req_obj.zone}",
            target_type='AssistanceRequest',
            target_id=str(req_obj.id),
            barangay=user.barangay
        )

        # Trigger Rule-Based Matching Engine
        matches = RuleBasedMatchingService.find_and_rank_helpers(req_obj)
        if matches:
            req_obj.status = 'MATCHED'
            req_obj.save(update_fields=['status'])

    @action(detail=True, methods=['get'])
    def matches(self, request, pk=None):
        """
        Runs/refreshes the rule-based matching engine for this request
        and returns ranked helpers with score breakdowns and transparent explanations.
        """
        req_obj = self.get_object()
        # Requester or barangay admin/staff can see matches
        if req_obj.requester != request.user and request.user.role not in ['BARANGAY_STAFF', 'BARANGAY_ADMIN', 'PLATFORM_ADMIN']:
            return Response({'detail': 'You cannot view matches for this request.'}, status=status.HTTP_403_FORBIDDEN)

        ranked_helpers = RuleBasedMatchingService.find_and_rank_helpers(req_obj)
        return Response({'matches': ranked_helpers, 'count': len(ranked_helpers)})

    @action(detail=True, methods=['post'])
    def invite_helper(self, request, pk=None):
        """
        Requester selects and sends an assistance invitation to a qualified helper.
        """
        req_obj = self.get_object()
        if req_obj.requester != request.user:
            return Response({'detail': 'Only the requester can send invitations.'}, status=status.HTTP_403_FORBIDDEN)

        helper_id = request.data.get('helper_id')
        message = request.data.get('message', '')

        if not helper_id:
            return Response({'detail': 'helper_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        helper = User.objects.filter(
            id=helper_id,
            barangay=req_obj.barangay,
            verification_status='VERIFIED',
            is_active=True
        ).first()

        if not helper:
            return Response({'detail': 'Qualified helper not found in your barangay.'}, status=status.HTTP_404_NOT_FOUND)

        invitation, created = AssistanceInvitation.objects.get_or_create(
            request=req_obj,
            helper=helper,
            defaults={'message': message, 'status': 'INVITED'}
        )

        if not created and invitation.status == 'DECLINED':
            invitation.status = 'INVITED'
            invitation.message = message
            invitation.responded_at = None
            invitation.save()

        # In-app notification to helper
        NotificationService.send(
            user=helper,
            title="Assistance Request Invitation",
            message=f"{request.user.full_name} invited you to assist with: '{req_obj.title}' in {req_obj.zone}",
            notif_type='INVITATION_RECEIVED',
            link=f"/requests/{req_obj.id}"
        )

        return Response({
            'detail': f"Invitation sent to {helper.full_name}.",
            'invitation_id': invitation.id
        })

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        req_obj = self.get_object()
        user = request.user

        is_owner = (req_obj.requester == user)
        is_staff_admin = (user.role in ['BARANGAY_STAFF', 'BARANGAY_ADMIN', 'PLATFORM_ADMIN'])

        if not (is_owner or is_staff_admin):
            return Response({'detail': 'Not authorized to cancel this request.'}, status=status.HTTP_403_FORBIDDEN)

        if req_obj.status in ['COMPLETED', 'CANCELLED']:
            return Response({'detail': f"Request is already {req_obj.status.lower()}."}, status=status.HTTP_400_BAD_REQUEST)

        req_obj.status = 'CANCELLED'
        req_obj.save(update_fields=['status'])

        # Cancel open invitations
        req_obj.invitations.filter(status='INVITED').update(status='CANCELLED')

        AuditLogger.log(
            user=user,
            action='REQUEST_CANCELLATION',
            description=f"Assistance request '{req_obj.title}' was cancelled by {user.full_name}",
            target_type='AssistanceRequest',
            target_id=str(req_obj.id),
            barangay=req_obj.barangay
        )

        return Response({'detail': 'Assistance request cancelled.'})

    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        req_obj = self.get_object()
        user = request.user

        is_participant = (user == req_obj.requester or user == req_obj.assigned_helper)
        is_staff_admin = (user.role in ['BARANGAY_STAFF', 'BARANGAY_ADMIN', 'PLATFORM_ADMIN'])
        if not (is_participant or is_staff_admin):
            return Response({'detail': 'Not authorized to view messages for this request.'}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'GET':
            msgs = req_obj.messages.all().select_related('sender')
            req_obj.messages.exclude(sender=user).filter(is_read=False).update(is_read=True)
            serializer = TicketMessageSerializer(msgs, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            msg_text = request.data.get('message', '').strip()
            if not msg_text:
                return Response({'detail': 'Message text cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

            msg = TicketMessage.objects.create(
                request=req_obj,
                sender=user,
                message=msg_text
            )

            other_user = req_obj.requester if user == req_obj.assigned_helper else req_obj.assigned_helper
            if other_user:
                NotificationService.send(
                    user=other_user,
                    title=f"New message on '{req_obj.title}'",
                    message=f"{user.full_name}: {msg_text[:60]}...",
                    notif_type='GENERAL',
                    link=f"/requests/{req_obj.id}"
                )

            return Response(TicketMessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class AssistanceInvitationViewSet(viewsets.ModelViewSet):
    serializer_class = AssistanceInvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        tab = self.request.query_params.get('tab')
        if tab == 'sent':
            return AssistanceInvitation.objects.filter(request__requester=user)
        # Default: received invitations for helper
        return AssistanceInvitation.objects.filter(helper=user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invitation = self.get_object()
        if invitation.helper != request.user:
            return Response({'detail': 'Only the invited helper can accept.'}, status=status.HTTP_403_FORBIDDEN)

        req_obj = invitation.request
        if req_obj.status in ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']:
            return Response({'detail': f"Request is already {req_obj.status.lower()}."}, status=status.HTTP_400_BAD_REQUEST)

        invitation.status = 'ACCEPTED'
        invitation.responded_at = timezone.now()
        invitation.save(update_fields=['status', 'responded_at'])

        # Update Request status and assign helper
        req_obj.status = 'ACCEPTED'
        req_obj.assigned_helper = invitation.helper
        req_obj.save(update_fields=['status', 'assigned_helper'])

        # Create AssistanceTransaction
        AssistanceTransaction.objects.get_or_create(
            request=req_obj,
            defaults={
                'barangay': req_obj.barangay,
                'requester': req_obj.requester,
                'helper': invitation.helper
            }
        )

        # Notify requester
        NotificationService.send(
            user=req_obj.requester,
            title="Assistance Invitation Accepted!",
            message=f"{invitation.helper.full_name} accepted your assistance request for '{req_obj.title}'.",
            notif_type='REQUEST_ACCEPTED',
            link=f"/requests/{req_obj.id}"
        )

        AuditLogger.log(
            user=request.user,
            action='REQUEST_ACCEPTANCE',
            description=f"{invitation.helper.full_name} accepted assistance request '{req_obj.title}'",
            target_type='AssistanceRequest',
            target_id=str(req_obj.id),
            barangay=req_obj.barangay
        )

        return Response({'detail': 'Invitation accepted. Assistance is scheduled.', 'status': 'ACCEPTED'})

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        invitation = self.get_object()
        if invitation.helper != request.user:
            return Response({'detail': 'Only the invited helper can decline.'}, status=status.HTTP_403_FORBIDDEN)

        reason = request.data.get('reason', '')
        invitation.status = 'DECLINED'
        invitation.decline_reason = reason
        invitation.responded_at = timezone.now()
        invitation.save(update_fields=['status', 'decline_reason', 'responded_at'])

        NotificationService.send(
            user=invitation.request.requester,
            title="Assistance Invitation Declined",
            message=f"{invitation.helper.full_name} is unable to assist with '{invitation.request.title}'. You can review other matched helpers.",
            notif_type='REQUEST_DECLINED',
            link=f"/requests/{invitation.request.id}"
        )

        return Response({'detail': 'Invitation declined.'})


class AssistanceWorkflowViewSet(viewsets.ViewSet):
    """
    Handles step-by-step progress: Start assistance -> Complete assistance.
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        req_obj = AssistanceRequest.objects.filter(id=pk).first()
        if not req_obj:
            return Response({'detail': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Either helper or requester can mark as started
        if request.user not in [req_obj.requester, req_obj.assigned_helper]:
            return Response({'detail': 'Not authorized to start this assistance.'}, status=status.HTTP_403_FORBIDDEN)

        if req_obj.status != 'ACCEPTED':
            return Response({'detail': f"Cannot start assistance in '{req_obj.status}' status."}, status=status.HTTP_400_BAD_REQUEST)

        req_obj.status = 'IN_PROGRESS'
        req_obj.save(update_fields=['status'])

        # Update transaction
        tx, _ = AssistanceTransaction.objects.get_or_create(
            request=req_obj,
            defaults={'barangay': req_obj.barangay, 'requester': req_obj.requester, 'helper': req_obj.assigned_helper}
        )
        tx.started_at = timezone.now()
        tx.save(update_fields=['started_at'])

        other_user = req_obj.requester if request.user == req_obj.assigned_helper else req_obj.assigned_helper
        if other_user:
            NotificationService.send(
                user=other_user,
                title="Assistance In Progress",
                message=f"Assistance for '{req_obj.title}' has started.",
                notif_type='ASSISTANCE_STARTED',
                link=f"/requests/{req_obj.id}"
            )

        return Response({'detail': 'Assistance is now in progress.', 'status': 'IN_PROGRESS'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        req_obj = AssistanceRequest.objects.filter(id=pk).first()
        if not req_obj:
            return Response({'detail': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user not in [req_obj.requester, req_obj.assigned_helper]:
            return Response({'detail': 'Not authorized to complete this assistance.'}, status=status.HTTP_403_FORBIDDEN)

        if req_obj.status == 'COMPLETED':
            return Response({'detail': 'This assistance has already been completed.'}, status=status.HTTP_400_BAD_REQUEST)

        req_obj.status = 'COMPLETED'
        req_obj.completed_at = timezone.now()
        proof_url = request.data.get('completion_proof_url', '').strip()
        notes = request.data.get('completion_notes', '').strip()
        update_fields = ['status', 'completed_at']
        if proof_url:
            req_obj.completion_proof_url = proof_url
            update_fields.append('completion_proof_url')
        if notes:
            req_obj.completion_notes = notes
            update_fields.append('completion_notes')
        req_obj.save(update_fields=update_fields)

        # Update transaction
        tx, _ = AssistanceTransaction.objects.get_or_create(
            request=req_obj,
            defaults={'barangay': req_obj.barangay, 'requester': req_obj.requester, 'helper': req_obj.assigned_helper}
        )
        tx.completed_at = timezone.now()
        tx.save(update_fields=['completed_at'])

        # Increment helper's completed_assistance_count
        if req_obj.assigned_helper:
            helper = req_obj.assigned_helper
            helper.completed_assistance_count = models.F('completed_assistance_count') + 1
            helper.save(update_fields=['completed_assistance_count'])
            helper.refresh_from_db()

            # Notify requester to submit a rating & review
            NotificationService.send(
                user=req_obj.requester,
                title="Assistance Completed! Leave a Rating",
                message=f"Your assistance request '{req_obj.title}' was completed by {helper.full_name}. Please rate your helper!",
                notif_type='ASSISTANCE_COMPLETED',
                link=f"/requests/{req_obj.id}"
            )

            # Notify helper
            NotificationService.send(
                user=helper,
                title="Assistance Marked Completed",
                message=f"Thank you for helping with '{req_obj.title}' in Barangay {req_obj.barangay.name}!",
                notif_type='ASSISTANCE_COMPLETED',
                link=f"/requests/{req_obj.id}"
            )

        AuditLogger.log(
            user=request.user,
            action='REQUEST_COMPLETION',
            description=f"Assistance request '{req_obj.title}' marked as completed by {request.user.full_name}",
            target_type='AssistanceRequest',
            target_id=str(req_obj.id),
            barangay=req_obj.barangay
        )

        return Response({'detail': 'Assistance marked as completed.', 'status': 'COMPLETED'})
