# 🗄️ Database Schema Documentation - MA Malnu Kananga

## 🌟 Overview

MA Malnu Kananga uses a dual database architecture:
- **Cloudflare D1**: Primary production database (SQLite-compatible)
- **Supabase PostgreSQL**: Alternative database with comprehensive schema

This document provides complete schema documentation for both database systems.

---

## 🏗️ Database Architecture

### Primary Database: Cloudflare D1
- **Type**: SQLite-compatible serverless database
- **Location**: Edge computing (global distribution)
- **Use Case**: Production data storage, high-performance queries
- **Features**: ACID transactions, REST API, automatic backups

### Secondary Database: Supabase PostgreSQL
- **Type**: PostgreSQL database with real-time capabilities
- **Location**: Cloud-hosted with regional replication
- **Use Case**: Advanced features, real-time subscriptions, authentication
- **Features**: Row Level Security (RLS), real-time APIs, authentication

---

## 📊 D1 Database Schema (Production)

### Current Status
- **Implementation**: Basic schema with user management
- **Tables**: 5 core tables
- **Features**: Authentication, content management, academic tracking
- **Migration**: Manual schema updates via wrangler

### Core Tables

#### users
User authentication and profile management
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);
```

**Fields:**
- `id`: Primary key (auto-increment)
- `email`: Unique email address for login
- `name`: Full name of user
- `role`: User role (student/teacher/parent/admin)
- `password_hash`: Hashed password (if using password auth)
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp
- `is_active`: Account status flag

**Indexes:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

#### student_profiles
Extended student information
```sql
CREATE TABLE student_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nis TEXT UNIQUE,
    class TEXT,
    grade_level TEXT,
    academic_year TEXT,
    gpa REAL DEFAULT 0.0,
    attendance_rate REAL DEFAULT 0.0,
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES users(id)
);
```

**Fields:**
- `id`: Primary key
- `user_id`: Reference to users table
- `nis`: Student identification number (unique)
- `class`: Current class (e.g., "XII IPA 1")
- `grade_level`: Grade level (e.g., "12")
- `academic_year`: Academic year (e.g., "2024/2025")
- `gpa`: Grade point average
- `attendance_rate`: Attendance percentage
- `parent_id`: Reference to parent user

#### teacher_profiles
Teacher information and assignments
```sql
CREATE TABLE teacher_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nip TEXT UNIQUE,
    subject TEXT,
    department TEXT,
    position TEXT,
    hire_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Primary key
- `user_id`: Reference to users table
- `nip`: Teacher identification number (unique)
- `subject`: Primary subject taught
- `department`: Academic department
- `position`: Position/role (e.g., "Head Teacher")
- `hire_date`: Date of employment

#### grades
Student grade records
```sql
CREATE TABLE grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    semester TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    uts_score REAL,
    uas_score REAL,
    assignment_score REAL,
    attendance_score REAL,
    final_score REAL,
    grade_letter TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Primary key
- `student_id`: Reference to student_profiles
- `teacher_id`: Reference to teacher_profiles
- `subject`: Subject name
- `semester`: Semester ("Ganjil" or "Genap")
- `academic_year`: Academic year
- `uts_score`: Mid-term exam score
- `uas_score`: Final exam score
- `assignment_score`: Assignment average
- `attendance_score`: Attendance contribution
- `final_score`: Calculated final score
- `grade_letter`: Letter grade (A, B+, B, etc.)

#### attendance
Student attendance records
```sql
CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    date DATE NOT NULL,
    subject TEXT,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'sick', 'permission', 'late')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    UNIQUE(student_id, date, subject)
);
```

**Fields:**
- `id`: Primary key
- `student_id`: Reference to student_profiles
- `teacher_id`: Reference to teacher_profiles
- `date`: Attendance date
- `subject`: Subject for attendance
- `status`: Attendance status
- `notes`: Additional notes

#### content_management
Website content and news
```sql
CREATE TABLE content_management (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('news', 'announcement', 'program', 'event')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id INTEGER NOT NULL,
    image_url TEXT,
    category TEXT,
    tags TEXT,
    is_published BOOLEAN DEFAULT 0,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Primary key
- `type`: Content type
- `title`: Content title
- `content`: Full content
- `excerpt`: Short excerpt/summary
- `author_id`: Content author
- `image_url`: Featured image URL
- `category`: Content category
- `tags`: Comma-separated tags
- `is_published`: Publication status
- `published_at`: Publication timestamp

---

## 🐘 Supabase Database Schema (Alternative)

### Complete Schema Implementation

#### Core Tables

**student_profiles**
```sql
CREATE TABLE student_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nis TEXT UNIQUE,
    class TEXT,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

**teacher_profiles**
```sql
CREATE TABLE teacher_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nip TEXT UNIQUE,
    subject TEXT,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

**parent_profiles**
```sql
CREATE TABLE parent_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    student_id BIGINT REFERENCES student_profiles(id) ON DELETE CASCADE,
    relationship TEXT, -- 'father', 'mother', 'guardian'
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

**announcements**
```sql
CREATE TABLE announcements (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    published BOOLEAN DEFAULT FALSE
);
```

**assignments**
```sql
CREATE TABLE assignments (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    class TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### Security Features

#### Row Level Security (RLS) Policies
- **Student Profiles**: Students can only view/update their own profile
- **Teacher Profiles**: Teachers can only view/update their own profile
- **Parent Profiles**: Parents can only view/update their own profile
- **Announcements**: Everyone can view published announcements
- **Assignments**: Role-based access control

#### Trigger Functions
```sql
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔄 Database Migration

### D1 Migration Process

#### Initial Setup
```bash
# Create D1 database
wrangler d1 create malnu-kananga-db

# Add to wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "malnu-kananga-db"
database_id = "your_database_id"
```

#### Schema Migration
```bash
# Execute schema migration
wrangler d1 execute malnu-kananga-db --file=./schema.sql

# Execute individual migrations
wrangler d1 execute malnu-kananga-db --command="CREATE TABLE users (...)"
```

#### Data Seeding
```bash
# Seed initial data
wrangler d1 execute malnu-kananga-db --file=./seed.sql
```

### Supabase Migration Process

#### Using Supabase CLI
```bash
# Generate migration
supabase migration new add_student_profiles

# Apply migration
supabase db push

# Reset database
supabase db reset
```

---

## 🔍 Query Examples

### D1 Queries

#### Student Information
```sql
-- Get student with grades
SELECT 
    sp.name,
    sp.class,
    sp.gpa,
    g.subject,
    g.final_score,
    g.grade_letter
FROM student_profiles sp
LEFT JOIN grades g ON sp.id = g.student_id
WHERE sp.id = ?;
```

#### Attendance Report
```sql
-- Monthly attendance report
SELECT 
    DATE(date) as attendance_date,
    status,
    COUNT(*) as count
FROM attendance
WHERE student_id = ? 
    AND date >= date('now', '-1 month')
GROUP BY DATE(date), status
ORDER BY attendance_date DESC;
```

### Supabase Queries

#### Real-time Subscriptions
```javascript
// Subscribe to announcements
const subscription = supabase
  .channel('announcements')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'announcements' },
    (payload) => console.log('New announcement:', payload)
  )
  .subscribe()
```

#### Authenticated Queries
```javascript
// Get current user's student profile
const { data, error } = await supabase
  .from('student_profiles')
  .select('*')
  .eq('user_id', user.id)
  .single()
```

---

## 📊 Performance Optimization

### Indexes

#### D1 Indexes
```sql
-- User lookup optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Grade queries optimization
CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_subject ON grades(subject);

-- Attendance queries optimization
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
```

#### Supabase Indexes
```sql
-- Performance indexes (automatically created)
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_nis ON student_profiles(nis);
CREATE INDEX idx_student_profiles_class ON student_profiles(class);

-- Assignment queries
CREATE INDEX idx_assignments_class ON assignments(class);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
```

### Query Optimization Tips

1. **Use appropriate indexes** for frequently queried columns
2. **Limit result sets** with pagination
3. **Use prepared statements** for repeated queries
4. **Optimize JOIN operations** with proper foreign keys
5. **Cache frequently accessed data** in application layer

---

## 🔒 Security Considerations

### Data Protection
- **Encryption**: All data encrypted at rest
- **Access Control**: Role-based permissions
- **Audit Logging**: Track all data modifications
- **Backup**: Automated daily backups

### Privacy Compliance
- **Data Minimization**: Store only necessary data
- **Retention Policies**: Automatic data cleanup
- **Consent Management**: User consent tracking
- **Right to Deletion**: GDPR compliance

---

## 🚀 Production Deployment

### Environment Configuration

#### D1 Production
```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "malnu-kananga-prod"
database_id = "prod_database_id"

# Environment variables
[vars]
DATABASE_TYPE = "d1"
ENVIRONMENT = "production"
```

#### Supabase Production
```javascript
// Supabase client configuration
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
)
```

### Monitoring & Maintenance

#### Health Checks
```sql
-- Database connectivity test
SELECT 1 as health_check;

-- Table row counts
SELECT 
  'users' as table_name,
  COUNT(*) as row_count
FROM users
UNION ALL
SELECT 
  'student_profiles' as table_name,
  COUNT(*) as row_count
FROM student_profiles;
```

#### Performance Monitoring
- Query execution time tracking
- Index usage analysis
- Connection pool monitoring
- Storage usage tracking

---

## 📋 Schema Version History

### Version 1.0.0 (Current)
- Initial schema implementation
- Basic user management
- Academic tracking tables
- Content management system

### Planned Versions

#### Version 1.1.0
- Add messaging system tables
- Implement notification system
- Add file storage metadata

#### Version 1.2.0
- Enhanced analytics tables
- Audit logging system
- Performance metrics storage

---

## 🔗 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Database API endpoints
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Database setup instructions
- [Security Guide](./SECURITY_GUIDE.md) - Database security practices
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md) - Common database issues

---

## 📞 Support

For database-related questions:
- **Email**: db-support@ma-malnukananga.sch.id
- **Documentation**: Available in repository docs/ folder
- **Issues**: Report via GitHub Issues

---

*Database Schema Documentation Version: 1.0.0*  
*Last Updated: November 24, 2024*  
*Supported Databases: Cloudflare D1, Supabase PostgreSQL*  
*Schema Version: 1.0.0*