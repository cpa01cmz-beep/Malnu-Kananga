import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFocusScope } from '../useFocusScope';

vi.mock('../constants', () => ({
  TIME_MS: {
    ONE_SECOND: 1000,
  },
  UI_ACCESSIBILITY: {
    OFFSCREEN_POSITION: '-9999px',
  },
}));

describe('useFocusScope Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default options', () => {
    const { result } = renderHook(() => useFocusScope());

    expect(result.current.scopeRef).toBeDefined();
  });

  it('should accept custom options without error', () => {
    const { result } = renderHook(() =>
      useFocusScope({
        restoreFocus: false,
        autoFocus: false,
        trapFocus: false,
        onEscape: vi.fn(),
        onEnter: vi.fn(),
      })
    );

    expect(result.current.scopeRef).toBeDefined();
  });

  it('should provide scopeRef', () => {
    const { result } = renderHook(() => useFocusScope());

    expect(result.current.scopeRef).toBeDefined();
    expect('current' in result.current.scopeRef).toBe(true);
  });

  it('should provide focus management functions', () => {
    const { result } = renderHook(() => useFocusScope());

    expect(typeof result.current.focusFirst).toBe('function');
    expect(typeof result.current.focusLast).toBe('function');
    expect(typeof result.current.getEdgeElements).toBe('function');
    expect(typeof result.current.getFocusableElements).toBe('function');
  });

  it('should return getFocusableElements that returns array', () => {
    const { result } = renderHook(() => useFocusScope());

    expect(Array.isArray(result.current.getFocusableElements())).toBe(true);
  });

  it('should return getEdgeElements with first and last', () => {
    const { result } = renderHook(() => useFocusScope());

    const edges = result.current.getEdgeElements();
    expect(edges).toHaveProperty('first');
    expect(edges).toHaveProperty('last');
  });

  it('should focusFirst return false when no elements', () => {
    const { result } = renderHook(() => useFocusScope());

    const focused = result.current.focusFirst();
    expect(focused).toBe(false);
  });

  it('should focusLast return false when no elements', () => {
    const { result } = renderHook(() => useFocusScope());

    const focused = result.current.focusLast();
    expect(focused).toBe(false);
  });
});
