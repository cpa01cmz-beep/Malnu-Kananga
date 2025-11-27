// Mock data untuk portal siswa MA Malnu Kananga
// Data ini akan digantikan dengan integrasi sistem informasi akademik yang sebenarnya

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
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
  credits: number;
  description: string;
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
  status: 'Lulus' | 'Tidak Lulus' | 'Belum Selesai' | 'draft' | 'submitted' | 'approved';
  submittedAt?: string;
  submittedBy?: string;
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
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  subject: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa';
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Akademik' | 'Kegiatan' | 'Pengumuman' | 'Informasi';
  priority: 'Rendah' | 'Sedang' | 'Tinggi';
  isRead: boolean;
}

// Mock student data (akan digantikan dengan data dari sistem akademik)
export const currentStudent: Student = {
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
};

// Mock subjects untuk kelas XII IPA
export const subjects: Subject[] = [
  {
    id: 'SUBJ001',
    name: 'Matematika',
    code: 'MAT12',
    teacher: 'Dr. Siti Nurhaliza, M.Pd.',
    credits: 4,
    description: 'Matematika untuk kelas XII IPA'
  },
  {
    id: 'SUBJ002',
    name: 'Fisika',
    code: 'FIS12',
    teacher: 'Prof. Budi Santoso, M.T.',
    credits: 3,
    description: 'Fisika dasar dan terapan'
  },
  {
    id: 'SUBJ003',
    name: 'Kimia',
    code: 'KIM12',
    teacher: 'Dra. Maya Sari, M.Si.',
    credits: 3,
    description: 'Kimia organik dan anorganik'
  },
  {
    id: 'SUBJ004',
    name: 'Biologi',
    code: 'BIO12',
    teacher: 'Dr. Ahmad Fauzan, M.Biotech.',
    credits: 3,
    description: 'Biologi molekuler dan sel'
  },
  {
    id: 'SUBJ005',
    name: 'Bahasa Indonesia',
    code: 'BIND12',
    teacher: 'Drs. Joko Widodo, M.Hum.',
    credits: 2,
    description: 'Sastra dan bahasa Indonesia'
  },
  {
    id: 'SUBJ006',
    name: 'Bahasa Inggris',
    code: 'BING12',
    teacher: 'Mrs. Sarah Johnson, M.A.',
    credits: 2,
    description: 'English for academic purposes'
  },
  {
    id: 'SUBJ007',
    name: 'Pendidikan Agama Islam',
    code: 'PAI12',
    teacher: 'Ustadz Abdul Rahman, S.Ag.',
    credits: 2,
    description: 'Aqidah, syariah, dan akhlak'
  },
  {
    id: 'SUBJ008',
    name: 'Pendidikan Kewarganegaraan',
    code: 'PKN12',
    teacher: 'Drs. Slamet Riyadi, M.Sos.',
    credits: 2,
    description: 'Kewarganegaraan dan demokrasi'
  }
];

// Mock grades untuk semester 1 tahun akademik 2024/2025
export const studentGrades: Grade[] = [
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
  },
  {
    id: 'GRD003',
    studentId: 'STU001',
    subjectId: 'SUBJ003',
    subjectName: 'Kimia',
    semester: 1,
    academicYear: '2024/2025',
    midtermScore: 92,
    finalScore: 89,
    assignmentScore: 87,
    attendanceScore: 95,
    finalGrade: 'A',
    gradePoint: 4.0,
    status: 'Lulus'
  },
  {
    id: 'GRD004',
    studentId: 'STU001',
    subjectId: 'SUBJ004',
    subjectName: 'Biologi',
    semester: 1,
    academicYear: '2024/2025',
    midtermScore: 76,
    finalScore: 81,
    assignmentScore: 79,
    attendanceScore: 88,
    finalGrade: 'B+',
    gradePoint: 3.5,
    status: 'Lulus'
  }
];

// Mock jadwal pelajaran untuk hari Senin
export const weeklySchedule: ScheduleItem[] = [
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
  },
  {
    id: 'SCH003',
    day: 'Senin',
    time: '10:30 - 12:00',
    subject: 'Bahasa Indonesia',
    subjectCode: 'BIND12',
    teacher: 'Drs. Joko Widodo, M.Hum.',
    room: 'Ruang Kelas XII-1',
    type: 'Teori'
  },
  {
    id: 'SCH004',
    day: 'Selasa',
    time: '07:00 - 08:30',
    subject: 'Kimia',
    subjectCode: 'KIM12',
    teacher: 'Dra. Maya Sari, M.Si.',
    room: 'Lab. Kimia',
    type: 'Praktik'
  },
  {
    id: 'SCH005',
    day: 'Selasa',
    time: '08:45 - 10:15',
    subject: 'Biologi',
    subjectCode: 'BIO12',
    teacher: 'Dr. Ahmad Fauzan, M.Biotech.',
    room: 'Lab. Biologi',
    type: 'Teori'
  }
];

// Mock data absensi bulan Oktober 2024
export const attendanceData: AttendanceRecord[] = [
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
    date: '2024-10-01',
    subject: 'Fisika',
    status: 'Hadir',
    notes: ''
  },
  {
    id: 'ATT003',
    studentId: 'STU001',
    date: '2024-10-02',
    subject: 'Kimia',
    status: 'Izin',
    notes: 'Sakit demam'
  },
  {
    id: 'ATT004',
    studentId: 'STU001',
    date: '2024-10-03',
    subject: 'Biologi',
    status: 'Hadir',
    notes: ''
  }
];

// Mock pengumuman untuk siswa
export const announcements: Announcement[] = [
  {
    id: 'ANN001',
    title: 'Jadwal Ujian Tengah Semester',
    content: 'Ujian tengah semester akan dilaksanakan pada tanggal 15-20 Oktober 2024. Silakan persiapkan diri dengan baik.',
    date: '2024-10-01',
    category: 'Akademik',
    priority: 'Tinggi',
    isRead: false
  },
  {
    id: 'ANN002',
    title: 'Kegiatan Study Tour',
    content: 'Study tour ke museum nasional akan dilaksanakan bulan November. Informasi lebih lanjut akan disampaikan kemudian.',
    date: '2024-09-28',
    category: 'Kegiatan',
    priority: 'Sedang',
    isRead: true
  },
  {
    id: 'ANN003',
    title: 'Perubahan Jadwal Pelajaran',
    content: 'Jadwal pelajaran praktik kimia diubah menjadi hari Rabu pukul 13:00-15:00.',
    date: '2024-09-25',
    category: 'Akademik',
    priority: 'Sedang',
    isRead: false
  }
];

// Helper functions untuk menghitung statistik akademik
export function calculateGPA(grades: Grade[]): number {
  const completedGrades = grades.filter(grade => grade.status === 'Lulus' && grade.gradePoint);
  if (completedGrades.length === 0) return 0;

  const totalPoints = completedGrades.reduce((sum, grade) => sum + (grade.gradePoint || 0), 0);
  return Math.round((totalPoints / completedGrades.length) * 100) / 100;
}

export interface AttendanceStats {
  totalSessions: number;
  present: number;
  absent: number;
  excused: number;
  sick: number;
  attendanceRate: number;
}

export function getAttendanceStats(attendance: AttendanceRecord[]): AttendanceStats {
  const total = attendance.length;
  const present = attendance.filter(a => a.status === 'Hadir').length;
  const absent = attendance.filter(a => a.status === 'Alfa').length;
  const sick = attendance.filter(a => a.status === 'Sakit').length;
  const excused = attendance.filter(a => a.status === 'Izin').length;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  return { 
    totalSessions: total, 
    present, 
    absent, 
    sick, 
    excused, 
    attendanceRate,
    // Legacy properties
    total: total,
    permitted: excused,
    percentage: attendanceRate
  };
}

export interface AttendanceStats {
  totalSessions: number;
  present: number;
  absent: number;
  sick: number;
  excused: number;
  attendanceRate: number;
  // Legacy properties for backward compatibility
  total?: number;
  permitted?: number;
  percentage?: number;
}

export function getUnreadAnnouncements(announcements: Announcement[]): Announcement[] {
  return announcements.filter(announcement => !announcement.isRead);
}