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
        actual_requester = user

        # Desk Intake: staff/admin can file on behalf of a walk-in resident
        if user.role in ['BARANGAY_STAFF', 'BARANGAY_ADMIN', 'PLATFORM_ADMIN']:
            walkin_id = self.request.data.get('requester_id')
            if walkin_id:
                target_user = User.objects.filter(id=walkin_id, barangay=user.barangay).first()
                if target_user:
                    actual_requester = target_user

        req_obj = serializer.save(
            barangay=actual_requester.barangay or user.barangay,
            requester=actual_requester,
            status='PENDING'
        )

        AuditLogger.log(
            user=user,
            action='REQUEST_CREATION',
            description=f"Created assistance request '{req_obj.title}' in {req_obj.zone} (for {actual_requester.full_name})",
            target_type='AssistanceRequest',
            target_id=str(req_obj.id),
            barangay=req_obj.barangay
        )

        # Trigger Rule-Based Matching Engine
        matches = RuleBasedMatchingService.find_and_rank_helpers(req_obj)
        if matches:
            req_obj.status = 'MATCHED'
            req_obj.save(update_fields=['status'])

            # Auto-Dispatch logic: If requested or if EMERGENCY
            auto_dispatch = self.request.data.get('auto_dispatch', False)
            if auto_dispatch or req_obj.urgency == 'EMERGENCY':
                limit = len(matches) if req_obj.urgency == 'EMERGENCY' else 3
                for match in matches[:limit]:
                    h_id = match.get('helper_id') or (isinstance(match.get('helper'), dict) and match['helper'].get('id'))
                    helper_user = User.objects.filter(id=h_id).first() if h_id else None
                    if helper_user:
                        inv, created = AssistanceInvitation.objects.get_or_create(
                            request=req_obj,
                            helper=helper_user,
                            defaults={
                                'message': 'Auto-matched invitation based on trade skill & proximity.',
                                'status': 'INVITED'
                            }
                        )
                        score = match.get('total_score', match.get('score', 100))
                        NotificationService.send(
                            user=helper_user,
                            title="Urgent Broadcast" if req_obj.urgency == 'EMERGENCY' else "New Auto-Matched Assistance Request",
                            message=f"{actual_requester.full_name} needs assistance: '{req_obj.title}' in {req_obj.zone} (Match Score: {score}/100)",
                            notif_type='INVITATION_RECEIVED',
                            link=f"/requests/{req_obj.id}"
                        )

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

    @action(detail=True, methods=['post'])
    def auto_dispatch(self, request, pk=None):
        req_obj = self.get_object()
        user = request.user
        if req_obj.requester != user and user.role not in ['BARANGAY_STAFF', 'BARANGAY_ADMIN', 'PLATFORM_ADMIN']:
            return Response({'detail': 'Not authorized to dispatch invitations.'}, status=status.HTTP_403_FORBIDDEN)

        matches = RuleBasedMatchingService.find_and_rank_helpers(req_obj)
        if not matches:
            return Response({'detail': 'No matching verified helpers currently available in this barangay.'}, status=status.HTTP_400_BAD_REQUEST)

        dispatched_count = 0
        for match in matches[:3]:
            h_id = match.get('helper_id') or (isinstance(match.get('helper'), dict) and match['helper'].get('id'))
            helper_user = User.objects.filter(id=h_id).first() if h_id else None
            if helper_user:
                inv, created = AssistanceInvitation.objects.get_or_create(
                    request=req_obj,
                    helper=helper_user,
                    defaults={'message': 'Auto-matched invitation based on trade skill & proximity.', 'status': 'INVITED'}
                )
                if created or inv.status == 'DECLINED':
                    inv.status = 'INVITED'
                    inv.save()
                    score = match.get('total_score', match.get('score', 100))
                    NotificationService.send(
                        user=helper_user,
                        title="Auto-Matched Assistance Request",
                        message=f"{req_obj.requester.full_name} needs assistance: '{req_obj.title}' (Match Score: {score}/100)",
                        notif_type='INVITATION_RECEIVED',
                        link=f"/requests/{req_obj.id}"
                    )
                    dispatched_count += 1

        req_obj.status = 'MATCHED'
        req_obj.save(update_fields=['status'])
        return Response({'detail': f"Auto-dispatched invitations to {dispatched_count} top-scored helpers.", 'dispatched_count': dispatched_count})

    @action(detail=True, methods=['post'], permission_classes=[IsBarangayStaffOrAdmin])
    def reassign_helper(self, request, pk=None):
        req_obj = self.get_object()
        new_helper_id = request.data.get('helper_id')
        reason = request.data.get('reason', 'Supervisor re-assignment')

        if not new_helper_id:
            return Response({'detail': 'helper_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        new_helper = User.objects.filter(id=new_helper_id, barangay=req_obj.barangay, is_active=True).first()
        if not new_helper:
            return Response({'detail': 'Target helper not found in this barangay.'}, status=status.HTTP_404_NOT_FOUND)

        old_helper = req_obj.assigned_helper
        req_obj.assigned_helper = new_helper
        req_obj.status = 'ACCEPTED'
        req_obj.save(update_fields=['assigned_helper', 'status'])

        if old_helper:
            NotificationService.send(
                user=old_helper,
                title="Assistance Task Re-assigned",
                message=f"Ticket '{req_obj.title}' was re-assigned by barangay administration. Reason: {reason}",
                notif_type='GENERAL',
                link=f"/requests/{req_obj.id}"
            )

        NotificationService.send(
            user=new_helper,
            title="Assistance Ticket Assigned to You",
            message=f"Barangay administration assigned you to assist with: '{req_obj.title}' in {req_obj.zone}",
            notif_type='INVITATION_RECEIVED',
            link=f"/requests/{req_obj.id}"
        )

        AuditLogger.log(
            user=request.user,
            action='ADMIN_ACTION',
            description=f"Reassigned ticket #{req_obj.id} from {old_helper.full_name if old_helper else 'None'} to {new_helper.full_name}. Reason: {reason}",
            target_type='AssistanceRequest',
            target_id=str(req_obj.id),
            barangay=req_obj.barangay
        )

        return Response({'detail': f"Helper successfully re-assigned to {new_helper.full_name}."})

    @action(detail=True, methods=['post'])
    def link_equipment(self, request, pk=None):
        req_obj = self.get_object()
        user = request.user
        if user not in [req_obj.requester, req_obj.assigned_helper] and user.role not in ['BARANGAY_STAFF', 'BARANGAY_ADMIN']:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        resource_id = request.data.get('resource_id')
        if not resource_id:
            return Response({'detail': 'resource_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        from resources.models import Resource
        resource = Resource.objects.filter(id=resource_id, barangay=req_obj.barangay).first()
        if not resource:
            return Response({'detail': 'Community resource not found.'}, status=status.HTTP_404_NOT_FOUND)

        req_obj.linked_resource = resource
        req_obj.save(update_fields=['linked_resource'])
        resource.status = 'BORROWED'
        resource.save(update_fields=['status'])

        return Response({'detail': f"Linked equipment '{resource.name}' to this assistance ticket."})


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
    def en_route(self, request, pk=None):
        req_obj = AssistanceRequest.objects.filter(id=pk).first()
        if not req_obj:
            return Response({'detail': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user != req_obj.assigned_helper:
            return Response({'detail': 'Only the assigned helper can mark en route.'}, status=status.HTTP_403_FORBIDDEN)

        if req_obj.status != 'ACCEPTED':
            return Response({'detail': f"Cannot mark en route from '{req_obj.status}' status."}, status=status.HTTP_400_BAD_REQUEST)

        req_obj.status = 'EN_ROUTE'
        req_obj.save(update_fields=['status'])

        NotificationService.send(
            user=req_obj.requester,
            title="Helper is on the way!",
            message=f"{req_obj.assigned_helper.full_name} is now en route to your location for '{req_obj.title}'.",
            notif_type='GENERAL',
            link=f"/requests/{req_obj.id}"
        )

        return Response({'detail': 'You are now marked as en route.', 'status': 'EN_ROUTE'})

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        req_obj = AssistanceRequest.objects.filter(id=pk).first()
        if not req_obj:
            return Response({'detail': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user not in [req_obj.requester, req_obj.assigned_helper]:
            return Response({'detail': 'Not authorized to start this assistance.'}, status=status.HTTP_403_FORBIDDEN)

        if req_obj.status not in ['ACCEPTED', 'EN_ROUTE']:
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
                message=f"Assistance for '{req_obj.title}' has officially started.",
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
        notes = (request.data.get('completion_notes') or request.data.get('notes') or '').strip()
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

        # Release linked community equipment back to available
        if req_obj.linked_resource:
            req_obj.linked_resource.status = 'AVAILABLE'
            req_obj.linked_resource.save(update_fields=['status'])

        return Response({'detail': 'Assistance marked as completed.', 'status': 'COMPLETED'})

    @action(detail=True, methods=['post'])
    def propose_reschedule(self, request, pk=None):
        req_obj = AssistanceRequest.objects.filter(id=pk).first()
        if not req_obj:
            return Response({'detail': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user not in [req_obj.requester, req_obj.assigned_helper]:
            return Response({'detail': 'Not authorized to propose reschedule.'}, status=status.HTTP_403_FORBIDDEN)

        new_date = request.data.get('preferred_date') or request.data.get('new_date')
        new_time = request.data.get('preferred_time') or request.data.get('new_time') or 'Flexible'
        reason = request.data.get('reason', '')

        if not new_date:
            return Response({'detail': 'preferred_date is required.'}, status=status.HTTP_400_BAD_REQUEST)

        req_obj.reschedule_proposed_date = new_date
        req_obj.reschedule_proposed_time = new_time
        req_obj.reschedule_proposed_by = request.user
        req_obj.reschedule_reason = reason
        req_obj.save(update_fields=[
            'reschedule_proposed_date', 'reschedule_proposed_time',
            'reschedule_proposed_by', 'reschedule_reason'
        ])

        other_user = req_obj.requester if request.user == req_obj.assigned_helper else req_obj.assigned_helper
        if other_user:
            NotificationService.send(
                user=other_user,
                title="Schedule Adjustment Proposed",
                message=f"{request.user.full_name} proposed rescheduling '{req_obj.title}' to {new_date} ({new_time}).",
                notif_type='GENERAL',
                link=f"/requests/{req_obj.id}"
            )

        return Response({'detail': 'Reschedule proposal submitted.'})

    @action(detail=True, methods=['post'])
    def respond_reschedule(self, request, pk=None):
        req_obj = AssistanceRequest.objects.filter(id=pk).first()
        if not req_obj:
            return Response({'detail': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user not in [req_obj.requester, req_obj.assigned_helper]:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        if req_obj.reschedule_proposed_by == request.user:
            return Response({'detail': 'You cannot respond to your own proposal.'}, status=status.HTTP_400_BAD_REQUEST)

        action_decision = request.data.get('action') # 'ACCEPT' or 'DECLINE'
        proposer = req_obj.reschedule_proposed_by

        if action_decision == 'ACCEPT':
            req_obj.preferred_date = req_obj.reschedule_proposed_date
            if req_obj.reschedule_proposed_time:
                req_obj.preferred_time = req_obj.reschedule_proposed_time
            req_obj.reschedule_proposed_date = None
            req_obj.reschedule_proposed_time = ''
            req_obj.reschedule_proposed_by = None
            req_obj.reschedule_reason = ''
            req_obj.save(update_fields=[
                'preferred_date', 'preferred_time',
                'reschedule_proposed_date', 'reschedule_proposed_time',
                'reschedule_proposed_by', 'reschedule_reason'
            ])

            if proposer:
                NotificationService.send(
                    user=proposer,
                    title="Reschedule Proposal Accepted",
                    message=f"The new schedule for '{req_obj.title}' was accepted.",
                    notif_type='GENERAL',
                    link=f"/requests/{req_obj.id}"
                )
            return Response({'detail': 'New schedule accepted and updated.'})

        else:
            req_obj.reschedule_proposed_date = None
            req_obj.reschedule_proposed_time = ''
            req_obj.reschedule_proposed_by = None
            req_obj.reschedule_reason = ''
            req_obj.save(update_fields=[
                'reschedule_proposed_date', 'reschedule_proposed_time',
                'reschedule_proposed_by', 'reschedule_reason'
            ])

            if proposer:
                NotificationService.send(
                    user=proposer,
                    title="Reschedule Proposal Declined",
                    message=f"The reschedule proposal for '{req_obj.title}' was declined.",
                    notif_type='GENERAL',
                    link=f"/requests/{req_obj.id}"
                )
            return Response({'detail': 'Reschedule proposal declined.'})

