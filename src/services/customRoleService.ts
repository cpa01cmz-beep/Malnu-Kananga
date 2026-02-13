import { STORAGE_KEYS } from '../constants';
import { Permission, Role } from '../types/permissions';
import { PERMISSIONS, ROLE_PERMISSION_MATRIX } from '../config/permissions';

export interface CustomRole extends Role {
  isCustom: true;
  parentRoleId?: string;
  inheritsFrom?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  baseRoleId: string;
  permissions: string[];
  isSystem: boolean;
}

const DEFAULT_ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'template_class_teacher',
    name: 'Class Teacher',
    description: 'Teacher with full class management capabilities',
    baseRoleId: 'teacher',
    permissions: [
      'academic.grades', 'academic.attendance', 'academic.schedule', 'academic.classes',
      'content.create', 'content.read', 'content.update',
      'student.library', 'student.materials',
      'quizzes.view_results', 'quizzes.view_history'
    ],
    isSystem: true
  },
  {
    id: 'template_subject_teacher',
    name: 'Subject Teacher',
    description: 'Teacher focused on specific subjects',
    baseRoleId: 'teacher',
    permissions: [
      'academic.grades', 'academic.attendance',
      'content.create', 'content.read', 'content.update',
      'student.library', 'student.materials',
      'quizzes.view_results', 'quizzes.view_history'
    ],
    isSystem: true
  },
  {
    id: 'template_librarian',
    name: 'Librarian',
    description: 'Manages library and learning resources',
    baseRoleId: 'staff',
    permissions: [
      'content.create', 'content.read', 'content.update', 'content.delete',
      'student.library', 'student.materials',
      'inventory.manage'
    ],
    isSystem: true
  },
  {
    id: 'template_finance',
    name: 'Finance Staff',
    description: 'Manages school finances and payments',
    baseRoleId: 'staff',
    permissions: [
      'payments.create', 'payments.read', 'payments.update',
      'users.read', 'content.read',
      'school.reports'
    ],
    isSystem: true
  },
  {
    id: 'template_counselor',
    name: 'School Counselor',
    description: 'Student guidance and counseling',
    baseRoleId: 'staff',
    permissions: [
      'users.read', 'users.update',
      'academic.grades', 'academic.attendance',
      'academic.discipline',
      'student.library', 'student.materials',
      'parent.communication'
    ],
    isSystem: true
  }
];

class CustomRoleService {
  private getStorage(): CustomRole[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROLES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setStorage(roles: CustomRole[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ROLES, JSON.stringify(roles));
  }

  getCustomRoles(): CustomRole[] {
    return this.getStorage();
  }

  getCustomRole(roleId: string): CustomRole | null {
    const roles = this.getStorage();
    return roles.find(r => r.id === roleId) || null;
  }

  createCustomRole(role: Omit<CustomRole, 'isCustom' | 'createdAt' | 'updatedAt'>): CustomRole {
    const roles = this.getStorage();
    const now = new Date().toISOString();
    const newRole: CustomRole = {
      ...role,
      isCustom: true,
      createdAt: now,
      updatedAt: now
    };
    roles.push(newRole);
    this.setStorage(roles);
    return newRole;
  }

  updateCustomRole(roleId: string, updates: Partial<CustomRole>): CustomRole | null {
    const roles = this.getStorage();
    const index = roles.findIndex(r => r.id === roleId);
    if (index === -1) return null;
    
    roles[index] = {
      ...roles[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.setStorage(roles);
    return roles[index];
  }

  deleteCustomRole(roleId: string): boolean {
    const roles = this.getStorage();
    const filtered = roles.filter(r => r.id !== roleId);
    if (filtered.length === roles.length) return false;
    this.setStorage(filtered);
    return true;
  }

  getRoleTemplates(): RoleTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROLE_TEMPLATES);
      const stored = data ? JSON.parse(data) : [];
      return [...DEFAULT_ROLE_TEMPLATES, ...stored];
    } catch {
      return DEFAULT_ROLE_TEMPLATES;
    }
  }

  createRoleTemplate(template: Omit<RoleTemplate, 'id' | 'isSystem'>): RoleTemplate {
    const templates = this.getRoleTemplates();
    const newTemplate: RoleTemplate = {
      ...template,
      id: `custom_template_${Date.now()}`,
      isSystem: false
    };
    const customTemplates = templates.filter(t => !t.isSystem);
    customTemplates.push(newTemplate);
    localStorage.setItem(STORAGE_KEYS.ROLE_TEMPLATES, JSON.stringify(customTemplates));
    return newTemplate;
  }

  getEffectivePermissions(roleId: string, baseRole: string): string[] {
    const customRole = this.getCustomRole(roleId);
    let permissions: string[] = [];
    
    if (customRole) {
      permissions = [...customRole.permissions];
      if (customRole.inheritsFrom && customRole.inheritsFrom.length > 0) {
        for (const parentId of customRole.inheritsFrom) {
          const parentPermissions = this.getEffectivePermissions(parentId, baseRole);
          permissions = [...new Set([...permissions, ...parentPermissions])];
        }
      }
    } else {
      permissions = ROLE_PERMISSION_MATRIX[baseRole] || [];
    }
    
    return [...new Set(permissions)];
  }

  assignCustomRoleToUser(userId: string, customRoleId: string): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROLE_ASSIGNMENTS);
      const assignments: Record<string, string[]> = data ? JSON.parse(data) : {};
      if (!assignments[userId]) {
        assignments[userId] = [];
      }
      if (!assignments[userId].includes(customRoleId)) {
        assignments[userId].push(customRoleId);
      }
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ROLE_ASSIGNMENTS, JSON.stringify(assignments));
    } catch {
      const assignments: Record<string, string[]> = { [userId]: [customRoleId] };
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ROLE_ASSIGNMENTS, JSON.stringify(assignments));
    }
  }

  removeCustomRoleFromUser(userId: string, customRoleId: string): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROLE_ASSIGNMENTS);
      if (!data) return;
      const assignments: Record<string, string[]> = JSON.parse(data);
      if (assignments[userId]) {
        assignments[userId] = assignments[userId].filter(id => id !== customRoleId);
        localStorage.setItem(STORAGE_KEYS.CUSTOM_ROLE_ASSIGNMENTS, JSON.stringify(assignments));
      }
    } catch {
      // Ignore errors
    }
  }

  getUserCustomRoles(userId: string): CustomRole[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROLE_ASSIGNMENTS);
      if (!data) return [];
      const assignments: Record<string, string[]> = JSON.parse(data);
      const roleIds = assignments[userId] || [];
      const allRoles = this.getStorage();
      return roleIds.map(id => allRoles.find(r => r.id === id)).filter(Boolean) as CustomRole[];
    } catch {
      return [];
    }
  }

  getAllPermissions(): Permission[] {
    const perms: Permission[] = [];
    for (const key in PERMISSIONS) {
      perms.push(PERMISSIONS[key]);
    }
    return perms;
  }

  getPermissionCategories(): string[] {
    const categories = new Set<string>();
    const perms = this.getAllPermissions();
    perms.forEach(p => categories.add(p.resource));
    return Array.from(categories).sort();
  }

  getPermissionsByCategory(category: string): Permission[] {
    return this.getAllPermissions().filter(p => p.resource === category);
  }
}

export const customRoleService = new CustomRoleService();
