# VORTEXA 3.0 — Automatic GitHub Commit Tracker Architecture

**Status:** Production Ready  
**Version:** 3.0.0  
**Updated:** October 2026

---

## 1. Overview & Objectives

During hackathons, monitoring participant progress, verifying that projects are built during the event window, and catching non-team unauthorized contributors are critical challenges. 

The VORTEXA Git Tracking System delivers:
1. **Repository Linking & Collision Prevention:** Prevents multiple teams from submitting or claiming the same repository URL.
2. **Automated Webhooks:** Ingests live GitHub push events with constant-time HMAC SHA-256 signature verification (`X-Hub-Signature-256`).
3. **Delivery Deduplication:** Idempotency via `WebhookEvent` table using GitHub's `X-GitHub-Delivery` header.
4. **Database-Backed Commit Storage:** Commits are persisted into the `Commit` database table, eliminating GitHub REST API rate-limit exhaustion.
5. **Roster Contributor Audit:** Automatically matches commit authors and emails against registered team members, highlighting unmatched/external contributors with alerts.
6. **On-Demand Synchronization:** Provides a `/api/github/sync` endpoint allowing participants and admins to backfill commits immediately.
7. **Participant & Admin Dashboards:**
   - Participant: `/dashboard/submission`
   - Admin: `/admin/monitoring`

---

## 2. Key Architecture & Endpoints

### 2.1 Webhook Endpoint
- **Path:** `POST /api/github/webhook`
- **Headers:**
  - `x-github-delivery`: Unique event delivery UUID.
  - `x-github-event`: Event type (`push`, `ping`, etc.).
  - `x-hub-signature-256`: `sha256=<hmac_hex>`
- **Signature Verification:**
  - Uses `crypto.createHmac("sha256", secret)` against raw body text.
  - Constant-time verification using `crypto.timingSafeEqual`.
  - Secret configurable via `GITHUB_WEBHOOK_SECRET` environment variable (defaults to `vortexa_webhook_secret_2026`).
- **Processing:**
  - `ping`: Responds with 200 OK and acknowledges hook setup.
  - `push`: Parses `commits[]`, upserts into `db.commit`, updates `submission.github_last_synced_at`, marks `WebhookEvent` as `PROCESSED`.

### 2.2 On-Demand Sync Endpoint
- **Path:** `POST /api/github/sync`
- **Method:** `POST`
- **Auth:** Requires JWT session.
- **Permissions:** Participants can sync their own team; Admins can pass `{ teamId }` to sync any team.
- **Behavior:** Queries GitHub REST API for up to 50 recent commits and upserts them into `db.commit`.

### 2.3 Live Admin Monitoring API
- **Path:** `GET /api/github/monitor?all=true` or `GET /api/github/monitor?teamId=<id>`
- **Performance:** Reads directly from database tables (`Team`, `Submission`, `Commit`), eliminating slow concurrent API pulls.
- **Optional Force Sync:** `GET /api/github/monitor?teamId=<id>&sync=true` backfills before returning.

### 2.4 Submission & Collision Prevention
- **Path:** `POST /api/submissions`
- **Collision Check:** Parses repository into `owner/repo`. Rejects submissions if `github_owner` and `github_repo` are already registered by another team.

---

## 3. Database Schema

```prisma
model Commit {
  id           String   @id @default(uuid())
  sha          String   @unique
  message      String
  author_name  String
  author_email String?
  team_id      String
  team         Team     @relation(fields: [team_id], references: [id], onDelete: Cascade)
  url          String
  timestamp    DateTime
  created_at   DateTime @default(now())

  @@index([team_id])
  @@map("commits")
}

model WebhookEvent {
  id               String   @id @default(uuid())
  github_delivery  String   @unique
  event_type       String
  payload          String
  status           String   @default("PENDING") // PENDING, PROCESSED, FAILED
  error_message    String?
  created_at       DateTime @default(now())

  @@map("webhook_events")
}
```

---

## 4. Participant Webhook Setup Instructions

1. Go to your GitHub repository on GitHub.com.
2. Click **Settings** > **Webhooks** > **Add webhook**.
3. **Payload URL:** `https://<YOUR_PORTAL_DOMAIN>/api/github/webhook`
4. **Content type:** `application/json`
5. **Secret:** `vortexa_webhook_secret_2026` (or configured `GITHUB_WEBHOOK_SECRET`)
6. **Which events would you like to trigger this webhook?** Select **Just the push event**.
7. Click **Add webhook**.
