# VORTEXA — DATABASE SCHEMA DOCUMENTATION

## 1. Schema Overview
The central entity in VORTEXA is the **Team** (`team_code` e.g., `VTX26-00421`, internal `id` UUID). All primary hackathon operations (Payment, Ticket, Check-in, Room Allocation, Submission, Judging, Results) revolve around the Team.

---

## 2. Core Entities & Relationships

```text
  ┌─────────────┐       1:1      ┌───────────────┐
  │    User     ├───────────────►│  Participant  │
  └──────┬──────┘                └───────┬───────┘
         │ 1:N                           │ 1:N
         ▼                               ▼
  ┌─────────────┐       1:N      ┌───────────────┐
  │ Audit Log   │                │  Team Member  │
  └─────────────┘                └───────┬───────┘
                                         │ N:1
                                         ▼
                                 ┌───────────────┐
                                 │     Team      │
                                 └───────┬───────┘
         ┌───────────────────────────────┼──────────────────────────────┐
         │ 1:1                           │ 1:1                          │ 1:1
         ▼                               ▼                              ▼
  ┌─────────────┐                 ┌─────────────┐                ┌──────────────┐
  │   Payment   │                 │   Ticket    │                │ RoomAlloc.   │
  └─────────────┘                 └──────┬──────┘                └──────────────┘
                                         │ 1:1
                                         ▼
                                  ┌─────────────┐
                                  │  CheckIn    │
                                  └─────────────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │ Submission  │
                                  └──────┬──────┘
                                         │ 1:N
                                         ▼
                                  ┌─────────────┐
                                  │   Score     │
                                  └─────────────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │   Result    │
                                  └──────┬──────┘
                                         │ 1:N
                                         ▼
                                  ┌─────────────┐
                                  │ Certificate │
                                  └─────────────┘
```

---

## 3. Database Tables Summary

1. `users` — User authentication, credentials, and global roles (`PARTICIPANT`, `TEAM_LEADER`, `VOLUNTEER`, `JUDGE`, `ADMIN`, `SUPER_ADMIN`).
2. `participants` — Extended personal profile (College, Course, Department, Year, Roll Number, Phone).
3. `teams` — Main business entity (`id` UUID, `team_code` indexed string e.g. `VTX26-00421`, `team_name`, `status`).
4. `team_members` — Join table between Teams and Participants (`role`: `LEADER` | `MEMBER`).
5. `payments` — Manual UPI Payment proof tracking (`utr_number`, `screenshot_url`, `status`: `PENDING`/`VERIFIED`/`REJECTED`, `rejection_reason`).
6. `tickets` — Verified event ticket with QR token (`ticket_code`, `status`: `ACTIVE`/`USED`/`CANCELLED`).
7. `checkins` — QR verification event day log (`checked_in_at`, `checked_in_by`).
8. `rooms` — Event venue rooms (`room_name`, `building`, `floor`, `capacity`).
9. `room_allocations` — Assignment of Team to Room.
10. `announcements` — Event notifications for participants (`priority`: `NORMAL`/`IMPORTANT`/`URGENT`).
11. `problem_statements` — Hackathon tracks & challenges (`difficulty`, `rules`, `attachments`).
12. `submissions` — Project submission (`github_url`, `demo_url`, `tech_stack`, `status`: `DRAFT`/`SUBMITTED`/`LOCKED`).
13. `judges` — Judge profiles and expertise.
14. `judge_assignments` — Assignment of Judge to Team.
15. `judging_criteria` — Dynamic evaluation metrics with maximum score bounds.
16. `scores` — Evaluation scores per criteria per judge per submission.
17. `results` — Official hackathon rankings and awards (`status`: `DRAFT`/`PUBLISHED`).
18. `certificates` — Issued certificates with verification code.
19. `notifications` — In-app notifications.
20. `audit_logs` — System administrative audit record.
21. `event_settings` — Hackathon configuration (Deadlines, UPI ID, max team size, venue).
