# 🚀 Quick Start Guide - MA Malnu Kananga

## 🌟 Overview

Panduan cepat untuk memulai dengan sistem portal MA Malnu Kananga. Guide ini dirancang untuk memberikan pengalaman setup tercepat dalam 5 menit.

## ⚡ 5-Minute Quick Start

### Prerequisites Checklist
- [ ] **Node.js 18+** terinstall
- [ ] **Google Gemini API Key** (dapatkan dari [AI Studio](https://makersuite.google.com/app/apikey))
- [ ] **Git** terinstall
- [ ] **Terminal/Command Prompt** siap digunakan

---

## 🚀 Langkah 1: Clone & Install (2 menit)

```bash
# Clone repository
git clone https://github.com/sulhi/ma-malnu-kananga.git
cd ma-malnu-kananga

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

---

## 🔧 Langkah 2: Konfigurasi API Key (1 menit)

Edit file `.env` dan tambahkan API key:

```bash
# Buka file .env
nano .env  # atau gunakan editor favorit

# Tambahkan API key Anda
API_KEY=AIzaSyC_xxxxxxxxxxxxxxxxxxxxxxxxxx
NODE_ENV=development
VITE_APP_ENV=development
```

**Mendapatkan API Key:**
1. Kunjungi [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login dengan Google Account
3. Click "Create API Key"
4. Copy dan paste ke file `.env`

---

## 🖥️ Langkah 3: Jalankan Development Server (1 menit)

```bash
# Start development server
npm run dev -- --port 9000

# Server akan berjalan di:
# http://localhost:9000
```

Buka browser dan kunjungi `http://localhost:9000`

---

## ✅ Langkah 4: Verifikasi Setup (1 menit)

### Checklist Verifikasi:
- [ ] Homepage loads dengan benar
- [ ] PWA installation prompt muncul
- [ ] AI chat interface accessible
- [ ] Responsive design di mobile (gunakan dev tools)

### Test AI Chat:
1. Click tombol "Chat AI" atau buka chat window
2. Ketik: "Apa saja program unggulan sekolah?"
3. AI harus merespons dalam Bahasa Indonesia

---

## 🌐 Production Deployment (Opsional)

### One-Click Deploy (Recommended)

1. **Visit Deploy URL:**
   ```
   https://deploy.workers.cloudflare.com/?url=https://github.com/sulhi/ma-malnu-kananga
   ```

2. **Configure:**
   - Login ke Cloudflare
   - Masukkan API key Gemini
   - Click "Deploy"

3. **Post-Deployment:**
   ```bash
   # Seed vector database (jalankan sekali saja)
   curl https://your-worker-url.workers.dev/seed
   ```

---

## 🎯 Common Use Cases

### 👨‍🎓 Untuk Siswa
1. **Login**: Request magic link dengan email sekolah
2. **Dashboard**: Lihat nilai, jadwal, dan pengumuman
3. **AI Assistant**: Tanya tentang tugas atau materi pelajaran

### 👨‍🏫 Untuk Guru
1. **Login**: Gunakan email guru terdaftar
2. **Input Nilai**: Akses menu input nilai kelas
3. **AI Support**: Bantuan untuk persiapan mengajar

### 👨‍👩‍👧‍👦 Untuk Orang Tua
1. **Login**: Gunakan email orang tua terdaftar
2. **Monitoring**: Pantau performa akademik anak
3. **Komunikasi**: Hubungi guru melalui messaging system

---

## 🔧 Troubleshooting Cepat

### ❌ API Key Error
**Problem**: "API_KEY tidak valid"
**Solution**: 
1. Check API key di `.env` file
2. Verify API key masih aktif di Google AI Studio

### ❌ AI Not Responding
**Problem**: Chat tidak merespons
**Solution**:
1. Check API key configuration
2. Test endpoint: `curl http://localhost:9000/api/chat`

### ❌ Login Issues
**Problem**: Magic link tidak diterima
**Solution**:
1. Check folder spam/promosi
2. Gunakan email yang terdaftar
3. Tunggu 2 menit sebelum request ulang

---

## 📚 Next Steps

### 🎓 Pelajari Lebih Lanjut
- [User Guide Siswa](./USER_GUIDE_STUDENT.md) - Panduan lengkap untuk siswa
- [User Guide Guru](./USER_GUIDE_TEACHER.md) - Panduan lengkap untuk guru
- [User Guide Orang Tua](./USER_GUIDE_PARENT.md) - Panduan lengkap untuk orang tua

### 🔧 Development & Deployment
- [Installation Guide](./INSTALLATION_GUIDE.md) - Setup lengkap development dan production
- [API Documentation](./API_DOCUMENTATION.md) - Referensi API lengkap
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md) - Solusi masalah teknis

### 🏗️ System Architecture
- [System Architecture](./SYSTEM_ARCHITECTURE.md) - Pemahaman arsitektur sistem
- [Developer Guide](./DEVELOPER_GUIDE.md) - Panduan pengembangan

---

## 🆘 Bantuan & Support

### 📞 Support Channels
- **Email**: support@ma-malnukananga.sch.id
- **GitHub Issues**: [Report issues](https://github.com/sulhi/ma-malnu-kananga/issues)
- **Documentation**: Available in repository docs/ folder

### 🎯 Quick Tips
1. **Save API Key**: Simpan API key di tempat aman
2. **Regular Updates**: Update dependencies secara berkala
3. **Backup**: Backup configuration dan data penting
4. **Monitor**: Monitor system health dan performance

---

## ✅ Quick Start Checklist

### Pre-Setup
- [ ] Node.js 18+ installed
- [ ] Google Gemini API key obtained
- [ ] Git configured

### Development Setup
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env`)
- [ ] Development server running (`npm run dev`)
- [ ] AI chat functionality tested

### Production Deployment (Optional)
- [ ] Cloudflare account ready
- [ ] Worker deployed via one-click deploy
- [ ] Vector database seeded
- [ ] Custom domain configured (optional)

---

## 🌟 Key Features Available

### ✅ Working Features
- **AI Chat System**: RAG-based AI assistant dengan 50+ dokumen konteks
- **Magic Link Authentication**: Login tanpa password yang aman
- **PWA Features**: Installable web app dengan offline support
- **Responsive Design**: Optimal di desktop dan mobile
- **Student Support AI**: Kategorisasi bantuan (academic, technical, administrative, personal)
- **Risk Assessment**: Proactive monitoring untuk student support

### 🚧 Coming Soon
- **Student Data APIs**: Retrieval nilai, jadwal, kehadiran
- **Teacher Dashboard**: Input nilai dan absensi
- **Parent Portal**: Monitoring anak real-time
- **Content Management**: Dynamic news dan announcements
- **Analytics Dashboard**: System monitoring dan reporting

---

**🚀 Quick Start Guide - MA Malnu Kananga**

*Get started in 5 minutes with the MA Malnu Kananga digital portal system*

---

*Guide Version: 1.3.1*  
*Last Updated: November 25, 2025*  
*Maintained by: MA Malnu Kananga Documentation Team*