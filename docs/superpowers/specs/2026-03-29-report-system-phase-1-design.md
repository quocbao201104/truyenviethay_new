# Report System Phase 1 Design

**Goal:** Add a reusable moderation report system for the website, launching first for `chapter` and `comment` targets while keeping the backend and database extensible for future `novel` and `audio` reports.

**Primary Engineering Direction:** Centralized `reports` domain model with role-aware routing and moderation workflows

**Success Criteria:**
- Logged-in users can submit reports for chapters and comments through a single backend entry point.
- Chapter reports notify both the story author and admins; comment reports notify admins only.
- Admins can review, filter, and update report status through a dedicated moderation surface.
- Authors can review and update chapter reports that belong to their own stories only.
- The schema, API shape, and service boundaries can accept `novel` and `audio` report targets later without redesigning the system.

## Current Project Shape

The project already has the key ingredients needed for a shared report system:

- [`backend/services/notification.services.js`](C:\Users\Admin\Downloads\web\truyenviethay_new\backend\services\notification.services.js) sends stored and realtime notifications through `thong_bao` plus Socket.IO.
- [`backend/controllers/comment.controller.js`](C:\Users\Admin\Downloads\web\truyenviethay_new\backend\controllers\comment.controller.js) and [`backend/services/comment.services.js`](C:\Users\Admin\Downloads\web\truyenviethay_new\backend\services\comment.services.js) already implement moderation-adjacent permissions for comments.
- [`backend/controllers/adminDashboard.controller.js`](C:\Users\Admin\Downloads\web\truyenviethay_new\backend\controllers\adminDashboard.controller.js) and [`backend/models/dashboard.model.js`](C:\Users\Admin\Downloads\web\truyenviethay_new\backend\models\dashboard.model.js) provide an existing admin surface that can later expose report counts.
- [`frontend/src/modules/comment/CommentList.vue`](C:\Users\Admin\Downloads\web\truyenviethay_new\frontend\src\modules\comment\CommentList.vue) already has per-comment action menus that can host a `Báo cáo` action.
- The audio and story modules already separate API modules from view components, which is a good fit for a new `frontend/src/modules/report/` domain.

That means the report system should be modeled as its own domain and connected to existing notifications and moderation screens, not built as ad hoc logic inside comments or `thong_bao`.

## Scope

### In scope for phase 1

- report creation for `chapter`
- report creation for `comment`
- user-facing report modal with radio-based issue selection
- backend validation and cooldown protection
- notification routing based on target type
- admin report listing and status updates
- author report listing and status updates for owned chapter reports
- audit-friendly status fields and notes

### Explicitly out of scope for phase 1

- report creation for `novel`
- report creation for `audio`
- automated moderation actions such as auto-hide or auto-lock
- bulk moderation actions
- reporter-to-admin chat threads
- attachment uploads inside reports

## Proposed Data Model

Create a dedicated `reports` table instead of overloading `thong_bao`.

`thong_bao` remains the delivery channel for alerts. `reports` becomes the source of truth for moderation state, filtering, ownership checks, and audit history.

Recommended schema:

```sql
CREATE TABLE reports (
  id INT NOT NULL AUTO_INCREMENT,
  reporter_id INT NOT NULL,
  target_id INT NOT NULL,
  target_type ENUM('chapter', 'comment', 'novel', 'audio') NOT NULL,
  issue_type VARCHAR(50) NOT NULL,
  description TEXT NULL,
  status ENUM('pending', 'processing', 'resolved', 'rejected') NOT NULL DEFAULT 'pending',
  admin_note TEXT NULL,
  resolved_by INT NULL,
  resolved_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_target (target_type, target_id),
  KEY idx_reports_reporter_created (reporter_id, created_at),
  KEY idx_reports_status_created (status, created_at),
  KEY idx_reports_target_status (target_type, status),
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users_new(id) ON DELETE CASCADE
);
```

### Why this shape fits the codebase

- `target_type + target_id` matches the future need for multiple target tables without forcing polymorphic foreign keys that MySQL cannot enforce cleanly.
- `resolved_by` and `resolved_at` support moderation audit history without requiring a separate event table in phase 1.
- `updated_at` improves dashboard sorting and filter freshness.
- No unique constraint is added for `(reporter_id, target_type, target_id)` because the business rule is cooldown-based, not permanent dedupe.

## Target Resolution Rules

Backend logic must validate that the target exists and resolve moderation context before inserting the report.

### Chapter target

Resolve:

- `chuong.id`
- owning `truyen_new.id`
- owning `truyen_new.user_id` as the author

This target type supports:

- author visibility for the owning story author
- admin visibility
- notifications to both author and admins

### Comment target

Resolve:

- `comments.id`
- linked `comments.truyen_id`

This target type supports:

- admin visibility only
- admin notifications only

Authors should not receive or manage comment reports in phase 1, even when the comment belongs to their story. That keeps the first moderation release simpler and avoids mixing content-fix workflows with community-rule enforcement.

## Issue Type Strategy

The API should not accept fully unbounded free-text `issue_type` values in phase 1. Use backend whitelists keyed by target type.

Recommended chapter issue types:

- `content_error`
- `missing_content`
- `wrong_chapter`
- `copyright`
- `other`

Recommended comment issue types:

- `spam`
- `harassment`
- `hate_speech`
- `spoiler_abuse`
- `other`

Frontend can render localized labels, but backend should validate against canonical string values.

## Moderation Workflow

### Statuses

- `pending`: newly created, untriaged
- `processing`: someone is actively reviewing or fixing it
- `resolved`: accepted and handled
- `rejected`: invalid or not actionable

### Permissions

#### Reporter

- can create reports
- can view only their own submitted reports
- cannot edit or reopen reports in phase 1

#### Admin

- can list and inspect all reports
- can change status for all report types
- can write `admin_note`
- can set `resolved_by` and `resolved_at`

#### Author

- can list and inspect chapter reports belonging to their own stories
- can change status only for those chapter reports
- can write handling notes if the API reuses `admin_note` as a generic moderator note field in phase 1
- cannot access comment reports

For stricter workflow control, the backend should allow authors to move chapter reports only to:

- `processing`
- `resolved`

Admins keep the right to use all statuses including `rejected`.

That reduces the risk of authors rejecting valid reports without admin oversight.

## Notification Routing

The notification system should be event-driven from the report service after the database insert succeeds.

### Chapter report notifications

Send:

- one notification to the owning author
- one notification fanout to all admins

Suggested meanings:

- author notification: content issue needs review
- admin notification: report created for moderation visibility

### Comment report notifications

Send:

- notification fanout to all admins only

### Notification ownership principle

Notifications are informational only. The canonical data remains in `reports`. If a notification fails after the insert, the report must still exist and remain reviewable from the report listing screens.

## API Design

### User endpoints

- `POST /api/reports`
- `GET /api/reports/mine`

Create request:

```json
{
  "target_id": 123,
  "target_type": "chapter",
  "issue_type": "content_error",
  "description": "Chương này bị lặp nội dung..."
}
```

### Admin endpoints

- `GET /api/admin/reports`
- `GET /api/admin/reports/:id`
- `PATCH /api/admin/reports/:id`

Admin list filters:

- `status`
- `target_type`
- `issue_type`
- `page`
- `limit`
- optional keyword search on description or note in a later pass

### Author endpoints

- `GET /api/author/reports`
- `GET /api/author/reports/:id`
- `PATCH /api/author/reports/:id`

Author list endpoints should only return chapter reports for stories owned by `req.user.id`.

## Cooldown and Abuse Protection

Add a report-specific limiter on top of business-rule validation.

### HTTP limiter

Add an Express rate limiter similar to the existing interaction limiters:

- base route limiter for `POST /api/reports`
- key by authenticated user id

### Business cooldown

Also enforce:

- same user
- same `target_type`
- same `target_id`
- not more than once within 10 minutes

This check belongs in the report service or model, not only in the rate limiter, because it is business-specific and must remain correct even if the HTTP layer changes.

## Backend Architecture

Recommended new backend units:

- `backend/migrations/<n>_create_reports.sql`
- `backend/models/report.model.js`
- `backend/services/report.service.js`
- `backend/controllers/report.controller.js`
- `backend/routes/report.routes.js`

### Responsibility split

#### `report.model.js`

Own:

- report inserts
- list queries
- detail queries
- cooldown lookup
- target resolution helper queries if they remain simple

#### `report.service.js`

Own:

- payload validation
- target existence and ownership resolution
- permission checks for author/admin visibility
- cooldown enforcement
- notification routing
- status transition rules

#### `report.controller.js`

Stay thin:

- parse request
- call service
- map success and error responses

This matches the controller/service/model layering already used elsewhere in the backend.

## Frontend Design

### User reporting flow

Use a modal with:

- title describing the target being reported
- radio buttons for issue type
- optional textarea for additional detail
- submit and cancel actions

Radio buttons are preferred over a dropdown because the choices are small and users are likely already frustrated when reporting a problem.

### Chapter entry point

Add a `Báo lỗi` action in the chapter-reading experience where it is visible but not dominant.

### Comment entry point

Add a `Báo cáo` action inside the existing action menu in [`frontend/src/modules/comment/CommentList.vue`](C:\Users\Admin\Downloads\web\truyenviethay_new\frontend\src\modules\comment\CommentList.vue).

### Admin moderation UI

Use a dedicated route rather than injecting a heavy moderation table into the overview dashboard.

Recommended route:

- `/admin/reports`

The screen should include:

- filter controls
- paginated table or list
- report detail panel or modal
- status update controls
- moderator note textarea

### Author moderation UI

Recommended route:

- `/author/reports`

This view is a narrower inbox for chapter reports only.

## Dashboard Integration

The first release does not need a full report dashboard redesign, but it should leave room for light integration:

- optional pending-report count on admin dashboard
- optional quick link from dashboard to `/admin/reports`

That should be additive, not a dependency for the core report flow.

## Error Handling Rules

The backend should return clear and consistent errors for:

- unauthenticated reporter
- invalid target type
- invalid issue type
- missing target
- unauthorized author access
- duplicate report cooldown violation
- invalid status transition

Notification failures should be logged, but should not roll back a successfully stored report unless the team explicitly wants transactional delivery semantics later.

## Testing Strategy

### Backend tests

Add or extend focused tests for:

- create chapter report successfully
- create comment report successfully
- reject invalid target type
- reject invalid issue type
- reject duplicate cooldown attempt
- route chapter report notifications to author and admins
- route comment report notifications to admins only
- author can view owned chapter reports only
- author cannot view comment reports
- author cannot update reports outside owned stories
- admin can update any report status

### Frontend verification

Verify manually:

- chapter report modal opens and submits
- comment report modal opens from the existing action menu
- user receives success feedback
- admin report list loads and updates status
- author report list loads only relevant chapter reports

## Rollout Plan

### Phase 1 release

- add migration
- add backend report domain
- wire notifications
- add user entry points for chapter and comment reports
- add admin and author report views
- verify rate limiting and cooldown behavior

### Future phase compatibility

The design intentionally keeps room for:

- `novel` reports
- `audio` reports
- moderation analytics
- auto-escalation rules
- richer audit trails

Those can be added by extending target resolution and frontend entry points without changing the central report contract.

## Recommended Implementation Direction

Implement phase 1 as a dedicated cross-cutting `report` domain, not as feature-specific patches in comments or chapters. Start with the migration and backend contract, then wire notifications, then add user report entry points, and finish with admin and author moderation screens. This yields a clean foundation now and avoids a costly schema/API redesign when `novel` and `audio` reports are introduced later.
