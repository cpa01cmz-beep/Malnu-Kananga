// api/modules/users.ts - Users, Students, Teachers, Parents APIs

import type { User, Student, Teacher, StudentParent } from '../../../types';
import { request } from '../client';
import { API_ENDPOINTS } from '../../../constants';

// ============================================
// USERS API
// ============================================

export const usersAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: User[]; error?: string }> {
    return request<User[]>(API_ENDPOINTS.USERS.BASE);
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: User; error?: string }> {
    return request<User>(API_ENDPOINTS.USERS.BY_ID(id));
  },

  async create(user: Partial<User>): Promise<{ success: boolean; message: string; data?: User; error?: string }> {
    return request<User>(API_ENDPOINTS.USERS.BASE, {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  async update(id: string, user: Partial<User>): Promise<{ success: boolean; message: string; data?: User; error?: string }> {
    return request<User>(API_ENDPOINTS.USERS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(API_ENDPOINTS.USERS.BY_ID(id), {
      method: 'DELETE',
    });
  },
};

// ============================================
// STUDENTS API
// ============================================

export const studentsAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: Student[]; error?: string }> {
    return request<Student[]>(API_ENDPOINTS.STUDENTS.BASE);
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: Student; error?: string }> {
    return request<Student>(API_ENDPOINTS.STUDENTS.BY_ID(id));
  },

  async getByClass(className: string): Promise<{ success: boolean; message: string; data?: Student[]; error?: string }> {
    return request<Student[]>(`${API_ENDPOINTS.STUDENTS.BASE}?class_name=${className}`);
  },

  async getByUserId(userId: string): Promise<{ success: boolean; message: string; data?: Student; error?: string }> {
    return request<Student>(`${API_ENDPOINTS.STUDENTS.BASE}?user_id=${userId}`);
  },

  async create(student: Partial<Student>): Promise<{ success: boolean; message: string; data?: Student; error?: string }> {
    return request<Student>(API_ENDPOINTS.STUDENTS.BASE, {
      method: 'POST',
      body: JSON.stringify(student),
    });
  },

  async update(id: string, student: Partial<Student>): Promise<{ success: boolean; message: string; data?: Student; error?: string }> {
    return request<Student>(API_ENDPOINTS.STUDENTS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(student),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(API_ENDPOINTS.STUDENTS.BY_ID(id), {
      method: 'DELETE',
    });
  },

  async getParents(studentId: string): Promise<{ success: boolean; message: string; data?: StudentParent[]; error?: string }> {
    return request<StudentParent[]>(`${API_ENDPOINTS.STUDENTS.BASE}/${studentId}/parents`);
  },
};

// ============================================
// TEACHERS API
// ============================================

export const teachersAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: Teacher[]; error?: string }> {
    return request<Teacher[]>(API_ENDPOINTS.TEACHERS.BASE);
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: Teacher; error?: string }> {
    return request<Teacher>(API_ENDPOINTS.TEACHERS.BY_ID(id));
  },

  async create(teacher: Partial<Teacher>): Promise<{ success: boolean; message: string; data?: Teacher; error?: string }> {
    return request<Teacher>(API_ENDPOINTS.TEACHERS.BASE, {
      method: 'POST',
      body: JSON.stringify(teacher),
    });
  },

  async update(id: string, teacher: Partial<Teacher>): Promise<{ success: boolean; message: string; data?: Teacher; error?: string }> {
    return request<Teacher>(API_ENDPOINTS.TEACHERS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(teacher),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(API_ENDPOINTS.TEACHERS.BY_ID(id), {
      method: 'DELETE',
    });
  },
};
