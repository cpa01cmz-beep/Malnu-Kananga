import { eLibraryAPI, subjectsAPI } from './apiService';
import { logger } from '../utils/logger';
import { STORAGE_KEYS } from '../constants';
import type { StudyPlan, MaterialRecommendation } from '../types';
import type { ELibrary } from '../types';

interface StudyPlanWithSubjects extends StudyPlan {
  subjectMapping: Map<string, string>;
}

class StudyPlanMaterialService {
  async getRecommendations(
    studyPlan: StudyPlan,
    forceRefresh = false
  ): Promise<MaterialRecommendation[]> {
    if (!forceRefresh) {
      const cached = this.getCachedRecommendations(studyPlan.id);
      if (cached && this.isCacheValid(cached)) {
        logger.info('Using cached material recommendations for study plan:', studyPlan.id);
        return cached.recommendations;
      }
    }

    const materials = await this.fetchAllMaterials();
    const studyPlanWithSubjects = await this.enrichStudyPlanWithSubjectIds(studyPlan);

    const recommendations = await this.generateRecommendations(
      studyPlanWithSubjects,
      materials
    );

    const prioritized = this.prioritizeRecommendations(recommendations, studyPlanWithSubjects);

    this.cacheRecommendations(studyPlan.id, prioritized);

    return prioritized;
  }

  async fetchAllMaterials(): Promise<ELibrary[]> {
    try {
      const response = await eLibraryAPI.getAll();
      if (response.success && response.data) {
        return response.data;
      }
      logger.warn('Failed to fetch E-Library materials:', response.message);
      return [];
    } catch (error) {
      logger.error('Error fetching E-Library materials:', error);
      return [];
    }
  }

  private async enrichStudyPlanWithSubjectIds(
    studyPlan: StudyPlan
  ): Promise<StudyPlanWithSubjects> {
    const subjectsRes = await subjectsAPI.getAll();
    const subjectMapping = new Map<string, string>();

    if (subjectsRes.success && subjectsRes.data) {
      studyPlan.subjects.forEach((subject) => {
        const matchedSubject = subjectsRes.data!.find(
          (s) => s.name.toLowerCase() === subject.subjectName.toLowerCase()
        );
        if (matchedSubject) {
          subjectMapping.set(subject.subjectName, matchedSubject.id);
        }
      });
    }

    return { ...studyPlan, subjectMapping };
  }

  private async generateRecommendations(
    studyPlanWithSubjects: StudyPlanWithSubjects,
    materials: ELibrary[]
  ): Promise<MaterialRecommendation[]> {
    const recommendations: MaterialRecommendation[] = [];

    for (const subject of studyPlanWithSubjects.subjects) {
      const subjectId = studyPlanWithSubjects.subjectMapping.get(subject.subjectName);
      if (!subjectId) continue;

      const subjectMaterials = materials.filter(
        (m) => m.subjectId === subjectId || this.matchesSubjectKeywords(m, subject.subjectName)
      );

      if (subjectMaterials.length === 0) continue;

      const matches = this.matchMaterialsToSubject(
        subjectMaterials,
        subject,
        studyPlanWithSubjects
      );

      recommendations.push(...matches);
    }

    return recommendations;
  }

  private matchesSubjectKeywords(material: ELibrary, subjectName: string): boolean {
    const keywords = [subjectName.toLowerCase(), ...this.getSubjectKeywords(subjectName)];
    const materialText = `${material.title} ${material.description} ${material.category}`.toLowerCase();
    return keywords.some((keyword) => materialText.includes(keyword));
  }

  private getSubjectKeywords(subjectName: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'matematika': ['matematika', 'matematik', 'math', 'aljabar', 'geometri', 'statistika', 'kalkulus'],
      'bahasa indonesia': ['indonesia', 'bahasa', 'sastra', 'puitika', 'pros'],
      'bahasa inggris': ['inggris', 'english', 'esai', 'narrative', 'descriptive'],
      'fisika': ['fisika', 'physics', 'mekanika', 'listrik', 'magnet', 'energi'],
      'kimia': ['kimia', 'chemistry', 'unsur', 'senyawa', 'reaksi'],
      'biologi': ['biologi', 'biology', 'sel', 'genetika', 'ekosistem', 'makhluk hidup'],
      'sejarah': ['sejarah', 'history', 'kolonial', 'independensi', 'revolusi'],
      'geografi': ['geografi', 'geography', 'peta', 'wilayah', 'iklim'],
      'ekonomi': ['ekonomi', 'economy', 'bisnis', 'pasar', 'inflasi', 'produksi'],
      'sosiologi': ['sosiologi', 'sociology', 'masyarakat', 'sosial', 'konflik'],
    };
    return keywordMap[subjectName.toLowerCase()] || [];
  }

  private matchMaterialsToSubject(
    materials: ELibrary[],
    subject: StudyPlan['subjects'][0],
    _studyPlan: StudyPlanWithSubjects
  ): MaterialRecommendation[] {
    const recommendations: MaterialRecommendation[] = [];

    for (const material of materials.slice(0, 5)) {
      const relevanceScore = this.calculateRelevance(material, subject, _studyPlan);

      if (relevanceScore >= 70) {
        const reason = this.buildReason(material, subject, relevanceScore);

        recommendations.push({
          materialId: material.id,
          title: material.title,
          description: material.description || 'Tidak ada deskripsi',
          category: material.category,
          fileType: material.fileType,
          subjectName: subject.subjectName,
          priority: this.determinePriority(relevanceScore, subject.priority),
          relevanceScore,
          reason,
          focusArea: this.findMatchingFocusArea(material, subject.focusAreas),
          accessed: false,
        });
      }
    }

    return recommendations;
  }

  private calculateRelevance(
    material: ELibrary,
    subject: StudyPlan['subjects'][0],
    _studyPlan: StudyPlanWithSubjects
  ): number {
    let score = 50;

    const materialText = `${material.title} ${material.description} ${material.category}`.toLowerCase();

    const keywords = this.getSubjectKeywords(subject.subjectName);
    keywords.forEach((keyword) => {
      if (materialText.includes(keyword)) {
        score += 10;
      }
    });

    subject.focusAreas.forEach((focusArea) => {
      if (materialText.includes(focusArea.toLowerCase())) {
        score += 15;
      }
    });

    if (material.averageRating && material.averageRating >= 4.0) {
      score += 10;
    }

    if (subject.priority === 'high') {
      score += 5;
    } else if (subject.priority === 'medium') {
      score += 3;
    }

    return Math.min(score, 100);
  }

  private buildReason(
    material: ELibrary,
    subject: StudyPlan['subjects'][0],
    _relevanceScore: number
  ): string {
    const reasons: string[] = [];

    const keywords = this.getSubjectKeywords(subject.subjectName);
    const materialText = `${material.title} ${material.description}`.toLowerCase();

    if (keywords.some((keyword) => materialText.includes(keyword))) {
      reasons.push('Relevan dengan mata pelajaran');
    }

    const matchingFocusArea = this.findMatchingFocusArea(material, subject.focusAreas);
    if (matchingFocusArea) {
      reasons.push(`Mendukung fokus belajar: ${matchingFocusArea}`);
    }

    if (material.averageRating && material.averageRating >= 4.0) {
      reasons.push('Rating tinggi dari pengguna lain');
    }

    return reasons.length > 0 ? reasons.join('. ') : 'Materi relevan untuk belajar';
  }

  private findMatchingFocusArea(
    material: ELibrary,
    focusAreas: string[]
  ): string | undefined {
    const materialText = `${material.title} ${material.description} ${material.category}`.toLowerCase();

    for (const focusArea of focusAreas) {
      if (materialText.includes(focusArea.toLowerCase())) {
        return focusArea;
      }
    }

    return undefined;
  }

  private determinePriority(
    relevanceScore: number,
    subjectPriority: string
  ): 'high' | 'medium' | 'low' {
    if (relevanceScore >= 90 || subjectPriority === 'high') {
      return 'high';
    } else if (relevanceScore >= 80 || subjectPriority === 'medium') {
      return 'medium';
    }
    return 'low';
  }

  private prioritizeRecommendations(
    recommendations: MaterialRecommendation[],
    _studyPlan: StudyPlanWithSubjects
  ): MaterialRecommendation[] {
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    return recommendations
      .sort((a, b) => {
        const scoreA = a.relevanceScore + priorityWeight[a.priority] * 10;
        const scoreB = b.relevanceScore + priorityWeight[b.priority] * 10;
        return scoreB - scoreA;
      })
      .slice(0, 20);
  }

  markAccessed(studyPlanId: string, materialId: string): void {
    const cached = this.getCachedRecommendations(studyPlanId);
    if (cached) {
      const rec = cached.recommendations.find((r) => r.materialId === materialId);
      if (rec) {
        rec.accessed = true;
        rec.accessedAt = new Date().toISOString();
        this.cacheRecommendations(studyPlanId, cached.recommendations);
      }
    }
  }

  getAccessedMaterials(studyPlanId: string): MaterialRecommendation[] {
    const cached = this.getCachedRecommendations(studyPlanId);
    if (cached) {
      return cached.recommendations.filter((r) => r.accessed);
    }
    return [];
  }

  getProgress(studyPlanId: string): { accessed: number; total: number; percentage: number } {
    const cached = this.getCachedRecommendations(studyPlanId);
    if (cached) {
      const total = cached.recommendations.length;
      const accessed = cached.recommendations.filter((r) => r.accessed).length;
      const percentage = total > 0 ? Math.round((accessed / total) * 100) : 0;
      return { accessed, total, percentage };
    }
    return { accessed: 0, total: 0, percentage: 0 };
  }

  clearCache(studyPlanId?: string): void {
    if (studyPlanId) {
      localStorage.removeItem(STORAGE_KEYS.STUDY_PLAN_MATERIAL_RECOMMENDATIONS(studyPlanId));
    } else {
      Object.keys(localStorage)
        .filter((key) => key.includes('malnu_study_plan_material_recommendations_'))
        .forEach((key) => localStorage.removeItem(key));
    }
  }

  private getCachedRecommendations(
    studyPlanId: string
  ): { recommendations: MaterialRecommendation[]; timestamp: number } | null {
    try {
      const cacheKey = STORAGE_KEYS.STUDY_PLAN_MATERIAL_RECOMMENDATIONS(studyPlanId);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      logger.error('Error reading cached recommendations:', error);
    }
    return null;
  }

  private isCacheValid(cached: { timestamp: number }): boolean {
    const CACHE_TTL = 24 * 60 * 60 * 1000;
    return Date.now() - cached.timestamp < CACHE_TTL;
  }

  private cacheRecommendations(studyPlanId: string, recommendations: MaterialRecommendation[]): void {
    try {
      const cacheKey = STORAGE_KEYS.STUDY_PLAN_MATERIAL_RECOMMENDATIONS(studyPlanId);
      const cacheData = {
        recommendations,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      logger.error('Error caching recommendations:', error);
    }
  }
}

export const studyPlanMaterialService = new StudyPlanMaterialService();
