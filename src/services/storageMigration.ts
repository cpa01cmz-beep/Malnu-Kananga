// storageMigration.ts - Handles migration from old localStorage keys to new STORAGE_KEYS
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

interface MigrationMap {
  oldKey: string;
  newKey: string | ((...args: string[]) => string);
  isDynamic?: boolean;
  dynamicArg?: string;
}

const MIGRATIONS: MigrationMap[] = [
  // Authentication tokens
  { oldKey: 'auth_token', newKey: STORAGE_KEYS.AUTH_TOKEN },
  { oldKey: 'refresh_token', newKey: STORAGE_KEYS.REFRESH_TOKEN },
  
  // User data
  { oldKey: 'user', newKey: STORAGE_KEYS.USER },
  
  // E-Library student data
  { oldKey: 'student_bookmarks', newKey: STORAGE_KEYS.STUDENT_BOOKMARKS },
  { oldKey: 'student_favorites', newKey: STORAGE_KEYS.STUDENT_FAVORITES },
  { oldKey: 'student_reading_progress', newKey: STORAGE_KEYS.STUDENT_READING_PROGRESS },
  { oldKey: 'student_offline_downloads', newKey: STORAGE_KEYS.STUDENT_OFFLINE_DOWNLOADS },
  { oldKey: 'student_reviews', newKey: STORAGE_KEYS.STUDENT_REVIEWS },
  
  // Site editor
  { oldKey: 'siteEditorHistory', newKey: STORAGE_KEYS.SITE_EDITOR_HISTORY },
  
  // Push notifications
  { oldKey: 'notification_batches', newKey: STORAGE_KEYS.NOTIFICATION_BATCHES },
  { oldKey: 'notification_templates', newKey: STORAGE_KEYS.NOTIFICATION_TEMPLATES },
  { oldKey: 'notification_analytics', newKey: STORAGE_KEYS.NOTIFICATION_ANALYTICS },
  
  // Category service
  { oldKey: 'malnu_subjects_cache', newKey: STORAGE_KEYS.SUBJECTS_CACHE },
  { oldKey: 'malnu_classes_cache', newKey: STORAGE_KEYS.CLASSES_CACHE },
  { oldKey: 'malnu_category_suggestions', newKey: STORAGE_KEYS.CATEGORY_SUGGESTIONS },
  { oldKey: 'malnu_material_stats', newKey: STORAGE_KEYS.MATERIAL_STATS },
];

const MIGRATION_VERSION_KEY = STORAGE_KEYS.STORAGE_MIGRATION_VERSION;
const CURRENT_MIGRATION_VERSION = '1.0.0';

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
  
  const oldKey = `goals_${studentNIS}`;
  const OldKeyAlt = `student_goals_${studentNIS}`;
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
    if (key && (key.startsWith('goals_') || key.startsWith('student_goals_')) && 
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