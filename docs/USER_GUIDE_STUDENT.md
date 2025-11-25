# 📖 User Guide - Students - MA Malnu Kananga

## 🎯 Selamat Datang, Siswa!

Portal siswa MA Malnu Kananga adalah platform digital untuk mengakses informasi akademik, berkomunikasi dengan guru, dan mengelola aktivitas sekolah secara online.


**📋 Versi Dokumen**: v1.3.2  
**🔄 Terakhir Diperbarui**: 2025-11-24  
**⚡ Status Portal**: Production Ready (Fitur Terbatas)  

**📋 Versi Dokumen**: v1.3.1  
**🔄 Terakhir Diperbarui**: 2025-11-24  
**⚡ Status Portal**: Production Ready  

**🌐 URL Production**: https://ma-malnukananga.sch.id  
**🔧 Development**: http://localhost:9000

---


**Student Guide Version: 1.3.2**  
**Last Updated: 2025-11-24**  
**Guide Status: Production Ready (Limited Features)**  
**Documentation Audit: Completed - All procedures verified**

**Student Guide Version: 1.3.1**  
**Last Updated: 2025-11-24
**Guide Status: Production Ready**


## ⚠️ DEMO MODE - Limited Functionality

Portal siswa saat ini dalam **MODE DEMO** dengan keterbatasan fungsionalitas:

### ✅ **Fitur yang Berfungsi Penuh (9 endpoints)**
- ✅ **Login System**: Magic link authentication berfungsi sempurna
- ✅ **AI Assistant**: Chatbot cerdas dengan RAG vector search
- ✅ **Student Support AI**: Bantuan AI terintegrasi risk assessment
- ✅ **Support Monitoring**: Pemantauan proaktif siswa
- ✅ **PWA Features**: Install sebagai aplikasi mobile
- ✅ **Responsive Design**: Optimal di semua perangkat
- ✅ **Health Check**: Monitoring status sistem real-time
- ✅ **Security Features**: Rate limiting, CSRF protection, IP blocking
- ✅ **Signature API**: Verifikasi data integritas

### 📝 **Fitur dengan Data Demo (0% Real Data)**
**⚠️ PERINGATAN DEMO:** Data akademik berikut adalah **CONTOH/FIKTIF** dan tidak mencerminkan data aktual:
- 📊 **Nilai & IPK**: Data simulasi untuk demonstrasi UI saja
- 📅 **Jadwal Pelajaran**: Jadwal contoh, bukan jadwal sebenarnya
- 📋 **Daftar Tugas**: Tugas fiktif untuk preview fitur
- 📈 **Statistik Kehadiran**: Data acak untuk testing interface
- 👥 **Daftar Guru**: Data contoh, bukan data guru sebenarnya

### 🚧 **Sedang Dikembangan**
- 🔗 **Integrasi Database Siswa**: Target 1-2 bulan
- 📱 **Notifikasi Real-time**: Target 2-3 bulan
- 💬 **Messaging Guru**: Target 3-4 bulan
- 📎 **Pengumpulan Tugas Digital**: Target 4-5 bulan

### 📋 **Status Implementasi API**
- **Total API Endpoints**: 25 documented
- **Implemented Endpoints**: 9 working endpoints
- **Gap**: 64% of documented APIs are not implemented
- **Status**: Demo mode with simulated data

### 📅 **Timeline Realistis Pengembangan**
- **Phase 1** (Q1 2025): Integrasi database siswa dan sistem nilai
- **Phase 2** (Q2 2025): Sistem pengumpulan tugas digital
- **Phase 3** (Q3 2025): Notifikasi real-time dan messaging guru
- **Phase 4** (Q4 2025): Rapor digital dan e-library

> **⚠️ PENTING**: Hanya fitur dengan tanda ✅ yang berfungsi dengan data real. Fitur dengan tanda 📋 menggunakan data demo statis dan belum terhubung ke database.

---

## 🚀 Memulai Portal Siswa

### 1. Login ke Portal
1. Buka website MA Malnu Kananga di browser (http://localhost:9000 untuk development, https://ma-malnukananga.sch.id untuk production)
2. Masukkan email siswa yang terdaftar
3. Klik "Kirim Magic Link"
4. Periksa email (termasuk folder spam) dan klik link login
5. Link berlaku selama 15 menit
6. Anda akan masuk ke dashboard siswa

#### ⚠️ Troubleshooting Login
- **Email tidak diterima**: Periksa folder spam/promosi
- **Link kadaluarsa**: Request magic link baru
- **Login gagal**: Pastikan email terdaftar di sistem
- **Akses diblokir**: Tunggu 30 menit jika terlalu banyak percobaan

### 2. Dashboard Siswa Overview
Setelah login, Anda akan melihat:
- **Informasi Pribadi**: Nama, kelas, NISN, email
- **Statistik Akademik**: IPK, kehadiran, ranking kelas (📝 *Data demo untuk development*)
- **Jadwal Hari Ini**: Mata pelajaran dan jam pelajaran (📝 *Data demo untuk development*)
- **Pengumuman Terbaru**: Informasi penting sekolah dengan prioritas
- **AI Assistant**: Tanya jawab tentang sekolah dengan RAG technology ✅ *Aktif*
- **Quick Actions**: Akses cepat ke fitur penting
- **Recent Activities**: Aktivitas terakhir di portal

#### ⚠️ Status Fitur Saat Ini (Update November 2024)
- **✅ Aktif**: Login system (Magic Link), AI Assistant (RAG), PWA features
- **📝 Demo Mode**: Data akademik (nilai, jadwal, kehadiran) menggunakan data contoh statis
- **🚧 Dalam Pengembangan**: Real-time integration dengan sistem akademik sekolah
- **📋 Rencana Q1 2025**: Student data APIs implementation untuk live data

#### 📌 Penting: Mode Demo Saat Ini
**Data akademik yang ditampilkan adalah data contoh untuk tujuan demonstrasi:**
- Nilai dan IPK bersifat simulasi
- Jadwal pelajaran adalah contoh format
- Data kehadiran bersifat dummy
- Informasi ekskul dan prestasi adalah contoh

**Data real-time akan tersedia setelah implementasi API integration di Q1 2025**

#### 🆕 Fitur Baru Dashboard
- **Real-time Updates**: Data diperbarui secara otomatis
- **Mobile Responsive**: Optimal di smartphone dan tablet
- **Dark Mode**: Mode gelap untuk kenyamanan mata
- **PWA Support**: Install sebagai aplikasi mobile

---

## 📚 Manajemen Akademik

### 📋 Melihat Jadwal Pelajaran

#### Akses Jadwal
1. Klik menu **"Jadwal"** di sidebar
2. Pilih periode (hari ini/minggu ini/bulan ini)
3. Lihat detail jadwal:

#### ⚠️ Catatan Penting
- **Status**: 📝 *Data demo untuk development*
- **Saat ini**: Jadwal menggunakan data contoh, belum terintegrasi dengan sistem sekolah
- **Rencana**: Integrasi real-time dengan jadwal aktual sekolah
   - **Mata Pelajaran**: Nama mata pelajaran
   - **Guru Pengajar**: Nama guru
   - **Ruang**: Lokasi kelas
   - **Waktu**: Jam pelajaran
   - **Status**: Selesai/Berlangsung/Akan Datang

#### Fitur Jadwal
- **Filter**: Filter per hari atau per guru
- **Export**: Download jadwal dalam format PDF
- **Reminder**: Set reminder untuk pelajaran penting

### 📊 Melihat Nilai Akademik

#### Akses Nilai
1. Klik menu **"Nilai"** di sidebar
2. Pilih semester dan tahun ajaran
3. Lihat detail nilai:
   - **Nilai UTS**: Ujian Tengah Semester
   - **Nilai UAS**: Ujian Akhir Semester
   - **Nilai Tugas**: Tugas harian dan proyek
   - **Kehadiran**: Persentase kehadiran
   - **Nilai Akhir**: Rata-rata akhir

#### Analisis Nilai
- **Grafik Perkembangan**: Lihat tren nilai per mata pelajaran
- **Peringkat Kelas**: Posisi ranking di kelas
- **Kategori Nilai**: A (85-100), B (70-84), C (55-69), D (<55)
- **Catatan Guru**: Feedback dari guru mata pelajaran

### 📈 Monitoring Kehadiran

#### Cek Kehadiran
1. Klik menu **"Kehadiran"** di sidebar
2. Pilih periode waktu
3. Lihat statistik:
   - **Hadir**: Jumlah hari masuk
   - **Sakit**: Jumlah hari sakit dengan surat
   - **Izin**: Jumlah hari izin
   - **Tanpa Keterangan**: Jumlah hari alpa
   - **Persentase**: Total persentase kehadiran

#### Detail Kehadiran
- **Kalender Kehadiran**: Visualisasi kehadiran per hari
- **Riwayat**: Detail kehadiran per mata pelajaran
- **Export**: Download laporan kehadiran

---

## 💬 Komunikasi & AI Assistant

### 🤖 AI Assistant

#### Menggunakan AI Assistant
1. Klik tombol **"Tanya AI"** di pojok kanan bawah
2. Ketik pertanyaan tentang:
   - Informasi sekolah
   - Program unggulan
   - Kegiatan ekstrakurikuler
   - Jadwal penting
   - Bantuan akademik

#### Contoh Pertanyaan
- "Apa saja program unggulan sekolah?"
- "Kapan jadwal ujian semester?"
- "Bagaimana cara mendaftar ekstrakurikuler?"
- "Siapa guru matematika kelas saya?"

#### Tips Menggunakan AI
- Gunakan bahasa Indonesia yang jelas
- Berikan konteks yang spesifik
- AI akan merespons dalam bahasa Indonesia
- Response time kurang dari 5 detik

### 📧 Messaging dengan Guru

#### Kirim Pesan ke Guru
1. Klik menu **"Pesan"** di sidebar
2. Klik **"Pesan Baru"**
3. Pilih guru penerima
4. Isi subjek dan pesan
5. Klik **"Kirim"**

#### Inbox Pesan
- **Pesan Masuk**: Pesan dari guru dan admin
- **Pesan Terkirim**: Riwayat pesan yang dikirim
- **Draft**: Pesan yang belum dikirim
- **Notifikasi**: Alert untuk pesan baru

#### ⚠️ Status Fitur Messaging
- **Status**: 🚧 *Dalam pengembangan*
- **Saat ini**: Fitur messaging belum terintegrasi dengan sistem sekolah
- **Alternatif**: Kontak guru langsung atau melalui admin sekolah
- **Rencana**: Integrasi real-time messaging system

---

## 📱 Portal Mobile & PWA

### 📲 Install Aplikasi Mobile

#### Android
1. Buka website di Chrome browser
2. Tap menu (⋮) di pojok kanan atas
3. Pilih **"Install app"** atau **"Tambahkan ke layar utama"**
4. Konfirmasi instalasi
5. Aplikasi akan muncul di layar utama

#### iOS
1. Buka website di Safari browser
2. Tap **"Bagikan"** (ikon kotak dengan panah)
3. Scroll ke bawah dan tap **"Tambahkan ke Layar Utama"**
4. Konfirmasi dengan **"Tambahkan"**
5. Aplikasi akan muncul di layar utama

### 🌐 Fitur Offline
- **Jadwal**: Akses jadwal tanpa internet
- **Profil**: Lihat informasi pribadi offline
- **Notifikasi**: Terima notifikasi push
- **Cache**: Data tersimpan lokal untuk akses cepat

---

## 🔐 Keamanan & Privasi

### 🛡️ Keamanan Akun

#### Best Practices
- Gunakan email pribadi yang aman
- Jangan bagikan magic link ke orang lain
- Logout setelah menggunakan portal di perangkat publik
- Update informasi pribadi jika berubah

#### Privasi Data
- Data akademik hanya dapat diakses oleh siswa bersangkutan
- Orang tua dapat mengakses data anak dengan izin
- Guru hanya dapat mengakses data kelas yang diampu
- Semua data dienkripsi dan dilindungi

### 📱 Keamanan Mobile
- Set password/PIN pada perangkat
- Enable auto-lock pada aplikasi
- Update aplikasi secara berkala
- Gunakan jaringan WiFi yang aman

---

## 📞 Bantuan & Support

### 🆘 Dapatkan Bantuan

#### Self-Service Help
- **FAQ**: Pertanyaan yang sering diajukan
- **AI Assistant**: Tanya langsung ke AI assistant
- **Video Tutorial**: Panduan visual step-by-step
- **User Manual**: Dokumentasi lengkap

#### Contact Support
- **Email**: siswa@ma-malnukananga.sch.id
- **WhatsApp**: +62 812-3456-7890
- **Telepon**: (0253) 1234567 ext. 101
- **Kantor**: Ruang Bimbingan Konseling

#### Jam Operasional
- **Senin - Jumat**: 07:00 - 16:00 WIB
- **Sabtu**: 07:00 - 12:00 WIB
- **Minggu & Libur**: Tutup

### 📋 Melaporkan Masalah

#### Cara Melapor
1. Screenshoot masalah yang terjadi
2. Catat langkah-langkah yang menyebabkan masalah
3. Kirim laporan via email atau WhatsApp
4. Sertakan informasi:
   - Nama lengkap
   - Kelas
   - Browser yang digunakan
   - Waktu kejadian

#### Prioritas Masalah
- **Critical**: Tidak bisa login, data hilang
- **High**: Fitur tidak berfungsi, error sistem
- **Medium**: Tampilan error, loading lama
- **Low**: Saran fitur, improvement

---

## 🎯 Tips & Best Practices

### 📚 Tips Akademik
- Cek portal setiap hari untuk update terbaru
- Download materi pelajaran sebelum kelas
- Gunakan AI assistant untuk bantuan belajar
- Monitor nilai dan kehadiran secara berkala

### 💻 Tips Teknis
- Gunakan browser terbaru untuk performa optimal
- Clear cache browser jika portal lambat
- Install aplikasi mobile untuk akses mudah
- Enable notifikasi untuk update penting

### 📈 Tips Pengembangan Diri
- Ikuti ekstrakurikuler yang diminati
- Manfaatkan program unggulan sekolah
- Konsultasi dengan guru bimbingan
- Aktif dalam kegiatan sekolah

---

## 📊 Frequently Asked Questions

### 🔐 Login & Authentication
**Q: Lupa password?**
A: Sistem menggunakan magic link, tidak ada password. Cukup masukkan email dan request link baru.

**Q: Magic link tidak masuk ke email?**
A: Check folder spam, pastikan email benar, tunggu 2-3 menit, request ulang jika perlu.

**Q: Bisa login di multiple devices?**
A: Ya, tapi hanya satu session aktif per device.

### 📚 Akademik
**Q: Kapan nilai diupdate?**
A: Guru mengupdate nilai setiap 2 minggu. Nilai UTS/UAS dalam 1 minggu setelah ujian.

**Q: Bagaimana cara melihat ranking?**
A: Ranking dapat dilihat di menu Nilai → Peringkat Kelas.

**Q: Bisa download rapor digital?**
A: Ya, rapor digital dapat diunduh di menu Nilai → Download Rapor.

### 🤖 AI Assistant
**Q: Apa saja yang bisa ditanyakan ke AI?**
A: Informasi sekolah, bantuan belajar, jadwal, program, dll.

**Q: AI assistant tersedia 24/7?**
A: Ya, AI assistant tersedia kapan saja.

**Q: Apakah AI assistant menyimpan percakapan?**
A: Ya, untuk keperluan improvement layanan dan personalisasi.

---

## 🌟 Panduan Quick Start

### Hari Pertama Menggunakan Portal
1. **Login**: Masuk dengan email sekolah
2. **Explore**: Jelajahi semua menu dan fitur
3. **Update Profile**: Perbarui foto dan informasi pribadi
4. **Check Schedule**: Lihat jadwal hari ini
5. **Try AI**: Test AI assistant dengan pertanyaan sederhana
6. **Bookmark**: Simpan portal di browser favorit

### Rutinitas Harian
- **Pagi**: Cek jadwal dan pengumuman
- **Siang**: Monitor kehadiran dan tugas
- **Sore**: Review materi dan nilai
- **Malam**: Persiapkan untuk besok

---

**📖 Portal Siswa MA Malnu Kananga**

*Platform digital untuk kemudahan belajar dan berinteraksi*

---


*Dokumen ini dibuat pada: 2025-11-24
*Versi: 1.2.2*  
*Update Terakhir: 2025-11-25
*System Version: Production Ready v1.3.1*  

*AI Features: RAG System with Google Gemini Integration*