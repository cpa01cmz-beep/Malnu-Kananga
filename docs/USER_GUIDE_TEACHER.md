# 📖 User Guide - Teachers - MA Malnu Kananga

## 🎯 Selamat Datang, Guru!

Portal guru MA Malnu Kananga adalah platform digital untuk mengelola pembelajaran, input nilai, monitoring siswa, dan komunikasi dengan orang tua secara efisien.

---

**Teacher Guide Version: 1.3.2**  
**Last Updated: November 24, 2025**  
**Guide Status: Production Ready**  
**Documentation Audit: Completed - Feature implementation status updated**

## ⚠️ **PENTING: Status Implementasi Saat Ini**

### 🚨 **KRITIS: Harap Dibaca Sebelum Menggunakan**

Portal guru saat ini dalam **tahap pengembangan awal** dengan keterbatasan fungsionalitas sangat signifikan:

### 🎯 **Fitur yang Berfungsi Penuh (100%)**
- ✅ **Login System**: Magic link authentication berfungsi sempurna
- ✅ **AI Assistant**: Chatbot cerdas untuk informasi umum sekolah
- ✅ **Dashboard Interface**: Tampilan portal guru yang modern
- ✅ **PWA Features**: Install sebagai aplikasi mobile
- ✅ **Website Publik**: Akses informasi umum sekolah

### 📝 **Fitur dengan Data Demo (0% Real Data)**
**PERINGATAN:** Data mengajar berikut adalah **CONTOH/FIKTIF** dan tidak mencerminkan data aktual:
- 👥 **Daftar Kelas**: Kelas fiktif untuk demonstrasi UI
- 📚 **Mata Pelajaran**: Pelajaran contoh, bukan jadwal sebenarnya
- 👨‍🎓 **Data Siswa**: Siswa fiktif, bukan data siswa real
- 📊 **Statistik Mengajar**: Data acak untuk testing interface
- 📅 **Jadwal Mengajar**: Jadwal contoh, bukan jadwal resmi

### ❌ **Fitur Guru yang BELUM TERSEDIA SAMA SEKALI (0% Complete)**
- 📝 **Input Nilai Online**: Tidak ada sistem penilaian digital
- 📋 **Manajemen Absensi**: Tidak ada attendance tracking
- 💬 **Komunikasi Orang Tua**: Tidak ada messaging system
- 📎 **Distribusi Materi**: Tidak ada upload materi pembelajaran
- 📈 **Analytics Akademik**: Tidak ada performance tracking
- 📄 **Rapor Digital**: Tidak ada pembuatan rapor online
- 📚 **Bank Soal**: Tidak ada sistem manajemen soal
- 🗓️ **Kalender Akademik**: Tidak ada manajemen jadwal
- 📧 **Pengumuman Kelas**: Tidak ada sistem pengumuman

### 📅 **Timeline Realistis Pengembangan Guru**
- **Phase 1** (Q1 2025): Database siswa dan sistem nilai dasar
- **Phase 2** (Q2 2025): Attendance system dan komunikasi dasar
- **Phase 3** (Q3 2025): Advanced analytics dan manajemen materi
- **Phase 4** (Q4 2025): Full integration dengan sistem akademik

> **⚠️ PENTING:** 
> - Portal guru **BUKAN** sistem mengajar resmi saat ini
> - **TIDAK BISA** digunakan untuk input nilai atau absensi resmi
> - Gunakan hanya untuk eksplorasi interface dan feedback
> - Semua aktivitas mengajar resmi tetap melalui sistem sekolah yang ada
> - Input nilai dan absensi resmi melalui buku nilai dan administrasi sekolah

### 🎯 **Cara Menggunakan Portal Guru Saat Ini**
1. **Eksplorasi Interface**: Lihat tata letak dan navigasi portal
2. **Test AI Assistant**: Ajukan pertanyaan tentang sekolah
3. **Install PWA**: Install sebagai aplikasi di smartphone
4. **Feedback Development**: Berikan masukan untuk perbaikan
5. **Monitor Progress**: Pantau pengembangan fitur guru di update berikutnya

---

## 🚀 Memulai Portal Guru

### 1. Login ke Portal
1. Buka website MA Malnu Kananga di browser
2. Masukkan email guru yang terdaftar
3. Klik "Kirim Magic Link"
4. Periksa email dan klik link login
5. Anda akan masuk ke dashboard guru

### 2. Dashboard Guru Overview
Setelah login, Anda akan melihat:
- **Informasi Guru**: Nama, NIP, mata pelajaran yang diampu
- **Statistik Mengajar**: Total kelas, total siswa, jam mengajar (📝 *Data demo*)
- **Jadwal Hari Ini**: Kelas yang akan diajar hari ini (📝 *Data demo*)
- **Task List**: Tugas yang perlu diselesaikan
- **Quick Actions**: Aksi cepat untuk input nilai dan absensi

#### ⚠️ Status Fitur Saat Ini
- **✅ Aktif**: Login system, AI Assistant, dashboard interface
- **📝 Development**: Data kelas, jadwal, dan siswa menggunakan data demo
- **🚧 Coming Soon**: Real-time integration dengan sistem akademik sekolah

---

## 📚 Manajemen Pembelajaran

### 📋 Kelola Kelas & Siswa

#### Akses Daftar Kelas
1. Klik menu **"Kelas Saya"** di sidebar
2. Lihat semua kelas yang diampu:
   - **Nama Kelas**: XII IPA 1, XI IPS 2, dll
   - **Jumlah Siswa**: Total siswa per kelas
   - **Mata Pelajaran**: Mata pelajaran yang diajar
   - **Jadwal**: Hari dan jam mengajar

#### Detail Kelas
- **Daftar Siswa**: Nama, NISN, foto siswa
- **Statistik Kelas**: IPK rata-rata, kehadiran
- **Riwayat Nilai**: Nilai kelas periode sebelumnya
- **Export Data**: Download daftar siswa (Excel/PDF)

### 📊 Input Nilai Siswa

#### Proses Input Nilai
1. Pilih kelas dari menu **"Kelas Saya"**
2. Klik **"Input Nilai"** pada kelas yang dipilih

#### ⚠️ Status Fitur Input Nilai
- **Status**: 📝 *Demo mode untuk development*
- **Saat ini**: Sistem input nilai menggunakan data contoh
- **Rencana**: Integrasi dengan sistem nilai sekolah yang sebenarnya
- **Fitur yang akan datang**: Auto-calculation, grade validation, reporting
3. Pilih jenis penilaian:
   - **UTS**: Ujian Tengah Semester
   - **UAS**: Ujian Akhir Semester
   - **Tugas**: Tugas harian/proyek
   - **Praktik**: Nilai praktikum
   - **Kehadiran**: Nilai kehadiran
4. Input nilai per siswa (0-100)
5. Tambahkan catatan/feedback (opsional)
6. Klik **"Simpan Nilai"**

#### Fitur Input Nilai
- **Batch Input**: Input nilai untuk multiple siswa
- **Auto Save**: Otomatis menyimpan setiap 30 detik
- **Validation**: Validasi range nilai (0-100)
- **Template**: Download template Excel untuk input offline
- **History**: Lihat riwayat perubahan nilai

#### Review & Publish
1. Review semua nilai yang diinput
2. Check warning/error jika ada
3. Klik **"Publish Nilai"** untuk membuat visible ke siswa
4. Nilai akan tersedia untuk siswa dan orang tua

### 📈 Monitoring Kehadiran

#### Input Absensi Harian
1. Pilih kelas yang diajar
2. Klik **"Input Absensi"**
3. Pilih tanggal hari ini
4. Mark kehadiran per siswa:
   - **Hadir (✓)**: Siswa masuk kelas
   - **Sakit (S)**: Sakit dengan surat dokter
   - **Izin (I)**: Izin dari orang tua
   - **Alpa (A)**: Tanpa keterangan
5. Tambahkan catatan jika perlu
6. Klik **"Simpan Absensi"**

#### Laporan Kehadiran
- **Statistik Bulanan**: Persentase kehadiran per bulan
- **Trend Analysis**: Grafik kehadiran per siswa
- **Problem Students**: Identifikasi siswa bermasalah
- **Export**: Download laporan kehadiran

---

## 📝 Manajemen Materi & Tugas

### 📚 Upload Materi Pembelajaran

#### Tambah Materi Baru
1. Klik menu **"Materi"** di sidebar
2. Pilih kelas dan mata pelajaran
3. Klik **"Tambah Materi"**
4. Isi detail materi:
   - **Judul Materi**: Topik pembelajaran
   - **Deskripsi**: Ringkasan materi
   - **Kategori**: Materi/Video/Link/Ebook
   - **File**: Upload file (PDF, PPT, Video, dll)
   - **Link**: Link eksternal (YouTube, dll)
5. Set visibility (publik/terbatas)
6. Klik **"Publish Materi"**

#### Organisasi Materi
- **Folder**: Kelompokkan materi per bab/topik
- **Tagging**: Tag materi untuk pencarian mudah
- **Versioning**: Update materi tanpa menghapus yang lama
- **Analytics**: Monitor materi yang sering diakses

### 📋 Buat & Kelola Tugas

#### Buat Tugas Baru
1. Klik menu **"Tugas"** di sidebar
2. Pilih kelas penerima tugas
3. Klik **"Buat Tugas Baru"**
4. Isi detail tugas:
   - **Judul Tugas**: Nama tugas yang jelas
   - **Deskripsi**: Instruksi lengkap
   - **Tipe**: Essay/Multiple Choice/Praktik/Proyek
   - **Deadline**: Tanggal dan waktu pengumpulan
   - **Max Score**: Nilai maksimal
   - **File**: Lampiran soal/rubrik
5. Set pengingat otomatis (opsional)
6. Klik **"Publish Tugas"**

#### Review & Penilaian Tugas
1. Klik tugas dari daftar
2. Lihat submission siswa:
   - **Submitted**: Siswa yang sudah mengumpulkan
   - **Pending**: Belum mengumpulkan
   - **Late**: Terlambat mengumpulkan
3. Review submission per siswa
4. Berikan nilai dan feedback
5. Klik **"Simpan Nilai"**

---

## 💬 Komunikasi & Kolaborasi

### 📧 Messaging dengan Siswa & Orang Tua

#### Kirim Pesan
1. Klik menu **"Pesan"** di sidebar
2. Klik **"Pesan Baru"**
3. Pilih penerima:
   - **Individual**: Siswa/orang tua spesifik
   - **Group**: Seluruh kelas
   - **Multiple**: Pilih beberapa penerima
4. Isi subjek dan pesan
5. Attach file jika perlu
6. Klik **"Kirim"**

#### Template Pesan
- **Pengumuman**: Template untuk pengumuman kelas
- **Reminder**: Template reminder tugas/ujian
- **Congratulations**: Template untuk prestasi siswa
- **Concern**: Template untuk masalah akademik

### 📅 Kelola Jadwal & Agenda

#### Update Jadwal Mengajar
1. Klik menu **"Jadwal"** di sidebar
2. Lihat jadwal mingguan/bulanan
3. Request perubahan jadwal jika perlu:
   - **Pengganti**: Request guru pengganti
   - **Reschedule**: Pindah jadwal mengajar
   - **Extra Class**: Tambah jam tambahan
4. Tunggu approval dari administrator

#### Agenda Kelas
- **Kalender Akademik**: Integrasi dengan kalender sekolah
- **Event Planning**: Buat event kelas (field trip, dll)
- **Reminder**: Set reminder untuk event penting
- **Sync**: Sync dengan Google Calendar/Outlook

---

## 🤖 AI Assistant untuk Guru

### 🎯 Bantuan AI untuk Pengajaran

#### Fitur AI Assistant
1. Klik tombol **"AI Assistant"** di dashboard
2. Gunakan untuk:
   - **Generate Soal**: Buat soal otomatis per topik
   - **Lesson Plan**: Bantu buat rencana pembelajaran
   - **Grading Assistant**: Bantu penilaian essay
   - **Content Ideas**: Ide untuk materi pembelajaran
   - **Student Analysis**: Analisis performa siswa

#### Contoh Penggunaan AI
- "Buat 10 soal pilihan ganda tentang fotosintesis"
- "Bantu saya buat lesson plan untuk kelas XII IPA"
- "Analisis performa siswa kelas saya bulan ini"
- "Berikan ide untuk kegiatan praktikum kimia"

### 📊 Analytics & Reporting

#### Dashboard Analytics
- **Student Performance**: Grafik performa siswa
- **Engagement Metrics**: Partisipasi siswa per kelas
- **Assignment Completion**: Rate penyelesaian tugas
- **Attendance Patterns**: Pola kehadiran siswa

#### Generate Laporan
1. Klik menu **"Laporan"** di sidebar
2. Pilih jenis laporan:
   - **Laporan Nilai**: Rekapitulasi nilai per kelas
   - **Laporan Kehadiran**: Statistik kehadiran
   - **Laporan Prestasi**: Prestasi siswa
   - **Laporan Kelas**: Overview kelas lengkap
3. Pilih periode waktu
4. Pilih format output (PDF/Excel)
5. Klik **"Generate Laporan"**

---

## 🔧 Pengaturan & Preferensi

### ⚙️ Pengaturan Profil

#### Update Informasi Guru
1. Klik menu **"Profil"** di sidebar
2. Update informasi:
   - **Foto Profil**: Upload foto profesional
   - **Kontak**: Email, telepon, WhatsApp
   - **Pendidikan**: Riwayat pendidikan terakhir
   - **Sertifikasi**: Sertifikasi mengajar
   - **Bio**: Bio singkat untuk siswa/orang tua
3. Klik **"Update Profil"**

#### Pengaturan Notifikasi
- **Email**: Notifikasi via email
- **SMS**: Notifikasi via SMS
- **Push**: Notifikasi push di browser
- **Digest**: Ringkasan harian/mingguan

### 🎨 Personalisasi Portal

#### Theme & Layout
- **Theme**: Pilih tema (Light/Dark/Auto)
- **Language**: Bahasa Indonesia/English
- **Dashboard Layout**: Atur widget dashboard
- **Quick Access**: Shortcut ke fitur sering digunakan

---

## 📱 Mobile Access & PWA

### 📲 Akses Mobile
- **Responsive Design**: Portal optimal di mobile
- **PWA Support**: Install sebagai aplikasi mobile
- **Offline Features**: Akses jadwal dan materi offline
- **Push Notifications**: Notifikasi real-time

### 🌐 Sync Across Devices
- **Cloud Sync**: Data tersinkronisasi semua device
- **Real-time Updates**: Update langsung tanpa refresh
- **Cross-platform**: Windows, Mac, Android, iOS

---

## 🔐 Keamanan & Privasi

### 🛡️ Keamanan Data
- **Encryption**: Semua data terenkripsi
- **Access Control**: Akses berdasarkan role
- **Audit Trail**: Log semua aktivitas
- **Data Backup**: Backup otomatis harian

### 📋 Privasi Siswa
- **Confidentiality**: Data siswa rahasia
- **Limited Access**: Hanya data kelas yang diampu
- **Parental Access**: Orang tua akses data anaknya
- **Compliance**: Sesuai regulasi pendidikan

---

## 📞 Support & Bantuan

### 🆘 Technical Support
- **Help Desk**: (0253) 1234567 ext. 201
- **Email**: guru@ma-malnukananga.sch.id
- **WhatsApp**: +62 812-3456-7891
- **Live Chat**: Available di portal (Senin-Jumat, 08:00-16:00)

### 📚 Training Resources
- **Video Tutorial**: Panduan visual step-by-step
- **User Manual**: Dokumentasi lengkap
- **Best Practices**: Tips penggunaan portal
- **FAQ**: Pertanyaan yang sering diajukan

### 🔄 Update & Maintenance
- **System Updates**: Informasi update terbaru
- **Maintenance Schedule**: Jadwal maintenance sistem
- **New Features**: Info fitur baru
- **Bug Fixes**: Info perbaikan bug

---

## 📊 Frequently Asked Questions

### 🔐 Login & Access
**Q: Magic link tidak masuk ke email?**
A: Check folder spam, pastikan email terdaftar, request ulang setelah 2 menit.

**Q: Bisa login di multiple devices?**
A: Ya, maksimal 3 devices aktif simultaneously.

**Q: Lupa email terdaftar?**
A: Hubungi administrator sekolah untuk reset email.

### 📚 Academic Management
**Q: Batas waktu input nilai?**
A: Nilai harus diinput 1 minggu setelah ujian/tugas deadline.

**Q: Bisa edit nilai setelah publish?**
A: Ya, dalam 3 hari setelah publish dengan alasan valid.

**Q: Cara input nilai untuk siswa pindahan?**
A: Tambah manual nilai dari sekolah sebelumnya dengan approval admin.

### 📊 Grading & Assessment
**Q: Standar penilaian sekolah?**
A: Mengikuti kurikulum nasional dengan KKM minimal 70.

**Q: Bisa custom rubrik penilaian?**
A: Ya, buat rubrik custom di menu Pengaturan Penilaian.

**Q: Cara handle cheating?**
A: Report ke administrator dengan bukti, akan diproses sesuai aturan.

### 💬 Communication
**Q: Batas kirim pesan per hari?**
A: Tidak ada batas, tapi hindari spam berlebihan.

**Q: Bisa kirim attachment di pesan?**
A: Ya, maksimal 10MB per file, support PDF, DOC, IMG.

**Q: Cara kirim broadcast ke semua kelas?**
A: Gunakan fitur Broadcast dengan approval administrator.

---

## 🎯 Best Practices for Teachers

### 📚 Teaching Excellence
- **Consistent Updates**: Update nilai dan materi secara berkala
- **Clear Communication**: Berikan instruksi yang jelas
- **Timely Feedback**: Respon pesan siswa dalam 24 jam
- **Data-Driven**: Gunakan analytics untuk improvement

### 💻 Technical Tips
- **Regular Login**: Login minimal sekali sehari
- **Backup Data**: Download laporan berkala
- **Browser Update**: Gunakan browser terbaru
- **Secure Connection**: Gunakan WiFi aman untuk login

### 👥 Student Engagement
- **Personal Touch**: Gunakan nama siswa dalam komunikasi
- **Positive Reinforcement**: Berikan apresiasi untuk prestasi
- **Early Intervention**: Identifikasi siswa bermasalah sejak dini
- **Parent Collaboration**: Libatkan orang tua dalam pendidikan

---

## 📋 Quick Start Checklist

### ✅ First Week Setup
- [ ] Login dan verifikasi akun
- [ ] Update profil dan foto
- [ ] Review jadwal mengajar
- [ ] Import daftar siswa per kelas
- [ ] Setup notifikasi preferences
- [ ] Test AI assistant features

### ✅ Daily Routine
- [ ] Check dashboard untuk update
- [ ] Input absensi harian
- [ ] Review pesan masuk
- [ ] Update materi jika perlu
- [ ] Monitor tugas pending

### ✅ Weekly Tasks
- [ ] Input nilai tugas/ujian
- [ ] Generate laporan progress
- [ ] Review analytics kelas
- [ ] Planning minggu depan
- [ ] Communication dengan orang tua

---

**📖 Portal Guru MA Malnu Kananga**

*Platform digital untuk pengelolaan pembelajaran modern*

---

*Dokumen ini dibuat pada: November 20, 2024*  
*Versi: 1.2.0*  
*Update Terakhir: November 23, 2025*  
*System Version: Production Ready v1.2.0*  
*AI Features: Advanced Teaching Assistant with Content Generation*