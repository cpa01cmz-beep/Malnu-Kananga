import React, { useState, useEffect } from 'react';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { ClockIcon, TrashIcon, XMarkIcon, EyeIcon } from './icons/MaterialIcons';
import { MaterialVersion, ELibrary } from '../types';
import { logger } from '../utils/logger';

interface VersionControlProps {
  material: ELibrary;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onVersionUpdate?: () => void;
}

const VersionControl: React.FC<VersionControlProps> = ({
  material,
  onShowToast,
  onVersionUpdate
}) => {
  const [versions, setVersions] = useState<MaterialVersion[]>([]);
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [versionTitle, setVersionTitle] = useState('');
  const [changeLog, setChangeLog] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [material.id, fetchVersions]);

  const fetchVersions = async () => {
    try {
      // Mock API call - replace with actual implementation
      const mockVersions: MaterialVersion[] = material.versions || [
        {
          id: 'v1',
          materialId: material.id,
          version: '1.0',
          title: material.title,
          description: material.description,
          fileUrl: material.fileUrl,
          fileType: material.fileType,
          fileSize: material.fileSize,
          changeLog: 'Versi awal materi',
          createdBy: material.uploadedBy,
          createdAt: material.uploadedAt,
          isActive: true,
        }
      ];
      setVersions(mockVersions);
    } catch (err) {
      logger.error('Error fetching versions:', err);
    }
  };

  const createVersion = async () => {
    if (!newFile || !versionTitle.trim() || !changeLog.trim()) {
      onShowToast('Lengkapi semua field yang diperlukan', 'error');
      return;
    }

    setLoading(true);
    try {
      // Mock file upload - replace with actual implementation
      const newVersion: MaterialVersion = {
        id: `v${Date.now()}`,
        materialId: material.id,
        version: generateNextVersion(),
        title: versionTitle.trim(),
        description: material.description,
        fileUrl: `versions/${newVersion.id}/${newFile.name}`,
        fileType: newFile.type,
        fileSize: newFile.size,
        changeLog: changeLog.trim(),
        createdBy: 'current-user', // Replace with actual user
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      // Update existing versions to inactive
      const updatedVersions = versions.map(v => ({
        ...v,
        isActive: false
      }));

      setVersions([newVersion, ...updatedVersions]);
      setVersionTitle('');
      setChangeLog('');
      setNewFile(null);
      setShowCreateVersion(false);
      onShowToast('Versi baru berhasil dibuat', 'success');
      onVersionUpdate?.();
    } catch (err) {
      logger.error('Error creating version:', err);
      onShowToast('Gagal membuat versi baru', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateNextVersion = (): string => {
    if (versions.length === 0) return '1.0';
    
    const activeVersions = versions.filter(v => v.isActive);
    if (activeVersions.length === 0) return '1.0';
    
    const latestVersion = activeVersions[0];
    const [major, minor] = latestVersion.version.split('.').map(Number);
    return `${major}.${minor + 1}`;
  };

  const downloadVersion = async (version: MaterialVersion) => {
    try {
      // Mock download - replace with actual implementation
      const downloadUrl = `/api/download/version/${version.id}`;
      window.open(downloadUrl, '_blank');
      onShowToast(`Mengunduh versi ${version.version}...`, 'success');
    } catch (err) {
      logger.error('Error downloading version:', err);
      onShowToast('Gagal mengunduh versi', 'error');
    }
  };

  const restoreVersion = async (version: MaterialVersion) => {
    if (!window.confirm(`Aktifkan kembali versi ${version.version}? Versi aktif saat ini akan dinonaktifkan.`)) {
      return;
    }

    try {
      // Mock restore - replace with actual implementation
      const updatedVersions = versions.map(v => ({
        ...v,
        isActive: v.id === version.id
      }));
      
      setVersions(updatedVersions);
      onShowToast(`Versi ${version.version} berhasil diaktifkan kembali`, 'success');
      onVersionUpdate?.();
    } catch (err) {
      logger.error('Error restoring version:', err);
      onShowToast('Gagal mengaktifkan kembali versi', 'error');
    }
  };

  const deleteVersion = async (versionId: string) => {
    if (!window.confirm('Hapus versi ini? Tindakan tidak dapat dibatalkan.')) {
      return;
    }

    try {
      // Mock delete - replace with actual implementation
      const updatedVersions = versions.filter(v => v.id !== versionId);
      setVersions(updatedVersions);
      onShowToast('Versi berhasil dihapus', 'success');
    } catch (err) {
      logger.error('Error deleting version:', err);
      onShowToast('Gagal menghapus versi', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const activeVersion = versions.find(v => v.isActive);
  const versionCount = versions.length;

  return (
    <div className="version-control">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ClockIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              Versi {activeVersion?.version || 'N/A'}
            </span>
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {versionCount} versi
          </span>
        </div>
        
        <button
          onClick={() => setShowCreateVersion(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Versi Baru</span>
        </button>
      </div>

      {/* Version History */}
      {showVersionHistory && (
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="p-4 border-b border-gray-200 dark:border-gray-600">
            <h4 className="font-medium text-gray-900 dark:text-white">Riwayat Versi</h4>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {versions.map((version) => (
              <div key={version.id} className="p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Versi {version.version}
                      </span>
                      {version.isActive && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 text-xs rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      {version.title}
                    </p>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p>📝 {changeLog}</p>
                      <p>👤 {version.createdBy}</p>
                      <p>📅 {formatDate(version.createdAt)}</p>
                      <p>📁 {formatFileSize(version.fileSize)} • {version.fileType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => downloadVersion(version)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                      title="Unduh versi ini"
                    >
                      <EyeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    
                    {!version.isActive && (
                      <button
                        onClick={() => restoreVersion(version)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
                        title="Aktifkan kembali versi ini"
                      >
                        <ArrowPathIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </button>
                    )}
                    
                    {versions.length > 1 && (
                      <button
                        onClick={() => deleteVersion(version.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                        title="Hapus versi ini"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Version Modal */}
      {showCreateVersion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Buat Versi Baru
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    "{material.title}"
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateVersion(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Versi
                </label>
                <input
                  type="text"
                  value={generateNextVersion()}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Judul Versi
                </label>
                <input
                  type="text"
                  value={versionTitle}
                  onChange={(e) => setVersionTitle(e.target.value)}
                  placeholder="Mis: Update materi bab 3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catatan Perubahan
                </label>
                <textarea
                  value={changeLog}
                  onChange={(e) => setChangeLog(e.target.value)}
                  placeholder="Jelaskan perubahan yang dilakukan pada versi ini..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File Baru
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {newFile && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {newFile.name} • {formatFileSize(newFile.size)}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateVersion(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={createVersion}
                disabled={!newFile || !versionTitle.trim() || !changeLog.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Membuat...' : 'Buat Versi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionControl;