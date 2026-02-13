import React, { useState, useEffect, useCallback } from 'react';
import { UsersIcon } from './icons/UsersIcon';
import { ShareIcon, ShieldIcon, XMarkIcon } from './icons/MaterialIcons';
import { MaterialSharing, ELibrary } from '../types';
import { logger } from '../utils/logger';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import Modal from './ui/Modal';
import SearchInput from './ui/SearchInput';
import ConfirmationDialog from './ui/ConfirmationDialog';
import { HEIGHT_CLASSES } from '../config/heights';
import { UI_STRINGS, msToDays } from '../constants';

interface MaterialSharingProps {
  material: ELibrary;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onSharingUpdate?: () => void;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
}

const MaterialSharingComponent: React.FC<MaterialSharingProps> = ({
  material,
  onShowToast,
  onSharingUpdate
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharing, setSharing] = useState<MaterialSharing[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [permission, setPermission] = useState<'view' | 'edit' | 'admin'>('view');
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sharingToDelete, setSharingToDelete] = useState<MaterialSharing | null>(null);
  const [teachersToRevoke, setTeachersToRevoke] = useState<Teacher[]>([]);

  const fetchSharing = useCallback(async () => {
    try {
      // Mock API call - replace with actual implementation
      const mockSharing: MaterialSharing[] = material.isShared ? [
        {
          id: 'share1',
          materialId: material.id,
          sharedWith: ['teacher2', 'teacher3'],
          sharedBy: material.uploadedBy,
          permission: 'view',
          sharedAt: new Date().toISOString(),
          isPublic: false,
        }
      ] : [];
      setSharing(mockSharing);
    } catch (err) {
      logger.error('Error fetching sharing:', err);
    }
  }, [material]);

  const fetchTeachers = useCallback(async () => {
    try {
      // Mock API call - replace with actual implementation
      const mockTeachers: Teacher[] = [
        { id: 'teacher1', name: 'Ahmad Wijaya', email: 'ahmad@school.com', subjects: ['Matematika', 'Fisika'] },
        { id: 'teacher2', name: 'Siti Nurhaliza', email: 'siti@school.com', subjects: ['Bahasa Indonesia', 'Sastra'] },
        { id: 'teacher3', name: 'Budi Santoso', email: 'budi@school.com', subjects: ['IPA', 'Biologi'] },
        { id: 'teacher4', name: 'Dewi Lestari', email: 'dewi@school.com', subjects: ['IPS', 'Sejarah'] },
        { id: 'teacher5', name: 'Eko Prasetyo', email: 'eko@school.com', subjects: ['Bahasa Inggris', 'Seni'] },
      ];
      
      // Filter out current user
      const filteredTeachers = mockTeachers.filter(t => t.id !== material.uploadedBy);
      setTeachers(filteredTeachers);
    } catch (err) {
      logger.error('Error fetching teachers:', err);
    }
  }, [material.uploadedBy]);

  useEffect(() => {
    fetchSharing();
    fetchTeachers();
  }, [fetchSharing, fetchTeachers, material.uploadedBy]);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const isNotOwner = teacher.id !== material.uploadedBy;
    const isNotAlreadyShared = !sharing.some(s => s.sharedWith.includes(teacher.id));
    return matchesSearch && isNotOwner && isNotAlreadyShared;
  });

  const handleShare = async () => {
    if (selectedTeachers.length === 0) {
      onShowToast('Pilih minimal satu guru untuk berbagi', 'error');
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const newSharing: MaterialSharing = {
        id: `share-${Date.now()}`,
        materialId: material.id,
        sharedWith: selectedTeachers,
        sharedBy: material.uploadedBy,
        permission,
        sharedAt: new Date().toISOString(),
        expiresAt: expirationEnabled ? expirationDate : undefined,
        isPublic: false,
      };

      setSharing([...sharing, newSharing]);
      setSelectedTeachers([]);
      setShowShareModal(false);
      onShowToast(`Materi berhasil dibagikan ke ${selectedTeachers.length} guru`, 'success');
      onSharingUpdate?.();
    } catch (err) {
      logger.error('Error sharing material:', err);
      onShowToast('Gagal membagikan materi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = (sharingId: string, teacherIds: string[]) => {
    const sharingItem = sharing.find(s => s.id === sharingId);
const teachersToRevokeList = teachers.filter(t => teacherIds.includes(t.id));
    setSharingToDelete(sharingItem || null);
    setTeachersToRevoke(teachersToRevokeList);
    setIsDeleteDialogOpen(true);
  };

  const confirmRevoke = async () => {
    if (!sharingToDelete) return;

    try {
      setSharing(sharing.filter(s => s.id !== sharingToDelete!.id));
      onShowToast('Akses materi berhasil dicabut', 'success');
      onSharingUpdate?.();
    } catch (err) {
      logger.error('Error revoking sharing:', err);
      onShowToast('Gagal mencabut akses', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setSharingToDelete(null);
      setTeachersToRevoke([]);
    }
  };

  const getPermissionIcon = (perm: 'admin' | 'edit' | 'view') => {
    switch (perm) {
      case 'admin':
        return <ShieldIcon className="w-4 h-4 text-red-500" />;
      case 'edit':
        return <UsersIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <ShareIcon className="w-4 h-4 text-green-500" />;
    }
  };

  const getPermissionLabel = (perm: 'admin' | 'edit' | 'view') => {
    switch (perm) {
      case 'admin':
        return 'Admin';
      case 'edit':
        return 'Edit';
      default:
        return 'Lihat';
    }
  };

  const getExpirationDays = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const days = Math.ceil(msToDays(new Date(expiresAt).getTime() - new Date().getTime()));
    return days;
  };

  const isShared = sharing.length > 0 || material.isShared;

  return (
    <div className="material-sharing">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowShareModal(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            isShared 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
          }`}
        >
          <ShareIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isShared ? 'Dibagikan' : 'Bagikan'}
          </span>
        </button>
        
        {isShared && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {sharing.reduce((acc, s) => acc + s.sharedWith.length, 0)} guru
          </span>
        )}
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        size="xl"
        className={`${HEIGHT_CLASSES.MODAL.FULL} flex flex-col`}
        showCloseButton={false}
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Bagikan Materi
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                "{material.title}"
              </p>
            </div>
            <IconButton
              onClick={() => setShowShareModal(false)}
              icon={<XMarkIcon className="w-5 h-5" />}
              variant="ghost"
              ariaLabel="Tutup modal bagikan"
              tooltip="Tutup"
              shortcut="Esc"
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {/* Current Sharing */}
          {sharing.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Sedang Dibagikan</h4>
              <div className="space-y-2">
                {sharing.map((share) => (
                  <div key={share.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getPermissionIcon(share.permission)}
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {getPermissionLabel(share.permission)} - {share.sharedWith.length} guru
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Dibagikan {new Date(share.sharedAt).toLocaleDateString('id-ID')}
                          {share.expiresAt && (
                            <span> • Berakhir dalam {getExpirationDays(share.expiresAt)} hari</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <IconButton
                      onClick={() => handleRevoke(share.id, share.sharedWith)}
                      icon={<XMarkIcon className="w-4 h-4" />}
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                      ariaLabel="Batasi akses"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share Form */}
          <div>
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Bagikan ke Guru</h4>

            {/* Search */}
            <div className="mb-4">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari guru berdasarkan nama, email, atau mata pelajaran..."
                size="sm"
                fullWidth
              />
            </div>

            {/* Teacher Selection */}
            <div className="mb-4 max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-600 rounded-lg">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <label
                    key={teacher.id}
                    className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer border-b border-neutral-100 dark:border-neutral-600 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(teacher.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTeachers([...selectedTeachers, teacher.id]);
                        } else {
                          setSelectedTeachers(selectedTeachers.filter(id => id !== teacher.id));
                        }
                      }}
                      className="rounded border-neutral-300 dark:border-neutral-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 dark:text-white">{teacher.name}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{teacher.email}</p>
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {teacher.subjects.join(', ')}
                    </div>
                  </label>
                ))
              ) : (
                <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
                  {searchTerm ? 'Tidak ada guru yang cocok dengan pencarian' : 'Semua guru sudah memiliki akses'}
                </div>
              )}
            </div>

            {/* Permission Settings */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Izin Akses
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['view', 'edit', 'admin'] as const).map((perm) => (
                  <button
                    key={perm}
                    onClick={() => setPermission(perm)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      permission === perm
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {getPermissionIcon(perm)}
                    </div>
                    <p className="text-xs font-medium text-neutral-900 dark:text-white">
                      {getPermissionLabel(perm)}
                    </p>
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                {permission === 'view' && 'Hanya dapat melihat dan mengunduh materi'}
                {permission === 'edit' && 'Dapat mengedit materi dan membuat versi baru'}
                {permission === 'admin' && 'Punya kontrol penuh termasuk menghapus materi'}
              </div>
            </div>

            {/* Expiration */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={expirationEnabled}
                  onChange={(e) => setExpirationEnabled(e.target.checked)}
                  className="rounded border-neutral-300 dark:border-neutral-600"
                />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Batasi waktu akses
                </span>
              </label>

              {expirationEnabled && (
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-2 w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-2 flex-shrink-0">
          <Button
            onClick={() => setShowShareModal(false)}
            variant="ghost"
          >
            {UI_STRINGS.CANCEL}
          </Button>
          <Button
            onClick={handleShare}
            disabled={selectedTeachers.length === 0 || loading}
            isLoading={loading}
          >
            {loading ? UI_STRINGS.SHARING : `${UI_STRINGS.SHARE} ${UI_STRINGS.TO} ${selectedTeachers.length} Guru`}
          </Button>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Batasi Akses Guru"
        message={`Batasi akses ${teachersToRevoke.length} guru?`}
        type="warning"
        confirmText={UI_STRINGS.REVOKE_ACCESS}
        cancelText={UI_STRINGS.CANCEL}
        onConfirm={confirmRevoke}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSharingToDelete(null);
          setTeachersToRevoke([]);
        }}
      />
    </div>
  );
};

export default MaterialSharingComponent;