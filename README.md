# Website & Portal Siswa MA Malnu Kananga

Selamat datang di repositori resmi untuk website Madrasah Aliyah Malnu Kananga. Proyek ini dibangun dengan pendekatan modern, mobile-first, dan terintegrasi dengan teknologi AI terkini untuk pengalaman pengguna yang interaktif.
## 🚀 Deploy Sekali Klik

[![Deploy ke Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sulhi/ma-malnu-kananga)

**Deploy otomatis** ke Cloudflare dengan sekali klik! Button di atas akan:
- ✅ Membuat semua resources Cloudflare (Pages, Workers, D1, Vectorize)
- ✅ Deploy frontend dan backend secara otomatis
- ✅ Konfigurasi environment variables
- ✅ Seed database dengan konten awal

### Prerequisites untuk One-Click Deploy:
1. **GitHub Account** dengan repository ini
2. **Cloudflare Account** dengan API token
3. **Google Gemini API Key** (akan diminta selama setup)

---


## Ringkasan Fitur

- **Website Publik**: Halaman informasi sekolah yang modern, responsif, dan cepat.
- **Asisten AI Cerdas (RAG)**: Chatbot interaktif ditenagai oleh **Google Gemini** yang mampu menjawab pertanyaan berdasarkan konten website.
- **Sistem Login Tanpa Kata Sandi**: Autentikasi aman menggunakan "Magic Link" tanpa perlu kata sandi.
- **Portal Siswa**: Area pribadi untuk siswa mengakses informasi akademik (dasar sudah ada, pengembangan lebih lanjut direncanakan).

## Tumpukan Teknologi (Tech Stack)

Proyek ini menggunakan arsitektur hybrid yang modern:

- **Frontend**:
    - **React**: Library utama untuk membangun antarmuka pengguna.
    - **TypeScript**: Untuk pengetikan statis yang kuat dan kode yang lebih mudah dipelihara.
    - **Tailwind CSS**: Framework CSS utility-first untuk desain yang cepat dan responsif.
    - **Google Gemini API (`@google/genai`)**: Diintegrasikan langsung di frontend untuk kemampuan AI generatif.
- **Backend (Serverless)**:
    - **Cloudflare Workers**: Digunakan untuk logika backend seperti:
        - API autentikasi "Magic Link".
        - **API Pencarian Konteks (RAG)**: Endpoint khusus yang berkomunikasi dengan Vectorize untuk mengambil data relevan.
    - **Cloudflare Vectorize**: Database vektor yang berfungsi sebagai "memori" atau "basis pengetahuan" untuk Asisten AI.
    - **Cloudflare D1**: Database SQL untuk menyimpan data pengguna.
- **Layanan Pendukung**:
    - **MailChannels**: Digunakan melalui Worker untuk mengirim email "Magic Link".
    - **Hosting**: Dirancang untuk di-deploy di platform seperti Cloudflare Pages.

## Arsitektur Asisten AI (RAG)

Sistem AI kami menggunakan pola **Retrieval-Augmented Generation (RAG)**:
1.  **Pertanyaan Pengguna**: Pengguna mengetik pertanyaan di jendela chat.
2.  **Pengambilan Konteks (Retrieval)**: Frontend mengirim pertanyaan ke Cloudflare Worker. Worker mengubah pertanyaan menjadi vektor dan mencarikan dokumen yang paling mirip dari **Cloudflare Vectorize**. Hasil pencarian (konteks) dikembalikan ke frontend.
3.  **Generasi Jawaban (Generation)**: Frontend menggabungkan pertanyaan asli pengguna dengan konteks yang diterima dari Worker. Prompt yang "diperkaya" ini kemudian dikirim ke **Google Gemini API**.
4.  **Jawaban Cerdas**: Gemini menghasilkan jawaban yang relevan dan kontekstual berdasarkan informasi yang diberikan, yang kemudian ditampilkan kepada pengguna.

## Struktur Proyek

```
.
├── components/          # Komponen React (Header, ChatWindow, dll.)
├── services/            # Logika interaksi dengan API (termasuk Gemini).
├── index.html           # Titik masuk HTML utama.
├── index.tsx            # Titik masuk utama aplikasi React.
├── App.tsx              # Komponen root aplikasi.
├── worker.js            # [Referensi] Kode backend Cloudflare Worker.
└── README.md            # Anda sedang membaca ini.
```

## Persiapan & Setup

### Frontend

1.  **API Key Gemini**: Aplikasi ini membutuhkan API Key dari Google AI Studio. Anda harus menyediakannya sebagai variabel lingkungan `process.env.API_KEY`.
2.  **URL Worker**: Pastikan URL di `services/geminiService.ts` dan `components/LoginModal.tsx` menunjuk ke URL Cloudflare Worker Anda.
3.  **Menjalankan**: Buka `index.html` di browser.

### Backend

Backend berjalan sepenuhnya di Cloudflare.

1.  **Kode**: Salin konten dari `worker.js` ke Worker Anda di Cloudflare.
2.  **Database & Vectorize**:
    - Buat database **Cloudflare D1** dan jalankan skema SQL untuk tabel `users`.
    - Buat **Vectorize Index** untuk menyimpan data pengetahuan sekolah. Gunakan `seeder-worker.js` sebagai referensi untuk mengisi indeks ini.
3.  **Binding**:
    - Bind database D1 ke Worker Anda dengan nama variabel `DB`.
    - Bind Vectorize Index Anda dengan nama variabel `VECTORIZE_INDEX`.
    - Bind layanan **AI** dari Cloudflare dengan nama variabel `AI` (ini digunakan untuk membuat *embeddings*, bukan untuk chat).
4.  **Deploy**: Deploy Worker Anda. API backend Anda sekarang sudah aktif.

## Kontribusi

Kami menyambut kontribusi! Silakan baca `CONTRIBUTING.md` untuk panduan lebih lanjut.