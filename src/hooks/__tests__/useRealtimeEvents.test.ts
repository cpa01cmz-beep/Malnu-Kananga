import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealtimeEvents } from '../useRealtimeEvents';
import { webSocketService } from '../../services/webSocketService';
import type { RealTimeEvent, RealTimeEventType } from '../../services/webSocketService';

vi.unmock('react');

vi.mock('../services/webSocketService', () => ({
  webSocketService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    getConnectionState: vi.fn(() => ({
      connected: false,
      connecting: false,
      reconnecting: false,
      reconnectAttempts: 0,
      subscriptions: new Set<RealTimeEventType>(),
    })),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

describe('useRealtimeEvents', () => {
  const mockEvent: RealTimeEvent = {
    type: 'grade_updated',
    entity: 'grade',
    entityId: '123',
    data: { id: '123', score: 95 },
    timestamp: new Date().toISOString(),
    userRole: 'teacher',
    userId: 'teacher-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useRealtimeEvents({
        eventTypes: ['grade_updated', 'grade_created'],
        enabled: true,
      })
    );

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.lastEvent).toBe(null);
    expect(result.current.eventCount).toBe(0);
    expect(result.current.reconnectAttempts).toBe(0);
  });

  it('should initialize WebSocket when enabled', () => {
    renderHook(() =>
      useRealtimeEvents({
        eventTypes: ['grade_updated'],
        enabled: true,
      })
    );

    expect(webSocketService.initialize).toHaveBeenCalled();
  });

  it('should not initialize WebSocket when disabled', () => {
    renderHook(() =>
      useRealtimeEvents({
        eventTypes: ['grade_updated'],
        enabled: false,
      })
    );

    expect(webSocketService.initialize).not.toHaveBeenCalled();
  });

  it('should subscribe to specified event types', () => {
    const eventTypes: RealTimeEventType[] = ['grade_updated', 'grade_created', 'attendance_marked'];

    renderHook(() =>
      useRealtimeEvents({
        eventTypes,
        enabled: true,
      })
    );

    expect(webSocketService.subscribe).toHaveBeenCalledTimes(eventTypes.length);
  });

  it('should update last event and count when event received', () => {
    const { result } = renderHook(() =>
      useRealtimeEvents({
        eventTypes: ['grade_updated'],
        enabled: true,
      })
    );

    const mockCallback = (webSocketService.subscribe as any).mock.calls[0][0].callback;

    act(() => {
      mockCallback(mockEvent);
    });

    expect(result.current.lastEvent).toEqual(mockEvent);
    expect(result.current.eventCount).toBe(1);
  });

  it('should call onEvent callback when event received', () => {
    const onEventMock = vi.fn();

    renderHook(() =>
      useRealtimeEvents({
        eventTypes: ['grade_updated'],
        enabled: true,
        onEvent: onEventMock,
      })
    );

    const mockCallback = (webSocketService.subscribe as any).mock.calls[0][0].callback;

    act(() => {
      mockCallback(mockEvent);
    });

    expect(onEventMock).toHaveBeenCalledWith(mockEvent);
  });

  it('should filter events based on filter function', () => {
    const filter = (event: RealTimeEvent) => event.entityId === '123';

    const { result } = renderHook(() =>
      useRealtimeEvents({
        eventTypes: ['grade_updated'],
        enabled: true,
        filter,
      })
    );

    const mockCallback = (webSocketService.subscribe as any).mock.calls[0][0].callback;

    const filteredEvent = { ...mockEvent, entityId: '456' };

    act(() => {
      mockCallback(mockEvent);
      mockCallback(filteredEvent);
    });

    expect(result.current.eventCount).toBe(1);
    expect(result.current.lastEvent).toEqual(mockEvent);
  });

  it('should return unsubscribe function', () => {
    const { unmount } = renderHook(() =>
      useRealtimeEvents({
        eventTypes: ['grade_updated'],
        enabled: true,
      })
    );

    const unsubscribe = (webSocketService.subscribe as any).mock.calls[0][1];
    expect(typeof unsubscribe).toBe('function');

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('should update connection state periodically', () => {
    (webSocketService.getConnectionState as any).mockReturnValue({
      connected: true,
      connecting: false,
      reconnecting: false,
      reconnectAttempts: 0,
      subscriptions: new Set<RealTimeEventType>(),
    });

    const { result } = renderHook(() =>
      useRealtimeEvents({
        eventTypes: ['grade_updated'],
        enabled: true,
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isConnected).toBe(true);
  });

  it('should track multiple events', () => {
    const { result } = renderHook(() =>
      useRealtimeEvents({
        eventTypes: ['grade_updated'],
        enabled: true,
      })
    );

    const mockCallback = (webSocketService.subscribe as any).mock.calls[0][0].callback;

    act(() => {
      mockCallback(mockEvent);
      mockCallback({ ...mockEvent, entityId: '456' });
      mockCallback({ ...mockEvent, entityId: '789' });
    });

    expect(result.current.eventCount).toBe(3);
  });

  it('should handle errors in event callback gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const onEventMock = vi.fn(() => {
      throw new Error('Test error');
    });

    renderHook(() =>
      useRealtimeEvents({
        eventTypes: ['grade_updated'],
        enabled: true,
        onEvent: onEventMock,
      })
    );

    const mockCallback = (webSocketService.subscribe as any).mock.calls[0][0].callback;

    act(() => {
      mockCallback(mockEvent);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
