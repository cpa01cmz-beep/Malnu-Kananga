/**
 * Browser Detection Configuration
 * 
 * Flexy says: Never hardcode browser detection patterns!
 * Centralized browser detection for consistent feature support checking.
 */

export const BROWSER_PATTERNS = {
    CHROME: /chrome/,
    CHROME_EXCLUDE: /edg/,
    FIREFOX: /firefox/,
    SAFARI: /safari/,
    SAFARI_EXCLUDE: /chrome/,
    EDGE: /edg/,
    OPERA: /opr/,
    OPERA_EXCLUDE: /chrome/,
    IE: /msie|trident/,
    IOS: /iphone|ipad|ipod/,
    ANDROID: /android/,
    MOBILE: /mobile|android|iphone|ipad|ipod/,
} as const;

export const BROWSER_FEATURES = {
    SPEECH_RECOGNITION: ['webkitSpeechRecognition', 'SpeechRecognition'],
    SPEECH_SYNTHESIS: ['speechSynthesis'],
    NOTIFICATIONS: ['Notification'],
    SERVICE_WORKER: ['serviceWorker'],
    WEBSOCKET: ['WebSocket'],
    INDEXED_DB: ['indexedDB'],
    LOCAL_STORAGE: ['localStorage'],
    GEOLOCATION: ['geolocation'],
} as const;

export interface BrowserInfo {
    isChrome: boolean;
    isFirefox: boolean;
    isSafari: boolean;
    isEdge: boolean;
    isOpera: boolean;
    isIE: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isMobile: boolean;
    name: string;
    userAgent: string;
}

/**
 * Detect browser from user agent string
 * Flexy says: Use this instead of hardcoded detection patterns
 */
export function detectBrowser(userAgent: string = navigator.userAgent): BrowserInfo {
    const ua = userAgent.toLowerCase();
    
    const isChrome = BROWSER_PATTERNS.CHROME.test(ua) && !BROWSER_PATTERNS.CHROME_EXCLUDE.test(ua);
    const isFirefox = BROWSER_PATTERNS.FIREFOX.test(ua);
    const isSafari = BROWSER_PATTERNS.SAFARI.test(ua) && !BROWSER_PATTERNS.SAFARI_EXCLUDE.test(ua);
    const isEdge = BROWSER_PATTERNS.EDGE.test(ua);
    const isOpera = BROWSER_PATTERNS.OPERA.test(ua) && !BROWSER_PATTERNS.OPERA_EXCLUDE.test(ua);
    const isIE = BROWSER_PATTERNS.IE.test(ua);
    const isIOS = BROWSER_PATTERNS.IOS.test(ua);
    const isAndroid = BROWSER_PATTERNS.ANDROID.test(ua);
    const isMobile = BROWSER_PATTERNS.MOBILE.test(ua);
    
    let name = 'Unknown';
    if (isChrome) name = 'Chrome';
    else if (isEdge) name = 'Edge';
    else if (isFirefox) name = 'Firefox';
    else if (isSafari) name = 'Safari';
    else if (isOpera) name = 'Opera';
    else if (isIE) name = 'Internet Explorer';
    
    return {
        isChrome,
        isFirefox,
        isSafari,
        isEdge,
        isOpera,
        isIE,
        isIOS,
        isAndroid,
        isMobile,
        name,
        userAgent,
    };
}

/**
 * Check if a browser feature is supported
 * Flexy says: Use this for feature detection instead of browser sniffing
 */
export function isFeatureSupported(feature: keyof typeof BROWSER_FEATURES): boolean {
    const featureNames = BROWSER_FEATURES[feature];
    return featureNames.some(name => name in window);
}

/**
 * Check if speech recognition is supported
 */
export function isSpeechRecognitionSupported(): boolean {
    return isFeatureSupported('SPEECH_RECOGNITION');
}

/**
 * Check if speech synthesis is supported
 */
export function isSpeechSynthesisSupported(): boolean {
    return isFeatureSupported('SPEECH_SYNTHESIS') && 'speechSynthesis' in window;
}

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
    return isFeatureSupported('NOTIFICATIONS') && 'Notification' in window;
}

/**
 * Check if service workers are supported
 */
export function isServiceWorkerSupported(): boolean {
    return isFeatureSupported('SERVICE_WORKER') && 'serviceWorker' in navigator;
}

/**
 * Check if WebSocket is supported
 */
export function isWebSocketSupported(): boolean {
    return isFeatureSupported('WEBSOCKET') && 'WebSocket' in window;
}

/**
 * Get browser compatibility info for voice features
 */
export function getVoiceCompatibility(): {
    recognition: boolean;
    synthesis: boolean;
    recommended: boolean;
    browser: string;
} {
    const browser = detectBrowser();
    const recognition = isSpeechRecognitionSupported();
    const synthesis = isSpeechSynthesisSupported();
    
    // Voice features work best in Chrome, Edge, and Safari
    const recommended = browser.isChrome || browser.isEdge || browser.isSafari;
    
    return {
        recognition,
        synthesis,
        recommended,
        browser: browser.name,
    };
}

/**
 * Browser support matrix for features
 * Flexy says: Centralize browser support definitions
 */
export type SupportedBrowser = 'Chrome' | 'Edge' | 'Firefox' | 'Safari' | 'Opera';

export const BROWSER_SUPPORT_MATRIX: Record<string, readonly SupportedBrowser[]> = {
    VOICE_FEATURES: ['Chrome', 'Edge', 'Safari'] as const,
    NOTIFICATIONS: ['Chrome', 'Firefox', 'Edge', 'Safari'] as const,
    SERVICE_WORKER: ['Chrome', 'Firefox', 'Edge', 'Safari', 'Opera'] as const,
    WEBSOCKET: ['Chrome', 'Firefox', 'Edge', 'Safari', 'Opera'] as const,
} as const;

/**
 * Check if current browser supports a specific feature set
 */
export function checkBrowserSupport(featureSet: keyof typeof BROWSER_SUPPORT_MATRIX): boolean {
    const browser = detectBrowser();
    const supportedBrowsers = BROWSER_SUPPORT_MATRIX[featureSet];
    return supportedBrowsers.some(b => browser.name === b);
}
