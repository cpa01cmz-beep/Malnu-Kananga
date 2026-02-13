import React from 'react';
import type { PresenceData } from '../../services/webSocketService';
import { getColorClasses } from '../../config/colors';

export type PresenceIndicatorVariant = 'dot' | 'badge' | 'list' | 'avatar';

interface PresenceIndicatorProps {
  users: PresenceData[];
  variant?: PresenceIndicatorVariant;
  maxDisplay?: number;
  showCount?: boolean;
  className?: string;
  onUserClick?: (user: PresenceData) => void;
}

const baseClasses = "flex items-center gap-1";

const getStatusDotColor = (status: PresenceData['status']) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-yellow-500';
    case 'offline':
    default:
      return 'bg-neutral-400';
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':
      return getColorClasses('error', 'badge');
    case 'teacher':
      return getColorClasses('primary', 'badge');
    case 'student':
      return getColorClasses('info', 'badge');
    case 'parent':
      return getColorClasses('secondary', 'badge');
    default:
      return getColorClasses('neutral', 'badge');
  }
};

const formatLastSeen = (lastSeen: string) => {
  const date = new Date(lastSeen);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes}m lalu`;
  if (hours < 24) return `${hours}h lalu`;
  return date.toLocaleDateString('id-ID');
};

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  users,
  variant = 'dot',
  maxDisplay = 5,
  showCount = true,
  className = '',
  onUserClick,
}) => {
  const onlineUsers = users.filter(u => u.status !== 'offline');
  const displayUsers = onlineUsers.slice(0, maxDisplay);
  const remainingCount = onlineUsers.length - maxDisplay;

  if (onlineUsers.length === 0) {
    return null;
  }

  const renderDot = () => (
    <div className={`${baseClasses} ${className}`}>
      {displayUsers.map((user) => (
        <button
          key={user.userId}
          type="button"
          onClick={() => onUserClick?.(user)}
          className="relative group"
          aria-label={`${user.userName} ${user.status}`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(user.status)} ring-2 ring-white dark:ring-neutral-800`} />
          <span className="absolute -bottom-1 -right-1 text-[8px] font-medium px-1 rounded-full bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {user.userName.split(' ')[0]}
          </span>
        </button>
      ))}
      {showCount && remainingCount > 0 && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
          +{remainingCount}
        </span>
      )}
    </div>
  );

  const renderBadge = () => (
    <div className={`${baseClasses} ${className}`}>
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        {onlineUsers.length} online
      </span>
    </div>
  );

  const renderList = () => (
    <div className={`space-y-2 ${className}`}>
      {displayUsers.map((user) => (
        <button
          key={user.userId}
          type="button"
          onClick={() => onUserClick?.(user)}
          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
        >
          <div className="relative">
            <div className={`w-8 h-8 rounded-full ${getRoleBadgeColor(user.userRole)} flex items-center justify-center text-white text-sm font-medium`}>
              {user.userName.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-800 ${getStatusDotColor(user.status)}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {user.userName}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {user.status === 'online' ? user.currentPage || 'Online' : formatLastSeen(user.lastSeen)}
            </p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user.userRole)} text-white`}>
            {user.userRole}
          </span>
        </button>
      ))}
      {showCount && remainingCount > 0 && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
          +{remainingCount} lainnya
        </p>
      )}
    </div>
  );

  const renderAvatar = () => (
    <div className={`${baseClasses} -space-x-2 ${className}`}>
      {displayUsers.map((user) => (
        <button
          key={user.userId}
          type="button"
          onClick={() => onUserClick?.(user)}
          className="relative group"
          aria-label={`${user.userName} - ${user.status}`}
        >
          <div className={`w-8 h-8 rounded-full ${getRoleBadgeColor(user.userRole)} flex items-center justify-center text-white text-sm font-medium ring-2 ring-white dark:ring-neutral-800`}>
            {user.userName.charAt(0).toUpperCase()}
          </div>
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:ring-neutral-800 ${getStatusDotColor(user.status)}`} />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {user.userName}
          </div>
        </button>
      ))}
      {showCount && remainingCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium text-neutral-600 dark:text-neutral-300 ring-2 ring-white dark:ring-neutral-800">
          +{remainingCount}
        </div>
      )}
    </div>
  );

  switch (variant) {
    case 'badge':
      return renderBadge();
    case 'list':
      return renderList();
    case 'avatar':
      return renderAvatar();
    case 'dot':
    default:
      return renderDot();
  }
};

export default PresenceIndicator;
