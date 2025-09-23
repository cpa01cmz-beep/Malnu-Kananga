// worker.js - Kode backend lengkap dengan endpoint AI

export default {
  async fetch(request, env) {
    // Menambahkan header CORS untuk mengizinkan permintaan dari website Anda
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Ganti '*' dengan domain Anda untuk produksi
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // --- Endpoint untuk AI Chat (BARU) ---
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      const { message, history } = await request.json();

      // 1. Cari konteks relevan di Vectorize
      const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [message] });
      const vectors = embeddings.data[0];
      
      const SIMILARITY_CUTOFF = 0.75;
      const topK = 5;
      
      const vectorQuery = await env.VECTORIZE_INDEX.query(vectors, { topK, returnMetadata: true });
      
      let context = "";
      if (vectorQuery.matches.length > 0) {
        const relevantMatches = vectorQuery.matches.filter(match => match.score > SIMILARITY_CUTOFF);
        if(relevantMatches.length > 0) {
            context = "Konteks dari website sekolah:\n" + relevantMatches.map(match => match.metadata.text).join("\n\n---\n\n");
        }
      }

      // 2. Buat prompt untuk LLM
      const systemPrompt = `Anda adalah 'Asisten MA Malnu Kananga', chatbot AI yang ramah, sopan, dan sangat membantu, berbicara dalam Bahasa Indonesia. Tugas Anda adalah menjawab pertanyaan tentang sekolah MA Malnu Kananga berdasarkan konteks yang diberikan dari website sekolah. Jika konteks tidak cukup untuk menjawab, katakan Anda tidak memiliki informasi tersebut dan sarankan untuk menghubungi pihak sekolah. JANGAN menjawab pertanyaan di luar topik sekolah.`;
      
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history, // Menambahkan riwayat percakapan sebelumnya
        { role: 'user', content: `${message}\n\n${context}` }
      ];

      // 3. Panggil model AI (LLM) untuk generasi jawaban
      const stream = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages,
        stream: true
      });
      
      return new Response(stream, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' }
      });
    }

    // Endpoint untuk meminta link login
    if (url.pathname === '/request-login-link' && request.method === 'POST') {
      // ... (kode login dari sebelumnya tetap di sini) ...
      try {
        const { email } = await request.json();
        if (!email) {
          return new Response(JSON.stringify({ message: 'Email diperlukan.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const userQuery = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (!userQuery) {
          return new Response(JSON.stringify({ message: 'Email tidak terdaftar.' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const token = btoa(email + ":" + (Date.now() + 15 * 60 * 1000));
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
        return new Response(JSON.stringify({ success: true, message: 'Link login telah dikirim.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ message: 'Terjadi kesalahan pada server.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Endpoint untuk verifikasi token dari link email
    if (url.pathname === '/verify-login') {
      // ... (kode verifikasi dari sebelumnya tetap di sini) ...
       const token = url.searchParams.get('token');
        if (!token) return new Response('Token tidak valid atau hilang.', { status: 400 });
        try {
            const [email, expiry] = atob(token).split(':');
            if (Date.now() > Number(expiry)) {
                return new Response('Link login sudah kedaluwarsa. Silakan minta link baru.', { status: 400 });
            }
            const headers = new Headers();
            headers.set('Set-Cookie', `auth_session=${btoa(email)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`);
            headers.set('Location', new URL(request.url).origin);
            return new Response(null, { status: 302, headers });
        } catch(e) {
            return new Response('Token tidak valid atau rusak.', { status: 400 });
        }
    }

    return new Response('Endpoint tidak ditemukan.', { status: 404, headers: corsHeaders });
  },
};
