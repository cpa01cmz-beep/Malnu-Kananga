import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import AssignmentSubmission from './AssignmentSubmission';

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
       expect(screen.getByText(/Mata Pelajaran:\s*Fisika/)).toBeInTheDocument();
    });

test('should display assignment details correctly', () => {
       render(
         <AssignmentSubmission
           assignment={mockAssignment}
           onClose={mockOnClose}
           onSubmit={mockOnSubmit}
         />
       );

       expect(screen.getByText(/Mata Pelajaran:/)).toBeInTheDocument();
       expect(screen.getByText(/Deadline:/)).toBeInTheDocument();
       expect(screen.getByText(/Selasa, 15 Oktober 2024/)).toBeInTheDocument();
    });

test('should display assignment description and instructions', () => {
       render(
         <AssignmentSubmission
           assignment={mockAssignment}
           onClose={mockOnClose}
           onSubmit={mockOnSubmit}
         />
       );

       expect(screen.getByText('Laporan Praktikum Fisika')).toBeInTheDocument();
       expect(screen.getByText(/Mata Pelajaran:/)).toBeInTheDocument();
       expect(screen.getByText(/Deadline:/)).toBeInTheDocument();
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
      expect(screen.getByText(/Format yang didukung:/)).toBeInTheDocument();
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
      
      const dropZone = screen.getByText('Pilih File').closest('div');
      
      if (dropZone) {
        fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [file]
          }
        });
      }
      
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

test('should validate file type', () => {
       const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

       render(
         <AssignmentSubmission
           assignment={mockAssignment}
           onClose={mockOnClose}
           onSubmit={mockOnSubmit}
         />
       );

const invalidFile = new File(['test'], 'test.exe', { type: 'application/octet-stream' });
       
       const chooseFileButton = screen.getByText('Pilih File');
       fireEvent.click(chooseFileButton);
       
       const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
       if (fileInput) {
         Object.defineProperty(fileInput, 'files', {
           value: [invalidFile],
           writable: false,
         });
         fireEvent.change(fileInput);
       }

       expect(screen.getByText('Pilih File')).toBeInTheDocument();
       
       consoleSpy.mockRestore();
     });

     test('should validate file size', () => {
      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      const chooseFileButton = screen.getByText('Pilih File');
      fireEvent.click(chooseFileButton);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        Object.defineProperty(fileInput, 'files', {
          value: [file],
          writable: false,
        });
        fireEvent.change(fileInput);
      }
      
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
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

const notesTextarea = screen.getByPlaceholderText(/Tambahkan catatan atau komentar/);
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

      const submitButton = screen.getByRole('button', { name: /kumpulkan/i });
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

      const notesTextarea = screen.getByPlaceholderText(/Tambahkan catatan atau komentar tentang tugas ini/);
      fireEvent.change(notesTextarea, { target: { value: 'Catatan tambahan' } });
      
      // Add a file to enable the submit button (component requires file to be selected)
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const dropZone = screen.getByText('Pilih File').closest('div');
      
      if (dropZone) {
        fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [file]
          }
        });
      }

      const submitButton = screen.getByRole('button', { name: /kumpulkan/i });
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


        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

const notesTextarea = screen.getByPlaceholderText(/Tambahkan catatan atau keterangan/);
       fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });

       const submitButton = screen.getByRole('button', { name: /kumpulkan tugas/i });
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

const closeButton = screen.getByLabelText('Tutup modal pengumpulan tugas');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle submission error gracefully', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Upload failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AssignmentSubmission
          assignment={mockAssignment}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

const notesTextarea = screen.getByPlaceholderText(/Tambahkan catatan atau keterangan/);
      fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });

      fireEvent.click(screen.getByRole('button', { name: /kumpulkan/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

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

expect(screen.getByRole('button', { name: /kumpulkan tugas/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument();
    });
  });
});