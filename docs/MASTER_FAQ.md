# 📚 Master FAQ - MA Malnu Kananga

> **Panduan Pertanyaan yang Sering Diajukan** untuk seluruh pengguna sistem informasi MA Malnu Kananga

---

## 📋 Daftar Isi

- [👨‍🎓 FAQ Siswa](#-faq-siswa)
- [👨‍🏫 FAQ Guru](#-faq-guru)
- [👨‍👩‍👧‍👦 FAQ Orang Tua](#-faq-orang-tua)
- [🔧 FAQ Administrator](#-faq-administrator)
- [👨‍💻 FAQ Technical/Developer](#-faq-technicaldeveloper)
- [🆘 Bantuan & Dukungan](#-bantuan--dukungan)

---

## 👨‍🎓 FAQ Siswa

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

## 👨‍🏫 FAQ Guru

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

## 👨‍👩‍👧‍👦 FAQ Orang Tua

### 🔐 Login & Access

**Q: Saya orang tua wali, bukan orang tua kandung. Bisa akses portal?**
A: Ya, dengan surat kuasa dari orang tua kandung dan approval sekolah.

**Q: Punya anak kembar, apakah perlu 2 akun?**
A: Tidak, satu akun bisa monitor semua anak yang terdaftar.

**Q: Magic link tidak masuk ke email?**
A: Check folder spam, pastikan email benar, tunggu 2-3 menit, request ulang.

### 📚 Academic Monitoring

**Q: Seberapa sering nilai diupdate?**
A: Guru update nilai setiap 2 minggu, ujian dalam 1 minggu.

**Q: Bisa lihat detail jawaban anak di ujian?**
A: Tidak, hanya nilai dan feedback guru yang ditampilkan.

**Q: Anak saya ranking turun, apa yang harus saya lakukan?**
A: Konsultasi dengan wali kelas dan guru mata pelajaran terkait.

### 💬 Communication

**Q: Berapa lama guru merespon pesan?**
A: Guru akan merespon dalam 24 jam pada hari kerja.

**Q: Bisa minta janji temu dengan guru?**
A: Ya, kirim pesan request meeting dengan preferensi waktu.

**Q: Bagaimana jika ada masalah dengan guru?**
A: Hubungi wali kelas atau bimbingan konseling terlebih dahulu.

### 📱 Technical Issues

**Q: Portal tidak bisa dibuka di HP saya?**
A: Gunakan Chrome/Samsung Internet untuk Android, Safari untuk iOS.

**Q: Notifikasi tidak masuk ke HP saya?**
A: Check pengaturan notifikasi di HP dan pastikan aplikasi terinstall.

**Q: Data anak tidak muncul setelah login?**
A: Hubungi administrasi sekolah untuk verifikasi data anak.

---

## 🔧 FAQ Administrator

### 💾 System Management

**Q: How do I backup the system?**
A: D1 databases are automatically backed up. For additional backups, use: `wrangler d1 export malnu-kananga-db`

**Q: How do I monitor system performance?**
A: Check the Cloudflare Dashboard, use the built-in health endpoint, and monitor error rates.

**Q: Can I customize the AI responses?**
A: Yes, update the system prompt in worker.js and add relevant documents to the knowledge base.

**Q: How do I add new user roles?**
A: Modify the authentication service and update the role-based access control in the API.

### 🔐 Security & Access

**Q: How do I reset user passwords?**
A: The system uses magic links, not passwords. Users can request new login links themselves.

**Q: How do I handle security breaches?**
A: Follow the security incident response plan in the security documentation.

**Q: Can I export user data?**
A: Yes, use the admin dashboard to export user data in CSV format.

---

## 👨‍💻 FAQ Technical/Developer

### 🛠️ Development

**Q: How do I add a new API endpoint?**
A: Add the route handler in worker.js and update the corresponding service in src/services/api/.

**Q: What's the best way to handle state management?**
A: Use React hooks for local state and TanStack Query for server state management.

**Q: How do I debug production issues?**
A: Use Cloudflare Workers analytics, check the tail logs, and monitor error reporting in Sentry.

**Q: Can I use other databases besides D1?**
A: The system is optimized for D1, but you can adapt the database layer for other SQL databases.

### 🚀 Deployment

**Q: How do I deploy to production?**
A: Use `npm run deploy` or follow the deployment guide in the documentation.

**Q: What environment variables are required?**
A: API_KEY for Google Gemini, database credentials, and Cloudflare Workers configuration.

---

## 🆘 Bantuan & Dukungan

### 📞 Support Channels

**For Users**:
- **Email**: support@ma-malnukananga.sch.id
- **Phone**: (0253) 1234567
- **WhatsApp**: +62 812-3456-7890
- **Office**: Jl. Desa Kananga Km. 0,5, Menes, Pandeglang

**For Developers**:
- **GitHub Issues**: https://github.com/sulhi/ma-malnu-kananga/issues
- **Documentation**: Available in repository docs/ folder
- **Developer Chat**: Discord/Slack channel

**For Administrators**:
- **Emergency Hotline**: 24/7 available
- **Admin Portal**: https://admin.ma-malnukananga.sch.id (planned)
- **Technical Support**: tech@ma-malnukananga.sch.id

### 📋 Reporting Issues

When reporting issues, please include:

1. **Description**: Clear description of the problem
2. **Steps to Reproduce**: What you did before the issue occurred
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: Browser, OS, device information
6. **Screenshots**: If applicable
7. **Error Messages**: Any error messages shown

### 🔍 Quick Search Tips

- **Login Issues**: Check "Login & Authentication" sections
- **Academic Questions**: Look under "Academic" or "Grading" sections
- **Technical Problems**: Check "Technical Issues" or "Developer" sections
- **Communication**: Look under "Communication" sections
- **System Management**: Check "Administrator" sections

---

## 📊 FAQ Statistics

- **Total FAQs**: 45 questions
- **Categories**: 5 main user types
- **Languages**: Bahasa Indonesia & English
- **Last Updated**: 2025-11-24
- **Maintenance**: Monthly review and updates

---

## 🔄 Maintenance Schedule

### 📅 Regular Updates
- **Monthly**: Review and add new FAQs based on user feedback
- **Quarterly**: Comprehensive FAQ audit and reorganization
- **Annually**: Complete FAQ structure review and optimization

### 📝 Feedback Collection
- User surveys and feedback forms
- Support ticket analysis
- Common search term tracking
- User testing sessions

---

**📚 Master FAQ - MA Malnu Kananga**

*Comprehensive FAQ documentation for all system users*

---

*Document Version: 1.0.0*  
*Created: 2025-11-24*  
*Maintained by: MA Malnu Kananga Technical Team*  
*Review Schedule: Monthly*