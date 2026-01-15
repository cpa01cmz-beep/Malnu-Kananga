import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import LessonPlanning from '../LessonPlanning';
import * as lessonPlanHook from '../../hooks/useLessonPlanning';

vi.mock('../../hooks/useLessonPlanning');

describe('LessonPlanning Component', () => {
  const mockShowToast = vi.fn();
  const mockGenerateLessonPlan = vi.fn();
  const mockSaveLessonPlan = vi.fn();
  const mockLoadSavedPlans = vi.fn();
  const mockClearError = vi.fn();

  const mockTemplates = [
    {
      id: 'template_1',
      name: 'Template 1',
      description: 'Test template 1',
      subject: undefined,
      grade: undefined,
      structure: {
        activities: [],
        assessmentType: 'formative' as const
      },
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'template_2',
      name: 'Template 2',
      description: 'Test template 2',
      subject: undefined,
      grade: undefined,
      structure: {
        activities: [],
        assessmentType: 'summative' as const
      },
      isDefault: false,
      createdAt: new Date().toISOString()
    }
  ];

  const mockLessonPlan = {
    id: 'test-plan-1',
    title: 'Pecahan dan Desimal',
    subject: 'Matematika',
    grade: 'Kelas X',
    topic: 'Pecahan dan Desimal',
    objectives: [
      'Siswa dapat memahami konsep pecahan',
      'Siswa dapat melakukan operasi dasar pecahan'
    ],
    materials: ['Buku teks', 'Spidol', 'Kalkulator'],
    duration: 90,
    activities: [
      {
        id: '1',
        name: 'Pendahuluan',
        description: 'Mengenalkan konsep pecahan',
        duration: 10,
        type: 'introduction' as const
      },
      {
        id: '2',
        name: 'Materi Utama',
        description: 'Penjelasan operasi pecahan',
        duration: 60,
        type: 'main' as const
      },
      {
        id: '3',
        name: 'Penutup',
        description: 'Rangkuman materi',
        duration: 20,
        type: 'conclusion' as const
      }
    ],
    assessment: {
      type: 'formative' as const,
      method: 'Kuis',
      criteria: ['Pemahaman konsep', 'Ketepatan perhitungan'],
      rubric: 'Rubrik kuis pecahan'
    },
    homework: 'Selesaikan latihan soal halaman 45',
    notes: 'Sesuaikan kecepatan dengan siswa',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'AI'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(lessonPlanHook, 'useLessonPlanning').mockReturnValue({
      lessonPlan: null,
      isGenerating: false,
      error: null,
      templates: mockTemplates,
      generateLessonPlan: mockGenerateLessonPlan,
      saveLessonPlan: mockSaveLessonPlan,
      loadSavedPlans: mockLoadSavedPlans,
      clearError: mockClearError
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial render', () => {
    it.skip('should render the component with title', () => {
      render(<LessonPlanning onShowToast={mockShowToast} />);

      expect(screen.getByText('AI-Powered Lesson Planning')).toBeInTheDocument();
      expect(screen.getByText('Buat rencana pembelajaran yang komprehensif dengan bantuan AI')).toBeInTheDocument();
    });

    it.skip('should render form fields', () => {
      render(<LessonPlanning onShowToast={mockShowToast} />);

      expect(screen.getByLabelText('Mata Pelajaran *')).toBeInTheDocument();
      expect(screen.getByLabelText('Kelas *')).toBeInTheDocument();
      expect(screen.getByLabelText('Topik Pembelajaran *')).toBeInTheDocument();
      expect(screen.getByLabelText('Durasi Pembelajaran')).toBeInTheDocument();
      expect(screen.getByLabelText('Tingkat Siswa')).toBeInTheDocument();
    });

    it.skip('should render template cards', () => {
      render(<LessonPlanning onShowToast={mockShowToast} />);

      expect(screen.getByText('Template Rencana Pembelajaran')).toBeInTheDocument();
      expect(screen.getByText('Template 1')).toBeInTheDocument();
      expect(screen.getByText('Template 2')).toBeInTheDocument();
    });

    it.skip('should render generate button', () => {
      render(<LessonPlanning onShowToast={mockShowToast} />);

      expect(screen.getByRole('button', { name: /buat rencana pembelajaran/i })).toBeInTheDocument();
    });

    it.skip('should render reset button', () => {
      render(<LessonPlanning onShowToast={mockShowToast} />);

      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it.skip('should render form with all required elements', () => {
      render(<LessonPlanning onShowToast={mockShowToast} />);

      expect(screen.getByLabelText('Mata Pelajaran *')).toBeInTheDocument();
      expect(screen.getByLabelText('Kelas *')).toBeInTheDocument();
      expect(screen.getByLabelText('Topik Pembelajaran *')).toBeInTheDocument();
      expect(screen.getByLabelText('Durasi Pembelajaran')).toBeInTheDocument();
      expect(screen.getByLabelText('Tingkat Siswa')).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it.skip('should show toast when required fields are missing', async () => {
      mockGenerateLessonPlan.mockResolvedValue({
        success: true,
        lessonPlan: mockLessonPlan
      });

      render(<LessonPlanning onShowToast={mockShowToast} />);

      const subjectInput = screen.getByLabelText('Mata Pelajaran *') as HTMLInputElement;
      const gradeInput = screen.getByLabelText('Kelas *') as HTMLSelectElement;

      await act(async () => {
        await fireEvent.change(subjectInput, { target: { value: 'Matematika' } });
        await fireEvent.change(gradeInput, { target: { value: 'Kelas X' } });
      });

      const generateButton = screen.getByRole('button', { name: /buat rencana pembelajaran/i });

      await act(async () => {
        await fireEvent.click(generateButton);
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        'Mohon lengkapi mata pelajaran, kelas, dan topik',
        'error'
      );
      expect(mockGenerateLessonPlan).not.toHaveBeenCalled();
    });

    it.skip('should validate form before submission', async () => {
      mockGenerateLessonPlan.mockResolvedValue({
        success: true,
        lessonPlan: mockLessonPlan
      });

      render(<LessonPlanning onShowToast={mockShowToast} />);

      const generateButton = screen.getByRole('button', { name: /buat rencana pembelajaran/i });
      
      expect(generateButton).toBeDisabled();
    });
  });

  describe('generating lesson plan', () => {
    it.skip('should call generateLessonPlan with correct parameters', async () => {
      mockGenerateLessonPlan.mockResolvedValue({
        success: true,
        lessonPlan: mockLessonPlan
      });

      render(<LessonPlanning onShowToast={mockShowToast} />);

      const subjectInput = screen.getByLabelText('Mata Pelajaran *') as HTMLInputElement;
      const gradeInput = screen.getByLabelText('Kelas *') as HTMLSelectElement;
      const topicInput = screen.getByLabelText('Topik Pembelajaran *') as HTMLInputElement;

      await fireEvent.change(subjectInput, { target: { value: 'Matematika' } });
      await fireEvent.change(gradeInput, { target: { value: 'Kelas X' } });
      await fireEvent.change(topicInput, { target: { value: 'Pecahan dan Desimal' } });

      const generateButton = screen.getByRole('button', { name: /buat rencana pembelajaran/i });
      await fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateLessonPlan).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: 'Matematika',
            grade: 'Kelas X',
            topic: 'Pecahan dan Desimal',
            duration: 90,
            includeMaterials: true,
            includeHomework: true
          })
        );
      });
    });

    it.skip('should show loading state while generating', async () => {
      let resolveGeneration: ((value: any) => void) | undefined;
      mockGenerateLessonPlan.mockImplementation(() => {
        return new Promise((resolve) => {
          resolveGeneration = resolve;
        });
      });

      render(<LessonPlanning onShowToast={mockShowToast} />);

      const subjectInput = screen.getByLabelText('Mata Pelajaran *') as HTMLInputElement;
      const gradeInput = screen.getByLabelText('Kelas *') as HTMLSelectElement;
      const topicInput = screen.getByLabelText('Topik Pembelajaran *') as HTMLInputElement;

      await act(async () => {
        await fireEvent.change(subjectInput, { target: { value: 'Matematika' } });
        await fireEvent.change(gradeInput, { target: { value: 'Kelas X' } });
        await fireEvent.change(topicInput, { target: { value: 'Pecahan dan Desimal' } });
      });

      const generateButton = screen.getByRole('button', { name: /buat rencana pembelajaran/i });
      
      await act(async () => {
        await fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/sedang membuat/i)).toBeInTheDocument();
      });
      expect(generateButton).toBeDisabled();

      await act(async () => {
        resolveGeneration!({ success: true, lessonPlan: mockLessonPlan });
      });
    });

    it.skip('should show success toast on successful generation', async () => {
      mockGenerateLessonPlan.mockResolvedValue({
        success: true,
        lessonPlan: mockLessonPlan
      });

      render(<LessonPlanning onShowToast={mockShowToast} />);

      const subjectInput = screen.getByLabelText('Mata Pelajaran *') as HTMLInputElement;
      const gradeInput = screen.getByLabelText('Kelas *') as HTMLSelectElement;
      const topicInput = screen.getByLabelText('Topik Pembelajaran *') as HTMLInputElement;

      await fireEvent.change(subjectInput, { target: { value: 'Matematika' } });
      await fireEvent.change(gradeInput, { target: { value: 'Kelas X' } });
      await fireEvent.change(topicInput, { target: { value: 'Pecahan dan Desimal' } });

      const generateButton = screen.getByRole('button', { name: /buat rencana pembelajaran/i });
      await fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Rencana pembelajaran berhasil dibuat!',
          'success'
        );
      });
    });

    it.skip('should show error toast on failed generation', async () => {
      mockGenerateLessonPlan.mockResolvedValue({
        success: false,
        error: 'AI generation failed'
      });

      render(<LessonPlanning onShowToast={mockShowToast} />);

      const subjectInput = screen.getByLabelText('Mata Pelajaran *') as HTMLInputElement;
      const gradeInput = screen.getByLabelText('Kelas *') as HTMLSelectElement;
      const topicInput = screen.getByLabelText('Topik Pembelajaran *') as HTMLInputElement;

      await fireEvent.change(subjectInput, { target: { value: 'Matematika' } });
      await fireEvent.change(gradeInput, { target: { value: 'Kelas X' } });
      await fireEvent.change(topicInput, { target: { value: 'Pecahan dan Desimal' } });

      const generateButton = screen.getByRole('button', { name: /buat rencana pembelajaran/i });
      await fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'AI generation failed',
          'error'
        );
      });
    });

    it.skip('should handle empty learningObjectives array', async () => {
      mockGenerateLessonPlan.mockResolvedValue({
        success: true,
        lessonPlan: mockLessonPlan
      });

      render(<LessonPlanning onShowToast={mockShowToast} />);

      const subjectInput = screen.getByLabelText('Mata Pelajaran *') as HTMLInputElement;
      const gradeInput = screen.getByLabelText('Kelas *') as HTMLSelectElement;
      const topicInput = screen.getByLabelText('Topik Pembelajaran *') as HTMLInputElement;

      await fireEvent.change(subjectInput, { target: { value: 'Matematika' } });
      await fireEvent.change(gradeInput, { target: { value: 'Kelas X' } });
      await fireEvent.change(topicInput, { target: { value: 'Pecahan dan Desimal' } });

      const generateButton = screen.getByRole('button', { name: /buat rencana pembelajaran/i });
      await fireEvent.click(generateButton);

      expect(mockGenerateLessonPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          learningObjectives: expect.any(Array)
        })
      );
    });
  });

  describe('lesson plan preview', () => {
    it.skip('should show lesson plan preview after generation', async () => {
      mockGenerateLessonPlan.mockResolvedValue({
        success: true,
        lessonPlan: mockLessonPlan
      });

      render(<LessonPlanning onShowToast={mockShowToast} />);

      const subjectInput = screen.getByLabelText('Mata Pelajaran *') as HTMLInputElement;
      const gradeInput = screen.getByLabelText('Kelas *') as HTMLSelectElement;
      const topicInput = screen.getByLabelText('Topik Pembelajaran *') as HTMLInputElement;

      await fireEvent.change(subjectInput, { target: { value: 'Matematika' } });
      await fireEvent.change(gradeInput, { target: { value: 'Kelas X' } });
      await fireEvent.change(topicInput, { target: { value: 'Pecahan dan Desimal' } });

      const generateButton = screen.getByRole('button', { name: /buat rencana pembelajaran/i });
      
      await act(async () => {
        await fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(screen.getByText(mockLessonPlan.title)).toBeInTheDocument();
      });
      expect(screen.getByText(`${mockLessonPlan.subject} • ${mockLessonPlan.grade} • ${mockLessonPlan.duration} menit`)).toBeInTheDocument();
      expect(screen.getByText('Tujuan Pembelajaran')).toBeInTheDocument();
      expect(screen.getByText('Bahan dan Alat yang Dibutuhkan')).toBeInTheDocument();
      expect(screen.getByText('Aktivitas Pembelajaran')).toBeInTheDocument();
      expect(screen.getByText('Penilaian')).toBeInTheDocument();
    });

    it.skip('should show back button in preview mode', async () => {
      mockGenerateLessonPlan.mockResolvedValue({
        success: true,
        lessonPlan: mockLessonPlan
      });

      render(<LessonPlanning onShowToast={mockShowToast} />);

      const subjectInput = screen.getByLabelText('Mata Pelajaran *') as HTMLInputElement;
      const gradeInput = screen.getByLabelText('Kelas *') as HTMLSelectElement;
      const topicInput = screen.getByLabelText('Topik Pembelajaran *') as HTMLInputElement;

      await fireEvent.change(subjectInput, { target: { value: 'Matematika' } });
      await fireEvent.change(gradeInput, { target: { value: 'Kelas X' } });
      await fireEvent.change(topicInput, { target: { value: 'Pecahan dan Desimal' } });

      const generateButton = screen.getByRole('button', { name: /buat rencana pembelajaran/i });
      
      await act(async () => {
        await fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /kembali/i })).toBeInTheDocument();
      });
    });

    it.skip('should show save and export buttons in preview mode', async () => {
      mockGenerateLessonPlan.mockResolvedValue({
        success: true,
        lessonPlan: mockLessonPlan
      });

      render(<LessonPlanning onShowToast={mockShowToast} />);

      const subjectInput = screen.getByLabelText('Mata Pelajaran *') as HTMLInputElement;
      const gradeInput = screen.getByLabelText('Kelas *') as HTMLSelectElement;
      const topicInput = screen.getByLabelText('Topik Pembelajaran *') as HTMLInputElement;

      await fireEvent.change(subjectInput, { target: { value: 'Matematika' } });
      await fireEvent.change(gradeInput, { target: { value: 'Kelas X' } });
      await fireEvent.change(topicInput, { target: { value: 'Pecahan dan Desimal' } });

      const generateButton = screen.getByRole('button', { name: /buat rencana pembelajaran/i });
      
      await act(async () => {
        await fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /simpan/i })).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /ekspor pdf/i })).toBeInTheDocument();
    });

    it.skip('should call saveLessonPlan when save button is clicked', async () => {
      mockGenerateLessonPlan.mockResolvedValue({
        success: true,
        lessonPlan: mockLessonPlan
      });

      render(<LessonPlanning onShowToast={mockShowToast} />);

      const subjectInput = screen.getByLabelText('Mata Pelajaran *') as HTMLInputElement;
      const gradeInput = screen.getByLabelText('Kelas *') as HTMLSelectElement;
      const topicInput = screen.getByLabelText('Topik Pembelajaran *') as HTMLInputElement;

      await fireEvent.change(subjectInput, { target: { value: 'Matematika' } });
      await fireEvent.change(gradeInput, { target: { value: 'Kelas X' } });
      await fireEvent.change(topicInput, { target: { value: 'Pecahan dan Desimal' } });

      const generateButton = screen.getByRole('button', { name: /buat rencana pembelajaran/i });
      
      await act(async () => {
        await fireEvent.click(generateButton);
      });

      const saveButton = await screen.findByRole('button', { name: /simpan/i });
      
      await act(async () => {
        await fireEvent.click(saveButton);
      });

      expect(mockSaveLessonPlan).toHaveBeenCalledWith(mockLessonPlan);
      expect(mockShowToast).toHaveBeenCalledWith(
        'Rencana pembelajaran berhasil disimpan!',
        'success'
      );
    });
  });

  describe('objectives management', () => {
    it.skip('should add objective when add button is clicked', async () => {
      render(<LessonPlanning onShowToast={mockShowToast} />);

      const objectiveInput = screen.getByPlaceholderText('Contoh: Siswa dapat memahami konsep pecahan') as HTMLInputElement;
      await fireEvent.change(objectiveInput, { target: { value: 'New objective' } });

      const addButton = screen.getAllByRole('button', { name: /tambah/i })[0];
      await fireEvent.click(addButton);

      expect(objectiveInput.value).toBe('');
      expect(screen.getByText('New objective')).toBeInTheDocument();
    });

    it.skip('should remove objective when remove button is clicked', async () => {
      render(<LessonPlanning onShowToast={mockShowToast} />);

      const objectiveInput = screen.getByPlaceholderText('Contoh: Siswa dapat memahami konsep pecahan') as HTMLInputElement;
      await fireEvent.change(objectiveInput, { target: { value: 'Test objective' } });

      const addButton = screen.getAllByRole('button', { name: /tambah/i })[0];
      await fireEvent.click(addButton);

      const removeButton = screen.getByRole('button', { name: /hapus/i });
      await fireEvent.click(removeButton);

      expect(screen.queryByText('Test objective')).not.toBeInTheDocument();
    });

    it.skip('should add objective when Enter key is pressed', async () => {
      render(<LessonPlanning onShowToast={mockShowToast} />);

      const objectiveInput = screen.getByPlaceholderText('Contoh: Siswa dapat memahami konsep pecahan') as HTMLInputElement;
      await fireEvent.change(objectiveInput, { target: { value: 'Test objective' } });
      
      await act(async () => {
        await fireEvent.keyPress(objectiveInput, { key: 'Enter', code: 'Enter' });
      });

      await waitFor(() => {
        expect(screen.getByText('Test objective')).toBeInTheDocument();
      });
    });
  });

  describe('requirements management', () => {
    it.skip('should add requirement when add button is clicked', async () => {
      render(<LessonPlanning onShowToast={mockShowToast} />);

      const requirementInput = screen.getByPlaceholderText('Contoh: Siswa dengan kebutuhan khusus, alat peraga khusus') as HTMLInputElement;
      await fireEvent.change(requirementInput, { target: { value: 'Special requirement' } });

      const addButton = screen.getAllByRole('button', { name: /tambah/i })[1];
      await fireEvent.click(addButton);

      expect(requirementInput.value).toBe('');
      expect(screen.getByText('Special requirement')).toBeInTheDocument();
    });
  });

  describe('reset functionality', () => {
    it.skip('should reset form when reset button is clicked', async () => {
      render(<LessonPlanning onShowToast={mockShowToast} />);

      const subjectInput = screen.getByLabelText('Mata Pelajaran *') as HTMLInputElement;
      await fireEvent.change(subjectInput, { target: { value: 'Matematika' } });

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await fireEvent.click(resetButton);

      expect(subjectInput.value).toBe('');
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('checkboxes', () => {
    it.skip('should toggle include materials checkbox', () => {
      render(<LessonPlanning onShowToast={mockShowToast} />);

      const checkbox = screen.getByLabelText('Sertakan daftar materi');
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it.skip('should toggle include homework checkbox', () => {
      render(<LessonPlanning onShowToast={mockShowToast} />);

      const checkbox = screen.getByLabelText('Sertakan tugas rumah');
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });
});
