import React, { useState, useEffect, useCallback } from 'react';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { ClockIcon, TrashIcon, EyeIcon } from './icons/MaterialIcons';
import { MaterialVersion, ELibrary } from '../types';
import { logger } from '../utils/logger';
import { CONVERSION } from '../constants';
import Button from './ui/Button';
import FileInput from './ui/FileInput';
import ConfirmationDialog from './ui/ConfirmationDialog';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Textarea from './ui/Textarea';

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<MaterialVersion | null>(null);
  const [versionToRestore, setVersionToRestore] = useState<MaterialVersion | null>(null);
  const [downloadingVersionId, setDownloadingVersionId] = useState<string | null>(null);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);
  const [deletingVersionId, setDeletingVersionId] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
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
  }, [material]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const createVersion = async () => {
    if (!newFile || !versionTitle.trim() || !changeLog.trim()) {
      onShowToast('Lengkapi semua field yang diperlukan', 'error');
      return;
    }

    setLoading(true);
    try {
      // Mock file upload - replace with actual implementation
      const versionId = `v${Date.now()}`;
      const newVersion: MaterialVersion = {
        id: versionId,
        materialId: material.id,
        version: generateNextVersion(),
        title: versionTitle.trim(),
        description: material.description,
        fileUrl: `versions/${versionId}/${newFile.name}`,
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
    setDownloadingVersionId(version.id);
    try {
      // Mock download - replace with actual implementation
      const downloadUrl = `/api/download/version/${version.id}`;
      window.open(downloadUrl, '_blank');
      onShowToast(`Mengunduh versi ${version.version}...`, 'success');
    } catch (err) {
      logger.error('Error downloading version:', err);
      onShowToast('Gagal mengunduh versi', 'error');
    } finally {
      setDownloadingVersionId(null);
    }
  };

  const restoreVersion = (version: MaterialVersion) => {
    setVersionToRestore(version);
    setIsRestoreDialogOpen(true);
  };

const deleteVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    setVersionToDelete(version || null);
    setIsDeleteDialogOpen(true);
  };

  const confirmRestoreVersion = async () => {
    if (!versionToRestore) return;

    setRestoringVersionId(versionToRestore.id);
    try {
      const updatedVersions = versions.map(v => ({
        ...v,
        isActive: v.id === versionToRestore.id
      }));

      setVersions(updatedVersions);
      onShowToast(`Versi ${versionToRestore.version} berhasil diaktifkan kembali`, 'success');
      onVersionUpdate?.();
    } catch (err) {
      logger.error('Error restoring version:', err);
      onShowToast('Gagal mengaktifkan kembali versi', 'error');
    } finally {
      setIsRestoreDialogOpen(false);
      setVersionToRestore(null);
      setRestoringVersionId(null);
    }
  };

  const confirmDeleteVersion = async () => {
    if (!versionToDelete) return;

    setDeletingVersionId(versionToDelete.id);
    try {
      const updatedVersions = versions.filter(v => v.id !== versionToDelete.id);
      setVersions(updatedVersions);
      onShowToast('Versi berhasil dihapus', 'success');
      onVersionUpdate?.();
    } catch (err) {
      logger.error('Error deleting version:', err);
      onShowToast('Gagal menghapus versi', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setVersionToDelete(null);
      setDeletingVersionId(null);
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
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(CONVERSION.BYTES_PER_KB));
    return Math.round((bytes / Math.pow(CONVERSION.BYTES_PER_KB, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const activeVersion = versions.find(v => v.isActive);
  const versionCount = versions.length;

  return (
    <div className="version-control">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            icon={<ClockIcon className="w-4 h-4" />}
          >
            Versi {activeVersion?.version || 'N/A'}
          </Button>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {versionCount} versi
          </span>
        </div>

        <Button
          variant="info"
          size="sm"
          onClick={() => setShowCreateVersion(true)}
          icon={<ArrowPathIcon className="w-4 h-4" />}
        >
          Versi Baru
        </Button>
      </div>

      {/* Version History */}
      {showVersionHistory && (
        <div className="mt-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-600">
            <h4 className="font-medium text-neutral-900 dark:text-white">Riwayat Versi</h4>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-600">
            {versions.map((version) => (
              <div key={version.id} className="p-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-neutral-900 dark:text-white">
                        Versi {version.version}
                      </span>
                      {version.isActive && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 text-xs rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-1">
                      {version.title}
                    </p>
                    
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                      <p>📝 {version.changeLog}</p>
                      <p>👤 {version.createdBy}</p>
                      <p>📅 {formatDate(version.createdAt)}</p>
                      <p>📁 {formatFileSize(version.fileSize)} • {version.fileType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadVersion(version)}
                      isLoading={downloadingVersionId === version.id}
                      iconOnly
                      icon={<EyeIcon className="w-4 h-4" />}
                      aria-label="Unduh versi ini"
                      disabled={downloadingVersionId === version.id}
                    />

                    {!version.isActive && (
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => restoreVersion(version)}
                        iconOnly
                        icon={<ArrowPathIcon className="w-4 h-4" />}
                        aria-label="Aktifkan kembali versi ini"
                        disabled={restoringVersionId === version.id}
                        isLoading={restoringVersionId === version.id}
                      />
                    )}

                    {versions.length > 1 && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteVersion(version.id)}
                        iconOnly
                        icon={<TrashIcon className="w-4 h-4" />}
                        aria-label="Hapus versi ini"
                        disabled={deletingVersionId === version.id}
                        isLoading={deletingVersionId === version.id}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Version Modal */}
      <Modal
        isOpen={showCreateVersion}
        onClose={() => setShowCreateVersion(false)}
        title="Buat Versi Baru"
        description={`Buat versi baru untuk "${material.title}"`}
        size="lg"
        showCloseButton
      >
        <div className="space-y-4">
          <div>
            <Input
              id="version-input"
              label="Versi"
              value={generateNextVersion()}
              disabled
              fullWidth
              size="md"
            />
          </div>

          <div>
            <Input
              id="version-title"
              label="Judul Versi"
              value={versionTitle}
              onChange={(e) => setVersionTitle(e.target.value)}
              placeholder="Mis: Update materi bab 3"
              fullWidth
              size="md"
            />
          </div>

          <div>
            <Textarea
              id="version-changelog"
              label="Catatan Perubahan"
              value={changeLog}
              onChange={(e) => setChangeLog(e.target.value)}
              placeholder="Jelaskan perubahan yang dilakukan pada versi ini..."
              rows={3}
              fullWidth
              size="md"
              autoResize
            />
          </div>

          <FileInput
            label="File Baru"
            onChange={(e) => setNewFile(e.target.files?.[0] || null)}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.jpg,.jpeg,.png"
            helperText={newFile ? `${newFile.name} • ${formatFileSize(newFile.size)}` : undefined}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            variant="secondary"
            onClick={() => setShowCreateVersion(false)}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={createVersion}
            disabled={!newFile || !versionTitle.trim() || !changeLog.trim()}
            isLoading={loading}
          >
            {loading ? 'Membuat...' : 'Buat Versi'}
          </Button>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Hapus Versi"
        message="Hapus versi ini? Tindakan tidak dapat dibatalkan."
        type="danger"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDeleteVersion}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setVersionToDelete(null);
        }}
      />

      <ConfirmationDialog
        isOpen={isRestoreDialogOpen}
        title="Aktifkan Kembali Versi"
        message={`Aktifkan kembali versi ${versionToRestore?.version}? Versi aktif saat ini akan dinonaktifkan.`}
        type="warning"
        confirmText="Aktifkan"
        cancelText="Batal"
        onConfirm={confirmRestoreVersion}
        onCancel={() => {
          setIsRestoreDialogOpen(false);
          setVersionToRestore(null);
        }}
      />
    </div>
  );
};

export default VersionControl;