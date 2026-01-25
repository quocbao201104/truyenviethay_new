# Database Rules

## Naming Conventions

### Tables
**RULE**: Use lowercase names, plural form, with underscores for multi-word names.

**Examples**:
- ✅ `stories`, `users_new`, `reading_history`
- ❌ `Story`, `user`, `ReadingHistory`

### Columns
**RULE**: Follow existing Vietnamese naming pattern for date/status columns.

**Standard Vietnamese Columns**:
- `ngay_tao` - Creation date
- `ngay_cap_nhat` - Update date
- `trang_thai_kiem_duyet` - Approval status (cho_duyet, da_duyet, tu_choi)
- `ngay_xoa` - Deletion date (soft delete)

**DO NOT** mix naming styles inconsistently. If adding new columns to existing tables, follow the table's convention.

### Indexes
**RULE**: Use descriptive index names.

**Pattern**: `idx_tablename_columnname`

**Examples**:
- `idx_stories_author` for stories(author_id)
- `idx_chapters_story_number` for chapters(story_id, chapter_number)

### Foreign Keys
**RULE**: Use descriptive foreign key names.

**Pattern**: `fk_tablename_reference`

**Example**: `fk_chapters_story` for chapters.story_id → stories.id

## Data Types

### Text Columns
**RULE**: Use UTF8MB4 for Vietnamese text support.

```sql
CREATE TABLE stories (
  title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Timestamps
**RULE**: Use consistent timestamp patterns.

```sql
ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### ENUMs
**RULE**: Use ENUM for fixed value sets.

```sql
trang_thai_kiem_duyet ENUM('cho_duyet', 'da_duyet', 'tu_choi') DEFAULT 'cho_duyet'
```

## Query Best Practices

### Parameterized Queries
**RULE**: ALWAYS use parameterized queries. NEVER concatenate user input.

```javascript
// ✅ CORRECT
const [rows] = await db.query(
  'SELECT * FROM stories WHERE author_id = ?',
  [authorId]
);

// ❌ FORBIDDEN - SQL INJECTION RISK
const query = `SELECT * FROM stories WHERE author_id = ${authorId}`;
const [rows] = await db.query(query);
```

### Transactions
**RULE**: Use transactions for multi-step operations that must succeed or fail together.

```javascript
const connection = await db.getConnection();
try {
  await connection.beginTransaction();
  
  // Multiple operations
  await connection.query('UPDATE user_points SET points = points - ? WHERE user_id = ?', [cost, userId]);
  await connection.query('INSERT INTO user_rewards (user_id, reward_id) VALUES (?, ?)', [userId, rewardId]);
  
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

### Indexing Strategy
**RULE**: Add indexes for columns used in WHERE, JOIN, and ORDER BY clauses.

**Required Indexes**:
- Primary keys (automatic)
- Foreign keys
- Columns in WHERE conditions
- Columns in ORDER BY
- Columns in JOIN conditions

**Example**:
```sql
-- If you query: SELECT * FROM stories WHERE trang_thai_kiem_duyet = 'da_duyet' ORDER BY ngay_tao DESC
-- Then you need:
CREATE INDEX idx_stories_status_date ON stories(trang_thai_kiem_duyet, ngay_tao);
```

### Pagination
**RULE**: Always paginate large result sets.

```javascript
const limit = 20;
const offset = (page - 1) * limit;

const [rows] = await db.query(
  'SELECT * FROM stories ORDER BY ngay_tao DESC LIMIT ? OFFSET ?',
  [limit, offset]
);
```

## Schema Changes

### Migration Process
**RULE**: Never modify tables directly in production. Always create migration scripts.

1. Create migration file: `migrations/YYYY-MM-DD_description.sql`
2. Test locally first
3. Create rollback script
4. Document in `migrations/CHANGELOG.md`
5. Apply during low-traffic period

### Backward Compatibility
**RULE**: Make schema changes backward compatible when possible.

**Safe Changes**:
- Adding new columns (with defaults)
- Adding new tables
- Adding indexes

**Risky Changes**:
- Renaming columns (breaks existing code)
- Changing data types
- Dropping columns/tables

**When making risky changes**:
1. Add new column
2. Update code to use new column
3. Migrate data
4. Remove old column after verification

## Data Integrity

### Foreign Keys
**RULE**: Define foreign key constraints for referential integrity.

```sql
ALTER TABLE chapters
ADD CONSTRAINT fk_chapters_story
FOREIGN KEY (story_id) REFERENCES stories(id)
ON DELETE CASCADE;
```

**Cascade Rules**:
- `ON DELETE CASCADE`: Delete child records when parent is deleted
- `ON DELETE SET NULL`: Set foreign key to NULL when parent is deleted
- `ON DELETE RESTRICT`: Prevent deletion if child records exist

### NOT NULL Constraints
**RULE**: Use NOT NULL for required fields.

```sql
CREATE TABLE stories (
  id INT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author_id INT NOT NULL,
  description TEXT, -- Optional field
  FOREIGN KEY (author_id) REFERENCES users_new(id)
);
```

### Unique Constraints
**RULE**: Enforce uniqueness where applicable.

```sql
CREATE TABLE stories (
  id INT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,  -- Unique constraint
  ...
);

-- Or as separate constraint
ALTER TABLE stories ADD UNIQUE KEY unique_slug (slug);
```

## Performance Optimization

### EXPLAIN Queries
**RULE**: Use EXPLAIN to analyze slow queries.

```sql
EXPLAIN SELECT * FROM stories WHERE trang_thai_kiem_duyet = 'da_duyet';
```

Look for:
- `type: ALL` (full table scan - BAD)
- `type: index` or `type: ref` (using index - GOOD)
- `Extra: Using filesort` (needs index)

### Avoid N+1 Queries
**RULE**: Use JOINs instead of multiple queries in loops.

```javascript
// ❌ BAD: N+1 queries
const stories = await db.query('SELECT * FROM stories');
for (const story of stories) {
  const author = await db.query('SELECT * FROM users WHERE id = ?', [story.author_id]);
  story.author = author[0];
}

// ✅ GOOD: Single JOIN query
const [rows] = await db.query(`
  SELECT s.*, u.username as author_name 
  FROM stories s 
  LEFT JOIN users_new u ON s.author_id = u.id
`);
```

### Connection Pooling
**RULE**: Use connection pooling for better performance.

Already configured in `backend/config/db.config.js`:
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

## Backup & Recovery

### Regular Backups
**RULE**: Perform regular database backups.

```bash
# Daily backup script
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql
```

### Test Restores
**RULE**: Periodically test backup restoration.

```bash
mysql -u username -p test_database < backup.sql
```

## Monitoring

### Slow Query Log
**RULE**: Enable and monitor slow query log in production.

```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2; -- Log queries taking > 2 seconds
```

### Table Statistics
**RULE**: Keep table statistics up to date.

```sql
ANALYZE TABLE stories;
```
