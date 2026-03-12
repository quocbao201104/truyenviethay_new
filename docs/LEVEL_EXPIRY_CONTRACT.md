# Level / Expiry Date Contract

## user_points.expiry_date

**Ý nghĩa**: Ngày hết hạn tài khoản / subscription level (cấp độ hiện tại có hiệu lực đến khi nào).

**Nơi gán**:
- `autoUpgrade`: Khi user lên cấp mới → cập nhật `expiry_date` = Root Start + T_max (tổng lifespan các level)
- `user_points.current_level_id` cũng được cập nhật theo

**Hiện trạng**: Không có cron / job nào enforce:
- Hết hạn không tự động hạ cấp
- Không chặn quyền truy cập
- Chỉ dùng để hiển thị / logic tùy nghiệp vụ (nếu cần)

**Khi muốn enforce**: Cần thêm cron (Phase 5) để:
1. Tìm user có `expiry_date < NOW()`
2. Quyết định: hạ cấp về level trước, chuyển status, hay chỉ log
3. Cập nhật `user_points` và có thể tạo record mới trong `user_levels_history`

---

## user_rewards.expired_at

**Ý nghĩa**: Quà trong hộp thư hết hạn (user phải claim trước thời điểm này).

**Nơi check**: `claimRewardInstance` kiểm tra `expired_at < NOW()` → throw "Quà đã hết hạn".

**Hiện trạng**: Có enforce lúc claim. **Cron `expireRewardsCronjob`** (01:00 mỗi ngày) tự động chuyển status `unlocked` → `expired` khi `expired_at < NOW()`.

---

## user_inventory.expires_at

**Ý nghĩa**: Vật phẩm hết hạn (buff, consumable, v.v.).

**Nơi check**: `inventory.model` filter `expires_at IS NULL OR expires_at > UTC_TIMESTAMP()` khi query.

**Hiện trạng**: Query đã lọc vật phẩm hết hạn. Không có cron xóa/cập nhật record.
