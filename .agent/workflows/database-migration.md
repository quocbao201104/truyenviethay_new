---
description: Run database migrations and schema changes
---

# Database Migration

This workflow guides you through making database schema changes safely.

## Steps

### 1. Create Migration SQL File

Create a new SQL file in `backend/migrations/` (create this directory if it doesn't exist):

**Example**: `backend/migrations/2026-01-20_add_new_feature.sql`

```sql
-- Migration: Add new feature table
-- Date: 2026-01-20
-- Author: [Your Name]

-- Create new table
CREATE TABLE IF NOT EXISTS new_feature (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users_new(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alter existing table (example)
ALTER TABLE stories 
ADD COLUMN new_column VARCHAR(100) DEFAULT NULL;

-- Create index (example)
CREATE INDEX idx_stories_new_column ON stories(new_column);
```

### 2. Backup Database

Before applying changes, backup the database:

```bash
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Test Migration Locally

Connect to MySQL and run the migration:

```bash
mysql -u username -p database_name < backend/migrations/2026-01-20_add_new_feature.sql
```

**Verify**:
```sql
-- Check table structure
DESCRIBE new_feature;

-- Verify indexes
SHOW INDEX FROM new_feature;

-- Test a query
SELECT * FROM new_feature LIMIT 1;
```

### 4. Update Models

Create or update the corresponding model file:

**Example**: `backend/models/newFeature.model.js`

```javascript
const db = require('../config/db.config');

exports.create = async (data) => {
  const { user_id, name, description } = data;
  const [result] = await db.query(
    'INSERT INTO new_feature (user_id, name, description) VALUES (?, ?, ?)',
    [user_id, name, description]
  );
  return { id: result.insertId, ...data };
};

exports.findByUserId = async (userId) => {
  const [rows] = await db.query(
    'SELECT * FROM new_feature WHERE user_id = ? ORDER BY ngay_tao DESC',
    [userId]
  );
  return rows;
};
```

### 5. Create Rollback Script

Create a rollback file to undo changes if needed:

**Example**: `backend/migrations/2026-01-20_add_new_feature_rollback.sql`

```sql
-- Rollback: Remove new feature table
-- Date: 2026-01-20

-- Drop new column from existing table
ALTER TABLE stories DROP COLUMN new_column;

-- Drop new table
DROP TABLE IF EXISTS new_feature;
```

### 6. Document the Migration

Update migration log (create if doesn't exist):

**File**: `backend/migrations/CHANGELOG.md`

```markdown
# Database Migration Changelog

## 2026-01-20: Add New Feature Table

**Migration File**: `2026-01-20_add_new_feature.sql`

**Changes**:
- Added `new_feature` table with user relationship
- Added `new_column` to `stories` table
- Created indexes for performance

**Rollback**: `2026-01-20_add_new_feature_rollback.sql`

**Impact**: 
- No impact on existing data
- New feature will be available after backend update
```

### 7. Apply to Production

When ready for production:

1. **Backup production database**
2. **Apply migration during low-traffic period**
3. **Verify migration success**
4. **Monitor for errors**

```bash
# Production migration
mysql -u prod_user -p prod_database < backend/migrations/2026-01-20_add_new_feature.sql
```

## Common Migration Patterns

### Adding a Column
```sql
ALTER TABLE table_name 
ADD COLUMN new_column VARCHAR(255) DEFAULT NULL;
```

### Modifying a Column
```sql
ALTER TABLE table_name 
MODIFY COLUMN existing_column VARCHAR(500) NOT NULL;
```

### Adding Foreign Key
```sql
ALTER TABLE child_table
ADD CONSTRAINT fk_parent
FOREIGN KEY (parent_id) REFERENCES parent_table(id)
ON DELETE CASCADE;
```

### Creating Index
```sql
CREATE INDEX idx_column_name ON table_name(column_name);
```

### Backfilling Data
```sql
-- Set default values for existing rows
UPDATE table_name 
SET new_column = 'default_value' 
WHERE new_column IS NULL;
```

## Best Practices

### Naming Conventions
- **Tables**: Lowercase, plural (e.g., `stories`, `users_new`)
- **Columns**: Vietnamese or English lowercase with underscores
- **Indexes**: `idx_tablename_columnname`
- **Foreign Keys**: `fk_tablename_reference`

### Safety Checks
- [ ] Backup created before migration
- [ ] Migration tested locally first
- [ ] Rollback script prepared
- [ ] Indexes added for new columns used in WHERE/ORDER BY
- [ ] Foreign keys validated
- [ ] Character set UTF8MB4 used for text columns
- [ ] Timestamp columns have proper defaults

### Performance Considerations
- Add indexes AFTER inserting large amounts of data
- Use `ALGORITHM=INPLACE` for large table alterations (MySQL 5.6+)
- Avoid `SELECT *` - specify columns
- Test query performance after migration

## Troubleshooting

### Migration Fails
1. Check error message carefully
2. Verify table/column doesn't already exist
3. Check for syntax errors in SQL
4. Ensure foreign key references exist

### Can't Drop Column
```sql
-- Check for foreign key constraints
SHOW CREATE TABLE table_name;

-- Drop constraint first, then column
ALTER TABLE table_name DROP FOREIGN KEY constraint_name;
ALTER TABLE table_name DROP COLUMN column_name;
```

### Performance Issues After Migration
```sql
-- Analyze table statistics
ANALYZE TABLE table_name;

-- Check query execution plan
EXPLAIN SELECT * FROM table_name WHERE new_column = 'value';
```

## Rollback Procedure

If migration causes issues:

```bash
# Restore from backup
mysql -u username -p database_name < backup_file.sql

# OR apply rollback script
mysql -u username -p database_name < backend/migrations/2026-01-20_add_new_feature_rollback.sql
```
