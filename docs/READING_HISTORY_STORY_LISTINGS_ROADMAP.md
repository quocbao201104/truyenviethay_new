# Reading History + Story Listings – Roadmap Triển Khai

> Dựa trên findings từ Codex và đánh giá chi tiết. Ưu tiên: **contract & integrity** → **API stabilization** → **performance** → **hygiene & ops**.

---

## Tổng quan vấn đề

- **Contract mơ hồ**: bookmark / follow / last-read chưa tách rõ; frontend không biết "tiếp tục đọc" lấy từ đâu.
- **Response shape không thống nhất**: `getPublicStories` trả `{data, pagination}`, `getHotStories`/`getTopMonthlyStories` trả raw array, history trả `{history, total_pages, current_page}`.
- **Bottleneck dữ liệu**: history write SELECT→INSERT/UPDATE không concurrency-safe; thiếu index phù hợp; cache chỉ partial (hot, top-monthly); latest-update/new uncached.

---

## Domain Model (chốt trước Phase 1)

| Bảng/Concept      | Nghĩa                                      | Ghi chú |
|-------------------|--------------------------------------------|---------|
| `theo_doi`        | Bookmark / follow – user quan tâm truyện   | Không nhét last-read vào đây |
| `reading_state`   | Vị trí đọc gần nhất (user, truyen)         | `last_read_chuong_id`, `last_read_at` – **bảng mới** |
| `lich_su_doc_new` | Log đọc từng chapter                       | Phục vụ history list + analytics |

**Lý do tách `reading_state` khỏi `theo_doi`:** User có thể đọc mà không follow; follow là ý định, last-read là hành vi.

---

## Phase 1 — Contract & Integrity (P0) ✅

| #  | Task | File(s) | Status |
|----|------|---------|--------|
| 1.1 | Chốt domain model, tạo bảng `reading_state(user_id, truyen_id, last_read_chuong_id, last_read_at)` | Migration 19 | Done |
| 1.2 | Backfill `reading_state` từ `lich_su_doc_new` (latest per user, truyen) | Migration 19 | Done |
| 1.3 | Sửa `saveReadingHistory` thành UPSERT concurrency-safe; unique `(user_id, truyen_id, chuong_id)` trên `lich_su_doc_new` | `history.services.js`, migration 19 | Done |
| 1.4 | Dịch vụ đọc/ghi `reading_state` khi save history | `history.services.js`, `readingState.model.js` | Done |
| 1.5 | Chuẩn hóa response `{data, pagination}` cho history; thêm `limit` param, bounds check | `history.services.js`, controller, frontend | Done |

**Acceptance:** Save history concurrent không duplicate; history trả envelope `{data, pagination}`; có canonical last-read per (user, truyen).

**Ghi chú:** Unique key `(user_id, truyen_id, chuong_id)` biến history thành “deduplicated read map” – mỗi chapter 1 row. Nếu cần event log thuần (re-read same chapter nhiều lần), cân nhắc tách `reading_events` và `reading_state`.

---

## Phase 2 — API Stabilization ✅

| #  | Task | File(s) | Status |
|----|------|---------|--------|
| 2.1 | Chuẩn hóa response envelope `{data, pagination}` cho `getHotStories`, `getTopMonthlyStories` | `story.model.js`, `story.controller.js`, frontend story.service | Done |
| 2.2 | Đồng bộ list response shape: public, hot, top-monthly, admin, follow, history dùng cùng `{data, pagination}` | `follow.service`, `follow.controller`, `favorite.store` | Done |
| 2.3 | Thêm `order_by` presets (`hot_score`, `thoi_gian_tao`, `luot_xem`), default limit 20 | `story.model.js` | Done |
| 2.4 | Bounds check `page`/`limit` (1–100) trên list endpoints | `story.model`, `follow.service` | Done |
| 2.5 | Expose `is_followed`, `last_read_chuong_id` trong story/detail/follow khi có userId | `story.controller`, `follow.service`, `optionalAuthenticateToken` | Done |

**Acceptance:** Tất cả list endpoints trả cùng envelope; frontend không cần adapter riêng từng endpoint.

---

## Phase 3 — Performance ✅

| #  | Task | File(s) | Status |
|----|------|---------|--------|
| 3.1 | FULLTEXT `(ten_truyen, tac_gia)` – migration 03 đã có; migration 20 thử bổ sung (skip nếu trùng) | Migration 03, 20 | Done |
| 3.2 | Composite index `(trang_thai_kiem_duyet, hot_score)`; idx 01/04 đã có status+updated, views, truyen_theloai | Migration 20 | Done |
| 3.3 | Cache getPublicStories khi không filter, page=1; invalidate khi story/chapter update/approval | `story.model.js`, `story.controller`, `chapter.services`, `up_story.controller` | Done |
| 3.4 | Index history `(user_id, truyen_id, thoi_gian_doc)` – migration 01 đã có `idx_history_user_story_time` | Verified | Done |

**Acceptance:** Hot/new/latest update có cache; search dùng FULLTEXT; EXPLAIN query chính dùng index.

**Lưu ý:** Index dựa trên EXPLAIN query thực tế, tránh thêm máy móc (write cost).

---

## Phase 4 — Hygiene & Operations ✅

| #  | Task | File(s) | Status |
|----|------|---------|--------|
| 4.1 | Cron cleanup: xóa lich_su_doc_new + reading_state orphans (truyện/chương đã xóa) | `jobs/cleanupHistoryOrphansCronjob.js` | Done |
| 4.2 | Cap 200 entries/user (HISTORY_CAP_PER_USER, 0=off) | `cleanupHistoryOrphansCronjob.js` | Done |
| 4.3 | Log cache hit/miss khi LOG_CACHE_HIT_MISS=1; slow-query dùng MySQL slow_query_log | `utils/cache.js`, `.env.example` | Done |

**Acceptance:** Orphan rows được dọn; history table không phình vô hạn; có visibility cơ bản.

---

## Test Matrix

### Phase 1
- [ ] `saveReadingHistory` concurrent (2 requests cùng user/story/chapter) → 1 row, không duplicate
- [ ] `getReadingHistory` trả `{data, pagination}` với `current_page`, `total_pages`, `total`
- [ ] History với `limit` param khác 18 hoạt động đúng
- [ ] `reading_state` được cập nhật khi save history; continue-reading trả đúng chapter

### Phase 2
- [ ] `getHotStories`, `getTopMonthlyStories` trả `{data, pagination}` (tương thích FE cũ nếu cần)
- [ ] Follow list trả cùng envelope
- [ ] `page=-1`, `limit=9999` → bounds check, không vượt max

### Phase 3
- [ ] Search với keyword → dùng FULLTEXT, response time chấp nhận được
- [ ] Hot/latest/new lists hit cache (kiểm tra log hoặc metrics)

---

## Migration Risk

| Rủi ro | Giảm thiểu |
|--------|------------|
| Backfill `reading_state` từ history lớn | Chạy batch theo user_id; có thể làm nền, không chặn deploy |
| FE đang kỳ vọng raw array từ hot/top-monthly | Response có thể wrap `data`; FE cũ vẫn dùng `result.data` nếu chưa migrate |
| Unique constraint lên `lich_su_doc_new` có thể conflict với data cũ | Dedupe trước migration; unique `(user_id, truyen_id, chuong_id)` |

---

## Count Query Cost

`COUNT(DISTINCT truyen_id)` hoặc `COUNT(*)` trên bảng lớn có thể đắt. Cân nhắc:

- Cache total nhẹ cho public lists (TTL ngắn)
- Hoặc approximate count cho một số list công khai
- Index covering count query nếu có thể

---

## Severity Reference

| Level | Ví dụ |
|-------|-------|
| P0 | History duplicate, race condition, không có canonical last-read |
| P1 | Response shape lệch, pagination hard-code, thiếu bounds check |
| P2 | Thiếu index, cache partial, FULLTEXT chưa dùng |
| P3 | Orphan cleanup, cap history, observability |
