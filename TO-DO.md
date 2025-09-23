# Proyek To-Do & Rencana Pengembangan

Dokumen ini berisi daftar tugas dan rencana pengembangan untuk fitur-fitur di masa depan.

## [Prioritas Utama] Implementasi Asisten AI Cerdas (RAG)

Tujuan: Mengganti Asisten AI simulasi dengan AI sungguhan yang mampu menjawab pertanyaan berdasarkan konten website menggunakan arsitektur RAG (Retrieval-Augmented Generation) di Cloudflare.

---

### Bagian 1: Setup Backend di Cloudflare

#### Langkah 1.1: Buat Indeks Vectorize (Memori AI)
1.  Buka **Workers & Pages** > **Vectorize** di dashboard Cloudflare.
2.  **Create Index** dengan nama `malnu-knowledge-base`.
3.  Gunakan preset **BAAI/bge-base-en-v1.5**.

#### Langkah 1.2: Buat & Jalankan "Seeder Worker"
Worker ini hanya dijalankan sekali untuk mengisi "memori" AI.
1.  Buat Worker baru dengan nama `malnu-seeder`.
2.  Salin dan tempel kode di bawah ini ke dalam worker tersebut.
3.  Lakukan *binding* ke Vectorize Index `malnu-knowledge-base` dengan nama variabel `VECTORIZE_INDEX`.
4.  Lakukan *binding* ke **AI** dengan nama variabel `AI`.
5.  Deploy, lalu panggil URL-nya dengan path `/seed` (misal: `https://malnu-seeder.nama.workers.dev/seed`) untuk mengisi data.

**Kode untuk `seeder-worker.js`:**
```javascript
// seeder-worker.js - Worker untuk mengisi "memori" AI (Vectorize Index)

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
    const { pathname } = new URL(request.url);

    if (pathname === '/seed') {
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
        return new Response(`Successfully seeded ${vectorsToInsert.length} documents.`);
      } catch (e) {
        return new Response(`Error seeding data: ${e.message}`, { status: 500 });
      }
    }
    return new Response('Not found.', { status: 404 });
  }
};
```

#### Langkah 1.3: Perbarui Worker API Utama (`malnu-api`)
1.  Buka worker `malnu-api` yang sudah ada.
2.  Tambahkan *endpoint* baru `/api/chat` dan logika RAG-nya. Kode lengkap ada di file `worker.js` di dalam proyek ini.
3.  Lakukan *binding* ke Vectorize Index `malnu-knowledge-base` dengan nama variabel `VECTORIZE_INDEX`.
4.  Lakukan *binding* ke **AI** dengan nama variabel `AI`.
5.  Pastikan *binding* `DB` tetap ada. Deploy ulang.

---

### Bagian 2: Integrasi Frontend

#### Langkah 2.1: Perbarui Service AI
-   Ganti isi file `services/geminiService.ts` agar tidak lagi menggunakan simulasi, melainkan melakukan `fetch` ke endpoint `/api/chat` di worker `malnu-api`. Pastikan untuk mengganti URL placeholder dengan URL worker yang sebenarnya.

#### Langkah 2.2: Implementasi Riwayat Percakapan
-   Perbarui komponen `components/ChatWindow.tsx` untuk menyimpan riwayat percakapan dalam `state`.
-   Kirim riwayat ini bersama setiap permintaan baru ke backend. Ini memungkinkan AI memahami konteks percakapan.

---

### Bagian 3: Fitur Lanjutan (Opsional)
-   [ ] Tambahkan tombol umpan balik (suka/tidak suka) pada setiap jawaban AI.
-   [ ] Simpan umpan balik ke database D1 untuk analisis.
-   [ ] Buat mekanisme untuk memperbarui "memori" AI secara otomatis saat konten website berubah.
