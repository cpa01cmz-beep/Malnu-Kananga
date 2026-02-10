import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import UserImport, { CSVRow, ParsedUser } from '../UserImport';
import * as apiService from '../../services/apiService';

vi.mock('../../services/apiService', () => ({
  api: {
    users: {
      create: vi.fn(),
    },
  },
}));

vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn((_file: File, config: any) => {
      if (config.complete) {
        config.complete({ data: mockParseData, errors: [] });
      }
    }),
  },
}));

let mockParseData: CSVRow[] = [];

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student' as const,
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'teacher' as const,
    status: 'active' as const,
  },
];

const mockCSVData: CSVRow[] = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    status: 'active',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'teacher',
    status: 'active',
  },
  {
    name: 'Invalid User',
    email: 'invalid-email',
    role: 'student',
  },
];

const _mockParsedUsers: ParsedUser[] = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    status: 'active',
    isValid: true,
    errors: [],
    rowIndex: 2,
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'teacher',
    status: 'active',
    isValid: true,
    errors: [],
    rowIndex: 3,
  },
  {
    name: 'Invalid User',
    email: 'invalid-email',
    role: 'student',
    isValid: false,
    errors: ['Valid email is required'],
    rowIndex: 4,
  },
];

describe('UserImport Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onImportComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (apiService.api.users.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockUsers[0],
    });
    mockParseData = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('renders upload step by default', () => {
      render(<UserImport {...defaultProps} />);

      expect(screen.getByText('Import Users from CSV')).toBeInTheDocument();
      expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
      expect(screen.getByText('CSV file only')).toBeInTheDocument();
    });

    it('shows CSV format instructions', () => {
      render(<UserImport {...defaultProps} />);

      expect(screen.getByText(/Upload a CSV file with user data/)).toBeInTheDocument();
      expect(screen.getByText('name')).toBeInTheDocument();
      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText('role')).toBeInTheDocument();
      expect(screen.getByText('extraRole')).toBeInTheDocument();
      expect(screen.getByText('status')).toBeInTheDocument();
    });

    it('has download CSV template button', () => {
      render(<UserImport {...defaultProps} />);

      expect(screen.getByText('Download CSV Template')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<UserImport {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Import Users from CSV')).not.toBeInTheDocument();
    });
  });

  describe('File Upload', () => {
    it('opens file picker when clicking upload area', () => {
      render(<UserImport {...defaultProps} />);

      const uploadArea = screen.getByLabelText('Upload CSV file');
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      expect(fileInput).toBeInTheDocument();
      fireEvent.click(uploadArea!);

      expect(fileInput).not.toHaveFocus();
    });

    it('handles CSV file selection', async () => {
      mockParseData = mockCSVData;

      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Found 2 valid users and 1 invalid rows.')).toBeInTheDocument();
      });
    });

    it('validates file type', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['content'], 'users.txt', { type: 'text/plain' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
      });
    });

    it('shows file info after selection', async () => {
      mockParseData = mockCSVData;

      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      });
    });

    it('removes selected file', async () => {
      mockParseData = mockCSVData;

      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('2 valid users'))).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });
  });

  describe('Preview Step', () => {
    beforeEach(() => {
      mockParseData = mockCSVData;
    });

    it('shows parsed users in table', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        const students = screen.getAllByText('student');
        const teachers = screen.getAllByText('teacher');
        expect(students.length).toBeGreaterThan(0);
        expect(teachers.length).toBeGreaterThan(0);
      });
    });

    it('shows validation status for each user', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getAllByText('Valid')).toHaveLength(2);
        expect(screen.getByText('Valid email is required')).toBeInTheDocument();
      });
    });

    it('shows info alert for validation summary', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Found 2 valid users and 1 invalid rows.')).toBeInTheDocument();
      });
    });

    it('shows warning alert when there are invalid rows', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/Some rows have validation errors/)).toBeInTheDocument();
      });
    });

    it('goes back to upload step on Back button', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const backButton = screen.getByText('Back');
        fireEvent.click(backButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
      });
    });

    it('closes modal on Cancel button', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
      });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('disables import button when no valid users', async () => {
      mockParseData = [{ name: '', email: 'invalid', role: 'student' }];

      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const importButton = screen.getByText('Import 0 Users');
        expect(importButton).toBeDisabled();
      });
    });
  });

  describe('Import Process', () => {
    beforeEach(() => {
      mockParseData = mockCSVData;
    });

    it('starts import when clicking Import button', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const importButton = screen.getByText('Import 2 Users');
        expect(importButton).toBeInTheDocument();
        fireEvent.click(importButton);
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.queryByText('Import Users from CSV')).not.toBeInTheDocument();
        expect(screen.queryByText('Found 2 valid users')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows progress during import', async () => {
      (apiService.api.users.create as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, data: mockUsers[0] });

      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const importButton = screen.getByText('Import 2 Users');
        fireEvent.click(importButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Import Complete')).toBeInTheDocument();
      });
    });

    it('shows complete state after successful import', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const importButton = screen.getByText('Import 2 Users');
        fireEvent.click(importButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Import Successful')).toBeInTheDocument();
        expect(screen.getByText('2 of 2 users imported successfully')).toBeInTheDocument();
      });
    });

    it('shows success count and failed count', async () => {
      (apiService.api.users.create as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ success: true, data: mockUsers[0] })
        .mockResolvedValueOnce({ success: false, message: 'Email already exists' });

      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const importButton = screen.getByText('Import 2 Users');
        expect(importButton).toBeInTheDocument();
        fireEvent.click(importButton);
      }, { timeout: 3000 });

      await waitFor(() => {
        const allOnes = screen.getAllByText('1');
        expect(allOnes.length).toBeGreaterThan(0);
        expect(screen.getByText('Successful')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows error details for failed imports', async () => {
      (apiService.api.users.create as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ success: true, data: mockUsers[0] })
        .mockRejectedValueOnce(new Error('Network error'));

      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const importButton = screen.getByText('Import 2 Users');
        fireEvent.click(importButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Import Errors/)).toBeInTheDocument();
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it('calls onImportComplete callback after successful import', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const importButton = screen.getByText('Import 2 Users');
        fireEvent.click(importButton);
      });

      await waitFor(() => {
        expect(defaultProps.onImportComplete).toHaveBeenCalled();
      });
    });

    it('resets state when modal closes', async () => {
      const { rerender } = render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText((content, _element) => {
          return content.includes('2 valid users');
        })).toBeInTheDocument();
      }, { timeout: 3000 });

      rerender(<UserImport {...defaultProps} isOpen={false} />);

      await waitFor(() => {
        expect(screen.queryByText((content) => content.includes('2 valid users'))).not.toBeInTheDocument();
      });
    });

    it('does not import invalid users', async () => {
      (apiService.api.users.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: mockUsers[0],
      });

      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const importButton = screen.getByText('Import 2 Users');
        fireEvent.click(importButton);
      });

      await waitFor(() => {
        expect(apiService.api.users.create).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Download Template', () => {
    it('downloads CSV template with correct headers', () => {
      const mockUrl = 'blob:mock-url';
      const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
      const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((_element) => {
        return originalCreateElement('a');
      });

      render(<UserImport {...defaultProps} />);

      const downloadButton = screen.getByText('Download CSV Template');
      fireEvent.click(downloadButton);

      expect(createObjectUrlSpy).toHaveBeenCalled();
      expect(revokeObjectUrlSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      createObjectUrlSpy.mockRestore();
      revokeObjectUrlSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockParseData = mockCSVData;
    });

    it('has correct ARIA labels', () => {
      render(<UserImport {...defaultProps} />);

      const uploadArea = screen.getByLabelText('Upload CSV file');
      expect(uploadArea).toHaveAttribute('role', 'button');
    });

    it('announces progress to screen readers', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const importButton = screen.getByText('Import 2 Users');
        fireEvent.click(importButton);
      });

      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-label');
      });
    });
  });
});
