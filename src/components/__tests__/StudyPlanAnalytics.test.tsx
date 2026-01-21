import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import StudyPlanAnalytics from '../StudyPlanAnalytics';
import * as apiService from '../../services/apiService';
import { authService } from '../../services/authService';
import { STORAGE_KEYS } from '../../constants';

vi.mock('../../services/apiService');
vi.mock('../../services/authService');
vi.mock('../../utils/logger');

const mockStudyPlan = {
  id: 'plan-123',
  studentId: 'student-123',
  studentName: 'Test Student',
  title: 'Rencana Belajar Semester 1',
  description: 'Rencana belajar untuk meningkatkan performa akademik',
  subjects: [
    {
      subjectName: 'Matematika',
      currentGrade: 75,
      targetGrade: '85',
      priority: 'high' as const,
      weeklyHours: 5,
      focusAreas: ['Aljabar', 'Geometri'],
      resources: ['Video Tutorial', 'Latihan Soal'],
    },
    {
      subjectName: 'Bahasa Indonesia',
      currentGrade: 82,
      targetGrade: '90',
      priority: 'medium' as const,
      weeklyHours: 3,
      focusAreas: ['Tata Bahasa', 'Pemahaman Bacaan'],
      resources: ['Artikel', 'Latihan Menulis'],
    },
  ],
  schedule: [
    {
      dayOfWeek: 'Monday',
      timeSlot: '08:00-09:30',
      subject: 'Matematika',
      activity: 'study' as const,
      duration: 90,
    },
    {
      dayOfWeek: 'Wednesday',
      timeSlot: '14:00-15:30',
      subject: 'Bahasa Indonesia',
      activity: 'practice' as const,
      duration: 90,
    },
  ],
  recommendations: [
    {
      category: 'study_tips' as const,
      title: 'Tips Belajar Efektif',
      description: 'Gunakan teknik pomodoro untuk fokus lebih baik',
      priority: 1,
    },
  ],
  createdAt: new Date().toISOString(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'active' as const,
};

const mockAnalytics = {
  planId: 'plan-123',
  studentId: 'student-123',
  studentName: 'Test Student',
  planTitle: 'Rencana Belajar Semester 1',
  overallProgress: 72.5,
  completionRate: 78.3,
  adherenceRate: 82.1,
  performanceImprovement: {
    averageGradeChange: 4.2,
    subjectsImproved: 2,
    subjectsDeclined: 0,
    subjectsMaintained: 2,
    topImprovements: [
      {
        subjectName: 'Matematika',
        previousGrade: 70,
        currentGrade: 75,
        improvement: 5,
      },
    ],
  },
  subjectProgress: [
    {
      subjectName: 'Matematika',
      targetGrade: 85,
      currentGrade: 75,
      progress: 88.2,
      priority: 'high' as const,
      sessionsCompleted: 7,
      sessionsTotal: 10,
      averageSessionDuration: 52,
    },
    {
      subjectName: 'Bahasa Indonesia',
      targetGrade: 90,
      currentGrade: 82,
      progress: 91.1,
      priority: 'medium' as const,
      sessionsCompleted: 5,
      sessionsTotal: 8,
      averageSessionDuration: 48,
    },
  ],
  weeklyActivity: [
    {
      weekNumber: 1,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalStudyHours: 12.5,
      scheduledHours: 15,
      adherenceRate: 83.3,
      subjectsStudied: ['Matematika', 'Bahasa Indonesia'],
      activitiesCompleted: 18,
      activitiesTotal: 25,
    },
  ],
  effectivenessScore: 76.8,
  recommendations: [
    {
      type: 'improvement' as const,
      category: 'schedule' as const,
      title: 'Tingkatkan Waktu Belajar Matematika',
      description: 'Kinerja Matematika meningkat 5%, namun masih perlu waktu belajar tambahan 2 jam per minggu.',
      actionable: true,
    },
    {
      type: 'success' as const,
      category: 'habits' as const,
      title: 'Kebiasaan Belajar yang Baik',
      description: 'Tingkat kepatuhan jadwal 78% menunjukkan komitmen yang baik terhadap rencana belajar.',
      actionable: false,
    },
  ],
  lastUpdated: new Date().toISOString(),
};

describe('StudyPlanAnalytics', () => {
  const mockOnBack = vi.fn();
  const mockOnShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    (authService.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue({
      id: 'student-123',
      name: 'Test Student',
      email: 'test@example.com',
      role: 'student',
      status: 'active',
    });

    (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: [
        {
          id: 'grade-1',
          studentId: 'student-123',
          subjectId: 'subject-1',
          score: 75,
          academicYear: '2024',
          semester: '1',
        },
        {
          id: 'grade-2',
          studentId: 'student-123',
          subjectId: 'subject-2',
          score: 82,
          academicYear: '2024',
          semester: '1',
        },
      ],
    });

    (apiService.subjectsAPI.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: [
        { id: 'subject-1', name: 'Matematika' },
        { id: 'subject-2', name: 'Bahasa Indonesia' },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    expect(screen.getByText('Analitik Rencana Belajar')).toBeInTheDocument();
    expect(screen.getByText('Melacak kemajuan dan efektivitas rencana belajar Anda')).toBeInTheDocument();
  });

  it('displays error when no active study plan exists', async () => {
    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Tidak ada rencana belajar aktif/)).toBeInTheDocument();
    });
  });

  it('displays analytics when study plan and data exist', async () => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(mockAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(mockStudyPlan.title)).toBeInTheDocument();
      expect(screen.getByText(mockStudyPlan.description)).toBeInTheDocument();
      expect(screen.getByText(/72\.5%/)).toBeInTheDocument();
    });
  });

  it('displays all tabs', async () => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(mockAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Ringkasan')).toBeInTheDocument();
      expect(screen.getByText('Kemajuan')).toBeInTheDocument();
      expect(screen.getByText('Per Mata Pelajaran')).toBeInTheDocument();
      expect(screen.getByText('Aktivitas Mingguan')).toBeInTheDocument();
      expect(screen.getByText('Rekomendasi')).toBeInTheDocument();
    });
  });

  it('displays overview tab metrics correctly', async () => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(mockAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Kemajuan Keseluruhan')).toBeInTheDocument();
      expect(screen.getByText('72.5%')).toBeInTheDocument();
      expect(screen.getByText('Tingkat Penyelesaian')).toBeInTheDocument();
      expect(screen.getByText('78.3%')).toBeInTheDocument();
      expect(screen.getByText('Tingkat Kepatuhan')).toBeInTheDocument();
      expect(screen.getByText('82.1%')).toBeInTheDocument();
      expect(screen.getByText('Peningkatan Kinerja')).toBeInTheDocument();
      expect(screen.getByText(/\+4\.2/)).toBeInTheDocument();
    });
  });

  it('switches between tabs correctly', async () => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(mockAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    });

    const subjectsTab = screen.getByText('Per Mata Pelajaran');
    fireEvent.click(subjectsTab);

    await waitFor(() => {
      expect(screen.getByText('Kemajuan per Mata Pelajaran')).toBeInTheDocument();
    });
  });

  it('displays subject progress in subjects tab', async () => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(mockAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    });

    const subjectsTab = screen.getByText('Per Mata Pelajaran');
    fireEvent.click(subjectsTab);

    await waitFor(() => {
      expect(screen.getByText('Matematika')).toBeInTheDocument();
      expect(screen.getByText('Bahasa Indonesia')).toBeInTheDocument();
    });
  });

  it('displays weekly activity in activities tab', async () => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(mockAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    });

    const activitiesTab = screen.getByText('Aktivitas Mingguan');
    fireEvent.click(activitiesTab);

    await waitFor(() => {
      expect(screen.getByText('Aktivitas Mingguan')).toBeInTheDocument();
      expect(screen.getByText(/12\.5 jam/)).toBeInTheDocument();
      expect(screen.getByText(/18\/25/)).toBeInTheDocument();
    });
  });

  it('displays recommendations correctly', async () => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(mockAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Tingkatkan Waktu Belajar Matematika')).toBeInTheDocument();
      expect(screen.getByText('Kebiasaan Belajar yang Baik')).toBeInTheDocument();
    });
  });

  it('calls handleRefreshAnalytics when refresh button is clicked', async () => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(mockAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Perbarui')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Perbarui');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockOnShowToast).toHaveBeenCalledWith('Memperbarui analitik...', 'info');
    });
  });

  it('exports analytics when export button is clicked', async () => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(mockAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Ekspor')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Ekspor');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockOnShowToast).toHaveBeenCalledWith('Analitik berhasil diekspor', 'success');
    });
  });

  it('calls onBack when back button is clicked', async () => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(mockAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Kembali')).toBeInTheDocument();
    });

    const backButton = screen.getAllByText('Kembali')[0];
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('displays effectiveness score badge', async () => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(mockAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Skor Efektivitas/)).toBeInTheDocument();
      expect(screen.getByText(/76\.8%/)).toBeInTheDocument();
    });
  });

  it('calculates analytics when cached data is old or missing', async () => {
    const oldAnalytics = {
      ...mockAnalytics,
      lastUpdated: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    };

    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(oldAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(mockStudyPlan.title)).toBeInTheDocument();
    });

    expect(apiService.gradesAPI.getByStudent).toHaveBeenCalled();
    expect(apiService.subjectsAPI.getAll).toHaveBeenCalled();
  });

  it('displays error message on API failure', async () => {
    (apiService.gradesAPI.getByStudent as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('API Error')
    );

    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Terjadi kesalahan/)).toBeInTheDocument();
    });
  });

  it('handles no current user gracefully', async () => {
    (authService.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValue(null);

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/User tidak ditemukan/)).toBeInTheDocument();
    });
  });

  it('displays all activity table columns', async () => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(mockAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    });

    const activitiesTab = screen.getByText('Aktivitas Mingguan');
    fireEvent.click(activitiesTab);

    await waitFor(() => {
      expect(screen.getByText('Minggu')).toBeInTheDocument();
      expect(screen.getByText('Tanggal')).toBeInTheDocument();
      expect(screen.getByText('Jam Belajar')).toBeInTheDocument();
      expect(screen.getByText('Jadwal')).toBeInTheDocument();
      expect(screen.getByText('Kepatuhan')).toBeInTheDocument();
      expect(screen.getByText('Aktivitas Selesai')).toBeInTheDocument();
    });
  });

  it('displays plan validity information', async () => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_STUDY_PLAN('student-123'),
      JSON.stringify(mockStudyPlan)
    );
    localStorage.setItem(
      STORAGE_KEYS.STUDY_PLAN_ANALYTICS('student-123'),
      JSON.stringify(mockAnalytics)
    );

    render(<StudyPlanAnalytics onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Berlaku hingga/)).toBeInTheDocument();
    });
  });
});
