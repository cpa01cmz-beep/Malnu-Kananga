
# Roadmap Pengembangan (Development Roadmap)

Dokumen ini menguraikan rencana pengembangan jangka panjang untuk **Smart Portal MA Malnu Kananga**.

---

## ✅ Fase 1: MVP & Simulasi (Selesai - Current State)
Fokus: Membangun antarmuka pengguna (UI) lengkap dan logika bisnis menggunakan penyimpanan lokal browser.

- [x] **Frontend Modern**: React + Vite + Tailwind CSS.
- [x] **Multi-Role System**: Dashboard terpisah untuk Admin, Guru, Siswa.
- [x] **Simulasi Backend**: Penggunaan `useLocalStorage` untuk mensimulasikan database (CRUD User, Nilai, Inventaris, dll).
- [x] **Fitur AI**:
    - [x] Chatbot RAG (Retrieval Augmented Generation) dasar.
    - [x] AI Site Editor untuk mengubah konten JSON via natural language.
- [x] **Modul Akademik**: Jadwal, Nilai, Absensi, E-Library.
- [x] **Modul Administrasi**: PPDB Online, Manajemen User, Inventaris (Staff), Event (OSIS).

---

## 🚀 Fase 2: Integrasi Backend Nyata (Next Steps)
Fokus: Memindahkan penyimpanan data dari `localStorage` ke Database Serverless sesungguhnya (Cloudflare D1).

- [ ] **Migrasi Database**:
    - [ ] Buat skema tabel D1 (`users`, `students`, `teachers`, `grades`, `attendance`, `inventory`).
    - [ ] Buat API Endpoints di Cloudflare Workers untuk operasi CRUD.
- [ ] **Autentikasi Aman**:
    - [ ] Ganti simulasi login dengan JWT (JSON Web Token) yang valid.
    - [ ] Implementasi Session Cookies yang aman (HttpOnly).
- [ ] **File Storage**:
    - [ ] Integrasi Cloudflare R2 untuk penyimpanan file nyata (Upload materi guru, dokumen PPDB).

---

## 🤖 Fase 3: Advanced AI & Automation
Fokus: Meningkatkan kecerdasan sistem dengan fitur AI yang lebih canggih.

- [ ] **Analisis Nilai AI**:
    - [ ] Fitur bagi Guru/Wali Kelas untuk meminta saran AI tentang performa siswa berdasarkan tren nilai.
- [ ] **Vocal Interaction**:
    - [ ] Menambahkan dukungan *Voice-to-Text* dan *Text-to-Speech* pada Chatbot agar lebih aksesibel.
- [ ] **Automasi PPDB**:
    - [ ] OCR (Optical Character Recognition) untuk membaca nilai dari scan ijazah pendaftar secara otomatis.

---

## 📱 Fase 4: Mobile Experience & Expansion
Fokus: Meningkatkan aksesibilitas melalui perangkat seluler.

- [ ] **PWA (Progressive Web App)**:
    - [ ] Menambahkan Service Workers untuk dukungan offline penuh.
    - [ ] Fitur "Add to Home Screen" yang lebih optimal.
- [ ] **Push Notifications**:
    - [ ] Notifikasi real-time untuk pengumuman sekolah, nilai baru, atau status PPDB.
- [ ] **Parent Portal**:
    - [ ] Dashboard khusus Wali Murid untuk memantau anak secara spesifik.
