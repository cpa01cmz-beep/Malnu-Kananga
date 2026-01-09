# Migration Generator Skill

## Description
Generate migration scripts and procedures for database schema changes, feature migrations, and data transformations in the MA Malnu Kananga project.

## Instructions

When asked to create a migration:

1. **Migration File Location**: Create migration files in `src/migrations/` or `migrations/` directory

2. **Database Migration Template** (for Cloudflare D1):
   ```typescript
   // migrations/001_add_new_table.ts
   // Migration: Add new table
   // Date: YYYY-MM-DD
   
   export const up = async (db: D1Database): Promise<void> => {
     await db.exec(`
       CREATE TABLE IF NOT EXISTS new_table (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         field1 TEXT NOT NULL,
         field2 INTEGER,
         user_id TEXT NOT NULL,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (user_id) REFERENCES users(id)
       );
       
       CREATE INDEX IF NOT EXISTS idx_new_table_user_id ON new_table(user_id);
       CREATE INDEX IF NOT EXISTS idx_new_table_created_at ON new_table(created_at);
     `);
   };
   
   export const down = async (db: D1Database): Promise<void> => {
     await db.exec(`
       DROP INDEX IF EXISTS idx_new_table_user_id;
       DROP INDEX IF EXISTS idx_new_table_created_at;
       DROP TABLE IF EXISTS new_table;
     `);
   };
   
   export const description = 'Add new table for feature X';
   ```

3. **Schema Update Migration**:
   ```typescript
   // migrations/002_update_table_structure.ts
   export const up = async (db: D1Database): Promise<void> => {
     // Add new column
     await db.exec(`
       ALTER TABLE existing_table ADD COLUMN new_column TEXT;
     `);
     
     // Update existing data
     await db.exec(`
       UPDATE existing_table 
       SET new_column = 'default_value' 
       WHERE new_column IS NULL;
     `);
     
     // Create index
     await db.exec(`
       CREATE INDEX IF NOT EXISTS idx_existing_table_new_column 
       ON existing_table(new_column);
     `);
   };
   
   export const down = async (db: D1Database): Promise<void> => {
     await db.exec(`
       DROP INDEX IF EXISTS idx_existing_table_new_column;
       ALTER TABLE existing_table DROP COLUMN new_column;
     `);
   };
   
   export const description = 'Update existing_table structure';
   ```

4. **Data Migration Template**:
   ```typescript
   // migrations/003_migrate_user_data.ts
   export const up = async (db: D1Database): Promise<void> => {
     // Migrate data from old structure to new structure
     await db.exec(`
       INSERT INTO new_users (id, name, email, created_at)
       SELECT id, user_name, user_email, created_at
       FROM old_users;
     `);
     
     // Update references
     await db.exec(`
       UPDATE posts 
       SET author_id = (
         SELECT id FROM new_users 
         WHERE old_users.id = author_id
       );
     `);
     
     // Verify migration
     const result = await db.prepare(
       'SELECT COUNT(*) as count FROM new_users'
     ).first();
     
     console.log(`Migrated ${result?.count} users`);
   };
   
   export const down = async (db: D1Database): Promise<void> => {
     // Rollback data migration
     await db.exec(`
       DELETE FROM new_users;
     `);
   };
   
   export const description = 'Migrate user data from old structure';
   ```

5. **Feature Migration** (localStorage to API):
   ```typescript
   // migrations/feature_migrate_storage_to_api.ts
   import { apiService } from '../services/apiService';
   import { STORAGE_KEYS } from '../constants';
   
   export const migrateToAPI = async (): Promise<void> => {
     try {
       // 1. Read data from localStorage
       const localData = localStorage.getItem(STORAGE_KEYS.FEATURE_DATA);
       if (!localData) {
         console.log('No local data to migrate');
         return;
       }
       
       const data = JSON.parse(localData);
       
       // 2. Send to API
       const result = await apiService.migrateFeatureData({ data });
       
       if (result.success) {
         console.log('Migration successful');
         
         // 3. Clear localStorage
         localStorage.removeItem(STORAGE_KEYS.FEATURE_DATA);
       } else {
         console.error('Migration failed:', result.error);
       }
     } catch (error) {
       console.error('Migration error:', error);
     }
   };
   
   export const description = 'Migrate feature from localStorage to API';
   ```

6. **Migration Checklist**:
   - [ ] Create migration file with timestamp prefix
   - [ ] Write `up` migration
   - [ ] Write `down` migration (rollback)
   - [ ] Add description
   - [ ] Test migration on development database
   - [ ] Test rollback procedure
   - [ ] Document changes
   - [ ] Update API types if needed
   - [ ] Update frontend code if needed
   - [ ] Plan for production deployment
   - [ ] Create database backup before migration

7. **Running Migrations** (for Cloudflare D1):
   ```bash
   # Apply migrations
   wrangler d1 execute malnu-kananga --local --file=migrations/001_add_new_table.sql
   
   # Apply in production
   wrangler d1 execute malnu-kananga --file=migrations/001_add_new_table.sql
   
   # Check current schema
   wrangler d1 execute malnu-kananga --command="SELECT name FROM sqlite_master WHERE type='table'"
   ```

8. **Best Practices**:
   - Always create rollback (`down`) migrations
   - Test migrations on development data first
   - Use transactions for multi-step operations
   - Add indexes for new queries
   - Update foreign key constraints
   - Handle data validation
   - Log migration progress
   - Keep migrations idempotent
   - Don't modify existing migrations
   - Create new migrations for changes

9. **Common Migration Patterns**:
   
   **Add Column**:
   ```sql
   ALTER TABLE table_name ADD COLUMN new_column TEXT DEFAULT 'default';
   ```
   
   **Rename Column** (SQLite limited):
   ```sql
   -- SQLite doesn't support ALTER TABLE RENAME COLUMN
   -- Need to create new table and migrate data
   CREATE TABLE table_name_new AS SELECT id, old_column as new_column FROM table_name;
   DROP TABLE table_name;
   ALTER TABLE table_name_new RENAME TO table_name;
   ```
   
   **Add Index**:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column);
   ```
   
   **Data Transformation**:
   ```sql
   UPDATE table_name 
   SET column = UPPER(column) 
   WHERE condition;
   ```

10. **Post-Migration**:
    - Verify data integrity
    - Check application functionality
    - Monitor performance
    - Update documentation
    - Inform team of changes

## Examples

See existing migrations for patterns (if any):
- Check `migrations/` directory
- Check `src/migrations/` directory
- Check `schema.sql` for current schema

## Notes

- Cloudflare D1 uses SQLite with some limitations
- Always backup production database before migration
- Test migrations thoroughly in development
- Document breaking changes
- Plan for downtime if necessary
- Consider data volume for large migrations
- Use appropriate data types
- Add proper constraints and indexes
