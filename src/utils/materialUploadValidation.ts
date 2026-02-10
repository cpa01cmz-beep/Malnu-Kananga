/**
 * Material Upload Validation Utilities
 * Comprehensive validation for material uploads including:
 * - File type validation
 * - File size validation
 * - File name validation
 * - Content type validation
 * - XSS sanitization
 * - PPDB document validation for OCR
 */

import { logger } from './logger';
import { FILE_SIZE_LIMITS, FILE_VALIDATION, XSS_CONFIG, CONVERSION, bytesToMb } from '../constants';

// File type configurations
export const MATERIAL_FILE_TYPES = {
  DOCUMENT: {
    extensions: ['.pdf', '.doc', '.docx', '.ppt', '.pptx'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    maxSize: FILE_SIZE_LIMITS.MATERIAL_DEFAULT,
    displayName: 'Dokumen',
  },
  IMAGE: {
    extensions: ['.jpg', '.jpeg', '.png'],
    mimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
    ],
    maxSize: FILE_SIZE_LIMITS.PPDB_DOCUMENT,
    displayName: 'Gambar',
  },
  VIDEO: {
    extensions: ['.mp4', '.webm'],
    mimeTypes: [
      'video/mp4',
      'video/webm',
    ],
    maxSize: FILE_SIZE_LIMITS.MATERIAL_LARGE,
    displayName: 'Video',
  },
} as const;

export type MaterialFileType = keyof typeof MATERIAL_FILE_TYPES;

// PPDB document types for OCR
export const PPDB_DOCUMENT_TYPES = {
  AKA_KELUARGA: 'Kartu Keluarga',
  IJAZAH: 'Ijazah SD/MI/Sederajat',
  SKL: 'Surat Keterangan Lulus',
  RAPOR: 'Rapor SD/MI/Sederajat',
  FOTO: 'Pas Foto 3x4',
  KK_AYAH: 'Kartu Keluarga Ayah',
  KK_IBU: 'Kartu Keluarga Ibu',
  LAINNYA: 'Dokumen Lainnya',
} as const;

export type PPDBDocumentType = keyof typeof PPDB_DOCUMENT_TYPES;

// Validation result interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FileValidationResult extends ValidationResult {
  sanitizedFileName?: string;
  fileType?: MaterialFileType | null;
  requiresOCR?: boolean;
}

export interface PPDBDocumentValidationResult extends ValidationResult {
  documentType?: PPDBDocumentType;
  suggestedType?: PPDBDocumentType;
  qualityScore: number;
}

// File validation options
export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: MaterialFileType[];
  allowOCR?: boolean;
  sanitizeFileName?: boolean;
  checkForMalware?: boolean;
}

// XSS sanitization utilities
export class XSSSanitizer {
  // Flexy: Using centralized XSS_CONFIG constants for security
  private static dangerousTags = XSS_CONFIG.DANGEROUS_TAGS;
  private static dangerousAttributes = XSS_CONFIG.DANGEROUS_ATTRIBUTES;

  static sanitizeFileName(fileName: string): string {
    let sanitized = fileName;

    // Remove dangerous patterns with colon
    this.dangerousAttributes.forEach((attr) => {
      const pattern = new RegExp(`${attr}:`, 'gi');
      sanitized = sanitized.replace(pattern, '');
    });

    // Remove path traversal attempts
    sanitized = sanitized.replace(/\.\.[/\\]/g, '');

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove special characters that could cause issues (keep dots)
    sanitized = sanitized.replace(/[<>:"|?*]/g, '_');

    // Remove leading/trailing dots and spaces
    sanitized = sanitized.trim().replace(/^\.+|\.+$/g, '');

    // Ensure filename is not empty
    if (!sanitized) {
      sanitized = 'untitled';
    }

    return sanitized;
  }

  static sanitizeMetadata(metadata: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(metadata)) {
      // Sanitize key
      const sanitizedKey = key.replace(/[<>:"|?*]/g, '_');

      // Sanitize value
      let sanitizedValue = value;
      this.dangerousAttributes.forEach((attr) => {
        const pattern = new RegExp(`${attr}:`, 'gi');
        sanitizedValue = sanitizedValue.replace(pattern, '');
      });

      sanitized[sanitizedKey] = sanitizedValue;
    }

    return sanitized;
  }
}

// File type detection
export class FileTypeDetector {
  static detectByExtension(fileName: string): MaterialFileType | undefined {
    const extension = fileName.toLowerCase();
    
    for (const [type, config] of Object.entries(MATERIAL_FILE_TYPES)) {
      if (config.extensions.some(ext => extension.endsWith(ext))) {
        return type as MaterialFileType;
      }
    }
    
    return undefined;
  }

  static detectByMimeType(mimeType: string): MaterialFileType | undefined {
    const mime = mimeType.toLowerCase();

    for (const [type, config] of Object.entries(MATERIAL_FILE_TYPES)) {
      if (config.mimeTypes.some(mt => mt === mime)) {
        return type as MaterialFileType;
      }
    }

    return undefined;
  }

  static isImageFile(fileName: string): boolean {
    const imageExtensions = MATERIAL_FILE_TYPES.IMAGE.extensions;
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  static isVideoFile(fileName: string): boolean {
    const videoExtensions = MATERIAL_FILE_TYPES.VIDEO.extensions;
    return videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  static isDocumentFile(fileName: string): boolean {
    const documentExtensions = MATERIAL_FILE_TYPES.DOCUMENT.extensions;
    return documentExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }
}

// File name validation
export class FileNameValidator {
  // Flexy: Using centralized FILE_VALIDATION.RESERVED_NAMES constant
  private static RESERVED_NAMES = FILE_VALIDATION.RESERVED_NAMES;

  static validate(fileName: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check length
    if (fileName.length === 0) {
      errors.push('Nama file tidak boleh kosong');
    } else if (fileName.length < FILE_VALIDATION.FILENAME_MIN_LENGTH) {
      errors.push(`Nama file minimal ${FILE_VALIDATION.FILENAME_MIN_LENGTH} karakter`);
    } else if (fileName.length > FILE_VALIDATION.FILENAME_MAX_LENGTH) {
      errors.push(`Nama file maksimal ${FILE_VALIDATION.FILENAME_MAX_LENGTH} karakter`);
    }

    // Check for reserved names
    const nameWithoutExtension = fileName.split('.')[0].toUpperCase();
    if ((this.RESERVED_NAMES as readonly string[]).includes(nameWithoutExtension)) {
      errors.push(`"${nameWithoutExtension}" adalah nama yang tidak diizinkan`);
    }

    // Check for invalid characters
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(fileName)) {
      errors.push('Nama file mengandung karakter tidak valid: < > : " | ? *');
    }

    // Check for path traversal
    if (/\.\.[/\\]/.test(fileName)) {
      errors.push('Nama file tidak boleh mengandung path traversal (..)');
    }

    // Check for null bytes
    if (fileName.includes('\0')) {
      errors.push('Nama file mengandung karakter tidak valid');
    }

    // Warnings
    if (fileName.length > FILE_VALIDATION.FILENAME_WARNING_LENGTH) {
      warnings.push('Nama file panjang dapat menyulitkan pengelolaan');
    }

    if (!fileName.includes('.')) {
      warnings.push('File tanpa ekstensi mungkin tidak terbaca dengan benar');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// PPDB document validation
export class PPDBDocumentValidator {
  static validateDocument(file: File): PPDBDocumentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let qualityScore = 100;

    // Validate file type for PPDB
    const fileType = FileTypeDetector.detectByMimeType(file.type);
    if (fileType === 'VIDEO') {
      errors.push('Dokumen PPDB tidak boleh berupa video');
      return {
        isValid: false,
        errors,
        warnings,
        qualityScore: 0,
      };
    }

    // Detect document type from file name
    const documentType = this.detectDocumentType(file.name);
    const suggestedType = this.suggestDocumentType(file.name);

    // Validate image quality for OCR
    if (fileType === 'IMAGE') {
      const imageQuality = this.validateImageQuality(file);
      qualityScore = imageQuality.score;
      
      if (!imageQuality.isValid) {
        errors.push(...imageQuality.errors);
        warnings.push(...imageQuality.warnings);
      }
    }

    // Validate file size for PPDB documents
    const maxPPDBSize = FILE_SIZE_LIMITS.PPDB_DOCUMENT;
    if (file.size > maxPPDBSize) {
      warnings.push(`Ukuran dokumen PPDB idealnya tidak melebihi ${Math.round(bytesToMb(FILE_SIZE_LIMITS.PPDB_DOCUMENT))}MB untuk pemrosesan OCR yang optimal`);
    }

    // Validate document requirements
    if (documentType) {
      warnings.push(`Terdeteksi sebagai: ${PPDB_DOCUMENT_TYPES[documentType]}`);
    }

    if (suggestedType && suggestedType !== documentType) {
      warnings.push(`Mungkin dimaksudkan sebagai: ${PPDB_DOCUMENT_TYPES[suggestedType]}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      documentType,
      suggestedType,
      qualityScore,
    };
  }

  private static detectDocumentType(fileName: string): PPDBDocumentType | undefined {
    const name = fileName.toLowerCase();

    if (name.includes('kk') || name.includes('kartu_keluarga')) return 'AKA_KELUARGA';
    if (name.includes('ijazah')) return 'IJAZAH';
    if (name.includes('skl') || name.includes('surat_keterangan')) return 'SKL';
    if (name.includes('rapor') || name.includes('nilai')) return 'RAPOR';
    if (name.includes('foto') || name.includes('pas_foto')) return 'FOTO';
    if (name.includes('kk_ayah') || name.includes('ayah')) return 'KK_AYAH';
    if (name.includes('kk_ibu') || name.includes('ibu')) return 'KK_IBU';

    return undefined;
  }

  private static suggestDocumentType(fileName: string): PPDBDocumentType | undefined {
    const name = fileName.toLowerCase();

    // More lenient matching
    if (name.includes('ayah') || name.includes('father')) return 'KK_AYAH';
    if (name.includes('ibu') || name.includes('mother')) return 'KK_IBU';
    if (name.includes('keluarga') || name.includes('family')) return 'AKA_KELUARGA';

    return undefined;
  }

  private static validateImageQuality(file: File): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Validate file size for OCR
    const minSize = FILE_SIZE_LIMITS.IMAGE_MIN;
    const maxSize = FILE_SIZE_LIMITS.PROFILE_IMAGE;

    if (file.size < minSize) {
      errors.push('Ukuran gambar terlalu kecil untuk OCR yang optimal');
      score -= 50;
    } else if (file.size > maxSize) {
      warnings.push('Ukuran gambar besar dapat memperlambat pemrosesan OCR');
      score -= 10;
    }

    // Validate image type for OCR
    if (!file.type.includes('jpeg') && !file.type.includes('png')) {
      warnings.push('Format JPEG atau PNG direkomendasikan untuk OCR yang lebih baik');
      score -= 15;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score,
    };
  }
}

// Main material upload validator
export class MaterialUploadValidator {
  static validateFile(
    file: File,
    options: FileValidationOptions = {}
  ): FileValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Default options
    const sanitizeName = options.sanitizeFileName !== false;
    const maxSize = options.maxSizeMB
      ? options.maxSizeMB * CONVERSION.BYTES_PER_MB
      : undefined;

    // Validate file name
    const nameValidation = FileNameValidator.validate(file.name);
    errors.push(...nameValidation.errors);
    warnings.push(...nameValidation.warnings);

    // Sanitize file name
    let sanitizedFileName = file.name;
    if (sanitizeName) {
      sanitizedFileName = XSSSanitizer.sanitizeFileName(file.name);
      if (sanitizedFileName !== file.name) {
        warnings.push('Nama file telah disanitasi untuk keamanan');
      }
    }

    // Detect file type
    const fileTypeByExt = FileTypeDetector.detectByExtension(file.name);
    const fileTypeByMime = FileTypeDetector.detectByMimeType(file.type);

    // Validate file type consistency
    if (fileTypeByExt && fileTypeByMime && fileTypeByExt !== fileTypeByMime) {
      warnings.push('Tipe file berdasarkan ekstensi tidak cocok dengan tipe MIME');
    }

    const fileType = fileTypeByExt || fileTypeByMime;

    // Validate allowed file types
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      if (!fileType || !options.allowedTypes.includes(fileType)) {
        const allowedTypes = options.allowedTypes.map(t => MATERIAL_FILE_TYPES[t].displayName).join(', ');
        errors.push(`Tipe file tidak valid. Harap unggah: ${allowedTypes}`);
      }
    }

    // Validate file size
    if (maxSize && file.size > maxSize) {
      const maxSizeMB = Math.round(bytesToMb(maxSize));
      errors.push(`Ukuran file terlalu besar. Maksimal: ${maxSizeMB}MB`);
    } else if (fileType) {
      const maxTypeSize = MATERIAL_FILE_TYPES[fileType].maxSize;
      if (file.size > maxTypeSize) {
        const maxSizeMB = Math.round(bytesToMb(maxTypeSize));
        errors.push(`Ukuran ${MATERIAL_FILE_TYPES[fileType].displayName} tidak boleh melebihi ${maxSizeMB}MB`);
      }
    }

    // Check for empty files
    if (file.size === 0) {
      errors.push('File kosong tidak diperbolehkan');
    }

    // Validate for PPDB documents
    let requiresOCR = false;
    if (options.allowOCR) {
      const ppdbValidation = PPDBDocumentValidator.validateDocument(file);
      if (!ppdbValidation.isValid) {
        errors.push(...ppdbValidation.errors);
      }
      warnings.push(...ppdbValidation.warnings);

      if (ppdbValidation.qualityScore < 50) {
        warnings.push('Kualitas dokumen rendah dapat mempengaruhi hasil OCR');
      }

      requiresOCR = fileType === 'IMAGE';
    }

    // Check for potential malware patterns
    if (options.checkForMalware) {
      const malwareCheck = this.checkForMalwarePatterns(file.name);
      if (malwareCheck.hasSuspiciousPatterns) {
        errors.push('File mengandung pola mencurigakan. Silakan periksa file Anda.');
      }
      warnings.push(...malwareCheck.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedFileName,
      fileType,
      requiresOCR,
    };
  }

  private static checkForMalwarePatterns(fileName: string): {
    hasSuspiciousPatterns: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const name = fileName.toLowerCase();

    // Check for double extensions
    const extensionMatch = name.match(/\.([^.]+)\.([^.]+)$/);
    if (extensionMatch) {
      warnings.push('File dengan ekstensi ganda dapat mencurigakan');
    }

    // Check for executable patterns
    if (name.endsWith('.exe') || name.endsWith('.bat') || name.endsWith('.sh')) {
      return { hasSuspiciousPatterns: true, warnings: [] };
    }

    return {
      hasSuspiciousPatterns: false,
      warnings,
    };
  }

  static validateBatch(
    files: File[],
    options: FileValidationOptions = {}
  ): {
    overallValid: boolean;
    results: FileValidationResult[];
    totalSize: number;
    canUpload: boolean;
  } {
    let overallValid = true;
    const results: FileValidationResult[] = [];
    let totalSize = 0;

    for (const file of files) {
      const validation = this.validateFile(file, options);
      results.push(validation);
      totalSize += file.size;

      if (!validation.isValid) {
        overallValid = false;
      }
    }

    // Check batch size limit
    const maxBatchSize = FILE_SIZE_LIMITS.BATCH_TOTAL;
    const canUpload = overallValid && totalSize <= maxBatchSize;

    if (totalSize > maxBatchSize) {
      results.forEach(r => {
        r.warnings.push(`Total ukuran file melebihi batas ${Math.round(bytesToMb(FILE_SIZE_LIMITS.BATCH_TOTAL))}MB untuk batch upload`);
      });
    }

    return {
      overallValid,
      results,
      totalSize,
      canUpload,
    };
  }
}

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = CONVERSION.BYTES_PER_KB;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getAllowedFileExtensions = (
  allowedTypes?: MaterialFileType[]
): string => {
  if (allowedTypes && allowedTypes.length > 0) {
    return allowedTypes
      .flatMap(type => MATERIAL_FILE_TYPES[type].extensions)
      .join(', ');
  }
  return Object.values(MATERIAL_FILE_TYPES)
    .flatMap(config => config.extensions)
    .join(', ');
};

export const getMaxFileSizeForType = (fileType: MaterialFileType): string => {
  const maxSize = MATERIAL_FILE_TYPES[fileType].maxSize;
  const maxSizeMB = Math.round(bytesToMb(maxSize));
  return `${maxSizeMB}MB`;
};

export const validateMaterialUpload = (
  file: File,
  options?: FileValidationOptions
): FileValidationResult => {
  try {
    return MaterialUploadValidator.validateFile(file, options);
  } catch (error) {
    logger.error('Material upload validation error:', error);
    return {
      isValid: false,
      errors: ['Terjadi kesalahan saat memvalidasi file. Silakan coba lagi.'],
      warnings: [],
    };
  }
};

export const sanitizeMaterialMetadata = (
  metadata: Record<string, string>
): Record<string, string> => {
  return XSSSanitizer.sanitizeMetadata(metadata);
};

// Export validation result type guards
export function isFileValidationResult(
  result: ValidationResult
): result is FileValidationResult {
  return 'sanitizedFileName' in result || 'fileType' in result;
}

export function isPPDBDocumentValidationResult(
  result: ValidationResult
): result is PPDBDocumentValidationResult {
  return 'qualityScore' in result;
}
