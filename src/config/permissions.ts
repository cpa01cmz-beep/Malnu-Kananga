import { Permission, PermissionMatrix, UserExtraRole } from '../types/permissions';

// Define all available permissions
export const PERMISSIONS: Record<string, Permission> = {
  // System Administration
  'system.admin': {
    id: 'system.admin',
    name: 'System Administration',
    description: 'Full system access and configuration',
    resource: 'system',
    action: 'admin'
  },
  'system.stats': {
    id: 'system.stats',
    name: 'View System Statistics',
    description: 'Access system analytics and reports',
    resource: 'system',
    action: 'read'
  },
  'system.factory_reset': {
    id: 'system.factory_reset',
    name: 'Factory Reset',
    description: 'Reset system to default state',
    resource: 'system',
    action: 'reset'
  },

  // User Management
  'users.create': {
    id: 'users.create',
    name: 'Create Users',
    description: 'Create new user accounts',
    resource: 'users',
    action: 'create'
  },
  'users.read': {
    id: 'users.read',
    name: 'View Users',
    description: 'View user accounts and profiles',
    resource: 'users',
    action: 'read'
  },
  'users.update': {
    id: 'users.update',
    name: 'Update Users',
    description: 'Modify user accounts and roles',
    resource: 'users',
    action: 'update'
  },
  'users.delete': {
    id: 'users.delete',
    name: 'Delete Users',
    description: 'Delete user accounts',
    resource: 'users',
    action: 'delete'
  },

  // Content Management
  'content.create': {
    id: 'content.create',
    name: 'Create Content',
    description: 'Create and publish content',
    resource: 'content',
    action: 'create'
  },
  'content.read': {
    id: 'content.read',
    name: 'View Content',
    description: 'Access educational content and materials',
    resource: 'content',
    action: 'read'
  },
  'content.update': {
    id: 'content.update',
    name: 'Update Content',
    description: 'Edit and modify existing content',
    resource: 'content',
    action: 'update'
  },
  'content.delete': {
    id: 'content.delete',
    name: 'Delete Content',
    description: 'Remove content from system',
    resource: 'content',
    action: 'delete'
  },

  // Academic Management
  'academic.grades': {
    id: 'academic.grades',
    name: 'Manage Grades',
    description: 'Input and modify student grades',
    resource: 'academic',
    action: 'grade'
  },
  'academic.attendance': {
    id: 'academic.attendance',
    name: 'Manage Attendance',
    description: 'Track and modify attendance records',
    resource: 'academic',
    action: 'attendance'
  },
  'academic.schedule': {
    id: 'academic.schedule',
    name: 'View Schedule',
    description: 'Access class schedules and timetables',
    resource: 'academic',
    action: 'schedule'
  },
  'academic.classes': {
    id: 'academic.classes',
    name: 'Manage Classes',
    description: 'Create and manage class assignments',
    resource: 'academic',
    action: 'manage'
  },

  // PPDB (New Student Registration)
  'ppdb.manage': {
    id: 'ppdb.manage',
    name: 'Manage PPDB',
    description: 'Manage new student registration process',
    resource: 'ppdb',
    action: 'manage'
  },
  'ppdb.approve': {
    id: 'ppdb.approve',
    name: 'Approve PPDB Applications',
    description: 'Review and approve new student applications',
    resource: 'ppdb',
    action: 'approve'
  },

  // Special Roles
  'inventory.manage': {
    id: 'inventory.manage',
    name: 'Manage Inventory',
    description: 'Track and manage school inventory',
    resource: 'inventory',
    action: 'manage'
  },
  'osis.events': {
    id: 'osis.events',
    name: 'Manage OSIS Events',
    description: 'Organize and manage student council events',
    resource: 'osis',
    action: 'events'
  },

  // Parent Features
  'parent.monitor': {
    id: 'parent.monitor',
    name: 'Monitor Children',
    description: 'View children\'s academic progress',
    resource: 'parent',
    action: 'monitor'
  },
  'parent.reports': {
    id: 'parent.reports',
    name: 'View Reports',
    description: 'Access consolidated reports',
    resource: 'parent',
    action: 'reports'
  },
  'parent.communication': {
    id: 'parent.communication',
    name: 'Teacher Communication',
    description: 'Communicate with teachers',
    resource: 'parent',
    action: 'communicate'
  },

  // Student Features
  'student.library': {
    id: 'student.library',
    name: 'Access Library',
    description: 'Access e-library resources',
    resource: 'student',
    action: 'library'
  },
  'student.materials': {
    id: 'student.materials',
    name: 'Access Materials',
    description: 'Access learning materials and resources',
    resource: 'student',
    action: 'materials'
  }
};

// Define role-permission matrix
export const ROLE_PERMISSION_MATRIX: PermissionMatrix = {
  admin: [
    'system.admin', 'system.stats', 'system.factory_reset',
    'users.create', 'users.read', 'users.update', 'users.delete',
    'content.create', 'content.read', 'content.update', 'content.delete',
    'academic.grades', 'academic.attendance', 'academic.schedule', 'academic.classes',
    'ppdb.manage', 'ppdb.approve',
    'inventory.manage', 'osis.events',
    'parent.monitor', 'parent.reports', 'parent.communication',
    'student.library', 'student.materials'
  ],
  teacher: [
    'content.create', 'content.read', 'content.update',
    'academic.grades', 'academic.attendance', 'academic.schedule', 'academic.classes',
    'student.library', 'student.materials'
  ],
  student: [
    'content.read',
    'academic.schedule',
    'student.library', 'student.materials'
  ],
  parent: [
    'parent.monitor', 'parent.reports', 'parent.communication'
  ]
};

// Extra role permissions (added to base role permissions)
export const EXTRA_ROLE_PERMISSIONS: Partial<Record<NonNullable<UserExtraRole>, string[]>> & { null?: string[] } = {
  staff: ['inventory.manage'],
  osis: ['osis.events'],
  null: []
};