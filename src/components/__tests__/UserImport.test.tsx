import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import UserImport, { CSVRow, ParsedUser, ImportResult } from '../UserImport';
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
    parse: vi.fn(),
  },
}));

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

      const uploadArea = screen.getByText('Click to upload or drag and drop').parentElement;
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      expect(fileInput).toBeInTheDocument();
      fireEvent.click(uploadArea!);

      expect(fileInput).not.toHaveFocus();
    });

    it('handles CSV file selection', async () => {
      const Papa = await import('papaparse');

      (Papa.default.parse as ReturnType<typeof vi.fn>).mockImplementation(({ complete }: { complete: (results: { data: CSVRow[] }) => void }) => {
        complete({ data: mockCSVData });
      });

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
        expect(window.alert).toHaveBeenCalledWith('Please select a CSV file');
      });
    });

    it('shows file info after selection', async () => {
      const Papa = await import('papaparse');

      (Papa.default.parse as ReturnType<typeof vi.fn>).mockImplementation(({ complete }: { complete: (results: { data: CSVRow[] }) => void }) => {
        complete({ data: mockCSVData });
      });

      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('users.csv')).toBeInTheDocument();
        expect(screen.getByText(/KB/)).toBeInTheDocument();
      });
    });

    it('removes selected file', async () => {
      const Papa = await import('papaparse');

      (Papa.default.parse as ReturnType<typeof vi.fn>).mockImplementation(({ complete }: { complete: (results: { data: CSVRow[] }) => void }) => {
        complete({ data: mockCSVData });
      });

      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const removeButton = screen.getByRole('button', { name: /remove/i });
        fireEvent.click(removeButton);
      });

      expect(screen.queryByText('users.csv')).not.toBeInTheDocument();
    });
  });

  describe('Preview Step', () => {
    beforeEach(async () => {
      const Papa = await import('papaparse');

      (Papa.default.parse as ReturnType<typeof vi.fn>).mockImplementation(({ complete }: { complete: (results: { data: CSVRow[] }) => void }) => {
        complete({ data: mockCSVData });
      });
    });

    it('shows parsed users in table', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        expect(screen.getByText('student')).toBeInTheDocument();
        expect(screen.getByText('teacher')).toBeInTheDocument();
      });
    });

    it('shows validation status for each user', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getAllByText('Valid')).toHaveLength(2);
        expect(screen.getByText('1 error(s)')).toBeInTheDocument();
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
      const Papa = await import('papaparse');

      (Papa.default.parse as ReturnType<typeof vi.fn>).mockImplementation(({ complete }: { complete: (results: { data: CSVRow[] }) => void }) => {
        complete({ data: [{ name: '', email: 'invalid', role: 'student' }] });
      });

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
    beforeEach(async () => {
      const Papa = await import('papaparse');

      (Papa.default.parse as ReturnType<typeof vi.fn>).mockImplementation(({ complete }: { complete: (results: { data: CSVRow[] }) => void }) => {
        complete({ data: mockCSVData });
      });
    });

    it('starts import when clicking Import button', async () => {
      render(<UserImport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['name,email\nJohn,john@example.com'], 'users.csv', { type: 'text/csv' });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const importButton = screen.getByText('Import 2 Users');
        fireEvent.click(importButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Importing Users...')).toBeInTheDocument();
        expect(screen.getByText('Please wait while we process import')).toBeInTheDocument();
      });
    });

    it('shows progress during import', async () => {
      let resolveImport: ((value: unknown) => void) | null = null;
      (apiService.api.users.create as ReturnType<typeof vi.fn>).mockImplementation(() => {
        return new Promise((resolve) => {
          resolveImport = resolve;
        });
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
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      if (resolveImport) {
        resolveImport({ success: true, data: mockUsers[0] });
      }

      await waitFor(() => {
        resolveImport?.({ success: true, data: mockUsers[1] });
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
        fireEvent.click(importButton);
      });

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('Successful')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });
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
        expect(screen.getByText('Import Errors')).toBeInTheDocument();
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
        expect(screen.getByText('Found 2 valid users')).toBeInTheDocument();
      });

      rerender(<UserImport {...defaultProps} isOpen={false} />);

      await waitFor(() => {
        expect(screen.queryByText('Found 2 valid users')).not.toBeInTheDocument();
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
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      render(<UserImport {...defaultProps} />);

      const downloadButton = screen.getByText('Download CSV Template');
      fireEvent.click(downloadButton);

      expect(mockLink.download).toBe('users_template.csv');
      expect(mockLink.click).toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA labels', () => {
      render(<UserImport {...defaultProps} />);

      const uploadArea = screen.getByText('Click to upload or drag and drop').parentElement;
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
