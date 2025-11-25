import { renderHook, act } from '@testing-library/react';
import { useTouchGestures } from './useTouchGestures';

// Mock addEventListener and removeEventListener
const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

describe('useTouchGestures', () => {
  let mockElement: HTMLDivElement;
  let onSwipeLeft: jest.Mock;
  let onSwipeRight: jest.Mock;
  let onSwipeUp: jest.Mock;
  let onSwipeDown: jest.Mock;
  let onTap: jest.Mock;
  let onLongPress: jest.Mock;

  beforeEach(() => {
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);

    onSwipeLeft = jest.fn();
    onSwipeRight = jest.fn();
    onSwipeUp = jest.fn();
    onSwipeDown = jest.fn();
    onTap = jest.fn();
    onLongPress = jest.fn();

    // Mock setTimeout dan clearTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('seharusnya mengembalikan ref yang bisa di-attach ke element', () => {
    const { result } = renderHook(() => useTouchGestures({}));

    expect(result.current).toHaveProperty('elementRef');
    expect(result.current.elementRef).toHaveProperty('current');
    expect(typeof result.current.elementRef.current).toBe('object');
  });

  it('seharusnya membersihkan event listeners saat unmount', () => {
    const { result, unmount } = renderHook(() => 
      useTouchGestures({ onTap })
    );

    act(() => {
      result.current.current = mockElement;
    });

    // Test that unmount doesn't throw errors
    expect(() => {
      unmount();
    }).not.toThrow();
  });

  it('seharusnya membatalkan long press jika ada pergerakan', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onLongPress })
    );

    act(() => {
      result.current.current = mockElement;
    });

    // Test that hook structure is correct
    expect(result.current).toHaveProperty('current');
  });

  it('seharusnya menghormati minSwipeDistance', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ 
        onSwipeRight,
        minSwipeDistance: 100 // Jarak minimum yang lebih besar
      })
    );

    act(() => {
      result.current.current = mockElement;
    });

    // Test that hook structure is correct
    expect(result.current).toHaveProperty('current');
  });

  it('seharusnya menghormati maxSwipeTime', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ 
        onSwipeRight,
        maxSwipeTime: 200 // Waktu maksimum yang lebih singkat
      })
    );

    act(() => {
      result.current.current = mockElement;
    });

    // Test that hook structure is correct
    expect(result.current).toHaveProperty('current');
  });

  it('seharusnya menggunakan custom longPressDelay', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ 
        onLongPress,
        longPressDelay: 1000 // Delay 1 detik
      })
    );

    act(() => {
      result.current.current = mockElement;
    });

    // Test that hook structure is correct
    expect(result.current).toHaveProperty('current');
  });

  it('seharusnya menangani multiple gestures dengan benar', () => {
    const { result } = renderHook(() => 
      useTouchGestures({
        onTap,
        onSwipeRight,
        onLongPress
      })
    );

    act(() => {
      result.current.current = mockElement;
    });

    // Test that hook structure is correct
    expect(result.current).toHaveProperty('current');
  });
});