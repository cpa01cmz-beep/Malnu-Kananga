import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuizIntegrationDashboard from '../QuizIntegrationDashboard';
import * as apiService from '../../services/apiService';
import * as quizGradeIntegrationService from '../../services/quizGradeIntegrationService';

vi.mock('../../services/apiService');
vi.mock('../../services/quizGradeIntegrationService');

describe('QuizIntegrationDashboard', () => {
  const mockOnBack = vi.fn();
  const mockOnShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const renderComponent = () => {
    return render(
      <QuizIntegrationDashboard onBack={mockOnBack} onShowToast={mockOnShowToast} />
    );
  };

  describe('Initial State', () => {
    it('renders back button', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /kembali/i })).toBeInTheDocument();
    });

    it('renders title', () => {
      renderComponent();
      expect(screen.getByText(/integrasi kuis ke nilai/i)).toBeInTheDocument();
    });

    it('shows empty state when no quiz attempts exist', () => {
      vi.mocked(quizGradeIntegrationService.getIntegrationStatus).mockReturnValue({
        totalAttempts: 0,
        integratedCount: 0,
        pendingCount: 0
      });

      renderComponent();

      expect(screen.getByText(/tidak ada hasil kuis/i)).toBeInTheDocument();
    });
  });

  describe('Integration Status Display', () => {
    beforeEach(() => {
      vi.mocked(quizGradeIntegrationService.getIntegrationStatus).mockReturnValue({
        totalAttempts: 10,
        integratedCount: 5,
        pendingCount: 5
      });
    });

    it('displays total attempts', () => {
      renderComponent();

      expect(screen.getByText(/total hasil kuis/i)).toBeInTheDocument();
    });

    it('shows progress bar with correct percentage', () => {
      renderComponent();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '5');
      expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    });
  });

  describe('Batch Integration', () => {
    beforeEach(() => {
      vi.mocked(apiService.authAPI.getCurrentUser).mockReturnValue({
        id: 'teacher-123',
        name: 'Teacher Name',
        email: 'teacher@example.com',
        role: 'teacher',
        status: 'active'
      });

      vi.mocked(quizGradeIntegrationService.getIntegrationStatus).mockReturnValue({
        totalAttempts: 10,
        integratedCount: 5,
        pendingCount: 5
      });
    });

    it('enables integrate button when pending attempts exist', () => {
      renderComponent();

      const integrateButton = screen.getByRole('button', { name: /integrasi/i });
      expect(integrateButton).toBeInTheDocument();
    });

    it('shows success toast after successful integration', async () => {
      vi.mocked(quizGradeIntegrationService.integrateAllQuizAttempts).mockResolvedValue({
        total: 5,
        succeeded: 5,
        failed: 0,
        skipped: 0,
        results: []
      });

      renderComponent();

      const integrateButton = screen.getByRole('button', { name: /integrasi/i });
      fireEvent.click(integrateButton);

      await waitFor(() => {
        expect(mockOnShowToast).toHaveBeenCalledWith(
          '5 kuis berhasil diintegrasikan ke nilai',
          'success'
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when user not logged in', async () => {
      vi.mocked(apiService.authAPI.getCurrentUser).mockReturnValue(null);

      vi.mocked(quizGradeIntegrationService.getIntegrationStatus).mockReturnValue({
        totalAttempts: 10,
        integratedCount: 5,
        pendingCount: 5
      });

      renderComponent();

      const integrateButton = screen.getByRole('button', { name: /integrasi/i });
      fireEvent.click(integrateButton);

      await waitFor(() => {
        expect(mockOnShowToast).toHaveBeenCalledWith(
          'Anda harus login untuk mengintegrasikan kuis',
          'error'
        );
      });
    });
  });
});
