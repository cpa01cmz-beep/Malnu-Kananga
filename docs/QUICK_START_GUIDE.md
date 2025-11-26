# 🚀 Quick Start Guide - MA Malnu Kananga

## 🎯 Overview

This guide focuses only on **currently working features** of the MA Malnu Kananga School Portal. Get up and running in minutes with the core functionality that's production-ready.

---

**Quick Start Guide Version: 1.3.1**  
**Last Updated: November 24, 2024**  
**Focus: Working Features Only**

## ⚡ What Works Right Now

### ✅ Fully Functional Features
- **🔐 Magic Link Authentication**: Secure login system
- **🤖 AI Chat Assistant**: Intelligent school information assistant
- **📱 PWA Features**: Install as mobile app
- **🌐 Responsive Design**: Works on all devices
- **🔒 Security**: CSRF protection, rate limiting, secure headers

### 📝 Demo Data Features
- **📊 Dashboard**: Student/teacher/parent interfaces with sample data
- **📅 Schedules**: Demo class schedules
- **📈 Analytics**: Sample performance metrics
- **👥 User Profiles**: Demo user information

---

## 🚀 5-Minute Setup

### Prerequisites
- **Node.js 18+** (required)
- **Google Gemini API Key** (required for AI chat)
- **Git** (for cloning repository)

### Step 1: Get API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key (starts with "AIza...")

### Step 2: Clone & Install
```bash
# Clone the repository
git clone https://github.com/sulhi/ma-malnu-kananga.git
cd ma-malnu-kananga

# Install dependencies
npm install
```

### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file (use any text editor)
nano .env
```

Add your API key:
```bash
# Required for AI functionality
API_KEY=AIzaSyC_your_actual_api_key_here

# Application settings
NODE_ENV=development
VITE_APP_ENV=development
```

### Step 4: Start Development Server
```bash
# Start the application
npm run dev -- --port 9000
```

Visit **http://localhost:9000** in your browser.

---

## 🔐 First Login

### Test Accounts
Use these email addresses for testing:

| Role | Email Address | Access |
|------|---------------|---------|
| Admin | admin@ma-malnukananga.sch.id | Full system access |
| Teacher | guru@ma-malnukananga.sch.id | Teacher dashboard |
| Student | siswa@ma-malnukananga.sch.id | Student portal |
| Parent | parent@ma-malnukananga.sch.id | Parent portal |

### Login Process
1. Enter any test email address
2. Click "Kirim Magic Link"
3. Check your email (including spam folder)
4. Click the login link (valid for 15 minutes)
5. You're logged in!

---

## 🤖 Using the AI Assistant

### What You Can Ask
The AI assistant knows about:
- **School Programs**: Tahfidz, Bahasa Arab, Sains
- **Admission Info**: PPDB process, requirements
- **School Facilities**: Labs, library, mosque
- **Contact Information**: Address, phone, email
- **Activities**: Extracurriculars, events

### Example Questions
```
"Apa saja program unggulan sekolah?"
"Kapan jadwal PPDB dibuka?"
"Berapa biaya pendaftaran?"
"Dimana lokasi sekolah?"
"Apa saja fasilitas yang tersedia?"
```

### Access AI Assistant
- Click the "Tanya AI" button (bottom right corner)
- Type your question in Indonesian
- Get instant responses with school information

---

## 📱 Mobile App Setup

### Install as Mobile App
**Android:**
1. Open website in Chrome browser
2. Tap menu (⋮) → "Install app"
3. Confirm installation

**iOS:**
1. Open website in Safari browser
2. Tap "Share" → "Add to Home Screen"
3. Confirm with "Add"

### Mobile Features
- **Offline Access**: View cached content without internet
- **Push Notifications**: Get updates (when supported)
- **Responsive Design**: Optimized for mobile screens
- **Touch-Friendly**: Easy navigation on phones

---

## 🛠️ Development Workflow

### Making Changes
```bash
# Start development server
npm run dev

# Run tests
npm run test

# Check code quality
npm run lint

# Build for production
npm run build
```

### File Structure (Important Files)
```
src/
├── App.tsx              # Main application
├── components/          # React components
│   ├── AIChat.tsx      # AI chat interface
│   ├── Auth.tsx        # Authentication
│   └── Dashboard.tsx   # Main dashboard
├── services/           # API services
│   └── authService.ts  # Authentication logic
└── types/              # TypeScript definitions

worker.js               # Backend API (Cloudflare Worker)
.env                   # Environment variables
```

### Common Tasks
- **Change AI behavior**: Edit `worker.js` documents array
- **Update styling**: Modify `src/index.css` or component styles
- **Add new pages**: Create components in `src/components/`
- **API changes**: Update `worker.js` endpoints

---

## 🚀 Production Deployment

### Option 1: One-Click Deploy (Easiest)
1. Visit [Cloudflare Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/sulhi/ma-malnu-kananga)
2. Connect your GitHub account
3. Add your Gemini API key
4. Click "Deploy"

### Option 2: Manual Deploy
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler auth login

# Deploy worker
wrangler deploy

# Seed AI knowledge base (run once)
curl https://your-worker.workers.dev/seed
```

### Required Production Secrets
```bash
# Set these secrets in Cloudflare Workers
wrangler secret put API_KEY
# Enter your Gemini API key

wrangler secret put SECRET_KEY
# Generate a secure 32+ character key
```

---

## 🔧 Troubleshooting Common Issues

### AI Chat Not Working
**Problem**: AI responses are empty or errors
**Solution**:
1. Check API key in `.env` file
2. Verify API key is valid (test at Google AI Studio)
3. Ensure worker is deployed and `/seed` endpoint was called

### Login Issues
**Problem**: Magic link not received
**Solution**:
1. Check spam/promotion email folders
2. Verify email address is one of the test accounts
3. Wait 2-3 minutes for email delivery

### Build Errors
**Problem**: `npm run build` fails
**Solution**:
1. Check Node.js version: `node --version` (should be 18+)
2. Clear cache: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npm run type-check`

### Performance Issues
**Problem**: Slow loading or responses
**Solution**:
1. Check internet connection
2. Try refreshing the page
3. Clear browser cache
4. Check browser console for errors

---

## 📊 Current Limitations

### What's Not Working Yet
- **Real Academic Data**: Currently using demo data
- **Grade Input**: Teachers cannot input real grades yet
- **Messaging**: Communication system is in development
- **File Uploads**: Document upload features coming soon
- **Notifications**: Real-time notifications in development

### Workarounds
- **Data Testing**: Use demo data to test features
- **Content Updates**: Edit `worker.js` documents array for AI knowledge
- **User Management**: Use predefined test accounts
- **File Sharing**: Use external links for now

---

## 🎯 Best Practices

### For Development
- **Use demo data** for testing new features
- **Test AI responses** with various questions
- **Check mobile responsiveness** regularly
- **Validate environment variables** before deployment

### For Production
- **Secure your API keys** - never commit them to git
- **Monitor AI usage** to avoid quota limits
- **Keep dependencies updated** regularly
- **Test authentication flow** after deployments

### For Users
- **Bookmark the portal** for easy access
- **Install as PWA** for better mobile experience
- **Use AI assistant** for quick information
- **Provide feedback** to help improve the system

---

## 📞 Getting Help

### Self-Service Resources
- **AI Assistant**: Ask the AI chat for help
- **Documentation**: Check the `docs/` folder
- **GitHub Issues**: Search existing issues first

### Support Channels
- **Documentation**: [Full documentation](./README.md)
- **Issues**: [Report bugs on GitHub](https://github.com/sulhi/ma-malnu-kananga/issues)
- **Community**: Join discussions in GitHub

### Quick Help Commands
```bash
# Check system status
npm run health

# Validate environment
npm run env:validate

# Run all tests
npm run test

# Build and check
npm run build && npm run preview
```

---

## ✅ Success Checklist

### Setup Complete When:
- [ ] Node.js 18+ installed
- [ ] Repository cloned and dependencies installed
- [ ] Environment configured with API key
- [ ] Development server running (`npm run dev`)
- [ ] Can login with test email
- [ ] AI assistant responds to questions
- [ ] Mobile app installation works
- [ ] All pages load without errors

### Production Ready When:
- [ ] Worker deployed to Cloudflare
- [ ] Vector database seeded (`/seed` endpoint called)
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] AI chat working in production
- [ ] Authentication flow tested
- [ ] Mobile PWA features working

---

## 🔄 What's Next?

### Coming Soon (In Development)
- **Real Academic Data Integration**
- **Teacher Grade Input System**
- **Parent-Teacher Messaging**
- **File Upload and Management**
- **Real-time Notifications**
- **Advanced Analytics**

### Future Roadmap
- **Mobile App (Native)**
- **Video Conferencing Integration**
- **Online Assessment Tools**
- **Learning Management System**
- **Advanced AI Features**

---

## 🎉 You're Ready!

**Congratulations!** You now have:
- ✅ Working MA Malnu Kananga portal
- ✅ AI chat assistant for school information
- ✅ Secure authentication system
- ✅ Mobile-friendly progressive web app
- ✅ Foundation for future features

Start exploring the portal, test the AI assistant, and provide feedback to help us improve the system!

---

## 📚 Additional Resources

### 🎓 Learn More
- [User Guide Student](./USER_GUIDE_STUDENT.md) - Complete student guide
- [User Guide Teacher](./USER_GUIDE_TEACHER.md) - Complete teacher guide
- [User Guide Parent](./USER_GUIDE_PARENT.md) - Complete parent guide

### 🔧 Development & Deployment
- [Installation Guide](./INSTALLATION_GUIDE.md) - Complete setup guide
- [API Documentation](./API_DOCUMENTATION.md) - Full API reference
- [AI Configuration Guide](./AI_CONFIGURATION_GUIDE.md) - AI system setup
- [Security Guide](./SECURITY_GUIDE.md) - Security implementation

### 🏗️ System Architecture
- [System Architecture](./SYSTEM_ARCHITECTURE.md) - System understanding
- [Developer Guide](./DEVELOPER_GUIDE.md) - Development guide

---

**Quick Start Guide Version: 1.3.1**  
*Last Updated: November 24, 2024*  
*Focus: Working Features Only*  
*Next Update: When new features are released*

---

<<<<<<< HEAD
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
*Last Updated: 2025-11-24*  
*Documentation Audit: Complete - Aligned with AGENTS.md*  
*Maintained by: MA Malnu Kananga Documentation Team*  
*Audit Status: ✅ Complete (2025-11-24) - Aligned with AGENTS.md*

*Guide Version: 1.4.0*  
*Last Updated: 2025-11-24*  
*Maintained by: MA Malnu Kananga Documentation Team*

