import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UsersIcon } from './icons/UsersIcon';
import { FolderIcon, FolderOpenIcon, ChevronRightIcon, ChevronDownIcon } from './icons/MaterialIcons';
import { MaterialFolder, ELibrary } from '../types';
import { logger } from '../utils/logger';
import Button from './ui/Button';
import SmallActionButton from './ui/SmallActionButton';
import ConfirmationDialog from './ui/ConfirmationDialog';

interface FolderNavigationProps {
  selectedFolderId?: string;
  onFolderSelect: (folder?: MaterialFolder) => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  materials: ELibrary[];
}

const FolderNavigation: React.FC<FolderNavigationProps> = ({
  selectedFolderId,
  onFolderSelect,
  onShowToast,
  materials
}) => {
  const [folders, setFolders] = useState<MaterialFolder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [editingFolder, setEditingFolder] = useState<MaterialFolder | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<MaterialFolder | null>(null);

  const getPaddingLeftClass = (level: number): string => {
    const paddingClasses: Record<number, string> = {
      0: 'pl-2',
      1: 'pl-6',
      2: 'pl-10',
      3: 'pl-14',
      4: 'pl-18',
      5: 'pl-22'
    };
    return paddingClasses[level] || `pl-[${level * 16 + 8}px]`;
  };

   const fetchFolders = useCallback(async () => {
    setLoading(true);
    try {
      const mockFolders: MaterialFolder[] = [
        {
          id: 'math',
          name: 'Matematika',
          path: '/matematika',
          description: 'Materi pembelajaran matematika',
          color: 'green',
          icon: 'calculator',
          isPublic: true,
          createdBy: 'teacher1',
          createdAt: new Date().toISOString(),
          materialCount: materials.filter(m => m.category === 'Matematika').length,
          subfolders: [
            {
              id: 'math-basic',
              name: 'Dasar',
              path: '/matematika/dasar',
              color: 'light-green',
              icon: 'book',
              isPublic: true,
              createdBy: 'teacher1',
              createdAt: new Date().toISOString(),
              materialCount: 5,
              subfolders: []
            }
          ]
        },
        {
          id: 'science',
          name: 'IPA',
          path: '/ipa',
          description: 'Materi Ilmu Pengetahuan Alam',
          color: 'purple',
          icon: 'flask',
          isPublic: true,
          createdBy: 'teacher2',
          createdAt: new Date().toISOString(),
          materialCount: materials.filter(m => m.category === 'IPA').length,
          subfolders: []
        }
      ];
      setFolders(mockFolders);
    } catch (err) {
      logger.error('Error fetching folders:', err);
      onShowToast('Gagal memuat folder', 'error');
    } finally {
      setLoading(false);
    }
  }, [materials, onShowToast]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders, onShowToast]);

  const toggleFolderExpansion = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      onShowToast('Nama folder tidak boleh kosong', 'error');
      return;
    }

    try {
      const newFolder: MaterialFolder = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        path: `/${newFolderName.trim().toLowerCase().replace(/\s+/g, '-')}`,
        description: newFolderDescription.trim() || undefined,
        color: 'blue',
        icon: 'folder',
        isPublic: true,
        createdBy: 'current-user', // Replace with actual user
        createdAt: new Date().toISOString(),
        materialCount: 0,
        subfolders: []
      };

      // Mock API call - replace with actual implementation
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setNewFolderDescription('');
      setShowCreateFolder(false);
      onShowToast('Folder berhasil dibuat', 'success');
    } catch (err) {
      logger.error('Error creating folder:', err);
      onShowToast('Gagal membuat folder', 'error');
    }
  };

  const deleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    setFolderToDelete(folder || null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      setFolders(folders.filter(f => f.id !== folderToDelete.id));
      if (selectedFolderId === folderToDelete.id) {
        onFolderSelect(undefined);
      }
      onShowToast('Folder berhasil dihapus', 'success');
    } catch (err) {
      logger.error('Error deleting folder:', err);
      onShowToast('Gagal menghapus folder', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setFolderToDelete(null);
    }
  };

  const updateFolder = async (folder: MaterialFolder) => {
    try {
      // Mock API call - replace with actual implementation
      const updatedFolders = folders.map(f => 
        f.id === folder.id ? { ...folder } : f
      );
      setFolders(updatedFolders);
      setEditingFolder(null);
      onShowToast('Folder berhasil diperbarui', 'success');
    } catch (err) {
      logger.error('Error updating folder:', err);
      onShowToast('Gagal memperbarui folder', 'error');
    }
  };

  const getMaterialCount = (folder: MaterialFolder): number => {
    const directMaterials = materials.filter(m => m.folderId === folder.id).length;
    const subfolderMaterials = folder.subfolders.reduce((acc, subfolder) => acc + getMaterialCount(subfolder), 0);
    return directMaterials + subfolderMaterials;
  };

  const renderFolderTree = (folderList: MaterialFolder[], level = 0) => {
    return folderList.map((folder) => {
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = selectedFolderId === folder.id;
      const hasSubfolders = folder.subfolders.length > 0;
      const materialCount = getMaterialCount(folder);

      return (
        <div key={folder.id} className="select-none" role="group" aria-label={`Folder ${folder.name}, ${materialCount} materi`}>
          <div
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors w-full ${
              isSelected
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
            } ${getPaddingLeftClass(level)}`}
          >
            {hasSubfolders && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpansion(folder.id);
                }}
                aria-label={isExpanded ? `Tutup folder ${folder.name}` : `Buka folder ${folder.name}`}
                aria-expanded={isExpanded}
                aria-controls={`folder-${folder.id}-subfolders`}
                className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              onClick={() => onFolderSelect(folder)}
              className={`flex items-center gap-2 flex-1 px-2 py-1.5 -mx-2 rounded-lg transition-colors text-left ${
                isSelected
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
              }`}
              aria-pressed={isSelected}
              aria-label={`${folder.name}, ${materialCount} materi`}
            >
              <div className={`p-1.5 rounded-lg ${folder.isPublic ? 'bg-blue-50 text-blue-600' : 'bg-neutral-50 text-neutral-600'}`}>
                {isExpanded ? <FolderOpenIcon className="w-4 h-4" /> : <FolderIcon className="w-4 h-4" />}
              </div>

              <span className="flex-1 text-sm font-medium">{folder.name}</span>

              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {materialCount}
              </span>
            </button>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {folder.isPublic && (
                <div className="p-1 bg-green-100 text-green-600 rounded" aria-hidden="true">
                  <UsersIcon className="w-3 h-3" />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFolder(folder);
                }}
                aria-label={`Edit folder ${folder.name}`}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <PencilIcon className="w-3 h-3" />
              </button>
              {folder.id !== 'root' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(folder.id);
                  }}
                  aria-label={`Hapus folder ${folder.name}`}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {hasSubfolders && isExpanded && (
            <div id={`folder-${folder.id}-subfolders`} className="mt-0.5" role="group">
              {renderFolderTree(folder.subfolders, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Folder</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreateFolder(true)}
          aria-label="Buat folder baru"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          icon={<PlusIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />}
        />
      </div>

      <div className="space-y-0.5 mb-3" role="group" aria-label={`Semua Materi, ${materials.length} materi`}>
        <button
          onClick={() => onFolderSelect(undefined)}
          aria-pressed={!selectedFolderId}
          aria-label={`Semua Materi, ${materials.length} materi`}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors w-full text-left ${
            !selectedFolderId
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
          }`}
        >
          <div className="p-1.5 bg-neutral-100 text-neutral-600 rounded-lg">
            <FolderIcon className="w-4 h-4" />
          </div>
          <span className="flex-1 text-sm font-medium">Semua Materi</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {materials.length}
          </span>
        </button>
      </div>

      <div className="space-y-0.5">
        {renderFolderTree(folders)}
      </div>

      {showCreateFolder && (
        <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-600">
          <h4 id="create-folder-heading" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Buat Folder Baru</h4>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nama folder"
            aria-labelledby="create-folder-heading"
            className="w-full px-3 py-2 mb-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            autoFocus
          />
          <textarea
            value={newFolderDescription}
            onChange={(e) => setNewFolderDescription(e.target.value)}
            placeholder="Deskripsi (opsional)"
            aria-labelledby="create-folder-heading"
            rows={2}
            className="w-full px-3 py-2 mb-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
          <div className="flex gap-2">
            <Button
              variant="blue-solid"
              size="sm"
              onClick={createFolder}
            >
              Buat
            </Button>
              <SmallActionButton
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                  setNewFolderDescription('');
                }}
                variant="neutral"
              >
                Batal
              </SmallActionButton>
          </div>
        </div>
      )}

      {editingFolder && (
        <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-600">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Edit Folder</h4>
          <input
            type="text"
            value={editingFolder.name}
            onChange={(e) => setEditingFolder({...editingFolder, name: e.target.value})}
            className="w-full px-3 py-2 mb-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
          <textarea
            value={editingFolder.description || ''}
            onChange={(e) => setEditingFolder({...editingFolder, description: e.target.value})}
            placeholder="Deskripsi"
            rows={2}
            className="w-full px-3 py-2 mb-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={editingFolder.isPublic}
              onChange={(e) => setEditingFolder({...editingFolder, isPublic: e.target.checked})}
              className="rounded border-neutral-300 dark:border-neutral-600"
            />
            <label htmlFor="isPublic" className="text-sm text-neutral-700 dark:text-neutral-300">
              Folder publik (dapat diakses semua guru)
            </label>
          </div>
          <div className="flex gap-2">
            <SmallActionButton
              onClick={() => updateFolder(editingFolder)}
              variant="primary"
              fullWidth
            >
              Simpan
            </SmallActionButton>
            <SmallActionButton
              onClick={() => setEditingFolder(null)}
              variant="neutral"
              fullWidth
            >
              Batal
            </SmallActionButton>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Hapus Folder"
        message="Hapus folder ini? Semua materi di dalamnya akan dipindahkan ke root."
        type="warning"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDeleteFolder}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setFolderToDelete(null);
        }}
      />
    </div>
  );
};

export default FolderNavigation;