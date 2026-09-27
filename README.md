# VORTEXA — Production Hackathon Registration & Event Management Platform

VORTEXA is an enterprise-grade, production-style hackathon management platform connecting Participants, Team Leaders, Volunteers, Judges, Admins, and Super Admins in a unified real-time workflow.

---

## 🌟 Key Features

1. **Human-Readable Team Identifiers (`team_code` e.g. `VTX26-00421`)** connecting Registration, Payments, Tickets, QR Check-in, Room Allocation, Submissions, Judging, Results, and Certificates.
2. **Dual Interface Architecture**: Participant Application (`/dashboard/*`) and Admin Console (`/admin/*`).
3. **6 Role-Based Access Control (RBAC)**: `PARTICIPANT`, `TEAM_LEADER`, `VOLUNTEER`, `JUDGE`, `ADMIN`, `SUPER_ADMIN`.
4. **Automated Journey Progress Tracker**: Displays real backend lifecycle state.
5. **UPI Payment Verification Console**: Admin screenshot viewer modal, UTR search, verification and rejection with reason.
6. **Event-Day Camera QR Scanner**: Instant check-in and duplicate check-in prevention.
7. **Room Management & Team Allocation**: Real-time venue room assignment and capacity tracking.
8. **Project Submission & Deadline Locking**: GitHub URL (Required), Demo URL (Required), YouTube Video (Optional), Google Drive Video (Optional).
9. **GitHub Live Project Monitoring**: Real GitHub REST API activity monitoring, commit timeline, author breakdown, branches, PRs, and rate limit caching.
10. **Automated Ticket Email Delivery**: Nodemailer email engine sending HTML tickets with QR passes upon payment verification, with resend support.
11. **Dynamic Multi-Criteria Judging Engine**: Evaluation panel scoring with weighted metrics and max score bounds.
12. **Published Leaderboard & Results Engine**: Server-side score calculation and ranking publication.
13. **Tamper-Proof Digital Certificates & Public Verification**: Instant PDF generation and public verification at `/verify/{certificateCode}`.
14. **Security Audit Logs & Event Settings**: Full administrative audit trail and configurable event parameters.

---

## ⚙️ Environment Variables (`.env`)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="vortexa-production-jwt-secret-key-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Email Delivery Configuration (Nodemailer / SMTP)
EMAIL_USER="kautilyacore@gmail.com"
EMAIL_PASS="" # App password for live SMTP delivery (Simulated in dev mode if empty)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587

# Optional GitHub API Token for Higher Rate Limits (5,000 requests/hr)
GITHUB_TOKEN=""
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v18+ or v20+ / v26
- npm / npx

### 2. Installation & Setup
```bash
# 1. Install dependencies
npm install

# 2. Push database schema (SQLite / PostgreSQL)
npx prisma db push

# 3. Seed database with demo accounts & data
npx ts-node prisma/seed.ts

# 4. Start local development server
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🔑 Pre-Configured Test Accounts (Password: `password123`)

| Role | Email | Password | Access / Purpose |
|------|-------|----------|------------------|
| **Super Admin** | `superadmin@vortexa.io` | `password123` | Full system control & settings |
| **Admin** | `admin@vortexa.io` | `password123` | Payments, rooms, results & certificates |
| **Judge** | `judge.alex@vortexa.io` | `password123` | Judge scoring portal & assigned teams |
| **Volunteer** | `volunteer.sam@vortexa.io` | `password123` | Event day QR scanner & check-in desk |
| **Team Leader** | `leader.kunal@vortexa.io` | `password123` | Team VTX26-00421 "Code Titans" leader |
| **Participant** | `member.sarah@vortexa.io` | `password123` | Team member profile |

---

## 📁 Repository Documentation
- `PROJECT_STATUS.md` — Current phase and feature completion details
- `ARCHITECTURE.md` — System architecture and tech stack
- `DATABASE.md` — Database schema & 21 entities documentation
- `RBAC.md` — Role-based permission matrix
- `VORTEXA_HANDOFF.md` — Complete technical handoff & continuation prompt
