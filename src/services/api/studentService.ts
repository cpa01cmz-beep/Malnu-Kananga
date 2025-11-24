// Student Data API Service
// Menggantikan mock data studentData.ts (PRIORITY: HIGHEST)

import { baseApiService, ApiResponse } from './baseApiService';
import type { Student, Grade, ScheduleItem, AttendanceRecord } from '../../types';

// Development mode - menggunakan mock data untuk testing
const isDevelopment = import.meta.env.DEV;

export class StudentService extends BaseApiService {
  constructor() {
    super('students');
  }

  // Student CRUD operations
  async getAll(): Promise<ApiResponse<Student[]>> {
    return this.withRetry(() => this.get<Student[]>(''));
  }

  async getById(id: string): Promise<ApiResponse<Student>> {
    return this.withRetry(() => this.get<Student>(`/${id}`));
  }

  async create(student: Omit<Student, 'id'>): Promise<ApiResponse<Student>> {
    return this.withRetry(() => this.post<Student>('', student));
  }

  async update(id: string, student: Partial<Student>): Promise<ApiResponse<Student>> {
    return this.withRetry(() => this.put<Student>(`/${id}`, student));
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return this.withRetry(() => this.delete<void>(`/${id}`));
  }

  // Get student grades
  async getGrades(studentId: string): Promise<ApiResponse<Grade[]>> {
    return this.withRetry(() => this.get<Grade[]>(`/${studentId}/grades`));
  }

  // Get student attendance
  async getAttendance(studentId: string, month?: string, year?: string): Promise<ApiResponse<AttendanceRecord[]>> {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return this.withRetry(() => this.get<AttendanceRecord[]>(`/${studentId}/attendance`, params));
  }

  // Get student schedule
  async getSchedule(studentId: string): Promise<ApiResponse<ScheduleItem[]>> {
    return this.withRetry(() => this.get<ScheduleItem[]>(`/${studentId}/schedule`));
  }

  // Get students by class
  async getByClass(classId: string): Promise<ApiResponse<Student[]>> {
    return this.withRetry(() => this.get<Student[]>('', { class: classId }));
  }
}

// Development mode fallback dengan mock data
class LocalStudentService {
  private static STUDENTS_KEY = 'malnu_students';
  private static GRADES_KEY = 'malnu_grades';
  private static ATTENDANCE_KEY = 'malnu_attendance';
  private static SCHEDULE_KEY = 'malnu_schedule';

  static getStudents(): Student[] {
    const stored = localStorage.getItem(this.STUDENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Fallback ke mock data jika tidak ada di localStorage
    return [{
      id: 'STU001',
      name: 'Ahmad Fauzi Rahman',
      email: 'siswa@ma-malnukananga.sch.id',
      class: 'XII IPA 1',
      academicYear: '2024/2025',
      dateOfBirth: '2007-03-15',
      address: 'Jl. Pendidikan No. 123, Kananga, Pandeglang',
      phone: '081234567890',
      parentPhone: '081987654321',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      enrollmentDate: '2023-07-01'
    }];
  }

  static getGrades(): Grade[] {
    const stored = localStorage.getItem(this.GRADES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    return [
      {
        id: 'GRD001',
        studentId: 'STU001',
        subjectId: 'SUBJ001',
        subjectName: 'Matematika',
        semester: 1,
        academicYear: '2024/2025',
        midtermScore: 85,
        finalScore: 88,
        assignmentScore: 82,
        attendanceScore: 90,
        finalGrade: 'A',
        gradePoint: 4.0,
        status: 'Lulus'
      },
      {
        id: 'GRD002',
        studentId: 'STU001',
        subjectId: 'SUBJ002',
        subjectName: 'Fisika',
        semester: 1,
        academicYear: '2024/2025',
        midtermScore: 78,
        finalScore: 82,
        assignmentScore: 80,
        attendanceScore: 85,
        finalGrade: 'B+',
        gradePoint: 3.5,
        status: 'Lulus'
      }
    ];
  }

  static getAttendance(): AttendanceRecord[] {
    const stored = localStorage.getItem(this.ATTENDANCE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    return [
      {
        id: 'ATT001',
        studentId: 'STU001',
        date: '2024-10-01',
        subject: 'Matematika',
        status: 'Hadir',
        notes: ''
      },
      {
        id: 'ATT002',
        studentId: 'STU001',
        date: '2024-10-02',
        subject: 'Kimia',
        status: 'Izin',
        notes: 'Sakit demam'
      }
    ];
  }

  static getSchedule(): ScheduleItem[] {
    const stored = localStorage.getItem(this.SCHEDULE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    return [
      {
        id: 'SCH001',
        day: 'Senin',
        time: '07:00 - 08:30',
        subject: 'Matematika',
        subjectCode: 'MAT12',
        teacher: 'Dr. Siti Nurhaliza, M.Pd.',
        room: 'Lab. Komputer 1',
        type: 'Teori'
      },
      {
        id: 'SCH002',
        day: 'Senin',
        time: '08:45 - 10:15',
        subject: 'Fisika',
        subjectCode: 'FIS12',
        teacher: 'Prof. Budi Santoso, M.T.',
        room: 'Lab. Fisika',
        type: 'Praktik'
      }
    ];
  }

  static saveStudents(students: Student[]): void {
    localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(students));
  }

  static saveGrades(grades: Grade[]): void {
    localStorage.setItem(this.GRADES_KEY, JSON.stringify(grades));
  }

  static saveAttendance(attendance: AttendanceRecord[]): void {
    localStorage.setItem(this.ATTENDANCE_KEY, JSON.stringify(attendance));
  }

  static saveSchedule(schedule: ScheduleItem[]): void {
    localStorage.setItem(this.SCHEDULE_KEY, JSON.stringify(schedule));
  }
}

// Main service yang memilih implementation berdasarkan environment
export class StudentApiService {
  private static service: StudentService | LocalStudentService;

  private static getService() {
    if (isDevelopment) {
      return LocalStudentService;
    } else {
      return this.service || (this.service = new StudentService());
    }
  }

  // Student operations
  static async getAll(): Promise<Student[]> {
    if (isDevelopment) {
      return this.getService().getStudents();
    } else {
      const response = await this.getService().getAll();
      return response.success && response.data ? response.data : [];
    }
  }

  static async getById(id: string): Promise<Student | null> {
    if (isDevelopment) {
      const students = await this.getAll();
      return students.find(s => s.id === id) || null;
    } else {
      const response = await this.getService().getById(id);
      return response.success && response.data ? response.data : null;
    }
  }

  static async create(student: Omit<Student, 'id'>): Promise<Student | null> {
    if (isDevelopment) {
      const students = await this.getAll();
      const newStudent: Student = {
        ...student,
        id: `STU${Date.now()}`
      };
      students.push(newStudent);
      await this.getService().saveStudents(students);
      return newStudent;
    } else {
      const response = await this.getService().create(student);
      return response.success && response.data ? response.data : null;
    }
  }

  static async update(id: string, student: Partial<Student>): Promise<Student | null> {
    if (isDevelopment) {
      const students = await this.getAll();
      const index = students.findIndex(s => s.id === id);
      if (index === -1) return null;

      students[index] = { ...students[index], ...student };
      await this.getService().saveStudents(students);
      return students[index];
    } else {
      const response = await this.getService().update(id, student);
      return response.success && response.data ? response.data : null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    if (isDevelopment) {
      const students = await this.getAll();
      const filteredStudents = students.filter(s => s.id !== id);
      if (filteredStudents.length === students.length) return false;

      await this.getService().saveStudents(filteredStudents);
      return true;
    } else {
      const response = await this.getService().delete(id);
      return response.success;
    }
  }

  // Grade operations
  static async getGrades(studentId: string): Promise<Grade[]> {
    if (isDevelopment) {
      return this.getService().getGrades().filter(g => g.studentId === studentId);
    } else {
      const response = await this.getService().getGrades(studentId);
      return response.success && response.data ? response.data : [];
    }
  }

  // Attendance operations
  static async getAttendance(studentId: string, month?: string, year?: string): Promise<AttendanceRecord[]> {
    if (isDevelopment) {
      return this.getService().getAttendance().filter(a => a.studentId === studentId);
    } else {
      const response = await this.getService().getAttendance(studentId, month, year);
      return response.success && response.data ? response.data : [];
    }
  }

  // Schedule operations
  static async getSchedule(studentId: string): Promise<ScheduleItem[]> {
    if (isDevelopment) {
      return this.getService().getSchedule();
    } else {
      const response = await this.getService().getSchedule(studentId);
      return response.success && response.data ? response.data : [];
    }
  }

  // Get students by class
  static async getByClass(classId: string): Promise<Student[]> {
    if (isDevelopment) {
      return this.getAll().filter(s => s.class === classId);
    } else {
      const response = await this.getService().getByClass(classId);
      return response.success && response.data ? response.data : [];
    }
  }

  // Utility functions (mirroring the original mock data functions)
  static calculateGPA(grades: Grade[]): number {
    const completedGrades = grades.filter(grade => grade.status === 'Lulus' && grade.gradePoint);
    if (completedGrades.length === 0) return 0;

    const totalPoints = completedGrades.reduce((sum, grade) => sum + (grade.gradePoint || 0), 0);
    return Math.round((totalPoints / completedGrades.length) * 100) / 100;
  }

  static getAttendanceStats(attendance: AttendanceRecord[]): {
    total: number;
    present: number;
    absent: number;
    sick: number;
    permitted: number;
    percentage: number;
  } {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'Hadir').length;
    const absent = attendance.filter(a => a.status === 'Alfa').length;
    const sick = attendance.filter(a => a.status === 'Sakit').length;
    const permitted = attendance.filter(a => a.status === 'Izin').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, sick, permitted, percentage };
  }
}

// Export untuk kemudahan testing
export { LocalStudentService };