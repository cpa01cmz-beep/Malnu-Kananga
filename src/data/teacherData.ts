// Data dan interface untuk portal guru dan admin
// Sistem informasi akademik untuk pengelolaan data siswa

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  classTeacher?: string; // Kelas yang menjadi wali kelas
  phone: string;
  profileImage?: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface Class {
  id: string;
  name: string;
  grade: number; // 10, 11, or 12
  major: 'IPA' | 'IPS';
  homeroomTeacher: string;
  studentCount: number;
  academicYear: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  classId: string;
  className: string;
  attendanceRate: number;
  averageGrade: number;
  status: 'active' | 'inactive' | 'graduate';
}

export interface GradeInput {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  classId: string;
  midtermScore?: number;
  finalScore?: number;
  assignmentScore?: number;
  attendanceScore?: number;
  notes?: string;
  submittedAt?: string;
  status: 'draft' | 'submitted' | 'approved';
}

// Mock data guru
export const currentTeacher: Teacher = {
  id: 'TCH001',
  name: 'Dr. Siti Nurhaliza, M.Pd.',
  email: 'guru@ma-malnukananga.sch.id',
  subject: 'Matematika',
  classTeacher: 'XII IPA 1',
  phone: '081234567890',
  profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  joinDate: '2018-07-01',
  status: 'active'
};

// Mock data kelas yang diajar
export const teacherClasses: Class[] = [
  {
    id: 'CLS001',
    name: 'XII IPA 1',
    grade: 12,
    major: 'IPA',
    homeroomTeacher: 'Dr. Siti Nurhaliza, M.Pd.',
    studentCount: 32,
    academicYear: '2024/2025'
  },
  {
    id: 'CLS002',
    name: 'XII IPA 2',
    grade: 12,
    major: 'IPA',
    homeroomTeacher: 'Prof. Budi Santoso, M.T.',
    studentCount: 30,
    academicYear: '2024/2025'
  },
  {
    id: 'CLS003',
    name: 'XI IPA 1',
    grade: 11,
    major: 'IPA',
    homeroomTeacher: 'Dra. Maya Sari, M.Si.',
    studentCount: 28,
    academicYear: '2024/2025'
  }
];

// Mock data siswa untuk input nilai
export const classStudents: StudentRecord[] = [
  {
    id: 'STU001',
    name: 'Ahmad Fauzi Rahman',
    classId: 'CLS001',
    className: 'XII IPA 1',
    attendanceRate: 95,
    averageGrade: 87.5,
    status: 'active'
  },
  {
    id: 'STU002',
    name: 'Siti Aminah',
    classId: 'CLS001',
    className: 'XII IPA 1',
    attendanceRate: 92,
    averageGrade: 84.2,
    status: 'active'
  },
  {
    id: 'STU003',
    name: 'Budi Santoso',
    classId: 'CLS001',
    className: 'XII IPA 1',
    attendanceRate: 88,
    averageGrade: 79.8,
    status: 'active'
  },
  {
    id: 'STU004',
    name: 'Dewi Lestari',
    classId: 'CLS001',
    className: 'XII IPA 1',
    attendanceRate: 97,
    averageGrade: 91.3,
    status: 'active'
  },
  {
    id: 'STU005',
    name: 'Eko Prasetyo',
    classId: 'CLS001',
    className: 'XII IPA 1',
    attendanceRate: 85,
    averageGrade: 76.5,
    status: 'active'
  }
];

// Template untuk input nilai
export const gradeInputTemplate: Omit<GradeInput, 'id' | 'studentId' | 'studentName' | 'submittedAt'> = {
  subject: 'Matematika',
  classId: 'CLS001',
  midtermScore: undefined,
  finalScore: undefined,
  assignmentScore: undefined,
  attendanceScore: undefined,
  notes: '',
  status: 'draft'
};

// Mock data untuk admin analytics
export interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  averageAttendance: number;
  averageGPA: number;
  graduationRate: number;
}

export interface MonthlyData {
  month: string;
  newStudents: number;
  attendance: number;
  averageGrade: number;
}

export const schoolStats: SchoolStats = {
  totalStudents: 450,
  totalTeachers: 28,
  totalClasses: 18,
  averageAttendance: 92.5,
  averageGPA: 82.3,
  graduationRate: 96.8
};

export const monthlyTrends: MonthlyData[] = [
  { month: 'Jul', newStudents: 45, attendance: 94.2, averageGrade: 81.5 },
  { month: 'Agu', newStudents: 12, attendance: 93.8, averageGrade: 82.1 },
  { month: 'Sep', newStudents: 8, attendance: 95.1, averageGrade: 83.2 },
  { month: 'Okt', newStudents: 15, attendance: 92.5, averageGrade: 82.3 },
  { month: 'Nov', newStudents: 5, attendance: 94.7, averageGrade: 84.1 },
  { month: 'Des', newStudents: 3, attendance: 96.2, averageGrade: 85.5 }
];

// Helper functions untuk teacher dashboard
export function calculateClassAverage(students: StudentRecord[]): number {
  if (students.length === 0) return 0;
  const total = students.reduce((sum, student) => sum + student.averageGrade, 0);
  return Math.round((total / students.length) * 10) / 10;
}

export function getAttendanceStatus(attendanceRate: number): {
  status: 'excellent' | 'good' | 'average' | 'poor';
  color: string;
  label: string;
} {
  if (attendanceRate >= 95) return { status: 'excellent', color: 'text-green-600', label: 'Sangat Baik' };
  if (attendanceRate >= 90) return { status: 'good', color: 'text-blue-600', label: 'Baik' };
  if (attendanceRate >= 85) return { status: 'average', color: 'text-yellow-600', label: 'Cukup' };
  return { status: 'poor', color: 'text-red-600', label: 'Perlu Perhatian' };
}

export function getGradeDistribution(students: StudentRecord[]): {
  excellent: number;
  good: number;
  average: number;
  poor: number;
} {
  return students.reduce(
    (acc, student) => {
      if (student.averageGrade >= 90) acc.excellent++;
      else if (student.averageGrade >= 80) acc.good++;
      else if (student.averageGrade >= 70) acc.average++;
      else acc.poor++;
      return acc;
    },
    { excellent: 0, good: 0, average: 0, poor: 0 }
  );
}