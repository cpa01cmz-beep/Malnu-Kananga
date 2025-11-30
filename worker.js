
// worker.js - Backend Serverless (Cloudflare Worker)
// Mengintegrasikan: D1 (Auth), Vectorize (RAG Knowledge Base), dan Workers AI (Embeddings)

// --- DATA SEEDER (Konten Awal) ---
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

export default {
  async fetch(request, env) {
    // CORS Configuration
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle Preflight Request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Helper: Cek kelengkapan environment
    const isReady = env.AI && env.VECTORIZE_INDEX && env.DB;

    // --- 1. Endpoint Seeding (Setup Awal) ---
    if (url.pathname === '/seed') {
      try {
        if (!isReady) {
            return new Response("Konfigurasi Cloudflare Bindings (AI/Vectorize/D1) belum lengkap. Seeding dilewati.", { headers: corsHeaders });
        }

        const texts = documents.map(doc => doc.text);
        
        // Generate Embeddings
        const embeddingsResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: texts });
        const vectors = embeddingsResponse.data;

        const vectorsToInsert = vectors.map((vector, i) => ({
          id: documents[i].id.toString(),
          values: vector,
          metadata: { text: documents[i].text }
        }));

        // Batch Insert ke Vectorize
        const batchSize = 100;
        for (let i = 0; i < vectorsToInsert.length; i += batchSize) {
          const batch = vectorsToInsert.slice(i, i + batchSize);
          await env.VECTORIZE_INDEX.insert(batch);
        }

        // Setup D1 Table
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            role TEXT DEFAULT 'student',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `).run();

        // Seed Admin
        await env.DB.prepare(`
          INSERT OR IGNORE INTO users (email, role) VALUES ('admin@malnu.sch.id', 'admin')
        `).run();

        return new Response(`Database seeded successfully! ${vectorsToInsert.length} vectors inserted.`, { headers: corsHeaders });
      } catch (e) {
        return new Response(`Error seeding data: ${e.message}`, { status: 500, headers: corsHeaders });
      }
    }

    // --- 2. Endpoint RAG Context (Chatbot) ---
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { message } = await request.json();
        
        // Graceful Fallback jika binding belum ada
        if (!isReady) {
             console.warn("Backend bindings missing. Returning empty context.");
             return new Response(JSON.stringify({ context: "" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
             });
        }

        // Generate Embedding dari pertanyaan user
        const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [message] });
        const vectors = embeddings.data[0];
        
        // Query Vectorize
        const vectorQuery = await env.VECTORIZE_INDEX.query(vectors, { topK: 3, returnMetadata: true });
        
        let context = "";
        const SIMILARITY_CUTOFF = 0.55; 

        if (vectorQuery.matches && vectorQuery.matches.length > 0) {
          const relevantMatches = vectorQuery.matches.filter(match => match.score > SIMILARITY_CUTOFF);
          if(relevantMatches.length > 0) {
              context = relevantMatches.map(match => match.metadata.text).join("\n\n---\n\n");
          }
        }
        
        return new Response(JSON.stringify({ context }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (e) {
        console.error("Worker RAG Error:", e);
        // Jangan return 500 ke frontend agar chat tetap jalan (graceful degradation)
        return new Response(JSON.stringify({ context: "" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // --- 3. Endpoint Login (Magic Link) ---
    if (url.pathname === '/request-login-link' && request.method === 'POST') {
      try {
        const { email } = await request.json();
        if (!email) return new Response(JSON.stringify({ message: 'Email diperlukan.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
        
        // Simulasi sukses untuk frontend, real logic butuh binding DB & MailChannels
        return new Response(JSON.stringify({ success: true, message: 'Link login (Simulasi) telah dikirim.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      } catch (e) {
        return new Response(JSON.stringify({ message: 'Terjadi kesalahan pada server.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }
    }

    return new Response('Endpoint tidak ditemukan.', { status: 404, headers: corsHeaders });
  },
};
