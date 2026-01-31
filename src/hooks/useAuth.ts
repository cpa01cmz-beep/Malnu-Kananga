import { useEffect, useState } from 'react';
import type { User } from '../types';
import { authAPI } from '../services/apiService';
import { STORAGE_KEYS } from '../constants';

export interface UseAuthResult {
  user: User | null;
  isAuthenticated: boolean;
  refreshAuth: () => void;
}

/**
 * Hook for reactive authentication state management.
 *
 * This hook provides up-to-date authentication state by listening to:
 * - Storage events (auth token changes from other windows/tabs)
 * - Window focus events (re-checks auth when window regains focus)
 * - Periodic checks (every 5 seconds for token updates)
 *
 * This ensures permission checks always use current user data,
 * preventing stale permission states after login/logout/role changes.
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, refreshAuth } = useAuth();
 *
 * if (!isAuthenticated) return <LoginPrompt />;
 *
 * return <WelcomeUser name={user?.name} />;
 * ```
 */
export const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<User | null>(() => authAPI.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authAPI.isAuthenticated());

  /**
   * Refresh authentication state from localStorage
   */
  const refreshAuth = (): void => {
    const currentUser = authAPI.getCurrentUser();
    const currentAuthStatus = authAPI.isAuthenticated();

    setUser(currentUser);
    setIsAuthenticated(currentAuthStatus);
  };

  useEffect(() => {
    /**
     * Handle storage events (auth token changes from other windows/tabs)
     */
    const handleStorageChange = (event: Event): void => {
      const storageEvent = event as StorageEvent; // eslint-disable-line no-undef
      if (storageEvent.key === STORAGE_KEYS.AUTH_TOKEN || storageEvent.key === STORAGE_KEYS.REFRESH_TOKEN) {
        refreshAuth();
      }
    };

    /**
     * Handle window focus events (re-check auth when window regains focus)
     */
    const handleFocus = (): void => {
      refreshAuth();
    };

    /**
     * Periodic check for token updates (catches token refresh events)
     */
    const interval = setInterval(() => {
      refreshAuth();
    }, 5000); // Check every 5 seconds

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []); // Empty deps - listeners are added once on mount

  return {
    user,
    isAuthenticated,
    refreshAuth
  };
};
