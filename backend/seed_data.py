"""
Seed data script for Kasandigan multi-tenant SaaS application.
Populates standard tenants, roles, verified residents, skills, schedules,
requests, ratings, announcements, resources, and reports.
"""
import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kasandigan_core.settings')
django.setup()

from tenants.models import Barangay
from accounts.models import User
from skills.models import AssistanceCategory, Skill, UserSkill, UserAvailability
from assistance.models import AssistanceRequest, AssistanceInvitation, AssistanceTransaction
from matching.matching_service import RuleBasedMatchingService
from ratings.models import Rating
from announcements.models import Announcement
from resources.models import Resource
from reports.models import Report

def run_seed():
    print("Seeding Kasandigan database...")

    # 1. Tenants (Barangays)
    b_sanjose, _ = Barangay.objects.get_or_create(
        code="san-jose",
        defaults={
            "name": "Barangay San Jose",
            "municipality_city": "Pasig City",
            "province": "Metro Manila",
            "region": "National Capital Region",
            "contact_number": "+63 2 8643 1111",
            "email": "info@sanjose-pasig.gov.ph",
            "status": "ACTIVE",
            "zones": ["Zone 1 - Riverside", "Zone 2 - Centro", "Zone 3 - Greenwoods", "Zone 4 - Manggahan", "Zone 5 - Kapasigan"]
        }
    )

    b_poblacion, _ = Barangay.objects.get_or_create(
        code="poblacion",
        defaults={
            "name": "Barangay Poblacion",
            "municipality_city": "Makati City",
            "province": "Metro Manila",
            "region": "National Capital Region",
            "contact_number": "+63 2 8899 2222",
            "email": "contact@poblacion-makati.gov.ph",
            "status": "ACTIVE",
            "zones": ["Poblacion Heritage", "Burgos North", "Rockwell East", "Kalayaan West"]
        }
    )

    b_sanmiguel, _ = Barangay.objects.get_or_create(
        code="san-miguel",
        defaults={
            "name": "Barangay San Miguel",
            "municipality_city": "Manila City",
            "province": "Metro Manila",
            "region": "National Capital Region",
            "contact_number": "+63 2 8734 3333",
            "email": "barangay@sanmiguel-manila.gov.ph",
            "status": "ACTIVE",
            "zones": ["Zone 1 - Mendiola", "Zone 2 - Malacañang", "Zone 3 - Legarda", "Zone 4 - Arlegui"]
        }
    )

    # 2. Categories & Skills
    categories_data = [
        ("Technology Help", "Laptop", [
            ("Computer Repair", "Hardware troubleshooting, OS installation, and screen repair"),
            ("Basic Smartphone Assistance", "Phone setup, app troubleshooting, and senior accessibility"),
            ("Home WiFi & Router Setup", "Internet diagnostics and router configuration")
        ]),
        ("Household Help & Repair", "Wrench", [
            ("Plumbing Assistance", "Pipe leaks, faucet repairs, and drain clearing"),
            ("Electrical Assistance", "Wiring fixes, light fixture replacement, socket troubleshooting"),
            ("Carpentry", "Door hinge fixing, small furniture repairs, shelf mounting"),
            ("House Cleaning", "Deep cleaning and sorting assistance")
        ]),
        ("Transportation & Errands", "Car", [
            ("Grocery & Medicine Errands", "Assistance purchasing essential supplies for seniors"),
            ("Motorcycle Transport Assistance", "Local transportation within the barangay")
        ]),
        ("Tutoring & Education", "BookOpen", [
            ("Elementary Math Tutoring", "Basic arithmetic and homework support"),
            ("English Reading & Writing", "Literacy support for primary students")
        ]),
        ("Elderly Assistance", "HeartHandshake", [
            ("Senior Companionship & Walks", "Accompanying elderly for health walks and social visits"),
            ("Prescription Drug Reminders", "Helping organize weekly pill boxes and pharmacy pick-ups")
        ]),
        ("Gardening & Yard Care", "Flower2", [
            ("Yard Lawn Mowing", "Grass trimming and weed removal"),
            ("Vegetable Gardening", "Urban container gardening and soil preparation")
        ])
    ]

    skill_map = {}
    for cat_name, icon, skills in categories_data:
        cat, _ = AssistanceCategory.objects.get_or_create(
            name=cat_name,
            barangay=None,
            defaults={"icon": icon, "description": f"Community assistance in {cat_name}"}
        )
        for s_name, s_desc in skills:
            sk, _ = Skill.objects.get_or_create(
                name=s_name,
                category=cat,
                barangay=None,
                defaults={"description": s_desc}
            )
            skill_map[s_name] = sk

    # 3. Key Users
    # Platform Admin
    p_admin, _ = User.objects.get_or_create(
        email="platform.admin@kasandigan.gov.ph",
        defaults={
            "first_name": "Kasandigan",
            "last_name": "Platform Overseer",
            "role": "PLATFORM_ADMIN",
            "is_staff": True,
            "is_superuser": True,
            "verification_status": "VERIFIED"
        }
    )
    p_admin.set_password("Password123!")
    p_admin.save()

    # Barangay San Jose Admin & Staff
    b_admin, _ = User.objects.get_or_create(
        email="admin.sanjose@kasandigan.gov.ph",
        defaults={
            "first_name": "Hon. Roberto",
            "last_name": "Alvarez",
            "role": "BARANGAY_ADMIN",
            "barangay": b_sanjose,
            "is_staff": True,
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 111 0001"
        }
    )
    b_admin.set_password("Password123!")
    b_admin.save()

    b_staff, _ = User.objects.get_or_create(
        email="staff.sanjose@kasandigan.gov.ph",
        defaults={
            "first_name": "Corazon",
            "last_name": "Villanueva",
            "role": "BARANGAY_STAFF",
            "barangay": b_sanjose,
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 111 0002"
        }
    )
    b_staff.set_password("Password123!")
    b_staff.save()

    # Verified Residents (San Jose)
    maria, _ = User.objects.get_or_create(
        email="maria.santos@example.com",
        defaults={
            "first_name": "Maria",
            "last_name": "Santos",
            "role": "RESIDENT",
            "barangay": b_sanjose,
            "zone": "Zone 2 - Centro",
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 222 1001",
            "bio": "Local sari-sari store owner and mother of two. Glad to support our barangay community."
        }
    )
    maria.set_password("Password123!")
    maria.save()

    juan, _ = User.objects.get_or_create(
        email="juan.delacruz@example.com",
        defaults={
            "first_name": "Juan",
            "last_name": "Dela Cruz",
            "role": "RESIDENT",
            "barangay": b_sanjose,
            "zone": "Zone 2 - Centro",
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 222 1002",
            "bio": "IT technician and hobbyist electronics repairer. Available on weekends and evenings.",
            "completed_assistance_count": 14,
            "rating_average": 4.90,
            "rating_count": 12
        }
    )
    juan.set_password("Password123!")
    juan.save()

    elena, _ = User.objects.get_or_create(
        email="elena.reyes@example.com",
        defaults={
            "first_name": "Elena",
            "last_name": "Reyes",
            "role": "RESIDENT",
            "barangay": b_sanjose,
            "zone": "Zone 3 - Greenwoods",
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 222 1003",
            "bio": "Retired primary school teacher. Happy to tutor elementary children in reading and arithmetic.",
            "completed_assistance_count": 8,
            "rating_average": 5.00,
            "rating_count": 8
        }
    )
    elena.set_password("Password123!")
    elena.save()

    cardo, _ = User.objects.get_or_create(
        email="cardo.dalisay@example.com",
        defaults={
            "first_name": "Cardo",
            "last_name": "Dalisay",
            "role": "RESIDENT",
            "barangay": b_sanjose,
            "zone": "Zone 1 - Riverside",
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 222 1004",
            "bio": "Experienced carpenter and home handyman. Reliable tool owner with motorized trike.",
            "completed_assistance_count": 21,
            "rating_average": 4.85,
            "rating_count": 18
        }
    )
    cardo.set_password("Password123!")
    cardo.save()

    pedro, _ = User.objects.get_or_create(
        email="pedro.penduko@example.com",
        defaults={
            "first_name": "Pedro",
            "last_name": "Penduko",
            "role": "RESIDENT",
            "barangay": b_sanjose,
            "zone": "Zone 4 - Manggahan",
            "verification_status": "PENDING_VERIFICATION",
            "mobile_number": "+63 917 222 1005",
            "bio": "New resident in Zone 4. Awaiting barangay hall confirmation."
        }
    )
    pedro.set_password("Password123!")
    pedro.save()

    # Assign skills and availability schedules to helpers
    # Juan: Computer Repair & Smartphone
    UserSkill.objects.get_or_create(
        user=juan,
        skill=skill_map["Computer Repair"],
        defaults={"proficiency": "EXPERT", "years_experience": 6, "notes": "Desktop, laptop, software and hardware"}
    )
    UserSkill.objects.get_or_create(
        user=juan,
        skill=skill_map["Basic Smartphone Assistance"],
        defaults={"proficiency": "EXPERT", "years_experience": 4}
    )
    for day in [0, 2, 4, 5, 6]:  # Mon, Wed, Fri, Sat, Sun
        UserAvailability.objects.get_or_create(
            user=juan,
            day_of_week=day,
            time_slot="ALL_DAY",
            defaults={"is_available": True}
        )

    # Elena: Tutoring
    UserSkill.objects.get_or_create(
        user=elena,
        skill=skill_map["Elementary Math Tutoring"],
        defaults={"proficiency": "EXPERT", "years_experience": 25}
    )
    UserSkill.objects.get_or_create(
        user=elena,
        skill=skill_map["English Reading & Writing"],
        defaults={"proficiency": "EXPERT", "years_experience": 25}
    )
    for day in [0, 1, 2, 3, 4]:  # Weekdays
        UserAvailability.objects.get_or_create(
            user=elena,
            day_of_week=day,
            time_slot="AFTERNOON",
            defaults={"is_available": True}
        )

    # Cardo: Carpentry & Electrical
    UserSkill.objects.get_or_create(
        user=cardo,
        skill=skill_map["Carpentry"],
        defaults={"proficiency": "EXPERT", "years_experience": 15}
    )
    UserSkill.objects.get_or_create(
        user=cardo,
        skill=skill_map["Electrical Assistance"],
        defaults={"proficiency": "INTERMEDIATE", "years_experience": 8}
    )
    for day in range(7):
        UserAvailability.objects.get_or_create(
            user=cardo,
            day_of_week=day,
            time_slot="ALL_DAY",
            defaults={"is_available": True}
        )

    # 4. Assistance Requests
    today = date.today()

    # Request 1: Open request from Maria looking for Computer Repair
    req1, _ = AssistanceRequest.objects.get_or_create(
        title="Desktop computer won't turn on for online classes",
        requester=maria,
        barangay=b_sanjose,
        defaults={
            "category": skill_map["Computer Repair"].category,
            "required_skill": skill_map["Computer Repair"],
            "preferred_date": today + timedelta(days=2),
            "preferred_time": "2:00 PM Afternoon",
            "zone": "Zone 2 - Centro",
            "urgency": "HIGH",
            "status": "MATCHED",
            "description": "My daughter's study computer has a power issue. Fans spin for a second then shut down. Need someone who knows PC power supplies or motherboard troubleshooting."
        }
    )
    RuleBasedMatchingService.find_and_rank_helpers(req1)

    # Request 2: Completed request with Rating
    req2, _ = AssistanceRequest.objects.get_or_create(
        title="Fix broken wooden dining chair and shelf latch",
        requester=maria,
        barangay=b_sanjose,
        defaults={
            "category": skill_map["Carpentry"].category,
            "required_skill": skill_map["Carpentry"],
            "preferred_date": today - timedelta(days=4),
            "preferred_time": "Morning",
            "zone": "Zone 2 - Centro",
            "urgency": "MEDIUM",
            "status": "COMPLETED",
            "assigned_helper": cardo,
            "completed_at": today - timedelta(days=3),
            "description": "Two chair legs are loose and our kitchen pantry door won't stay closed."
        }
    )

    Rating.objects.get_or_create(
        request=req2,
        defaults={
            "barangay": b_sanjose,
            "requester": maria,
            "helper": cardo,
            "score": 5,
            "review": "Kuya Cardo was very punctual and brought all his own wood glue and clamps! The chairs are solid now. Highly recommended!"
        }
    )

    # 5. Announcements
    Announcement.objects.get_or_create(
        barangay=b_sanjose,
        title="Community Clean-up & Oplan Linis Drive this Saturday",
        defaults={
            "author": b_admin,
            "priority": "IMPORTANT",
            "is_pinned": True,
            "content": "All residents are invited to join the barangay-wide declogging of drainage canals along Zone 1 and Zone 2 starting at 7:00 AM. Refreshments will be provided at the Barangay Hall."
        }
    )

    Announcement.objects.get_or_create(
        barangay=b_sanjose,
        title="Barangay Health Center Vaccination Schedule for Seniors",
        defaults={
            "author": b_staff,
            "priority": "NORMAL",
            "is_pinned": False,
            "content": "Free flu and pneumonia vaccinations will be administered on Wednesday and Thursday from 8:00 AM to 3:00 PM. Please bring your senior citizen IDs."
        }
    )

    # 6. Community Resources
    Resource.objects.get_or_create(
        barangay=b_sanjose,
        name="12-Foot Heavy Duty Aluminum Folding Ladder",
        defaults={
            "owner": cardo,
            "category": "TOOLS",
            "condition": "EXCELLENT",
            "zone": "Zone 1 - Riverside",
            "status": "AVAILABLE",
            "description": "Multi-position Werner ladder. Sturdy and safe for roof cleaning or painting."
        }
    )

    Resource.objects.get_or_create(
        barangay=b_sanjose,
        name="Makita Impact Drill with Masonry Bit Set",
        defaults={
            "owner": juan,
            "category": "TOOLS",
            "condition": "GOOD",
            "zone": "Zone 2 - Centro",
            "status": "AVAILABLE",
            "description": "Corded drill with various drill bits for concrete, wood, and metal mounting."
        }
    )

    Resource.objects.get_or_create(
        barangay=b_sanjose,
        name="Set of 10 Plastic Folding Event Chairs",
        defaults={
            "owner": maria,
            "category": "EVENT_EQUIPMENT",
            "condition": "GOOD",
            "zone": "Zone 2 - Centro",
            "status": "AVAILABLE",
            "description": "Clean white monoblock folding chairs suitable for small family gatherings."
        }
    )

    # 7. Sample Moderation Report
    Report.objects.get_or_create(
        barangay=b_sanjose,
        reporter=maria,
        report_type="SPAM",
        defaults={
            "description": "Suspicious anonymous account sending unrelated commercial promotional links through chat.",
            "status": "PENDING"
        }
    )

    print("Database successfully seeded with realistic Philippine barangay multi-tenant data!")

if __name__ == '__main__':
    run_seed()
