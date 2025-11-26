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
      result.current.elementRef.current = mockElement;
    });

    // Simulate swipe right
    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX: 0,
          clientY: 0,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
      });
      
      mockElement.dispatchEvent(touchStart);
      
      // Advance timers slightly to ensure touch start is processed
      jest.advanceTimersByTime(10);
      
      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{
          clientX: 100,
          clientY: 0,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
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
      result.current.elementRef.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX: 200,
          clientY: 100,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
      });
      
      mockElement.dispatchEvent(touchStart);
      jest.advanceTimersByTime(10);
      
      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{
          clientX: 100,
          clientY: 100,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
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
      result.current.elementRef.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX: 100,
          clientY: 200,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
      });
      
      mockElement.dispatchEvent(touchStart);
      jest.advanceTimersByTime(10);
      
      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{
          clientX: 100,
          clientY: 100,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
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
      result.current.elementRef.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX: 100,
          clientY: 100,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
      });
      
      mockElement.dispatchEvent(touchStart);
      jest.advanceTimersByTime(10);
      
      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{
          clientX: 100,
          clientY: 200,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
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
      result.current.elementRef.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX: 100,
          clientY: 100,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
      });
      
      mockElement.dispatchEvent(touchStart);
      jest.advanceTimersByTime(50); // Short time for tap
      
      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{
          clientX: 100,
          clientY: 100,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
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
      result.current.elementRef.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX: 100,
          clientY: 100,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
      });
      
      mockElement.dispatchEvent(touchStart);
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('seharusnya membatalkan long press jika ada pergerakan', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onLongPress, longPressDelay: 500 })
    );

    act(() => {
      result.current.elementRef.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX: 100,
          clientY: 100,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
      });
      
      mockElement.dispatchEvent(touchStart);
    });

    act(() => {
      const touchMove = new TouchEvent('touchmove', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX: 120,
          clientY: 120,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
      });
      
      mockElement.dispatchEvent(touchMove);
    });

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
      result.current.elementRef.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX: 100,
          clientY: 100,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
      });
      
      mockElement.dispatchEvent(touchStart);
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onLongPress).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('seharusnya membersihkan event listeners saat unmount', () => {
    const addEventListenerSpy = jest.spyOn(mockElement, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(mockElement, 'removeEventListener');

    const { result, unmount } = renderHook(() => 
      useTouchGestures({ onTap })
    );

    act(() => {
      result.current.elementRef.current = mockElement;
    });

    // Wait for useEffect to attach listeners
    act(() => {
      jest.advanceTimersByTime(0);
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
      result.current.elementRef.current = mockElement;
    });

    act(() => {
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX: 100,
          clientY: 100,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
      });
      
      mockElement.dispatchEvent(touchStart);
      jest.advanceTimersByTime(50);
      
      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{
          clientX: 100,
          clientY: 100,
          identifier: 0,
          target: mockElement,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
          force: 1
        }]
      });
      
      mockElement.dispatchEvent(touchEnd);
    });

    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
  });
});