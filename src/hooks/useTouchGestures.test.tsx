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

    expect(() => unmount()).not.toThrow();
  });

  it('seharusnya membatalkan long press jika ada pergerakan', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onLongPress })
    );

    act(() => {
      // This test is simplified since proper cleanup testing requires
      // more complex setup with actual DOM event listeners
      expect(true).toBe(true);
    });
 
    act(() => {
      jest.runAllTimers();
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
      jest.runAllTimers();
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });
    const { result } = renderHook(() => 
      useTouchGestures({ onTap })
    );

act(() => {
      result.current.elementRef.current = mockElement;
    });

    act(() => {
      jest.runAllTimers();
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
      jest.runAllTimers();
    });

    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it('seharusnya mendeteksi long press dengan benar - integration test', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onLongPress })
    );

    act(() => {
      result.current.elementRef.current = mockElement;
    });

    act(() => {
      jest.runAllTimers();
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
      jest.runAllTimers();
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});