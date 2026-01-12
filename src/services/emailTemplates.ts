import type { EmailTemplate, EmailTemplateContext } from '../types/email.types';
import { logger } from '../utils/logger';

class EmailTemplatesService {
  private templates: Map<string, EmailTemplate> = new Map();
  private storageKey = 'malnu_email_templates';

  constructor() {
    this.loadTemplates();
    this.initializeDefaultTemplates();
  }

  private loadTemplates(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const templates: EmailTemplate[] = JSON.parse(stored);
        templates.forEach(template => {
          this.templates.set(template.id, template);
        });
        logger.info(`Loaded ${templates.length} email templates from storage`);
      }
    } catch (error) {
      logger.error('Failed to load email templates:', error);
    }
  }

  private saveTemplates(): void {
    try {
      const templatesArray = Array.from(this.templates.values());
      localStorage.setItem(this.storageKey, JSON.stringify(templatesArray));
    } catch (error) {
      logger.error('Failed to save email templates:', error);
    }
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'grade-update-notification',
        name: 'Notifikasi Update Nilai',
        description: 'Template untuk notifikasi ketika nilai siswa diperbarui',
        category: 'grades',
        subject: 'Update Nilai: {{subjectName}} - {{studentName}}',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Update Nilai</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .grade { background: #dbeafe; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .footer { background: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Update Nilai</h1>
    </div>
    <div class="content">
      <p>Yth. {{recipientName}},</p>
      <p>Kami ingin memberitahu bahwa nilai baru telah ditambahkan untuk siswa:</p>
      <p><strong>{{studentName}}</strong> ({{studentId}})</p>
      
      <div class="grade">
        <p><strong>Mata Pelajaran:</strong> {{subjectName}}</p>
        <p><strong>Nilai:</strong> {{grade}}</p>
        <p><strong>Semester:</strong> {{semester}}</p>
        <p><strong>Tahun Ajaran:</strong> {{academicYear}}</p>
        <p><strong>Kelas:</strong> {{className}}</p>
      </div>
      
      <p>Login ke sistem untuk melihat detail lebih lanjut.</p>
      
      <p>Terima kasih,</p>
      <p><strong>{{teacherName}}</strong></p>
    </div>
    <div class="footer">
      <p>{{schoolName}}</p>
      <p>Email ini dikirim secara otomatis, jangan balas ke email ini.</p>
    </div>
  </div>
</body>
</html>
        `,
        textContent: `Yth. {{recipientName}},

Kami ingin memberitahu bahwa nilai baru telah ditambahkan untuk siswa:

Nama: {{studentName}} ({{studentId}})
Mata Pelajaran: {{subjectName}}
Nilai: {{grade}}
Semester: {{semester}}
Tahun Ajaran: {{academicYear}}
Kelas: {{className}}

Login ke sistem untuk melihat detail lebih lanjut.

Terima kasih,
{{teacherName}}

{{schoolName}}
Email ini dikirim secara otomatis, jangan balas ke email ini.`,
        variables: ['recipientName', 'studentName', 'studentId', 'subjectName', 'grade', 'semester', 'academicYear', 'className', 'teacherName', 'schoolName'],
        language: 'id',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'attendance-report',
        name: 'Laporan Kehadiran',
        description: 'Template untuk laporan kehadiran siswa',
        category: 'attendance',
        subject: 'Laporan Kehadiran: {{studentName}} - {{attendanceDate}}',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Laporan Kehadiran</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
    .status-hadir { background: #d1fae5; color: #065f46; }
    .status-sakit { background: #fef3c7; color: #92400e; }
    .status-izin { background: #dbeafe; color: #1e40af; }
    .status-alpa { background: #fee2e2; color: #991b1b; }
    .footer { background: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Laporan Kehadiran</h1>
    </div>
    <div class="content">
      <p>Yth. {{recipientName}},</p>
      <p>Berikut adalah laporan kehadiran siswa:</p>
      <p><strong>{{studentName}}</strong> ({{studentId}})</p>
      
      <div class="status status-{{attendanceStatus}}">
        <p><strong>Tanggal:</strong> {{attendanceDate}}</p>
        <p><strong>Status:</strong> {{attendanceStatus}}</p>
      </div>
      
      <p>Terima kasih,</p>
      <p><strong>{{teacherName}}</strong></p>
    </div>
    <div class="footer">
      <p>{{schoolName}}</p>
      <p>Email ini dikirim secara otomatis, jangan balas ke email ini.</p>
    </div>
  </div>
</body>
</html>
        `,
        textContent: `Yth. {{recipientName}},

Berikut adalah laporan kehadiran siswa:

Nama: {{studentName}} ({{studentId}})
Tanggal: {{attendanceDate}}
Status: {{attendanceStatus}}

Terima kasih,
{{teacherName}}

{{schoolName}}
Email ini dikirim secara otomatis, jangan balas ke email ini.`,
        variables: ['recipientName', 'studentName', 'studentId', 'attendanceDate', 'attendanceStatus', 'teacherName', 'schoolName'],
        language: 'id',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'progress-report',
        name: 'Laporan Progress Siswa',
        description: 'Template untuk laporan progress siswa dengan attachment PDF',
        category: 'reports',
        subject: 'Laporan Progress: {{studentName}} - {{reportPeriod}}',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Laporan Progress</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .info { background: #e0e7ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .footer { background: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Laporan Progress Siswa</h1>
    </div>
    <div class="content">
      <p>Yth. {{recipientName}},</p>
      <p>Berikut adalah laporan progress untuk siswa:</p>
      
      <div class="info">
        <p><strong>Nama Siswa:</strong> {{studentName}}</p>
        <p><strong>ID Siswa:</strong> {{studentId}}</p>
        <p><strong>Kelas:</strong> {{className}}</p>
        <p><strong>Periode:</strong> {{reportPeriod}}</p>
      </div>
      
      <p>Laporan lengkap terlampir dalam format PDF.</p>
      <p>Atau Anda bisa melihat laporan secara online:</p>
      <p><a href="{{reportUrl}}" class="button">Lihat Laporan Online</a></p>
      
      <p>Terima kasih,</p>
      <p><strong>{{schoolName}}</strong></p>
    </div>
    <div class="footer">
      <p>Email ini dikirim secara otomatis, jangan balas ke email ini.</p>
    </div>
  </div>
</body>
</html>
        `,
        textContent: `Yth. {{recipientName}},

Berikut adalah laporan progress untuk siswa:

Nama Siswa: {{studentName}}
ID Siswa: {{studentId}}
Kelas: {{className}}
Periode: {{reportPeriod}}

Laporan lengkap terlampir dalam format PDF.

Atau Anda bisa melihat laporan secara online:
{{reportUrl}}

Terima kasih,
{{schoolName}}

Email ini dikirim secara otomatis, jangan balas ke email ini.`,
        variables: ['recipientName', 'studentName', 'studentId', 'className', 'reportPeriod', 'reportUrl', 'schoolName'],
        language: 'id',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'event-reminder',
        name: 'Pengingat Acara Sekolah',
        description: 'Template untuk pengingat acara sekolah',
        category: 'announcements',
        subject: 'Pengingat: {{eventTitle}}',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pengingat Acara</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .event { background: #dbeafe; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .footer { background: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Pengingat Acara</h1>
    </div>
    <div class="content">
      <p>Yth. {{recipientName}},</p>
      <p>Kami ingin mengingatkan Anda tentang acara yang akan datang:</p>
      
      <div class="event">
        <h3>{{eventTitle}}</h3>
        <p><strong>Tanggal:</strong> {{eventDate}}</p>
        <p><strong>Lokasi:</strong> {{eventLocation}}</p>
      </div>
      
      <p>Harap pastikan kehadiran Anda pada acara tersebut.</p>
      
      <p>Terima kasih,</p>
      <p><strong>{{schoolName}}</strong></p>
    </div>
    <div class="footer">
      <p>Email ini dikirim secara otomatis, jangan balas ke email ini.</p>
    </div>
  </div>
</body>
</html>
        `,
        textContent: `Yth. {{recipientName}},

Kami ingin mengingatkan Anda tentang acara yang akan datang:

Judul: {{eventTitle}}
Tanggal: {{eventDate}}
Lokasi: {{eventLocation}}

Harap pastikan kehadiran Anda pada acara tersebut.

Terima kasih,
{{schoolName}}

Email ini dikirim secara otomatis, jangan balas ke email ini.`,
        variables: ['recipientName', 'eventTitle', 'eventDate', 'eventLocation', 'schoolName'],
        language: 'id',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'system-notification',
        name: 'Notifikasi Sistem',
        description: 'Template untuk notifikasi sistem umum',
        category: 'system',
        subject: 'Notifikasi Sistem: {{subject}}',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Notifikasi Sistem</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .message { background: #e0e7ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .footer { background: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Notifikasi Sistem</h1>
    </div>
    <div class="content">
      <p>Yth. {{recipientName}},</p>
      
      <div class="message">
        <p>{{message}}</p>
      </div>
      
      <p>Terima kasih,</p>
      <p><strong>{{schoolName}}</strong></p>
    </div>
    <div class="footer">
      <p>Email ini dikirim secara otomatis, jangan balas ke email ini.</p>
    </div>
  </div>
</body>
</html>
        `,
        textContent: `Yth. {{recipientName}},

{{message}}

Terima kasih,
{{schoolName}}

Email ini dikirim secara otomatis, jangan balas ke email ini.`,
        variables: ['recipientName', 'subject', 'message', 'schoolName'],
        language: 'id',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    defaultTemplates.forEach(template => {
      if (!this.templates.has(template.id)) {
        this.templates.set(template.id, template);
      }
    });

    this.saveTemplates();
    logger.info(`Initialized ${defaultTemplates.length} default email templates`);
  }

  getTemplate(templateId: string): EmailTemplate | null {
    return this.templates.get(templateId) || null;
  }

  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  getActiveTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }

  createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): EmailTemplate {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.templates.set(newTemplate.id, newTemplate);
    this.saveTemplates();
    logger.info(`Created new email template: ${newTemplate.id}`);

    return newTemplate;
  }

  updateTemplate(templateId: string, updates: Partial<EmailTemplate>): EmailTemplate | null {
    const template = this.templates.get(templateId);
    if (!template) {
      logger.error(`Template not found: ${templateId}`);
      return null;
    }

    const updatedTemplate: EmailTemplate = {
      ...template,
      ...updates,
      id: templateId,
      updatedAt: new Date().toISOString()
    };

    this.templates.set(templateId, updatedTemplate);
    this.saveTemplates();
    logger.info(`Updated email template: ${templateId}`);

    return updatedTemplate;
  }

  deleteTemplate(templateId: string): boolean {
    const deleted = this.templates.delete(templateId);
    if (deleted) {
      this.saveTemplates();
      logger.info(`Deleted email template: ${templateId}`);
    }
    return deleted;
  }

  renderTemplate(templateId: string, context: EmailTemplateContext): { html: string; text: string } | null {
    const template = this.templates.get(templateId);
    if (!template) {
      logger.error(`Template not found: ${templateId}`);
      return null;
    }

    const schoolName = context.schoolName || 'MA Malnu Kananga';

    const html = this.interpolate(template.htmlContent, { ...context, schoolName });
    const text = this.interpolate(template.textContent || '', { ...context, schoolName });

    return { html, text };
  }

  private interpolate(template: string, context: Record<string, string | number | undefined>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = context[key];
      return value !== undefined ? String(value) : match;
    });
  }
}

export const emailTemplatesService = new EmailTemplatesService();
export default EmailTemplatesService;
