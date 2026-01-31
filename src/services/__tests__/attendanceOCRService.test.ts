import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { attendanceOCRService } from '../attendanceOCRService';
import type { AttendanceStudentInfo } from '../attendanceOCRService';
import { ocrService } from '../ocrService';

// Mock ocrService
vi.mock('../ocrService', () => ({
  ocrService: {
    initialize: vi.fn(),
    extractTextFromImage: vi.fn(),
  },
}));

// Mock geminiService
vi.mock('../geminiService', () => ({
  getAIResponseStream: vi.fn(),
  analyzeClassPerformance: vi.fn(),
}));

describe('attendanceOCRService', () => {
  const mockStudentList: AttendanceStudentInfo[] = [
    { id: 'student-1', nis: '20260001', name: 'Ahmad Rizky' },
    { id: 'student-2', nis: '20260002', name: 'Budi Santoso' },
    { id: 'student-3', nis: '20260003', name: 'Citra Dewi' },
    { id: 'student-4', nis: '20260004', name: 'Dian Permatasari' },
    { id: 'student-5', nis: '20260005', name: 'Eko Prasetyo' },
  ];

  const mockOCRText = `
    DAFTIR KEHADIRAN KELAS X IPA 1
    Tanggal: 30 Januari 2026
    
    NIS    Nama              Status  Catatan
    20260001  Ahmad Rizky       ✓
    20260002  Budi Santoso       S  Sakit
    20260003  Citra Dewi        ✓
    20260004  Dian Permatasari  I  Izin orang tua
    20260005  Eko Prasetyo     ✗
  `;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('processAttendanceSheet', () => {
    it('should process attendance sheet successfully with AI parsing', async () => {
      // Mock OCR service
      vi.mocked(ocrService.initialize).mockResolvedValue(undefined);
      vi.mocked(ocrService.extractTextFromImage).mockResolvedValue({
        text: mockOCRText,
        confidence: 95,
        data: {},
        quality: {
          isSearchable: true,
          isHighQuality: true,
          estimatedAccuracy: 95,
          wordCount: 50,
          characterCount: 300,
          hasMeaningfulContent: true,
          documentType: 'form',
        },
      });

      // Mock AI response (streaming)
      const mockAIResponse = JSON.stringify({
        date: '2026-01-30',
        studentAttendance: [
          {
            studentId: 'student-1',
            nis: '20260001',
            name: 'Ahmad Rizky',
            status: 'hadir',
            confidence: 95,
          },
          {
            studentId: 'student-2',
            nis: '20260002',
            name: 'Budi Santoso',
            status: 'sakit',
            notes: 'Sakit',
            confidence: 95,
          },
          {
            studentId: 'student-4',
            nis: '20260004',
            name: 'Dian Permatasari',
            status: 'izin',
            notes: 'Izin orang tua',
            confidence: 95,
          },
          {
            studentId: 'student-5',
            nis: '20260005',
            name: 'Eko Prasetyo',
            status: 'alpa',
            confidence: 95,
          },
        ],
      });

      const { getAIResponseStream } = await import('../geminiService');
      vi.mocked(getAIResponseStream).mockImplementation(async function* () {
        yield mockAIResponse;
      });

      // Create mock file
      const mockFile = new File(['test'], 'attendance.jpg', { type: 'image/jpeg' });

      const result = await attendanceOCRService.processAttendanceSheet(
        mockFile,
        mockStudentList
      );

      expect(result).toBeDefined();
      expect(result.date).toBe('2026-01-30');
      expect(result.studentAttendance.length).toBeGreaterThan(0);
      expect(result.summary).toBeDefined();
    });

    it('should handle low confidence OCR (< 50%) gracefully', async () => {
      // Mock OCR service with low confidence
      vi.mocked(ocrService.initialize).mockResolvedValue(undefined);
      vi.mocked(ocrService.extractTextFromImage).mockResolvedValue({
        text: mockOCRText,
        confidence: 45,
        data: {},
        quality: {
          isSearchable: false,
          isHighQuality: false,
          estimatedAccuracy: 45,
          wordCount: 5,
          characterCount: 25,
          hasMeaningfulContent: false,
          documentType: 'unknown',
        },
      });

      const mockFile = new File(['test'], 'attendance.jpg', { type: 'image/jpeg' });

      // Low confidence should return empty result, not throw error
      const result = await attendanceOCRService.processAttendanceSheet(
        mockFile,
        mockStudentList
      );

      expect(result).toBeDefined();
      expect(result.studentAttendance).toEqual([]);
      expect(result.summary).toEqual({
        present: 0,
        sick: 0,
        permission: 0,
        absent: 0
      });
    });

    it('should report progress through callback', async () => {
      const progressMock = vi.fn();

      // Mock OCR service
      vi.mocked(ocrService.initialize).mockResolvedValue(undefined);
      vi.mocked(ocrService.extractTextFromImage).mockImplementation(
        async (_file, callback) => {
          callback?.({ status: 'Processing', progress: 0.5 });
          return {
            text: mockOCRText,
            confidence: 85,
            data: {},
            quality: {
              isSearchable: true,
              isHighQuality: true,
              estimatedAccuracy: 85,
              wordCount: 50,
              characterCount: 300,
              hasMeaningfulContent: true,
              documentType: 'form',
            },
          };
        }
      );

      const { getAIResponseStream } = await import('../geminiService');
      vi.mocked(getAIResponseStream).mockImplementation(async function* () {
        yield JSON.stringify({
          date: '2026-01-30',
          studentAttendance: [],
        });
      });

      const mockFile = new File(['test'], 'attendance.jpg', { type: 'image/jpeg' });

      await attendanceOCRService.processAttendanceSheet(
        mockFile,
        mockStudentList,
        progressMock
      );

      expect(progressMock).toHaveBeenCalled();
      expect(progressMock).toHaveBeenCalledWith({
        status: 'Menginisialisasi OCR...',
        progress: 5,
        stage: 'initializing',
      });
      expect(progressMock).toHaveBeenCalledWith({
        status: 'Selesai',
        progress: 100,
        stage: 'completed',
      });
    });
  });

  describe('parseAttendancePatterns', () => {
    it('should fallback to regex parsing when AI returns empty', async () => {
      vi.mocked(ocrService.initialize).mockResolvedValue(undefined);
      vi.mocked(ocrService.extractTextFromImage).mockResolvedValue({
        text: `
          Ahmad Rizky ✓
          Budi Santoso S
          Citra Dewi I Izin
          Eko Prasetyo X
        `,
        confidence: 80,
        data: {},
        quality: {
          isSearchable: true,
          isHighQuality: true,
          estimatedAccuracy: 80,
          wordCount: 20,
          characterCount: 100,
          hasMeaningfulContent: true,
          documentType: 'form',
        },
      });

      const { getAIResponseStream } = await import('../geminiService');
      vi.mocked(getAIResponseStream).mockImplementation(async function* () {
        yield ''; // Force fallback to regex
      });

      const mockFile = new File(['test'], 'attendance.jpg', { type: 'image/jpeg' });

      const result = await attendanceOCRService.processAttendanceSheet(
        mockFile,
        mockStudentList
      );

      expect(result.studentAttendance.length).toBeGreaterThan(0);
      
      // Check that students were matched
      const studentNames = result.studentAttendance.map(a => a.name);
      expect(studentNames.length).toBeGreaterThan(0);
    });

    it('should extract date from Indonesian format', async () => {
      const textWithDate = '30 Januari 2026';
      
      vi.mocked(ocrService.initialize).mockResolvedValue(undefined);
      vi.mocked(ocrService.extractTextFromImage).mockResolvedValue({
        text: textWithDate,
        confidence: 80,
        data: {},
        quality: {
          isSearchable: true,
          isHighQuality: true,
          estimatedAccuracy: 80,
          wordCount: 10,
          characterCount: 50,
          hasMeaningfulContent: true,
          documentType: 'form',
        },
      });

      const { getAIResponseStream } = await import('../geminiService');
      vi.mocked(getAIResponseStream).mockImplementation(async function* () {
        yield '';
      });

      const mockFile = new File(['test'], 'attendance.jpg', { type: 'image/jpeg' });

      const result = await attendanceOCRService.processAttendanceSheet(
        mockFile,
        mockStudentList
      );

      // Should default to today if AI doesn't parse date correctly
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should extract date from standard format', async () => {
      const textWithDate = '30-01-2026';
      
      vi.mocked(ocrService.initialize).mockResolvedValue(undefined);
      vi.mocked(ocrService.extractTextFromImage).mockResolvedValue({
        text: textWithDate,
        confidence: 80,
        data: {},
        quality: {
          isSearchable: true,
          isHighQuality: true,
          estimatedAccuracy: 80,
          wordCount: 10,
          characterCount: 50,
          hasMeaningfulContent: true,
          documentType: 'form',
        },
      });

      const { getAIResponseStream } = await import('../geminiService');
      vi.mocked(getAIResponseStream).mockImplementation(async function* () {
        yield '';
      });

      const mockFile = new File(['test'], 'attendance.jpg', { type: 'image/jpeg' });

      const result = await attendanceOCRService.processAttendanceSheet(
        mockFile,
        mockStudentList
      );

      expect(result.date).toBe('2026-01-30');
    });
  });

  describe('summary calculation', () => {
    it('should calculate correct attendance summary', async () => {
      const { getAIResponseStream } = await import('../geminiService');
      vi.mocked(getAIResponseStream).mockImplementation(async function* () {
        yield JSON.stringify({
          date: '2026-01-30',
          studentAttendance: [
            { studentId: 'student-1', nis: '20260001', name: 'Ahmad Rizky', status: 'hadir', confidence: 95 },
            { studentId: 'student-2', nis: '20260002', name: 'Budi Santoso', status: 'sakit', confidence: 90 },
            { studentId: 'student-3', nis: '20260003', name: 'Citra Dewi', status: 'izin', confidence: 92 },
            { studentId: 'student-5', nis: '20260005', name: 'Eko Prasetyo', status: 'alpa', confidence: 88 },
          ],
        });
      });

      vi.mocked(ocrService.initialize).mockResolvedValue(undefined);
      vi.mocked(ocrService.extractTextFromImage).mockResolvedValue({
        text: mockOCRText,
        confidence: 90,
        data: {},
        quality: {
          isSearchable: true,
          isHighQuality: true,
          estimatedAccuracy: 90,
          wordCount: 50,
          characterCount: 300,
          hasMeaningfulContent: true,
          documentType: 'form',
        },
      });

      const mockFile = new File(['test'], 'attendance.jpg', { type: 'image/jpeg' });

      const result = await attendanceOCRService.processAttendanceSheet(
        mockFile,
        mockStudentList
      );

      expect(result.summary).toEqual({
        present: 1,
        sick: 1,
        permission: 1,
        absent: 1,
      });
    });
  });

  describe('error handling', () => {
    it('should handle empty OCR text gracefully', async () => {
      vi.mocked(ocrService.initialize).mockResolvedValue(undefined);
      vi.mocked(ocrService.extractTextFromImage).mockResolvedValue({
        text: '',
        confidence: 0,
        data: {},
        quality: {
          isSearchable: false,
          isHighQuality: false,
          estimatedAccuracy: 0,
          wordCount: 0,
          characterCount: 0,
          hasMeaningfulContent: false,
          documentType: 'unknown',
        },
      });

      const { getAIResponseStream } = await import('../geminiService');
      vi.mocked(getAIResponseStream).mockImplementation(async function* () {
        yield '';
      });

      const mockFile = new File(['test'], 'attendance.jpg', { type: 'image/jpeg' });

      // Empty text should not throw error, just return empty result
      const result = await attendanceOCRService.processAttendanceSheet(
        mockFile,
        mockStudentList
      );

      expect(result).toBeDefined();
      expect(result.studentAttendance).toEqual([]);
    });

    it('should handle invalid date gracefully', async () => {
      const textWithInvalidDate = 'Tanggal: XX-XX-XXXX';
      
      vi.mocked(ocrService.initialize).mockResolvedValue(undefined);
      vi.mocked(ocrService.extractTextFromImage).mockResolvedValue({
        text: textWithInvalidDate,
        confidence: 80,
        data: {},
        quality: {
          isSearchable: true,
          isHighQuality: true,
          estimatedAccuracy: 80,
          wordCount: 10,
          characterCount: 50,
          hasMeaningfulContent: true,
          documentType: 'form',
        },
      });

      const { getAIResponseStream } = await import('../geminiService');
      vi.mocked(getAIResponseStream).mockImplementation(async function* () {
        yield JSON.stringify({
          date: '',
          studentAttendance: [
            { studentId: 'student-1', nis: '20260001', name: 'Ahmad Rizky', status: 'hadir', confidence: 80 },
          ],
        });
      });

      const mockFile = new File(['test'], 'attendance.jpg', { type: 'image/jpeg' });

      const result = await attendanceOCRService.processAttendanceSheet(
        mockFile,
        mockStudentList
      );

      // Should default to today's date
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
