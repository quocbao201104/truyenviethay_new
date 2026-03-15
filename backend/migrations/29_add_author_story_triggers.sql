-- =============================================================================
-- Migration: Triggers for authors.total_stories (option 1)
-- =============================================================================

DROP TRIGGER IF EXISTS after_truyen_insert;
DROP TRIGGER IF EXISTS after_truyen_update;
DROP TRIGGER IF EXISTS after_truyen_delete;
DELIMITER //
CREATE TRIGGER after_truyen_insert
AFTER INSERT ON truyen_new
FOR EACH ROW
BEGIN
  IF NEW.author_id IS NOT NULL AND NEW.is_deleted = 0 THEN
    UPDATE authors
    SET total_stories = total_stories + 1
    WHERE id = NEW.author_id;
  END IF;
END //

CREATE TRIGGER after_truyen_update
AFTER UPDATE ON truyen_new
FOR EACH ROW
BEGIN
  DECLARE old_active TINYINT;
  DECLARE new_active TINYINT;
  SET old_active = (OLD.author_id IS NOT NULL AND OLD.is_deleted = 0);
  SET new_active = (NEW.author_id IS NOT NULL AND NEW.is_deleted = 0);

  IF (OLD.author_id IS NULL AND NEW.author_id IS NOT NULL)
     OR (OLD.author_id IS NOT NULL AND NEW.author_id IS NULL)
     OR (OLD.author_id <> NEW.author_id) THEN
    IF old_active = 1 THEN
      UPDATE authors
      SET total_stories = GREATEST(total_stories - 1, 0)
      WHERE id = OLD.author_id;
    END IF;
    IF new_active = 1 THEN
      UPDATE authors
      SET total_stories = total_stories + 1
      WHERE id = NEW.author_id;
    END IF;
  ELSEIF old_active <> new_active THEN
    IF old_active = 1 THEN
      UPDATE authors
      SET total_stories = GREATEST(total_stories - 1, 0)
      WHERE id = OLD.author_id;
    END IF;
    IF new_active = 1 THEN
      UPDATE authors
      SET total_stories = total_stories + 1
      WHERE id = NEW.author_id;
    END IF;
  END IF;
END //

CREATE TRIGGER after_truyen_delete
AFTER DELETE ON truyen_new
FOR EACH ROW
BEGIN
  IF OLD.author_id IS NOT NULL AND OLD.is_deleted = 0 THEN
    UPDATE authors
    SET total_stories = GREATEST(total_stories - 1, 0)
    WHERE id = OLD.author_id;
  END IF;
END //
DELIMITER ;
