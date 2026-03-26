# Audio Backend Performance and Safety Design

**Goal:** Optimize the audio backend for faster response times, lower database pressure, and safer progress persistence while keeping the current public API contract unchanged unless a change becomes strictly necessary.

**Primary Engineering Direction:** Query-first optimization with narrow service extraction

**Success Criteria:**
- `GET /api/truyen/slug/:slug/audio` and `GET /api/truyen/:id/audio` become faster and more predictable under repeated traffic.
- The hottest audio queries use targeted indexes instead of broad scans and repeated sorting work.
- Audio progress writes avoid duplicate-row races, invalid-part writes, and unnecessary round trips.
- Cache behavior becomes narrower and safer, especially around invalidation.
- Existing frontend audio screens continue to work without required payload-breaking changes.

## Current Backend Shape

The current audio backend is concentrated in [`backend/controllers/story.controller.js`](C:\Users\Admin\Downloads\web\truyenviethay_new\backend\controllers\story.controller.js) and [`backend/models/story.model.js`](C:\Users\Admin\Downloads\web\truyenviethay_new\backend\models\story.model.js).

Current flow:

- controller resolves story by slug or id
- controller builds story meta and playlist separately
- playlist is assembled from `audio_parts` joined to `videos`
- user progress is loaded separately and merged into the payload
- Redis caches audio `meta` and `playlist`
- progress writes validate story, validate part ownership, then update-or-insert `user_audio_progress`

This shape works, but it leaves several performance and integrity gaps.

## Main Risks in the Current Implementation

### 1. Hot audio playlist query is doing too much work

`getAudioPartsByStoryId()` is the hottest audio read path. It joins `audio_parts` and `videos`, then sorts by:

- `COALESCE(v.video_index, 2147483647)`
- `ap.part_number`
- `ap.id`

Without matching indexes and with the sort depending on joined data, the query can become expensive as the audio catalog grows.

### 2. Progress writes are safe enough functionally, but not optimal under load

`saveAudioProgress()` currently:

- checks auth
- loads story
- loads audio part ownership
- updates `user_audio_progress`
- inserts when no row exists
- reloads progress

This costs extra round trips and can still allow a small race if two first-time writes happen close together without a strong uniqueness rule.

### 3. Cache invalidation is broader and more fragile than needed

[`backend/utils/cache.js`](C:\Users\Admin\Downloads\web\truyenviethay_new\backend\utils\cache.js) invalidates via `KEYS` pattern scans. That is manageable at small scale, but it becomes risky as Redis key volume grows. Audio keys should be invalidated narrowly and intentionally.

### 4. Audio payload assembly is controller-heavy

The controller currently owns too much orchestration:

- story lookup
- meta assembly
- playlist assembly
- progress merge
- cache coordination

That makes optimization and testing harder than necessary.

### 5. Audio readiness is implicit instead of enforced

The payload currently tolerates partial states such as:

- part has no `audio_url` but may still be included through fallback handling
- rows can be returned regardless of playback readiness metadata
- progress can point to technically valid but not actually playable data if guardrails are weak

The backend should stay tolerant, but it should define a clear playable contract.

## Proposed Design

### Architecture

Keep the existing routes and response shape, but move audio-specific orchestration into a dedicated backend service layer. The optimized flow becomes:

1. Resolve a minimal audio-ready story record by slug or id
2. Build or fetch cached audio meta
3. Build or fetch cached playlist
4. Resolve user progress only when authenticated
5. Return the same response shape as today

This keeps the API stable while making reads, writes, and tests easier to reason about.

### Backend Units

#### Audio story lookup

Introduce a narrow model path for audio detail lookups that selects only the story fields required by audio detail payloads:

- `id`
- `slug`
- `ten_truyen`
- `tac_gia`
- `anh_bia`
- `mo_ta`
- `has_audio`
- `audio_status`
- `source_type`
- `source_partner_id`

This avoids carrying unrelated story detail fields through the audio route.

#### Audio assembly service

Create a dedicated audio service module responsible for:

- building story meta
- building playlist
- hydrating progress
- cloning cached payloads safely
- exposing one `getStoryAudioResponse()` orchestration function

The controller stays thin and keeps route behavior unchanged.

#### Audio progress persistence

Change progress persistence to a stronger integrity model:

- validate `storyId` and `lastPartId`
- validate that the part belongs to the story
- use a unique key on `(user_id, truyen_id)` if missing
- replace update-then-insert with a single upsert-style write
- reload the canonical progress row once after the write

This cuts write complexity and reduces race risk.

## Database Optimization Plan

### Indexes and integrity rules

Add a dedicated migration for audio backend performance and integrity. The migration should cover:

- `audio_parts (truyen_id, video_id, part_number, id)`
- `videos (id, video_index)` or a supporting index appropriate to the existing schema
- `user_audio_progress (user_id, truyen_id)` as a unique index if not already enforced
- any supporting lookup index needed for `audio_parts.id + truyen_id` validation

The exact SQL should be chosen after confirming current indexes, but the migration must be additive and backward-compatible.

### Query shaping

The playlist query should continue returning the same payload fields, but it should be reviewed for:

- removing unnecessary selected columns
- ensuring the sort path matches available indexes as closely as possible
- avoiding hidden scan-heavy behavior

If the joined sort on `videos.video_index` remains the main bottleneck, the preferred next step is to keep the query stable first, then consider a targeted denormalized ordering column only if measurement proves it necessary.

## Cache Strategy

### Keep

- separate cache entries for audio meta and audio playlist
- short TTL for meta
- longer TTL for playlist

### Improve

- avoid broad pattern invalidation for audio cache paths
- centralize audio cache key creation in one place
- invalidate exact audio keys when story audio data changes
- keep cached payload objects immutable from request to request

### Do not change in this phase

- route-level API signatures
- frontend cache contract
- CDN domain strategy for actual MP3 delivery

## Safety and Integrity Rules

The backend should enforce these rules consistently:

- reject progress writes when `storyId` or `lastPartId` is invalid
- reject progress writes when the part does not belong to the story
- only expose audio parts that are actually playable through `audio_url` or a valid `r2_key` fallback
- preserve optional partner metadata and story description
- return stable nulls instead of partial malformed objects

This is the main “no loopholes” part of the redesign: tolerate missing optional metadata, but never silently accept cross-story progress writes or malformed playlist items.

## Testing Strategy

### Backend tests

Extend or add Jest coverage for:

- audio detail response by slug
- audio detail response by id
- partner metadata and description preservation
- playlist fallback to `r2_key`
- progress save with valid part/story pair
- progress save rejection for cross-story part ids
- progress save rejection for bad ids
- cache key usage for meta and playlist

### Verification

Before rollout:

- run focused Jest audio tests
- run the broader backend Jest suite
- verify migration safety on local or staging data
- smoke test both audio detail routes and progress persistence manually

## Rollout Strategy

### Phase 1: Backend hardening

- add tests first
- add migration and integrity constraints
- extract audio service
- optimize query and cache handling
- verify existing audio frontend still works without payload changes

### Phase 2: Frontend follow-up

Once backend behavior is stable, move to frontend optimization for:

- perceived loading speed
- resume behavior polish
- request dedupe and stale state handling
- reduced over-fetching of audio detail routes

Frontend is intentionally deferred until backend response behavior is stable.

## Out of Scope

For this pass, do not:

- redesign frontend audio UI
- change route names
- introduce a new streaming service
- rewrite ingestion pipelines
- add personalization, recommendations, or analytics features

## Recommended Rollout

Implement this as a backend-first optimization pass with strict backward compatibility. Start with tests and database integrity, then extract the audio orchestration into a dedicated service, then tighten cache invalidation and progress writes. Once those changes are verified, move to a separate frontend optimization pass using the now-stable backend contract.
