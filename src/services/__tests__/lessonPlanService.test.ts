import { describe, it, expect } from 'vitest';
import {
  defaultLessonPlanTemplates,
  getTemplateById,
  getAllTemplates
} from '../lessonPlanService';

describe('Lesson Plan Service', () => {
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
