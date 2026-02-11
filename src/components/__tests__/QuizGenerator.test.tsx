import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizGenerator } from '../QuizGenerator';
import * as geminiService from '../../services/ai';
import * as apiService from '../../services/apiService';
import type { ELibrary } from '../../types';

vi.mock('../../services/ai');
vi.mock('../../services/apiService');
vi.mock('../../utils/logger');

describe('QuizGenerator', () => {
  const now = new Date().toISOString();
  const mockMaterials: ELibrary[] = [
    {
      id: 'm1',
      title: 'Fisika Dasar: Hukum Newton',
      category: 'Fisika',
      fileType: 'pdf',
      description: 'Pengantar hukum gerak Newton',
      fileUrl: 'https://example.com/material1.pdf',
      fileSize: 1024000,
      subjectId: 'subject-1',
      uploadedBy: 'teacher-1',
      uploadedAt: now,
      downloadCount: 0,
      isShared: true,
    },
    {
      id: 'm2',
      title: 'Energi dan Momentum',
      category: 'Fisika',
      fileType: 'docx',
      description: 'Konsep dasar energi dan momentum',
      fileUrl: 'https://example.com/material2.docx',
      fileSize: 512000,
      subjectId: 'subject-1',
      uploadedBy: 'teacher-1',
      uploadedAt: now,
      downloadCount: 0,
      isShared: true,
    },
    {
      id: 'm3',
      title: 'Termodinamika',
      category: 'Fisika',
      fileType: 'pdf',
      description: 'Hukum termodinamika dasar',
      fileUrl: 'https://example.com/material3.pdf',
      fileSize: 1536000,
      subjectId: 'subject-1',
      uploadedBy: 'teacher-1',
      uploadedAt: now,
      downloadCount: 0,
      isShared: true,
    },
  ];

  const mockGeneratedQuiz = {
    title: 'Kuis Fisika: Hukum Newton',
    description: 'Kuis untuk menguji pemahaman hukum gerak Newton',
    questions: [
      {
        id: 'q1',
        question: 'Apa yang dimaksud dengan Hukum Pertama Newton?',
        type: 'multiple_choice',
        difficulty: 'medium',
        options: ['Benda tetap diam', 'Benda bergerak lurus', 'Benda bergerak melingkar', 'Benda berhenti'],
        correctAnswer: 'Benda tetap diam',
        explanation: 'Hukum pertama Newton menyatakan bahwa benda akan tetap diam atau bergerak lurus beraturan jika gaya total nol',
        points: 10,
        materialReference: 'Fisika Dasar: Hukum Newton',
        tags: ['hukum newton', 'gerak'],
      },
      {
        id: 'q2',
        question: 'Energi kinetik dirumuskan sebagai...',
        type: 'short_answer',
        difficulty: 'medium',
        correctAnswer: '1/2 mv²',
        explanation: 'Energi kinetik = 1/2 × massa × kecepatan²',
        points: 10,
        materialReference: 'Energi dan Momentum',
      },
    ],
    totalPoints: 20,
    duration: 30,
    passingScore: 14,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State and Rendering', () => {
    it('should render quiz generator component', async () => {
      render(<QuizGenerator />);
      await waitFor(() => {
        expect(screen.getByText('Buat Kuis dengan AI')).toBeInTheDocument();
        expect(screen.getByText('Gunakan kecerdasan buatan untuk membuat kuis dari materi pembelajaran')).toBeInTheDocument();
      });
    });

    it('should start in select materials step', async () => {
      render(<QuizGenerator />);
      await waitFor(() => {
        expect(screen.getByText('Pilih Materi Pembelajaran')).toBeInTheDocument();
      });
    });

    it('should show loading state when materials are loading', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockImplementation(
        () => new Promise(() => {})
      );

      render(<QuizGenerator />);

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });

    it('should display empty state when no materials available', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: [],
      });

      render(<QuizGenerator />);
      
      await waitFor(() => {
        expect(screen.getByText('Belum ada materi pembelajaran. Silakan upload materi terlebih dahulu.')).toBeInTheDocument();
      });
    });
  });

  describe('Material Selection', () => {
    it('should display available materials', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });

      render(<QuizGenerator />);
      
      await waitFor(() => {
        expect(screen.getByText('Fisika Dasar: Hukum Newton')).toBeInTheDocument();
        expect(screen.getByText('Energi dan Momentum')).toBeInTheDocument();
        expect(screen.getByText('Termodinamika')).toBeInTheDocument();
      });
    });

    it('should allow selecting materials', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });

      render(<QuizGenerator />);
      
      await waitFor(() => {
        expect(screen.getByText('Pilih Materi Pembelajaran')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      await userEvent.click(checkboxes[0]);
      
      await waitFor(() => {
        expect(checkboxes[0]).toBeChecked();
      });
    });

    it('should update selected material count', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });

      render(<QuizGenerator />);
      
      await waitFor(() => {
        expect(screen.getByText('0 dipilih')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      await userEvent.click(checkboxes[0]);
      
      await waitFor(() => {
        expect(screen.getByText('1 dipilih')).toBeInTheDocument();
      });

      await userEvent.click(checkboxes[1]);
      
      await waitFor(() => {
        expect(screen.getByText('2 dipilih')).toBeInTheDocument();
      });
    });

    it('should prevent proceeding without selecting materials', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });

      render(<QuizGenerator />);
      
      await waitFor(() => {
        const nextButton = screen.getByText('Lanjut');
        fireEvent.click(nextButton);
        
        expect(screen.getByText('Silakan pilih minimal satu materi pembelajaran.')).toBeInTheDocument();
      });
    });
  });

  describe('Quiz Options Configuration', () => {
    it('should display options form when materials are selected', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      expect(screen.getByText('Konfigurasi Kuis')).toBeInTheDocument();
      expect(screen.getByText('Jumlah Pertanyaan')).toBeInTheDocument();
      expect(screen.getByText('Tingkat Kesulitan')).toBeInTheDocument();
    });

    it('should allow changing question count', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      const questionCountInput = screen.getByLabelText('Jumlah Pertanyaan');
      await userEvent.clear(questionCountInput);
      await userEvent.type(questionCountInput, '15');
      
      await waitFor(() => {
        expect(questionCountInput).toHaveValue(15);
      });
    });

    it('should allow selecting difficulty level', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      const difficultySelect = screen.getByLabelText('Tingkat Kesulitan');
      await userEvent.selectOptions(difficultySelect, 'hard');
      
      await waitFor(() => {
        expect(difficultySelect).toHaveValue('hard');
      });
    });

    it('should allow selecting multiple question types', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      const mcCheckbox = screen.getByLabelText('Pilihan Ganda');
      const tfCheckbox = screen.getByLabelText('Benar/Salah');
      
      await userEvent.click(tfCheckbox);
      
      await waitFor(() => {
        expect(tfCheckbox).not.toBeChecked();
      });
      
      await userEvent.click(tfCheckbox);
      
      await waitFor(() => {
        expect(mcCheckbox).toBeChecked();
        expect(tfCheckbox).toBeChecked();
      });
    });

    it('should allow setting total points', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      const totalPointsInput = screen.getByLabelText('Total Poin');
      await userEvent.clear(totalPointsInput);
      await userEvent.type(totalPointsInput, '150');
      
      await waitFor(() => {
        expect(totalPointsInput).toHaveValue(150);
      });
    });

    it('should allow setting focus areas', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      const focusAreasTextarea = screen.getByLabelText('Topik Fokus (opsional)');
      await userEvent.type(focusAreasTextarea, 'Hukum Newton, Energi, Momentum');
      
      await waitFor(() => {
        expect((focusAreasTextarea as HTMLTextAreaElement).value).toMatch(/Hukum Newton/);
        expect((focusAreasTextarea as HTMLTextAreaElement).value).toMatch(/Energi/);
        expect((focusAreasTextarea as HTMLTextAreaElement).value).toMatch(/Momentum/);
      });
    });
  });

  describe('Quiz Generation', () => {
    it('should call generateQuiz with correct parameters', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });
      vi.mocked(geminiService)?.generateQuiz.mockResolvedValue(mockGeneratedQuiz);

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      const generateButton = screen.getByText('Buat Kuis');
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(geminiService.generateQuiz).toHaveBeenCalledWith(
          [mockMaterials[0]],
          expect.objectContaining({
            questionCount: 10,
            difficulty: 'medium',
          })
        );
      });
    });

    it('should show loading state during generation', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });
      vi.mocked(geminiService)?.generateQuiz.mockImplementation(
        () => new Promise(() => {})
      );

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      fireEvent.click(screen.getByText('Buat Kuis'));
      
      expect(screen.getByText('Membuat Kuis')).toBeInTheDocument();
      expect(screen.getByText('Membuat Kuis')).toBeInTheDocument();
    });

    it('should display generated quiz preview', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });
      vi.mocked(geminiService)?.generateQuiz.mockResolvedValue(mockGeneratedQuiz);

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      fireEvent.click(screen.getByText('Buat Kuis'));
      
      await waitFor(() => {
        expect(screen.getByText(mockGeneratedQuiz.title)).toBeInTheDocument();
        expect(screen.getByText(mockGeneratedQuiz.description)).toBeInTheDocument();
      });
    });

    it('should display quiz statistics', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });
      vi.mocked(geminiService)?.generateQuiz.mockResolvedValue(mockGeneratedQuiz);

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      fireEvent.click(screen.getByText('Buat Kuis'));
      
      await waitFor(() => {
        expect(screen.getByText('30 menit')).toBeInTheDocument();
        expect(screen.getByText('2 pertanyaan')).toBeInTheDocument();
        expect(screen.getByText('20 poin')).toBeInTheDocument();
        expect(screen.getByText('Lulus: 14 poin')).toBeInTheDocument();
      });
    });

    it('should display all questions', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });
      vi.mocked(geminiService)?.generateQuiz.mockResolvedValue(mockGeneratedQuiz);

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      fireEvent.click(screen.getByText('Buat Kuis'));
      
      await waitFor(() => {
        expect(screen.getByText('Apa yang dimaksud dengan Hukum Pertama Newton?')).toBeInTheDocument();
        expect(screen.getByText('Energi kinetik dirumuskan sebagai...')).toBeInTheDocument();
      });
    });

    it('should display question types, difficulty, and points', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });
      vi.mocked(geminiService)?.generateQuiz.mockResolvedValue(mockGeneratedQuiz);

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      fireEvent.click(screen.getByText('Buat Kuis'));
      
      await waitFor(() => {
        expect(screen.getAllByText('multiple_choice').length).toBeGreaterThan(0);
        expect(screen.getAllByText('medium').length).toBeGreaterThan(0);
        expect(screen.getAllByText('10 poin').length).toBeGreaterThan(0);
      });
    });

    it('should display correct answers', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });
      vi.mocked(geminiService)?.generateQuiz.mockResolvedValue(mockGeneratedQuiz);

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      fireEvent.click(screen.getByText('Buat Kuis'));
      
      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('Benda tetap diam'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('1/2 mv²'))).toBeInTheDocument();
      });
    });

    it('should display explanations', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });
      vi.mocked(geminiService)?.generateQuiz.mockResolvedValue(mockGeneratedQuiz);

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      fireEvent.click(screen.getByText('Buat Kuis'));
      
      await waitFor(() => {
        expect(screen.getAllByText(/Penjelasan:/).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Navigation and Actions', () => {
    it('should go back to previous step', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      const backButton = screen.getByText('Kembali');
      fireEvent.click(backButton);
      
      expect(screen.getByText('Pilih Materi Pembelajaran')).toBeInTheDocument();
    });

    it('should call onCancel when cancel is clicked', async () => {
      const onCancel = vi.fn();
      render(<QuizGenerator onCancel={onCancel} />);

      const cancelButton = screen.getByText('Batal');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onSuccess when quiz is saved', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });
      vi.mocked(geminiService)?.generateQuiz.mockResolvedValue(mockGeneratedQuiz);
      const onSuccess = vi.fn();

      render(<QuizGenerator onSuccess={onSuccess} />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      fireEvent.click(screen.getByText('Buat Kuis'));
      
      await waitFor(async () => {
        const saveButton = screen.getByText('Simpan Kuis');
        fireEvent.click(saveButton);
        
        await waitFor(() => {
          expect(onSuccess).toHaveBeenCalledWith(
            expect.objectContaining({
              title: mockGeneratedQuiz.title,
              aiGenerated: true,
              status: 'draft',
            })
          );
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when materials fail to load', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockRejectedValue(new Error('Network error'));

      render(<QuizGenerator />);
      
      await waitFor(() => {
        expect(screen.getByText('Gagal memuat materi pembelajaran. Silakan coba lagi.')).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          success: true,
          message: 'Success',
          data: mockMaterials,
        });

      render(<QuizGenerator />);
      
      await waitFor(() => {
        expect(screen.getByText('Gagal memuat materi pembelajaran. Silakan coba lagi.')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Coba Lagi');
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(apiService.eLibraryAPI?.getAll).toHaveBeenCalledTimes(2);
      });
    });

    it('should display error when quiz generation fails', async () => {
      vi.mocked(apiService.eLibraryAPI)?.getAll.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockMaterials
      });
      vi.mocked(geminiService)?.generateQuiz.mockRejectedValue(new Error('AI error'));

      render(<QuizGenerator />);
      
      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        fireEvent.click(screen.getByText('Lanjut'));
      });

      fireEvent.click(screen.getByText('Buat Kuis'));
      
      await waitFor(() => {
        expect(screen.getByText(/AI error/)).toBeInTheDocument();
      });
    });
  });
});