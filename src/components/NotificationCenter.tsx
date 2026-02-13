import React, { useState, useCallback, useEffect } from 'react';
import { usePushNotifications } from '../hooks/useUnifiedNotifications';
import { UserRole, NotificationType, NotificationHistoryItem } from '../types';
import { NotificationTemplateService } from '../services/notificationTemplates';
import { logger } from '../utils/logger';
import { BellIcon } from './icons/BellIcon';
import { BellSlashIcon } from './icons/BellSlashIcon';
import { CheckCircleIcon, FunnelIcon } from './icons/NotificationIcons';
import { TrashIcon } from './icons/TrashIcon';
import Button from './ui/Button';
import SearchInput from './ui/SearchInput';
import { EmptyState } from './ui/LoadingState';
import { HEIGHT_CLASSES } from '../config/heights';

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
  const [isSendingTestNotification, setIsSendingTestNotification] = useState(false);

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        logger.info('Notification center closed via Escape key');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
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
    setIsSendingTestNotification(true);
    try {
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
    } finally {
      setIsSendingTestNotification(false);
    }
  }, [createNotification, showNotification, onShowToast]);

   const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'normal':
        return 'border-l-4 border-blue-500';
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
        className="relative p-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 min-w-[44px] min-h-[44px]"
        aria-label={`Notifikasi (${unreadCount} belum dibaca)`}
        aria-expanded={isOpen}
        aria-controls="notification-dropdown"
      >
        {permissionGranted ? (
          <BellIcon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        ) : (
          <BellSlashIcon className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center" aria-live="polite">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={handleToggleOpen}
            aria-hidden="true"
          />

          <div
            id="notification-dropdown"
            className={`absolute right-0 mt-2 w-full sm:w-96 ${HEIGHT_CLASSES.NOTIFICATION.CENTER} bg-white dark:bg-neutral-900 rounded-xl shadow-card-hover z-50 overflow-hidden`}
            role="dialog"
            aria-modal="true"
            aria-label="Pusat Notifikasi"
          >
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Pusat Notifikasi
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600">
                    {unreadCount} belum dibaca
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <SearchInput
                  placeholder="Cari notifikasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="sm"
                  fullWidth
                />

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <label htmlFor="notification-type-filter" className="sr-only">Filter berdasarkan tipe</label>
                    <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
                    <select
                      id="notification-type-filter"
                      value={selectedType}
                      onChange={(e) =>
                        setSelectedType(
                          e.target.value as NotificationType | 'all'
                        )
                      }
                      className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white transition-colors focus:outline-none"
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

                  <label htmlFor="notification-status-filter" className="sr-only">Filter berdasarkan status</label>
                  <select
                    id="notification-status-filter"
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as 'all' | 'read' | 'unread')
                    }
                    className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors focus:outline-none"
                    aria-label="Filter berdasarkan status"
                  >
                    <option value="all">Semua Status</option>
                    <option value="unread">Belum Dibaca</option>
                    <option value="read">Sudah Dibaca</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    variant="outline"
                    intent="info"
                    size="sm"
                    className="flex-1"
                    disabledReason={unreadCount === 0 ? 'Tidak ada notifikasi yang belum dibaca' : undefined}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Tandai Semua Dibaca
                  </Button>
                  <Button
                    onClick={handleSendTestNotification}
                    disabled={!permissionGranted || isSendingTestNotification}
                    variant="secondary"
                    size="sm"
                    disabledReason={!permissionGranted ? 'Izin notifikasi diperlukan untuk mengirim tes' : undefined}
                  >
                    {isSendingTestNotification ? 'Mengirim...' : 'Tes'}
                  </Button>
                </div>
              </div>
            </div>

            <div className={`overflow-y-auto ${HEIGHT_CLASSES.NOTIFICATION.LIST}`}>
              {filteredHistory().length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    message={searchQuery || selectedType !== 'all' || selectedStatus !== 'all' ? 'Tidak ada notifikasi yang cocok dengan filter' : 'Belum ada notifikasi'}
                    action={
                      searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                        ? undefined
                        : {
                            label: 'Kirim Notifikasi Tes',
                            onClick: handleSendTestNotification
                          }
                    }
                    size="md"
                  />
                </div>
              ) : (
                  <ul className="divide-y divide-neutral-100 dark:divide-neutral-800" role="list" aria-label="Daftar notifikasi">
                   {filteredHistory().map((item) => (
                     <li
                       key={item.id}
                       role="listitem"
                     >
                       <button
                         type="button"
                         onClick={() => handleNotificationClick(item)}
                         className={`w-full text-left p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${getPriorityColor(
                           item.notification.priority
                         )} ${item.notification.read ? 'bg-white dark:bg-neutral-900' : 'bg-blue-50 dark:bg-blue-900/20'} focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
                         aria-label={`${item.notification.title}, ${item.notification.body}${!item.notification.read ? ', belum dibaca' : ''}`}
                         aria-current={!item.notification.read ? 'true' : undefined}
                       >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl" role="img" aria-label={getTypeIcon(item.notification.type)}>
                          {getTypeIcon(item.notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                              {item.notification.title}
                            </h4>
                            {!item.notification.read && (
                              <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" aria-label="Belum dibaca" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
                            {item.notification.body}
                          </p>
                          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-500">
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
                       </button>
                     </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4">
              <Button
                onClick={handleClearHistory}
                disabled={history.length === 0}
                variant="destructive"
                size="sm"
                fullWidth
              >
                <TrashIcon className="w-4 h-4" />
                Hapus Semua Notifikasi
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
