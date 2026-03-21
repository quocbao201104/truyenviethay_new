# Audio Detail Copyright Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the story description from `truyen_new` on the audio detail page and add a linked copyright line for the crawled channel under the intro section.

**Architecture:** Extend the audio story API response with partner metadata resolved from `source_partner_id`, then render that metadata in the audio detail intro card. Keep the change narrow by reusing the existing `story.mo_ta` field and only adding one small copyright object for the frontend.

**Tech Stack:** Node.js, Express, MySQL, Vue 3, TypeScript, Jest, Vite

---

### Task 1: Lock the API response with a failing test

**Files:**
- Create: `backend/__tests__/story.audio-response.test.js`
- Test: `backend/controllers/story.controller.js`

- [ ] **Step 1: Write the failing test for audio detail payload**
- [ ] **Step 2: Run the test to verify it fails**
- [ ] **Step 3: Implement the minimal backend change**
- [ ] **Step 4: Re-run the test to verify it passes**

### Task 2: Return crawled channel metadata from the backend

**Files:**
- Modify: `backend/models/story.model.js`
- Modify: `backend/controllers/story.controller.js`

- [ ] **Step 1: Add a partner lookup by `source_partner_id`**
- [ ] **Step 2: Include a copyright object in the audio story payload**
- [ ] **Step 3: Preserve the original `mo_ta` from `truyen_new`**

### Task 3: Render the intro + copyright line in the audio page

**Files:**
- Modify: `frontend/src/modules/storyAudio/storyAudio.service.ts`
- Modify: `frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue`

- [ ] **Step 1: Update frontend audio response typing**
- [ ] **Step 2: Render the linked channel line under the intro text**
- [ ] **Step 3: Verify the frontend still builds**
