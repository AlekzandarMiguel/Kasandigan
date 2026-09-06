# Kasandigan: Multi-Tenant Community Assistance and Skill Matching SaaS

"A community you can rely on."

Kasandigan is an enterprise-grade, multi-tenant civic assistance and resource-sharing web application built for Local Government Units (LGUs) and Philippine barangays. Designed initially for the Municipality of Maramag, Bukidnon across all 20 of its constituent barangays, the platform provides on-demand neighborhood mutual aid, community equipment lending, automated MDRRMO disaster broadcast integration, deterministic skill-matching, and authenticated civic volunteer certification under the governance of Barangay Staff and Administrators.

---

## Table of Contents

1. System Overview and Purpose
2. Geographical Scope: Municipality of Maramag
3. Core System Capabilities and Modules
   - Logical Multi-Tenant Architecture
   - Deterministic Matching Engine (No AI/ML)
   - Community Resource and Apparatus Lending
   - MDRRMO Municipal Disaster Broadcasts
   - Resident Verification and Identity Governance
   - Civic Volunteer Service Certification
   - Audit Trail and DILG Compliance Reporting
4. Data Privacy and Legal Compliance (RA 10173)
5. User Roles and Access Control Matrix
6. Authentication and Password Recovery Architecture
7. Technical Stack and Infrastructure
8. Directory and Codebase Structure
9. Database Schema and Data Models
10. API Specification and Endpoints
11. Internationalization and Local Languages
12. Installation and Local Setup Guide
13. Seed Data and Pre-Configured Test Profiles
14. Security and Resilience Architecture

---

## 1. System Overview and Purpose

Traditional neighborhood mutual aid ("Bayanihan") in Philippine communities is frequently organized informally through unverified social media channels, leading to delayed responses, lack of accountability, privacy violations, and physical security risks.

Kasandigan solves these structural challenges through a centralized, privacy-first software platform:

- Verified Identity: Every resident is physically authenticated by local barangay hall staff with valid documentation (Voter ID, Barangay Clearance, or CMU Student/Faculty ID).
- Transparent Matching: Assistance requests are paired with qualified volunteers using a public, deterministic 100-point algorithm instead of opaque algorithms.
- Resource Economy: Municipal and community assets (ladders, welding equipment, wheelchairs, tents, power tools) are cataloged and loaned for free to eliminate unnecessary household purchases.
- Disaster Preparedness: Real-time synchronization with local Disaster Risk Reduction and Management Offices (MDRRMO) ensures emergency broadcasts reach residents instantly.
- Statutory Compliance: Complete alignment with Republic Act No. 10173 (Philippine Data Privacy Act of 2012) and Department of the Interior and Local Government (DILG) reporting standards.

---

## 2. Geographical Scope: Municipality of Maramag

The platform is configured for the Municipality of Maramag, Province of Bukidnon (Region X, Northern Mindanao), covering all twenty (20) constituent barangays:

1. Anadagao (5 Puroks, Agricultural)
2. Bagontaas (7 Puroks, Commercial and Residential)
3. Base Camp (6 Puroks, Residential)
4. Bayabason (4 Puroks, Agricultural)
5. Camp 1 (6 Puroks, Residential and Upland)
6. Colambugon (5 Puroks, Agricultural)
7. Dagumba-an (6 Puroks, Rural and Farming)
8. Danggawan (5 Puroks, Agricultural)
9. Dibulawan (4 Puroks, Agricultural)
10. Kiharong (5 Puroks, Valley Farming)
11. Kisanday (6 Puroks, Residential)
12. Kuya (7 Puroks, Agricultural and Commercial)
13. La Asuncion (5 Puroks, Agricultural)
14. Musuan (8 Puroks, Central Mindanao University Academic Hub)
15. North Poblacion (8 Puroks, Urban Commercial)
16. Panalsalan (6 Puroks, Agricultural)
17. San Miguel (5 Puroks, Agricultural)
18. San Roque (5 Puroks, Rural Community)
19. South Poblacion (8 Puroks, Municipal Government Center)
20. Tubigon (5 Puroks, Agricultural)

Each barangay functions as an autonomous logical tenant within the system.

---

## 3. Core System Capabilities and Modules

### 3.1 Logical Multi-Tenant Architecture

Kasandigan enforces logical isolation across all tenants. A user registered in Barangay South Poblacion cannot view, access, or interact with private assistance requests, resident profiles, or inventory belonging to Barangay Musuan or Barangay Bagontaas without explicit platform-level clearance.

- Tenant Isolation: Implemented via Django middleware and filtered QuerySets.
- Inter-Barangay Safeguards: Database foreign keys link records to a specific Barangay model instance, preventing accidental data leakage across administrative boundaries.

### 3.2 Deterministic Matching Engine (Strictly No AI/ML)

Rather than utilizing black-box machine learning or predictive statistical models that cannot be audited or explained to local residents, Kasandigan uses an explainable, deterministic mathematical scoring algorithm evaluated out of 100 points:

- Skill Match (+50 Points): Candidate possesses the exact verified skill required by the assistance request category.
- Same Barangay (+20 Points): Candidate resides within the same barangay tenant boundary as the requester.
- Same Zone / Purok (+15 Points): Candidate resides in the identical Purok or Zone for rapid physical arrival.
- Schedule Availability (+10 Points): Candidate has active availability slots matching the requested timeframe.
- Community Rating (+5 Points): Candidate maintains a 4.0 star or higher verified average rating across previous completed requests.

Total Maximum Score: 100 Points. Candidates are sorted in descending order, with full score breakdowns visible to barangay triage staff.

### 3.3 Community Resource and Apparatus Lending Subsystem

Barangay councils maintain inventories of communal tools, medical devices, and emergency equipment. Kasandigan provides an asset-tracking module:

- Cataloged Assets: Ladders, power drills, chainsaws, lawnmowers, wheelchairs, folding chairs, disaster tents, and portable generators.
- Operational Workflow:
  1. Resident submits a borrowing request specifying borrow date, return date, and intended purpose.
  2. Barangay Staff or Administrator approves or denies the request based on current availability.
  3. Condition logging upon checkout and return to maintain community accountability.
  4. Automatic overdue tracking and status reporting.

### 3.4 MDRRMO Municipal Disaster Broadcasts

Integrated alert management system connecting the Maramag Municipal Disaster Risk Reduction and Management Office (MDRRMO) directly to barangay portals:

- Severity Levels: Informational, Advisory, Warning, and Critical Emergency.
- Visual Banner Delivery: Broadcasts appear as persistent high-contrast header banners and ringing notification popovers across all active dashboards.
- Geographic Targeting: Alerts can be broadcast municipally across all 20 barangays or targeted to flood-prone riverbank and mountain barangays (e.g., Camp 1, Kiharong, Kuya).

### 3.5 Resident Verification and Identity Governance

Residents who register online enter a `PENDING_VERIFICATION` status:

- Required Documentation: Uploaded photo proof of Barangay Clearance, COMELEC Voter ID, or Central Mindanao University (CMU) Student/Faculty ID.
- Verification Triage: Barangay Staff review proofs against the local civil registry and approve (`VERIFIED`) or reject (`REJECTED`) with explanatory audit notes.
- Restrictions: Unverified accounts cannot post requests, borrow apparatus, or volunteer skills until verified by their respective barangay hall.

### 3.6 Civic Volunteer Service Certification

- Hours Tracking: Automatically tallies verified service hours rendered upon task completion.
- Official Certificate Generation: Generates an authenticated digital Certificate of Appreciation signed by the Barangay Captain, complete with verifiable unique credential IDs for educational or professional employment use.

### 3.7 Audit Trail and DILG Compliance Reporting

- Immutable Audit Logs: Every authentication attempt, password change, permission grant, request triage, and apparatus lending transaction is saved in the `activity_logs` table with timestamp, IP address, user ID, and target object.
- DILG Export Engine: One-click export of municipal and barangay performance reports summarizing total requests fulfilled, average response times, active volunteers, and apparatus utilization rates for Department of the Interior and Local Government (DILG) audits.

---

## 4. Data Privacy and Legal Compliance (RA 10173)

Kasandigan complies with Republic Act No. 10173 (Philippine Data Privacy Act of 2012):

- PII Masking: Resident mobile phone numbers and residential addresses are shielded from general public view. Contact details are only revealed once an assistance invitation is mutually accepted.
- Role-Based Access: Identity verification documents are only accessible to designated Barangay Staff and Administrators within that specific tenant.
- Audit Logging: All views and exports of resident records generate immutable audit logs.
- Session Expiration: Stale sessions and inactive JSON Web Tokens expire automatically, redirecting unauthorized sessions to the public portal.

---

## 5. User Roles and Access Control Matrix

The platform implements four distinct hierarchical roles:

| Role | Scope | Key Permissions |
| :--- | :--- | :--- |
| PLATFORM_ADMIN | Global (All 20 Barangays) | Full system oversight, tenant provisioning, cross-barangay node health, municipal DILG report exports, MDRRMO municipal broadcast dissemination. |
| BARANGAY_ADMIN | Single Tenant (Barangay) | Barangay profile and purok configuration, staff account management, resident roster oversight, skills category administration, local announcements. |
| BARANGAY_STAFF | Single Tenant (Barangay) | Resident ID verification triage, assistance request monitoring and dispatch, equipment lending approval and return tracking, emergency alert dispatch. |
| RESIDENT | Personal Profile | Dual-capability: request mutual aid, list volunteer skills and schedules, borrow community tools, rate completed help, track volunteer service certificates. |

---

## 6. Authentication and Password Recovery Architecture

### 6.1 Authentication Mechanism

- JSON Web Token (SimpleJWT): Issues short-lived access tokens and refresh tokens stored securely in client storage.
- Rate Limiting: Authentication endpoints (`/api/auth/login/`, `/api/auth/register/`, `/api/auth/forgot-password/`) are throttled under DRF rate limit scopes to prevent brute-force attacks.

### 6.2 6-Digit OTP Password Recovery Workflow

1. Initiation: User enters registered email on the login portal.
2. Code Generation: Backend verifies active status and generates a cryptographically secure 6-digit numeric OTP (`secrets.randbelow`) stored with a 15-minute expiration timestamp in `PasswordResetOTP`. Any prior unused OTPs for that email are invalidated.
3. Verification: Client submits email, 6-digit code, and new password (minimum 8 characters).
4. Password Update: Backend validates code freshness, updates password hash using PBKDF2 with SHA-256, marks the OTP as consumed, logs an audit entry, and allows immediate login with new credentials.

---

## 7. Technical Stack and Infrastructure

### Frontend

- Runtime and Bundler: Vite 8, Node.js
- Framework: React 18, React Router v6
- Styling: Tailwind CSS v4, custom utility classes, responsive grid
- Icons: Lucide React
- HTTP Client: Axios with request/response interceptors for token refresh and automatic logout redirect
- Internationalization: Native lightweight context provider (English, Bisaya, Tagalog)

### Backend

- Framework: Django 5, Django REST Framework (DRF)
- Authentication: `djangorestframework-simplejwt`
- Cryptography: Python `secrets` module, Django password hashers (PBKDF2 SHA-256)
- Database: MySQL 8 (Production) with SQLite automatic fallback (Local Development)
- CORS Handling: `django-cors-headers`

---

## 8. Directory and Codebase Structure

```text
Kasandigan/
├── backend/
│   ├── manage.py
│   ├── seed_data.py                  # Seed script populating Maramag 20-barangay network
│   ├── kasandigan_core/              # Core project settings, WSGI, URLs, dashboard metrics
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── dashboard_views.py
│   ├── accounts/                     # User models, authentication, OTP reset, resident roster
│   │   ├── models.py                 # User, BlockedUser, PasswordResetOTP
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── migrations/
│   ├── tenants/                      # Barangay multi-tenant models, puroks, settings
│   ├── skills/                       # Skill categories, volunteer skills, availability schedules
│   ├── assistance/                   # Requests, invitations, mutual aid workflow state machine
│   ├── matching/                     # Deterministic 100-point scoring algorithm
│   ├── resources/                    # Community equipment inventory, borrowing workflow
│   ├── notifications/                # Broadcast popover, bell ring alerts, notification dispatch
│   ├── announcements/                # Barangay announcements and MDRRMO emergency alerts
│   ├── ratings/                      # Mutual aid star ratings and qualitative reviews
│   ├── reports/                      # Citizen report filings and safety moderation
│   └── activity_logs/                # Immutable audit log service and storage
└── frontend/
    ├── index.html                    # Root HTML with Kasandigan favicon and metadata
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx                   # Route hierarchy, ProtectedRoute guard, dynamic layouts
        ├── index.css                 # Global Tailwind styling, custom keyframe animations
        ├── components/
        │   ├── Navbar.jsx            # Top navigation bar (public navigation and auth header)
        │   ├── Sidebar.jsx           # Fixed sidebar docked cleanly above bottom footer
        │   ├── SystemFooter.jsx      # Fixed full-width viewport footer
        │   ├── PageHeader.jsx        # Standardized midnight card header across all 37 pages
        │   ├── NotificationDropdown.jsx # Ringing notification modal popover
        │   ├── ChangePasswordCard.jsx # Reusable password update component
        │   ├── Logo.jsx              # Official vector logo branding
        │   └── LoadingSpinner.jsx
        ├── context/
        │   ├── AuthContext.jsx       # Global authentication state, login, logout, refresh
        │   ├── NotificationContext.jsx # Unread count, notification polling, mark-as-read
        │   └── LanguageContext.jsx   # Multi-language dictionary (EN, BIS, FIL)
        ├── layouts/
        │   ├── PublicLayout.jsx      # Public wrapper for Landing, About, How It Works
        │   ├── ResidentLayout.jsx    # Authenticated resident container
        │   └── AdminLayout.jsx       # Authenticated administrative container
        ├── pages/
        │   ├── public/               # LandingPage, LoginPage, RegisterPage, AboutPage
        │   ├── resident/             # ResidentDashboard, Requests, Resources, Skills, Settings
        │   ├── staff/                # StaffDashboard, Triage, Reports, Resident Directory
        │   ├── admin/                # BarangayDashboard, Settings, Staff Management, DILG Report
        │   └── platform/             # PlatformDashboard, Barangays, System Users, Audit Logs
        └── services/
            └── api.js                # Axios client with bearer token injection and error handling
```

---

## 9. Database Schema and Data Models

Key relational models in the system:

1. `tenants.Barangay`:
   - `name`, `code`, `municipality`, `province`, `contact_number`, `emergency_hotline`, `zones` (JSON list of puroks).
2. `accounts.User`:
   - `email`, `password`, `first_name`, `last_name`, `mobile_number`, `role`, `barangay`, `zone`, `bio`, `verification_status`, `id_document_url`, `id_document_type`, `completed_assistance_count`, `rating_average`.
3. `accounts.PasswordResetOTP`:
   - `email`, `otp`, `created_at`, `is_used`.
4. `skills.AssistanceCategory`:
   - `name`, `description`, `icon`, `is_active`.
5. `skills.Skill`:
   - `category`, `name`, `description`.
6. `skills.UserSkill`:
   - `user`, `skill`, `years_experience`, `is_verified`.
7. `assistance.AssistanceRequest`:
   - `requester`, `barangay`, `category`, `required_skills`, `title`, `description`, `zone`, `urgency`, `status` (`OPEN`, `MATCHED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), `helper`.
8. `assistance.AssistanceInvitation`:
   - `request`, `candidate`, `match_score`, `score_breakdown`, `status` (`PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`).
9. `resources.Resource`:
   - `barangay`, `name`, `category`, `quantity_total`, `quantity_available`, `condition`, `is_available`.
10. `resources.ResourceRequest`:
    - `resource`, `borrower`, `start_date`, `end_date`, `purpose`, `status` (`PENDING`, `APPROVED`, `RETURNED`, `REJECTED`).
11. `announcements.Announcement`:
    - `barangay`, `author`, `title`, `content`, `priority` (`NORMAL`, `URGENT`, `CRITICAL`), `is_mdrrmo_alert`.
12. `activity_logs.ActivityLog`:
    - `tenant`, `user`, `action`, `description`, `target_type`, `target_id`, `ip_address`, `timestamp`.

---

## 10. API Specification and Endpoints

### Authentication
- `POST /api/auth/register/` - Create a new resident account.
- `POST /api/auth/login/` - Authenticate credentials, returns access and refresh JWTs.
- `POST /api/auth/refresh/` - Refresh expired access token.
- `GET /api/auth/me/` - Retrieve authenticated user profile.
- `PUT /api/auth/me/` - Update profile information.
- `POST /api/auth/change-password/` - Update password while authenticated.
- `POST /api/auth/forgot-password/` - Request a 6-digit OTP for password recovery.
- `POST /api/auth/verify-otp/` - Validate 6-digit OTP code without consuming.
- `POST /api/auth/reset-password/` - Submit OTP and reset password.

### Tenants and Administration
- `GET /api/barangays/` - List all 20 barangays.
- `GET /api/barangays/{id}/` - Retrieve barangay details and purok listing.
- `PATCH /api/barangays/{id}/` - Update barangay settings and hotlines.
- `GET /api/residents/` - Browse resident directory (Barangay Staff / Admin).
- `POST /api/residents/{id}/verify/` - Approve or reject resident verification proof.
- `GET /api/staff/` - Manage barangay staff accounts.
- `GET /api/platform/users/` - Cross-tenant user management (Platform Admin).

### Skills and Assistance
- `GET /api/categories/` - Assistance categories list.
- `GET /api/skills/` - Master skills list.
- `GET, POST /api/user-skills/` - Register or view user skills.
- `GET, POST /api/user-availability/` - Set recurring weekly availability slots.
- `GET, POST /api/requests/` - View or post assistance requests.
- `GET /api/requests/{id}/candidates/` - Run deterministic matching algorithm and return ranked candidate helpers with score breakdown.
- `POST /api/assistance/workflow/accept/` - Volunteer accepts matched invitation.
- `POST /api/assistance/workflow/complete/` - Mark mutual aid task completed.

### Community Resources
- `GET, POST /api/resources/` - Browse or register community tools and apparatus.
- `POST /api/resource-requests/` - Request to borrow equipment.
- `POST /api/resource-requests/{id}/approve/` - Staff approval for tool check-out.
- `POST /api/resource-requests/{id}/return/` - Log return and apparatus condition.

### Trust, Safety and Monitoring
- `GET, POST /api/notifications/` - Retrieve personal notices or mark read.
- `GET, POST /api/announcements/` - Municipal and barangay bulletins.
- `GET, POST /api/ratings/` - Submit star rating and review after completion.
- `GET, POST /api/reports/` - File moderation reports against abusive behavior.
- `GET /api/activity-logs/` - Immutable audit logs for compliance audits.
- `GET /api/dashboard/` - Real-time metrics tailored by role.

---

## 11. Internationalization and Local Languages

Kasandigan includes built-in multilingual support managed via `LanguageContext`:

- English (EN): Standard municipal administration and formal documentation.
- Bisaya / Cebuano (BIS): Primary everyday spoken language of Bukidnon and Northern Mindanao for community accessibility.
- Tagalog / Filipino (FIL): National language option for broad accessibility across government staff.

Switching languages immediately updates interface labels, table headers, forms, and button actions without page reloads.

---

## 12. Installation and Local Setup Guide

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher (with npm)
- Git

### Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
   ```

4. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

5. Seed the database with the Maramag 20-barangay network and demo accounts:
   ```bash
   python seed_data.py
   ```

6. Launch the development server:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```

### Frontend Setup

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Access the application in your browser at `http://localhost:5173`.

---

## 13. Seed Data and Pre-Configured Test Profiles

The seed script (`seed_data.py`) populates the database with real-world local data for the Municipality of Maramag, Bukidnon. All test accounts share the standard password:

`Password123!`

| Role | Account Email | Barangay / Scope | Purpose |
| :--- | :--- | :--- | :--- |
| Platform Administrator | `platform.admin@kasandigan.gov.ph` | LGU Maramag (Global) | Municipal command, cross-barangay monitoring, DILG reports. |
| Barangay Administrator | `admin.southpoblacion@kasandigan.gov.ph` | South Poblacion | Local executive dashboard, staff management, resident directory. |
| Barangay Staff | `staff.southpoblacion@kasandigan.gov.ph` | South Poblacion | Resident ID verification triage, assistance monitoring, tool check-out. |
| Barangay Administrator | `admin.musuan@kasandigan.gov.ph` | Musuan (CMU Campus) | University area management, student volunteer coordination. |
| Resident (Requester) | `maria.santos@example.com` | South Poblacion (Purok 2) | Posting mutual aid requests, borrowing tools, reviewing helpers. |
| Resident (Volunteer) | `juan.delacruz@example.com` | South Poblacion (Purok 2) | 4.9-star certified volunteer offering carpentry and IT skills. |

---

## 14. Security and Resilience Architecture

- Strict CORS Configuration: Backend restricts API access to authorized frontend origins.
- Rate Limiting: Authentication endpoints are protected against brute-force credential stuffing.
- Error Boundary Architecture: React front-end includes root-level error boundaries preventing white-screen crashes from unexpected runtime exceptions.
- Graceful Token Refresh: Axios interceptors automatically request new access tokens on 401 Unauthorized responses before retrying the original request.
- Centralized Logout and Expiration: Expired sessions or user sign-outs systematically clear `localStorage` credentials and route the browser directly to the public landing page (`/`).
- Audit Logging: Security-sensitive administrative operations are recorded with IP addresses and timestamps.

---

## License

Developed for Philippine Local Government Units and local barangay councils. All rights reserved.
