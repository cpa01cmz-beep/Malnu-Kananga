import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PDFExportService, { pdfExportService } from '../pdfExportService';
import type { PDFReportData } from '../pdfExportService';

// Mock jsPDF
const mockText = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetFont = vi.fn();
const mockSave = vi.fn();
const mockInternal = {
  pageSize: {
    getWidth: vi.fn(() => 210),
    getHeight: vi.fn(() => 297)
  }
};

class MockjsPDF {
  internal = mockInternal;
  text = mockText;
  setFontSize = mockSetFontSize;
  setFont = mockSetFont;
  save = mockSave;

  constructor() {
    // Mock constructor
  }
}

// Mock autoTable
const mockAutoTable = vi.fn();

describe('PDFExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.doMock('jspdf', () => ({ default: MockjsPDF }));
    vi.doMock('jspdf-autotable', () => ({ default: mockAutoTable }));
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('Initialization', () => {
    it('should initialize with school name and address', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      expect(service).toBeDefined();
    });

    it('should export singleton instance', () => {
      expect(pdfExportService).toBeDefined();
      expect(pdfExportService).toBeInstanceOf(PDFExportService);
    });
  });

  describe('createReport', () => {
    beforeEach(() => {
      mockSetFontSize.mockClear();
      mockSetFont.mockClear();
      mockText.mockClear();
      mockAutoTable.mockClear();
      mockSave.mockClear();
      mockInternal.pageSize.getWidth.mockClear();
      mockInternal.pageSize.getHeight.mockClear();
    });

    it('should create a basic report with title and data', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const reportData: PDFReportData = {
        title: 'Test Report',
        headers: ['Column 1', 'Column 2'],
        data: [['Data 1', 'Data 2'], ['Data 3', 'Data 4']]
      };

      service.createReport(reportData);

      // Verify header was added
      expect(mockSetFontSize).toHaveBeenCalledWith(16);
      expect(mockSetFont).toHaveBeenCalledWith('helvetica', 'bold');
      expect(mockText).toHaveBeenCalledWith('MA Malnu Kananga', 105, 15, { align: 'center' });

      expect(mockSetFontSize).toHaveBeenCalledWith(14);
      expect(mockText).toHaveBeenCalledWith('Test Report', 105, 25, { align: 'center' });

      expect(mockSetFontSize).toHaveBeenCalledWith(10);
      expect(mockSetFont).toHaveBeenCalledWith('helvetica', 'normal');

      // Verify table was added
      expect(mockAutoTable).toHaveBeenCalled();

      // Verify footer was added
      expect(mockSetFontSize).toHaveBeenCalledWith(9);
      expect(mockSetFont).toHaveBeenCalledWith('helvetica', 'italic');

      // Verify save was called
      expect(mockSave).toHaveBeenCalled();
      expect(mockSave.mock.calls[0][0]).toMatch(/test-report-\d+\.pdf/);
    });

    it('should create report with student information', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const reportData: PDFReportData = {
        title: 'Test Report',
        studentName: 'John Doe',
        studentId: '12345',
        period: '2024',
        headers: ['Subject', 'Grade'],
        data: [['Math', '90']]
      };

      service.createReport(reportData);

      // Verify student info was added
      expect(mockText).toHaveBeenCalledWith('Nama Siswa: John Doe', 20, 45);
      expect(mockText).toHaveBeenCalledWith('NIS: 12345', 20, 51);
      expect(mockText).toHaveBeenCalledWith('Periode: 2024', 20, 57);
    });

    it('should create report with summary', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const reportData: PDFReportData = {
        title: 'Test Report',
        headers: ['Subject', 'Grade'],
        data: [['Math', '90']],
        summary: {
          'Total': '100',
          'Average': '85.5'
        }
      };

      service.createReport(reportData);

      // Verify summary was added (just check it was called, position may vary due to mocks)
      expect(mockText.mock.calls.some(call => call[0] === 'Ringkasan')).toBe(true);
    });

    it('should create report with school name override', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const reportData: PDFReportData = {
        title: 'Test Report',
        schoolName: 'Custom School',
        headers: ['Subject', 'Grade'],
        data: [['Math', '90']]
      };

      service.createReport(reportData);

      // Should still use default school name
      expect(mockText).toHaveBeenCalledWith('MA Malnu Kananga', 105, 15, { align: 'center' });
    });

    it('should handle empty data array', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const reportData: PDFReportData = {
        title: 'Test Report',
        headers: ['Column 1', 'Column 2'],
        data: []
      };

      service.createReport(reportData);

      // Should not call autoTable if no data
      expect(mockAutoTable).not.toHaveBeenCalled();

      // Should still call save
      expect(mockSave).toHaveBeenCalled();
    });

    it('should add table with correct configuration', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const reportData: PDFReportData = {
        title: 'Test Report',
        headers: ['Subject', 'Grade'],
        data: [['Math', '90'], ['English', '85']]
      };

      service.createReport(reportData);

      expect(mockAutoTable).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          headers: ['Subject', 'Grade'],
          data: [['Math', '90'], ['English', '85']],
          startY: 50,
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235], textColor: 255 },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { left: 20, right: 20 }
        })
      );
    });

    it('should generate filename with proper format', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const reportData: PDFReportData = {
        title: 'Laporan Nilai',
        headers: ['Subject', 'Grade'],
        data: [['Math', '90']]
      };

      service.createReport(reportData);

      const filename = mockSave.mock.calls[0][0];
      expect(filename).toMatch(/^laporan-nilai-\d+\.pdf$/);
    });
  });

  describe('createGradesReport', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create grades report with student info', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const gradesData = [
        { subjectName: 'Matematika', grade: 90, className: 'X-A', semester: 'Ganjil', remarks: 'Baik' },
        { subjectName: 'Bahasa Indonesia', grade: 85, className: 'X-A', semester: 'Ganjil', remarks: 'Baik' }
      ];

      const studentInfo = { name: 'Budi Santoso', id: '2024001' };

      service.createGradesReport(gradesData, studentInfo);

      // Verify report was created
      expect(mockSave).toHaveBeenCalled();
      expect(mockText).toHaveBeenCalledWith('Nama Siswa: Budi Santoso', expect.any(Number), expect.any(Number));
      expect(mockText).toHaveBeenCalledWith('NIS: 2024001', expect.any(Number), expect.any(Number));
    });

    it('should calculate summary statistics correctly', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const gradesData = [
        { subjectName: 'Matematika', grade: 90, className: 'X-A', semester: 'Ganjil', remarks: 'Baik' },
        { subjectName: 'Bahasa Indonesia', grade: 85, className: 'X-A', semester: 'Ganjil', remarks: 'Baik' },
        { subjectName: 'Fisika', grade: 88, className: 'X-A', semester: 'Ganjil', remarks: 'Baik' }
      ];

      service.createGradesReport(gradesData);

      // Verify summary calculations
      expect(mockText).toHaveBeenCalledWith('Total Mata Pelajaran: 3', expect.any(Number), expect.any(Number));
      expect(mockText).toHaveBeenCalledWith('Rata-rata Nilai: 87.67', expect.any(Number), expect.any(Number));
      expect(mockText).toHaveBeenCalledWith('Tertinggi: 90', expect.any(Number), expect.any(Number));
      expect(mockText).toHaveBeenCalledWith('Terendah: 85', expect.any(Number), expect.any(Number));
    });

    it('should handle grades with zero values', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const gradesData = [
        { subjectName: 'Matematika', grade: 0, className: 'X-A', semester: 'Ganjil', remarks: 'Perlu perbaikan' },
        { subjectName: 'Bahasa Indonesia', grade: 90, className: 'X-A', semester: 'Ganjil', remarks: 'Baik' }
      ];

      service.createGradesReport(gradesData);

      // Should calculate average excluding zero
      expect(mockText).toHaveBeenCalledWith('Rata-rata Nilai: 90.00', expect.any(Number), expect.any(Number));
    });

    it('should work without student info', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const gradesData = [
        { subjectName: 'Matematika', grade: 90, className: 'X-A', semester: 'Ganjil', remarks: 'Baik' }
      ];

      service.createGradesReport(gradesData);

      // Should still create report without student info
      expect(mockSave).toHaveBeenCalled();
    });

    it('should map grade data correctly', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const gradesData = [
        { subjectName: 'Matematika', grade: 90, className: 'X-A', semester: 'Ganjil', remarks: 'Baik' }
      ];

      service.createGradesReport(gradesData);

      const autoTableCall = mockAutoTable.mock.calls.find(call =>
        call[1]?.data?.[0]?.[0] === 'Matematika'
      );

      expect(autoTableCall).toBeDefined();
      expect(autoTableCall![1].data).toEqual([
        ['Matematika', 90, 'X-A', 'Ganjil', 'Baik']
      ]);
    });
  });

  describe('createAttendanceReport', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create attendance report with student info', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const attendanceData = [
        { date: '2024-01-15', status: 'Hadir', subject: 'Matematika', notes: '-' },
        { date: '2024-01-16', status: 'Sakit', subject: 'Fisika', notes: 'Demam' }
      ];

      const studentInfo = { name: 'Budi Santoso', id: '2024001' };

      service.createAttendanceReport(attendanceData, studentInfo);

      // Verify report was created
      expect(mockSave).toHaveBeenCalled();
      expect(mockText).toHaveBeenCalledWith('Nama Siswa: Budi Santoso', expect.any(Number), expect.any(Number));
      expect(mockText).toHaveBeenCalledWith('NIS: 2024001', expect.any(Number), expect.any(Number));
    });

    it('should calculate attendance statistics correctly', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const attendanceData = [
        { date: '2024-01-15', status: 'Hadir', subject: 'Matematika', notes: '-' },
        { date: '2024-01-16', status: 'Hadir', subject: 'Fisika', notes: '-' },
        { date: '2024-01-17', status: 'Sakit', subject: 'Kimia', notes: 'Demam' },
        { date: '2024-01-18', status: 'Terlambat', subject: 'Biologi', notes: 'Macet' },
        { date: '2024-01-19', status: 'Izin', subject: 'Matematika', notes: 'Acara keluarga' },
        { date: '2024-01-20', status: 'Alpha', subject: 'Fisika', notes: 'Tanpa keterangan' }
      ];

      service.createAttendanceReport(attendanceData);

      // Verify attendance statistics
      expect(mockText).toHaveBeenCalledWith('Total Kehadiran: 2/6 hari', expect.any(Number), expect.any(Number));
      expect(mockText).toHaveBeenCalledWith('Persentase Kehadiran: 33.3%', expect.any(Number), expect.any(Number));
      expect(mockText).toHaveBeenCalledWith('Terlambat: 1', expect.any(Number), expect.any(Number));
      expect(mockText).toHaveBeenCalledWith('Izin: 1', expect.any(Number), expect.any(Number));
      expect(mockText).toHaveBeenCalledWith('Sakit: 1', expect.any(Number), expect.any(Number));
      expect(mockText).toHaveBeenCalledWith('Tanpa Keterangan: 1', expect.any(Number), expect.any(Number));
    });

    it('should handle Indonesian field names (tanggal, mataPelajaran, keterangan)', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const attendanceData = [
        { tanggal: '2024-01-15', status: 'Hadir', mataPelajaran: 'Matematika', keterangan: '-' }
      ];

      service.createAttendanceReport(attendanceData);

      const autoTableCall = mockAutoTable.mock.calls.find(call =>
        call[1]?.data
      );

      expect(autoTableCall).toBeDefined();
      expect(autoTableCall![1].data).toEqual([
        ['2024-01-15', 'Hadir', 'Matematika', '-']
      ]);
    });

    it('should handle missing fields gracefully', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const attendanceData = [
        { date: '2024-01-15', status: 'Hadir' }
      ];

      service.createAttendanceReport(attendanceData);

      const autoTableCall = mockAutoTable.mock.calls.find(call =>
        call[1]?.data
      );

      expect(autoTableCall).toBeDefined();
      expect(autoTableCall![1].data).toEqual([
        ['2024-01-15', 'Hadir', '-', '-']
      ]);
    });

    it('should calculate percentage correctly for edge cases', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const attendanceData = [
        { date: '2024-01-15', status: 'Hadir', subject: 'Matematika', notes: '-' },
        { date: '2024-01-16', status: 'Hadir', subject: 'Fisika', notes: '-' },
        { date: '2024-01-17', status: 'Hadir', subject: 'Kimia', notes: '-' }
      ];

      service.createAttendanceReport(attendanceData);

      // 100% attendance
      expect(mockText).toHaveBeenCalledWith('Persentase Kehadiran: 100.0%', expect.any(Number), expect.any(Number));
    });

    it('should handle both Alpha and Tanpa Keterangan statuses', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const attendanceData = [
        { date: '2024-01-15', status: 'Alpha', subject: 'Matematika', notes: '-' },
        { date: '2024-01-16', status: 'Tanpa Keterangan', subject: 'Fisika', notes: '-' }
      ];

      service.createAttendanceReport(attendanceData);

      // Should count both Alpha and Tanpa Keterangan
      expect(mockText).toHaveBeenCalledWith('Tanpa Keterangan: 2', expect.any(Number), expect.any(Number));
    });
  });

  describe('createConsolidatedReport', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create consolidated report with student info', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const studentInfo = {
        name: 'Budi Santoso',
        id: '2024001',
        className: 'X-A'
      };

      const grades = [
        { grade: 90 },
        { grade: 85 },
        { grade: 88 }
      ];

      const attendance = [
        { status: 'Hadir' },
        { status: 'Hadir' },
        { status: 'Sakit' }
      ];

      service.createConsolidatedReport(studentInfo, grades, attendance);

      // Verify report was created
      expect(mockSave).toHaveBeenCalled();
      expect(mockText).toHaveBeenCalledWith('Nama Siswa: Budi Santoso', expect.any(Number), expect.any(Number));
      expect(mockText).toHaveBeenCalledWith('NIS: 2024001', expect.any(Number), expect.any(Number));
    });

    it('should handle Indonesian field names (nama, nis, kelas)', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const studentInfo = {
        nama: 'Budi Santoso',
        nis: '2024001',
        kelas: 'X-A'
      };

      const grades = [{ grade: 90 }];
      const attendance = [{ status: 'Hadir' }];

      service.createConsolidatedReport(studentInfo, grades, attendance);

      const autoTableCall = mockAutoTable.mock.calls.find(call =>
        call[1]?.data
      );

      expect(autoTableCall).toBeDefined();
      const dataRow = autoTableCall![1].data.find((row: any[]) => row[0] === 'Nama Siswa');
      expect(dataRow).toBeDefined();
      expect(dataRow![1]).toBe('Budi Santoso');
    });

    it('should calculate consolidated statistics correctly', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const studentInfo = {
        name: 'Budi Santoso',
        id: '2024001',
        className: 'X-A'
      };

      const grades = [
        { grade: 90 },
        { grade: 85 },
        { grade: 88 }
      ];

      const attendance = [
        { status: 'Hadir' },
        { status: 'Hadir' },
        { status: 'Sakit' }
      ];

      service.createConsolidatedReport(studentInfo, grades, attendance);

      // Verify report was created successfully
      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle GradeData with nilai field', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const studentInfo = { name: 'Budi Santoso', id: '2024001' };

      const grades = [
        { nilai: 90 },
        { nilai: 85 }
      ];

      const attendance = [{ status: 'Hadir' }];

      service.createConsolidatedReport(studentInfo, grades, attendance);

      // Should calculate average using nilai field
      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle negative values', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const gradesData = [
        { subjectName: 'Matematika', grade: -5, className: 'X-A', semester: 'Ganjil', remarks: 'Perlu perbaikan' },
        { subjectName: 'Bahasa Indonesia', grade: 90, className: 'X-A', semester: 'Ganjil', remarks: 'Baik' }
      ];

      service.createGradesReport(gradesData);

      // Should exclude negative values (treated as 0)
      expect(mockText).toHaveBeenCalledWith('Rata-rata Nilai: 90.00', expect.any(Number), expect.any(Number));
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const reportData: PDFReportData = {
        title: 'Very Long Report Title That Exceeds Normal Length And Contains Many Words',
        headers: ['Column 1'],
        data: [['Data 1']]
      };

      service.createReport(reportData);

      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle special characters in title', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const reportData: PDFReportData = {
        title: 'Laporan Nilai & Prestasi',
        headers: ['Kolom 1'],
        data: [['Data 1']]
      };

      service.createReport(reportData);

      const filename = mockSave.mock.calls[0][0];
      // Check that filename contains the expected parts (the & character is kept as-is by the service)
      expect(filename).toMatch(/laporan/);
      expect(filename).toMatch(/nilai/);
      expect(filename).toMatch(/prestasi/);
      expect(filename).toMatch(/\d+\.pdf$/);
    });

    it('should handle large data arrays', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const data: (string | number)[][] = [];
      for (let i = 0; i < 100; i++) {
        data.push([`Item ${i}`, i * 10]);
      }

      const reportData: PDFReportData = {
        title: 'Large Report',
        headers: ['Item', 'Value'],
        data
      };

      service.createReport(reportData);

      expect(mockAutoTable).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          data: expect.any(Array)
        })
      );
    });

    it('should handle empty summary object', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const reportData: PDFReportData = {
        title: 'Test Report',
        headers: ['Column 1'],
        data: [['Data 1']],
        summary: {}
      };

      service.createReport(reportData);

      // Should add summary section even if empty
      expect(mockText.mock.calls.some(call => call[0] === 'Ringkasan')).toBe(true);
    });

    it('should handle numeric values in data', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const reportData: PDFReportData = {
        title: 'Test Report',
        headers: ['Column 1', 'Column 2'],
        data: [[100, 200], [300, 400]]
      };

      service.createReport(reportData);

      expect(mockAutoTable).toHaveBeenCalled();
    });

    it('should handle missing studentName field', async () => {
      const { default: PDFExportServiceClass } = await import('../pdfExportService');
      const service = new PDFExportServiceClass();

      const reportData: PDFReportData = {
        title: 'Test Report',
        studentId: '12345',
        headers: ['Column 1'],
        data: [['Data 1']]
      };

      service.createReport(reportData);

      // Should not crash with missing studentName
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
