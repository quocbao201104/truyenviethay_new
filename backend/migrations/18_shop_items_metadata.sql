-- Add metadata JSON for consumable effects (metadata-driven, không dùng magic item_id)
-- Ví dụ: {"effect_type":"exp_boost","effect_value":1000}
ALTER TABLE shop_items ADD COLUMN metadata JSON NULL COMMENT 'Effect config: effect_type, effect_value';

-- Backfill item ID 8 (Đan Dược / EXP consumable) nếu đã tồn tại
UPDATE shop_items
SET metadata = JSON_OBJECT('effect_type', 'exp_boost', 'effect_value', 1000)
WHERE id = 8 AND (metadata IS NULL OR metadata = 'null');
