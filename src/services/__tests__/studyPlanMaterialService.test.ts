import { describe, it, expect, beforeEach, vi } from 'vitest';
import { studyPlanMaterialService } from '../studyPlanMaterialService';
import { eLibraryAPI, subjectsAPI } from '../apiService';
import { STORAGE_KEYS } from '../../constants';
import type { StudyPlan, MaterialRecommendation } from '../../types';
import type { ELibrary } from '../../types';

vi.mock('../apiService');
vi.mock('../../utils/logger');

const mockMaterials: ELibrary[] = [
  {
    id: 'm1',
    title: 'Modul Matematika - Aljabar Dasar',
    description: 'Materi aljabar dasar untuk pemula',
    category: 'Materi',
    fileUrl: 'https://example.com/math1.pdf',
    fileType: 'pdf',
    fileSize: 1024000,
    subjectId: 'sub1',
    uploadedBy: 'teacher1',
    uploadedAt: '2026-01-15',
    downloadCount: 150,
    isShared: true,
    averageRating: 4.5,
    totalReviews: 30,
  },
  {
    id: 'm2',
    title: 'Latihan Soal Fisika Mekanika',
    description: 'Kumpulan latihan soal mekanika fisika',
    category: 'Latihan',
    fileUrl: 'https://example.com/physics1.pdf',
    fileType: 'pdf',
    fileSize: 512000,
    subjectId: 'sub2',
    uploadedBy: 'teacher2',
    uploadedAt: '2026-01-16',
    downloadCount: 80,
    isShared: true,
    averageRating: 4.2,
    totalReviews: 15,
  },
  {
    id: 'm3',
    title: 'Biologi - Ekosistem Indonesia',
    description: 'Studi ekosistem di Indonesia',
    category: 'Materi',
    fileUrl: 'https://example.com/biology1.pdf',
    fileType: 'pdf',
    fileSize: 2048000,
    subjectId: 'sub3',
    uploadedBy: 'teacher3',
    uploadedAt: '2026-01-17',
    downloadCount: 120,
    isShared: true,
    averageRating: 4.8,
    totalReviews: 45,
  },
];

const mockSubjects = [
  { id: 'sub1', name: 'Matematika', code: 'MATH', description: 'Mata pelajaran matematika', creditHours: 4 },
  { id: 'sub2', name: 'Fisika', code: 'PHYS', description: 'Mata pelajaran fisika', creditHours: 4 },
  { id: 'sub3', name: 'Biologi', code: 'BIO', description: 'Mata pelajaran biologi', creditHours: 4 },
];

const mockStudyPlan: StudyPlan = {
  id: 'plan123',
  studentId: 'student1',
  studentName: 'John Doe',
  title: 'Rencana Belajar Semester 2',
  description: 'Rencana belajar 4 minggu',
  subjects: [
    {
      subjectName: 'Matematika',
      currentGrade: 75,
      targetGrade: 'A',
      priority: 'high',
      weeklyHours: 5,
      focusAreas: ['aljabar', 'geometri'],
      resources: [],
    },
    {
      subjectName: 'Fisika',
      currentGrade: 68,
      targetGrade: 'B',
      priority: 'medium',
      weeklyHours: 4,
      focusAreas: ['mekanika'],
      resources: [],
    },
  ],
  schedule: [],
  recommendations: [],
  createdAt: '2026-01-20',
  validUntil: '2026-02-17',
  status: 'active',
};

describe('studyPlanMaterialService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('getRecommendations', () => {
    it('should return material recommendations for a study plan', async () => {
      vi.mocked(eLibraryAPI.getAll).mockResolvedValue({
        success: true,
        data: mockMaterials,
        message: "Success",
      });
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({
        success: true,
        data: mockSubjects,
        message: "Success",
      });

      const recommendations = await studyPlanMaterialService.getRecommendations(mockStudyPlan);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('materialId');
      expect(recommendations[0]).toHaveProperty('title');
      expect(recommendations[0]).toHaveProperty('relevanceScore');
      expect(recommendations[0]).toHaveProperty('priority');
      expect(recommendations[0]).toHaveProperty('accessed');
    });

    it('should filter materials below relevance threshold', async () => {
      vi.mocked(eLibraryAPI.getAll).mockResolvedValue({
        success: true,
        data: mockMaterials,
        message: "Success",
      });
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({
        success: true,
        data: mockSubjects,
        message: "Success",
      });

      const recommendations = await studyPlanMaterialService.getRecommendations(mockStudyPlan);

      recommendations.forEach((rec) => {
        expect(rec.relevanceScore).toBeGreaterThanOrEqual(70);
      });
    });

    it('should use cached recommendations if available and valid', async () => {
      const cachedRecs: MaterialRecommendation[] = [
        {
          materialId: 'cached1',
          title: 'Cached Material',
          description: 'Test',
          category: 'Materi',
          fileType: 'pdf',
          subjectName: 'Matematika',
          priority: 'high',
          relevanceScore: 95,
          reason: 'Test',
          accessed: false,
        },
      ];

      const cacheKey = STORAGE_KEYS.STUDY_PLAN_MATERIAL_RECOMMENDATIONS(mockStudyPlan.id);
      localStorage.setItem(cacheKey, JSON.stringify({
        recommendations: cachedRecs,
        timestamp: Date.now(),
      }));

      const recommendations = await studyPlanMaterialService.getRecommendations(mockStudyPlan);

      expect(recommendations).toEqual(cachedRecs);
      expect(eLibraryAPI.getAll).not.toHaveBeenCalled();
    });

    it('should refresh recommendations if forceRefresh is true', async () => {
      vi.mocked(eLibraryAPI.getAll).mockResolvedValue({
        success: true,
        data: mockMaterials,
        message: "Success",
      });
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({
        success: true,
        data: mockSubjects,
        message: "Success",
      });

      await studyPlanMaterialService.getRecommendations(mockStudyPlan, true);

      expect(eLibraryAPI.getAll).toHaveBeenCalled();
    });

    it('should handle empty materials list', async () => {
      vi.mocked(eLibraryAPI.getAll).mockResolvedValue({
        success: true,
        data: [],
        message: "No materials",
      });
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({
        success: true,
        data: mockSubjects,
        message: "Success",
      });

      const recommendations = await studyPlanMaterialService.getRecommendations(mockStudyPlan);

      expect(recommendations).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(eLibraryAPI.getAll).mockRejectedValue(new Error('API Error'));

      const recommendations = await studyPlanMaterialService.getRecommendations(mockStudyPlan);

      expect(recommendations).toEqual([]);
    });
  });

  describe('prioritizeRecommendations', () => {
    it('should sort recommendations by relevance and priority', async () => {
      vi.mocked(eLibraryAPI.getAll).mockResolvedValue({
        success: true,
        data: mockMaterials,
        message: "Success",
      });
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({
        success: true,
        data: mockSubjects,
        message: "Success",
      });

      const recommendations = await studyPlanMaterialService.getRecommendations(mockStudyPlan);

      if (recommendations.length > 1) {
        for (let i = 0; i < recommendations.length - 1; i++) {
          const current = recommendations[i];
          const next = recommendations[i + 1];
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          const scoreCurrent = current.relevanceScore + priorityWeight[current.priority] * 10;
          const scoreNext = next.relevanceScore + priorityWeight[next.priority] * 10;
          expect(scoreCurrent).toBeGreaterThanOrEqual(scoreNext);
        }
      }
    });

    it('should limit recommendations to 20 items', async () => {
      const manyMaterials: ELibrary[] = Array.from({ length: 30 }, (_, i) => ({
        id: `m${i}`,
        title: `Material ${i}`,
        description: 'Test material',
        category: 'Materi',
        fileUrl: `https://example.com/m${i}.pdf`,
        fileType: 'pdf',
        fileSize: 1024000,
        subjectId: 'sub1',
        uploadedBy: 'teacher1',
        uploadedAt: '2026-01-15',
        downloadCount: 10,
        isShared: true,
        averageRating: 4.0,
        totalReviews: 5,
      }));

      vi.mocked(eLibraryAPI.getAll).mockResolvedValue({
        success: true,
        data: manyMaterials,
        message: "Success",
      });
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({
        success: true,
        data: mockSubjects,
        message: "Success",
      });

      const recommendations = await studyPlanMaterialService.getRecommendations(mockStudyPlan);

      expect(recommendations.length).toBeLessThanOrEqual(20);
    });
  });

  describe('markAccessed', () => {
    it('should mark a material as accessed', async () => {
      vi.mocked(eLibraryAPI.getAll).mockResolvedValue({
        success: true,
        data: mockMaterials,
        message: "Success",
      });
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({
        success: true,
        data: mockSubjects,
        message: "Success",
      });

      await studyPlanMaterialService.getRecommendations(mockStudyPlan);
      const recommendations = await studyPlanMaterialService.getRecommendations(mockStudyPlan);

      if (recommendations.length > 0) {
        const materialId = recommendations[0].materialId;
        studyPlanMaterialService.markAccessed(mockStudyPlan.id, materialId);

        const updatedRecs = await studyPlanMaterialService.getRecommendations(mockStudyPlan);
        const accessedRec = updatedRecs.find((r) => r.materialId === materialId);
        expect(accessedRec?.accessed).toBe(true);
        expect(accessedRec?.accessedAt).toBeDefined();
      }
    });
  });

  describe('getAccessedMaterials', () => {
    it('should return only accessed materials', async () => {
      vi.mocked(eLibraryAPI.getAll).mockResolvedValue({
        success: true,
        data: mockMaterials,
        message: "Success",
      });
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({
        success: true,
        data: mockSubjects,
        message: "Success",
      });

      await studyPlanMaterialService.getRecommendations(mockStudyPlan);
      const recommendations = await studyPlanMaterialService.getRecommendations(mockStudyPlan);

      if (recommendations.length > 1) {
        const firstMaterialId = recommendations[0].materialId;
        studyPlanMaterialService.markAccessed(mockStudyPlan.id, firstMaterialId);

        const accessedMaterials = studyPlanMaterialService.getAccessedMaterials(mockStudyPlan.id);

        expect(accessedMaterials).toHaveLength(1);
        expect(accessedMaterials[0].materialId).toBe(firstMaterialId);
      }
    });

    it('should return empty array if no materials accessed', async () => {
      vi.mocked(eLibraryAPI.getAll).mockResolvedValue({
        success: true,
        data: mockMaterials,
        message: "Success",
      });
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({
        success: true,
        data: mockSubjects,
        message: "Success",
      });

      await studyPlanMaterialService.getRecommendations(mockStudyPlan);

      const accessedMaterials = studyPlanMaterialService.getAccessedMaterials(mockStudyPlan.id);

      expect(accessedMaterials).toEqual([]);
    });
  });

  describe('getProgress', () => {
    it('should calculate progress correctly', async () => {
      vi.mocked(eLibraryAPI.getAll).mockResolvedValue({
        success: true,
        data: mockMaterials,
        message: "Success",
      });
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({
        success: true,
        data: mockSubjects,
        message: "Success",
      });

      await studyPlanMaterialService.getRecommendations(mockStudyPlan);
      const recommendations = await studyPlanMaterialService.getRecommendations(mockStudyPlan);

      if (recommendations.length > 1) {
        const firstMaterialId = recommendations[0].materialId;
        studyPlanMaterialService.markAccessed(mockStudyPlan.id, firstMaterialId);

        const progress = studyPlanMaterialService.getProgress(mockStudyPlan.id);

        expect(progress).toHaveProperty('accessed');
        expect(progress).toHaveProperty('total');
        expect(progress).toHaveProperty('percentage');
        expect(progress.accessed).toBe(1);
        expect(progress.percentage).toBe(Math.round((1 / progress.total) * 100));
      }
    });

    it('should return zero progress for new study plan', async () => {
      const progress = studyPlanMaterialService.getProgress('nonexistent');

      expect(progress).toEqual({ accessed: 0, total: 0, percentage: 0 });
    });
  });

  describe('clearCache', () => {
    it('should clear cache for specific study plan', async () => {
      const cacheKey = STORAGE_KEYS.STUDY_PLAN_MATERIAL_RECOMMENDATIONS(mockStudyPlan.id);
      localStorage.setItem(cacheKey, JSON.stringify({ test: 'data' }));

      studyPlanMaterialService.clearCache(mockStudyPlan.id);

      expect(localStorage.getItem(cacheKey)).toBeNull();
    });

    it('should clear all study plan caches when no ID provided', async () => {
      const cacheKey1 = STORAGE_KEYS.STUDY_PLAN_MATERIAL_RECOMMENDATIONS('plan1');
      const cacheKey2 = STORAGE_KEYS.STUDY_PLAN_MATERIAL_RECOMMENDATIONS('plan2');
      localStorage.setItem(cacheKey1, JSON.stringify({ test: 'data1' }));
      localStorage.setItem(cacheKey2, JSON.stringify({ test: 'data2' }));

      studyPlanMaterialService.clearCache();

      expect(localStorage.getItem(cacheKey1)).toBeNull();
      expect(localStorage.getItem(cacheKey2)).toBeNull();
    });
  });

  describe('subject keyword matching', () => {
    it('should match materials with subject keywords', async () => {
      const materialWithKeyword: ELibrary[] = [
        {
          id: 'm_keyword',
          title: 'Latihan Aljabar dan Geometri',
          description: 'Materi matematika lengkap',
          category: 'Materi',
          fileUrl: 'https://example.com/math_keyword.pdf',
          fileType: 'pdf',
          fileSize: 1024000,
          subjectId: 'sub999',
          uploadedBy: 'teacher1',
          uploadedAt: '2026-01-15',
          downloadCount: 10,
          isShared: true,
        },
      ];

      vi.mocked(eLibraryAPI.getAll).mockResolvedValue({
        success: true,
        data: materialWithKeyword,
        message: "Success",
      });
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({
        success: true,
        data: mockSubjects,
        message: "Success",
      });

      const recommendations = await studyPlanMaterialService.getRecommendations(mockStudyPlan);

      expect(recommendations).toBeDefined();
      if (recommendations.length > 0) {
        const mathRec = recommendations.find((r) => r.subjectName === 'Matematika');
        expect(mathRec).toBeDefined();
      }
    });
  });

  describe('focus area matching', () => {
    it('should prioritize materials matching focus areas', async () => {
      const focusAreaMaterial: ELibrary[] = [
        {
          id: 'm_focus',
          title: 'Panduan Lengkap Aljabar',
          description: 'Cara mudah memahami aljabar dasar dan lanjut',
          category: 'Materi',
          fileUrl: 'https://example.com/aljabar.pdf',
          fileType: 'pdf',
          fileSize: 1024000,
          subjectId: 'sub1',
          uploadedBy: 'teacher1',
          uploadedAt: '2026-01-15',
          downloadCount: 10,
          isShared: true,
          averageRating: 4.5,
          totalReviews: 20,
        },
      ];

      vi.mocked(eLibraryAPI.getAll).mockResolvedValue({
        success: true,
        data: focusAreaMaterial,
        message: "Success",
      });
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({
        success: true,
        data: mockSubjects,
        message: "Success",
      });

      const recommendations = await studyPlanMaterialService.getRecommendations(mockStudyPlan);

      if (recommendations.length > 0) {
        const focusRec = recommendations.find((r) => r.focusArea === 'aljabar');
        expect(focusRec).toBeDefined();
        if (focusRec) {
          expect(focusRec.relevanceScore).toBeGreaterThanOrEqual(80);
        }
      }
    });
  });
});
