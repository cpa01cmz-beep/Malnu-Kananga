import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MaterialUpload from '../MaterialUpload';
import { STORAGE_KEYS } from '../../constants';
import * as apiService from '../../services/apiService';
import { categoryService } from '../../services/categoryService';

const mockOnBack = vi.fn();
const mockOnShowToast = vi.fn();

const mockMaterials = [
  {
    id: '1',
    title: 'Modul Matematika Bab 1',
    description: 'Materi tentang bilangan bulat',
    category: 'Matematika',
    fileUrl: 'files/mat1.pdf',
    fileType: 'application/pdf',
    fileSize: 1024000,
    uploadedAt: '2024-01-15T10:00:00Z',
    uploadedBy: 'teacher1',
    downloadCount: 15,
    isShared: true
  },
  {
    id: '2',
    title: 'Presentasi Fisika',
    description: 'Materi tentang energi dan daya',
    category: 'Fisika',
    fileUrl: 'files/fisika.pptx',
    fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    fileSize: 2048000,
    uploadedAt: '2024-01-16T11:00:00Z',
    uploadedBy: 'teacher2',
    downloadCount: 8,
    isShared: false
  },
  {
    id: '3',
    title: 'Video Pembelajaran Biologi',
    description: 'Tutorial tentang sel tumbuhan',
    category: 'Biologi',
    fileUrl: 'files/biologi.mp4',
    fileType: 'video/mp4',
    fileSize: 52428800,
    uploadedAt: '2024-01-17T12:00:00Z',
    uploadedBy: 'teacher1',
    downloadCount: 25,
    isShared: true
  },
  {
    id: '4',
    title: 'Modul Bahasa Indonesia',
    description: 'Materi tentang puisi dan pantun',
    category: 'Bahasa Indonesia',
    fileUrl: 'files/indo.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 512000,
    uploadedAt: '2024-01-18T13:00:00Z',
    uploadedBy: 'teacher3',
    downloadCount: 12,
    isShared: false
  }
];

const mockSubjects = [
  { id: '1', name: 'Matematika', code: 'MTK' },
  { id: '2', name: 'Fisika', code: 'FIS' },
  { id: '3', name: 'Biologi', code: 'BIO' },
  { id: '4', name: 'Bahasa Indonesia', code: 'BIN' }
];

vi.mock('../../services/apiService', () => ({
  eLibraryAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('../../services/categoryService', () => ({
  categoryService: {
    getSubjects: vi.fn(),
    updateMaterialStats: vi.fn()
  }
}));

vi.mock('../../services/unifiedNotificationManager', () => ({
  unifiedNotificationManager: {
    showNotification: vi.fn()
  }
}));

vi.mock('../../hooks/useEventNotifications', () => ({
  useEventNotifications: () => ({
    notifyLibraryUpdate: vi.fn()
  })
}));

vi.mock('../../services/offlineActionQueueService', () => ({
  useOfflineActionQueue: () => ({
    addAction: vi.fn(),
    getPendingCount: vi.fn(() => 0)
  })
}));

vi.mock('../../utils/networkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    isSlow: false
  })
}));

vi.mock('../../hooks/useCanAccess', () => ({
  useCanAccess: () => ({
    user: { id: 'teacher-1', name: 'Guru', email: 'guru@malnu.sch.id', status: 'active' },
    userRole: 'teacher',
    userExtraRole: null,
    canAccess: vi.fn(() => ({ canAccess: true, requiredPermission: 'content.create' })),
    canAccessAny: vi.fn(() => true),
    canAccessResource: vi.fn(() => true),
    userPermissions: [],
    userPermissionIds: [],
  })
}));

describe('MaterialUpload - Search and Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    (apiService.eLibraryAPI.getAll as any).mockResolvedValue({
      success: true,
      data: mockMaterials
    });

    (categoryService.getSubjects as any).mockResolvedValue(mockSubjects);

    localStorage.setItem(
      STORAGE_KEYS.AUTH_SESSION,
      JSON.stringify({ token: 'test-token', user: { role: 'teacher' } })
    );
  });

  describe('Search Functionality', () => {
    it('should render search input', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Cari materi/i)).toBeInTheDocument();
      });
    });

    it('should filter materials by search query', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Cari materi/i);
      fireEvent.change(searchInput, { target: { value: 'matematika' } });

      await waitFor(() => {
        expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
        expect(screen.queryByText('Presentasi Fisika')).not.toBeInTheDocument();
        expect(screen.queryByText('Video Pembelajaran Biologi')).not.toBeInTheDocument();
      });
    });

    it('should filter materials by description', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const searchInput = screen.getByPlaceholderText(/Cari materi/i);
      fireEvent.change(searchInput, { target: { value: 'energi' } });

      await waitFor(() => {
        expect(screen.getByText('Presentasi Fisika')).toBeInTheDocument();
        expect(screen.queryByText('Modul Matematika Bab 1')).not.toBeInTheDocument();
      });
    });

    it('should filter materials by category', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const searchInput = screen.getByPlaceholderText(/Cari materi/i);
      fireEvent.change(searchInput, { target: { value: 'Biologi' } });

      await waitFor(() => {
        expect(screen.getByText('Video Pembelajaran Biologi')).toBeInTheDocument();
      });
    });

    it('should clear search when input is emptied', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const searchInput = screen.getByPlaceholderText(/Cari materi/i);
      fireEvent.change(searchInput, { target: { value: 'matematika' } });

      await waitFor(() => {
        expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
        expect(screen.queryByText('Presentasi Fisika')).not.toBeInTheDocument();
      });

      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
        expect(screen.getByText('Presentasi Fisika')).toBeInTheDocument();
        expect(screen.getByText('Video Pembelajaran Biologi')).toBeInTheDocument();
      });
    });

    it('should show search filter chip when search is active', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const searchInput = screen.getByPlaceholderText(/Cari materi/i);
      fireEvent.change(searchInput, { target: { value: 'matematika' } });

      await waitFor(() => {
        expect(screen.getByText(/Search:/i)).toBeInTheDocument();
      });
    });

    it('should remove search filter chip on click', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const searchInput = screen.getByPlaceholderText(/Cari materi/i);
      fireEvent.change(searchInput, { target: { value: 'matematika' } });

      await waitFor(() => {
        expect(screen.getByText(/Search:/i)).toBeInTheDocument();
      });

      const clearButton = screen.getByLabelText(/Clear search/i);
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(screen.queryByText(/Search:/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Category Filter', () => {
    it('should render category filter dropdown', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText(/Semua Kategori/i)).toBeInTheDocument();
      });
    });

    it('should filter materials by selected category', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
      });

      const categoryFilter = screen.getByText(/Semua Kategori/i);
      fireEvent.change(categoryFilter, { target: { value: 'Matematika' } });

      await waitFor(() => {
        expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
        expect(screen.queryByText('Presentasi Fisika')).not.toBeInTheDocument();
      });
    });

    it('should show category filter chip when filter is active', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText(/Semua Kategori/i)).toBeInTheDocument();
      });

      const categoryFilter = screen.getByText(/Semua Kategori/i);
      fireEvent.change(categoryFilter, { target: { value: 'Matematika' } });

      await waitFor(() => {
        expect(screen.getByText('Matematika')).toBeInTheDocument();
      });
    });

    it('should remove category filter chip on click', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText(/Semua Kategori/i)).toBeInTheDocument();
      });

      const categoryFilter = screen.getByText(/Semua Kategori/i);
      fireEvent.change(categoryFilter, { target: { value: 'Matematika' } });

      await waitFor(() => {
        expect(screen.getByText('Matematika')).toBeInTheDocument();
      });

      const clearButton = screen.getByLabelText(/Clear category filter/i);
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(categoryFilter).toHaveValue('all');
      });
    });
  });

  describe('File Type Filter', () => {
    it('should render file type filter dropdown', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText(/Semua Tipe/i)).toBeInTheDocument();
      });
    });

    it('should filter materials by PDF file type', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
      });

      const fileTypeFilter = screen.getByText(/Semua Tipe/i);
      fireEvent.change(fileTypeFilter, { target: { value: 'PDF' } });

      await waitFor(() => {
        expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
        expect(screen.queryByText('Presentasi Fisika')).not.toBeInTheDocument();
        expect(screen.queryByText('Video Pembelajaran Biologi')).not.toBeInTheDocument();
      });
    });

    it('should filter materials by DOCX file type', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const fileTypeFilter = screen.getByText(/Semua Tipe/i);
      fireEvent.change(fileTypeFilter, { target: { value: 'DOCX' } });

      await waitFor(() => {
        expect(screen.getByText('Modul Bahasa Indonesia')).toBeInTheDocument();
        expect(screen.queryByText('Modul Matematika Bab 1')).not.toBeInTheDocument();
      });
    });

    it('should filter materials by PPT file type', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const fileTypeFilter = screen.getByText(/Semua Tipe/i);
      fireEvent.change(fileTypeFilter, { target: { value: 'PPT' } });

      await waitFor(() => {
        expect(screen.getByText('Presentasi Fisika')).toBeInTheDocument();
        expect(screen.queryByText('Modul Matematika Bab 1')).not.toBeInTheDocument();
      });
    });

    it('should filter materials by VIDEO file type', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const fileTypeFilter = screen.getByText(/Semua Tipe/i);
      fireEvent.change(fileTypeFilter, { target: { value: 'VIDEO' } });

      await waitFor(() => {
        expect(screen.getByText('Video Pembelajaran Biologi')).toBeInTheDocument();
        expect(screen.queryByText('Modul Matematika Bab 1')).not.toBeInTheDocument();
      });
    });

    it('should show file type filter chip when filter is active', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const fileTypeFilter = screen.getByText(/Semua Tipe/i);
      fireEvent.change(fileTypeFilter, { target: { value: 'PDF' } });

      await waitFor(() => {
        expect(screen.getByText('PDF')).toBeInTheDocument();
      });
    });
  });

  describe('Sharing Status Filter', () => {
    it('should render sharing status filter buttons', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Dibagikan')).toBeInTheDocument();
        expect(screen.getByText('Privat')).toBeInTheDocument();
      });
    });

    it('should filter materials by shared status', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
      });

      const sharedButton = screen.getByText('Dibagikan');
      fireEvent.click(sharedButton);

      await waitFor(() => {
        expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
        expect(screen.getByText('Video Pembelajaran Biologi')).toBeInTheDocument();
        expect(screen.queryByText('Presentasi Fisika')).not.toBeInTheDocument();
      });
    });

    it('should filter materials by private status', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const privateButton = screen.getByText('Privat');
      fireEvent.click(privateButton);

      await waitFor(() => {
        expect(screen.getByText('Presentasi Fisika')).toBeInTheDocument();
        expect(screen.getByText('Modul Bahasa Indonesia')).toBeInTheDocument();
        expect(screen.queryByText('Modul Matematika Bab 1')).not.toBeInTheDocument();
      });
    });

    it('should toggle sharing filter on second click', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const sharedButton = screen.getByText('Dibagikan');
      fireEvent.click(sharedButton);

      await waitFor(() => {
        expect(screen.queryByText('Presentasi Fisika')).not.toBeInTheDocument();
      });

      fireEvent.click(sharedButton);

      await waitFor(() => {
        expect(screen.getByText('Presentasi Fisika')).toBeInTheDocument();
      });
    });

    it('should show sharing status filter chip when filter is active', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const sharedButton = screen.getByText('Dibagikan');
      fireEvent.click(sharedButton);

      await waitFor(() => {
        expect(screen.getByText('Dibagikan')).toBeInTheDocument();
      });
    });
  });

  describe('Combined Filters', () => {
    it('should apply search and category filters together', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const searchInput = screen.getByPlaceholderText(/Cari materi/i);
      fireEvent.change(searchInput, { target: { value: 'materi' } });

      const categoryFilter = screen.getByText(/Semua Kategori/i);
      fireEvent.change(categoryFilter, { target: { value: 'Matematika' } });

      await waitFor(() => {
        expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
        expect(screen.queryByText('Modul Bahasa Indonesia')).not.toBeInTheDocument();
      });
    });

    it('should apply file type and sharing filters together', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const fileTypeFilter = screen.getByText(/Semua Tipe/i);
      fireEvent.change(fileTypeFilter, { target: { value: 'PDF' } });

      const sharedButton = screen.getByText('Dibagikan');
      fireEvent.click(sharedButton);

      await waitFor(() => {
        expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
        expect(screen.queryByText('Modul Bahasa Indonesia')).not.toBeInTheDocument();
      });
    });

    it('should count active filters correctly', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const searchInput = screen.getByPlaceholderText(/Cari materi/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const categoryFilter = screen.getByText(/Semua Kategori/i);
      fireEvent.change(categoryFilter, { target: { value: 'Matematika' } });

      const fileTypeFilter = screen.getByText(/Semua Tipe/i);
      fireEvent.change(fileTypeFilter, { target: { value: 'PDF' } });

      await waitFor(() => {
        expect(screen.getByText(/Reset Filters \(3\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Clear All Filters', () => {
    it('should show reset filters button when filters are active', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const searchInput = screen.getByPlaceholderText(/Cari materi/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText(/Reset Filters/i)).toBeInTheDocument();
      });
    });

    it('should clear all filters when reset button is clicked', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const searchInput = screen.getByPlaceholderText(/Cari materi/i);
      fireEvent.change(searchInput, { target: { value: 'matematika' } });

      const categoryFilter = screen.getByText(/Semua Kategori/i);
      fireEvent.change(categoryFilter, { target: { value: 'Matematika' } });

      const resetButton = screen.getByText(/Reset Filters/i);
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Cari materi/i)).toHaveValue('');
        expect(screen.queryByText(/Reset Filters/i)).not.toBeInTheDocument();
      });
    });

    it('should show all materials after clearing filters', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const searchInput = screen.getByPlaceholderText(/Cari materi/i);
      fireEvent.change(searchInput, { target: { value: 'matematika' } });

      const categoryFilter = screen.getByText(/Semua Kategori/i);
      fireEvent.change(categoryFilter, { target: { value: 'Matematika' } });

      await waitFor(() => {
        expect(screen.queryByText('Presentasi Fisika')).not.toBeInTheDocument();
      });

      const resetButton = screen.getByText(/Reset Filters/i);
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
        expect(screen.getByText('Presentasi Fisika')).toBeInTheDocument();
        expect(screen.getByText('Video Pembelajaran Biologi')).toBeInTheDocument();
        expect(screen.getByText('Modul Bahasa Indonesia')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State with Filters', () => {
    it('should show appropriate message when no materials match filters', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      const searchInput = screen.getByPlaceholderText(/Cari materi/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText(/Tidak ada materi yang cocok dengan filter yang dipilih/i)).toBeInTheDocument();
      });
    });
  });

  describe('Material Count Display', () => {
    it('should update material count based on filters', async () => {
      render(<MaterialUpload onBack={mockOnBack} onShowToast={mockOnShowToast} />);

      await waitFor(() => {
        expect(screen.getByText(/Semua Materi \(4\)/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Cari materi/i);
      fireEvent.change(searchInput, { target: { value: 'materi' } });

      await waitFor(() => {
        expect(screen.getByText(/Semua Materi \(2\)/i)).toBeInTheDocument();
      });
    });
  });
});
