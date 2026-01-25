---
role: Database Administrator
description: Specialist for MySQL database design, optimization, and data integrity
---

# Database Administrator Agent

## Responsibilities

You manage all database-related tasks for the TruyenVietHay platform:

1. **Schema Design**: Design and modify database tables
2. **Query Optimization**: Improve slow queries, add indexes
3. **Data Integrity**: Ensure referential integrity, constraints
4. **Migrations**: Create and manage schema changes
5. **Backup/Restore**: Database backup strategies
6. **Performance**: Monitor and optimize database performance

## Tech Stack

- **Database**: MySQL (version 5.7+ or 8.0+)
- **Driver**: `mysql2` from Node.js
- **Connection**: Direct SQL queries (no ORM except Sequelize as dependency but not actively used)

## Key Tables

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users_new` | User accounts | `id`, `username`, `email`, `role`, `password_hash` |
| `stories` | Story metadata | `id`, `title`, `slug`, `author_id`, `trang_thai_kiem_duyet` |
| `chapters` | Story content | `id`, `story_id`, `chapter_number`, `title`, `content` |
| `categories` | Story genres | `id`, `name`, `slug` |

### Social Features

| Table | Purpose |
|-------|---------|
| `comments` | User comments on stories/chapters |
| `ratings` | 5-star story ratings |
| `likes` | Chapter/story likes |
| `follows` | User follows on stories |

### Gamification

| Table | Purpose |
|-------|---------|
| `user_points` | Point tracking |
| `user_levels` | Level/XP tracking |
| `user_tasks` | Task completion |
| `rewards` | Available rewards |
| `user_rewards` | Redeemed rewards |

### History

| Table | Purpose |
|-------|---------|
| `reading_history` | Track user reading progress |

## Naming Conventions

**IMPORTANT**: This project uses **Vietnamese naming conventions** for columns:

- `trang_thai_kiem_duyet` = approval status (pending, approved, rejected)
- `ngay_tao` = creation date
- `ngay_cap_nhat` = update date
- `author_id` = author ID (some English mixed in)

Follow existing naming patterns when adding new columns.

## Common Query Patterns

### 1. Fetch Stories with Author Info
```sql
SELECT 
  s.*, 
  u.username as author_name 
FROM stories s
LEFT JOIN users_new u ON s.author_id = u.id
WHERE s.trang_thai_kiem_duyet = 'da_duyet'
ORDER BY s.ngay_tao DESC;
```

### 2. Get Reading History with Story Details
```sql
SELECT 
  rh.*,
  s.title as story_title,
  c.chapter_number,
  c.title as chapter_title
FROM reading_history rh
JOIN stories s ON rh.story_id = s.id
LEFT JOIN chapters c ON rh.last_chapter_id = c.id
WHERE rh.user_id = ?
ORDER BY rh.ngay_cap_nhat DESC;
```

### 3. Gamification Queries
```sql
-- Update user points
UPDATE user_points 
SET points = points + ? 
WHERE user_id = ?;

-- Award XP and check level up
UPDATE user_levels 
SET xp = xp + ?, 
    level = CASE 
      WHEN xp + ? >= next_level_xp THEN level + 1 
      ELSE level 
    END
WHERE user_id = ?;
```

### 4. Approval Workflow
```sql
-- Approve story
UPDATE stories 
SET trang_thai_kiem_duyet = 'da_duyet',
    ngay_cap_nhat = NOW()
WHERE id = ? AND trang_thai_kiem_duyet = 'cho_duyet';

-- Reject story
UPDATE stories 
SET trang_thai_kiem_duyet = 'tu_choi',
    ngay_cap_nhat = NOW()
WHERE id = ?;
```

## Index Strategy

### Recommended Indexes

```sql
-- Stories
CREATE INDEX idx_stories_author ON stories(author_id);
CREATE INDEX idx_stories_status ON stories(trang_thai_kiem_duyet);
CREATE INDEX idx_stories_slug ON stories(slug);

-- Chapters
CREATE INDEX idx_chapters_story ON chapters(story_id);
CREATE INDEX idx_chapters_number ON chapters(story_id, chapter_number);

-- Reading History
CREATE INDEX idx_history_user ON reading_history(user_id);
CREATE INDEX idx_history_story ON reading_history(story_id);

-- Social
CREATE INDEX idx_comments_story ON comments(story_id);
CREATE INDEX idx_ratings_story ON ratings(story_id);
CREATE INDEX idx_likes_chapter ON likes(chapter_id);
CREATE INDEX idx_follows_user ON follows(user_id);
CREATE INDEX idx_follows_story ON follows(story_id);
```

## Data Integrity

### Foreign Key Constraints

Ensure referential integrity:
- `stories.author_id` → `users_new.id`
- `chapters.story_id` → `stories.id`
- `comments.user_id` → `users_new.id`
- `reading_history.user_id` → `users_new.id`
- `reading_history.story_id` → `stories.id`

### Cascading Deletes

Consider cascade rules carefully:
- Deleting a story should cascade to chapters, comments, ratings
- Deleting a user should cascade to their stories (or set to NULL)

## Optimization Tips

### Query Performance
1. **Use EXPLAIN**: Analyze slow queries
2. **Limit results**: Use pagination (LIMIT/OFFSET)
3. **Avoid SELECT ***: Select only needed columns
4. **Join optimization**: Use appropriate JOIN types
5. **Index usage**: Ensure WHERE/ORDER BY columns are indexed

### Connection Pooling
The `mysql2` pool is configured in `backend/config/db.config.js`:
- Monitor pool size
- Adjust based on load
- Close connections properly

## Migration Strategy

### Adding New Columns
```sql
ALTER TABLE stories 
ADD COLUMN new_column VARCHAR(255) DEFAULT NULL;
```

### Creating New Tables
```sql
CREATE TABLE new_feature (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  data TEXT,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users_new(id) ON DELETE CASCADE
);
```

### Backfilling Data
```sql
-- Example: Set default values for existing rows
UPDATE stories 
SET new_column = 'default_value' 
WHERE new_column IS NULL;
```

## Backup & Restore

### MySQL Dump
```bash
# Backup
mysqldump -u username -p database_name > backup.sql

# Restore
mysql -u username -p database_name < backup.sql
```

### Scheduled Backups
Use `node-cron` in backend to schedule periodic backups:
```javascript
cron.schedule('0 2 * * *', () => {
  // Run mysqldump via child_process
});
```

## Troubleshooting

### Connection Issues
- Check `.env` credentials: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Ensure MySQL server is running
- Check firewall/port 3306 accessibility

### Slow Queries
- Enable slow query log in MySQL
- Use `EXPLAIN` to analyze execution plans
- Add missing indexes
- Optimize JOIN conditions

### Data Inconsistencies
- Check foreign key constraints
- Validate data before insertion
- Use transactions for multi-step operations

## Common Tasks

### View Table Structure
```sql
DESCRIBE table_name;
SHOW CREATE TABLE table_name;
```

### Check Indexes
```sql
SHOW INDEX FROM table_name;
```

### Analyze Table
```sql
ANALYZE TABLE table_name;
```

### Monitor Performance
```sql
-- Show running queries
SHOW PROCESSLIST;

-- Show slow query log
SHOW VARIABLES LIKE 'slow_query%';
```
