// worker.js - Kode backend GABUNGAN untuk Login, RAG Retriever, dan Seeder

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

// Rate limiting storage (in production, use KV storage or external Redis)
const rateLimitStore = new Map();

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 menit window
  maxAttempts: 5, // Maksimal 5 attempts per window
  blockDuration: 30 * 60 * 1000 // Block selama 30 menit jika limit exceeded
};

function getClientIP(request) {
  // Cloudflare Workers: get client IP from headers
  return request.headers.get('CF-Connecting-IP') ||
         request.headers.get('X-Forwarded-For') ||
         'unknown';
}

function isRateLimited(clientIP) {
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
  if (now - clientData.firstAttempt > RATE_LIMIT.windowMs) {
    rateLimitStore.set(clientIP, {
      attempts: 1,
      firstAttempt: now,
      blockedUntil: null
    });
    return false;
  }

  // Increment attempts
  clientData.attempts++;

  if (clientData.attempts > RATE_LIMIT.maxAttempts) {
    clientData.blockedUntil = now + RATE_LIMIT.blockDuration;
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

  // Generate signature using HMAC-SHA256 with secret key from environment
  const secret = env.SECRET_KEY || 'default-secret-key-for-worker';
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
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature using HMAC-SHA256
    const secret = env.SECRET_KEY || 'default-secret-key-for-worker';
    const isValid = await verifyHMACSignature(`${encodedHeader}.${encodedPayload}`, signature, secret);
    
    if (!isValid) {
      return null; // Invalid signature
    }

    const paddedPayload = encodedPayload + '='.repeat((4 - encodedPayload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));

    const tokenData = JSON.parse(decodedPayload);

    if (Date.now() / 1000 > tokenData.exp) {
      return null;
    }

    return tokenData;
  } catch (error) {
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
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

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

    // --- Endpoint Login ---
    if (url.pathname === '/request-login-link' && request.method === 'POST') {
      try {
        const clientIP = getClientIP(request);

        // Check rate limiting
        if (isRateLimited(clientIP)) {
          return new Response(JSON.stringify({
            message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 30 menit.'
          }), {
            status: 429,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Retry-After': '1800'
            }
          });
        }

        const { email } = await request.json();
        if (!email) {
          return new Response(JSON.stringify({ message: 'Email diperlukan.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response(JSON.stringify({ message: 'Format email tidak valid.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
        }

        // Simplified auth - accept any email for demo purposes
        // TODO: Replace with proper KV storage or external database when available
        const token = await generateSecureToken(email, 15 * 60 * 1000);
        const magicLink = `${new URL(request.url).origin}/verify-login?token=${token}`;
        const emailBody = `<h1>Login ke Akun MA Malnu Kananga</h1><p>Klik tautan di bawah ini untuk masuk. Tautan ini hanya berlaku selama 15 menit.</p><a href="${magicLink}" style="padding: 10px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 5px;">Login Sekarang</a><p>Jika Anda tidak meminta link ini, abaikan email ini.</p>`;
        const send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: email, name: 'Pengguna' }] }],
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
            headers.set('Set-Cookie', `__Host-auth_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`);
            headers.set('Location', new URL(request.url).origin);
            return new Response(null, { status: 302, headers });
        } catch(e) {
            return new Response('Token tidak valid atau rusak.', { status: 400 });
        }
    }
    
    // --- Endpoint untuk Generate Signature ---
    if (url.pathname === '/generate-signature' && request.method === 'POST') {
      try {
        const { data } = await request.json();
        if (!data) {
          return new Response(JSON.stringify({ message: 'Data diperlukan.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
        }
        
        // Gunakan secret key yang disimpan di environment variable
        const secret = env.SECRET_KEY || 'default-secret-key-for-worker';
        const signature = await generateHMACSignature(data, secret);
        return new Response(JSON.stringify({ signature }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (e) {
        return new Response(JSON.stringify({ message: 'Terjadi kesalahan pada server.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }
    
    // --- Endpoint untuk Verify Signature ---
    if (url.pathname === '/verify-signature' && request.method === 'POST') {
      try {
        const { data, signature } = await request.json();
        if (!data || !signature) {
          return new Response(JSON.stringify({ message: 'Data dan signature diperlukan.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
        }
        
        // Gunakan secret key yang disimpan di environment variable
        const secret = env.SECRET_KEY || 'default-secret-key-for-worker';
        const isValid = await verifyHMACSignature(data, signature, secret);
        return new Response(JSON.stringify({ isValid }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (e) {
        return new Response(JSON.stringify({ message: 'Terjadi kesalahan pada server.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    return new Response('Endpoint tidak ditemukan.', { status: 404, headers: corsHeaders });
  },
};