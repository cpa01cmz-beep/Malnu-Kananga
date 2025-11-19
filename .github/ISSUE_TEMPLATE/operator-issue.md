---
name: Operator Issue Report
about: Issue dari perspektif Operator untuk masalah sistem operasional dan infrastruktur
title: '[OPERATOR] [TIPE] - Deskripsi Masalah'
labels: ['operations', 'operator-priority']
assignees: ''
---

## 🔧 Konteks Sistem

### Informasi Dasar
- **Sistem/Aplikasi:** <!-- contoh: LMS, Database, API Gateway -->
- **Environment:** <!-- contoh: Production, Staging, Development -->
- **User Terpengaruh:** <!-- contoh: 300 users, 50 staff -->
- **Waktu Kejadian:** <!-- contoh: 2024-11-19 09:00 UTC -->

### Detail Masalah Teknis
<!-- Jelaskan masalah dari perspektif operasional sistem -->

## 🎯 Jenis Masalah

<!-- Pilih salah satu atau berikan kategori lain -->
- [ ] System Outage - Sistem tidak dapat diakses
- [ ] Performance Degradation - Performa menurun
- [ ] Database Issue - Masalah database
- [ ] Network Connectivity - Masalah jaringan
- [ ] Security Alert - Notifikasi keamanan
- [ ] Maintenance Required - Perlu maintenance
- [ ] Resource Limitation - Batasan sumber daya
- [ ] Lainnya: <!-- spesifikkan -->

## 📊 Dampak Operasional

### Tingkat Keparahan
- [ ] 🟢 Rendah - Dampak minimal, workaround available
- [ ] 🟡 Sedang - Beberapa fungsi terganggu
- [ ] 🔴 Tinggi - Sistem tidak dapat digunakan

### Dampak pada:
- [ ] User Experience
- [ ] Business Operations
- [ ] Data Integrity
- [ ] System Performance
- [ ] Security Posture

## 🔍 Troubleshooting

### Symptoms Observed
<!-- Gejala yang teramati -->

### Root Cause Analysis
<!-- Analisis penyebab dasar -->

### Steps Taken
<!-- Langkah yang sudah dilakukan -->

```bash
# Commands yang sudah dijalankan
<!-- contoh: systemctl status nginx -->
```

### Logs/Errors
<!-- Log atau error messages -->

```
<!-- Paste relevant logs here -->
```

## 🛠️ Resolution Plan

### Immediate Actions (0-2 jam)
- [ ] Investigasi lebih lanjut
- [ ] Apply temporary fix
- [ ] Communicate ke users
- [ ] Escalate jika needed

### Short-term Resolution (2-24 jam)
- [ ] Implement permanent fix
- [ ] Test solution
- [ ] Deploy ke production
- [ ] Monitor post-deployment

### Long-term Prevention (1-2 minggu)
- [ ] Monitoring improvement
- [ ] Process optimization
- [ ] Documentation update
- [ ] Team training

## 📅 Timeline & SLA

### Response Time
- **Target:** <!-- contoh: 15 menit -->
- **Actual:** <!-- contoh: 10 menit -->

### Resolution Time
- **SLA Target:** <!-- contoh: 4 jam -->
- **Estimated:** <!-- contoh: 2 jam -->

### Communication Schedule
- [ ] Initial alert sent
- [ ] Status update every 30 menit
- [ ] Resolution notification
- [ ] Post-mortem report

## 👥 Impact & Communication

### User Groups Affected
- [ ] Students
- [ ] Teachers/Staff
- [ ] Parents
- [ ] Administrators
- [ ] External Users

### Communication Channels
- [ ] Email notification
- [ ] System status page
- [ ] In-app notification
- [ ] Social media
- [ ] Direct contact

### Message Template
<!-- Template pesan untuk users -->

## 🔧 Technical Details

### System Information
- **Server:** <!-- server name/ID -->
- **Version:** <!-- application version -->
- **Configuration:** <!-- relevant config -->
- **Dependencies:** <!-- affected dependencies -->

### Monitoring Metrics
```json
{
  "cpu_usage": "85%",
  "memory_usage": "70%",
  "disk_space": "45%",
  "network_latency": "150ms"
}
```

### Related Systems
- [ ] Database Server
- [ ] API Gateway
- [ ] CDN/Cloudflare
- [ ] Backup System
- [ ] Monitoring Tools

## 🔄 Recovery Procedures

### Rollback Plan
<!-- Prosedur rollback jika diperlukan -->

### Backup Status
- [ ] Last backup successful
- [ ] Backup available for restore
- [ ] RTO/RPO met

### Alternative Solutions
<!-- Solusi alternatif jika primary fix gagal -->

## 📋 Post-Incident

### Required Actions
- [ ] Root cause analysis complete
- [ ] Prevention measures implemented
- [ ] Documentation updated
- [ ] Team debrief conducted
- [ ] Monitoring enhanced

### Lessons Learned
<!-- Pembelajaran dari incident -->

---

**Dibuat oleh:** Operator Agent  
**Eskalasi ke:** Technical Team untuk resolution  
