import { renderHook, act } from '@testing-library/react';
import { useTouchFeedback } from './useTouchFeedback';

describe('useTouchFeedback', () => {
  let mockElement: HTMLDivElement;

  beforeEach(() => {
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);
    
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: jest.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
    jest.clearAllMocks();
  });

  it('seharusnya mengembalikan elementRef, handleTouchFeedback, dan cleanup', () => {
    const { result } = renderHook(() => useTouchFeedback());

    expect(result.current).toHaveProperty('elementRef');
    expect(result.current).toHaveProperty('handleTouchFeedback');
    expect(result.current).toHaveProperty('cleanup');
    expect(typeof result.current.elementRef.current).toBe('object');
    expect(typeof result.current.handleTouchFeedback).toBe('function');
    expect(typeof result.current.cleanup).toBe('function');
  });

  it('seharusnya memicu haptic feedback saat touch', () => {
    const { result } = renderHook(() => useTouchFeedback());

    const touchEvent = {
      currentTarget: mockElement,
    } as React.TouchEvent<HTMLElement>;

    act(() => {
      result.current.handleTouchFeedback(touchEvent);
    });

    expect(navigator.vibrate).toHaveBeenCalledWith(50);
  });

  it('seharusnya menambahkan feedback class saat touch', () => {
    const { result } = renderHook(() => useTouchFeedback());

    const touchEvent = {
      currentTarget: mockElement,
    } as React.TouchEvent<HTMLElement>;

    act(() => {
      result.current.handleTouchFeedback(touchEvent);
    });

    expect(mockElement.classList.contains('touch-feedback')).toBe(true);
  });

  it('seharusnya menghapus feedback class setelah duration', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useTouchFeedback());

    const touchEvent = {
      currentTarget: mockElement,
    } as React.TouchEvent<HTMLElement>;

    act(() => {
      result.current.handleTouchFeedback(touchEvent);
    });

    expect(mockElement.classList.contains('touch-feedback')).toBe(true);

    // Fast forward melebihi feedback duration
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockElement.classList.contains('touch-feedback')).toBe(false);
    
    jest.useRealTimers();
  });

  it('seharusnya menggunakan custom feedback class', () => {
    const { result } = renderHook(() => useTouchFeedback({
      feedbackClass: 'custom-feedback'
    }));

    const touchEvent = {
      currentTarget: mockElement,
    } as React.TouchEvent<HTMLElement>;

    act(() => {
      result.current.handleTouchFeedback(touchEvent);
    });

    expect(mockElement.classList.contains('custom-feedback')).toBe(true);
    expect(mockElement.classList.contains('touch-feedback')).toBe(false);
  });

  it('seharusnya menggunakan custom feedback duration', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useTouchFeedback({
      feedbackDuration: 300
    }));

    const touchEvent = {
      currentTarget: mockElement,
    } as React.TouchEvent<HTMLElement>;

    act(() => {
      result.current.handleTouchFeedback(touchEvent);
    });

    expect(mockElement.classList.contains('touch-feedback')).toBe(true);

    // Fast forward 200ms - seharusnya masih ada class
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockElement.classList.contains('touch-feedback')).toBe(true);

    // Fast forward 100ms lagi - total 300ms
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockElement.classList.contains('touch-feedback')).toBe(false);
    
    jest.useRealTimers();
  });

  it('seharusnya tidak memicu haptic feedback jika disabled', () => {
    const { result } = renderHook(() => useTouchFeedback({
      hapticFeedback: false
    }));

    const touchEvent = {
      currentTarget: mockElement,
    } as React.TouchEvent<HTMLElement>;

    act(() => {
      result.current.handleTouchFeedback(touchEvent);
    });

    expect(navigator.vibrate).not.toHaveBeenCalled();
  });

  it('seharusnya tidak menambah visual feedback jika disabled', () => {
    const { result } = renderHook(() => useTouchFeedback({
      visualFeedback: false
    }));

    const touchEvent = {
      currentTarget: mockElement,
    } as React.TouchEvent<HTMLElement>;

    act(() => {
      result.current.handleTouchFeedback(touchEvent);
    });

    expect(mockElement.classList.contains('touch-feedback')).toBe(false);
  });

  it('seharusnya membersihkan timeout saat cleanup dipanggil', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useTouchFeedback());

    const touchEvent = {
      currentTarget: mockElement,
    } as React.TouchEvent<HTMLElement>;

    act(() => {
      result.current.handleTouchFeedback(touchEvent);
    });

    expect(mockElement.classList.contains('touch-feedback')).toBe(true);

    // Cleanup sebelum timeout selesai
    act(() => {
      result.current.cleanup();
    });

    // Fast forward - class seharusnya sudah dihapus oleh cleanup
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockElement.classList.contains('touch-feedback')).toBe(false);
    
    jest.useRealTimers();
  });

  it('seharusnya menangani multiple touch events dengan benar', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useTouchFeedback());

    const touchEvent = {
      currentTarget: mockElement,
    } as React.TouchEvent<HTMLElement>;

    // Multiple touch events
    act(() => {
      result.current.handleTouchFeedback(touchEvent);
    });

    expect(mockElement.classList.contains('touch-feedback')).toBe(true);

    // Touch lagi sebelum timeout selesai
    act(() => {
      result.current.handleTouchFeedback(touchEvent);
    });

    // Fast forward - class seharusnya dihapus setelah duration terakhir
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockElement.classList.contains('touch-feedback')).toBe(false);
    
    jest.useRealTimers();
  });

  it('seharusnya tidak error jika navigator.vibrate tidak tersedia', () => {
    // Remove vibrate from navigator
    const originalVibrate = navigator.vibrate;
    delete (navigator as any).vibrate;

    const { result } = renderHook(() => useTouchFeedback());

    const touchEvent = {
      currentTarget: mockElement,
    } as React.TouchEvent<HTMLElement>;

    expect(() => {
      act(() => {
        result.current.handleTouchFeedback(touchEvent);
      });
    }).not.toThrow();

    // Restore vibrate
    (navigator as any).vibrate = originalVibrate;
  });
});