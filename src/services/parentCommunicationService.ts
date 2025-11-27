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

// Additional interfaces that may be required by other services
interface ParentCommunication {
  id: string;
  studentId: string;
  parentEmail: string;
  parentName: string;
  type: 'progress_report' | 'alert' | 'achievement' | 'reminder' | 'intervention';
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'failed';
  scheduledFor?: string;
  sentAt?: string;
  deliveryAttempts: number;
  responseRequired: boolean;
}

interface CommunicationTemplate {
  id: string;
  name: string;
  type: ParentCommunication['type'];
  subject: string;
  messageTemplate: string;
  variables: string[];
  priority: ParentCommunication['priority'];
  autoSend: boolean;
  triggerConditions: string[];
}

interface ParentSettings {
  studentId: string;
  parentEmail: string;
  parentName: string;
  communicationPreferences: {
    progressReports: boolean;
    alerts: boolean;
    achievements: boolean;
    reminders: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    language: 'id' | 'en';
  };
  contactRestrictions?: {
    quietHours: {
      start: string;
      end: string;
    };
  };
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

export { ParentCommunicationService };

