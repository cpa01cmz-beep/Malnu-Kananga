import React, { useState, useCallback, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { CloseIcon } from './icons/CloseIcon';
import { BellIcon } from './icons/BellIcon';
import { BellSlashIcon } from './icons/BellSlashIcon';
import { Toggle } from './ui/Toggle';
import BatchManagement from './BatchManagement';
import TemplateManagement from './TemplateManagement';
import NotificationAnalyticsComponent from './NotificationAnalytics';
import { NotificationSettings as NotificationSettingsType } from '../types';
import { useAutoSave } from '../hooks/useAutoSave';
import Button from './ui/Button';
import Tab from './ui/Tab';
import { EmptyState } from './ui/LoadingState';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const {
    permissionGranted,
    permissionDenied,
    settings: globalSettings,
    history,
    batches,
    templates,
    analytics,
    requestPermission,
    updateSettings,
    resetSettings,
    clearHistory,
    markAsRead,
    deleteNotification,
    showNotification,
    createNotification,
    createBatch,
    sendBatch,
    createTemplate,
    createNotificationFromTemplate,
  } = usePushNotifications();

  const [showHistory, setShowHistory] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'settings' | 'batches' | 'templates' | 'analytics'>('settings');

  // Use standardized auto-save hook for settings
  const [autoSaveState, autoSaveActions] = useAutoSave<NotificationSettingsType>(
    globalSettings,
    {
      storageKey: 'malnu_notification_settings',
      delay: 1500,
      enableOffline: true,
      onSave: async (settings) => {
        updateSettings(settings);
      },
      onSaved: () => {
        onShowToast?.('Pengaturan notifikasi disimpan otomatis', 'success');
      },
      onError: (error) => {
        onShowToast?.(`Gagal menyimpan pengaturan: ${error}`, 'error');
      }
    }
  );

  // Sync with global settings when they change externally
  useEffect(() => {
    autoSaveActions.reset(globalSettings);
  }, [globalSettings, autoSaveActions]);

  const handleManualSave = useCallback(async () => {
    await autoSaveActions.saveNow();
    onShowToast?.('Pengaturan notifikasi berhasil disimpan', 'success');
  }, [autoSaveActions, onShowToast]);

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      if (onShowToast) {
        onShowToast('Izin notifikasi berhasil diberikan', 'success');
      }
    } else {
      if (onShowToast) {
        onShowToast('Izin notifikasi ditolak', 'error');
      }
    }
  }, [requestPermission, onShowToast]);

  const handleTestNotification = useCallback(async () => {
    const testNotification = createNotification(
      'system',
      'Tes Notifikasi',
      'Ini adalah notifikasi tes dari MA Malnu Kananga Smart Portal',
      { type: 'test' }
    );
    
    await showNotification(testNotification);
    
    if (onShowToast) {
      onShowToast('Notifikasi tes berhasil dikirim', 'success');
    }
  }, [createNotification, showNotification, onShowToast]);

  const handleResetSettings = useCallback(() => {
    resetSettings();
    autoSaveActions.reset(globalSettings);
    setShowResetConfirmation(false);
    
    if (onShowToast) {
      onShowToast('Pengaturan notifikasi di-reset ke default', 'success');
    }
  }, [resetSettings, globalSettings, autoSaveActions, onShowToast]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    
    if (onShowToast) {
      onShowToast('Riwayat notifikasi berhasil dihapus', 'success');
    }
  }, [clearHistory, onShowToast]);

  const handleMarkAllAsRead = useCallback(() => {
    history.forEach((item) => {
      if (!item.notification.read) {
        markAsRead(item.id);
      }
    });
    
    if (onShowToast) {
      onShowToast('Semua notifikasi ditandai sudah dibaca', 'success');
    }
  }, [history, markAsRead, onShowToast]);

  const handleDeleteNotification = useCallback(
    (notificationId: string) => {
      deleteNotification(notificationId);
      
      if (onShowToast) {
        onShowToast('Notifikasi berhasil dihapus', 'success');
      }
    },
    [deleteNotification, onShowToast]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BellIcon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Pengaturan Notifikasi
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconOnly
            icon={<CloseIcon className="w-5 h-5" />}
            aria-label="Tutup"
          />
        </div>

        <Tab
          variant="border"
          color="blue"
          options={[
            { id: 'settings', label: 'Pengaturan' },
            {
              id: 'batches',
              label: 'Batch',
              badge: batches.filter(b => b.status === 'pending').length,
            },
            { id: 'templates', label: 'Template' },
            { id: 'analytics', label: 'Analytics' },
          ]}
          activeTab={activeTab}
          onTabChange={(tabId: string) => setActiveTab(tabId as 'templates' | 'settings' | 'batches' | 'analytics')}
        />

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'settings' && (
            <div className="space-y-6">
          {/* Permission Status */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-neutral-900 mb-3">
              Status Izin
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {permissionGranted ? (
                  <BellIcon className="w-5 h-5 text-green-600" />
                ) : permissionDenied ? (
                  <BellSlashIcon className="w-5 h-5 text-red-600" />
                ) : (
                  <BellIcon className="w-5 h-5 text-yellow-600" />
                )}
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  {permissionGranted
                    ? 'Notifikasi diizinkan'
                    : permissionDenied
                    ? 'Notifikasi ditolak'
                    : 'Menunggu izin'}
                </span>
              </div>
              {!permissionGranted && !permissionDenied && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRequestPermission}
                >
                  Izinkan Notifikasi
                </Button>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-900">
                Notifikasi
              </h3>
              <Toggle
                checked={autoSaveState.data.enabled}
                onChange={(e) =>
                  autoSaveActions.updateData({ ...autoSaveState.data, enabled: e.target.checked })
                }
                aria-label="Aktifkan notifikasi"
                color="blue"
              />
            </div>

            <div className="space-y-3 ml-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveState.data.announcements}
                  onChange={(e) =>
                    autoSaveActions.updateData({ ...autoSaveState.data, announcements: e.target.checked })
                  }
                  disabled={!autoSaveState.data.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500"
                  aria-label="Pengumuman sekolah"
                />
                <span className="text-sm text-neutral-700">Pengumuman Sekolah</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveState.data.grades}
                  onChange={(e) =>
                    autoSaveActions.updateData({ ...autoSaveState.data, grades: e.target.checked })
                  }
                  disabled={!autoSaveState.data.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500"
                  aria-label="Update nilai"
                />
                <span className="text-sm text-neutral-700">Update Nilai</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveState.data.ppdbStatus}
                  onChange={(e) =>
                    autoSaveActions.updateData({ ...autoSaveState.data, ppdbStatus: e.target.checked })
                  }
                  disabled={!autoSaveState.data.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500"
                  aria-label="Status PPDB"
                />
                <span className="text-sm text-neutral-700">Status PPDB</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveState.data.events}
                  onChange={(e) =>
                    autoSaveActions.updateData({ ...autoSaveState.data, events: e.target.checked })
                  }
                  disabled={!autoSaveState.data.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500"
                  aria-label="Kegiatan OSIS"
                />
                <span className="text-sm text-neutral-700">Kegiatan OSIS</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveState.data.library}
                  onChange={(e) =>
                    autoSaveActions.updateData({ ...autoSaveState.data, library: e.target.checked })
                  }
                  disabled={!autoSaveState.data.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500"
                  aria-label="E-Library"
                />
                <span className="text-sm text-neutral-700">E-Library</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveState.data.system}
                  onChange={(e) =>
                    autoSaveActions.updateData({ ...autoSaveState.data, system: e.target.checked })
                  }
                  disabled={!autoSaveState.data.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500"
                  aria-label="Sistem"
                />
                <span className="text-sm text-neutral-700">Sistem</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveState.data.roleBasedFiltering}
                  onChange={(e) =>
                    autoSaveActions.updateData({ ...autoSaveState.data, roleBasedFiltering: e.target.checked })
                  }
                  disabled={!autoSaveState.data.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500"
                  aria-label="Filter berdasarkan peran"
                />
                <span className="text-sm text-neutral-700">Filter Berdasarkan Peran</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveState.data.batchNotifications}
                  onChange={(e) =>
                    autoSaveActions.updateData({ ...autoSaveState.data, batchNotifications: e.target.checked })
                  }
                  disabled={!autoSaveState.data.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500"
                  aria-label="Grup notifikasi"
                />
                <span className="text-sm text-neutral-700">Grup Notifikasi</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-900">
                Jam Tenang (Quiet Hours)
              </h3>
              <Toggle
                checked={autoSaveState.data.quietHours.enabled}
                onChange={(e) =>
                  autoSaveActions.updateData({
                    ...autoSaveState.data,
                    quietHours: {
                      ...autoSaveState.data.quietHours,
                      enabled: e.target.checked,
                    },
                  })
                }
                disabled={!autoSaveState.data.enabled}
                aria-label="Aktifkan jam tenang"
                color="blue"
              />
            </div>

            {autoSaveState.data.quietHours.enabled && (
              <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-neutral-600">Mulai:</label>
                  <input
                    type="time"
                    value={autoSaveState.data.quietHours.start}
                    onChange={(e) =>
                      autoSaveActions.updateData({
                        ...autoSaveState.data,
                        quietHours: {
                          ...autoSaveState.data.quietHours,
                          start: e.target.value,
                        },
                      })
                    }
                    className="border border-neutral-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-neutral-600">Selesai:</label>
                  <input
                    type="time"
                    value={autoSaveState.data.quietHours.end}
                    onChange={(e) =>
                      autoSaveActions.updateData({
                        ...autoSaveState.data,
                        quietHours: {
                          ...autoSaveState.data.quietHours,
                          end: e.target.value,
                        },
                      })
                    }
                    className="border border-neutral-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
</div>
            )}
          </div>

          {/* Voice Notification Settings */}
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  Notifikasi Suara
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Pengumuman suara untuk aksesibilitas notifikasi penting
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  // Import and show voice notification settings
                  import('./VoiceNotificationSettings').then(({ default: _VoiceNotificationSettingsModal }) => {
                    // This would need a proper state management approach
                    // For now, let's add it to a simpler approach
                  });
                }}
              >
                Konfigurasi
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Aktifkan Notifikasi Suara
                </label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Pengumuman suara untuk notifikasi prioritas tinggi
                </p>
              </div>
              <Toggle
                checked={autoSaveState.data.voiceNotifications?.enabled || false}
                onChange={(e) =>
                  autoSaveActions.updateData({
                    ...autoSaveState.data,
                    voiceNotifications: {
                      ...autoSaveState.data.voiceNotifications,
                      enabled: e.target.checked,
                    },
                  })
                }
                disabled={!autoSaveState.data.enabled}
                aria-label="Aktifkan notifikasi suara"
                color="green"
              />
            </div>
          </div>
        </div>
          )}

          {activeTab === 'batches' && (
            <BatchManagement 
              batches={batches} 
              createBatch={createBatch} 
              sendBatch={sendBatch} 
              onShowToast={onShowToast} 
            />
          )}

          {activeTab === 'templates' && (
            <TemplateManagement 
              templates={templates}
              createTemplate={createTemplate}
              createNotificationFromTemplate={createNotificationFromTemplate}
              showNotification={showNotification}
              onShowToast={onShowToast}
            />
          )}

          {activeTab === 'analytics' && (
            <NotificationAnalyticsComponent analytics={analytics} />
          )}
        </div>

        {activeTab === 'settings' && (
          <div className="px-6 pb-6">
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={handleManualSave}
              fullWidth
            >
              Simpan Pengaturan
            </Button>
            <Button
              variant="secondary"
              onClick={handleTestNotification}
              disabled={!permissionGranted || !autoSaveState.data.enabled}
            >
              Tes Notifikasi
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowHistory(true)}
            >
              Lihat Riwayat ({history.length})
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowResetConfirmation(true)}
            >
              Reset
            </Button>
            </div>
          </div>
        )}

        {/* Reset Confirmation Modal */}
        {showResetConfirmation && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Reset Pengaturan Notifikasi?
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Pengaturan akan dikembalikan ke nilai default. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowResetConfirmation(false)}
                >
                  Batal
                </Button>
                <Button
                  variant="danger"
                  onClick={handleResetSettings}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Riwayat Notifikasi
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                  iconOnly
                  icon={<CloseIcon className="w-5 h-5" />}
                  aria-label="Tutup"
                />
              </div>

              <div className="p-4">
                {history.length === 0 ? (
                  <EmptyState message="Belum ada riwayat notifikasi" size="md" />
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Total: {history.length} notifikasi
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="info"
                          size="sm"
                          onClick={handleMarkAllAsRead}
                        >
                          Tandai Semua Dibaca
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleClearHistory}
                        >
                          Hapus Semua
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {history.slice().reverse().map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border ${
                            item.notification.read
                              ? 'bg-neutral-50 border-neutral-200'
                              : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-neutral-900 dark:text-white">
                              {item.notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(item.id)}
                              iconOnly
                              icon={<CloseIcon className="w-4 h-4" />}
                              aria-label="Hapus notifikasi"
                            />
                          </div>
                          <p className="text-sm text-neutral-600 mb-2">
                            {item.notification.body}
                          </p>
                          <div className="flex justify-between items-center text-xs text-neutral-500">
                            <span>
                              {new Date(
                                item.notification.timestamp
                              ).toLocaleString('id-ID')}
                            </span>
                            <span>
                              {item.notification.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;