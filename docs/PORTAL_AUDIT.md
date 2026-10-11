# VORTEXA 3.0 Portal — Security & Architecture Audit

**Last Updated:** October 2026
**Auditor:** AntiGravity 

## 1. Executive Summary

This audit assesses the current state of the VORTEXA 3.0 Hackathon Portal against the requirements for production readiness, focusing on security, database performance, missing workflows (unified import, webhooks), and overall code maturity. The portal is currently functional for a happy-path flow but requires significant enhancements to handle real-world edge cases, external team imports, and robust GitHub integration.

## 2. Feature Implementation Status

### ✅ Working Features (Phase 3 & 4)
- **Authentication:** Custom JWT auth with `bcryptjs` and HTTP-only cookies is fully functional.
- **Registration & Team Formation:** Participants can register, form teams, and join via code.
- **Payment Processing:** File uploads and admin verification workflows are complete.
- **QR Tickets & Check-in:** Tickets are generated upon payment verification and support scanning.
- **Automatic GitHub Commit Tracker (Phase 3):**
  - Webhook endpoint (`/api/github/webhook`) with constant-time HMAC SHA-256 verification (`crypto.timingSafeEqual`).
  - Webhook delivery deduplication via `WebhookEvent` model.
  - Persisted database commits (`Commit` model) with collision prevention on unique repositories.
  - On-demand backfill & sync API (`/api/github/sync`).
  - Contributor matching against team roster with external contributor alerting.
  - Participant dashboard (`/dashboard/submission`) & Admin monitoring console (`/admin/monitoring`).
- **Submissions & Judging:** Dynamic criteria and score bounding are correctly implemented.
- **Results & Certificates:** Leaderboard logic and certificate rendering are functioning.

### ⚠️ Incomplete / In-Progress Features
- **Database Pooling (Phase 5):** Configured pooler connections on port 6543 with `?pgbouncer=true` and direct host on port 5432.

### ❌ Missing Functionality (Phase 2 & 3)
- **Admin CSV Bulk Import:** No capability exists to import CampusMeet/external registrations.
- **Account Claiming System:** No secure token generation, email invitation, or passwordless claim flow for imported users.
- **Webhook Commit Tracking:** No models exist in the database schema (`Commit`, `WebhookEvent`) to persistently store repository activity.
- **Automated Tests (Phase 7):** Zero automated test coverage (no Jest, Cypress, or Playwright configurations detected).

## 3. Database Migration Requirements

To satisfy Phase 2 and 3, the following schema migrations are necessary:

1. **`Participant` Model Updates:**
   - Add `registrationSource` (String, default "NATIVE")
   - Add `externalRegistrationId` (String, unique, nullable)
   - Add `importBatchId` (String, nullable)

2. **`ClaimToken` Model (New):**
   - For secure account claiming (`token_hash`, `email`, `expires_at`, `used_at`, `team_id`, `role`).

3. **`Commit` Model (New):**
   - To persist GitHub webhook events (`sha`, `message`, `author_name`, `team_id`, `timestamp`).

4. **`WebhookEvent` Model (New):**
   - For idempotency and replayability of GitHub webhook deliveries (`delivery_id`, `status`).

## 4. Security & Performance Bottlenecks

- **No Webhook Signature Verification:** Currently relies on the client/frontend to just trigger REST API pulls.
- **N+1 Query Risks:** Admin tables currently join heavily nested relations (e.g., Teams -> Members -> Participants -> Users).
- **Missing Rate Limiting:** No strict rate limiters on authentication or data import endpoints.

## 5. Recommended Implementation Order

1. **Phase 2 (Unified Registration):** Update schema, build the `/api/admin/bulk-import` route, and create the email-based account claiming workflow.
2. **Phase 3 (GitHub Webhooks):** Update schema with `Commit` models, build `/api/github/webhook`, configure HMAC signature validation, and update the dashboard to read from the DB instead of the REST API.
3. **Phase 5 (Performance Hardening):** Add pagination to admin tables and database indexes.
4. **Phase 7 (Testing):** Implement an end-to-end stress test simulating event day check-ins.
