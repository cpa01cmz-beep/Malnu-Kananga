// seeder-worker.js - Worker untuk mengisi "memori" AI (Vectorize Index)

// --- DATA KONTEN WEBSITE ---
// Ini adalah "memori" yang akan dimiliki oleh AI.
// Di aplikasi nyata, ini bisa diambil secara otomatis dari database atau CMS.
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
// -------------------------

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    // Endpoint ini akan kita panggil secara manual untuk memulai proses seeding
    if (pathname === '/seed') {
      try {
        const texts = documents.map(doc => doc.text);
        
        // 1. Buat vector embeddings dari teks konten
        const embeddingsResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: texts });
        const vectors = embeddingsResponse.data;

        // 2. Siapkan data untuk dimasukkan ke Vectorize
        const vectorsToInsert = vectors.map((vector, i) => ({
          id: documents[i].id.toString(),
          values: vector,
          metadata: { text: documents[i].text } // Simpan teks asli sebagai metadata
        }));

        // 3. Masukkan data ke Vectorize Index
        // Kita pecah menjadi beberapa batch untuk menghindari limit
        const batchSize = 100;
        for (let i = 0; i < vectorsToInsert.length; i += batchSize) {
          const batch = vectorsToInsert.slice(i, i + batchSize);
          await env.VECTORIZE_INDEX.insert(batch);
        }

        return new Response(`Successfully seeded ${vectorsToInsert.length} documents into the vector index.`);
      } catch (e) {
        return new Response(`Error seeding data: ${e.message}`, { status: 500 });
      }
    }

    return new Response('Not found.', { status: 404 });
  }
};
