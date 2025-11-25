// Student Data API Service
// Menggantikan mock data studentData.ts (PRIORITY: HIGHEST)

import { baseApiService, type ApiResponse } from './baseApiService';
import type { Student, Grade, ScheduleItem, AttendanceRecord } from '../../types';

// Development mode - menggunakan mock data untuk testing
const isDevelopment = (import.meta as any).env?.DEV || false;

export class StudentService {
  private baseUrl = 'students';

  // Student CRUD operations
  async getAll(): Promise<ApiResponse<Student[]>> {
    return baseApiService.get<Student[]>(`/${this.baseUrl}`);
  }

  async getById(id: string): Promise<ApiResponse<Student>> {
    return baseApiService.get<Student>(`/${this.baseUrl}/${id}`);
  }

  async create(student: Omit<Student, 'id'>): Promise<ApiResponse<Student>> {
    return baseApiService.post<Student>(`/${this.baseUrl}`, student);
  }

  async update(id: string, student: Partial<Student>): Promise<ApiResponse<Student>> {
    return baseApiService.put<Student>(`/${this.baseUrl}/${id}`, student);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return baseApiService.delete<void>(`/${this.baseUrl}/${id}`);
  }

  // Get student grades
  async getGrades(studentId: string): Promise<ApiResponse<Grade[]>> {
    return baseApiService.get<Grade[]>(`/${this.baseUrl}/${studentId}/grades`);
  }

  // Get student attendance
  async getAttendance(studentId: string, month?: string, year?: string): Promise<ApiResponse<AttendanceRecord[]>> {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const queryString = params.toString();
    return baseApiService.get<AttendanceRecord[]>(`/${this.baseUrl}/${studentId}/attendance${queryString ? '?' + queryString : ''}`);
  }

  // Get student schedule
  async getSchedule(studentId: string): Promise<ApiResponse<ScheduleItem[]>> {
    return baseApiService.get<ScheduleItem[]>(`/${this.baseUrl}/${studentId}/schedule`);
  }

  // Get students by class
  async getByClass(classId: string): Promise<ApiResponse<Student[]>> {
    return baseApiService.get<Student[]>(`/${this.baseUrl}?class=${classId}`);
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
      nis: '2024001',
      name: 'Ahmad Fauzi Rahman',
      email: 'siswa@ma-malnukananga.sch.id',
      grade: 'XII',
      nis: '2024001',
      class: 'XII IPA 1'
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
        subject: 'Matematika',
        score: 85,
        date: '2024-10-01',
        semester: 'Ganjil',
        academicYear: '2024/2025'
      },
      {
        id: 'GRD002',
        studentId: 'STU001',
        subject: 'Fisika',
        score: 78,
        date: '2024-10-02',
        semester: 'Ganjil',
        academicYear: '2024/2025'
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
        status: 'present'
      },
      {
        id: 'ATT002',
        studentId: 'STU001',
        date: '2024-10-02',
        status: 'absent'
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
        studentId: 'STU001',
        subject: 'Matematika',
        teacher: 'Budi Santoso, S.Pd',
        room: 'Lab. Komputer',
        time: '07:00 - 08:30',
        day: 'Senin',
        teacher: 'Budi Santoso, S.Pd',
        room: 'Lab. Komputer'
      },
      {
        id: 'SCH002',
        studentId: 'STU001',
        subject: 'Fisika',
        time: '08:45 - 10:15',
        day: 'Senin',
        teacher: 'Dra. Siti Nurhaliza',
        room: 'Lab. Fisika'
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
  static async getAll(): Promise<any[]> {
    if (isDevelopment) {
      return LocalStudentService.getStudents();
    } else {
      const response = await new StudentService().getAll();
      return response.success && response.data ? response.data : [];
    }
  }

  static async getById(id: string): Promise<any | null> {
    if (isDevelopment) {
      const students = await this.getAll();
       return students.find((s: any) => s.id === id) || null;
    } else {
      const response = await new StudentService().getById(id);
      return response.success && response.data ? response.data : null;
    }
  }

  static async create(student: any): Promise<any | null> {
    if (isDevelopment) {
      const students = await this.getAll();
      const newStudent: Student = {
        ...student,
        id: `STU${Date.now()}`
      };
      students.push(newStudent);
       LocalStudentService.saveStudents(students);
      return newStudent;
    } else {
      const response = await new StudentService().create(student);
      return response.success && response.data ? response.data : null;
    }
  }

  static async update(id: string, student: any): Promise<any | null> {
    if (isDevelopment) {
      const students = await this.getAll();
       const index = students.findIndex((s: any) => s.id === id);
       if (index === -1) return null;

       students[index] = { ...students[index], ...student };
       LocalStudentService.saveStudents(students);
      return students[index];
    } else {
      const response = await new StudentService().update(id, student);
      return response.success && response.data ? response.data : null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    if (isDevelopment) {
      const students = await this.getAll();
      const filteredStudents = students.filter((s: any) => s.id !== id);
      if (filteredStudents.length === students.length) return false;

      LocalStudentService.saveStudents(filteredStudents);
      return true;
    } else {
      const service = new StudentService();
      const response = await service.delete(id);
      return response.success;
    }
  }

  // Grade operations
  static async getGrades(studentId: string): Promise<Grade[]> {
    if (isDevelopment) {
      return LocalStudentService.getGrades().filter((g: any) => g.studentId === studentId);
    } else {
      const service = new StudentService();
      const response = await service.getGrades(studentId);
      return response.success && response.data ? response.data : [];
    }
  }

  // Attendance operations
  static async getAttendance(studentId: string, month?: string, year?: string): Promise<AttendanceRecord[]> {
    if (isDevelopment) {
      return LocalStudentService.getAttendance().filter((a: any) => a.studentId === studentId);
    } else {
      const service = new StudentService();
      const response = await service.getAttendance(studentId, month, year);
      return response.success && response.data ? response.data : [];
    }
  }

  // Schedule operations
  static async getSchedule(studentId: string): Promise<ScheduleItem[]> {
    if (isDevelopment) {
      return LocalStudentService.getSchedule();
    } else {
      const service = new StudentService();
      const response = await service.getSchedule(studentId);
      return response.success && response.data ? response.data : [];
    }
  }

  // Get students by class
  static async getByClass(classId: string): Promise<Student[]> {
    if (isDevelopment) {
      return (await this.getAll()).filter((s: any) => s.class === classId);
    } else {
      const service = new StudentService();
      const response = await service.getByClass(classId);
      return response.success && response.data ? response.data : [];
    }
  }

  // Utility functions (mirroring the original mock data functions)
  static calculateGPA(grades: Grade[]): number {
    const completedGrades = grades.filter(grade => grade.score >= 70);
    if (completedGrades.length === 0) return 0;

    const totalPoints = completedGrades.reduce((sum, grade) => sum + grade.score, 0);
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
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const sick = 0; // No sick status in current interface
    const permitted = 0; // No permitted status in current interface
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, sick, permitted, percentage };
  }
}

// Export untuk kemudahan testing
export { LocalStudentService };