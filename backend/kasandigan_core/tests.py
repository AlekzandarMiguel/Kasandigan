from datetime import date, timedelta
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from tenants.models import Barangay
from accounts.models import User, BlockedUser
from skills.models import AssistanceCategory, Skill, UserSkill, UserAvailability
from assistance.models import AssistanceRequest, AssistanceInvitation, AssistanceTransaction
from matching.matching_service import RuleBasedMatchingService
from ratings.models import Rating
from resources.models import Resource

class KasandiganCoreTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create two isolated barangays (Tenants in Maramag, Bukidnon)
        self.barangay_a = Barangay.objects.create(
            name="Barangay South Poblacion",
            code="south-poblacion",
            municipality_city="Maramag",
            province="Bukidnon",
            status="ACTIVE",
            zones=["Purok 1", "Purok 2", "Purok 3"]
        )

        self.barangay_b = Barangay.objects.create(
            name="Barangay Musuan",
            code="musuan",
            municipality_city="Maramag",
            province="Bukidnon",
            status="ACTIVE",
            zones=["Purok 1", "Purok 2", "Sitio Sayre"]
        )

        # Create Platform Admin
        self.platform_admin = User.objects.create_superuser(
            email="platform.admin@kasandigan.gov.ph",
            password="Password123!",
            first_name="Global",
            last_name="Admin"
        )

        # Create Barangay Admin for Barangay A
        self.admin_a = User.objects.create_user(
            email="admin.southpoblacion@kasandigan.gov.ph",
            password="Password123!",
            first_name="Admin",
            last_name="SouthPoblacion",
            role="BARANGAY_ADMIN",
            barangay=self.barangay_a,
            verification_status="VERIFIED"
        )

        # Create Residents in Barangay A
        self.requester_a = User.objects.create_user(
            email="maria.requester@example.com",
            password="Password123!",
            first_name="Maria",
            last_name="Santos",
            role="RESIDENT",
            barangay=self.barangay_a,
            zone="Zone 2",
            verification_status="VERIFIED"
        )

        self.helper_a = User.objects.create_user(
            email="juan.helper@example.com",
            password="Password123!",
            first_name="Juan",
            last_name="Dela Cruz",
            role="RESIDENT",
            barangay=self.barangay_a,
            zone="Zone 2",
            verification_status="VERIFIED",
            rating_average=4.8,
            rating_count=5
        )

        # Create Resident in Barangay B
        self.resident_b = User.objects.create_user(
            email="pedro.b@example.com",
            password="Password123!",
            first_name="Pedro",
            last_name="Penduko",
            role="RESIDENT",
            barangay=self.barangay_b,
            zone="Poblacion East",
            verification_status="VERIFIED"
        )

        # Category and Skills
        self.cat_tech = AssistanceCategory.objects.create(
            name="Technology Help",
            icon="Laptop"
        )

        self.skill_repair = Skill.objects.create(
            category=self.cat_tech,
            name="Computer Repair"
        )

        # Assign skill and availability to helper_a
        UserSkill.objects.create(
            user=self.helper_a,
            skill=self.skill_repair,
            proficiency="EXPERT"
        )

        # Available on Saturday (day 5)
        UserAvailability.objects.create(
            user=self.helper_a,
            day_of_week=5,
            is_available=True,
            time_slot="ALL_DAY"
        )

    def test_tenant_isolation_assistance_requests(self):
        """Ensure Resident in Barangay A cannot see or access requests from Barangay B"""
        req_b = AssistanceRequest.objects.create(
            barangay=self.barangay_b,
            requester=self.resident_b,
            title="Help in Barangay B",
            description="Need help in Poblacion",
            category=self.cat_tech,
            preferred_date=date.today() + timedelta(days=2),
            zone="Poblacion East"
        )

        # Login as Resident A
        self.client.force_authenticate(user=self.requester_a)
        response = self.client.get('/api/requests/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Results should NOT contain Barangay B's request
        req_ids = [item['id'] for item in response.data.get('results', [])]
        self.assertNotIn(req_b.id, req_ids)

    def test_deterministic_rule_based_matching(self):
        """Test rule-based scoring without AI: Skill(+50) + Barangay(+20) + Zone(+15) + Avail(+10) + Rating(+5) = 100"""
        # Pick next Saturday
        today = date.today()
        saturday = today + timedelta(days=(5 - today.weekday()) % 7)

        req = AssistanceRequest.objects.create(
            barangay=self.barangay_a,
            requester=self.requester_a,
            title="Laptop not starting",
            description="Troubleshooting needed",
            category=self.cat_tech,
            required_skill=self.skill_repair,
            preferred_date=saturday,
            preferred_time="Morning",
            zone="Zone 2"
        )

        matches = RuleBasedMatchingService.find_and_rank_helpers(req)
        self.assertTrue(len(matches) > 0)
        top_match = matches[0]
        self.assertEqual(top_match['helper_id'], self.helper_a.id)
        # Score calculation: 50 (skill) + 20 (barangay) + 15 (zone 2) + 10 (saturday avail) + 5 (rating 4.8) = 100
        self.assertEqual(top_match['total_score'], 100)
        self.assertIn("Matching skill", top_match['reasons'][0])

    def test_blocked_user_excluded_from_matching(self):
        """Blocked helpers must never appear in matching recommendations"""
        BlockedUser.objects.create(
            blocker=self.requester_a,
            blocked=self.helper_a,
            barangay=self.barangay_a,
            reason="Spam"
        )

        req = AssistanceRequest.objects.create(
            barangay=self.barangay_a,
            requester=self.requester_a,
            title="Need electrical help",
            description="Broken switch",
            category=self.cat_tech,
            preferred_date=date.today(),
            zone="Zone 2"
        )

        matches = RuleBasedMatchingService.find_and_rank_helpers(req)
        matched_helper_ids = [m['helper_id'] for m in matches]
        self.assertNotIn(self.helper_a.id, matched_helper_ids)

    def test_rating_cannot_be_submitted_before_completion(self):
        """Rating can only be submitted after request status is COMPLETED"""
        req = AssistanceRequest.objects.create(
            barangay=self.barangay_a,
            requester=self.requester_a,
            assigned_helper=self.helper_a,
            title="Yard Cleaning",
            description="Lawn mowing",
            category=self.cat_tech,
            preferred_date=date.today(),
            zone="Zone 2",
            status="IN_PROGRESS"
        )

        self.client.force_authenticate(user=self.requester_a)
        response = self.client.post('/api/ratings/', {
            'request': req.id,
            'score': 5,
            'review': 'Great work!'
        })
        # Should fail with 400 validation error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("completed", str(response.data))

    def test_workflow_en_route_and_start_and_complete(self):
        """Helper transitions: ACCEPTED -> EN_ROUTE -> IN_PROGRESS -> COMPLETED"""
        req = AssistanceRequest.objects.create(
            barangay=self.barangay_a,
            requester=self.requester_a,
            assigned_helper=self.helper_a,
            title="Roof Leak Repair",
            description="Fixing minor roof leak",
            category=self.cat_tech,
            preferred_date=date.today(),
            zone="Zone 2",
            status="ACCEPTED"
        )

        self.client.force_authenticate(user=self.helper_a)

        # 1. En Route
        res_en_route = self.client.post(f'/api/assistance/workflow/{req.id}/en_route/')
        self.assertEqual(res_en_route.status_code, status.HTTP_200_OK)
        req.refresh_from_db()
        self.assertEqual(req.status, 'EN_ROUTE')

        # 2. Start Assistance (from EN_ROUTE)
        res_start = self.client.post(f'/api/assistance/workflow/{req.id}/start/')
        self.assertEqual(res_start.status_code, status.HTTP_200_OK)
        req.refresh_from_db()
        self.assertEqual(req.status, 'IN_PROGRESS')

        # 3. Complete Assistance
        res_complete = self.client.post(f'/api/assistance/workflow/{req.id}/complete/', {
            'notes': 'Job completed cleanly and safely.'
        })
        self.assertEqual(res_complete.status_code, status.HTTP_200_OK)
        req.refresh_from_db()
        self.assertEqual(req.status, 'COMPLETED')
        self.assertEqual(req.completion_notes, 'Job completed cleanly and safely.')

    def test_workflow_propose_and_respond_reschedule(self):
        """Proposing and accepting reschedule updates schedule and resets proposal fields"""
        req = AssistanceRequest.objects.create(
            barangay=self.barangay_a,
            requester=self.requester_a,
            assigned_helper=self.helper_a,
            title="Furniture Moving",
            description="Move heavy table",
            category=self.cat_tech,
            preferred_date=date.today(),
            preferred_time="Morning (8:00 AM - 12:00 PM)",
            zone="Zone 2",
            status="ACCEPTED"
        )

        # Helper proposes reschedule
        new_date = str(date.today() + timedelta(days=2))
        self.client.force_authenticate(user=self.helper_a)
        res_prop = self.client.post(f'/api/assistance/workflow/{req.id}/propose_reschedule/', {
            'new_date': new_date,
            'new_time': 'Afternoon (2:00 PM)',
            'reason': 'Rain forecast'
        })
        self.assertEqual(res_prop.status_code, status.HTTP_200_OK)
        req.refresh_from_db()
        self.assertEqual(str(req.reschedule_proposed_date), new_date)
        self.assertEqual(req.reschedule_proposed_by, self.helper_a)

        # Requester accepts proposal
        self.client.force_authenticate(user=self.requester_a)
        res_resp = self.client.post(f'/api/assistance/workflow/{req.id}/respond_reschedule/', {
            'action': 'ACCEPT'
        })
        self.assertEqual(res_resp.status_code, status.HTTP_200_OK)
        req.refresh_from_db()
        self.assertEqual(str(req.preferred_date), new_date)
        self.assertEqual(req.preferred_time, 'Afternoon (2:00 PM)')
        self.assertIsNone(req.reschedule_proposed_date)

    def test_link_equipment_and_auto_release_on_complete(self):
        """Borrowing barangay equipment links it to ticket, sets BORROWED, and auto-releases to AVAILABLE upon completion"""
        tool = Resource.objects.create(
            barangay=self.barangay_a,
            owner=self.admin_a,
            name="Power Drill Set",
            category="TOOLS",
            condition="EXCELLENT",
            zone="Zone 2",
            status="AVAILABLE"
        )

        req = AssistanceRequest.objects.create(
            barangay=self.barangay_a,
            requester=self.requester_a,
            assigned_helper=self.helper_a,
            title="Cabinet Installation",
            description="Install wooden wall shelf",
            category=self.cat_tech,
            preferred_date=date.today(),
            zone="Zone 2",
            status="IN_PROGRESS"
        )

        self.client.force_authenticate(user=self.helper_a)

        # Link equipment to request
        res_link = self.client.post(f'/api/requests/{req.id}/link_equipment/', {
            'resource_id': tool.id
        })
        self.assertEqual(res_link.status_code, status.HTTP_200_OK)
        req.refresh_from_db()
        tool.refresh_from_db()
        self.assertEqual(req.linked_resource, tool)
        self.assertEqual(tool.status, 'BORROWED')

        # Complete request -> tool auto-releases to AVAILABLE
        res_comp = self.client.post(f'/api/assistance/workflow/{req.id}/complete/', {})
        self.assertEqual(res_comp.status_code, status.HTTP_200_OK)
        tool.refresh_from_db()
        self.assertEqual(tool.status, 'AVAILABLE')

    def test_staff_walk_in_intake_and_auto_dispatch(self):
        """Barangay staff can file an intake request on behalf of a citizen resident and trigger auto_dispatch"""
        # Create a staff member
        staff = User.objects.create_user(
            email="desk.officer@kasandigan.gov.ph",
            password="Password123!",
            first_name="Staff",
            last_name="Officer",
            role="BARANGAY_STAFF",
            barangay=self.barangay_a,
            verification_status="VERIFIED"
        )

        self.client.force_authenticate(user=staff)

        payload = {
            'requester_id': self.requester_a.id,
            'title': 'Walk-In Senior Citizen Grocery Errand',
            'description': 'Senior resident needs assistance transporting grocery sacks from market',
            'category': self.cat_tech.id,
            'preferred_date': str(date.today()),
            'preferred_time': 'Morning',
            'zone': 'Zone 2',
            'urgency': 'HIGH',
            'helpers_needed': 2,
            'auto_dispatch': True,
        }

        res = self.client.post('/api/requests/', payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        created_req = AssistanceRequest.objects.get(id=res.data['id'])
        self.assertEqual(created_req.requester, self.requester_a)
        self.assertEqual(created_req.helpers_needed, 2)
        # Verify auto-dispatch created an invitation for helper_a
        invitation = AssistanceInvitation.objects.filter(request=created_req, helper=self.helper_a).first()
        self.assertIsNotNone(invitation)
        self.assertEqual(invitation.status, 'INVITED')

