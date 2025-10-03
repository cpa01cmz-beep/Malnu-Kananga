# 🚀 Panduan Deployment MA Malnu Kananga

## 📋 Prasyarat

Sebelum melakukan deployment, pastikan Anda memiliki:

1. **Akun Cloudflare** dengan akses ke Cloudflare Workers
2. **Cloudflare CLI (Wrangler)** terinstall
   ```bash
   npm install -g wrangler
   ```
3. **API Token** dari Cloudflare dengan permissions untuk Workers, D1, dan Vectorize

## 🔧 Konfigurasi Cloudflare Resources

### 1. Setup Vectorize Index

Buat Vectorize index untuk RAG functionality:

```bash
# Production index
npx wrangler vectorize create malnu-kananga-docs --namespace-id=your_namespace_id

# Preview index (untuk testing)
npx wrangler vectorize create malnu-kananga-docs-preview --namespace-id=your_preview_namespace_id
```

### 2. Setup D1 Database

Buat D1 database untuk authentication:

```bash
# Production database
npx wrangler d1 create malnu-kananga-auth

# Preview database
npx wrangler d1 create malnu-kananga-auth-preview
```

Jalankan migration untuk membuat tabel users:

```bash
# Production
npx wrangler d1 execute malnu-kananga-auth --file=./migration.sql

# Preview
npx wrangler d1 execute malnu-kananga-auth-preview --file=./migration.sql
```

## 🚀 Deployment Steps

### 1. Login ke Cloudflare

```bash
npx wrangler login
```

### 2. Set API Key

Set Google Gemini API key sebagai secret:

```bash
# Production
npx wrangler secret put API_KEY --env=production

# Preview
npx wrangler secret put API_KEY --env=preview
```

### 3. Deploy Worker

```bash
# Deploy to production
npx wrangler deploy --env=production

# Deploy to preview (untuk testing)
npx wrangler deploy --env=preview
```

### 4. Seed Vector Database

Setelah deployment berhasil, seed database dengan konten sekolah:

```bash
# Production
curl https://malnu-api.your-subdomain.workers.dev/seed

# Preview
curl https://malnu-api.your-preview-subdomain.workers.dev/seed
```

## ✅ Verifikasi Deployment

Test semua endpoints:

```bash
# Test RAG endpoint
curl -X POST https://malnu-api.your-subdomain.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Apa saja program unggulan sekolah?"}'

# Test seed endpoint (hanya sekali setelah deploy pertama)
curl https://malnu-api.your-subdomain.workers.dev/seed

# Test login endpoints
curl -X POST https://malnu-api.your-subdomain.workers.dev/request-login-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 🔧 Troubleshooting

### Error: "AI binding not found"
- Pastikan Vectorize index sudah dibuat dengan nama yang benar
- Check wrangler.toml configuration

### Error: "DB binding not found"
- Pastikan D1 database sudah dibuat
- Jalankan migration untuk membuat tabel users

### Error: "API_KEY not configured"
- Set API key menggunakan `wrangler secret put API_KEY`

### Error 500 saat seeding
- Pastikan Vectorize index dapat diakses
- Check Cloudflare dashboard untuk error logs

## 📊 Monitoring

Monitor worker performance di Cloudflare Dashboard:

1. **Metrics**: CPU time, memory usage, error rates
2. **Logs**: Real-time logs untuk debugging
3. **Analytics**: Request patterns dan performance

## 🔄 Update Deployment

Untuk update worker setelah perubahan kode:

```bash
# Update production
npx wrangler deploy --env=production

# Update preview
npx wrangler deploy --env=preview

# Rollback jika perlu
npx wrangler rollback --env=production
```

## 📞 Support

Jika mengalami masalah deployment:

1. Check Cloudflare Workers dashboard untuk error logs
2. Verifikasi semua bindings sudah dikonfigurasi dengan benar
3. Pastikan API key Google Gemini sudah diset sebagai secret
4. Check network connectivity dan firewall settings

---

*Dokumen deployment ini dibuat pada: 3 Oktober 2024*
*Status: Production Ready*