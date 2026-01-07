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

    // Role-specific commands
    switch (userRole) {
      case 'admin':
        commands.add('SHOW_PPDB');
        commands.add('VIEW_GRADES_OVERVIEW');
        commands.add('OPEN_LIBRARY');
        commands.add('GO_TO_CALENDAR');
        commands.add('SHOW_STATISTICS');
        break;
        
      case 'teacher':
        commands.add('SHOW_MY_CLASSES');
        commands.add('OPEN_GRADING');
        commands.add('VIEW_ATTENDANCE');
        commands.add('CREATE_ANNOUNCEMENT');
        commands.add('VIEW_SCHEDULE');
        break;
        
      case 'student':
        commands.add('SHOW_MY_GRADES');
        commands.add('CHECK_ATTENDANCE');
        commands.add('VIEW_INSIGHTS');
        commands.add('OPEN_LIBRARY');
        break;
        
      case 'parent':
        commands.add('VIEW_CHILD_GRADES');
        commands.add('VIEW_CHILD_ATTENDANCE');
        commands.add('VIEW_CHILD_SCHEDULE');
        commands.add('SEE_NOTIFICATIONS');
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