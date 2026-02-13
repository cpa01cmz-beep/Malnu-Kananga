import React, { useEffect, useCallback } from 'react';
import { ELibrary as ELibraryType, MaterialFolder } from '../../types';
import FolderNavigation from '../FolderNavigation';
import { HEIGHT_CLASSES } from '../../config/heights';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import FilterPill from '../ui/FilterPill';
import { EmptyState } from '../ui/LoadingState';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import { ShareIcon } from '../icons/MaterialIcons';

interface MaterialManagementViewProps {
  materials: ELibraryType[];
  selectedFolder?: MaterialFolder;
  onFolderSelect: (folder: MaterialFolder | undefined) => void;
  onMaterialDelete: (material: ELibraryType) => void;
  onMaterialSelect: (material: ELibraryType) => void;

  filters: {
    searchQuery: string;
    filterCategory: string;
    filterFileType: string;
    filterShared: boolean | null;
  };
  onFilterChange: (filters: {
    searchQuery: string;
    filterCategory: string;
    filterFileType: string;
    filterShared: boolean | null;
  }) => void;
  onClearFilters: () => void;
  filteredMaterials: ELibraryType[];
  getActiveFilterCount: () => number;
  categories: string[];
}

export function MaterialManagementView({
  materials,
  selectedFolder,
  onFolderSelect,
  onMaterialDelete,
  onMaterialSelect,

  filters,
  onFilterChange,
  onClearFilters,
  filteredMaterials,
  getActiveFilterCount,
  categories,
}: MaterialManagementViewProps) {
  const getFileIcon = (fileType: string): string => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('doc') || type.includes('word')) return 'DOCX';
    if (type.includes('ppt') || type.includes('presentation')) return 'PPT';
    if (type.includes('video') || type.includes('mp4')) return 'VIDEO';
    return 'PDF';
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Global keyboard shortcut to clear all filters (Ctrl+Shift+X)
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'x') {
      e.preventDefault();
      if (getActiveFilterCount() > 0) {
        onClearFilters();
      }
    }
  }, [getActiveFilterCount, onClearFilters]);

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <FolderNavigation
          selectedFolderId={selectedFolder?.id}
          onFolderSelect={onFolderSelect}
          onShowToast={() => {}}
          materials={materials}
        />
      </div>

      <div className="lg:col-span-3">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Filter Pencarian</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="material-search"
              name="search"
              label="Cari Materi"
              placeholder="Cari berdasarkan judul, deskripsi, atau kategori..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              fullWidth
              autoComplete="off"
            />

            <Select
              id="material-category-filter"
              name="category-filter"
              label="Kategori"
              value={filters.filterCategory}
              onChange={(e) => onFilterChange({ ...filters, filterCategory: e.target.value })}
              options={[
                { value: 'all', label: 'Semua Kategori' },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
            />

            <Select
              id="material-filetype-filter"
              name="filetype-filter"
              label="Tipe File"
              value={filters.filterFileType}
              onChange={(e) => onFilterChange({ ...filters, filterFileType: e.target.value })}
              options={[
                { value: 'all', label: 'Semua Tipe' },
                { value: 'PDF', label: 'PDF' },
                { value: 'DOCX', label: 'DOCX' },
                { value: 'PPT', label: 'PPT' },
                { value: 'VIDEO', label: 'Video' }
              ]}
            />

            <div className="flex gap-2 mt-6">
              <Button
                size="sm"
                variant={filters.filterShared === true ? 'green-solid' : 'ghost'}
                onClick={() => onFilterChange({ ...filters, filterShared: filters.filterShared === true ? null : true })}
                className="flex-1"
              >
                Dibagikan
              </Button>
              <Button
                size="sm"
                variant={filters.filterShared === false ? 'blue-solid' : 'ghost'}
                onClick={() => onFilterChange({ ...filters, filterShared: filters.filterShared === false ? null : false })}
                className="flex-1"
              >
                Privat
              </Button>
            </div>
          </div>

          {getActiveFilterCount() > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onClearFilters}
                shortcut="Ctrl+Shift+X"
              >
                Hapus Semua Filter
              </Button>
              <div className="flex flex-wrap gap-1">
                {filters.searchQuery.trim() && (
                  <FilterPill
                    label="pencarian"
                    value={`Search: ${filters.searchQuery.slice(0, 15)}${filters.searchQuery.length > 15 ? '...' : ''}`}
                    onClear={() => onFilterChange({ ...filters, searchQuery: '' })}
                    variant="blue"
                    shortcut="Delete"
                  />
                )}
                {filters.filterCategory !== 'all' && (
                  <FilterPill
                    label="kategori"
                    value={filters.filterCategory}
                    onClear={() => onFilterChange({ ...filters, filterCategory: 'all' })}
                    variant="green"
                    shortcut="Delete"
                  />
                )}
                {filters.filterFileType !== 'all' && (
                  <FilterPill
                    label="tipe file"
                    value={filters.filterFileType}
                    onClear={() => onFilterChange({ ...filters, filterFileType: 'all' })}
                    variant="purple"
                    shortcut="Delete"
                  />
                )}
                {filters.filterShared !== null && (
                  <FilterPill
                    label="status berbagi"
                    value={filters.filterShared ? 'Dibagikan' : 'Privat'}
                    onClear={() => onFilterChange({ ...filters, filterShared: null })}
                    variant="orange"
                    shortcut="Delete"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className={`divide-y divide-neutral-100 dark:divide-neutral-700 ${HEIGHT_CLASSES.MATERIAL.LIST} overflow-y-auto mt-6`}>
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((item) => (
              <div key={item.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        getFileIcon(item.fileType) === 'PDF'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
                          : getFileIcon(item.fileType) === 'DOCX'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'
                          : getFileIcon(item.fileType) === 'PPT'
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20'
                          : 'bg-purple-100 text-purple-600 dark:bg-purple-900/20'
                      }`}
                    >
                      <DocumentTextIcon />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-neutral-900 dark:text-white mb-1">
                        <button
                          onClick={() => onMaterialSelect(item)}
                          className="font-semibold text-left w-full text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                          title={`Lihat detail ${item.title}`}
                        >
                          {item.title}
                        </button>
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded">{item.category}</span>
                        <span>•</span>
                        <span>{formatFileSize(item.fileSize)}</span>
                        <span>•</span>
                        <span>{new Date(item.uploadedAt).toLocaleDateString('id-ID')}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        {item.isShared && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-300 rounded">
                            <ShareIcon className="w-3 h-3 inline mr-1" />
                            Dibagikan
                          </span>
                        )}
                        {item.currentVersion && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 rounded">
                            v{item.currentVersion}
                          </span>
                        )}
                        {item.analytics && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            👁️ {item.analytics.totalDownloads}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => onMaterialSelect(item)}
                      className="p-2 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                      title="Kelola materi"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onMaterialDelete(item)}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      title="Hapus Materi"
                      aria-label="Hapus Materi"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8">
              <EmptyState
                message={getActiveFilterCount() > 0
                  ? 'Tidak ada materi yang cocok dengan filter yang dipilih.'
                  : selectedFolder
                    ? `Belum ada materi di folder "${selectedFolder.name}".`
                    : 'Belum ada materi yang diunggah.'
                }
                icon={<DocumentTextIcon />}
                size="md"
                suggestedActions={getActiveFilterCount() > 0 ? [
                  {
                    label: 'Hapus Filter',
                    onClick: onClearFilters,
                    variant: 'primary',
                  },
                  {
                    label: 'Lihat Semua Folder',
                    onClick: () => onFolderSelect(undefined),
                    variant: 'secondary',
                  }
                ] : selectedFolder ? [
                  {
                    label: 'Lihat Semua Folder',
                    onClick: () => onFolderSelect(undefined),
                    variant: 'primary',
                  }
                ] : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
