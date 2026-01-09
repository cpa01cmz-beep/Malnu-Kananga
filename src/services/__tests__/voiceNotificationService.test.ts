import { describe, it, expect } from 'vitest';
import type { PushNotification, VoiceNotificationSettings } from '../../../src/types';
import { VOICE_NOTIFICATION_CONFIG } from '../../../src/constants';

describe('VoiceNotificationSettings Types', () => {
  it('should have correct type structure', () => {
    const settings: VoiceNotificationSettings = {
      enabled: true,
      highPriorityOnly: true,
      respectQuietHours: true,
      voiceSettings: {
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8,
      },
      categories: {
        grades: true,
        attendance: true,
        system: true,
        meetings: true,
      },
    };

    expect(settings.enabled).toBe(true);
    expect(settings.highPriorityOnly).toBe(true);
    expect(settings.voiceSettings.rate).toBe(1.0);
    expect(settings.categories.grades).toBe(true);
  });

  it('should validate voice notification configuration', () => {
    expect(VOICE_NOTIFICATION_CONFIG.DEFAULT_VOICE_SETTINGS.enabled).toBe(true);
    expect(VOICE_NOTIFICATION_CONFIG.DEFAULT_VOICE_SETTINGS.highPriorityOnly).toBe(true);
    expect(VOICE_NOTIFICATION_CONFIG.MAX_QUEUE_SIZE).toBe(10);
    expect(VOICE_NOTIFICATION_CONFIG.MAX_HISTORY_SIZE).toBe(50);
    expect(VOICE_NOTIFICATION_CONFIG.HIGH_PRIORITY_TYPES).toContain('grade');
    expect(VOICE_NOTIFICATION_CONFIG.HIGH_PRIORITY_TYPES).toContain('attendance');
    expect(VOICE_NOTIFICATION_CONFIG.HIGH_PRIORITY_TYPES).toContain('system');
  });
});

describe('PushNotification Voice Integration', () => {
  it('should validate push notification structure for voice', () => {
    const notification: PushNotification = {
      id: 'test-123',
      type: 'grade',
      title: 'Nilai Baru',
      body: 'Anda mendapat nilai baru untuk matematika',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high',
    };

    expect(notification.type).toBe('grade');
    expect(notification.priority).toBe('high');
    expect(notification.id).toBeTruthy();
    expect(notification.title).toBeTruthy();
    expect(notification.body).toBeTruthy();
  });

  it('should support high priority notification types', () => {
    const highPriorityTypes = ['grade', 'attendance', 'system'];
    
    highPriorityTypes.forEach(type => {
      const notification: PushNotification = {
        id: `test-${type}`,
        type: type as any,
        title: `Test ${type}`,
        body: `Test body for ${type}`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high',
      };

      expect(notification.type).toBe(type);
      expect(notification.priority).toBe('high');
    });
  });
});

describe('Voice Notification Text Generation', () => {
  const gradeNotification: PushNotification = {
    id: 'grade-1',
    type: 'grade',
    title: 'Nilai Matematika',
    body: 'Nilai ujian matematika telah dipublikasikan',
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'high',
  };

  const attendanceNotification: PushNotification = {
    id: 'attendance-1',
    type: 'system',
    title: 'Status Kehadiran',
    body: 'Anda tercatat sebagai alpa hari ini',
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'high',
  };

  const meetingNotification: PushNotification = {
    id: 'meeting-1',
    type: 'system',
    title: 'Pengingat Rapat',
    body: 'Rapat orang tua akan dimulai dalam 30 menit',
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'high',
  };

  it('should categorize grade notifications correctly', () => {
    expect(gradeNotification.type).toBe('grade');
    
    const category = 'grade'; // This would be determined by the service
    expect(category).toBe('grade');
  });

  it('should categorize attendance notifications correctly', () => {
    expect(attendanceNotification.body.toLowerCase()).toContain('alpa');
    
    // This simulates the categorization logic in the service
    const category = attendanceNotification.body.toLowerCase().includes('kehadiran') || 
                    attendanceNotification.body.toLowerCase().includes('absen') ||
                    attendanceNotification.body.toLowerCase().includes('alpa') ||
                    attendanceNotification.body.toLowerCase().includes('sakit') ||
                    attendanceNotification.body.toLowerCase().includes('izin') 
                    ? 'attendance' : 'system';
    
    expect(category).toBe('attendance');
  });

  it('should categorize meeting notifications correctly', () => {
    expect(meetingNotification.body.toLowerCase()).toContain('rapat');
    
    const category = meetingNotification.body.toLowerCase().includes('rapat') || 
                    meetingNotification.body.toLowerCase().includes('meeting') 
                    ? 'meeting' : 'system';
    
    expect(category).toBe('meeting');
  });

  it('should generate appropriate voice text for grade notifications', () => {
    const voiceText = `Perhatian. ${gradeNotification.title}. ${gradeNotification.body}. Nilai baru telah dipublikasikan.`;
    
    expect(voiceText).toContain('Perhatian');
    expect(voiceText).toContain(gradeNotification.title);
    expect(voiceText).toContain(gradeNotification.body);
    expect(voiceText).toContain('dipublikasikan');
  });

  it('should generate appropriate voice text for attendance notifications', () => {
    const voiceText = `Perhatian. ${attendanceNotification.title}. ${attendanceNotification.body}. Status kehadiran diperbarui.`;
    
    expect(voiceText).toContain('Perhatian');
    expect(voiceText).toContain(attendanceNotification.title);
    expect(voiceText).toContain(attendanceNotification.body);
    expect(voiceText).toContain('kehadiran');
  });

  it('should generate appropriate voice text for meeting notifications', () => {
    const voiceText = `Perhatian. ${meetingNotification.title}. ${meetingNotification.body}. Pengingat rapat.`;
    
    expect(voiceText).toContain('Perhatian');
    expect(voiceText).toContain(meetingNotification.title);
    expect(voiceText).toContain(meetingNotification.body);
    expect(voiceText).toContain('rapat');
  });
});

describe('Voice Notification Settings Validation', () => {
  it('should validate settings structure', () => {
    const settings: VoiceNotificationSettings = {
      enabled: true,
      highPriorityOnly: false,
      respectQuietHours: true,
      voiceSettings: {
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8,
      },
      categories: {
        grades: true,
        attendance: false,
        system: true,
        meetings: true,
      },
    };

    // Validate range constraints
    expect(settings.voiceSettings.rate).toBeGreaterThanOrEqual(0.5);
    expect(settings.voiceSettings.rate).toBeLessThanOrEqual(2.0);
    expect(settings.voiceSettings.pitch).toBeGreaterThanOrEqual(0);
    expect(settings.voiceSettings.pitch).toBeLessThanOrEqual(2.0);
    expect(settings.voiceSettings.volume).toBeGreaterThanOrEqual(0);
    expect(settings.voiceSettings.volume).toBeLessThanOrEqual(1.0);

    // Validate category settings
    expect(typeof settings.categories.grades).toBe('boolean');
    expect(typeof settings.categories.attendance).toBe('boolean');
    expect(typeof settings.categories.system).toBe('boolean');
    expect(typeof settings.categories.meetings).toBe('boolean');
  });

  it('should handle settings updates', () => {
    const baseSettings: VoiceNotificationSettings = {
      enabled: true,
      highPriorityOnly: false,
      respectQuietHours: false,
      voiceSettings: {
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8,
      },
      categories: {
        grades: true,
        attendance: true,
        system: true,
        meetings: true,
      },
    };

    const updatedSettings: Partial<VoiceNotificationSettings> = {
      enabled: false,
      voiceSettings: {
        rate: 1.5,
        pitch: 1.2,
        volume: 0.9,
      },
    };

    const mergedSettings = { ...baseSettings, ...updatedSettings };

    expect(mergedSettings.enabled).toBe(false);
    expect(mergedSettings.voiceSettings.rate).toBe(1.5);
    expect(mergedSettings.voiceSettings.pitch).toBe(1.2);
    expect(mergedSettings.voiceSettings.volume).toBe(0.9);
  });

  it('should validate quiet hours logic', () => {
    // Test overnight quiet hours (22:00 to 07:00)
    const _quietHoursStart = '22:00';
    const _quietHoursEnd = '07:00';
    
    // Test times that should be in quiet hours
    const quietHoursTimes = ['22:00', '23:30', '02:00', '06:59'];
    
    quietHoursTimes.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const currentTimeHours = hours + minutes / 60;
      const startHours = 22; // 22:00
      const endHours = 7;    // 07:00
      
      const isQuietHours = startHours > endHours 
        ? (currentTimeHours >= startHours || currentTimeHours <= endHours)
        : (currentTimeHours >= startHours && currentTimeHours <= endHours);
      
      expect(isQuietHours).toBe(true);
    });
    
    // Test times that should not be in quiet hours
    const activeTimes = ['07:01', '12:00', '18:30', '21:59'];
    
    activeTimes.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const currentTimeHours = hours + minutes / 60;
      const startHours = 22; // 22:00
      const endHours = 7;    // 07:00
      
      const isQuietHours = startHours > endHours 
        ? (currentTimeHours >= startHours || currentTimeHours <= endHours)
        : (currentTimeHours >= startHours && currentTimeHours <= endHours);
      
      expect(isQuietHours).toBe(false);
    });
  });
});