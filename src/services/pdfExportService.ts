import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';

export interface PDFReportData {
  title: string;
  studentName?: string;
  studentId?: string;
  period?: string;
  date?: string;
  headers: string[];
  data: (string | number)[][];
  summary?: Record<string, string>;
  schoolName?: string;
}

export interface TableOptions extends Partial<UserOptions> {
  headers: string[];
  data: (string | number)[][];
}

export interface GradeData {
  grade?: number;
  nilai?: number;
}

export interface AttendanceData {
  status: string;
}

class PDFExportService {
  private schoolName: string;
  private schoolAddress?: string;

  constructor() {
    this.schoolName = 'MA Malnu Kananga';
    this.schoolAddress = 'Indonesia';
  }

  createReport(reportData: PDFReportData): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Add header
    this.addHeader(doc, reportData.title, pageWidth);
    
    let yPosition = 40;
    
    // Add student info if available
    if (reportData.studentName) {
      yPosition = this.addStudentInfo(doc, reportData, yPosition);
    }
    
    // Add summary if available
    if (reportData.summary) {
      yPosition = this.addSummary(doc, reportData.summary, yPosition);
    }
    
    // Add table
    if (reportData.data.length > 0) {
      this.addTable(doc, {
        headers: reportData.headers,
        data: reportData.data,
        startY: yPosition + 10,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 20, right: 20 }
      });
    }
    
    // Add footer
    this.addFooter(doc, pageWidth, pageHeight);
    
    // Save the document
    const filename = `${reportData.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    doc.save(filename);
  }
  
  private addHeader(doc: jsPDF, title: string, pageWidth: number): void {
    // School name
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(this.schoolName, pageWidth / 2, 15, { align: 'center' });
    
    // Report title
    doc.setFontSize(14);
    doc.text(title, pageWidth / 2, 25, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, 32, { align: 'center' });
  }
  
  private addStudentInfo(doc: jsPDF, reportData: PDFReportData, yPosition: number): number {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    let currentY = yPosition + 5;
    const lineHeight = 6;
    
    if (reportData.studentName) {
      doc.text(`Nama Siswa: ${reportData.studentName}`, 20, currentY);
      currentY += lineHeight;
    }
    
    if (reportData.studentId) {
      doc.text(`NIS: ${reportData.studentId}`, 20, currentY);
      currentY += lineHeight;
    }
    
    if (reportData.period) {
      doc.text(`Periode: ${reportData.period}`, 20, currentY);
      currentY += lineHeight;
    }
    
    return currentY;
  }
  
  private addSummary(doc: jsPDF, summary: Record<string, string>, yPosition: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Ringkasan', 20, yPosition + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    let currentY = yPosition + 12;
    const lineHeight = 5;
    
    Object.entries(summary).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 20, currentY);
      currentY += lineHeight;
    });
    
    return currentY;
  }
  
  private addTable(doc: jsPDF, options: TableOptions): void {
    autoTable(doc, options);
  }
  
  private addFooter(doc: jsPDF, pageWidth: number, pageHeight: number): void {
    if (this.schoolAddress) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(this.schoolAddress, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  }
  
  // Specialized reports
  
  createGradesReport(gradesData: { subjectName: string; grade: number; className: string; semester: string; remarks: string }[], studentInfo?: { name: string; id: string }): void {
    const headers = ['Mata Pelajaran', 'Nilai', 'Kelas', 'Semester', 'Keterangan'];
    const data = gradesData.map(grade => [
      grade.subjectName,
      grade.grade,
      grade.className,
      grade.semester,
      grade.remarks
    ]);
    
    this.createReport({
      title: 'Laporan Nilai Akademik',
      studentName: studentInfo?.name,
      studentId: studentInfo?.id,
      period: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }),
      headers,
      data,
      summary: {
        'Total Mata Pelajaran': gradesData.length.toString(),
        'Rata-rata Nilai': this.calculateAverage(gradesData.map(g => g.grade || 0)).toFixed(2),
        'Tertinggi': Math.max(...gradesData.map(g => g.grade || 0)).toString(),
        'Terendah': Math.min(...gradesData.map(g => g.grade || 0)).toString()
      }
    });
  }
  
  createAttendanceReport(attendanceData: Record<string, string>[], studentInfo?: { name: string; id: string }): void {
    const headers = ['Tanggal', 'Status', 'Mata Pelajaran', 'Keterangan'];
    const data = attendanceData.map(attendance => [
      attendance.date || attendance.tanggal || '-',
      attendance.status || '-',
      attendance.subject || attendance.mataPelajaran || '-',
      attendance.notes || attendance.keterangan || '-'
    ]);
    
    const presentCount = attendanceData.filter(a => a.status === 'Hadir').length;
    const totalCount = attendanceData.length;
    const percentage = ((presentCount / totalCount) * 100).toFixed(1);
    
    this.createReport({
      title: 'Laporan Kehadiran',
      studentName: studentInfo?.name,
      studentId: studentInfo?.id,
      period: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }),
      headers,
      data,
      summary: {
        'Total Kehadiran': `${presentCount}/${totalCount} hari`,
        'Persentase Kehadiran': `${percentage}%`,
        'Terlambat': attendanceData.filter(a => a.status === 'Terlambat').length.toString(),
        'Izin': attendanceData.filter(a => a.status === 'Izin').length.toString(),
        'Sakit': attendanceData.filter(a => a.status === 'Sakit').length.toString(),
        'Tanpa Keterangan': attendanceData.filter(a => a.status === 'Alpha' || a.status === 'Tanpa Keterangan').length.toString()
      }
    });
  }
  
  createConsolidatedReport(studentInfo: Record<string, string>, grades: GradeData[], attendance: AttendanceData[]): void {
    const headers = ['Kategori', 'Data'];
    const data = [
      ['Nama Siswa', studentInfo.name || studentInfo.nama || '-'],
      ['NIS', studentInfo.id || studentInfo.nis || '-'],
      ['Kelas', studentInfo.className || studentInfo.kelas || '-'],
      ['Total Mata Pelajaran', grades.length.toString()],
      ['Rata-rata Nilai', this.calculateAverage(grades.map(g => g.grade || g.nilai || 0)).toFixed(2)],
      ['Kehadiran/Hari', `${attendance.filter(a => a.status === 'Hadir').length}/${attendance.length}`],
      ['Persentase Kehadiran', `${((attendance.filter(a => a.status === 'Hadir').length / attendance.length) * 100).toFixed(1)}%`]
    ];

    this.createReport({
      title: 'Laporan Konsolidasi Siswa',
      studentName: studentInfo.name || studentInfo.nama,
      studentId: studentInfo.id || studentInfo.nis,
      period: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }),
      headers,
      data
    });
  }

  createTimelineReport(events: unknown[], studentName: string, startDate?: string, endDate?: string): void {
    const headers = ['Waktu', 'Jenis', 'Judul', 'Deskripsi'];
    const data = events.map((event: unknown) => {
      const e = event as { timestamp: string; type: string; title: string; description: string };
      return [
        new Date(e.timestamp).toLocaleString('id-ID'),
        e.type,
        e.title,
        e.description
      ];
    });

    let period = '';
    if (startDate && endDate) {
      period = `${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`;
    } else {
      period = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
    }

    this.createReport({
      title: 'Timeline Aktivitas Siswa',
      studentName,
      period,
      headers,
      data,
      summary: {
        'Total Aktivitas': events.length.toString(),
        'Periode': period
      }
    });
  }

  private calculateAverage(values: number[]): number {
    const validValues = values.filter(v => v > 0);
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  }
}

export const pdfExportService = new PDFExportService();
export default PDFExportService;