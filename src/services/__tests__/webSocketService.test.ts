import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { webSocketService, type RealTimeEvent } from '../webSocketService';
import { getAuthToken, parseJwtPayload } from '../api/auth';
import { logger } from '../../utils/logger';
import { STORAGE_KEYS } from '../../constants';

/* eslint-disable no-undef */
// Define WebSocket constants
const WS_CONNECTING = 0;
const WS_OPEN = 1;
const WS_CLOSING = 2;
const WS_CLOSED = 3;

// Mock MessageEvent
class MockMessageEvent implements Event {
  readonly type: string;
  readonly data: unknown;
  readonly bubbles: boolean = false;
  readonly cancelBubble: boolean = false;
  readonly cancelable: boolean = false;
  readonly composed: boolean = false;
  readonly currentTarget: EventTarget | null = null;
  readonly defaultPrevented: boolean = false;
  readonly eventPhase: number = 0;
  readonly isTrusted: boolean = false;
  readonly returnValue: boolean = false;
  readonly srcElement: EventTarget | null = null;
  readonly target: EventTarget | null = null;
  readonly timeStamp: number = 0;
  readonly scoped: boolean = false;
  readonly AT_TARGET = 2;
  readonly BUBBLING_PHASE = 3;
  readonly CAPTURING_PHASE = 1;
  readonly NONE = 0;

  constructor(type: string, eventInit?: { data?: unknown }) {
    this.type = type;
    this.data = eventInit?.data;
  }

  composedPath(): EventTarget[] { return []; }
  initEvent(_type: string, _bubbles?: boolean, _cancelable?: boolean): void {}
  preventDefault(): void {}
  stopImmediatePropagation(): void {}
  stopPropagation(): void {}
}

// Mock CloseEvent
class MockCloseEvent implements Event {
  readonly type: string;
  readonly code: number;
  readonly reason: string;
  readonly wasClean: boolean;
  readonly bubbles: boolean = false;
  readonly cancelBubble: boolean = false;
  readonly cancelable: boolean = false;
  readonly composed: boolean = false;
  readonly currentTarget: EventTarget | null = null;
  readonly defaultPrevented: boolean = false;
  readonly eventPhase: number = 0;
  readonly isTrusted: boolean = false;
  readonly returnValue: boolean = false;
  readonly srcElement: EventTarget | null = null;
  readonly target: EventTarget | null = null;
  readonly timeStamp: number = 0;
  readonly scoped: boolean = false;

  constructor(type: string, eventInit?: { code?: number; reason?: string; wasClean?: boolean }) {
    this.type = type;
    this.code = eventInit?.code || 1000;
    this.reason = eventInit?.reason || '';
    this.wasClean = eventInit?.wasClean ?? true;
  }

  composedPath(): EventTarget[] { return []; }
  initEvent(_type: string, _bubbles?: boolean, _cancelable?: boolean): void {}
  preventDefault(): void {}
  stopImmediatePropagation(): void {}
  stopPropagation(): void {}
  readonly AT_TARGET = 2;
  readonly BUBBLING_PHASE = 3;
  readonly CAPTURING_PHASE = 1;
  readonly NONE = 0;
}

// Mock WebSocket with manual event triggering
class MockWebSocket {
  static CONNECTING = WS_CONNECTING;
  static OPEN = WS_OPEN;
  static CLOSING = WS_CLOSING;
  static CLOSED = WS_CLOSED;

  CONNECTING = WS_CONNECTING;
  OPEN = WS_OPEN;
  CLOSING = WS_CLOSING;
  CLOSED = WS_CLOSED;

  readyState: number = WS_CONNECTING;
  url: string;
  send = vi.fn();
  close = vi.fn((code?: number, reason?: string) => {
    this.readyState = WS_CLOSED;
    if (this.onclose) {
      this.onclose(new MockCloseEvent('close', { code, reason, wasClean: true }));
    }
  });
  
  addEventListener = vi.fn((event: string, handler: (evt: Event) => void) => {
    (this as any)._listeners.set(event, handler);
  });
  
  removeEventListener = vi.fn((event: string) => {
    (this as any)._listeners.delete(event);
  });

  onopen: ((evt: Event) => void) | null = null;
  onmessage: ((evt: MessageEvent) => void) | null = null;
  onclose: ((evt: CloseEvent) => void) | null = null;
  onerror: ((evt: Event) => void) | null = null;

  private _listeners: Map<string, (evt: Event) => void> = new Map();
  private _openTimeout: number | null = null;
  connectAttempts: number = 0;

  constructor(url: string) {
    this.url = url;
    this.connectAttempts++;
    logger.debug('Mock WebSocket constructor called with:', url);
    
    // Auto-trigger open after delay
    this._openTimeout = window.setTimeout(() => {
      this.triggerOpen();
    }, 10);
  }

  triggerOpen(): void {
    this.readyState = WS_OPEN;
    const event = new Event('open');
    if (this.onopen) {
      this.onopen(event);
    }
    const listener = this._listeners.get('open');
    if (listener) {
      listener(event);
    }
  }

  triggerMessage(data: unknown): void {
    if (this.readyState !== WS_OPEN) return;
    const event = new MockMessageEvent('message', { data });
    if (this.onmessage) {
      this.onmessage(event as unknown as MessageEvent);
    }
    const listener = this._listeners.get('message');
    if (listener) {
      listener(event);
    }
  }

  triggerClose(code = 1000, reason = '', wasClean = true): void {
    this.readyState = WS_CLOSED;
    const event = new MockCloseEvent('close', { code, reason, wasClean });
    if (this.onclose) {
      this.onclose(event);
    }
    const listener = this._listeners.get('close');
    if (listener) {
      listener(event);
    }
  }

  triggerError(error: Event): void {
    this.readyState = WS_CLOSED;
    if (this.onerror) {
      this.onerror(error);
    }
    const listener = this._listeners.get('error');
    if (listener) {
      listener(error);
    }
  }
}

let mockWebSocketInstances: MockWebSocket[] = [];
let webSocketSpy: ReturnType<typeof vi.spyOn>;
let mockGlobalEventListener: ReturnType<typeof vi.spyOn>;

// Mock dependencies before module loads
vi.mock('../api/auth', () => ({
  getAuthToken: vi.fn(),
  parseJwtPayload: vi.fn(),
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

beforeAll(() => {
  // Setup WebSocket mock before service loads
  webSocketSpy = vi.spyOn(global, 'WebSocket').mockImplementation(function(this: any, url: string | URL) {
    const instance = new MockWebSocket(url.toString());
    mockWebSocketInstances.push(instance);
    return instance as any;
  });

  Object.defineProperty(global.WebSocket, 'CONNECTING', { value: WS_CONNECTING });
  Object.defineProperty(global.WebSocket, 'OPEN', { value: WS_OPEN });
  Object.defineProperty(global.WebSocket, 'CLOSING', { value: WS_CLOSING });
  Object.defineProperty(global.WebSocket, 'CLOSED', { value: WS_CLOSED });
  (global as any).MessageEvent = MockMessageEvent;
  (global as any).CloseEvent = MockCloseEvent;
});

afterAll(() => {
  webSocketSpy?.mockRestore?.();
});

function getLatestMockWebSocket(): MockWebSocket | undefined {
  return mockWebSocketInstances[mockWebSocketInstances.length - 1];
}

describe('WebSocketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    webSocketSpy?.mockClear?.();
    localStorage.clear();
    mockWebSocketInstances = [];
    
    // Default mocks
    vi.mocked(getAuthToken).mockReturnValue('test-token');
    vi.mocked(parseJwtPayload).mockReturnValue({
      user_id: 'test-user',
      email: 'test@example.com',
      role: 'teacher',
      exp: Date.now() / 1000 + 3600,
      session_id: 'test-session',
    });

    mockGlobalEventListener = vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    webSocketService.disconnect();
    mockGlobalEventListener?.mockRestore?.();
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid token', async () => {
      await webSocketService.initialize();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(global.WebSocket).toHaveBeenCalledWith(
        expect.stringContaining('/ws?token=test-token')
      );
    });

    it('should not initialize without token', async () => {
      vi.mocked(getAuthToken).mockReturnValue(null);

      await webSocketService.initialize();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(global.WebSocket).not.toHaveBeenCalled();
      expect(vi.mocked(logger.warn)).toHaveBeenCalledWith('WebSocket: No auth token available');
    });

    it('should start fallback polling when WebSocket disabled', async () => {
      const originalViteWsEnabled = import.meta.env.VITE_WS_ENABLED;
      import.meta.env.VITE_WS_ENABLED = 'false';

      await webSocketService.initialize();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(global.WebSocket).not.toHaveBeenCalled();
      expect(vi.mocked(logger.info)).toHaveBeenCalledWith('WebSocket: Disabled by environment variable');

      import.meta.env.VITE_WS_ENABLED = originalViteWsEnabled;
    });
  });

  describe('Connection Management', () => {
    beforeEach(async () => {
      await webSocketService.initialize();
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('should handle WebSocket open and update connection state', async () => {
      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        mockWs.triggerOpen();
      }

      await new Promise(resolve => setTimeout(resolve, 10));

      const state = webSocketService.getConnectionState();
      expect(state.connected).toBe(true);
      expect(state.connecting).toBe(false);
      expect(state.reconnecting).toBe(false);
    });

    it('should handle WebSocket close and attempt reconnection', async () => {
      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        mockWs.triggerOpen();
        mockWs.triggerClose(1006, 'Connection lost', false);
      }

      await new Promise(resolve => setTimeout(resolve, 20));

      expect(vi.mocked(logger.warn)).toHaveBeenCalledWith(
        'WebSocket: Connection closed unexpectedly',
        expect.any(Number),
        expect.any(String)
      );
    });

    it('should handle WebSocket error', async () => {
      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        mockWs.triggerError(new Event('error'));
      }

      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        'WebSocket: Error occurred',
        expect.any(Event)
      );
    });

    it('should not reconnect when already connected', async () => {
      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        mockWs.triggerOpen();
      }

      await new Promise(resolve => setTimeout(resolve, 20));

      const stateBefore = webSocketService.getConnectionState();
      expect(stateBefore.connected).toBe(true);

      await webSocketService.initialize();
      await new Promise(resolve => setTimeout(resolve, 20));

      const stateAfter = webSocketService.getConnectionState();
      expect(stateAfter.connected).toBe(true);
    });
  });

  describe('Event Subscription', () => {
    beforeEach(async () => {
      await webSocketService.initialize();
      await new Promise(resolve => setTimeout(resolve, 50));
      const mockWs = getLatestMockWebSocket();
      if (mockWs) mockWs.triggerOpen();
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should subscribe to real-time events', () => {
      const callback = vi.fn();
      const unsubscribe = webSocketService.subscribe({
        eventType: 'grade_updated',
        callback,
      });

      expect(typeof unsubscribe).toBe('function');
      expect(vi.mocked(logger.debug)).toHaveBeenCalledWith('WebSocket: Subscribed to', 'grade_updated');
    });

    it('should handle event messages and trigger callbacks', () => {
      const callback = vi.fn();
      webSocketService.subscribe({
        eventType: 'grade_updated',
        callback,
      });

      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        const testEvent: RealTimeEvent = {
          type: 'grade_updated',
          entity: 'grade',
          entityId: 'grade-123',
          data: { id: 'grade-123', score: 95 },
          timestamp: new Date().toISOString(),
          userRole: 'teacher',
          userId: 'user-123',
        };
        mockWs.triggerMessage(JSON.stringify(testEvent));
      }

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'grade_updated',
          entityId: 'grade-123',
        })
      );
    });

    it('should filter events with custom filter function', () => {
      const callback = vi.fn();
      webSocketService.subscribe({
        eventType: 'grade_updated',
        callback,
        filter: (event) => event.entityId === 'target-grade',
      });

      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        const filteredEvent: RealTimeEvent = {
          type: 'grade_updated',
          entity: 'grade',
          entityId: 'other-grade',
          data: { id: 'other-grade', score: 85 },
          timestamp: new Date().toISOString(),
          userRole: 'teacher',
          userId: 'user-123',
        };
        mockWs.triggerMessage(JSON.stringify(filteredEvent));
      }

      expect(callback).not.toHaveBeenCalled();
    });

    it('should unsubscribe from events', () => {
      const callback = vi.fn();
      const unsubscribe = webSocketService.subscribe({
        eventType: 'grade_updated',
        callback,
      });

      unsubscribe();

      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        const testEvent: RealTimeEvent = {
          type: 'grade_updated',
          entity: 'grade',
          entityId: 'grade-123',
          data: { id: 'grade-123', score: 95 },
          timestamp: new Date().toISOString(),
          userRole: 'teacher',
          userId: 'user-123',
        };
        mockWs.triggerMessage(JSON.stringify(testEvent));
      }

      expect(callback).not.toHaveBeenCalled();
      expect(vi.mocked(logger.debug)).toHaveBeenCalledWith('WebSocket: Unsubscribed from', 'grade_updated');
    });
  });

  describe('Local Storage Updates', () => {
    beforeEach(async () => {
      await webSocketService.initialize();
      await new Promise(resolve => setTimeout(resolve, 50));
      const mockWs = getLatestMockWebSocket();
      if (mockWs) mockWs.triggerOpen();
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should update grades in local storage', () => {
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([
        { id: 'grade-1', score: 80, studentId: 'student-1' },
      ]));

      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        const updateEvent: RealTimeEvent = {
          type: 'grade_updated',
          entity: 'grade',
          entityId: 'grade-1',
          data: { id: 'grade-1', score: 85, studentId: 'student-1' },
          timestamp: new Date().toISOString(),
          userRole: 'teacher',
          userId: 'teacher-1',
        };
        mockWs.triggerMessage(JSON.stringify(updateEvent));
      }

      const grades = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || '[]');
      const updatedGrade = grades.find((g: any) => g.id === 'grade-1');
      expect(updatedGrade?.score).toBe(85);
    });

    it('should add new grade to local storage', () => {
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([]));

      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        const createEvent: RealTimeEvent = {
          type: 'grade_created',
          entity: 'grade',
          entityId: 'grade-new',
          data: { id: 'grade-new', score: 90, studentId: 'student-1' },
          timestamp: new Date().toISOString(),
          userRole: 'teacher',
          userId: 'teacher-1',
        };
        mockWs.triggerMessage(JSON.stringify(createEvent));
      }

      const grades = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || '[]');
      expect(grades).toHaveLength(1);
      expect(grades[0]?.id).toBe('grade-new');
    });

    it('should delete grades from local storage', () => {
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([
        { id: 'grade-1', score: 80, studentId: 'student-1' },
      ]));

      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        const deleteEvent: RealTimeEvent = {
          type: 'grade_deleted',
          entity: 'grade',
          entityId: 'grade-1',
          data: { id: 'grade-1', score: 80, studentId: 'student-1' },
          timestamp: new Date().toISOString(),
          userRole: 'teacher',
          userId: 'teacher-1',
        };
        mockWs.triggerMessage(JSON.stringify(deleteEvent));
      }

      const grades = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || '[]');
      expect(grades).toHaveLength(0);
    });

    it('should update announcements in local storage', () => {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify([
        { id: 'ann-1', title: 'Old Title', content: 'Old Content' },
      ]));

      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        const updateEvent: RealTimeEvent = {
          type: 'announcement_updated',
          entity: 'announcement',
          entityId: 'ann-1',
          data: { id: 'ann-1', title: 'New Title', content: 'New Content' },
          timestamp: new Date().toISOString(),
          userRole: 'admin',
          userId: 'admin-1',
        };
        mockWs.triggerMessage(JSON.stringify(updateEvent));
      }

      const announcements = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) || '[]');
      const updatedAnn = announcements.find((a: any) => a.id === 'ann-1');
      expect(updatedAnn?.title).toBe('New Title');
    });
  });

  describe('Connection State Management', () => {
    beforeEach(async () => {
      await webSocketService.initialize();
      await new Promise(resolve => setTimeout(resolve, 50));
      const mockWs = getLatestMockWebSocket();
      if (mockWs) mockWs.triggerOpen();
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should persist connection state to localStorage', () => {
      webSocketService.subscribe({
        eventType: 'grade_updated',
        callback: vi.fn(),
      });

      const storedState = JSON.parse(localStorage.getItem(STORAGE_KEYS.WS_CONNECTION) || '{}');
      expect(storedState.connected).toBe(true);
      expect(storedState.subscriptions).toContain('grade_updated');
      expect(storedState.lastConnected).toBeDefined();
    });

    it('should return current connection state', () => {
      const state = webSocketService.getConnectionState();
      expect(state.connected).toBe(true);
      expect(state.connecting).toBe(false);
      expect(state.reconnecting).toBe(false);
    });

    it('should report connected status correctly', () => {
      expect(webSocketService.isConnected()).toBe(true);
    });
  });

  describe('Global Events', () => {
    beforeEach(async () => {
      await webSocketService.initialize();
      await new Promise(resolve => setTimeout(resolve, 50));
      const mockWs = getLatestMockWebSocket();
      if (mockWs) mockWs.triggerOpen();
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should emit global custom events for real-time updates', () => {
      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        const testEvent: RealTimeEvent = {
          type: 'grade_updated',
          entity: 'grade',
          entityId: 'grade-123',
          data: { id: 'grade-123', score: 95 },
          timestamp: new Date().toISOString(),
          userRole: 'teacher',
          userId: 'user-123',
        };
        mockWs.triggerMessage(JSON.stringify(testEvent));
      }

      expect(mockGlobalEventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'realtime-update',
          detail: expect.objectContaining({
            type: 'grade_updated',
            entityId: 'grade-123',
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await webSocketService.initialize();
      await new Promise(resolve => setTimeout(resolve, 50));
      const mockWs = getLatestMockWebSocket();
      if (mockWs) mockWs.triggerOpen();
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should handle malformed JSON messages', () => {
      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        mockWs.triggerMessage('invalid json{');
      }

      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        'WebSocket: Failed to parse message',
        expect.any(Error)
      );
    });

    it('should handle subscription callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });

      webSocketService.subscribe({
        eventType: 'grade_updated',
        callback: errorCallback,
      });

      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        const testEvent: RealTimeEvent = {
          type: 'grade_updated',
          entity: 'grade',
          entityId: 'grade-123',
          data: { id: 'grade-123', score: 95 },
          timestamp: new Date().toISOString(),
          userRole: 'teacher',
          userId: 'user-123',
        };
        mockWs.triggerMessage(JSON.stringify(testEvent));
      }

      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        'WebSocket: Subscription callback error',
        expect.any(Error)
      );
    });

    it('should ignore pong messages', () => {
      const callback = vi.fn();
      webSocketService.subscribe({
        eventType: 'grade_updated',
        callback,
      });

      const mockWs = getLatestMockWebSocket();
      if (mockWs) {
        mockWs.triggerMessage(JSON.stringify({ type: 'pong' }));
      }

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Token Expiration', () => {
    it('should handle token expiration', async () => {
      vi.mocked(parseJwtPayload).mockReturnValue({
        user_id: 'test-user',
        email: 'test@example.com',
        role: 'teacher',
        exp: Date.now() / 1000 - 3600,
        session_id: 'test-session',
      });

      await webSocketService.initialize();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(global.WebSocket).not.toHaveBeenCalled();
      expect(vi.mocked(logger.warn)).toHaveBeenCalledWith('WebSocket: Token expired, skipping connection');
    });
  });

  describe('Disconnection', () => {
    beforeEach(async () => {
      await webSocketService.initialize();
      await new Promise(resolve => setTimeout(resolve, 50));
      const mockWs = getLatestMockWebSocket();
      if (mockWs) mockWs.triggerOpen();
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should disconnect gracefully', () => {
      const mockWs = getLatestMockWebSocket();
      
      webSocketService.disconnect();

      expect(mockWs?.close).toHaveBeenCalledWith(1000, 'Client disconnect');
      expect(webSocketService.isConnected()).toBe(false);
    });

    it('should clear all intervals and timeouts on disconnect', () => {
      webSocketService.disconnect();

      const state = webSocketService.getConnectionState();
      expect(state.connected).toBe(false);
      expect(state.connecting).toBe(false);
      expect(state.reconnecting).toBe(false);
    });
  });

  describe('Reconnection', () => {
    beforeEach(async () => {
      await webSocketService.initialize();
      await new Promise(resolve => setTimeout(resolve, 50));
      const mockWs = getLatestMockWebSocket();
      if (mockWs) mockWs.triggerOpen();
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should support manual reconnection', async () => {
      const initialInstanceCount = mockWebSocketInstances.length;

      webSocketService.disconnect();

      await webSocketService.reconnect();
      await new Promise(resolve => setTimeout(resolve, 60));

      // Should create a new WebSocket instance after reconnect
      expect(mockWebSocketInstances.length).toBeGreaterThan(initialInstanceCount);
    });
  });
});
