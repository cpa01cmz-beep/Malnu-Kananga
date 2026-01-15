import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardVoiceCommands } from '../useDashboardVoiceCommands';
import { UserRole } from '../../types/permissions';
import type { VoiceCommand } from '../../types';

describe('useDashboardVoiceCommands', () => {
  const mockNavigate = vi.fn();
  const mockAction = vi.fn();
  const mockShowHelp = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Role Commands', () => {
    it('should provide admin-specific available commands', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'admin',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      const commands = result.current.getAvailableCommands();
      expect(commands).toContain('GO_HOME');
      expect(commands).toContain('LOGOUT');
      expect(commands).toContain('HELP');
      expect(commands).toContain('SHOW_PPDB');
      expect(commands).toContain('VIEW_GRADES_OVERVIEW');
      expect(commands).toContain('OPEN_LIBRARY');
      expect(commands).toContain('GO_TO_CALENDAR');
      expect(commands).toContain('SHOW_STATISTICS');
      expect(commands).toContain('MANAGE_USERS');
      expect(commands).toContain('MANAGE_PERMISSIONS');
      expect(commands).toContain('AI_CACHE');
      expect(commands).toContain('SITE_EDITOR');
      expect(commands).toContain('PERFORMANCE_DASHBOARD');
    });

    it('should handle admin navigation commands', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'admin',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'go_home',
          action: 'GO_HOME',
          transcript: 'go home',
          confidence: 1.0,
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith('home');
    });

    it('should handle admin action commands', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'admin',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'open_library',
          action: 'OPEN_LIBRARY',
          transcript: 'open library',
          confidence: 1.0,
        });
      });

      expect(mockAction).toHaveBeenCalledWith('open_library');
    });
  });

  describe('Teacher Role Commands', () => {
    it('should provide teacher-specific available commands', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'teacher',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      const commands = result.current.getAvailableCommands();
      expect(commands).toContain('GO_HOME');
      expect(commands).toContain('LOGOUT');
      expect(commands).toContain('HELP');
      expect(commands).toContain('SHOW_MY_CLASSES');
      expect(commands).toContain('OPEN_GRADING');
      expect(commands).toContain('VIEW_ATTENDANCE');
      expect(commands).toContain('CREATE_ANNOUNCEMENT');
      expect(commands).toContain('VIEW_SCHEDULE');
      expect(commands).toContain('MATERIAL_UPLOAD');
      expect(commands).toContain('SCHOOL_INVENTORY');
      expect(commands).toContain('LESSON_PLANNING');
      expect(commands).toContain('GENERATE_LESSON_PLAN');
      expect(commands).toContain('SAVE_LESSON_PLAN');
      expect(commands).toContain('EXPORT_LESSON_PLAN');
    });

    it('should handle teacher navigation commands', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'teacher',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'show_my_classes',
          action: 'SHOW_MY_CLASSES',
          transcript: 'show my classes',
          confidence: 1.0,
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith('class');
    });

    it('should handle teacher action commands', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'teacher',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'generate_lesson_plan',
          action: 'GENERATE_LESSON_PLAN',
          transcript: 'buat rencana pelajaran',
          confidence: 1.0,
        });
      });

      expect(mockAction).toHaveBeenCalledWith('generate_lesson_plan');
    });
  });

  describe('Student Role Commands', () => {
    it('should provide student-specific available commands', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'student',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      const commands = result.current.getAvailableCommands();
      expect(commands).toContain('GO_HOME');
      expect(commands).toContain('LOGOUT');
      expect(commands).toContain('HELP');
      expect(commands).toContain('SHOW_MY_GRADES');
      expect(commands).toContain('CHECK_ATTENDANCE');
      expect(commands).toContain('VIEW_INSIGHTS');
      expect(commands).toContain('OPEN_LIBRARY');
      expect(commands).toContain('OSIS_EVENTS');
      expect(commands).toContain('LEARNING_MODULES');
    });

    it('should handle student action commands', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'student',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'show_my_grades',
          action: 'SHOW_MY_GRADES',
          transcript: 'nilai saya',
          confidence: 1.0,
        });
      });

      expect(mockAction).toHaveBeenCalledWith('show_my_grades');
    });
  });

  describe('Parent Role Commands', () => {
    it('should provide parent-specific available commands', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'parent',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      const commands = result.current.getAvailableCommands();
      expect(commands).toContain('GO_HOME');
      expect(commands).toContain('LOGOUT');
      expect(commands).toContain('HELP');
      expect(commands).toContain('VIEW_CHILD_GRADES');
      expect(commands).toContain('VIEW_CHILD_ATTENDANCE');
      expect(commands).toContain('VIEW_CHILD_SCHEDULE');
      expect(commands).toContain('SEE_NOTIFICATIONS');
      expect(commands).toContain('VIEW_EVENTS');
      expect(commands).toContain('MESSAGING');
      expect(commands).toContain('PAYMENTS');
      expect(commands).toContain('MEETINGS');
      expect(commands).toContain('REPORTS');
      expect(commands).toContain('CHILD_PROFILE');
    });

    it('should handle parent navigation commands', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'parent',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'view_events',
          action: 'VIEW_EVENTS',
          transcript: 'lihat kegiatan',
          confidence: 1.0,
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith('events');
    });
  });

  describe('Common Commands', () => {
    it('should provide common commands for all roles', () => {
      const roles: UserRole[] = ['admin', 'teacher', 'student', 'parent'];

      roles.forEach((role) => {
        const { result } = renderHook(() =>
          useDashboardVoiceCommands({
            userRole: role,
            onNavigate: mockNavigate,
            onAction: mockAction,
            onShowHelp: mockShowHelp,
            onLogout: mockLogout,
          })
        );

        const commands = result.current.getAvailableCommands();
        expect(commands).toContain('GO_HOME');
        expect(commands).toContain('LOGOUT');
        expect(commands).toContain('HELP');
        expect(commands).toContain('TOGGLE_THEME');
        expect(commands).toContain('CHANGE_LANGUAGE');
        expect(commands).toContain('REFRESH_PAGE');
        expect(commands).toContain('ZOOM_IN');
        expect(commands).toContain('ZOOM_OUT');
        expect(commands).toContain('OPEN_DOCUMENTATION');
      });
    });

    it('should handle logout command', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'student',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'logout',
          action: 'LOGOUT',
          transcript: 'logout',
          confidence: 1.0,
        });
      });

      expect(mockLogout).toHaveBeenCalled();
    });

    it('should handle help command', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'teacher',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'help',
          action: 'HELP',
          transcript: 'help',
          confidence: 1.0,
        });
      });

      expect(mockShowHelp).toHaveBeenCalled();
    });

    it('should handle theme toggle command', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'student',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'toggle_theme',
          action: 'TOGGLE_THEME',
          transcript: 'ubah tema',
          confidence: 1.0,
        });
      });

      expect(mockAction).toHaveBeenCalledWith('toggle_theme');
    });

    it('should handle language change command', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'parent',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'change_language',
          action: 'CHANGE_LANGUAGE',
          transcript: 'ubah bahasa',
          confidence: 1.0,
        });
      });

      expect(mockAction).toHaveBeenCalledWith('change_language');
    });

    it('should handle refresh command', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'admin',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'refresh_page',
          action: 'REFRESH_PAGE',
          transcript: 'refresh',
          confidence: 1.0,
        });
      });

      expect(mockAction).toHaveBeenCalledWith('refresh_page');
    });
  });

  describe('ELibrary Commands', () => {
    it('should provide ELibrary commands for all roles', () => {
      const roles: UserRole[] = ['admin', 'teacher', 'student', 'parent'];

      roles.forEach((role) => {
        const { result } = renderHook(() =>
          useDashboardVoiceCommands({
            userRole: role,
            onNavigate: mockNavigate,
            onAction: mockAction,
            onShowHelp: mockShowHelp,
            onLogout: mockLogout,
          })
        );

        const commands = result.current.getAvailableCommands();
        expect(commands).toContain('BROWSE_MATERIALS');
        expect(commands).toContain('DOWNLOAD_MATERIAL');
        expect(commands).toContain('OPEN_MATERIAL');
      });
    });

    it('should handle ELibrary commands', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'student',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'browse_materials',
          action: 'BROWSE_MATERIALS',
          transcript: 'jelajahi materi',
          confidence: 1.0,
        });
      });

      expect(mockAction).toHaveBeenCalledWith('browse_materials');
    });
  });

  describe('Chat/Messaging Commands', () => {
    it('should provide chat commands for relevant roles', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'teacher',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      const commands = result.current.getAvailableCommands();
      expect(commands).toContain('REPLY_MESSAGE');
      expect(commands).toContain('VIEW_MESSAGE_HISTORY');
    });

    it('should handle reply message command', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'parent',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'reply_message',
          action: 'REPLY_MESSAGE',
          transcript: 'balas pesan',
          confidence: 1.0,
        });
      });

      expect(mockAction).toHaveBeenCalledWith('reply_message', undefined);
    });
  });

  describe('Notification Commands', () => {
    it('should provide notification commands for all roles', () => {
      const roles: UserRole[] = ['admin', 'teacher', 'student', 'parent'];

      roles.forEach((role) => {
        const { result } = renderHook(() =>
          useDashboardVoiceCommands({
            userRole: role,
            onNavigate: mockNavigate,
            onAction: mockAction,
            onShowHelp: mockShowHelp,
            onLogout: mockLogout,
          })
        );

        const commands = result.current.getAvailableCommands();
        expect(commands).toContain('VIEW_NOTIFICATION_SETTINGS');
        expect(commands).toContain('CLEAR_NOTIFICATIONS');
        expect(commands).toContain('VIEW_NOTIFICATION_HISTORY');
      });
    });

    it('should handle notification settings command', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'student',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      act(() => {
        result.current.handleVoiceCommand({
          id: 'view_notification_settings',
          action: 'VIEW_NOTIFICATION_SETTINGS',
          transcript: 'pengaturan notifikasi',
          confidence: 1.0,
        });
      });

      expect(mockAction).toHaveBeenCalledWith('view_notification_settings');
    });
  });

  describe('Command Filtering by Role', () => {
    it('should not provide teacher commands to admin role', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'admin',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      const commands = result.current.getAvailableCommands();
      expect(commands).not.toContain('OPEN_GRADING');
      expect(commands).not.toContain('VIEW_ATTENDANCE');
    });

    it('should not provide admin commands to teacher role', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'teacher',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      const commands = result.current.getAvailableCommands();
      expect(commands).not.toContain('MANAGE_USERS');
      expect(commands).not.toContain('MANAGE_PERMISSIONS');
    });

    it('should not provide parent commands to student role', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'student',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      const commands = result.current.getAvailableCommands();
      expect(commands).not.toContain('VIEW_CHILD_GRADES');
      expect(commands).not.toContain('PAYMENTS');
    });
  });

  describe('Error Handling', () => {
    it('should return false for unavailable commands', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'student',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      const handled = act(() => {
        return result.current.handleVoiceCommand({
          id: 'manage_users',
          action: 'MANAGE_USERS',
          transcript: 'manage users',
          confidence: 1.0,
        });
      });

      expect(handled).toBe(false);
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('should handle unknown commands gracefully', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'teacher',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      const handled = act(() => {
        return result.current.handleVoiceCommand({
          id: 'unknown_command',
          action: 'UNKNOWN_ACTION',
          transcript: 'unknown command',
          confidence: 0.5,
        });
      });

      expect(handled).toBe(false);
    });
  });

  describe('isSupported', () => {
    it('should indicate voice commands are supported', () => {
      const { result } = renderHook(() =>
        useDashboardVoiceCommands({
          userRole: 'student',
          onNavigate: mockNavigate,
          onAction: mockAction,
          onShowHelp: mockShowHelp,
          onLogout: mockLogout,
        })
      );

      expect(result.current.isSupported).toBe(true);
    });
  });
});
