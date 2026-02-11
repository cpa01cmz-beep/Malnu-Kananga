/**
 * Enhanced Haptic Feedback System
 * Provides sophisticated touch feedback patterns for mobile interactions
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection' | 'impact' | 'notification' | 'swipe' | 'delete' | 'confirm' | 'longPress' | 'doubleTap';

export interface HapticConfig {
  enabled: boolean;
  intensity: 'low' | 'medium' | 'high';
  pattern: HapticPattern;
}

class HapticFeedbackManager {
  private static instance: HapticFeedbackManager;
  private isSupported: boolean = false;
  private isEnabled: boolean = true;
  private intensity: 'low' | 'medium' | 'high' = 'medium';

  private constructor() {
    this.checkSupport();
  }

  public static getInstance(): HapticFeedbackManager {
    if (!HapticFeedbackManager.instance) {
      HapticFeedbackManager.instance = new HapticFeedbackManager();
    }
    return HapticFeedbackManager.instance;
  }

  private checkSupport(): void {
    this.isSupported = 'vibrate' in navigator;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled && this.isSupported;
  }

  public setIntensity(intensity: 'low' | 'medium' | 'high'): void {
    this.intensity = intensity;
  }

  public getSupported(): boolean {
    return this.isSupported;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  private getIntensityMultiplier(): number {
    switch (this.intensity) {
      case 'low': return 0.5;
      case 'medium': return 1.0;
      case 'high': return 1.5;
      default: return 1.0;
    }
  }

  private adaptPattern(pattern: number[]): number[] {
    const multiplier = this.getIntensityMultiplier();
    return pattern.map(duration => Math.round(duration * multiplier));
  }

  public trigger(pattern: HapticPattern): void {
    if (!this.isEnabled || !this.isSupported) {
      return;
    }

    // Only trigger on mobile devices with touch support
    if (window.innerWidth > 768 || !('ontouchstart' in window)) {
      return;
    }

    const vibrationPatterns = {
      // Basic feedback - enhanced for better UX
      light: [8],
      medium: [20],
      heavy: [40],
      
      // Status feedback - more distinctive patterns
      success: [8, 40, 8],
      error: [80, 40, 80],
      warning: [40, 20, 40],
      
      // Interaction feedback - refined for touch
      selection: [12],
      impact: [25],
      
      // Notification patterns - subtle but noticeable
      notification: [15, 80, 15],
      
      // Complex patterns - optimized for mobile
      doubleTap: [8, 40, 8],
      longPress: [40],
      swipe: [12],
      delete: [80, 20, 80],
      confirm: [20, 80, 20],
    };

    const selectedPattern = vibrationPatterns[pattern as keyof typeof vibrationPatterns] || vibrationPatterns.light;
    const adaptedPattern = this.adaptPattern(selectedPattern);

    try {
      navigator.vibrate(adaptedPattern);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  // Context-aware haptic methods
  public onTap(): void {
    this.trigger('light');
  }

  public onPress(): void {
    this.trigger('medium');
  }

  public onSuccess(): void {
    this.trigger('success');
  }

  public onError(): void {
    this.trigger('error');
  }

  public onWarning(): void {
    this.trigger('warning');
  }

  public onSelection(): void {
    this.trigger('selection');
  }

  public onSwipe(): void {
    this.trigger('swipe');
  }

  public onDelete(): void {
    this.trigger('delete');
  }

  public onConfirm(): void {
    this.trigger('confirm');
  }

  public onNotification(): void {
    this.trigger('notification');
  }

  // Complex interaction patterns
  public onPullToRefresh(): void {
    this.trigger('medium');
  }

  public onLongPress(): void {
    this.trigger('longPress');
  }

  public onDoubleTap(): void {
    this.trigger('doubleTap');
  }
}

// Export singleton instance
export const hapticFeedback = HapticFeedbackManager.getInstance();

// React hook for easy integration
export const useHapticFeedback = () => {
  const trigger = (pattern: HapticPattern) => {
    hapticFeedback.trigger(pattern);
  };

  return {
    trigger,
    onTap: () => hapticFeedback.onTap(),
    onPress: () => hapticFeedback.onPress(),
    onSuccess: () => hapticFeedback.onSuccess(),
    onError: () => hapticFeedback.onError(),
    onWarning: () => hapticFeedback.onWarning(),
    onSelection: () => hapticFeedback.onSelection(),
    onSwipe: () => hapticFeedback.onSwipe(),
    onDelete: () => hapticFeedback.onDelete(),
    onConfirm: () => hapticFeedback.onConfirm(),
    onNotification: () => hapticFeedback.onNotification(),
    onPullToRefresh: () => hapticFeedback.onPullToRefresh(),
    onLongPress: () => hapticFeedback.onLongPress(),
    onDoubleTap: () => hapticFeedback.onDoubleTap(),
    setEnabled: hapticFeedback.setEnabled.bind(hapticFeedback),
    setIntensity: hapticFeedback.setIntensity.bind(hapticFeedback),
    getSupported: hapticFeedback.getSupported.bind(hapticFeedback),
    getEnabled: hapticFeedback.getEnabled.bind(hapticFeedback),
  };
};

export default hapticFeedback;