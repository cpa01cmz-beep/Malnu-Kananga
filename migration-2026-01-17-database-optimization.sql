-- ============================================
-- Database Optimization Migration
-- Created: 2026-01-17
-- Mode: OPTIMIZER MODE (Performance, Standardization)
-- ============================================
-- Purpose: Add composite indexes and optimize query performance
-- Impact: Reduced query execution time, improved JOIN performance
-- ============================================

-- ============================================
-- 1. COMPOSITE INDEXES for Multi-column Queries
-- ============================================

-- Grades: Frequently queried by student_id + academic_year + semester
CREATE INDEX IF NOT EXISTS idx_grades_student_year_semester ON grades(student_id, academic_year, semester);

-- Grades: Frequently queried by student_id + subject_id + class_id
CREATE INDEX IF NOT EXISTS idx_grades_student_subject_class ON grades(student_id, subject_id, class_id);

-- Grades: Academic filtering by class_id + academic_year + semester
CREATE INDEX IF NOT EXISTS idx_grades_class_year_semester ON grades(class_id, academic_year, semester);

-- Attendance: Range queries by student_id + date
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);

-- Attendance: Class-based filtering by class_id + date
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance(class_id, date);

-- Schedules: Daily schedule lookup by class_id + day_of_week + start_time
CREATE INDEX IF NOT EXISTS idx_schedules_class_day_time ON schedules(class_id, day_of_week, start_time);

-- Sessions: Active session lookup by user_id + is_revoked
CREATE INDEX IF NOT EXISTS idx_sessions_user_revoked ON sessions(user_id, is_revoked);

-- Sessions: Token refresh lookup by refresh_token + is_revoked
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_revoked ON sessions(refresh_token, is_revoked);

-- Parent-Student Relationship: Combined lookup (already UNIQUE, but explicit index helps optimizer)
CREATE INDEX IF NOT EXISTS idx_parent_rel_combined ON parent_student_relationship(parent_id, student_id);

-- Event Registrations: Event participant lookup
CREATE INDEX IF NOT EXISTS idx_event_reg_event_status ON event_registrations(event_id, attendance_status);

-- Event Feedback: Analysis by event + rating
CREATE INDEX IF NOT EXISTS idx_event_feedback_event_rating ON event_feedback(event_id, overall_rating);

-- E-Library: Filter by category + uploaded_at (for recent materials)
CREATE INDEX IF NOT EXISTS idx_library_category_uploaded ON e_library(category, uploaded_at);

-- ============================================
-- 2. JOIN OPTIMIZATION INDEXES
-- ============================================

-- Grades: JOIN with classes table
CREATE INDEX IF NOT EXISTS idx_grades_class_id ON grades(class_id);

-- Attendance: JOIN with classes table
CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON attendance(class_id);

-- Schedules: JOIN with subjects table
CREATE INDEX IF NOT EXISTS idx_schedules_subject_id ON schedules(subject_id);

-- Schedules: JOIN with teachers table
CREATE INDEX IF NOT EXISTS idx_schedules_teacher_id ON schedules(teacher_id);

-- PPDB Registrants: Status-based filtering + date
CREATE INDEX IF NOT EXISTS idx_ppdb_status_date ON ppdb_registrants(status, registration_date);

-- ============================================
-- 3. OPTIMIZED VIEWS for Common Queries
-- Note: D1 doesn't support CREATE OR REPLACE VIEW, using CREATE VIEW IF NOT EXISTS
-- ============================================

-- View: Active sessions with user details (for session validation)
CREATE VIEW IF NOT EXISTS active_sessions_with_users AS
SELECT
  s.id,
  s.user_id,
  u.name,
  u.email,
  u.role,
  u.extra_role,
  s.token,
  s.expires_at,
  s.last_accessed,
  s.ip_address
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.is_revoked = 0 AND s.expires_at > CURRENT_TIMESTAMP;

-- View: Student grades with full context (for parent/teacher dashboards)
CREATE VIEW IF NOT EXISTS student_grades_detail AS
SELECT
  g.id,
  g.student_id,
  u.name as student_name,
  s.class_name,
  g.subject_id,
  subj.name as subject_name,
  subj.code as subject_code,
  g.class_id,
  g.academic_year,
  g.semester,
  g.assignment_type,
  g.assignment_name,
  g.score,
  g.max_score,
  (g.score / g.max_score * 100) as percentage,
  g.created_at,
  g.created_by,
  tc.name as teacher_name
FROM grades g
JOIN students st ON g.student_id = st.id
JOIN users u ON st.user_id = u.id
JOIN classes s ON g.class_id = s.id
JOIN subjects subj ON g.subject_id = subj.id
LEFT JOIN teachers t ON g.created_by = t.id
LEFT JOIN users tc ON t.user_id = tc.id;

-- View: Attendance summary by class (for teacher/admin dashboards)
CREATE VIEW IF NOT EXISTS class_attendance_summary AS
SELECT
  a.class_id,
  c.name as class_name,
  a.date,
  COUNT(*) as total_students,
  SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END) as hadir,
  SUM(CASE WHEN a.status = 'sakit' THEN 1 ELSE 0 END) as sakit,
  SUM(CASE WHEN a.status = 'izin' THEN 1 ELSE 0 END) as izin,
  SUM(CASE WHEN a.status = 'alpa' THEN 1 ELSE 0 END) as alpa,
  ROUND((SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
FROM attendance a
JOIN classes c ON a.class_id = c.id
GROUP BY a.class_id, c.name, a.date
ORDER BY a.date DESC, c.name;

-- View: Event summary with registration counts
CREATE VIEW IF NOT EXISTS events_with_registration_counts AS
SELECT
  e.id,
  e.event_name,
  e.description,
  e.date,
  e.location,
  e.status,
  e.organizer,
  COUNT(DISTINCT er.id) as total_registrations,
  COUNT(DISTINCT CASE WHEN er.attendance_status = 'attended' THEN er.id END) as attended,
  COUNT(DISTINCT CASE WHEN er.attendance_status = 'registered' THEN er.id END) as registered,
  SUM(eb.estimated_cost) as total_estimated_budget,
  SUM(eb.actual_cost) as total_actual_cost
FROM school_events e
LEFT JOIN event_registrations er ON e.id = er.event_id
LEFT JOIN event_budgets eb ON e.id = eb.event_id
GROUP BY e.id, e.event_name, e.description, e.date, e.location, e.status, e.organizer
ORDER BY e.date DESC;

-- ============================================
-- 4. QUERY PERFORMANCE METRICS (Optional - for monitoring)
-- ============================================

-- Note: Cloudflare D1 does not support ANALYZE command
-- Performance can be monitored via Cloudflare Dashboard
-- Consider adding query execution time logging in application layer

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify indexes were created:
-- SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%';

-- View composite indexes:
-- SELECT * FROM sqlite_master WHERE type = 'index' AND sql LIKE '%,%';

-- Count total indexes:
-- SELECT COUNT(*) FROM sqlite_master WHERE type = 'index';
