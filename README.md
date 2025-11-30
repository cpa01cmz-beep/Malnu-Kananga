
# Website & Portal Pintar MA Malnu Kananga

Selamat datang di repositori resmi **MA Malnu Kananga Smart Portal**. Aplikasi ini adalah transformasi modern dari website sekolah tradisional menjadi platform pintar berbasis AI yang melayani publik, siswa, guru, dan administrator dalam satu ekosistem.

## 🔑 Akun Pengujian (Demo Data)

Untuk mempermudah pengujian fitur, berikut adalah daftar akun simulasi yang telah disiapkan dalam sistem. Anda dapat menggunakan tombol **Mode Simulasi** di Login Modal atau melihat data ini di menu **Manajemen User** (Admin).

| Nama Pengguna | Role Utama | Role Extra | Fitur Khusus |
| :--- | :--- | :--- | :--- |
| **Ahmad Dahlan** | `Admin` | - | AI Editor, Manajemen User, PPDB |
| **Siti Aminah** | `Guru` | `Staff` | Input Nilai, Wali Kelas, **Inventaris** |
| **Budi Santoso** | `Siswa` | `OSIS` | Jadwal, Nilai, **Kegiatan OSIS** |
| **Rudi Hartono** | `Guru` | - | Input Nilai, Wali Kelas |
| **Dewi Sartika** | `Siswa` | - | Jadwal, Nilai, E-Library |

> **Catatan:** Jika Anda tidak melihat akun-akun ini di tabel Manajemen User, silakan lakukan **"Factory Reset"** melalui menu **Laporan & Log** di Dashboard Admin untuk me-reset data lokal browser Anda.

## 🚀 Fitur Utama

### 1. Multi-Role Dashboard
Sistem dashboard cerdas yang beradaptasi dengan peran pengguna:
- **Publik**: Landing page modern dengan informasi PPDB, Profil, dan Berita.
- **Siswa**: Portal untuk melihat jadwal, nilai, dan materi (Simulasi).
- **Guru**: Dashboard manajemen kelas dan input nilai (Simulasi).
- **Administrator**: Akses eksklusif ke Editor AI dan manajemen sistem.

### 2. Sistem PPDB Online (End-to-End)
Alur pendaftaran siswa baru yang lengkap:
- **Formulir Publik**: Calon siswa dapat mendaftar dan mengunggah dokumen via modal interaktif.
- **Manajemen Admin**: Dashboard khusus untuk memverifikasi data pendaftar.
- **Notifikasi Pintar**: Badge notifikasi real-time bagi Admin saat ada pendaftar baru.

### 3. Generative AI Site Editor (Admin Only)
Administrator dapat mengubah konten website (Program Unggulan & Berita) hanya dengan percakapan bahasa alami.
- **Dynamic State Injection**: AI "sadar" akan konten website saat ini sebelum melakukan perubahan.
- **Visual Preview**: Melihat hasil editan secara langsung sebelum diterapkan.
- **Auto-Fallbacks**: Penanganan cerdas untuk gambar yang hilang atau rusak.

### 4. Asisten AI Cerdas (RAG Chatbot)
Chatbot yang melayang di pojok kanan bawah, siap menjawab pertanyaan pengunjung.
- **RAG (Retrieval-Augmented Generation)**: Menjawab berdasarkan database pengetahuan sekolah (via Cloudflare Vectorize).
- **Context-Aware**: Jika Admin baru saja mengupdate berita via Editor, Chatbot akan langsung tahu tanpa perlu update database.

### 5. Sistem Autentikasi Hybrid
- **Magic Link**: Login aman tanpa password menggunakan email (Backend Cloudflare D1 + MailChannels).
- **Simulasi Demo**: Mode login cepat untuk keperluan testing/presentasi (Admin, Guru, Siswa).

### 6. Tampilan Modern
- **Responsive Design**: Optimal di HP, Tablet, dan Desktop.
- **Dark Mode**: Dukungan tema gelap/terang otomatis maupun manual.

## 🛠️ Teknologi

- **Frontend**: React 18, Vite, Tailwind CSS.
- **AI**: Google Gemini API (`@google/genai`).
- **Backend (Serverless)**: Cloudflare Workers.
- **Database**: Cloudflare D1 (SQL) & Vectorize (Vector DB).

## 📂 Struktur Proyek

Lihat `ARCHITECTURE.md` untuk detail lengkap mengenai struktur kode dan aliran data.

## 🏃‍♂️ Cara Menjalankan

1.  Clone repositori ini.
2.  Buat file `.env` dan isi `API_KEY` Gemini Anda.
3.  Jalankan `npm install`.
4.  Jalankan `npm run dev`.
