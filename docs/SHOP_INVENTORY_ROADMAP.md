# Shop + Inventory – Roadmap Triển Khai

> Dựa trên findings từ Codex và đánh giá triển khai. Ưu tiên hotfix → contract → hardening → performance.

---

## Phase 1 — Hotfix / Integrity (P0)

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 1.1 | Fix badge ownership/list join — `level_badges` không có `reward_id`, query sai; chuyển lấy display từ `rewards` | `inventory.model.js` | Done |
| 1.2 | Add `/buy` validation + service guard — itemId int >0, quantity 1..max, validate 2 lớp | `shop.routes.js`, `validators/shop.validator.js`, `shop.service.js` | Done |
| 1.3 | Fix schema drift — đảm bảo `reward_id` nullable, không kỳ vọng cả `reward_id` và `shop_item_id` bắt buộc | Migration 16 đã có | Verified |
| 1.4 | Chặn equip/use với item expired — runtime check trong equip path | `inventory.model.js` | Done (đã có sẵn) |

**Acceptance**: getUserBadges/getEquippedBadges không SQL error; buy reject invalid input; equip expired bị chặn.

---

## Phase 2 — Contract Stabilization ✅

| # | Task | Status |
|---|------|--------|
| 2.1 | Chuẩn hóa inventory source model (`reward`, `shop`, `mail`, `system`) | Done: `constants/inventoryContract.js`, shop + userReward dùng INVENTORY_SOURCE |
| 2.2 | Bỏ magic `shop_item_id === 8`, chuyển sang metadata-driven consumables | Done: metadata `effect_type`/`effect_value`, migration 18 |
| 2.3 | Chuẩn hóa non-consumable duplicate rule / unique constraint | Done: unique_user_shop_item đã có sẵn |

---

## Phase 3 — Hardening ✅

| # | Task | Status |
|---|------|--------|
| 3.1 | Lock/unique strategy cho buy/equip/consume | Verified: FOR UPDATE đã có (shop, currency, inventory) |
| 3.2 | Cron expire + unequip expired items | Done: `jobs/expireInventoryCronjob.js`, 02:00 hằng ngày |
| 3.3 | Integration tests cho shop/inventory flows | Done: `__tests__/shop.inventory.test.js` |

---

## Phase 4 — Performance & Observability ✅

| # | Task | Status |
|---|------|--------|
| 4.1 | Thêm index theo query thật | Migration 17 đã có idx_user_inventory_user_shop |
| 4.2 | Paginate `/inventory/items`, `/shop/transactions` | Done: limit, offset, meta { total, limit, offset } |
| 4.3 | Log event tối thiểu (shop_buy, equip, consume, expire) | Done: JSON structured log |
| 4.4 | Cache catalog TTL ngắn | Done: Redis getOrSet, TTL 120s, key shop:catalog[:itemType] |

---

## Test Matrix (Phase 1)

- [ ] `getUserBadges` / `getEquippedBadgesForUsers` → không SQL error, badge hiển thị đúng
- [x] Buy với `quantity = -1` / `0` / vượt max → 400 (`__tests__/shop.inventory.test.js`)
- [ ] Buy thành công → currency giảm, inventory tăng
- [ ] Equip item expired → bị chặn, message rõ

---

## Severity Reference

| Level | Ví dụ |
|-------|-------|
| P0 | Badge join fail, buy validation bypass, currency integrity |
| P1 | Magic consumable, schema drift, expired item equip |
| P2 | Cron cleanup, indexes, locking |
| P3 | Pagination, logging, cache |
