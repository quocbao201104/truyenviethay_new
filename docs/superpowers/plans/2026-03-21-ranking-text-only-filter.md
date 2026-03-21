# Ranking Text-Only Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exclude audio-only stories and stories without approved text chapters from `Tân Tú Bảng` and `Lệnh Bài Bảng`.

**Architecture:** Add a targeted `require_text_chapters` filter to the public stories query for the `Tân Tú Bảng` feed, and tighten the top-rated query so `Lệnh Bài Bảng` only returns stories with at least one text chapter. Keep the change scoped to these two ranking sources instead of globally altering all public story lists.

**Tech Stack:** Node.js, Express, MySQL query builders, Jest

---

### Task 1: Add regression tests for ranking filters

**Files:**
- Create: `backend/__tests__/ranking.filters.test.js`
- Test: `backend/models/story.model.js`
- Test: `backend/models/rating.model.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal implementation**
- [ ] **Step 4: Run test to verify it passes**

### Task 2: Scope the new-story board filter to text stories

**Files:**
- Modify: `backend/controllers/story.controller.js`
- Modify: `backend/models/story.model.js`
- Modify: `frontend/src/modules/storyText/story.service.ts`
- Modify: `frontend/src/modules/storyText/story.store.ts`

- [ ] **Step 1: Thread `require_text_chapters` from the `Tân Tú Bảng` fetch to the backend public stories query**
- [ ] **Step 2: Add SQL conditions that require `so_luong_chuong > 0` when the flag is enabled**
- [ ] **Step 3: Keep cache keys aware of the new flag**
- [ ] **Step 4: Re-run focused tests**

### Task 3: Filter top-rated stories to text stories only

**Files:**
- Modify: `backend/models/rating.model.js`
- Test: `backend/__tests__/ranking.filters.test.js`

- [ ] **Step 1: Add `so_luong_chuong > 0` to the top-rated query and count query**
- [ ] **Step 2: Re-run focused tests**
