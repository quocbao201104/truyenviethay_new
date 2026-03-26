# Audio Backend Performance and Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Speed up the audio backend, reduce database and cache inefficiencies, and harden progress persistence without forcing unnecessary frontend API changes.

**Architecture:** Keep the current `/api/truyen/:id/audio`, `/api/truyen/slug/:slug/audio`, and `/api/truyen/:id/audio-progress` routes, but move audio orchestration into a dedicated backend service and support it with narrower queries, better indexes, and safer cache invalidation. The implementation stays backward-compatible at the API layer and treats frontend work as a follow-up phase after backend verification.

**Tech Stack:** Node.js 20, Express, MySQL 8+, Redis, Jest

---

## File Structure

- Create: `backend/services/storyAudio.service.js`
- Create: `backend/__tests__/story.audio-progress.test.js`
- Create: `backend/migrations/30_audio_backend_performance_and_integrity.sql`
- Modify: `backend/controllers/story.controller.js`
- Modify: `backend/models/story.model.js`
- Modify: `backend/utils/cache.js`
- Modify: `backend/__tests__/story.audio-response.test.js`
- Optional follow-up modify: `frontend/src/modules/storyAudio/storyAudio.service.ts`

### Responsibility Map

- `backend/services/storyAudio.service.js`
  Own audio meta assembly, playlist assembly, progress hydration, and response orchestration.
- `backend/models/story.model.js`
  Own narrow story-audio reads, playlist reads, progress validation queries, and progress upsert.
- `backend/controllers/story.controller.js`
  Stay thin: validate request shape, call service, return response.
- `backend/utils/cache.js`
  Provide safer invalidation helpers for exact audio keys or narrow prefixes.
- `backend/migrations/30_audio_backend_performance_and_integrity.sql`
  Add audio-focused indexes and the progress uniqueness guarantee.
- `backend/__tests__/story.audio-response.test.js`
  Lock the read payload and cache behavior.
- `backend/__tests__/story.audio-progress.test.js`
  Lock valid and invalid progress-write behavior.

### Task 1: Lock the current audio contract with failing tests

**Files:**
- Modify: `backend/__tests__/story.audio-response.test.js`
- Create: `backend/__tests__/story.audio-progress.test.js`
- Test: `backend/controllers/story.controller.js`

- [ ] **Step 1: Extend the existing audio response test to cover both slug and id flows**

Add cases that assert:

- audio detail by slug returns `story`, `audio`, and optional `progress`
- audio detail by id returns the same shape
- playlist parts still expose `audio_url` with `r2_key` fallback

- [ ] **Step 2: Add a failing progress-write test file**

Cover at least these cases:

```js
it("rejects a part that does not belong to the story", async () => {});
it("returns saved progress for a valid story/part pair", async () => {});
it("rejects invalid ids before hitting persistence", async () => {});
```

- [ ] **Step 3: Run the focused audio tests to verify they fail for the new cases**

Run:

```powershell
npx jest __tests__/story.audio-response.test.js __tests__/story.audio-progress.test.js --runInBand
```

Expected: FAIL because the new coverage is not yet implemented.

- [ ] **Step 4: Commit the failing tests checkpoint**

```bash
git add backend/__tests__/story.audio-response.test.js backend/__tests__/story.audio-progress.test.js
git commit -m "test: lock audio backend contract"
```

### Task 2: Add audio-specific indexes and progress integrity constraints

**Files:**
- Create: `backend/migrations/30_audio_backend_performance_and_integrity.sql`
- Modify: `backend/models/story.model.js`

- [ ] **Step 1: Inspect existing indexes before writing the migration**

Run:

```powershell
rg -n "audio_parts|user_audio_progress|videos" backend/migrations backend/scripts
```

Expected: existing migrations show general performance work, but no dedicated audio performance-and-integrity migration for this route set.

- [ ] **Step 2: Write the additive migration**

Add a migration that:

- creates or enforces a unique key on `user_audio_progress (user_id, truyen_id)`
- adds a composite index for playlist reads on `audio_parts`
- adds any supporting index needed for the `videos` join or `audio_parts` ownership lookup

Use guarded SQL where possible so the migration stays deploy-safe.

- [ ] **Step 3: Add or confirm the model method assumptions that rely on the new uniqueness**

Document through code comments or function naming that progress persistence now depends on one canonical row per user-story pair.

- [ ] **Step 4: Verify the migration file is discoverable and readable**

Run:

```powershell
Get-Content backend/migrations/30_audio_backend_performance_and_integrity.sql
```

Expected: the migration contains only additive schema changes and no destructive statements.

- [ ] **Step 5: Commit the migration**

```bash
git add backend/migrations/30_audio_backend_performance_and_integrity.sql backend/models/story.model.js
git commit -m "feat: add audio backend indexes and integrity rules"
```

### Task 3: Extract audio response orchestration into a dedicated service

**Files:**
- Create: `backend/services/storyAudio.service.js`
- Modify: `backend/controllers/story.controller.js`
- Modify: `backend/models/story.model.js`

- [ ] **Step 1: Create a dedicated audio service module**

Move the following responsibilities into `backend/services/storyAudio.service.js`:

- build story meta
- build playlist
- clone cached payloads safely
- hydrate user progress
- expose `getStoryAudioResponseByStory()` or equivalent orchestration

- [ ] **Step 2: Add narrow audio lookup methods in the story model**

Introduce model methods such as:

```js
getAudioStoryById(id)
getAudioStoryBySlug(slug)
getAudioPartsByStoryId(storyId)
getAudioProgressByUserAndStory(userId, storyId)
```

If an existing method already fits, keep it and only narrow the selected columns where useful.

- [ ] **Step 3: Thin the controller down to request handling**

Refactor `getStoryAudioById` and `getStoryAudioBySlug` so they:

- resolve request params
- call the audio service
- map `not found` to `404`
- return the assembled payload

- [ ] **Step 4: Re-run the read-path tests**

Run:

```powershell
npx jest __tests__/story.audio-response.test.js --runInBand
```

Expected: PASS with the same response shape as before.

- [ ] **Step 5: Commit the service extraction**

```bash
git add backend/services/storyAudio.service.js backend/controllers/story.controller.js backend/models/story.model.js backend/__tests__/story.audio-response.test.js
git commit -m "refactor: extract audio response service"
```

### Task 4: Harden audio progress persistence and reduce write round trips

**Files:**
- Modify: `backend/models/story.model.js`
- Modify: `backend/controllers/story.controller.js`
- Modify: `backend/__tests__/story.audio-progress.test.js`

- [ ] **Step 1: Replace update-then-insert progress persistence with a single canonical write path**

Implement an upsert-style method such as:

```js
saveAudioProgress(userId, storyId, lastPartId)
```

using the new unique constraint on `(user_id, truyen_id)`.

- [ ] **Step 2: Keep ownership validation explicit**

Preserve the guard that ensures `last_part_id` belongs to the requested `storyId`. This must happen before persistence.

- [ ] **Step 3: Short-circuit invalid inputs before any DB write**

Ensure the controller rejects:

- missing auth
- non-numeric `storyId`
- non-numeric `last_part_id`

before touching persistence methods.

- [ ] **Step 4: Re-run the progress tests**

Run:

```powershell
npx jest __tests__/story.audio-progress.test.js --runInBand
```

Expected: PASS for valid saves and rejection paths.

- [ ] **Step 5: Commit the progress hardening**

```bash
git add backend/models/story.model.js backend/controllers/story.controller.js backend/__tests__/story.audio-progress.test.js
git commit -m "fix: harden audio progress persistence"
```

### Task 5: Tighten audio cache behavior without changing the API

**Files:**
- Modify: `backend/utils/cache.js`
- Modify: `backend/controllers/story.controller.js`
- Modify: `backend/services/storyAudio.service.js`

- [ ] **Step 1: Centralize audio cache key creation**

Keep audio cache keys in one place and ensure the service uses only exact audio meta and playlist keys.

- [ ] **Step 2: Add narrow invalidation helpers**

Avoid broad `KEYS` scans for common audio invalidation paths. Prefer exact-key or tightly-scoped prefix invalidation helpers that can be called intentionally.

- [ ] **Step 3: Verify cached payloads are not mutated across requests**

Retain safe cloning around cached objects so one request cannot leak mutations into the next one.

- [ ] **Step 4: Run the audio read tests again**

Run:

```powershell
npx jest __tests__/story.audio-response.test.js --runInBand
```

Expected: PASS, with cache-related expectations updated to the new helper boundaries if needed.

- [ ] **Step 5: Commit the cache tightening**

```bash
git add backend/utils/cache.js backend/controllers/story.controller.js backend/services/storyAudio.service.js backend/__tests__/story.audio-response.test.js
git commit -m "perf: tighten audio cache handling"
```

### Task 6: Verify the backend end-to-end and prepare the frontend phase

**Files:**
- Modify: `backend/__tests__/story.audio-response.test.js`
- Modify: `backend/__tests__/story.audio-progress.test.js`
- Optional follow-up modify: `frontend/src/modules/storyAudio/storyAudio.service.ts`

- [ ] **Step 1: Run the focused backend audio test suite**

Run:

```powershell
npx jest __tests__/story.audio-response.test.js __tests__/story.audio-progress.test.js --runInBand
```

Expected: PASS.

- [ ] **Step 2: Run the broader backend test suite**

Run:

```powershell
npm test -- --runInBand
```

Expected: PASS, or any unrelated failures are documented before continuing.

- [ ] **Step 3: Smoke-test the live route behavior locally**

Verify manually:

- `GET /api/truyen/slug/:slug/audio`
- `GET /api/truyen/:id/audio`
- `POST /api/truyen/:id/audio-progress`

Check that the payload shape remains backward-compatible.

- [ ] **Step 4: Confirm the frontend client does not require contract changes**

Review:

```powershell
Get-Content frontend/src/modules/storyAudio/storyAudio.service.ts
```

Expected: existing types remain compatible; only optional-field additions are acceptable in this phase.

- [ ] **Step 5: Commit the verification checkpoint**

```bash
git add backend/__tests__/story.audio-response.test.js backend/__tests__/story.audio-progress.test.js frontend/src/modules/storyAudio/storyAudio.service.ts
git commit -m "test: verify audio backend optimization rollout"
```

### Task 7: Start the frontend optimization phase only after backend stability is confirmed

**Files:**
- Follow-up plan: `docs/superpowers/plans/2026-03-24-audio-frontend-performance.md`

- [ ] **Step 1: Measure the frontend against the optimized backend**
- [ ] **Step 2: Identify audio-detail overfetching, stale state, and resume UX friction**
- [ ] **Step 3: Write a separate frontend-only plan instead of mixing concerns into this backend rollout**

This plan intentionally stops after backend verification so frontend work begins from a stable API baseline.
