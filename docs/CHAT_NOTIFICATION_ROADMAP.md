# Chat Realtime + Notification – Phased Roadmap

Kế hoạch sửa lỗi theo các phase ưu tiên, dựa trên kết quả quét hệ thống.

---

## Phase 1: Security + Presence Correctness ✅
**Ưu tiên: Cao | Phụ thuộc: Không**

- [x] Verify JWT tại socket handshake; lấy `userId` từ token, không dùng `query.userId`.
- [x] Sửa world presence emit dùng `getWorldOnlineCount()` thay vì `getOnlineCount()`.
- [x] Author room presence: chuyển sang socket-level (`room:{authorId}:user_sockets:{userId}`) + aggregate unique users để tránh sai khi multi-tab.
- [x] Siết `join_room` generic: chỉ cho phép join room 1 (world) hoặc room mà user là member.

---

## Phase 2: Reconnect + Room Resubscribe
**Ưu tiên: Cao | Phụ thuộc: Phase 1**

- [x] Frontend: handler `connect` rejoin world + rejoin tất cả author rooms trong store.
- [ ] Frontend: refetch history delta khi reconnect.
- [ ] Backend: hỗ trợ `since_id` cho history APIs (chat + notification).

---

## Phase 3: Message Persistence Chuẩn
**Ưu tiên: Trung | Phụ thuộc: Phase 1**

- [ ] Tạo bảng `chat_messages` thống nhất (world + author): `message_id`, `room_type`, `room_id`, `user_id`, `content`, `style_snapshot`, `created_at`.
- [ ] Redis giữ vai trò buffer realtime; DB là source of truth.
- [ ] Snapshot style (badge/frame/color/level) tại thời điểm gửi.

---

## Phase 4: Mapping Profile Chat (badge/frame/level style) – phần lớn ✅
**Ưu tiên: Trung | Phụ thuộc: Phase 3**

- [x] Cache `chat_profile` (Redis) theo user để giảm 3 query inventory mỗi message.
- [x] Bổ sung `level` (id, name, type) vào message payload + style_snapshot.
- [x] Hiển thị level ngay trong UI chat (badge/crown cạnh tên).
- [x] Invalidate cache khi user đổi frame/badge/level (equip badge/item, autoUpgrade, ensureUserLevel).

---

## Phase 5: Duplicate Delivery Control (một phần)
**Ưu tiên: Trung | Phụ thuộc: Phase 2**

- [x] Client dedupe notification theo `notification.id` (addRealtimeNotification, fetch append).
- [x] Queue notification thêm idempotency key (Redis): `event_type + target_id + user_id`.
- [x] Deduplicate mentions theo tập username unique trong 1 message.
- [x] Chuyển pagination notification sang keyset (`id` descending).

---

## Phase 6: Fanout Chapter Mới ✅
**Ưu tiên: Trung | Phụ thuộc: Không**

- [x] Chỉ fanout followers khi chapter `duyet`; reject chỉ gửi author.
- [x] Tách type `CHAPTER_REJECTED` riêng khỏi `NEW_CHAPTER`.
- [x] Dùng `chapter_id` làm `target_id` cho deep-link (khi duyệt).
- [x] Fanout batch bằng bulk insert + socket emit theo batch.

---

## Phase 7: Chuẩn hóa Notification Service ✅
**Ưu tiên: Thấp | Phụ thuộc: Không**

- [x] Gộp `notification.service.js` và `notification.services.js` thành 1.
- [x] Thống nhất: sanitize, persistence, socket emit, retry policy.

---

## Phase 8: Observability + Reliability ✅
**Ưu tiên: Thấp | Phụ thuộc: Phase 5, 6**

- [x] Metrics: queue lag, fanout throughput, duplicate rate.
- [x] Log correlation-id: chapter approval → queue → deliver.
- [x] Cảnh báo khi worker lỗi lặp, emit thất bại tăng đột biến.

---

## Ghi chú

- Phase 1: Bảo mật và tính đúng của presence cần làm trước.
- Phase 2: Reconnect/resubscribe cần có JWT đúng từ Phase 1.
- Phase 3–4: Liên quan đến persistence và profile, có thể song song với Phase 2.
- Phase 5–8: Có thể triển khai song song sau khi Phase 1–2 ổn định.
