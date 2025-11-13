// Global WebP detection utility
// This utility ensures WebP support detection runs only once per application lifecycle

let webpSupport: boolean | null = null;
let detectionPromise: Promise<boolean> | null = null;

/**
 * Detects WebP support using canvas test
 * @returns Promise that resolves to boolean indicating WebP support
 */
const detectWebPSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // If already detected, return cached result
    if (webpSupport !== null) {
      resolve(webpSupport);
      return;
    }

    // If detection is in progress, return existing promise
    if (detectionPromise !== null) {
      detectionPromise.then(resolve);
      return;
    }

    // Start new detection
    detectionPromise = new Promise((resolveDetection) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;

      // Check if canvas supports WebP
      try {
        const dataURL = canvas.toDataURL('image/webp');
        const supportsWebP = dataURL.startsWith('data:image/webp');
        webpSupport = supportsWebP;
        resolveDetection(supportsWebP);
      } catch (error) {
        // If there's an error in toDataURL, assume no WebP support
        webpSupport = false;
        resolveDetection(false);
      }
    });

    detectionPromise.then(resolve);
  });
};

/**
 * Initializes WebP detection on application startup
 * Should be called once when the app starts
 */
export const initializeWebPDetection = (): Promise<boolean> => {
  return detectWebPSupport();
};

/**
 * Gets the current WebP support status
 * Returns null if detection hasn't been initialized yet
 */
export const getWebPSupport = (): boolean | null => {
  return webpSupport;
};

/**
 * Converts image URL to WebP format if supported
 * @param originalSrc - Original image URL
 * @param fallbackOnError - Whether to fallback to original format if WebP fails (default: true)
 * @returns Optimized image URL
 */
export const getOptimalImageSrc = (originalSrc: string, fallbackOnError: boolean = true): string => {
  const supportsWebP = getWebPSupport();

  // If detection not initialized or WebP not supported, return original
  if (supportsWebP === null || !supportsWebP || fallbackOnError === false) {
    return originalSrc;
  }

  // Convert local PNG icons to WebP format
  if (originalSrc.startsWith('/icons/') && originalSrc.endsWith('.png')) {
    return originalSrc.replace(/\.png$/i, '.png.webp');
  }

  // Convert local PNG icons to WebP format
  if (originalSrc.startsWith('/icons/') && originalSrc.endsWith('.png')) {
    return originalSrc.replace(/\.png$/i, '.png.webp');
  }

  // Convert local PNG icons to WebP format
  if (originalSrc.startsWith('/icons/') && originalSrc.endsWith('.png')) {
    return originalSrc.replace(/\.png$/i, '.png.webp');
  }

  // Convert Unsplash images to WebP format
  if (originalSrc.includes('unsplash.com')) {
    return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  return originalSrc;
};

/**
 * Synchronous version that returns original src if detection not complete
 * Useful for cases where you need immediate result but can accept fallback
 */
export const getOptimalImageSrcSync = (originalSrc: string): string => {
  const supportsWebP = getWebPSupport();

  // If not detected yet or doesn't support WebP, return original
  if (supportsWebP !== true) {
    return originalSrc;
  }

  // Convert local PNG icons to WebP format
  if (originalSrc.startsWith('/icons/') && originalSrc.endsWith('.png')) {
    return originalSrc.replace(/\.png$/i, '.png.webp');
  }

  // Convert Unsplash images to WebP format
  if (originalSrc.includes('unsplash.com')) {
    return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  return originalSrc;
};

export default {
  initializeWebPDetection,
  getWebPSupport,
  getOptimalImageSrc,
  getOptimalImageSrcSync
};