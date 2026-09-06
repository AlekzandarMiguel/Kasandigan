# Kasandigan — Multi-Tenant Community Assistance and Skill Matching SaaS

> **"A community you can rely on."**

Kasandigan is a multi-tenant community assistance and skill-matching web application designed for Philippine barangays. It enables verified local residents to request and offer assistance, discover suitable helpers through a transparent rule-based matching engine, lend and borrow community resources, rate completed transactions, and maintain community safety under the supervision of Barangay Staff and Administrators.

---

## Architecture Overview

- **Platform Administrator**: Global SaaS health, tenant provisioning, system monitoring, cross-barangay metrics.
- **Barangay Administrator**: Tenant-specific management, residents, staff, assistance categories, skills, announcements, audit logs.
- **Barangay Staff**: Community moderation, resident verification, request monitoring, and report triage.
- **Residents**: Dual-capability accounts to request help, offer skills/availability, borrow tools, rate helpers, and submit reports.

---

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router v6, Axios, Lucide Icons
- **Backend**: Python 3, Django, Django REST Framework, SimpleJWT
- **Database**: MySQL 8 (with automatic SQLite fallback for zero-config local testing)
- **Matching Engine**: Deterministic rule-based scoring (Max 100 points, strictly no AI/ML)

---

## Directory Structure

```text
Kasandigan/
├── backend/                  # Django REST Framework backend
│   ├── manage.py
│   ├── kasandigan_core/      # Project settings & routing
│   ├── tenants/              # Barangay tenant models & isolation
│   ├── accounts/             # Users, roles, profiles, JWT auth
│   ├── skills/               # Categories, skills, availability
│   ├── assistance/           # Requests & assistance workflow
│   ├── matching/             # Rule-based matching engine
│   ├── ratings/              # Reviews and ratings
│   ├── reports/              # Moderation and report tracking
│   ├── notifications/        # In-app notifications
│   ├── announcements/        # Barangay announcements
│   ├── resources/            # Community tool & resource lending
│   ├── activity_logs/        # Tenant & platform audit logs
│   └── seed_data.py          # Rich seed data script
└── frontend/                 # Vite + React + Tailwind CSS frontend
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── layouts/          # Public, Resident, Admin layouts
    │   ├── pages/            # Public, Resident, Staff, Admin pages
    │   ├── services/         # API clients (Axios)
    │   └── context/          # Auth and Notification context
```
