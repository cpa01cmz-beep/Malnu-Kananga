/**
 * Test for useEventNotifications hook integration
 * This test verifies that the hook can be imported and used correctly
 */

import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useEventNotifications } from '../useEventNotifications';

// Mock the dependencies
vi.mock('../../hooks/usePushNotifications', () => ({
  usePushNotifications: () => ({
    showNotification: vi.fn().mockResolvedValue(true),
    createNotification: vi.fn().mockReturnValue({
      id: 'test-notification',
      type: 'grade',
      title: 'Test',
      body: 'Test body',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal'
    })
  })
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  }
}));

describe('useEventNotifications Hook Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  it('should provide notification functions', () => {
    const { result } = renderHook(() => useEventNotifications());

    expect(result.current).toHaveProperty('notifyGradeUpdate');
    expect(result.current).toHaveProperty('notifyPPDBStatus');
    expect(result.current).toHaveProperty('notifyLibraryUpdate');
    expect(result.current).toHaveProperty('notifyMeetingRequest');
    expect(result.current).toHaveProperty('notifyScheduleChange');
    expect(result.current).toHaveProperty('notifyAttendanceAlert');
    expect(result.current).toHaveProperty('useMonitorLocalStorage');
  });

  it('should call notifyGradeUpdate without throwing errors', async () => {
    const { result } = renderHook(() => useEventNotifications());

    await expect(
      result.current.notifyGradeUpdate('Test Student', 'Math', 80, 85)
    ).resolves.not.toThrow();
  });

  it('should call notifyLibraryUpdate without throwing errors', async () => {
    const { result } = renderHook(() => useEventNotifications());

    await expect(
      result.current.notifyLibraryUpdate('Test Material', 'PDF')
    ).resolves.not.toThrow();
  });

  it('should call notifyPPDBStatus without throwing errors', async () => {
    const { result } = renderHook(() => useEventNotifications());

    await expect(
      result.current.notifyPPDBStatus(5)
    ).resolves.not.toThrow();
  });

  it('should provide useMonitorLocalStorage function', () => {
    const { result } = renderHook(() => useEventNotifications());
    
    // useMonitorLocalStorage should be a function that can be used within components
    expect(typeof result.current.useMonitorLocalStorage).toBe('function');
  });
});