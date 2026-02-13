/**
 * Test Configuration - Flexy: Never hardcode test timeouts!
 * Centralized test configuration to ensure consistency across all test files
 */

import { RETRY_CONFIG } from '../constants';

export const TEST_TIMEOUTS = {
    /** Very short timeout for simple operations */
    SHORT: 100,
    /** Short timeout for quick operations */
    QUICK: 500,
    /** Default timeout for most tests */
    DEFAULT: 2000,
    /** Medium timeout for async operations */
    MEDIUM: 3000,
    /** Long timeout for complex operations */
    LONG: 5000,
    /** Extended timeout for heavy operations */
    EXTENDED: 10000,
} as const;

export const TEST_DELAYS = {
    /** Minimal delay for immediate assertions */
    IMMEDIATE: 0,
    /** Short delay for micro-tasks */
    MICROTASK: 10,
    /** Short delay for quick checks */
    SHORT: 50,
    /** Medium delay for async operations */
    MEDIUM: 100,
    /** Long delay for heavy operations */
    LONG: 500,
} as const;

export const TEST_RETRY_CONFIG = {
    /** Number of retry attempts for flaky tests - Flexy: Using centralized constant! */
    MAX_RETRIES: RETRY_CONFIG.MAX_ATTEMPTS,
    /** Delay between retries in ms */
    RETRY_DELAY: 1000,
} as const;

export const MOCK_DATA_CONFIG = {
    /** Default mock file size in bytes (1KB) */
    DEFAULT_FILE_SIZE: 1024,
    /** Default mock pagination total items */
    DEFAULT_TOTAL_ITEMS: 50,
    /** Default skeleton items count */
    DEFAULT_SKELETON_ITEMS: 6,
    /** Alternative skeleton items count */
    ALTERNATIVE_SKELETON_ITEMS: 4,
} as const;
