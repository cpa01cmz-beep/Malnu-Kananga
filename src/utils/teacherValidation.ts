/**
 * Validation utilities for teacher workflow components
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface GradeInput {
  assignment?: number;
  midExam?: number;
  finalExam?: number;
}

export interface GradeFormData {
  studentId: string;
  assignment: number;
  midExam: number;
  finalExam: number;
}

export interface ClassFormData {
  studentId: string;
  name: string;
  nis: string;
  gender: 'L' | 'P';
  address?: string;
}

export interface MaterialFormData {
  title: string;
  description: string;
  category: string;
  subjectId?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

export interface OperationResult {
  success: boolean;
  data?: any;
  error?: string;
  canRetry?: boolean;
}

/**
 * Validates grade input values
 */
export const validateGradeInput = (grade: GradeInput): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate assignment score
  if (grade.assignment !== undefined) {
    if (typeof grade.assignment !== 'number') {
      errors.push('Nilai tugas harus berupa angka');
    } else if (isNaN(grade.assignment)) {
      errors.push('Nilai tugas tidak valid');
    } else if (grade.assignment < 0) {
      errors.push('Nilai tugas tidak boleh kurang dari 0');
    } else if (grade.assignment > 100) {
      errors.push('Nilai tugas tidak boleh lebih dari 100');
    } else if (grade.assignment < 60 && grade.assignment > 0) {
      warnings.push('Nilai tugas rendah, pertimbangkan remedial');
    }
  }

  // Validate mid exam score
  if (grade.midExam !== undefined) {
    if (typeof grade.midExam !== 'number') {
      errors.push('Nilai UTS harus berupa angka');
    } else if (isNaN(grade.midExam)) {
      errors.push('Nilai UTS tidak valid');
    } else if (grade.midExam < 0) {
      errors.push('Nilai UTS tidak boleh kurang dari 0');
    } else if (grade.midExam > 100) {
      errors.push('Nilai UTS tidak boleh lebih dari 100');
    } else if (grade.midExam < 60 && grade.midExam > 0) {
      warnings.push('Nilai UTS rendah, pertimbangkan remedial');
    }
  }

  // Validate final exam score
  if (grade.finalExam !== undefined) {
    if (typeof grade.finalExam !== 'number') {
      errors.push('Nilai UAS harus berupa angka');
    } else if (isNaN(grade.finalExam)) {
      errors.push('Nilai UAS tidak valid');
    } else if (grade.finalExam < 0) {
      errors.push('Nilai UAS tidak boleh kurang dari 0');
    } else if (grade.finalExam > 100) {
      errors.push('Nilai UAS tidak boleh lebih dari 100');
    } else if (grade.finalExam < 60 && grade.finalExam > 0) {
      warnings.push('Nilai UAS rendah, pertimbangkan remedial');
    }
  }

  // Check if at least one score is provided
  const hasAnyScore = grade.assignment !== undefined || grade.midExam !== undefined || grade.finalExam !== undefined;
  if (!hasAnyScore) {
    errors.push('Setidaknya satu nilai harus diisi');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates class/student data
 */
export const validateClassData = (data: Partial<ClassFormData>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Nama siswa tidak boleh kosong');
  } else if (data.name.trim().length < 3) {
    errors.push('Nama siswa minimal 3 karakter');
  } else if (data.name.trim().length > 100) {
    errors.push('Nama siswa maksimal 100 karakter');
  } else if (!/^[a-zA-Z\s.'-]+$/.test(data.name.trim())) {
    warnings.push('Nama siswa mengandung karakter tidak biasa');
  }

  // Validate NIS
  if (!data.nis || data.nis.trim().length === 0) {
    errors.push('NIS tidak boleh kosong');
  } else if (!/^\d+$/.test(data.nis.trim())) {
    errors.push('NIS hanya boleh berisi angka');
  } else if (data.nis.length < 5 || data.nis.length > 20) {
    errors.push('NIS harus antara 5-20 digit');
  }

  // Validate gender
  if (data.gender && !['L', 'P'].includes(data.gender)) {
    errors.push('Jenis kelamin tidak valid');
  }

  // Validate address
  if (data.address && data.address.trim().length > 200) {
    errors.push('Alamat maksimal 200 karakter');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates material data
 */
export const validateMaterialData = (data: Partial<MaterialFormData>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate title
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Judul materi tidak boleh kosong');
  } else if (data.title.trim().length < 3) {
    errors.push('Judul materi minimal 3 karakter');
  } else if (data.title.trim().length > 200) {
    errors.push('Judul materi maksimal 200 karakter');
  }

  // Validate description
  if (!data.description || data.description.trim().length === 0) {
    warnings.push('Deskripsi materi kosong, pertimbangkan menambahkannya');
  } else if (data.description.length > 1000) {
    errors.push('Deskripsi materi maksimal 1000 karakter');
  }

  // Validate category
  if (!data.category || data.category.trim().length === 0) {
    errors.push('Kategori materi tidak boleh kosong');
  }

  // Validate file
  if (data.fileUrl && data.fileSize) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (data.fileSize > maxSize) {
      errors.push('Ukuran file maksimal 50MB');
    }

    if (!data.fileType) {
      warnings.push('Tipe file tidak terdeteksi');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates batch operations
 */
export const validateBatchOperation = (studentIds: string[], operation: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (studentIds.length === 0) {
    errors.push('Tidak ada siswa yang dipilih');
  }

  if (studentIds.length > 50) {
    warnings.push('Memproses banyak siswa dapat memakan waktu lama');
  }

  if (operation === 'delete' || operation === 'archive') {
    errors.push(`Konfirmasi diperlukan untuk operasi ${operation}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates search input
 */
export const validateSearchInput = (searchTerm: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (searchTerm.length > 100) {
    errors.push('Kata pencarian maksimal 100 karakter');
  }

  if (searchTerm && !/^[a-zA-Z0-9\s.-]+$/.test(searchTerm)) {
    warnings.push('Gunakan kata pencarian yang lebih sederhana');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Calculates final grade from components
 */
export const calculateFinalGrade = (assignment: number, midExam: number, finalExam: number): number => {
  return Math.round(((assignment * 0.3) + (midExam * 0.3) + (finalExam * 0.4)) * 10) / 10;
};

/**
 * Gets grade letter from numeric score
 */
export const getGradeLetter = (score: number): string => {
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  return 'D';
};

/**
 * Validates grade composition
 */
export const validateGradeComposition = (grade: GradeInput): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const hasAllScores = grade.assignment !== undefined && 
                      grade.midExam !== undefined && 
                      grade.finalExam !== undefined;

  if (hasAllScores) {
    const finalScore = calculateFinalGrade(grade.assignment!, grade.midExam!, grade.finalExam!);
    if (finalScore < 60) {
      warnings.push('Nilai akhir dibawah standar kelulusan (60)');
    }
  } else {
    const providedScores = Object.values(grade).filter(v => v !== undefined).length;
    if (providedScores === 1) {
      warnings.push('Hanya satu nilai yang diisi, hasil mungkin tidak representatif');
    } else if (providedScores === 2) {
      warnings.push('Dua nilai yang diisi, pertimbangkan melengkapi nilai yang tersisa');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};