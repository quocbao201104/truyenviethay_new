CREATE TABLE IF NOT EXISTS truyen_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  truyen_id INT NOT NULL,
  ngay_xem DATE NOT NULL,
  so_luot_xem INT DEFAULT 1,
  UNIQUE KEY unique_story_date (truyen_id, ngay_xem),
  FOREIGN KEY (truyen_id) REFERENCES truyen_new(id) ON DELETE CASCADE
);
