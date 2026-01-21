// PPDBManagement.test.tsx - Tests for PPDBManagement component
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PPDBManagement from '../PPDBManagement';
import { STORAGE_KEYS } from '../../constants';
import type { PPDBRegistrant } from '../../types';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock services
vi.mock('../../services/permissionService', () => ({
  permissionService: {
    hasPermission: vi.fn(() => ({ granted: true })),
  },
}));

vi.mock('../../services/unifiedNotificationManager', () => ({
  unifiedNotificationManager: {
    showNotification: vi.fn(),
  },
}));

vi.mock('../../services/emailService', () => ({
  emailService: {
    sendEmail: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('../../services/pdfExportService', () => ({
  pdfExportService: {
    createReport: vi.fn(),
  },
}));

describe('PPDBManagement', () => {
  const mockRegistrants: PPDBRegistrant[] = [
    {
      id: '1',
      userId: 'user-1',
      fullName: 'Ahmad Rizky',
      nisn: '1234567890',
      originSchool: 'SMP Negeri 1 Malang',
      parentName: 'Budi Santoso',
      phoneNumber: '081234567890',
      email: 'ahmad@example.com',
      address: 'Jl. Contoh No. 1',
      registrationDate: '2026-01-15',
      status: 'pending',
      documentUrl: 'https://example.com/doc.pdf',
    },
    {
      id: '2',
      fullName: 'Siti Nurhaliza',
      nisn: '0987654321',
      originSchool: 'SMP Negeri 2 Malang',
      parentName: 'Ahmad Wijaya',
      phoneNumber: '081234567891',
      email: 'siti@example.com',
      address: 'Jl. Contoh No. 2',
      registrationDate: '2026-01-16',
      status: 'approved',
      score: 85,
      rubricScores: {
        academic: 90,
        behavior: 80,
        interview: 82,
      },
    },
  ];

  const mockOnBack = vi.fn();
  const mockOnShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === STORAGE_KEYS.USER) {
        return JSON.stringify({
          id: 'admin-1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        });
      }
      if (key === STORAGE_KEYS.PPDB_REGISTRANTS) {
        return JSON.stringify(mockRegistrants);
      }
      return null;
    });
  });

  it('should render PPDB management dashboard', () => {
    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    expect(screen.getByText(/Penerimaan Siswa Baru/i)).toBeInTheDocument();
    expect(screen.getByText(/Kelola data calon siswa yang mendaftar/i)).toBeInTheDocument();
  });

  it('should display registrant statistics', () => {
    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    expect(screen.getByText(/Total Pendaftar/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/Perlu Verifikasi/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/Diterima/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should display registrant table with data', () => {
    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    expect(screen.getByText('Ahmad Rizky')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText('SMP Negeri 1 Malang')).toBeInTheDocument();
    expect(screen.getByText('Siti Nurhaliza')).toBeInTheDocument();
    expect(screen.getByText('0987654321')).toBeInTheDocument();
    expect(screen.getByText('SMP Negeri 2 Malang')).toBeInTheDocument();
  });

  it('should filter registrants by status', async () => {
    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    const statusFilter = screen.getByLabelText(/Status/i);
    fireEvent.change(statusFilter, { target: { value: 'pending' } });

    await waitFor(() => {
      expect(screen.getByText('Ahmad Rizky')).toBeInTheDocument();
      expect(screen.queryByText('Siti Nurhaliza')).not.toBeInTheDocument();
    });
  });

  it('should sort registrants by score', async () => {
    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    const sortField = screen.getByLabelText(/Urutkan:/i);
    fireEvent.change(sortField, { target: { value: 'score' } });

    await waitFor(() => {
      const registrants = screen.getAllByText(/Ahmad Rizky|Siti Nurhaliza/);
      expect(registrants[0]).toHaveTextContent('Siti Nurhaliza');
    });
  });

  it('should approve a registrant', async () => {
    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    const { emailService } = await import('../../services/emailService');
    const { pdfExportService } = await import('../../services/pdfExportService');

    const approveButton = screen.getByLabelText(/Terima pendaftaran ini/i);
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(emailService.sendEmail).toHaveBeenCalled();
      expect(pdfExportService.createReport).toHaveBeenCalled();
      expect(mockOnShowToast).toHaveBeenCalledWith(
        'Status pendaftar berhasil diubah menjadi Diterima.',
        'success'
      );
    });
  });

  it('should reject a registrant', async () => {
    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    const { emailService } = await import('../../services/emailService');
    const { pdfExportService } = await import('../../services/pdfExportService');

    const rejectButton = screen.getByLabelText(/Tolak pendaftaran ini/i);
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(emailService.sendEmail).toHaveBeenCalled();
      expect(pdfExportService.createReport).toHaveBeenCalled();
      expect(mockOnShowToast).toHaveBeenCalledWith(
        'Status pendaftar berhasil diubah menjadi Ditolak.',
        'info'
      );
    });
  });

  it('should bulk approve selected registrants', async () => {
    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Select registrant 1

    const { emailService } = await import('../../services/emailService');
    const { pdfExportService } = await import('../../services/pdfExportService');

    const approveButton = screen.getByText('Terima Semua');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(emailService.sendEmail).toHaveBeenCalled();
      expect(pdfExportService.createReport).toHaveBeenCalled();
    });
  });

  it('should open scoring modal', async () => {
    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    const scoreButton = screen.getByText(/Beri Skor/i);
    fireEvent.click(scoreButton);

    await waitFor(() => {
      expect(screen.getByText(/Penilaian Calon Siswa/i)).toBeInTheDocument();
      expect(screen.getByText(/Prestasi Akademik/i)).toBeInTheDocument();
      expect(screen.getByText(/Sikap & Perilaku/i)).toBeInTheDocument();
      expect(screen.getByText(/Wawancara/i)).toBeInTheDocument();
    });
  });

  it('should update score in modal', async () => {
    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    const scoreButton = screen.getByText(/Beri Skor/i);
    fireEvent.click(scoreButton);

    await waitFor(() => {
      expect(screen.getByText(/Penilaian Calon Siswa/i)).toBeInTheDocument();
    });

    const slider = screen.getAllByRole('slider')[0];
    fireEvent.change(slider, { target: { value: '75' } });

    await waitFor(() => {
      expect(mockOnShowToast).toHaveBeenCalledWith('Skor berhasil diperbarui', 'success');
    });
  });

  it('should open document preview modal', async () => {
    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    const previewButton = screen.getByLabelText(/Lihat dokumen untuk pendaftar ini/i);
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview Dokumen/i)).toBeInTheDocument();
      expect(screen.getByText(/Ahmad Rizky/i)).toBeInTheDocument();
    });
  });

  it('should search by school name', async () => {
    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    const searchInput = screen.getByPlaceholderText('Cari sekolah...');
    fireEvent.change(searchInput, { target: { value: 'SMP Negeri 1' } });

    await waitFor(() => {
      expect(screen.getByText('Ahmad Rizky')).toBeInTheDocument();
      expect(screen.queryByText('Siti Nurhaliza')).not.toBeInTheDocument();
    });
  });

  it('should show access denied for unauthorized users', () => {
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === STORAGE_KEYS.USER) {
        return JSON.stringify({
          id: 'user-1',
          username: 'student',
          email: 'student@example.com',
          role: 'student',
        });
      }
      return null;
    });

    const { permissionService } = require('../../services/permissionService');
      permissionService.hasPermission.mockReturnValue({ granted: false });

    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  });

  it('should display score color based on value', () => {
    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    const scoreElement = screen.getByText('85');
    expect(scoreElement).toHaveClass('text-green-600');
  });

  it('should handle empty registrant list', () => {
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === STORAGE_KEYS.PPDB_REGISTRANTS) {
        return JSON.stringify([]);
      }
      return null;
    });

    render(<PPDBManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    expect(screen.getByText(/Belum ada data pendaftar/i)).toBeInTheDocument();
  });
});
