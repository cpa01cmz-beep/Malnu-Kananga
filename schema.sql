-- ============================================
-- D1 Database Schema untuk MA Malnu Kananga
-- Cloudflare D1 (SQLite-based) Schema
-- ============================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================
-- 1. USERS TABLE (Core Authentication & Authorization)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- For future password-based auth if needed
  role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student', 'parent')),
  extra_role TEXT CHECK(extra_role IN ('staff', 'osis', NULL)),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by email and role
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- 2. STUDENTS TABLE (Extended Student Information)
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nisn TEXT UNIQUE,
  nis TEXT UNIQUE,
  class TEXT,
  class_name TEXT, -- e.g., "X-A", "XI-B", "XII-C"
  address TEXT,
  phone_number TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  date_of_birth DATE,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_name);

-- ============================================
-- 3. TEACHERS TABLE (Extended Teacher Information)
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nip TEXT UNIQUE,
  subjects TEXT, -- JSON array of subjects
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);

-- ============================================
-- 4. SUBJECTS TABLE (Mata Pelajaran)
-- ============================================
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  credit_hours INTEGER DEFAULT 2
);

-- ============================================
-- 5. CLASSES TABLE (Konfigurasi Kelas)
-- ============================================
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL, -- e.g., "X-A", "XI-B"
  homeroom_teacher_id TEXT, -- Wali Kelas
  academic_year TEXT NOT NULL, -- e.g., "2024/2025"
  semester TEXT NOT NULL CHECK(semester IN ('1', '2')),
  FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

-- ============================================
-- 6. SCHEDULES TABLE (Jadwal Pelajaran)
-- ============================================
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  day_of_week TEXT NOT NULL CHECK(day_of_week IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
  start_time TEXT NOT NULL, -- HH:MM format
  end_time TEXT NOT NULL, -- HH:MM format
  room TEXT,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_schedules_class ON schedules(class_id);

-- ============================================
-- 7. ATTENDANCE TABLE (Absensi)
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('hadir', 'sakit', 'izin', 'alpa')),
  notes TEXT,
  recorded_by TEXT NOT NULL, -- User ID of teacher/admin
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- ============================================
-- 8. GRADES TABLE (Nilai)
-- ============================================
CREATE TABLE IF NOT EXISTS grades (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  assignment_type TEXT NOT NULL, -- e.g., 'tugas', 'uts', 'uas', 'praktikum'
  assignment_name TEXT NOT NULL,
  score REAL NOT NULL CHECK(score >= 0 AND score <= 100),
  max_score REAL DEFAULT 100,
  created_by TEXT NOT NULL, -- User ID of teacher
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id);

-- ============================================
-- 9. PPDB_REGISTRANTS TABLE (Pendaftar Baru)
-- ============================================
CREATE TABLE IF NOT EXISTS ppdb_registrants (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  nisn TEXT UNIQUE NOT NULL,
  origin_school TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT, -- User ID of admin
  reviewed_at TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ppdb_status ON ppdb_registrants(status);

-- ============================================
-- 10. INVENTORY TABLE (Inventaris Sekolah)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity >= 0),
  condition TEXT NOT NULL CHECK(condition IN ('Baik', 'Rusak Ringan', 'Rusak Berat')),
  location TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_checked_by TEXT, -- User ID of staff/admin
  FOREIGN KEY (last_checked_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);

-- ============================================
-- 11. SCHOOL_EVENTS TABLE (Kegiatan Sekolah/OSIS)
-- ============================================
CREATE TABLE IF NOT EXISTS school_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'Upcoming' CHECK(status IN ('Upcoming', 'Ongoing', 'Completed')),
  organizer TEXT NOT NULL, -- e.g., 'OSIS', 'Admin', 'School'
  created_by TEXT NOT NULL, -- User ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_events_date ON school_events(date);

-- ============================================
-- 11.1 EVENT_REGISTRATIONS TABLE (Pendaftaran Kegiatan)
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attendance_status TEXT DEFAULT 'registered' CHECK(attendance_status IN ('registered', 'attended', 'absent')),
  notes TEXT,
  FOREIGN KEY (event_id) REFERENCES school_events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_student ON event_registrations(student_id);

-- ============================================
-- 11.2 EVENT_BUDGETS TABLE (Anggaran Kegiatan)
-- ============================================
CREATE TABLE IF NOT EXISTS event_budgets (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'Food', 'Decoration', 'Equipment', 'Venue', 'Marketing'
  item_name TEXT NOT NULL,
  estimated_cost REAL NOT NULL,
  actual_cost REAL,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'planned' CHECK(status IN ('planned', 'approved', 'purchased', 'completed')),
  approved_by TEXT, -- User ID of admin
  approved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES school_events(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_event_budgets_event ON event_budgets(event_id);
CREATE INDEX IF NOT EXISTS idx_event_budgets_status ON event_budgets(status);

-- ============================================
-- 11.3 EVENT_PHOTOS TABLE (Galeri Foto Kegiatan)
-- ============================================
CREATE TABLE IF NOT EXISTS event_photos (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  photo_url TEXT NOT NULL, -- Cloudflare R2 URL
  caption TEXT,
  uploaded_by TEXT NOT NULL, -- User ID
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES school_events(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_event_photos_event ON event_photos(event_id);

-- ============================================
-- 11.4 EVENT_FEEDBACK TABLE (Umpan Balik Kegiatan)
-- ============================================
CREATE TABLE IF NOT EXISTS event_feedback (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  overall_rating INTEGER CHECK(overall_rating >= 1 AND overall_rating <= 5),
  organization_rating INTEGER CHECK(organization_rating >= 1 AND organization_rating <= 5),
  content_rating INTEGER CHECK(content_rating >= 1 AND content_rating <= 5),
  comments TEXT,
  would_recommend BOOLEAN,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES school_events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_feedback_event ON event_feedback(event_id);
CREATE INDEX IF NOT EXISTS idx_event_feedback_student ON event_feedback(student_id);

-- ============================================
-- 12. E_LIBRARY TABLE (E-Library Materials)
-- ============================================
CREATE TABLE IF NOT EXISTS e_library (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- e.g., 'modul', 'buku', 'video', 'materi'
  file_url TEXT NOT NULL, -- Cloudflare R2 URL
  file_type TEXT NOT NULL, -- e.g., 'pdf', 'doc', 'mp4'
  file_size INTEGER, -- in bytes
  subject_id TEXT,
  uploaded_by TEXT NOT NULL, -- User ID (usually teacher)
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  download_count INTEGER DEFAULT 0,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_library_category ON e_library(category);

-- ============================================
-- 13. ANNOUNCEMENTS TABLE (Pengumuman Sekolah)
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('umum', 'akademik', 'kegiatan', 'keuangan')),
  target_audience TEXT, -- JSON array: ['all', 'admin', 'teacher', 'student', 'parent']
  is_active BOOLEAN DEFAULT TRUE,
  created_by TEXT NOT NULL, -- User ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);

-- ============================================
-- 14. SESSIONS TABLE (JWT Session Management)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  is_revoked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ============================================
-- 15. AUDIT_LOG TABLE (Audit Trail for Security)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_value TEXT, -- JSON string
  new_value TEXT, -- JSON string
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);

-- ============================================
-- 16. PARENT_STUDENT_RELATIONSHIP TABLE (Hubungan Wali Murid - Siswa)
-- ============================================
CREATE TABLE IF NOT EXISTS parent_student_relationship (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL CHECK(relationship_type IN ('ayah', 'ibu', 'wali')),
  is_primary_contact BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_relationship_parent ON parent_student_relationship(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_relationship_student ON parent_student_relationship(student_id);

-- ============================================
-- TRIGGERS for automatic timestamp updates
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_inventory_timestamp
AFTER UPDATE ON inventory
BEGIN
  UPDATE inventory SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================
-- VIEWS for common queries
-- ============================================

-- View: User profiles with extended info
CREATE VIEW IF NOT EXISTS user_profiles AS
SELECT
  u.id,
  u.name,
  u.email,
  u.role,
  u.extra_role,
  u.status,
  CASE
    WHEN u.role = 'student' THEN s.class_name
    WHEN u.role = 'teacher' THEN t.subjects
    ELSE NULL
  END as additional_info
FROM users u
LEFT JOIN students s ON u.id = s.user_id
LEFT JOIN teachers t ON u.id = t.user_id
WHERE u.status = 'active';

-- View: Student grades summary
CREATE VIEW IF NOT EXISTS student_grade_summary AS
SELECT
  g.student_id,
  s.class_name,
  subj.name as subject_name,
  g.assignment_type,
  g.assignment_name,
  g.score,
  g.max_score,
  g.created_at
FROM grades g
JOIN classes s ON g.class_id = s.id
JOIN subjects subj ON g.subject_id = subj.id
ORDER BY g.created_at DESC;
