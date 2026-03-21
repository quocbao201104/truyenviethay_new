# Audio Detail Listening Stage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/truyen-audio/:slug` into an audio-first listening stage centered on cover, title, mood, and integrated playback controls while preserving the existing playback and resume logic.

**Architecture:** Keep the current audio detail data flow, playlist clustering, and progress persistence unchanged. Recompose the route into a premium stage layout inside the existing Vue view, moving the player into the hero composition, reframing introduction/copyright as editorial content, and softening the playlist so it supports the listening stage instead of competing with it.

**Tech Stack:** Vue 3, TypeScript, Vite

---

### Task 1: Add computed presentation helpers for the listening stage

**Files:**
- Modify: `frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue`

- [ ] **Step 1: Add hero-oriented computed metadata**

Create lightweight computed helpers so the new layout can read cleanly without changing the underlying playback logic:

```ts
const heroMoodText = computed(() => { ... });
const sourceAttribution = computed(() => copyrightHolder.value?.name || "");
const currentCluster = computed(() => { ... });
const stageStats = computed(() => [
  { label: "So phan", value: flatParts.value.length },
  { label: "Thoi luong", value: formatDuration(audioPayload.value?.audio.total_duration_seconds) },
  { label: "Kenh", value: sourceAttribution.value || "Dang cap nhat" },
]);
```

- [ ] **Step 2: Add a listening-context helper for the current part**

Expose the current playback context for use in the hero player block:

```ts
const currentPlaybackContext = computed(() => ({
  title: currentPartTitle.value,
  duration: currentPart.value ? formatPartDuration(currentPart.value.duration) : "dang cap nhat",
  cluster: currentCluster.value?.label || "Chua chon cum",
}));
```

- [ ] **Step 3: Keep playback/resume logic untouched**

Do not modify these functions except where template wiring requires them:

```ts
togglePlayback
playAdjacentPart
selectPart
handlePause
handleEnded
saveLocalResume
saveRemoteResume
```

- [ ] **Step 4: Commit the new presentation helpers**

```bash
git add frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue
git commit -m "feat: add listening stage presentation helpers"
```

### Task 2: Recompose the hero into a listening stage

**Files:**
- Modify: `frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue`

- [ ] **Step 1: Replace the current top hero grid with a three-zone stage**

Restructure the template so the first screen becomes:

```vue
<section class="stage-shell">
  <div class="stage-cover">...</div>
  <div class="stage-center">...</div>
  <aside class="stage-queue">...</aside>
</section>
```

Zones:
- cover presentation
- title + mood + metadata + integrated player
- playlist summary / queue

- [ ] **Step 2: Move the player block into the center stage**

Bring the browser audio element into the hero composition instead of leaving it in a separate lower card:

```vue
<div class="stage-player">
  <div class="stage-player__header">...</div>
  <audio ... />
</div>
```

Keep the existing event handlers and refs exactly as-is.

- [ ] **Step 3: Add the stronger title/mood block**

Add:

```vue
<span class="stage-kicker">Listening Stage</span>
<h1>{{ audioPayload.story.ten_truyen }}</h1>
<p class="stage-mood">{{ heroMoodText }}</p>
```

Author, status, source, and story stats should become supporting metadata under the title rather than the primary visual focus.

- [ ] **Step 4: Add premium stage styling**

Introduce scoped CSS for the new hero composition:

```css
.stage-shell { ... }
.stage-cover { ... }
.stage-center { ... }
.stage-player { ... }
.stage-kicker { ... }
.stage-stats { ... }
```

Match the premium palette already used on `/truyen-audio`.

- [ ] **Step 5: Commit the stage composition**

```bash
git add frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue
git commit -m "feat: redesign audio detail hero as listening stage"
```

### Task 3: Reframe introduction and copyright as editorial notes

**Files:**
- Modify: `frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue`

- [ ] **Step 1: Move introduction below the stage as an editorial block**

Replace the current utility-like intro card with an editorial section:

```vue
<section class="editorial-notes">
  <div class="editorial-notes__intro">...</div>
  <div class="editorial-notes__attribution">...</div>
</section>
```

- [ ] **Step 2: Preserve the current copyright link behavior**

Keep:

```ts
copyrightHolder
handleCopyrightClick
```

Render them in a calmer attribution style instead of a default paragraph.

- [ ] **Step 3: Improve description fallback tone**

Adjust only the presentation/fallback copy if necessary:

```ts
const cleanDescription = computed(() => {
  const desc = audioPayload.value?.story.mo_ta?.trim();
  return desc || "Tac pham nay dang duoc gioi thieu theo huong gon, de nguoi nghe vao truyen nhanh hon.";
});
```

Do not introduce backend changes here.

- [ ] **Step 4: Commit the editorial notes block**

```bash
git add frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue
git commit -m "feat: restyle audio detail editorial notes"
```

### Task 4: Restyle the playlist into a refined listening queue

**Files:**
- Modify: `frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue`

- [ ] **Step 1: Keep the cluster/part structure but soften the visual treatment**

Do not alter clustering logic:

```ts
playlistClusters
toggleCluster
currentClusterKey
```

Only change the markup/styling to feel more like a track list than an accordion-heavy admin block.

- [ ] **Step 2: Promote the current listening context inside the queue**

Add a compact queue header such as:

```vue
<div class="queue-summary">
  <span class="panel-label">Danh sach phat</span>
  <h3>{{ playlistClusters.length }} cum tap</h3>
  <p>{{ currentPlaybackContext.title }}</p>
</div>
```

- [ ] **Step 3: Restyle part rows and active state**

Use CSS updates like:

```css
.playlist-group__header { ... }
.playlist-items { ... }
.part-item.active { ... }
.queue-summary { ... }
```

The current playing item should stay obvious without becoming visually loud.

- [ ] **Step 4: Commit the queue redesign**

```bash
git add frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue
git commit -m "feat: restyle audio detail queue"
```

### Task 5: Verify the redesigned audio detail page

**Files:**
- Verify: `frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue`

- [ ] **Step 1: Run the frontend build**

Run:

```powershell
cd frontend
npm.cmd run build
```

Expected: Vite build completes successfully.

- [ ] **Step 2: Verify the new responsive selectors exist**

Run:

```powershell
rg -n "@media|stage-shell|stage-player|editorial-notes|queue-summary" frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue
```

Expected: desktop/tablet/mobile rules exist for the listening stage, editorial notes, and queue.

- [ ] **Step 3: Manual QA checklist**

Confirm:

- cover, title, and mood dominate the first screen
- player still plays, pauses, and seeks correctly
- next/previous controls still work
- resume state still restores as before
- playlist groups still expand/collapse correctly
- copyright link still opens the source channel

- [ ] **Step 4: Commit the verified redesign**

```bash
git add frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue
git commit -m "feat: redesign audio detail as listening stage"
```
