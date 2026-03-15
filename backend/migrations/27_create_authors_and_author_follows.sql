-- =============================================================================
-- Migration: authors + author_follows (Author System Core)
-- =============================================================================

CREATE TABLE IF NOT EXISTS authors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pen_name VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  bio TEXT,
  total_stories INT DEFAULT 0,
  follower_count INT DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  weekly_score FLOAT DEFAULT 0,
  monthly_score FLOAT DEFAULT 0,
  potential_score FLOAT DEFAULT 0,
  author_score FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_authors_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users_new(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS author_follows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  author_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_author_follow (user_id, author_id),
  FOREIGN KEY (user_id) REFERENCES users_new(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Triggers: maintain follower_count
DROP TRIGGER IF EXISTS after_author_follow_insert;
DROP TRIGGER IF EXISTS after_author_follow_delete;
DELIMITER //
CREATE TRIGGER after_author_follow_insert
AFTER INSERT ON author_follows
FOR EACH ROW
BEGIN
  UPDATE authors
  SET follower_count = follower_count + 1
  WHERE id = NEW.author_id;
END //
CREATE TRIGGER after_author_follow_delete
AFTER DELETE ON author_follows
FOR EACH ROW
BEGIN
  UPDATE authors
  SET follower_count = GREATEST(follower_count - 1, 0)
  WHERE id = OLD.author_id;
END //
DELIMITER ;
