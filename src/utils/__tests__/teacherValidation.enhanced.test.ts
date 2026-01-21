import {
  validateGradeInput,
  sanitizeGradeInput,
  calculateGradeLetter,
  calculateFinalGrade,
  validateClassCompletion,
  validateCSVImport,
  getInlineValidationMessage,
  type StudentGrade
} from '../../utils/teacherValidation';

describe('teacherValidation - Enhanced Grade Validation', () => {
  describe('validateClassCompletion', () => {
    it('should validate class with all grades completed', () => {
      const grades: StudentGrade[] = [
        { id: '1', name: 'John Doe', nis: '12345', assignment: 85, midExam: 90, finalExam: 88 },
        { id: '2', name: 'Jane Smith', nis: '12346', assignment: 75, midExam: 80, finalExam: 78 }
      ];

      const result = validateClassCompletion(grades);

      expect(result.isValid).toBe(true);
      expect(result.totalStudents).toBe(2);
      expect(result.studentsWithGrades).toBe(2);
      expect(result.studentsWithoutGrades).toBe(0);
      expect(result.studentsWithoutGradesList).toHaveLength(0);
      expect(result.warnings).toContain('Semua siswa memiliki nilai. Siap untuk dipublikasikan.');
    });

    it('should detect students without grades', () => {
      const grades: StudentGrade[] = [
        { id: '1', name: 'John Doe', nis: '12345', assignment: 85, midExam: 90, finalExam: 88 },
        { id: '2', name: 'Jane Smith', nis: '12346', assignment: 0, midExam: 0, finalExam: 0 },
        { id: '3', name: 'Bob Wilson', nis: '12347', assignment: 0, midExam: 0, finalExam: 0 }
      ];

      const result = validateClassCompletion(grades);

      expect(result.isValid).toBe(false);
      expect(result.totalStudents).toBe(3);
      expect(result.studentsWithGrades).toBe(1);
      expect(result.studentsWithoutGrades).toBe(2);
      expect(result.studentsWithoutGradesList).toEqual(['Jane Smith', 'Bob Wilson']);
      expect(result.warnings[0]).toContain('2 siswa belum memiliki nilai');
    });

    it('should handle more than 5 students without grades', () => {
      const grades: StudentGrade[] = Array.from({ length: 11 }, (_, i) => ({
        id: `${i}`,
        name: `Student ${i}`,
        nis: `${10000 + i}`,
        assignment: i < 5 ? 75 : 0,
        midExam: i < 5 ? 80 : 0,
        finalExam: i < 5 ? 78 : 0
      }));

      const result = validateClassCompletion(grades);

      expect(result.isValid).toBe(false);
      expect(result.studentsWithoutGrades).toBe(6);
      expect(result.warnings[0]).toContain('...');
    });
  });

  describe('validateCSVImport', () => {
    it('should successfully import valid grades from CSV', () => {
      const existingGrades: StudentGrade[] = [
        { id: '1', name: 'John Doe', nis: '12345', assignment: 0, midExam: 0, finalExam: 0 },
        { id: '2', name: 'Jane Smith', nis: '12346', assignment: 0, midExam: 0, finalExam: 0 }
      ];

      const csvData = [
        { nis: '12345', name: 'John Doe', assignment: '85', midExam: '90', finalExam: '88' },
        { nis: '12346', name: 'Jane Smith', assignment: '75', midExam: '80', finalExam: '78' }
      ];

      const result = validateCSVImport(csvData, existingGrades);

      expect(result.successfulImports).toBe(2);
      expect(result.failedImports).toBe(0);
      expect(result.successDetails).toHaveLength(2);
      expect(result.errorDetails).toHaveLength(0);
      expect(result.successDetails[0].assignment).toBe(85);
      expect(result.successDetails[0].midExam).toBe(90);
      expect(result.successDetails[0].finalExam).toBe(88);
    });

    it('should sanitize out-of-range grades in CSV', () => {
      const existingGrades: StudentGrade[] = [
        { id: '1', name: 'John Doe', nis: '12345', assignment: 0, midExam: 0, finalExam: 0 },
        { id: '2', name: 'Jane Smith', nis: '12346', assignment: 0, midExam: 0, finalExam: 0 }
      ];

      const csvData = [
        { nis: '12345', name: 'John Doe', assignment: '105', midExam: '90', finalExam: '88' },
        { nis: '12346', name: 'Jane Smith', assignment: '-5', midExam: '80', finalExam: '78' }
      ];

      const result = validateCSVImport(csvData, existingGrades);

      // sanitizeGradeInput caps values at 100 and floors at 0, so these are now valid
      expect(result.successfulImports).toBe(2);
      expect(result.failedImports).toBe(0);
      expect(result.successDetails[0].assignment).toBe(100); // 105 capped at 100
      expect(result.successDetails[1].assignment).toBe(0); // -5 floored at 0
    });

    it('should handle CSV with alternative column names', () => {
      const existingGrades: StudentGrade[] = [
        { id: '1', name: 'John Doe', nis: '12345', assignment: 0, midExam: 0, finalExam: 0 }
      ];

      const csvData = [
        { nis: '12345', tugas: '85', uts: '90', uas: '88' }
      ];

      const result = validateCSVImport(csvData, existingGrades);

      expect(result.successfulImports).toBe(1);
      expect(result.successDetails[0].assignment).toBe(85);
      expect(result.successDetails[0].midExam).toBe(90);
      expect(result.successDetails[0].finalExam).toBe(88);
    });

    it('should ignore CSV rows that do not match existing students', () => {
      const existingGrades: StudentGrade[] = [
        { id: '1', name: 'John Doe', nis: '12345', assignment: 0, midExam: 0, finalExam: 0 }
      ];

      const csvData = [
        { nis: '12345', name: 'John Doe', assignment: '85', midExam: '90', finalExam: '88' },
        { nis: '99999', name: 'Unknown Student', assignment: '75', midExam: '80', finalExam: '78' }
      ];

      const result = validateCSVImport(csvData, existingGrades);

      expect(result.successfulImports).toBe(1);
      expect(result.failedImports).toBe(0);
    });
  });

  describe('getInlineValidationMessage', () => {
    it('should return error for NaN values', () => {
      const result = getInlineValidationMessage(NaN, 'assignment');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Nilai tidak valid');
      expect(result.severity).toBe('error');
    });

    it('should return error for negative values', () => {
      const result = getInlineValidationMessage(-5, 'assignment');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Nilai tidak boleh negatif');
      expect(result.severity).toBe('error');
    });

    it('should return error for values > 100', () => {
      const result = getInlineValidationMessage(105, 'assignment');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Nilai maksimal 100');
      expect(result.severity).toBe('error');
    });

    it('should return info for zero values (unfilled)', () => {
      const result = getInlineValidationMessage(0, 'assignment');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Nilai belum diisi');
      expect(result.severity).toBe('info');
    });

    it('should return warning for low values (< 60)', () => {
      const result = getInlineValidationMessage(55, 'assignment');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Nilai rendah');
      expect(result.severity).toBe('warning');
    });

    it('should return valid with no message for good values', () => {
      const result = getInlineValidationMessage(85, 'assignment');

      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
      expect(result.severity).toBe('info');
    });
  });

  describe('Existing validation functions - integration test', () => {
    it('should validate grade input with all fields', () => {
      const result = validateGradeInput({
        assignment: 85,
        midExam: 90,
        finalExam: 88
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should detect invalid grade ranges', () => {
      const result = validateGradeInput({
        assignment: 105,
        midExam: -5,
        finalExam: 90
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nilai tugas tidak boleh lebih dari 100');
      expect(result.errors).toContain('Nilai UTS tidak boleh kurang dari 0');
    });

    it('should warn about low grades', () => {
      const result = validateGradeInput({
        assignment: 55,
        midExam: 58,
        finalExam: 59
      });

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should sanitize invalid inputs', () => {
      expect(sanitizeGradeInput('abc')).toBe(0);
      expect(sanitizeGradeInput('150')).toBe(100);
      expect(sanitizeGradeInput('-10')).toBe(0);
      expect(sanitizeGradeInput('85')).toBe(85);
    });

    it('should calculate final grade correctly', () => {
      const final = calculateFinalGrade(80, 85, 90);
      expect(final).toBeCloseTo(85.5, 1);
    });

    it('should assign correct grade letters', () => {
      expect(calculateGradeLetter(90)).toBe('A');
      expect(calculateGradeLetter(78)).toBe('B');
      expect(calculateGradeLetter(65)).toBe('C');
      expect(calculateGradeLetter(50)).toBe('D');
    });
  });
});
