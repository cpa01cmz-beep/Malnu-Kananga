// offlineDataService.ts - Offline Data Management for Student/Parent Portals
// Handles caching of critical data for offline access

import { logger } from '../utils/logger';
import { STORAGE_KEYS } from '../constants';
import type { Student, Grade, Attendance, Schedule, ParentChild, Class, User, Announcement } from '../types';
import React from 'react';
import { useNetworkStatus } from '../utils/networkStatus';

// ============================================
// TYPES
// ============================================

export interface CachedStudentData {
  student: Student;
  grades: Grade[];
  attendance: Attendance[];
  schedule: Schedule[];
  lastUpdated: number;
  expiresAt: number;
}

export interface CachedParentData {
  children: ParentChild[];
  childrenData: Record<string, CachedStudentData>; // Map by studentId
  lastUpdated: number;
  expiresAt: number;
}

// Teacher offline data types (Issue #1315)
export interface CachedTeacherData {
  teacherId: string;
  classes: Class[];
  students: Student[];
  recentGrades: Grade[];
  announcements: Announcement[];
  lastUpdated: number;
  expiresAt: number;
}

// Admin offline data types (Issue #1315)
export interface CachedAdminData {
  adminId: string;
  systemStats: Record<string, unknown>;
  ppdbStats: Record<string, unknown>;
  recentUsers: User[];
  pendingPPDB: Array<{ status: 'pending' | 'approved' | 'rejected' }>;
  announcements: Announcement[];
  lastUpdated: number;
  expiresAt: number;
}

export interface SyncStatus {
  lastSync: number;
  pendingActions: number;
  isOnline: boolean;
  cacheAge: number;
  needsSync: boolean;
}

// ============================================
// CONFIGURATION
// ============================================

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutes
const CACHE_VERSION = '1.0';

// ============================================
// OFFLINE DATA SERVICE
// ============================================

class OfflineDataService {
  private syncCallbacks: Set<(status: SyncStatus) => void> = new Set();
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.setupPeriodicSync();
    this.migrateLegacyData();
  }

  // ============================================
  // STUDENT DATA OPERATIONS
  // ============================================

  /**
   * Cache student data for offline access
   */
  public cacheStudentData(studentData: Omit<CachedStudentData, 'lastUpdated' | 'expiresAt'>): void {
    try {
      const cachedData: CachedStudentData = {
        ...studentData,
        lastUpdated: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION,
      };

      // Get existing cache
      const existingCache = this.getStudentCache();
      const updatedCache = {
        ...existingCache,
        [studentData.student.id]: cachedData,
        version: CACHE_VERSION,
      };

      localStorage.setItem(STORAGE_KEYS.OFFLINE_STUDENT_DATA, JSON.stringify(updatedCache));
      
      logger.info('Student data cached for offline', { 
        studentId: studentData.student.id,
        gradesCount: studentData.grades.length,
        attendanceCount: studentData.attendance.length,
        scheduleCount: studentData.schedule.length,
      });

      this.notifySyncStatusChange();
    } catch (error) {
      logger.error('Failed to cache student data', error);
    }
  }

  /**
   * Get cached student data
   */
  public getCachedStudentData(studentId: string): CachedStudentData | null {
    try {
      const cache = this.getStudentCache();
      const studentData = cache[studentId];

      if (!studentData) {
        return null;
      }

      // Check if cache is expired
      if (Date.now() > studentData.expiresAt) {
        logger.info('Student data cache expired', { studentId });
        delete cache[studentId];
        localStorage.setItem(STORAGE_KEYS.OFFLINE_STUDENT_DATA, JSON.stringify(cache));
        return null;
      }

      return studentData;
    } catch (error) {
      logger.error('Failed to get cached student data', error);
      return null;
    }
  }

  /**
   * Check if student data is cached and fresh
   */
  public isStudentDataCached(studentId: string): boolean {
    const cached = this.getCachedStudentData(studentId);
    return cached !== null;
  }

  /**
   * Update specific student data field
   */
  public updateStudentData<T extends keyof Omit<CachedStudentData, 'student' | 'lastUpdated' | 'expiresAt'>>(
    studentId: string,
    field: T,
    data: CachedStudentData[T]
  ): void {
    try {
      const cached = this.getCachedStudentData(studentId);
      if (cached) {
        const updatedData = {
          ...cached,
          [field]: data,
          lastUpdated: Date.now(),
        };

        this.cacheStudentData({
          student: updatedData.student,
          grades: updatedData.grades,
          attendance: updatedData.attendance,
          schedule: updatedData.schedule,
        });
      }
    } catch (error) {
      logger.error(`Failed to update student data field: ${field}`, error);
    }
  }

  // ============================================
  // PARENT DATA OPERATIONS
  // ============================================

  /**
   * Cache parent data for offline access
   */
  public cacheParentData(parentData: Omit<CachedParentData, 'lastUpdated' | 'expiresAt'>): void {
    try {
      const cachedData: CachedParentData = {
        ...parentData,
        lastUpdated: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION,
      };

      localStorage.setItem(STORAGE_KEYS.OFFLINE_PARENT_DATA, JSON.stringify({
        ...cachedData,
        version: CACHE_VERSION,
      }));

      logger.info('Parent data cached for offline', {
        childrenCount: parentData.children.length,
        childrenWithData: Object.keys(parentData.childrenData).length,
      });

      this.notifySyncStatusChange();
    } catch (error) {
      logger.error('Failed to cache parent data', error);
    }
  }

  /**
   * Get cached parent data
   */
  public getCachedParentData(): CachedParentData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OFFLINE_PARENT_DATA);
      if (!stored) return null;

      const data = JSON.parse(stored);
      
      // Check version compatibility
      if (data.version !== CACHE_VERSION) {
        logger.info('Parent data cache version mismatch, clearing cache');
        localStorage.removeItem(STORAGE_KEYS.OFFLINE_PARENT_DATA);
        return null;
      }

      // Check if cache is expired
      if (Date.now() > data.expiresAt) {
        logger.info('Parent data cache expired');
        localStorage.removeItem(STORAGE_KEYS.OFFLINE_PARENT_DATA);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Failed to get cached parent data', error);
      return null;
    }
  }

  /**
   * Get cached data for specific child
   */
  public getCachedChildData(studentId: string): CachedStudentData | null {
    const parentCache = this.getCachedParentData();
    if (!parentCache) return null;

    return parentCache.childrenData[studentId] || null;
  }

  /**
   * Check if parent data is cached and fresh
   */
  public isParentDataCached(): boolean {
    return this.getCachedParentData() !== null;
  }

  // ============================================
  // TEACHER DATA OPERATIONS (Issue #1315)
  // ============================================

  /**
   * Cache teacher data for offline access
   */
  public cacheTeacherData(teacherData: Omit<CachedTeacherData, 'lastUpdated' | 'expiresAt'>): void {
    try {
      const cachedData: CachedTeacherData = {
        ...teacherData,
        lastUpdated: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION,
      };

      localStorage.setItem(STORAGE_KEYS.OFFLINE_TEACHER_DATA, JSON.stringify({
        ...cachedData,
        version: CACHE_VERSION,
      }));

      logger.info('Teacher data cached for offline', {
        teacherId: teacherData.teacherId,
        classesCount: teacherData.classes.length,
        studentsCount: teacherData.students.length,
        gradesCount: teacherData.recentGrades.length,
      });

      this.notifySyncStatusChange();
    } catch (error) {
      logger.error('Failed to cache teacher data', error);
    }
  }

  /**
   * Get cached teacher data
   */
  public getCachedTeacherData(teacherId: string): CachedTeacherData | null {
    return this.getCachedData<CachedTeacherData>(
      STORAGE_KEYS.OFFLINE_TEACHER_DATA,
      teacherId,
      'teacherId',
      'Teacher'
    );
  }

  /**
   * Check if teacher data is cached and fresh
   */
  public isTeacherDataCached(teacherId: string): boolean {
    return this.getCachedTeacherData(teacherId) !== null;
  }

  // ============================================
  // ADMIN DATA OPERATIONS (Issue #1315)
  // ============================================

  /**
   * Cache admin data for offline access
   */
  public cacheAdminData(adminData: Omit<CachedAdminData, 'lastUpdated' | 'expiresAt'>): void {
    try {
      const cachedData: CachedAdminData = {
        ...adminData,
        lastUpdated: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION,
      };

      localStorage.setItem(STORAGE_KEYS.OFFLINE_ADMIN_DATA, JSON.stringify({
        ...cachedData,
        version: CACHE_VERSION,
      }));

      logger.info('Admin data cached for offline', {
        adminId: adminData.adminId,
        usersCount: adminData.recentUsers.length,
        pendingPPDBCount: adminData.pendingPPDB.length,
      });

      this.notifySyncStatusChange();
    } catch (error) {
      logger.error('Failed to cache admin data', error);
    }
  }

  /**
   * Get cached admin data
   */
  public getCachedAdminData(adminId: string): CachedAdminData | null {
    return this.getCachedData<CachedAdminData>(
      STORAGE_KEYS.OFFLINE_ADMIN_DATA,
      adminId,
      'adminId',
      'Admin'
    );
  }

  /**
   * Check if admin data is cached and fresh
   */
  public isAdminDataCached(adminId: string): boolean {
    return this.getCachedAdminData(adminId) !== null;
  }

  // ============================================
  // SYNC OPERATIONS
  // ============================================

  /**
   * Get sync status
   */
  public getSyncStatus(): SyncStatus {
    const studentCache = this.getStudentCache();
    const parentCache = this.getCachedParentData();
    const currentUser = this.getCurrentUserId();

    // Get latest update timestamp
    let lastSync = 0;
    let cacheAge = 0;

    if (parentCache) {
      lastSync = Math.max(lastSync, parentCache.lastUpdated);
      cacheAge = Math.max(cacheAge, Date.now() - parentCache.lastUpdated);
    }

    Object.values(studentCache).forEach(studentData => {
      lastSync = Math.max(lastSync, studentData.lastUpdated);
      cacheAge = Math.max(cacheAge, Date.now() - studentData.lastUpdated);
    });

    // Check teacher cache (Issue #1315)
    if (currentUser) {
      const teacherCache = this.getCachedTeacherData(currentUser);
      if (teacherCache) {
        lastSync = Math.max(lastSync, teacherCache.lastUpdated);
        cacheAge = Math.max(cacheAge, Date.now() - teacherCache.lastUpdated);
      }

      // Check admin cache (Issue #1315)
      const adminCache = this.getCachedAdminData(currentUser);
      if (adminCache) {
        lastSync = Math.max(lastSync, adminCache.lastUpdated);
        cacheAge = Math.max(cacheAge, Date.now() - adminCache.lastUpdated);
      }
    }

    // Get pending actions count
    let pendingActions = 0;
    try {
      const queuedActions = localStorage.getItem(STORAGE_KEYS.QUEUED_ACTIONS);
      if (queuedActions) {
        const actions = JSON.parse(queuedActions);
        pendingActions = actions.filter((action: { status: string }) => action.status === 'pending').length;
      }
    } catch (error) {
      logger.error('Failed to get pending actions count', error);
    }

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const needsSync = cacheAge > SYNC_INTERVAL || pendingActions > 0;

    return {
      lastSync,
      pendingActions,
      isOnline,
      cacheAge,
      needsSync,
    };
  }

  /**
   * Force sync all cached data
   */
  public async forceSync(): Promise<void> {
    logger.info('Force syncing offline data');

    // Clear caches to force refresh
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_STUDENT_DATA);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_PARENT_DATA);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_TEACHER_DATA); // Issue #1315
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_ADMIN_DATA); // Issue #1315

    this.notifySyncStatusChange();
  }

  /**
   * Clear all offline data
   */
  public clearOfflineData(): void {
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_STUDENT_DATA);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_PARENT_DATA);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_TEACHER_DATA); // Issue #1315
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_ADMIN_DATA); // Issue #1315
    logger.info('Offline data cleared');
    this.notifySyncStatusChange();
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private getCurrentUserId(): string {
    try {
      const userJSON = localStorage.getItem(STORAGE_KEYS.USER);
      if (userJSON) {
        const user = JSON.parse(userJSON);
        return user.id || '';
      }
    } catch (error) {
      logger.error('Failed to get current user ID', error);
    }
    return '';
  }

  private getCachedData<T extends { lastUpdated: number; expiresAt: number; version?: string }>(
    storageKey: string,
    userId: string,
    userIdKey: string,
    entityType: string
  ): T | null {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const data = JSON.parse(stored) as T;

      if (data.version !== CACHE_VERSION) {
        logger.info(`${entityType} data cache version mismatch, clearing cache`);
        localStorage.removeItem(storageKey);
        return null;
      }

      if (Date.now() > data.expiresAt) {
        logger.info(`${entityType} data cache expired`, { [userIdKey]: userId });
        localStorage.removeItem(storageKey);
        return null;
      }

      const typedData = data as T & Record<string, unknown>;
      if (typedData[userIdKey] !== userId) {
        return null;
      }

      return data;
    } catch (error) {
      logger.error(`Failed to get cached ${entityType} data`, error);
      return null;
    }
  }

  private getStudentCache(): Record<string, CachedStudentData> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OFFLINE_STUDENT_DATA);
      if (!stored) return {};

      const data = JSON.parse(stored);
      
      // Check version compatibility
      if (data.version !== CACHE_VERSION) {
        logger.info('Student data cache version mismatch, clearing cache');
        localStorage.removeItem(STORAGE_KEYS.OFFLINE_STUDENT_DATA);
        return {};
      }

      // Filter out expired entries
      const now = Date.now();
      const validCache: Record<string, CachedStudentData> = {};
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'version') return;
        
        const studentData = value as CachedStudentData;
        if (now <= studentData.expiresAt) {
          validCache[key] = studentData;
        }
      });

      // Update cache if we removed expired entries
      if (Object.keys(validCache).length !== Object.keys(data).length - 1) {
        localStorage.setItem(STORAGE_KEYS.OFFLINE_STUDENT_DATA, JSON.stringify({
          ...validCache,
          version: CACHE_VERSION,
        }));
      }

      return validCache;
    } catch (error) {
      logger.error('Failed to get student cache', error);
      return {};
    }
  }

  private setupPeriodicSync(): void {
    // Check sync status every 5 minutes
    this.syncInterval = setInterval(() => {
      this.notifySyncStatusChange();
    }, 5 * 60 * 1000);
  }

  private notifySyncStatusChange(): void {
    const status = this.getSyncStatus();
    this.syncCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        logger.error('Sync status callback error', error);
      }
    });
  }

  private migrateLegacyData(): void {
    // Handle any legacy data migration here
    try {
      const legacyKeys = [
        'malnu_student_grades_cache',
        'malnu_student_attendance_cache',
        'malnu_parent_children_cache',
      ];

      legacyKeys.forEach(key => {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          logger.info('Migrating legacy offline data', { key });
          // Migration logic would go here
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      logger.error('Failed to migrate legacy data', error);
    }
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  /**
   * Subscribe to sync status changes
   */
  public onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }

  /**
   * Cleanup service
   */
  public cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.syncCallbacks.clear();
  }
}

// ============================================
// EXPORTS
// ============================================

export const offlineDataService = new OfflineDataService();

/**
 * Hook for using offline data service
 */
export function useOfflineDataService() {
  const networkStatus = useNetworkStatus();

  return {
    // Student operations
    cacheStudentData: offlineDataService.cacheStudentData.bind(offlineDataService),
    getCachedStudentData: offlineDataService.getCachedStudentData.bind(offlineDataService),
    isStudentDataCached: offlineDataService.isStudentDataCached.bind(offlineDataService),
    updateStudentData: offlineDataService.updateStudentData.bind(offlineDataService),

    // Parent operations
    cacheParentData: offlineDataService.cacheParentData.bind(offlineDataService),
    getCachedParentData: offlineDataService.getCachedParentData.bind(offlineDataService),
    getCachedChildData: offlineDataService.getCachedChildData.bind(offlineDataService),
    isParentDataCached: offlineDataService.isParentDataCached.bind(offlineDataService),

    // Teacher operations (Issue #1315)
    cacheTeacherData: offlineDataService.cacheTeacherData.bind(offlineDataService),
    getCachedTeacherData: offlineDataService.getCachedTeacherData.bind(offlineDataService),
    isTeacherDataCached: offlineDataService.isTeacherDataCached.bind(offlineDataService),

    // Admin operations (Issue #1315)
    cacheAdminData: offlineDataService.cacheAdminData.bind(offlineDataService),
    getCachedAdminData: offlineDataService.getCachedAdminData.bind(offlineDataService),
    isAdminDataCached: offlineDataService.isAdminDataCached.bind(offlineDataService),

    // Sync operations
    getSyncStatus: offlineDataService.getSyncStatus.bind(offlineDataService),
    forceSync: offlineDataService.forceSync.bind(offlineDataService),
    clearOfflineData: offlineDataService.clearOfflineData.bind(offlineDataService),
    onSyncStatusChange: offlineDataService.onSyncStatusChange.bind(offlineDataService),

    // Network status
    isOnline: networkStatus.isOnline,
    isSlow: networkStatus.isSlow,
  };
}

/**
 * React Hook for offline data management
 */
export function useOfflineData(role: 'student' | 'parent' | 'teacher' | 'admin', userId?: string) {
  // React is already imported at the top of the file for hooks

  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>(offlineDataService.getSyncStatus());
  const [isCached, setIsCached] = React.useState(false);

  React.useEffect(() => {
    // Check initial cache state
    if (role === 'student' && userId) {
      setIsCached(offlineDataService.isStudentDataCached(userId));
    } else if (role === 'parent') {
      setIsCached(offlineDataService.isParentDataCached());
    } else if (role === 'teacher' && userId) {
      setIsCached(offlineDataService.isTeacherDataCached(userId));
    } else if (role === 'admin' && userId) {
      setIsCached(offlineDataService.isAdminDataCached(userId));
    }

    // Listen for sync status changes
    const unsubscribe = offlineDataService.onSyncStatusChange((status) => {
      setSyncStatus(status);

      // Update cache status
      if (role === 'student' && userId) {
        setIsCached(offlineDataService.isStudentDataCached(userId));
      } else if (role === 'parent') {
        setIsCached(offlineDataService.isParentDataCached());
      } else if (role === 'teacher' && userId) {
        setIsCached(offlineDataService.isTeacherDataCached(userId));
      } else if (role === 'admin' && userId) {
        setIsCached(offlineDataService.isAdminDataCached(userId));
      }
    });

    return unsubscribe;
  }, [role, userId]);

  return {
    syncStatus,
    isCached,
    isStale: syncStatus.cacheAge > CACHE_DURATION * 0.8, // 80% of cache duration
  };
}