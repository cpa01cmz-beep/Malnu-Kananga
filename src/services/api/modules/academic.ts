// api/modules/academic.ts - Subjects, Classes, Schedules, Grades, Assignments, Attendance APIs

import type { Subject, Class, Schedule, Grade, Assignment, AssignmentStatus, AssignmentSubmission, Attendance } from '../../../types';
import { request } from '../client';

// ============================================
// SUBJECTS API
// ============================================

export const subjectsAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: Subject[]; error?: string }> {
    return request<Subject[]>('/api/subjects');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: Subject; error?: string }> {
    return request<Subject>(`/api/subjects/${id}`);
  },

  async create(subject: Partial<Subject>): Promise<{ success: boolean; message: string; data?: Subject; error?: string }> {
    return request<Subject>('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(subject),
    });
  },

  async update(id: string, subject: Partial<Subject>): Promise<{ success: boolean; message: string; data?: Subject; error?: string }> {
    return request<Subject>(`/api/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subject),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/subjects/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// CLASSES API
// ============================================

export const classesAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: Class[]; error?: string }> {
    return request<Class[]>('/api/classes');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: Class; error?: string }> {
    return request<Class>(`/api/classes/${id}`);
  },

  async create(classData: Partial<Class>): Promise<{ success: boolean; message: string; data?: Class; error?: string }> {
    return request<Class>('/api/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  },

  async update(id: string, classData: Partial<Class>): Promise<{ success: boolean; message: string; data?: Class; error?: string }> {
    return request<Class>(`/api/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/classes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// SCHEDULES API
// ============================================

export const schedulesAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: Schedule[]; error?: string }> {
    return request<Schedule[]>('/api/schedules');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: Schedule; error?: string }> {
    return request<Schedule>(`/api/schedules/${id}`);
  },

  async create(schedule: Partial<Schedule>): Promise<{ success: boolean; message: string; data?: Schedule; error?: string }> {
    return request<Schedule>('/api/schedules', {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  },

  async update(id: string, schedule: Partial<Schedule>): Promise<{ success: boolean; message: string; data?: Schedule; error?: string }> {
    return request<Schedule>(`/api/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(schedule),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/schedules/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// GRADES API
// ============================================

export const gradesAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: Grade[]; error?: string }> {
    return request<Grade[]>('/api/grades');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: Grade; error?: string }> {
    return request<Grade>(`/api/grades/${id}`);
  },

  async getByStudent(studentId: string): Promise<{ success: boolean; message: string; data?: Grade[]; error?: string }> {
    return request<Grade[]>(`/api/grades?student_id=${studentId}`);
  },

  async getBySubject(subjectId: string): Promise<{ success: boolean; message: string; data?: Grade[]; error?: string }> {
    return request<Grade[]>(`/api/grades?subject_id=${subjectId}`);
  },

  async getByClass(classId: string): Promise<{ success: boolean; message: string; data?: Grade[]; error?: string }> {
    return request<Grade[]>(`/api/grades?class_id=${classId}`);
  },

  async create(grade: Partial<Grade>): Promise<{ success: boolean; message: string; data?: Grade; error?: string }> {
    return request<Grade>('/api/grades', {
      method: 'POST',
      body: JSON.stringify(grade),
    });
  },

  async update(id: string, grade: Partial<Grade>): Promise<{ success: boolean; message: string; data?: Grade; error?: string }> {
    return request<Grade>(`/api/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(grade),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/grades/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// ASSIGNMENTS API
// ============================================

export const assignmentsAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: Assignment[]; error?: string }> {
    return request<Assignment[]>('/api/assignments');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: Assignment; error?: string }> {
    return request<Assignment>(`/api/assignments/${id}`);
  },

  async getBySubject(subjectId: string): Promise<{ success: boolean; message: string; data?: Assignment[]; error?: string }> {
    return request<Assignment[]>(`/api/assignments?subject_id=${subjectId}`);
  },

  async getByClass(classId: string): Promise<{ success: boolean; message: string; data?: Assignment[]; error?: string }> {
    return request<Assignment[]>(`/api/assignments?class_id=${classId}`);
  },

  async getByTeacher(teacherId: string): Promise<{ success: boolean; message: string; data?: Assignment[]; error?: string }> {
    return request<Assignment[]>(`/api/assignments?teacher_id=${teacherId}`);
  },

  async getByStatus(status: AssignmentStatus): Promise<{ success: boolean; message: string; data?: Assignment[]; error?: string }> {
    return request<Assignment[]>(`/api/assignments?status=${status}`);
  },

  async create(assignment: Partial<Assignment>): Promise<{ success: boolean; message: string; data?: Assignment; error?: string }> {
    return request<Assignment>('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  },

  async update(id: string, assignment: Partial<Assignment>): Promise<{ success: boolean; message: string; data?: Assignment; error?: string }> {
    return request<Assignment>(`/api/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignment),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/assignments/${id}`, {
      method: 'DELETE',
    });
  },

  async publish(id: string): Promise<{ success: boolean; message: string; data?: Assignment; error?: string }> {
    return request<Assignment>(`/api/assignments/${id}/publish`, {
      method: 'POST',
    });
  },

  async close(id: string): Promise<{ success: boolean; message: string; data?: Assignment; error?: string }> {
    return request<Assignment>(`/api/assignments/${id}/close`, {
      method: 'POST',
    });
  },
};

// ============================================
// ASSIGNMENT SUBMISSIONS API
// ============================================

export const assignmentSubmissionsAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: AssignmentSubmission[]; error?: string }> {
    return request<AssignmentSubmission[]>('/api/assignment-submissions');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: AssignmentSubmission; error?: string }> {
    return request<AssignmentSubmission>(`/api/assignment-submissions/${id}`);
  },

  async getByAssignment(assignmentId: string): Promise<{ success: boolean; message: string; data?: AssignmentSubmission[]; error?: string }> {
    return request<AssignmentSubmission[]>(`/api/assignment-submissions?assignment_id=${assignmentId}`);
  },

  async getByStudent(studentId: string): Promise<{ success: boolean; message: string; data?: AssignmentSubmission[]; error?: string }> {
    return request<AssignmentSubmission[]>(`/api/assignment-submissions?student_id=${studentId}`);
  },

  async create(submission: Partial<AssignmentSubmission>): Promise<{ success: boolean; message: string; data?: AssignmentSubmission; error?: string }> {
    return request<AssignmentSubmission>('/api/assignment-submissions', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  },

  async update(id: string, submission: Partial<AssignmentSubmission>): Promise<{ success: boolean; message: string; data?: AssignmentSubmission; error?: string }> {
    return request<AssignmentSubmission>(`/api/assignment-submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(submission),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/assignment-submissions/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// ATTENDANCE API
// ============================================

export const attendanceAPI = {
  async getAll(): Promise<{ success: boolean; message: string; data?: Attendance[]; error?: string }> {
    return request<Attendance[]>('/api/attendance');
  },

  async getById(id: string): Promise<{ success: boolean; message: string; data?: Attendance; error?: string }> {
    return request<Attendance>(`/api/attendance/${id}`);
  },

  async getByStudent(studentId: string): Promise<{ success: boolean; message: string; data?: Attendance[]; error?: string }> {
    return request<Attendance[]>(`/api/attendance?student_id=${studentId}`);
  },

  async getByClass(classId: string): Promise<{ success: boolean; message: string; data?: Attendance[]; error?: string }> {
    return request<Attendance[]>(`/api/attendance?class_id=${classId}`);
  },

  async getByDate(date: string): Promise<{ success: boolean; message: string; data?: Attendance[]; error?: string }> {
    return request<Attendance[]>(`/api/attendance?date=${date}`);
  },

  async create(attendance: Partial<Attendance>): Promise<{ success: boolean; message: string; data?: Attendance; error?: string }> {
    return request<Attendance>('/api/attendance', {
      method: 'POST',
      body: JSON.stringify(attendance),
    });
  },

  async update(id: string, attendance: Partial<Attendance>): Promise<{ success: boolean; message: string; data?: Attendance; error?: string }> {
    return request<Attendance>(`/api/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendance),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string; data?: null; error?: string }> {
    return request<null>(`/api/attendance/${id}`, {
      method: 'DELETE',
    });
  },
};
