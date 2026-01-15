import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateLessonPlan,
  defaultLessonPlanTemplates,
  getTemplateById,
  getAllTemplates
} from '../lessonPlanService';
import type { LessonPlanGenerationRequest } from '../../types/lessonPlan.types';

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn()
    }
  }))
}));

describe('Lesson Plan Service', () => {
  const mockGenerateContent = vi.fn();

  beforeEach(() => {
    mockGenerateContent.mockReset();
    vi.clearAllMocks();
  });

  const mockLessonPlan = {
    id: 'test-id',
    title: 'Test Lesson Plan',
    subject: 'Matematika',
    grade: 'Kelas X',
    topic: 'Aljabar Dasar',
    objectives: [
      'Siswa dapat memahami konsep variabel',
      'Siswa dapat menyelesaikan persamaan linear sederhana'
    ],
    materials: ['Buku teks', 'Spidol', 'Papan tulis'],
    duration: 90,
    activities: [
      {
        id: '1',
        name: 'Pendahuluan',
        description: 'Mengenalkan konsep variabel',
        duration: 10,
        type: 'introduction' as const
      },
      {
        id: '2',
        name: 'Materi Utama',
        description: 'Penjelasan persamaan linear',
        duration: 60,
        type: 'main' as const
      },
      {
        id: '3',
        name: 'Penutup',
        description: 'Rangkuman dan evaluasi',
        duration: 20,
        type: 'conclusion' as const
      }
    ],
    assessment: {
      type: 'formative' as const,
      method: 'Kuis singkat',
      criteria: [
        'Ketepatan jawaban',
        'Pemahaman konsep',
        'Kemampuan menerapkan'
      ],
      rubric: 'Rubrik penilaian kuis'
    },
    homework: 'Selesaikan latihan soal halaman 45-46',
    notes: 'Sesuaikan kecepatan dengan kemampuan siswa',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'AI'
  };

  describe('generateLessonPlan', () => {
    it('should generate a lesson plan successfully', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: 'test-key' });
      
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockLessonPlan)
      });
      
      ai.models.generateContent = mockGenerateContent;

      const request: LessonPlanGenerationRequest = {
        subject: 'Matematika',
        grade: 'Kelas X',
        topic: 'Aljabar Dasar',
        duration: 90,
        includeMaterials: true,
        includeHomework: true
      };

      const result = await generateLessonPlan(request);

      expect(result.success).toBe(true);
      expect(result.lessonPlan).toBeDefined();
      expect(result.lessonPlan?.subject).toBe('Matematika');
      expect(result.lessonPlan?.topic).toBe('Aljabar Dasar');
      expect(result.lessonPlan?.duration).toBe(90);
    });

    it('should return cached lesson plan if available', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: 'test-key' });
      
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockLessonPlan)
      });
      
      ai.models.generateContent = mockGenerateContent;

      const request: LessonPlanGenerationRequest = {
        subject: 'Matematika',
        grade: 'Kelas X',
        topic: 'Aljabar Dasar',
        duration: 90,
        includeMaterials: true,
        includeHomework: true
      };

      const result1 = await generateLessonPlan(request);
      const result2 = await generateLessonPlan(request);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.lessonPlan?.id).toBe(result2.lessonPlan?.id);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should handle AI generation errors', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: 'test-key' });
      
      mockGenerateContent.mockRejectedValue(new Error('AI generation failed'));
      
      ai.models.generateContent = mockGenerateContent;

      const request: LessonPlanGenerationRequest = {
        subject: 'Matematika',
        grade: 'Kelas X',
        topic: 'Aljabar Dasar',
        duration: 90,
        includeMaterials: true,
        includeHomework: true
      };

      const result = await generateLessonPlan(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.lessonPlan).toBeUndefined();
    });

    it('should include custom learning objectives in request', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: 'test-key' });
      
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          ...mockLessonPlan,
          objectives: ['Custom objective 1', 'Custom objective 2']
        })
      });
      
      ai.models.generateContent = mockGenerateContent;

      const request: LessonPlanGenerationRequest = {
        subject: 'Matematika',
        grade: 'Kelas X',
        topic: 'Aljabar Dasar',
        duration: 90,
        learningObjectives: ['Custom objective 1', 'Custom objective 2'],
        includeMaterials: true,
        includeHomework: true
      };

      const result = await generateLessonPlan(request);

      expect(result.success).toBe(true);
      expect(result.lessonPlan?.objectives).toEqual(['Custom objective 1', 'Custom objective 2']);
    });

    it('should handle special requirements', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: 'test-key' });
      
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockLessonPlan)
      });
      
      ai.models.generateContent = mockGenerateContent;

      const request: LessonPlanGenerationRequest = {
        subject: 'Matematika',
        grade: 'Kelas X',
        topic: 'Aljabar Dasar',
        duration: 90,
        specialRequirements: ['Siswa dengan kebutuhan khusus', 'Alat peraga interaktif'],
        includeMaterials: true,
        includeHomework: true
      };

      const result = await generateLessonPlan(request);

      expect(result.success).toBe(true);
    });

    it('should return suggestions on successful generation', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: 'test-key' });
      
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockLessonPlan)
      });
      
      ai.models.generateContent = mockGenerateContent;

      const request: LessonPlanGenerationRequest = {
        subject: 'Matematika',
        grade: 'Kelas X',
        topic: 'Aljabar Dasar',
        duration: 90,
        includeMaterials: true,
        includeHomework: true
      };

      const result = await generateLessonPlan(request);

      expect(result.success).toBe(true);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions?.length).toBeGreaterThan(0);
    });
  });

  describe('defaultLessonPlanTemplates', () => {
    it('should have default templates', () => {
      expect(defaultLessonPlanTemplates).toBeDefined();
      expect(defaultLessonPlanTemplates.length).toBeGreaterThan(0);
    });

    it('should have required template properties', () => {
      defaultLessonPlanTemplates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('structure');
        expect(template).toHaveProperty('isDefault');
        expect(template).toHaveProperty('createdAt');
      });
    });

    it('should have default template', () => {
      const defaultTemplate = defaultLessonPlanTemplates.find(t => t.isDefault);
      expect(defaultTemplate).toBeDefined();
    });

    it('should have valid activity structures', () => {
      defaultLessonPlanTemplates.forEach(template => {
        template.structure.activities.forEach(activity => {
          expect(activity).toHaveProperty('name');
          expect(activity).toHaveProperty('description');
          expect(activity).toHaveProperty('duration');
          expect(activity).toHaveProperty('type');
          expect(['introduction', 'main', 'group-work', 'discussion', 'individual', 'conclusion'])
            .toContain(activity.type);
        });
      });
    });

    it('should have valid assessment types', () => {
      defaultLessonPlanTemplates.forEach(template => {
        expect(['formative', 'summative']).toContain(template.structure.assessmentType);
      });
    });
  });

  describe('getTemplateById', () => {
    it('should return template by id', () => {
      const templateId = defaultLessonPlanTemplates[0].id;
      const template = getTemplateById(templateId);

      expect(template).toBeDefined();
      expect(template?.id).toBe(templateId);
    });

    it('should return undefined for non-existent template', () => {
      const template = getTemplateById('non-existent-id');
      expect(template).toBeUndefined();
    });
  });

  describe('getAllTemplates', () => {
    it('should return all templates', () => {
      const templates = getAllTemplates();

      expect(templates).toBeDefined();
      expect(templates.length).toBe(defaultLessonPlanTemplates.length);
      expect(templates).toEqual(defaultLessonPlanTemplates);
    });

    it('should return a copy of templates', () => {
      const templates1 = getAllTemplates();
      const templates2 = getAllTemplates();

      expect(templates1).not.toBe(templates2);
      expect(templates1).toEqual(templates2);
    });
  });
});
