import React, { useState, useEffect, useCallback } from 'react';
import { AnnouncementCategory, AnnouncementTargetType, type Announcement, type AnnouncementFormData, type User, type UserRole, type UserExtraRole } from '../types';
import { STORAGE_KEYS, UI_STRINGS } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { permissionService } from '../services/permissionService';
import { unifiedNotificationManager } from '../services/notifications/unifiedNotificationManager';
import { apiService } from '../services/apiService';
import { logger } from '../utils/logger';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import AccessDenied from './AccessDenied';
import Badge from './ui/Badge';
import SearchInput from './ui/SearchInput';
import { EmptyState } from './ui/LoadingState';
import Card from './ui/Card';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import Section from './ui/Section';
import ConfirmationDialog from './ui/ConfirmationDialog';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';
import { BellIcon } from './icons/BellIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';
import { useNetworkStatus } from '../utils/networkStatus';
import {
  VALIDATION_MESSAGES,
  SUCCESS_MESSAGES,
  API_ERROR_MESSAGES,
} from '../utils/errorMessages';
interface AnnouncementManagerProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const AnnouncementManager: React.FC<AnnouncementManagerProps> = ({ onBack, onShowToast }) => {
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<Announcement | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    category: AnnouncementCategory.UMUM,
    targetType: AnnouncementTargetType.ALL,
    expiresAt: '',
    sendNotification: true
  });

  const { isOnline } = useNetworkStatus();

  // Get current user for permission checking
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  };

  const authUser = getCurrentUser();
  const userRole = authUser?.role as UserRole || 'student';
  const userExtraRole = authUser?.extraRole as UserExtraRole;
  const userId = authUser?.id || '';

  // Check permissions
  const canManageAnnouncements = permissionService.hasPermission(userRole, userExtraRole, 'announcements.manage').granted;
  const canViewAnnouncements = permissionService.hasPermission(userRole, userExtraRole, 'announcements.view').granted;

  // Filter announcements
  const filteredAnnouncements = announcements.filter((announcement: Announcement) => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || announcement.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                       (filterStatus === 'active' ? announcement.isActive : !announcement.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Load announcements from API
  const loadAnnouncements = useCallback(async () => {
    if (!isOnline) {
      logger.info('Offline mode: using cached announcements');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.announcements.getAll();
      if (response && response.data) {
        setAnnouncements(response.data);
      }
    } catch (error) {
      logger.error('Failed to load announcements:', error);
      onShowToast(API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 'error');
    } finally {
      setLoading(false);
    }
  }, [isOnline, setAnnouncements, onShowToast]);

  useEffect(() => {
    if (canViewAnnouncements) {
      loadAnnouncements();
    }
  }, [canViewAnnouncements, loadAnnouncements]);

  // Save announcement
  const handleSave = async () => {
    if (!isOnline) {
      onShowToast(API_ERROR_MESSAGES.NETWORK_ERROR, 'error');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      onShowToast(VALIDATION_MESSAGES.ANNOUNCEMENT_TITLE_REQUIRED, 'error');
      return;
    }

    setSaving(true);
    try {
      const announcementData = {
        ...formData,
        createdBy: userId
      };

      let response;
      if (editingAnnouncement) {
        // Update existing announcement
        response = await apiService.announcements.update(editingAnnouncement.id, announcementData);
        onShowToast(SUCCESS_MESSAGES.ANNOUNCEMENT_UPDATED, 'success');
      } else {
        // Create new announcement
        response = await apiService.announcements.create(announcementData);
        onShowToast(SUCCESS_MESSAGES.ANNOUNCEMENT_CREATED, 'success');
      }

      if (response && response.data) {
        if (editingAnnouncement) {
          setAnnouncements((prev: Announcement[]) => prev.map(a => a.id === editingAnnouncement.id ? response.data! : a));
        } else {
          setAnnouncements((prev: Announcement[]) => [response.data!, ...prev]);
        }
        
        // Send push notification if enabled
        if (formData.sendNotification) {
          await unifiedNotificationManager.showNotification({
            id: `notif-announcement-${response.data!.id}`,
            title: `📢 ${formData.title}`,
            body: formData.content,
            type: 'announcement',
            priority: 'normal',
            timestamp: new Date().toISOString(),
            read: false,
            data: {
              announcementId: response.data!.id,
              category: formData.category
            }
          });
        }
      }

      // Reset form and close modal
      setFormData({
        title: '',
        content: '',
        category: AnnouncementCategory.UMUM,
        targetType: AnnouncementTargetType.ALL,
        expiresAt: '',
        sendNotification: true
      });
      setEditingAnnouncement(null);
      setShowCreateModal(false);
    } catch (error) {
      logger.error('Failed to save announcement:', error);
      onShowToast(API_ERROR_MESSAGES.OPERATION_FAILED, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Toggle announcement status
  const handleToggleStatus = async (announcement: Announcement) => {
    if (!isOnline) {
      onShowToast(API_ERROR_MESSAGES.NETWORK_ERROR, 'error');
      return;
    }

    try {
      const response = await apiService.announcements.toggleStatus(announcement.id);
      if (response && response.data) {
        setAnnouncements((prev: Announcement[]) => prev.map(a => a.id === announcement.id ? response.data! : a));
        onShowToast(announcement.isActive ? SUCCESS_MESSAGES.ANNOUNCEMENT_PUBLISHED : SUCCESS_MESSAGES.ANNOUNCEMENT_PUBLISHED, 'success');
      }
    } catch (error) {
      logger.error('Failed to toggle announcement status:', error);
      onShowToast(API_ERROR_MESSAGES.OPERATION_FAILED, 'error');
    }
  };

  const requestDelete = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
  };

  const confirmDelete = async () => {
    if (!announcementToDelete) return;
    
    const id = announcementToDelete.id;
    
    if (!isOnline) {
      onShowToast(API_ERROR_MESSAGES.NETWORK_ERROR, 'error');
      setAnnouncementToDelete(null);
      return;
    }

    try {
      await apiService.announcements.delete(id);
      setAnnouncements((prev: Announcement[]) => prev.filter(a => a.id !== id));
      onShowToast(SUCCESS_MESSAGES.ANNOUNCEMENT_DELETED, 'success');
      if (showAnalyticsModal?.id === id) {
        setShowAnalyticsModal(null);
      }
    } catch (error) {
      logger.error('Failed to delete announcement:', error);
      onShowToast(API_ERROR_MESSAGES.OPERATION_FAILED, 'error');
    } finally {
      setAnnouncementToDelete(null);
    }
  };

  // Mark announcement as read
  const handleMarkAsRead = async (announcement: Announcement) => {
    const readKey = STORAGE_KEYS.ANNOUNCEMENT_READ(announcement.id, userId);
    localStorage.setItem(readKey, new Date().toISOString());

    const updatedReadBy = announcement.readBy || [];
    if (!updatedReadBy.includes(userId)) {
      updatedReadBy.push(userId);
      setAnnouncements((prev: Announcement[]) => prev.map(a => 
        a.id === announcement.id ? { ...a, readBy: updatedReadBy } : a
      ));
    }
  };

  // Calculate analytics for announcement
  const calculateAnalytics = (announcement: Announcement) => {
    const readCount = announcement.readBy?.length || 0;
    const totalSent = announcements.length;

    return {
      totalSent,
      readCount,
      readRate: totalSent > 0 ? ((readCount / totalSent) * 100).toFixed(1) : '0.0',
      createdAt: new Date(announcement.createdAt).toLocaleString('id-ID'),
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toLocaleString('id-ID') : 'Tidak ada'
    };
  };

  // If user cannot view announcements, show access denied
  if (!canViewAnnouncements) {
    return <AccessDenied onBack={onBack} message="You don't have permission to view announcements" requiredPermission="announcements.view" />;
  }

  return (
    <main className="pt-24 sm:pt-32 min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 sm:p-8 shadow-card border border-neutral-200 dark:border-neutral-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
                Manajemen Pengumuman
              </h1>
              <p className="mt-2 text-base text-neutral-600 dark:text-neutral-300">
                Buat dan kelola pengumuman untuk seluruh sekolah
              </p>
            </div>
            <div className="flex gap-2">
              {canManageAnnouncements && (
                <Button
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setFormData({
                      title: '',
                      content: '',
                      category: AnnouncementCategory.UMUM,
                      targetType: AnnouncementTargetType.ALL,
                      expiresAt: '',
                      sendNotification: true
                    });
                    setShowCreateModal(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <BellIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Buat Pengumuman</span>
                  <span className="sm:hidden">Buat</span>
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pengumuman..."
              className="w-full"
            />
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'all' | AnnouncementCategory)}
              options={[
                { value: 'all', label: 'Semua Kategori' },
                { value: AnnouncementCategory.UMUM, label: 'Umum' },
                { value: AnnouncementCategory.AKADEMIK, label: 'Akademik' },
                { value: AnnouncementCategory.KEGIATAN, label: 'Kegiatan' },
                { value: AnnouncementCategory.KEUANGAN, label: 'Keuangan' }
              ]}
              className="w-full"
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'active', label: 'Aktif' },
                { value: 'inactive', label: 'Tidak Aktif' }
              ]}
              className="w-full"
            />
          </div>
        </div>

        {/* Announcement List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <EmptyState
            icon={<MegaphoneIcon className="w-16 h-16 text-neutral-400" />}
            message={
              searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Belum ada pengumuman yang dibuat'
            }
            action={{
              label: 'Muat Ulang',
              onClick: loadAnnouncements
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement: Announcement) => {
              const analytics = calculateAnalytics(announcement);
              const isRead = announcement.readBy?.includes(userId);
              
              return (
                <Card key={announcement.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                          {announcement.title}
                        </h3>
                        <Badge variant={announcement.isActive ? 'success' : 'secondary'}>
                          {announcement.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                        <Badge variant="info">
                          {announcement.category}
                        </Badge>
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-300 mb-4 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                        <span>
                          <strong>Dibuat:</strong> {analytics.createdAt}
                        </span>
                        <span>
                          <strong>Kadaluarsa:</strong> {analytics.expiresAt}
                        </span>
                        <span>
                          <strong>Dibaca:</strong> {analytics.readCount}
                        </span>
                        <span>
                          <strong>Target:</strong> {announcement.targetType}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 ml-4">
                      {!isRead && (
                        <IconButton
                          onClick={() => handleMarkAsRead(announcement)}
                          icon={<EyeIcon className="w-5 h-5" />}
                          title="Tandai sebagai dibaca"
                          ariaLabel="Tandai sebagai dibaca"
                          variant="ghost"
                        />
                      )}
                      <IconButton
                        onClick={() => setShowPreviewModal(announcement)}
                        icon={<EyeSlashIcon className="w-5 h-5" />}
                        title="Preview"
                        ariaLabel="Preview"
                        variant="ghost"
                      />
                      {canManageAnnouncements && (
                        <>
                          <IconButton
                            onClick={() => {
                              setEditingAnnouncement(announcement);
                              setFormData({
                                title: announcement.title,
                                content: announcement.content,
                                category: announcement.category,
                                targetType: announcement.targetType,
                                targetRoles: announcement.targetRoles,
                                targetClasses: announcement.targetClasses,
                                targetUsers: announcement.targetUsers,
                                expiresAt: announcement.expiresAt || '',
                                sendNotification: true
                              });
                              setShowCreateModal(true);
                            }}
                            icon={<PencilIcon className="w-5 h-5" />}
                            title="Edit"
                            ariaLabel="Edit"
                            variant="ghost"
                          />
                          <IconButton
                            onClick={() => handleToggleStatus(announcement)}
                            icon={announcement.isActive ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            title={announcement.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            ariaLabel={announcement.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            variant="ghost"
                          />
                          <IconButton
                            onClick={() => setShowAnalyticsModal(announcement)}
                            icon={<BellIcon className="w-5 h-5" />}
                            title="Analytics"
                            ariaLabel="Analytics"
                            variant="ghost"
                          />
                          <IconButton
                            onClick={() => requestDelete(announcement)}
                            icon={<TrashIcon className="w-5 h-5" />}
                            title="Hapus"
                            ariaLabel="Hapus"
                            variant="ghost"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            if (!saving) {
              setShowCreateModal(false);
              setEditingAnnouncement(null);
              setFormData({
                title: '',
                content: '',
                category: AnnouncementCategory.UMUM,
                targetType: AnnouncementTargetType.ALL,
                expiresAt: '',
                sendNotification: true
              });
            }
          }}
          title={editingAnnouncement ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
          size="lg"
        >
          <div className="space-y-4">
            <Section id="info-dasar" title="Informasi Dasar">
              <div className="space-y-4">
                <Input
                  label="Judul"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masukkan judul pengumuman"
                  required
                />
                <Textarea
                  label="Konten"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Masukkan konten pengumuman"
                  rows={6}
                  required
                />
              </div>
            </Section>

            <Section id="pengaturan-pengumuman" title="Pengaturan Pengumuman">
              <div className="space-y-4">
                <Select
                  label="Kategori"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as AnnouncementCategory })}
                  options={[
                    { value: AnnouncementCategory.UMUM, label: 'Umum' },
                    { value: AnnouncementCategory.AKADEMIK, label: 'Akademik' },
                    { value: AnnouncementCategory.KEGIATAN, label: 'Kegiatan' },
                    { value: AnnouncementCategory.KEUANGAN, label: 'Keuangan' }
                  ]}
                />
                <Select
                  label="Target Pengumuman"
                  value={formData.targetType}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value as AnnouncementTargetType })}
                  options={[
                    { value: AnnouncementTargetType.ALL, label: 'Semua Pengguna' },
                    { value: AnnouncementTargetType.ROLES, label: 'Berdasarkan Peran' },
                    { value: AnnouncementTargetType.CLASSES, label: 'Berdasarkan Kelas' },
                    { value: AnnouncementTargetType.SPECIFIC, label: 'Pengguna Spesifik' }
                  ]}
                />
                <Input
                  label="Tanggal Kadaluarsa (Opsional)"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sendNotification"
                    checked={formData.sendNotification}
                    onChange={(e) => setFormData({ ...formData, sendNotification: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="sendNotification" className="text-sm text-neutral-700 dark:text-neutral-300">
                    Kirim notifikasi push ke pengguna
                  </label>
                </div>
              </div>
            </Section>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                if (!saving) {
                  setShowCreateModal(false);
                  setEditingAnnouncement(null);
                }
              }}
              variant="secondary"
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
              shortcut="Ctrl+S"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {UI_STRINGS.SAVING}
                </>
              ) : (
                <>
                  {editingAnnouncement ? 'Simpan Perubahan' : 'Buat Pengumuman'}
                </>
              )}
            </Button>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <Modal
          isOpen={!!showPreviewModal}
          onClose={() => setShowPreviewModal(null)}
          title="Preview Pengumuman"
          size="lg"
        >
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="info">{showPreviewModal.category}</Badge>
              {showPreviewModal.isActive && <Badge variant="success">Aktif</Badge>}
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
              {showPreviewModal.title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap mb-4">
              {showPreviewModal.content}
            </p>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 space-y-1">
              <p><strong>Dibuat oleh:</strong> {showPreviewModal.createdBy}</p>
              <p><strong>Tanggal:</strong> {new Date(showPreviewModal.createdAt).toLocaleString('id-ID')}</p>
              <p><strong>Kadaluarsa:</strong> {showPreviewModal.expiresAt ? new Date(showPreviewModal.expiresAt).toLocaleString('id-ID') : 'Tidak ada'}</p>
              <p><strong>Target:</strong> {showPreviewModal.targetType}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <Modal
          isOpen={!!showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(null)}
          title="Analytics Pengumuman"
          size="md"
        >
          <div className="space-y-4">
            {(() => {
              const analytics = calculateAnalytics(showAnalyticsModal!);
              return (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Total Dikirim</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{analytics.totalSent}</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Dibaca</p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{analytics.readCount}</p>
                    </Card>
                  </div>
                  <Card className="p-4">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Tingkat Pembacaan</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.readRate}%</p>
                  </Card>
                  <div className="space-y-2 text-sm">
                    <p className="text-neutral-600 dark:text-neutral-300">
                      <strong>Dibuat:</strong> {analytics.createdAt}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      <strong>Kadaluarsa:</strong> {analytics.expiresAt}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </Modal>
      )}

      <ConfirmationDialog
        isOpen={!!announcementToDelete}
        title="Hapus Pengumuman"
        message={`Apakah Anda yakin ingin menghapus pengumuman "${announcementToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        type="danger"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDelete}
        onCancel={() => setAnnouncementToDelete(null)}
      />
    </main>
  );
};

export default AnnouncementManager;
