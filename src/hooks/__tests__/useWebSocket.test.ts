 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWebSocket, useRealtimeEvent, useRealtimeGrades } from '../useWebSocket';
import { webSocketService } from '../../services/webSocketService';
import { logger } from '../../utils/logger';

// Mock dependencies
vi.mock('../../services/webSocketService', () => ({
  webSocketService: {
    initialize: vi.fn(),
    getConnectionState: vi.fn(),
    subscribe: vi.fn(),
    disconnect: vi.fn(),
    reconnect: vi.fn(),
    isConnected: false,
  },
}));

vi.mock('../utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('useWebSocket Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(webSocketService.getConnectionState).mockReturnValue({
      connected: false,
      connecting: false,
      reconnecting: false,
      reconnectAttempts: 0,
      subscriptions: new Set(),
    });
    vi.mocked(webSocketService.subscribe).mockReturnValue(() => {});
  });

  it('should initialize WebSocket on mount', () => {
    renderHook(() => useWebSocket());

    expect(webSocketService.initialize).toHaveBeenCalled();
  });

  it('should provide connection state', () => {
    vi.mocked(webSocketService.getConnectionState).mockReturnValue({
      connected: true,
      connecting: false,
      reconnecting: false,
      reconnectAttempts: 0,
      subscriptions: new Set(['grade_updated']),
    });

    const { result } = renderHook(() => useWebSocket());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.isReconnecting).toBe(false);
    expect(result.current.connectionState.subscriptions.has('grade_updated')).toBe(true);
  });

  it('should subscribe to events and provide unsubscribe', () => {
    const mockUnsubscribe = vi.fn();
    vi.mocked(webSocketService.subscribe).mockReturnValue(mockUnsubscribe);

    const { result } = renderHook(() => useWebSocket());
    const callback = vi.fn();

    const unsubscribe = result.current.subscribe('grade_updated', callback);

    expect(webSocketService.subscribe).toHaveBeenCalledWith({
      eventType: 'grade_updated',
      callback,
      filter: undefined,
    });
    expect(typeof unsubscribe).toBe('function');
  });

  it('should support event filtering', () => {
    const mockUnsubscribe = vi.fn();
    vi.mocked(webSocketService.subscribe).mockReturnValue(mockUnsubscribe);

    const { result } = renderHook(() => useWebSocket());
    const callback = vi.fn();
    const filter = vi.fn(() => true);

    result.current.subscribe('grade_updated', callback, filter);

    expect(webSocketService.subscribe).toHaveBeenCalledWith({
      eventType: 'grade_updated',
      callback,
      filter,
    });
  });

  it('should handle reconnection', async () => {
    vi.mocked(webSocketService.reconnect).mockResolvedValue(undefined);

    const { result } = renderHook(() => useWebSocket());

    await act(async () => {
      await result.current.reconnect();
    });

    expect(webSocketService.reconnect).toHaveBeenCalled();
    expect(webSocketService.getConnectionState).toHaveBeenCalled();
  });

  it('should handle disconnection', () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.disconnect();
    });

    expect(webSocketService.disconnect).toHaveBeenCalled();
    expect(webSocketService.getConnectionState).toHaveBeenCalled();
  });

  it('should disconnect on unmount if no active subscriptions', () => {
    const { unmount } = renderHook(() => useWebSocket());

    unmount();

    expect(webSocketService.disconnect).toHaveBeenCalled();
  });
});

describe('useRealtimeEvent Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(webSocketService.getConnectionState).mockReturnValue({
      connected: false,
      connecting: false,
      reconnecting: false,
      reconnectAttempts: 0,
      subscriptions: new Set(),
    });
    vi.mocked(webSocketService.subscribe).mockReturnValue(() => {});
  });

  it('should subscribe to specific event type', () => {
    const callback = vi.fn();

    renderHook(() => useRealtimeEvent('grade_updated', callback));

    expect(webSocketService.subscribe).toHaveBeenCalledWith({
      eventType: 'grade_updated',
      callback: expect.any(Function),
      filter: undefined,
    });
  });

  it('should pass typed callback to subscription', () => {
    const callback = vi.fn();

    renderHook(() => useRealtimeEvent<{ score: number }>('grade_updated', callback));

    const subscribeCall = vi.mocked(webSocketService.subscribe).mock.calls[0];
    const wrappedCallback = subscribeCall[0].callback;

    const mockEvent = {
      type: 'grade_updated' as const,
      entity: 'grade',
      entityId: 'grade-123',
      data: { score: 95 },
      timestamp: new Date().toISOString(),
      userRole: 'teacher' as const,
      userId: 'user-123',
    };

    wrappedCallback(mockEvent);

    expect(callback).toHaveBeenCalledWith(mockEvent);
  });

  it('should support event filtering', () => {
    const callback = vi.fn();
    const filter = vi.fn(() => false);

    renderHook(() => useRealtimeEvent('grade_updated', callback, filter));

    expect(webSocketService.subscribe).toHaveBeenCalledWith({
      eventType: 'grade_updated',
      callback: expect.any(Function),
      filter,
    });
  });

  it('should unsubscribe on unmount', () => {
    const mockUnsubscribe = vi.fn();
    vi.mocked(webSocketService.subscribe).mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => 
      useRealtimeEvent('grade_updated', vi.fn())
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle array of event types', () => {
    const callback = vi.fn();

    renderHook(() => 
      useRealtimeEvent(['grade_updated', 'grade_created'] as any, callback)
    );

    expect(webSocketService.subscribe).toHaveBeenCalledWith({
      eventType: ['grade_updated', 'grade_created'],
      callback: expect.any(Function),
      filter: undefined,
    });
  });
});

describe('useRealtimeGrades Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(webSocketService.getConnectionState).mockReturnValue({
      connected: false,
      connecting: false,
      reconnecting: false,
      reconnectAttempts: 0,
      subscriptions: new Set(),
    });
    vi.mocked(webSocketService.subscribe).mockReturnValue(() => {});
  });

  it('should initialize with empty grades array', () => {
    const { result } = renderHook(() => useRealtimeGrades());

    expect(result.current).toEqual([]);
  });

  it('should handle grade creation events', () => {
    const { result } = renderHook(() => useRealtimeGrades());

    // Get the subscription callback
    const subscribeCall = vi.mocked(webSocketService.subscribe).mock.calls[0];
    const callback = subscribeCall[0].callback;

    const newGrade = {
      id: 'grade-123',
      studentId: 'student-1',
      score: 95,
      subject: 'Math',
    };

    act(() => {
      callback({
        type: 'grade_created',
        entity: 'grade',
        entityId: 'grade-123',
        data: newGrade,
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      });
    });

    expect(result.current).toEqual([newGrade]);
  });

  it('should handle grade update events', () => {
    const { result } = renderHook(() => useRealtimeGrades());

    // Setup initial grade
    const initialGrade = {
      id: 'grade-123',
      studentId: 'student-1',
      score: 85,
      subject: 'Math',
    };

    const subscribeCall = vi.mocked(webSocketService.subscribe).mock.calls[0];
    const callback = subscribeCall[0].callback;

    // Add initial grade
    act(() => {
      callback({
        type: 'grade_created',
        entity: 'grade',
        entityId: 'grade-123',
        data: initialGrade,
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      });
    });

    expect(result.current).toEqual([initialGrade]);

    // Update grade
    const updatedGrade = {
      ...initialGrade,
      score: 95,
    };

    act(() => {
      callback({
        type: 'grade_updated',
        entity: 'grade',
        entityId: 'grade-123',
        data: updatedGrade,
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      });
    });

    expect(result.current).toEqual([updatedGrade]);
  });

  it('should handle grade deletion events', () => {
    const { result } = renderHook(() => useRealtimeGrades());

    const subscribeCall = vi.mocked(webSocketService.subscribe).mock.calls[0];
    const callback = subscribeCall[0].callback;

    // Add initial grade
    const grade1 = { id: 'grade-1', score: 85 };
    const grade2 = { id: 'grade-2', score: 90 };

    act(() => {
      callback({
        type: 'grade_created',
        entity: 'grade',
        entityId: 'grade-1',
        data: grade1,
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      });
      callback({
        type: 'grade_created',
        entity: 'grade',
        entityId: 'grade-2',
        data: grade2,
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      });
    });

    expect(result.current).toEqual([grade1, grade2]);

    // Delete grade1
    act(() => {
      callback({
        type: 'grade_deleted',
        entity: 'grade',
        entityId: 'grade-1',
        data: grade1,
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      });
    });

    expect(result.current).toEqual([grade2]);
  });

  it('should filter by student ID when provided', () => {
    const specificStudentId = 'student-specific';
    const { result } = renderHook(() => useRealtimeGrades(specificStudentId));

    const subscribeCall = vi.mocked(webSocketService.subscribe).mock.calls[0];
    const wrappedCallback = subscribeCall[0].callback;

    const gradeForSpecificStudent = {
      id: 'grade-specific',
      studentId: specificStudentId,
      score: 95,
    };

    const gradeForOtherStudent = {
      id: 'grade-other',
      studentId: 'student-other',
      score: 85,
    };

    act(() => {
      // Should ignore this event
      wrappedCallback({
        type: 'grade_created',
        entity: 'grade',
        entityId: 'grade-other',
        data: gradeForOtherStudent,
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      });

      // Should process this event
      wrappedCallback({
        type: 'grade_created',
        entity: 'grade',
        entityId: 'grade-specific',
        data: gradeForSpecificStudent,
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      });
    });

    expect(result.current).toEqual([gradeForSpecificStudent]);
  });
});

describe('WebSocket Integration Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(webSocketService.getConnectionState).mockReturnValue({
      connected: false,
      connecting: false,
      reconnecting: false,
      reconnectAttempts: 0,
      subscriptions: new Set(),
    });
  });

  it('should handle initialization errors', async () => {
    const errorMessage = 'Connection failed';
    vi.mocked(webSocketService.initialize).mockRejectedValue(new Error(errorMessage));

    renderHook(() => useWebSocket());

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('useWebSocket: Failed to initialize WebSocket', expect.any(Error));
    });
  });

  it('should handle reconnection errors', async () => {
    const errorMessage = 'Reconnection failed';
    vi.mocked(webSocketService.reconnect).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useWebSocket());

    await act(async () => {
      await result.current.reconnect();
    });

    expect(logger.error).toHaveBeenCalledWith('useWebSocket: Reconnection failed', expect.any(Error));
  });

  it('should update connection state periodically', async () => {
    // Mock interval
    vi.useFakeTimers();

    const { rerender: _rerender } = renderHook(() => useWebSocket());

    expect(webSocketService.getConnectionState).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(webSocketService.getConnectionState).toHaveBeenCalledTimes(2);
    });

    vi.useRealTimers();
  });
});