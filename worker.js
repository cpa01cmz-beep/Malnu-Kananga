// worker.js - Kode backend GABUNGAN untuk Login, RAG Retriever, dan Seeder
/// <reference types="@cloudflare/workers-types" />
import SecurityMiddleware from './security-middleware.js';

// --- CSRF PROTECTION ---

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
   if (!secret || secret === 'default-secret-key-for-worker' || secret.length < 32) {
     throw new Error('Secure JWT_SECRET environment variable required (min 32 characters, not default value)');
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
  if (!secret || secret === 'default-secret-key-for-worker' || secret.length < 32) {
    throw new Error('Invalid secret key: Must be at least 32 characters and not use default value');
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
    if (!env.SECRET_KEY || env.SECRET_KEY === 'default-secret-key-for-worker') {
      console.error('SECURITY: Attempted token verification with default secret key');
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
  async fetch(request, env, ctx) {
    const security = new SecurityMiddleware();
    const securityLogger = new SecurityLogger(env);
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
        }

        // Test Vectorize service availability
        try {
          await env.VECTORIZE_INDEX.query([0.1, 0.2, 0.3], { topK: 1 });
          healthStatus.services.vectorize = 'operational';
        } catch (vectorError) {
          healthStatus.services.vectorize = 'degraded';
          healthStatus.status = 'degraded';
        }

        // Test D1 database availability
        try {
          await env.DB.prepare('SELECT 1').first();
          healthStatus.services.database = 'operational';
        } catch (dbError) {
          healthStatus.services.database = 'degraded';
          healthStatus.status = 'degraded';
        }

        const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
        
        return new Response(JSON.stringify(healthStatus), {
          status: statusCode,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (e) {
        return new Response(JSON.stringify({ 
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: e.message 
        }), {
          status: 503,
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
        if (!env.SECRET_KEY || env.SECRET_KEY === 'default-secret-key-for-worker') {
          console.error('SECURITY: Attempted signature generation with default secret');
          return new Response(JSON.stringify({ message: 'Server configuration error.' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const secret = env.SECRET_KEY;
        const signature = await generateHMACSignature(data, secret);
        return new Response(JSON.stringify({ signature }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (e) {
        console.error('Signature generation error:', e.message);
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
        if (!env.SECRET_KEY || env.SECRET_KEY === 'default-secret-key-for-worker') {
          console.error('SECURITY: Attempted signature verification with default secret');
          return new Response(JSON.stringify({ message: 'Server configuration error.' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const secret = env.SECRET_KEY;
        const isValid = await verifyHMACSignature(data, signature, secret);
        return new Response(JSON.stringify({ isValid }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (e) {
        console.error('Signature verification error:', e.message);
        return new Response(JSON.stringify({ message: 'Terjadi kesalahan pada server.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    return new Response('Endpoint tidak ditemukan.', { status: 404, headers: corsHeaders });
  },
};