import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateParentChild,
  validateMultiChildDataIsolation,
  validateParentChildDataAccess,
  validateChildDataIsolation,
  validateGradeVisibilityRestriction,
  validateOfflineDataIntegrity
} from '../parentValidation';
import type { ParentChild } from '../../types';

describe('parentValidation', () => {
  let mockChildren: ParentChild[];
  let mockChild: ParentChild;

  beforeEach(() => {
    mockChild = {
      studentId: 'student1',
      studentName: 'John Doe',
      relationshipId: 'rel1',
      relationshipType: 'ayah',
      nisn: '1234567890',
      nis: '001',
      class: '10A',
      className: '10A',
      isPrimaryContact: true,
      dateOfBirth: '2008-01-01',
      studentEmail: 'john@student.com'
    };

    mockChildren = [
      mockChild,
      {
        studentId: 'student2',
        studentName: 'Jane Doe',
        relationshipId: 'rel2',
        relationshipType: 'ayah',
        nisn: '0987654321',
        nis: '002',
        class: '11B',
        className: '11B',
        isPrimaryContact: false,
        dateOfBirth: '2007-01-01',
        studentEmail: 'jane@student.com'
      }
    ];
  });

  describe('validateParentChild', () => {
    it('should validate a valid parent child record', () => {
      const result = validateParentChild(mockChild);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject invalid parent child records', () => {
      const invalidChild = {
        studentId: '',
        studentName: '',
        relationshipId: '',
        relationshipType: 'invalid' as 'ayah',
        nisn: '',
        nis: '',
        class: '',
        className: '',
        isPrimaryContact: false,
        dateOfBirth: '',
        studentEmail: ''
      };

      const result = validateParentChild(invalidChild);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Student ID is required');
      expect(result.errors).toContain('Student name is required');
      expect(result.errors).toContain('Relationship ID is required');
      expect(result.errors).toContain('Invalid relationship type');
      expect(result.errors).toContain('NISN is required');
    });
  });

  describe('validateMultiChildDataIsolation', () => {
    it('should validate proper data isolation between children', () => {
      const result = validateMultiChildDataIsolation(mockChildren, 'student1');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect duplicate student IDs', () => {
      const childrenWithDuplicates = [
        ...mockChildren,
        { ...mockChild, studentId: 'student1', relationshipId: 'rel3' }
      ];

      const result = validateMultiChildDataIsolation(childrenWithDuplicates, 'student1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate child IDs detected: student1');
    });

    it('should detect duplicate NISNs', () => {
      const childrenWithDuplicates = [
        ...mockChildren,
        { ...mockChild, studentId: 'student3', relationshipId: 'rel3' }
      ];

      const result = validateMultiChildDataIsolation(childrenWithDuplicates, 'student1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate NISN detected: 1234567890');
    });

    it('should reject when child ID is not found', () => {
      const result = validateMultiChildDataIsolation(mockChildren, 'nonexistent');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Child with ID nonexistent not found in parent\'s children list');
    });
  });

  describe('validateParentChildDataAccess', () => {
    it('should grant access for valid child and data types', () => {
      const result = validateParentChildDataAccess('student1', mockChildren, 'grades');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should deny access for invalid child ID', () => {
      const result = validateParentChildDataAccess('nonexistent', mockChildren, 'grades');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Access denied: Child with ID nonexistent not found in parent\'s children list');
    });

    it('should provide warnings for incomplete data', () => {
      const childWithoutClass = { ...mockChild, className: '' };
      const childrenWithIncompleteData = [childWithoutClass];

      const result = validateParentChildDataAccess('student1', childrenWithIncompleteData, 'schedule');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Schedule may be incomplete: No class information available');
    });
  });

  describe('validateChildDataIsolation', () => {
    it('should validate proper data isolation', () => {
      const gradesData = [
        { studentId: 'student1', grade: 'A', subject: 'Math' }
      ];

      const result = validateChildDataIsolation('student1', gradesData, 'grades');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect data isolation breach', () => {
      const gradesData = [
        { studentId: 'student1', grade: 'A', subject: 'Math' },
        { studentId: 'student2', grade: 'B', subject: 'Science' },
        { studentId: 'student3', grade: 'C', subject: 'History' }
      ];

      const result = validateChildDataIsolation('student1', gradesData, 'grades');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data isolation breach: Found 2 grades records belonging to other children');
    });

    it('should handle invalid data structure', () => {
      const result = validateChildDataIsolation('student1', null as any, 'grades');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid grades data: Expected array');
    });
  });

  describe('validateGradeVisibilityRestriction', () => {
    it('should validate published grades', () => {
      const gradesData = [
        {
          studentId: 'student1',
          id: 'grade1',
          isPublished: true,
          publishDate: '2024-01-01T00:00:00Z',
          subject: 'Math',
          academicPeriod: '2024-Q1'
        }
      ];

      const result = validateGradeVisibilityRestriction(gradesData, 'student1', 'parent');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should restrict access to unpublished grades', () => {
      const gradesData = [
        {
          studentId: 'student1',
          id: 'grade1',
          isPublished: false,
          subject: 'Math'
        }
      ];

      const result = validateGradeVisibilityRestriction(gradesData, 'student1', 'parent');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Grade grade1 is not yet published and cannot be viewed');
    });

    it('should handle grades with future publish dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const gradesData = [
        {
          studentId: 'student1',
          id: 'grade1',
          isPublished: true,
          publishDate: futureDate.toISOString(),
          subject: 'Math'
        }
      ];

      const result = validateGradeVisibilityRestriction(gradesData, 'student1', 'parent');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Grade grade1 has a future publish date');
    });

    it('should warn about incomplete grade metadata', () => {
      const gradesData = [
        {
          studentId: 'student1',
          id: 'grade1',
          isPublished: true
        }
      ];

      const result = validateGradeVisibilityRestriction(gradesData, 'student1', 'parent');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Grade grade1 has incomplete metadata');
    });
  });

  describe('validateOfflineDataIntegrity', () => {
    it('should validate fresh offline data', () => {
      const now = Date.now();
      const cachedData = {
        children: mockChildren,
        lastUpdated: now
      };

      const result = validateOfflineDataIntegrity(cachedData, mockChildren);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject missing cached data', () => {
      const result = validateOfflineDataIntegrity(undefined as any, mockChildren);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No cached data available');
    });

    it('should detect stale cached data', () => {
      const oldDate = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      const staleCachedData = {
        children: mockChildren,
        lastUpdated: oldDate
      };

      const result = validateOfflineDataIntegrity(staleCachedData, mockChildren);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Cached data is stale: 25 hours old');
    });

    it('should detect missing children in cached data', () => {
      const cachedData = {
        children: [mockChildren[0]],
        lastUpdated: Date.now()
      };

      const result = validateOfflineDataIntegrity(cachedData, mockChildren);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Missing cached data for children: student2');
    });

    it('should detect extra children in cached data', () => {
      const cachedData = {
        children: [
          ...mockChildren,
          { ...mockChild, studentId: 'student3', relationshipId: 'rel3' }
        ],
        lastUpdated: Date.now()
      };

      const result = validateOfflineDataIntegrity(cachedData, mockChildren);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Cached data contains children no longer assigned: student3');
    });
  });
});