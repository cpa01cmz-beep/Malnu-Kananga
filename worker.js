// worker.js - Backend Serverless (Cloudflare Worker)
// Integrasi: D1 (Database), Vectorize (RAG Knowledge Base), Workers AI (Embeddings), R2 (File Storage)
// Fitur: JWT Auth, CRUD Operations, File Upload (R2)

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Generate unique ID
function generateId() {
  return crypto.randomUUID();
}

// Password hashing (SHA-256)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// JWT Token Generation & Verification
class JWT {
  static async generate(payload, secret, expiresIn = '24h') {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const exp = now + this.parseExpiresIn(expiresIn);
    
    const tokenPayload = { ...payload, iat: now, exp };
    
    const encoder = new TextEncoder();
    const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = this.base64UrlEncode(JSON.stringify(tokenPayload));
    const data = `${headerEncoded}.${payloadEncoded}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const signatureEncoded = this.base64UrlEncode(signature);
    
    return `${data}.${signatureEncoded}`;
  }
  
  static async verify(token, secret) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
      const encoder = new TextEncoder();
      const data = `${headerEncoded}.${payloadEncoded}`;
      
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );
      
      const signature = this.base64UrlDecode(signatureEncoded);
      const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
      
      if (!isValid) return null;
      
      const payload = JSON.parse(this.base64UrlDecode(payloadEncoded));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp < now) return null;
      
      return payload;
} catch {
      return null;
    }
  }
  
  static base64UrlEncode(str) {
    const encoded = typeof str === 'string' ? btoa(str) : btoa(String.fromCharCode(...new Uint8Array(str)));
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
  
  static base64UrlDecode(str) {
    const decoded = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    return decoded;
  }
  
  static parseExpiresIn(expiresIn) {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 86400; // Default 24 hours
    
    const [, value, unit] = match;
    const unitToSeconds = { s: 1, m: 60, h: 3600, d: 86400 };
    return parseInt(value) * unitToSeconds[unit];
  }
}

// Response helpers
const response = {
  success: (data, message = 'Success') => ({
    success: true,
    message,
    data
  }),
  error: (message) => ({
    success: false,
    message,
    error: message
  }),
  unauthorized: () => ({
    success: false,
    message: 'Unauthorized'
  })
};

// ============================================
// MIDDLEWARE
// ============================================

function corsHeaders(allowedOrigin) {
  return {
    'Access-Control-Allow-Origin': allowedOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const payload = await JWT.verify(token, env.JWT_SECRET);
  
  if (!payload) {
    return null;
  }
  
  // Check if session is still valid
  const session = await env.DB.prepare('SELECT * FROM sessions WHERE id = ? AND is_revoked = 0')
    .bind(payload.session_id)
    .first();
  
  if (!session) {
    return null;
  }
  
  // Update last accessed
  await env.DB.prepare('UPDATE sessions SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(session.id)
    .run();
  
  return payload;
}

// ============================================
// DATA SEEDER
// ============================================

const documents = [
  { id: "profil-1", text: "Profil Sekolah: Madrasah Aliyah MALNU Kananga adalah lembaga pendidikan menengah atas swasta di bawah Kementerian Agama. Didirikan pada tahun 2000 di Pandeglang, Banten." },
  { id: "profil-2", text: "Visi Sekolah: Visi MA Malnu Kananga adalah melahirkan peserta didik berakhlak mulia, unggul secara akademis, dan berjiwa wirausaha." },
  { id: "profil-3", text: "Misi Sekolah: Misi kami mencakup penguatan pendidikan agama Islam salafiyah, penerapan kurikulum nasional yang berkarakter, serta pengembangan literasi, numerasi, dan teknologi." },
  { id: "kurikulum-1", text: "Kurikulum: Kurikulum yang digunakan adalah perpaduan antara pendidikan salafiyah (tradisional) dengan pendidikan modern, termasuk keterampilan abad 21." },
  { id: "program-1", text: "Program Unggulan Tahfidz Al-Qur'an: Kami memiliki program intensif untuk menghafal Al-Qur'an yang dibimbing oleh ustadz dan ustadzah yang kompeten." },
  { id: "program-2", text: "Program Unggulan Kajian Kitab Kuning: Siswa akan mendalami khazanah Islam klasik melalui kajian kitab-kitab kuning yang diajarkan oleh para ahli." },
  { id: "ppdb-1", text: "Pendaftaran Peserta Didik Baru (PPDB): PPDB biasanya dibuka pada periode bulan Mei hingga Juni setiap tahunnya. Informasi resmi diumumkan di website." },
  { id: "ppdb-2", text: "Syarat Pendaftaran PPDB: Syarat umum pendaftaran adalah lulusan SMP/MTs, mengisi formulir pendaftaran, melampirkan fotokopi ijazah, dan dokumen pendukung lainnya yang akan diumumkan saat periode pendaftaran dibuka." },
  { id: "lokasi-1", text: "Lokasi dan Alamat: Sekolah kami berlokasi di Jalan Desa Kananga Km. 0,5, Kecamatan Menes, Kabupaten Pandeglang, Banten." },
  { id: "kontak-1", text: "Kontak Sekolah: Anda bisa menghubungi kami melalui email di info@ma-malnukananga.sch.id." },
];

// ============================================
// API HANDLERS
// ============================================

// Database Initialization
async function initDatabase(env) {
  // Create tables
  await env.DB.exec(`
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
      is_revoked BOOLEAN DEFAULT FALSE
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
  `);
  
  // Seed initial admin user if not exists
  const adminExists = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind('admin@malnu.sch.id')
    .first();
  
  if (!adminExists) {
    const adminId = generateId();
    const passwordHash = await hashPassword('admin123'); // Default password
    
    await env.DB.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(adminId, 'Ahmad Dahlan', 'admin@malnu.sch.id', passwordHash, 'admin', 'active').run();
  }
}

// Auth Handlers
async function handleLogin(request, env, corsHeaders) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(JSON.stringify(response.error('Email dan password diperlukan')), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND status = ?')
      .bind(email, 'active')
      .first();
    
    if (!user) {
      return new Response(JSON.stringify(response.error('Email atau password salah')), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Verify password
    const inputHash = await hashPassword(password);
    if (inputHash !== user.password_hash) {
      return new Response(JSON.stringify(response.error('Email atau password salah')), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Create session
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await env.DB.prepare(`
      INSERT INTO sessions (id, user_id, token, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(sessionId, user.id, sessionId, expiresAt.toISOString(), 
           request.headers.get('CF-Connecting-IP') || 'unknown',
           request.headers.get('User-Agent') || 'unknown').run();
    
    // Generate JWT
    const token = await JWT.generate({
      user_id: user.id,
      email: user.email,
      role: user.role,
      session_id: sessionId
    }, env.JWT_SECRET);
    
    return new Response(JSON.stringify(response.success({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        extraRole: user.extra_role,
        status: user.status
      },
      token
    }, 'Login berhasil')), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify(response.error('Terjadi kesalahan pada server', 500)), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleLogout(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    await env.DB.prepare('UPDATE sessions SET is_revoked = 1 WHERE id = ?')
      .bind(payload.session_id)
      .run();
    
    return new Response(JSON.stringify(response.success(null, 'Logout berhasil')), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify(response.error('Terjadi kesalahan pada server', 500)), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Generic CRUD Handler
async function handleCRUD(request, env, corsHeaders, table, _options = {}) {
  try {
    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const method = request.method;
    
    switch (method) {
      case 'GET': {
        if (id && id !== table) {
          const item = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
          if (!item) {
            return new Response(JSON.stringify(response.error('Data tidak ditemukan', 404)), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          return new Response(JSON.stringify(response.success(item)), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          const { results } = await env.DB.prepare(`SELECT * FROM ${table}`).all();
          return new Response(JSON.stringify(response.success(results)), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
        
      case 'POST': {
        const body = await request.json();
        const newItemId = generateId();
        const newItem = { id: newItemId, ...body };
        
        const columns = Object.keys(newItem).join(', ');
        const placeholders = Object.keys(newItem).map(() => '?').join(', ');
        const values = Object.values(newItem);
        
        await env.DB.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`).bind(...values).run();
        
        return new Response(JSON.stringify(response.success(newItem, 'Data berhasil dibuat')), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
        
      case 'PUT': {
        if (!id || id === table) {
          return new Response(JSON.stringify(response.error('ID diperlukan')), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const updateBody = await request.json();
        const updateSet = Object.keys(updateBody).map(key => `${key} = ?`).join(', ');
        const updateValues = [...Object.values(updateBody), id];
        
        await env.DB.prepare(`UPDATE ${table} SET ${updateSet} WHERE id = ?`).bind(...updateValues).run();
        
        return new Response(JSON.stringify(response.success(updateBody, 'Data berhasil diperbarui')), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
        
      case 'DELETE': {
        if (!id || id === table) {
          return new Response(JSON.stringify(response.error('ID diperlukan')), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
        
        return new Response(JSON.stringify(response.success(null, 'Data berhasil dihapus')), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
        
      default:
        return new Response(JSON.stringify(response.error('Method tidak didukung')), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (e) {
    console.error(`CRUD Error for table ${table}:`, e);
    return new Response(JSON.stringify(response.error('Terjadi kesalahan pada server', 500)), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// RAG Chat Handler
async function handleChat(request, env, corsHeaders) {
  try {
    const { message } = await request.json();
    
    if (!env.AI || !env.VECTORIZE_INDEX) {
      return new Response(JSON.stringify({ context: "" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [message] });
    const vectors = embeddings.data[0];
    
    const vectorQuery = await env.VECTORIZE_INDEX.query(vectors, { topK: 3, returnMetadata: true });
    
    let context = "";
    const SIMILARITY_CUTOFF = 0.55;
    
    if (vectorQuery.matches && vectorQuery.matches.length > 0) {
      const relevantMatches = vectorQuery.matches.filter(match => match.score > SIMILARITY_CUTOFF);
      if (relevantMatches.length > 0) {
        context = relevantMatches.map(match => match.metadata.text).join("\n\n---\n\n");
      }
    }
    
    return new Response(JSON.stringify({ context }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error("Worker RAG Error:", e);
    return new Response(JSON.stringify({ context: "" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Seed Handler
async function handleSeed(request, env, corsHeaders) {
  try {
    // Initialize database
    await initDatabase(env);

    // Seed Vectorize if available
    if (env.AI && env.VECTORIZE_INDEX) {
      const texts = documents.map(doc => doc.text);
      const embeddingsResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: texts });
      const vectors = embeddingsResponse.data;

      const vectorsToInsert = vectors.map((vector, i) => ({
        id: documents[i].id.toString(),
        values: vector,
        metadata: { text: documents[i].text }
      }));

      const batchSize = 100;
      for (let i = 0; i < vectorsToInsert.length; i += batchSize) {
        const batch = vectorsToInsert.slice(i, i + batchSize);
        await env.VECTORIZE_INDEX.insert(batch);
      }
    }

    return new Response(JSON.stringify(response.success(null, 'Database seeded successfully!')), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify(response.error(`Error seeding data: ${e.message}`)), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// R2 FILE STORAGE HANDLERS
// ============================================

async function handleFileUpload(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const customPath = formData.get('path');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify(response.error('No file provided')), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify(response.error('File size exceeds 50MB limit')), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'video/mp4'
    ];

    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify(response.error('File type not allowed')), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const defaultPath = `uploads/${payload.user_id}/${timestamp}`;
    const path = customPath || defaultPath;
    const key = `${path}/${sanitizedFilename}`;

    const arrayBuffer = await file.arrayBuffer();
    await env.BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type
      },
      customMetadata: {
        uploadedBy: payload.user_id,
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify(response.success({
      key,
      url: key,
      size: file.size,
      type: file.type,
      name: file.name
    }, 'File uploaded successfully')), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('File upload error:', e);
    return new Response(JSON.stringify(response.error('Failed to upload file')), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleFileDownload(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return new Response(JSON.stringify(response.error('Key parameter required')), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const object = await env.BUCKET.get(key);

    if (!object) {
      return new Response(JSON.stringify(response.error('File not found')), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.append('Content-Disposition', `inline; filename="${object.customMetadata?.originalName || 'download'}"`);
    headers.append('Access-Control-Allow-Origin', env.ALLOWED_ORIGIN || '*');

    return new Response(object.body, {
      headers,
    });
  } catch (e) {
    console.error('File download error:', e);
    return new Response(JSON.stringify(response.error('Failed to download file')), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleFileDelete(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return new Response(JSON.stringify(response.error('Key parameter required')), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    await env.BUCKET.delete(key);

    return new Response(JSON.stringify(response.success(null, 'File deleted successfully')), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('File delete error:', e);
    return new Response(JSON.stringify(response.error('Failed to delete file')), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleFileList(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const prefix = url.searchParams.get('prefix') || '';

    const listed = await env.BUCKET.list({
      prefix,
      limit: 100
    });

    const files = listed.objects.map(obj => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
      httpMetadata: {
        contentType: obj.httpMetadata?.contentType
      },
      customMetadata: obj.customMetadata
    }));

    return new Response(JSON.stringify(response.success(files, 'Files listed successfully')), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('File list error:', e);
    return new Response(JSON.stringify(response.error('Failed to list files')), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// MAIN HANDLER
// ============================================

export default {
  async fetch(request, env, _ctx) {
    const cors = corsHeaders(env.ALLOWED_ORIGIN);
    
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }
    
    const url = new URL(request.url);
    
    // Database initialization on first request
    if (!env.DB_INITIALIZED) {
      await initDatabase(env);
      env.DB_INITIALIZED = true;
    }
    
    // Route handlers
    const routes = {
      '/seed': handleSeed,
      '/api/chat': handleChat,
      '/auth/login': handleLogin,
      '/auth/logout': handleLogout,
      '/api/files/upload': handleFileUpload,
      '/api/files/download': handleFileDownload,
      '/api/files/delete': handleFileDelete,
      '/api/files/list': handleFileList,
      '/api/users': (r, e, c) => handleCRUD(r, e, c, 'users'),
      '/api/ppdb_registrants': (r, e, c) => handleCRUD(r, e, c, 'ppdb_registrants'),
      '/api/inventory': (r, e, c) => handleCRUD(r, e, c, 'inventory'),
      '/api/school_events': (r, e, c) => handleCRUD(r, e, c, 'school_events'),
      '/api/students': (r, e, c) => handleCRUD(r, e, c, 'students'),
      '/api/teachers': (r, e, c) => handleCRUD(r, e, c, 'teachers'),
      '/api/subjects': (r, e, c) => handleCRUD(r, e, c, 'subjects'),
      '/api/classes': (r, e, c) => handleCRUD(r, e, c, 'classes'),
      '/api/schedules': (r, e, c) => handleCRUD(r, e, c, 'schedules'),
      '/api/grades': (r, e, c) => handleCRUD(r, e, c, 'grades'),
      '/api/attendance': (r, e, c) => handleCRUD(r, e, c, 'attendance'),
      '/api/e_library': (r, e, c) => handleCRUD(r, e, c, 'e_library'),
      '/api/announcements': (r, e, c) => handleCRUD(r, e, c, 'announcements'),
    };
    
    for (const [path, handler] of Object.entries(routes)) {
      if (url.pathname.startsWith(path)) {
        return await handler(request, env, cors);
      }
    }
    
    return new Response(JSON.stringify(response.error('Endpoint tidak ditemukan', 404)), {
      status: 404,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  },
};
