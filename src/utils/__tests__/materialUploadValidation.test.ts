/**
 * Tests for Material Upload Validation Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  XSSSanitizer,
  sanitizeMaterialMetadata,
  isFileValidationResult,
  isPPDBDocumentValidationResult,
  type FileValidationResult,
  type PPDBDocumentValidationResult,
} from '../materialUploadValidation';

describe('XSSSanitizer', () => {
  describe('sanitizeFileName', () => {
    it('should remove dangerous attributes from file names', () => {
      const dangerous = 'test<script>.pdf';
      const sanitized = XSSSanitizer.sanitizeFileName(dangerous);
      expect(sanitized).not.toContain('<script>');
    });

    it('should remove path traversal attempts', () => {
      const traversal = '../../../etc/passwd';
      const sanitized = XSSSanitizer.sanitizeFileName(traversal);
      expect(sanitized).not.toContain('..');
    });

    it('should remove null bytes', () => {
      const nullByte = 'test\0file.pdf';
      const sanitized = XSSSanitizer.sanitizeFileName(nullByte);
      expect(sanitized).not.toContain('\0');
    });

    it('should remove special characters', () => {
      const specialChars = 'test<>:"|?*file.pdf';
      const sanitized = XSSSanitizer.sanitizeFileName(specialChars);
      expect(sanitized).toBe('test_______file.pdf'); // 6 underscores for < > : " | ? *
    });

    it('should remove leading and trailing dots', () => {
      const dots = '..testfile.pdf..';
      const sanitized = XSSSanitizer.sanitizeFileName(dots);
      expect(sanitized).toBe('testfile.pdf');
    });

    it('should return "untitled" for empty filename', () => {
      const empty = '';
      const sanitized = XSSSanitizer.sanitizeFileName(empty);
      expect(sanitized).toBe('untitled');
    });

    it('should preserve safe filenames', () => {
      const safe = 'normal-document.pdf';
      const sanitized = XSSSanitizer.sanitizeFileName(safe);
      expect(sanitized).toBe(safe);
    });
  });

  describe('sanitizeMaterialMetadata', () => {
    it('should sanitize metadata keys and values', () => {
      const metadata = {
        'title<script>': 'value<script>',
        'description': 'normal description',
      };
      const sanitized = sanitizeMaterialMetadata(metadata);
      expect(sanitized['title']).toBe('value');
      expect(sanitized['description']).toBe('normal description');
    });

    it('should remove special characters from keys', () => {
      const metadata = {
        'test<key>': 'value',
      };
      const sanitized = sanitizeMaterialMetadata(metadata);
      expect(sanitized['test_key']).toBe('value');
    });
  });

describe('Type Guards', () => {
  describe('isFileValidationResult', () => {
    it('should identify FileValidationResult', () => {
      const result: FileValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        fileType: 'DOCUMENT',
      };
      expect(isFileValidationResult(result)).toBe(true);
    });

    it('should reject plain ValidationResult', () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: [],
      };
      expect(isFileValidationResult(result)).toBe(false);
    });
  });

  describe('isPPDBDocumentValidationResult', () => {
    it('should identify PPDBDocumentValidationResult', () => {
      const result: PPDBDocumentValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        qualityScore: 100,
      };
      expect(isPPDBDocumentValidationResult(result)).toBe(true);
    });

    it('should reject plain ValidationResult', () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: [],
      };
      expect(isPPDBDocumentValidationResult(result)).toBe(false);
    });
  });
});

});
