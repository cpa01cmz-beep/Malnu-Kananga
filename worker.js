// worker.js - Backend Serverless (Cloudflare Worker)
// Integrasi: D1 (Database), Vectorize (RAG Knowledge Base), Workers AI (Embeddings), R2 (File Storage)
// Fitur: JWT Auth, CRUD Operations, File Upload (R2)

// ============================================
// ============================================
// LOGGER UTILITY
// ============================================

class WorkerLogger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.level = level;
    }
  }

  shouldLog(level) {
    return this.levels[level] >= this.levels[this.level];
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return [prefix, message, ...args];
  }

  debug(message, ...args) {
    if (this.shouldLog('debug')) {
      console.debug(...this.formatMessage('debug', message, ...args));
    }
  }

  info(message, ...args) {
    if (this.shouldLog('info')) {
      console.info(...this.formatMessage('info', message, ...args));
    }
  }

  warn(message, ...args) {
    if (this.shouldLog('warn')) {
      console.warn(...this.formatMessage('warn', message, ...args));
    }
  }

  error(message, ...args) {
    if (this.shouldLog('error')) {
      console.error(...this.formatMessage('error', message, ...args));
    }
  }
}

const logger = new WorkerLogger();

// ============================================
// RATE LIMITING MIDDLEWARE
// ============================================

class RateLimiter {
  constructor(kv, options = {}) {
    this.kv = kv;
    this.windowMs = options.windowMs || 60000; // Default: 1 minute
    this.maxRequests = options.maxRequests || 100; // Default: 100 requests per window
    this.prefix = options.prefix || 'rate_limit';
  }

  async check(identifier, options = {}) {
    const windowMs = options.windowMs || this.windowMs;
    const maxRequests = options.maxRequests || this.maxRequests;
    const now = Date.now();
    const windowStart = now - windowMs;
    const key = `${this.prefix}:${identifier}`;

    try {
      const existing = await this.kv.get(key, 'json');
      const requests = existing ? existing.filter(r => r.timestamp > windowStart) : [];

      const _remaining = Math.max(0, maxRequests - requests.length);
      const resetAt = requests.length > 0 ? requests[0].timestamp + windowMs : now + windowMs;

      if (requests.length >= maxRequests) {
        return {
          success: false,
          remaining: 0,
          resetAt,
          limit: maxRequests,
          retryAfter: Math.ceil((resetAt - now) / 1000)
        };
      }

      requests.push({ timestamp: now });
      await this.kv.put(key, JSON.stringify(requests), {
        expirationTtl: Math.ceil(windowMs / 1000)
      });

      return {
        success: true,
        remaining: maxRequests - requests.length,
        resetAt,
        limit: maxRequests
      };
    } catch (_error) {
      logger.error('Rate limit check failed:', _error);
      return {
        success: true,
        remaining: maxRequests,
        resetAt: now + windowMs,
        limit: maxRequests
      };
    }
  }

  async getRateLimitInfo(identifier) {
    const key = `${this.prefix}:${identifier}`;
    try {
      const existing = await this.kv.get(key, 'json');
      if (!existing) {
        return {
          limit: this.maxRequests,
          remaining: this.maxRequests,
          resetAt: Date.now() + this.windowMs
        };
      }

      const windowStart = Date.now() - this.windowMs;
      const recentRequests = existing.filter(r => r.timestamp > windowStart);
      const resetAt = recentRequests.length > 0
        ? recentRequests[0].timestamp + this.windowMs
        : Date.now() + this.windowMs;

      return {
        limit: this.maxRequests,
        remaining: Math.max(0, this.maxRequests - recentRequests.length),
        resetAt
      };
    } catch (_error) {
      logger.error('Get rate limit info failed:', _error);
      return {
        limit: this.maxRequests,
        remaining: this.maxRequests,
        resetAt: Date.now() + this.windowMs
      };
    }
  }
}

// Rate limit configuration per endpoint type
const RATE_LIMIT_CONFIG = {
  default: { windowMs: 60000, maxRequests: 100 },
  auth: { windowMs: 60000, maxRequests: 5 },
  sensitive: { windowMs: 60000, maxRequests: 20 },
  upload: { windowMs: 60000, maxRequests: 10 },
  websocket: { windowMs: 60000, maxRequests: 30 }
};

function getRateLimitConfig(pathname, method) {
  if (pathname.startsWith('/api/auth/')) {
    return RATE_LIMIT_CONFIG.auth;
  }
  if (pathname === '/api/files/upload' || pathname === '/ws') {
    return RATE_LIMIT_CONFIG.upload;
  }
  if (pathname === '/api/email/send' || pathname.startsWith('/api/users') && method !== 'GET') {
    return RATE_LIMIT_CONFIG.sensitive;
  }
  return RATE_LIMIT_CONFIG.default;
}

async function applyRateLimit(request, env) {
  if (!env.RATE_LIMIT_KV) {
    return null;
  }

  const rateLimiter = new RateLimiter(env.RATE_LIMIT_KV);
  const pathname = new URL(request.url).pathname;
  const method = request.method;
  const config = getRateLimitConfig(pathname, method);

  let identifier;
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = JSON.parse(atob(token.split('.')[1]));
      identifier = payload.userId || payload.sub;
    } catch (_e) {
      identifier = request.headers.get('CF-Connecting-IP') || 'unknown';
    }
  } else {
    identifier = request.headers.get('CF-Connecting-IP') || 'unknown';
  }

  const result = await rateLimiter.check(identifier, config);

  return {
    result,
    identifier
  };
}

function setRateLimitHeaders(headers, result) {
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString());

  if (!result.success) {
    headers.set('Retry-After', result.retryAfter.toString());
  }

  return headers;
}

// ============================================
// ERROR MESSAGE CONSTANTS
// ============================================

const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Data yang dimasukkan tidak valid',
  MISSING_REQUIRED_FIELDS: 'Field yang diperlukan tidak ada',
  ID_REQUIRED: 'ID diperlukan',
  EMAIL_PASSWORD_REQUIRED: 'Email dan password diperlukan',
  INVALID_CREDENTIALS: 'Email atau password salah',
  REFRESH_TOKEN_REQUIRED: 'Refresh token diperlukan',
  INVALID_REFRESH_TOKEN: 'Refresh token tidak valid atau kadaluarsa',
  UNAUTHORIZED: 'Akses ditolak',
  FORBIDDEN: 'Anda tidak memiliki izin untuk mengakses resource ini',
  NOT_FOUND: 'Data tidak ditemukan',
  METHOD_NOT_SUPPORTED: 'Metode tidak didukung',
  SERVER_ERROR: 'Terjadi kesalahan pada server',
  DATABASE_ERROR: 'Gagal mengakses database',
  FILE_NOT_PROVIDED: 'File tidak diberikan',
  FILE_SIZE_EXCEEDED: 'Ukuran file melebihi batas maksimal 50MB',
  FILE_TYPE_NOT_ALLOWED: 'Tipe file tidak diizinkan',
  FILE_UPLOAD_FAILED: 'Gagal mengunggah file',
  FILE_NOT_FOUND: 'File tidak ditemukan',
  FILE_DOWNLOAD_FAILED: 'Gagal mengunduh file',
  FILE_DELETE_FAILED: 'Gagal menghapus file',
  KEY_REQUIRED: 'Parameter key diperlukan',
  R2_NOT_ENABLED: 'Penyimpanan R2 tidak diaktifkan',
  MISSING_EMAIL_FIELDS: 'Field wajib tidak ada: to, subject, html',
  EMAIL_PROVIDER_NOT_CONFIGURED: 'Penyedia email tidak dikonfigurasi',
  UNSUPPORTED_EMAIL_PROVIDER: 'Penyedia email tidak didukung',
  EMAIL_SEND_FAILED: 'Gagal mengirim email',
  SEED_FAILED: 'Gagal menyimpan data awal',
  CHAT_FAILED: 'Gagal memproses pesan chat',
  PARENT_ACCESS_DENIED: 'Akses ditolak: Bukan orang tua dari siswa ini',
  STUDENT_NOT_FOUND: 'Data siswa tidak ditemukan',
  FAILED_GET_CHILDREN: 'Gagal mengambil data anak',
  FAILED_GET_GRADES: 'Gagal mengambil data nilai',
  FAILED_GET_ATTENDANCE: 'Gagal mengambil data kehadiran',
  FAILED_GET_SCHEDULE: 'Gagal mengambil jadwal',
  STUDENT_ID_REQUIRED: 'student_id parameter required',
  AI_SERVICE_UNAVAILABLE: 'Layanan AI tidak tersedia saat ini',
  ENDPOINT_NOT_FOUND: 'Endpoint tidak ditemukan',
  WS_AUTH_FAILED: 'Autentikasi WebSocket gagal',
  WS_CONNECTION_LIMIT: 'Batas koneksi tercapai',
  WS_INVALID_MESSAGE: 'Pesan WebSocket tidak valid',
  WS_UNAUTHORIZED: 'Tidak memiliki izin untuk berlangganan event ini',
  EMAIL_REQUIRED: 'Email diperlukan',
  RESET_TOKEN_REQUIRED: 'Reset token diperlukan',
  NEW_PASSWORD_REQUIRED: 'Password baru diperlukan',
  INVALID_RESET_TOKEN: 'Token reset password tidak valid atau kadaluarsa',
  USER_NOT_FOUND: 'Pengguna tidak ditemukan',
  EMAIL_ALREADY_EXISTS: 'Email sudah terdaftar',
  RESET_TOKEN_EXPIRED: 'Token reset password kadaluarsa',
  SAME_PASSWORD_ERROR: 'Password baru tidak boleh sama dengan password lama',
  RATE_LIMIT_EXCEEDED: 'Terlalu banyak permintaan. Silakan coba lagi nanti.'
};

const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

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
  error: (message, status = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) => ({
    success: false,
    message,
    error: message,
    status
  }),
  unauthorized: () => ({
    success: false,
    message: ERROR_MESSAGES.UNAUTHORIZED,
    error: ERROR_MESSAGES.UNAUTHORIZED,
    status: HTTP_STATUS_CODES.UNAUTHORIZED
  })
};

// ============================================
// MIDDLEWARE
// ============================================

function corsHeaders(allowedOrigin, requestOrigin) {
  // Security: Prevent CSRF by validating origins
  const validOrigins = allowedOrigin ? allowedOrigin.split(',').map(o => o.trim()) : [];
  
  // If no specific origins configured, deny all requests
  if (validOrigins.length === 0) {
    return {
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Methods': '',
      'Access-Control-Allow-Headers': '',
      'Access-Control-Max-Age': '0',
    };
  }
  
  // Check if request origin is in allowed list
  const isOriginAllowed = validOrigins.includes(requestOrigin) || 
                          validOrigins.includes('*');
  
  // Only return credentials for specific origins, never with wildcard
  const origin = isOriginAllowed ? (validOrigins.includes('*') ? requestOrigin : requestOrigin) : 'null';
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': isOriginAllowed ? 'GET, POST, PUT, DELETE, OPTIONS' : '',
    'Access-Control-Allow-Headers': isOriginAllowed ? 'Content-Type, Authorization' : '',
    'Access-Control-Allow-Credentials': isOriginAllowed && validOrigins.includes(requestOrigin) ? 'true' : 'false',
    'Access-Control-Max-Age': isOriginAllowed ? '86400' : '0',
    'Vary': 'Origin'
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
  try {
    // Enable foreign keys
    try {
      const pragmaResult = await env.DB.exec('PRAGMA foreign_keys = ON;');
      logger.info('Foreign keys enabled:', pragmaResult);
    } catch (pragmaError) {
      logger.warn('PRAGMA error:', pragmaError);
      // Continue even if PRAGMA fails
    }

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student', 'parent')),
        extra_role TEXT CHECK(extra_role IN ('staff', 'osis', NULL)),
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await env.DB.exec(`
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
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        nip TEXT UNIQUE,
        subjects TEXT,
        join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await env.DB.exec(`
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
    `);

    await env.DB.exec(`
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
    `);

    await env.DB.exec(`
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
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        credit_hours INTEGER DEFAULT 2
      );
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        homeroom_teacher_id TEXT,
        academic_year TEXT NOT NULL,
        semester TEXT NOT NULL CHECK(semester IN ('1', '2')),
        FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
      );
    `);

    await env.DB.exec(`
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
    `);

    await env.DB.exec(`
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
    `);

    await env.DB.exec(`
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
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('assignment', 'project', 'quiz', 'exam', 'lab_work', 'presentation', 'homework', 'other')),
        subject_id TEXT NOT NULL,
        class_id TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        academic_year TEXT NOT NULL,
        semester TEXT NOT NULL,
        max_score REAL NOT NULL DEFAULT 100,
        due_date TIMESTAMP NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'closed', 'archived')),
        instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS assignment_attachments (
        id TEXT PRIMARY KEY,
        assignment_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
      );
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS assignment_rubrics (
        id TEXT PRIMARY KEY,
        assignment_id TEXT NOT NULL,
        total_score REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
      );
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS rubric_criteria (
        id TEXT PRIMARY KEY,
        rubric_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        max_score REAL NOT NULL,
        weight REAL NOT NULL CHECK(weight >= 0 AND weight <= 100),
        FOREIGN KEY (rubric_id) REFERENCES assignment_rubrics(id) ON DELETE CASCADE
      );
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id TEXT PRIMARY KEY,
        assignment_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        submission_text TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        score REAL,
        feedback TEXT,
        graded_by TEXT,
        graded_at TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'late', 'graded')),
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS submission_attachments (
        id TEXT PRIMARY KEY,
        submission_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES assignment_submissions(id) ON DELETE CASCADE
      );
    `);

    await env.DB.exec(`
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
    `);

    await env.DB.exec(`
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
    `);

    await env.DB.exec(`
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
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_used BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await env.DB.exec(`
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
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS event_budgets (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        category TEXT NOT NULL,
        item_name TEXT NOT NULL,
        estimated_cost REAL NOT NULL,
        actual_cost REAL,
        quantity INTEGER DEFAULT 1,
        status TEXT DEFAULT 'planned' CHECK(status IN ('planned', 'approved', 'purchased', 'completed')),
        approved_by TEXT,
        approved_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES school_events(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS event_photos (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        photo_url TEXT NOT NULL,
        caption TEXT,
        uploaded_by TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES school_events(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    await env.DB.exec(`
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
    `);

    await env.DB.exec(`
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

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS parent_student_relationship (
        id TEXT PRIMARY KEY,
        parent_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        relationship_type TEXT NOT NULL CHECK(relationship_type IN ('ayah', 'ibu', 'wali')),
        is_primary_contact BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(parent_id, student_id)
      );
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS email_delivery_log (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        to_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('queued', 'sent', 'delivered', 'bounced', 'complained', 'opened', 'clicked')),
        provider TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('direct', 'group')),
        name TEXT,
        description TEXT,
        avatar TEXT,
        created_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP,
        is_online BOOLEAN DEFAULT FALSE,
        is_admin BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(conversation_id, user_id)
      );
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        recipient_id TEXT,
        message_type TEXT NOT NULL CHECK(message_type IN ('text', 'image', 'file', 'audio', 'video')),
        content TEXT NOT NULL,
        file_url TEXT,
        file_name TEXT,
        file_size INTEGER,
        file_type TEXT,
        status TEXT DEFAULT 'sent' CHECK(status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
        reply_to TEXT,
        metadata TEXT,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS message_read_receipts (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(message_id, user_id)
      );
    `);

    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS typing_indicators (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        is_typing BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Seed initial admin user if not exists
    const adminExists = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind('admin@malnu.sch.id')
      .first();

    if (!adminExists) {
      const adminId = generateId();
      const passwordHash = await hashPassword('admin123');

      await env.DB.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(adminId, 'Ahmad Dahlan', 'admin@malnu.sch.id', passwordHash, 'admin', 'active').run();
    }
  } catch (e) {
    logger.error('Database initialization error:', e);
    throw e;
  }
}

// Auth Handlers
async function handleLogin(request, env, corsHeaders) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.EMAIL_PASSWORD_REQUIRED, HTTP_STATUS_CODES.BAD_REQUEST)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND status = ?')
      .bind(email, 'active')
      .first();

    if (!user) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS_CODES.UNAUTHORIZED)), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const inputHash = await hashPassword(password);
    if (inputHash !== user.password_hash) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS_CODES.UNAUTHORIZED)), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const sessionId = generateId();
    const refreshToken = generateId();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes for access token
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days for refresh token
    
    await env.DB.prepare(`
      INSERT INTO sessions (id, user_id, token, expires_at, ip_address, user_agent, refresh_token, refresh_token_expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(sessionId, user.id, sessionId, expiresAt.toISOString(),
           request.headers.get('CF-Connecting-IP') || 'unknown',
           request.headers.get('User-Agent') || 'unknown',
           refreshToken, refreshTokenExpiresAt.toISOString()).run();
    
    // Generate JWT (access token - short-lived)
    const token = await JWT.generate({
      user_id: user.id,
      email: user.email,
      role: user.role,
      extra_role: user.extra_role,
      session_id: sessionId
    }, env.JWT_SECRET, '15m');
    
    return new Response(JSON.stringify(response.success({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        extraRole: user.extra_role,
        status: user.status
      },
      token,
      refreshToken
    }, 'Login berhasil')), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleLogout(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare('UPDATE sessions SET is_revoked = 1, refresh_token = NULL WHERE id = ?')
      .bind(payload.session_id)
      .run();

    return new Response(JSON.stringify(response.success(null, 'Logout berhasil')), {
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleRefreshToken(request, env, corsHeaders) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.REFRESH_TOKEN_REQUIRED)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const session = await env.DB.prepare(`
      SELECT s.*, u.id, u.email, u.role, u.extra_role, u.name, u.status
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.refresh_token = ? AND s.is_revoked = 0 AND s.refresh_token_expires_at > CURRENT_TIMESTAMP
    `).bind(refreshToken).first();

    if (!session) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.INVALID_REFRESH_TOKEN)), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes for new access token

    await env.DB.prepare(`
      UPDATE sessions SET expires_at = ?, last_accessed = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(expiresAt.toISOString(), session.id).run();

    const newToken = await JWT.generate({
      user_id: session.user_id,
      email: session.email,
      role: session.role,
      extra_role: session.extra_role,
      session_id: session.id
    }, env.JWT_SECRET, '15m');

    return new Response(JSON.stringify(response.success({
      token: newToken
    }, 'Token berhasil diperbarui')), {
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleForgotPassword(request, env, corsHeaders) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.EMAIL_REQUIRED, HTTP_STATUS_CODES.BAD_REQUEST)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const user = await env.DB.prepare('SELECT id, email, name FROM users WHERE email = ? AND status = ?')
      .bind(email, 'active')
      .first();

    if (!user) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND)), {
        status: HTTP_STATUS_CODES.NOT_FOUND,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = generateId();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await env.DB.prepare(`
      INSERT INTO password_reset_tokens (id, user_id, token, email, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(generateId(), user.id, token, email, expiresAt.toISOString()).run();

    const resetLink = `${request.headers.get('Origin') || 'https://ma-malnukananga.sch.id'}/reset-password?token=${token}`;

    await sendPasswordResetEmail(env, user, resetLink);

    return new Response(JSON.stringify(response.success({
      message: 'Email reset password telah dikirim'
    }, 'Jika email terdaftar, Anda akan menerima link reset password')), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleVerifyResetToken(request, env, corsHeaders) {
  try {
    const { token } = await request.json();

    if (!token) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.RESET_TOKEN_REQUIRED, HTTP_STATUS_CODES.BAD_REQUEST)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const resetToken = await env.DB.prepare(`
      SELECT * FROM password_reset_tokens
      WHERE token = ? AND is_used = FALSE AND expires_at > CURRENT_TIMESTAMP
    `).bind(token).first();

    if (!resetToken) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.INVALID_RESET_TOKEN, HTTP_STATUS_CODES.UNAUTHORIZED)), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(response.success({
      valid: true,
      email: resetToken.email
    }, 'Token valid')), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleResetPassword(request, env, corsHeaders) {
  try {
    const { token, password } = await request.json();

    if (!token) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.RESET_TOKEN_REQUIRED, HTTP_STATUS_CODES.BAD_REQUEST)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!password) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.NEW_PASSWORD_REQUIRED, HTTP_STATUS_CODES.BAD_REQUEST)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const resetToken = await env.DB.prepare(`
      SELECT * FROM password_reset_tokens
      WHERE token = ? AND is_used = FALSE AND expires_at > CURRENT_TIMESTAMP
    `).bind(token).first();

    if (!resetToken) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.INVALID_RESET_TOKEN, HTTP_STATUS_CODES.UNAUTHORIZED)), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const user = await env.DB.prepare('SELECT password_hash FROM users WHERE id = ?')
      .bind(resetToken.user_id)
      .first();

    if (!user) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND)), {
        status: HTTP_STATUS_CODES.NOT_FOUND,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const newPasswordHash = await hashPassword(password);

    if (newPasswordHash === user.password_hash) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.SAME_PASSWORD_ERROR, HTTP_STATUS_CODES.BAD_REQUEST)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(newPasswordHash, resetToken.user_id)
      .run();

    await env.DB.prepare('UPDATE password_reset_tokens SET is_used = TRUE WHERE id = ?')
      .bind(resetToken.id)
      .run();

    await env.DB.prepare('UPDATE sessions SET is_revoked = TRUE WHERE user_id = ?')
      .bind(resetToken.user_id)
      .run();

    return new Response(JSON.stringify(response.success(null, 'Password berhasil direset. Silakan login dengan password baru.')), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function sendPasswordResetEmail(env, user, resetLink) {
  try {
    const emailData = {
      to: [{ email: user.email, name: user.name }],
      subject: 'Reset Password - MA Malnu Kananga',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .warning { background: #fef3c7; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .footer { background: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Password</h1>
            </div>
            <div class="content">
              <p>Yth. ${user.name},</p>
              <p>Kami menerima permintaan untuk mereset password Anda.</p>
              <p>Klik tombol di bawah ini untuk mereset password:</p>
              <p><a href="${resetLink}" class="button">Reset Password</a></p>
              <p>Atau copy link berikut ke browser:</p>
              <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
              <div class="warning">
                <p><strong>Penting:</strong></p>
                <ul>
                  <li>Link ini hanya berlaku selama 1 jam</li>
                  <li>Jika Anda tidak meminta reset password, abaikan email ini</li>
                </ul>
              </div>
              <p>Terima kasih,</p>
              <p><strong>MA Malnu Kananga</strong></p>
            </div>
            <div class="footer">
              <p>Email ini dikirim secara otomatis, jangan balas ke email ini.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Yth. ${user.name},

Kami menerima permintaan untuk mereset password Anda.

Klik link berikut untuk mereset password:
${resetLink}

Penting:
- Link ini hanya berlaku selama 1 jam
- Jika Anda tidak meminta reset password, abaikan email ini

Terima kasih,
MA Malnu Kananga

Email ini dikirim secara otomatis, jangan balas ke email ini.`
    };

    const emailProvider = env.EMAIL_PROVIDER || 'cloudflare';

    if (emailProvider === 'cloudflare' && env.SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: emailData.to.map(r => ({ email: r.email, name: r.name || '' })),
            subject: emailData.subject
          }],
          from: { email: env.EMAIL_FROM || 'noreply@ma-malnukananga.sch.id' },
          content: [
            { type: 'text/plain', value: emailData.text },
            { type: 'text/html', value: emailData.html }
          ]
        })
      });

      if (!response.ok) {
        logger.error('Failed to send password reset email via SendGrid:', await response.text());
      } else {
        logger.info('Password reset email sent to:', user.email);
      }
    } else {
      logger.warn('Email provider not configured for password reset');
    }
  } catch (error) {
    logger.error('Error sending password reset email:', error);
  }
}

// Generic CRUD Handler
async function handleCRUD(request, env, corsHeaders, table, _options = {}) {
  try {
    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
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
            return new Response(JSON.stringify(response.error(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND)), {
              status: HTTP_STATUS_CODES.NOT_FOUND,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          return new Response(JSON.stringify(response.success(item)), {
            status: HTTP_STATUS_CODES.OK,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          const { results } = await env.DB.prepare(`SELECT * FROM ${table}`).all();
          return new Response(JSON.stringify(response.success(results)), {
            status: HTTP_STATUS_CODES.OK,
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
          status: HTTP_STATUS_CODES.CREATED,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'PUT': {
        if (!id || id === table) {
          return new Response(JSON.stringify(response.error(ERROR_MESSAGES.ID_REQUIRED)), {
            status: HTTP_STATUS_CODES.BAD_REQUEST,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const updateBody = await request.json();
        const updateSet = Object.keys(updateBody).map(key => `${key} = ?`).join(', ');
        const updateValues = [...Object.values(updateBody), id];

        await env.DB.prepare(`UPDATE ${table} SET ${updateSet} WHERE id = ?`).bind(...updateValues).run();

        return new Response(JSON.stringify(response.success(updateBody, 'Data berhasil diperbarui')), {
          status: HTTP_STATUS_CODES.OK,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'DELETE': {
        if (!id || id === table) {
          return new Response(JSON.stringify(response.error(ERROR_MESSAGES.ID_REQUIRED)), {
            status: HTTP_STATUS_CODES.BAD_REQUEST,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();

        return new Response(JSON.stringify(response.success(null, 'Data berhasil dihapus')), {
          status: HTTP_STATUS_CODES.OK,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify(response.error(ERROR_MESSAGES.METHOD_NOT_SUPPORTED)), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch {
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleChat(request, env, corsHeaders) {
  try {
    const { message } = await request.json();

    if (!env.AI || !env.VECTORIZE_INDEX) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.AI_SERVICE_UNAVAILABLE, HTTP_STATUS_CODES.SERVICE_UNAVAILABLE || 503)), {
        status: HTTP_STATUS_CODES.SERVICE_UNAVAILABLE || 503,
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
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    logger.error("Worker RAG Error:", e);
    return new Response(JSON.stringify({ context: "" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Seed Handler
async function handleSeed(request, env, corsHeaders) {
  try {
    logger.info('Starting database seeding...');

    // Initialize database
    await initDatabase(env);
    logger.info('Database tables created');

    // Seed Vectorize if available
    try {
      if (env.AI && env.VECTORIZE_INDEX) {
        const texts = documents.map(doc => doc.text);
        const embeddingsResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: texts });
        const vectors = embeddingsResponse.data || [];

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
        logger.info('Vectorize seeded');
      }
    } catch (aiError) {
      logger.warn('AI/Vectorize seeding skipped:', aiError.message);
    }

    logger.info('Seed completed successfully');
    return new Response(JSON.stringify(response.success(null, 'Database seeded successfully!')), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('Seed error:', e);
    logger.error('Error details:', JSON.stringify(e));
    return new Response(JSON.stringify(response.error(`${ERROR_MESSAGES.SEED_FAILED}: ${e.message}`)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// R2 FILE STORAGE HANDLERS
// ============================================

async function handleFileUpload(request, env, corsHeaders) {
  try {
    if (!env.BUCKET) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.R2_NOT_ENABLED, 503)), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const customPath = formData.get('path');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.FILE_NOT_PROVIDED, HTTP_STATUS_CODES.BAD_REQUEST)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.FILE_SIZE_EXCEEDED, HTTP_STATUS_CODES.BAD_REQUEST)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
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
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.FILE_TYPE_NOT_ALLOWED, HTTP_STATUS_CODES.BAD_REQUEST)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
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
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('File upload error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.FILE_UPLOAD_FAILED, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleFileDownload(request, env, corsHeaders) {
  try {
    if (!env.BUCKET) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.R2_NOT_ENABLED, 503)), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.KEY_REQUIRED, HTTP_STATUS_CODES.BAD_REQUEST)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const object = await env.BUCKET.get(key);

    if (!object) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.FILE_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND)), {
        status: HTTP_STATUS_CODES.NOT_FOUND,
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
    logger.error('File download error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.FILE_DOWNLOAD_FAILED, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleFileDelete(request, env, corsHeaders) {
  try {
    if (!env.BUCKET) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.R2_NOT_ENABLED, 503)), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.KEY_REQUIRED, HTTP_STATUS_CODES.BAD_REQUEST)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    await env.BUCKET.delete(key);

    return new Response(JSON.stringify(response.success(null, 'File deleted successfully')), {
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('File delete error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.FILE_DELETE_FAILED, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleFileList(request, env, corsHeaders) {
  try {
    if (!env.BUCKET) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.R2_NOT_ENABLED, 503)), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
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
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('File list error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.DATABASE_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// EMAIL SERVICE HANDLERS
// ============================================

async function handleSendEmail(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { to, cc, bcc, subject, html, text, attachments, trackDelivery, _priority } = await request.json();

    if (!to || !subject || !html) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.MISSING_EMAIL_FIELDS)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!env.EMAIL_PROVIDER) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.EMAIL_PROVIDER_NOT_CONFIGURED)), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const messageId = generateId();

    let sendResult;
    switch (env.EMAIL_PROVIDER.toLowerCase()) {
      case 'sendgrid':
        sendResult = await sendViaSendGrid(env, { to, cc, bcc, subject, html, text, attachments });
        break;
      case 'mailgun':
        sendResult = await sendViaMailgun(env, { to, cc, bcc, subject, html, text, attachments });
        break;
      case 'cloudflare-email':
        sendResult = await sendViaCloudflareEmail(env, { to, cc, bcc, subject, html, text, attachments });
        break;
      default:
        return new Response(JSON.stringify(response.error(ERROR_MESSAGES.UNSUPPORTED_EMAIL_PROVIDER)), {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    if (sendResult.success) {
      if (trackDelivery) {
        await env.DB.prepare(`
          INSERT INTO email_delivery_log (id, message_id, user_id, to_email, subject, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(generateId(), messageId, payload.user_id, Array.isArray(to) ? to[0].email : to.email, subject, 'sent', new Date().toISOString()).run();
      }

      return new Response(JSON.stringify(response.success({
        messageId,
        provider: env.EMAIL_PROVIDER
      }, 'Email sent successfully')), {
        status: HTTP_STATUS_CODES.OK,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify(response.error(sendResult.error || ERROR_MESSAGES.EMAIL_SEND_FAILED)), {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (e) {
    logger.error('Send email error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.EMAIL_SEND_FAILED, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function sendViaSendGrid(env, { to, cc, bcc, subject, html, text, attachments }) {
  try {
    const sendGridApiKey = env.SENDGRID_API_KEY;
    if (!sendGridApiKey) {
      return { success: false, error: 'SendGrid API key not configured' };
    }

    const toEmails = Array.isArray(to) ? to : [to];
    const ccEmails = cc ? (Array.isArray(cc) ? cc : [cc]) : [];
    const bccEmails = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [];
    
    const personalizations = toEmails.map(email => ({
      to: [{ email: email.email, name: email.name || '' }],
      cc: ccEmails.map(e => ({ email: e.email, name: e.name || '' })),
      bcc: bccEmails.map(e => ({ email: e.email, name: e.name || '' }))
    }));

    const body = {
      personalizations,
      from: { email: env.FROM_EMAIL || env.SENDGRID_FROM_EMAIL, name: env.FROM_NAME || env.SENDGRID_FROM_NAME || 'MA Malnu Kananga' },
      subject,
      content: [
        { type: 'text/plain', value: text || html.replace(/<[^>]*>/g, '') },
        { type: 'text/html', value: html }
      ]
    };

    if (attachments && attachments.length > 0) {
      body.attachments = attachments.map(att => ({
        content: Buffer.from(att.content).toString('base64'),
        filename: att.filename,
        type: att.contentType,
        disposition: 'attachment'
      }));
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorText = await response.text();
      return { success: false, error: errorText || 'SendGrid API error' };
    }
  } catch (e) {
    return { success: false, error: e.message || 'SendGrid sending failed' };
  }
}

async function sendViaMailgun(env, { to, cc, bcc, subject, html, text, attachments }) {
  try {
    const mailgunApiKey = env.MAILGUN_API_KEY;
    const mailgunDomain = env.MAILGUN_DOMAIN;
    
    if (!mailgunApiKey || !mailgunDomain) {
      return { success: false, error: 'Mailgun credentials not configured' };
    }

    const toEmails = Array.isArray(to) ? to.map(t => `${t.name ? `${t.name} <${t.email}>` : t.email}`).join(',') : `${to.name ? `${to.name} <${to.email}>` : to.email}`;
    
    const formData = new FormData();
    formData.append('from', env.FROM_EMAIL || env.MAILGUN_FROM_EMAIL || env.MAILGUN_FROM);
    formData.append('to', toEmails);
    if (cc) {
      const ccEmails = Array.isArray(cc) ? cc : [cc];
      formData.append('cc', ccEmails.map(c => `${c.name ? `${c.name} <${c.email}>` : c.email}`).join(','));
    }
    if (bcc) {
      const bccEmails = Array.isArray(bcc) ? bcc : [bcc];
      formData.append('bcc', bccEmails.map(b => `${b.name ? `${b.name} <${b.email}>` : b.email}`).join(','));
    }
    formData.append('subject', subject);
    formData.append('html', html);
    if (text) {
      formData.append('text', text);
    }

    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        const blob = att.content instanceof ArrayBuffer ? new Blob([att.content]) : new Blob([att.content]);
        formData.append('attachment', blob, att.filename);
      }
    }

    const auth = btoa(`api:${mailgunApiKey}`);
    const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`
      },
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, messageId: result.id };
    } else {
      const errorText = await response.text();
      return { success: false, error: errorText || 'Mailgun API error' };
    }
  } catch (e) {
    return { success: false, error: e.message || 'Mailgun sending failed' };
  }
}

async function sendViaCloudflareEmail(env, { to, cc, _bcc, subject, html, text, _attachments }) {
  try {
    const cloudflareApiKey = env.CLOUDFLARE_EMAIL_API_KEY;
    if (!cloudflareApiKey) {
      return { success: false, error: 'Cloudflare Email API key not configured' };
    }

    const toEmails = Array.isArray(to) ? to : [to];
    const ccEmails = cc ? (Array.isArray(cc) ? cc : [cc]) : [];

    const body = {
      to: toEmails.map(e => ({ email: e.email, name: e.name || '' })),
      cc: ccEmails.map(e => ({ email: e.email, name: e.name || '' })),
      from: { email: env.FROM_EMAIL || 'noreply@ma-malnukananga.sch.id', name: env.FROM_NAME || 'MA Malnu Kananga' },
      subject,
      content: {
        text: text || html.replace(/<[^>]*>/g, ''),
        html
      }
    };

    const response = await fetch('https://api.cloudflare.com/client/v4/email/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cloudflareApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, messageId: result.id };
    } else {
      const errorText = await response.text();
      return { success: false, error: errorText || 'Cloudflare Email API error' };
    }
  } catch (e) {
    return { success: false, error: e.message || 'Cloudflare Email sending failed' };
  }
}

// ============================================
// PARENT API HANDLERS
// ============================================

async function handleGetChildren(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload || payload.role !== 'parent') {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const children = await env.DB.prepare(`
      SELECT
        psr.id as relationship_id,
        psr.relationship_type,
        psr.is_primary_contact,
        s.id as student_id,
        s.nisn,
        s.nis,
        s.class,
        s.class_name,
        s.date_of_birth,
        u.name as student_name,
        u.email as student_email,
        c.name as class_name_full,
        c.academic_year,
        c.semester
      FROM parent_student_relationship psr
      JOIN students s ON psr.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class = c.name
      WHERE psr.parent_id = ?
      ORDER BY psr.is_primary_contact DESC, u.name ASC
    `).bind(payload.user_id).all();

    return new Response(JSON.stringify(response.success(children, 'Data anak berhasil diambil')), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('Get children error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.FAILED_GET_CHILDREN, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetChildGrades(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload || payload.role !== 'parent') {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const studentId = url.searchParams.get('student_id');

    if (!studentId) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.STUDENT_ID_REQUIRED)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const relationship = await env.DB.prepare(`
      SELECT * FROM parent_student_relationship
      WHERE parent_id = ? AND student_id = ?
    `).bind(payload.user_id, studentId).first();

    if (!relationship) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.PARENT_ACCESS_DENIED)), {
        status: HTTP_STATUS_CODES.FORBIDDEN,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const grades = await env.DB.prepare(`
      SELECT
        g.id,
        g.assignment_type,
        g.assignment_name,
        g.score,
        g.max_score,
        g.created_at,
        subj.name as subject_name,
        subj.code as subject_code,
        c.name as class_name,
        g.academic_year,
        g.semester
      FROM grades g
      JOIN subjects subj ON g.subject_id = subj.id
      JOIN classes c ON g.class_id = c.id
      WHERE g.student_id = ?
      ORDER BY g.created_at DESC
    `).bind(studentId).all();

    return new Response(JSON.stringify(response.success(grades, 'Data nilai berhasil diambil')), {
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('Get child grades error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.FAILED_GET_GRADES, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetChildAttendance(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload || payload.role !== 'parent') {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const studentId = url.searchParams.get('student_id');

    if (!studentId) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.STUDENT_ID_REQUIRED)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const relationship = await env.DB.prepare(`
      SELECT * FROM parent_student_relationship
      WHERE parent_id = ? AND student_id = ?
    `).bind(payload.user_id, studentId).first();

    if (!relationship) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.PARENT_ACCESS_DENIED)), {
        status: HTTP_STATUS_CODES.FORBIDDEN,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const attendance = await env.DB.prepare(`
      SELECT
        a.id,
        a.date,
        a.status,
        a.notes,
        a.created_at,
        c.name as class_name
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC
      LIMIT 50
    `).bind(studentId).all();

    return new Response(JSON.stringify(response.success(attendance, 'Data kehadiran berhasil diambil')), {
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('Get child attendance error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.FAILED_GET_ATTENDANCE, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetChildSchedule(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload || payload.role !== 'parent') {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const studentId = url.searchParams.get('student_id');

    if (!studentId) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.STUDENT_ID_REQUIRED)), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const relationship = await env.DB.prepare(`
      SELECT * FROM parent_student_relationship
      WHERE parent_id = ? AND student_id = ?
    `).bind(payload.user_id, studentId).first();

    if (!relationship) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.PARENT_ACCESS_DENIED)), {
        status: HTTP_STATUS_CODES.FORBIDDEN,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const student = await env.DB.prepare('SELECT class FROM students WHERE id = ?')
      .bind(studentId)
      .first();

    if (!student) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.STUDENT_NOT_FOUND)), {
        status: HTTP_STATUS_CODES.NOT_FOUND,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const classData = await env.DB.prepare('SELECT id FROM classes WHERE name = ?')
      .bind(student.class)
      .first();

    if (!classData) {
      return new Response(JSON.stringify(response.success([], 'Jadwal kosong')), {
        status: HTTP_STATUS_CODES.OK,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const schedules = await env.DB.prepare(`
      SELECT
        s.id,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.room,
        subj.name as subject_name,
        subj.code as subject_code,
        u.name as teacher_name
      FROM schedules s
      JOIN subjects subj ON s.subject_id = subj.id
      JOIN teachers t ON s.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE s.class_id = ?
      ORDER BY
        CASE s.day_of_week
          WHEN 'Senin' THEN 1
          WHEN 'Selasa' THEN 2
          WHEN 'Rabu' THEN 3
          WHEN 'Kamis' THEN 4
          WHEN 'Jumat' THEN 5
          WHEN 'Sabtu' THEN 6
          WHEN 'Minggu' THEN 7
        END,
        s.start_time
    `).bind(classData.id).all();

    return new Response(JSON.stringify(response.success(schedules, 'Jadwal berhasil diambil')), {
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('Get child schedule error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.FAILED_GET_SCHEDULE, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// ASSIGNMENTS HANDLERS
// ============================================

async function handleAssignments(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const method = request.method;
    const subjectId = url.searchParams.get('subject_id');
    const classId = url.searchParams.get('class_id');
    const teacherId = url.searchParams.get('teacher_id');
    const status = url.searchParams.get('status');

    switch (method) {
      case 'GET': {
        if (id && id !== 'assignments') {
          const assignment = await env.DB.prepare(`
            SELECT 
              a.*,
              subj.name as subject_name,
              c.name as class_name,
              u.name as teacher_name
            FROM assignments a
            LEFT JOIN subjects subj ON a.subject_id = subj.id
            LEFT JOIN classes c ON a.class_id = c.id
            LEFT JOIN users u ON a.teacher_id = u.id
            WHERE a.id = ?
          `).bind(id).first();

          if (!assignment) {
            return new Response(JSON.stringify(response.error(ERROR_MESSAGES.NOT_FOUND)), {
              status: HTTP_STATUS_CODES.NOT_FOUND,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          assignment.attachments = await env.DB.prepare(`
            SELECT * FROM assignment_attachments WHERE assignment_id = ?
          `).bind(id).all();

          if (assignment.rubric) {
            assignment.rubric.criteria = await env.DB.prepare(`
              SELECT * FROM rubric_criteria WHERE rubric_id = ?
            `).bind(assignment.rubric.id).all();
          }

          return new Response(JSON.stringify(response.success(assignment)), {
            status: HTTP_STATUS_CODES.OK,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          let query = `
            SELECT 
              a.*,
              subj.name as subject_name,
              c.name as class_name,
              u.name as teacher_name
            FROM assignments a
            LEFT JOIN subjects subj ON a.subject_id = subj.id
            LEFT JOIN classes c ON a.class_id = c.id
            LEFT JOIN users u ON a.teacher_id = u.id
            WHERE 1=1
          `;
          const params: string[] = [];

          if (subjectId) {
            query += ` AND a.subject_id = ?`;
            params.push(subjectId);
          }
          if (classId) {
            query += ` AND a.class_id = ?`;
            params.push(classId);
          }
          if (teacherId) {
            query += ` AND a.teacher_id = ?`;
            params.push(teacherId);
          }
          if (status) {
            query += ` AND a.status = ?`;
            params.push(status);
          }

          query += ` ORDER BY a.created_at DESC`;

          const stmt = env.DB.prepare(query);
          const result = await stmt.bind(...params).all();

          for (const assignment of result.results) {
            assignment.attachments = await env.DB.prepare(`
              SELECT * FROM assignment_attachments WHERE assignment_id = ?
            `).bind(assignment.id).all();

            const rubric = await env.DB.prepare(`
              SELECT * FROM assignment_rubrics WHERE assignment_id = ?
            `).bind(assignment.id).first();

            if (rubric) {
              rubric.criteria = await env.DB.prepare(`
                SELECT * FROM rubric_criteria WHERE rubric_id = ?
              `).bind(rubric.id).all();
              assignment.rubric = rubric;
            }
          }

          return new Response(JSON.stringify(response.success(result.results)), {
            status: HTTP_STATUS_CODES.OK,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      case 'POST': {
        const body = await request.json();
        const assignmentId = crypto.randomUUID();

        await env.DB.prepare(`
          INSERT INTO assignments (
            id, title, description, type, subject_id, class_id, teacher_id,
            academic_year, semester, max_score, due_date, status, instructions
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          assignmentId,
          body.title,
          body.description,
          body.type,
          body.subjectId,
          body.classId,
          body.teacherId,
          body.academicYear,
          body.semester,
          body.maxScore,
          body.dueDate,
          body.status,
          body.instructions || null
        ).run();

        if (body.attachments && body.attachments.length > 0) {
          for (const attachment of body.attachments) {
            await env.DB.prepare(`
              INSERT INTO assignment_attachments (
                id, assignment_id, file_name, file_url, file_type, file_size, uploaded_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
              crypto.randomUUID(),
              assignmentId,
              attachment.fileName,
              attachment.fileUrl,
              attachment.fileType,
              attachment.fileSize,
              attachment.uploadedAt
            ).run();
          }
        }

        if (body.rubric) {
          const rubricId = crypto.randomUUID();
          await env.DB.prepare(`
            INSERT INTO assignment_rubrics (id, assignment_id, total_score, created_at)
            VALUES (?, ?, ?, ?)
          `).bind(
            rubricId,
            assignmentId,
            body.rubric.totalScore,
            new Date().toISOString()
          ).run();

          if (body.rubric.criteria && body.rubric.criteria.length > 0) {
            for (const criteria of body.rubric.criteria) {
              await env.DB.prepare(`
                INSERT INTO rubric_criteria (
                  id, rubric_id, name, description, max_score, weight
                ) VALUES (?, ?, ?, ?, ?, ?)
              `).bind(
                criteria.id,
                rubricId,
                criteria.name,
                criteria.description,
                criteria.maxScore,
                criteria.weight
              ).run();
            }
          }
        }

        const created = await env.DB.prepare(`
          SELECT 
            a.*,
            subj.name as subject_name,
            c.name as class_name,
            u.name as teacher_name
          FROM assignments a
          LEFT JOIN subjects subj ON a.subject_id = subj.id
          LEFT JOIN classes c ON a.class_id = c.id
          LEFT JOIN users u ON a.teacher_id = u.id
          WHERE a.id = ?
        `).bind(assignmentId).first();

        return new Response(JSON.stringify(response.success(created, 'Tugas berhasil dibuat')), {
          status: HTTP_STATUS_CODES.CREATED,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'PUT': {
        const body = await request.json();

        const existing = await env.DB.prepare(`
          SELECT * FROM assignments WHERE id = ?
        `).bind(id).first();

        if (!existing) {
          return new Response(JSON.stringify(response.error(ERROR_MESSAGES.NOT_FOUND)), {
            status: HTTP_STATUS_CODES.NOT_FOUND,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await env.DB.prepare(`
          UPDATE assignments SET
            title = ?,
            description = ?,
            type = ?,
            subject_id = ?,
            class_id = ?,
            max_score = ?,
            due_date = ?,
            instructions = ?,
            updated_at = ?
          WHERE id = ?
        `).bind(
          body.title,
          body.description,
          body.type,
          body.subjectId,
          body.classId,
          body.maxScore,
          body.dueDate,
          body.instructions,
          new Date().toISOString(),
          id
        ).run();

        const updated = await env.DB.prepare(`
          SELECT 
            a.*,
            subj.name as subject_name,
            c.name as class_name,
            u.name as teacher_name
          FROM assignments a
          LEFT JOIN subjects subj ON a.subject_id = subj.id
          LEFT JOIN classes c ON a.class_id = c.id
          LEFT JOIN users u ON a.teacher_id = u.id
          WHERE a.id = ?
        `).bind(id).first();

        return new Response(JSON.stringify(response.success(updated, 'Tugas berhasil diperbarui')), {
          status: HTTP_STATUS_CODES.OK,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'DELETE': {
        const existing = await env.DB.prepare(`
          SELECT * FROM assignments WHERE id = ?
        `).bind(id).first();

        if (!existing) {
          return new Response(JSON.stringify(response.error(ERROR_MESSAGES.NOT_FOUND)), {
            status: HTTP_STATUS_CODES.NOT_FOUND,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await env.DB.prepare(`DELETE FROM assignments WHERE id = ?`).bind(id).run();

        return new Response(JSON.stringify(response.success(null, 'Tugas berhasil dihapus')), {
          status: HTTP_STATUS_CODES.OK,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify(response.error(ERROR_MESSAGES.METHOD_NOT_ALLOWED)), {
          status: HTTP_STATUS_CODES.METHOD_NOT_ALLOWED,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (e) {
    logger.error('Assignment handler error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handlePublishAssignment(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').slice(0, -1).pop();

    const existing = await env.DB.prepare(`
      SELECT * FROM assignments WHERE id = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.NOT_FOUND)), {
        status: HTTP_STATUS_CODES.NOT_FOUND,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare(`
      UPDATE assignments SET status = 'published', published_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      new Date().toISOString(),
      new Date().toISOString(),
      id
    ).run();

    const updated = await env.DB.prepare(`
      SELECT 
        a.*,
        subj.name as subject_name,
        c.name as class_name,
        u.name as teacher_name
      FROM assignments a
      LEFT JOIN subjects subj ON a.subject_id = subj.id
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN users u ON a.teacher_id = u.id
      WHERE a.id = ?
    `).bind(id).first();

    return new Response(JSON.stringify(response.success(updated, 'Tugas berhasil dipublikasikan')), {
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('Publish assignment error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleCloseAssignment(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').slice(0, -1).pop();

    const existing = await env.DB.prepare(`
      SELECT * FROM assignments WHERE id = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.NOT_FOUND)), {
        status: HTTP_STATUS_CODES.NOT_FOUND,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare(`
      UPDATE assignments SET status = 'closed', updated_at = ?
      WHERE id = ?
    `).bind(
      new Date().toISOString(),
      id
    ).run();

    const updated = await env.DB.prepare(`
      SELECT
        a.*,
        subj.name as subject_name,
        c.name as class_name,
        u.name as teacher_name
      FROM assignments a
      LEFT JOIN subjects subj ON a.subject_id = subj.id
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN users u ON a.teacher_id = u.id
      WHERE a.id = ?
    `).bind(id).first();

    return new Response(JSON.stringify(response.success(updated, 'Tugas berhasil ditutup')), {
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('Close assignment error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleAssignmentSubmissions(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const method = request.method;
    const id = url.pathname.split('/').pop();
    const assignmentId = url.searchParams.get('assignment_id');
    const studentId = url.searchParams.get('student_id');

    switch (method) {
      case 'GET': {
        if (id && id !== 'submissions') {
          const submission = await env.DB.prepare(`
            SELECT s.*, a.title as assignment_title, a.due_date
            FROM assignment_submissions s
            LEFT JOIN assignments a ON s.assignment_id = a.id
            WHERE s.id = ?
          `).bind(id).first();

          if (!submission) {
            return new Response(JSON.stringify(response.error(ERROR_MESSAGES.NOT_FOUND)), {
              status: HTTP_STATUS_CODES.NOT_FOUND,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          submission.attachments = await env.DB.prepare(`
            SELECT * FROM submission_attachments WHERE submission_id = ?
          `).bind(id).all();

          return new Response(JSON.stringify(response.success(submission)), {
            status: HTTP_STATUS_CODES.OK,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          let query = `
            SELECT s.*, a.title as assignment_title, a.due_date, a.max_score
            FROM assignment_submissions s
            LEFT JOIN assignments a ON s.assignment_id = a.id
            WHERE 1=1
          `;
          const params: string[] = [];

          if (assignmentId) {
            query += ` AND s.assignment_id = ?`;
            params.push(assignmentId);
          }
          if (studentId) {
            query += ` AND s.student_id = ?`;
            params.push(studentId);
          }

          query += ` ORDER BY s.submitted_at DESC`;

          const stmt = env.DB.prepare(query);
          const result = await stmt.bind(...params).all();

          for (const submission of result.results) {
            submission.attachments = await env.DB.prepare(`
              SELECT * FROM submission_attachments WHERE submission_id = ?
            `).bind(submission.id).all();
          }

          return new Response(JSON.stringify(response.success(result.results)), {
            status: HTTP_STATUS_CODES.OK,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      case 'POST': {
        const body = await request.json();
        const submissionId = crypto.randomUUID();

        const assignment = await env.DB.prepare(`
          SELECT * FROM assignments WHERE id = ?
        `).bind(body.assignmentId).first();

        if (!assignment) {
          return new Response(JSON.stringify(response.error('Tugas tidak ditemukan')), {
            status: HTTP_STATUS_CODES.NOT_FOUND,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const dueDate = new Date(assignment.due_date);
        const submittedAt = new Date(body.submittedAt || new Date().toISOString());
        const isLate = submittedAt > dueDate;
        const status = isLate ? 'late' : 'submitted';

        await env.DB.prepare(`
          INSERT INTO assignment_submissions (
            id, assignment_id, student_id, student_name,
            submission_text, submitted_at, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          submissionId,
          body.assignmentId,
          body.studentId,
          body.studentName,
          body.submissionText || null,
          submittedAt.toISOString(),
          status
        ).run();

        if (body.attachments && body.attachments.length > 0) {
          for (const attachment of body.attachments) {
            await env.DB.prepare(`
              INSERT INTO submission_attachments (
                id, submission_id, file_name, file_url, file_type, file_size, uploaded_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
              crypto.randomUUID(),
              submissionId,
              attachment.fileName,
              attachment.fileUrl,
              attachment.fileType,
              attachment.fileSize,
              attachment.uploadedAt
            ).run();
          }
        }

        const created = await env.DB.prepare(`
          SELECT s.*, a.title as assignment_title, a.due_date, a.max_score
          FROM assignment_submissions s
          LEFT JOIN assignments a ON s.assignment_id = a.id
          WHERE s.id = ?
        `).bind(submissionId).first();

        created.attachments = await env.DB.prepare(`
          SELECT * FROM submission_attachments WHERE submission_id = ?
        `).bind(submissionId).all();

        return new Response(JSON.stringify(response.success(created, 'Tugas berhasil dikirim')), {
          status: HTTP_STATUS_CODES.CREATED,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'PUT': {
        const body = await request.json();

        const existing = await env.DB.prepare(`
          SELECT * FROM assignment_submissions WHERE id = ?
        `).bind(id).first();

        if (!existing) {
          return new Response(JSON.stringify(response.error(ERROR_MESSAGES.NOT_FOUND)), {
            status: HTTP_STATUS_CODES.NOT_FOUND,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const now = new Date().toISOString();
        const isGrading = body.score !== undefined || body.feedback !== undefined;

        await env.DB.prepare(`
          UPDATE assignment_submissions SET
            submission_text = COALESCE(?, submission_text),
            submitted_at = COALESCE(?, submitted_at),
            status = COALESCE(?, status),
            score = COALESCE(?, score),
            feedback = COALESCE(?, feedback),
            graded_by = CASE WHEN ? IS NOT NULL THEN ? ELSE graded_by END,
            graded_at = CASE WHEN ? IS NOT NULL THEN ? ELSE graded_at END,
            updated_at = ?
          WHERE id = ?
        `).bind(
          body.submissionText,
          body.submittedAt,
          body.status,
          body.score !== undefined ? body.score : null,
          body.feedback,
          body.gradedBy,
          body.gradedBy,
          body.gradedBy,
          isGrading ? now : null,
          now,
          id
        ).run();

        const updated = await env.DB.prepare(`
          SELECT s.*, a.title as assignment_title, a.due_date, a.max_score
          FROM assignment_submissions s
          LEFT JOIN assignments a ON s.assignment_id = a.id
          WHERE s.id = ?
        `).bind(id).first();

        return new Response(JSON.stringify(response.success(updated, 'Pengumpulan tugas berhasil diperbarui')), {
          status: HTTP_STATUS_CODES.OK,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'DELETE': {
        const existing = await env.DB.prepare(`
          SELECT * FROM assignment_submissions WHERE id = ?
        `).bind(id).first();

        if (!existing) {
          return new Response(JSON.stringify(response.error(ERROR_MESSAGES.NOT_FOUND)), {
            status: HTTP_STATUS_CODES.NOT_FOUND,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await env.DB.prepare(`DELETE FROM assignment_submissions WHERE id = ?`).bind(id).run();

        return new Response(JSON.stringify(response.success(null, 'Pengumpulan tugas berhasil dihapus')), {
          status: HTTP_STATUS_CODES.OK,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify(response.error(ERROR_MESSAGES.METHOD_NOT_SUPPORTED)), {
          status: HTTP_STATUS_CODES.METHOD_NOT_ALLOWED,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (e) {
    logger.error('Assignment submissions handler error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// MESSAGING API HANDLERS
// ============================================

async function handleConversations(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const method = request.method;
    const userId = await getUserIdFromRequest(request, env);

    if (!userId) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.UNAUTHORIZED)), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const id = url.pathname.split('/').slice(0, -1).pop();

    if (id) {
      const conversation = await env.DB.prepare(`
        SELECT * FROM conversations WHERE id = ?
      `).bind(id).first();

      if (!conversation) {
        return new Response(JSON.stringify(response.error('Conversation not found')), {
          status: HTTP_STATUS_CODES.NOT_FOUND,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (method === 'PUT') {
        const body = await request.json();
        const now = new Date().toISOString();

        await env.DB.prepare(`
          UPDATE conversations
          SET name = COALESCE(?, name),
              description = COALESCE(?, description),
              avatar = COALESCE(?, avatar),
              updated_at = ?,
              metadata = COALESCE(?, metadata)
          WHERE id = ?
        `).bind(body.name, body.description, body.avatar, now, body.metadata ? JSON.stringify(body.metadata) : null, id).run();

        return new Response(JSON.stringify(response.success({ id, ...body, updated_at: now })), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM conversations WHERE id = ?').bind(id).run();
        return new Response(JSON.stringify(response.success({ success: true })), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (method === 'POST' && url.pathname.endsWith('/read')) {
        await env.DB.prepare(`
          UPDATE messages
          SET read_at = ?, status = 'read'
          WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL
        `).bind(new Date().toISOString(), id, userId).run();

        const unreadCount = await env.DB.prepare(`
          SELECT COUNT(*) as count FROM messages
          WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL
        `).bind(id, userId).first();

        return new Response(JSON.stringify(response.success({ success: true, unreadCount: unreadCount?.count || 0 })), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const participants = await env.DB.prepare(`
        SELECT cp.*, u.name, u.email, u.role, u.avatar
        FROM conversation_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.conversation_id = ?
      `).bind(id).all();

      const lastMessage = await env.DB.prepare(`
        SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1
      `).bind(id).first();

      return new Response(JSON.stringify(response.success({
        ...conversation,
        participants,
        lastMessage
      })), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (method === 'POST') {
      const body = await request.json();
      const conversationId = generateId();
      const now = new Date().toISOString();

      await env.DB.prepare(`
        INSERT INTO conversations (id, type, name, description, avatar, created_by, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(conversationId, body.type, body.name || null, body.description || null, body.avatar || null, userId, body.metadata ? JSON.stringify(body.metadata) : null).run();

      for (const participantId of body.participantIds) {
        const participantIdClean = participantId;
        await env.DB.prepare(`
          INSERT INTO conversation_participants (id, conversation_id, user_id, is_admin)
          VALUES (?, ?, ?, ?)
        `).bind(generateId(), conversationId, participantIdClean, body.type === 'group' && participantIdClean === userId ? 1 : 0).run();
      }

      return new Response(JSON.stringify(response.success({
        id: conversationId,
        ...body,
        created_by: userId,
        created_at: now
      })), {
        status: HTTP_STATUS_CODES.CREATED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (method === 'GET') {
      const type = url.searchParams.get('type');
      const search = url.searchParams.get('search');
      const unreadOnly = url.searchParams.get('unread_only') === 'true';

      let query = `
        SELECT c.*,
          (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != ? AND m.read_at IS NULL) as unread_count,
          (SELECT m.* FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
          (SELECT m.created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_at
        FROM conversations c
        JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = ?
      `;
      const params = [userId, userId];

      if (type) {
        query += ' AND c.type = ?';
        params.push(type);
      }

      if (search) {
        query += ' AND (c.name LIKE ? OR c.description LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
      }

      if (unreadOnly) {
        query += ' HAVING unread_count > 0';
      }

      query += ' ORDER BY c.updated_at DESC';

      const conversations = await env.DB.prepare(query).bind(...params).all();

      for (const conv of conversations.results) {
        const participants = await env.DB.prepare(`
          SELECT cp.*, u.name, u.email, u.role, u.avatar
          FROM conversation_participants cp
          JOIN users u ON cp.user_id = u.id
          WHERE cp.conversation_id = ?
        `).bind(conv.id).all();

        conv.participants = participants.results;
        if (conv.metadata) {
          conv.metadata = JSON.parse(conv.metadata);
        }
      }

      return new Response(JSON.stringify(response.success(conversations.results)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.METHOD_NOT_ALLOWED)), {
      status: HTTP_STATUS_CODES.METHOD_NOT_ALLOWED,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('Conversations handler error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleMessages(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const method = request.method;
    const userId = await getUserIdFromRequest(request, env);

    if (!userId) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.UNAUTHORIZED)), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const id = url.pathname.split('/').pop();

    if (id) {
      if (method === 'PUT') {
        const body = await request.json();
        const now = new Date().toISOString();

        await env.DB.prepare(`
          UPDATE messages
          SET content = COALESCE(?, content),
              updated_at = ?
          WHERE id = ? AND sender_id = ?
        `).bind(body.content, now, id, userId).run();

        return new Response(JSON.stringify(response.success({ id, content: body.content, updated_at: now })), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM messages WHERE id = ? AND sender_id = ?').bind(id, userId).run();
        return new Response(JSON.stringify(response.success({ success: true })), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (method === 'POST' && url.pathname.endsWith('/read')) {
        await env.DB.prepare(`
          INSERT OR REPLACE INTO message_read_receipts (id, message_id, user_id, read_at)
          VALUES (?, ?, ?, ?)
        `).bind(generateId(), id, userId, new Date().toISOString()).run();

        await env.DB.prepare(`
          UPDATE messages SET read_at = ?, status = 'read' WHERE id = ?
        `).bind(new Date().toISOString(), id).run();

        const receipt = await env.DB.prepare(`
          SELECT * FROM message_read_receipts WHERE message_id = ? AND user_id = ?
        `).bind(id, userId).first();

        return new Response(JSON.stringify(response.success(receipt)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const message = await env.DB.prepare(`
        SELECT m.*, u.name as sender_name, u.role as sender_role, u.avatar as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?
      `).bind(id).first();

      return new Response(JSON.stringify(response.success(message)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (method === 'GET' && url.pathname.includes('/typing')) {
      const conversationId = url.pathname.split('/').slice(0, -1).pop();

      const indicators = await env.DB.prepare(`
        SELECT * FROM typing_indicators
        WHERE conversation_id = ? AND user_id != ? AND is_typing = TRUE AND timestamp > datetime('now', '-1 minute')
      `).bind(conversationId, userId).all();

      return new Response(JSON.stringify(response.success(indicators.results || [])), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (method === 'POST' && url.pathname.includes('/typing')) {
      const conversationId = url.pathname.split('/').slice(0, -1).pop();
      const body = await request.json();

      await env.DB.prepare(`
        INSERT OR REPLACE INTO typing_indicators (id, conversation_id, user_id, user_name, is_typing, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(generateId(), conversationId, userId, body.userName || 'Unknown', body.isTyping, new Date().toISOString()).run();

      return new Response(JSON.stringify(response.success({ success: true })), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (method === 'POST') {
      const contentType = request.headers.get('content-type');
      let conversationId, messageType, content, fileUrl, fileName, fileSize, fileType, replyTo;

      if (contentType?.includes('multipart/form-data')) {
        const formData = await request.formData();
        conversationId = formData.get('conversationId') as string;
        messageType = formData.get('messageType') as string;
        content = formData.get('content') as string;
        replyTo = formData.get('replyTo') as string;

        const file = formData.get('file') as File | null;
        if (file) {
          const fileKey = `messages/${generateId()}-${file.name}`;
          await env.R2.put(fileKey, file);
          fileUrl = `${env.R2_PUBLIC_URL}/${fileKey}`;
          fileName = file.name;
          fileSize = file.size;
          fileType = file.type;
        }
      } else {
        const body = await request.json();
        conversationId = body.conversationId;
        messageType = body.messageType;
        content = body.content;
        replyTo = body.replyTo;
      }

      const messageId = generateId();
      const now = new Date().toISOString();

      await env.DB.prepare(`
        INSERT INTO messages (id, conversation_id, sender_id, message_type, content, file_url, file_name, file_size, file_type, reply_to, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sent', ?, ?)
      `).bind(messageId, conversationId, userId, messageType, content, fileUrl || null, fileName || null, fileSize || null, fileType || null, replyTo || null, now, now).run();

      const message = await env.DB.prepare(`
        SELECT m.*, u.name as sender_name, u.role as sender_role, u.avatar as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?
      `).bind(messageId).first();

      await env.DB.prepare(`
        UPDATE conversations SET updated_at = ? WHERE id = ?
      `).bind(now, conversationId).run();

      return new Response(JSON.stringify(response.success(message)), {
        status: HTTP_STATUS_CODES.CREATED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (method === 'GET' && url.pathname.includes('/messages')) {
      const conversationId = url.pathname.split('/').slice(0, -1).pop();
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const messages = await env.DB.prepare(`
        SELECT m.*, u.name as sender_name, u.role as sender_role, u.avatar as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?
      `).bind(conversationId, limit, offset).all();

      return new Response(JSON.stringify(response.success((messages.results || []).reverse())), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.METHOD_NOT_ALLOWED)), {
      status: HTTP_STATUS_CODES.METHOD_NOT_ALLOWED,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('Messages handler error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleMessagesUnreadCount(request, env, corsHeaders) {
  try {
    const userId = await getUserIdFromRequest(request, env);

    if (!userId) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.UNAUTHORIZED)), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const totalResult = await env.DB.prepare(`
      SELECT COUNT(*) as total
      FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = ? AND m.sender_id != ? AND m.read_at IS NULL
    `).bind(userId, userId).first();

    const conversationsResult = await env.DB.prepare(`
      SELECT m.conversation_id, COUNT(*) as count
      FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = ? AND m.sender_id != ? AND m.read_at IS NULL
      GROUP BY m.conversation_id
    `).bind(userId, userId).all();

    return new Response(JSON.stringify(response.success({
      total: totalResult?.total || 0,
      conversations: conversationsResult.results || []
    })), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('Unread count handler error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// WEBSOCKET & REAL-TIME HANDLERS
// ============================================

async function handleWebSocket(request, env) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response('Token required', { status: 401 });
    }

    const payload = await JWT.verify(token, env.JWT_SECRET || 'default_secret');
    if (!payload) {
      return new Response('Invalid token', { status: 401 });
    }

    const pair = new WebSocketPair();
    const [client, server] = pair;

    server.accept();

    const connectionId = generateId();
    const subscriptions = new Set();

    logger.info(`WebSocket: Connection established - ${payload.role}/${payload.user_id} (${connectionId})`);

    server.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'subscribe':
            subscriptions.add(data.eventType);
            logger.debug(`WebSocket: User ${payload.user_id} subscribed to ${data.eventType}`);
            break;

          case 'unsubscribe':
            subscriptions.delete(data.eventType);
            logger.debug(`WebSocket: User ${payload.user_id} unsubscribed from ${data.eventType}`);
            break;

          case 'ping':
            server.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }));
            break;

          case 'disconnect':
            server.close(1000, 'Client disconnect');
            break;

          default:
            logger.warn(`WebSocket: Unknown message type: ${data.type}`);
        }
      } catch (error) {
        logger.error('WebSocket: Message handling error:', error);
        server.send(JSON.stringify({
          type: 'error',
          message: ERROR_MESSAGES.WS_INVALID_MESSAGE
        }));
      }
    });

    server.addEventListener('close', () => {
      logger.info(`WebSocket: Connection closed - ${payload.user_id} (${connectionId})`);
      subscriptions.clear();
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });

  } catch (error) {
    logger.error('WebSocket: Connection error:', error);
    return new Response(ERROR_MESSAGES.SERVER_ERROR, { status: 500 });
  }
}

async function handleUpdates(request, env, corsHeaders) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    const payload = await JWT.verify(token, env.JWT_SECRET || 'default_secret');

    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const lastSync = request.headers.get('If-Modified-Since');
    const lastSyncDate = lastSync ? new Date(lastSync) : new Date(0);

    const updates = [];

    const tables = [
      'grades',
      'attendance',
      'announcements',
      'e_library',
      'school_events',
      'users'
    ];

    for (const table of tables) {
      try {
        const hasUpdatedAt = await env.DB.prepare(`
          PRAGMA table_info(${table})
        `).all();

        const updatedAtColumn = hasUpdatedAt.results?.some((col) => col.name === 'updated_at');

        let query = '';
        let params = [];

        if (updatedAtColumn) {
          query = `SELECT * FROM ${table} WHERE updated_at > ?`;
          params = [lastSyncDate.toISOString()];
        } else {
          query = `SELECT * FROM ${table} LIMIT 100`;
        }

        const result = await env.DB.prepare(query).bind(...params).all();

        if (result.results && result.results.length > 0) {
          for (const row of result.results) {
            const eventType = mapTableToEventType(table, row);
            if (eventType) {
              updates.push({
                type: eventType,
                entity: table.replace(/_/g, ''),
                entityId: row.id,
                data: row,
                timestamp: row.updated_at || new Date().toISOString(),
                userRole: payload.role,
                userId: payload.user_id
              });
            }
          }
        }
      } catch (error) {
        logger.debug(`WebSocket: Failed to fetch updates from ${table}:`, error);
      }
    }

    return new Response(JSON.stringify(response.success({ updates }, 'Updates retrieved')), {
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    logger.error('WebSocket: Updates error:', error);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

function mapTableToEventType(table, _row) {
  const entity = table.replace(/_/g, '');

  if (entity === 'grades') return 'grade_updated';
  if (entity === 'attendance') return 'attendance_updated';
  if (entity === 'announcements') return 'announcement_updated';
  if (entity === 'elibrary') return 'library_material_updated';
  if (entity === 'schoolevents') return 'event_updated';
  if (entity === 'users') return 'user_status_changed';

  return null;
}

// ============================================
// MAIN HANDLER
// ============================================

 export default {
   async fetch(request, env, _ctx) {
     const requestOrigin = request.headers.get('Origin') || 'null';
     const cors = corsHeaders(env.ALLOWED_ORIGIN, requestOrigin);

     logger.setLevel(env.LOG_LEVEL || 'info');

     // Handle preflight
     if (request.method === 'OPTIONS') {
       return new Response(null, { headers: cors });
     }

     const url = new URL(request.url);

     // Handle WebSocket upgrade
     if (url.pathname === '/ws' && request.headers.get('upgrade') === 'websocket') {
       return handleWebSocket(request, env);
     }

     // Apply rate limiting
     const rateLimitCheck = await applyRateLimit(request, env);
     let rateLimitHeaders = new Headers(cors);

    if (rateLimitCheck) {
      const { result, identifier } = rateLimitCheck;
      rateLimitHeaders = setRateLimitHeaders(rateLimitHeaders, result);

      if (!result.success) {
        logger.warn(`Rate limit exceeded for ${identifier}`, {
          path: url.pathname,
          method: request.method,
          limit: result.limit
        });
        return new Response(JSON.stringify({
          error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          retryAfter: result.retryAfter
        }), {
          status: HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
          headers: {
            ...rateLimitHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }

     // Route handlers
     const routes = {
      '/seed': handleSeed,
      '/api/chat': handleChat,
      '/api/auth/login': handleLogin,
      '/api/auth/logout': handleLogout,
      '/api/auth/refresh': handleRefreshToken,
      '/api/auth/forgot-password': handleForgotPassword,
      '/api/auth/verify-reset-token': handleVerifyResetToken,
      '/api/auth/reset-password': handleResetPassword,
      '/api/email/send': handleSendEmail,
      '/api/files/upload': handleFileUpload,
      '/api/files/download': handleFileDownload,
      '/api/files/delete': handleFileDelete,
      '/api/files/list': handleFileList,
      '/api/updates': handleUpdates,
      '/api/users': (r, e, c) => handleCRUD(r, e, c, 'users'),
      '/api/ppdb_registrants': (r, e, c) => handleCRUD(r, e, c, 'ppdb_registrants'),
      '/api/inventory': (r, e, c) => handleCRUD(r, e, c, 'inventory'),
      '/api/school_events': (r, e, c) => handleCRUD(r, e, c, 'school_events'),
      '/api/event_registrations': (r, e, c) => handleCRUD(r, e, c, 'event_registrations'),
      '/api/event_budgets': (r, e, c) => handleCRUD(r, e, c, 'event_budgets'),
      '/api/event_photos': (r, e, c) => handleCRUD(r, e, c, 'event_photos'),
      '/api/event_feedback': (r, e, c) => handleCRUD(r, e, c, 'event_feedback'),
      '/api/students': (r, e, c) => handleCRUD(r, e, c, 'students'),
      '/api/teachers': (r, e, c) => handleCRUD(r, e, c, 'teachers'),
      '/api/subjects': (r, e, c) => handleCRUD(r, e, c, 'subjects'),
      '/api/classes': (r, e, c) => handleCRUD(r, e, c, 'classes'),
      '/api/schedules': (r, e, c) => handleCRUD(r, e, c, 'schedules'),
      '/api/grades': (r, e, c) => handleCRUD(r, e, c, 'grades'),
      '/api/assignments': handleAssignments,
      '/api/assignments/*/publish': handlePublishAssignment,
      '/api/assignments/*/close': handleCloseAssignment,
      '/api/assignment-submissions': handleAssignmentSubmissions,
      '/api/assignment-submissions/*': handleAssignmentSubmissions,
      '/api/messages/conversations': handleConversations,
      '/api/messages/conversations/*': handleConversations,
      '/api/messages': handleMessages,
      '/api/messages/*': handleMessages,
      '/api/messages/unread-count': handleMessagesUnreadCount,
      '/api/attendance': (r, e, c) => handleCRUD(r, e, c, 'attendance'),
      '/api/e_library': (r, e, c) => handleCRUD(r, e, c, 'e_library'),
      '/api/announcements': (r, e, c) => handleCRUD(r, e, c, 'announcements'),
      '/api/parent/children': handleGetChildren,
      '/api/parent/grades': handleGetChildGrades,
      '/api/parent/attendance': handleGetChildAttendance,
      '/api/parent/schedule': handleGetChildSchedule,
    };

    for (const [path, handler] of Object.entries(routes)) {
      if (url.pathname.startsWith(path)) {
        const response = await handler(request, env, cors);

        // Apply rate limit headers to successful responses
        if (response && response.headers && rateLimitCheck) {
          setRateLimitHeaders(response.headers, rateLimitCheck.result);
        }

        return response;
      }
    }

    const notFoundResponse = new Response(JSON.stringify(response.error(ERROR_MESSAGES.ENDPOINT_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND)), {
      status: HTTP_STATUS_CODES.NOT_FOUND,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });

    if (rateLimitCheck) {
      setRateLimitHeaders(notFoundResponse.headers, rateLimitCheck.result);
    }

    return notFoundResponse;
  },
};
