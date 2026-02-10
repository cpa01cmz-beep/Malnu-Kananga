/**
 * ID Generator Utility
 * 
 * Flexy says: Never hardcode ID generation patterns!
 * Centralized ID generation for consistency across the application.
 */

import { CONVERSION } from '../constants';

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
        TEMPLATE: 'template',
        BATCH: 'batch',
        DEFERRED: 'deferred',
        DIGEST: 'digest',
        AUDIT: 'audit',
        ANALYSIS: 'analysis',
        FEEDBACK: 'feedback',
        SELECT: 'select',
        SEARCH: 'search',
        TABLE: 'table',
        TABLE_DESC: 'table-desc',
        TOGGLE: 'toggle',
        FILEINPUT: 'fileinput',
        TEMP: 'temp',
        ACCORDION_BUTTON: 'accordion-button',
        ACCORDION_CONTENT: 'accordion-content',
        MISSING_GRADES: 'missing-grades',
    } as const,

    // ID format patterns
    PATTERNS: {
        DEFAULT: 'default',
        WITH_TIMESTAMP: 'withTimestamp',
        SIMPLE: 'simple',
        HYPHENATED: 'hyphenated',
    } as const,

    // Radix for toString conversion
    RADIX: {
        BASE36: 36,
    } as const,

    // Substring indices
    SUBSTRING: {
        START_INDEX: 2,
    } as const,
} as const;

/**
 * Generate a random suffix using base36 encoding
 * Flexy says: Use this instead of hardcoded `Math.random().toString(36).substr(2, 9)`
 */
export function generateRandomSuffix(length: number = ID_CONFIG.DEFAULT_RANDOM_LENGTH): string {
    return Math.random()
        .toString(ID_CONFIG.RADIX.BASE36)
        .substring(ID_CONFIG.SUBSTRING.START_INDEX, ID_CONFIG.SUBSTRING.START_INDEX + length);
}

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
    const randomSuffix = generateRandomSuffix(randomLength);

    return `${prefix}${separator}${timestamp}${randomSuffix}`;
}

/**
 * Generate a simple random ID without timestamp
 * Useful for UI element IDs that don't need uniqueness across sessions
 */
export function generateSimpleId(prefix: string, randomLength: number = ID_CONFIG.DEFAULT_RANDOM_LENGTH): string {
    const randomSuffix = generateRandomSuffix(randomLength);
    return `${prefix}_${randomSuffix}`;
}

/**
 * Generate a session-based ID
 * Pattern: prefix_sessionTimestamp_randomString
 */
export function generateSessionId(prefix: string): string {
    const sessionTimestamp = Math.floor(Date.now() / CONVERSION.MS_PER_SECOND); // Use seconds for shorter IDs
    const randomSuffix = generateRandomSuffix(6);
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
    studyPlan: () => generateStudyPlanId(),
    quiz: () => generateId({ prefix: ID_CONFIG.PREFIXES.QUIZ }),
    message: () => generateId({ prefix: ID_CONFIG.PREFIXES.MESSAGE }),
    announcement: () => generateId({ prefix: ID_CONFIG.PREFIXES.ANNOUNCEMENT }),
    attendance: () => generateId({ prefix: ID_CONFIG.PREFIXES.ATTENDANCE }),
    material: () => generateMaterialEntityId(),
    user: () => generateId({ prefix: ID_CONFIG.PREFIXES.USER }),
    assignment: () => generateId({ prefix: ID_CONFIG.PREFIXES.ASSIGNMENT }),
    submission: () => generateId({ prefix: ID_CONFIG.PREFIXES.SUBMISSION }),
    template: () => generateTemplateId(),
    batch: () => generateBatchNotificationId(),
    deferred: () => generateDeferredId(),
    digest: (frequency: string) => generateDigestId(frequency),
    audit: () => generateId({ prefix: ID_CONFIG.PREFIXES.AUDIT }),
    analysis: (type: string) => generateAnalysisId(type),
    feedback: () => generateFeedbackId(),
    temp: () => generateTempId(),
    select: () => generateComponentId(ID_CONFIG.PREFIXES.SELECT),
    search: () => generateComponentId(ID_CONFIG.PREFIXES.SEARCH),
    table: () => generateComponentId(ID_CONFIG.PREFIXES.TABLE),
    tableDesc: () => generateComponentId(ID_CONFIG.PREFIXES.TABLE_DESC),
    toggle: () => generateComponentId(ID_CONFIG.PREFIXES.TOGGLE),
    fileInput: () => generateComponentId(ID_CONFIG.PREFIXES.FILEINPUT),
    accordionButton: () => generateAccordionButtonId(),
    accordionContent: () => generateAccordionContentId(),
    missingGrades: () => generateMissingGradesId(),
} as const;

// Backward compatibility alias
export const generateUniqueId = generateId;
export const generateUIId = generateSimpleId;

/**
 * Generate a hyphenated ID pattern (used in notifications, templates, etc.)
 * Pattern: prefix-timestamp-randomString
 * Flexy says: Use this instead of hardcoded `prefix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
 */
export function generateHyphenatedId(prefix: string, randomLength: number = ID_CONFIG.DEFAULT_RANDOM_LENGTH): string {
    return `${prefix}-${Date.now()}-${generateRandomSuffix(randomLength)}`;
}

/**
 * Generate a validation event ID
 * Pattern: prefix-validation-timestamp-randomString
 */
export function generateValidationId(type: string, documentId: string): string {
    return generateHyphenatedId(`${ID_CONFIG.PREFIXES.VALIDATION}-${type}-${documentId}`);
}

/**
 * Generate a study plan ID
 * Pattern: study_plan_timestamp_randomString
 */
export function generateStudyPlanId(): string {
    return generateId({ prefix: ID_CONFIG.PREFIXES.STUDY_PLAN, separator: '_' });
}

/**
 * Generate an analysis ID
 * Pattern: analysis_type_timestamp_randomString
 */
export function generateAnalysisId(type: string): string {
    return generateId({ prefix: `${ID_CONFIG.PREFIXES.ANALYSIS}_${type}`, separator: '_' });
}

/**
 * Generate a feedback ID
 * Pattern: feedback_timestamp_randomString
 */
export function generateFeedbackId(): string {
    return generateId({ prefix: ID_CONFIG.PREFIXES.FEEDBACK, separator: '_' });
}

/**
 * Generate a UI component ID
 * Flexy says: Use this for React component IDs instead of hardcoded patterns
 */
export function generateComponentId(componentType: string, randomLength: number = ID_CONFIG.DEFAULT_RANDOM_LENGTH): string {
    const prefix = ID_CONFIG.PREFIXES[componentType.toUpperCase() as keyof typeof ID_CONFIG.PREFIXES] || componentType;
    return `${prefix}-${generateRandomSuffix(randomLength)}`;
}

/**
 * Generate a temporary ID
 * Pattern: temp_timestamp_randomString
 */
export function generateTempId(): string {
    return generateId({ prefix: ID_CONFIG.PREFIXES.TEMP, separator: '_' });
}

/**
 * Generate a template ID
 * Pattern: template-timestamp-randomString
 */
export function generateTemplateId(): string {
    return generateHyphenatedId(ID_CONFIG.PREFIXES.TEMPLATE);
}

/**
 * Generate a batch notification ID
 * Pattern: batch-timestamp-randomString
 */
export function generateBatchNotificationId(): string {
    return generateHyphenatedId(ID_CONFIG.PREFIXES.BATCH);
}

/**
 * Generate a deferred notification ID
 * Pattern: deferred-timestamp-randomString
 */
export function generateDeferredId(): string {
    return generateHyphenatedId(ID_CONFIG.PREFIXES.DEFERRED);
}

/**
 * Generate a digest ID
 * Pattern: digest-frequency-timestamp-randomString
 */
export function generateDigestId(frequency: string): string {
    return `${ID_CONFIG.PREFIXES.DIGEST}-${frequency}-${Date.now()}-${generateRandomSuffix()}`;
}

/**
 * Generate a material entity ID
 * Pattern: material_timestamp_randomString
 */
export function generateMaterialEntityId(): string {
    return generateId({ prefix: ID_CONFIG.PREFIXES.MATERIAL, separator: '_' });
}

/**
 * Generate an accordion button ID
 * Pattern: accordion-button-randomString
 */
export function generateAccordionButtonId(): string {
    return generateComponentId(ID_CONFIG.PREFIXES.ACCORDION_BUTTON);
}

/**
 * Generate an accordion content ID
 * Pattern: accordion-content-randomString
 */
export function generateAccordionContentId(): string {
    return generateComponentId(ID_CONFIG.PREFIXES.ACCORDION_CONTENT);
}

/**
 * Generate a missing grades notification ID
 * Pattern: missing-grades-timestamp-randomString
 */
export function generateMissingGradesId(): string {
    return generateHyphenatedId(ID_CONFIG.PREFIXES.MISSING_GRADES);
}
