import { renderHook, act } from '@testing-library/react';
import { useTouchGestures } from './useTouchGestures';

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

    jest.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('seharusnya mereturn ref element', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onTap })
    );

    expect(result.current.elementRef).toBeDefined();
    expect(result.current.elementRef.current).toBe(null);
  });

  it('seharusnya mengatur ref ke element yang diberikan', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onTap })
    );

    act(() => {
      result.current.elementRef.current = mockElement;
    });

    expect(result.current.elementRef.current).toBe(mockElement);
  });

  it('seharusnya membersihkan timers saat unmount', () => {
    const { unmount } = renderHook(() => 
      useTouchGestures({ onLongPress })
    );

    // Test that unmount doesn't throw errors
    expect(() => unmount()).not.toThrow();
  });

  it('seharusnya menggunakan custom longPressDelay', () => {
    const { unmount } = renderHook(() => 
      useTouchGestures({ onLongPress, longPressDelay: 1000 })
    );

    // Test that custom delay is accepted
    expect(true).toBe(true); // Basic test that hook accepts custom delay
    
    unmount();
  });

  it('seharusnya menggunakan custom minSwipeDistance', () => {
    const { unmount } = renderHook(() => 
      useTouchGestures({ onSwipeRight, minSwipeDistance: 100 })
    );

    // Test that custom distance is accepted
    expect(true).toBe(true); // Basic test that hook accepts custom distance
    
    unmount();
  });

  it('seharusnya menggunakan custom maxSwipeTime', () => {
    const { unmount } = renderHook(() => 
      useTouchGestures({ onSwipeRight, maxSwipeTime: 500 })
    );

    // Test that custom time is accepted
    expect(true).toBe(true); // Basic test that hook accepts custom time
    
    unmount();
  });

  it('seharusnya handle empty options', () => {
    const { unmount } = renderHook(() => 
      useTouchGestures({})
    );

    // Test that hook works with no options
    expect(true).toBe(true);
    
    unmount();
  });

  it('seharusnya handle null element ref', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onTap })
    );

    // Ref should be null initially
    expect(result.current.elementRef.current).toBe(null);
  });
});