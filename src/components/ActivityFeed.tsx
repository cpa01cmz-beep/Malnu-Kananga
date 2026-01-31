import React, { useState, useEffect, useMemo } from 'react';
import type { RealTimeEvent, RealTimeEventType } from '../services/webSocketService';
import { useRealtimeEvents } from '../hooks/useRealtimeEvents';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { logger } from '../utils/logger';
import { STORAGE_KEYS, ACTIVITY_NOTIFICATION_CONFIG } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';
import ChatBubbleLeftRightIcon from './icons/ChatBubbleLeftRightIcon';
import { unifiedNotificationManager } from '../services/unifiedNotificationManager';

export type ActivityType =
  | 'grade_updated'
  | 'grade_created'
  | 'attendance_marked'
  | 'attendance_updated'
  | 'library_material_added'
  | 'library_material_updated'
  | 'announcement_created'
  | 'announcement_updated'
  | 'event_created'
  | 'event_updated'
  | 'message_created'
  | 'message_updated';

export interface Activity extends RealTimeEvent {
  id: string;
  isRead: boolean;
}

interface ActivityFeedProps {
  userId: string;
  userRole: string;
  eventTypes: string[];
  showFilter?: boolean;
  maxActivities?: number;
  onActivityClick?: (activity: Activity) => void;
}

const ACTIVITY_TYPE_LABELS: Record<ActivityType, { label: string; icon: React.ReactNode }> = {
  grade_updated: {
    label: 'Nilai Diperbarui',
    icon: <span className="w-4 h-4 flex items-center justify-center"><AcademicCapIcon /></span>,
  },
  grade_created: {
    label: 'Nilai Baru',
    icon: <span className="w-4 h-4 flex items-center justify-center"><AcademicCapIcon /></span>,
  },
  attendance_marked: {
    label: 'Kehadiran Dicatat',
    icon: <CalendarDaysIcon className="w-4 h-4" />,
  },
  attendance_updated: {
    label: 'Kehadiran Diperbarui',
    icon: <CalendarDaysIcon className="w-4 h-4" />,
  },
  library_material_added: {
    label: 'Material Ditambahkan',
    icon: <BookOpenIcon className="w-4 h-4" />,
  },
  library_material_updated: {
    label: 'Material Diperbarui',
    icon: <BookOpenIcon className="w-4 h-4" />,
  },
  announcement_created: {
    label: 'Pengumuman Baru',
    icon: <span className="w-4 h-4 flex items-center justify-center"><MegaphoneIcon className="w-4 h-4" /></span>,
  },
  announcement_updated: {
    label: 'Pengumuman Diperbarui',
    icon: <span className="w-4 h-4 flex items-center justify-center"><MegaphoneIcon className="w-4 h-4" /></span>,
  },
  event_created: {
    label: 'Acara Baru',
    icon: <CalendarDaysIcon className="w-4 h-4" />,
  },
  event_updated: {
    label: 'Acara Diperbarui',
    icon: <CalendarDaysIcon className="w-4 h-4" />,
  },
  message_created: {
    label: 'Pesan Baru',
    icon: <span className="w-4 h-4 flex items-center justify-center"><ChatBubbleLeftRightIcon /></span>,
  },
  message_updated: {
    label: 'Pesan Diperbarui',
    icon: <span className="w-4 h-4 flex items-center justify-center"><ChatBubbleLeftRightIcon /></span>,
  },
};

const getGroupedActivities = (activities: Activity[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() - 7);

  const groups: Record<string, Activity[]> = {
    HariIni: [],
    Kemarin: [],
    MingguIni: [],
  };

  activities.forEach((activity) => {
    const activityDate = new Date(activity.timestamp);

    if (activityDate >= today) {
      groups.HariIni.push(activity);
    } else if (activityDate >= yesterday) {
      groups.Kemarin.push(activity);
    } else if (activityDate >= thisWeek) {
      groups.MingguIni.push(activity);
    }
  });

  return Object.entries(groups)
    .filter(([_, activities]) => activities.length > 0)
    .map(([label, activities]) => ({ label, activities }));
};

const generateNotificationTitle = (event: RealTimeEvent): string => {
  const label = ACTIVITY_TYPE_LABELS[event.type as ActivityType];
  return label?.label || 'Aktivitas Baru';
};

const generateNotificationBody = (event: RealTimeEvent): string => {
  const activityInfo = ACTIVITY_TYPE_LABELS[event.type as ActivityType];
  const entityLabel = activityInfo?.label || event.entity || 'Item';
  const userLabel = event.userId === event.userRole ? 'Anda' : event.userRole;
  return `${userLabel} - ${entityLabel}`;
};

const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffMs = now.getTime() - activityTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return activityTime.toLocaleDateString('id-ID');
};

const ActivityItem: React.FC<{ activity: Activity; onClick?: () => void }> = ({ activity, onClick }) => {
  const activityInfo = ACTIVITY_TYPE_LABELS[activity.type as ActivityType] || {
    label: 'Aktivitas',
    icon: <span className="w-4 h-4 flex items-center justify-center"><SparklesIcon /></span>,
  };

  return (
    <div
      className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${activity.isRead ? 'opacity-60' : 'bg-blue-50'}`}
      onClick={onClick}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
        {activityInfo.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900 truncate">{activityInfo.label}</p>
          {!activity.isRead && (
            <span className="w-2 h-2 rounded-full bg-blue-600" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {activity.userId === activity.userRole ? 'Anda' : activity.userRole} - {activity.entity}
        </p>
        <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(activity.timestamp)}</p>
      </div>
    </div>
  );
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  userId: _userId,
  userRole: _userRole,
  eventTypes,
  showFilter = true,
  maxActivities = 50,
  onActivityClick,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const { isConnected, isConnecting } = useRealtimeEvents({
    eventTypes: eventTypes as RealTimeEventType[],
    enabled: true,
    onEvent: (event) => {
      const newActivity: Activity = {
        ...event,
        id: `${event.type}-${event.entityId}-${Date.now()}`,
        isRead: false,
      };

      setActivities((prev) => {
        const updated = [newActivity, ...prev].slice(0, maxActivities);
        localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(updated));
        return updated;
      });

      const settings = unifiedNotificationManager.getUnifiedSettings();
      if (settings.enabled) {
        const notificationType = ACTIVITY_NOTIFICATION_CONFIG.getNotificationType(event.type);
        const shouldTrigger = ACTIVITY_NOTIFICATION_CONFIG.shouldTriggerNotification(event.type, settings);

        if (shouldTrigger) {
          const priority = ACTIVITY_NOTIFICATION_CONFIG.getPriority(event.type);
          const notification = {
            id: `activity-${event.type}-${event.entityId}-${Date.now()}`,
            type: notificationType,
            title: generateNotificationTitle(event),
            body: generateNotificationBody(event),
            timestamp: new Date().toISOString(),
            read: false,
            priority: priority === 'high' ? 'high' : priority === 'normal' ? 'normal' : 'low' as 'high' | 'normal' | 'low',
            targetRoles: undefined,
            data: {
              activityId: event.type,
              entityType: event.entity,
              entityId: event.entityId,
              event,
            },
          };
          unifiedNotificationManager.showNotification(notification);
          logger.debug(`Notification triggered for event: ${event.type}`);
        }
      }
    },
  });

  useEffect(() => {
    const cachedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITY_FEED);
    if (cachedActivities) {
      try {
        const parsed: Activity[] = JSON.parse(cachedActivities);
        setActivities(parsed);
      } catch (error) {
        logger.error('Error parsing cached activities:', error);
      }
    }
  }, []);

  useEffect(() => {
    const count = activities.filter((a) => !a.isRead).length;
    setUnreadCount(count);
  }, [activities]);

  const handleMarkAsRead = (activityId: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === activityId ? { ...activity, isRead: true } : activity
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setActivities((prev) => prev.map((activity) => ({ ...activity, isRead: true })));
  };

  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    if (filter === 'unread') return activities.filter((a) => !a.isRead);
    return activities.filter((a) => a.type === filter);
  }, [activities, filter]);

  const groupedActivities = useMemo(() => getGroupedActivities(filteredActivities), [filteredActivities]);

  const uniqueActivityTypes = useMemo(() => {
    const types = new Set<ActivityType>();
    activities.forEach((activity) => {
      if (activity.type in ACTIVITY_TYPE_LABELS) {
        types.add(activity.type as ActivityType);
      }
    });
    return Array.from(types);
  }, [activities]);

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Aktivitas</h3>
            {unreadCount > 0 && (
              <Badge variant="blue">{unreadCount} baru</Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              title={isConnected ? 'Terhubung' : 'Terputus'}
            />
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost" onClick={handleMarkAllAsRead}>
                Tandai semua dibaca
              </Button>
            )}
          </div>
        </div>

        {showFilter && uniqueActivityTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'primary' : 'ghost'}
              onClick={() => setFilter('all')}
            >
              Semua
            </Button>
            <Button
              size="sm"
              variant={filter === 'unread' ? 'primary' : 'ghost'}
              onClick={() => setFilter('unread')}
            >
              Belum Dibaca
            </Button>
            {uniqueActivityTypes.map((type) => (
              <Button
                key={type}
                size="sm"
                variant={filter === type ? 'primary' : 'ghost'}
                onClick={() => setFilter(type)}
              >
                {ACTIVITY_TYPE_LABELS[type].label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isConnecting ? (
          <div className="text-center py-8 text-gray-500">
            <p>Menghubungkan ke server...</p>
          </div>
        ) : groupedActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="w-12 h-12 mx-auto mb-3 text-gray-400 flex items-center justify-center"><SparklesIcon /></span>
            <p>Belum ada aktivitas</p>
          </div>
        ) : (
          groupedActivities.map(({ label, activities: groupActivities }) => (
            <div key={label} className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3">{label}</h4>
              <div className="space-y-2">
                {groupActivities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onClick={() => {
                      handleMarkAsRead(activity.id);
                      if (onActivityClick) {
                        onActivityClick(activity);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ActivityFeed;
