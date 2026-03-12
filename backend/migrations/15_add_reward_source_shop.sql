-- Add 'shop' to user_rewards.source enum (mua bằng linh thạch)
-- Chạy nếu buyReward dùng source='shop'
ALTER TABLE user_rewards MODIFY COLUMN source
  ENUM('task', 'level', 'event', 'admin', 'shop') DEFAULT 'task';
