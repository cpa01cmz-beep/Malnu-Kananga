// NotificationHistory.tsx - Component for viewing notification history
import React, { useState, useEffect } from 'react';
import { ToastType } from './Toast';
import { pushNotificationService } from '../services/pushNotificationService';
import { parentGradeNotificationService } from '../services/parentGradeNotificationService';
import { logger } from '../utils/logger';
import type { PushNotification, ParentChild } from '../types';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import Badge from './ui/Badge';
import { EmptyState } from './ui/LoadingState';
import LoadingSpinner from './ui/LoadingSpinner';

interface NotificationHistoryProps {
  onShowToast: (msg: string, type: ToastType) => void;
  child: ParentChild;
  onClose: () => void;
}

const NotificationHistory: React.FC<NotificationHistoryProps> = ({
  onShowToast,
  child,
  onClose
}) => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'grade' | 'system' | 'announcement'>('all');
  const [markingAsRead, setMarkingAsRead] = useState(false);

  useEffect(() => {
    loadNotificationHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.studentId, filter]);

  const loadNotificationHistory = async () => {
    try {
      setLoading(true);

      // Get general notification history from push notification service
      let historyItems = pushNotificationService.getHistory(100).map(item => item.notification);

      // Get grade notification history (specialized service)
      if (filter === 'grade' || filter === 'all') {
        const gradeNotifications = parentGradeNotificationService.getNotificationHistory(child.studentId);
        const historyItemNotifications = historyItems.filter(n => n.type === 'grade');
        
        if (filter === 'grade') {
          historyItems = gradeNotifications;
        } else {
          // Grade notifications might be in the main history too, so combine without duplicates
          const existingIds = new Set(historyItemNotifications.map(n => n.id));
          const uniqueGradeNotifications = gradeNotifications.filter(n => !existingIds.has(n.id));
          historyItems = [...historyItems, ...uniqueGradeNotifications];
        }
      }

      // Filter by type and student
      let filteredNotifications = historyItems.filter(notification => {
        // Filter by notification type
        if (filter !== 'all' && notification.type !== filter) {
          return false;
        }

        // Filter for this specific student
        if (notification.data?.studentName === child.studentName) {
          return true;
        }

        // Also include general notifications (not child-specific)
        if (!notification.data?.studentName) {
          return true;
        }

        return false;
      });

      // Sort by timestamp (newest first)
      filteredNotifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(filteredNotifications);
      setLoading(false);
    } catch (error) {
      logger.error('Failed to load notification history:', error);
      onShowToast('Gagal memuat riwayat notifikasi', 'error');
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAsRead(true);
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);

      for (const id of unreadIds) {
        pushNotificationService.markAsRead(id);
      }

      // Refresh the list
      await loadNotificationHistory();
      onShowToast('Semua notifikasi ditandai sebagai dibaca', 'success');
    } catch (error) {
      logger.error('Failed to mark notifications as read:', error);
      onShowToast('Gagal menandai notifikasi sebagai dibaca', 'error');
    } finally {
      setMarkingAsRead(false);
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} menit yang lalu`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} jam yang lalu`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} hari yang lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const getNotificationIcon = (notification: PushNotification) => {
    switch (notification.type) {
      case 'grade':
        return (
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
case 'announcement':
        return (
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-900/30 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full mx-4">
          <LoadingSpinner text="Memuat riwayat notifikasi..." />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Riwayat Notifikasi
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {child.studentName} - {notifications.length} notifikasi
              </p>
            </div>
            <IconButton
              onClick={onClose}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
              variant="ghost"
              ariaLabel="Tutup riwayat notifikasi"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Semua' },
                { value: 'grade', label: 'Nilai' },
                { value: 'system', label: 'Sistem' },
                { value: 'announcement', label: 'Pengumuman' }
              ].map(option => (
                <Button
                  key={option.value}
                  onClick={() => setFilter(option.value as 'all' | 'grade' | 'system' | 'announcement')}
                  variant={filter === option.value ? 'primary' : 'ghost'}
                  size="sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <Button
              onClick={markAllAsRead}
              disabled={markingAsRead || notifications.filter(n => !n.read).length === 0}
              variant="ghost"
              size="sm"
              isLoading={markingAsRead}
              className="ml-auto"
            >
              {markingAsRead ? 'Menandai...' : 'Tandai Semua Dibaca'}
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <EmptyState 
              message="Tidak ada notifikasi untuk filter ini"
              icon={<CalendarIcon />}
              size="md"
              ariaLabel="Tidak ada notifikasi"
            />
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors ${
                    !notification.read ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {getNotificationIcon(notification)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium text-neutral-900 dark:text-white ${
                            !notification.read ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {notification.body}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-neutral-500 dark:text-neutral-500">
                              {formatNotificationTime(notification.timestamp)}
                            </span>
                            {notification.priority === 'high' && (
                              <Badge variant="error" size="sm">
                                Penting
                              </Badge>
                            )}
                            {!notification.read && (
                              <Badge variant="info" size="sm">
                                Baru
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <IconButton
                            onClick={() => {
                              pushNotificationService.markAsRead(notification.id);
                              loadNotificationHistory();
                            }}
                            icon={<CheckCircleIcon className="w-4 h-4" />}
                            variant="ghost"
                            ariaLabel="Tandai notifikasi sebagai dibaca"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {notifications.filter(n => !n.read).length} tidak dibaca • {notifications.length} total
            </div>
            <Button
              onClick={onClose}
              variant="primary"
            >
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import icons we're using
interface CalendarIconProps {
  className?: string;
}

const CalendarIcon: React.FC<CalendarIconProps> = ({ className = "w-12 h-12 text-neutral-400" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default NotificationHistory;