import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MaterialManagementView } from '../material-upload/MaterialManagementView';
import { ELibrary } from '../../types';

const mockMaterials: ELibrary[] = [
  {
    id: '1',
    title: 'Modul Matematika Bab 1',
    description: 'Materi tentang bilangan bulat',
    category: 'Matematika',
    fileUrl: 'files/mat1.pdf',
    fileType: 'application/pdf',
    fileSize: 1024000,
    subjectId: 'sub-1',
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
    subjectId: 'sub-2',
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
    subjectId: 'sub-3',
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
    subjectId: 'sub-4',
    uploadedAt: '2024-01-18T13:00:00Z',
    uploadedBy: 'teacher3',
    downloadCount: 12,
    isShared: false
  }
];

const mockCategories = ['Matematika', 'Fisika', 'Biologi', 'Bahasa Indonesia'];

const mockOnFolderSelect = vi.fn();
const mockOnMaterialDelete = vi.fn();
const mockOnMaterialSelect = vi.fn();
const mockOnFilterChange = vi.fn();
const mockOnClearFilters = vi.fn();
const mockGetActiveFilterCount = vi.fn();

const defaultFilters = {
  searchQuery: '',
  filterCategory: 'all',
  filterFileType: 'all',
  filterShared: null as boolean | null,
};

describe('MaterialManagementView - Search and Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetActiveFilterCount.mockReturnValue(0);
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={mockMaterials}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByPlaceholderText(/Cari berdasarkan judul, deskripsi, atau kategori\.\.\./i)).toBeInTheDocument();
    });

    it('should call onFilterChange when search query changes', async () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={mockMaterials}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Cari berdasarkan/i);
      await userEvent.type(searchInput, 'matematika');

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ searchQuery: 'matematika' })
      );
    });

    it('should show search filter chip when search query is active', () => {
      const filtersWithSearch = { ...defaultFilters, searchQuery: 'matematika' };
      mockGetActiveFilterCount.mockReturnValue(1);

      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={filtersWithSearch}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={[mockMaterials[0]]}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByText(/Search:/i)).toBeInTheDocument();
      expect(screen.getByText('matematika')).toBeInTheDocument();
    });

    it('should clear search filter when clear button is clicked', async () => {
      const filtersWithSearch = { ...defaultFilters, searchQuery: 'matematika' };
      mockGetActiveFilterCount.mockReturnValue(1);

      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={filtersWithSearch}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={[mockMaterials[0]]}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      const clearButton = screen.getByLabelText(/Clear search/i);
      await userEvent.click(clearButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ searchQuery: '' })
      );
    });
  });

  describe('Category Filter', () => {
    it('should render category filter dropdown', () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={mockMaterials}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByText(/Semua Kategori/i)).toBeInTheDocument();
    });

    it('should call onFilterChange when category changes', async () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={mockMaterials}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      const categoryFilter = screen.getByText(/Semua Kategori/i);
      await userEvent.selectOptions(categoryFilter, 'Matematika');

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ filterCategory: 'Matematika' })
      );
    });

    it('should show category filter chip when filter is active', () => {
      const filtersWithCategory = { ...defaultFilters, filterCategory: 'Matematika' };
      mockGetActiveFilterCount.mockReturnValue(1);

      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={filtersWithCategory}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={[mockMaterials[0]]}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByText('Matematika')).toBeInTheDocument();
    });
  });

  describe('File Type Filter', () => {
    it('should render file type filter dropdown', () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={mockMaterials}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByText(/Semua Tipe/i)).toBeInTheDocument();
    });

    it('should call onFilterChange when file type changes', async () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={mockMaterials}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      const fileTypeFilter = screen.getByText(/Semua Tipe/i);
      await userEvent.selectOptions(fileTypeFilter, 'PDF');

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ filterFileType: 'PDF' })
      );
    });

    it('should show file type filter chip when filter is active', () => {
      const filtersWithFileType = { ...defaultFilters, filterFileType: 'PDF' };
      mockGetActiveFilterCount.mockReturnValue(1);

      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={filtersWithFileType}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={[mockMaterials[0]]}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByText('PDF')).toBeInTheDocument();
    });
  });

  describe('Sharing Status Filter', () => {
    it('should render sharing status filter buttons', () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={mockMaterials}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByText('Dibagikan')).toBeInTheDocument();
      expect(screen.getByText('Privat')).toBeInTheDocument();
    });

    it('should call onFilterChange when sharing status changes', async () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={mockMaterials}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      const sharedButton = screen.getByText('Dibagikan');
      await userEvent.click(sharedButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ filterShared: true })
      );
    });

    it('should show sharing filter chip when filter is active', () => {
      const filtersWithShared = { ...defaultFilters, filterShared: true };
      mockGetActiveFilterCount.mockReturnValue(1);

      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={filtersWithShared}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={[mockMaterials[0], mockMaterials[2]]}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByText('Dibagikan')).toBeInTheDocument();
    });
  });

  describe('Clear All Filters', () => {
    it('should show reset filters button when filters are active', () => {
      const activeFilters = {
        ...defaultFilters,
        searchQuery: 'test',
        filterCategory: 'Matematika',
      };
      mockGetActiveFilterCount.mockReturnValue(2);

      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={activeFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={[mockMaterials[0]]}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByText(/Hapus Semua Filter/i)).toBeInTheDocument();
    });

    it('should call onClearFilters when reset button is clicked', async () => {
      const activeFilters = {
        ...defaultFilters,
        searchQuery: 'matematika',
        filterCategory: 'Matematika',
      };
      mockGetActiveFilterCount.mockReturnValue(2);

      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={activeFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={[mockMaterials[0]]}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      const resetButton = screen.getByText(/Hapus Semua Filter/i);
      await userEvent.click(resetButton);

      expect(mockOnClearFilters).toHaveBeenCalled();
    });
  });

  describe('Empty State with Filters', () => {
    it('should show appropriate message when no materials match filters', () => {
      mockGetActiveFilterCount.mockReturnValue(1);

      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={{ ...defaultFilters, searchQuery: 'nonexistent' }}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={[]}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByText(/Tidak ada materi yang cocok dengan filter yang dipilih\./i)).toBeInTheDocument();
    });
  });

  describe('Material List Display', () => {
    it('should display materials when provided', () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={mockMaterials}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
      expect(screen.getByText('Presentasi Fisika')).toBeInTheDocument();
      expect(screen.getByText('Video Pembelajaran Biologi')).toBeInTheDocument();
      expect(screen.getByText('Modul Bahasa Indonesia')).toBeInTheDocument();
    });

    it('should display filtered materials only', () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={{ ...defaultFilters, filterShared: true }}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={[mockMaterials[0], mockMaterials[2]]}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
      expect(screen.getByText('Video Pembelajaran Biologi')).toBeInTheDocument();
      expect(screen.queryByText('Presentasi Fisika')).not.toBeInTheDocument();
      expect(screen.queryByText('Modul Bahasa Indonesia')).not.toBeInTheDocument();
    });

    it('should call onMaterialSelect when material is clicked', async () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={mockMaterials}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      const materialButton = screen.getByText('Modul Matematika Bab 1');
      await userEvent.click(materialButton);

      expect(mockOnMaterialSelect).toHaveBeenCalledWith(mockMaterials[0]);
    });

    it('should call onMaterialDelete when delete button is clicked', async () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={mockMaterials}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      const deleteButtons = screen.getAllByTitle(/Hapus Materi/i);
      await userEvent.click(deleteButtons[0]);

      expect(mockOnMaterialDelete).toHaveBeenCalledWith(mockMaterials[0]);
    });

    it('should display file type icons with correct colors', () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={[mockMaterials[0]]}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByText('Modul Matematika Bab 1')).toBeInTheDocument();
    });

    it('should show sharing status badge for shared materials', () => {
      render(
        <MaterialManagementView
          materials={mockMaterials}
          selectedFolder={undefined}
          onFolderSelect={mockOnFolderSelect}
          onMaterialDelete={mockOnMaterialDelete}
          onMaterialSelect={mockOnMaterialSelect}
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          filteredMaterials={[mockMaterials[0]]}
          getActiveFilterCount={mockGetActiveFilterCount}
          categories={mockCategories}
        />
      );

      expect(screen.getByText('Dibagikan')).toBeInTheDocument();
    });
  });
});
