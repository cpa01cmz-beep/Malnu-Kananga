// Data dan interface untuk portal orang tua
// Sistem informasi akademik untuk monitoring anak

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  profileImage?: string;
  relationship: 'Ayah' | 'Ibu' | 'Wali';
  occupation?: string;
  registrationDate: string;
  status: 'active' | 'inactive';
}

export interface Child {
  id: string;
  name: string;
  class: string;
  studentId: string;
  profileImage?: string;
  dateOfBirth: string;
  academicYear: string;
  status: 'active' | 'inactive' | 'graduate';
}

export interface _Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  teacherName: string;
  classId: string;
  dueDate: string;
  assignedDate: string;
  maxScore: number;
  instructions?: string;
  attachments?: string[];
  status: 'assigned' | 'submitted' | 'graded' | 'overdue';
  submission?: {
    submittedAt: string;
    fileUrl?: string;
    score?: number;
    feedback?: string;
  };
}

export interface _Message {
  id: string;
  from: {
    id: string;
    name: string;
    role: 'parent' | 'teacher' | 'admin';
  };
  to: {
    id: string;
    name: string;
    role: 'parent' | 'teacher' | 'admin';
  };
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface _AcademicReport {
  id: string;
  studentId: string;
  studentName: string;
  semester: number;
  academicYear: string;
  overallGPA: number;
  attendanceRate: number;
  subjects: {
    name: string;
    teacher: string;
    midtermScore?: number;
    finalScore?: number;
    assignmentScore?: number;
    attendanceScore?: number;
    finalGrade?: string;
    gradePoint?: number;
  }[];
  teacherComments?: string;
  parentSignature?: string;
  generatedAt: string;
}

// Mock data untuk orang tua
export const currentParent: Parent = {
  id: 'PAR001',
  name: 'Bapak Ahmad Rahman',
  email: 'parent@ma-malnukananga.sch.id',
  phone: '081987654321',
  address: 'Jl. Pendidikan No. 123, Kananga, Pandeglang',
  profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  relationship: 'Ayah',
  occupation: 'Pegawai Negeri Sipil',
  registrationDate: '2024-07-01',
  status: 'active'
};

// Mock data anak yang dipantau
export const parentChildren: Child[] = [
  {
    id: 'CHD001',
    name: 'Ahmad Fauzi Rahman',
    class: 'XII IPA 1',
    studentId: 'STU001',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    dateOfBirth: '2007-03-15',
    academicYear: '2024/2025',
    status: 'active'
  },
  {
    id: 'CHD002',
    name: 'Siti Aminah Rahman',
    class: 'X IPA 1',
    studentId: 'STU006',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    dateOfBirth: '2009-08-20',
    academicYear: '2024/2025',
    status: 'active'
  }
];

// Mock data tugas untuk anak
export const assignmentsData: _Assignment[] = [
  {
    id: 'ASG001',
    title: 'Laporan Praktikum Fisika',
    description: 'Buatlah laporan praktikum gerak parabola dengan format yang telah ditentukan',
    subject: 'Fisika',
    teacherName: 'Prof. Budi Santoso, M.T.',
    classId: 'CLS001',
    dueDate: '2024-10-15',
    assignedDate: '2024-10-01',
    maxScore: 100,
    instructions: '1. Gunakan format laporan yang benar\n2. Sertakan hasil pengukuran\n3. Analisis data dengan grafik',
    attachments: ['template-laporan.docx'],
    status: 'assigned'
  },
  {
    id: 'ASG002',
    title: 'Essay Bahasa Indonesia',
    description: 'Tulis essay tentang pentingnya pelestarian budaya lokal',
    subject: 'Bahasa Indonesia',
    teacherName: 'Drs. Joko Widodo, M.Hum.',
    classId: 'CLS001',
    dueDate: '2024-10-10',
    assignedDate: '2024-09-25',
    maxScore: 100,
    instructions: 'Minimal 1000 kata, sertakan referensi',
    status: 'submitted',
    submission: {
      submittedAt: '2024-10-08',
      fileUrl: 'essay-budaya-lokal.pdf',
      score: 85,
      feedback: 'Analisis yang baik, namun perlu lebih banyak contoh konkret'
    }
  },
  {
    id: 'ASG003',
    title: 'Presentasi Matematika',
    description: 'Presentasi tentang aplikasi turunan dalam kehidupan sehari-hari',
    subject: 'Matematika',
    teacherName: 'Dr. Siti Nurhaliza, M.Pd.',
    classId: 'CLS001',
    dueDate: '2024-10-05',
    assignedDate: '2024-09-20',
    maxScore: 100,
    status: 'overdue'
  }
];

// Mock data pesan
export const messagesData: _Message[] = [
  {
    id: 'MSG001',
    from: {
      id: 'TCH001',
      name: 'Dr. Siti Nurhaliza, M.Pd.',
      role: 'teacher'
    },
    to: {
      id: 'PAR001',
      name: 'Bapak Ahmad Rahman',
      role: 'parent'
    },
    subject: 'Perkembangan Akademik Ahmad Fauzi',
    content: 'Assalamualaikum Bapak Ahmad, saya ingin memberikan update mengenai perkembangan akademik Ahmad Fauzi di mata pelajaran Matematika. Beliau menunjukkan peningkatan yang signifikan dalam beberapa minggu terakhir.',
    timestamp: '2024-10-01T10:30:00Z',
    isRead: false,
    priority: 'normal'
  },
  {
    id: 'MSG002',
    from: {
      id: 'ADM001',
      name: 'Admin Sekolah',
      role: 'admin'
    },
    to: {
      id: 'PAR001',
      name: 'Bapak Ahmad Rahman',
      role: 'parent'
    },
    subject: 'Undangan Rapat Orang Tua Siswa',
    content: 'Dengan hormat, kami mengundang Bapak/Ibu untuk menghadiri rapat orang tua siswa yang akan dilaksanakan pada tanggal 20 Oktober 2024 pukul 08:00 WIB.',
    timestamp: '2024-09-28T14:20:00Z',
    isRead: true,
    priority: 'high'
  }
];

// Mock data rapor akademik
export const academicReports: _AcademicReport[] = [
  {
    id: 'RPT001',
    studentId: 'STU001',
    studentName: 'Ahmad Fauzi Rahman',
    semester: 1,
    academicYear: '2024/2025',
    overallGPA: 3.8,
    attendanceRate: 95,
    subjects: [
      {
        name: 'Matematika',
        teacher: 'Dr. Siti Nurhaliza, M.Pd.',
        midtermScore: 85,
        finalScore: 88,
        assignmentScore: 82,
        attendanceScore: 90,
        finalGrade: 'A',
        gradePoint: 4.0
      },
      {
        name: 'Fisika',
        teacher: 'Prof. Budi Santoso, M.T.',
        midtermScore: 78,
        finalScore: 82,
        assignmentScore: 80,
        attendanceScore: 85,
        finalGrade: 'B+',
        gradePoint: 3.5
      }
    ],
    teacherComments: 'Ahmad Fauzi menunjukkan kemajuan yang baik dalam semester ini. Perlu meningkatkan konsistensi dalam mengerjakan tugas.',
    generatedAt: '2024-09-30'
  }
];

// Helper functions untuk portal orang tua
export function getUnreadMessages(messages: _Message[]): _Message[] {
  return messages.filter(message => !message.isRead);
}

export function getPendingAssignments(assignments: _Assignment[]): _Assignment[] {
  return assignments.filter(assignment =>
    assignment.status === 'assigned' || assignment.status === 'overdue'
  );
}

export function getUpcomingAssignments(assignments: _Assignment[], days: number = 7): _Assignment[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

  return assignments.filter(assignment => {
    const dueDate = new Date(assignment.dueDate);
    return dueDate >= now && dueDate <= futureDate && assignment.status === 'assigned';
  });
}

export function getAssignmentStats(assignments: _Assignment[]): {
  total: number;
  submitted: number;
  pending: number;
  overdue: number;
  averageScore: number;
} {
  const total = assignments.length;
  const submitted = assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length;
  const pending = assignments.filter(a => a.status === 'assigned').length;
  const overdue = assignments.filter(a => a.status === 'overdue').length;

  const gradedAssignments = assignments.filter(a => a.submission?.score !== undefined);
  const averageScore = gradedAssignments.length > 0
    ? gradedAssignments.reduce((sum, a) => sum + (a.submission?.score || 0), 0) / gradedAssignments.length
    : 0;

  return { total, submitted, pending, overdue, averageScore: Math.round(averageScore * 10) / 10 };
}