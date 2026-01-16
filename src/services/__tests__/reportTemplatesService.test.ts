import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { reportTemplatesService } from '../reportTemplatesService';
import { STORAGE_KEYS } from '../../constants';
import type { ReportTemplate, ReportConfig } from '../../types/report.types';

describe('ReportTemplatesService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getTemplates', () => {
    it('should return empty array when no templates exist', () => {
      const templates = reportTemplatesService.getTemplates();
      expect(templates).toEqual([]);
    });

    it('should return all saved templates', () => {
      const template1: ReportTemplate = {
        id: 'template-1',
        name: 'Test Template 1',
        description: 'Description 1',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config: {
          title: 'Report 1',
          selectedMetrics: [],
          selectedCharts: [],
          selectedTables: [],
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            label: 'January 2024',
          },
          filters: {},
        },
      };

      const template2: ReportTemplate = {
        ...template1,
        id: 'template-2',
        name: 'Test Template 2',
      };

      localStorage.setItem(STORAGE_KEYS.REPORT_TEMPLATES, JSON.stringify([template1, template2]));

      const templates = reportTemplatesService.getTemplates();
      expect(templates).toHaveLength(2);
      expect(templates[0].name).toBe('Test Template 1');
      expect(templates[1].name).toBe('Test Template 2');
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem(STORAGE_KEYS.REPORT_TEMPLATES, 'invalid-json');

      const templates = reportTemplatesService.getTemplates();
      expect(templates).toEqual([]);
    });
  });

  describe('getTemplateById', () => {
    it('should return template with matching id', () => {
      const template: ReportTemplate = {
        id: 'template-1',
        name: 'Test Template',
        description: 'Test Description',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config: {
          title: 'Report',
          selectedMetrics: ['metric1'],
          selectedCharts: [],
          selectedTables: [],
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            label: 'January 2024',
          },
          filters: {},
        },
      };

      localStorage.setItem(STORAGE_KEYS.REPORT_TEMPLATES, JSON.stringify([template]));

      const found = reportTemplatesService.getTemplateById('template-1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('template-1');
      expect(found?.name).toBe('Test Template');
    });

    it('should return null when template not found', () => {
      const found = reportTemplatesService.getTemplateById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('createTemplate', () => {
    it('should create and save new template', () => {
      const config: ReportConfig = {
        title: 'New Report',
        selectedMetrics: ['metric1'],
        selectedCharts: [],
        selectedTables: [],
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          label: 'January 2024',
        },
        filters: {},
      };

      const template = reportTemplatesService.createTemplate(
        'Test Template',
        'Test Description',
        config,
        'user-1',
      );

      expect(template.name).toBe('Test Template');
      expect(template.description).toBe('Test Description');
      expect(template.createdBy).toBe('user-1');
      expect(template.config).toEqual(config);
      expect(template.id).toMatch(/^report-template-\d+$/);

      const templates = reportTemplatesService.getTemplates();
      expect(templates).toHaveLength(1);
      expect(templates[0].id).toBe(template.id);
    });

    it('should save template with undefined description', () => {
      const config: ReportConfig = {
        title: 'Report',
        selectedMetrics: [],
        selectedCharts: [],
        selectedTables: [],
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          label: 'January 2024',
        },
        filters: {},
      };

      const template = reportTemplatesService.createTemplate(
        'Template',
        undefined,
        config,
        'user-1',
      );

      expect(template.description).toBeUndefined();

      const templates = reportTemplatesService.getTemplates();
      expect(templates[0].description).toBeUndefined();
    });
  });

  describe('updateTemplate', () => {
    it('should update existing template', () => {
      const template: ReportTemplate = {
        id: 'template-1',
        name: 'Original Name',
        description: 'Original Description',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config: {
          title: 'Report',
          selectedMetrics: [],
          selectedCharts: [],
          selectedTables: [],
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            label: 'January 2024',
          },
          filters: {},
        },
      };

      localStorage.setItem(STORAGE_KEYS.REPORT_TEMPLATES, JSON.stringify([template]));

      const updatedTemplate: ReportTemplate = {
        ...template,
        name: 'Updated Name',
        description: 'Updated Description',
      };

      reportTemplatesService.updateTemplate(updatedTemplate);

      const templates = reportTemplatesService.getTemplates();
      expect(templates).toHaveLength(1);
      expect(templates[0].name).toBe('Updated Name');
      expect(templates[0].description).toBe('Updated Description');
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template by id', () => {
      const template1: ReportTemplate = {
        id: 'template-1',
        name: 'Template 1',
        description: 'Description 1',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config: {
          title: 'Report',
          selectedMetrics: [],
          selectedCharts: [],
          selectedTables: [],
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            label: 'January 2024',
          },
          filters: {},
        },
      };

      const template2: ReportTemplate = {
        ...template1,
        id: 'template-2',
        name: 'Template 2',
      };

      localStorage.setItem(STORAGE_KEYS.REPORT_TEMPLATES, JSON.stringify([template1, template2]));

      reportTemplatesService.deleteTemplate('template-1');

      const templates = reportTemplatesService.getTemplates();
      expect(templates).toHaveLength(1);
      expect(templates[0].id).toBe('template-2');
    });

    it('should throw error when localStorage fails', () => {
      const spy = vi.spyOn(window.Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        reportTemplatesService.deleteTemplate('template-1');
      }).toThrow('Failed to delete report template');

      spy.mockRestore();
    });
  });

  describe('duplicateTemplate', () => {
    it('should create duplicate with new id', () => {
      const originalTemplate: ReportTemplate = {
        id: 'template-1',
        name: 'Original Template',
        description: 'Description',
        createdBy: 'user-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        config: {
          title: 'Report',
          selectedMetrics: [],
          selectedCharts: [],
          selectedTables: [],
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            label: 'January 2024',
          },
          filters: {},
        },
      };

      localStorage.setItem(STORAGE_KEYS.REPORT_TEMPLATES, JSON.stringify([originalTemplate]));

      const duplicate = reportTemplatesService.duplicateTemplate(originalTemplate, 'user-2');

      expect(duplicate.id).not.toBe(originalTemplate.id);
      expect(duplicate.name).toBe('Original Template (Copy)');
      expect(duplicate.createdBy).toBe('user-2');
      expect(duplicate.createdAt).not.toBe(originalTemplate.createdAt);
      expect(duplicate.config).toEqual(originalTemplate.config);

      const templates = reportTemplatesService.getTemplates();
      expect(templates).toHaveLength(2);
      expect(templates[1].id).toBe(duplicate.id);
    });
  });
});
