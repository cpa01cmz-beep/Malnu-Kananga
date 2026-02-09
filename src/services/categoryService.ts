import { Subject, Class } from '../types';
import { subjectsAPI, classesAPI } from './apiService';
import { logger } from '../utils/logger';
import { STORAGE_KEYS, CACHE_TTL } from '../constants';
// import { useLocalStorage } from '../hooks/useLocalStorage';

export interface SubjectWithUsage {
  subject: Subject;
  materialCount?: number;
  usedByClasses?: Class[];
}

export interface CategoryValidationResult {
  valid: boolean;
  error?: string;
  suggestions?: string[];
}

export interface NewCategorySuggestion {
  name: string;
  description?: string;
  suggestedBy: string;
  suggestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const CACHE_EXPIRY = CACHE_TTL.CATEGORY; // 30 minutes

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export class CategoryService {
  private static instance: CategoryService;
  private subjectCache: Subject[] = [];
  private classCache: Class[] = [];
  private lastFetched: { subjects?: number; classes?: number } = {};

  private constructor() {}

  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  async getSubjects(forceRefresh = false): Promise<Subject[]> {
    const now = Date.now();
    const cacheValid = this.lastFetched.subjects && (now - this.lastFetched.subjects) < CACHE_EXPIRY;

    if (!forceRefresh && cacheValid && this.subjectCache.length > 0) {
      return this.subjectCache;
    }

    try {
      const response = await subjectsAPI.getAll();
      if (response.success && response.data) {
        this.subjectCache = response.data;
        this.lastFetched.subjects = now;
        this.saveToCache(STORAGE_KEYS.SUBJECTS_CACHE, this.subjectCache);
        return this.subjectCache;
      } else {
        return this.getFromCache(STORAGE_KEYS.SUBJECTS_CACHE) || [];
      }
    } catch (error) {
      logger.warn('Failed to fetch subjects, using cache:', error);
      return this.getFromCache(STORAGE_KEYS.SUBJECTS_CACHE) || [];
    }
  }

  async getClasses(forceRefresh = false): Promise<Class[]> {
    const now = Date.now();
    const cacheValid = this.lastFetched.classes && (now - this.lastFetched.classes) < CACHE_EXPIRY;

    if (!forceRefresh && cacheValid && this.classCache.length > 0) {
      return this.classCache;
    }

    try {
      const response = await classesAPI.getAll();
      if (response.success && response.data) {
        this.classCache = response.data;
        this.lastFetched.classes = now;
        this.saveToCache(STORAGE_KEYS.CLASSES_CACHE, this.classCache);
        return this.classCache;
      } else {
        return this.getFromCache(STORAGE_KEYS.CLASSES_CACHE) || [];
      }
    } catch (error) {
      logger.warn('Failed to fetch classes, using cache:', error);
      return this.getFromCache(STORAGE_KEYS.CLASSES_CACHE) || [];
    }
  }

  getSubjectsByCategory(): SubjectWithUsage[] {
    const materialStats = this.getMaterialStats();
    
    return this.subjectCache.map(subject => ({
      subject,
      materialCount: materialStats[subject.id] || 0,
      usedByClasses: this.classCache.filter(cls => 
        // Note: This would need to be adjusted based on actual class-subject relationship
        cls.name.toLowerCase().includes(subject.name.toLowerCase())
      )
    })).sort((a, b) => a.subject.name.localeCompare(b.subject.name));
  }

  validateCategory(subjectName: string, existingMaterials: string[] = []): CategoryValidationResult {
    if (!subjectName || subjectName.trim().length === 0) {
      return {
        valid: false,
        error: 'Nama kategori tidak boleh kosong'
      };
    }

    const trimmedName = subjectName.trim();
    
    // Check if subject exists in available subjects
    const existingSubject = this.subjectCache.find(s => 
      s.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingSubject) {
      return {
        valid: true
      };
    }

    // Check for similar names to suggest corrections
    const similarSubjects = this.subjectCache.filter(s => 
      s.name.toLowerCase().includes(trimmedName.toLowerCase()) ||
      trimmedName.toLowerCase().includes(s.name.toLowerCase())
    );

    if (similarSubjects.length > 0) {
      return {
        valid: false,
        error: 'Kategori tidak ditemukan. Mungkin maksud Anda:',
        suggestions: similarSubjects.map(s => s.name)
      };
    }

    // If no matches, this could be a new category suggestion
    if (existingMaterials.some(material => 
      material.toLowerCase() === trimmedName.toLowerCase()
    )) {
      return {
        valid: true // Allow existing material categories for backwards compatibility
      };
    }

    return {
      valid: false,
      error: 'Kategori tidak valid. Gunakan kategori yang tersedia atau ajukan kategori baru.'
    };
  }

  async suggestNewCategory(suggestion: Omit<NewCategorySuggestion, 'suggestedAt' | 'status'>): Promise<boolean> {
    try {
      const newSuggestion: NewCategorySuggestion = {
        ...suggestion,
        suggestedAt: new Date().toISOString(),
        status: 'pending'
      };

      const existingSuggestions = this.getFromCache<NewCategorySuggestion[]>(STORAGE_KEYS.CATEGORY_SUGGESTIONS) || [];
      const updatedSuggestions = [...existingSuggestions, newSuggestion];
      
      this.saveToCache(STORAGE_KEYS.CATEGORY_SUGGESTIONS, updatedSuggestions);

      // In a real implementation, this would call an API to notify admins
      logger.info('New category suggestion:', newSuggestion);

      return true;
    } catch (error) {
      logger.error('Failed to save category suggestion:', error);
      return false;
    }
  }

  getCategorySuggestions(): NewCategorySuggestion[] {
    return this.getFromCache<NewCategorySuggestion[]>(STORAGE_KEYS.CATEGORY_SUGGESTIONS) || [];
  }

  updateMaterialStats(materials: Array<{ subjectId?: string; category: string }>) {
    const stats: Record<string, number> = {};
    
    materials.forEach(material => {
      const key = material.subjectId || 'unknown';
      stats[key] = (stats[key] || 0) + 1;
    });

    this.saveToCache(STORAGE_KEYS.MATERIAL_STATS, stats);
  }

  private getMaterialStats(): Record<string, number> {
    return this.getFromCache<Record<string, number>>(STORAGE_KEYS.MATERIAL_STATS) || {};
  }

  private saveToCache<T>(key: string, data: T): void {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      logger.warn(`Failed to save cache for ${key}:`, error);
    }
  }

  private getFromCache<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      if (Date.now() - cacheData.timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      logger.warn(`Failed to read cache for ${key}:`, error);
      localStorage.removeItem(key);
      return null;
    }
  }

  clearCache(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (typeof key === 'string') {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          logger.warn(`Failed to clear cache key ${key}:`, error);
        }
      }
    });

    this.subjectCache = [];
    this.classCache = [];
    this.lastFetched = {};
  }
}

export const categoryService = CategoryService.getInstance();