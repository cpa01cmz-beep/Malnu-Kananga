 
import { VOICE_COMMANDS } from '../constants';
import type { VoiceCommand } from '../types';
import { VoiceLanguage } from '../types';
import { logger } from '../utils/logger';

interface CommandPattern {
  id: string;
  patterns: string[];
  action: string;
  language: VoiceLanguage;
}

class VoiceCommandParser {
  private commands: Map<string, CommandPattern>;

  constructor() {
    this.commands = new Map();
    this.initializeCommands();
  }

  private initializeCommands(): void {
    // Common commands
    this.commands.set('open_settings', {
      id: 'open_settings',
      patterns: [...VOICE_COMMANDS.OPEN_SETTINGS],
      action: 'OPEN_SETTINGS',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('close_settings', {
      id: 'close_settings',
      patterns: [...VOICE_COMMANDS.CLOSE_SETTINGS],
      action: 'CLOSE_SETTINGS',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('stop_speaking', {
      id: 'stop_speaking',
      patterns: [...VOICE_COMMANDS.STOP_SPEAKING],
      action: 'STOP_SPEAKING',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('pause_speaking', {
      id: 'pause_speaking',
      patterns: [...VOICE_COMMANDS.PAUSE_SPEAKING],
      action: 'PAUSE_SPEAKING',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('resume_speaking', {
      id: 'resume_speaking',
      patterns: [...VOICE_COMMANDS.RESUME_SPEAKING],
      action: 'RESUME_SPEAKING',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('read_all', {
      id: 'read_all',
      patterns: [...VOICE_COMMANDS.READ_ALL],
      action: 'READ_ALL',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('clear_chat', {
      id: 'clear_chat',
      patterns: [...VOICE_COMMANDS.CLEAR_CHAT],
      action: 'CLEAR_CHAT',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('send_message', {
      id: 'send_message',
      patterns: [...VOICE_COMMANDS.SEND_MESSAGE],
      action: 'SEND_MESSAGE',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('toggle_voice', {
      id: 'toggle_voice',
      patterns: [...VOICE_COMMANDS.TOGGLE_VOICE],
      action: 'TOGGLE_VOICE',
      language: VoiceLanguage.Indonesian,
    });

    // Common dashboard commands
    this.commands.set('go_home', {
      id: 'go_home',
      patterns: [...VOICE_COMMANDS.GO_HOME],
      action: 'GO_HOME',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('logout', {
      id: 'logout',
      patterns: [...VOICE_COMMANDS.LOGOUT],
      action: 'LOGOUT',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('help', {
      id: 'help',
      patterns: [...VOICE_COMMANDS.HELP],
      action: 'HELP',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('toggle_theme', {
      id: 'toggle_theme',
      patterns: [...VOICE_COMMANDS.TOGGLE_THEME],
      action: 'TOGGLE_THEME',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('change_language', {
      id: 'change_language',
      patterns: [...VOICE_COMMANDS.CHANGE_LANGUAGE],
      action: 'CHANGE_LANGUAGE',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('refresh_page', {
      id: 'refresh_page',
      patterns: [...VOICE_COMMANDS.REFRESH_PAGE],
      action: 'REFRESH_PAGE',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('zoom_in', {
      id: 'zoom_in',
      patterns: [...VOICE_COMMANDS.ZOOM_IN],
      action: 'ZOOM_IN',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('zoom_out', {
      id: 'zoom_out',
      patterns: [...VOICE_COMMANDS.ZOOM_OUT],
      action: 'ZOOM_OUT',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('open_documentation', {
      id: 'open_documentation',
      patterns: [...VOICE_COMMANDS.OPEN_DOCUMENTATION],
      action: 'OPEN_DOCUMENTATION',
      language: VoiceLanguage.Indonesian,
    });

    // Admin dashboard commands
    this.commands.set('show_ppdb', {
      id: 'show_ppdb',
      patterns: [...VOICE_COMMANDS.SHOW_PPDB],
      action: 'SHOW_PPDB',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('view_grades_overview', {
      id: 'view_grades_overview',
      patterns: [...VOICE_COMMANDS.VIEW_GRADES_OVERVIEW],
      action: 'VIEW_GRADES_OVERVIEW',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('open_library', {
      id: 'open_library',
      patterns: [...VOICE_COMMANDS.OPEN_LIBRARY],
      action: 'OPEN_LIBRARY',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('search_library', {
      id: 'search_library',
      patterns: [...VOICE_COMMANDS.SEARCH_LIBRARY],
      action: 'SEARCH_LIBRARY',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('go_to_calendar', {
      id: 'go_to_calendar',
      patterns: [...VOICE_COMMANDS.GO_TO_CALENDAR],
      action: 'GO_TO_CALENDAR',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('show_statistics', {
      id: 'show_statistics',
      patterns: [...VOICE_COMMANDS.SHOW_STATISTICS],
      action: 'SHOW_STATISTICS',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('manage_users', {
      id: 'manage_users',
      patterns: [...VOICE_COMMANDS.MANAGE_USERS],
      action: 'MANAGE_USERS',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('manage_permissions', {
      id: 'manage_permissions',
      patterns: [...VOICE_COMMANDS.MANAGE_PERMISSIONS],
      action: 'MANAGE_PERMISSIONS',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('ai_cache', {
      id: 'ai_cache',
      patterns: [...VOICE_COMMANDS.AI_CACHE],
      action: 'AI_CACHE',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('site_editor', {
      id: 'site_editor',
      patterns: [...VOICE_COMMANDS.SITE_EDITOR],
      action: 'SITE_EDITOR',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('performance_dashboard', {
      id: 'performance_dashboard',
      patterns: [...VOICE_COMMANDS.PERFORMANCE_DASHBOARD],
      action: 'PERFORMANCE_DASHBOARD',
      language: VoiceLanguage.Indonesian,
    });

    // Teacher dashboard commands
    this.commands.set('show_my_classes', {
      id: 'show_my_classes',
      patterns: [...VOICE_COMMANDS.SHOW_MY_CLASSES],
      action: 'SHOW_MY_CLASSES',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('open_grading', {
      id: 'open_grading',
      patterns: [...VOICE_COMMANDS.OPEN_GRADING],
      action: 'OPEN_GRADING',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('view_attendance', {
      id: 'view_attendance',
      patterns: [...VOICE_COMMANDS.VIEW_ATTENDANCE],
      action: 'VIEW_ATTENDANCE',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('create_announcement', {
      id: 'create_announcement',
      patterns: [...VOICE_COMMANDS.CREATE_ANNOUNCEMENT],
      action: 'CREATE_ANNOUNCEMENT',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('view_schedule', {
      id: 'view_schedule',
      patterns: [...VOICE_COMMANDS.VIEW_SCHEDULE],
      action: 'VIEW_SCHEDULE',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('material_upload', {
      id: 'material_upload',
      patterns: [...VOICE_COMMANDS.MATERIAL_UPLOAD],
      action: 'MATERIAL_UPLOAD',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('school_inventory', {
      id: 'school_inventory',
      patterns: [...VOICE_COMMANDS.SCHOOL_INVENTORY],
      action: 'SCHOOL_INVENTORY',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('lesson_planning', {
      id: 'lesson_planning',
      patterns: [...VOICE_COMMANDS.LESSON_PLANNING],
      action: 'LESSON_PLANNING',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('generate_lesson_plan', {
      id: 'generate_lesson_plan',
      patterns: [...VOICE_COMMANDS.GENERATE_LESSON_PLAN],
      action: 'GENERATE_LESSON_PLAN',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('save_lesson_plan', {
      id: 'save_lesson_plan',
      patterns: [...VOICE_COMMANDS.SAVE_LESSON_PLAN],
      action: 'SAVE_LESSON_PLAN',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('export_lesson_plan', {
      id: 'export_lesson_plan',
      patterns: [...VOICE_COMMANDS.EXPORT_LESSON_PLAN],
      action: 'EXPORT_LESSON_PLAN',
      language: VoiceLanguage.Indonesian,
    });

    // Student dashboard commands
    this.commands.set('show_my_grades', {
      id: 'show_my_grades',
      patterns: [...VOICE_COMMANDS.SHOW_MY_GRADES],
      action: 'SHOW_MY_GRADES',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('check_attendance', {
      id: 'check_attendance',
      patterns: [...VOICE_COMMANDS.CHECK_ATTENDANCE],
      action: 'CHECK_ATTENDANCE',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('view_insights', {
      id: 'view_insights',
      patterns: [...VOICE_COMMANDS.VIEW_INSIGHTS],
      action: 'VIEW_INSIGHTS',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('open_library', {
      id: 'open_library',
      patterns: [...VOICE_COMMANDS.OPEN_LIBRARY],
      action: 'OPEN_LIBRARY',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('osis_events', {
      id: 'osis_events',
      patterns: [...VOICE_COMMANDS.OSIS_EVENTS],
      action: 'OSIS_EVENTS',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('learning_modules', {
      id: 'learning_modules',
      patterns: [...VOICE_COMMANDS.LEARNING_MODULES],
      action: 'LEARNING_MODULES',
      language: VoiceLanguage.Indonesian,
    });

    // Parent dashboard commands
    this.commands.set('view_child_grades', {
      id: 'view_child_grades',
      patterns: [...VOICE_COMMANDS.VIEW_CHILD_GRADES],
      action: 'VIEW_CHILD_GRADES',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('view_child_attendance', {
      id: 'view_child_attendance',
      patterns: [...VOICE_COMMANDS.VIEW_CHILD_ATTENDANCE],
      action: 'VIEW_CHILD_ATTENDANCE',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('view_child_schedule', {
      id: 'view_child_schedule',
      patterns: [...VOICE_COMMANDS.VIEW_CHILD_SCHEDULE],
      action: 'VIEW_CHILD_SCHEDULE',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('see_notifications', {
      id: 'see_notifications',
      patterns: [...VOICE_COMMANDS.SEE_NOTIFICATIONS],
      action: 'SEE_NOTIFICATIONS',
      language: VoiceLanguage.Indonesian,
    });

    // ELibrary commands
    this.commands.set('browse_materials', {
      id: 'browse_materials',
      patterns: [...VOICE_COMMANDS.BROWSE_MATERIALS],
      action: 'BROWSE_MATERIALS',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('download_material', {
      id: 'download_material',
      patterns: [...VOICE_COMMANDS.DOWNLOAD_MATERIAL],
      action: 'DOWNLOAD_MATERIAL',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('open_material', {
      id: 'open_material',
      patterns: [...VOICE_COMMANDS.OPEN_MATERIAL],
      action: 'OPEN_MATERIAL',
      language: VoiceLanguage.Indonesian,
    });

    // Chat/Messaging commands
    this.commands.set('reply_message', {
      id: 'reply_message',
      patterns: [...VOICE_COMMANDS.REPLY_MESSAGE],
      action: 'REPLY_MESSAGE',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('view_message_history', {
      id: 'view_message_history',
      patterns: [...VOICE_COMMANDS.VIEW_MESSAGE_HISTORY],
      action: 'VIEW_MESSAGE_HISTORY',
      language: VoiceLanguage.Indonesian,
    });

    // Notifications commands
    this.commands.set('view_notification_settings', {
      id: 'view_notification_settings',
      patterns: [...VOICE_COMMANDS.VIEW_NOTIFICATION_SETTINGS],
      action: 'VIEW_NOTIFICATION_SETTINGS',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('clear_notifications', {
      id: 'clear_notifications',
      patterns: [...VOICE_COMMANDS.CLEAR_NOTIFICATIONS],
      action: 'CLEAR_NOTIFICATIONS',
      language: VoiceLanguage.Indonesian,
    });

    this.commands.set('view_notification_history', {
      id: 'view_notification_history',
      patterns: [...VOICE_COMMANDS.VIEW_NOTIFICATION_HISTORY],
      action: 'VIEW_NOTIFICATION_HISTORY',
      language: VoiceLanguage.Indonesian,
    });

    logger.debug(`Initialized ${this.commands.size} voice commands`);
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '');
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const normalize = (s: string) => this.normalizeText(s);
    const normStr1 = normalize(str1);
    const normStr2 = normalize(str2);

    if (normStr1 === normStr2) return 1;
    if (normStr1.includes(normStr2) || normStr2.includes(normStr1)) return 0.9;

    const words1 = normStr1.split(' ');
    const words2 = normStr2.split(' ');

    const intersection = words1.filter((word) => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];

    return intersection.length / union.length;
  }

  public parse(transcript: string): VoiceCommand | null {
    if (!transcript || transcript.trim() === '') {
      return null;
    }

    const normalizedTranscript = this.normalizeText(transcript);
    logger.debug('Parsing transcript:', normalizedTranscript);

    let bestMatch: VoiceCommand | null = null;
    let highestScore = 0;

    for (const [, command] of this.commands) {
      for (const pattern of command.patterns) {
        const similarity = this.calculateSimilarity(normalizedTranscript, pattern);

        if (similarity > highestScore && similarity >= 0.7) {
          highestScore = similarity;
          
          // Extract query for search commands
          const extractedQuery = this.extractSearchQuery(normalizedTranscript, pattern);
          
          bestMatch = {
            id: command.id,
            action: command.action,
            transcript: transcript,
            confidence: similarity,
            data: extractedQuery ? { query: extractedQuery } : undefined,
          };

          logger.debug(`Found match: ${command.action} (confidence: ${similarity})`);
        }
      }
    }

    if (bestMatch) {
      logger.debug('Command parsed:', bestMatch);
    } else {
      logger.debug('No command recognized');
    }

    return bestMatch;
  }

  private extractSearchQuery(transcript: string, _pattern: string): string | null {
    if (transcript.includes('materi') || transcript.includes('materials') || 
        transcript.includes('perpustakaan') || transcript.includes('library')) {
      
      // Remove command words and extract the actual query
      const removalPatterns = [
        'cari materi', 'cari materi ', 'search materials', 'search materials ',
        'cari di perpustakaan', 'cari di perpustakaan ', 'search library', 'search library ',
        'materi ', 'materials ', 'perpustakaan ', 'library '
      ];

      let query = transcript;
      for (const patternToRemove of removalPatterns) {
        query = query.replace(patternToRemove, '');
      }

      query = query.trim();
      
      // Return query only if it contains meaningful content
      if (query.length > 2) {
        return this.restoreOriginalCase(query, transcript);
      }
    }
    
    return null;
  }

  private restoreOriginalCase(extracted: string, original: string): string {
    const words = extracted.split(' ');
    const originalWords = original.split(' ');
    
    return words.map((word) => {
      for (let i = 0; i < originalWords.length; i++) {
        if (this.normalizeText(originalWords[i]) === this.normalizeText(word)) {
          return originalWords[i];
        }
      }
      return word;
    })
    .join(' ')
    .trim();
  }

  public setLanguage(language: VoiceLanguage): void {
    logger.debug('Language set to:', language);
  }

  public getCommands(): CommandPattern[] {
    return Array.from(this.commands.values());
  }

  public getCommandById(id: string): CommandPattern | undefined {
    return this.commands.get(id);
  }

  public addCustomCommand(command: CommandPattern): void {
    this.commands.set(command.id, command);
    logger.debug('Custom command added:', command.id);
  }

  public removeCommand(commandId: string): boolean {
    const result = this.commands.delete(commandId);
    if (result) {
      logger.debug('Command removed:', commandId);
    }
    return result;
  }

  public isCommand(transcript: string): boolean {
    return this.parse(transcript) !== null;
  }

  public cleanup(): void {
    this.commands.clear();
    logger.debug('VoiceCommandParser cleaned up');
  }
}

export default VoiceCommandParser;