# 🔄 Database Migration Guide - MA Malnu Kananga

## 🌟 Overview

Panduan lengkap untuk database migration, versioning, dan data management sistem MA Malnu Kananga. Dokumentasi ini mencakup prosedur untuk D1 Cloudflare dan Supabase database.

---

## 📋 Table of Contents

1. [Database Architecture](#database-architecture)
2. [Migration Strategy](#migration-strategy)
3. [Version Control](#version-control)
4. [Migration Procedures](#migration-procedures)
5. [Data Migration](#data-migration)
6. [Rollback Procedures](#rollback-procedures)
7. [Backup & Recovery](#backup--recovery)
8. [Testing Migrations](#testing-migrations)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Database Architecture

### Current Database Setup

#### Cloudflare D1 (Primary)
- **Purpose**: Production database for user data, academic records
- **Location**: Edge-located, global distribution
- **Format**: SQLite-compatible
- **Size**: Up to 500MB (free tier)

#### Supabase (Secondary/Analytics)
- **Purpose**: Analytics, reporting, backup storage
- **Location**: Centralized PostgreSQL
- **Format**: PostgreSQL 14+
- **Size**: Scalable

### Database Schema Overview

```sql
-- D1 Schema (Primary)
users (id, email, name, role, class_id, created_at, updated_at)
academic_records (id, student_id, subject, grade, semester, academic_year)
assignments (id, teacher_id, title, description, due_date, created_at)
submissions (id, assignment_id, student_id, content, submitted_at)
chat_conversations (id, user_id, message, response, context, created_at)

-- Supabase Schema (Analytics)
analytics_events (id, event_type, user_id, metadata, timestamp)
user_sessions (id, user_id, login_time, logout_time, duration)
performance_metrics (id, endpoint, response_time, status_code, timestamp)
```

---

## 🎯 Migration Strategy

### Migration Types

#### 1. **Schema Migrations**
- Table creation/modification
- Index changes
- Constraint updates
- Data type changes

#### 2. **Data Migrations**
- Data transformation
- Bulk data imports
- Data cleanup
- Archive operations

#### 3. **Platform Migrations**
- D1 to Supabase sync
- Supabase to D1 sync
- Cross-platform replication

### Migration Principles

1. **Zero Downtime**: Migrations must not affect user experience
2. **Backward Compatible**: Old code continues to work during migration
3. **Rollback Ready**: Every migration has rollback procedure
4. **Tested Thoroughly**: All migrations tested in staging first
5. **Monitored**: Migration progress and errors monitored in real-time

---

## 📝 Version Control

### Migration File Naming

```
migrations/
├── 20251124_120500_create_users_table.sql
├── 20251124_121000_add_indexes_to_users.sql
├── 20251124_121500_create_academic_records_table.sql
├── 20251124_122000_add_user_roles.sql
└── rollback/
    ├── 20251124_120500_drop_users_table.sql
    ├── 20251124_121000_remove_indexes_from_users.sql
    ├── 20251124_121500_drop_academic_records_table.sql
    └── 20251124_122000_remove_user_roles.sql
```

### Migration Metadata

```sql
-- Migration tracking table
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    checksum TEXT NOT NULL,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);
```

### Migration Template

```sql
-- File: migrations/20251124_120500_migration_name.sql
-- Description: Brief description of migration purpose
-- Author: Developer name
-- Dependencies: List of prerequisite migrations

-- Start transaction
BEGIN TRANSACTION;

-- Migration SQL here
CREATE TABLE IF NOT EXISTS example_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_example_name ON example_table(name);

-- Insert initial data if needed
INSERT INTO example_table (name) VALUES ('Sample Data');

-- Commit transaction
COMMIT;

-- Record migration
INSERT INTO migrations (filename, checksum) 
VALUES ('20251124_120500_migration_name.sql', 'checksum_hash');
```

---

## 🔧 Migration Procedures

### D1 Database Migrations

#### 1. **Setup Migration Environment**

```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate with Cloudflare
wrangler auth login

# Create migration directory
mkdir -p migrations rollback
```

#### 2. **Create New Migration**

```bash
# Generate migration file
npm run migration:create -- --name "add_user_profiles"

# This creates: migrations/20251124_120500_add_user_profiles.sql
```

#### 3. **Execute Migration**

```bash
# Run pending migrations
npm run migration:up

# Run specific migration
wrangler d1 execute malnu-kananga-db --file=migrations/20251124_120500_add_user_profiles.sql

# Verify migration
wrangler d1 execute malnu-kananga-db --command="SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 1"
```

#### 4. **Migration Scripts**

```json
// package.json scripts
{
  "scripts": {
    "migration:create": "node scripts/createMigration.js",
    "migration:up": "node scripts/runMigrations.js --direction=up",
    "migration:down": "node scripts/runMigrations.js --direction=down",
    "migration:status": "node scripts/migrationStatus.js",
    "migration:rollback": "node scripts/rollbackMigration.js"
  }
}
```

### Supabase Migrations

#### 1. **Setup Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref your-project-ref
```

#### 2. **Create Migration**

```bash
# Generate migration
supabase migration new add_user_profiles

# Edit generated file
# supabase/migrations/20251124120500_add_user_profiles.sql
```

#### 3. **Apply Migration**

```bash
# Apply local migrations
supabase db push

# Apply remote migrations
supabase migration up

# Check migration status
supabase migration list
```

---

## 📊 Data Migration

### Bulk Data Import

#### 1. **CSV Import Script**

```typescript
// scripts/importData.ts
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { Database } from 'bun:sqlite';

interface ImportRecord {
  [key: string]: string | number;
}

export class DataImporter {
  private db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  async importFromCSV(filePath: string, tableName: string): Promise<void> {
    try {
      const csvContent = readFileSync(filePath, 'utf-8');
      const records: ImportRecord[] = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
      });

      console.log(`Importing ${records.length} records to ${tableName}`);

      // Begin transaction
      this.db.exec('BEGIN TRANSACTION');

      for (const record of records) {
        const columns = Object.keys(record).join(', ');
        const placeholders = Object.keys(record).map(() => '?').join(', ');
        const values = Object.values(record);

        const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
        this.db.run(sql, values);
      }

      // Commit transaction
      this.db.exec('COMMIT');
      console.log('Import completed successfully');

    } catch (error) {
      // Rollback on error
      this.db.exec('ROLLBACK');
      console.error('Import failed:', error);
      throw error;
    }
  }
}
```

#### 2. **Data Transformation**

```typescript
// scripts/transformData.ts
export class DataTransformer {
  static transformLegacyUsers(legacyUsers: any[]): any[] {
    return legacyUsers.map(user => ({
      id: user.legacy_id,
      email: user.email_address.toLowerCase(),
      name: user.full_name.trim(),
      role: this.mapRole(user.user_type),
      classId: user.class_section || null,
      createdAt: new Date(user.created_date).toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  private static mapRole(legacyRole: string): string {
    const roleMap: { [key: string]: string } = {
      'S': 'student',
      'T': 'teacher',
      'P': 'parent',
      'A': 'admin'
    };
    return roleMap[legacyRole] || 'student';
  }
}
```

### Cross-Platform Sync

#### 1. **D1 to Supabase Sync**

```typescript
// scripts/syncD1ToSupabase.ts
import { Database } from 'bun:sqlite';
import { createClient } from '@supabase/supabase-js';

export class DatabaseSync {
  private d1Db: Database;
  private supabase: any;

  constructor(d1Path: string, supabaseUrl: string, supabaseKey: string) {
    this.d1Db = new Database(d1Path);
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async syncUsers(): Promise<void> {
    // Get users from D1
    const d1Users = this.d1Db.query('SELECT * FROM users').all();
    
    // Sync to Supabase
    for (const user of d1Users) {
      await this.supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          synced_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
    }
    
    console.log(`Synced ${d1Users.length} users to Supabase`);
  }
}
```

---

## 🔙 Rollback Procedures

### Automatic Rollback

#### 1. **Rollback Script**

```typescript
// scripts/rollbackMigration.ts
import { readFileSync } from 'fs';
import { Database } from 'bun:sqlite';

export class MigrationRollback {
  private db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  async rollback(migrationId: string): Promise<void> {
    try {
      // Get migration info
      const migration = this.db.query(
        'SELECT * FROM migrations WHERE filename = ?'
      ).get(migrationId);

      if (!migration) {
        throw new Error(`Migration ${migrationId} not found`);
      }

      // Execute rollback SQL
      const rollbackFile = `rollback/${migrationId}`;
      const rollbackSQL = readFileSync(rollbackFile, 'utf-8');

      console.log(`Rolling back migration: ${migrationId}`);

      this.db.exec('BEGIN TRANSACTION');
      this.db.exec(rollbackSQL);
      
      // Remove from migrations table
      this.db.run(
        'DELETE FROM migrations WHERE filename = ?',
        [migrationId]
      );

      this.db.exec('COMMIT');
      console.log('Rollback completed successfully');

    } catch (error) {
      this.db.exec('ROLLBACK');
      console.error('Rollback failed:', error);
      throw error;
    }
  }
}
```

#### 2. **Manual Rollback Commands**

```bash
# Rollback last migration
npm run migration:rollback

# Rollback to specific migration
npm run migration:rollback -- --to=20251124_120500

# Rollback specific number of migrations
npm run migration:rollback -- --steps=3
```

### Emergency Rollback

#### 1. **Database Restore**

```bash
# Restore from backup (D1)
wrangler d1 restore malnu-kananga-db --backup-id=backup_20251124_120000

# Restore from backup (Supabase)
supabase db restore --file=backup_20251124_120000.sql
```

#### 2. **Point-in-Time Recovery**

```typescript
// scripts/pointInTimeRecovery.ts
export class PointInTimeRecovery {
  async recoverToTimestamp(timestamp: string): Promise<void> {
    // Get backup closest to timestamp
    const backup = await this.findBackupBefore(timestamp);
    
    if (!backup) {
      throw new Error('No backup found before specified timestamp');
    }

    // Restore backup
    await this.restoreBackup(backup.id);
    
    // Apply migrations up to timestamp
    await this.applyMigrationsUpTo(timestamp);
    
    console.log(`Recovered to timestamp: ${timestamp}`);
  }
}
```

---

## 💾 Backup & Recovery

### Automated Backups

#### 1. **D1 Backup Script**

```typescript
// scripts/backupD1.ts
export class D1Backup {
  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `malnu-kananga-backup-${timestamp}`;
    
    try {
      // Create backup
      const result = await execAsync(
        `wrangler d1 backups create malnu-kananga-db --name=${backupName}`
      );
      
      console.log(`Backup created: ${backupName}`);
      return backupName;
      
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }

  async listBackups(): Promise<any[]> {
    const result = await execAsync('wrangler d1 backups list malnu-kananga-db');
    return JSON.parse(result.stdout);
  }

  async restoreBackup(backupId: string): Promise<void> {
    try {
      await execAsync(
        `wrangler d1 backups restore malnu-kananga-db --backup-id=${backupId}`
      );
      console.log(`Backup restored: ${backupId}`);
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }
}
```

#### 2. **Supabase Backup Script**

```typescript
// scripts/backupSupabase.ts
export class SupabaseBackup {
  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `supabase-backup-${timestamp}.sql`;
    
    try {
      // Dump database
      await execAsync(
        `supabase db dump --data-only --file=backups/${filename}`
      );
      
      console.log(`Supabase backup created: ${filename}`);
      return filename;
      
    } catch (error) {
      console.error('Supabase backup failed:', error);
      throw error;
    }
  }
}
```

### Backup Schedule

```yaml
# .github/workflows/database-backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Backup D1 Database
      run: npm run backup:d1
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    
    - name: Backup Supabase
      run: npm run backup:supabase
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
    
    - name: Upload backups
      uses: actions/upload-artifact@v3
      with:
        name: database-backups
        path: backups/
        retention-days: 30
```

---

## 🧪 Testing Migrations

### Migration Testing Framework

#### 1. **Test Database Setup**

```typescript
// src/__tests__/utils/testDatabase.ts
export class TestDatabase {
  private static instance: TestDatabase;
  private db: Database;

  private constructor() {
    this.db = new Database(':memory:');
    this.setupSchema();
  }

  static getInstance(): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase();
    }
    return TestDatabase.instance;
  }

  private setupSchema(): void {
    // Create migrations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL UNIQUE,
        checksum TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN DEFAULT TRUE
      )
    `);
  }

  async runMigration(migrationSQL: string): Promise<void> {
    this.db.exec('BEGIN TRANSACTION');
    
    try {
      this.db.exec(migrationSQL);
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  reset(): void {
    this.db.close();
    this.db = new Database(':memory:');
    this.setupSchema();
  }
}
```

#### 2. **Migration Tests**

```typescript
// src/__tests__/migrations/userMigration.test.ts
import { TestDatabase } from '../utils/testDatabase';
import { readFileSync } from 'fs';

describe('User Migration Tests', () => {
  let testDb: TestDatabase;

  beforeEach(() => {
    testDb = TestDatabase.getInstance();
    testDb.reset();
  });

  it('should create users table correctly', async () => {
    const migrationSQL = readFileSync(
      'migrations/20251124_120500_create_users_table.sql',
      'utf-8'
    );

    await testDb.runMigration(migrationSQL);

    // Verify table exists
    const tableInfo = testDb.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    ).get();

    expect(tableInfo).toBeDefined();
    expect(tableInfo.name).toBe('users');
  });

  it('should insert initial user data', async () => {
    const migrationSQL = readFileSync(
      'migrations/20251124_120500_create_users_table.sql',
      'utf-8'
    );

    await testDb.runMigration(migrationSQL);

    // Verify initial data
    const users = testDb.query('SELECT COUNT(*) as count FROM users').get();
    expect(users.count).toBeGreaterThan(0);
  });

  it('should handle rollback correctly', async () => {
    // Run migration
    const migrationSQL = readFileSync(
      'migrations/20251124_120500_create_users_table.sql',
      'utf-8'
    );
    await testDb.runMigration(migrationSQL);

    // Run rollback
    const rollbackSQL = readFileSync(
      'rollback/20251124_120500_drop_users_table.sql',
      'utf-8'
    );
    await testDb.runMigration(rollbackSQL);

    // Verify table is dropped
    const tableInfo = testDb.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    ).get();

    expect(tableInfo).toBeUndefined();
  });
});
```

### Performance Testing

```typescript
// src/__tests__/performance/migrationPerformance.test.ts
describe('Migration Performance Tests', () => {
  it('should complete migration within acceptable time', async () => {
    const startTime = performance.now();
    
    // Run migration
    await runMigration('large_dataset_migration.sql');
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Migration should complete within 30 seconds
    expect(duration).toBeLessThan(30000);
  });

  it('should handle large dataset efficiently', async () => {
    const testDb = TestDatabase.getInstance();
    
    // Insert 10,000 test records
    const startTime = performance.now();
    
    for (let i = 0; i < 10000; i++) {
      testDb.run(
        'INSERT INTO test_table (name, value) VALUES (?, ?)',
        [`test_${i}`, Math.random()]
      );
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should handle 10k inserts within 5 seconds
    expect(duration).toBeLessThan(5000);
  });
});
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **Migration Lock Timeout**

```bash
# Check for locked migrations
wrangler d1 execute malnu-kananga-db --command="
  SELECT * FROM migrations 
  WHERE success = FALSE 
  ORDER BY executed_at DESC
"

# Clear stuck migration
wrangler d1 execute malnu-kananga-db --command="
  DELETE FROM migrations 
  WHERE filename = 'stuck_migration.sql' AND success = FALSE
"
```

#### 2. **Checksum Mismatch**

```typescript
// scripts/fixChecksum.ts
export class MigrationFix {
  async fixChecksum(migrationId: string): Promise<void> {
    const migrationSQL = readFileSync(`migrations/${migrationId}`, 'utf-8');
    const checksum = this.calculateChecksum(migrationSQL);
    
    this.db.run(
      'UPDATE migrations SET checksum = ? WHERE filename = ?',
      [checksum, migrationId]
    );
  }

  private calculateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
```

#### 3. **Database Connection Issues**

```bash
# Check D1 database status
wrangler d1 list

# Test database connection
wrangler d1 execute malnu-kananga-db --command="SELECT 1"

# Check Supabase connection
supabase db remote changes
```

### Debug Mode

```typescript
// Enable debug logging for migrations
process.env.MIGRATION_DEBUG = 'true';

// Add logging to migration runner
export class MigrationRunner {
  async runMigration(migrationPath: string): Promise<void> {
    if (process.env.MIGRATION_DEBUG) {
      console.log(`Running migration: ${migrationPath}`);
    }
    
    const startTime = Date.now();
    
    try {
      // Execute migration
      await this.executeMigration(migrationPath);
      
      const duration = Date.now() - startTime;
      
      if (process.env.MIGRATION_DEBUG) {
        console.log(`Migration completed in ${duration}ms`);
      }
      
    } catch (error) {
      console.error(`Migration failed: ${migrationPath}`, error);
      throw error;
    }
  }
}
```

---

## 📈 Monitoring & Alerts

### Migration Monitoring

```typescript
// scripts/migrationMonitor.ts
export class MigrationMonitor {
  async checkMigrationHealth(): Promise<void> {
    // Check for failed migrations
    const failedMigrations = await this.db.query(`
      SELECT * FROM migrations 
      WHERE success = FALSE 
      AND executed_at > datetime('now', '-1 hour')
    `).all();

    if (failedMigrations.length > 0) {
      await this.sendAlert(`Failed migrations detected: ${failedMigrations.length}`);
    }

    // Check migration performance
    const slowMigrations = await this.db.query(`
      SELECT filename, execution_time_ms 
      FROM migrations 
      WHERE execution_time_ms > 30000 
      AND executed_at > datetime('now', '-24 hours')
    `).all();

    if (slowMigrations.length > 0) {
      await this.sendAlert(`Slow migrations detected: ${slowMigrations.length}`);
    }
  }

  private async sendAlert(message: string): Promise<void> {
    // Send alert to monitoring system
    console.log(`ALERT: ${message}`);
    // Integration with PagerDuty, Slack, etc.
  }
}
```

---

## 🎯 Best Practices

### Migration Development
1. **Test in staging** before production
2. **Make migrations reversible** with rollback scripts
3. **Use transactions** for atomic operations
4. **Add indexes** after data insertion for performance
5. **Document dependencies** between migrations

### Production Deployment
1. **Schedule migrations** during low-traffic periods
2. **Monitor performance** during migration
3. **Have rollback plan** ready
4. **Communicate maintenance** to users
5. **Verify data integrity** post-migration

### Data Safety
1. **Backup before migration**
2. **Test restore procedures**
3. **Validate data counts** before/after
4. **Monitor error rates**
5. **Keep audit trail** of changes

---

## 📚 Additional Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/database/migrations)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Database Migration Best Practices](https://fly.io/blog/database-migration-best-practices/)

---

**Database Migration Guide Version: 1.0.0**  
**Last Updated: 2025-11-24
**Maintained by: MA Malnu Kananga Development Team**

---

*Untuk pertanyaan atau bantuan tambahan, hubungi development team melalui GitHub Issues atau internal communication channels.*