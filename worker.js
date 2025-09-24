// worker.js - Kode backend disederhanakan untuk RAG Retriever

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

    // --- Endpoint untuk RAG Context Retrieval (PENCARI INFO) ---
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { message } = await request.json();

        // 1. Ubah pertanyaan menjadi vektor
        const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [message] });
        const vectors = embeddings.data[0];
        
        // 2. Cari vektor yang mirip di Vectorize
        const SIMILARITY_CUTOFF = 0.75;
        const topK = 3;
        const vectorQuery = await env.VECTORIZE_INDEX.query(vectors, { topK, returnMetadata: true });
        
        let context = "";
        if (vectorQuery.matches.length > 0) {
          const relevantMatches = vectorQuery.matches.filter(match => match.score > SIMILARITY_CUTOFF);
          if(relevantMatches.length > 0) {
              // Gabungkan teks dari hasil yang relevan untuk jadi konteks
              context = relevantMatches.map(match => match.metadata.text).join("\n\n---\n\n");
          }
        }
        
        // 3. Kirim balik konteks sebagai JSON
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

    // --- Endpoint Login (Tidak berubah) ---
    if (url.pathname === '/request-login-link' && request.method === 'POST') {
      try {
        const { email } = await request.json();
        if (!email) {
          return new Response(JSON.stringify({ message: 'Email diperlukan.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
        }
        const userQuery = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (!userQuery) {
          return new Response(JSON.stringify({ message: 'Email tidak terdaftar.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
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
        return new Response(JSON.stringify({ success: true, message: 'Link login telah dikirim.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (e) {
        return new Response(JSON.stringify({ message: 'Terjadi kesalahan pada server.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }
    
    if (url.pathname === '/verify-login') {
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