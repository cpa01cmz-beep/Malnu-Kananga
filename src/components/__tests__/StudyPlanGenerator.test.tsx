import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import StudyPlanGenerator from '../StudyPlanGenerator';
import * as apiService from '../../services/apiService';
import * as geminiService from '../../services/geminiService';
import { STORAGE_KEYS } from '../../constants';

vi.mock('../../services/apiService');
vi.mock('../../services/geminiService');

const mockOnBack = vi.fn();
const mockOnShowToast = vi.fn();

const _mockSubjectPerformance = [
  {
    subject: 'Matematika',
    averageScore: 75,
    assignment: 70,
    midExam: 80,
    finalExam: 75,
    grade: 'B',
    trend: 'up',
  },
  {
    subject: 'Bahasa Indonesia',
    averageScore: 85,
    assignment: 90,
    midExam: 85,
    finalExam: 80,
    grade: 'A',
    trend: 'stable',
  },
  {
    subject: 'Fisika',
    averageScore: 60,
    assignment: 55,
    midExam: 65,
    finalExam: 60,
    grade: 'C',
    trend: 'down',
  },
];

const _mockCorrelation = {
  attendancePercentage: 95,
  averageGrade: 73,
  correlationScore: 80,
  insights: [
    'Kehadiran Anda sangat baik, tetap pertahankan!',
    'Prestasi akademik baik, tingkatkan fokus belajar untuk hasil lebih baik.',
  ],
};

const mockGoals = [
  {
    id: '1',
    studentId: 'student123',
    subject: 'Matematika',
    targetGrade: 'A',
    currentGrade: 75,
    deadline: '2026-02-28',
    status: 'in-progress',
    createdAt: '2026-01-19T00:00:00.000Z',
  },
  {
    id: '2',
    studentId: 'student123',
    subject: 'Fisika',
    targetGrade: 'B',
    currentGrade: 60,
    deadline: '2026-02-28',
    status: 'in-progress',
    createdAt: '2026-01-19T00:00:00.000Z',
  },
];

const mockStudyPlan = {
  id: 'study_plan_123',
  studentId: 'student123',
  studentName: 'Test Student',
  title: 'Rencana Belajar Personal - Semester Ganjil',
  description: 'Rencana belajar personal untuk meningkatkan performa akademik di semester ganjil.',
  subjects: [
    {
      subjectName: 'Matematika',
      currentGrade: 75,
      targetGrade: 'A',
      priority: 'high',
      weeklyHours: 6,
      focusAreas: ['Aljabar', 'Geometri', 'Statistik'],
      resources: ['Modul Matematika', 'Video Tutorial', 'Latihan Soal'],
    },
    {
      subjectName: 'Fisika',
      currentGrade: 60,
      targetGrade: 'B',
      priority: 'high',
      weeklyHours: 5,
      focusAreas: ['Mekanika', 'Energi', 'Listrik'],
      resources: ['Buku Teks Fisika', 'Praktikum Virtual', 'Video Pembelajaran'],
    },
    {
      subjectName: 'Bahasa Indonesia',
      currentGrade: 85,
      targetGrade: 'A',
      priority: 'low',
      weeklyHours: 3,
      focusAreas: ['Pemahaman Bacaan', 'Penulisan', 'Literasi'],
      resources: ['Artikel Koran', 'Buku Sastra', 'Latihan Menulis'],
    },
  ],
  schedule: [
    {
      dayOfWeek: 'Senin',
      timeSlot: '15:00-16:00',
      subject: 'Matematika',
      activity: 'study',
      duration: 60,
    },
    {
      dayOfWeek: 'Senin',
      timeSlot: '16:00-17:00',
      subject: 'Fisika',
      activity: 'practice',
      duration: 60,
    },
    {
      dayOfWeek: 'Selasa',
      timeSlot: '15:00-16:00',
      subject: 'Bahasa Indonesia',
      activity: 'review',
      duration: 60,
    },
  ],
  recommendations: [
    {
      category: 'study_tips',
      title: 'Teknik Pomodoro',
      description: 'Gunakan teknik Pomodoro untuk meningkatkan fokus belajar. Belajar 25 menit, istirahat 5 menit.',
      priority: 1,
    },
    {
      category: 'time_management',
      title: 'Prioritaskan Tugas',
      description: 'Buat daftar tugas dan urutkan berdasarkan prioritas dan tenggat waktu.',
      priority: 1,
    },
    {
      category: 'subject_advice',
      title: 'Fokus pada Prinsip Dasar',
      description: 'Untuk Fisika dan Matematika, pahami prinsip dasar sebelum melangkah ke topik lanjutan.',
      priority: 2,
    },
  ],
  createdAt: '2026-01-19T00:00:00.000Z',
  validUntil: '2026-02-16T00:00:00.000Z',
  status: 'active',
};

describe('StudyPlanGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => {
        if (key === STORAGE_KEYS.STUDENT_GOALS('student123')) {
          return JSON.stringify(mockGoals);
        }
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Loading State', () => {
    it('should show loading state initially', async () => {
      (apiService.authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'student123',
        name: 'Test Student',
        email: 'test@example.com',
        role: 'student',
      });

      (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.attendanceAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      render(<StudyPlanGenerator onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Rencana Belajar AI')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load student data successfully', async () => {
      (apiService.authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'student123',
        name: 'Test Student',
        email: 'test@example.com',
        role: 'student',
      });

      (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [
          { id: '1', studentId: 'student123', subjectId: 'sub1', score: 75, assignmentType: 'tugas' },
          { id: '2', studentId: 'student123', subjectId: 'sub2', score: 85, assignmentType: 'uts' },
          { id: '3', studentId: 'student123', subjectId: 'sub3', score: 60, assignmentType: 'uas' },
        ],
      });

      (apiService.subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [
          { id: 'sub1', name: 'Matematika' },
          { id: 'sub2', name: 'Bahasa Indonesia' },
          { id: 'sub3', name: 'Fisika' },
        ],
      });

      (apiService.attendanceAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [
          { id: '1', studentId: 'student123', status: 'hadir', date: '2026-01-19' },
          { id: '2', studentId: 'student123', status: 'hadir', date: '2026-01-18' },
        ],
      });

      render(<StudyPlanGenerator onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Belum ada rencana belajar yang dibuat')).toBeInTheDocument();
      });

      expect(apiService.gradesAPI.getByStudent).toHaveBeenCalledWith('student123');
      expect(apiService.subjectsAPI.getAll).toHaveBeenCalled();
      expect(apiService.attendanceAPI.getByStudent).toHaveBeenCalledWith('student123');
    });
  });

  describe('Study Plan Generation', () => {
    it('should generate study plan when button is clicked', async () => {
      (apiService.authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'student123',
        name: 'Test Student',
        email: 'test@example.com',
        role: 'student',
      });

      (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [
          { id: '1', studentId: 'student123', subjectId: 'sub1', score: 75, assignmentType: 'tugas' },
          { id: '2', studentId: 'student123', subjectId: 'sub2', score: 85, assignmentType: 'uts' },
          { id: '3', studentId: 'student123', subjectId: 'sub3', score: 60, assignmentType: 'uas' },
        ],
      });

      (apiService.subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [
          { id: 'sub1', name: 'Matematika' },
          { id: 'sub2', name: 'Bahasa Indonesia' },
          { id: 'sub3', name: 'Fisika' },
        ],
      });

      (apiService.attendanceAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [
          { id: '1', studentId: 'student123', status: 'hadir', date: '2026-01-19' },
        ],
      });

      (geminiService.generateStudyPlan as ReturnType<typeof vi.fn>).mockResolvedValue(mockStudyPlan);

      render(<StudyPlanGenerator onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Buat Rencana Belajar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Buat Rencana Belajar'));

      await waitFor(() => {
        expect(geminiService.generateStudyPlan).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockOnShowToast).toHaveBeenCalledWith('Rencana belajar berhasil dibuat', 'success');
      });
    });

    it('should show loading state while generating study plan', async () => {
      (apiService.authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'student123',
        name: 'Test Student',
        email: 'test@example.com',
        role: 'student',
      });

      (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.attendanceAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      let resolveGeneration: (value: unknown) => void;
      (geminiService.generateStudyPlan as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => {
          resolveGeneration = resolve;
        })
      );

      render(<StudyPlanGenerator onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Buat Rencana Belajar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Buat Rencana Belajar'));

      await waitFor(() => {
        expect(screen.getByText('Membuat Rencana...')).toBeInTheDocument();
      });

      if (resolveGeneration) {
        resolveGeneration(mockStudyPlan);
      }
    });

    it('should handle study plan generation error', async () => {
      (apiService.authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'student123',
        name: 'Test Student',
        email: 'test@example.com',
        role: 'student',
      });

      (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.attendanceAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (geminiService.generateStudyPlan as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error')
      );

      render(<StudyPlanGenerator onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Buat Rencana Belajar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Buat Rencana Belajar'));

      await waitFor(() => {
        expect(screen.getByText('Gagal membuat rencana belajar')).toBeInTheDocument();
      });

      expect(mockOnShowToast).toHaveBeenCalledWith('Gagal membuat rencana belajar', 'error');
    });
  });

  describe('Study Plan Display', () => {
    it('should display study plan overview', async () => {
      (apiService.authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'student123',
        name: 'Test Student',
        email: 'test@example.com',
        role: 'student',
      });

      (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.attendanceAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key: string) => {
          if (key === STORAGE_KEYS.ACTIVE_STUDY_PLAN('student123')) {
            return JSON.stringify(mockStudyPlan);
          }
          if (key === STORAGE_KEYS.STUDENT_GOALS('student123')) {
            return JSON.stringify(mockGoals);
          }
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });

      render(<StudyPlanGenerator onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText(mockStudyPlan.title)).toBeInTheDocument();
      });

      expect(screen.getByText(mockStudyPlan.description)).toBeInTheDocument();
      expect(screen.getByText('Ringkasan')).toBeInTheDocument();
      expect(screen.getByText('Mata Pelajaran')).toBeInTheDocument();
      expect(screen.getByText('Jadwal')).toBeInTheDocument();
      expect(screen.getByText('Rekomendasi')).toBeInTheDocument();
    });

    it('should display subjects with priority badges', async () => {
      (apiService.authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'student123',
        name: 'Test Student',
        email: 'test@example.com',
        role: 'student',
      });

      (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.attendanceAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key: string) => {
          if (key === STORAGE_KEYS.ACTIVE_STUDY_PLAN('student123')) {
            return JSON.stringify(mockStudyPlan);
          }
          if (key === STORAGE_KEYS.STUDENT_GOALS('student123')) {
            return JSON.stringify(mockGoals);
          }
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });

      render(<StudyPlanGenerator onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Mata Pelajaran')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Mata Pelajaran'));

      await waitFor(() => {
        expect(screen.getByText('Matematika')).toBeInTheDocument();
        expect(screen.getByText('Fisika')).toBeInTheDocument();
        expect(screen.getByText('Bahasa Indonesia')).toBeInTheDocument();
      });

      expect(screen.getByText('Prioritas Tinggi')).toBeInTheDocument();
    });

    it('should display weekly schedule', async () => {
      (apiService.authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'student123',
        name: 'Test Student',
        email: 'test@example.com',
        role: 'student',
      });

      (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.attendanceAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key: string) => {
          if (key === STORAGE_KEYS.ACTIVE_STUDY_PLAN('student123')) {
            return JSON.stringify(mockStudyPlan);
          }
          if (key === STORAGE_KEYS.STUDENT_GOALS('student123')) {
            return JSON.stringify(mockGoals);
          }
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });

      render(<StudyPlanGenerator onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Jadwal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Jadwal'));

      await waitFor(() => {
        expect(screen.getByText('Senin')).toBeInTheDocument();
      });
    });

    it('should display recommendations', async () => {
      (apiService.authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'student123',
        name: 'Test Student',
        email: 'test@example.com',
        role: 'student',
      });

      (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.attendanceAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key: string) => {
          if (key === STORAGE_KEYS.ACTIVE_STUDY_PLAN('student123')) {
            return JSON.stringify(mockStudyPlan);
          }
          if (key === STORAGE_KEYS.STUDENT_GOALS('student123')) {
            return JSON.stringify(mockGoals);
          }
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });

      render(<StudyPlanGenerator onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Rekomendasi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Rekomendasi'));

      await waitFor(() => {
        expect(screen.getByText('Teknik Pomodoro')).toBeInTheDocument();
        expect(screen.getByText('Prioritaskan Tugas')).toBeInTheDocument();
      });
    });
  });

  describe('Study Plan Actions', () => {
    it('should delete study plan when delete button is clicked', async () => {
      (apiService.authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'student123',
        name: 'Test Student',
        email: 'test@example.com',
        role: 'student',
      });

      (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.attendanceAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      const removeItemMock = vi.fn();
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key: string) => {
          if (key === STORAGE_KEYS.ACTIVE_STUDY_PLAN('student123')) {
            return JSON.stringify(mockStudyPlan);
          }
          if (key === STORAGE_KEYS.STUDENT_GOALS('student123')) {
            return JSON.stringify(mockGoals);
          }
          return null;
        }),
        setItem: vi.fn(),
        removeItem: removeItemMock,
      });

      render(<StudyPlanGenerator onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Hapus Rencana')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Hapus Rencana'));

      await waitFor(() => {
        expect(removeItemMock).toHaveBeenCalledWith(STORAGE_KEYS.ACTIVE_STUDY_PLAN('student123'));
      });

      expect(screen.getByText('Belum ada rencana belajar yang dibuat')).toBeInTheDocument();
    });
  });

  describe('Duration Selection', () => {
    it('should change duration weeks when select value changes', async () => {
      (apiService.authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'student123',
        name: 'Test Student',
        email: 'test@example.com',
        role: 'student',
      });

      (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.attendanceAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      render(<StudyPlanGenerator onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Durasi:')).toBeInTheDocument();
      });

      const durationSelect = screen.getByRole('combobox');
      fireEvent.change(durationSelect, { target: { value: '6' } });

      await waitFor(() => {
        expect(screen.getByDisplayValue('6 Minggu')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', () => {
      (apiService.authAPI.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'student123',
        name: 'Test Student',
        email: 'test@example.com',
        role: 'student',
      });

      (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      (apiService.attendanceAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      render(<StudyPlanGenerator onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const backButton = screen.getAllByText('← Kembali')[0];
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });
});