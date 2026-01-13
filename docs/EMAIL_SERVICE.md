# Email Service Documentation

**Status**: ⚠️ PLANNED (Architecture documented, not yet implemented)
**Last Updated**: 2026-01-13

> **Note**: Email service infrastructure is defined in this document with service files (`emailService.ts`, `emailTemplates.ts`, `emailQueueService.ts`), but full backend integration with email providers and production deployment is not yet complete. This document serves as an architectural plan and reference for future implementation.

## Overview

The Email Service provides a comprehensive email sending solution with template support, offline queue, and delivery tracking. It integrates with multiple email providers (SendGrid, Mailgun, Cloudflare Email) and includes Indonesian language templates for school communications.

## Features

- **Multiple Provider Support**: SendGrid, Mailgun, Cloudflare Email
- **Email Templates**: Pre-built templates for grades, attendance, reports, announcements, and system notifications
- **Offline Queue**: Automatic queuing when offline with retry logic
- **Delivery Tracking**: Track sent, delivered, bounced, opened, and clicked emails
- **Bulk Email**: Send emails to multiple recipients
- **Analytics**: View delivery rates, open rates, and click rates
- **PDF Attachments**: Attach PDF reports to emails
- **Indonesian Language**: All templates are in Indonesian by default

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
├─────────────────────────────────────────────────────────────┤
│  EmailService         │  EmailTemplatesService  │ EmailQueueService
│  - sendEmail()        │  - getTemplate()       │  - enqueue()
│  - sendTemplateEmail()│  - renderTemplate()    │  - dequeue()
│  - sendBulkEmail()    │  - createTemplate()     │  - processQueue()
│  - sendEmailWithAttachment()                     │  - getQueueStatus()
│  - getAnalytics()     │  - updateTemplate()    │  - markAsSent()
│  - processQueue()     │  - deleteTemplate()    │  - markAsFailed()
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Cloudflare Worker)                     │
├─────────────────────────────────────────────────────────────┤
│  /api/email/send                                            │
│  ├─ SendGrid Integration                                    │
│  ├─ Mailgun Integration                                     │
│  └─ Cloudflare Email Integration                            │
│                                                              │
│  Database Tables:                                            │
│  ├─ email_delivery_log (tracking)                           │
│  └─ [existing tables]                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Email Providers                             │
├─────────────────────────────────────────────────────────────┤
│  SendGrid API                                               │
│  Mailgun API                                                │
│  Cloudflare Email API                                       │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Choose Email Provider

Select one of the following email providers:

- **SendGrid** (Recommended)
  - Free tier: 100 emails/day
  - Good deliverability
  - Easy setup

- **Mailgun**
  - Free trial: 5,000 emails
  - Flexible API
  - Good documentation

- **Cloudflare Email**
  - Native Cloudflare integration
  - Reliable delivery
  - Simple configuration

### 2. Configure Wrangler Secrets

Run the following commands to set up email provider secrets:

#### For SendGrid:

```bash
# Set email provider
echo "sendgrid" | wrangler secret put EMAIL_PROVIDER

# Set SendGrid API key (get from https://app.sendgrid.com/settings/api_keys)
echo "SG.xxxxxxxxxxxx" | wrangler secret put SENDGRID_API_KEY

# Set from email and name (optional, defaults to noreply@ma-malnukananga.sch.id)
echo "noreply@ma-malnukananga.sch.id" | wrangler secret put FROM_EMAIL
echo "MA Malnu Kananga" | wrangler secret put FROM_NAME
```

#### For Mailgun:

```bash
# Set email provider
echo "mailgun" | wrangler secret put EMAIL_PROVIDER

# Set Mailgun API key (get from https://app.mailgun.com/settings/api_security)
echo "key-xxxxxxxxxxxx" | wrangler secret put MAILGUN_API_KEY

# Set Mailgun domain
echo "mg.yourdomain.com" | wrangler secret put MAILGUN_DOMAIN

# Set from email (optional)
echo "noreply@mg.yourdomain.com" | wrangler secret put FROM_EMAIL
```

#### For Cloudflare Email:

```bash
# Set email provider
echo "cloudflare-email" | wrangler secret put EMAIL_PROVIDER

# Set Cloudflare Email API key
echo "xxxxxxxxxxxx" | wrangler secret put CLOUDFLARE_EMAIL_API_KEY

# Set from email (optional)
echo "noreply@ma-malnukananga.sch.id" | wrangler secret put FROM_EMAIL
```

### 3. Deploy Backend

```bash
npm run deploy:backend
```

### 4. Verify Configuration

Test email sending by running:

```bash
# In your React component or browser console
import { emailService } from './services/emailService';

await emailService.sendEmail({
  to: { email: 'test@example.com' },
  subject: 'Test Email',
  html: '<p>This is a test email</p>'
});
```

## Usage Examples

### Sending Basic Email

```typescript
import { emailService } from './services/emailService';

const result = await emailService.sendEmail({
  to: { email: 'parent@example.com', name: 'Budi Santoso' },
  subject: 'Test Subject',
  html: '<p>This is a test email content</p>',
  text: 'This is a test email content'
});

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Failed to send:', result.error);
}
```

### Sending Template Email

```typescript
import { emailService } from './services/emailService';

const result = await emailService.sendTemplateEmail(
  'grade-update-notification',
  { email: 'parent@example.com', name: 'Budi Santoso' },
  {
    studentName: 'Ahmad Dahlan',
    studentId: '12345',
    subjectName: 'Matematika',
    grade: 85,
    semester: '1',
    academicYear: '2024-2025',
    className: 'X-A',
    teacherName: 'Bapak Guru',
    recipientName: 'Budi Santoso'
  }
);
```

### Sending Email with PDF Attachment

```typescript
import { emailService } from './services/emailService';
import { pdfExportService } from './services/pdfExportService';

// Generate PDF
pdfExportService.createGradesReport(gradesData, studentInfo);

// Get PDF blob (you'll need to handle PDF generation separately)
const pdfBlob = new Blob([...], { type: 'application/pdf' });
const arrayBuffer = await pdfBlob.arrayBuffer();

const result = await emailService.sendEmailWithAttachment(
  {
    to: { email: 'parent@example.com' },
    subject: 'Laporan Progress',
    html: '<p>Laporan progress terlampir</p>'
  },
  {
    filename: 'laporan-progress.pdf',
    contentType: 'application/pdf',
    content: arrayBuffer,
    size: arrayBuffer.byteLength
  }
);
```

### Sending Bulk Email

```typescript
import { emailService } from './services/emailService';

const recipients = [
  { email: 'parent1@example.com', name: 'Parent 1' },
  { email: 'parent2@example.com', name: 'Parent 2' },
  { email: 'parent3@example.com', name: 'Parent 3' }
];

const result = await emailService.sendBulkEmail(
  recipients,
  {
    subject: 'Pengumuman Penting',
    html: '<p>Ini adalah pengumuman penting untuk semua orang tua.</p>',
    text: 'Ini adalah pengumuman penting untuk semua orang tua.'
  }
);

console.log(`Sent: ${result.sent}, Failed: ${result.failed}`);
```

### Scheduling Email

```typescript
import { emailService } from './services/emailService';

const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

const result = await emailService.sendEmail(
  {
    to: { email: 'parent@example.com' },
    subject: 'Pengingat Acara',
    html: '<p>Ingatkan tentang acara besok</p>'
  },
  {
    scheduleAt: scheduledTime.toISOString()
  }
);
```

### Processing Offline Queue

```typescript
import { emailService } from './services/emailService';

// Process queued emails (call when network is available)
const { processed, failed } = await emailService.processQueue();

console.log(`Processed: ${processed}, Failed: ${failed}`);
```

### Getting Analytics

```typescript
import { emailService } from './services/emailService';

const analytics = emailService.getAnalytics();

console.log('Total Sent:', analytics?.totalSent);
console.log('Delivery Rate:', analytics?.deliveryRate, '%');
console.log('Open Rate:', analytics?.openRate, '%');
console.log('Click Rate:', analytics?.clickRate, '%');
```

### Getting Delivery History

```typescript
import { emailService } from './services/emailService';

const history = emailService.getDeliveryHistory(20);

history.forEach(item => {
  console.log(`${item.messageId}: ${item.status}`);
});
```

## Available Templates

### 1. Grade Update Notification
- **Template ID**: `grade-update-notification`
- **Category**: `grades`
- **Variables**: `studentName`, `studentId`, `subjectName`, `grade`, `semester`, `academicYear`, `className`, `teacherName`, `recipientName`, `schoolName`

### 2. Attendance Report
- **Template ID**: `attendance-report`
- **Category**: `attendance`
- **Variables**: `studentName`, `studentId`, `attendanceDate`, `attendanceStatus`, `teacherName`, `recipientName`, `schoolName`

### 3. Progress Report
- **Template ID**: `progress-report`
- **Category**: `reports`
- **Variables**: `studentName`, `studentId`, `className`, `reportPeriod`, `reportUrl`, `recipientName`, `schoolName`

### 4. Event Reminder
- **Template ID**: `event-reminder`
- **Category**: `announcements`
- **Variables**: `recipientName`, `eventTitle`, `eventDate`, `eventLocation`, `schoolName`

### 5. System Notification
- **Template ID**: `system-notification`
- **Category**: `system`
- **Variables**: `recipientName`, `subject`, `message`, `schoolName`

## Managing Templates

### Get All Templates

```typescript
import { emailTemplatesService } from './services/emailTemplates';

const templates = emailTemplatesService.getAllTemplates();
console.log(templates);
```

### Create Custom Template

```typescript
import { emailTemplatesService } from './services/emailTemplates';

const newTemplate = emailTemplatesService.createTemplate({
  name: 'Custom Notification',
  description: 'My custom notification template',
  category: 'system',
  subject: 'Custom: {{customVar}}',
  htmlContent: '<p>Hello {{recipientName}}, {{message}}</p>',
  textContent: 'Hello {{recipientName}}, {{message}}',
  variables: ['recipientName', 'customVar', 'message'],
  language: 'id',
  isActive: true
});
```

### Update Template

```typescript
import { emailTemplatesService } from './services/emailTemplates';

const template = emailTemplatesService.getTemplate('grade-update-notification');
if (template) {
  const updated = emailTemplatesService.updateTemplate(template.id, {
    htmlContent: '<p>Updated HTML content</p>'
  });
}
```

### Delete Template

```typescript
import { emailTemplatesService } from './services/emailTemplates';

const deleted = emailTemplatesService.deleteTemplate('template-id-to-delete');
console.log('Deleted:', deleted);
```

## Queue Management

### Get Queue Status

```typescript
import { emailService } from './services/emailService';

const status = emailService.getQueueStatus();

console.log('Pending:', status.pending);
console.log('Processing:', status.processing);
console.log('Failed:', status.failed);
console.log('Total:', status.total);
```

### Get Queue Items

```typescript
import { emailQueueService } from './services/emailQueueService';

const pendingItems = emailQueueService.getQueueItems('pending');
const failedItems = emailQueueService.getQueueItems('failed');
```

### Clear Queue

```typescript
import { emailQueueService } from './services/emailQueueService';

emailQueueService.clearQueue();
```

## Testing

Run email service tests:

```bash
npm test -- emailService.test.ts
```

## Troubleshooting

### Email Not Sending

1. Check if email provider is configured:
   ```bash
   wrangler secret list
   ```

2. Verify API keys are correct
3. Check worker logs:
   ```bash
   wrangler tail
   ```

### Emails Queued but Not Sent

1. Check if offline queue is enabled
2. Process queue manually:
   ```typescript
   await emailService.processQueue();
   ```

### Template Not Found

1. Check template ID is correct
2. Verify template exists:
   ```typescript
   const template = emailTemplatesService.getTemplate('template-id');
   console.log(template);
   ```

## Security Considerations

- API keys are stored as Cloudflare secrets (never in code)
- All emails require authentication via JWT
- Email addresses are validated before sending
- Rate limiting is applied by email providers

## Best Practices

1. **Use Templates**: Always use templates for consistent formatting
2. **Include Plain Text**: Always include text version for accessibility
3. **Test Before Bulk Send**: Test with a small list before bulk sending
4. **Monitor Analytics**: Regularly check delivery rates and open rates
5. **Handle Offline Gracefully**: The queue handles offline scenarios automatically
6. **Use Appropriate Priority**: Set priority levels based on urgency

## API Reference

See `src/services/emailService.ts` for complete API documentation.

## Related Services

- `pdfExportService.ts`: For generating PDF reports
- `pushNotificationService.ts`: For in-app notifications
- `apiService.ts`: For backend API communication

## Support

For issues or questions, please refer to:
- Issue #1088: Email Service Foundation
- Project documentation: `/docs/`
