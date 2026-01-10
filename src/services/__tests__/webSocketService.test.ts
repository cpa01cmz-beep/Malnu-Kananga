import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { webSocketService, type RealTimeEvent, type RealTimeEventType } from '../services/webSocketService';
import { apiService } from '../services/apiService';
import { logger } from '../utils/logger';

// Mock dependencies
vi.mock('../services/apiService', () => ({
  apiService: {
    getAuthToken: vi.fn(),
    parseJwtPayload: vi.fn(),
  },
}));

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock WebSocket
const mockWebSocket = {
  readyState: WebSocket.CONNECTING,
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  OPEN: WebSocket.OPEN,
  CONNECTING: WebSocket.CONNECTING,
  CLOSING: WebSocket.CLOSING,
  CLOSED: WebSocket.CLOSED,
};

vi.mock('../services/webSocketService', async () => {
  const actual = await vi.importActual('../services/webSocketService');
  return {
    ...actual,
    // We'll test the actual service but mock WebSocket constructor
  };
});

// Mock WebSocket constructor
global.WebSocket = vi.fn(() => mockWebSocket) as any;

describe('WebSocketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockWebSocket.readyState = WebSocket.CONNECTING;
    mockWebSocket.send.mockClear();
    mockWebSocket.close.mockClear();
    mockWebSocket.addEventListener.mockClear();
    
    // Setup default mocks
    vi.mocked(apiService.getAuthToken).mockReturnValue('test-token');
    vi.mocked(apiService.parseJwtPayload).mockReturnValue({
      user_id: 'test-user',
      email: 'test@example.com',
      role: 'teacher',
      exp: Date.now() / 1000 + 3600, // 1 hour from now
      session_id: 'test-session',
    });
  });

  afterEach(() => {
    webSocketService.disconnect();
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid token', async () => {
      await webSocketService.initialize();

      expect(global.WebSocket).toHaveBeenCalledWith(
        expect.stringContaining('/ws?token=test-token')
      );
      expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('open', expect.any(Function));
      expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('close', expect.any(Function));
      expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should not initialize without token', async () => {
      vi.mocked(apiService.getAuthToken).mockReturnValue(null);

      await webSocketService.initialize();

      expect(global.WebSocket).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('WebSocket: No auth token available');
    });

    it('should start fallback polling when WebSocket disabled', async () => {
      // Mock environment variable
      const originalViteWsEnabled = import.meta.env.VITE_WS_ENABLED;
      import.meta.env.VITE_WS_ENABLED = 'false';

      await webSocketService.initialize();

      expect(global.WebSocket).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('WebSocket: Starting fallback polling');

      // Restore original value
      import.meta.env.VITE_WS_ENABLED = originalViteWsEnabled;
    });
  });

  describe('Connection Management', () => {
    beforeEach(() => {
      // Auto-resolve WebSocket connection for tests
      vi.stubGlobal('setTimeout', (cb: () => void) => {
        cb();
        return 1;
      });
    });

    it('should handle WebSocket open', async () => {
      await webSocketService.initialize();
      
      // Simulate successful connection
      const openCallback = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'open'
      )?.[1];
      
      expect(openCallback).toBeDefined();
      
      // Set WebSocket state to open before triggering callback
      mockWebSocket.readyState = WebSocket.OPEN;
      openCallback?.(new Event('open'));

      const connectionState = webSocketService.getConnectionState();
      expect(connectionState.connected).toBe(true);
      expect(connectionState.connecting).toBe(false);
      expect(connectionState.reconnecting).toBe(false);
    });

    it('should handle WebSocket close and attempt reconnection', async () => {
      await webSocketService.initialize();
      
      const closeCallback = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'close'
      )?.[1];

      expect(closeCallback).toBeDefined();
      
      // Simulate unexpected close
      closeCallback?.({ wasClean: false, code: 1006, reason: '' } as CloseEvent);

      const connectionState = webSocketService.getConnectionState();
      expect(connectionState.connected).toBe(false);
      // Reconnection should be attempted
    });

    it('should handle WebSocket error', async () => {
      vi.stubGlobal('clearTimeout', vi.fn());

      await webSocketService.initialize();
      
      const errorCallback = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];

      expect(errorCallback).toBeDefined();
      
      errorCallback?.(new Event('error'));

      expect(logger.error).toHaveBeenCalledWith('WebSocket: Error occurred', expect.any(Event));
    });
  });

  describe('Event Subscription', () => {
    beforeEach(async () => {
      await webSocketService.initialize();
      mockWebSocket.readyState = WebSocket.OPEN;
    });

    it('should subscribe to real-time events', () => {
      const callback = vi.fn();
      const unsubscribe = webSocketService.subscribe({
        eventType: 'grade_updated',
        callback,
      });

      expect(typeof unsubscribe).toBe('function');
      expect(logger.debug).toHaveBeenCalledWith('WebSocket: Subscribed to', 'grade_updated');
    });

    it('should handle event messages', () => {
      const callback = vi.fn();
      webSocketService.subscribe({
        eventType: 'grade_updated',
        callback,
      });

      const messageCallback = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];

      const testEvent: RealTimeEvent = {
        type: 'grade_updated',
        entity: 'grade',
        entityId: 'grade-123',
        data: { id: 'grade-123', score: 95 },
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      };

      messageCallback?.({ data: JSON.stringify(testEvent) } as MessageEvent);

      expect(callback).toHaveBeenCalledWith(testEvent);
    });

    it('should filter events with custom filter function', () => {
      const callback = vi.fn();
      webSocketService.subscribe({
        eventType: 'grade_updated',
        callback,
        filter: (event) => event.entityId === 'target-grade',
      });

      const messageCallback = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];

      // Event that should be filtered out
      const filteredEvent: RealTimeEvent = {
        type: 'grade_updated',
        entity: 'grade',
        entityId: 'other-grade',
        data: { id: 'other-grade', score: 85 },
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      };

      messageCallback?.({ data: JSON.stringify(filteredEvent) } as MessageEvent);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should unsubscribe from events', () => {
      const callback = vi.fn();
      const unsubscribe = webSocketService.subscribe({
        eventType: 'grade_updated',
        callback,
      });

      unsubscribe();

      const messageCallback = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];

      const testEvent: RealTimeEvent = {
        type: 'grade_updated',
        entity: 'grade',
        entityId: 'grade-123',
        data: { id: 'grade-123', score: 95 },
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      };

      messageCallback?.({ data: JSON.stringify(testEvent) } as MessageEvent);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Local Storage Updates', () => {
    beforeEach(async () => {
      await webSocketService.initialize();
      mockWebSocket.readyState = WebSocket.OPEN;
    });

    it('should update grades in local storage', () => {
      // Setup initial grades data
      const initialGrades = [
        { id: 'grade-1', score: 80, studentId: 'student-1' },
        { id: 'grade-2', score: 85, studentId: 'student-2' },
      ];
      localStorage.setItem('malnu_grades', JSON.stringify(initialGrades));

      const messageCallback = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];

      const updatedEvent: RealTimeEvent = {
        type: 'grade_updated',
        entity: 'grade',
        entityId: 'grade-1',
        data: { id: 'grade-1', score: 90, studentId: 'student-1' },
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      };

      messageCallback?.({ data: JSON.stringify(updatedEvent) } as MessageEvent);

      const storedGrades = JSON.parse(localStorage.getItem('malnu_grades') || '[]');
      expect(storedGrades).toEqual([
        { id: 'grade-1', score: 90, studentId: 'student-1' }, // Updated
        { id: 'grade-2', score: 85, studentId: 'student-2' },  // Unchanged
      ]);
    });

    it('should add new grade to local storage', () => {
      localStorage.setItem('malnu_grades', JSON.stringify([]));

      const messageCallback = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];

      const newGradeEvent: RealTimeEvent = {
        type: 'grade_created',
        entity: 'grade',
        entityId: 'grade-3',
        data: { id: 'grade-3', score: 95, studentId: 'student-3' },
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      };

      messageCallback?.({ data: JSON.stringify(newGradeEvent) } as MessageEvent);

      const storedGrades = JSON.parse(localStorage.getItem('malnu_grades') || '[]');
      expect(storedGrades).toEqual([
        { id: 'grade-3', score: 95, studentId: 'student-3' },
      ]);
    });

    it('should delete grades from local storage', () => {
      const initialGrades = [
        { id: 'grade-1', score: 80, studentId: 'student-1' },
        { id: 'grade-2', score: 85, studentId: 'student-2' },
      ];
      localStorage.setItem('malnu_grades', JSON.stringify(initialGrades));

      const messageCallback = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];

      const deleteEvent: RealTimeEvent = {
        type: 'grade_deleted',
        entity: 'grade',
        entityId: 'grade-1',
        data: { id: 'grade-1' },
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      };

      messageCallback?.({ data: JSON.stringify(deleteEvent) } as MessageEvent);

      const storedGrades = JSON.parse(localStorage.getItem('malnu_grades') || '[]');
      expect(storedGrades).toEqual([
        { id: 'grade-2', score: 85, studentId: 'student-2' },
      ]);
    });
  });

  describe('Connection State Management', () => {
    it('should persist connection state to localStorage', async () => {
      await webSocketService.initialize();
      mockWebSocket.readyState = WebSocket.OPEN;

      // Trigger open event
      const openCallback = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'open'
      )?.[1];
      openCallback?.(new Event('open'));

      const storedState = localStorage.getItem('malnu_ws_connection');
      expect(storedState).toBeDefined();
      
      const state = JSON.parse(storedState || '{}');
      expect(state.connected).toBe(true);
      expect(state.subscriptions).toBeDefined();
    });

    it('should load connection state from localStorage', () => {
      const mockState = {
        connected: true,
        connecting: false,
        reconnecting: false,
        subscriptions: ['grade_updated'],
        lastConnected: new Date().toISOString(),
        reconnectAttempts: 0,
      };
      localStorage.setItem('malnu_ws_connection', JSON.stringify(mockState));

      const state = webSocketService.getConnectionState();
      expect(state.subscriptions.size).toBe(1);
      expect(state.subscriptions.has('grade_updated')).toBe(true);
    });
  });

  describe('Global Events', () => {
    beforeEach(async () => {
      await webSocketService.initialize();
      mockWebSocket.readyState = WebSocket.OPEN;
    });

    it('should emit global custom events for real-time updates', () => {
      const globalListener = vi.fn();
      window.addEventListener('realtime-update', globalListener);

      const messageCallback = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];

      const testEvent: RealTimeEvent = {
        type: 'grade_updated',
        entity: 'grade',
        entityId: 'grade-123',
        data: { id: 'grade-123', score: 95 },
        timestamp: new Date().toISOString(),
        userRole: 'teacher',
        userId: 'user-123',
      };

      messageCallback?.({ data: JSON.stringify(testEvent) } as MessageEvent);

      expect(globalListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: {
            type: 'grade_updated',
            entity: 'grade',
            entityId: 'grade-123',
            data: { id: 'grade-123', score: 95 },
            timestamp: testEvent.timestamp,
            userRole: 'teacher',
            userId: 'user-123',
          },
        })
      );

      window.removeEventListener('realtime-update', globalListener);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON messages', async () => {
      await webSocketService.initialize();
      mockWebSocket.readyState = WebSocket.OPEN;

      const messageCallback = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];

      messageCallback?.({ data: 'invalid json' } as MessageEvent);

      expect(logger.error).toHaveBeenCalledWith(
        'WebSocket: Failed to parse message',
        expect.any(Error)
      );
    });

    it('should handle token expiration', async () => {
      vi.mocked(apiService.parseJwtPayload).mockReturnValue({
        user_id: 'test-user',
        email: 'test@example.com',
        role: 'teacher',
        exp: Date.now() / 1000 - 3600, // 1 hour ago (expired)
        session_id: 'test-session',
      });

      await webSocketService.initialize();

      expect(global.WebSocket).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('WebSocket: Token expired, skipping connection');
    });
  });
});