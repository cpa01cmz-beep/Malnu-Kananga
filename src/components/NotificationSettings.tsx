import React, { useState, useCallback } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { CloseIcon } from './icons/CloseIcon';
import { BellIcon } from './icons/BellIcon';
import { BellSlashIcon } from './icons/BellSlashIcon';
import { NotificationSettings as NotificationSettingsType } from '../types';
import { logger } from '../utils/logger';

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
    settings,
    history,
    requestPermission,
    updateSettings,
    resetSettings,
    clearHistory,
    markAsRead,
    deleteNotification,
    showNotification,
    createNotification,
  } = usePushNotifications();

  const [localSettings, setLocalSettings] = useState<NotificationSettingsType>(settings);
  const [showHistory, setShowHistory] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  const handleSaveSettings = useCallback(() => {
    updateSettings(localSettings);
    if (onShowToast) {
      onShowToast('Pengaturan notifikasi berhasil disimpan', 'success');
    }
    logger.info('Notification settings saved:', localSettings);
  }, [localSettings, updateSettings, onShowToast]);

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
    setLocalSettings(settings);
    setShowResetConfirmation(false);
    
    if (onShowToast) {
      onShowToast('Pengaturan notifikasi di-reset ke default', 'success');
    }
  }, [resetSettings, settings, onShowToast]);

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
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BellIcon className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">
              Pengaturan Notifikasi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Tutup"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Permission Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
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
                <span className="text-sm text-gray-700">
                  {permissionGranted
                    ? 'Notifikasi diizinkan'
                    : permissionDenied
                    ? 'Notifikasi ditolak'
                    : 'Menunggu izin'}
                </span>
              </div>
              {!permissionGranted && !permissionDenied && (
                <button
                  onClick={handleRequestPermission}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Izinkan Notifikasi
                </button>
              )}
            </div>
          </div>

          {/* Notification Toggle */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">
                Notifikasi
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.enabled}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                  aria-label="Aktifkan notifikasi"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            <div className="space-y-3 ml-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.announcements}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, announcements: e.target.checked })
                  }
                  disabled={!localSettings.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label="Pengumuman sekolah"
                />
                <span className="text-sm text-gray-700">Pengumuman Sekolah</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.grades}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, grades: e.target.checked })
                  }
                  disabled={!localSettings.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label="Update nilai"
                />
                <span className="text-sm text-gray-700">Update Nilai</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.ppdbStatus}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, ppdbStatus: e.target.checked })
                  }
                  disabled={!localSettings.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label="Status PPDB"
                />
                <span className="text-sm text-gray-700">Status PPDB</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.events}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, events: e.target.checked })
                  }
                  disabled={!localSettings.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label="Kegiatan OSIS"
                />
                <span className="text-sm text-gray-700">Kegiatan OSIS</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.library}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, library: e.target.checked })
                  }
                  disabled={!localSettings.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label="E-Library"
                />
                <span className="text-sm text-gray-700">E-Library</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.system}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, system: e.target.checked })
                  }
                  disabled={!localSettings.enabled}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label="Sistem"
                />
                <span className="text-sm text-gray-700">Sistem</span>
              </label>
            </div>
          </div>

          {/* Quiet Hours */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">
                Jam Tenang (Quiet Hours)
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.quietHours.enabled}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      quietHours: {
                        ...localSettings.quietHours,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  disabled={!localSettings.enabled}
                  className="sr-only peer"
                  aria-label="Aktifkan jam tenang"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {localSettings.quietHours.enabled && (
              <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Mulai:</label>
                  <input
                    type="time"
                    value={localSettings.quietHours.start}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        quietHours: {
                          ...localSettings.quietHours,
                          start: e.target.value,
                        },
                      })
                    }
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Selesai:</label>
                  <input
                    type="time"
                    value={localSettings.quietHours.end}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        quietHours: {
                          ...localSettings.quietHours,
                          end: e.target.value,
                        },
                      })
                    }
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaveSettings}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Simpan Pengaturan
            </button>
            <button
              onClick={handleTestNotification}
              disabled={!permissionGranted || !localSettings.enabled}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tes Notifikasi
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Lihat Riwayat ({history.length})
            </button>
            <button
              onClick={() => setShowResetConfirmation(true)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirmation && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reset Pengaturan Notifikasi?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Pengaturan akan dikembalikan ke nilai default. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetConfirmation(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleResetSettings}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Riwayat Notifikasi
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Tutup"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                {history.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Belum ada riwayat notifikasi
                  </p>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-gray-600">
                        Total: {history.length} notifikasi
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleMarkAllAsRead}
                          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          Tandai Semua Dibaca
                        </button>
                        <button
                          onClick={handleClearHistory}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          Hapus Semua
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {history.slice().reverse().map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border ${
                            item.notification.read
                              ? 'bg-gray-50 border-gray-200'
                              : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">
                              {item.notification.title}
                            </h4>
                            <button
                              onClick={() => handleDeleteNotification(item.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              aria-label="Hapus notifikasi"
                            >
                              <CloseIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.notification.body}
                          </p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
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