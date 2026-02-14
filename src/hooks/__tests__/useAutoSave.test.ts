import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../useAutoSave';

vi.mock('../services/offlineActionQueueService', () => ({
  useOfflineActionQueue: vi.fn(() => ({
    queueAction: vi.fn(),
    syncNow: vi.fn(),
    getQueueCount: vi.fn(() => 0),
  })),
}));

vi.mock('../utils/networkStatus', () => ({
  useNetworkStatus: vi.fn(() => ({ isOnline: true })),
}));

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('useAutoSave Hook', () => {
  const initialData = { name: 'Test', value: 123 };
  const storageKey = 'test_autosave';
  const mockSave = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with initial data', () => {
    const { result } = renderHook(() =>
      useAutoSave(initialData, {
        storageKey,
        onSave: mockSave,
      })
    );

    expect(result.current[0].data).toEqual(initialData);
    expect(result.current[0].isAutoSaving).toBe(false);
    expect(result.current[0].isDirty).toBe(false);
    expect(result.current[0].error).toBeNull();
  });

  it('should update data and set dirty flag', async () => {
    const { result } = renderHook(() =>
      useAutoSave(initialData, {
        storageKey,
        onSave: mockSave,
      })
    );

    await act(async () => {
      result.current[1].updateData({ name: 'Updated', value: 456 });
    });

    expect(result.current[0].data).toEqual({ name: 'Updated', value: 456 });
    expect(result.current[0].isDirty).toBe(true);
  });

  it('should update data using function form', async () => {
    const { result } = renderHook(() =>
      useAutoSave(initialData, {
        storageKey,
        onSave: mockSave,
      })
    );

    await act(async () => {
      result.current[1].updateData((prev: typeof initialData) => ({ ...prev, name: 'Function Update' }));
    });

    expect(result.current[0].data.name).toBe('Function Update');
  });

  it('should save data when saveNow is called', async () => {
    const { result } = renderHook(() =>
      useAutoSave(initialData, {
        storageKey,
        onSave: mockSave,
      })
    );

    await act(async () => {
      result.current[1].updateData({ name: 'Updated', value: 456 });
    });

    await act(async () => {
      await result.current[1].saveNow();
    });

    expect(mockSave).toHaveBeenCalledWith({ name: 'Updated', value: 456 });
    expect(result.current[0].lastSaved).not.toBeNull();
    expect(result.current[0].isDirty).toBe(false);
  });

  it('should clear error', async () => {
    const { result } = renderHook(() =>
      useAutoSave(initialData, {
        storageKey,
        onSave: mockSave,
        onError: vi.fn(),
      })
    );

    await act(async () => {
      result.current[1].clearError();
    });

    expect(result.current[0].error).toBeNull();
  });

  it('should reset to new initial data', async () => {
    const { result } = renderHook(() =>
      useAutoSave(initialData, {
        storageKey,
        onSave: mockSave,
      })
    );

    await act(async () => {
      result.current[1].updateData({ name: 'Updated', value: 456 });
    });

    expect(result.current[0].data.name).toBe('Updated');

    await act(async () => {
      result.current[1].reset({ name: 'Reset', value: 999 });
    });

    expect(result.current[0].data).toEqual({ name: 'Reset', value: 999 });
    expect(result.current[0].isDirty).toBe(false);
  });

  it('should call onSaved callback after save', async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(() =>
      useAutoSave(initialData, {
        storageKey,
        onSave: mockSave,
        onSaved,
      })
    );

    await act(async () => {
      await result.current[1].saveNow();
    });

    expect(onSaved).toHaveBeenCalledWith(initialData);
  });
});
