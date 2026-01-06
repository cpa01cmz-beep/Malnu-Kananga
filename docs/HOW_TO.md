
# Panduan Pengguna (User Guide)

Selamat datang di **Smart Portal MA Malnu Kananga**. Panduan ini akan membantu Anda menavigasi dan menggunakan fitur-fitur aplikasi berdasarkan peran (Role) Anda.

---

## 👥 1. Pengguna Umum (Publik)

Siapapun yang mengakses halaman utama website tanpa login.

### 🤖 Menggunakan Asisten AI
1.  Klik tombol **"Tanya AI"** di pojok kanan atas atau ikon **Chat** di pojok kanan bawah.
2.  Ketik pertanyaan Anda seputar sekolah (misal: *"Kapan pendaftaran dibuka?", "Apa saja program unggulannya?"*).
3.  AI akan menjawab berdasarkan data terbaru di website.

### 📝 Mendaftar Sekolah (PPDB)
1.  Gulir ke bagian **"Bergabunglah Bersama Kami"**.
2.  Klik tombol **"Daftar Sekarang"**.
3.  Isi formulir pendaftaran (Data diri, Orang tua, Asal sekolah).
4.  Klik **"Kirim Pendaftaran"**.
5.  Status Anda akan masuk ke *pending* menunggu verifikasi Admin.

---

## 🎓 2. Siswa

Akses: Login sebagai **Siswa**.

### 🔐 Cara Login
1.  Klik **Login**.
2.  Pilih **"Siswa"** pada menu simulasi (kotak kuning).
3.  Klik tombol **Login**.

### Fitur Utama
*   **Jadwal Pelajaran**: Melihat jadwal kelas mingguan (Senin-Jumat).
*   **Nilai Akademik (KHS)**: Melihat rekap nilai tugas, UTS, dan UAS. Data ini sinkron dengan apa yang diinput oleh Guru.
*   **E-Library**: Mengunduh materi pelajaran yang diupload oleh Guru.
*   **Kehadiran**: Melihat rekap absensi diri sendiri.

### ⭐ Peran Tambahan: Pengurus OSIS
Jika Anda login sebagai siswa dengan role OSIS (Budi Santoso):
1.  Menu **"Kegiatan OSIS"** akan muncul di dashboard.
2.  Anda dapat **Menambah Event Baru** (Nama kegiatan, Tanggal, Lokasi).
3.  Event yang dibuat akan tersimpan di sistem.

---

## 👨‍🏫 3. Guru

Akses: Login sebagai **Guru**.

### 🔐 Cara Login
1.  Klik **Login**.
2.  Pilih **"Guru"** pada menu simulasi.

### Fitur Utama
*   **Input Nilai**:
    1.  Masuk ke menu **Input Nilai**.
    2.  Klik **"Edit"** pada baris siswa.
    3.  Masukkan nilai Tugas, UTS, UAS.
    4.  Klik **"Simpan"**. Nilai Akhir dan Predikat (A/B/C) akan terhitung otomatis.
    *   *Catatan*: Perubahan ini akan langsung terlihat di akun Siswa yang bersangkutan.
*   **Wali Kelas**:
    1.  Melihat daftar siswa di kelas perwalian.
    2.  Mengubah status kehadiran siswa hari ini (Hadir/Sakit/Izin/Alpa).
*   **Upload Materi**:
    1.  Isi judul, mata pelajaran, dan tipe file.
    2.  Klik **"Upload Materi"**. Materi akan muncul di E-Library siswa.

### ⭐ Peran Tambahan: Staff (Sarpras/TU)
Jika Anda login sebagai guru dengan role Staff (Siti Aminah):
1.  Menu **"Inventaris"** akan muncul.
2.  Anda dapat mencatat aset sekolah baru (Barang, Jumlah, Kondisi).
3.  Anda dapat menghapus data aset yang rusak/hilang.

---

## 🛠️ 4. Administrator

Akses: Login sebagai **Admin**.

### 🔐 Cara Login
1.  Klik **Login**.
2.  Pilih **"Admin"**.

### Fitur Eksklusif
*   **✨ AI Site Editor**:
    1.  Klik tombol **"Editor AI"** di Header atau menu dashboard.
    2.  Ketik perintah dalam bahasa manusia, contoh: *"Ubah judul berita pertama menjadi 'Juara Umum Porseni 2025' dan ganti gambarnya"*.
    3.  AI akan memberikan pratinjau. Klik **"Terapkan Perubahan"** untuk menyimpan ke website publik.
*   **PPDB Online**:
    1.  Melihat daftar pendaftar baru (muncul badge notifikasi merah jika ada yang *pending*).
    2.  Melakukan aksi **Terima** atau **Tolak** pada pendaftar.
*   **Manajemen User**:
    1.  Menambah akun baru (Guru/Siswa/Admin).
    2.  Memberikan **Tugas Tambahan** (menjadikan Guru sebagai Staff, atau Siswa sebagai OSIS).
*   **Laporan & Log (Factory Reset)**:
    1.  Melihat statistik total data.
    2.  **Factory Reset**: Tombol merah untuk menghapus SELURUH data simulasi di browser dan mengembalikan aplikasi ke kondisi awal (bersih). Gunakan ini jika terjadi error data.

---

## 💡 Tips & Trik Troubleshooting

*   **Data tidak muncul?**
    Cobalah refresh halaman. Data tersimpan di Cloudflare D1 database dan disinkronisasi secara otomatis.
*   **Ingin kembali ke awal?**
    Masuk sebagai Admin -> Laporan & Log -> Klik **"Lakukan Factory Reset"**.
*   **Gambar rusak?**
    Sistem otomatis menggunakan gambar *fallback* jika URL gambar error.
