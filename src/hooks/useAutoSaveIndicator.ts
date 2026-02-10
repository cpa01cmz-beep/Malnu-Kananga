import { useState, useCallback, useRef, useEffect } from 'react';
import { COMPONENT_DELAYS } from '../constants';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveOptions {
  onSave: (value: string) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

export interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  lastSaved: Date | undefined;
  errorMessage: string | undefined;
  triggerSave: (value: string) => void;
  reset: () => void;
}

export const useAutoSave = (options: UseAutoSaveOptions): UseAutoSaveReturn => {
  const { onSave, debounceMs = COMPONENT_DELAYS.AUTO_SAVE_INDICATOR, enabled = true } = options;
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValueRef = useRef<string>('');

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setStatus('idle');
    setErrorMessage(undefined);
  }, []);

  const triggerSave = useCallback(
    (value: string) => {
      if (!enabled) return;

      pendingValueRef.current = value;
      setStatus('saving');
      setErrorMessage(undefined);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          await onSave(pendingValueRef.current);
          setStatus('saved');
          setLastSaved(new Date());
        } catch (error) {
          setStatus('error');
          setErrorMessage(error instanceof Error ? error.message : 'Gagal menyimpan');
        }
      }, debounceMs);
    },
    [onSave, debounceMs, enabled]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    lastSaved,
    errorMessage,
    triggerSave,
    reset,
  };
};

export default useAutoSave;
