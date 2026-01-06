import React, { useState, useCallback } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { UserRole, NotificationType, NotificationHistoryItem } from '../types';
import { NotificationTemplateService } from '../services/notificationTemplates';
import { logger } from '../utils/logger';
import { BellIcon } from './icons/BellIcon';
import { BellSlashIcon } from './icons/BellSlashIcon';
import { CheckCircleIcon, MagnifyingGlassIcon, FunnelIcon } from './icons/NotificationIcons';
import { TrashIcon } from './icons/TrashIcon';

interface NotificationCenterProps {
  userRole: UserRole;
  onNotificationClick?: (notification: NotificationHistoryItem) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userRole,
  onNotificationClick,
  onShowToast,
}) => {
  const {
    history,
    permissionGranted,
    markAsRead,
    clearHistory,
    createNotification,
    showNotification,
  } = usePushNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'read' | 'unread'>('all');

  const relevantTypes = NotificationTemplateService.getRelevantNotificationTypes(userRole);

  const filteredHistory = useCallback(() => {
    let filtered = [...history];

    if (selectedType !== 'all') {
      filtered = filtered.filter(
        (item) => item.notification.type === selectedType
      );
    }

    if (selectedStatus === 'read') {
      filtered = filtered.filter((item) => item.notification.read);
    } else if (selectedStatus === 'unread') {
      filtered = filtered.filter((item) => !item.notification.read);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.notification.title.toLowerCase().includes(query) ||
          item.notification.body.toLowerCase().includes(query)
      );
    }

    return filtered.reverse();
  }, [history, selectedType, selectedStatus, searchQuery]);

  const unreadCount = history.filter((item) => !item.notification.read).length;

  const handleToggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
    logger.info('Notification center toggled:', !isOpen);
  }, [isOpen]);

  const handleNotificationClick = useCallback(
    (item: NotificationHistoryItem) => {
      if (!item.notification.read) {
        markAsRead(item.id);
      }

      if (onNotificationClick) {
        onNotificationClick(item);
      }

      if (onShowToast) {
        onShowToast('Notifikasi dibuka', 'info');
      }

      logger.info('Notification clicked:', item.id);
    },
    [markAsRead, onNotificationClick, onShowToast]
  );

  const handleMarkAllAsRead = useCallback(() => {
    history.forEach((item) => {
      if (!item.notification.read) {
        markAsRead(item.id);
      }
    });

    if (onShowToast) {
      onShowToast('Semua notifikasi ditandai sudah dibaca', 'success');
    }

    logger.info('All notifications marked as read');
  }, [history, markAsRead, onShowToast]);

  const handleClearHistory = useCallback(() => {
    clearHistory();

    if (onShowToast) {
      onShowToast('Riwayat notifikasi berhasil dihapus', 'success');
    }

    logger.info('Notification history cleared');
  }, [clearHistory, onShowToast]);

  const handleSendTestNotification = useCallback(async () => {
    const testNotification = createNotification(
      'system',
      'Tes Notifikasi Terpadu',
      'Ini adalah notifikasi tes dari Pusat Notifikasi Terpadu MA Malnu Kananga',
      { type: 'test', source: 'notification-center' }
    );

    await showNotification(testNotification);

    if (onShowToast) {
      onShowToast('Notifikasi tes berhasil dikirim', 'success');
    }

    logger.info('Test notification sent from notification center');
  }, [createNotification, showNotification, onShowToast]);

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'normal':
        return 'border-l-4 border-primary-500';
      case 'low':
        return 'border-l-4 border-neutral-400';
      default:
        return '';
    }
  };

  const getTypeIcon = (type: NotificationType): string => {
    switch (type) {
      case 'announcement':
        return '📢';
      case 'grade':
        return '📊';
      case 'ppdb':
        return '🎓';
      case 'event':
        return '🎉';
      case 'library':
        return '📚';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleOpen}
        className="relative p-2 rounded-pill hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
        aria-label={`Notifikasi (${unreadCount} belum dibaca)`}
      >
        {permissionGranted ? (
          <BellIcon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        ) : (
          <BellSlashIcon className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-pill h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={handleToggleOpen}
            aria-hidden="true"
          />

          <div className="absolute right-0 mt-2 w-full sm:w-96 max-h-[80vh] bg-white dark:bg-neutral-800 rounded-card-lg shadow-float z-50 overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Pusat Notifikasi
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {unreadCount} belum dibaca
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Cari notifikasi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-card focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-neutral-900 dark:text-white bg-white dark:bg-neutral-700"
                    aria-label="Cari notifikasi"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                    <select
                      value={selectedType}
                      onChange={(e) =>
                        setSelectedType(
                          e.target.value as NotificationType | 'all'
                        )
                      }
                      className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-card focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                      aria-label="Filter berdasarkan tipe"
                    >
                      <option value="all">Semua Tipe</option>
                      {relevantTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as 'all' | 'read' | 'unread')
                    }
                    className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-card focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                    aria-label="Filter berdasarkan status"
                  >
                    <option value="all">Semua Status</option>
                    <option value="unread">Belum Dibaca</option>
                    <option value="read">Sudah Dibaca</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="flex-1 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-card transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Tandai Semua Dibaca
                  </button>
                  <button
                    onClick={handleSendTestNotification}
                    disabled={!permissionGranted}
                    className="px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-card transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tes
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              {filteredHistory().length === 0 ? (
                <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                  {searchQuery || selectedType !== 'all' || selectedStatus !== 'all' ? (
                    <p>Tidak ada notifikasi yang cocok dengan filter</p>
                  ) : (
                    <>
                      <p className="mb-4">Belum ada notifikasi</p>
                      <button
                        onClick={handleSendTestNotification}
                        disabled={!permissionGranted}
                        className="px-4 py-2 bg-primary-600 text-white rounded-card hover:bg-primary-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Kirim Notifikasi Tes
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
                  {filteredHistory().map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors duration-200 ${getPriorityColor(
                        item.notification.priority
                      )} ${item.notification.read ? 'bg-white dark:bg-neutral-800' : 'bg-primary-50 dark:bg-primary-900/30'}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {getTypeIcon(item.notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                              {item.notification.title}
                            </h4>
                            {!item.notification.read && (
                              <span className="h-2 w-2 bg-primary-500 rounded-pill flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
                            {item.notification.body}
                          </p>
                          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                            <span>
                              {new Date(
                                item.notification.timestamp
                              ).toLocaleString('id-ID', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="capitalize">
                              {item.notification.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4">
              <button
                onClick={handleClearHistory}
                disabled={history.length === 0}
                className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-card transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Hapus Semua Notifikasi
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
