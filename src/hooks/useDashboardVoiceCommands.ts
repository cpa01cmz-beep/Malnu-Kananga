import { useCallback, useMemo } from 'react';
import { useVoiceCommands } from './useVoiceCommands';
import type { VoiceCommand } from '../types';
import { UserRole, UserExtraRole } from '../types/permissions';
import { logger } from '../utils/logger';

interface UseDashboardVoiceCommandsOptions {
  userRole: UserRole;
  extraRole?: UserExtraRole;
  onNavigate: (view: string) => void;
  onAction: (action: string, params?: Record<string, unknown>) => void;
  onShowHelp?: () => void;
  onLogout?: () => void;
}

interface UseDashboardVoiceCommandsReturn {
  isSupported: boolean;
  handleVoiceCommand: (command: VoiceCommand) => boolean;
  getAvailableCommands: () => string[];
}

export const useDashboardVoiceCommands = ({
  userRole,
  extraRole: _extraRole,
  onNavigate,
  onAction,
  onShowHelp,
  onLogout,
}: UseDashboardVoiceCommandsOptions): UseDashboardVoiceCommandsReturn => {
  
  const { isSupported } = useVoiceCommands();

  const availableCommands = useMemo(() => {
    const commands = new Set<string>();

    // Common commands for all roles
    commands.add('GO_HOME');
    commands.add('LOGOUT');
    commands.add('HELP');
    commands.add('TOGGLE_THEME');
    commands.add('CHANGE_LANGUAGE');
    commands.add('REFRESH_PAGE');
    commands.add('ZOOM_IN');
    commands.add('ZOOM_OUT');
    commands.add('OPEN_DOCUMENTATION');

    // Role-specific commands
    switch (userRole) {
      case 'admin':
        commands.add('SHOW_PPDB');
        commands.add('VIEW_GRADES_OVERVIEW');
        commands.add('OPEN_LIBRARY');
        commands.add('SEARCH_LIBRARY');
        commands.add('GO_TO_CALENDAR');
        commands.add('SHOW_STATISTICS');
        commands.add('MANAGE_USERS');
        commands.add('MANAGE_PERMISSIONS');
        commands.add('AI_CACHE');
        commands.add('SITE_EDITOR');
        commands.add('PERFORMANCE_DASHBOARD');
        commands.add('BROWSE_MATERIALS');
        commands.add('DOWNLOAD_MATERIAL');
        commands.add('OPEN_MATERIAL');
        commands.add('VIEW_NOTIFICATION_SETTINGS');
        commands.add('CLEAR_NOTIFICATIONS');
        commands.add('VIEW_NOTIFICATION_HISTORY');
        break;

      case 'teacher':
        commands.add('SHOW_MY_CLASSES');
        commands.add('OPEN_GRADING');
        commands.add('VIEW_ATTENDANCE');
        commands.add('CREATE_ANNOUNCEMENT');
        commands.add('VIEW_SCHEDULE');
        commands.add('MATERIAL_UPLOAD');
        commands.add('SCHOOL_INVENTORY');
        commands.add('LESSON_PLANNING');
        commands.add('GENERATE_LESSON_PLAN');
        commands.add('SAVE_LESSON_PLAN');
        commands.add('EXPORT_LESSON_PLAN');
        commands.add('OPEN_LIBRARY');
        commands.add('SEARCH_LIBRARY');
        commands.add('BROWSE_MATERIALS');
        commands.add('DOWNLOAD_MATERIAL');
        commands.add('OPEN_MATERIAL');
        commands.add('REPLY_MESSAGE');
        commands.add('VIEW_MESSAGE_HISTORY');
        commands.add('VIEW_NOTIFICATION_SETTINGS');
        commands.add('CLEAR_NOTIFICATIONS');
        commands.add('VIEW_NOTIFICATION_HISTORY');
        break;

      case 'student':
        commands.add('SHOW_MY_GRADES');
        commands.add('CHECK_ATTENDANCE');
        commands.add('VIEW_INSIGHTS');
        commands.add('OPEN_LIBRARY');
        commands.add('SEARCH_LIBRARY');
        commands.add('OSIS_EVENTS');
        commands.add('LEARNING_MODULES');
        commands.add('BROWSE_MATERIALS');
        commands.add('DOWNLOAD_MATERIAL');
        commands.add('OPEN_MATERIAL');
        commands.add('REPLY_MESSAGE');
        commands.add('VIEW_MESSAGE_HISTORY');
        commands.add('VIEW_NOTIFICATION_SETTINGS');
        commands.add('CLEAR_NOTIFICATIONS');
        commands.add('VIEW_NOTIFICATION_HISTORY');
        break;

      case 'parent':
        commands.add('VIEW_CHILD_GRADES');
        commands.add('VIEW_CHILD_ATTENDANCE');
        commands.add('VIEW_CHILD_SCHEDULE');
        commands.add('SEE_NOTIFICATIONS');
        commands.add('VIEW_EVENTS');
        commands.add('MESSAGING');
        commands.add('PAYMENTS');
        commands.add('MEETINGS');
        commands.add('REPORTS');
        commands.add('CHILD_PROFILE');
        commands.add('OPEN_LIBRARY');
        commands.add('SEARCH_LIBRARY');
        commands.add('BROWSE_MATERIALS');
        commands.add('DOWNLOAD_MATERIAL');
        commands.add('OPEN_MATERIAL');
        commands.add('REPLY_MESSAGE');
        commands.add('VIEW_MESSAGE_HISTORY');
        commands.add('VIEW_NOTIFICATION_SETTINGS');
        commands.add('CLEAR_NOTIFICATIONS');
        commands.add('VIEW_NOTIFICATION_HISTORY');
        break;
    }

    return Array.from(commands);
  }, [userRole]);

  const handleVoiceCommand = useCallback((command: VoiceCommand): boolean => {
    logger.debug('Handling dashboard voice command:', command);
    
    // Check if command is available for current role
    if (!availableCommands.includes(command.action)) {
      logger.warn(`Command ${command.action} not available for role ${userRole}`);
      return false;
    }

    try {
      switch (command.action) {
        // Common commands
        case 'GO_HOME':
          onNavigate('home');
          return true;

        case 'LOGOUT':
          onLogout?.();
          return true;

        case 'HELP':
          onShowHelp?.();
          return true;

        case 'TOGGLE_THEME':
          onAction('toggle_theme');
          return true;

        case 'CHANGE_LANGUAGE':
          onAction('change_language');
          return true;

        case 'REFRESH_PAGE':
          onAction('refresh_page');
          return true;

        case 'ZOOM_IN':
          onAction('zoom_in');
          return true;

        case 'ZOOM_OUT':
          onAction('zoom_out');
          return true;

        case 'OPEN_DOCUMENTATION':
          onAction('open_documentation');
          return true;

        // Admin commands
        case 'SHOW_PPDB':
          onNavigate('ppdb');
          return true;
          
        case 'VIEW_GRADES_OVERVIEW':
          onNavigate('stats');
          return true;
          
        case 'OPEN_LIBRARY':
          onAction('open_library');
          return true;
          
        case 'GO_TO_CALENDAR':
          onAction('open_calendar');
          return true;
          
        case 'SHOW_STATISTICS':
          onNavigate('stats');
          return true;

        case 'MANAGE_USERS':
          onNavigate('users');
          return true;

        case 'MANAGE_PERMISSIONS':
          onNavigate('permissions');
          return true;

        case 'AI_CACHE':
          onNavigate('ai-cache');
          return true;

        case 'SITE_EDITOR':
          onAction('site_editor');
          return true;

        case 'PERFORMANCE_DASHBOARD':
          onNavigate('performance');
          return true;

        // ELibrary commands
        case 'BROWSE_MATERIALS':
          onAction('browse_materials');
          return true;

        case 'DOWNLOAD_MATERIAL':
          onAction('download_material', command.data);
          return true;

        case 'OPEN_MATERIAL':
          onAction('open_material', command.data);
          return true;

        // Notifications commands
        case 'VIEW_NOTIFICATION_SETTINGS':
          onAction('view_notification_settings');
          return true;

        case 'CLEAR_NOTIFICATIONS':
          onAction('clear_notifications');
          return true;

        case 'VIEW_NOTIFICATION_HISTORY':
          onAction('view_notification_history');
          return true;

        // Teacher commands
        case 'SHOW_MY_CLASSES':
          onNavigate('class');
          return true;
          
        case 'OPEN_GRADING':
          onNavigate('grading');
          return true;
          
        case 'VIEW_ATTENDANCE':
          onAction('view_attendance');
          return true;
          
        case 'CREATE_ANNOUNCEMENT':
          onAction('create_announcement');
          return true;
          
        case 'VIEW_SCHEDULE':
          onAction('view_schedule');
          return true;

        case 'MATERIAL_UPLOAD':
          onNavigate('upload');
          return true;

        case 'SCHOOL_INVENTORY':
          onNavigate('inventory');
          return true;

        case 'LESSON_PLANNING':
          onNavigate('lesson-planning');
          return true;

        case 'GENERATE_LESSON_PLAN':
          onAction('generate_lesson_plan');
          return true;

        case 'SAVE_LESSON_PLAN':
          onAction('save_lesson_plan');
          return true;

        case 'EXPORT_LESSON_PLAN':
          onAction('export_lesson_plan');
          return true;

        // Student commands
        case 'SHOW_MY_GRADES':
          onAction('show_my_grades');
          return true;
          
        case 'CHECK_ATTENDANCE':
          onAction('check_attendance');
          return true;
          
        case 'VIEW_INSIGHTS':
          onAction('view_insights');
          return true;

        case 'OSIS_EVENTS':
          onNavigate('osis');
          return true;

        case 'LEARNING_MODULES':
          onAction('learning_modules');
          return true;

        // Chat/Messaging commands
        case 'REPLY_MESSAGE':
          onAction('reply_message', command.data);
          return true;

        case 'VIEW_MESSAGE_HISTORY':
          onAction('view_message_history');
          return true;

        // Parent commands
        case 'VIEW_CHILD_GRADES':
          onAction('view_child_grades');
          return true;
          
        case 'VIEW_CHILD_ATTENDANCE':
          onAction('view_child_attendance');
          return true;
          
        case 'VIEW_CHILD_SCHEDULE':
          onAction('view_child_schedule');
          return true;
          
        case 'SEE_NOTIFICATIONS':
          onAction('see_notifications');
          return true;

        case 'VIEW_EVENTS':
          onNavigate('events');
          return true;

        case 'MESSAGING':
          onNavigate('messaging');
          return true;

        case 'PAYMENTS':
          onNavigate('payments');
          return true;

        case 'MEETINGS':
          onNavigate('meetings');
          return true;

        case 'REPORTS':
          onNavigate('reports');
          return true;

        case 'CHILD_PROFILE':
          onNavigate('profile');
          return true;

        default:
          logger.warn('Unknown dashboard command:', command.action);
          return false;
      }
    } catch (error) {
      logger.error('Error executing voice command:', error);
      return false;
    }
  }, [userRole, availableCommands, onNavigate, onAction, onShowHelp, onLogout]);

  const getAvailableCommands = useCallback(() => {
    return availableCommands;
  }, [availableCommands]);

  return {
    isSupported,
    handleVoiceCommand,
    getAvailableCommands,
  };
};