# Database Schema Design untuk API Integration

## Overview
Strategi integrasi API untuk menggantikan mock data dengan backend Cloudflare D1 yang sesungguhnya.

## Database Tables

### 1. featured_programs
Konten statis untuk homepage
```sql
CREATE TABLE featured_programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. latest_news
Berita dan pengumuman sekolah
```sql
CREATE TABLE latest_news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    category TEXT NOT NULL,
    image_url TEXT,
    publish_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. related_links
Link eksternal untuk referensi
```sql
CREATE TABLE related_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    href TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    color_class TEXT,
    is_active BOOLEAN DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4. teachers
Data guru dan staff pengajar
```sql
CREATE TABLE teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    class_teacher TEXT,
    phone TEXT,
    profile_image TEXT,
    join_date DATE NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 5. classes
Data kelas dan wali kelas
```sql
CREATE TABLE classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    grade INTEGER NOT NULL,
    major TEXT NOT NULL,
    homeroom_teacher_id INTEGER,
    student_count INTEGER DEFAULT 0,
    academic_year TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id)
);
```

### 6. subjects
Mata pelajaran
```sql
CREATE TABLE subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    teacher_id INTEGER,
    credits INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);
```

### 7. students
Data siswa
```sql
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    class_id INTEGER,
    academic_year TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT,
    phone TEXT,
    parent_phone TEXT,
    profile_image TEXT,
    enrollment_date DATE NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);
```

### 8. grades
Nilai siswa per mata pelajaran
```sql
CREATE TABLE grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    academic_year TEXT NOT NULL,
    midterm_score REAL,
    final_score REAL,
    assignment_score REAL,
    attendance_score REAL,
    final_grade TEXT,
    grade_point REAL,
    status TEXT DEFAULT 'Lulus',
    notes TEXT,
    submitted_by INTEGER,
    submitted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (submitted_by) REFERENCES teachers(id)
);
```

### 9. attendance
Data absensi siswa
```sql
CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date DATE NOT NULL,
    subject_id INTEGER,
    status TEXT NOT NULL,
    notes TEXT,
    recorded_by INTEGER,
    recorded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (recorded_by) REFERENCES teachers(id)
);
```

### 10. schedule
Jadwal pelajaran
```sql
CREATE TABLE schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    day TEXT NOT NULL,
    time_start TEXT NOT NULL,
    time_end TEXT NOT NULL,
    room TEXT,
    type TEXT DEFAULT 'Teori',
    academic_year TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);
```

### 11. announcements
Pengumuman sekolah
```sql
CREATE TABLE announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'Sedang',
    target_audience TEXT,
    publish_date DATE NOT NULL,
    expiry_date DATE,
    is_read BOOLEAN DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES teachers(id)
);
```

## Indexes untuk Performance

```sql
-- Indexes untuk featured_programs
CREATE INDEX idx_featured_programs_active ON featured_programs(is_active, sort_order);

-- Indexes untuk latest_news
CREATE INDEX idx_latest_news_active ON latest_news(is_active, sort_order);
CREATE INDEX idx_latest_news_category ON latest_news(category);
CREATE INDEX idx_latest_news_date ON latest_news(publish_date);

-- Indexes untuk students
CREATE INDEX idx_students_class ON students(class_id, status);
CREATE INDEX idx_students_academic_year ON students(academic_year);

-- Indexes untuk grades
CREATE INDEX idx_grades_student ON grades(student_id, academic_year, semester);
CREATE INDEX idx_grades_subject ON grades(subject_id, academic_year, semester);

-- Indexes untuk attendance
CREATE INDEX idx_attendance_student ON attendance(student_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);

-- Indexes untuk schedule
CREATE INDEX idx_schedule_class ON schedule(class_id, academic_year);
CREATE INDEX idx_schedule_subject ON schedule(subject_id);
```

## Migration Strategy

1. **Phase 1**: Buat semua tabel dengan struktur dasar
2. **Phase 2**: Tambahkan indexes untuk performance
3. **Phase 3**: Seed data awal dari mock data
4. **Phase 4**: Validasi dan testing

## API Endpoints yang Dibutuhkan

### Featured Programs API
- GET /api/featured-programs (public)
- POST /api/featured-programs (admin)
- PUT /api/featured-programs/:id (admin)
- DELETE /api/featured-programs/:id (admin)

### News API
- GET /api/news (public)
- GET /api/news/:id (public)
- POST /api/news (admin/teacher)
- PUT /api/news/:id (admin/teacher)
- DELETE /api/news/:id (admin)

### Student Data API
- GET /api/students (teacher/admin)
- GET /api/students/:id (teacher/admin)
- GET /api/students/:id/grades (teacher/admin/student)
- GET /api/students/:id/attendance (teacher/admin/student)
- GET /api/students/:id/schedule (student/teacher)

### Teacher API
- GET /api/teachers (admin)
- GET /api/teachers/:id/classes (teacher)
- GET /api/teachers/:id/students (teacher)

### Grade Management API
- GET /api/grades (teacher/admin)
- POST /api/grades (teacher)
- PUT /api/grades/:id (teacher)
- GET /api/grades/student/:id (student/teacher/parent)

### Attendance API
- GET /api/attendance (teacher/admin)
- POST /api/attendance (teacher)
- PUT /api/attendance/:id (teacher)
- GET /api/attendance/student/:id (student/teacher/parent)

## Caching Strategy

### Client-side Caching
- Featured programs: Cache 1 jam
- Latest news: Cache 30 menit
- Student data: Cache 15 menit
- Grades: Cache 10 menit
- Attendance: Real-time (no cache)

### Server-side Caching (Cloudflare KV)
- Static content: Cache 24 jam
- User sessions: Cache 24 jam
- Frequently accessed data: Cache 1 jam

## Error Handling Strategy

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Field error message"
    }
  ]
}
```

## Security Considerations

1. **Authentication**: Semua endpoint kecuali public content memerlukan autentikasi
2. **Authorization**: Role-based access control (admin, teacher, student)
3. **Input Validation**: Validasi semua input untuk mencegah injection
4. **CORS**: Konfigurasi CORS yang ketat
5. **Rate Limiting**: Implementasi rate limiting untuk mencegah abuse

## Development vs Production

### Development Mode
- Menggunakan mock data untuk response yang cepat
- Logging detail untuk debugging
- Auto-reload pada perubahan

### Production Mode
- Query langsung ke database
- Caching untuk performa
- Error handling yang minimal untuk security
- Monitoring dan logging untuk analytics