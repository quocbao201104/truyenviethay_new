# Audio List Premium Editorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/truyen-audio` into a premium editorial-style audio landing page with a branded hero, richer audio metadata, upgraded cards, and a calmer filter panel.

**Architecture:** Keep the existing `/truyen-audio` route, query params, and filter behavior. Add one narrow public-story payload enrichment for audio-only UI fields, then rebuild the page composition in the existing Vue route and components so the work stays scoped to the audio list experience rather than touching unrelated story flows.

**Tech Stack:** Vue 3, TypeScript, Vite, Express, MySQL

---

### Task 1: Enrich public audio stories with premium-list metadata

**Files:**
- Modify: `backend/models/story.model.js`
- Modify: `frontend/src/modules/storyText/story.service.ts`

- [ ] **Step 1: Extend the public story query with optional audio summary fields**

Add a narrow audio summary join to the public story query so list cards can render audio-first metadata without fetching detail payloads per card.

```js
LEFT JOIN (
  SELECT
    ap.truyen_id,
    COUNT(*) AS audio_total_parts,
    COALESCE(SUM(ap.duration_seconds), 0) AS audio_total_duration_seconds,
    MAX(ap.created_at) AS audio_latest_part_at
  FROM audio_parts ap
  GROUP BY ap.truyen_id
) audio_meta ON audio_meta.truyen_id = tn.id
LEFT JOIN partners p ON p.id = tn.source_partner_id
```

Select these optional fields:

```js
audio_meta.audio_total_parts,
audio_meta.audio_total_duration_seconds,
audio_meta.audio_latest_part_at,
p.name AS source_partner_name,
p.youtube_url AS source_partner_url
```

- [ ] **Step 2: Thread the new optional fields into the shared `Story` type**

Add the optional properties used by the premium audio list:

```ts
audio_total_parts?: number;
audio_total_duration_seconds?: number;
audio_latest_part_at?: string | null;
source_partner_name?: string | null;
source_partner_url?: string | null;
```

- [ ] **Step 3: Sanity-check that existing public-story consumers tolerate the extra fields**

Run:

```powershell
rg -n "Story } from \"@/modules/storyText/story.service\"" "frontend/src"
```

Expected: existing consumers only read known fields, so adding optional properties does not require further code changes.

- [ ] **Step 4: Commit the payload enrichment**

```bash
git add backend/models/story.model.js frontend/src/modules/storyText/story.service.ts
git commit -m "feat: enrich audio story list metadata"
```

### Task 2: Add the premium editorial hero and page-level composition

**Files:**
- Modify: `frontend/src/modules/storyAudio/views/StoryAudioView.vue`

- [ ] **Step 1: Add computed hero data and page stats**

Derive a featured story and compact page stats from the existing list response:

```ts
const featuredStory = computed(() => stories.value[0] || null);

const heroStats = computed(() => [
  { label: "Tac pham", value: pagination.value.total || stories.value.length },
  {
    label: "Moi cap nhat",
    value: stories.value.filter((story) => !!story.audio_latest_part_at).length,
  },
  {
    label: "Tong tap",
    value: stories.value.reduce(
      (sum, story) => sum + Number(story.audio_total_parts || 0),
      0,
    ),
  },
]);
```

- [ ] **Step 2: Add an active-filter summary above the grid**

Render a lightweight summary so the page feels editorial rather than form-driven:

```ts
const activeFilterChips = computed(() => {
  const chips: string[] = [];
  if (filters.value.trang_thai) chips.push(filters.value.trang_thai);
  if (filters.value.genre_ids.length) chips.push(`${filters.value.genre_ids.length} the loai`);
  if (filters.value.sort_by !== "thoi_gian_cap_nhat") chips.push(filters.value.sort_by);
  return chips;
});
```

- [ ] **Step 3: Replace the current top toolbar with the premium hero layout**

Build the new structure in the template:

```vue
<section class="audio-hero" v-if="featuredStory">
  <div class="audio-hero__copy">...</div>
  <div class="audio-hero__feature">
    <AudioHCard :story="featuredStory" variant="hero" />
  </div>
  <div class="audio-hero__stats">...</div>
</section>
```

Then keep the existing grid, drawer, loading state, error state, empty state, and pagination below the hero.

- [ ] **Step 4: Add the page-level premium styling**

Add scoped CSS variables and sections for:

```css
.audio-home-page { --audio-accent: #62d6c2; --audio-gold: #d8b36a; }
.audio-hero { ... }
.audio-hero__stats { ... }
.active-filters { ... }
.story-grid { ... }
```

Keep desktop, tablet, and mobile layouts aligned with the approved spec.

- [ ] **Step 5: Commit the page composition update**

```bash
git add frontend/src/modules/storyAudio/views/StoryAudioView.vue
git commit -m "feat: add premium audio landing hero"
```

### Task 3: Rebuild `AudioHCard` as an editorial audio card

**Files:**
- Modify: `frontend/src/modules/storyAudio/components/AudioHCard.vue`

- [ ] **Step 1: Rework the card template around audio-first hierarchy**

Replace the current footer-heavy card with an editorial layout that prioritizes title, audio metadata, and the listening CTA:

```vue
<div class="hcard__eyebrow">
  <span class="hcard__badge">Audio</span>
  <span class="hcard__status">{{ statusLabel }}</span>
</div>

<div class="hcard__audio-meta">
  <span v-if="audioParts"><i class="fas fa-list-ul"></i> {{ audioParts }} phan</span>
  <span v-if="audioDurationLabel"><i class="far fa-clock"></i> {{ audioDurationLabel }}</span>
  <a v-if="partnerUrl" :href="partnerUrl" target="_blank" rel="noopener noreferrer">
    {{ partnerName }}
  </a>
</div>
```

- [ ] **Step 2: Add computed fallbacks for the new metadata**

Use the new optional fields without breaking older rows:

```ts
const audioParts = computed(() => Number(props.story.audio_total_parts || 0));
const audioDurationLabel = computed(() => formatDuration(props.story.audio_total_duration_seconds));
const partnerName = computed(() => props.story.source_partner_name || "");
const partnerUrl = computed(() => props.story.source_partner_url || "");
```

Keep graceful fallback behavior when these values are missing.

- [ ] **Step 3: Simplify actions to one primary CTA plus one secondary action**

Use:

```vue
<router-link class="listen-btn" ...>Nghe ngay</router-link>
<router-link class="detail-btn" ...>Chi tiet</router-link>
```

Remove the current cluster of equally weighted stats and button treatments.

- [ ] **Step 4: Restyle the card for the premium editorial tone**

Update the card CSS to use:

```css
.hcard { background: linear-gradient(...); border-radius: 24px; }
.hcard__badge { ... }
.hcard__audio-meta { ... }
.listen-btn { ... }
.detail-btn { ... }
```

Keep the motion restrained: slight lift, soft cover zoom, subtle button glow.

- [ ] **Step 5: Commit the card redesign**

```bash
git add frontend/src/modules/storyAudio/components/AudioHCard.vue
git commit -m "feat: redesign audio list cards"
```

### Task 4: Restyle the audio filter panel to match the premium page

**Files:**
- Modify: `frontend/src/modules/storyAudio/components/AudioSidebarFilter.vue`

- [ ] **Step 1: Add a calmer premium panel heading and section framing**

Update the template to introduce a softer subtitle and cleaner grouping:

```vue
<div class="sidebar-intro">
  <span class="sidebar-kicker">Tuy chon tuyen truyen</span>
  <p class="sidebar-subtitle">Loc nhanh kho audio theo the loai, tinh trang, va cach sap xep.</p>
</div>
```

- [ ] **Step 2: Simplify the chip and pill styling**

Adjust the CSS so the filter controls feel lighter and less “admin panel”:

```css
.genre-chip { border-radius: 14px; background: rgba(...); }
.genre-chip.active { box-shadow: inset 0 0 0 1px rgba(...); }
.pill-btn.active { border-left: 0; background: linear-gradient(...); }
```

- [ ] **Step 3: Keep the existing emit/update logic unchanged**

Do not change the current filter behavior:

```ts
emit("update", {
  sort_by: localSort.value,
  trang_thai: localStatus.value,
  genre_ids: [...selectedGenres.value],
});
```

This task is visual only.

- [ ] **Step 4: Commit the filter restyle**

```bash
git add frontend/src/modules/storyAudio/components/AudioSidebarFilter.vue
git commit -m "feat: restyle audio filters"
```

### Task 5: Verify the redesign end-to-end

**Files:**
- Verify: `frontend/src/modules/storyAudio/views/StoryAudioView.vue`
- Verify: `frontend/src/modules/storyAudio/components/AudioHCard.vue`
- Verify: `frontend/src/modules/storyAudio/components/AudioSidebarFilter.vue`
- Verify: `frontend/src/modules/storyText/story.service.ts`
- Verify: `backend/models/story.model.js`

- [ ] **Step 1: Run the frontend build**

Run:

```powershell
cd frontend
npm.cmd run build
```

Expected: Vite build completes successfully.

- [ ] **Step 2: Sanity-check responsive behavior in the implemented CSS**

Verify these selectors exist and are coherent:

```powershell
rg -n "@media|audio-hero|hcard__audio-meta|sidebar-intro" frontend/src/modules/storyAudio
```

Expected: desktop/tablet/mobile rules are present for the premium hero, card, and sidebar states.

- [ ] **Step 3: Manual QA checklist**

Confirm:

- featured hero renders when stories exist
- hero degrades cleanly when the first story has missing optional audio metadata
- cards hide missing duration/channel fields without leaving awkward gaps
- filter drawer still opens and closes on mobile
- pagination still works

- [ ] **Step 4: Commit the verified redesign**

```bash
git add backend/models/story.model.js frontend/src/modules/storyText/story.service.ts frontend/src/modules/storyAudio/views/StoryAudioView.vue frontend/src/modules/storyAudio/components/AudioHCard.vue frontend/src/modules/storyAudio/components/AudioSidebarFilter.vue
git commit -m "feat: redesign audio list with premium editorial layout"
```
