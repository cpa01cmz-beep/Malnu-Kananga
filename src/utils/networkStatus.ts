import { useEffect, useState } from 'react';
import { NETWORK_TIMING } from '../config/timing';

export interface NetworkStatus {
  isOnline: boolean;
  isSlow: boolean;
  lastCheck: Date;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const [lastCheck, setLastCheck] = useState(new Date());

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      setLastCheck(new Date());
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return;
    }

    const connection = (navigator as unknown as { connection: { effectiveType: string; downlink?: number; addEventListener: (event: string, fn: () => void) => void; removeEventListener: (event: string, fn: () => void) => void } }).connection;
    const updateSpeed = () => {
      if (connection.effectiveType === 'slow-2g' ||
          connection.effectiveType === '2g' ||
          (connection.downlink !== undefined && connection.downlink < 1)) {
        setIsSlow(true);
      } else {
        setIsSlow(false);
      }
      setLastCheck(new Date());
    };

    connection.addEventListener('change', updateSpeed);
    updateSpeed();

    return () => {
      connection.removeEventListener('change', updateSpeed);
    };
  }, []);

  return { isOnline, isSlow, lastCheck };
}

export async function checkConnectionSpeed(): Promise<{ isSlow: boolean; latency: number }> {
  const start = Date.now();

  try {
    const response = await fetch(window.location.href, {
      method: 'HEAD',
      cache: 'no-store'
    });

    const latency = Date.now() - start;

    return {
      isSlow: latency > NETWORK_TIMING.SLOW_CONNECTION_THRESHOLD || !response.ok,
      latency
    };
  } catch {
    return {
      isSlow: true,
      latency: Date.now() - start
    };
  }
}

export function getOfflineMessage(): string {
  return 'Anda sedang offline. Pastikan koneksi internet Anda aktif untuk melanjutkan.';
}

export function getSlowConnectionMessage(): string {
  return 'Koneksi internet Anda lambat. Beberapa fitur mungkin tidak berjalan optimal.';
}

export function shouldUseOfflineStorage(isOnline: boolean, isSlow: boolean): boolean {
  return !isOnline || isSlow;
}

export class NetworkError extends Error {
  constructor(message: string, public readonly isNetworkError: boolean = true) {
    super(message);
    this.name = 'NetworkError';
  }
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError && error.isNetworkError;
}
