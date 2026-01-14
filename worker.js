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
  ENDPOINT_NOT_FOUND: 'Endpoint tidak ditemukan'
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
  INTERNAL_SERVER_ERROR: 500
};

// ============================================
// QUERY RESULT CACHE (In-Memory with TTL)
// ============================================

class QueryCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 60000; // 60 seconds default
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
    logger.debug(`Cache set: ${key}, TTL: ${ttl}ms`);
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      logger.debug(`Cache miss: ${key}`);
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      logger.debug(`Cache expired: ${key}`);
      this.cache.delete(key);
      return null;
    }

    logger.debug(`Cache hit: ${key}`);
    return entry.value;
  }

  invalidate(key) {
    this.cache.delete(key);
    logger.debug(`Cache invalidated: ${key}`);
  }

  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        logger.debug(`Cache invalidated by pattern: ${key}`);
      }
    }
  }

  clear() {
    this.cache.clear();
    logger.debug('Cache cleared');
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

const queryCache = new QueryCache();

// ============================================
// WEBSOCKET CONNECTION MANAGEMENT
// ============================================

const connectedClients = new Map();

function broadcastEvent(eventData) {
  const message = JSON.stringify(eventData);
  
  for (const [clientId, ws] of connectedClients.entries()) {
    try {
      if (ws.readyState === 1) {
        ws.send(message);
      }
    } catch (error) {
      logger.error('Failed to send to client', clientId, error);
      connectedClients.delete(clientId);
    }
  }
}

function getEventType(table, action) {
  const eventTypes = {
    'grades': {
      'created': 'grade_created',
      'updated': 'grade_updated',
      'deleted': 'grade_deleted',
    },
    'attendance': {
      'created': 'attendance_marked',
      'updated': 'attendance_updated',
    },
    'announcements': {
      'created': 'announcement_created',
      'updated': 'announcement_updated',
      'deleted': 'announcement_deleted',
    },
    'e_library': {
      'created': 'library_material_added',
      'updated': 'library_material_updated',
    },
    'school_events': {
      'created': 'event_created',
      'updated': 'event_updated',
      'deleted': 'event_deleted',
    },
    'users': {
      'updated': 'user_role_changed',
    },
  };

  return eventTypes[table]?.[action] || null;
}

function getEntityName(table) {
  const entityNames = {
    'grades': 'grade',
    'attendance': 'attendance',
    'announcements': 'announcement',
    'e_library': 'library_material',
    'school_events': 'event',
    'users': 'user',
  };

  return entityNames[table] || table;
}

async function handleWebSocketConnection(request, env) {
  const upgradeHeader = request.headers.get('Upgrade');
  
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected WebSocket Upgrade', { 
      status: 426,
      headers: { 'Upgrade': 'websocket' }
    });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  if (!token) {
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.UNAUTHORIZED)), {
      status: HTTP_STATUS_CODES.UNAUTHORIZED,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const payload = await JWT.verify(token, env.JWT_SECRET);
    
    if (!payload) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.UNAUTHORIZED)), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = await env.DB.prepare('SELECT * FROM sessions WHERE id = ? AND is_revoked = 0')
      .bind(payload.session_id)
      .first();
    
    if (!session) {
      return new Response(JSON.stringify(response.error(ERROR_MESSAGES.UNAUTHORIZED)), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
    
    server.accept();
    
    const clientId = `${payload.user_id}_${Date.now()}`;
    connectedClients.set(clientId, server);
    
    logger.info(`WebSocket: Client connected - ${clientId} (${payload.role})`);

    server.addEventListener('message', (msg) => {
      try {
        const data = JSON.parse(msg.data);
        
        if (data.type === 'ping') {
          server.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        } else if (data.type === 'subscribe') {
          logger.debug(`WebSocket: Client ${clientId} subscribed to ${data.eventType}`);
        } else if (data.type === 'unsubscribe') {
          logger.debug(`WebSocket: Client ${clientId} unsubscribed from ${data.eventType}`);
        } else if (data.type === 'disconnect') {
          connectedClients.delete(clientId);
          server.close(1000, 'Client disconnect');
        }
      } catch (error) {
        logger.error('WebSocket: Error handling message', error);
      }
    });

    server.addEventListener('close', () => {
      connectedClients.delete(clientId);
      logger.info(`WebSocket: Client disconnected - ${clientId}`);
    });

    server.addEventListener('error', (error) => {
      logger.error(`WebSocket: Error for ${clientId}`, error);
      connectedClients.delete(clientId);
    });

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  } catch (error) {
    logger.error('WebSocket: Connection failed', error);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.UNAUTHORIZED)), {
      status: HTTP_STATUS_CODES.UNAUTHORIZED,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

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
        const newItem = { id: newItemId, ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

        const columns = Object.keys(newItem).join(', ');
        const placeholders = Object.keys(newItem).map(() => '?').join(', ');
        const values = Object.values(newItem);

        await env.DB.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`).bind(...values).run();

        const eventType = getEventType(table, 'created');
        if (eventType && payload) {
          broadcastEvent({
            type: eventType,
            entity: getEntityName(table),
            entityId: newItemId,
            data: newItem,
            timestamp: newItem.updated_at,
            userRole: payload.role,
            userId: payload.user_id,
          });
        }

        queryCache.invalidatePattern(`^${table}:`);

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

        const updatedItem = await env.DB.prepare(`UPDATE ${table} SET ${updateSet}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`).bind(...updateValues).first();

        const eventType = getEventType(table, 'updated');
        if (eventType && payload) {
          broadcastEvent({
            type: eventType,
            entity: getEntityName(table),
            entityId: id,
            data: updatedItem || updateBody,
            timestamp: new Date().toISOString(),
            userRole: payload.role,
            userId: payload.user_id,
          });
        }

        queryCache.invalidatePattern(`^${table}:`);

        return new Response(JSON.stringify(response.success(updatedItem || updateBody, 'Data berhasil diperbarui')), {
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

        const deletedItem = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
        await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();

        const eventType = getEventType(table, 'deleted');
        if (eventType && payload && deletedItem) {
          broadcastEvent({
            type: eventType,
            entity: getEntityName(table),
            entityId: id,
            data: deletedItem,
            timestamp: new Date().toISOString(),
            userRole: payload.role,
            userId: payload.user_id,
          });
        }

        queryCache.invalidatePattern(`^${table}:`);

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

    const cacheKey = `children:${payload.user_id}`;
    const cachedData = queryCache.get(cacheKey);

    if (cachedData) {
      logger.debug('Returning cached children data');
      return new Response(JSON.stringify(response.success(cachedData, 'Data anak berhasil diambil (cached)')), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
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
      LIMIT 50
    `).bind(payload.user_id).all();

    queryCache.set(cacheKey, children, 120000); // Cache for 2 minutes

    return new Response(JSON.stringify(response.success(children, 'Data anak berhasil diambil')), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
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

    const cacheKey = `grades:${studentId}`;
    const cachedData = queryCache.get(cacheKey);

    if (cachedData) {
      logger.debug('Returning cached grades data');
      return new Response(JSON.stringify(response.success(cachedData, 'Data nilai berhasil diambil (cached)')), {
        status: HTTP_STATUS_CODES.OK,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
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
      LIMIT 200
    `).bind(studentId).all();

    queryCache.set(cacheKey, grades, 120000); // Cache for 2 minutes

    return new Response(JSON.stringify(response.success(grades, 'Data nilai berhasil diambil')), {
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
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

async function handleGetUpdates(request, env, corsHeaders) {
  try {
    const payload = await authenticate(request, env);
    if (!payload) {
      return new Response(JSON.stringify(response.unauthorized()), {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const lastSync = url.searchParams.get('since') || new Date(0).toISOString();

    const updates = [];

    const tables = [
      { name: 'grades', entity: 'grade', eventTypes: ['grade_created', 'grade_updated', 'grade_deleted'] },
      { name: 'attendance', entity: 'attendance', eventTypes: ['attendance_marked', 'attendance_updated'] },
      { name: 'announcements', entity: 'announcement', eventTypes: ['announcement_created', 'announcement_updated', 'announcement_deleted'] },
      { name: 'e_library', entity: 'library_material', eventTypes: ['library_material_added', 'library_material_updated'] },
      { name: 'school_events', entity: 'event', eventTypes: ['event_created', 'event_updated', 'event_deleted'] },
      { name: 'users', entity: 'user', eventTypes: ['user_role_changed', 'user_status_changed'] },
    ];

    for (const table of tables) {
      const results = await env.DB.prepare(`
        SELECT id, updated_at FROM ${table.name}
        WHERE updated_at > ?
        ORDER BY updated_at DESC
        LIMIT 100
      `).bind(lastSync).all();

      for (const row of results.results || results) {
        updates.push({
          type: table.eventTypes[1] || table.eventTypes[0],
          entity: table.entity,
          entityId: row.id,
          timestamp: row.updated_at,
          userRole: payload.role,
          userId: payload.user_id,
        });
      }
    }

    updates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return new Response(JSON.stringify(response.success({ updates }, 'Update fetched successfully')), {
      status: HTTP_STATUS_CODES.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    logger.error('Get updates error:', e);
    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.DATABASE_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
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

    // Handle WebSocket upgrade requests
    if (url.pathname === '/ws') {
      return handleWebSocketConnection(request, env);
    }
    
    // Route handlers
    const routes = {
      '/seed': handleSeed,
      '/api/chat': handleChat,
      '/api/updates': handleGetUpdates,
      '/api/auth/login': handleLogin,
      '/api/auth/logout': handleLogout,
      '/api/auth/refresh': handleRefreshToken,
      '/api/email/send': handleSendEmail,
      '/api/files/upload': handleFileUpload,
      '/api/files/download': handleFileDownload,
      '/api/files/delete': handleFileDelete,
      '/api/files/list': handleFileList,
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
        return await handler(request, env, cors);
      }
    }

    return new Response(JSON.stringify(response.error(ERROR_MESSAGES.ENDPOINT_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND)), {
      status: HTTP_STATUS_CODES.NOT_FOUND,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  },
};
