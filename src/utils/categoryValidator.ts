import { Subject, Class } from '../types';
import { CategoryValidationResult, SubjectWithUsage } from '../services/categoryService';

export class CategoryValidator {
  private static readonly COMMON_SUBJECTS = [
    'Matematika Wajib',
    'Matematika Peminatan', 
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Fisika',
    'Biologi',
    'Sejarah Kebudayaan Islam',
    'Umum'
  ];

  static validateSubjectName(
    subjectName: string,
    availableSubjects: Subject[],
    existingCategories: string[] = []
  ): CategoryValidationResult {
    if (!subjectName || subjectName.trim().length === 0) {
      return {
        valid: false,
        error: 'Nama mata pelajaran wajib diisi'
      };
    }

    const trimmedName = subjectName.trim();

    // Check for exact match in available subjects
    const exactMatch = availableSubjects.find(subject => 
      subject.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (exactMatch) {
      return {
        valid: true
      };
    }

    // Check for match in existing categories (backwards compatibility)
    const existingCategoryMatch = existingCategories.find(category => 
      category.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingCategoryMatch) {
      return {
        valid: true,
        suggestions: [`Kategori "${trimmedName}" ditemukan sebagai kategori lama. Pertimbangkan untuk memperbarui ke mata pelajaran yang valid.`]
      };
    }

    // Check against common subjects for legacy support
    const commonSubjectMatch = this.COMMON_SUBJECTS.find(common => 
      common.toLowerCase() === trimmedName.toLowerCase()
    );

    if (commonSubjectMatch) {
      return {
        valid: true,
        suggestions: [`Menggunakan kategori umum "${commonSubjectMatch}". Pertimbangkan untuk menambahkan sebagai mata pelajaran resmi.`]
      };
    }

    // Find similar subjects for suggestions
    const suggestions = this.findSimilarSubjects(trimmedName, availableSubjects);

    if (suggestions.length > 0) {
      return {
        valid: false,
        error: 'Mata pelajaran tidak ditemukan. Mungkin maksud Anda:',
        suggestions
      };
    }

    return {
      valid: false,
      error: 'Mata pelajaran tidak valid. Pilih dari mata pelajaran yang tersedia atau ajukan kategori baru.',
      suggestions: ['Gunakan tombol "Ajukan Kategori Baru" untuk menambahkan mata pelajaran yang belum terdaftar']
    };
  }

  static validateSubjectClassConsistency(
    subjectId: string,
    classId: string,
    availableSubjects: Subject[],
    availableClasses: Class[]
  ): CategoryValidationResult {
    const subject = availableSubjects.find(s => s.id === subjectId);
    const classInfo = availableClasses.find(c => c.id === classId);

    if (!subject) {
      return {
        valid: false,
        error: 'Mata pelajaran tidak ditemukan'
      };
    }

    if (!classInfo) {
      return {
        valid: false,
        error: 'Kelas tidak ditemukan'
      };
    }

    // This is a basic consistency check - in real implementation 
    // you might check curriculum relationships
    const subjectInClassName = classInfo.name.toLowerCase().includes(subject.name.toLowerCase()) ||
                               subject.name.toLowerCase().includes(classInfo.name.toLowerCase());

    if (!subjectInClassName) {
      return {
        valid: true, // Allow but warn
        suggestions: [`Mata pelajaran "${subject.name}" mungkin tidak sesuai dengan kelas "${classInfo.name}"`]
      };
    }

    return {
      valid: true
    };
  }

  static validateCategorySelection(
    category: string,
    subjectId: string | undefined,
    availableSubjects: Subject[]
  ): CategoryValidationResult {
    if (!category) {
      return {
        valid: false,
        error: 'Kategori wajib dipilih'
      };
    }

    const selectedSubject = availableSubjects.find(s => s.id === subjectId);
    
    if (!selectedSubject) {
      return {
        valid: false,
        error: 'Mata pelajaran tidak valid'
      };
    }

    if (selectedSubject.name !== category) {
      return {
        valid: false,
        error: 'Kategori dan mata pelajaran tidak cocok',
        suggestions: [`Pilih kategori "${selectedSubject.name}" untuk mata pelajaran ini`]
      };
    }

    return {
      valid: true
    };
  }

  static getCategoryStatistics(
    subjects: Subject[],
    materials: Array<{ subjectId?: string; category: string }>
  ): SubjectWithUsage[] {
    const materialStats = new Map<string, number>();
    
    materials.forEach(material => {
      const key = material.subjectId || 'uncategorized';
      materialStats.set(key, (materialStats.get(key) || 0) + 1);
    });

    return subjects.map(subject => ({
      subject,
      materialCount: materialStats.get(subject.id) || 0,
      usedByClasses: [] // This would be populated based on actual class-subject relationships
    })).sort((a, b) => b.materialCount - a.materialCount);
  }

  private static findSimilarSubjects(
    searchName: string,
    availableSubjects: Subject[]
  ): string[] {
    const searchLower = searchName.toLowerCase();
    const suggestions: string[] = [];

    availableSubjects.forEach(subject => {
      const subjectLower = subject.name.toLowerCase();
      
      // Check for partial matches
      if (subjectLower.includes(searchLower) || searchLower.includes(subjectLower)) {
        suggestions.push(subject.name);
        return;
      }

      // Check for word similarity using simple character matching
      const similarity = this.calculateSimilarity(searchLower, subjectLower);
      if (similarity > 0.6) { // 60% similarity threshold
        suggestions.push(subject.name);
      }
    });

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  static validateNewCategorySuggestion(
    categoryName: string,
    description: string,
    existingSubjects: Subject[]
  ): CategoryValidationResult {
    const nameValidation = this.validateSubjectName(categoryName, existingSubjects);
    
    if (nameValidation.valid) {
      return {
        valid: false,
        error: 'Kategori sudah ada dalam sistem',
        suggestions: ['Pilih kategori yang sudah ada dari dropdown']
      };
    }

    if (!description || description.trim().length < 10) {
      return {
        valid: false,
        error: 'Deskripsi kategori minimal 10 karakter untuk mempermudah pemahaman'
      };
    }

    // Check if it's not too similar to existing subjects
    const similarSubjects = this.findSimilarSubjects(categoryName, existingSubjects);
    if (similarSubjects.length > 0) {
      return {
        valid: true,
        suggestions: [`Perhatikan: ada kategori serupa yang sudah ada: ${similarSubjects.join(', ')}`]
      };
    }

    return {
      valid: true
    };
  }
}