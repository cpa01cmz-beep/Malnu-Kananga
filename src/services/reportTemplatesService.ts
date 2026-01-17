import { logger } from '../utils/logger';
import { STORAGE_KEYS } from '../constants';
import type { ReportTemplate, ReportConfig } from '../types/report.types';

class ReportTemplatesService {
  private static instance: ReportTemplatesService;

  private constructor() {}

  static getInstance(): ReportTemplatesService {
    if (!ReportTemplatesService.instance) {
      ReportTemplatesService.instance = new ReportTemplatesService();
    }
    return ReportTemplatesService.instance;
  }

  getTemplates(): ReportTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORT_TEMPLATES);
      if (!data) return [];
      const templates = JSON.parse(data);
      return templates as ReportTemplate[];
    } catch (error) {
      logger.error('Error loading report templates:', error);
      return [];
    }
  }

  getTemplateById(id: string): ReportTemplate | null {
    const templates = this.getTemplates();
    return templates.find(template => template.id === id) || null;
  }

  saveTemplate(template: ReportTemplate): void {
    try {
      const templates = this.getTemplates();
      const existingIndex = templates.findIndex(t => t.id === template.id);

      if (existingIndex >= 0) {
        templates[existingIndex] = { ...template, updatedAt: new Date().toISOString() };
      } else {
        templates.push(template);
      }

      localStorage.setItem(STORAGE_KEYS.REPORT_TEMPLATES, JSON.stringify(templates));
      logger.info('Report template saved:', template.name);
    } catch (error) {
      logger.error('Error saving report template:', error);
      throw new Error('Failed to save report template');
    }
  }

  createTemplate(name: string, description: string | undefined, config: ReportConfig, createdBy: string): ReportTemplate {
    const template: ReportTemplate = {
      id: `report-template-${Date.now()}`,
      name,
      description,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config,
    };

    this.saveTemplate(template);
    return template;
  }

  updateTemplate(template: ReportTemplate): void {
    this.saveTemplate(template);
  }

  deleteTemplate(id: string): void {
    try {
      const templates = this.getTemplates();
      const filtered = templates.filter(template => template.id !== id);
      localStorage.setItem(STORAGE_KEYS.REPORT_TEMPLATES, JSON.stringify(filtered));
      logger.info('Report template deleted:', id);
    } catch (error) {
      logger.error('Error deleting report template:', error);
      throw new Error('Failed to delete report template');
    }
  }

  duplicateTemplate(template: ReportTemplate, newOwner: string): ReportTemplate {
    const newTemplate: ReportTemplate = {
      ...template,
      id: `report-template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdBy: newOwner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: { ...template.config },
    };

    this.saveTemplate(newTemplate);
    return newTemplate;
  }
}

export const reportTemplatesService = ReportTemplatesService.getInstance();
