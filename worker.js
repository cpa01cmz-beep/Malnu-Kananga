// worker.js - Salin seluruh konten ini ke editor Cloudflare Worker Anda

export default {
  async fetch(request, env) {
    // Menambahkan header CORS untuk mengizinkan permintaan dari website Anda
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Untuk produksi, ganti '*' dengan domain website Anda, misal: 'https://ma-malnukananga.sch.id'
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Menangani permintaan preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Endpoint untuk meminta link login
    if (url.pathname === '/request-login-link' && request.method === 'POST') {
      try {
        const { email } = await request.json();
        if (!email) {
          return new Response(JSON.stringify({ message: 'Email diperlukan.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // --- LANGKAH OTORISASI (Allowlist Check) ---
        // Periksa apakah email ada di dalam database (daftar yang diizinkan)
        const userQuery = await env.DB.prepare(
          "SELECT id FROM users WHERE email = ?"
        ).bind(email).first();

        if (!userQuery) {
          // Jika email tidak ditemukan, kirim error "Forbidden". Link TIDAK akan dikirim.
          return new Response(JSON.stringify({ message: 'Email tidak terdaftar.' }), {
            status: 403, // 403 Forbidden
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        // --- AKHIR LANGKAH OTORISASI ---

        // Jika email terdaftar, lanjutkan proses membuat dan mengirim magic link.
        const token = btoa(email + ":" + (Date.now() + 15 * 60 * 1000)); // Token berlaku 15 menit
        const magicLink = `${url.origin}/verify-login?token=${token}`;

        const emailBody = `
          <h1>Login ke Akun MA Malnu Kananga</h1>
          <p>Klik tautan di bawah ini untuk masuk. Tautan ini hanya berlaku selama 15 menit.</p>
          <a href="${magicLink}" style="padding: 10px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 5px;">
            Login Sekarang
          </a>
          <p>Jika Anda tidak meminta link ini, abaikan email ini.</p>
        `;

        // Kirim email via MailChannels
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
        console.error(e);
        return new Response(JSON.stringify({ message: 'Terjadi kesalahan pada server.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Endpoint untuk verifikasi token dari link email
    if (url.pathname === '/verify-login') {
        const token = url.searchParams.get('token');
        if (!token) {
             return new Response('Token tidak valid atau hilang.', { status: 400 });
        }

        try {
            const [email, expiry] = atob(token).split(':');
            if (Date.now() > Number(expiry)) {
                return new Response('Link login sudah kedaluwarsa. Silakan minta link baru.', { status: 400 });
            }

            // Jika valid, buat sesi (atur cookie) dan redirect ke halaman utama
            const headers = new Headers();
            // Cookie HttpOnly tidak bisa diakses dari JavaScript di browser, membuatnya lebih aman.
            headers.set('Set-Cookie', `auth_session=${btoa(email)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`); // Sesi 1 hari
            headers.set('Location', url.origin); // Redirect ke homepage
            return new Response(null, { status: 302, headers });

        } catch(e) {
            return new Response('Token tidak valid atau rusak.', { status: 400 });
        }
    }

    return new Response('Endpoint tidak ditemukan.', { status: 404, headers: corsHeaders });
  },
};
