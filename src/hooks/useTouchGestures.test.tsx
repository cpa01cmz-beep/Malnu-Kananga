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

    // Mock setTimeout and clearTimeout
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

  it('seharusnya mendeteksi swipe right dengan benar', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onSwipeRight })
    );

    // Attach ref to element
    act(() => {
      result.current.current = mockElement;
    });

    // Simulate touch start
    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100,
          clientY: 100,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchStart);
    });

    // Simulate touch end with swipe right movement
    act(() => {
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 200, // Moved right
          clientY: 100, // Same Y position
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchEnd);
    });

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
  });

  it('seharusnya mendeteksi swipe left dengan benar', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onSwipeLeft })
    );

    act(() => {
      result.current.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 200,
          clientY: 100,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchStart);
    });

    act(() => {
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100, // Moved left
          clientY: 100, // Same Y position
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchEnd);
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });

  it('seharusnya mendeteksi swipe up dengan benar', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onSwipeUp })
    );

    act(() => {
      result.current.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100,
          clientY: 200,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchStart);
    });

    act(() => {
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100, // Same X position
          clientY: 100, // Moved up
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchEnd);
    });

    expect(onSwipeUp).toHaveBeenCalledTimes(1);
  });

  it('seharusnya mendeteksi swipe down dengan benar', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onSwipeDown })
    );

    act(() => {
      result.current.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100,
          clientY: 100,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchStart);
    });

    act(() => {
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100, // Same X position
          clientY: 200, // Moved down
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchEnd);
    });

    expect(onSwipeDown).toHaveBeenCalledTimes(1);
  });

  it('seharusnya mendeteksi tap dengan benar', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onTap })
    );

    act(() => {
      result.current.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100,
          clientY: 100,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchStart);
    });

    act(() => {
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100, // Same position
          clientY: 100, // Same position
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchEnd);
    });

    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it('seharusnya mendeteksi long press dengan benar', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onLongPress, longPressDelay: 500 })
    );

    act(() => {
      result.current.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100,
          clientY: 100,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchStart);
    });

    // Fast forward time to trigger long press
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('seharusnya membatalkan long press jika ada pergerakan', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onLongPress, longPressDelay: 500 })
    );

    act(() => {
      result.current.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100,
          clientY: 100,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchStart);
    });

    act(() => {
      const touchMove = new TouchEvent('touchmove', {
        touches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 120, // Moved
          clientY: 120, // Moved
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchMove);
    });

    // Fast forward time - should not trigger long press due to movement
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('seharusnya menggunakan custom longPressDelay', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onLongPress, longPressDelay: 1000 })
    );

    act(() => {
      result.current.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100,
          clientY: 100,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchStart);
    });

    // Should not trigger yet (only 500ms passed)
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onLongPress).not.toHaveBeenCalled();

    // Should trigger now (1000ms passed)
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('seharusnya membersihkan event listeners saat unmount', () => {
    const addEventListenerSpy = jest.spyOn(mockElement, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(mockElement, 'removeEventListener');

    const { unmount } = renderHook(() => 
      useTouchGestures({ onTap })
    );

    act(() => {
      result.current.current = mockElement;
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('seharusnya menangani multiple gestures dengan benar', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onTap, onSwipeRight, onLongPress })
    );

    act(() => {
      result.current.current = mockElement;
    });

    // Simulate tap (short touch)
    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100,
          clientY: 100,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchStart);
    });

    act(() => {
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100,
          clientY: 100,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchEnd);
    });

    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('seharusnya menghormati minSwipeDistance', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onSwipeRight, minSwipeDistance: 100 })
    );

    act(() => {
      result.current.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100,
          clientY: 100,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchStart);
    });

    act(() => {
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 150, // Only moved 50px, less than minSwipeDistance
          clientY: 100,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchEnd);
    });

    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('seharusnya menghormati maxSwipeTime', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onSwipeRight, maxSwipeTime: 500 })
    );

    act(() => {
      result.current.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 100,
          clientY: 100,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchStart);
    });

    // Wait longer than maxSwipeTime
    act(() => {
      jest.advanceTimersByTime(600);
    });

    act(() => {
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [new Touch({
          identifier: 0,
          target: mockElement,
          clientX: 200,
          clientY: 100,
        } as TouchInit)],
      });
      mockElement.dispatchEvent(touchEnd);
    });

    expect(onSwipeRight).not.toHaveBeenCalled();
  });
});