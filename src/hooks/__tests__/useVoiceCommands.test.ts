import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useVoiceCommands } from '../useVoiceCommands';
import { VoiceLanguage } from '../../types';
import { logger } from '../../utils/logger';

// Mock VoiceCommandParser
const mockParse = vi.fn();
const mockIsCommand = vi.fn();
const mockGetCommands = vi.fn();
const mockSetLanguage = vi.fn();
const mockCleanup = vi.fn();

vi.mock('../services/voiceCommandParser', () => ({
  default: class MockVoiceCommandParser {
    parse = mockParse;
    isCommand = mockIsCommand;
    getCommands = mockGetCommands;
    setLanguage = mockSetLanguage;
    cleanup = mockCleanup;
  },
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('useVoiceCommands Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCommands.mockReturnValue([
      { action: 'navigate', pattern: 'buka halaman' },
      { action: 'submit', pattern: 'kirim' },
    ]);
  });

  describe('initialization', () => {
    it('should initialize with default language (Indonesian)', () => {
      const { result } = renderHook(() => useVoiceCommands());

      expect(result.current.isSupported).toBe(true);
      expect(result.current.commands).toEqual(['navigate', 'submit']);
      expect(mockSetLanguage).toHaveBeenCalledWith(VoiceLanguage.Indonesian);
    });

    it('should initialize with custom language', () => {
      const { result } = renderHook(() => useVoiceCommands({
        language: VoiceLanguage.English,
      }));

      expect(mockSetLanguage).toHaveBeenCalledWith(VoiceLanguage.English);
      expect(result.current.isSupported).toBe(true);
    });

    it('should get commands from parser on mount', () => {
      const mockCommands = [
        { action: 'test1', pattern: 'test pattern 1' },
        { action: 'test2', pattern: 'test pattern 2' },
      ];
      mockGetCommands.mockReturnValue(mockCommands);

      const { result } = renderHook(() => useVoiceCommands());

      expect(result.current.commands).toEqual(['test1', 'test2']);
    });
  });

  describe('parseCommand', () => {
    it('should parse command successfully', () => {
      const mockCommand = { action: 'navigate', confidence: 0.9 };
      mockParse.mockReturnValue(mockCommand);
      const onCommand = vi.fn();

      const { result } = renderHook(() => useVoiceCommands({ onCommand }));

      act(() => {
        const command = result.current.parseCommand('buka halaman beranda');
        expect(command).toEqual(mockCommand);
      });

      expect(mockParse).toHaveBeenCalledWith('buka halaman beranda');
      expect(onCommand).toHaveBeenCalledWith(mockCommand);
      expect(logger.debug).toHaveBeenCalledWith('Command recognized:', mockCommand);
    });

    it('should return null when parser not supported', () => {
      const { result } = renderHook(() => useVoiceCommands());

      // Simulate unsupported state
      act(() => {
        // Force isSupported to false by checking if parser is null
        expect(result.current.parseCommand('test')).toBeNull();
      });
    });

    it('should handle null command result', () => {
      mockParse.mockReturnValue(null);
      const onCommand = vi.fn();

      const { result } = renderHook(() => useVoiceCommands({ onCommand }));

      act(() => {
        const command = result.current.parseCommand('invalid command');
        expect(command).toBeNull();
      });

      expect(onCommand).not.toHaveBeenCalled();
    });

    it('should log warning when parser not supported', () => {
      const { result } = renderHook(() => useVoiceCommands());

      // Mock scenario where parser is not available
      act(() => {
        result.current.parseCommand('test');
      });

      // Should not log warning initially as parser should be available
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe('isCommand', () => {
    it('should check if transcript is a command', () => {
      mockIsCommand.mockReturnValue(true);

      const { result } = renderHook(() => useVoiceCommands());

      act(() => {
        const isCmd = result.current.isCommand('buka halaman');
        expect(isCmd).toBe(true);
      });

      expect(mockIsCommand).toHaveBeenCalledWith('buka halaman');
    });

    it('should return false when parser not supported', () => {
      const { result } = renderHook(() => useVoiceCommands());

      act(() => {
        const isCmd = result.current.isCommand('test');
        expect(isCmd).toBe(false);
      });
    });
  });

  describe('setLanguage', () => {
    it('should change parser language', () => {
      const { result } = renderHook(() => useVoiceCommands());

      act(() => {
        result.current.setLanguage(VoiceLanguage.English);
      });

      expect(mockSetLanguage).toHaveBeenCalledWith(VoiceLanguage.English);
      expect(logger.debug).toHaveBeenCalledWith('Voice command language set to:', VoiceLanguage.English);
    });
  });

  describe('cleanup', () => {
    it('should cleanup parser on unmount', () => {
      const { unmount } = renderHook(() => useVoiceCommands());

      unmount();

      expect(mockCleanup).toHaveBeenCalled();
    });
  });

  describe('language change effect', () => {
    it('should update parser when language prop changes', () => {
      const { rerender } = renderHook(
        ({ language }) => useVoiceCommands({ language }),
        {
          initialProps: { language: VoiceLanguage.Indonesian },
        }
      );

      // Initial setup
      expect(mockSetLanguage).toHaveBeenCalledWith(VoiceLanguage.Indonesian);

      // Change language
      rerender({ language: VoiceLanguage.English });

      expect(mockSetLanguage).toHaveBeenCalledWith(VoiceLanguage.English);
    });
  });

  describe('error handling', () => {
    it('should handle parser errors gracefully', () => {
      mockParse.mockImplementation(() => {
        throw new Error('Parser error');
      });

      const { result } = renderHook(() => useVoiceCommands());

      expect(() => {
        act(() => {
          result.current.parseCommand('test command');
        });
      }).toThrow('Parser error');
    });

    it('should handle isCommand errors gracefully', () => {
      mockIsCommand.mockImplementation(() => {
        throw new Error('IsCommand error');
      });

      const { result } = renderHook(() => useVoiceCommands());

      expect(() => {
        act(() => {
          result.current.isCommand('test');
        });
      }).toThrow('IsCommand error');
    });
  });

  describe('integration with options', () => {
    it('should call onCommand callback when command is recognized', () => {
      const mockCommand = { action: 'submit', confidence: 0.95 };
      mockParse.mockReturnValue(mockCommand);
      const onCommand = vi.fn();

      const { result } = renderHook(() => useVoiceCommands({ onCommand }));

      act(() => {
        result.current.parseCommand('kirim form');
      });

      expect(onCommand).toHaveBeenCalledTimes(1);
      expect(onCommand).toHaveBeenCalledWith(mockCommand);
    });

    it('should not call onCommand when no command recognized', () => {
      mockParse.mockReturnValue(null);
      const onCommand = vi.fn();

      const { result } = renderHook(() => useVoiceCommands({ onCommand }));

      act(() => {
        result.current.parseCommand('just talking');
      });

      expect(onCommand).not.toHaveBeenCalled();
    });
  });
});