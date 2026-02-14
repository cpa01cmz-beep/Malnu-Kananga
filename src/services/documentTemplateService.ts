import jsPDF from 'jspdf';
import { 
  DOCUMENT_TEMPLATE_CONFIG, 
  type TemplateContext,
  type CertificateType,
  type LetterType,
  type BatchGenerationOptions
} from '../config/document-template-config';
import { PDF_COLORS } from '../constants';

class DocumentTemplateService {
  private schoolName: string;
  private schoolAddress: string;

  constructor() {
    this.schoolName = DOCUMENT_TEMPLATE_CONFIG.DEFAULT_SCHOOL_NAME;
    this.schoolAddress = DOCUMENT_TEMPLATE_CONFIG.DEFAULT_SCHOOL_ADDRESS;
  }

  generateCertificate(
    context: TemplateContext,
    certificateType: CertificateType = 'completion'
  ): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    this.addCertificateHeader(doc, pageWidth, certificateType);
    this.addCertificateContent(doc, context, pageWidth, pageHeight);
    this.addCertificateFooter(doc, pageWidth, pageHeight, context);
    
    const fileName = `sertifikat-${context.studentName?.toLowerCase().replace(/\s+/g, '-') || 'siswa'}-${Date.now()}.pdf`;
    doc.save(fileName);
  }

  private addCertificateHeader(doc: jsPDF, pageWidth: number, type: CertificateType): void {
    const headerBg = PDF_COLORS.HEADER_BG;
    doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(this.schoolName, pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('SERTIFIKAT', pageWidth / 2, 25, { align: 'center' });
    
    const typeLabels: Record<CertificateType, string> = {
      completion: 'PENYELESAIAN',
      achievement: 'PRESTASI',
      attendance: 'KEHADIRAN',
      excellence: 'KETELADANAN'
    };
    doc.setFontSize(12);
    doc.text(typeLabels[type], pageWidth / 2, 32, { align: 'center' });
  }

  private addCertificateContent(doc: jsPDF, context: TemplateContext, pageWidth: number, _pageHeight: number): void {
    const centerX = pageWidth / 2;
    let yPos = 55;
    
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(12);
    doc.text('Dengan ini memberikan sertifikat kepada:', centerX, yPos, { align: 'center' });
    
    yPos += 15;
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(context.studentName || 'Nama Siswa', centerX, yPos, { align: 'center' });
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    if (context.certificateTitle) {
      doc.text(`Atas Prestasi: ${context.certificateTitle}`, centerX, yPos, { align: 'center' });
      yPos += 8;
    }
    
    if (context.certificateDescription) {
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(context.certificateDescription, pageWidth - 60);
      doc.text(lines, centerX, yPos, { align: 'center' });
      yPos += lines.length * 6;
    }
    
    if (context.className && context.academicYear) {
      yPos += 5;
      doc.setFontSize(12);
      doc.text(`Kelas ${context.className} - Tahun Ajaran ${context.academicYear}`, centerX, yPos, { align: 'center' });
    }
    
    if (context.attendancePercentage) {
      yPos += 10;
      doc.setFontSize(11);
      doc.text(`Dengan persentase kehadiran: ${context.attendancePercentage}%`, centerX, yPos, { align: 'center' });
    }
  }

  private addCertificateFooter(doc: jsPDF, pageWidth: number, pageHeight: number, context: TemplateContext): void {
    const centerX = pageWidth / 2;
    const footerY = pageHeight - 35;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Diberikan pada: ${context.issuedDate || new Date().toLocaleDateString('id-ID')}`, centerX, footerY, { align: 'center' });
    
    const signatureY = footerY + 20;
    doc.line(centerX - 40, signatureY - 5, centerX - 40, signatureY + 15);
    doc.line(centerX + 40, signatureY - 5, centerX + 40, signatureY + 15);
    
    doc.setFontSize(10);
    doc.text('Penyelengara', centerX - 40, signatureY + 20, { align: 'center' });
    doc.text('Kepala Sekolah', centerX + 40, signatureY + 20, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(context.principalName || '....................', centerX + 40, signatureY + 8, { align: 'center' });
  }

  generateReportCard(context: TemplateContext): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    
    this.addReportCardHeader(doc, pageWidth);
    this.addReportCardStudentInfo(doc, context);
    this.addReportCardGrades(doc, context, pageWidth);
    this.addReportCardFooter(doc, pageWidth, context);
    
    const fileName = `raport-${context.studentName?.toLowerCase().replace(/\s+/g, '-') || 'siswa'}-${context.semester || ''}-${context.academicYear || ''}.pdf`;
    doc.save(fileName);
  }

  private addReportCardHeader(doc: jsPDF, pageWidth: number): void {
    const headerBg = PDF_COLORS.HEADER_BG;
    doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(this.schoolName, pageWidth / 2, 12, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('LAPORAN HASIL BELAJAR', pageWidth / 2, 20, { align: 'center' });
  }

  private addReportCardStudentInfo(doc: jsPDF, context: TemplateContext): void {
    doc.setTextColor(0, 0, 0);
    let yPos = 35;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DATA SISWA', 20, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const studentInfo = [
      ['Nama', context.studentName || '-'],
      ['NIS', context.studentId || '-'],
      ['Kelas', context.className || '-'],
      ['Semester', context.semester || '-'],
      ['Tahun Ajaran', context.academicYear || '-'],
    ];
    
    studentInfo.forEach(([label, value]) => {
      doc.text(`${label}:`, 20, yPos);
      doc.text(value, 60, yPos);
      yPos += 6;
    });
    
    yPos += 5;
    doc.setDrawColor(150);
    doc.line(20, yPos, 190, yPos);
  }

  private addReportCardGrades(doc: jsPDF, context: TemplateContext, _pageWidth: number): void {
    let yPos = 75;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('NILAI AKADEMIK', 20, yPos);
    
    yPos += 10;
    
    const tableData = context.grades?.map(grade => [
      grade.subject,
      grade.score.toString(),
      grade.maxScore.toString(),
      ((grade.score / grade.maxScore) * 100).toFixed(1) + '%',
      grade.letterGrade || this.scoreToLetterGrade(grade.score / grade.maxScore * 100)
    ]) || [];
    
    if (tableData.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const headers = ['Mata Pelajaran', 'Nilai', 'Max', 'Persentase', 'Huruf'];
      let xPos = 20;
      headers.forEach(header => {
        doc.text(header, xPos, yPos);
        xPos += 35;
      });
      
      yPos += 3;
      doc.line(20, yPos, 190, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      tableData.forEach(row => {
        xPos = 20;
        row.forEach(cell => {
          doc.text(cell, xPos, yPos);
          xPos += 35;
        });
        yPos += 6;
      });
    }
    
    yPos += 10;
    if (context.averageScore !== undefined) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Rata-rata: ${context.averageScore.toFixed(1)}`, 20, yPos);
    }
    if (context.rank !== undefined) {
      doc.text(`Peringkat: ${context.rank} dari ${context.totalStudents || 0} siswa`, 100, yPos);
    }
  }

  private addReportCardFooter(doc: jsPDF, pageWidth: number, context: TemplateContext): void {
    const pageHeight = doc.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;
    const footerY = pageHeight - 30;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Orang Tua/Wali', 30, footerY, { align: 'center' });
    doc.text('Wali Kelas', centerX, footerY, { align: 'center' });
    doc.text('Kepala Sekolah', pageWidth - 30, footerY, { align: 'center' });
    
    doc.text('....................', 30, footerY + 15, { align: 'center' });
    doc.text('....................', centerX, footerY + 15, { align: 'center' });
    doc.text(context.principalName || '....................', pageWidth - 30, footerY + 15, { align: 'center' });
  }

  private scoreToLetterGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
  }

  generateLetter(context: TemplateContext, letterType: LetterType = 'official'): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    
    this.addLetterHeader(doc, context, pageWidth);
    this.addLetterBody(doc, context, pageWidth);
    this.addLetterFooter(doc, pageWidth);
    
    const fileName = `surat-${letterType}-${Date.now()}.pdf`;
    doc.save(fileName);
  }

  private addLetterHeader(doc: jsPDF, context: TemplateContext, pageWidth: number): void {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(this.schoolName, 20, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(this.schoolAddress, 20, 26);
    
    doc.line(20, 30, 190, 30);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Surat: ${context.letterSubject || 'Resmi'}`, pageWidth / 2, 45, { align: 'center' });
    
    if (context.recipientName) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Kepada Yth.`, 20, 55);
      doc.text(context.recipientName, 20, 61);
      if (context.recipientAddress) {
        doc.text(context.recipientAddress, 20, 67);
      }
    }
  }

  private addLetterBody(doc: jsPDF, context: TemplateContext, pageWidth: number): void {
    const startY = context.recipientName ? 80 : 60;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const bodyText = context.letterBody || 'Dengan ini kami sampaikan surat ini.';
    const lines = doc.splitTextToSize(bodyText, pageWidth - 40);
    
    doc.text(lines, 20, startY);
  }

  private addLetterFooter(doc: jsPDF, _pageWidth: number): void {
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, pageHeight - 40);
    doc.text('Hormat kami,', 20, pageHeight - 25);
    
    doc.setFont('helvetica', 'bold');
    doc.text(this.schoolName, 20, pageHeight - 15);
    
    doc.setFont('helvetica', 'normal');
    doc.text('....................', 20, pageHeight - 5);
  }

  async generateBatch(options: BatchGenerationOptions): Promise<string[]> {
    const { templateId, students, outputFormat, fileNamePrefix, onProgress } = options;
    void outputFormat;
    const results: string[] = [];
    const total = students.length;
    
    for (let i = 0; i < total; i++) {
      const student = students[i];
      
      try {
        const context: TemplateContext = {
          ...student,
          schoolName: this.schoolName,
          schoolAddress: this.schoolAddress,
        };
        
        const fileName = `${fileNamePrefix || 'dokumen'}-${student.studentName?.toLowerCase().replace(/\s+/g, '-') || i}-${Date.now()}.pdf`;
        
        if (templateId.includes('certificate')) {
          this.generateCertificate(context, 'completion');
        } else if (templateId.includes('report_card')) {
          this.generateReportCard(context);
        } else {
          this.generateLetter(context, 'official');
        }
        
        results.push(fileName);
      } catch {
        results.push(`error-${i}.pdf`);
      }
      
      if (onProgress) {
        onProgress(i + 1, total);
      }
      
      if (i < total - 1) {
        await new Promise(resolve => setTimeout(resolve, DOCUMENT_TEMPLATE_CONFIG.BATCH.delayBetweenBatches));
      }
    }
    
    return results;
  }

  generateIDCard(context: TemplateContext): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [54, 86]
    });
    
    doc.setFillColor(66, 135, 245);
    doc.rect(0, 0, 54, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('KARTU SISWA', 27, 10, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(6);
    doc.text(context.studentName || 'Nama', 5, 28);
    doc.text('NIS: ' + (context.studentId || '-'), 5, 33);
    doc.text('Kelas: ' + (context.className || '-'), 5, 38);
    doc.text('Th. ' + (context.academicYear || '-'), 5, 43);
    
    const fileName = `kartu-siswa-${context.studentId || Date.now()}.pdf`;
    doc.save(fileName);
  }
}

export const documentTemplateService = new DocumentTemplateService();
export default documentTemplateService;
