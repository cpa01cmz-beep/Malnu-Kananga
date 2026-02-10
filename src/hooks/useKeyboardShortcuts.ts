import { useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
  disabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true
}: UseKeyboardShortcutsOptions) => {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                         target.tagName === 'TEXTAREA' || 
                         target.isContentEditable;
    
    if (isInputField && !event.ctrlKey && !event.metaKey) {
      return;
    }

    for (const shortcut of shortcutsRef.current) {
      if (shortcut.disabled) continue;

      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
      const metaMatch = !!shortcut.metaKey === event.metaKey;
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
      const altMatch = !!shortcut.altKey === event.altKey;

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
        logger.debug(`Keyboard shortcut triggered: ${shortcut.description}`);
        
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        
        shortcut.action();
        break;
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: shortcutsRef.current
  };
};

export default useKeyboardShortcuts;
