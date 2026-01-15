export interface HapticFeedbackOptions {
  style?: 'light' | 'medium' | 'heavy';
  duration?: number;
}

export type HapticPattern = HapticFeedbackOptions | number[];

export function hapticFeedback(options: HapticFeedbackOptions = {}): boolean {
  if (!isHapticSupported()) {
    return false;
  }

  const { style = 'medium', duration } = options;
  const navigatorVibrate = (window.navigator as Navigator & { vibrate: (pattern: HapticPattern) => boolean }).vibrate;

  if (duration !== undefined) {
    return navigatorVibrate(duration);
  }

  switch (style) {
    case 'light':
      return navigatorVibrate(10);
    case 'medium':
      return navigatorVibrate(20);
    case 'heavy':
      return navigatorVibrate(30);
    default:
      return navigatorVibrate(20);
  }
}

export function hapticPattern(pattern: number[]): boolean {
  if (!isHapticSupported()) {
    return false;
  }

  const navigatorVibrate = (window.navigator as Navigator & { vibrate: (pattern: HapticPattern) => boolean }).vibrate;
  return navigatorVibrate(pattern);
}

export function hapticSuccess(): boolean {
  return hapticPattern([10, 30, 10]);
}

export function hapticError(): boolean {
  return hapticPattern([50, 50, 50]);
}

export function hapticWarning(): boolean {
  return hapticPattern([20, 30]);
}

export function hapticTap(): boolean {
  return hapticFeedback({ style: 'light' });
}

export function hapticLongPress(): boolean {
  return hapticFeedback({ style: 'heavy' });
}

export function isHapticSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'navigator' in window &&
    'vibrate' in window.navigator &&
    typeof (window.navigator as Navigator & { vibrate: (pattern: HapticPattern) => boolean }).vibrate === 'function'
  );
}

export function hapticSwipe(direction: 'left' | 'right' | 'up' | 'down'): boolean {
  const pattern = {
    left: [5, 5, 5, 5, 5],
    right: [5, 5, 5, 5, 5],
    up: [10, 10, 10],
    down: [10, 10, 10],
  }[direction];

  return hapticPattern(pattern);
}

export function hapticScaleUp(): boolean {
  return hapticPattern([5, 10, 15]);
}

export function hapticScaleDown(): boolean {
  return hapticPattern([15, 10, 5]);
}

export const hapticConstants = {
  LIGHT: 10,
  MEDIUM: 20,
  HEAVY: 30,
  TAP: 5,
  SUCCESS: [10, 30, 10],
  ERROR: [50, 50, 50],
  WARNING: [20, 30],
  SWIPE: [5, 5, 5, 5, 5],
  SCALE_UP: [5, 10, 15],
  SCALE_DOWN: [15, 10, 5],
} as const;
