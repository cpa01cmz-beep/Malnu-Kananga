// Student API Service untuk MA Malnu Kananga
// Menggantikan mock data dengan real backend integration

import BaseApiService, { ApiResponse } from './baseApiService';

// Types untuk Student API
export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  academicYear: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  parentPhone: string;
  profileImage?: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduate';
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  semester: number;
  academicYear: string;
  midtermScore?: number;
  finalScore?: number;
  assignmentScore?: number;
  attendanceScore?: number;
  finalGrade?: string;
  gradePoint?: number;
  status: 'draft' | 'submitted' | 'approved';
  submittedAt?: string;
  submittedBy?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  subject: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa';
  notes?: string;
  recordedBy?: string;
  recordedAt?: string;
}

export interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  subject: string;
  subjectCode: string;
  teacher: string;
  room: string;
  type: 'Teori' | 'Praktik';
  classId: string;
}

export interface AcademicStats {
  totalSubjects: number;
  averageGPA: number;
  attendanceRate: number;
  completedCredits: number;
  totalCredits: number;
}

// Student API Service Class
class StudentApiService extends BaseApiService {
  constructor() {
    super();
  }

  // Get current student profile
  async getCurrentStudent(): Promise<ApiResponse<Student>> {
    return this.get<Student>('/api/student/profile');
  }

  // Get student grades
  async getStudentGrades(studentId?: string, semester?: number, academicYear?: string): Promise<ApiResponse<Grade[]>> {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (semester) params.append('semester', semester.toString());
    if (academicYear) params.append('academicYear', academicYear);

    const queryString = params.toString();
    return this.get<Grade[]>(`/api/student/grades${queryString ? `?${queryString}` : ''}`);
  }

  // Submit grades (untuk teacher)
  async submitGrades(grades: Omit<Grade, 'id' | 'submittedAt'>[]): Promise<ApiResponse<Grade[]>> {
    return this.post<Grade[]>('/api/teacher/grades/submit', { grades });
  }

  // Get attendance records
  async getAttendanceRecords(studentId?: string, month?: number, year?: number): Promise<ApiResponse<AttendanceRecord[]>> {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());

    const queryString = params.toString();
    return this.get<AttendanceRecord[]>(`/api/student/attendance${queryString ? `?${queryString}` : ''}`);
  }

  // Record attendance (untuk teacher)
  async recordAttendance(attendance: Omit<AttendanceRecord, 'id' | 'recordedAt'>[]): Promise<ApiResponse<AttendanceRecord[]>> {
    return this.post<AttendanceRecord[]>('/api/teacher/attendance/record', { attendance });
  }

  // Get class schedule
  async getClassSchedule(studentId?: string, day?: string): Promise<ApiResponse<ScheduleItem[]>> {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (day) params.append('day', day);

    const queryString = params.toString();
    return this.get<ScheduleItem[]>(`/api/student/schedule${queryString ? `?${queryString}` : ''}`);
  }

  // Get academic statistics
  async getAcademicStats(studentId?: string, semester?: number): Promise<ApiResponse<AcademicStats>> {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (semester) params.append('semester', semester.toString());

    const queryString = params.toString();
    return this.get<AcademicStats>(`/api/student/stats${queryString ? `?${queryString}` : ''}`);
  }

  // Update student profile
  async updateProfile(updates: Partial<Student>): Promise<ApiResponse<Student>> {
    return this.put<Student>('/api/student/profile', updates);
  }

  // Get announcements untuk student
  async getAnnouncements(studentId?: string, unreadOnly: boolean = false): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (unreadOnly) params.append('unreadOnly', 'true');

    const queryString = params.toString();
    return this.get<any[]>(`/api/student/announcements${queryString ? `?${queryString}` : ''}`);
  }

  // Mark announcement as read
  async markAnnouncementAsRead(announcementId: string): Promise<ApiResponse<void>> {
    return this.put<void>(`/api/student/announcements/${announcementId}/read`);
  }

  // Get student progress report
  async getProgressReport(studentId?: string, semester?: number): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (semester) params.append('semester', semester.toString());

    const queryString = params.toString();
    return this.get<any>(`/api/student/progress-report${queryString ? `?${queryString}` : ''}`);
  }

  // Search students (untuk admin/teacher)
  async searchStudents(query: string, classId?: string): Promise<ApiResponse<Student[]>> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (classId) params.append('classId', classId);

    return this.get<Student[]>(`/api/admin/students/search?${params.toString()}`);
  }

  // Get students by class (untuk teacher)
  async getStudentsByClass(classId: string): Promise<ApiResponse<Student[]>> {
    return this.get<Student[]>(`/api/teacher/class/${classId}/students`);
  }
}

// Export singleton instance
export const studentApiService = new StudentApiService();
export default StudentApiService;