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
from notifications.models import Notification

def run_seed():
    print("Seeding Kasandigan database...")

    # 1. All 20 Official Barangays of Maramag, Bukidnon
    maramag_barangays_data = [
        {
            "code": "south-poblacion",
            "name": "Barangay South Poblacion",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1201",
            "email": "southpoblacion@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1 - Riverside", "Purok 2 - Centro", "Purok 3 - Terminal", "Purok 4 - Municipal Hall", "Purok 5 - Public Market", "Purok 6 - Sayre Highway", "Purok 7"]
        },
        {
            "code": "musuan",
            "name": "Barangay Musuan",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1202",
            "email": "musuan@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Sitio Sayre", "Sitio Musuan Peak", "CMU Faculty Village"]
        },
        {
            "code": "north-poblacion",
            "name": "Barangay North Poblacion",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1203",
            "email": "northpoblacion@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2 - Commercial Center", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "base-camp",
            "name": "Barangay Base Camp",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1204",
            "email": "basecamp@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Sitio Ki-isid", "Sitio Crossing"]
        },
        {
            "code": "anahawon",
            "name": "Barangay Anahawon",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1205",
            "email": "anahawon@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "bagongsilang",
            "name": "Barangay Bagongsilang",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1206",
            "email": "bagongsilang@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "bayabason",
            "name": "Barangay Bayabason",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1207",
            "email": "bayabason@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "camp-1",
            "name": "Barangay Camp 1",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1208",
            "email": "camp1@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "colambugon",
            "name": "Barangay Colambugon",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1209",
            "email": "colambugon@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "dagumbaan",
            "name": "Barangay Dagumba-an",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1210",
            "email": "dagumbaan@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "danggawan",
            "name": "Barangay Danggawan",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1211",
            "email": "danggawan@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "dibulawan",
            "name": "Barangay Dibulawan",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1212",
            "email": "dibulawan@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "kiharong",
            "name": "Barangay Kiharong",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1213",
            "email": "kiharong@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "kisanday",
            "name": "Barangay Kisanday",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1214",
            "email": "kisanday@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "kuya",
            "name": "Barangay Kuya",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1215",
            "email": "kuya@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "la-asuncion",
            "name": "Barangay La Asuncion",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1216",
            "email": "laasuncion@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "panalsalan",
            "name": "Barangay Panalsalan",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1217",
            "email": "panalsalan@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "san-miguel-maramag",
            "name": "Barangay San Miguel",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1218",
            "email": "sanmiguel@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "san-roque",
            "name": "Barangay San Roque",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1219",
            "email": "sanroque@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
        {
            "code": "tubigon",
            "name": "Barangay Tubigon",
            "municipality_city": "Maramag",
            "province": "Bukidnon",
            "region": "Region X - Northern Mindanao",
            "contact_number": "+63 88 356 1220",
            "email": "tubigon@maramag.gov.ph",
            "status": "ACTIVE",
            "zones": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"]
        },
    ]

    barangays_map = {}
    for b_data in maramag_barangays_data:
        b_obj, _ = Barangay.objects.update_or_create(
            code=b_data["code"],
            defaults=b_data
        )
        barangays_map[b_data["code"]] = b_obj

    b_southpob = barangays_map["south-poblacion"]
    b_musuan = barangays_map["musuan"]
    b_basecamp = barangays_map["base-camp"]

    # Clean up obsolete non-Maramag mock tenants if present
    Barangay.objects.filter(code__in=["san-jose", "poblacion", "san-miguel"]).delete()

    # 2. Categories & Skills
    categories_data = [
        ("Agriculture & Farm Support", "Tractor", [
            ("Hand-Tractor & Cultivator Operation", "Tilling, plowing, and small mechanical farm machinery troubleshooting"),
            ("Irrigation Canal Maintenance", "Clearing agricultural waterways, declogging feeder canals, and barrier setup"),
            ("Harvest & Grain Bagging Support", "Post-harvest hauling, bagging, and drying assistance for smallholders"),
            ("Chainsaw Operation & Tree Pruning", "Safe clearing of storm debris, fallen branches, and timber trimming")
        ]),
        ("Livestock & Agri-Vet", "PawPrint", [
            ("Backyard Poultry & Hog Pen Repair", "Constructing and reinforcing animal shelters, coops, and pens"),
            ("Livestock Care & Cattle Tethering", "Handling carabao and cattle feeding, pasturing, and shelter safety"),
            ("Community Animal Vaccination Assistant", "Assisting LGU/barangay veterinary officers during rabies & livestock vaccination drives")
        ]),
        ("CMU Academic & Research Support", "GraduationCap", [
            ("Elementary Math Tutoring", "Basic arithmetic, algebra, and STEM homework support"),
            ("English Reading & Writing", "Manuscript, term paper, and thesis literacy review"),
            ("Data Encoding & Spreadsheet Assistance", "Excel data entry, survey tabulations, and simple statistics")
        ]),
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
            ("Grocery & Medicine Errands", "Assistance purchasing essential supplies for seniors in Maramag"),
            ("Motorcycle Transport Assistance", "Local transportation within the barangay and puroks")
        ]),
        ("Elderly Assistance", "HeartHandshake", [
            ("Senior Companionship & Walks", "Accompanying elderly for health walks and social visits"),
            ("Prescription Drug Reminders", "Helping organize weekly pill boxes and pharmacy pick-ups")
        ]),
        ("Gardening & Farm Care", "Flower2", [
            ("Yard Lawn Mowing", "Grass trimming and weed removal"),
            ("Vegetable Gardening", "Vegetable plot care, backyard gardening, and soil preparation")
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
    # Platform Admin (LGU Maramag Municipal Admin)
    p_admin, _ = User.objects.get_or_create(
        email="platform.admin@kasandigan.gov.ph",
        defaults={
            "first_name": "LGU Maramag",
            "last_name": "Municipal Admin",
            "role": "PLATFORM_ADMIN",
            "is_staff": True,
            "is_superuser": True,
            "verification_status": "VERIFIED"
        }
    )
    p_admin.first_name = "LGU Maramag"
    p_admin.last_name = "Municipal Admin"
    p_admin.set_password("Password123!")
    p_admin.save()

    # Barangay South Poblacion Admin & Staff (Maramag Poblacion Center)
    b_admin, _ = User.objects.get_or_create(
        email="admin.southpoblacion@kasandigan.gov.ph",
        defaults={
            "first_name": "Hon. Roberto",
            "last_name": "Alvarez",
            "role": "BARANGAY_ADMIN",
            "barangay": b_southpob,
            "is_staff": True,
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 111 0001"
        }
    )
    b_admin.barangay = b_southpob
    b_admin.set_password("Password123!")
    b_admin.save()

    b_staff, _ = User.objects.get_or_create(
        email="staff.southpoblacion@kasandigan.gov.ph",
        defaults={
            "first_name": "Corazon",
            "last_name": "Villanueva",
            "role": "BARANGAY_STAFF",
            "barangay": b_southpob,
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 111 0002"
        }
    )
    b_staff.barangay = b_southpob
    b_staff.set_password("Password123!")
    b_staff.save()

    # Musuan Admin (CMU Campus Area)
    musuan_admin, _ = User.objects.get_or_create(
        email="admin.musuan@kasandigan.gov.ph",
        defaults={
            "first_name": "Hon. Danilo",
            "last_name": "Orevillo",
            "role": "BARANGAY_ADMIN",
            "barangay": b_musuan,
            "is_staff": True,
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 111 0003"
        }
    )
    musuan_admin.barangay = b_musuan
    musuan_admin.set_password("Password123!")
    musuan_admin.save()

    # Backwards compatibility alias accounts
    legacy_admin, _ = User.objects.get_or_create(
        email="admin.sanjose@kasandigan.gov.ph",
        defaults={
            "first_name": "Hon. Roberto",
            "last_name": "Alvarez",
            "role": "BARANGAY_ADMIN",
            "barangay": b_southpob,
            "is_staff": True,
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 111 0001"
        }
    )
    legacy_admin.barangay = b_southpob
    legacy_admin.set_password("Password123!")
    legacy_admin.save()

    legacy_staff, _ = User.objects.get_or_create(
        email="staff.sanjose@kasandigan.gov.ph",
        defaults={
            "first_name": "Corazon",
            "last_name": "Villanueva",
            "role": "BARANGAY_STAFF",
            "barangay": b_southpob,
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 111 0002"
        }
    )
    legacy_staff.barangay = b_southpob
    legacy_staff.set_password("Password123!")
    legacy_staff.save()

    # Verified Residents (South Poblacion, Maramag)
    maria, _ = User.objects.get_or_create(
        email="maria.santos@example.com",
        defaults={
            "first_name": "Maria",
            "last_name": "Santos",
            "role": "RESIDENT",
            "barangay": b_southpob,
            "zone": "Purok 2 - Centro",
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 222 1001",
            "bio": "Local sari-sari store owner and mother of two in South Poblacion. Glad to support our Maramag community."
        }
    )
    maria.barangay = b_southpob
    maria.zone = "Purok 2 - Centro"
    maria.set_password("Password123!")
    maria.save()

    juan, _ = User.objects.get_or_create(
        email="juan.delacruz@example.com",
        defaults={
            "first_name": "Juan",
            "last_name": "Dela Cruz",
            "role": "RESIDENT",
            "barangay": b_southpob,
            "zone": "Purok 2 - Centro",
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 222 1002",
            "bio": "IT technician and electronics repairer near Maramag Central. Available on weekends and evenings.",
            "completed_assistance_count": 14,
            "rating_average": 4.90,
            "rating_count": 12
        }
    )
    juan.barangay = b_southpob
    juan.zone = "Purok 2 - Centro"
    juan.set_password("Password123!")
    juan.save()

    elena, _ = User.objects.get_or_create(
        email="elena.reyes@example.com",
        defaults={
            "first_name": "Elena",
            "last_name": "Reyes",
            "role": "RESIDENT",
            "barangay": b_southpob,
            "zone": "Purok 4 - Municipal Hall",
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 222 1003",
            "bio": "Retired primary school teacher in Maramag. Happy to tutor elementary children in reading and arithmetic.",
            "completed_assistance_count": 8,
            "rating_average": 5.00,
            "rating_count": 8
        }
    )
    elena.barangay = b_southpob
    elena.zone = "Purok 4 - Municipal Hall"
    elena.set_password("Password123!")
    elena.save()

    cardo, _ = User.objects.get_or_create(
        email="cardo.dalisay@example.com",
        defaults={
            "first_name": "Cardo",
            "last_name": "Dalisay",
            "role": "RESIDENT",
            "barangay": b_southpob,
            "zone": "Purok 1 - Riverside",
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 222 1004",
            "bio": "Experienced carpenter and home handyman in Maramag. Reliable tool owner with motorized multicab.",
            "completed_assistance_count": 21,
            "rating_average": 4.85,
            "rating_count": 18
        }
    )
    cardo.barangay = b_southpob
    cardo.zone = "Purok 1 - Riverside"
    cardo.set_password("Password123!")
    cardo.save()

    pedro, _ = User.objects.get_or_create(
        email="pedro.penduko@example.com",
        defaults={
            "first_name": "Pedro",
            "last_name": "Penduko",
            "role": "RESIDENT",
            "barangay": b_southpob,
            "zone": "Purok 5 - Public Market",
            "verification_status": "PENDING_VERIFICATION",
            "mobile_number": "+63 917 222 1005",
            "bio": "New resident near Maramag Public Market. Awaiting South Poblacion barangay hall confirmation."
        }
    )
    pedro.barangay = b_southpob
    pedro.zone = "Purok 5 - Public Market"
    pedro.set_password("Password123!")
    pedro.save()

    # Resident in Barangay Musuan (CMU Campus)
    arnel, _ = User.objects.get_or_create(
        email="arnel.bautista@example.com",
        defaults={
            "first_name": "Arnel",
            "last_name": "Bautista",
            "role": "RESIDENT",
            "barangay": b_musuan,
            "zone": "CMU Faculty Village",
            "verification_status": "VERIFIED",
            "mobile_number": "+63 917 222 1006",
            "bio": "CMU agricultural engineering graduate and small engine mechanic in Musuan."
        }
    )
    arnel.barangay = b_musuan
    arnel.zone = "CMU Faculty Village"
    arnel.set_password("Password123!")
    arnel.save()

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
        title="Desktop computer won't turn on for CMU online classes",
        requester=maria,
        barangay=b_southpob,
        defaults={
            "category": skill_map["Computer Repair"].category,
            "required_skill": skill_map["Computer Repair"],
            "preferred_date": today + timedelta(days=2),
            "preferred_time": "2:00 PM Afternoon",
            "zone": "Purok 2 - Centro",
            "urgency": "HIGH",
            "status": "MATCHED",
            "description": "My daughter's study computer has a power issue. Fans spin for a second then shut down. Need someone in Maramag who knows PC power supplies or motherboard troubleshooting."
        }
    )
    RuleBasedMatchingService.find_and_rank_helpers(req1)

    # Request 2: Completed request with Rating
    req2, _ = AssistanceRequest.objects.get_or_create(
        title="Fix broken wooden dining chair and shelf latch",
        requester=maria,
        barangay=b_southpob,
        defaults={
            "category": skill_map["Carpentry"].category,
            "required_skill": skill_map["Carpentry"],
            "preferred_date": today - timedelta(days=4),
            "preferred_time": "Morning",
            "zone": "Purok 2 - Centro",
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
            "barangay": b_southpob,
            "requester": maria,
            "helper": cardo,
            "score": 5,
            "review": "Kuya Cardo was very punctual and brought all his own wood glue and clamps! The chairs are solid now. Daghang salamat!"
        }
    )

    # 5. Announcements (MDRRMO Municipal Emergency Alert & Barangay Announcements)
    Announcement.objects.get_or_create(
        title="MDRRMO Weather Advisory: Heavy Rainfall Alert for Maramag & Pulangi Basin",
        defaults={
            "author": p_admin,
            "barangay": None,
            "is_emergency_broadcast": True,
            "alert_level": "WARNING",
            "priority": "EMERGENCY",
            "is_pinned": True,
            "is_active": True,
            "content": "Tropical trough affecting Bukidnon. Residents along Riverside Puroks in South Poblacion, Base Camp, and Bayabason are advised to monitor water levels and stay in close communication with your Barangay DRRM officers."
        }
    )

    Announcement.objects.get_or_create(
        barangay=b_southpob,
        title="Community Clean-up & Oplan Linis Drive along Sayre Highway",
        defaults={
            "author": b_admin,
            "priority": "IMPORTANT",
            "is_pinned": True,
            "content": "All South Poblacion residents are invited to join the barangay-wide declogging of drainage canals along Purok 1 and Purok 6 starting at 7:00 AM. Refreshments will be provided at the South Poblacion Barangay Hall."
        }
    )

    Announcement.objects.get_or_create(
        barangay=b_southpob,
        title="Maramag RHU Vaccination Schedule for Senior Citizens",
        defaults={
            "author": b_staff,
            "priority": "NORMAL",
            "is_pinned": False,
            "content": "Free flu and pneumonia vaccinations will be administered at the Barangay Health Center on Wednesday and Thursday from 8:00 AM to 3:00 PM. Please bring your senior citizen OSCA IDs."
        }
    )

    # 6. Community & Agricultural Resources
    Resource.objects.get_or_create(
        barangay=b_southpob,
        name="Heavy-Duty 2-Stroke Grass Cutter / Weed Whacker",
        defaults={
            "owner": cardo,
            "category": "TOOLS",
            "condition": "EXCELLENT",
            "zone": "Purok 1 - Riverside",
            "status": "AVAILABLE",
            "description": "Powerful 43cc engine grass trimmer suitable for clearing overgrown vacant lots, farm boundaries, and purok pathways."
        }
    )

    Resource.objects.get_or_create(
        barangay=b_musuan,
        name="Knapsack 16-Liter Agricultural Chemical Sprayer",
        defaults={
            "owner": arnel,
            "category": "TOOLS",
            "condition": "GOOD",
            "zone": "CMU Faculty Village",
            "status": "AVAILABLE",
            "description": "Manual pressure knapsack sprayer with brass nozzles for garden or backyard orchard pest control."
        }
    )

    Resource.objects.get_or_create(
        barangay=b_southpob,
        name="12-Foot Heavy Duty Aluminum Folding Ladder",
        defaults={
            "owner": cardo,
            "category": "TOOLS",
            "condition": "EXCELLENT",
            "zone": "Purok 1 - Riverside",
            "status": "AVAILABLE",
            "description": "Multi-position Werner ladder. Sturdy and safe for roof cleaning or tree trimming."
        }
    )

    Resource.objects.get_or_create(
        barangay=b_southpob,
        name="Makita Impact Drill with Masonry Bit Set",
        defaults={
            "owner": juan,
            "category": "TOOLS",
            "condition": "GOOD",
            "zone": "Purok 2 - Centro",
            "status": "AVAILABLE",
            "description": "Corded drill with various drill bits for concrete, wood, and metal mounting."
        }
    )

    Resource.objects.get_or_create(
        barangay=b_southpob,
        name="Set of 10 Plastic Folding Event Chairs",
        defaults={
            "owner": maria,
            "category": "EVENT_EQUIPMENT",
            "condition": "GOOD",
            "zone": "Purok 2 - Centro",
            "status": "AVAILABLE",
            "description": "Clean white monoblock folding chairs suitable for small family gatherings."
        }
    )

    # 7. Sample Moderation Report
    Report.objects.get_or_create(
        barangay=b_southpob,
        reporter=maria,
        report_type="SPAM",
        defaults={
            "description": "Suspicious anonymous account sending commercial promotional links through chat.",
            "status": "PENDING"
        }
    )

    # 8. Realistic Personal Resident & Staff Notifications
    Notification.objects.get_or_create(
        user=maria,
        title="Volunteer Invitation: Grade 6 Math Tutoring",
        defaults={
            "barangay": b_southpob,
            "message": "Elena Reyes recommended you for elementary math & reading support in Purok 2 - Centro.",
            "type": "INVITATION_RECEIVED",
            "link": "/assistance",
            "is_read": False,
        }
    )

    Notification.objects.get_or_create(
        user=maria,
        title="Resident Profile Verified",
        defaults={
            "barangay": b_southpob,
            "message": "Mabuhay Maria! Your resident account has been officially verified by Officer Corazon Villanueva. You now have full access to community aid requests and volunteering.",
            "type": "ACCOUNT_VERIFIED",
            "link": "/skills",
            "is_read": True,
        }
    )

    Notification.objects.get_or_create(
        user=maria,
        title="Resource Borrowing Confirmed",
        defaults={
            "barangay": b_southpob,
            "message": "Your request to borrow 10 Folding Event Chairs for community outreach has been approved.",
            "type": "RESOURCE_BORROWED",
            "link": "/resources",
            "is_read": False,
        }
    )

    Notification.objects.get_or_create(
        user=cardo,
        title="Urgent Skill Match: Farm Generator Repair",
        defaults={
            "barangay": b_southpob,
            "message": "A high-priority assistance request matching your Electrical and Mechanical skills was posted in Purok 1 - Riverside.",
            "type": "INVITATION_RECEIVED",
            "link": "/requests",
            "is_read": False,
        }
    )

    Notification.objects.get_or_create(
        user=cardo,
        title="New 5-Star Neighbor Rating",
        defaults={
            "barangay": b_southpob,
            "message": "Juan Dela Cruz commended your help: 'Prompt arrival and fixed our water pipe quickly. Salamat Ka-Barangay!'",
            "type": "RATING_RECEIVED",
            "link": "/assistance",
            "is_read": True,
        }
    )

    Notification.objects.get_or_create(
        user=b_staff,
        title="New Resident Verification Request",
        defaults={
            "barangay": b_southpob,
            "message": "A resident in Purok 6 - Sayre Highway submitted a Barangay ID for verification.",
            "type": "GENERAL",
            "link": "/staff/verifications",
            "is_read": False,
        }
    )

    Notification.objects.get_or_create(
        user=b_staff,
        title="Community Incident Report Submitted",
        defaults={
            "barangay": b_southpob,
            "message": "Maria Santos submitted a spam report regarding unauthorized commercial links.",
            "type": "REPORT_STATUS_UPDATED",
            "link": "/staff/reports",
            "is_read": False,
        }
    )

    print(f"Database successfully seeded with all {len(maramag_barangays_data)} official Barangays of Maramag, Bukidnon!")

if __name__ == '__main__':
    run_seed()
