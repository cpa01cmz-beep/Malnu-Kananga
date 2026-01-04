
# Website & Portal Pintar MA Malnu Kananga

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Cloudflare](https://img.shields.io/badge/Deployed%20on-Cloudflare-orange)

Aplikasi web modern untuk MA Malnu Kananga yang mengintegrasikan Landing Page, Portal Siswa/Guru, dan **Kecerdasan Buatan (AI)** dalam satu platform. Dibangun dengan React dan di-backend-kan oleh Cloudflare Workers (Serverless).

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/PENGGUNA/REPO_INI)

> **Catatan:** Tombol di atas akan men-deploy kode Worker. Namun, Anda **wajib** membuat database D1 dan Vectorize secara manual melalui CLI agar aplikasi berfungsi penuh (lihat panduan di bawah).

## 🚀 Fitur Utama

1.  **Generative AI Site Editor**: Admin dapat mengubah konten website (Berita/Program) hanya dengan mengetik perintah bahasa alami.
2.  **RAG Chatbot (Asisten AI)**: Bot cerdas yang menjawab pertanyaan pengunjung berdasarkan data nyata sekolah (Visi, Misi, PPDB) menggunakan *Vector Search*.
3.  **Multi-Role Dashboard**: Akses terpisah untuk Admin, Guru, Siswa, Staff, dan OSIS.
4.  **Full Free Tier**: Dioptimalkan untuk berjalan 100% pada layanan gratis Cloudflare.

---

## 🛠️ Panduan Deployment (Langkah demi Langkah)

Karena proyek ini menggunakan database (D1 & Vectorize), deployment dilakukan dalam dua tahap: Backend (Worker) dan Frontend (Pages).

### Prasyarat
*   Akun Cloudflare.
*   Node.js terinstall.
*   Wrangler CLI (`npm install -g wrangler`).

### Tahap 1: Setup Backend (Worker)

1.  **Login ke Cloudflare**:
    ```bash
    npx wrangler login
    ```

2.  **Buat Database D1 (SQL)**:
    ```bash
    npx wrangler d1 create malnu-db
    ```
    ⚠️ **PENTING**: Salin `database_id` yang muncul di terminal, lalu buka `wrangler.toml` dan tempelkan pada bagian `database_id`.

3.  **Buat Vectorize Index (Vector DB)**:
    ```bash
    npx wrangler vectorize create malnu-index --dimensions=768 --metric=cosine
    ```

4.  **Deploy Worker**:
    ```bash
    npx wrangler deploy
    ```
    *Catat URL Worker Anda (misal: `https://malnu-api.user.workers.dev`).*

5.  **Isi Data Awal (Seeding)**:
    Jalankan perintah ini untuk mengisi database AI dengan informasi sekolah:
    ```bash
    curl https://<URL-WORKER-ANDA>/seed
    ```

### Tahap 2: Setup Frontend (Pages)

1.  **Build Aplikasi**:
    Pastikan Anda memiliki file `.env` (atau set environment variable di dashboard Cloudflare Pages).
    ```bash
    npm install
    npm run build
    ```

2.  **Deploy ke Cloudflare Pages**:
    Anda bisa menghubungkan repositori GitHub ke Cloudflare Pages untuk deployment otomatis, atau upload folder `dist` secara manual.
    *   **Environment Variables (Wajib Diset di Dashboard Pages)**:
        *   `VITE_GEMINI_API_KEY`: API Key Google Gemini Anda (Dapatkan di [aistudio.google.com](https://aistudio.google.com/)).
        *   `API_KEY`: Alias untuk API Key (backward compatibility).
        *   `VITE_API_BASE_URL`: URL Worker yang Anda dapatkan dari Tahap 1.

---

## 💻 Setup Localhost (Pengembangan)

1.  **Clone Repositori**:
    ```bash
    git clone <repo-url>
    cd repo
    ```

2.  **Setup Environment**:
    
    **Otomatis (Direkomendasikan)**:
    ```bash
    npm run env:setup
    ```
    
    **Manual**:
    Salin template environment ke file .env:
    ```bash
    cp .env.example .env
    ```
    Edit file `.env` dan ganti nilai-nilai berikut:
    ```env
    # Wajib: API Key Google Gemini
    VITE_GEMINI_API_KEY=AIzaSy... # Dapatkan dari https://aistudio.google.com/
    # Legacy compatibility (untuk services/geminiService.ts)
    API_KEY=AIzaSy... # Sama dengan VITE_GEMINI_API_KEY
    
    # Opsional: Jika menjalankan worker lokal
    # VITE_WORKER_URL=http://localhost:8787
    ```

3.  **Jalankan Backend (Lokal)**:
    ```bash
    npx wrangler dev
    ```

4.  **Validasi Environment**:
    Pastikan konfigurasi benar:
    ```bash
    npm run env:validate
    ```

5.  **Jalankan Frontend (Lokal)**:
    Buka terminal baru:
    ```bash
    npm install
    npm run dev
    ```

---

## 📂 Struktur Proyek

*   `/src`: Kode Frontend (React UI).
*   `worker.js`: Kode Backend Serverless (API Gateway).
*   `wrangler.toml`: Konfigurasi resource Cloudflare.

## 📚 Dokumentasi Lanjutan

*   **[Panduan Pengguna (User Guide)](HOW_TO.md)**: Cara menggunakan fitur.
*   **[Arsitektur Sistem](ARCHITECTURE.md)**: Penjelasan teknis.
*   **[Roadmap](ROADMAP.md)**: Rencana masa depan.

---

**Dibuat dengan ❤️ untuk Pendidikan Indonesia.**
