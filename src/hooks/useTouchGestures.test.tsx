import { renderHook, act } from '@testing-library/react';
import { useTouchGestures } from './useTouchGestures';

// Mock touch events
const createTouchEvent = (type: string, touches: Array<{ clientX: number; clientY: number }>) => {
  const touchList = touches.map(touch => ({
    clientX: touch.clientX,
    clientY: touch.clientY,
    identifier: 0,
    force: 1,
    pageX: touch.clientX,
    pageY: touch.clientY,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    target: document.createElement('div'),
  }));

  return new TouchEvent(type, {
    touches: type === 'touchend' ? [] : touchList,
    changedTouches: touchList,
  });
};

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

    expect(result.current).toHaveProperty('current');
    expect(typeof result.current.current).toBe('object');
  });

  it('seharusnya mendeteksi swipe right dengan benar', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onSwipeRight })
    );

    // Attach ref ke mock element
    act(() => {
      result.current.current = mockElement;
    });

    // Simulasi swipe right (dari kiri ke kanan)
    const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 200 }]);
    const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);

    act(() => {
      mockElement.dispatchEvent(touchStart);
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

    // Simulasi swipe left (dari kanan ke kiri)
    const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
    const touchEnd = createTouchEvent('touchend', [{ clientX: 100, clientY: 200 }]);

    act(() => {
      mockElement.dispatchEvent(touchStart);
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

    // Simulasi swipe up (dari bawah ke atas)
    const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 300 }]);
    const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);

    act(() => {
      mockElement.dispatchEvent(touchStart);
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

    // Simulasi swipe down (dari atas ke bawah)
    const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
    const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 300 }]);

    act(() => {
      mockElement.dispatchEvent(touchStart);
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

    // Simulasi tap (sentuhan cepat dengan pergerakan minimal)
    const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
    const touchEnd = createTouchEvent('touchend', [{ clientX: 205, clientY: 205 }]);

    act(() => {
      mockElement.dispatchEvent(touchStart);
      mockElement.dispatchEvent(touchEnd);
    });

    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it('seharusnya mendeteksi long press dengan benar', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onLongPress })
    );

    act(() => {
      result.current.current = mockElement;
    });

    // Simulasi long press
    const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);

    act(() => {
      mockElement.dispatchEvent(touchStart);
    });

    // Fast forward waktu untuk trigger long press
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('seharusnya membatalkan long press jika ada pergerakan', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onLongPress })
    );

    act(() => {
      result.current.current = mockElement;
    });

    // Simulasi sentuhan dengan pergerakan
    const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
    const touchMove = createTouchEvent('touchmove', [{ clientX: 220, clientY: 200 }]);

    act(() => {
      mockElement.dispatchEvent(touchStart);
      mockElement.dispatchEvent(touchMove);
    });

    // Fast forward waktu - long press seharusnya tidak tertrigger
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();
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

    // Simulasi swipe dengan jarak kurang dari minimum
    const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 200 }]);
    const touchEnd = createTouchEvent('touchend', [{ clientX: 150, clientY: 200 }]); // Jarak 50px

    act(() => {
      mockElement.dispatchEvent(touchStart);
      mockElement.dispatchEvent(touchEnd);
    });

    expect(onSwipeRight).not.toHaveBeenCalled();
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

    const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 200 }]);
    
    act(() => {
      mockElement.dispatchEvent(touchStart);
    });

    // Tunggu lebih lama dari maxSwipeTime
    act(() => {
      jest.advanceTimersByTime(300);
    });

    const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);

    act(() => {
      mockElement.dispatchEvent(touchEnd);
    });

    expect(onSwipeRight).not.toHaveBeenCalled();
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

    const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);

    act(() => {
      mockElement.dispatchEvent(touchStart);
    });

    // Fast forward 500ms - seharusnya belum tertrigger
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();

    // Fast forward 500ms lagi - total 1000ms
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
      result.current.current = mockElement;
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('seharusnya membersihkan long press timer saat unmount', () => {
    const { result, unmount } = renderHook(() => 
      useTouchGestures({ onLongPress })
    );

    act(() => {
      result.current.current = mockElement;
    });

    const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);

    act(() => {
      mockElement.dispatchEvent(touchStart);
    });

    // Unmount sebelum long press tertrigger
    unmount();

    // Fast forward - long press seharusnya tidak tertrigger karena sudah dibersihkan
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('seharusnya tidak memanggil callback jika tidak ada touch start', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onTap })
    );

    act(() => {
      result.current.current = mockElement;
    });

    // Langsung dispatch touch end tanpa touch start
    const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);

    act(() => {
      mockElement.dispatchEvent(touchEnd);
    });

    expect(onTap).not.toHaveBeenCalled();
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

    // Test tap
    const tapStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
    const tapEnd = createTouchEvent('touchend', [{ clientX: 205, clientY: 205 }]);

    act(() => {
      mockElement.dispatchEvent(tapStart);
      mockElement.dispatchEvent(tapEnd);
    });

    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();

    jest.clearAllMocks();

    // Test swipe
    const swipeStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 200 }]);
    const swipeEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);

    act(() => {
      mockElement.dispatchEvent(swipeStart);
      mockElement.dispatchEvent(swipeEnd);
    });

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
    expect(onTap).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
  });
});