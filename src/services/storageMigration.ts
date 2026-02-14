// storageMigration.ts - Handles migration from old localStorage keys to new STORAGE_KEYS
import { STORAGE_KEYS, STORAGE_MIGRATION, LEGACY_STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

interface MigrationMap {
  oldKey: string;
  newKey: string | ((...args: string[]) => string);
  isDynamic?: boolean;
  dynamicArg?: string;
}

const MIGRATIONS: MigrationMap[] = [
  // Authentication tokens - Flexy: Using LEGACY_STORAGE_KEYS instead of hardcoded strings
  { oldKey: LEGACY_STORAGE_KEYS.AUTH_TOKEN, newKey: STORAGE_KEYS.AUTH_TOKEN },
  { oldKey: LEGACY_STORAGE_KEYS.REFRESH_TOKEN, newKey: STORAGE_KEYS.REFRESH_TOKEN },

  // User data - Flexy: Using LEGACY_STORAGE_KEYS instead of hardcoded strings
  { oldKey: LEGACY_STORAGE_KEYS.USER, newKey: STORAGE_KEYS.USER },

  // E-Library student data - Flexy: Using LEGACY_STORAGE_KEYS instead of hardcoded strings
  { oldKey: LEGACY_STORAGE_KEYS.STUDENT_BOOKMARKS, newKey: STORAGE_KEYS.STUDENT_BOOKMARKS },
  { oldKey: LEGACY_STORAGE_KEYS.STUDENT_FAVORITES, newKey: STORAGE_KEYS.STUDENT_FAVORITES },
  { oldKey: LEGACY_STORAGE_KEYS.STUDENT_READING_PROGRESS, newKey: STORAGE_KEYS.STUDENT_READING_PROGRESS },
  { oldKey: LEGACY_STORAGE_KEYS.STUDENT_OFFLINE_DOWNLOADS, newKey: STORAGE_KEYS.STUDENT_OFFLINE_DOWNLOADS },
  { oldKey: LEGACY_STORAGE_KEYS.STUDENT_REVIEWS, newKey: STORAGE_KEYS.STUDENT_REVIEWS },

  // Site editor - Flexy: Using LEGACY_STORAGE_KEYS instead of hardcoded strings
  { oldKey: LEGACY_STORAGE_KEYS.SITE_EDITOR_HISTORY, newKey: STORAGE_KEYS.SITE_EDITOR_HISTORY },

  // Push notifications - Flexy: Using LEGACY_STORAGE_KEYS instead of hardcoded strings
  { oldKey: LEGACY_STORAGE_KEYS.NOTIFICATION_BATCHES, newKey: STORAGE_KEYS.NOTIFICATION_BATCHES },
  { oldKey: LEGACY_STORAGE_KEYS.NOTIFICATION_TEMPLATES, newKey: STORAGE_KEYS.NOTIFICATION_TEMPLATES },
  { oldKey: LEGACY_STORAGE_KEYS.NOTIFICATION_ANALYTICS, newKey: STORAGE_KEYS.NOTIFICATION_ANALYTICS },
  
    // Category service
    { oldKey: LEGACY_STORAGE_KEYS.SUBJECTS_CACHE, newKey: STORAGE_KEYS.SUBJECTS_CACHE },
    { oldKey: LEGACY_STORAGE_KEYS.CLASSES_CACHE, newKey: STORAGE_KEYS.CLASSES_CACHE },
    { oldKey: LEGACY_STORAGE_KEYS.CATEGORY_SUGGESTIONS, newKey: STORAGE_KEYS.CATEGORY_SUGGESTIONS },
    { oldKey: LEGACY_STORAGE_KEYS.MATERIAL_STATS, newKey: STORAGE_KEYS.MATERIAL_STATS },
];

// Flexy: Using centralized constants instead of hardcoded values
const MIGRATION_VERSION_KEY = STORAGE_MIGRATION.VERSION_KEY;
const CURRENT_MIGRATION_VERSION = STORAGE_MIGRATION.CURRENT_VERSION;

/**
 * Runs migration from old localStorage keys to new STORAGE_KEYS constants
 */
export function runStorageMigration(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const currentVersion = localStorage.getItem(MIGRATION_VERSION_KEY);
    
    // Skip migration if already up to date
    if (currentVersion === CURRENT_MIGRATION_VERSION) {
      logger.debug('Storage migration: Already up to date');
      return;
    }
    
    let migratedCount = 0;
    
    MIGRATIONS.forEach(({ oldKey, newKey, isDynamic, dynamicArg }) => {
      const oldValue = localStorage.getItem(oldKey);
      
      if (oldValue !== null) {
        try {
          // Handle dynamic keys (e.g., student goals)
          if (isDynamic && typeof newKey === 'function' && dynamicArg) {
            const resolvedKey = newKey(dynamicArg);
            localStorage.setItem(resolvedKey, oldValue);
            logger.info(`Migrated dynamic key ${oldKey} -> ${resolvedKey}`);
          } else if (typeof newKey === 'string') {
            localStorage.setItem(newKey, oldValue);
            logger.info(`Migrated ${oldKey} -> ${newKey}`);
          }
          
          migratedCount++;
          
          // Optionally remove old key after successful migration
          localStorage.removeItem(oldKey);
          
        } catch (error) {
          logger.error(`Failed to migrate ${oldKey}:`, error);
        }
      }
    });
    
    // Mark migration as complete
    localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION);
    
    if (migratedCount > 0) {
      logger.info(`Storage migration completed: ${migratedCount} keys migrated`);
    }
    
  } catch (error) {
    logger.error('Storage migration failed:', error);
  }
}

/**
 * Migrates dynamic keys like student goals that depend on user data
 */
export function migrateStudentGoals(studentNIS: string): void {
  if (typeof window === 'undefined' || !studentNIS) return;
  
  const oldKey = `${LEGACY_STORAGE_KEYS.STUDENT_GOALS_PREFIX}${studentNIS}`;
  const OldKeyAlt = `${LEGACY_STORAGE_KEYS.STUDENT_GOALS_ALT_PREFIX}${studentNIS}`;
  const newKey = STORAGE_KEYS.STUDENT_GOALS(studentNIS);
  
  [oldKey, OldKeyAlt].forEach(oldKey => {
    const oldValue = localStorage.getItem(oldKey);
    
    if (oldValue !== null) {
      try {
        localStorage.setItem(newKey, oldValue);
        localStorage.removeItem(oldKey);
        logger.debug(`Migrated student goals for ${studentNIS}`);
      } catch (error) {
        logger.error(`Failed to migrate student goals for ${studentNIS}:`, error);
      }
    }
  });
}

/**
 * Checks if there are any remaining old keys that need migration
 */
export function checkForOldKeys(): string[] {
  if (typeof window === 'undefined') return [];
  
  const oldKeys: string[] = [];
  
  MIGRATIONS.forEach(({ oldKey }) => {
    if (localStorage.getItem(oldKey) !== null) {
      oldKeys.push(oldKey);
    }
  });
  
  // Check for dynamic goal keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(LEGACY_STORAGE_KEYS.STUDENT_GOALS_PREFIX) || key.startsWith(LEGACY_STORAGE_KEYS.STUDENT_GOALS_ALT_PREFIX)) &&
        !key.includes(STORAGE_KEYS.STUDENT_GOALS(''))) {
      oldKeys.push(key);
    }
  }
  
  return oldKeys;
}

/**
 * Force re-run migration (useful for testing)
 */
export function forceMigration(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MIGRATION_VERSION_KEY);
  runStorageMigration();
}