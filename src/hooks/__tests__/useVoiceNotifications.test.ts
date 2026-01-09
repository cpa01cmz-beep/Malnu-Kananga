import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceNotifications } from '../../../src/hooks/useVoiceNotifications';
import { voiceNotificationService } from '../../../src/services/voiceNotificationService';

// Mock the service
vi.mock('../../../src/services/voiceNotificationService');
const mockVoiceNotificationService = vi.mocked(voiceNotificationService);

describe('useVoiceNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockVoiceNotificationService.getSettings.mockReturnValue({
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
        attendance: true,
        system: true,
        meetings: true,
      },
    });

    mockVoiceNotificationService.getQueue.mockReturnValue([]);
    mockVoiceNotificationService.getHistory.mockReturnValue([]);
    mockVoiceNotificationService.isCurrentlySpeaking.mockReturnValue(false);
    mockVoiceNotificationService.getAvailableVoices.mockReturnValue([
      { name: 'Indonesian Voice', lang: 'id-ID', localService: true, default: false },
      { name: 'English Voice', lang: 'en-US', localService: false, default: false },
    ]);
  });

  describe('initial state', () => {
    it('should load settings from service', () => {
      const { result } = renderHook(() => useVoiceNotifications());
      
      expect(result.current.settings.enabled).toBe(true);
      expect(result.current.settings.voiceSettings.rate).toBe(1.0);
      expect(mockVoiceNotificationService.getSettings).toHaveBeenCalled();
    });

    it('should load queue from service', () => {
      const mockQueue = [
        {
          id: 'voice-1',
          notificationId: 'notif-1',
          text: 'Test notification',
          priority: 'high' as const,
          category: 'grade' as const,
          timestamp: new Date().toISOString(),
          isSpeaking: false,
          wasSpoken: false,
        },
      ];
      
      mockVoiceNotificationService.getQueue.mockReturnValue(mockQueue);
      
      const { result } = renderHook(() => useVoiceNotifications());
      
      expect(result.current.queue).toEqual(mockQueue);
      expect(mockVoiceNotificationService.getQueue).toHaveBeenCalled();
    });

    it('should load history from service', () => {
      const mockHistory = [
        {
          id: 'voice-1',
          notificationId: 'notif-1',
          text: 'Test notification',
          priority: 'high' as const,
          category: 'grade' as const,
          timestamp: new Date().toISOString(),
          isSpeaking: false,
          wasSpoken: true,
        },
      ];
      
      mockVoiceNotificationService.getHistory.mockReturnValue(mockHistory);
      
      const { result } = renderHook(() => useVoiceNotifications());
      
      expect(result.current.history).toEqual(mockHistory);
      expect(mockVoiceNotificationService.getHistory).toHaveBeenCalled();
    });

    it('should check speaking status', () => {
      mockVoiceNotificationService.isCurrentlySpeaking.mockReturnValue(true);
      
      const { result } = renderHook(() => useVoiceNotifications());
      
      expect(result.current.isSpeaking).toBe(true);
      expect(mockVoiceNotificationService.isCurrentlySpeaking).toHaveBeenCalled();
    });
  });

  describe('updateSettings', () => {
    it('should update settings through service', () => {
      const { result } = renderHook(() => useVoiceNotifications());
      
      act(() => {
        result.current.updateSettings({
          enabled: false,
          highPriorityOnly: true,
        });
      });
      
      expect(mockVoiceNotificationService.updateSettings).toHaveBeenCalledWith({
        enabled: false,
        highPriorityOnly: true,
      });
    });
  });

  describe('speech control methods', () => {
    it('should stop current notification', () => {
      const { result } = renderHook(() => useVoiceNotifications());
      
      act(() => {
        result.current.stopCurrent();
      });
      
      expect(mockVoiceNotificationService.stopCurrent).toHaveBeenCalled();
    });

    it('should skip current notification', () => {
      const { result } = renderHook(() => useVoiceNotifications());
      
      act(() => {
        result.current.skipCurrent();
      });
      
      expect(mockVoiceNotificationService.skipCurrent).toHaveBeenCalled();
    });

    it('should clear queue', () => {
      const { result } = renderHook(() => useVoiceNotifications());
      
      act(() => {
        result.current.clearQueue();
      });
      
      expect(mockVoiceNotificationService.clearQueue).toHaveBeenCalled();
    });

    it('should clear history', () => {
      const { result } = renderHook(() => useVoiceNotifications());
      
      act(() => {
        result.current.clearHistory();
      });
      
      expect(mockVoiceNotificationService.clearHistory).toHaveBeenCalled();
    });

    it('should set voice', () => {
      const { result } = renderHook(() => useVoiceNotifications());
      const mockVoice = { name: 'Test Voice', lang: 'id-ID', localService: true, default: false };
      
      act(() => {
        result.current.setVoice(mockVoice);
      });
      
      expect(mockVoiceNotificationService.setVoice).toHaveBeenCalledWith(mockVoice);
    });
  });

  describe('testVoiceNotification', () => {
    it('should create and announce test notification', () => {
      const { result } = renderHook(() => useVoiceNotifications());
      
      mockVoiceNotificationService.announceNotification.mockReturnValue(true);
      
      act(() => {
        result.current.testVoiceNotification();
      });
      
      expect(mockVoiceNotificationService.announceNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'system',
          title: 'Tes Notifikasi Suara',
          body: 'Ini adalah tes notifikasi suara dari MA Malnu Kananga Smart Portal',
          priority: 'high',
        })
      );
    });

    it('should complete test notification successfully', () => {
      const { result } = renderHook(() => useVoiceNotifications());
      
      mockVoiceNotificationService.announceNotification.mockReturnValue(true);
      
      act(() => {
        result.current.testVoiceNotification();
      });
      
      expect(mockVoiceNotificationService.announceNotification).toHaveBeenCalled();
    });

    it('should handle failed test notification', () => {
      const { result } = renderHook(() => useVoiceNotifications());
      
      mockVoiceNotificationService.announceNotification.mockReturnValue(false);
      
      act(() => {
        result.current.testVoiceNotification();
      });
      
      expect(mockVoiceNotificationService.announceNotification).toHaveBeenCalled();
    });
  });

  describe('availableVoices', () => {
    it('should get available voices from service', () => {
      const mockVoices = [
        { name: 'Voice 1', lang: 'id-ID', localService: true, default: false },
        { name: 'Voice 2', lang: 'en-US', localService: false, default: false },
      ];
      
      mockVoiceNotificationService.getAvailableVoices.mockReturnValue(mockVoices);
      
      const { result } = renderHook(() => useVoiceNotifications());
      
      expect(result.current.availableVoices).toEqual(mockVoices);
      expect(mockVoiceNotificationService.getAvailableVoices).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should not throw errors during cleanup', () => {
      const { unmount } = renderHook(() => useVoiceNotifications());
      
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
});