import { createWorker, PSM, Worker } from 'tesseract.js';

export interface OCRExtractionResult {
  text: string;
  confidence: number;
  data: {
    grades?: Record<string, number>;
    fullName?: string;
    nisn?: string;
    schoolName?: string;
  };
}

export interface OCRProgress {
  status: string;
  progress: number;
}

type ProgressCallback = (progress: OCRProgress) => void;




class OCRService {
  private worker: Worker | null = null;
  private isInitialized = false;

  async initialize(progressCallback?: ProgressCallback): Promise<void> {
    if (this.isInitialized && this.worker) {
      return;
    }

    try {
      this.worker = await createWorker('ind', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text' && progressCallback) {
            progressCallback({
              status: 'Processing',
              progress: m.progress * 100
            });
          } else if (progressCallback) {
            progressCallback({
              status: this.formatStatus(m.status),
              progress: m.progress * 100
            });
          }
        }
      }) as Worker;

      await this.worker!.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
      });

      this.isInitialized = true;
    } catch {
      throw new Error('Gagal menginisialisasi OCR service');
    }
  }

  async extractTextFromImage(
    imageFile: File,
    progressCallback?: ProgressCallback
  ): Promise<OCRExtractionResult> {
    if (!this.worker || !this.isInitialized) {
      await this.initialize(progressCallback);
    }

    try {
      const result = await this.worker!.recognize(imageFile);

      const extractedData = this.parseExtractedText(result.data.text);

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        data: extractedData
      };
    } catch {
      throw new Error('Gagal mengekstrak teks dari gambar');
    }
  }

  private parseExtractedText(text: string): OCRExtractionResult['data'] {
    const data: OCRExtractionResult['data'] = {};

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    for (const line of lines) {
      if (!data.fullName && this.looksLikeName(line)) {
        data.fullName = line;
      } else if (!data.nisn && this.looksLikeNISN(line)) {
        data.nisn = this.extractNISN(line);
      } else if (!data.schoolName && this.looksLikeSchoolName(line)) {
        data.schoolName = line;
      }
    }

    const grades = this.extractGrades(text);
    if (Object.keys(grades).length > 0) {
      data.grades = grades;
    }

    return data;
  }

  private extractGrades(text: string): Record<string, number> {
    const grades: Record<string, number> = {};

    const gradePattern = /([A-Za-z\s]+)[\s:]*([0-9]+(?:,[0-9]{3})?|[0-9]{1,3}(?:,[0-9]{3})?)/g;
    const matches = text.matchAll(gradePattern);

    for (const match of matches) {
      const subjectName = match[1].trim();
      const gradeValue = match[2].replace(',', '');

      if (this.isValidSubject(subjectName) && this.isValidGrade(gradeValue)) {
        grades[subjectName] = parseInt(gradeValue, 10);
      }
    }

    return grades;
  }

  private looksLikeName(text: string): boolean {
    const words = text.split(' ');
    return words.length >= 2 && words.length <= 4 && words.every(word => /^[A-Z][a-z]+$/.test(word));
  }

  private looksLikeNISN(text: string): boolean {
    const nisnPattern = /(?:NISN\s*[:\s]*)?(\d{10})/;
    return nisnPattern.test(text);
  }

  private extractNISN(text: string): string {
    const match = text.match(/(?:NISN\s*[:\s]*)?(\d{10})/);
    return match ? match[1] : text;
  }

  private looksLikeSchoolName(text: string): boolean {
    const schoolKeywords = ['SMP', 'MTs', 'SD', 'MI', 'SMA', 'MA', 'SMK'];
    return schoolKeywords.some(keyword => text.toUpperCase().includes(keyword));
  }

  private isValidSubject(subject: string): boolean {
    const validSubjects = [
      'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS',
      'Fisika', 'Kimia', 'Biologi', 'Sejarah', 'Geografi',
      'Sosiologi', 'Ekonomi', 'PKN', 'Agama', 'Seni Budaya',
      'Penjaskes', 'TIK', 'Bahasa Arab', 'Fiqih', 'Aqidah Akhlak',
      'Bahasa Jawa', 'Muatan Lokal'
    ];

    const normalizedSubject = subject.toLowerCase();
    return validSubjects.some(s => s.toLowerCase().includes(normalizedSubject) || normalizedSubject.includes(s.toLowerCase()));
  }

  private isValidGrade(grade: string): boolean {
    const numericGrade = parseInt(grade, 10);
    return !isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 100;
  }

  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'loading tesseract core': 'Memuat engine OCR...',
      'initializing tesseract': 'Inisialisasi...',
      'initialized tesseract': 'Engine siap',
      'loading language traineddata': 'Memuat data bahasa...',
      'initializing api': 'Menyiapkan API...',
      'recognizing text': 'Mengenali teks...'
    };

    return statusMap[status] || status;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

export const ocrService = new OCRService();
