# Custom React Hook Generator Skill

## Description
Generate custom React hooks following the MA Malnu Kananga project patterns.

## Instructions

When asked to create a custom React hook:

1. **File Location**: Create hooks in `src/hooks/`

2. **Hook Structure**:
   ```typescript
   import { useState, useEffect, useCallback } from 'react';

   // Hook return type
   interface UseHookNameReturn {
     // state values
     data: DataType | null;
     loading: boolean;
     error: Error | null;
     // actions
     fetchData: () => Promise<void>;
     reset: () => void;
   }

   // Hook parameters
   interface UseHookNameParams {
     // parameters
     id?: string;
   }

   // Hook
   export const useHookName = (params: UseHookNameParams = {}): UseHookNameReturn => {
     // State
     const [data, setData] = useState<DataType | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<Error | null>(null);

     // Effects
     useEffect(() => {
       // effect logic
     }, [dependencies]);

     // Memoized callbacks
     const fetchData = useCallback(async () => {
       try {
         setLoading(true);
         setError(null);
         // fetch logic
       } catch (err) {
         setError(err as Error);
       } finally {
         setLoading(false);
       }
     }, [dependencies]);

     // Return
     return {
       data,
       loading,
       error,
       fetchData,
       reset: () => {
         setData(null);
         setError(null);
       }
     };
   };
   ```

3. **Rules of Hooks**:
   - Only call hooks at the top level (not inside loops, conditions, or nested functions)
   - Only call hooks from React functions or custom hooks
   - Never call hooks in regular JavaScript functions

4. **Best Practices**:
   - Start with `use` prefix (e.g., useLocalStorage, useAuth)
   - Return an object with state values and actions
   - Use `useCallback` for functions that are dependencies
   - Use `useMemo` for expensive computations
   - Clean up side effects in useEffect cleanup functions
   - Provide TypeScript interfaces for params and return values

5. **Common Hook Patterns**:

   **Data Fetching Hook**:
   ```typescript
   export const useApiData = <T>(url: string) => {
     const [data, setData] = useState<T | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<Error | null>(null);

     useEffect(() => {
       // fetch logic
     }, [url]);

     return { data, loading, error, refetch };
   };
   ```

   **LocalStorage Hook**:
   ```typescript
   export const useLocalStorage = <T>(key: string, initialValue: T) => {
     // localStorage logic
   };
   ```

   **Form Hook**:
   ```typescript
   export const useForm = <T>(initialValues: T) => {
     // form handling logic
   };
   ```

   **Debounce Hook**:
   ```typescript
   export const useDebounce = <T>(value: T, delay: number) => {
     // debounce logic
   };
   ```

6. **Testing**: Always create tests in `src/hooks/__tests__/`:
   ```typescript
   import { renderHook, act, waitFor } from '@testing-library/react';
   import { describe, it, expect } from 'vitest';
   import { useHookName } from '../useHookName';

   describe('useHookName', () => {
     it('initializes with default values', () => {
       const { result } = renderHook(() => useHookName());
       expect(result.current.data).toBeNull();
     });

     it('fetches data on mount', async () => {
       const { result } = renderHook(() => useHookName({ id: '123' }));
       await waitFor(() => {
         expect(result.current.data).toBeDefined();
       });
     });
   });
   ```

7. **Patterns from the project**:
   See existing hooks for patterns:
   - `useVoiceCommands.ts` - Voice integration patterns
   - `useLocalStorage.ts` - Storage patterns
   - `useVoiceRecognition.ts` - Browser API patterns
   - `usePushNotifications.ts` - PWA patterns
   - `useVoiceSynthesis.ts` - TTS patterns

## Notes

- Keep hooks small and focused
- Extract complex logic into separate hooks
- Don't mutate arguments directly
- Return stable references (useMemo, useCallback)
- Document hook usage with JSDoc comments
- Handle error states and loading states
- Consider aborting ongoing requests on unmount
