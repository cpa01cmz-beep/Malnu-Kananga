export interface MobilePerformanceConfig {
  enableLowPowerMode: boolean;
  enableReducedMotion: boolean;
  maxConcurrentNetworkRequests: number;
  imageQuality: number;
  animationQuality: 'high' | 'medium' | 'low';
  lazyLoadDistance: number;
  prefetchDistance: number;
}

export interface NetworkQuality {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

const DEFAULT_MOBILE_PERFORMANCE_CONFIG: MobilePerformanceConfig = {
  enableLowPowerMode: false,
  enableReducedMotion: false,
  maxConcurrentNetworkRequests: 6,
  imageQuality: 0.85,
  animationQuality: 'high',
  lazyLoadDistance: 200,
  prefetchDistance: 300,
};

const MOBILE_PERFORMANCE_CONFIG: MobilePerformanceConfig = {
  enableLowPowerMode: false,
  enableReducedMotion: false,
  maxConcurrentNetworkRequests: 4,
  imageQuality: 0.75,
  animationQuality: 'medium',
  lazyLoadDistance: 300,
  prefetchDistance: 400,
};

let currentConfig = { ...DEFAULT_MOBILE_PERFORMANCE_CONFIG };

export function getMobilePerformanceConfig(): Readonly<MobilePerformanceConfig> {
  return { ...currentConfig };
}

export function setMobilePerformanceConfig(config: Partial<MobilePerformanceConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...config,
  };
}

export function detectMobilePerformanceMode(): {
  isLowPowerMode: boolean;
  prefersReducedMotion: boolean;
  isSlowNetwork: boolean;
  isLowEndDevice: boolean;
} {
  const isLowPowerMode = checkLowPowerMode();
  const prefersReducedMotion = checkReducedMotion();
  const networkQuality = getNetworkQuality();
  const isSlowNetwork = networkQuality.effectiveType === '2g' || networkQuality.effectiveType === 'slow-2g';
  const isLowEndDevice = checkLowEndDevice();

  return {
    isLowPowerMode,
    prefersReducedMotion,
    isSlowNetwork,
    isLowEndDevice,
  };
}

export function optimizeForMobile(): void {
  const performanceMode = detectMobilePerformanceMode();

  const mobileConfig: Partial<MobilePerformanceConfig> = {
    enableLowPowerMode: performanceMode.isLowPowerMode,
    enableReducedMotion: performanceMode.prefersReducedMotion,
  };

  if (performanceMode.isLowEndDevice || performanceMode.isSlowNetwork) {
    mobileConfig.imageQuality = 0.6;
    mobileConfig.animationQuality = 'low';
    mobileConfig.maxConcurrentNetworkRequests = 2;
  }

  setMobilePerformanceConfig(mobileConfig);
}

export function checkLowPowerMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if ('getBattery' in navigator) {
    const navigatorWithBattery = navigator as Navigator & {
      getBattery: () => Promise<unknown>;
    };

    navigatorWithBattery
      .getBattery()
      .then((battery: unknown) => {
        const batteryObj = battery as { level?: number; charging?: boolean };
        return batteryObj.level !== undefined && batteryObj.level < 0.2 || batteryObj.charging === false;
      })
      .catch(() => {
        return false;
      });

    return false;
  }

  return false;
}

export function checkReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').media === '(prefers-reduced-motion: reduce)'
  );
}

export function getNetworkQuality(): NetworkQuality {
  if (typeof window === 'undefined') {
    return {
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false,
    };
  }

  const connection = (navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  }).connection;

  if (!connection) {
    return {
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false,
    };
  }

  return {
    effectiveType: (connection.effectiveType || '4g') as NetworkQuality['effectiveType'],
    downlink: connection.downlink || 10,
    rtt: connection.rtt || 100,
    saveData: connection.saveData || false,
  };
}

export function checkLowEndDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency || 4;
  const pixelRatio = window.devicePixelRatio || 1;

  const lowMemory = memory !== undefined && memory < 4;
  const lowCores = cores < 4;
  const highPixelRatio = pixelRatio > 2;

  return lowMemory || lowCores || highPixelRatio;
}

export function getOptimalImageQuality(): number {
  const config = getMobilePerformanceConfig();
  const networkQuality = getNetworkQuality();

  if (networkQuality.saveData) {
    return 0.5;
  }

  if (config.animationQuality === 'low') {
    return 0.6;
  }

  if (config.animationQuality === 'medium') {
    return 0.75;
  }

  return config.imageQuality;
}

export function shouldAnimate(): boolean {
  const config = getMobilePerformanceConfig();

  if (config.enableReducedMotion) {
    return false;
  }

  return config.animationQuality !== 'low';
}

export function getAnimationDuration(baseDuration: number): number {
  const config = getMobilePerformanceConfig();

  if (config.enableReducedMotion) {
    return 0;
  }

  const qualityMultiplier = {
    high: 1.0,
    medium: 0.75,
    low: 0.5,
  };

  return baseDuration * qualityMultiplier[config.animationQuality];
}

export function getDebounceDelay(baseDelay: number): number {
  const config = getMobilePerformanceConfig();

  if (config.enableLowPowerMode) {
    return baseDelay * 1.5;
  }

  return baseDelay;
}

export function getThrottleDelay(baseDelay: number): number {
  const config = getMobilePerformanceConfig();

  if (config.enableLowPowerMode) {
    return baseDelay * 1.5;
  }

  return baseDelay;
}

export function shouldLazyLoad(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const config = getMobilePerformanceConfig();
  const windowHeight = window.innerHeight;
  const lazyLoadDistance = config.lazyLoadDistance;

  return rect.top < windowHeight + lazyLoadDistance;
}

export function shouldPrefetch(_link: string): boolean {
  const networkQuality = getNetworkQuality();

  if (networkQuality.saveData) {
    return false;
  }

  if (networkQuality.effectiveType === '2g' || networkQuality.effectiveType === 'slow-2g') {
    return false;
  }

  return true;
}

export function getMaxConcurrentRequests(): number {
  const config = getMobilePerformanceConfig();
  const networkQuality = getNetworkQuality();

  if (networkQuality.saveData) {
    return 2;
  }

  if (networkQuality.effectiveType === '2g' || networkQuality.effectiveType === 'slow-2g') {
    return 2;
  }

  if (networkQuality.effectiveType === '3g') {
    return 4;
  }

  return config.maxConcurrentNetworkRequests;
}

export function optimizeImagesInViewport(): void {
  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    if (!shouldLazyLoad(img as HTMLElement)) {
      return;
    }

    img.setAttribute('loading', 'lazy');

    const quality = getOptimalImageQuality();
    const src = img.getAttribute('src');

    if (src && src.includes('unsplash.com')) {
      const optimizedSrc = src.replace(/q=\d+/, `q=${Math.round(quality * 100)}`);
      img.setAttribute('src', optimizedSrc);
    }
  });
}

export function optimizeAnimations(): void {
  const animatedElements = document.querySelectorAll('[data-animate]');

  animatedElements.forEach((element) => {
    if (!shouldAnimate()) {
      element.classList.add('no-animations');
    }
  });
}

export function optimizeFonts(): void {
  if ('fonts' in document) {
    document.fonts.load('1em system-ui');
  }

  const fonts = document.querySelectorAll('link[rel="preload"][as="font"]');

  if (getNetworkQuality().saveData) {
    fonts.forEach((font) => {
      font.setAttribute('media', 'print');
      font.setAttribute('onload', 'this.media="all"');
    });
  }
}

export function optimizeStylesheets(): void {
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

  stylesheets.forEach((stylesheet) => {
    if (getNetworkQuality().saveData) {
      const href = stylesheet.getAttribute('href');
      if (href && !href.includes('critical')) {
        stylesheet.setAttribute('media', 'print');
        stylesheet.setAttribute('onload', 'this.media="all"');
      }
    }
  });
}

export function initMobilePerformanceOptimization(): void {
  optimizeForMobile();
  optimizeImagesInViewport();
  optimizeAnimations();
  optimizeFonts();
  optimizeStylesheets();

  window.addEventListener('resize', debounce(() => {
    optimizeImagesInViewport();
  }, 200));

  if ('connection' in navigator) {
    const connection = (navigator as Navigator & {
      connection?: {
        addEventListener: (event: string, handler: () => void) => void;
      };
    }).connection;

    if (connection?.addEventListener) {
      connection.addEventListener('change', () => {
        optimizeForMobile();
        optimizeImagesInViewport();
      });
    }
  }
}

export function getMobilePerformanceMetrics(): {
  config: MobilePerformanceConfig;
  performanceMode: {
    isLowPowerMode: boolean;
    prefersReducedMotion: boolean;
    isSlowNetwork: boolean;
    isLowEndDevice: boolean;
  };
  networkQuality: NetworkQuality;
} {
  return {
    config: getMobilePerformanceConfig(),
    performanceMode: detectMobilePerformanceMode(),
    networkQuality: getNetworkQuality(),
  };
}

export { DEFAULT_MOBILE_PERFORMANCE_CONFIG, MOBILE_PERFORMANCE_CONFIG };

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay?: number
): (...args: Parameters<T>) => void {
  const actualDelay = delay ?? getDebounceDelay(150);
  let timeout: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(later, actualDelay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit?: number
): (...args: Parameters<T>) => void {
  const actualLimit = limit ?? getThrottleDelay(100);
  let inThrottle = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      window.setTimeout(() => (inThrottle = false), actualLimit);
    }
  };
}
