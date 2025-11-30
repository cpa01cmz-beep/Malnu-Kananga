// worker.js - Kode backend GABUNGAN untuk Login, RAG Retriever, dan Seeder

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

    // --- Endpoint Login ---
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
    
    // --- Endpoint Verifikasi Login ---
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
