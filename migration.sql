-- Migration script untuk setup database MA Malnu Kananga
-- Jalankan script ini di Cloudflare D1 untuk membuat semua tabel yang diperlukan

-- Tabel Featured Programs (konten statis homepage)
CREATE TABLE IF NOT EXISTS featured_programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Latest News (berita dan pengumuman)
CREATE TABLE IF NOT EXISTS latest_news (
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

-- Tabel Related Links (link eksternal)
CREATE TABLE IF NOT EXISTS related_links (
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

-- Tabel Teachers (data guru dan staff pengajar)
CREATE TABLE IF NOT EXISTS teachers (
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

-- Tabel Classes (data kelas dan wali kelas)
CREATE TABLE IF NOT EXISTS classes (
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

-- Tabel Subjects (mata pelajaran)
CREATE TABLE IF NOT EXISTS subjects (
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

-- Tabel Students (data siswa)
CREATE TABLE IF NOT EXISTS students (
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

-- Tabel Grades (nilai siswa per mata pelajaran)
CREATE TABLE IF NOT EXISTS grades (
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

-- Tabel Attendance (data absensi siswa)
CREATE TABLE IF NOT EXISTS attendance (
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

-- Tabel Schedule (jadwal pelajaran)
CREATE TABLE IF NOT EXISTS schedule (
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

-- Tabel Announcements (pengumuman sekolah)
CREATE TABLE IF NOT EXISTS announcements (
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

-- Indexes untuk Performance
CREATE INDEX IF NOT EXISTS idx_featured_programs_active ON featured_programs(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_latest_news_active ON latest_news(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_latest_news_category ON latest_news(category);
CREATE INDEX IF NOT EXISTS idx_latest_news_date ON latest_news(publish_date);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id, status);
CREATE INDEX IF NOT EXISTS idx_students_academic_year ON students(academic_year);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id, academic_year, semester);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id, academic_year, semester);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_schedule_class ON schedule(class_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_schedule_subject ON schedule(subject_id);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(publish_date);