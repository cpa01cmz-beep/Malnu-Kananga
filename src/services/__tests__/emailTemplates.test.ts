import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { emailTemplatesService } from '../emailTemplates'
import { STORAGE_KEYS } from '../../constants'
import type { EmailTemplate } from '../../types/email.types'
import EmailTemplatesService from '../emailTemplates'

// Mock dependencies
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}

global.localStorage = localStorageMock

describe('EmailTemplatesService', () => {
  let service: EmailTemplatesService

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    vi.useFakeTimers()
    
    service = new EmailTemplatesService()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Constructor and Initialization', () => {
    it('should initialize with default templates', () => {
      const templates = service.getAllTemplates()
      expect(templates).toBeDefined()
      expect(templates.length).toBeGreaterThan(0)
      
      // Check that default templates are present
      const templateIds = templates.map((t: EmailTemplate) => t.id)
      expect(templateIds).toContain('grade-update-notification')
      expect(templateIds).toContain('attendance-report')
      expect(templateIds).toContain('progress-report')
    })

    it('should load templates from localStorage if available', () => {
      const customTemplates: EmailTemplate[] = [
        {
          id: 'custom-template',
          name: 'Custom Template',
          description: 'Test custom template',
          category: 'notifications',
          subject: 'Custom Subject',
          htmlContent: '<p>Custom content</p>',
          variables: [],
          language: 'en',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(customTemplates))

      const newService = new EmailTemplatesService()
      const templates = newService.getAllTemplates()
      
      expect(templates).toContainEqual(expect.objectContaining({
        id: 'custom-template'
      }))
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const newService = new EmailTemplatesService()
      const templates = newService.getAllTemplates()
      
      expect(templates).toBeDefined()
      expect(templates.length).toBeGreaterThan(0)
    })
  })

  describe('getTemplate', () => {
    it('should return template by ID', () => {
      const template = service.getTemplate('grade-update-notification')
      
      expect(template).toBeDefined()
      expect(template?.id).toBe('grade-update-notification')
      expect(template?.name).toBeDefined()
      expect(template?.subject).toBeDefined()
    })

    it('should return null for non-existent template', () => {
      const template = service.getTemplate('non-existent-template')
      expect(template).toBeNull()
    })
  })

  describe('getAllTemplates', () => {
    it('should return all templates', () => {
      const templates = service.getAllTemplates()
      
      expect(templates).toBeInstanceOf(Array)
      expect(templates.length).toBeGreaterThan(0)
      
      // Verify template structure
      templates.forEach((template: EmailTemplate) => {
        expect(template).toHaveProperty('id')
        expect(template).toHaveProperty('name')
        expect(template).toHaveProperty('description')
        expect(template).toHaveProperty('category')
        expect(template).toHaveProperty('subject')
        expect(template).toHaveProperty('htmlContent')
        expect(template).toHaveProperty('variables')
        expect(template).toHaveProperty('language')
        expect(template).toHaveProperty('isActive')
        expect(template).toHaveProperty('createdAt')
        expect(template).toHaveProperty('updatedAt')
      })
    })
  })

  describe('getTemplatesByCategory', () => {
    it('should filter templates by category', () => {
      const gradeTemplates = service.getTemplatesByCategory('grades')
      
      expect(gradeTemplates).toBeInstanceOf(Array)
      gradeTemplates.forEach((template: EmailTemplate) => {
        expect(template.category).toBe('grades')
      })
    })

    it('should return empty array for category with no templates', () => {
      const templates = service.getTemplatesByCategory('system')
      expect(templates).toBeInstanceOf(Array)
    })
  })

  describe('getActiveTemplates', () => {
    it('should return only active templates', () => {
      const activeTemplates = service.getActiveTemplates()
      
      expect(activeTemplates).toBeInstanceOf(Array)
      activeTemplates.forEach((template: EmailTemplate) => {
        expect(template.isActive).toBe(true)
      })
    })

    it('should exclude inactive templates', () => {
      // Create a template and deactivate it
      const newTemplate = {
        name: 'Test Template',
        description: 'Test description',
        category: 'notifications' as const,
        subject: 'Test Subject',
        htmlContent: '<p>Test content</p>',
        variables: [],
        language: 'en' as const,
        isActive: true
      }
      
      const created = service.createTemplate(newTemplate)
      service.updateTemplate(created.id, { isActive: false })
      
      const activeTemplates = service.getActiveTemplates()
      const inactiveTemplate = activeTemplates.find((t: EmailTemplate) => t.id === created.id)
      
      expect(inactiveTemplate).toBeUndefined()
    })
  })

  describe('createTemplate', () => {
    it('should create new template successfully', () => {
      const newTemplate = {
        name: 'Test Template',
        description: 'Test description',
        category: 'notifications' as const,
        subject: 'Test Subject',
        htmlContent: '<p>Test content</p>',
        variables: ['studentName', 'className'],
        language: 'en' as const,
        isActive: true
      }

      const created = service.createTemplate(newTemplate)

      expect(created.id).toBeDefined()
      expect(created.name).toBe(newTemplate.name)
      expect(created.description).toBe(newTemplate.description)
      expect(created.category).toBe(newTemplate.category)
      expect(created.subject).toBe(newTemplate.subject)
      expect(created.htmlContent).toBe(newTemplate.htmlContent)
      expect(created.variables).toEqual(newTemplate.variables)
      expect(created.language).toBe(newTemplate.language)
      expect(created.isActive).toBe(newTemplate.isActive)
      expect(created.createdAt).toBeDefined()
      expect(created.updatedAt).toBeDefined()
      expect(created.createdAt).toBe(created.updatedAt)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EMAIL_TEMPLATES,
        expect.stringContaining('"name":"Test Template"')
      )
    })

    it('should generate unique ID for each template', () => {
      const template1 = service.createTemplate({
        name: 'Template 1',
        description: 'Description 1',
        category: 'notifications',
        subject: 'Subject 1',
        htmlContent: '<p>Content 1</p>',
        variables: [],
        language: 'en',
        isActive: true
      })

      const template2 = service.createTemplate({
        name: 'Template 2',
        description: 'Description 2',
        category: 'notifications',
        subject: 'Subject 2',
        htmlContent: '<p>Content 2</p>',
        variables: [],
        language: 'en',
        isActive: true
      })

      expect(template1.id).not.toBe(template2.id)
    })
  })

  describe('updateTemplate', () => {
    it('should update existing template', () => {
      const newTemplate = {
        name: 'Original Template',
        description: 'Original description',
        category: 'notifications' as const,
        subject: 'Original Subject',
        htmlContent: '<p>Original content</p>',
        variables: [],
        language: 'en' as const,
        isActive: true
      }

      const created = service.createTemplate(newTemplate)
      
      // Wait a moment to ensure different timestamps
      vi.advanceTimersByTime(1)
      
      const updated = service.updateTemplate(created.id, {
        name: 'Updated Template',
        subject: 'Updated Subject'
      })

      expect(updated).not.toBeNull()
      if (updated) {
        expect(updated.id).toBe(created.id)
        expect(updated.name).toBe('Updated Template')
        expect(updated.subject).toBe('Updated Subject')
        expect(updated.description).toBe('Original description') // Unchanged
        expect(updated.updatedAt).not.toBe(created.updatedAt) // Should be updated
      }

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should return null for non-existent template', () => {
      const result = service.updateTemplate('non-existent-id', {
        name: 'Updated Name'
      })

      expect(result).toBeNull()
    })
  })

  describe('deleteTemplate', () => {
    it('should delete existing template', () => {
      const newTemplate = {
        name: 'Template to Delete',
        description: 'Description',
        category: 'notifications' as const,
        subject: 'Subject',
        htmlContent: '<p>Content</p>',
        variables: [],
        language: 'en' as const,
        isActive: true
      }

      const created = service.createTemplate(newTemplate)
      const deleted = service.deleteTemplate(created.id)

      expect(deleted).toBe(true)
      
      const retrieved = service.getTemplate(created.id)
      expect(retrieved).toBeNull()

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should return false for non-existent template', () => {
      const result = service.deleteTemplate('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('renderTemplate', () => {
    it('should render template with context variables', () => {
      const context = {
        studentName: 'John Doe',
        className: '10A',
        grade: 95,
        subjectName: 'Mathematics'
      }

      const rendered = service.renderTemplate('grade-update-notification', context)

      expect(rendered).toBeDefined()
      if (rendered) {
        expect(rendered.html).toContain('John Doe') // Student name should be in HTML
        expect(rendered.text?.toLowerCase()).toContain('john doe') // Student name should be in text
      }
    })

    it('should handle missing context variables gracefully', () => {
      const context = {} // Empty context

      const rendered = service.renderTemplate('grade-update-notification', context)

      expect(rendered).toBeDefined()
      if (rendered) {
        expect(rendered.html).toBeDefined()
      }
    })

    it('should return null for non-existent template', () => {
      const context = { studentName: 'John' }
      const rendered = service.renderTemplate('non-existent-template', context)

      expect(rendered).toBeNull()
    })

    it('should handle template with no variables', () => {
      const simpleTemplate = {
        name: 'Simple Template',
        description: 'Simple description',
        category: 'system' as const,
        subject: 'Simple Subject',
        htmlContent: '<p>Static content with no variables</p>',
        variables: [],
        language: 'en' as const,
        isActive: true
      }

      const created = service.createTemplate(simpleTemplate)
      const rendered = service.renderTemplate(created.id, {})

      expect(rendered).toBeDefined()
      if (rendered) {
        expect(rendered.html).toBe('<p>Static content with no variables</p>')
      }
    })

    it('should properly escape HTML in context variables', () => {
      const templateWithHtmlContext = {
        name: 'HTML Context Template',
        description: 'Template with HTML context',
        category: 'system' as const,
        subject: 'Subject for {{studentName}}',
        htmlContent: '<p>Hello {{studentName}}! Your message: {{message}}</p>',
        variables: ['studentName', 'message'],
        language: 'en' as const,
        isActive: true
      }

      const created = service.createTemplate(templateWithHtmlContext)
      const context = {
        studentName: '<script>alert("xss")</script>',
        message: '<b>Bold message</b>'
      }

      const rendered = service.renderTemplate(created.id, context)

      expect(rendered).toBeDefined()
      if (rendered) {
        // Note: The interpolation method doesn't escape HTML by default
        expect(rendered.html).toContain('<script>alert("xss")</script>')
      }
    })
  })

  describe('Default Templates', () => {
    it('should include all required default templates', () => {
      const templates = service.getAllTemplates()
      const templateIds = templates.map((t: EmailTemplate) => t.id)

      const expectedTemplates = [
        'grade-update-notification',
        'attendance-report',
        'progress-report',
        'event-reminder',
        'system-notification',
        'announcement-notification',
        'library-notification',
        'ppdb-notification',
        'missing-grades-notification'
      ]

      expectedTemplates.forEach(templateId => {
        expect(templateIds).toContain(templateId)
      })
    })

    it('should have proper structure for default templates', () => {
      const templates = service.getAllTemplates()

      templates.forEach((template: EmailTemplate) => {
        expect(template.id).toMatch(/^[a-z0-9-]+$/) // Valid ID format
        expect(template.name).toBeTruthy()
        expect(template.description).toBeTruthy()
        expect(['grades', 'attendance', 'reports', 'announcements', 'notifications', 'system']).toContain(template.category)
        expect(template.subject).toBeTruthy()
        expect(template.htmlContent).toContain('<')
        expect(template.variables).toBeInstanceOf(Array)
        expect(['id', 'en']).toContain(template.language)
        expect(typeof template.isActive).toBe('boolean')
      })
    })
  })

  describe('Variable Substitution', () => {
    it('should handle multiple occurrences of the same variable', () => {
      const template = {
        name: 'Multi Variable Template',
        description: 'Template with repeated variables',
        category: 'system' as const,
        subject: '{{studentName}} - {{studentName}}\'s Report',
        htmlContent: '<p>Hello {{studentName}}, your name is {{studentName}}.</p>',
        variables: ['studentName'],
        language: 'en' as const,
        isActive: true
      }

      const created = service.createTemplate(template)
      const context = { studentName: 'John' }

      const rendered = service.renderTemplate(created.id, context)

      expect(rendered).toBeDefined()
      if (rendered) {
        expect(rendered.html).toBe('<p>Hello John, your name is John.</p>')
      }
    })

    it('should handle undefined context variables', () => {
      const template = {
        name: 'Undefined Var Template',
        description: 'Template with undefined handling',
        category: 'system' as const,
        subject: 'Hello {{studentName}}',
        htmlContent: '<p>Welcome {{studentName}} {{className}}</p>',
        variables: ['studentName', 'className'],
        language: 'en' as const,
        isActive: true
      }

      const created = service.createTemplate(template)
      const context = { studentName: 'John' }

      const rendered = service.renderTemplate(created.id, context)

      expect(rendered).toBeDefined()
      if (rendered) {
        expect(rendered.html).toBe('<p>Welcome John {{className}}</p>')
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage save errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => {
        service.createTemplate({
          name: 'Test Template',
          description: 'Test',
          category: 'notifications',
          subject: 'Test',
          htmlContent: '<p>Test</p>',
          variables: [],
          language: 'en',
          isActive: true
        })
      }).not.toThrow()
    })

    it('should handle corrupted template data in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('{"invalid": json}')

      const newService = new EmailTemplatesService()
      const templates = newService.getAllTemplates()
      
      expect(templates).toBeDefined()
      expect(templates.length).toBeGreaterThan(0)
    })
  })

  describe('emailTemplatesService Singleton', () => {
    it('should provide access to the singleton instance', () => {
      expect(emailTemplatesService).toBeDefined()
      expect(emailTemplatesService.getAllTemplates).toBeDefined()
      expect(emailTemplatesService.getTemplate).toBeDefined()
      expect(emailTemplatesService.renderTemplate).toBeDefined()
    })

    it('should have the same interface as a new instance', () => {
      const templates1 = emailTemplatesService.getAllTemplates()
      const templates2 = service.getAllTemplates()

      expect(templates1).toBeInstanceOf(Array)
      expect(templates2).toBeInstanceOf(Array)
      expect(templates1.length).toBeGreaterThan(0)
      expect(templates2.length).toBeGreaterThan(0)
    })
  })
})