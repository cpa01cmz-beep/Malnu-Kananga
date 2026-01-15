import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTouchGestures, SwipeDirection, PinchState, TouchGesturesOptions } from '../useTouchGestures';

describe('useTouchGestures', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it('should initialize with inactive state', () => {
    const { result } = renderHook(() => useTouchGestures({ element: container }));
    expect(result.current.isActive).toBe(false);
  });

  it('should detect swipe gesture', () => {
    const onSwipeMock = vi.fn();
    renderHook(() => useTouchGestures({ element: container, onSwipe: onSwipeMock }));

    const touchStart = new TouchEvent('touchstart', {
      touches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 100 })],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    const touchEnd = new TouchEvent('touchend', {
      touches: [],
      changedTouches: [new Touch({ identifier: 1, target: container, clientX: 200, clientY: 100 })],
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(touchStart);
    container.dispatchEvent(touchEnd);

    expect(onSwipeMock).toHaveBeenCalledWith({
      direction: 'right',
      distance: 100,
      duration: expect.any(Number),
    });
  });

  it('should detect left swipe', () => {
    const onSwipeMock = vi.fn();
    renderHook(() => useTouchGestures({ element: container, onSwipe: onSwipeMock }));

    const touchStart = new TouchEvent('touchstart', {
      touches: [new Touch({ identifier: 1, target: container, clientX: 200, clientY: 100 })],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    const touchEnd = new TouchEvent('touchend', {
      touches: [],
      changedTouches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 100 })],
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(touchStart);
    container.dispatchEvent(touchEnd);

    expect(onSwipeMock).toHaveBeenCalledWith({
      direction: 'left',
      distance: expect.any(Number),
      duration: expect.any(Number),
    });
  });

  it('should detect up swipe', () => {
    const onSwipeMock = vi.fn();
    renderHook(() => useTouchGestures({ element: container, onSwipe: onSwipeMock }));

    const touchStart = new TouchEvent('touchstart', {
      touches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 200 })],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    const touchEnd = new TouchEvent('touchend', {
      touches: [],
      changedTouches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 100 })],
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(touchStart);
    container.dispatchEvent(touchEnd);

    expect(onSwipeMock).toHaveBeenCalledWith({
      direction: 'up',
      distance: expect.any(Number),
      duration: expect.any(Number),
    });
  });

  it('should detect down swipe', () => {
    const onSwipeMock = vi.fn();
    renderHook(() => useTouchGestures({ element: container, onSwipe: onSwipeMock }));

    const touchStart = new TouchEvent('touchstart', {
      touches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 100 })],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    const touchEnd = new TouchEvent('touchend', {
      touches: [],
      changedTouches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 200 })],
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(touchStart);
    container.dispatchEvent(touchEnd);

    expect(onSwipeMock).toHaveBeenCalledWith({
      direction: 'down',
      distance: expect.any(Number),
      duration: expect.any(Number),
    });
  });

  it('should detect tap gesture', () => {
    const onTapMock = vi.fn();
    renderHook(() => useTouchGestures({ element: container, onTap: onTapMock }));

    const touchStart = new TouchEvent('touchstart', {
      touches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 100 })],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    const touchEnd = new TouchEvent('touchend', {
      touches: [],
      changedTouches: [new Touch({ identifier: 1, target: container, clientX: 105, clientY: 102 })],
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(touchStart);
    container.dispatchEvent(touchEnd);

    expect(onTapMock).toHaveBeenCalled();
  });

  it('should detect long press gesture', () => {
    vi.useFakeTimers();
    const onLongPressMock = vi.fn();
    renderHook(() => useTouchGestures({ element: container, onLongPress: onLongPressMock, longPressDelay: 500 }));

    const touchStart = new TouchEvent('touchstart', {
      touches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 100 })],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(touchStart);
    vi.advanceTimersByTime(500);

    expect(onLongPressMock).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should cancel long press on touch move', () => {
    vi.useFakeTimers();
    const onLongPressMock = vi.fn();
    renderHook(() => useTouchGestures({ element: container, onLongPress: onLongPressMock, longPressDelay: 500 }));

    const touchStart = new TouchEvent('touchstart', {
      touches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 100 })],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    const touchMove = new TouchEvent('touchmove', {
      touches: [new Touch({ identifier: 1, target: container, clientX: 105, clientY: 105 })],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(touchStart);
    container.dispatchEvent(touchMove);
    vi.advanceTimersByTime(500);

    expect(onLongPressMock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should detect pinch gesture', () => {
    const onPinchMock = vi.fn();
    renderHook(() => useTouchGestures({ element: container, onPinch: onPinchMock }));

    const touchStart = new TouchEvent('touchstart', {
      touches: [
        new Touch({ identifier: 1, target: container, clientX: 100, clientY: 100 }),
        new Touch({ identifier: 2, target: container, clientX: 200, clientY: 100 }),
      ],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    const touchMove = new TouchEvent('touchmove', {
      touches: [
        new Touch({ identifier: 1, target: container, clientX: 90, clientY: 100 }),
        new Touch({ identifier: 2, target: container, clientX: 210, clientY: 100 }),
      ],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(touchStart);
    container.dispatchEvent(touchMove);

    expect(onPinchMock).toHaveBeenCalledWith({
      scale: expect.any(Number),
      distance: expect.any(Number),
      centerX: expect.any(Number),
      centerY: expect.any(Number),
    });
  });

  it('should respect swipe threshold', () => {
    const onSwipeMock = vi.fn();
    renderHook(() => useTouchGestures({ element: container, onSwipe: onSwipeMock, swipeThreshold: 100 }));

    const touchStart = new TouchEvent('touchstart', {
      touches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 100 })],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    const touchEnd = new TouchEvent('touchend', {
      touches: [],
      changedTouches: [new Touch({ identifier: 1, target: container, clientX: 130, clientY: 100 })],
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(touchStart);
    container.dispatchEvent(touchEnd);

    expect(onSwipeMock).not.toHaveBeenCalled();
  });

  it('should reset gesture state', () => {
    const { result } = renderHook(() => useTouchGestures({ element: container }));
    
    const touchStart = new TouchEvent('touchstart', {
      touches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 100 })],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(touchStart);
    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.isActive).toBe(false);
  });

  it('should handle touch cancel event', () => {
    const onSwipeMock = vi.fn();
    const onLongPressMock = vi.fn();
    const { result } = renderHook(() => useTouchGestures({ 
      element: container, 
      onSwipe: onSwipeMock, 
      onLongPress: onLongPressMock 
    }));

    const touchStart = new TouchEvent('touchstart', {
      touches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 100 })],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(touchStart);
    
    const touchCancel = new TouchEvent('touchcancel', {
      touches: [],
      changedTouches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 100 })],
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(touchCancel);
    
    expect(result.current.isActive).toBe(false);
  });

  it('should not trigger gestures when disabled', () => {
    const onSwipeMock = vi.fn();
    const onTapMock = vi.fn();
    renderHook(() => useTouchGestures({ 
      element: container, 
      onSwipe: onSwipeMock, 
      onTap: onTapMock,
      enableSwipe: false,
      enableTap: false,
    }));

    const touchStart = new TouchEvent('touchstart', {
      touches: [new Touch({ identifier: 1, target: container, clientX: 100, clientY: 100 })],
      changedTouches: [],
      bubbles: true,
      cancelable: true,
    });

    const touchEnd = new TouchEvent('touchend', {
      touches: [],
      changedTouches: [new Touch({ identifier: 1, target: container, clientX: 150, clientY: 100 })],
      bubbles: true,
      cancelable: true,
    });

    container.dispatchEvent(touchStart);
    container.dispatchEvent(touchEnd);

    expect(onSwipeMock).not.toHaveBeenCalled();
    expect(onTapMock).not.toHaveBeenCalled();
  });
});
