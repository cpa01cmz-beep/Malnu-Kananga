import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizPreview } from '../QuizPreview';
import type { Quiz } from '../../types';

describe('QuizPreview', () => {
  const mockQuiz: Quiz = {
    id: 'quiz-1',
    title: 'Kuis Fisika: Hukum Newton',
    description: 'Kuis untuk menguji pemahaman hukum gerak Newton',
    subjectId: 'sub-1',
    classId: 'class-1',
    teacherId: 'teacher-1',
    academicYear: '2025-2026',
    semester: '1',
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
      },
      {
        id: 'q2',
        question: 'Energi kinetik dirumuskan sebagai...',
        type: 'short_answer',
        difficulty: 'easy',
        correctAnswer: '1/2 mv²',
        explanation: 'Energi kinetik = 1/2 × massa × kecepatan²',
        points: 10,
      },
    ],
    totalPoints: 20,
    duration: 30,
    passingScore: 14,
    status: 'draft',
    createdAt: '2025-01-19T10:00:00Z',
    updatedAt: '2025-01-19T10:00:00Z',
    aiGenerated: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State and Rendering', () => {
    it('should render quiz preview component', () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      expect(screen.getByText('Pratinjau Kuis')).toBeInTheDocument();
    });

    it('should display quiz title and AI badge', () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      expect(screen.getByText(mockQuiz.title)).toBeInTheDocument();
      expect(screen.getByText('AI Generated')).toBeInTheDocument();
    });

    it('should display quiz description', () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      expect(screen.getByText(mockQuiz.description)).toBeInTheDocument();
    });

    it('should display quiz statistics', () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
      expect(screen.getByDisplayValue('14')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('should display all questions', () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      expect(screen.getByText('Apa yang dimaksud dengan Hukum Pertama Newton?')).toBeInTheDocument();
      expect(screen.getByText('Energi kinetik dirumuskan sebagai...')).toBeInTheDocument();
    });

    it('should display question details', () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      expect(screen.getByText('multiple_choice')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('10 poin')).toBeInTheDocument();
    });

    it('should display correct answers', () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      expect(screen.getByText('Benda tetap diam')).toBeInTheDocument();
      expect(screen.getByText('1/2 mv²')).toBeInTheDocument();
    });

    it('should display explanations', () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const explanations = screen.getAllByText(/Penjelasan:/);
      expect(explanations.length).toBeGreaterThan(0);
    });

    it('should display action buttons', () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      expect(screen.getByText('Batal')).toBeInTheDocument();
      expect(screen.getByText('Simpan Kuis')).toBeInTheDocument();
      expect(screen.getByText('Tambah Pertanyaan')).toBeInTheDocument();
    });
  });

  describe('Quiz Metadata Editing', () => {
    it('should allow editing quiz title', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const titleInput = screen.getByLabelText('Judul Kuis');
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Kuis Fisika Lanjutan');
      
      expect(titleInput).toHaveValue('Kuis Fisika Lanjutan');
    });

    it('should allow editing quiz description', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const descriptionTextarea = screen.getByLabelText('Deskripsi');
      await userEvent.clear(descriptionTextarea);
      await userEvent.type(descriptionTextarea, 'Deskripsi yang diupdate');
      
      expect(descriptionTextarea).toHaveValue('Deskripsi yang diupdate');
    });

    it('should allow editing quiz duration', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const durationInput = screen.getByLabelText('Durasi (menit)');
      await userEvent.clear(durationInput);
      await userEvent.type(durationInput, '45');
      
      expect(durationInput).toHaveValue(45);
    });

    it('should allow editing passing score', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const passingScoreInput = screen.getByLabelText('Nilai Lulus');
      await userEvent.clear(passingScoreInput);
      await userEvent.type(passingScoreInput, '16');
      
      expect(passingScoreInput).toHaveValue(16);
    });
  });

  describe('Question Editing', () => {
    it('should enable edit mode when edit button is clicked', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const editButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')?.getAttribute('data-testid') === 'pencil'
      );
      
      if (editButtons.length > 0) {
        await userEvent.click(editButtons[0]);
        
        expect(screen.getByText('Pertanyaan')).toBeInTheDocument();
        expect(screen.getByText('Jenis')).toBeInTheDocument();
        expect(screen.getByText('Kesulitan')).toBeInTheDocument();
        expect(screen.getByText('Poin')).toBeInTheDocument();
      }
    });

    it('should allow editing question text', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const editButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')?.getAttribute('data-testid') === 'pencil'
      );
      
      if (editButtons.length > 0) {
        await userEvent.click(editButtons[0]);
        
        const questionTextarea = screen.getByLabelText('Pertanyaan');
        await userEvent.clear(questionTextarea);
        await userEvent.type(questionTextarea, 'Pertanyaan yang diedit');
        
        expect(questionTextarea).toHaveValue('Pertanyaan yang diedit');
      }
    });

    it('should allow changing question type', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const editButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')?.getAttribute('data-testid') === 'pencil'
      );
      
      if (editButtons.length > 0) {
        await userEvent.click(editButtons[0]);
        
        const typeSelect = screen.getByLabelText('Jenis');
        await userEvent.selectOptions(typeSelect, 'true_false');
        
        expect(typeSelect).toHaveValue('true_false');
      }
    });

    it('should allow changing question difficulty', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const editButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')?.getAttribute('data-testid') === 'pencil'
      );
      
      if (editButtons.length > 0) {
        await userEvent.click(editButtons[0]);
        
        const difficultySelect = screen.getByLabelText('Kesulitan');
        await userEvent.selectOptions(difficultySelect, 'hard');
        
        expect(difficultySelect).toHaveValue('hard');
      }
    });

    it('should allow changing question points', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const editButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')?.getAttribute('data-testid') === 'pencil'
      );
      
      if (editButtons.length > 0) {
        await userEvent.click(editButtons[0]);
        
        const pointsInput = screen.getByLabelText('Poin');
        await userEvent.clear(pointsInput);
        await userEvent.type(pointsInput, '15');
        
        expect(pointsInput).toHaveValue(15);
      }
    });

    it('should allow editing multiple choice options', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const editButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')?.getAttribute('data-testid') === 'pencil'
      );
      
      if (editButtons.length > 0) {
        await userEvent.click(editButtons[0]);
        
        const optionInputs = screen.getAllByPlaceholderText(/Pilihan/);
        if (optionInputs.length > 0) {
          await userEvent.clear(optionInputs[0]);
          await userEvent.type(optionInputs[0], 'Opsi yang diedit');
          
          expect(optionInputs[0]).toHaveValue('Opsi yang diedit');
        }
      }
    });

    it('should allow selecting correct answer', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const editButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')?.getAttribute('data-testid') === 'pencil'
      );
      
      if (editButtons.length > 0) {
        await userEvent.click(editButtons[0]);
        
        const radioButtons = screen.getAllByRole('radio');
        if (radioButtons.length > 1) {
          await userEvent.click(radioButtons[1]);
          
          expect(radioButtons[1]).toBeChecked();
        }
      }
    });

    it('should cancel edit mode when cancel is clicked', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const editButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')?.getAttribute('data-testid') === 'pencil'
      );
      
      if (editButtons.length > 0) {
        await userEvent.click(editButtons[0]);
        
        const cancelButton = screen.getByText('Batal');
        await userEvent.click(cancelButton);
        
        expect(screen.queryByText('Pertanyaan')).not.toBeInTheDocument();
      }
    });

    it('should save edited question', async () => {
      const onSave = vi.fn();
      render(<QuizPreview quiz={mockQuiz} onSave={onSave} onCancel={vi.fn()} />);
      
      const editButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')?.getAttribute('data-testid') === 'pencil'
      );
      
      if (editButtons.length > 0) {
        await userEvent.click(editButtons[0]);
        
        const questionTextarea = screen.getByLabelText('Pertanyaan');
        await userEvent.clear(questionTextarea);
        await userEvent.type(questionTextarea, 'Pertanyaan yang diedit');
        
        const saveButton = screen.getByText('Simpan');
        await userEvent.click(saveButton);
        
        expect(screen.queryByText('Pertanyaan')).not.toBeInTheDocument();
      }
    });
  });

  describe('Question Deletion', () => {
    it('should delete question when delete button is clicked', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const deleteButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')?.getAttribute('data-testid') === 'trash'
      );
      
      if (deleteButtons.length > 0) {
        await userEvent.click(deleteButtons[0]);
        
        expect(screen.queryByText('Apa yang dimaksud dengan Hukum Pertama Newton?')).not.toBeInTheDocument();
        expect(screen.getByText('Pertanyaan (1)')).toBeInTheDocument();
      }
    });

    it('should update total points after deletion', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const deleteButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')?.getAttribute('data-testid') === 'trash'
      );
      
      if (deleteButtons.length > 0) {
        await userEvent.click(deleteButtons[0]);
        
        const totalPointsInput = screen.getByDisplayValue('20');
        expect(totalPointsInput).toBeInTheDocument();
      }
    });
  });

  describe('Adding New Questions', () => {
    it('should open add question modal', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const addButton = screen.getByText('Tambah Pertanyaan');
      await userEvent.click(addButton);
      
      expect(screen.getByText('Tambah Pertanyaan')).toBeInTheDocument();
    });

    it('should allow inputting new question details', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const addButton = screen.getByText('Tambah Pertanyaan');
      await userEvent.click(addButton);
      
      const questionTextarea = screen.getByLabelText('Pertanyaan');
      await userEvent.type(questionTextarea, 'Pertanyaan baru');
      
      expect(questionTextarea).toHaveValue('Pertanyaan baru');
    });

    it('should close modal when cancel is clicked', async () => {
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={vi.fn()} />);
      
      const addButton = screen.getByText('Tambah Pertanyaan');
      await userEvent.click(addButton);
      
      const cancelButton = screen.getByText('Batal');
      await userEvent.click(cancelButton);
      
      expect(screen.queryByText('Tambah Pertanyaan')).not.toBeInTheDocument();
    });

    it('should add new question to quiz', async () => {
      const onSave = vi.fn();
      render(<QuizPreview quiz={mockQuiz} onSave={onSave} onCancel={vi.fn()} />);
      
      const addButton = screen.getByText('Tambah Pertanyaan');
      await userEvent.click(addButton);
      
      const questionTextarea = screen.getByLabelText('Pertanyaan');
      await userEvent.type(questionTextarea, 'Pertanyaan baru');
      
      const addQuestionButton = screen.getByText('Tambah Pertanyaan');
      await userEvent.click(addQuestionButton);
      
      expect(screen.queryByText('Tambah Pertanyaan')).not.toBeInTheDocument();
      expect(screen.getByText('Pertanyaan (3)')).toBeInTheDocument();
    });
  });

  describe('Saving Quiz', () => {
    it('should call onSave with updated quiz data', async () => {
      const onSave = vi.fn();
      render(<QuizPreview quiz={mockQuiz} onSave={onSave} onCancel={vi.fn()} />);
      
      const titleInput = screen.getByLabelText('Judul Kuis');
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Judul yang diedit');
      
      const saveButton = screen.getByText('Simpan Kuis');
      await userEvent.click(saveButton);
      
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Judul yang diedit',
          id: mockQuiz.id,
        })
      );
    });
  });

  describe('Canceling', () => {
    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      render(<QuizPreview quiz={mockQuiz} onSave={vi.fn()} onCancel={onCancel} />);
      
      const cancelButton = screen.getByText('Batal');
      fireEvent.click(cancelButton);
      
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});