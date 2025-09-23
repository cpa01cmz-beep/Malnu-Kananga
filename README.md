# Website & Portal Siswa MA Malnu Kananga

Selamat datang di repositori resmi untuk website Madrasah Aliyah Malnu Kananga. Proyek ini dibangun dengan pendekatan modern, mobile-first, dan terintegrasi dengan teknologi serverless untuk performa, keamanan, dan skalabilitas yang optimal.

## Ringkasan Fitur

- **Website Publik**: Halaman informasi sekolah yang modern, responsif, dan cepat.
- **Asisten AI**: Chatbot interaktif untuk menjawab pertanyaan umum (saat ini simulasi, lihat `TO-DO.md`).
- **Sistem Login Passwordless**: Autentikasi aman menggunakan "Magic Link" tanpa perlu kata sandi.
- **Portal Siswa**: Area pribadi untuk siswa mengakses informasi akademik (dasar sudah ada, pengembangan lebih lanjut direncanakan).

## Tumpukan Teknologi (Tech Stack)

Proyek ini menggunakan arsitektur JAMStack yang modern:

- **Frontend**:
    - **React**: Library utama untuk membangun antarmuka pengguna.
    - **TypeScript**: Untuk pengetikan statis yang kuat dan kode yang lebih mudah dipelihara.
    - **Tailwind CSS**: Framework CSS utility-first untuk desain yang cepat dan responsif.
- **Backend (Serverless)**:
    - **Cloudflare Workers**: Untuk logika backend, termasuk API autentikasi dan AI. File referensi: `worker.js`.
    - **Cloudflare D1**: Database SQL untuk menyimpan data pengguna dan informasi lainnya.
    - **Cloudflare Vectorize**: Database vektor untuk "memori" Asisten AI (direncanakan).
- **Layanan Pendukung**:
    - **MailChannels**: Digunakan melalui Worker untuk mengirim email "Magic Link" secara gratis.
    - **Hosting**: Dirancang untuk di-deploy di platform seperti Cloudflare Pages atau GitHub Pages.

## Struktur Proyek

```
.
├── components/          # Komponen React yang dapat digunakan kembali (Header, Footer, Modal, dll.)
│   ├── icons/           # Komponen ikon SVG.
│   └── ...
├── services/            # Logika untuk berinteraksi dengan layanan eksternal (mis. AI).
├── index.html           # Titik masuk HTML utama aplikasi.
├── index.tsx            # Titik masuk utama untuk aplikasi React.
├── App.tsx              # Komponen root yang mengatur layout dan state utama.
├── worker.js            # [Referensi] Kode backend untuk Cloudflare Worker.
├── seeder-worker.js     # [Referensi] Kode untuk mengisi memori AI (Vectorize).
├── TO-DO.md             # Rencana detail untuk implementasi fitur AI.
├── README.md            # Anda sedang membaca ini.
└── ...
```

## Persiapan & Setup

### Frontend

Aplikasi ini dirancang sebagai modul ES6 sederhana yang diimpor langsung oleh `index.html`.

1.  **URL Worker**: Pastikan untuk memperbarui URL API di `components/LoginModal.tsx` dan `services/geminiService.ts` agar menunjuk ke URL Cloudflare Worker Anda yang sudah di-deploy.
    ```typescript
    // Contoh di dalam components/LoginModal.tsx
    const response = await fetch('https://malnu-api.sulhi-cmz.workers.dev/request-login-link', { ... });
    ```
2.  **Menjalankan**: Cukup buka file `index.html` di browser yang mendukung modul ES.

### Backend

Backend berjalan sepenuhnya di Cloudflare.

1.  **Kode**: Salin seluruh konten dari `worker.js` ke dalam editor kode Worker Anda di dashboard Cloudflare.
2.  **Database**: Buat database Cloudflare D1 dan jalankan skema SQL di bawah ini:
    ```sql
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```
3.  **Binding**: Hubungkan (bind) database D1 ke Worker Anda dengan **Variable Name** `DB`.
4.  **Deploy**: Deploy Worker Anda. Backend API Anda sekarang sudah aktif.

## Roadmap & Saran Pengembangan

Dokumen ini berfungsi sebagai panduan untuk pengembangan di masa depan.

### Fitur Baru yang Disarankan
-   **Portal Siswa/Guru yang Lengkap**:
    -   **Siswa**: Halaman untuk melihat nilai, absensi, jadwal pelajaran, dan mengunduh materi.
    -   **Guru**: Fitur untuk menginput nilai, mengelola absensi, dan mengunggah materi pelajaran.
-   **Content Management System (CMS)**: Integrasi dengan Git-based CMS (seperti Decap CMS) agar staf non-teknis dapat memperbarui konten "Berita & Kegiatan" tanpa menyentuh kode.
-   **Kalender Acara Interaktif**: Halaman khusus yang menampilkan kalender acara sekolah, ujian, dan hari libur.
-   **Portal Orang Tua**: Akun terpisah bagi wali murid untuk memantau perkembangan akademik anak mereka.

### Penyempurnaan & Optimalisasi Teknis
-   **Manajemen State**: Untuk aplikasi yang lebih kompleks, pertimbangkan menggunakan library state management seperti **Zustand** atau **Redux Toolkit** untuk mengelola state global (seperti status login) secara lebih efisien.
-   **Code Splitting / Lazy Loading**: Saat Portal Siswa/Guru berkembang, gunakan `React.lazy()` untuk memuat komponen halaman secara dinamis. Ini akan menjaga ukuran bundle awal tetap kecil dan waktu muat halaman utama tetap cepat.
-   **Optimalisasi Gambar**: Gunakan layanan seperti Cloudflare Images atau implementasikan atribut `srcset` pada tag `<img>` untuk menyajikan gambar dengan ukuran yang optimal sesuai perangkat pengguna.
-   **Aksesibilitas (a11y)**: Lakukan audit aksesibilitas penuh untuk memastikan semua elemen interaktif dapat diakses melalui keyboard, memiliki atribut ARIA yang sesuai, dan memenuhi standar WCAG 2.1 AA.
-   **Testing End-to-End**: Implementasikan framework testing seperti **Playwright** atau **Cypress** untuk mengotomatiskan pengujian alur kerja krusial (misalnya, proses login, interaksi chatbot).
-   **Progressive Web App (PWA)**: Ubah aplikasi menjadi PWA dengan menambahkan Service Worker dan Web App Manifest. Ini akan memungkinkan fungsionalitas offline dan pengalaman pengguna yang lebih baik di perangkat mobile.

## Kontribusi

Kami menyambut kontribusi! Silakan baca `CONTRIBUTING.md` untuk panduan lebih lanjut.