CREATE TABLE IF NOT EXISTS reports (
  id INT NOT NULL AUTO_INCREMENT,
  reporter_id INT NOT NULL,
  target_id INT NOT NULL,
  target_type ENUM('chapter', 'comment', 'novel', 'audio') NOT NULL,
  issue_type VARCHAR(50) NOT NULL,
  description TEXT DEFAULT NULL,
  status ENUM('pending', 'processing', 'resolved', 'rejected') NOT NULL DEFAULT 'pending',
  admin_note TEXT DEFAULT NULL,
  resolved_by INT DEFAULT NULL,
  resolved_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_target (target_type, target_id),
  KEY idx_reports_reporter_created (reporter_id, created_at),
  KEY idx_reports_status_created (status, created_at),
  KEY idx_reports_target_status (target_type, status),
  CONSTRAINT fk_reports_reporter
    FOREIGN KEY (reporter_id) REFERENCES users_new(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;
