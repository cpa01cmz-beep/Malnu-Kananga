import { createWorker, PSM, Worker } from 'tesseract.js';
import { OCRValidationEvent, UserRole } from '../types';
import { STORAGE_KEYS, OCR_SERVICE_CONFIG, GRADE_LIMITS, ACADEMIC_SUBJECTS, OCR_SCHOOL_KEYWORDS, OCR_SERVICE_CONFIG_EXTRA, HASH_CONFIG } from '../constants';
import { generateValidationId } from '../utils/idGenerator';
import { logger } from '../utils/logger';
import { handleOCRError } from '../utils/serviceErrorHandlers';
import { ocrCache } from './aiCacheService';

export interface OCRExtractionResult {
  text: string;
  confidence: number;
  data: {
    grades?: Record<string, number>;
    fullName?: string;
    nisn?: string;
    schoolName?: string;
  };
  quality: OCRTextQuality;
}

export interface OCRTextQuality {
  isSearchable: boolean;
  isHighQuality: boolean;
  estimatedAccuracy: number;
  wordCount: number;
  characterCount: number;
  hasMeaningfulContent: boolean;
  documentType: 'unknown' | 'academic' | 'administrative' | 'form' | 'certificate';
}

export interface OCRProgress {
  status: string;
  progress: number;
}

type ProgressCallback = (progress: OCRProgress) => void;

interface CacheKeyInfo {
  fileHash: string;
  metadata: string;
}




class OCRService {
  private worker: Worker | null = null;
  private isInitialized = false;

  async initialize(progressCallback?: ProgressCallback): Promise<void> {
    if (this.isInitialized && this.worker) {
      return;
    }

    try {
      this.worker = await createWorker(OCR_SERVICE_CONFIG_EXTRA.LANGUAGE, OCR_SERVICE_CONFIG_EXTRA.WORKER_COUNT, {
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
    } catch (error) {
      throw handleOCRError(error, 'initialize');
    }
  }

  async extractTextFromImage(
    imageFile: File,
    progressCallback?: ProgressCallback,
    documentMetadata?: {
      documentId?: string;
      userId?: string;
      userRole?: UserRole;
      documentType?: string;
      actionUrl?: string;
    }
  ): Promise<OCRExtractionResult> {
    // Check cache first using file hash and metadata
    const cacheKey = await this.generateCacheKey(imageFile, documentMetadata);
    
    const cachedResult = ocrCache.get<OCRExtractionResult>({
      operation: 'extractTextFromImage',
      input: cacheKey.fileHash,
      context: cacheKey.metadata
    });
    
    if (cachedResult) {
      logger.debug('Returning cached OCR result for file:', imageFile.name);
      
      // Emit validation event for cached result if needed
      const { issues, severity } = this.detectValidationIssues(cachedResult.quality, cachedResult.confidence);
      if (issues.length > 0 && documentMetadata) {
        this.emitOCRValidationEvent(
          severity === 'failure' ? 'validation-failure' : 
          severity === 'warning' ? 'validation-warning' : 'validation-success',
          documentMetadata.documentId || `doc-${Date.now()}`,
          documentMetadata.documentType || cachedResult.quality.documentType,
          cachedResult.confidence,
          issues,
          documentMetadata.userId,
          documentMetadata.userRole,
          documentMetadata.actionUrl
        );
      }
      
      return cachedResult;
    }

    if (!this.worker || !this.isInitialized) {
      await this.initialize(progressCallback);
    }

    try {
      const result = await this.worker!.recognize(imageFile);

      const extractedData = this.parseExtractedText(result.data.text);
      const quality = this.assessTextQuality(result.data.text, result.data.confidence);

      const ocrResult: OCRExtractionResult = {
        text: result.data.text,
        confidence: result.data.confidence,
        data: extractedData,
        quality
      };

      // Cache the result
      ocrCache.set({
        operation: 'extractTextFromImage',
        input: cacheKey.fileHash,
        context: cacheKey.metadata
      }, ocrResult);

      // Detect validation issues and emit event
      const { issues, severity } = this.detectValidationIssues(quality, result.data.confidence);
      
      if (issues.length > 0) {
        this.emitOCRValidationEvent(
          severity === 'failure' ? 'validation-failure' : 
          severity === 'warning' ? 'validation-warning' : 'validation-success',
          documentMetadata?.documentId || `doc-${Date.now()}`,
          documentMetadata?.documentType || quality.documentType,
          result.data.confidence,
          issues,
          documentMetadata?.userId,
          documentMetadata?.userRole,
          documentMetadata?.actionUrl
        );
      }

      return ocrResult;
    } catch (error) {
      throw handleOCRError(error, 'extractTextFromImage');
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

    Array.from(matches).forEach(match => {
      const subjectName = match[1].trim();
      const gradeValue = match[2].replace(',', '');

      if (this.isValidSubject(subjectName) && this.isValidGrade(gradeValue)) {
        grades[subjectName] = parseInt(gradeValue, 10);
      }
    });

    return grades;
  }

  private looksLikeName(text: string): boolean {
    const words = text.split(' ');
    // Flexy: Uses OCR_SERVICE_CONFIG_EXTRA.NAME_WORD_MIN/MAX constants
    return words.length >= OCR_SERVICE_CONFIG_EXTRA.NAME_WORD_MIN && words.length <= OCR_SERVICE_CONFIG_EXTRA.NAME_WORD_MAX && words.every(word => /^[A-Z][a-z]+$/.test(word));
  }

  private looksLikeNISN(text: string): boolean {
    // Flexy: Uses OCR_SERVICE_CONFIG_EXTRA.NISN_DIGIT_COUNT constant
    const nisnPattern = new RegExp(`(?:NISN\\s*[:\\s]*)?(\\d{${OCR_SERVICE_CONFIG_EXTRA.NISN_DIGIT_COUNT}})`);
    return nisnPattern.test(text);
  }

  private extractNISN(text: string): string {
    // Flexy: Uses OCR_SERVICE_CONFIG_EXTRA.NISN_DIGIT_COUNT constant
    const match = text.match(new RegExp(`(?:NISN\\s*[:\\s]*)?(\\d{${OCR_SERVICE_CONFIG_EXTRA.NISN_DIGIT_COUNT}})`));
    return match ? match[1] : text;
  }

  private looksLikeSchoolName(text: string): boolean {
    // Flexy: Using centralized OCR_SCHOOL_KEYWORDS constant
    return OCR_SCHOOL_KEYWORDS.some(keyword => text.toUpperCase().includes(keyword));
  }

  private isValidSubject(subject: string): boolean {
    // Flexy: Using centralized ACADEMIC_SUBJECTS constant instead of hardcoded array
    const validSubjects = Object.values(ACADEMIC_SUBJECTS);

    const normalizedSubject = subject.toLowerCase();
    return validSubjects.some(s => s.toLowerCase().includes(normalizedSubject) || normalizedSubject.includes(s.toLowerCase()));
  }

  private isValidGrade(grade: string): boolean {
    const numericGrade = parseInt(grade, 10);
    return !isNaN(numericGrade) && numericGrade >= GRADE_LIMITS.MIN && numericGrade <= GRADE_LIMITS.MAX;
  }

  private assessTextQuality(text: string, confidence: number): OCRTextQuality {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const characterCount = text.length;
    
    // Estimate accuracy based on confidence and text characteristics
    // Flexy: Uses OCR_SERVICE_CONFIG_EXTRA constants for penalties
    let estimatedAccuracy = confidence;
    if (wordCount < 10) estimatedAccuracy *= OCR_SERVICE_CONFIG_EXTRA.SHORT_TEXT_PENALTY;
    if (/\d{2,}/.test(text) && !/NISN|Nilai|Grade/i.test(text)) estimatedAccuracy *= OCR_SERVICE_CONFIG_EXTRA.SUSPICIOUS_NUMBERS_PENALTY;
    
    estimatedAccuracy = Math.max(0, Math.min(100, estimatedAccuracy));
    
    const isHighQuality = confidence >= OCR_SERVICE_CONFIG.QUALITY.HIGH_THRESHOLD && wordCount >= 20;
    const isSearchable = confidence >= OCR_SERVICE_CONFIG.QUALITY.MEDIUM_THRESHOLD && wordCount >= 5;
    
    // Determine document type
    let documentType: OCRTextQuality['documentType'] = 'unknown';
    
    if (/nilai|grade|matematika|bahasa|ipa|ips|fisika|kimia|biologi/i.test(text)) {
      documentType = 'academic';
    } else if (/nisn|nama lengkap|tempat tanggal lahir|alamat/i.test(text)) {
      documentType = 'form';
    } else if (/surat|sertifikat|ijazah|kelulusan/i.test(text)) {
      documentType = 'certificate';
    } else if (/surat|kepala sekolah|tanda tangan|stempel/i.test(text)) {
      documentType = 'administrative';
    }
    
    // Check for meaningful content
    const hasMeaningfulContent = wordCount >= 5 && 
      !/^\s*$|^[^\w\s]*$|^.{0,3}$/i.test(text) && // Not empty or just symbols
      /[a-zA-Z]/.test(text); // Contains letters
    
    return {
      isSearchable,
      isHighQuality,
      estimatedAccuracy,
      wordCount,
      characterCount,
      hasMeaningfulContent,
      documentType
    };
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

  private emitOCRValidationEvent(
    type: 'validation-failure' | 'validation-warning' | 'validation-success',
    documentId: string,
    documentType: string,
    confidence: number,
    issues: string[],
    userId?: string,
    userRole?: UserRole,
    actionUrl?: string
  ): void {
    try {
      const event: OCRValidationEvent = {
        id: generateValidationId(type, documentId || `doc-${Date.now()}`),
        type,
        documentId,
        documentType,
        confidence,
        issues,
        timestamp: new Date().toISOString(),
        userId: userId || 'unknown',
        userRole: userRole || 'teacher',
        actionUrl
      };

      // Store event in localStorage for event monitoring system
      const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.OCR_VALIDATION_EVENTS) || '[]');
      events.push(event);
      
      // Keep only last N events (configurable)
      if (events.length > OCR_SERVICE_CONFIG.MAX_CACHED_EVENTS) {
        events.splice(0, events.length - OCR_SERVICE_CONFIG.MAX_CACHED_EVENTS);
      }
      
      localStorage.setItem(STORAGE_KEYS.OCR_VALIDATION_EVENTS, JSON.stringify(events));
      
      // Emit custom event for immediate handling
      if (typeof window !== 'undefined' && 'CustomEvent' in window) {
        const event2 = new window.CustomEvent('ocrValidation', { 
          detail: event 
        });
        window.dispatchEvent(event2);
      }
      
      logger.info('OCR validation event emitted:', { type, documentId, confidence, issuesCount: issues.length });
    } catch (error) {
      logger.error('Failed to emit OCR validation event:', error);
    }
  }

  private detectValidationIssues(quality: OCRTextQuality, confidence: number): { issues: string[]; severity: 'failure' | 'warning' | 'success' } {
    const issues: string[] = [];
    
    if (confidence < 50) {
      issues.push('Confidence terlalu rendah (< 50%)');
    } else if (confidence < 70) {
      issues.push('Confidence rendah (< 70%)');
    }
    
    if (!quality.isHighQuality) {
      issues.push('Kualitas teks tidak memenuhi standar tinggi');
    }
    
    if (!quality.isSearchable) {
      issues.push('Teks tidak dapat dicari dengan baik');
    }
    
    if (!quality.hasMeaningfulContent) {
      issues.push('Teks tidak memiliki konten yang berarti');
    }
    
    if (quality.wordCount < 20) {
      issues.push('Jumlah kata terlalu sedikit (< 20)');
    }
    
    if (quality.documentType === 'unknown') {
      issues.push('Tipe dokumen tidak dapat diidentifikasi');
    }
    
    // Determine severity
    const hasCriticalIssue = confidence < 50 || !quality.isSearchable || !quality.hasMeaningfulContent;
    const hasWarningIssue = confidence < 70 || !quality.isHighQuality || quality.wordCount < 20;
    
    if (hasCriticalIssue) {
      return { issues, severity: 'failure' };
    } else if (hasWarningIssue) {
      return { issues, severity: 'warning' };
    } else {
      return { issues, severity: 'success' };
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate();
        this.worker = null;
        this.isInitialized = false;
      } catch (error) {
        logger.error('Failed to terminate OCR worker:', error);
        this.worker = null;
        this.isInitialized = false;
      }
    }
  }

  /**
   * Generate cache key based on file content and metadata
   */
  private async generateCacheKey(
    imageFile: File,
    documentMetadata?: {
      documentId?: string;
      userId?: string;
      userRole?: UserRole;
      documentType?: string;
      actionUrl?: string;
    }
  ): Promise<CacheKeyInfo> {
    // Generate hash from file content
    const fileHash = await this.hashFile(imageFile);
    
    // Create metadata string for context
    const metadata = JSON.stringify({
      size: imageFile.size,
      type: imageFile.type,
      lastModified: imageFile.lastModified,
      documentId: documentMetadata?.documentId,
      userId: documentMetadata?.userId,
      userRole: documentMetadata?.userRole,
      documentType: documentMetadata?.documentType
    });
    
    return { fileHash, metadata };
  }

  /**
   * Generate hash from file content for caching
   */
  private async hashFile(imageFile: File): Promise<string> {
    try {
      const buffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      let hash = 0;
      for (let i = 0; i < uint8Array.length; i++) {
        const byte = uint8Array[i];
        hash = ((hash << HASH_CONFIG.HASH_SHIFT_BITS) - hash) + byte;
        hash = hash & hash;
      }
      
      return Math.abs(hash).toString(HASH_CONFIG.OUTPUT_BASE) + `_${imageFile.size}_${imageFile.type}`;
    } catch (error) {
      logger.error('Failed to hash file for OCR caching:', error);
      return `fallback_${imageFile.size}_${imageFile.type}_${Date.now()}`;
    }
  }

  /**
   * Clear OCR cache manually
   */
  clearCache(): void {
    ocrCache.clearOperation('extractTextFromImage');
    logger.info('OCR cache cleared');
  }

  /**
   * Get OCR cache statistics
   */
  getCacheStats() {
    return ocrCache.getStats();
  }
}

export const ocrService = new OCRService();
