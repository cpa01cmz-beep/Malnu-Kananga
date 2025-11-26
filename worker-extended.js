// worker-extended.js - Extended backend dengan API endpoints untuk semua data

// --- DATA KONTEN WEBSITE (SUMBER PENGETAHUAN AI) ---
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
// Secure CORS configuration - restrict to specific domains
  const allowedOrigins = [
    'https://ma-malnukananga.sch.id',
    'https://www.ma-malnukananga.sch.id',
    'http://localhost:3000', // Development only
    'http://localhost:5173'  // Vite default port
  ];
  
  const origin = request.headers.get('Origin');
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
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
            headers.set('Set-Cookie', `__Host-auth_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=900; Partitioned`);
            headers.set('Location', new URL(request.url).origin);
            return new Response(null, { status: 302, headers });
        } catch(e) {
            return new Response('Token tidak valid atau rusak.', { status: 400 });
        }
    }

    // --- Featured Programs API Endpoints ---
    if (url.pathname.startsWith('/api/featured-programs')) {
      const pathSegments = url.pathname.split('/');
      const id = pathSegments[3];

      if (url.pathname === '/api/featured-programs' && request.method === 'GET') {
        try {
          const programs = await env.DB.prepare("SELECT * FROM featured_programs WHERE is_active = 1 ORDER BY sort_order").all();
          return new Response(JSON.stringify(programs.results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error fetching featured programs' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (id && request.method === 'GET') {
        try {
          const program = await env.DB.prepare("SELECT * FROM featured_programs WHERE id = ?").bind(id).first();
          if (!program) {
            return new Response(JSON.stringify({ message: 'Featured program not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          return new Response(JSON.stringify(program), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error fetching featured program' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (url.pathname === '/api/featured-programs' && request.method === 'POST') {
        try {
          const { title, description, imageUrl, sortOrder } = await request.json();
          const result = await env.DB.prepare(
            "INSERT INTO featured_programs (title, description, image_url, sort_order) VALUES (?, ?, ?, ?) RETURNING *"
          ).bind(title, description, imageUrl, sortOrder || 0).first();
          return new Response(JSON.stringify(result), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error creating featured program' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (id && request.method === 'PUT') {
        try {
          const updates = await request.json();
          const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
          const values = Object.values(updates);

          const result = await env.DB.prepare(
            `UPDATE featured_programs SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`
          ).bind(...values, id).first();

          if (!result) {
            return new Response(JSON.stringify({ message: 'Featured program not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error updating featured program' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (id && request.method === 'DELETE') {
        try {
          const result = await env.DB.prepare("DELETE FROM featured_programs WHERE id = ? RETURNING *").bind(id).first();
          if (!result) {
            return new Response(JSON.stringify({ message: 'Featured program not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          return new Response(JSON.stringify({ message: 'Featured program deleted' }), { headers: corsHeaders });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error deleting featured program' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
    }

    // --- News API Endpoints ---
    if (url.pathname.startsWith('/api/news')) {
      const pathSegments = url.pathname.split('/');
      const id = pathSegments[3];

      if (url.pathname === '/api/news' && request.method === 'GET') {
        try {
          const news = await env.DB.prepare("SELECT * FROM latest_news WHERE is_active = 1 ORDER BY sort_order DESC, publish_date DESC").all();
          return new Response(JSON.stringify(news.results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error fetching news' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (id && request.method === 'GET') {
        try {
          const newsItem = await env.DB.prepare("SELECT * FROM latest_news WHERE id = ?").bind(id).first();
          if (!newsItem) {
            return new Response(JSON.stringify({ message: 'News not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          return new Response(JSON.stringify(newsItem), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error fetching news' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (url.pathname === '/api/news' && request.method === 'POST') {
        try {
          const { title, content, summary, category, imageUrl, publishDate, sortOrder } = await request.json();
          const result = await env.DB.prepare(
            "INSERT INTO latest_news (title, content, summary, category, image_url, publish_date, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *"
          ).bind(title, content, summary, category, imageUrl, publishDate, sortOrder || 0).first();
          return new Response(JSON.stringify(result), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error creating news' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (id && request.method === 'PUT') {
        try {
          const updates = await request.json();
          const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
          const values = Object.values(updates);

          const result = await env.DB.prepare(
            `UPDATE latest_news SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`
          ).bind(...values, id).first();

          if (!result) {
            return new Response(JSON.stringify({ message: 'News not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error updating news' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (id && request.method === 'DELETE') {
        try {
          const result = await env.DB.prepare("DELETE FROM latest_news WHERE id = ? RETURNING *").bind(id).first();
          if (!result) {
            return new Response(JSON.stringify({ message: 'News not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          return new Response(JSON.stringify({ message: 'News deleted' }), { headers: corsHeaders });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error deleting news' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
    }

    // --- Student API Endpoints ---
    if (url.pathname.startsWith('/api/students')) {
      const pathSegments = url.pathname.split('/');
      const id = pathSegments[3];

      if (url.pathname === '/api/students' && request.method === 'GET') {
        try {
          const students = await env.DB.prepare("SELECT * FROM students WHERE status = 'active' ORDER BY name").all();
          return new Response(JSON.stringify(students.results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error fetching students' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (id && request.method === 'GET') {
        try {
          const student = await env.DB.prepare("SELECT * FROM students WHERE student_id = ?").bind(id).first();
          if (!student) {
            return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          return new Response(JSON.stringify(student), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error fetching student' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (url.pathname === '/api/students' && request.method === 'POST') {
        try {
          const { studentId, name, email, class: className, academicYear, dateOfBirth, address, phone, parentPhone, profileImage, enrollmentDate } = await request.json();
          const result = await env.DB.prepare(
            "INSERT INTO students (student_id, name, email, class_id, academic_year, date_of_birth, address, phone, parent_phone, profile_image, enrollment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *"
          ).bind(studentId, name, email, className, academicYear, dateOfBirth, address, phone, parentPhone, profileImage, enrollmentDate).first();
          return new Response(JSON.stringify(result), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error creating student' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (id && request.method === 'PUT') {
        try {
          const updates = await request.json();
          const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
          const values = Object.values(updates);

          const result = await env.DB.prepare(
            `UPDATE students SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE student_id = ? RETURNING *`
          ).bind(...values, id).first();

          if (!result) {
            return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error updating student' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (id && request.method === 'DELETE') {
        try {
          const result = await env.DB.prepare("UPDATE students SET status = 'inactive' WHERE student_id = ? RETURNING *").bind(id).first();
          if (!result) {
            return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          return new Response(JSON.stringify({ message: 'Student deactivated' }), { headers: corsHeaders });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error deactivating student' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      // Get student grades
      if (id && url.pathname === `/api/students/${id}/grades` && request.method === 'GET') {
        try {
          const grades = await env.DB.prepare(
            "SELECT g.*, s.name as subject_name FROM grades g JOIN subjects s ON g.subject_id = s.id WHERE g.student_id = (SELECT id FROM students WHERE student_id = ?) ORDER BY g.academic_year DESC, g.semester DESC"
          ).bind(id).all();
          return new Response(JSON.stringify(grades.results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error fetching student grades' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      // Get student attendance
      if (id && url.pathname === `/api/students/${id}/attendance` && request.method === 'GET') {
        try {
          const month = url.searchParams.get('month');
          const year = url.searchParams.get('year');

          let query = "SELECT a.*, s.name as subject_name FROM attendance a JOIN subjects s ON a.subject_id = s.id WHERE a.student_id = (SELECT id FROM students WHERE student_id = ?)";
          let bindParams = [id];

          if (month && year) {
            query += " AND strftime('%m', a.date) = ? AND strftime('%Y', a.date) = ?";
            bindParams.push(month.padStart(2, '0'), year);
          }

          query += " ORDER BY a.date DESC";

          const attendance = await env.DB.prepare(query).bind(...bindParams).all();
          return new Response(JSON.stringify(attendance.results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error fetching student attendance' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      // Get student schedule
      if (id && url.pathname === `/api/students/${id}/schedule` && request.method === 'GET') {
        try {
          const student = await env.DB.prepare("SELECT class_id FROM students WHERE student_id = ?").bind(id).first();
          if (!student) {
            return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          const schedule = await env.DB.prepare(
            "SELECT sc.*, s.name as subject_name, s.code as subject_code FROM schedule sc JOIN subjects s ON sc.subject_id = s.id WHERE sc.class_id = ? ORDER BY CASE sc.day WHEN 'Senin' THEN 1 WHEN 'Selasa' THEN 2 WHEN 'Rabu' THEN 3 WHEN 'Kamis' THEN 4 WHEN 'Jumat' THEN 5 END, sc.time_start"
          ).bind(student.class_id).all();

          return new Response(JSON.stringify(schedule.results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ message: 'Error fetching student schedule' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
    }

    return new Response('Endpoint tidak ditemukan.', { status: 404, headers: corsHeaders });
  },
};