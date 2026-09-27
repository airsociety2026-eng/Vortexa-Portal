# VORTEXA — SYSTEM ARCHITECTURE

## 1. Executive Summary
**VORTEXA** is a production-grade, enterprise-class Hackathon Registration & Event Management Platform. It orchestrates the full lifecycle of a college or national-scale hackathon, connecting Participants, Team Leaders, Volunteers, Judges, Admins, and Super Admins in a unified real-time workflow.

---

## 2. High-Level System Architecture

```text
                               ┌───────────────────────────────────────────────┐
                               │                 VORTEXA APP                   │
                               │           Next.js 14 (App Router)             │
                               └───────────────────────┬───────────────────────┘
                                                       │
                           ┌───────────────────────────┴───────────────────────────┐
                           │                                                       │
                           ▼                                                       ▼
            ┌─────────────────────────────┐                         ┌─────────────────────────────┐
            │   PARTICIPANT APPLICATION   │                         │      ADMIN APPLICATION      │
            │  - Auth & Profile Management│                         │  - Dashboard & Analytics    │
            │  - Team Creation & Invites  │                         │  - Payment Verification     │
            │  - Payment Proof Upload     │                         │  - QR Event Day Scanner     │
            │  - Ticket & QR View         │                         │  - Room Allocation          │
            │  - Room & Check-In View     │                         │  - Announcements & Problems │
            │  - Problem Statements View  │                         │  - Submission Lock Engine   │
            │  - Project Submission       │                         │  - Judge Assignment & Scoring│
            │  - Leaderboard & Results    │                         │  - Result Publishing        │
            │  - Certificate Download     │                         │  - Certificate Generation   │
            └──────────────┬──────────────┘                         └──────────────┬──────────────┘
                           │                                                       │
                           └───────────────────────────┬───────────────────────────┘
                                                       │
                                                       ▼
                                       ┌───────────────────────────────┐
                                       │     SERVER API & MIDDLEWARE   │
                                       │  - JWT & HTTP-Only Auth       │
                                       │  - Strict RBAC Guard          │
                                       │  - Input Validation (Zod)     │
                                       │  - File Upload Handler        │
                                       │  - Audit Logger Middleware    │
                                       └───────────────┬───────────────┘
                                                       │
                                                       ▼
                                       ┌───────────────────────────────┐
                                       │       DATA ACCESS LAYER       │
                                       │    Prisma ORM (TypeScript)    │
                                       └───────────────┬───────────────┘
                                                       │
                                                       ▼
                                       ┌───────────────────────────────┐
                                       │       RELATIONAL DATABASE     │
                                       │    SQLite / PostgreSQL DB     │
                                       └───────────────────────────────┘
```

---

## 3. Technology Stack Selection
- **Frontend Framework**: Next.js 14 (App Router) + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS (Cyberpunk/Dark Glassmorphism Theme)
- **Icons**: Lucide React Icons
- **Database & ORM**: Prisma ORM with SQLite (Development/Self-contained) & PostgreSQL compatibility
- **Authentication**: JWT (JSON Web Tokens) with HTTP-Only Cookies + bcryptjs password hashing
- **QR Code Engine**: `qrcode` (Generation) + HTML5 Camera QR Code Scanner (`html5-qrcode`)
- **PDF Engine**: Client/Server PDF generation for Tickets & Official Certificates
- **Validation**: Zod schema validation
