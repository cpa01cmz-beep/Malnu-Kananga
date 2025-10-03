import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../services/notificationService';

interface ToastNotificationProps {
  notification: NotificationItem;
  onClose: () => void;
  duration?: number;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onClose,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    // Auto close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'academic': return '📚';
      case 'schedule': return '📅';
      case 'grade': return '📊';
      case 'announcement': return '📢';
      case 'reminder': return '⏰';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'low':
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-700';
      default:
        return 'border-l-gray-300 bg-white dark:bg-gray-800';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`border-l-4 rounded-lg shadow-lg p-4 ${getPriorityStyles(notification.priority)}`}>
        <div className="flex items-start space-x-3">
          <span className="text-xl">{getNotificationIcon(notification.type)}</span>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {notification.title}
              </h4>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 ml-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Baru saja
              </span>
              {notification.actionUrl && (
                <button
                  onClick={() => {
                    window.location.href = notification.actionUrl!;
                    handleClose();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Lihat Detail →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;