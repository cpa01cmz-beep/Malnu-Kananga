import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  runStorageMigration,
  migrateStudentGoals,
  checkForOldKeys,
  forceMigration,
} from '../storageMigration';
import { STORAGE_KEYS } from '../../constants';
import { logger } from '../../utils/logger';

describe('storageMigration', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0,
    });
    vi.spyOn(logger, 'debug').mockImplementation(() => {});
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('runStorageMigration', () => {
    it('should skip migration if already up to date', () => {
      const localStorageMock = globalThis.localStorage as any;
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'malnu_storage_migration_version') return '1.0.0';
        return null;
      });

      runStorageMigration();

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalled();
    });

    it('should migrate all old keys to new keys', () => {
      const localStorageMock = globalThis.localStorage as any;
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'malnu_storage_migration_version') return null;
        if (key === 'auth_token') return 'token123';
        if (key === 'refresh_token') return 'refresh456';
        if (key === 'user') return '{"id":1}';
        if (key === 'student_bookmarks') return '[]';
        return null;
      });

      runStorageMigration();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN, 'token123');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN, 'refresh456');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEYS.USER, '{"id":1}');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEYS.STUDENT_BOOKMARKS, '[]');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('malnu_storage_migration_version', '1.0.0');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
    });

    it('should skip migration if old key does not exist', () => {
      const localStorageMock = globalThis.localStorage as any;
      localStorageMock.getItem.mockReturnValue(null);

      runStorageMigration();

      expect(localStorageMock.setItem).toHaveBeenCalledWith('malnu_storage_migration_version', '1.0.0');
    });

    it('should handle migration errors gracefully', () => {
      const localStorageMock = globalThis.localStorage as any;
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'malnu_storage_migration_version') return null;
        if (key === 'auth_token') throw new Error('Storage error');
        return null;
      });

      runStorageMigration();

      expect(logger.error).toHaveBeenCalled();
    });

    it('should log migration count', () => {
      const localStorageMock = globalThis.localStorage as any;
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'malnu_storage_migration_version') return null;
        if (key === 'auth_token') return 'token123';
        if (key === 'user') return '{"id":1}';
        return null;
      });

      runStorageMigration();

      expect(logger.info).toHaveBeenCalledWith('Storage migration completed: 2 keys migrated');
    });

    it('should return early if window is undefined (SSR)', () => {
      vi.unstubAllGlobals();
      const debugSpy = vi.spyOn(logger, 'debug').mockImplementation(() => {});

      runStorageMigration();

      expect(debugSpy).not.toHaveBeenCalled();
      debugSpy.mockRestore();
    });
  });

  describe('migrateStudentGoals', () => {
    it('should migrate goals from old pattern to new key', () => {
      const localStorageMock = globalThis.localStorage as any;
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'goals_12345') return '[{"goal":"Pass Math"}]';
        if (key === 'student_goals_12345') return '[{"goal":"Pass English"}]';
        return null;
      });

      migrateStudentGoals('12345');

      const expectedKey = STORAGE_KEYS.STUDENT_GOALS('12345');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(expectedKey, '[{"goal":"Pass Math"}]');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('goals_12345');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(expectedKey, '[{"goal":"Pass English"}]');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('student_goals_12345');
    });

    it('should skip migration if studentNIS is empty', () => {
      const localStorageMock = globalThis.localStorage as any;

      migrateStudentGoals('');

      expect(localStorageMock.getItem).not.toHaveBeenCalled();
    });

    it('should skip migration if old key does not exist', () => {
      const localStorageMock = globalThis.localStorage as any;
      localStorageMock.getItem.mockReturnValue(null);

      migrateStudentGoals('12345');

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should log error when getItem throws', () => {
      const localStorageMock = globalThis.localStorage as any;
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'goals_12345') throw new Error('Storage error');
        return null;
      });

      expect(() => migrateStudentGoals('12345')).toThrow('Storage error');
    });

    it('should return early if window is undefined (SSR)', () => {
      vi.unstubAllGlobals();
      const debugSpy = vi.spyOn(logger, 'debug').mockImplementation(() => {});

      migrateStudentGoals('12345');

      expect(debugSpy).not.toHaveBeenCalled();
      debugSpy.mockRestore();
    });
  });

  describe('checkForOldKeys', () => {
    it('should return empty array if no old keys exist', () => {
      const localStorageMock = globalThis.localStorage as any;
      localStorageMock.getItem.mockReturnValue(null);
      localStorageMock.key.mockReturnValue(null);

      const oldKeys = checkForOldKeys();

      expect(oldKeys).toEqual([]);
    });

    it('should detect old static keys', () => {
      const localStorageMock = globalThis.localStorage as any;
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'auth_token') return 'token123';
        if (key === 'refresh_token') return 'refresh456';
        return null;
      });

      const oldKeys = checkForOldKeys();

      expect(oldKeys).toContain('auth_token');
      expect(oldKeys).toContain('refresh_token');
      expect(oldKeys).toHaveLength(2);
    });

    it('should detect old dynamic goal keys', () => {
      const localStorageMock = globalThis.localStorage as any;
      localStorageMock.getItem.mockReturnValue(null);
      localStorageMock.length = 2;
      localStorageMock.key.mockImplementation((index: number) => {
        if (index === 0) return 'goals_12345';
        if (index === 1) return 'student_goals_67890';
        return null;
      });

      const oldKeys = checkForOldKeys();

      expect(oldKeys).toContain('goals_12345');
      expect(oldKeys).toContain('student_goals_67890');
      expect(oldKeys).toHaveLength(2);
    });

    it('should skip already migrated goal keys', () => {
      const localStorageMock = globalThis.localStorage as any;
      localStorageMock.getItem.mockReturnValue(null);
      localStorageMock.length = 1;
      const migratedKey = STORAGE_KEYS.STUDENT_GOALS('12345');
      localStorageMock.key.mockReturnValue(migratedKey);

      const oldKeys = checkForOldKeys();

      expect(oldKeys).not.toContain(migratedKey);
      expect(oldKeys).toHaveLength(0);
    });

    it('should return early if window is undefined (SSR)', () => {
      vi.unstubAllGlobals();

      const oldKeys = checkForOldKeys();

      expect(oldKeys).toEqual([]);
    });
  });

  describe('forceMigration', () => {
    it('should remove migration version and re-run migration', () => {
      const localStorageMock = globalThis.localStorage as any;
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'malnu_storage_migration_version') return '1.0.0';
        if (key === 'auth_token') return 'token123';
        return null;
      });

      forceMigration();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('malnu_storage_migration_version');
    });

    it('should return early if window is undefined (SSR)', () => {
      vi.unstubAllGlobals();
      const removeItemSpy = vi.fn();

      forceMigration();

      expect(removeItemSpy).not.toHaveBeenCalled();
    });
  });
});
