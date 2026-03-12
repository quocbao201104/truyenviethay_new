-- Allow reward_id NULL for shop items (user_inventory có thể từ reward HOẶC shop_item)
-- shop.service.js insert với reward_id = NULL khi mua từ shop
ALTER TABLE user_inventory MODIFY COLUMN reward_id INT UNSIGNED NULL;
