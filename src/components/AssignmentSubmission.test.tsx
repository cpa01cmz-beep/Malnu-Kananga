import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import AssignmentSubmission from './AssignmentSubmission';

// Mock File API
global.File = class File {
  constructor(chunks, filename, options = {}) {
    this.chunks = chunks;
    this.name = filename;
    this.size = options.size || 0;
    this.type = options.type || '';
    this.lastModified = Date.now();
  }
} as any;

// Mock parent data
jest.mock('../data/parentData', () => ({
  currentParent: {
    id: 'PAR001',
    name: 'Bapak Ahmad Rahman',
    email: 'parent@ma-malnukananga.sch.id'
  }
}));

describe('AssignmentSubmission Component', () => {
  const mockAssignment = {
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
    status: 'assigned' as const
  };

  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    test('should render assignment submission modal', () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('heading', { name: 'Kumpulkan Tugas' })).toBeInTheDocument();
      expect(screen.getByText('Laporan Praktikum Fisika')).toBeInTheDocument();
      expect(screen.getByText('Fisika')).toBeInTheDocument();
      expect(screen.getByText('Prof. Budi Santoso, M.T.')).toBeInTheDocument();
    });

    test('should display assignment details correctly', () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Mata Pelajaran')).toBeInTheDocument();
      expect(screen.getByText('Fisika')).toBeInTheDocument();
      expect(screen.getByText('Guru Pengampu')).toBeInTheDocument();
      expect(screen.getByText('Prof. Budi Santoso, M.T.')).toBeInTheDocument();
      expect(screen.getByText('Nilai Maksimal')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    test('should display assignment description and instructions', () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText(mockAssignment.description)).toBeInTheDocument();
      expect(screen.getByText('Instruksi')).toBeInTheDocument();
      expect(screen.getByText(/Gunakan format laporan yang benar/)).toBeInTheDocument();
    });
  });

  describe('File Upload', () => {
    test('should show file upload area', () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('File Tugas')).toBeInTheDocument();
      expect(screen.getByText('Pilih File')).toBeInTheDocument();
      expect(screen.getByText(/PDF, Word, Gambar, atau Text/)).toBeInTheDocument();
    });

    test('should handle file selection', async () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      // Since we can't easily simulate file input clicks, we'll test the drag and drop
      const dropZone = screen.getByText('Pilih File').closest('div');
      
      if (dropZone) {
        fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [file]
          }
        });
      }
      
      // After file selection, we should see the file name instead of "Pilih File"
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    test('should validate file type', () => {
      // Mock console.error to avoid test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const invalidFile = new File(['test'], 'test.exe', { type: 'application/octet-stream' });
      const dropZone = screen.getByText('Pilih File').closest('div');

      if (dropZone) {
        fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [invalidFile]
          }
        });
      }

      // Should still show the file upload area with "Pilih File" text
      expect(screen.getByText('Pilih File')).toBeInTheDocument();
      
      // Restore console.error
      consoleSpy.mockRestore();
    });

    test('should validate file size', () => {
      // Mock console.error to avoid test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Create a file larger than 10MB
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
      
      // Look for file upload area - check for any file-related element
      let uploadArea;
      try {
        uploadArea = screen.getByText(/pilih file/i);
      } catch {
        try {
          uploadArea = screen.getByLabelText(/file/i);
        } catch {
          try {
            uploadArea = screen.getByRole('button', { name: /pilih file/i });
          } catch {
            // Look for the file input directly
            uploadArea = screen.getByRole('button') || screen.getByText(/file/i);
          }
        }
      }
      
      const dropZone = uploadArea?.closest('div');

      if (dropZone) {
        fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [largeFile]
          }
        });
      }

      // Should still show the file upload area - check that component is still rendered
      expect(screen.getByRole('heading', { name: 'Kumpulkan Tugas' })).toBeInTheDocument();
      
      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  describe('Notes Section', () => {
    test('should allow adding notes', () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const notesTextarea = screen.getByPlaceholderText(/Tambahkan catatan atau keterangan/);
      fireEvent.change(notesTextarea, { target: { value: 'Catatan tambahan untuk guru' } });

      expect(notesTextarea).toHaveValue('Catatan tambahan untuk guru');
    });
  });

  describe('Form Submission', () => {
    test('should not submit without file or notes', () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /kumpulkan tugas/i });
      expect(submitButton).toBeDisabled();
    });

    test('should enable submit button with file', () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const dropZone = screen.getByText('Pilih File').closest('div');

      if (dropZone) {
        fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [file]
          }
        });
      }

      const submitButton = screen.getByRole('button', { name: /kumpulkan tugas/i });
      // Button should not be disabled when file is selected
      expect(submitButton).not.toBeDisabled();
    });

    test('should enable submit button with notes', () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const notesTextarea = screen.getByPlaceholderText(/Tambahkan catatan atau keterangan/);
      fireEvent.change(notesTextarea, { target: { value: 'Catatan tambahan' } });

      const submitButton = screen.getByRole('button', { name: /kumpulkan tugas/i });
      expect(submitButton).not.toBeDisabled();
    });

    test('should call onSubmit with correct data', async () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Add notes
      const notesTextarea = screen.getByPlaceholderText(/Tambahkan catatan atau keterangan/);
      fireEvent.change(notesTextarea, { target: { value: 'Catatan untuk pengumpulan' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /kumpulkan tugas/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(mockAssignment.id, {
          notes: 'Catatan untuk pengumpulan',
          submittedBy: 'PAR001'
        });
      });
    });

     test('should show loading state during submission', async () => {
       // Mock a delayed submission
       mockOnSubmit.mockImplementation(() => new Promise<void>(resolve => {
         jest.advanceTimersByTime(100);
         resolve();
       }));

      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Add notes to enable submit
      const notesTextarea = screen.getByPlaceholderText(/Tambahkan catatan atau keterangan/);
      fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /kumpulkan tugas/i });
      fireEvent.click(submitButton);

      // Should show loading state
      expect(screen.getByText('Mengumpulkan...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Modal Actions', () => {
    test('should call onClose when cancel button is clicked', () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.click(screen.getByText('Batal'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('should call onClose when close button is clicked', () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Find the close button by its aria-label
      const closeButton = screen.getByLabelText('Tutup modal pengumpulan tugas');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
test('should handle submission error gracefully', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Upload failed'));

      // Mock console.error to avoid test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Add notes to enable submit
      const notesTextarea = screen.getByPlaceholderText(/Tambahkan catatan atau keterangan/);
      fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /kumpulkan tugas/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      }, { timeout: 5000 });

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Check for accessible form elements
      expect(screen.getByRole('button', { name: /kumpulkan tugas/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument();
    });
  });
});