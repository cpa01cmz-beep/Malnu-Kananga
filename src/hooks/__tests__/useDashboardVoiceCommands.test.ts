import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDashboardVoiceCommands } from '../useDashboardVoiceCommands';
import { USER_ROLES } from '../../constants';
import { logger } from '../../utils/logger';
import type { VoiceCommand } from '../../types';

// Helper to create mock voice command
const createMockCommand = (action: string, confidence = 0.9): VoiceCommand => ({
  id: Math.random().toString(),
  action,
  transcript: action.toLowerCase().replace('_', ' '),
  confidence,
});

// Mock useVoiceCommands
vi.mock('../useVoiceCommands', () => ({
  useVoiceCommands: () => ({
    isSupported: true,
  }),
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useDashboardVoiceCommands Hook', () => {
  const mockOnNavigate = vi.fn();
  const mockOnAction = vi.fn();
  const mockOnShowHelp = vi.fn();
  const mockOnLogout = vi.fn();

  const defaultOptions = {
    userRole: USER_ROLES.STUDENT,
    onNavigate: mockOnNavigate,
    onAction: mockOnAction,
    onShowHelp: mockOnShowHelp,
    onLogout: mockOnLogout,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with voice command support', () => {
      const { result } = renderHook(() => useDashboardVoiceCommands(defaultOptions));

      expect(result.current.isSupported).toBe(true);
      expect(typeof result.current.handleVoiceCommand).toBe('function');
      expect(typeof result.current.getAvailableCommands).toBe('function');
    });
  });

  describe('available commands', () => {
    it('should return common commands for all roles', () => {
      const { result } = renderHook(() => useDashboardVoiceCommands(defaultOptions));

      const commands = result.current.getAvailableCommands();
      expect(commands).toContain('GO_HOME');
      expect(commands).toContain('LOGOUT');
      expect(commands).toContain('HELP');
    });

    it('should return admin-specific commands', () => {
      const { result } = renderHook(() => 
        useDashboardVoiceCommands({
          ...defaultOptions,
          userRole: USER_ROLES.ADMIN,
        })
      );

      const commands = result.current.getAvailableCommands();
      expect(commands).toContain('SHOW_PPDB');
      expect(commands).toContain('VIEW_GRADES_OVERVIEW');
      expect(commands).toContain('OPEN_LIBRARY');
      expect(commands).toContain('GO_TO_CALENDAR');
      expect(commands).toContain('SHOW_STATISTICS');
    });

    it('should return teacher-specific commands', () => {
      const { result } = renderHook(() => 
        useDashboardVoiceCommands({
          ...defaultOptions,
          userRole: USER_ROLES.TEACHER,
        })
      );

      const commands = result.current.getAvailableCommands();
      expect(commands).toContain('SHOW_MY_CLASSES');
      expect(commands).toContain('OPEN_GRADING');
      expect(commands).toContain('VIEW_ATTENDANCE');
      expect(commands).toContain('CREATE_ANNOUNCEMENT');
      expect(commands).toContain('VIEW_SCHEDULE');
      expect(commands).toContain('OPEN_MESSAGES');
      expect(commands).toContain('OPEN_GROUPS');
      expect(commands).toContain('SEND_MESSAGE');
    });

    it('should return student-specific commands', () => {
      const { result } = renderHook(() => useDashboardVoiceCommands(defaultOptions));

      const commands = result.current.getAvailableCommands();
      expect(commands).toContain('SHOW_MY_GRADES');
      expect(commands).toContain('CHECK_ATTENDANCE');
      expect(commands).toContain('VIEW_INSIGHTS');
      expect(commands).toContain('OPEN_LIBRARY');
    });

    it('should return parent-specific commands', () => {
      const { result } = renderHook(() => 
        useDashboardVoiceCommands({
          ...defaultOptions,
          userRole: USER_ROLES.PARENT,
        })
      );

      const commands = result.current.getAvailableCommands();
      expect(commands).toContain('VIEW_CHILD_GRADES');
      expect(commands).toContain('VIEW_CHILD_ATTENDANCE');
      expect(commands).toContain('VIEW_CHILD_SCHEDULE');
      expect(commands).toContain('SEE_NOTIFICATIONS');
    });
  });

  describe('command handling', () => {
    describe('common commands', () => {
      it('should handle GO_HOME command', () => {
        const { result } = renderHook(() => useDashboardVoiceCommands(defaultOptions));

        const command = createMockCommand('GO_HOME', 0.9);
        const handled = result.current.handleVoiceCommand(command);

        expect(handled).toBe(true);
        expect(mockOnNavigate).toHaveBeenCalledWith('home');
      });

      it('should handle LOGOUT command', () => {
        const { result } = renderHook(() => useDashboardVoiceCommands(defaultOptions));

        const command = createMockCommand('LOGOUT', 0.8);
        const handled = result.current.handleVoiceCommand(command);

        expect(handled).toBe(true);
        expect(mockOnLogout).toHaveBeenCalled();
      });

      it('should handle HELP command', () => {
        const { result } = renderHook(() => useDashboardVoiceCommands(defaultOptions));

        const command = createMockCommand('HELP', 0.7);
        const handled = result.current.handleVoiceCommand(command);

        expect(handled).toBe(true);
        expect(mockOnShowHelp).toHaveBeenCalled();
      });
    });

    describe('admin commands', () => {
      const adminOptions = {
        ...defaultOptions,
        userRole: USER_ROLES.ADMIN,
      };

      it('should handle SHOW_PPDB command', () => {
        const { result } = renderHook(() => useDashboardVoiceCommands(adminOptions));

        const command = createMockCommand('SHOW_PPDB', 0.9);
        const handled = result.current.handleVoiceCommand(command);

        expect(handled).toBe(true);
        expect(mockOnNavigate).toHaveBeenCalledWith('ppdb');
      });

      it('should handle OPEN_LIBRARY command', () => {
        const { result } = renderHook(() => useDashboardVoiceCommands(adminOptions));

        const command = createMockCommand('OPEN_LIBRARY', 0.8);
        const handled = result.current.handleVoiceCommand(command);

        expect(handled).toBe(true);
        expect(mockOnAction).toHaveBeenCalledWith('open_library');
      });
    });

    describe('teacher commands', () => {
      const teacherOptions = {
        ...defaultOptions,
        userRole: USER_ROLES.TEACHER,
      };

      it('should handle SHOW_MY_CLASSES command', () => {
        const { result } = renderHook(() => useDashboardVoiceCommands(teacherOptions));

        const command = createMockCommand('SHOW_MY_CLASSES', 0.9);
        const handled = result.current.handleVoiceCommand(command);

        expect(handled).toBe(true);
        expect(mockOnNavigate).toHaveBeenCalledWith('class');
      });

      it('should handle OPEN_GRADING command', () => {
        const { result } = renderHook(() => useDashboardVoiceCommands(teacherOptions));

        const command = createMockCommand('OPEN_GRADING', 0.8);
        const handled = result.current.handleVoiceCommand(command);

        expect(handled).toBe(true);
        expect(mockOnNavigate).toHaveBeenCalledWith('grading');
      });

      it('should handle VIEW_ATTENDANCE command', () => {
        const { result } = renderHook(() => useDashboardVoiceCommands(teacherOptions));

        const command = createMockCommand('VIEW_ATTENDANCE', 0.7);
        const handled = result.current.handleVoiceCommand(command);

        expect(handled).toBe(true);
        expect(mockOnAction).toHaveBeenCalledWith('view_attendance');
      });
    });

    describe('student commands', () => {
      it('should handle SHOW_MY_GRADES command', () => {
        const { result } = renderHook(() => useDashboardVoiceCommands(defaultOptions));

        const command = createMockCommand('SHOW_MY_GRADES', 0.9);
        const handled = result.current.handleVoiceCommand(command);

        expect(handled).toBe(true);
        expect(mockOnAction).toHaveBeenCalledWith('show_my_grades');
      });

      it('should handle CHECK_ATTENDANCE command', () => {
        const { result } = renderHook(() => useDashboardVoiceCommands(defaultOptions));

        const command = createMockCommand('CHECK_ATTENDANCE', 0.8);
        const handled = result.current.handleVoiceCommand(command);

        expect(handled).toBe(true);
        expect(mockOnAction).toHaveBeenCalledWith('check_attendance');
      });
    });

    describe('parent commands', () => {
      const parentOptions = {
        ...defaultOptions,
        userRole: USER_ROLES.PARENT,
      };

      it('should handle VIEW_CHILD_GRADES command', () => {
        const { result } = renderHook(() => useDashboardVoiceCommands(parentOptions));

        const command = createMockCommand('VIEW_CHILD_GRADES', 0.9);
        const handled = result.current.handleVoiceCommand(command);

        expect(handled).toBe(true);
        expect(mockOnAction).toHaveBeenCalledWith('view_child_grades');
      });

      it('should handle SEE_NOTIFICATIONS command', () => {
        const { result } = renderHook(() => useDashboardVoiceCommands(parentOptions));

        const command = createMockCommand('SEE_NOTIFICATIONS', 0.8);
        const handled = result.current.handleVoiceCommand(command);

        expect(handled).toBe(true);
        expect(mockOnAction).toHaveBeenCalledWith('see_notifications');
      });
    });
  });

  describe('command validation', () => {
    it('should reject commands not available for current role', () => {
      const { result } = renderHook(() => useDashboardVoiceCommands(defaultOptions));

      // Admin command not available for student
      const command = createMockCommand('SHOW_PPDB', 0.9);
      const handled = result.current.handleVoiceCommand(command);

      expect(handled).toBe(false);
      expect(mockOnNavigate).not.toHaveBeenCalledWith('ppdb');
      expect(logger.warn).toHaveBeenCalledWith('Command SHOW_PPDB not available for role student');
    });

    it('should handle unknown commands', () => {
      const { result } = renderHook(() => useDashboardVoiceCommands(defaultOptions));

      const command = createMockCommand('UNKNOWN_COMMAND', 0.5);
      const handled = result.current.handleVoiceCommand(command);

      expect(handled).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Unknown dashboard command:', 'UNKNOWN_COMMAND');
    });
  });

  describe('error handling', () => {
    it('should handle errors in command execution gracefully', () => {
      mockOnNavigate.mockImplementation(() => {
        throw new Error('Navigation error');
      });

      const { result } = renderHook(() => useDashboardVoiceCommands(defaultOptions));

      const command = createMockCommand('GO_HOME', 0.9);
      const handled = result.current.handleVoiceCommand(command);

      expect(handled).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Error executing voice command:', expect.any(Error));
    });

    it('should handle missing optional callbacks', () => {
      const optionsWithoutOptional = {
        userRole: USER_ROLES.STUDENT,
        onNavigate: mockOnNavigate,
        onAction: mockOnAction,
      };

      const { result } = renderHook(() => useDashboardVoiceCommands(optionsWithoutOptional));

      // Should not throw when onShowHelp or onLogout are not provided
      const helpCommand = createMockCommand('HELP', 0.9);
      const logoutCommand = createMockCommand('LOGOUT', 0.9);

      expect(() => {
        act(() => {
          result.current.handleVoiceCommand(helpCommand);
          result.current.handleVoiceCommand(logoutCommand);
        });
      }).not.toThrow();

      expect(mockOnShowHelp).not.toHaveBeenCalled();
      expect(mockOnLogout).not.toHaveBeenCalled();
    });
  });

  describe('debugging', () => {
    it('should log command handling', () => {
      const { result } = renderHook(() => useDashboardVoiceCommands(defaultOptions));

      const command = createMockCommand('GO_HOME', 0.9);
      
      act(() => {
        result.current.handleVoiceCommand(command);
      });

      expect(logger.debug).toHaveBeenCalledWith('Handling dashboard voice command:', command);
    });
  });

  describe('role changes', () => {
    it('should update available commands when role changes', () => {
      const { result, rerender } = renderHook(
        ({ userRole }) => useDashboardVoiceCommands({
          ...defaultOptions,
          userRole,
        }),
        {
          initialProps: { userRole: USER_ROLES.STUDENT },
        }
      );

      // Initial student commands
      let commands = result.current.getAvailableCommands();
      expect(commands).toContain('SHOW_MY_GRADES');
      expect(commands).not.toContain('SHOW_PPDB');

      // Change to admin role
      rerender({ userRole: USER_ROLES.ADMIN as any });

      commands = result.current.getAvailableCommands();
      expect(commands).toContain('SHOW_PPDB');
      expect(commands).not.toContain('SHOW_MY_GRADES');
    });
  });
});