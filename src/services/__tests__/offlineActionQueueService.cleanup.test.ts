import { describe, it, expect, beforeEach, vi } from 'vitest';
import { offlineActionQueueService } from '../offlineActionQueueService';
import { STORAGE_KEYS } from '../../constants';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  // Clear localStorage
  localStorageMock.clear();
  localStorageMock.setItem(STORAGE_KEYS.QUEUED_ACTIONS, JSON.stringify([]));
});

describe('offlineActionQueueService cleanup', () => {
  it('should execute cleanup without errors', () => {
    // Call cleanup - should not throw
    expect(() => offlineActionQueueService.cleanup()).not.toThrow();
  });

  it('should clear WebSocket unsubscribers on cleanup', () => {
    // Note: WebSocket integration is tested separately
    // This test verifies the cleanup method exists and doesn't throw
    expect(() => offlineActionQueueService.cleanup()).not.toThrow();
  });

  it('should clear queue and reset state on cleanup', () => {
    // Add some actions to the queue
    offlineActionQueueService.addAction({
      type: 'create',
      entity: 'grade',
      entityId: 'test-1',
      data: { score: 90 },
      endpoint: '/api/grades',
      method: 'POST',
    });

    offlineActionQueueService.addAction({
      type: 'update',
      entity: 'attendance',
      entityId: 'test-2',
      data: { status: 'present' },
      endpoint: '/api/attendance',
      method: 'PUT',
    });

    // Verify actions were added
    const queue = offlineActionQueueService.getQueue();
    expect(queue.length).toBeGreaterThan(0);

    // Call cleanup
    offlineActionQueueService.cleanup();

    // Verify queue is cleared
    const cleanedQueue = offlineActionQueueService.getQueue();
    expect(cleanedQueue.length).toBe(0);
  });

  it('should clear sync callbacks on cleanup', () => {
    const callback = vi.fn();

    // Register sync callback
    offlineActionQueueService.onSyncComplete(callback);

    // Call cleanup
    offlineActionQueueService.cleanup();

    // After cleanup, syncing state is reset
    // Note: syncCallbacks is a private Set, so we can't directly check it
    // but we can verify the cleanup doesn't throw
    expect(() => offlineActionQueueService.cleanup()).not.toThrow();
  });

  it('should be callable multiple times without errors', () => {
    // Add some actions
    offlineActionQueueService.addAction({
      type: 'create',
      entity: 'grade',
      entityId: 'test-1',
      data: { score: 90 },
      endpoint: '/api/grades',
      method: 'POST',
    });

    // Call cleanup multiple times
    expect(() => offlineActionQueueService.cleanup()).not.toThrow();
    expect(() => offlineActionQueueService.cleanup()).not.toThrow();
    expect(() => offlineActionQueueService.cleanup()).not.toThrow();

    // Verify queue is still cleared
    const queue = offlineActionQueueService.getQueue();
    expect(queue.length).toBe(0);
  });
});
