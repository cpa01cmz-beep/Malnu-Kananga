// api/modules/users.ts - Users, Students, Teachers, Parents APIs

import type { User, Student, Teacher, StudentParent } from '../../../types';
import { request } from '../client';

// ============================================
// USERS API
// ============================================

export const usersAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: User[]; error?: string }> {
    return request<User[]>('/api/users');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: User; error?: string }> {
    return request<User>(`/api/users/${id}`);
  },

  async create(user: Partial<User>): Promise<{ success: boolean; message: string; data?: User; error?: string }> {
    return request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  async update(id: string, user: Partial<User>): Promise<{ success: boolean; message: string; data?: User; error?: string }> {
    return request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// STUDENTS API
// ============================================

export const studentsAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: Student[]; error?: string }> {
    return request<Student[]>('/api/students');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: Student; error?: string }> {
    return request<Student>(`/api/students/${id}`);
  },

  async getByClass(className: string): Promise<{ success: boolean; message: string; data?: Student[]; error?: string }> {
    return request<Student[]>(`/api/students?class_name=${className}`);
  },

  async getByUserId(userId: string): Promise<{ success: boolean; message: string; data?: Student; error?: string }> {
    return request<Student>(`/api/students?user_id=${userId}`);
  },

  async create(student: Partial<Student>): Promise<{ success: boolean; message: string; data?: Student; error?: string }> {
    return request<Student>('/api/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
  },

  async update(id: string, student: Partial<Student>): Promise<{ success: boolean; message: string; data?: Student; error?: string }> {
    return request<Student>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/students/${id}`, {
      method: 'DELETE',
    });
  },

  async getParents(studentId: string): Promise<{ success: boolean; message: string; data?: StudentParent[]; error?: string }> {
    return request<StudentParent[]>(`/api/students/${studentId}/parents`);
  },
};

// ============================================
// TEACHERS API
// ============================================

export const teachersAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: Teacher[]; error?: string }> {
    return request<Teacher[]>('/api/teachers');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: Teacher; error?: string }> {
    return request<Teacher>(`/api/teachers/${id}`);
  },

  async create(teacher: Partial<Teacher>): Promise<{ success: boolean; message: string; data?: Teacher; error?: string }> {
    return request<Teacher>('/api/teachers', {
      method: 'POST',
      body: JSON.stringify(teacher),
    });
  },

  async update(id: string, teacher: Partial<Teacher>): Promise<{ success: boolean; message: string; data?: Teacher; error?: string }> {
    return request<Teacher>(`/api/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacher),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/teachers/${id}`, {
      method: 'DELETE',
    });
  },
};
