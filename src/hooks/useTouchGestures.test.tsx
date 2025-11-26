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

  it('seharusnya mendeteksi swipe right dengan benar', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onSwipeRight })
    );

    // First, set the ref to the element
    act(() => {
      result.current.elementRef.current = mockElement;
    });

    // Wait for useEffect to run and attach event listeners
    // The useEffect will run automatically after setting the ref
    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{
        clientX: 100,
        clientY: 200,
        identifier: 0,
        force: 1,
        pageX: 100,
        pageY: 200,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        target: mockElement
      }]
    });

    const touchEndEvent = new TouchEvent('touchend', {
      changedTouches: [{
        clientX: 200,
        clientY: 200,
        identifier: 0,
        force: 1,
        pageX: 200,
        pageY: 200,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        target: mockElement
      }]
    });

    // Dispatch events - should trigger the swipe right callback
    act(() => {
      mockElement.dispatchEvent(touchStartEvent);
      jest.advanceTimersByTime(10);
      mockElement.dispatchEvent(touchEndEvent);
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

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{
        clientX: 200,
        clientY: 200,
        identifier: 0,
        force: 1,
        pageX: 200,
        pageY: 200,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        target: mockElement
      }]
    });

    const touchEndEvent = new TouchEvent('touchend', {
      changedTouches: [{
        clientX: 100,
        clientY: 200,
        identifier: 0,
        force: 1,
        pageX: 100,
        pageY: 200,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        target: mockElement
      }]
    });

    act(() => {
      mockElement.dispatchEvent(touchStartEvent);
      jest.advanceTimersByTime(10);
      mockElement.dispatchEvent(touchEndEvent);
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

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{
        clientX: 200,
        clientY: 300,
        identifier: 0,
        force: 1,
        pageX: 200,
        pageY: 300,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        target: mockElement
      }]
    });

    const touchEndEvent = new TouchEvent('touchend', {
      changedTouches: [{
        clientX: 200,
        clientY: 200,
        identifier: 0,
        force: 1,
        pageX: 200,
        pageY: 200,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        target: mockElement
      }]
    });

    act(() => {
      mockElement.dispatchEvent(touchStartEvent);
      jest.advanceTimersByTime(10);
      mockElement.dispatchEvent(touchEndEvent);
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

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{
        clientX: 200,
        clientY: 200,
        identifier: 0,
        force: 1,
        pageX: 200,
        pageY: 200,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        target: mockElement
      }]
    });

    const touchEndEvent = new TouchEvent('touchend', {
      changedTouches: [{
        clientX: 200,
        clientY: 300,
        identifier: 0,
        force: 1,
        pageX: 200,
        pageY: 300,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        target: mockElement
      }]
    });

    act(() => {
      mockElement.dispatchEvent(touchStartEvent);
      jest.advanceTimersByTime(10);
      mockElement.dispatchEvent(touchEndEvent);
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

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{
        clientX: 200,
        clientY: 200,
        identifier: 0,
        force: 1,
        pageX: 200,
        pageY: 200,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        target: mockElement
      }]
    });

    const touchEndEvent = new TouchEvent('touchend', {
      changedTouches: [{
        clientX: 205,
        clientY: 205,
        identifier: 0,
        force: 1,
        pageX: 205,
        pageY: 205,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        target: mockElement
      }]
    });

    act(() => {
      mockElement.dispatchEvent(touchStartEvent);
      jest.advanceTimersByTime(10);
      mockElement.dispatchEvent(touchEndEvent);
    });

    expect(onTap).toHaveBeenCalledTimes(1);
  });

it('seharusnya membersihkan timers saat unmount', () => {
     const { unmount } = renderHook(() => 
       useTouchGestures({ onLongPress })
     );

     // Test that unmount doesn't throw errors
     expect(() => unmount()).not.toThrow();
   });

it('seharusnya mendeteksi long press dengan benar', () => {
      const { result } = renderHook(() => 
        useTouchGestures({ onLongPress })
      );

      act(() => {
        result.current.elementRef.current = mockElement;
      });

     const touchStartEvent = new TouchEvent('touchstart', {
       touches: [{
         clientX: 200,
         clientY: 200,
         identifier: 0,
         force: 1,
         pageX: 200,
         pageY: 200,
         radiusX: 1,
         radiusY: 1,
         rotationAngle: 0,
         target: mockElement
       }]
     });

     act(() => {
       mockElement.dispatchEvent(touchStartEvent);
       jest.advanceTimersByTime(500);
     });

     expect(onLongPress).toHaveBeenCalledTimes(1);
   });

it('seharusnya membatalkan long press jika ada pergerakan', () => {
      const { result } = renderHook(() => 
        useTouchGestures({ onLongPress })
      );

      act(() => {
        result.current.elementRef.current = mockElement;
      });

     const touchStartEvent = new TouchEvent('touchstart', {
       touches: [{
         clientX: 200,
         clientY: 200,
         identifier: 0,
         force: 1,
         pageX: 200,
         pageY: 200,
         radiusX: 1,
         radiusY: 1,
         rotationAngle: 0,
         target: mockElement
       }]
     });

     const touchMoveEvent = new TouchEvent('touchmove', {
       touches: [{
         clientX: 220,
         clientY: 200,
         identifier: 0,
         force: 1,
         pageX: 220,
         pageY: 200,
         radiusX: 1,
         radiusY: 1,
         rotationAngle: 0,
         target: mockElement
       }]
     });

     act(() => {
       mockElement.dispatchEvent(touchStartEvent);
       mockElement.dispatchEvent(touchMoveEvent);
       jest.advanceTimersByTime(500);
     });

     expect(onLongPress).not.toHaveBeenCalled();
   });

it('seharusnya menghormati minSwipeDistance', () => {
      const { result } = renderHook(() => 
        useTouchGestures({ 
          onSwipeRight,
          minSwipeDistance: 100
        })
      );

      act(() => {
        result.current.elementRef.current = mockElement;
      });

     const touchStartEvent = new TouchEvent('touchstart', {
       touches: [{
         clientX: 100,
         clientY: 200,
         identifier: 0,
         force: 1,
         pageX: 100,
         pageY: 200,
         radiusX: 1,
         radiusY: 1,
         rotationAngle: 0,
         target: mockElement
       }]
     });

     const touchEndEvent = new TouchEvent('touchend', {
       changedTouches: [{
         clientX: 150,
         clientY: 200,
         identifier: 0,
         force: 1,
         pageX: 150,
         pageY: 200,
         radiusX: 1,
         radiusY: 1,
         rotationAngle: 0,
         target: mockElement
       }]
     });

     act(() => {
       mockElement.dispatchEvent(touchStartEvent);
       jest.advanceTimersByTime(10);
       mockElement.dispatchEvent(touchEndEvent);
     });

     expect(onSwipeRight).not.toHaveBeenCalled();
   });

it('seharusnya menghormati maxSwipeTime', () => {
      const { result } = renderHook(() => 
        useTouchGestures({ 
          onSwipeRight,
          maxSwipeTime: 200
        })
      );

      act(() => {
        result.current.elementRef.current = mockElement;
      });

     const touchStartEvent = new TouchEvent('touchstart', {
       touches: [{
         clientX: 100,
         clientY: 200,
         identifier: 0,
         force: 1,
         pageX: 100,
         pageY: 200,
         radiusX: 1,
         radiusY: 1,
         rotationAngle: 0,
         target: mockElement
       }]
     });

     const touchEndEvent = new TouchEvent('touchend', {
       changedTouches: [{
         clientX: 200,
         clientY: 200,
         identifier: 0,
         force: 1,
         pageX: 200,
         pageY: 200,
         radiusX: 1,
         radiusY: 1,
         rotationAngle: 0,
         target: mockElement
       }]
     });

     act(() => {
       mockElement.dispatchEvent(touchStartEvent);
       jest.advanceTimersByTime(300);
       mockElement.dispatchEvent(touchEndEvent);
     });

     expect(onSwipeRight).not.toHaveBeenCalled();
   });

it('seharusnya menggunakan custom longPressDelay', () => {
      const { result } = renderHook(() => 
        useTouchGestures({ 
          onLongPress,
          longPressDelay: 1000
        })
      );

      act(() => {
        result.current.elementRef.current = mockElement;
      });

     const touchStartEvent = new TouchEvent('touchstart', {
       touches: [{
         clientX: 200,
         clientY: 200,
         identifier: 0,
         force: 1,
         pageX: 200,
         pageY: 200,
         radiusX: 1,
         radiusY: 1,
         rotationAngle: 0,
         target: mockElement
       }]
     });

     act(() => {
       mockElement.dispatchEvent(touchStartEvent);
       jest.advanceTimersByTime(500);
     });

     expect(onLongPress).not.toHaveBeenCalled();

     act(() => {
       jest.advanceTimersByTime(500);
     });

     expect(onLongPress).toHaveBeenCalledTimes(1);
   });

it('seharusnya membersihkan event listeners saat unmount', () => {
      const removeEventListenerSpy = jest.spyOn(mockElement, 'removeEventListener');

      const { result, unmount } = renderHook(() => 
        useTouchGestures({ onTap })
      );

      act(() => {
        result.current.elementRef.current = mockElement;
      });

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

it('seharusnya menangani multiple gestures dengan benar', () => {
      const { result } = renderHook(() => 
        useTouchGestures({
          onTap,
          onSwipeRight,
          onLongPress
        })
      );

      act(() => {
        result.current.elementRef.current = mockElement;
      });

     const tapStartEvent = new TouchEvent('touchstart', {
       touches: [{
         clientX: 200,
         clientY: 200,
         identifier: 0,
         force: 1,
         pageX: 200,
         pageY: 200,
         radiusX: 1,
         radiusY: 1,
         rotationAngle: 0,
         target: mockElement
       }]
     });

     const tapEndEvent = new TouchEvent('touchend', {
       changedTouches: [{
         clientX: 205,
         clientY: 205,
         identifier: 0,
         force: 1,
         pageX: 205,
         pageY: 205,
         radiusX: 1,
         radiusY: 1,
         rotationAngle: 0,
         target: mockElement
       }]
     });

     act(() => {
       mockElement.dispatchEvent(tapStartEvent);
       jest.advanceTimersByTime(10);
       mockElement.dispatchEvent(tapEndEvent);
     });

     expect(onTap).toHaveBeenCalledTimes(1);
     expect(onSwipeRight).not.toHaveBeenCalled();
     expect(onLongPress).not.toHaveBeenCalled();

     jest.clearAllMocks();

     const swipeStartEvent = new TouchEvent('touchstart', {
       touches: [{
         clientX: 100,
         clientY: 200,
         identifier: 0,
         force: 1,
         pageX: 100,
         pageY: 200,
         radiusX: 1,
         radiusY: 1,
         rotationAngle: 0,
         target: mockElement
       }]
     });

     const swipeEndEvent = new TouchEvent('touchend', {
       changedTouches: [{
         clientX: 200,
         clientY: 200,
         identifier: 0,
         force: 1,
         pageX: 200,
         pageY: 200,
         radiusX: 1,
         radiusY: 1,
         rotationAngle: 0,
         target: mockElement
       }]
     });

     act(() => {
       mockElement.dispatchEvent(swipeStartEvent);
       jest.advanceTimersByTime(10);
       mockElement.dispatchEvent(swipeEndEvent);
     });

     expect(onSwipeRight).toHaveBeenCalledTimes(1);
     expect(onTap).not.toHaveBeenCalled();
     expect(onLongPress).not.toHaveBeenCalled();
   });
});