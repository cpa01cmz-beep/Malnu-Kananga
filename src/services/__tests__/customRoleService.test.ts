import { describe, it, expect, beforeEach, vi } from 'vitest'
import { customRoleService, CustomRole, RoleTemplate } from '../customRoleService'

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
})

describe('customRoleService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockReturnValue(undefined)
  })

  describe('getCustomRoles', () => {
    it('should return empty array when no roles stored', () => {
      const roles = customRoleService.getCustomRoles()
      expect(roles).toEqual([])
    })

    it('should return stored custom roles', () => {
      const storedRoles: CustomRole[] = [
        {
          id: 'custom_role_1',
          name: 'Custom Role 1',
          description: 'Test role',
          baseRoleId: 'teacher',
          permissions: ['academic.grades'],
          isCustom: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'admin'
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedRoles))

      const roles = customRoleService.getCustomRoles()
      expect(roles).toHaveLength(1)
      expect(roles[0].name).toBe('Custom Role 1')
    })
  })

  describe('getCustomRole', () => {
    it('should return role when found', () => {
      const storedRoles: CustomRole[] = [
        {
          id: 'custom_role_1',
          name: 'Custom Role 1',
          description: 'Test role',
          baseRoleId: 'teacher',
          permissions: ['academic.grades'],
          isCustom: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'admin'
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedRoles))

      const role = customRoleService.getCustomRole('custom_role_1')
      expect(role).toBeDefined()
      expect(role?.name).toBe('Custom Role 1')
    })

    it('should return null when role not found', () => {
      const role = customRoleService.getCustomRole('non_existent')
      expect(role).toBeNull()
    })
  })

  describe('createCustomRole', () => {
    it('should create a new custom role', () => {
      const roleData = {
        id: 'new_role',
        name: 'New Role',
        description: 'A new custom role',
        baseRoleId: 'teacher',
        permissions: ['academic.grades', 'academic.attendance'],
        createdBy: 'admin'
      }

      const newRole = customRoleService.createCustomRole(roleData)

      expect(newRole.name).toBe('New Role')
      expect(newRole.isCustom).toBe(true)
      expect(newRole.createdAt).toBeDefined()
      expect(newRole.updatedAt).toBeDefined()
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('updateCustomRole', () => {
    it('should update an existing role', () => {
      const storedRoles: CustomRole[] = [
        {
          id: 'custom_role_1',
          name: 'Original Name',
          description: 'Original description',
          baseRoleId: 'teacher',
          permissions: ['academic.grades'],
          isCustom: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'admin'
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedRoles))

      const updated = customRoleService.updateCustomRole('custom_role_1', {
        name: 'Updated Name'
      })

      expect(updated?.name).toBe('Updated Name')
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should return null when role not found', () => {
      const updated = customRoleService.updateCustomRole('non_existent', {
        name: 'Updated Name'
      })

      expect(updated).toBeNull()
    })
  })

  describe('deleteCustomRole', () => {
    it('should delete an existing role', () => {
      const storedRoles: CustomRole[] = [
        {
          id: 'custom_role_1',
          name: 'Role to Delete',
          description: 'Test role',
          baseRoleId: 'teacher',
          permissions: ['academic.grades'],
          isCustom: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'admin'
        },
        {
          id: 'custom_role_2',
          name: 'Role to Keep',
          description: 'Test role',
          baseRoleId: 'teacher',
          permissions: ['academic.grades'],
          isCustom: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'admin'
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedRoles))

      const result = customRoleService.deleteCustomRole('custom_role_1')

      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should return false when role not found', () => {
      const result = customRoleService.deleteCustomRole('non_existent')
      expect(result).toBe(false)
    })
  })

  describe('getRoleTemplates', () => {
    it('should return default templates when no stored templates', () => {
      const templates = customRoleService.getRoleTemplates()
      expect(templates.length).toBeGreaterThan(0)
    })

    it('should include all default templates', () => {
      const templates = customRoleService.getRoleTemplates()
      
      expect(templates.find(t => t.id === 'template_class_teacher')).toBeDefined()
      expect(templates.find(t => t.id === 'template_subject_teacher')).toBeDefined()
      expect(templates.find(t => t.id === 'template_librarian')).toBeDefined()
      expect(templates.find(t => t.id === 'template_finance')).toBeDefined()
      expect(templates.find(t => t.id === 'template_counselor')).toBeDefined()
    })

    it('should merge stored templates with defaults', () => {
      const customTemplates: RoleTemplate[] = [
        {
          id: 'custom_template_1',
          name: 'Custom Template',
          description: 'Custom description',
          baseRoleId: 'teacher',
          permissions: ['custom.permission'],
          isSystem: false
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(customTemplates))

      const templates = customRoleService.getRoleTemplates()
      expect(templates.length).toBe(6)
    })
  })

  describe('createRoleTemplate', () => {
    it('should create a new template', () => {
      const templateData = {
        name: 'New Template',
        description: 'Template description',
        baseRoleId: 'teacher',
        permissions: ['academic.grades']
      }

      const newTemplate = customRoleService.createRoleTemplate(templateData)

      expect(newTemplate.name).toBe('New Template')
      expect(newTemplate.isSystem).toBe(false)
      expect(newTemplate.id).toContain('custom_template_')
    })
  })

  describe('assignCustomRoleToUser', () => {
    it('should assign role to user', () => {
      customRoleService.assignCustomRoleToUser('user123', 'role456')

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should add to existing user assignments', () => {
      const existingAssignments = {
        'user123': ['role789']
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingAssignments))

      customRoleService.assignCustomRoleToUser('user123', 'role456')

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('removeCustomRoleFromUser', () => {
    it('should remove role from user', () => {
      const existingAssignments = {
        'user123': ['role456', 'role789']
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingAssignments))

      customRoleService.removeCustomRoleFromUser('user123', 'role456')

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('getUserCustomRoles', () => {
    it('should return empty array when no custom roles stored', () => {
      const roles = customRoleService.getUserCustomRoles('user123')
      expect(roles).toEqual([])
    })
  })

  describe('getAllPermissions', () => {
    it('should return array of permissions', () => {
      const permissions = customRoleService.getAllPermissions()
      expect(permissions.length).toBeGreaterThan(0)
    })
  })

  describe('getPermissionCategories', () => {
    it('should return unique categories', () => {
      const categories = customRoleService.getPermissionCategories()
      expect(categories.length).toBeGreaterThan(0)
      expect(categories).toContain('system')
      expect(categories).toContain('users')
    })
  })

  describe('getPermissionsByCategory', () => {
    it('should filter by category', () => {
      const permissions = customRoleService.getPermissionsByCategory('system')
      expect(permissions.length).toBeGreaterThan(0)
      permissions.forEach(p => expect(p.resource).toBe('system'))
    })
  })
})
