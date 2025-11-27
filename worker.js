// worker.js - Kode backend GABUNGAN untuk Login, RAG Retriever, dan Seeder
/// <reference types="@cloudflare/workers-types" />


// Cloudflare Worker environment globals
global.Headers = Headers;
global.URL = URL;
global.Response = Response;

/* global self, indexedDB, clients, Response, Request, Headers, FetchEvent, caches */

// --- STUDENT SUPPORT UTILITIES ---

function categorizeSupportResponse(message, response) {
  const lowerMessage = message.toLowerCase();
  const lowerResponse = response.toLowerCase();
  
  // Academic support
  if (lowerMessage.includes('nilai') || lowerMessage.includes('tugas') || lowerMessage.includes('belajar') || 
      lowerMessage.includes('ujian') || lowerMessage.includes('mata pelajaran')) {
    return 'academic';
  }
  
  // Technical support
  if (lowerMessage.includes('login') || lowerMessage.includes('password') || lowerMessage.includes('akses') ||
      lowerMessage.includes('error') || lowerMessage.includes('tidak bisa') || lowerMessage.includes('gagal')) {
    return 'technical';
  }
  
  // Administrative support
  if (lowerMessage.includes('jadwal') || lowerMessage.includes('absen') || lowerMessage.includes('administrasi') ||
      lowerMessage.includes('surat') || lowerMessage.includes('dokumen')) {
    return 'administrative';
  }
  
  // Personal/Wellness support
  if (lowerMessage.includes('stress') || lowerMessage.includes('cemas') || lowerMessage.includes('bantuan') ||
      lowerMessage.includes('masalah') || lowerMessage.includes('kesulitan')) {
    return 'personal';
  }
  
  return 'general';
}

function analyzeStudentRisk(metrics) {
  let riskScore = 0;
  const riskFactors = [];
  
  // Academic risk factors
  if (metrics.gpa && metrics.gpa < 70) {
    riskScore += 3;
    riskFactors.push('IPK rendah');
  }
  
  if (metrics.attendanceRate && metrics.attendanceRate < 80) {
    riskScore += 2;
    riskFactors.push('Kehadiran rendah');
  }
  
  if (metrics.assignmentCompletion && metrics.assignmentCompletion < 75) {
    riskScore += 2;
    riskFactors.push('Penyelesaian tugas rendah');
  }
  
  // Engagement risk factors
  if (metrics.loginFrequency && metrics.loginFrequency < 3) {
    riskScore += 1;
    riskFactors.push('Login jarang');
  }
  
  if (metrics.lastLoginDays && metrics.lastLoginDays > 7) {
    riskScore += 2;
    riskFactors.push('Tidak login seminggu');
  }
  
  if (metrics.supportRequests && metrics.supportRequests > 5) {
    riskScore += 1;
    riskFactors.push('Banyak permintaan support');
  }
  
  // Determine risk level
  let riskLevel = 'low';
  if (riskScore >= 6) riskLevel = 'high';
  else if (riskScore >= 3) riskLevel = 'medium';
  
  return {
    riskLevel,
    riskScore,
    riskFactors,
    urgency: riskLevel === 'high' ? 'immediate' : riskLevel === 'medium' ? 'soon' : 'routine'
  };
}

function generateSupportRecommendations(riskAssessment) {
  const recommendations = [];
  
  switch (riskAssessment.riskLevel) {
    case 'high':
      recommendations.push({
        action: 'immediate_intervention',
        description: 'Segera hubungi siswa dan orang tua',
        priority: 'urgent',
        assignTo: 'guidance_counselor'
      });
      recommendations.push({
        action: 'create_support_plan',
        description: 'Buat rencana dukungan personal',
        priority: 'high',
        assignTo: 'academic_coordinator'
      });
      break;
      
    case 'medium':
      recommendations.push({
        action: 'schedule_checkin',
        description: 'Jadwalkan pertemuan dengan guru BK',
        priority: 'medium',
        assignTo: 'guidance_counselor'
      });
      recommendations.push({
        action: 'provide_resources',
        description: 'Berikan resources pembelajaran tambahan',
        priority: 'medium',
        assignTo: 'subject_teachers'
      });
      break;
      
    case 'low':
      recommendations.push({
        action: 'monitor_progress',
        description: 'Monitor progress secara berkala',
        priority: 'low',
        assignTo: 'system_automated'
      });
      break;
  }
  
  return recommendations;
}

// --- SECURITY UTILITIES ---

// Global declarations for Cloudflare Worker environment
global.globalConsole = console;
/* global Response */

// Security event logging
class SecurityLogger {
  constructor(env) {
    this.env = env;
  }
  
  async logSecurityEvent(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity: this.getSeverityLevel(event)
    };
    
    console.warn(`SECURITY EVENT [${logEntry.severity}]: ${event}`, details);
    
    // Store in KV for audit trail (if available)
    if (this.env.SECURITY_LOGS_KV) {
      try {
        const logKey = `security_log:${Date.now()}:${Math.random().toString(36).substring(2, 11)}`;
        await this.env.SECURITY_LOGS_KV.put(logKey, JSON.stringify(logEntry), {
          expirationTtl: 30 * 24 * 60 * 60 // 30 days retention
        });
      } catch (error) {
        console.error('Failed to store security log:', error);
      }
    }
  }
  
  getSeverityLevel(event) {
    const criticalEvents = ['AUTH_BYPASS_ATTEMPT', 'CSRF_TOKEN_INVALID', 'RATE_LIMIT_HARD_BLOCK'];
    const highEvents = ['RATE_LIMIT_EXCEEDED', 'INVALID_TOKEN', 'UNAUTHORIZED_ACCESS'];
    const mediumEvents = ['SUSPICIOUS_INPUT', 'FAILED_AUTHENTICATION'];
    
    if (criticalEvents.includes(event)) return 'CRITICAL';
    if (highEvents.includes(event)) return 'HIGH';
    if (mediumEvents.includes(event)) return 'MEDIUM';
    return 'LOW';
  }
  
  async logAuthenticationAttempt(email, success, ip, details = {}) {
    await this.logSecurityEvent('AUTHENTICATION_ATTEMPT', {
      email,
      success,
      ip,
      userAgent: details.userAgent,
      timestamp: new Date().toISOString()
    });
  }
  
  async logRateLimitViolation(ip, endpoint, count, limit) {
    await this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ip,
      endpoint,
      count,
      limit,
      timestamp: new Date().toISOString()
    });
  }
  
  async logCSRFViolation(ip, endpoint) {
    await this.logSecurityEvent('CSRF_TOKEN_INVALID', {
      ip,
      endpoint,
      timestamp: new Date().toISOString()
    });
  }
  
  async logUnauthorizedAccess(ip, endpoint, tokenValid = false) {
    await this.logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip,
      endpoint,
      tokenValid,
      timestamp: new Date().toISOString()
    });
  }
}

// Rate limiting storage using Cloudflare KV for distributed rate limiting
class DistributedRateLimitStore {
  constructor(kvStore) {
    this.kv = kvStore;
  }
  
  async get(key) {
    try {
      const data = await this.kv.get(key, 'json');
      return data || null;
    } catch (error) {
      console.error('Rate limit KV get error:', error);
      return null;
    }
  }
  
  async set(key, value, ttl) {
    try {
      await this.kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
    } catch (error) {
      console.error('Rate limit KV set error:', error);
    }
  }
  
  async increment(key, windowMs, maxRequests) {
    const now = Date.now();
    const ttl = Math.ceil(windowMs / 1000);
    const rateLimitKey = `rate_limit:${key}`;
    
    const current = await this.get(rateLimitKey) || { count: 0, resetTime: now + windowMs };
    
    // Reset if window expired
    if (now > current.resetTime) {
      current.count = 1;
      current.resetTime = now + windowMs;
    } else {
      current.count++;
    }
    
    await this.set(rateLimitKey, current, ttl);
    
    return {
      count: current.count,
      exceeded: current.count > maxRequests,
      resetTime: current.resetTime
    };
  }
}

// Fallback to memory store for development
const rateLimitStore = new Map();

// Rate limiting configuration - read from environment
function getRateLimitConfig(env) {
  const windowMs = env.RATE_LIMIT_WINDOW_MS ? parseInt(env.RATE_LIMIT_WINDOW_MS) : 15 * 60 * 1000; // 15 menit default
  const maxRequests = env.RATE_LIMIT_MAX_REQUESTS ? parseInt(env.RATE_LIMIT_MAX_REQUESTS) : 100; // 100 requests default
  
  return {
    windowMs,
    maxRequests,
    blockDuration: 30 * 60 * 1000 // Block selama 30 menit jika limit exceeded
  };
}

function getClientIP(request) {
  // Cloudflare Workers: get client IP from headers
  return request.headers.get('CF-Connecting-IP') ||
         request.headers.get('X-Forwarded-For') ||
         'unknown';
}

async function isRateLimitExceeded(env, clientId, maxRequests, windowMs, endpoint = 'default') {
  try {
    // Use distributed rate limiting if KV store is available
    if (env.RATE_LIMIT_KV) {
      const distributedStore = new DistributedRateLimitStore(env.RATE_LIMIT_KV);
      const result = await distributedStore.increment(clientId, windowMs, maxRequests);
      
      if (result.exceeded) {
        console.warn(`SECURITY: Rate limit exceeded for ${clientId} on ${endpoint}: ${result.count}/${maxRequests}`);
        return true;
      }
      
      return false;
    }
    
    // Fallback to memory-based rate limiting
    const now = Date.now();
    const key = `${endpoint}:${clientId}`;
    const clientData = rateLimitStore.get(key);
    
    if (!clientData) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now
      });
      return false;
    }
    
    // Reset if window expired
    if (now > clientData.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now
      });
      return false;
    }
    
    clientData.count++;
    
    // Progressive rate limiting for abusive clients
    if (clientData.count > maxRequests * 2) {
      console.warn(`SECURITY: Hard block for abusive client: ${clientId}`);
      return true; // Hard block
    }
    
    const isExceeded = clientData.count > maxRequests;
    if (isExceeded) {
      console.warn(`SECURITY: Rate limit exceeded for client: ${clientId}, count: ${clientData.count}`);
    }
    
    return isExceeded;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open - allow request if rate limiting fails
    return false;
  }
}

function isRateLimited(clientIP, rateLimitConfig) {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIP);

  if (!clientData) {
    // First attempt
    rateLimitStore.set(clientIP, {
      attempts: 1,
      firstAttempt: now,
      blockedUntil: null
    });
    return false;
  }

  // Check if currently blocked
  if (clientData.blockedUntil && now < clientData.blockedUntil) {
    return true;
  }

  // Reset if window expired
  if (now - clientData.firstAttempt > rateLimitConfig.windowMs) {
    rateLimitStore.set(clientIP, {
      attempts: 1,
      firstAttempt: now,
      blockedUntil: null
    });
    return false;
  }

  // Increment attempts
  clientData.attempts++;

  if (clientData.attempts > rateLimitConfig.maxRequests) {
    clientData.blockedUntil = now + rateLimitConfig.blockDuration;
    return true;
  }

  rateLimitStore.set(clientIP, clientData);
  return false;
}

async function generateSecureToken(email, expiryTime = 15 * 60 * 1000) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    email: email,
    exp: Math.floor((Date.now() + expiryTime) / 1000),
    iat: Math.floor(Date.now() / 1000),
    jti: generateRandomString(16)
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

// Generate signature using HMAC-SHA256 with secure secret key from environment
    const secret = env.JWT_SECRET || env.SECRET_KEY;
    if (!secret || secret.length < 32) {
      throw new Error('Secure JWT_SECRET environment variable required (min 32 characters)');
    }
    
    // SECURITY: Additional validation to prevent common weak secrets
    const weakSecrets = ['secret', 'password', '123456', 'admin', 'default', 'test', 'demo'];
    if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
      throw new Error('JWT_SECRET cannot contain common weak words');
    }
  const signature = await generateHMACSignature(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function generateRandomString(length) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Generate HMAC signature using crypto.subtle
async function generateHMACSignature(data, secret) {
  // SECURITY: Validate secret key before use
  if (!secret || secret.length < 32) {
    throw new Error('Invalid secret key: Must be at least 32 characters');
  }
  
  // SECURITY: Additional validation to prevent common weak secrets
  const weakSecrets = ['secret', 'password', '123456', 'admin', 'default', 'test', 'demo'];
  if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
    throw new Error('JWT_SECRET cannot contain common weak words');
  }
  
  // Validate input data
  if (!data || typeof data !== 'string') {
    throw new Error('Invalid data for HMAC signature generation');
  }
  
  // Convert data and secret to ArrayBuffers for Web Crypto API
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('');
}

// Verify HMAC signature using crypto.subtle
async function verifyHMACSignature(data, signature, secret) {
  // Convert data and secret to ArrayBuffers for Web Crypto API
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  // Convert signature from hex string to Uint8Array
  const signatureBytes = new Uint8Array(signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  
  return await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(data));
}

async function verifyAndDecodeToken(token, env) {
  try {
    // SECURITY: Validate token format
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    
// SECURITY: Verify secret key is secure
     if (!env.SECRET_KEY || env.SECRET_KEY.length < 32) {
       console.error('SECURITY: Attempted token verification with invalid secret key');
       return null;
     }
     
     // SECURITY: Validate signature format
     if (!signature || !/^[a-f0-9]+$/i.test(signature)) {
       return null;
     }
    const secret = env.SECRET_KEY;
    const isValid = await verifyHMACSignature(`${encodedHeader}.${encodedPayload}`, signature, secret);
    
    if (!isValid) {
      console.warn('SECURITY: Invalid token signature detected');
      return null; // Invalid signature
    }

    const paddedPayload = encodedPayload + '='.repeat((4 - encodedPayload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));

    const tokenData = JSON.parse(decodedPayload);

    // SECURITY: Validate token payload structure
    if (!tokenData.email || !tokenData.exp || !tokenData.iat) {
      console.warn('SECURITY: Invalid token payload structure');
      return null;
    }

    // SECURITY: Check token expiry with buffer
    const now = Math.floor(Date.now() / 1000);
    if (now > tokenData.exp) {
      console.warn('SECURITY: Expired token used');
      return null;
    }
    
    // SECURITY: Check issued time is not in future
    if (tokenData.iat > now) {
      console.warn('SECURITY: Token issued in future detected');
      return null;
    }

    return tokenData;
  } catch (error) {
    console.error('SECURITY: Token verification error:', error.message);
    return null;
  }
}

// --- DATA KONTEN WEBSITE (SUMBER PENGETAHUAN AI) ---
// Untuk menambah pengetahuan AI, tambahkan data di sini, lalu deploy ulang worker,
// dan panggil endpoint /seed SATU KALI.
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
// ----------------------------------------------------

export default {
  async fetch(request, env) {
    // Enhanced security headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://ma-malnukananga.sch.id',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()'
    };

    // Initialize security logger
    const securityLogger = new SecurityLogger(env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        }
      });
    }
    const url = new URL(request.url);
    
    // Get rate limiting configuration
    const rateLimitConfig = getRateLimitConfig(env);
    
    // Apply rate limiting to all endpoints except OPTIONS
    if (request.method !== 'OPTIONS') {
      const clientIP = getClientIP(request);
      if (isRateLimited(clientIP, rateLimitConfig)) {
        return new Response(JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(rateLimitConfig.blockDuration / 1000)
        }), { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': Math.ceil(rateLimitConfig.blockDuration / 1000).toString() }
        });
      }
    }

    // --- Endpoint untuk Seeding Data (PENGISI INFO) ---
    if (url.pathname === '/seed') {
      try {
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

        return new Response(`Successfully seeded ${vectorsToInsert.length} documents.`, { headers: corsHeaders });
      } catch (e) {
        return new Response(`Error seeding data: ${e.message}`, { status: 500, headers: corsHeaders });
      }
    }

    // --- Endpoint untuk RAG Context Retrieval (PENCARI INFO) ---
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        // SECURITY: Check authentication
        if (!isAuthenticated(request, securityLogger, '/api/chat')) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // SECURITY: Validate CSRF token for state-changing operations
        if (!validateCSRFToken(request, securityLogger, '/api/chat')) {
          return new Response(JSON.stringify({ message: 'CSRF token tidak valid.' }), { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const { message } = await request.json();
        const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [message] });
        const vectors = embeddings.data[0];
        
        const SIMILARITY_CUTOFF = 0.75;
        const topK = 3;
        const vectorQuery = await env.VECTORIZE_INDEX.query(vectors, { topK, returnMetadata: true });
        
        let context = "";
        if (vectorQuery.matches.length > 0) {
          const relevantMatches = vectorQuery.matches.filter(match => match.score > SIMILARITY_CUTOFF);
          if(relevantMatches.length > 0) {
              context = relevantMatches.map(match => match.metadata.text).join("\n\n---\n\n");
          }
        }
        
        return new Response(JSON.stringify({ context }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // --- Endpoint Student Support AI ---
    if (url.pathname === '/api/student-support' && request.method === 'POST') {
      try {
        // SECURITY: Check authentication
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // SECURITY: Validate CSRF token for state-changing operations
        if (!validateCSRFToken(request)) {
          return new Response(JSON.stringify({ message: 'CSRF token tidak valid.' }), { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const { studentId, message, category, context } = await request.json();
        
        // Enhanced context for student support
        let supportContext = `Konteks Dukungan Siswa:
Student ID: ${studentId || 'unknown'}
Kategori: ${category || 'general'}
Pesan: ${message || ''}

`;
        
        if (context) {
          supportContext += `Konteks Tambahan:
${JSON.stringify(context, null, 2)}

`;
        }

        // Get relevant documents from vector database
        const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', { 
          text: [supportContext + message] 
        });
        const vectors = embeddings.data[0];
        
        const SIMILARITY_CUTOFF = 0.7; // Lower threshold for support queries
        const topK = 5; // More results for comprehensive support
        const vectorQuery = await env.VECTORIZE_INDEX.query(vectors, { topK, returnMetadata: true });
        
        let retrievedContext = "";
        if (vectorQuery.matches.length > 0) {
          const relevantMatches = vectorQuery.matches.filter(match => match.score > SIMILARITY_CUTOFF);
          if(relevantMatches.length > 0) {
            retrievedContext = relevantMatches.map(match => 
              `Dokumen (relevansi: ${(match.score * 100).toFixed(1)}%):\n${match.metadata.text}`
            ).join("\n\n---\n\n");
          }
        }

        // Generate AI response with context
        const aiPrompt = `Anda adalah Student Support AI untuk MA Malnu Kananga. Berikan respons yang membantu, empatik, dan solutif dalam Bahasa Indonesia.

${retrievedContext ? `Konteks Relevan:\n${retrievedContext}\n\n` : ''}

Permintaan Siswa:
${supportContext}

Berikan respons yang:
1. Empatik dan mendukung
2. Memberikan solusi praktis
3. Menyarankan resources yang relevan
4. Menjelaskan langkah-langkah jelas
5. Menawarkan bantuan lanjutan jika needed

Respons:`;

        const aiResponse = await env.AI.run('@cf/google/gemma-7b-it-lora', {
          prompt: aiPrompt,
          max_tokens: 500,
          temperature: 0.7
        });

        const responseText = aiResponse.response || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';

        // Categorize the response for automation
        const responseCategory = categorizeSupportResponse(message, responseText);
        
        return new Response(JSON.stringify({ 
          response: responseText,
          category: responseCategory,
          contextUsed: retrievedContext.length > 0,
          confidence: vectorQuery.matches.length > 0 ? Math.max(...vectorQuery.matches.map(m => m.score)) : 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (e) {
        return new Response(JSON.stringify({ 
          error: e.message,
          fallback: 'Terjadi kesalahan sistem. Silakan coba lagi atau hubungi support manual.'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // --- Endpoint untuk Proactive Support Monitoring ---
    if (url.pathname === '/api/support-monitoring' && request.method === 'POST') {
      try {
        // SECURITY: Check authentication
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // SECURITY: Validate CSRF token for state-changing operations
        if (!validateCSRFToken(request)) {
          return new Response(JSON.stringify({ message: 'CSRF token tidak valid.' }), { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const { studentMetrics } = await request.json();
        
        // Analyze student metrics for risk assessment
        const riskAssessment = analyzeStudentRisk(studentMetrics);
        
        // Get proactive resources if needed
        let proactiveResources = [];
        if (riskAssessment.riskLevel !== 'low') {
          const contextPrompt = `Siswa membutuhkan bantuan proaktif. Metrik: ${JSON.stringify(studentMetrics)}`;
          const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [contextPrompt] });
          const vectors = embeddings.data[0];
          
          const vectorQuery = await env.VECTORIZE_INDEX.query(vectors, { topK: 3, returnMetadata: true });
          
          proactiveResources = vectorQuery.matches
            .filter(match => match.score > 0.6)
            .map(match => ({
              content: match.metadata.text,
              relevance: match.score,
              type: 'resource'
            }));
        }

        return new Response(JSON.stringify({
          riskAssessment,
          proactiveResources,
          recommendations: generateSupportRecommendations(riskAssessment)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // --- Health Check Endpoint ---
    if (url.pathname === '/health' && request.method === 'GET') {
      try {
        const healthStatus = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            ai: 'operational',
            database: 'operational', 
            vectorize: 'operational'
          },
          version: '1.2.0',
          environment: env.NODE_ENV || 'development'
        };

        // Test AI service availability
        try {
          await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: ['health check'] });
          healthStatus.services.ai = 'operational';
        } catch (aiError) {
          healthStatus.services.ai = 'degraded';
          healthStatus.status = 'degraded';
          console.error('AI service health check failed:', aiError.message);
        }

        // Test Vectorize service availability
        try {
          await env.VECTORIZE_INDEX.query([0.1, 0.2, 0.3], { topK: 1 });
          healthStatus.services.vectorize = 'operational';
        } catch (vectorError) {
          healthStatus.services.vectorize = 'degraded';
          healthStatus.status = 'degraded';
          console.error('Vectorize service health check failed:', vectorError.message);
        }

        // Test D1 database availability
        try {
          await env.DB.prepare('SELECT 1').first();
          healthStatus.services.database = 'operational';
        } catch (dbError) {
          healthStatus.services.database = 'degraded';
          healthStatus.status = 'degraded';
          console.error('Database service health check failed:', dbError.message);
        }

        const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
        
        return new Response(JSON.stringify(healthStatus), {
          status: statusCode,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

} catch (e) {
        console.error('Health check error:', e.message);
        return new Response(JSON.stringify({ 
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: e.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // --- Endpoint Login ---
    if (url.pathname === '/request-login-link' && request.method === 'POST') {
      try {
        // SECURITY: Login endpoint exempt from CSRF (public endpoint)
        // CSRF protection applied after authentication
        const clientIP = getClientIP(request);

        // Enhanced rate limiting for login endpoint
        if (await isRateLimitExceeded(env, clientIP, 3, 60000, 'login')) {
          return new Response(JSON.stringify({
            message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit.'
          }), {
            status: 429,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Retry-After': '60'
            }
          });
        }

        const { email } = await request.json();
        if (!email) {
          return new Response(JSON.stringify({ message: 'Email diperlukan.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
        }

        // Enhanced email validation with security middleware
        if (!security.validateInput(email, 'email')) {
          return new Response(JSON.stringify({ message: 'Format email tidak valid.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
        }

        // Sanitize email input
        const sanitizedEmail = security.sanitizeInput(email);

        // SECURITY: Only allow registered emails for authentication
        const allowedEmails = [
          'admin@ma-malnukananga.sch.id',
          'guru@ma-malnukananga.sch.id', 
          'siswa@ma-malnukananga.sch.id',
          'parent@ma-malnukananga.sch.id',
          'ayah@ma-malnukananga.sch.id',
          'ibu@ma-malnukananga.sch.id'
        ];
        
        if (!allowedEmails.includes(sanitizedEmail)) {
          console.warn(`SECURITY: Unauthorized login attempt for email: ${sanitizedEmail}`);
          return new Response(JSON.stringify({ message: 'Email tidak terdaftar dalam sistem.' }), { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const token = await generateSecureToken(sanitizedEmail, 15 * 60 * 1000);
        const magicLink = `${new URL(request.url).origin}/verify-login?token=${token}`;
        const emailBody = `<h1>Login ke Akun MA Malnu Kananga</h1><p>Klik tautan di bawah ini untuk masuk. Tautan ini hanya berlaku selama 15 menit.</p><a href="${magicLink}" style="padding: 10px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 5px;">Login Sekarang</a><p>Jika Anda tidak meminta link ini, abaikan email ini.</p>`;
        const send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: sanitizedEmail, name: 'Pengguna' }] }],
                from: { email: 'noreply@ma-malnukananga.sch.id', name: 'MA Malnu Kananga' },
                subject: 'Link Login Anda',
                content: [{ type: 'text/html', value: emailBody }],
            }),
        });
        await fetch(send_request);
        return new Response(JSON.stringify({ success: true, message: 'Link login telah dikirim.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (e) {
        console.error('Login request error:', e.message);
        return new Response(JSON.stringify({ message: 'Terjadi kesalahan pada server.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }
    
    // --- Endpoint Verifikasi Login ---
    if (url.pathname === '/verify-login') {
        const token = url.searchParams.get('token');
        if (!token) return new Response('Token tidak valid atau hilang.', { status: 400 });
        try {
            const tokenData = await verifyAndDecodeToken(token, env);
            if (!tokenData) {
                return new Response('Link login sudah kedaluwarsa atau tidak valid. Silakan minta link baru.', { status: 400 });
            }
            const headers = new Headers();
            // Add __Host- prefix for more secure cookie (only works on HTTPS)
            // Use the actual token instead of just the email to prevent session hijacking
            headers.set('Set-Cookie', `__Host-auth_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=900; Partitioned`);
            
            // Generate and set CSRF token
            const csrfToken = generateCSRFToken();
            headers.set('Set-Cookie', `csrf_token=${csrfToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`);
            headers.set('X-CSRF-Token', csrfToken);
            
            headers.set('Location', new URL(request.url).origin);
            return new Response(null, { status: 302, headers });
} catch(e) {
             console.error('Token verification error:', e.message);
             return new Response('Token tidak valid atau rusak.', { status: 400 });
        }
    }
    
    // --- Endpoint untuk Generate Signature ---
    if (url.pathname === '/generate-signature' && request.method === 'POST') {
      try {
        // SECURITY: Check authentication
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // SECURITY: Validate CSRF token for state-changing operations
        if (!validateCSRFToken(request)) {
          return new Response(JSON.stringify({ message: 'CSRF token tidak valid.' }), { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const { data } = await request.json();
        if (!data) {
          return new Response(JSON.stringify({ message: 'Data diperlukan.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
        }
        
// SECURITY: Require secure secret key for signature generation
          if (!env.SECRET_KEY || env.SECRET_KEY.length < 32) {
            console.error('SECURITY: Attempted signature generation with invalid secret');
            return new Response(JSON.stringify({ message: 'Server configuration error.' }), { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
           });
         }
        const secret = env.SECRET_KEY;
        const signature = await generateHMACSignature(data, secret);
        return new Response(JSON.stringify({ signature }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
       } catch (error) {
         console.error('Signature generation error:', error.message);
        return new Response(JSON.stringify({ message: 'Terjadi kesalahan pada server.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }
    
    // --- Endpoint untuk Verify Signature ---
    if (url.pathname === '/verify-signature' && request.method === 'POST') {
      try {
        // SECURITY: Check authentication
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // SECURITY: Validate CSRF token for state-changing operations
        if (!validateCSRFToken(request)) {
          return new Response(JSON.stringify({ message: 'CSRF token tidak valid.' }), { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const { data, signature } = await request.json();
        if (!data || !signature) {
          return new Response(JSON.stringify({ message: 'Data dan signature diperlukan.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
        }
        
// SECURITY: Require secure secret key for signature verification
          if (!env.SECRET_KEY || env.SECRET_KEY.length < 32) {
            console.error('SECURITY: Attempted signature verification with invalid secret');
            return new Response(JSON.stringify({ message: 'Server configuration error.' }), { 
              status: 500,
             headers: { ...corsHeaders, 'Content-Type': 'application/json' }
           });
         }
        const secret = env.SECRET_KEY;
        const isValid = await verifyHMACSignature(data, signature, secret);
        return new Response(JSON.stringify({ isValid }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
       } catch (error) {
         console.error('Signature verification error:', error.message);
        return new Response(JSON.stringify({ message: 'Terjadi kesalahan pada server.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    // --- Teacher Grade Management Endpoints ---
    if (url.pathname === '/api/teacher/grades/sync' && request.method === 'POST') {
      try {
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Simulate SIS sync - in production, integrate with actual Student Information System
        const syncedGrades = [
          {
            id: 'GRD001',
            studentId: 'STU001',
            subjectId: 'MAT12',
            midtermScore: 85,
            finalScore: 88,
            assignmentScore: 90,
            attendanceScore: 95,
            finalGrade: 'A-',
            gradePoint: 3.7,
            status: 'Lulus',
            lastUpdated: new Date().toISOString()
          }
        ];

        return new Response(JSON.stringify({
          success: true,
          data: {
            syncedCount: syncedGrades.length,
            updatedGrades: syncedGrades
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (error) {
        console.error('Grade sync error:', error.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Gagal sinkronisasi nilai' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    if (url.pathname === '/api/teacher/grades/realtime' && request.method === 'GET') {
      try {
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Server-Sent Events for real-time grade updates
        const stream = new ReadableStream({
          start(controller) {
            const sendUpdate = () => {
              const data = {
                grades: [{
                  id: 'GRD001',
                  studentId: 'STU001',
                  subjectId: 'MAT12',
                  finalGrade: 'A-',
                  gradePoint: 3.7,
                  timestamp: new Date().toISOString()
                }]
              };
              controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            };

            // Send initial update
            sendUpdate();

            // Send updates every 30 seconds
            const interval = setInterval(sendUpdate, 30000);

            // Cleanup on connection close
            request.signal.addEventListener('abort', () => {
              clearInterval(interval);
              controller.close();
            });
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            ...corsHeaders
          }
        });
      } catch (error) {
        console.error('Real-time grades error:', error.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Gagal menghubungkan ke real-time updates' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    if (url.pathname === '/api/teacher/grades/validate' && request.method === 'POST') {
      try {
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { grades } = await request.json();
        
        const validGrades = [];
        const invalidGrades = [];
        const warnings = [];

        for (const grade of grades) {
          const errors = [];
          
          // Validate score ranges
          if (grade.midtermScore && (grade.midtermScore < 0 || grade.midtermScore > 100)) {
            errors.push('Nilai UTS harus antara 0-100');
          }
          if (grade.finalScore && (grade.finalScore < 0 || grade.finalScore > 100)) {
            errors.push('Nilai UAS harus antara 0-100');
          }
          if (grade.assignmentScore && (grade.assignmentScore < 0 || grade.assignmentScore > 100)) {
            errors.push('Nilai tugas harus antara 0-100');
          }
          if (grade.attendanceScore && (grade.attendanceScore < 0 || grade.attendanceScore > 100)) {
            errors.push('Nilai kehadiran harus antara 0-100');
          }

          // Validate grade point
          if (grade.gradePoint && (grade.gradePoint < 0 || grade.gradePoint > 4.0)) {
            errors.push('Grade point harus antara 0-4.0');
          }

          if (errors.length > 0) {
            invalidGrades.push({ grade, errors });
          } else {
            validGrades.push(grade);
          }

          // Add warnings for borderline cases
          if (grade.finalScore && grade.finalScore >= 95 && grade.finalGrade !== 'A') {
            warnings.push(`Siswa ${grade.studentId} memiliki nilai UAS tinggi (${grade.finalScore}) tapi grade akhir bukan A`);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          data: {
            validGrades,
            invalidGrades,
            warnings
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (error) {
        console.error('Grade validation error:', error.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Gagal validasi nilai' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    if (url.pathname === '/api/teacher/grades/batch-update' && request.method === 'POST') {
      try {
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { updates } = await request.json();
        const successful = [];
        const failed = [];

        for (const update of updates) {
          try {
            // Simulate batch update processing
            const updatedGrade = {
              ...update.data,
              id: update.gradeId,
              lastUpdated: new Date().toISOString()
            };
            successful.push(updatedGrade);
          } catch (error) {
            failed.push({
              gradeId: update.gradeId,
              error: error.message
            });
          }
        }

        return new Response(JSON.stringify({
          success: true,
          data: {
            successful,
            failed
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (error) {
        console.error('Batch grade update error:', error.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Gagal update batch nilai' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    if (url.pathname === '/api/notifications/grade-update' && request.method === 'POST') {
      try {
        const { studentId, subjectId, grade, gradePoint } = await request.json();
        
        // Simulate notification sending
        console.log(`Grade update notification: Student ${studentId}, Subject ${subjectId}, Grade ${grade} (${gradePoint})`);
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Notifikasi berhasil dikirim'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (error) {
        console.error('Notification error:', error.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Gagal mengirim notifikasi' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    // --- Essay Grading Service Endpoints ---
    if (url.pathname === '/api/essay/grade' && request.method === 'POST') {
      try {
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const submission = await request.json();
        
        // Validate submission
        if (!submission.essay || !submission.question || !submission.studentId) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Data esai tidak lengkap' 
          }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
        }

        // Simulate AI essay grading
        const mockEvaluation = {
          id: `eval_${Date.now()}`,
          submissionId: submission.id,
          overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
          overallPercentage: 0,
          grade: 'B+',
          feedback: {
            strengths: [
              'Struktur esai yang baik dan jelas',
              'Argumen yang mendukung dengan baik',
              'Penggunaan bahasa yang efektif'
            ],
            weaknesses: [
              'Perlu lebih banyak contoh konkret',
              'Kesimpulan bisa lebih kuat',
              'Beberapa kalimat terlalu panjang'
            ],
            suggestions: [
              'Tambahkan data atau statistik untuk mendukung argumen',
              'Perbaiki transisi antar paragraf',
              'Gunakan kalimat yang lebih variatif'
            ],
            general: 'Esai ini menunjukkan pemahaman yang baik tentang topik. Struktur sudah baik namun perlu diperkuat dengan bukti yang lebih konkret.'
          },
          criteriaScores: [
            { criteriaName: 'Struktur', score: 85, maxPoints: 100, percentage: 85, feedback: 'Struktur baik dengan intro, body, dan konklusi yang jelas' },
            { criteriaName: 'Isi', score: 78, maxPoints: 100, percentage: 78, feedback: 'Isi relevan tapi perlu lebih dalam' },
            { criteriaName: 'Bahasa', score: 82, maxPoints: 100, percentage: 82, feedback: 'Bahasa baik dengan beberapa kesalahan minor' },
            { criteriaName: 'Kosakata', score: 80, maxPoints: 100, percentage: 80, feedback: 'Kosakata bervariasi dan tepat' },
            { criteriaName: 'Koherensi', score: 75, maxPoints: 100, percentage: 75, feedback: 'Alur ide cukup koheren' },
            { criteriaName: 'Orisinalitas', score: 85, maxPoints: 100, percentage: 85, feedback: 'Ide original dengan perspektif menarik' }
          ],
          languageAnalysis: {
            grammar: 82,
            vocabulary: 80,
            coherence: 75,
            structure: 85,
            originality: 85
          },
          detailedFeedback: 'Evaluasi lengkap esai dengan analisis komprehensif...',
          confidence: 0.85,
          needsHumanReview: false,
          reviewReasons: [],
          evaluationTime: new Date().toISOString()
        };

        mockEvaluation.overallPercentage = Math.round((mockEvaluation.overallScore / submission.maxScore) * 100);

        return new Response(JSON.stringify({
          success: true,
          data: mockEvaluation
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (error) {
        console.error('Essay grading error:', error.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Gagal menilai esai' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    if (url.pathname === '/api/essay/batch-grade' && request.method === 'POST') {
      try {
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { submissions } = await request.json();
        
        if (!Array.isArray(submissions)) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Submissions harus berupa array' 
          }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
        }

        // Simulate batch grading
        const evaluations = submissions.map((submission, index) => ({
          id: `eval_batch_${Date.now()}_${index}`,
          submissionId: submission.id,
          overallScore: Math.floor(Math.random() * 30) + 70,
          overallPercentage: 0,
          grade: 'B+',
          feedback: {
            strengths: ['Struktur baik', 'Argumen relevan'],
            weaknesses: ['Perlu contoh lebih banyak'],
            suggestions: ['Tambahkan data pendukung'],
            general: 'Esai baik dengan ruang untuk perbaikan'
          },
          criteriaScores: [],
          languageAnalysis: {
            grammar: 80,
            vocabulary: 75,
            coherence: 78,
            structure: 82,
            originality: 80
          },
          detailedFeedback: 'Evaluasi batch...',
          confidence: 0.8,
          needsHumanReview: false,
          reviewReasons: [],
          evaluationTime: new Date().toISOString()
        }));

        evaluations.forEach(eval => {
          eval.overallPercentage = Math.round((eval.overallScore / 100) * 100);
        });

        return new Response(JSON.stringify({
          success: true,
          data: evaluations
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (error) {
        console.error('Batch essay grading error:', error.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Gagal menilai esai secara batch' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    if (url.pathname === '/api/essay/metrics' && request.method === 'GET') {
      try {
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const mockMetrics = {
          totalEssays: 150,
          averageScore: 82,
          averageTime: 45,
          accuracy: 0.85,
          studentSatisfaction: 0.82,
          commonWeaknesses: [
            'Kurangnya contoh konkret',
            'Struktur paragraf yang lemah',
            'Kosakata terbatas'
          ],
          commonStrengths: [
            'Struktur esai yang jelas',
            'Pemahaman topik yang baik',
            'Argumen yang logis'
          ],
          gradeDistribution: {
            A: 25,
            B: 80,
            C: 35,
            D: 8,
            E: 2
          }
        };

        return new Response(JSON.stringify({
          success: true,
          data: mockMetrics
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (error) {
        console.error('Essay metrics error:', error.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Gagal mengambil metrik penilaian' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    // --- Parent Communication Service Endpoints ---
    if (url.pathname === '/api/parents/reports/generate' && request.method === 'POST') {
      try {
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { studentId, reportType, customPeriod } = await request.json();
        
        // Generate mock progress report
        const mockReport = {
          id: `report_${studentId}_${Date.now()}`,
          studentId,
          parentIds: ['parent_001'],
          reportType,
          period: customPeriod || {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          },
          academicPerformance: {
            overallGPA: 3.2,
            subjectGrades: [
              {
                subject: 'Matematika',
                grade: 'B+',
                score: 85,
                trend: 'improving',
                teacherComments: 'Menunjukkan peningkatan yang baik'
              },
              {
                subject: 'Bahasa Indonesia',
                grade: 'A-',
                score: 88,
                trend: 'stable',
                teacherComments: 'Konsisten baik'
              }
            ],
            attendance: {
              present: 18,
              absent: 1,
              late: 2,
              percentage: 90
            },
            assignments: {
              completed: 12,
              pending: 2,
              overdue: 1,
              completionRate: 80
            }
          },
          behavioralNotes: [
            {
              date: new Date().toISOString(),
              type: 'positive',
              category: 'participation',
              description: 'Aktif dalam diskusi kelas',
              teacher: 'Bu Siti'
            }
          ],
          achievements: [
            {
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'academic',
              title: 'Juara 2 Olimpiade Matematika',
              description: 'Meraih juara 2 tingkat sekolah',
              level: 'school'
            }
          ],
          concerns: [],
          recommendations: [
            {
              category: 'academic',
              priority: 'medium',
              action: 'Tingkatkan latihan soal matematika',
              timeline: '2 minggu'
            }
          ],
          nextSteps: [
            'Tinjau laporan ini bersama anak',
            'Hubungi guru wali jika ada pertanyaan'
          ],
          teacherComments: 'Anak Anda menunjukkan kemajuan yang baik. Pertahankan konsistensi ini.',
          generatedAt: new Date().toISOString()
        };

        return new Response(JSON.stringify({
          success: true,
          data: mockReport
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (error) {
        console.error('Progress report generation error:', error.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Gagal membuat laporan kemajuan' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    if (url.pathname === '/api/parents/reports/send' && request.method === 'POST') {
      try {
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { reportId } = await request.json();
        
        // Simulate sending report
        console.log(`Sending progress report ${reportId} to parents`);
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Laporan berhasil dikirim ke orang tua'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (error) {
        console.error('Progress report send error:', error.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Gagal mengirim laporan kemajuan' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    if (url.pathname === '/api/parents/meetings/schedule' && request.method === 'POST') {
      try {
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const meeting = await request.json();
        
        const newMeeting = {
          ...meeting,
          id: `meeting_${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'scheduled'
        };

        return new Response(JSON.stringify({
          success: true,
          data: newMeeting
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (error) {
        console.error('Meeting scheduling error:', error.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Gagal menjadwalkan pertemuan' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    if (url.pathname === '/api/parents/emergency' && request.method === 'POST') {
      try {
        if (!isAuthenticated(request)) {
          return new Response(JSON.stringify({ message: 'Autentikasi diperlukan.' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { studentIds, message, priority } = await request.json();
        
        // Simulate emergency notification
        console.log(`Emergency notification sent to parents of students: ${studentIds.join(', ')}`);
        console.log(`Message: ${message}`);
        console.log(`Priority: ${priority}`);
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Notifikasi darurat berhasil dikirim'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (error) {
        console.error('Emergency notification error:', error.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Gagal mengirim notifikasi darurat' 
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    return new Response('Endpoint tidak ditemukan.', { status: 404, headers: corsHeaders });
  },
};