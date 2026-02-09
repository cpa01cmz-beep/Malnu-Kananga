/**
 * ID Generator Utility
 * 
 * Flexy says: Never hardcode ID generation patterns!
 * Centralized ID generation for consistency across the application.
 */

export interface IdGeneratorOptions {
    prefix: string;
    randomLength?: number;
    separator?: string;
    includeTimestamp?: boolean;
}

export const ID_CONFIG = {
    DEFAULT_RANDOM_LENGTH: 9,
    DEFAULT_SEPARATOR: '_',
    DEFAULT_INCLUDE_TIMESTAMP: true,
    
    // Common prefixes used across the application
    PREFIXES: {
        NOTIFICATION: 'notif',
        OCR: 'ocr',
        QUEUE: 'queue',
        PPDB: 'ppdb',
        GRADE: 'grade',
        VALIDATION: 'validation',
        INPUT: 'input',
        TEXTAREA: 'textarea',
        SESSION: 'session',
        EVENT: 'event',
        METRIC: 'metric',
        CACHE: 'cache',
        WEBSOCKET: 'ws',
        OFFLINE: 'offline',
        TIMELINE: 'timeline',
        STUDY_PLAN: 'study',
        QUIZ: 'quiz',
        MESSAGE: 'msg',
        ANNOUNCEMENT: 'announce',
        ATTENDANCE: 'attendance',
        MATERIAL: 'material',
        USER: 'user',
        ASSIGNMENT: 'assignment',
        SUBMISSION: 'submission',
    } as const,
} as const;

/**
 * Generate a unique ID with timestamp and random suffix
 * Pattern: prefix_timestamp_randomString
 * 
 * Flexy says: Use this instead of hardcoded patterns like:
 * `prefix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
 */
export function generateId(options: IdGeneratorOptions): string {
    const {
        prefix,
        randomLength = ID_CONFIG.DEFAULT_RANDOM_LENGTH,
        separator = ID_CONFIG.DEFAULT_SEPARATOR,
        includeTimestamp = ID_CONFIG.DEFAULT_INCLUDE_TIMESTAMP,
    } = options;

    const timestamp = includeTimestamp ? `${Date.now()}${separator}` : '';
    const randomSuffix = Math.random().toString(36).substring(2, 2 + randomLength);
    
    return `${prefix}${separator}${timestamp}${randomSuffix}`;
}

/**
 * Generate a simple random ID without timestamp
 * Useful for UI element IDs that don't need uniqueness across sessions
 */
export function generateSimpleId(prefix: string, randomLength: number = ID_CONFIG.DEFAULT_RANDOM_LENGTH): string {
    const randomSuffix = Math.random().toString(36).substring(2, 2 + randomLength);
    return `${prefix}_${randomSuffix}`;
}

/**
 * Generate a session-based ID
 * Pattern: prefix_sessionTimestamp_randomString
 */
export function generateSessionId(prefix: string): string {
    const sessionTimestamp = Math.floor(Date.now() / 1000); // Use seconds for shorter IDs
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${prefix}_${sessionTimestamp}_${randomSuffix}`;
}

/**
 * Generate a short ID for batch operations
 * Pattern: prefix_counter
 */
export function generateBatchId(prefix: string, counter: number): string {
    return `${prefix}_${counter}_${Date.now()}`;
}

// Preset generators for common use cases
export const idGenerators = {
    notification: () => generateId({ prefix: ID_CONFIG.PREFIXES.NOTIFICATION }),
    ocr: () => generateId({ prefix: ID_CONFIG.PREFIXES.OCR }),
    queue: () => generateId({ prefix: ID_CONFIG.PREFIXES.QUEUE }),
    ppdb: () => generateId({ prefix: ID_CONFIG.PREFIXES.PPDB }),
    grade: () => generateId({ prefix: ID_CONFIG.PREFIXES.GRADE }),
    validation: () => generateId({ prefix: ID_CONFIG.PREFIXES.VALIDATION }),
    input: () => generateSimpleId(ID_CONFIG.PREFIXES.INPUT),
    textarea: () => generateSimpleId(ID_CONFIG.PREFIXES.TEXTAREA),
    session: () => generateId({ prefix: ID_CONFIG.PREFIXES.SESSION }),
    event: () => generateId({ prefix: ID_CONFIG.PREFIXES.EVENT }),
    metric: () => generateId({ prefix: ID_CONFIG.PREFIXES.METRIC }),
    cache: () => generateId({ prefix: ID_CONFIG.PREFIXES.CACHE }),
    websocket: () => generateId({ prefix: ID_CONFIG.PREFIXES.WEBSOCKET }),
    offline: () => generateId({ prefix: ID_CONFIG.PREFIXES.OFFLINE }),
    timeline: () => generateId({ prefix: ID_CONFIG.PREFIXES.TIMELINE }),
    studyPlan: () => generateId({ prefix: ID_CONFIG.PREFIXES.STUDY_PLAN }),
    quiz: () => generateId({ prefix: ID_CONFIG.PREFIXES.QUIZ }),
    message: () => generateId({ prefix: ID_CONFIG.PREFIXES.MESSAGE }),
    announcement: () => generateId({ prefix: ID_CONFIG.PREFIXES.ANNOUNCEMENT }),
    attendance: () => generateId({ prefix: ID_CONFIG.PREFIXES.ATTENDANCE }),
    material: () => generateId({ prefix: ID_CONFIG.PREFIXES.MATERIAL }),
    user: () => generateId({ prefix: ID_CONFIG.PREFIXES.USER }),
    assignment: () => generateId({ prefix: ID_CONFIG.PREFIXES.ASSIGNMENT }),
    submission: () => generateId({ prefix: ID_CONFIG.PREFIXES.SUBMISSION }),
} as const;

// Backward compatibility alias
export const generateUniqueId = generateId;
export const generateUIId = generateSimpleId;
