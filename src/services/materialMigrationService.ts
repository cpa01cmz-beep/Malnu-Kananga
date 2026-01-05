import { Subject } from '../types';
import { eLibraryAPI } from '../services/apiService';
import { categoryService } from '../services/categoryService';
import { logger } from '../utils/logger';

export interface MigrationResult {
  totalMaterials: number;
  updatedMaterials: number;
  failedMaterials: number;
  unmatchedCategories: string[];
  duration: number;
}

export class MaterialMigrationService {
  private static instance: MaterialMigrationService;

  private constructor() {}

  static getInstance(): MaterialMigrationService {
    if (!MaterialMigrationService.instance) {
      MaterialMigrationService.instance = new MaterialMigrationService();
    }
    return MaterialMigrationService.instance;
  }

  async migrateExistingMaterials(): Promise<MigrationResult> {
    const startTime = Date.now();
    logger.info('Starting material migration...');

    try {
      // Fetch all materials
      const materialsResponse = await eLibraryAPI.getAll();
      if (!materialsResponse.success || !materialsResponse.data) {
        throw new Error('Failed to fetch materials for migration');
      }

      const materials = materialsResponse.data;
      const subjects = await categoryService.getSubjects();
      
      // Create mapping from category names to subject IDs
      const categoryToSubjectMap = this.createCategoryMapping(subjects);
      
      const results: MigrationResult = {
        totalMaterials: materials.length,
        updatedMaterials: 0,
        failedMaterials: 0,
        unmatchedCategories: [],
        duration: 0
      };

      // Process each material
      for (const material of materials) {
        try {
          if (material.subjectId) {
            // Already has subjectId, skip
            continue;
          }

          const categoryId = material.category;
          if (!categoryId) {
            // No category, assign to "Umum" if available
            const umumSubject = subjects.find(s => 
              s.name.toLowerCase().includes('umum') || 
              s.name.toLowerCase().includes('general')
            );
            
            if (umumSubject) {
              await this.updateMaterialSubjectId(material.id, umumSubject.id);
              results.updatedMaterials++;
            } else {
              results.unmatchedCategories.push('(tanpa kategori)');
            }
            continue;
          }

          // Try to find matching subject
          const subjectId = categoryToSubjectMap[categoryId.toLowerCase()];
          if (subjectId) {
            await this.updateMaterialSubjectId(material.id, subjectId);
            results.updatedMaterials++;
          } else {
            // No exact match, try fuzzy matching
            const matchedSubject = this.findFuzzyMatch(categoryId, subjects);
            if (matchedSubject) {
              await this.updateMaterialSubjectId(material.id, matchedSubject.id);
              results.updatedMaterials++;
              logger.info(`Fuzzy matched "${categoryId}" to "${matchedSubject.name}"`);
            } else {
              results.unmatchedCategories.push(categoryId);
              logger.warn(`No subject found for category: "${categoryId}"`);
            }
          }
        } catch (error) {
          results.failedMaterials++;
          logger.error(`Failed to migrate material ${material.id}:`, error);
        }
      }

      results.duration = Date.now() - startTime;
      logger.info(`Migration completed in ${results.duration}ms`, results);
      
      return results;
    } catch (error) {
      logger.error('Migration failed:', error);
      throw error;
    }
  }

  private createCategoryMapping(subjects: Subject[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    
    subjects.forEach(subject => {
      const key = subject.name.toLowerCase();
      mapping[key] = subject.id;
      
      // Add common variations
      const variations = this.getCategoryVariations(subject.name);
      variations.forEach(variation => {
        mapping[variation.toLowerCase()] = subject.id;
      });
    });

    return mapping;
  }

  private getCategoryVariations(subjectName: string): string[] {
    const variations: string[] = [subjectName];
    const lowerName = subjectName.toLowerCase();

    // Common variations for Indonesian subjects
    if (lowerName.includes('matematika')) {
      variations.push('Matematika', 'Math');
    }
    if (lowerName.includes('bahasa indonesia')) {
      variations.push('B. Indonesia', 'Indonesia');
    }
    if (lowerName.includes('bahasa inggris')) {
      variations.push('B. Inggris', 'English', 'Inggris');
    }
    if (lowerName.includes('fisika')) {
      variations.push('Physics');
    }
    if (lowerName.includes('biologi')) {
      variations.push('Biology');
    }
    if (lowerName.includes('sejarah')) {
      variations.push('History');
    }
    if (lowerName.includes('umum')) {
      variations.push('General', 'Lainnya');
    }

    return variations;
  }

  private findFuzzyMatch(categoryName: string, subjects: Subject[]): Subject | null {
    const categoryLower = categoryName.toLowerCase();
    
    // Use similarity matching
    let bestMatch: Subject | null = null;
    let bestScore = 0;

    subjects.forEach(subject => {
      const subjectLower = subject.name.toLowerCase();
      const score = this.calculateSimilarity(categoryLower, subjectLower);
      
      if (score > bestScore && score > 0.7) { // 70% similarity threshold
        bestScore = score;
        bestMatch = subject;
      }
    });

    return bestMatch;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
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

  private async updateMaterialSubjectId(materialId: string, subjectId: string): Promise<void> {
    // Note: This depends on the API implementation
    // In a real implementation, you would call the appropriate update endpoint
    const response = await eLibraryAPI.update(materialId, { subjectId });
    
    if (!response.success) {
      throw new Error(`Failed to update material ${materialId}: ${response.message}`);
    }
  }

  async validateMigration(): Promise<{
    materialsWithoutSubjectId: number;
    totalMaterials: number;
    migrationPercentage: number;
  }> {
    const materialsResponse = await eLibraryAPI.getAll();
    if (!materialsResponse.success || !materialsResponse.data) {
      throw new Error('Failed to fetch materials for validation');
    }

    const materials = materialsResponse.data;
    const materialsWithoutSubjectId = materials.filter(m => !m.subjectId).length;
    const totalMaterials = materials.length;
    const migrationPercentage = totalMaterials > 0 
      ? ((totalMaterials - materialsWithoutSubjectId) / totalMaterials) * 100 
      : 100;

    return {
      materialsWithoutSubjectId,
      totalMaterials,
      migrationPercentage
    };
  }

  generateUnmatchedCategoriesReport(unmatchedCategories: string[]): string {
    if (unmatchedCategories.length === 0) {
      return 'Semua kategori berhasil dicocokkan dengan mata pelajaran.';
    }

    const uniqueCategories = Array.from(new Set(unmatchedCategories));
    const report = [
      'Kategori yang tidak cocok dengan mata pelajaran:',
      ...uniqueCategories.map(category => `  - ${category}`),
      '',
      'Rekomendasi:',
      '1. Tambahkan mata pelajaran baru untuk kategori ini melalui panel admin',
      '2. Pertimbangkan untuk menggabungkan kategori serupa',
      '3. Perbarui nama kategori agar sesuai dengan standar kurikulum'
    ];

    return report.join('\n');
  }
}

export const materialMigrationService = MaterialMigrationService.getInstance();