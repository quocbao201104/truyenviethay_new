# Gamification System – Roadmap Triển Khai

> Dựa trên findings từ Codex và đánh giá triển khai thực tế. Chia thành 5 phase, ưu tiên hotfix trước, refactor sau.

---

## Phase 1 — Hotfix (P0)

| # | Task | File(s) | Test |
|---|------|---------|------|
| 1A | Fix reward query schema: `r.name` → `r.reward_name`, `points_required` → `price` | `models/userReward.model.js` | Reward list/claim không SQL error |
| 1B | Fix double `createHistory` trong `addHistory` | `controllers/userLevelHistory.controller.js` | 1 request = 1 record |
| 1C | Fix task cache invalidation key: invalidate `tasks:${userId}:*` | `services/task.service.js` | Hoàn thành task → cache refresh đúng |

**Acceptance**: Sau Phase 1, listing/claim rewards, level history, task completion chạy đúng.

---

## Phase 2 — Contract Stabilization ✅

| # | Task | Status |
|---|------|--------|
| 2.1 | Thống nhất reward/status/source contract | Done: `constants/rewardContract.js` |
| 2.2 | Chuẩn hóa model = data access, service = business logic | Done: reward.model chỉ CRUD, logic → userReward.service |
| 2.3 | Ép claim đi qua 1 service path duy nhất | Done: claimRewardFromBody → claimRewardInstance |
| 2.4 | Transaction đầy đủ cho claim/grant/use | Done: useReward + claimRewardInstance |

---

## Phase 3 — Data Integrity ✅

| # | Task | Status |
|---|------|--------|
| 3.1 | Concurrency-safe bootstrap cho `ensureUserLevel` | Done: row lock (users_new FOR UPDATE) + double-check |
| 3.2 | Rà lại `expiry_date`, chốt rule business | Done: `docs/LEVEL_EXPIRY_CONTRACT.md` |
| 3.3 | Schema drift inventory/shop | Done: migration 16 – `reward_id` nullable |

---

## Phase 4 — Performance & Maintainability ✅

| # | Task | Status |
|---|------|--------|
| 4.1 | Thêm index theo query thực tế | Done: migration 17 – idx_user_inventory_user_shop |
| 4.2 | Task provisioning (idempotent) | Đã sẵn – getAllTasks cache callback, bỏ qua |
| 4.3 | Log/metric tối thiểu cho flow chính | Done: rollback log task, reward, level services |

---

## Phase 5 — Scheduler & Operations ✅

| # | Task | Status |
|---|------|--------|
| 5.1 | Cron expire rewards | Done: `jobs/expireRewardsCronjob.js` 01:00 hằng ngày |
| 5.2 | Admin gamification health | Done: GET `/api/admin/gamification/health` |

---

## Test Matrix (Phase 1)

- [x] Reward list: GET `/api/user-rewards/:userId` → 200, schema `reward_name` (không `name`)
- [x] Reward claim (insufficient level / invalid) → 400 với message rõ
- [x] Reward claim body (userRewardId thiếu) → 400
- [x] Level history: POST add 1 lần (admin) → 201
- [x] Task complete → GET tasks sau đó trả data mới (cache invalidate)

**Chạy test:** `cd backend && npm test` (cần DB + JWT_SECRET trong .env)

---

## Severity Reference

| Level | Ví dụ |
|-------|-------|
| P0 | Reward SQL mismatch, duplicate history, wrong cache invalidation |
| P1 | Reward service/model split, claim path bypass rules |
| P2 | Concurrency hardening, expiry enforcement |
| P3 | Observability, dashboards, analytics |
