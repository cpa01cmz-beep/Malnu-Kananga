// Parent Communication Service for MA Malnu Kananga
// Automated progress reports and parent-teacher communication system

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  students: string[]; // Student IDs
  preferredLanguage: 'id' | 'en';
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'immediate';
  };
  lastLogin?: string;
}

export interface ProgressReport {
  id: string;
  studentId: string;
  parentIds: string[];
  reportType: 'weekly' | 'monthly' | 'semester' | 'incident' | 'achievement';
  period: {
    start: string;
    end: string;
  };
  academicPerformance: {
    overallGPA: number;
    subjectGrades: Array<{
      subject: string;
      grade: string;
      score: number;
      trend: 'improving' | 'stable' | 'declining';
      teacherComments?: string;
    }>;
    attendance: {
      present: number;
      absent: number;
      late: number;
      percentage: number;
    };
    assignments: {
      completed: number;
      pending: number;
      overdue: number;
      completionRate: number;
    };
  };
  behavioralNotes: Array<{
    date: string;
    type: 'positive' | 'concern' | 'neutral';
    category: 'participation' | 'discipline' | 'social' | 'effort';
    description: string;
    teacher: string;
  }>;
  achievements: Array<{
    date: string;
    type: 'academic' | 'extracurricular' | 'leadership' | 'service';
    title: string;
    description: string;
    level: 'class' | 'school' | 'district' | 'national';
  }>;
  concerns: Array<{
    area: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendations: string[];
    followUpRequired: boolean;
  }>;
  recommendations: Array<{
    category: 'academic' | 'behavioral' | 'health' | 'social';
    priority: 'low' | 'medium' | 'high';
    action: string;
    timeline: string;
  }>;
  nextSteps: string[];
  teacherComments: string;
  generatedAt: string;
  sentAt?: string;
  readAt?: string[];
}

export interface Communication {
  id: string;
  type: 'announcement' | 'individual' | 'group' | 'emergency';
  sender: {
    id: string;
    name: string;
    role: 'teacher' | 'admin' | 'counselor';
  };
  recipients: Array<{
    parentId: string;
    studentId?: string;
    delivered: boolean;
    read: boolean;
    readAt?: string;
  }>;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: Array<'email' | 'sms' | 'push' | 'portal'>;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  scheduledFor?: string;
  sentAt?: string;
  expiresAt?: string;
  responsesAllowed: boolean;
  responses?: Array<{
    parentId: string;
    message: string;
    timestamp: string;
  }>;
}

export interface ParentMeeting {
  id: string;
  studentId: string;
  parentIds: string[];
  teacherId: string;
  type: 'regular' | 'concern' | 'achievement' | 'disciplinary';
  scheduledFor: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  agenda: string[];
  location: 'online' | 'offline' | 'phone';
  meetingLink?: string;
  notes?: string;
  outcomes?: string[];
  followUpActions?: Array<{
    action: string;
    assignedTo: string;
    dueDate: string;
    status: 'pending' | 'completed';
  }>;
  createdAt: string;
}

class ParentCommunicationService {
  private readonly API_BASE_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

  // Generate automated progress report
  async generateProgressReport(
    studentId: string, 
    reportType: 'weekly' | 'monthly' | 'semester',
    customPeriod?: { start: string; end: string }
  ): Promise<ProgressReport> {
    try {
      const period = customPeriod || this.calculatePeriod(reportType);
      
      // Fetch student data
      const studentData = await this.getStudentPerformanceData(studentId, period);
      const parentData = await this.getParentsByStudent(studentId);
      
      // Generate report
      const report: ProgressReport = {
        id: `report_${studentId}_${Date.now()}`,
        studentId,
        parentIds: parentData.map(p => p.id),
        reportType,
        period,
        academicPerformance: {
          overallGPA: studentData.gpa || 0,
          subjectGrades: studentData.subjects || [],
          attendance: studentData.attendance || {
            present: 0,
            absent: 0,
            late: 0,
            percentage: 0
          },
          assignments: studentData.assignments || {
            completed: 0,
            pending: 0,
            overdue: 0,
            completionRate: 0
          }
        },
        behavioralNotes: studentData.behavioralNotes || [],
        achievements: studentData.achievements || [],
        concerns: this.identifyConcerns(studentData),
        recommendations: this.generateRecommendations(studentData),
        nextSteps: this.generateNextSteps(studentData),
        teacherComments: this.generateTeacherComments(studentData),
        generatedAt: new Date().toISOString()
      };

      // Save report
      await this.saveProgressReport(report);
      
      return report;
    } catch (error) {
      console.error('Error generating progress report:', error);
      throw new Error('Gagal membuat laporan kemajuan');
    }
  }

  // Send progress report to parents
  async sendProgressReport(reportId: string): Promise<void> {
    try {
      const report = await this.getProgressReport(reportId);
      const parents = await this.getParentsByStudent(report.studentId);
      
      for (const parent of parents) {
        const communication: Communication = {
          id: `comm_${Date.now()}_${parent.id}`,
          type: 'individual',
          sender: {
            id: 'system',
            name: 'Sistem Akademik',
            role: 'admin'
          },
          recipients: [{
            parentId: parent.id,
            studentId: report.studentId,
            delivered: false,
            read: false
          }],
          subject: `Laporan Kemajuan ${report.reportType === 'weekly' ? 'Mingguan' : report.reportType === 'monthly' ? 'Bulanan' : 'Semester'}`,
          message: this.formatReportMessage(report, parent),
          priority: this.determineReportPriority(report),
          channels: this.getPreferredChannels(parent),
          attachments: [{
            name: `Laporan_Kemajuan_${report.reportType}.pdf`,
            url: `/api/reports/${reportId}/pdf`,
            type: 'application/pdf'
          }],
          sentAt: new Date().toISOString(),
          responsesAllowed: true
        };

        await this.sendCommunication(communication);
      }

      // Update report status
      report.sentAt = new Date().toISOString();
      await this.saveProgressReport(report);
    } catch (error) {
      console.error('Error sending progress report:', error);
      throw new Error('Gagal mengirim laporan kemajuan');
    }
  }

  // Schedule parent-teacher meeting
  async scheduleMeeting(meeting: Omit<ParentMeeting, 'id' | 'createdAt'>): Promise<ParentMeeting> {
    try {
      const newMeeting: ParentMeeting = {
        ...meeting,
        id: `meeting_${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      // Save meeting
      await this.saveMeeting(newMeeting);

      // Send invitations to parents
      const parents = await this.getParentsByStudent(meeting.studentId);
      for (const parent of parents) {
        const invitation: Communication = {
          id: `invite_${Date.now()}_${parent.id}`,
          type: 'individual',
          sender: {
            id: meeting.teacherId,
            name: 'Guru Wali',
            role: 'teacher'
          },
          recipients: [{
            parentId: parent.id,
            studentId: meeting.studentId,
            delivered: false,
            read: false
          }],
          subject: 'Undangan Pertemuan Orang Tua-Guru',
          message: this.formatMeetingInvitation(newMeeting, parent),
          priority: 'medium',
          channels: this.getPreferredChannels(parent),
          sentAt: new Date().toISOString(),
          responsesAllowed: true
        };

        await this.sendCommunication(invitation);
      }

      return newMeeting;
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      throw new Error('Gagal menjadwalkan pertemuan');
    }
  }

  // Send emergency notification
  async sendEmergencyNotification(
    studentIds: string[],
    message: string,
    priority: 'high' | 'urgent'
  ): Promise<void> {
    try {
      for (const studentId of studentIds) {
        const parents = await this.getParentsByStudent(studentId);
        
        for (const parent of parents) {
          const emergency: Communication = {
            id: `emergency_${Date.now()}_${parent.id}`,
            type: 'emergency',
            sender: {
              id: 'system',
              name: 'Sistem Darurat',
              role: 'admin'
            },
            recipients: [{
              parentId: parent.id,
              studentId,
              delivered: false,
              read: false
            }],
            subject: 'Pemberitahuan Penting - Darurat',
            message,
            priority,
            channels: ['sms', 'push', 'email'], // Use all channels for emergency
            sentAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            responsesAllowed: true
          };

          await this.sendCommunication(emergency);
        }
      }
    } catch (error) {
      console.error('Error sending emergency notification:', error);
      throw new Error('Gagal mengirim notifikasi darurat');
    }
  }

  // Helper methods
  private calculatePeriod(reportType: 'weekly' | 'monthly' | 'semester'): { start: string; end: string } {
    const now = new Date();
    const end = new Date(now);
    
    let start = new Date(now);
    
    switch (reportType) {
      case 'weekly':
        start.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'semester':
        start.setMonth(now.getMonth() - 6);
        break;
    }
    
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }

  private async getStudentPerformanceData(studentId: string, period: { start: string; end: string }): Promise<any> {
    // Mock data - in production, fetch from actual student information system
    return {
      gpa: 3.2,
      subjects: [
        {
          subject: 'Matematika',
          grade: 'B+',
          score: 85,
          trend: 'improving',
          teacherComments: 'Menunjukkan peningkatan yang baik'
        },
        {
          subject: 'Bahasa Indonesia',
          grade: 'A-',
          score: 88,
          trend: 'stable',
          teacherComments: 'Konsisten baik'
        }
      ],
      attendance: {
        present: 18,
        absent: 1,
        late: 2,
        percentage: 90
      },
      assignments: {
        completed: 12,
        pending: 2,
        overdue: 1,
        completionRate: 80
      },
      behavioralNotes: [
        {
          date: new Date().toISOString(),
          type: 'positive',
          category: 'participation',
          description: 'Aktif dalam diskusi kelas',
          teacher: 'Bu Siti'
        }
      ],
      achievements: [
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'academic',
          title: 'Juara 2 Olimpiade Matematika',
          description: 'Meraih juara 2 tingkat sekolah',
          level: 'school'
        }
      ]
    };
  }

  private async getParentsByStudent(studentId: string): Promise<Parent[]> {
    // Mock data - in production, fetch from database
    return [
      {
        id: 'parent_001',
        name: 'Ahmad Wijaya',
        email: 'ahmad.wijaya@email.com',
        phone: '+62812345678',
        students: [studentId],
        preferredLanguage: 'id',
        notificationPreferences: {
          email: true,
          sms: true,
          push: false,
          frequency: 'weekly'
        }
      }
    ];
  }

  private identifyConcerns(studentData: any): ProgressReport['concerns'] {
    const concerns = [];
    
    if (studentData.attendance.percentage < 85) {
      concerns.push({
        area: 'Kehadiran',
        severity: 'medium',
        description: 'Kehadiran di bawah standar (85%)',
        recommendations: ['Diskusikan dengan anak tentang alasan ketidakhadiran', 'Koordinasi dengan guru wali'],
        followUpRequired: true
      });
    }
    
    if (studentData.assignments.completionRate < 75) {
      concerns.push({
        area: 'Penyelesaian Tugas',
        severity: 'high',
        description: 'Tingkat penyelesaian tugas rendah',
        recommendations: ['Buat jadwal belajar teratur', 'Monitor progress harian'],
        followUpRequired: true
      });
    }
    
    return concerns;
  }

  private generateRecommendations(studentData: any): ProgressReport['recommendations'] {
    const recommendations = [];
    
    if (studentData.gpa < 3.0) {
      recommendations.push({
        category: 'academic',
        priority: 'high',
        action: 'Tingkatkan waktu belajar dan fokus pada mata pelajaran yang sulit',
        timeline: '2 minggu'
      });
    }
    
    if (studentData.attendance.late > 3) {
      recommendations.push({
        category: 'behavioral',
        priority: 'medium',
        action: 'Perbaiki manajemen waktu untuk menghindari keterlambatan',
        timeline: '1 minggu'
      });
    }
    
    return recommendations;
  }

  private generateNextSteps(studentData: any): string[] {
    const steps = [];
    
    steps.push('Tinjau laporan ini bersama anak');
    steps.push('Hubungi guru wali jika ada pertanyaan');
    
    if (studentData.concerns.length > 0) {
      steps.push('Jadwalkan pertemuan dengan guru untuk diskusikan concerns');
    }
    
    return steps;
  }

  private generateTeacherComments(studentData: any): string {
    let comments = '';
    
    if (studentData.gpa >= 3.5) {
      comments = 'Anak Anda menunjukkan prestasi akademik yang sangat baik. Pertahankan konsistensi ini.';
    } else if (studentData.gpa >= 2.5) {
      comments = 'Anak Anda menunjukkan kemajuan yang baik. Dengan dukungan yang tepat, potensinya dapat dikembangkan lebih lanjut.';
    } else {
      comments = 'Anak Anda membutuhkan dukungan tambahan dalam pembelajaran. Mari bekerja sama untuk membantu mencapai potensi terbaiknya.';
    }
    
    if (studentData.behavioralNotes.some((note: any) => note.type === 'positive')) {
      comments += ' Perilaku positifnya di kelas sangat menggembirakan.';
    }
    
    return comments;
  }

  private formatReportMessage(report: ProgressReport, parent: Parent): string {
    const language = parent.preferredLanguage;
    
    if (language === 'en') {
      return `Dear ${parent.name},

Please find attached the ${report.reportType} progress report for your child for the period ${new Date(report.period.start).toLocaleDateString()} to ${new Date(report.period.end).toLocaleDateString()}.

Key highlights:
- Overall GPA: ${report.academicPerformance.overallGPA.toFixed(2)}
- Attendance Rate: ${report.academicPerformance.attendance.percentage}%
- Assignment Completion: ${report.academicPerformance.assignments.completionRate}%

Please review the detailed report and don't hesitate to contact us if you have any questions.

Best regards,
School Administration`;
    } else {
      return `Kepada Yth. Bapak/Ibu ${parent.name},

Bersama ini kami kirimkan laporan kemajuan ${report.reportType === 'weekly' ? 'mingguan' : report.reportType === 'monthly' ? 'bulanan' : 'semester'} anak Anda untuk periode ${new Date(report.period.start).toLocaleDateString('id-ID')} hingga ${new Date(report.period.end).toLocaleDateString('id-ID')}.

Poin-poin penting:
- IPK Keseluruhan: ${report.academicPerformance.overallGPA.toFixed(2)}
- Tingkat Kehadiran: ${report.academicPerformance.attendance.percentage}%
- Penyelesaian Tugas: ${report.academicPerformance.assignments.completionRate}%

Mohon tinjau laporan detail dan jangan ragu menghubungi kami jika ada pertanyaan.

Hormat kami,
Administrasi Sekolah`;
    }
  }

  private formatMeetingInvitation(meeting: ParentMeeting, parent: Parent): string {
    const language = parent.preferredLanguage;
    const date = new Date(meeting.scheduledFor).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID');
    const time = new Date(meeting.scheduledFor).toLocaleTimeString(language === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' });
    
    if (language === 'en') {
      return `Dear ${parent.name},

You are invited to a parent-teacher meeting on ${date} at ${time}. The meeting will be ${meeting.location === 'online' ? 'held online' : 'conducted in person'} and will last approximately ${meeting.duration} minutes.

Agenda:
${meeting.agenda.map(item => `- ${item}`).join('\n')}

Please confirm your attendance by replying to this message.

Best regards,
Teacher`;
    } else {
      return `Kepada Yth. Bapak/Ibu ${parent.name},

Anda diundang untuk pertemuan orang tua-guru pada tanggal ${date} pukul ${time}. Pertemuan akan dilaksanakan ${meeting.location === 'online' ? 'secara online' : 'secara tatap muka'} dan berlangsung selama sekitar ${meeting.duration} menit.

Agenda:
${meeting.agenda.map(item => `- ${item}`).join('\n')}

Mohon konfirmasi kehadiran Anda dengan membalas pesan ini.

Hormat kami,
Guru`;
    }
  }

  private determineReportPriority(report: ProgressReport): Communication['priority'] {
    if (report.concerns.some(c => c.severity === 'high')) {
      return 'high';
    }
    if (report.concerns.length > 0) {
      return 'medium';
    }
    return 'low';
  }

  private getPreferredChannels(parent: Parent): Array<'email' | 'sms' | 'push' | 'portal'> {
    const channels = [];
    if (parent.notificationPreferences.email) channels.push('email');
    if (parent.notificationPreferences.sms) channels.push('sms');
    if (parent.notificationPreferences.push) channels.push('push');
    channels.push('portal'); // Always include portal
    return channels;
  }

  private async sendCommunication(communication: Communication): Promise<void> {
    // Mock implementation - in production, integrate with actual communication channels
    console.log('Sending communication:', communication);
    
    // Update recipient status
    communication.recipients.forEach(recipient => {
      recipient.delivered = true;
    });
  }

  private async saveProgressReport(report: ProgressReport): Promise<void> {
    const reports = JSON.parse(localStorage.getItem('progress_reports') || '[]');
    reports.push(report);
    localStorage.setItem('progress_reports', JSON.stringify(reports));
  }

  private async getProgressReport(reportId: string): Promise<ProgressReport | null> {
    const reports = JSON.parse(localStorage.getItem('progress_reports') || '[]');
    return reports.find((r: ProgressReport) => r.id === reportId) || null;
  }

  private async saveMeeting(meeting: ParentMeeting): Promise<void> {
    const meetings = JSON.parse(localStorage.getItem('parent_meetings') || '[]');
    meetings.push(meeting);
    localStorage.setItem('parent_meetings', JSON.stringify(meetings));
  }
}

export const parentCommunicationService = new ParentCommunicationService();

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
    if (settings && this.isQuietHours(settings)) {
      // Reschedule for next allowed time
      const nextAllowedTime = this.getNextAllowedTime(settings || undefined);
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

// Auto-initialize when module loads with error handling
if (typeof window !== 'undefined') {
  try {
    ParentCommunicationService.initialize();
    console.log('📧 Parent Communication Service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Parent Communication Service:', error);
  }
}

export { ParentCommunicationService };