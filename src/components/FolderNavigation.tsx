import React, { useState, useEffect } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UsersIcon } from './icons/UsersIcon';
import { FolderIcon, FolderOpenIcon, ChevronRightIcon, ChevronDownIcon } from './icons/MaterialIcons';
import { MaterialFolder, ELibrary } from '../types';
import { logger } from '../utils/logger';

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

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const mockFolders: MaterialFolder[] = [
        {
          id: 'root',
          name: 'Semua Materi',
          path: '/',
          color: 'blue',
          icon: 'folder',
          isPublic: true,
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          materialCount: materials.length,
          subfolders: []
        },
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
  };

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

  const deleteFolder = async (folderId: string) => {
    if (!window.confirm('Hapus folder ini? Semua materi di dalamnya akan dipindahkan ke root.')) {
      return;
    }

    try {
      // Mock API call - replace with actual implementation
      setFolders(folders.filter(f => f.id !== folderId));
      if (selectedFolderId === folderId) {
        onFolderSelect(undefined);
      }
      onShowToast('Folder berhasil dihapus', 'success');
    } catch (err) {
      logger.error('Error deleting folder:', err);
      onShowToast('Gagal menghapus folder', 'error');
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
        <div key={folder.id} className="select-none">
          <div
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
              isSelected
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => onFolderSelect(folder)}
          >
            {hasSubfolders && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpansion(folder.id);
                }}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
            )}
            
            <div className={`p-1.5 rounded-lg ${folder.isPublic ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
              {isExpanded ? <FolderOpenIcon className="w-4 h-4" /> : <FolderIcon className="w-4 h-4" />}
            </div>
            
            <span className="flex-1 text-sm font-medium">{folder.name}</span>
            
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {materialCount}
            </span>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {folder.isPublic && (
                <div className="p-1 bg-green-100 text-green-600 rounded">
                  <UsersIcon className="w-3 h-3" />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFolder(folder);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <PencilIcon className="w-3 h-3" />
              </button>
              {folder.id !== 'root' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(folder.id);
                  }}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          
          {hasSubfolders && isExpanded && (
            <div className="mt-0.5">
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
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Folder</h3>
        <button
          onClick={() => setShowCreateFolder(true)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <PlusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="space-y-0.5 mb-3">
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
            !selectedFolderId
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => onFolderSelect(undefined)}
        >
          <div className="p-1.5 bg-gray-100 text-gray-600 rounded-lg">
            <FolderIcon className="w-4 h-4" />
          </div>
          <span className="flex-1 text-sm font-medium">Semua Materi</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {materials.length}
          </span>
        </div>
      </div>

      <div className="space-y-0.5">
        {renderFolderTree(folders)}
      </div>

      {showCreateFolder && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buat Folder Baru</h4>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nama folder"
            className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            autoFocus
          />
          <textarea
            value={newFolderDescription}
            onChange={(e) => setNewFolderDescription(e.target.value)}
            placeholder="Deskripsi (opsional)"
            rows={2}
            className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={createFolder}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buat
            </button>
            <button
              onClick={() => {
                setShowCreateFolder(false);
                setNewFolderName('');
                setNewFolderDescription('');
              }}
              className="px-3 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {editingFolder && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Edit Folder</h4>
          <input
            type="text"
            value={editingFolder.name}
            onChange={(e) => setEditingFolder({...editingFolder, name: e.target.value})}
            className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
          <textarea
            value={editingFolder.description || ''}
            onChange={(e) => setEditingFolder({...editingFolder, description: e.target.value})}
            placeholder="Deskripsi"
            rows={2}
            className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={editingFolder.isPublic}
              onChange={(e) => setEditingFolder({...editingFolder, isPublic: e.target.checked})}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
              Folder publik (dapat diakses semua guru)
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => updateFolder(editingFolder)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Simpan
            </button>
            <button
              onClick={() => setEditingFolder(null)}
              className="px-3 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderNavigation;