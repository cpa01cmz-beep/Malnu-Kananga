import { ocrService, OCRExtractionResult, OCRProgress } from './ocrService';
import { logger } from '../utils/logger';
import { OCR_CONFIG, DATE_LOCALE } from '../constants';

export interface AttendanceStudentInfo {
  id: string;
  nis: string;
  name: string;
  className?: string;
}

export interface AttendanceSheetData {
  date: string;
  studentAttendance: {
    studentId: string;
    nis: string;
    name: string;
    status: 'hadir' | 'sakit' | 'izin' | 'alpa';
    notes?: string;
    confidence: number;
  }[];
  summary?: {
    present: number;
    sick: number;
    permission: number;
    absent: number;
  };
}

export interface AttendanceOCRProgress extends OCRProgress {
  stage: 'initializing' | 'extracting' | 'parsing' | 'analyzing' | 'completed';
}

type ProgressCallback = (progress: AttendanceOCRProgress) => void;

export interface AttendanceSheetValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidence: number;
}

class AttendanceOCRService {
  /**
   * Process attendance sheet image and extract attendance data
   */
  async processAttendanceSheet(
    imageFile: File,
    classStudents: AttendanceStudentInfo[],
    progressCallback?: ProgressCallback
  ): Promise<AttendanceSheetData> {
    try {
      // Stage 1: Initialize OCR
      if (progressCallback) {
        progressCallback({
          status: 'Menginisialisasi OCR...',
          progress: 5,
          stage: 'initializing'
        });
      }

      await ocrService.initialize();

      // Stage 2: Extract text from image
      if (progressCallback) {
        progressCallback({
          status: 'Mengekstrak teks dari gambar...',
          progress: 10,
          stage: 'extracting'
        });
      }

      const ocrResult: OCRExtractionResult = await ocrService.extractTextFromImage(
        imageFile,
        (progress) => {
          if (progressCallback) {
            progressCallback({
              status: progress.status,
              progress: 10 + (progress.progress * 0.4),
              stage: 'extracting'
            });
          }
        }
      );

      // Check OCR confidence - handle low confidence gracefully
      if (ocrResult.confidence < 50 || ocrResult.text.trim() === '') {
        logger.warn(`OCR confidence rendah atau teks kosong (${ocrResult.confidence}%), mengembalikan hasil kosong`);
        return {
          date: new Date().toISOString().split('T')[0],
          studentAttendance: [],
          summary: {
            present: 0,
            sick: 0,
            permission: 0,
            absent: 0
          }
        };
      }

      // Stage 3: Parse attendance patterns
      if (progressCallback) {
        progressCallback({
          status: 'Menganalisis pola kehadiran...',
          progress: 50,
          stage: 'parsing'
        });
      }

      const parsedData = await this.parseAttendancePatterns(ocrResult.text, classStudents);

      // Stage 4: Validate and analyze
      if (progressCallback) {
        progressCallback({
          status: 'Memvalidasi dan menganalisis...',
          progress: 80,
          stage: 'analyzing'
        });
      }

      const validation = this.validateAttendanceSheet(parsedData, classStudents);
      
      if (!validation.isValid) {
        logger.warn('Attendance sheet validation warnings:', validation.warnings);
      }

      // Calculate summary
      const summary = this.calculateAttendanceSummary(parsedData.studentAttendance as Array<AttendanceSheetData['studentAttendance'][0]>);

      if (progressCallback) {
        progressCallback({
          status: 'Selesai',
          progress: 100,
          stage: 'completed'
        });
      }

      return {
        date: parsedData.date,
        studentAttendance: parsedData.studentAttendance,
        summary
      };
    } catch (error) {
      logger.error('Error processing attendance sheet:', error);
      throw error;
    }
  }

  /**
   * Parse attendance patterns from OCR text using AI
   */
  private async parseAttendancePatterns(
    ocrText: string,
    classStudents: AttendanceStudentInfo[]
  ): Promise<AttendanceSheetData> {
    try {
      // Try AI-based parsing first (Gemini)
      const aiResult = await this.parseWithAI(ocrText, classStudents);
      
      if (aiResult && aiResult.studentAttendance.length > 0) {
        return aiResult;
      }

      // Fallback to regex-based parsing
      logger.info('AI parsing failed or returned no results, falling back to regex parsing');
      return this.parseWithRegex(ocrText, classStudents);
    } catch (error) {
      logger.error('Error parsing attendance patterns:', error);
      // Fallback to regex parsing on error
      return this.parseWithRegex(ocrText, classStudents);
    }
  }

  /**
   * Use AI (Gemini) to extract attendance data
   */
  private async parseWithAI(
    ocrText: string,
    classStudents: AttendanceStudentInfo[]
  ): Promise<AttendanceSheetData | null> {
    try {
      // Create student list for matching
      const studentList = classStudents.map(s => ({
        id: s.id,
        nis: s.nis,
        name: s.name
      }));

      const prompt = `
        Kamu adalah asisten guru yang membantu memproses daftar kehadiran.
        
        Ekstrak data kehadiran dari teks berikut. Format output JSON:
        {
          "date": "YYYY-MM-DD",
          "studentAttendance": [
            {
              "studentId": "ID siswa (cocokkan dengan daftar siswa)",
              "nis": "NIS siswa",
              "name": "Nama siswa",
              "status": "hadir|sakit|izin|alpa",
              "notes": "Catatan (jika ada)",
              "confidence": 0-100
            }
          ]
        }

        Daftar Siswa (cocokkan nama/NIS):
        ${studentList.map(s => `- ${s.nis} - ${s.name}`).join('\n')}

        Pola kehadiran yang mungkin:
        - Hadir: ✓, √, ✔, "Hadir", "H", "P", "Present"
        - Sakit: "Sakit", "S", "Sick"
        - Izin: "Izin", "I", "Permission"
        - Alpa: "Alpa", "A", "Absent", "✗", "✖", "X"

        Teks OCR:
        ${ocrText}

        Hanya return JSON, tidak ada penjelasan. Pastikan semua data terisi.
      `;

      // Use gemini service via a simple streaming approach
      let aiResponseText = '';
      
      // Use getAIResponseStream to get AI response
      const responseGenerator = (await import('./geminiService')).getAIResponseStream(prompt, []);
      
      for await (const chunk of responseGenerator) {
        aiResponseText += chunk;
      }

      if (!aiResponseText) {
        return null;
      }

      // Parse JSON from AI response
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsedData = JSON.parse(jsonMatch[0]) as AttendanceSheetData;

      // Validate and enhance parsed data
      if (!parsedData.date) {
        parsedData.date = this.extractDateFromText(ocrText);
      }

      // Match students and add confidence
      parsedData.studentAttendance = parsedData.studentAttendance.map(att => {
        const matchedStudent = this.findMatchingStudent(att, classStudents);
        return {
          ...att,
          studentId: matchedStudent?.id || att.studentId,
          confidence: this.calculateConfidence(att, matchedStudent)
        };
      }).filter(att => att.studentId); // Remove unmatched entries

      return parsedData;
    } catch (error) {
      logger.error('AI parsing error:', error);
      return null;
    }
  }

  /**
   * Fallback regex-based parsing for attendance data
   */
  private parseWithRegex(
    ocrText: string,
    classStudents: AttendanceStudentInfo[]
  ): AttendanceSheetData {
    const date = this.extractDateFromText(ocrText);
    const studentAttendance: AttendanceSheetData['studentAttendance'] = [];

    const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Pattern: Name followed by status indicator
    for (const line of lines) {
      const att = this.parseAttendanceLine(line, classStudents);
      if (att) {
        studentAttendance.push(att);
      }
    }

    return {
      date,
      studentAttendance
    };
  }

  /**
   * Parse single line of attendance data
   */
  private parseAttendanceLine(
    line: string,
    classStudents: AttendanceStudentInfo[]
  ): AttendanceSheetData['studentAttendance'][0] | null {
    // Skip header lines
    if (/no|nama|siswa|hadir|sakit|izin|alpa|status/i.test(line)) {
      return null;
    }

    // Try to find student name
    const student = classStudents.find(s => 
      line.toLowerCase().includes(s.name.toLowerCase()) ||
      line.includes(s.nis)
    );

    if (!student) {
      return null;
    }

    // Extract status
    const status = this.extractStatus(line);

    return {
      studentId: student.id,
      nis: student.nis,
      name: student.name,
      status,
      confidence: 70 // Default confidence for regex parsing
    };
  }

  /**
   * Extract attendance status from text
   */
  private extractStatus(text: string): 'hadir' | 'sakit' | 'izin' | 'alpa' {
    const t = text.toLowerCase();

    // Check for present indicators
    if (/✓|√|✔|hadir|present|p|v|\/\//i.test(t)) {
      return 'hadir';
    }

    // Check for sick indicators
    if (/sakit|s|sick|🏥/i.test(t)) {
      return 'sakit';
    }

    // Check for permission indicators
    if (/izin|i|permission|📝/i.test(t)) {
      return 'izin';
    }

    // Check for absent indicators
    if (/alpa|a|absent|✗|✖|x|–|—/i.test(t)) {
      return 'alpa';
    }

    // Default to absent if no status found
    return 'alpa';
  }

  /**
   * Extract date from OCR text
   */
  private extractDateFromText(text: string): string {
    // Use centralized month mapping - Flexy: Never hardcode locale data!
    const indonesianMonths: Record<string, string> = { ...DATE_LOCALE.INDONESIAN_MONTHS_MAP };

    // Try common date formats
    const datePatterns = [
      /(\d{1,2})[-/](\d{1,2})[-/](\d{4})/, // DD-MM-YYYY or DD/MM/YYYY
      /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/, // YYYY-MM-DD
      /(\d{1,2})\s*(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*(\d{4})/i, // DD Month YYYY
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        // Parse date based on pattern
        if (match.length === 4) {
          const [_, part1, part2, part3] = match;
          
          // Check if part2 is an Indonesian month name
          const monthLower = part2.toLowerCase();
          if (indonesianMonths[monthLower]) {
            // Format: DD Month YYYY (e.g., "30 Januari 2026")
            return `${part3}-${indonesianMonths[monthLower]}-${part1.padStart(2, '0')}`;
          } else if (part3.length === 4) {
            // Format: DD-MM-YYYY or DD/MM/YYYY
            return `${part3}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`;
          } else {
            // Format: YYYY-MM-DD
            return `${part1}-${part2.padStart(2, '0')}-${part3.padStart(2, '0')}`;
          }
        }
      }
    }

    // Default to today if no date found
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Find matching student from class roster
   */
  private findMatchingStudent(
    att: AttendanceSheetData['studentAttendance'][0],
    classStudents: AttendanceStudentInfo[]
  ): AttendanceStudentInfo | undefined {
    // First try exact NIS match
    if (att.nis) {
      const byNis = classStudents.find(s => s.nis === att.nis);
      if (byNis) return byNis;
    }

    // Then try name matching
    if (att.name) {
      const exactName = classStudents.find(s => s.name.toLowerCase() === att.name.toLowerCase());
      if (exactName) return exactName;

      // Try partial name match
      const partialName = classStudents.find(s => 
        s.name.toLowerCase().includes(att.name.toLowerCase()) ||
        att.name.toLowerCase().includes(s.name.toLowerCase())
      );
      if (partialName) return partialName;
    }

    return undefined;
  }

  /**
   * Calculate confidence score for extracted attendance
   */
  private calculateConfidence(
    att: AttendanceSheetData['studentAttendance'][0],
    matchedStudent: AttendanceStudentInfo | undefined
  ): number {
    let confidence = att.confidence || 70;

    // Boost confidence if NIS matched exactly
    if (matchedStudent && att.nis === matchedStudent.nis) {
      confidence += 15;
    }

    // Boost confidence if name matched exactly
    if (matchedStudent && att.name.toLowerCase() === matchedStudent.name.toLowerCase()) {
      confidence += 15;
    }

    // Reduce confidence for partial name match
    if (matchedStudent && 
        !att.name.toLowerCase().includes(matchedStudent.name.toLowerCase()) &&
        !matchedStudent.name.toLowerCase().includes(att.name.toLowerCase())) {
      confidence -= 20;
    }

    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * Validate attendance sheet data
   */
  private validateAttendanceSheet(
    data: AttendanceSheetData,
    classStudents: AttendanceStudentInfo[]
  ): AttendanceSheetValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if date is valid
    if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      errors.push('Tanggal tidak valid');
    }

    // Check if student data exists
    if (data.studentAttendance.length === 0) {
      errors.push('Tidak ada data siswa yang terdeteksi');
    }

    // Check for unmatched students
    const matchedStudentIds = new Set(data.studentAttendance.map(a => a.studentId));
    const unmatchedStudents = classStudents.filter(s => !matchedStudentIds.has(s.id));
    
    if (unmatchedStudents.length > 0) {
      warnings.push(`${unmatchedStudents.length} siswa tidak terdeteksi dalam daftar kehadiran`);
    }

    // Check confidence
    const avgConfidence = data.studentAttendance.length > 0
      ? data.studentAttendance.reduce((sum, att) => sum + att.confidence, 0) / data.studentAttendance.length
      : 0;
    
    if (avgConfidence < OCR_CONFIG.ATTENDANCE_CONFIDENCE_THRESHOLD) {
      warnings.push(`Rata-rata confidence rendah (< ${OCR_CONFIG.ATTENDANCE_CONFIDENCE_THRESHOLD}%), perlu verifikasi manual`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidence: avgConfidence
    };
  }

  /**
   * Calculate attendance summary
   */
  private calculateAttendanceSummary(
    studentAttendance: Array<AttendanceSheetData['studentAttendance'][0]>
  ): AttendanceSheetData['summary'] {
    return {
      present: studentAttendance.filter(a => a.status === 'hadir').length,
      sick: studentAttendance.filter(a => a.status === 'sakit').length,
      permission: studentAttendance.filter(a => a.status === 'izin').length,
      absent: studentAttendance.filter(a => a.status === 'alpa').length
    };
  }
}

export const attendanceOCRService = new AttendanceOCRService();
