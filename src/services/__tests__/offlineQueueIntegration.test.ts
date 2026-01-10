// Test file for offline queue integration
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request, RequestOptions } from '../apiService';
import { offlineActionQueueService } from '../offlineActionQueueService';

// Mock dependencies
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../utils/networkStatus', () => ({
  isNetworkError: vi.fn((error) => error instanceof Error && error.message.includes('network')),
}));

vi.mock('../offlineActionQueueService', () => ({
  offlineActionQueueService: {
    addAction: vi.fn().mockReturnValue('test-action-id'),
  },
}));

vi.mock('../constants', () => ({
  STORAGE_KEYS: {
    AUTH_TOKEN: 'test_auth_token',
    REFRESH_TOKEN: 'test_refresh_token',
  },
}));

describe('Offline Queue Integration', () => {
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should queue POST request when offline', async () => {
    // Simulate offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const options: RequestOptions = {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    };

    const result = await request('/api/test', options);

    expect(offlineActionQueueService.addAction).toHaveBeenCalledWith({
      type: 'create',
      entity: 'material',
      entityId: 'unknown',
      data: { name: 'Test' },
      endpoint: expect.any(String),
      method: 'POST',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Action queued for offline sync');
  });

  it('should queue PUT request when network error occurs', async () => {
    // Mock fetch to throw network error
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'));

    const { isNetworkError } = await import('../utils/networkStatus');
    vi.mocked(isNetworkError).mockReturnValue(true);

    const options: RequestOptions = {
      method: 'PUT',
      body: JSON.stringify({ id: '123', name: 'Updated Test' }),
    };

    const result = await request('/api/test', options);

    expect(offlineActionQueueService.addAction).toHaveBeenCalledWith({
      type: 'update',
      entity: 'material',
      entityId: '123',
      data: { id: '123', name: 'Updated Test' },
      endpoint: expect.any(String),
      method: 'PUT',
    });

    expect(result.success).toBe(true);
  });

  it('should skip queue for GET requests when offline', async () => {
    // Simulate offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const options: RequestOptions = {
      method: 'GET',
    };

    const result = await request('/api/test', options);

    expect(offlineActionQueueService.addAction).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.message).toContain('Unable to complete request offline');
  });

  it('should skip queue when skipQueue option is true', async () => {
    // Simulate offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const options: RequestOptions = {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
      skipQueue: true,
    };

    // Mock fetch to return error response
    global.fetch = vi.fn().mockRejectedValue(new Error('No network'));

    const result = await request('/api/test', options);

    expect(offlineActionQueueService.addAction).not.toHaveBeenCalled();
  });

  it('should map grades endpoint to grade entity', async () => {
    // Simulate offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const options: RequestOptions = {
      method: 'POST',
      body: JSON.stringify({ studentId: '123', score: 95 }),
    };

    await request('/api/grades', options);

    expect(offlineActionQueueService.addAction).toHaveBeenCalledWith({
      type: 'create',
      entity: 'grade',
      entityId: 'unknown',
      data: { studentId: '123', score: 95 },
      endpoint: expect.any(String),
      method: 'POST',
    });
  });

  it('should map attendance endpoint to attendance entity', async () => {
    // Simulate offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const options: RequestOptions = {
      method: 'PUT',
      body: JSON.stringify({ id: '456', status: 'present' }),
    };

    await request('/api/attendance/456', options);

    expect(offlineActionQueueService.addAction).toHaveBeenCalledWith({
      type: 'update',
      entity: 'attendance',
      entityId: '456',
      data: { id: '456', status: 'present' },
      endpoint: expect.any(String),
      method: 'PUT',
    });
  });
});