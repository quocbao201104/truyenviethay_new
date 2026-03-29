# Report System Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shared `reports` system for `chapter` and `comment` targets with moderation workflows, notification routing, and separate admin and author review surfaces.

**Architecture:** Add a new backend `report` domain with its own migration, model, service, controller, validators, and routes. Connect that domain to the existing notification system and expose it through new frontend report modules plus dedicated admin and author screens, while wiring user entry points into the chapter reading view and comment action menus.

**Tech Stack:** Node.js 20, Express, MySQL 8, Redis-backed notifications, Vue 3, Pinia, TypeScript, Vite, Jest

---

## File Structure

- Create: `backend/migrations/34_create_reports.sql`
- Create: `backend/constants/report.constants.js`
- Create: `backend/models/report.model.js`
- Create: `backend/services/report.service.js`
- Create: `backend/controllers/report.controller.js`
- Create: `backend/routes/report.routes.js`
- Create: `backend/validators/report.validator.js`
- Create: `backend/__tests__/report.controller.test.js`
- Modify: `backend/app.js`
- Modify: `backend/middleware/rateLimiters.js`
- Modify: `backend/constants/notification.constants.js`
- Modify: `backend/services/notification.services.js`
- Modify: `backend/routes/author.routes.js`
- Modify: `backend/routes/admin.cache.routes.js`
- Modify: `backend/models/dashboard.model.js`
- Create: `frontend/src/modules/report/report.service.ts`
- Create: `frontend/src/modules/report/report.store.ts`
- Create: `frontend/src/modules/report/report.types.ts`
- Create: `frontend/src/modules/report/components/ReportTargetModal.vue`
- Create: `frontend/src/views/admin/AdminReportsView.vue`
- Create: `frontend/src/views/Author/AuthorReportsView.vue`
- Modify: `frontend/src/router/index.ts`
- Modify: `frontend/src/modules/admin/admin.api.ts`
- Create: `frontend/src/modules/author/report.api.ts`
- Modify: `frontend/src/views/ChapterView.vue`
- Modify: `frontend/src/modules/comment/CommentList.vue`
- Optional modify: `frontend/src/views/admin/AdminDashboardView.vue`
- Optional modify: `frontend/src/views/Author/AuthorDashboardView.vue`

## Responsibility Map

- `backend/migrations/34_create_reports.sql`
  Create the new `reports` table and indexes.
- `backend/constants/report.constants.js`
  Own `target_type`, `issue_type`, and status transition definitions.
- `backend/models/report.model.js`
  Own database access for insert, list, detail, cooldown checks, and target resolution queries.
- `backend/services/report.service.js`
  Own validation orchestration, permission rules, cooldown logic, target routing, and notifications.
- `backend/controllers/report.controller.js`
  Keep request handling thin and response formatting consistent.
- `backend/routes/report.routes.js`
  Expose `/api/reports`, `/api/admin/reports`, and `/api/author/reports`.
- `backend/validators/report.validator.js`
  Validate create payloads, list filters, route params, and patch payloads.
- `frontend/src/modules/report/*`
  Own shared report types, API calls, and store state.
- `frontend/src/modules/report/components/ReportTargetModal.vue`
  Own the reusable report submission modal for chapters and comments.
- `frontend/src/views/admin/AdminReportsView.vue`
  Own the admin moderation list, detail state, filters, and status updates.
- `frontend/src/views/Author/AuthorReportsView.vue`
  Own the author-facing chapter report inbox and status updates.

### Task 1: Lock backend report behavior with failing tests

**Files:**
- Create: `backend/__tests__/report.controller.test.js`
- Test: `backend/controllers/report.controller.js`
- Test: `backend/services/report.service.js`

- [ ] **Step 1: Create the report controller test file with the first failing create-report cases**

Cover at least:

```js
it("creates a chapter report and routes notifications to author and admins", async () => {});
it("creates a comment report and routes notifications only to admins", async () => {});
it("rejects a duplicate cooldown report for the same user and target", async () => {});
```

- [ ] **Step 2: Add failing permission tests for admin and author listing/update behavior**

Cover at least:

```js
it("allows admins to update any report status", async () => {});
it("allows authors to update only chapter reports for owned stories", async () => {});
it("rejects author access to comment reports", async () => {});
```

- [ ] **Step 3: Run the focused backend report test file to verify it fails**

Run:

```powershell
npm test -- --runInBand __tests__/report.controller.test.js
```

Working directory:

```powershell
backend
```

Expected: FAIL because the report domain does not exist yet.

- [ ] **Step 4: Commit the failing-test checkpoint**

```bash
git add backend/__tests__/report.controller.test.js
git commit -m "test: lock report system backend behavior"
```

### Task 2: Add the database contract and backend constants

**Files:**
- Create: `backend/migrations/34_create_reports.sql`
- Create: `backend/constants/report.constants.js`
- Modify: `backend/constants/notification.constants.js`

- [ ] **Step 1: Write the migration for the `reports` table**

Include:

- `id`
- `reporter_id`
- `target_id`
- `target_type`
- `issue_type`
- `description`
- `status`
- `admin_note`
- `resolved_by`
- `resolved_at`
- `created_at`
- `updated_at`

Also add the indexes from the approved spec:

- `(target_type, target_id)`
- `(reporter_id, created_at)`
- `(status, created_at)`
- `(target_type, status)`

- [ ] **Step 2: Add report constants and issue-type whitelists**

Define canonical constants similar to:

```js
const REPORT_TARGET_TYPES = { CHAPTER: "chapter", COMMENT: "comment", NOVEL: "novel", AUDIO: "audio" };
const REPORT_STATUSES = { PENDING: "pending", PROCESSING: "processing", RESOLVED: "resolved", REJECTED: "rejected" };
const REPORT_ISSUE_TYPES = {
  chapter: ["content_error", "missing_content", "wrong_chapter", "copyright", "other"],
  comment: ["spam", "harassment", "hate_speech", "spoiler_abuse", "other"],
};
```

- [ ] **Step 3: Extend notification constants with dedicated report notification types**

Add distinct notification type ids for:

- chapter report for author
- chapter report for admin
- comment report for admin

Also update `CATEGORY_MAP` so report notifications appear under a sensible bucket.

- [ ] **Step 4: Verify the migration and constants are readable**

Run:

```powershell
Get-Content backend/migrations/34_create_reports.sql
Get-Content backend/constants/report.constants.js
Get-Content backend/constants/notification.constants.js
```

Expected: files exist with the approved schema and canonical constants.

- [ ] **Step 5: Commit the schema/constants checkpoint**

```bash
git add backend/migrations/34_create_reports.sql backend/constants/report.constants.js backend/constants/notification.constants.js
git commit -m "feat: add report system database contract"
```

### Task 3: Build the backend report domain and route wiring

**Files:**
- Create: `backend/models/report.model.js`
- Create: `backend/services/report.service.js`
- Create: `backend/controllers/report.controller.js`
- Create: `backend/routes/report.routes.js`
- Create: `backend/validators/report.validator.js`
- Modify: `backend/middleware/rateLimiters.js`
- Modify: `backend/services/notification.services.js`
- Modify: `backend/app.js`
- Modify: `backend/routes/author.routes.js`
- Modify: `backend/routes/admin.cache.routes.js`

- [ ] **Step 1: Add validators for create/list/update payloads**

Validate:

- `target_id` positive integer
- `target_type` allowed in phase 1: `chapter`, `comment`
- `issue_type` present
- `description` optional but length-limited
- `status` patch values restricted by role

- [ ] **Step 2: Implement the report model methods**

Add methods for:

- create report row
- find recent duplicate within 10 minutes
- resolve chapter target and owning author
- resolve comment target and linked story
- list reporter-owned reports
- list admin reports with pagination and filters
- list author chapter reports scoped to owned stories
- fetch report detail for admin and author scopes
- update status, note, resolver metadata

- [ ] **Step 3: Implement the report service orchestration**

The service should:

- validate allowed issue types by target
- resolve target existence
- enforce the 10-minute same-user same-target cooldown
- route chapter notifications to author and admins
- route comment notifications to admins only
- enforce author-only ownership on chapter moderation
- enforce author status transitions to `processing` and `resolved` only

- [ ] **Step 4: Extend the notification service with report templates**

Add helper templates such as:

```js
CHAPTER_REPORT_AUTHOR: (storyName) => `Chuong trong truyen ${storyName} vua bi bao loi.`;
CHAPTER_REPORT_ADMIN: (storyName) => `Co report moi cho chuong thuoc truyen ${storyName}.`;
COMMENT_REPORT_ADMIN: () => `Co report moi cho binh luan can kiem duyet.`;
```

Use the existing `sendNotification` and `sendNotificationToAdmins` utilities after the report insert succeeds.

- [ ] **Step 5: Add the report-specific HTTP limiter**

Add a limiter in `backend/middleware/rateLimiters.js` for `POST /api/reports`, keyed by authenticated user id, with a short burst-safe ceiling. Keep the business cooldown in the service even after the HTTP limiter is added.

- [ ] **Step 6: Add route wiring**

Expose:

- `POST /api/reports`
- `GET /api/reports/mine`
- `GET /api/admin/reports`
- `GET /api/admin/reports/:id`
- `PATCH /api/admin/reports/:id`
- `GET /api/author/reports`
- `GET /api/author/reports/:id`
- `PATCH /api/author/reports/:id`

Use existing auth middleware patterns:

- `authenticateToken`
- `authorizeRoles("admin")`
- `authorizeRoles("author", "admin")`

- [ ] **Step 7: Run the focused report backend tests until they pass**

Run:

```powershell
npm test -- --runInBand __tests__/report.controller.test.js
```

Working directory:

```powershell
backend
```

Expected: PASS.

- [ ] **Step 8: Commit the backend report domain checkpoint**

```bash
git add backend/models/report.model.js backend/services/report.service.js backend/controllers/report.controller.js backend/routes/report.routes.js backend/validators/report.validator.js backend/middleware/rateLimiters.js backend/services/notification.services.js backend/app.js backend/routes/author.routes.js backend/routes/admin.cache.routes.js
git commit -m "feat: add report system backend flows"
```

### Task 4: Add shared frontend report modules and moderation screens

**Files:**
- Create: `frontend/src/modules/report/report.types.ts`
- Create: `frontend/src/modules/report/report.service.ts`
- Create: `frontend/src/modules/report/report.store.ts`
- Create: `frontend/src/modules/report/components/ReportTargetModal.vue`
- Create: `frontend/src/views/admin/AdminReportsView.vue`
- Create: `frontend/src/views/Author/AuthorReportsView.vue`
- Modify: `frontend/src/modules/admin/admin.api.ts`
- Create: `frontend/src/modules/author/report.api.ts`
- Modify: `frontend/src/router/index.ts`
- Optional modify: `frontend/src/views/admin/AdminDashboardView.vue`
- Optional modify: `frontend/src/views/Author/AuthorDashboardView.vue`

- [ ] **Step 1: Add shared frontend report types and API clients**

Create typed payloads and responses for:

- submit report
- list my reports
- list admin reports
- list author reports
- update report status

- [ ] **Step 2: Build a reusable report modal component**

The modal should accept props for:

- `targetId`
- `targetType`
- `targetLabel`
- `issueOptions`
- `open`

The modal should emit:

- `close`
- `submitted`

- [ ] **Step 3: Add the admin moderation screen**

Implement:

- filter bar
- report list
- detail panel or detail block
- status select
- moderator note textarea

Route:

```ts
{ path: "/admin/reports", meta: { requiresAuth: true, requiredRole: ["admin"] } }
```

- [ ] **Step 4: Add the author chapter-report screen**

Implement:

- list scoped to chapter reports only
- status update controls limited to author-allowed transitions

Route:

```ts
{ path: "/author/reports", meta: { requiresAuth: true, requiredRole: ["author", "admin"] } }
```

- [ ] **Step 5: Add dashboard quick links if the layout permits**

Optionally add entry links from:

- `frontend/src/views/admin/AdminDashboardView.vue`
- `frontend/src/views/Author/AuthorDashboardView.vue`

Keep this additive and avoid restructuring existing dashboard sections.

- [ ] **Step 6: Run a frontend production build to catch type or import errors**

Run:

```powershell
npm run build
```

Working directory:

```powershell
frontend
```

Expected: build succeeds.

- [ ] **Step 7: Commit the frontend moderation-screen checkpoint**

```bash
git add frontend/src/modules/report frontend/src/views/admin/AdminReportsView.vue frontend/src/views/Author/AuthorReportsView.vue frontend/src/modules/admin/admin.api.ts frontend/src/modules/author/report.api.ts frontend/src/router/index.ts frontend/src/views/admin/AdminDashboardView.vue frontend/src/views/Author/AuthorDashboardView.vue
git commit -m "feat: add report moderation screens"
```

### Task 5: Wire report entry points into chapter and comment flows

**Files:**
- Modify: `frontend/src/views/ChapterView.vue`
- Modify: `frontend/src/modules/comment/CommentList.vue`
- Reuse: `frontend/src/modules/report/components/ReportTargetModal.vue`

- [ ] **Step 1: Add a chapter report entry point to the reading view**

Place a `Bao loi` or equivalent action in a visible but non-dominant location inside `ChapterView.vue`. The action should open the shared report modal with chapter issue options.

- [ ] **Step 2: Add a comment report entry point to the existing action menu**

Extend the action menu in `CommentList.vue` to include a `Bao cao` action for comments the current user is allowed to report.

- [ ] **Step 3: Connect both entry points to the shared report store/API**

On success:

- close modal
- reset form
- show success toast

On failure:

- show backend error or cooldown message

- [ ] **Step 4: Run a frontend build again after the view integrations**

Run:

```powershell
npm run build
```

Working directory:

```powershell
frontend
```

Expected: build succeeds with the chapter and comment entry points connected.

- [ ] **Step 5: Commit the user entry-point checkpoint**

```bash
git add frontend/src/views/ChapterView.vue frontend/src/modules/comment/CommentList.vue
git commit -m "feat: add chapter and comment report entry points"
```

### Task 6: Verify the end-to-end report workflow and deployment readiness

**Files:**
- Modify as needed based on verification findings
- Verify: `docs/superpowers/specs/2026-03-29-report-system-phase-1-design.md`

- [ ] **Step 1: Run the focused backend report tests**

Run:

```powershell
npm test -- --runInBand __tests__/report.controller.test.js
```

Working directory:

```powershell
backend
```

Expected: PASS.

- [ ] **Step 2: Run the broader backend Jest suite**

Run:

```powershell
npm test -- --runInBand
```

Working directory:

```powershell
backend
```

Expected: existing tests still pass.

- [ ] **Step 3: Run the frontend production build**

Run:

```powershell
npm run build
```

Working directory:

```powershell
frontend
```

Expected: PASS.

- [ ] **Step 4: Apply the migration against the connected DigitalOcean database only after local verification passes**

Run the migration using the project’s existing environment configuration and deployment-safe process. Record the exact command used in the implementation notes when executing this step.

Expected: `reports` table and indexes exist in the remote database.

- [ ] **Step 5: Perform manual smoke checks**

Verify:

- user can submit a chapter report
- user can submit a comment report
- same user cannot report the same target again within 10 minutes
- admin can view and update both report types
- author can view and update owned chapter reports only
- report notifications arrive in the existing notification center

- [ ] **Step 6: Commit any final verification fixes**

```bash
git add <files-fixed-during-verification>
git commit -m "fix: finalize report system phase 1 verification"
```
