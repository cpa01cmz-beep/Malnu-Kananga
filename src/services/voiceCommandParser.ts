 
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
          bestMatch = {
            id: command.id,
            action: command.action,
            transcript: transcript,
            confidence: similarity,
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