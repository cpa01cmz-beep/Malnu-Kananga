import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../useLocalStorage';

describe('useLocalStorage Hook', () => {
  const testKey = 'test_storage_key';
  const initialValue = { name: 'test', value: 123 };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(testKey, initialValue));
    expect(result.current[0]).toEqual(initialValue);
  });

  it('should read existing value from localStorage', () => {
    localStorage.setItem(testKey, JSON.stringify({ name: 'existing', value: 456 }));
    const { result } = renderHook(() => useLocalStorage(testKey, initialValue));
    expect(result.current[0]).toEqual({ name: 'existing', value: 456 });
  });

  it('should return initial value when localStorage throws an error', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
    const { result } = renderHook(() => useLocalStorage(testKey, initialValue));
    expect(result.current[0]).toEqual(initialValue);
  });

  it('should update state and localStorage when setValue is called', async () => {
    const { result } = renderHook(() => useLocalStorage(testKey, initialValue));
    await act(async () => {
      result.current[1]({ name: 'updated', value: 789 });
    });
    expect(result.current[0]).toEqual({ name: 'updated', value: 789 });
    expect(localStorage.getItem(testKey)).toBe(JSON.stringify({ name: 'updated', value: 789 }));
  });

  it('should accept a function as value like useState', async () => {
    const { result } = renderHook(() => useLocalStorage(testKey, 10));
    await act(async () => {
      result.current[1]((prev: number) => prev + 5);
    });
    expect(result.current[0]).toBe(15);
    expect(localStorage.getItem(testKey)).toBe('15');
  });

  it('should handle errors gracefully when setting value', async () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
    const { result } = renderHook(() => useLocalStorage(testKey, initialValue));
    await act(async () => {
      result.current[1]({ name: 'error', value: 999 });
    });
    expect(result.current[0]).toEqual({ name: 'error', value: 999 });
  });

  it('should work with string type', () => {
    const { result } = renderHook(() => useLocalStorage('string_key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should work with boolean type', () => {
    const { result } = renderHook(() => useLocalStorage('bool_key', true));
    expect(result.current[0]).toBe(true);
  });

  it('should work with null initial value', () => {
    const { result } = renderHook(() => useLocalStorage('null_key', null));
    expect(result.current[0]).toBeNull();
  });
});
