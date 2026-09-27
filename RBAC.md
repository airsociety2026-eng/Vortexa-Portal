# VORTEXA — ROLE-BASED ACCESS CONTROL (RBAC) MATRIX

## 1. User Roles Overview

1. **`PARTICIPANT`**: General registered user. Can join teams, view event info, view ticket/QR when verified, view announcements & published problem statements, view results & download certificates.
2. **`TEAM_LEADER`**: Creator/leader of a team. Possesses `PARTICIPANT` rights plus: creates team, invites/manages members, submits payment proof, submits/edits final project.
3. **`VOLUNTEER`**: Event day execution staff. Can scan ticket QR codes, view team check-in details, and check in teams into allocated rooms.
4. **`JUDGE`**: Evaluation panel member. Can view assigned team submissions, view GitHub/demo links, enter scores per criteria, add feedback comments, and submit scores.
5. **`ADMIN`**: Hackathon Administrator. Manages teams, verifies/rejects payments, generates/manages tickets, manages rooms & allocations, manages problem statements & announcements, creates judges & criteria, manages scores, publishes results, and issues certificates.
6. **`SUPER_ADMIN`**: Full platform authority. Admin privileges plus: system config, event settings override, role promotion/demotion, system reset, and audit log access.

---

## 2. Granular Permissions Matrix

| Module / Action | PARTICIPANT | TEAM LEADER | VOLUNTEER | JUDGE | ADMIN | SUPER ADMIN |
|-----------------|:-----------:|:-----------:|:---------:|:-----:|:-----:|:-----------:|
| Self Profile    | ✅           | ✅           | ✅         | ✅     | ✅     | ✅          |
| Create Team     | ✅           | ✅           | ❌         | ❌     | ❌     | ❌          |
| Manage Members  | ❌           | ✅           | ❌         | ❌     | ✅     | ✅          |
| Submit Payment  | ❌           | ✅           | ❌         | ❌     | ❌     | ❌          |
| Verify Payment  | ❌           | ❌           | ❌         | ❌     | ✅     | ✅          |
| View Ticket/QR  | ✅           | ✅           | ✅         | ❌     | ✅     | ✅          |
| Scan Ticket QR  | ❌           | ❌           | ✅         | ❌     | ✅     | ✅          |
| Perform Check-in| ❌           | ❌           | ✅         | ❌     | ✅     | ✅          |
| Room Allocation | ❌           | ❌           | ❌         | ❌     | ✅     | ✅          |
| Submit Project  | ❌           | ✅           | ❌         | ❌     | ❌     | ❌          |
| View Submissions| Own Team    | Own Team     | Assigned   |Assigned| ✅     | ✅          |
| Score Teams     | ❌           | ❌           | ❌         |Assigned| ✅     | ✅          |
| Publish Results | ❌           | ❌           | ❌         | ❌     | ✅     | ✅          |
| Event Config    | ❌           | ❌           | ❌         | ❌     | ❌     | ✅          |
| Audit Logs      | ❌           | ❌           | ❌         | ❌     | ❌     | ✅          |
