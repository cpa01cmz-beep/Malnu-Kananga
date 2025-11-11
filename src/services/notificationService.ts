// Notification service untuk sistem informasi akademik
// Mendukung in-app notifications dan browser push notifications

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'academic' | 'schedule' | 'grade' | 'announcement' | 'reminder' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  data?: any;
}

export interface NotificationPreferences {
  enableBrowserNotifications: boolean;
  enableAcademicNotifications: boolean;
  enableScheduleReminders: boolean;
  enableGradeNotifications: boolean;
  enableAnnouncementNotifications: boolean;
  reminderTimeBeforeClass: number; // minutes
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

class NotificationService {
  private static NOTIFICATIONS_KEY = 'malnu_notifications';
  private static PREFERENCES_KEY = 'malnu_notification_preferences';

  // Default preferences
  private static defaultPreferences: NotificationPreferences = {
    enableBrowserNotifications: true,
    enableAcademicNotifications: true,
    enableScheduleReminders: true,
    enableGradeNotifications: true,
    enableAnnouncementNotifications: true,
    reminderTimeBeforeClass: 15,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    }
  };

  // Get all notifications
  static getNotifications(): NotificationItem[] {
    const notifications = localStorage.getItem(this.NOTIFICATIONS_KEY);
    return notifications ? JSON.parse(notifications) : [];
  }

  // Save notifications
  private static saveNotifications(notifications: NotificationItem[]): void {
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  // Add new notification
  static addNotification(notification: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): NotificationItem {
    const notifications = this.getNotifications();
    const newNotification: NotificationItem = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    notifications.unshift(newNotification);
    this.saveNotifications(notifications);

    // Show in-app notification if enabled
    if (this.shouldShowNotification(newNotification)) {
      this.showInAppNotification(newNotification);
    }

    // Show browser notification if enabled and permitted
    if (this.getPreferences().enableBrowserNotifications && this.isBrowserNotificationSupported()) {
      this.requestBrowserNotificationPermission().then(granted => {
        if (granted) {
          this.showBrowserNotification(newNotification);
        }
      });
    }

    return newNotification;
  }

  // Mark notification as read
  static markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications[index].isRead = true;
      this.saveNotifications(notifications);
    }
  }

  // Mark all notifications as read
  static markAllAsRead(): void {
    const notifications = this.getNotifications();
    notifications.forEach(n => n.isRead = true);
    this.saveNotifications(notifications);
  }

  // Delete notification
  static deleteNotification(notificationId: string): void {
    const notifications = this.getNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);
    this.saveNotifications(filtered);
  }

  // Clear all notifications
  static clearAllNotifications(): void {
    this.saveNotifications([]);
  }

  // Get unread count
  static getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.isRead).length;
  }

  // Get preferences
  static getPreferences(): NotificationPreferences {
    const prefs = localStorage.getItem(this.PREFERENCES_KEY);
    return prefs ? { ...this.defaultPreferences, ...JSON.parse(prefs) } : this.defaultPreferences;
  }

  // Save preferences
  static savePreferences(preferences: Partial<NotificationPreferences>): void {
    const currentPrefs = this.getPreferences();
    const newPrefs = { ...currentPrefs, ...preferences };
    localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(newPrefs));
  }

  // Check if should show notification based on preferences and quiet hours
  private static shouldShowNotification(notification: NotificationItem): boolean {
    const prefs = this.getPreferences();

    // Check notification type preferences
    switch (notification.type) {
      case 'academic':
        if (!prefs.enableAcademicNotifications) return false;
        break;
      case 'schedule':
        if (!prefs.enableScheduleReminders) return false;
        break;
      case 'grade':
        if (!prefs.enableGradeNotifications) return false;
        break;
      case 'announcement':
        if (!prefs.enableAnnouncementNotifications) return false;
        break;
    }

    // Check quiet hours
    if (prefs.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const startTime = parseInt(prefs.quietHours.start.replace(':', ''));
      const endTime = parseInt(prefs.quietHours.end.replace(':', ''));

      if (startTime > endTime) {
        // Quiet hours span midnight (e.g., 22:00 to 07:00)
        if (currentTime >= startTime || currentTime <= endTime) {
          return false;
        }
      } else {
        // Quiet hours within same day
        if (currentTime >= startTime && currentTime <= endTime) {
          return false;
        }
      }
    }

    return true;
  }

  // Show in-app notification (toast)
  private static showInAppNotification(notification: NotificationItem): void {
    // Dispatch custom event for components to listen to
    const event = new CustomEvent('showNotification', {
      detail: notification
    });
    window.dispatchEvent(event);
  }

  // Browser notification support check
  private static isBrowserNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  // Request browser notification permission
  private static async requestBrowserNotificationPermission(): Promise<boolean> {
    if (!this.isBrowserNotificationSupported()) return false;

    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Show browser notification
  private static showBrowserNotification(notification: NotificationItem): void {
    if (!this.isBrowserNotificationSupported() || Notification.permission !== 'granted') {
      return;
    }

    const options: NotificationOptions = {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      silent: notification.priority === 'low'
    };

    const browserNotification = new Notification(notification.title, options);

    // Track notification for cleanup
    const notificationId = setTimeout(() => {
      browserNotification.close();
    }, 10000); // Auto-close after 10 seconds
    this.scheduledReminders.push(notificationId);

    // Handle click
    browserNotification.onclick = () => {
      window.focus();
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
      browserNotification.close();
      
      // Remove from scheduled reminders
      const index = this.scheduledReminders.indexOf(notificationId);
      if (index > -1) {
        this.scheduledReminders.splice(index, 1);
      }
    };
  }

  // Schedule class reminder
  static scheduleClassReminder(scheduleItem: any, minutesBefore: number = 15): void {
    const classTime = this.parseTimeString(scheduleItem.time.split(' - ')[0]);
    const reminderTime = new Date(classTime.getTime() - (minutesBefore * 60 * 1000));

    const now = new Date();
    const delay = reminderTime.getTime() - now.getTime();

    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        this.addNotification({
          title: 'Pengingat Jadwal',
          message: `Kelas ${scheduleItem.subject} akan dimulai dalam ${minutesBefore} menit`,
          type: 'schedule',
          priority: 'medium',
          actionUrl: '/portal?tab=schedule'
        });
        
        // Remove from scheduled reminders after execution
        const index = this.scheduledReminders.indexOf(timeoutId);
        if (index > -1) {
          this.scheduledReminders.splice(index, 1);
        }
      }, delay);
      
      // Track the scheduled reminder
      this.scheduledReminders.push(timeoutId);
    }
  }

  // Parse time string to Date object
  private static parseTimeString(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private static notificationCheckInterval: NodeJS.Timeout | null = null;
  private static scheduledReminders: NodeJS.Timeout[] = [];

  // Initialize notification system
  static initialize(): void {
    // Clear existing interval if any
    if (this.notificationCheckInterval) {
      clearInterval(this.notificationCheckInterval);
    }
    
    // Clear scheduled reminders
    this.clearScheduledReminders();

    // Request notification permission on load
    if (this.isBrowserNotificationSupported() && Notification.permission === 'default') {
      this.requestBrowserNotificationPermission();
    }

    // Schedule class reminders for today
    this.scheduleTodaysReminders();

    // Set up periodic check for new notifications
    this.notificationCheckInterval = setInterval(() => {
      this.checkForScheduledNotifications();
    }, 60000); // Check every minute
  }

  // Clean up notification system
  static destroy(): void {
    if (this.notificationCheckInterval) {
      clearInterval(this.notificationCheckInterval);
      this.notificationCheckInterval = null;
    }
    
    this.clearScheduledReminders();
  }
  
  // Clear all scheduled reminders
  private static clearScheduledReminders(): void {
    this.scheduledReminders.forEach(timeout => clearTimeout(timeout));
    this.scheduledReminders = [];
  }

  // Schedule reminders for today's classes
  private static scheduleTodaysReminders(): void {
    const prefs = this.getPreferences();
    if (!prefs.enableScheduleReminders) return;

    // This would typically come from the schedule data
    // For now, we'll add some sample reminders
    const todaySchedule = [
      { time: '07:00', subject: 'Matematika' },
      { time: '08:45', subject: 'Fisika' },
      { time: '10:30', subject: 'Bahasa Indonesia' }
    ];

    todaySchedule.forEach(schedule => {
      this.scheduleClassReminder(schedule, prefs.reminderTimeBeforeClass);
    });
  }

  // Check for scheduled notifications
  private static checkForScheduledNotifications(): void {
    // This would check for scheduled notifications from the server
    // For now, we'll simulate some academic notifications
    const lastCheck = localStorage.getItem('malnu_last_notification_check');
    const now = Date.now();

    // Check every 5 minutes for demo purposes
    if (!lastCheck || now - parseInt(lastCheck) > 300000) {
      localStorage.setItem('malnu_last_notification_check', now.toString());

      // Simulate random academic notifications
      if (Math.random() < 0.3) { // 30% chance
        this.addNotification({
          title: 'Nilai Baru Tersedia',
          message: 'Nilai ujian Matematika telah diupdate. Silakan cek portal akademik.',
          type: 'grade',
          priority: 'medium',
          actionUrl: '/portal?tab=grades'
        });
      }
    }
  }
}

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  NotificationService.initialize();
}

export { NotificationService };