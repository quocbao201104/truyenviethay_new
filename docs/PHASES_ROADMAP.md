# Kế hoạch tối ưu – chia phase

## Chạy migrations

**Phase 1:**
```bash
node backend/scripts/dedup_before_unique.js
node backend/scripts/run_migration_21.js
```

**Phase 3:**
```bash
node backend/scripts/run_migration_22.js
```

**Phase 5 — Chạy reconcile thủ công (tùy chọn):**
```bash
node backend/scripts/run_reconcile_aggregates.js
```

---

## Phase 1: Data integrity + critical fixes

- [x] Migration 21: unique `ratings(user_id, truyen_id)` và `theo_doi(user_id, truyen_id)` + indexes
- [x] Script dedup: dọn duplicate trước khi chạy migration
- [x] Transaction: follow toggle/add/remove
- [x] Transaction: rating upsert
- [x] Fix bug `lastUpdate` trong follow list (dùng `thoi_gian_cap_nhat` thay `chuong_moi_nhat_so_chuong`)

## Phase 2: Anti-spam / rate limit

- [x] Limiter: `POST /api/comments` — 10/min per user
- [x] Limiter: `POST /api/ratings` — cooldown 15s per (user, truyen_id)
- [x] Limiter: `POST /api/follow/:truyenId` — debounce 3s per (user, truyen_id)
- [x] (Optional) Chặn duplicate comment ngắn hạn (content hash 30–60s) -- *Lưu ý: Đã tích hợp một phần qua rate-limiter, có thể bổ sung redis hash nếu cần chặt hơn.*

## Phase 3: Comment soft delete + moderation

- [x] Migration 22: `deleted_at`, `deleted_by`, `delete_reason` cho comments
- [x] Chính sách hiển thị: reply bị xóa hiện tombstone (như comment cha)
- [x] Remove comment truy ngược `truyen_id` ở backend (không phụ thuộc client)

## Phase 4: Permission / moderation basic

- [x] User tự xóa comment của mình (15 phút hoặc chưa có reply)
- [x] Author moderate comment trên truyện của họ (soft delete)
- [x] Phân quyền: admin | author | chủ comment (theo điều kiện)
- [x] Bật validator comment / rating / follow

## Phase 5: Aggregate reconcile

- [x] Job reconcile: `luot_theo_doi = COUNT(*) FROM theo_doi` (chạy 02:00 hàng ngày)
- [x] Job reconcile: `rating/rating_count/hot_score` recompute từ bảng `ratings`
- [x] Invalidate cache `topRated` ngay sau khi có rating update

## Phase 6: API consistency

- [x] Comments: `{ data, pagination, total }` thay vì list trần
- [x] Chuẩn hóa error codes `400/403/404/429` (comment, rating, follow)
- [x] Follow list: `{ data, pagination, total }` chuẩn
- [x] Đồng bộ Frontend: `StoryDetailView.vue`, `CommentList.vue`, `favorite.service.ts` đều đã sử dụng các API chuẩn hóa này.
