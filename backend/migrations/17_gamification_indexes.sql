-- Phase 4: Indexes for gamification query patterns
-- Chạy sau khi đã có migration 06, 08

-- user_inventory: shop + inventory lookups (user_id, shop_item_id)
-- shop.service buyItem, getUserInventory, equipBadge
CREATE INDEX idx_user_inventory_user_shop
ON user_inventory(user_id, shop_item_id);

-- user_tasks: daily lookup (user_id, task_id, assigned_at) hỗ trợ filter theo ngày
-- task.service completeTask dùng user_id + task_id + DATE(assigned_at)
-- Lưu ý: Nếu có UNIQUE(user_id, task_id) từ migration 05 thì cần review - daily tasks cần nhiều row/user/task
-- CREATE INDEX idx_user_tasks_user_task_assigned ON user_tasks(user_id, task_id, assigned_at);
