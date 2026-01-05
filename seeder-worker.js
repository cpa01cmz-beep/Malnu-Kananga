/**
 * Cloudflare Worker for Database Seeding
 * 
 * This worker is used to initialize and seed the D1 database with initial data.
 * It creates all necessary tables and inserts default data including the admin user.
 * 
 * Usage:
 * 1. Deploy this worker: wrangler deploy --name malnu-kananga-seeder
 * 2. Trigger seeding: curl https://malnu-kananga-seeder.workers.dev/seed
 * 
 * Alternatively, use the /seed endpoint in the main worker after deployment.
 */

/* global crypto, TextEncoder */

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId() {
  return crypto.randomUUID();
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// DATABASE SCHEMA
// ============================================

const SCHEMA = `
  PRAGMA foreign_keys = ON;
  
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
    extra_role TEXT CHECK(extra_role IN ('staff', 'osis', NULL)),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    nisn TEXT UNIQUE,
    nis TEXT UNIQUE,
    class TEXT,
    class_name TEXT,
    address TEXT,
    phone_number TEXT,
    parent_name TEXT,
    parent_phone TEXT,
    date_of_birth DATE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  
  CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    nip TEXT UNIQUE,
    subjects TEXT,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  
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
    reviewed_by TEXT,
    reviewed_at TIMESTAMP,
    notes TEXT,
    document_url TEXT
  );
  
  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity >= 0),
    condition TEXT NOT NULL CHECK(condition IN ('Baik', 'Rusak Ringan', 'Rusak Berat')),
    location TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_checked_by TEXT
  );
  
  CREATE TABLE IF NOT EXISTS school_events (
    id TEXT PRIMARY KEY,
    event_name TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'Upcoming' CHECK(status IN ('Upcoming', 'Ongoing', 'Completed')),
    organizer TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    credit_hours INTEGER DEFAULT 2
  );
  
  CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    homeroom_teacher_id TEXT,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL CHECK(semester IN ('1', '2')),
    FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
  );
  
  CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    day_of_week TEXT NOT NULL CHECK(day_of_week IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room TEXT,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
  );
  
  CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('hadir', 'sakit', 'izin', 'alpa')),
    notes TEXT,
    recorded_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id)
  );
  
  CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL,
    assignment_type TEXT NOT NULL,
    assignment_name TEXT NOT NULL,
    score REAL NOT NULL CHECK(score >= 0 AND score <= 100),
    max_score REAL DEFAULT 100,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
  
  CREATE TABLE IF NOT EXISTS e_library (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    subject_id TEXT,
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_count INTEGER DEFAULT 0,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
  );
  
  CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('umum', 'akademik', 'kegiatan', 'keuangan')),
    target_audience TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  );
  
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
    refresh_token TEXT UNIQUE,
    refresh_token_expires_at TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_value TEXT,
    new_value TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// ============================================
// SEED DATA
// ============================================

async function seedDatabase(env) {
  try {
    // Create tables
    await env.DB.exec(SCHEMA);
    
    // Check if admin user already exists
    const existingAdmin = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind('admin@malnu.sch.id').first();
    
    if (!existingAdmin) {
      // Create default admin user
      const adminId = generateId();
      const adminPassword = await hashPassword('admin123');
      
      await env.DB.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        adminId,
        'Administrator',
        'admin@malnu.sch.id',
        adminPassword,
        'admin',
        'active'
      ).run();
      
      console.log('✓ Default admin user created');
      console.log('  Email: admin@malnu.sch.id');
      console.log('  Password: admin123');
      console.log('  ⚠ IMPORTANT: Change this password immediately after first login!');
    } else {
      console.log('✓ Admin user already exists');
    }
    
    // Seed some sample subjects
    const existingSubjects = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM subjects'
    ).first();
    
    if (existingSubjects.count === 0) {
      const subjects = [
        { name: 'Matematika', code: 'MTK', description: 'Matematika Dasar', credit_hours: 4 },
        { name: 'Bahasa Indonesia', code: 'BIN', description: 'Bahasa Indonesia', credit_hours: 3 },
        { name: 'Bahasa Arab', code: 'BAR', description: 'Bahasa Arab', credit_hours: 3 },
        { name: 'Fiqih', code: 'FIQ', description: 'Fiqih Ibadah', credit_hours: 3 },
        { name: 'Aqidah Akhlak', code: 'AA', description: 'Aqidah dan Akhlak', credit_hours: 2 },
        { name: 'IPA', code: 'IPA', description: 'Ilmu Pengetahuan Alam', credit_hours: 3 },
        { name: 'IPS', code: 'IPS', description: 'Ilmu Pengetahuan Sosial', credit_hours: 3 },
        { name: 'Bahasa Inggris', code: 'ING', description: 'English', credit_hours: 3 },
      ];
      
      for (const subject of subjects) {
        const subjectId = generateId();
        await env.DB.prepare(`
          INSERT INTO subjects (id, name, code, description, credit_hours)
          VALUES (?, ?, ?, ?, ?)
        `).bind(subjectId, subject.name, subject.code, subject.description, subject.credit_hours).run();
      }
      
      console.log('✓ Sample subjects seeded');
    }
    
    console.log('\n✓ Database seeded successfully!');
    
    return {
      success: true,
      message: 'Database seeded successfully',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    throw error;
  }
}

// ============================================
// WORKER HANDLERS
// ============================================

export default {
  async fetch(request, env, _ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Only allow GET /seed endpoint
    if (request.method === 'GET' && url.pathname === '/seed') {
      try {
        const result = await seedDatabase(env);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Health check endpoint
    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'malnu-kananga-seeder',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Default response
    return new Response(JSON.stringify({
      message: 'Database Seeder Worker',
      endpoints: {
        '/seed': 'GET - Seed the database with initial data',
        '/health': 'GET - Health check endpoint'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
