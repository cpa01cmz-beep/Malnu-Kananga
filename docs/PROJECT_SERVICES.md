
# Dokumentasi Layanan Proyek: Website MA Malnu Kananga

Dokumen ini berfungsi sebagai arsip terpusat untuk semua layanan eksternal, API, dan platform yang digunakan dalam pengembangan dan operasional website serta Asisten AI MA Malnu Kananga.

---

## 1. Kontrol Versi & Kode Sumber

### GitHub
- **Alamat Repositori**: `[URL Repositori GitHub Anda]`
- **Tujuan Penggunaan**:
    - Sebagai host utama untuk semua kode sumber (frontend dan referensi backend).
    - Manajemen versi menggunakan Git.
    - Pelacakan isu (bugs) dan perencanaan fitur.
    - Kolaborasi pengembangan.

---

## 2. Backend & Infrastruktur (Cloudflare)

Platform Cloudflare digunakan secara ekstensif untuk backend serverless, database, dan hosting.

### Cloudflare Worker
- **Nama Worker**: `malnu-api`
- **Alamat Endpoint**: `https://malnu-api.[nama-anda].workers.dev`
- **Tujuan Penggunaan**:
    - **Endpoint `/request-login-link`**: Menangani logika autentikasi "Magic Link". Menerima email, memvalidasi ke D1, dan mengirim email login melalui MailChannels.
    - **Endpoint `/verify-login`**: Memverifikasi token dari magic link dan membuat sesi cookie.
    - **Endpoint `/api/chat`**: Berfungsi sebagai **pencari konteks (retriever)** untuk sistem RAG. Menerima pertanyaan, membuat embedding, dan mengambil data relevan dari Vectorize.

### Cloudflare D1
- **Nama Database**: `[Nama Database D1 Anda, misal: 'malnu-users']`
- **Tujuan Penggunaan**:
    - Database SQL serverless untuk menyimpan data pengguna.
    - Saat ini digunakan untuk menyimpan tabel `users` (ID dan email) untuk validasi proses login.
    - Diikat (bound) ke Worker dengan nama variabel `DB`.

### Cloudflare Vectorize
- **Nama Indeks**: `[Nama Indeks Vectorize Anda, misal: 'malnu-knowledge-base']`
- **Tujuan Penggunaan**:
    - Database vektor yang berfungsi sebagai "memori" atau basis pengetahuan untuk Asisten AI.
    - Menyimpan *vector embeddings* dari konten website (profil, PPDB, dll.).
    - Diikat (bound) ke Worker dengan nama variabel `VECTORIZE_INDEX`.

### Cloudflare AI
- **Model yang Digunakan**: `@cf/baai/bge-base-en-v1.5`
- **Tujuan Penggunaan**:
    - Digunakan di dalam Worker untuk mengubah teks (pertanyaan pengguna dan dokumen) menjadi *vector embeddings*.
    - **PENTING**: Layanan ini BUKAN untuk menghasilkan chat, tapi untuk proses pencarian di Vectorize.
    - Diikat (bound) ke Worker dengan nama variabel `AI`.

### Cloudflare Pages
- **Alamat Website**: `[URL Website Live Anda, misal: https://malnu.pages.dev]`
- **Tujuan Penggunaan**:
    - Platform hosting untuk aplikasi frontend React.
    - Terintegrasi dengan baik dengan repositori GitHub untuk CI/CD (Continuous Integration/Continuous Deployment).

---

## 3. Kecerdasan Buatan (Generative AI)

### Google Gemini
- **Model yang Digunakan**: `gemini-2.5-flash`
- **Alamat Layanan**: [Google AI Studio](https://aistudio.google.com/)
- **Tujuan Penggunaan**:
    - Sebagai Model Bahasa Besar (LLM) utama yang menghasilkan jawaban chat.
    - Dipanggil langsung dari sisi **frontend** menggunakan library `@google/genai`.
    - Menerima prompt yang sudah diperkaya dengan konteks dari Cloudflare Worker untuk memberikan jawaban yang akurat.
    - Membutuhkan `API_KEY` yang di-set sebagai environment variable di hosting frontend.

---

## 4. Layanan Pendukung

### AISTudio CDN
- **Alamat Layanan**: `https://aistudiocdn.com/`
- **Tujuan Penggunaan**:
    - Content Delivery Network (CDN) yang menyediakan library JavaScript pihak ketiga.
    - Dalam proyek ini, digunakan untuk memuat `react`, `react-dom`, dan `@google/genai` melalui `importmap` di `index.html`.

### MailChannels
- **Alamat Layanan**: `https://www.mailchannels.com/`
- **Tujuan Penggunaan**:
    - Layanan pengiriman email yang terintegrasi dengan Cloudflare Workers.
    - Digunakan untuk mengirim email "Magic Link" kepada pengguna saat proses login, tanpa perlu setup server SMTP.
