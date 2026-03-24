-- Migration 30: Audio backend performance and integrity
-- Goals:
-- 1. Enforce one audio progress row per (user_id, truyen_id)
-- 2. Optimize hot audio playlist reads by story, video, and part ordering
--
-- Production preflight before running:
-- 1. Check NULL keys:
--    SELECT COUNT(*) AS null_key_rows
--    FROM user_audio_progress
--    WHERE user_id IS NULL OR truyen_id IS NULL;
-- 2. Check duplicate user/story pairs:
--    SELECT user_id, truyen_id, COUNT(*) AS duplicate_count
--    FROM user_audio_progress
--    WHERE user_id IS NOT NULL AND truyen_id IS NOT NULL
--    GROUP BY user_id, truyen_id
--    HAVING COUNT(*) > 1;
-- 3. Remediate duplicates/nulls before rollout if any rows are returned.

DROP PROCEDURE IF EXISTS sp_audio_backend_performance_and_integrity;
DELIMITER //
CREATE PROCEDURE sp_audio_backend_performance_and_integrity()
BEGIN
  DECLARE null_key_rows BIGINT DEFAULT 0;
  DECLARE duplicate_key_rows BIGINT DEFAULT 0;
  DECLARE unique_index_exists BIGINT DEFAULT 0;
  DECLARE audio_parts_index_exists BIGINT DEFAULT 0;
  DECLARE schema_not_null_keys BIGINT DEFAULT 0;
  DECLARE insert_trigger_exists BIGINT DEFAULT 0;
  DECLARE update_trigger_exists BIGINT DEFAULT 0;

  SELECT COUNT(*)
    INTO null_key_rows
  FROM user_audio_progress
  WHERE user_id IS NULL OR truyen_id IS NULL;

  SELECT COUNT(*)
    INTO duplicate_key_rows
  FROM (
    SELECT 1
    FROM user_audio_progress
    WHERE user_id IS NOT NULL
      AND truyen_id IS NOT NULL
    GROUP BY user_id, truyen_id
    HAVING COUNT(*) > 1
  ) duplicate_rows;

  IF null_key_rows > 0 OR duplicate_key_rows > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Migration 30 aborted: duplicate or NULL user_audio_progress keys exist';
  END IF;

  SELECT COUNT(*)
    INTO unique_index_exists
  FROM (
    SELECT index_name
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'user_audio_progress'
    GROUP BY index_name, non_unique
    HAVING GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') = 'user_id,truyen_id'
       AND MIN(non_unique) = 0
  ) matching_indexes;

  IF unique_index_exists = 0 THEN
    ALTER TABLE user_audio_progress
    ADD UNIQUE INDEX uk_user_audio_progress_user_truyen (user_id, truyen_id);
  END IF;

  SELECT COUNT(*)
    INTO audio_parts_index_exists
  FROM (
    SELECT index_name
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'audio_parts'
    GROUP BY index_name
    HAVING GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') = 'truyen_id,video_id,part_number,id'
  ) matching_indexes;

  IF audio_parts_index_exists = 0 THEN
    CREATE INDEX idx_audio_parts_truyen_video_part
    ON audio_parts (truyen_id, video_id, part_number, id);
  END IF;

  SELECT COUNT(*)
    INTO schema_not_null_keys
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'user_audio_progress'
    AND column_name IN ('user_id', 'truyen_id')
    AND is_nullable = 'NO';

  IF schema_not_null_keys < 2 THEN
    SELECT COUNT(*)
      INTO insert_trigger_exists
    FROM information_schema.triggers
    WHERE trigger_schema = DATABASE()
      AND event_object_table = 'user_audio_progress'
      AND trigger_name = 'bi_user_audio_progress_require_keys';

    IF insert_trigger_exists = 0 THEN
      SET @create_insert_trigger = '
        CREATE TRIGGER bi_user_audio_progress_require_keys
        BEFORE INSERT ON user_audio_progress
        FOR EACH ROW
        BEGIN
          IF NEW.user_id IS NULL OR NEW.truyen_id IS NULL THEN
            SIGNAL SQLSTATE ''45000''
              SET MESSAGE_TEXT = ''user_audio_progress requires non-null user_id and truyen_id'';
          END IF;
        END';
      PREPARE insert_trigger_stmt FROM @create_insert_trigger;
      EXECUTE insert_trigger_stmt;
      DEALLOCATE PREPARE insert_trigger_stmt;
    END IF;

    SELECT COUNT(*)
      INTO update_trigger_exists
    FROM information_schema.triggers
    WHERE trigger_schema = DATABASE()
      AND event_object_table = 'user_audio_progress'
      AND trigger_name = 'bu_user_audio_progress_require_keys';

    IF update_trigger_exists = 0 THEN
      SET @create_update_trigger = '
        CREATE TRIGGER bu_user_audio_progress_require_keys
        BEFORE UPDATE ON user_audio_progress
        FOR EACH ROW
        BEGIN
          IF NEW.user_id IS NULL OR NEW.truyen_id IS NULL THEN
            SIGNAL SQLSTATE ''45000''
              SET MESSAGE_TEXT = ''user_audio_progress requires non-null user_id and truyen_id'';
          END IF;
        END';
      PREPARE update_trigger_stmt FROM @create_update_trigger;
      EXECUTE update_trigger_stmt;
      DEALLOCATE PREPARE update_trigger_stmt;
    END IF;
  END IF;
END //
DELIMITER ;

CALL sp_audio_backend_performance_and_integrity();
DROP PROCEDURE IF EXISTS sp_audio_backend_performance_and_integrity;
