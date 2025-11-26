# SECURITY OPERATIONS GUIDE
## MA Malnu Kananga Educational Platform
**Version:** 2.0.0  
**Last Updated:** November 24, 2025  
**Target Audience:** System Administrators, Security Team, DevOps Engineers

---

## 🎯 **OPERATIONS OVERVIEW**

Panduan ini menyediakan prosedur operasional standar untuk manajemen keamanan sistem MA Malnu Kananga, termasuk monitoring, incident response, dan maintenance harian.

---

## 📋 **DAILY OPERATIONS CHECKLIST**

### **🌅 Morning Security Check (08:00 UTC)**

#### **1. System Health Verification**
```bash
# Check system status
curl -f https://api.ma-malnukananga.sch.id/health

# Verify worker deployment
curl -f https://ma-malnukananga.sch.id/api/status

# Check database connectivity
curl -f https://api.ma-malnukananga.sch.id/db/health
```

#### **2. Security Log Review**
```bash
# Review security events from last 24 hours
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.ma-malnukananga.sch.id/admin/security/logs?since=yesterday

# Check for critical security events
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.ma-malnukananga.sch.id/admin/security/logs?severity=critical
```

#### **3. Vulnerability Assessment**
```bash
# Run dependency vulnerability scan
npm audit --audit-level=moderate

# Check for new security advisories
npm audit --json
```

#### **4. Performance Metrics**
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://ma-malnukananga.sch.id/

# Monitor error rates
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.ma-malnukananga.sch.id/admin/metrics/errors
```

### **🌆 Evening Security Review (18:00 UTC)**

#### **1. Daily Report Generation**
```bash
# Generate daily security report
node scripts/generate-security-report.js

# Create operations summary
node scripts/generate-operations-report.js
```

#### **2. Backup Verification**
```bash
# Verify database backups
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.ma-malnukananga.sch.id/admin/backup/verify

# Check backup integrity
node scripts/verify-backup-integrity.js
```

#### **3. Log Rotation**
```bash
# Rotate security logs
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  -X POST https://api.ma-malnukananga.sch.id/admin/logs/rotate

# Archive old logs
node scripts/archive-logs.js
```

---

## 🚨 **INCIDENT RESPONSE PROCEDURES**

### **Severity Classification**

#### **🔴 Critical - Immediate Response ( < 15 minutes)**
- System compromise confirmed
- Data breach detected
- Authentication bypass
- Complete service outage

**Response Steps:**
1. 🚨 **Immediate Action**
   ```bash
   # Enable emergency mode
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     -X POST https://api.ma-malnukananga.sch.id/admin/emergency/enable
   
   # Block suspicious IPs
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     -X POST https://api.ma-malnukananga.sch.id/admin/security/block-ip \
     -d '{"ip": "SUSPICIOUS_IP", "duration": 86400}'
   ```

2. 📢 **Notification**
   - Alert security team: security@ma-malnukananga.sch.id
   - Notify school administration
   - Document incident start time

3. 🔍 **Investigation**
   ```bash
   # Collect forensic data
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     https://api.ma-malnukananga.sch.id/admin/forensics/collect
   
   # Review access logs
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     https://api.ma-malnukananga.sch.id/admin/logs/access?since=incident
   ```

#### **🟠 High - Priority Response ( < 1 hour)**
- Suspicious activity detected
- Performance degradation
- Partial service outage
- Security control failure

**Response Steps:**
1. ⚡ **Assessment**
   ```bash
   # Check system status
   curl -f https://api.ma-malnukananga.sch.id/health
   
   # Review recent security events
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     https://api.ma-malnukananga.sch.id/admin/security/logs?since=1h
   ```

2. 🔧 **Mitigation**
   ```bash
   # Increase rate limiting
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     -X POST https://api.ma-malnukananga.sch.id/admin/security/rate-limit \
     -d '{"requests": 10, "window": 60}'
   
   # Enable enhanced monitoring
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     -X POST https://api.ma-malnukananga.sch.id/admin/monitoring/enhance
   ```

#### **🟡 Medium - Standard Response ( < 4 hours)**
- Non-critical security issues
- Performance concerns
- Configuration problems
- Documentation updates needed

#### **🔵 Low - Routine Response ( < 24 hours)**
- Minor security improvements
- Documentation updates
- Maintenance tasks
- User support issues

---

## 🔧 **MAINTENANCE PROCEDURES**

### **Weekly Maintenance (Every Friday 14:00 UTC)**

#### **1. Security Updates**
```bash
# Update dependencies
npm update

# Security audit
npm audit --fix

# Restart services if needed
npm run deploy
```

#### **2. Log Analysis**
```bash
# Analyze weekly security trends
node scripts/analyze-security-trends.js

# Generate weekly report
node scripts/generate-weekly-report.js
```

#### **3. Performance Optimization**
```bash
# Clear cache
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  -X POST https://api.ma-malnukananga.sch.id/admin/cache/clear

# Optimize database
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  -X POST https://api.ma-malnukananga.sch.id/admin/db/optimize
```

### **Monthly Maintenance (First Monday of Month)**

#### **1. Comprehensive Security Audit**
```bash
# Full vulnerability scan
npm audit --audit-level=low

# Penetration testing
node scripts/run-pentest.js

# Configuration review
node scripts/audit-config.js
```

#### **2. Documentation Updates**
```bash
# Update security documentation
node scripts/update-docs.js

# Review and archive old reports
node scripts/archive-reports.js
```

#### **3. System Hardening**
```bash
# Apply security patches
npm run security-patches

# Update security configurations
node scripts/harden-system.js

# Validate security controls
node scripts/validate-security.js
```

---

## 📊 **MONITORING DASHBOARD**

### **Key Security Metrics**

#### **Real-time Indicators**
- **Authentication Success Rate:** Target > 98%
- **API Response Time:** Target < 200ms
- **Error Rate:** Target < 0.1%
- **Security Events:** Monitor for spikes

#### **Daily Reports**
- **Security Score:** Current 8.5/10
- **Vulnerability Count:** Target 0
- **Incident Count:** Target 0
- **System Uptime:** Target > 99.9%

### **Alert Thresholds**

#### **Critical Alerts**
- Authentication failure rate > 5%
- API response time > 1000ms
- Error rate > 1%
- Security score drop > 2 points

#### **Warning Alerts**
- Authentication failure rate > 2%
- API response time > 500ms
- Error rate > 0.5%
- Unusual traffic patterns detected

---

## 🛠️ **TROUBLESHOOTING GUIDE**

### **Common Issues**

#### **Authentication Problems**
```bash
# Check authentication service
curl -X POST https://api.ma-malnukananga.sch.id/auth/test \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Verify token validation
curl -H "Authorization: Bearer TEST_TOKEN" \
  https://api.ma-malnukananga.sch.id/auth/verify
```

#### **Performance Issues**
```bash
# Check database performance
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.ma-malnukananga.sch.id/admin/db/performance

# Monitor memory usage
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.ma-malnukananga.sch.id/admin/system/memory
```

#### **Security Events**
```bash
# Review recent security logs
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.ma-malnukananga.sch.id/admin/security/logs?since=1h

# Check blocked IPs
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.ma-malnukananga.sch.id/admin/security/blocked-ips
```

---

## 📞 **ESCALATION CONTACTS**

### **Primary Contacts**
- **Security Team Lead:** security@ma-malnukananga.sch.id
- **System Administrator:** admin@ma-malnukananga.sch.id
- **DevOps Engineer:** devops@ma-malnukananga.sch.id

### **Emergency Contacts**
- **Critical Incident:** +62-XXX-XXXX-XXXX (24/7)
- **Data Breach:** +62-XXX-XXXX-XXXX (24/7)
- **Service Outage:** +62-XXX-XXXX-XXXX (Business Hours)

### **External Support**
- **Cloudflare Support:** Via Cloudflare Dashboard
- **Supabase Support:** Via Supabase Dashboard
- **Security Consultant:** security-consultant@external.com

---

## 📋 **COMPLIANCE CHECKLIST**

### **Daily Compliance**
- ✅ Security logs reviewed
- ✅ Access controls validated
- ✅ Data protection measures active
- ✅ Incident response capability verified

### **Weekly Compliance**
- ✅ Vulnerability assessment completed
- ✅ Security patches applied
- ✅ Documentation updated
- ✅ Team training conducted

### **Monthly Compliance**
- ✅ Full security audit completed
- ✅ Penetration testing performed
- ✅ Risk assessment updated
- ✅ Compliance report generated

---

**Operations Guide Maintained By:** Security Team  
**Last Review:** November 24, 2025  
**Next Review:** December 1, 2025  
**Document Version:** 2.0.0  

---

*This operations guide should be reviewed regularly and updated as needed to reflect changes in the security landscape and system architecture.*