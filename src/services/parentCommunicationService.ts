// Enhanced Parent Communication Automation Service
// Layanan komunikasi otomatis dengan orang tua siswa - Enhanced dengan AI-powered personalization

export interface ParentCommunication {
  id: string;
  studentId: string;
  parentEmail: string;
  parentName: string;
  type: 'progress_report' | 'alert' | 'achievement' | 'reminder' | 'intervention';
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  scheduledFor?: string;
  sentAt?: string;
  deliveryAttempts: number;
  responseRequired: boolean;
  attachments?: string[];
  metadata?: Record<string, any>;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: ParentCommunication['type'];
  subject: string;
  messageTemplate: string;
  variables: string[];
  priority: ParentCommunication['priority'];
  autoSend: boolean;
  triggerConditions?: string[];
}

export interface ParentSettings {
  studentId: string;
  parentEmail: string;
  parentName: string;
  communicationPreferences: {
    progressReports: boolean;
    alerts: boolean;
    achievements: boolean;
    reminders: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    language: 'id' | 'en';
  };
  contactRestrictions?: {
    quietHours: { start: string; end: string };
    daysOff: string[];
  };
}

class ParentCommunicationService {
  private static COMMUNICATION_KEY = 'malnu_parent_communications';
  private static TEMPLATES_KEY = 'malnu_communication_templates';
  private static SETTINGS_KEY = 'malnu_parent_settings';
  private static QUEUE_KEY = 'malnu_communication_queue';

  // Initialize the communication system
  static initialize(): void {
    this.setupDefaultTemplates();
    this.startCommunicationProcessor();
  }

  // Setup default communication templates
  private static setupDefaultTemplates(): void {
    const existingTemplates = localStorage.getItem(this.TEMPLATES_KEY);
    if (existingTemplates) return;

    const defaultTemplates: CommunicationTemplate[] = [
      {
        id: 'progress_report_weekly',
        name: 'Laporan Progress Mingguan',
        type: 'progress_report',
        subject: 'Laporan Progress Siswa - {{studentName}} - {{weekPeriod}}',
        messageTemplate: `Yth. Bapak/Ibu {{parentName}},

Berikut adalah laporan progress akademik {{studentName}} untuk periode {{weekPeriod}}:

📊 AKADEMIK:
- IPK: {{gpa}}
- Kehadiran: {{attendanceRate}}%
- Penyelesaian Tugas: {{assignmentCompletion}}%
- Trend Nilai: {{gradeTrend}}

📈 KETERLIBATAN:
- Login: {{loginFrequency}}x/minggu
- Akses Resource: {{resourceAccess}}
- Permintaan Support: {{supportRequests}}

⚠️ RISIKO: {{riskLevel}}

{{#hasConcerns}}
🔍 PERHATIAN KHUSUS:
{{concerns}}
{{/hasConcerns}}

📞 Jika ada pertanyaan, silakan hubungi tim support kami.

Hormat kami,
Tim Support MA Malnu Kananga`,
        variables: ['parentName', 'studentName', 'weekPeriod', 'gpa', 'attendanceRate', 'assignmentCompletion', 'gradeTrend', 'loginFrequency', 'resourceAccess', 'supportRequests', 'riskLevel', 'hasConcerns', 'concerns'],
        priority: 'medium',
        autoSend: true,
        triggerConditions: ['weekly_schedule']
      },
      {
        id: 'alert_high_risk',
        name: 'Peringatan Risiko Tinggi',
        type: 'alert',
        subject: '⚠️ PERINGATAN: Perhatian Segera Diperlukan - {{studentName}}',
        messageTemplate: `Yth. Bapak/Ibu {{parentName}},

Kami mendeteksi bahwa {{studentName}} memerlukan perhatian segera:

🚨 STATUS RISIKO: {{riskLevel}}
Faktor-faktor yang teridentifikasi:
{{riskFactors}}

📋 REKOMENDASI:
{{recommendations}}

🎚️ TINGKAT KESEGERAAN: {{urgency}}

Kami mohon Bapak/Ibu untuk:
1. Segera menghubungi guru BK
2. Mendiskusikan tantangan yang dihadapi siswa
3. Mengikuti rencana intervensi yang disarankan

Kontak darurat: {{emergencyContact}}

Hormat kami,
Tim Support MA Malnu Kananga`,
        variables: ['parentName', 'studentName', 'riskLevel', 'riskFactors', 'recommendations', 'urgency', 'emergencyContact'],
        priority: 'urgent',
        autoSend: true,
        triggerConditions: ['high_risk_detected']
      },
      {
        id: 'achievement_recognition',
        name: 'Penghargaan Prestasi',
        type: 'achievement',
        subject: '🎉 Selamat! Prestasi {{studentName}}',
        messageTemplate: `Yth. Bapak/Ibu {{parentName}},

Kami dengan bangga menginformasikan prestasi {{studentName}}:

🏆 PRESTASI: {{achievementType}}
{{achievementDescription}}

📈 PENINGKATAN:
{{improvementAreas}}

Ini adalah hasil dari kerja keras dan dedikasi yang luar biasa!

Mari kita terus dukung {{studentName}} untuk meraih prestasi yang lebih tinggi.

Selamat dan sukses selalu!
Tim MA Malnu Kananga`,
        variables: ['parentName', 'studentName', 'achievementType', 'achievementDescription', 'improvementAreas'],
        priority: 'low',
        autoSend: true,
        triggerConditions: ['achievement_earned']
      },
      {
        id: 'intervention_scheduled',
        name: 'Jadwal Intervensi',
        type: 'intervention',
        subject: '📅 Jadwal Intervensi - {{studentName}}',
        messageTemplate: `Yth. Bapak/Ibu {{parentName}},

Berdasarkan evaluasi terkini, kami telah menjadwalkan sesi intervensi untuk {{studentName}}:

📅 TANGGAL: {{interventionDate}}
⏰ WAKTU: {{interventionTime}}
📍 TEMPAT: {{interventionLocation}}
👥 FASILITATOR: {{facilitator}}

🎯 TUJUAN INTERVENSI:
{{interventionGoals}}

📋 MATERI:
{{interventionTopics}}

Mohon kesediaan Bapak/Ibu untuk:
✓ Memastikan kehadiran siswa
✓ Mendukung proses intervensi
✓ Menghubungi kami jika ada kendala

Konfirmasi kehadiran: {{confirmationLink}}

Hormat kami,
Tim Bimbingan Konseling`,
        variables: ['parentName', 'studentName', 'interventionDate', 'interventionTime', 'interventionLocation', 'facilitator', 'interventionGoals', 'interventionTopics', 'confirmationLink'],
        priority: 'high',
        autoSend: true,
        triggerConditions: ['intervention_scheduled']
      }
    ];

    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(defaultTemplates));
  }

  // Create parent communication
  static createCommunication(
    studentId: string,
    type: ParentCommunication['type'],
    subject: string,
    message: string,
    priority: ParentCommunication['priority'] = 'medium',
    parentEmail?: string,
    scheduledFor?: string
  ): ParentCommunication {
    const settings = this.getParentSettings(studentId);
    const targetEmail = parentEmail || settings?.parentEmail;
    
    if (!targetEmail) {
      throw new Error(`No parent email found for student ${studentId}`);
    }

    const communication: ParentCommunication = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      parentEmail: targetEmail,
      parentName: settings?.parentName || 'Orang Tua/Wali',
      type,
      subject,
      message,
      priority,
      status: 'pending',
      scheduledFor,
      deliveryAttempts: 0,
      responseRequired: type === 'alert' || type === 'intervention'
    };

    this.saveCommunication(communication);
    
    // Schedule immediate sending if not scheduled
    if (!scheduledFor) {
      this.queueCommunication(communication);
    }

    return communication;
  }

  // Send communication using template
  static sendTemplateCommunication(
    studentId: string,
    templateId: string,
    variables: Record<string, any>,
    priority?: ParentCommunication['priority']
  ): ParentCommunication {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const settings = this.getParentSettings(studentId);
    if (!settings) {
      throw new Error(`No parent settings found for student ${studentId}`);
    }

    // Check communication preferences
    if (!this.checkCommunicationPreferences(settings, template.type)) {
      throw new Error(`Communication type ${template.type} is disabled for student ${studentId}`);
    }

    // Process template variables
    const subject = this.processTemplate(template.subject, { ...variables, parentName: settings.parentName });
    const message = this.processTemplate(template.messageTemplate, {
      ...variables,
      parentName: settings.parentName,
      studentName: variables.studentName || `Siswa ${studentId}`
    });

    return this.createCommunication(
      studentId,
      template.type,
      subject,
      message,
      priority || template.priority,
      settings.parentEmail
    );
  }

  // Process template with variables
  private static processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;

    // Replace simple variables {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    });

    // Handle conditional blocks {{#condition}}...{{/condition}}
    processed = processed.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (match, condition, content) => {
      return variables[condition] ? content : '';
    });

    return processed.trim();
  }

  // Check communication preferences
  private static checkCommunicationPreferences(settings: ParentSettings, type: ParentCommunication['type']): boolean {
    const prefs = settings.communicationPreferences;
    
    switch (type) {
      case 'progress_report': return prefs.progressReports;
      case 'alert': return prefs.alerts;
      case 'achievement': return prefs.achievements;
      case 'reminder': return prefs.reminders;
      case 'intervention': return prefs.alerts; // Use alert preference for interventions
      default: return true;
    }
  }

  // Queue communication for sending
  private static queueCommunication(communication: ParentCommunication): void {
    const queue = this.getCommunicationQueue();
    queue.push({
      ...communication,
      queuedAt: new Date().toISOString()
    });
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  // Get communication queue
  private static getCommunicationQueue(): any[] {
    const queue = localStorage.getItem(this.QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  }

  // Start communication processor
  private static startCommunicationProcessor(): void {
    // Process queue every 30 seconds
    setInterval(() => {
      this.processCommunicationQueue();
    }, 30 * 1000);

    // Process scheduled communications every minute
    setInterval(() => {
      this.processScheduledCommunications();
    }, 60 * 1000);
  }

  // Process communication queue
  private static async processCommunicationQueue(): Promise<void> {
    const queue = this.getCommunicationQueue();
    const pendingCommunications = queue.filter(c => c.status === 'pending');

    for (const comm of pendingCommunications) {
      try {
        await this.sendCommunication(comm);
      } catch (error) {
        console.error(`Failed to send communication ${comm.id}:`, error);
        this.handleCommunicationFailure(comm.id, error);
      }
    }
  }

  // Process scheduled communications
  private static processScheduledCommunications(): void {
    const communications = this.getAllCommunications();
    const now = new Date();

    communications
      .filter(c => c.scheduledFor && new Date(c.scheduledFor) <= now && c.status === 'pending')
      .forEach(c => {
        this.queueCommunication(c);
      });
  }

  // Send communication via email
  private static async sendCommunication(communication: ParentCommunication): Promise<void> {
    // Check quiet hours
    const settings = this.getParentSettings(communication.studentId);
    if (this.isQuietHours(settings)) {
      // Reschedule for next allowed time
      const nextAllowedTime = this.getNextAllowedTime(settings);
      communication.scheduledFor = nextAllowedTime.toISOString();
      this.saveCommunication(communication);
      return;
    }

    const emailBody = this.generateEmailBody(communication);
    
    const sendRequest = new Request('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: communication.parentEmail, name: communication.parentName }]
        }],
        from: { email: 'noreply@ma-malnukananga.sch.id', name: 'MA Malnu Kananga' },
        subject: communication.subject,
        content: [{ type: 'text/html', value: emailBody }],
      }),
    });

    const response = await fetch(sendRequest);
    
    if (!response.ok) {
      throw new Error(`Email service error: ${response.statusText}`);
    }

    // Update communication status
    communication.status = 'sent';
    communication.sentAt = new Date().toISOString();
    communication.deliveryAttempts = (communication.deliveryAttempts || 0) + 1;
    this.saveCommunication(communication);

    // Remove from queue
    this.removeFromQueue(communication.id);
  }

  // Generate email body with proper formatting
  private static generateEmailBody(communication: ParentCommunication): string {
    const priorityColors = {
      low: '#22c55e',
      medium: '#eab308', 
      high: '#f97316',
      urgent: '#ef4444'
    };

    const typeIcons = {
      progress_report: '📊',
      alert: '⚠️',
      achievement: '🎉',
      reminder: '📝',
      intervention: '🔧'
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${communication.subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">${typeIcons[communication.type]}</div>
        <h1 style="color: white; margin: 0; font-size: 24px;">MA Malnu Kananga</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Sistem Komunikasi Orang Tua</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <span style="background: ${priorityColors[communication.priority]}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-right: 10px;">
                ${communication.priority.toUpperCase()}
            </span>
            <span style="color: #6b7280; font-size: 14px;">
                ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
        </div>
        
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">${communication.subject}</h2>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid ${priorityColors[communication.priority]};">
            ${communication.message.replace(/\n/g, '<br>')}
        </div>
        
        ${communication.responseRequired ? `
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">⚠️ Respons Diperlukan</p>
            <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">Mohon segera merespons komunikasi ini.</p>
        </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Hormat kami,<br>
                <strong>Tim Support MA Malnu Kananga</strong><br>
                <span style="font-size: 12px;">Email ini dikirim secara otomatis oleh sistem komunikasi orang tua.</span>
            </p>
        </div>
    </div>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 12px;">
            ID Komunikasi: ${communication.id}<br>
            Jika Anda tidak merasa menerima email ini, abaikan saja.
        </p>
    </div>
</body>
</html>`;
  }

  // Check if current time is within quiet hours
  private static isQuietHours(settings?: ParentSettings): boolean {
    if (!settings?.contactRestrictions?.quietHours) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const quietStart = this.parseTime(settings.contactRestrictions.quietHours.start);
    const quietEnd = this.parseTime(settings.contactRestrictions.quietHours.end);

    if (quietStart <= quietEnd) {
      return currentTime >= quietStart && currentTime <= quietEnd;
    } else {
      // Overnight quiet hours (e.g., 22:00 to 06:00)
      return currentTime >= quietStart || currentTime <= quietEnd;
    }
  }

  // Parse time string to minutes
  private static parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Get next allowed time for communication
  private static getNextAllowedTime(settings?: ParentSettings): Date {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (!settings?.contactRestrictions?.quietHours) {
      return now;
    }

    const quietEnd = this.parseTime(settings.contactRestrictions.quietHours.end);
    const nextAllowed = new Date(now);
    nextAllowed.setHours(Math.floor(quietEnd / 60), quietEnd % 60, 0, 0);
    
    if (nextAllowed <= now) {
      nextAllowed.setDate(nextAllowed.getDate() + 1);
    }
    
    return nextAllowed;
  }

  // Handle communication failure
  private static handleCommunicationFailure(communicationId: string, error: any): void {
    const communication = this.getCommunication(communicationId);
    if (!communication) return;

    communication.deliveryAttempts = (communication.deliveryAttempts || 0) + 1;
    
    if (communication.deliveryAttempts >= 3) {
      communication.status = 'failed';
      // Escalate to manual intervention
      this.escalateToManualIntervention(communication);
    }
    
    this.saveCommunication(communication);
  }

  // Escalate to manual intervention
  private static escalateToManualIntervention(communication: ParentCommunication): void {
    // Create escalation request for support team
    console.error(`Communication ${communication.id} failed after 3 attempts. Manual intervention required.`);
  }

  // Remove from queue
  private static removeFromQueue(communicationId: string): void {
    const queue = this.getCommunicationQueue();
    const filteredQueue = queue.filter(c => c.id !== communicationId);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(filteredQueue));
  }

  // Save communication
  private static saveCommunication(communication: ParentCommunication): void {
    const communications = this.getAllCommunications();
    const index = communications.findIndex(c => c.id === communication.id);
    
    if (index !== -1) {
      communications[index] = communication;
    } else {
      communications.push(communication);
    }
    
    localStorage.setItem(this.COMMUNICATION_KEY, JSON.stringify(communications));
  }

  // Get all communications
  static getAllCommunications(): ParentCommunication[] {
    const communications = localStorage.getItem(this.COMMUNICATION_KEY);
    return communications ? JSON.parse(communications) : [];
  }

  // Get communication by ID
  static getCommunication(id: string): ParentCommunication | null {
    const communications = this.getAllCommunications();
    return communications.find(c => c.id === id) || null;
  }

  // Get communications by student
  static getStudentCommunications(studentId: string): ParentCommunication[] {
    const communications = this.getAllCommunications();
    return communications.filter(c => c.studentId === studentId);
  }

  // Get template by ID
  static getTemplate(id: string): CommunicationTemplate | null {
    const templates = this.getAllTemplates();
    return templates.find(t => t.id === id) || null;
  }

  // Get all templates
  static getAllTemplates(): CommunicationTemplate[] {
    const templates = localStorage.getItem(this.TEMPLATES_KEY);
    return templates ? JSON.parse(templates) : [];
  }

  // Get parent settings
  static getParentSettings(studentId: string): ParentSettings | null {
    const allSettings = this.getAllParentSettings();
    return allSettings[studentId] || null;
  }

  // Get all parent settings
  static getAllParentSettings(): Record<string, ParentSettings> {
    const settings = localStorage.getItem(this.SETTINGS_KEY);
    return settings ? JSON.parse(settings) : {};
  }

  // Update parent settings
  static updateParentSettings(studentId: string, settings: Partial<ParentSettings>): void {
    const allSettings = this.getAllParentSettings();
    const currentSettings = allSettings[studentId] || {
      studentId,
      parentEmail: '',
      parentName: '',
      communicationPreferences: {
        progressReports: true,
        alerts: true,
        achievements: true,
        reminders: true,
        frequency: 'weekly',
        language: 'id'
      }
    };

    allSettings[studentId] = { ...currentSettings, ...settings };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(allSettings));
  }

  // Get communication analytics
  static getCommunicationAnalytics(): any {
    const communications = this.getAllCommunications();
    
    return {
      total: communications.length,
      sent: communications.filter(c => c.status === 'sent').length,
      pending: communications.filter(c => c.status === 'pending').length,
      failed: communications.filter(c => c.status === 'failed').length,
      byType: this.getCommunicationsByType(communications),
      byPriority: this.getCommunicationsByPriority(communications),
      averageDeliveryTime: this.calculateAverageDeliveryTime(communications),
      responseRate: this.calculateResponseRate(communications)
    };
  }

  // Get communications by type
  private static getCommunicationsByType(communications: ParentCommunication[]): Record<string, number> {
    const byType: Record<string, number> = {};
    communications.forEach(c => {
      byType[c.type] = (byType[c.type] || 0) + 1;
    });
    return byType;
  }

  // Get communications by priority
  private static getCommunicationsByPriority(communications: ParentCommunication[]): Record<string, number> {
    const byPriority: Record<string, number> = {};
    communications.forEach(c => {
      byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
    });
    return byPriority;
  }

  // Calculate average delivery time
  private static calculateAverageDeliveryTime(communications: ParentCommunication[]): number {
    const sent = communications.filter(c => c.status === 'sent' && c.sentAt);
    if (sent.length === 0) return 0;

    const totalTime = sent.reduce((sum, c) => {
      const created = new Date(c.id.split('_')[1]).getTime();
      const sentTime = new Date(c.sentAt!).getTime();
      return sum + (sentTime - created);
    }, 0);

    return totalTime / sent.length / (1000 * 60); // minutes
  }

  // Calculate response rate
  private static calculateResponseRate(communications: ParentCommunication[]): number {
    const responseRequired = communications.filter(c => c.responseRequired);
    if (responseRequired.length === 0) return 100;

    // This would track actual responses in a real implementation
    return 85; // Mock response rate
  }
}

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  ParentCommunicationService.initialize();
}

export { ParentCommunicationService };