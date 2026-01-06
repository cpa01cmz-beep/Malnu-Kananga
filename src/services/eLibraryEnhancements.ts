import { MaterialFavorite, MaterialRating, ReadingProgress, MaterialSearchFilters, ELibrary } from '../types';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

const materialFavoritesService = {
  getFavorites: (userId: string): MaterialFavorite[] => {
    try {
      const favorites = localStorage.getItem(STORAGE_KEYS.MATERIAL_FAVORITES);
      if (!favorites) return [];
      const allFavorites: MaterialFavorite[] = JSON.parse(favorites);
      return allFavorites.filter((f) => f.userId === userId);
    } catch (err) {
      logger.error('Error getting favorites:', err);
      return [];
    }
  },

  addFavorite: (materialId: string, userId: string): void => {
    try {
      const favorites = materialFavoritesService.getFavorites(userId);
      const existing = favorites.find((f) => f.materialId === materialId);
      if (existing) return;

      const newFavorite: MaterialFavorite = {
        materialId,
        userId,
        createdAt: new Date().toISOString(),
      };

      const allFavorites = localStorage.getItem(STORAGE_KEYS.MATERIAL_FAVORITES);
      const parsedFavorites = allFavorites ? JSON.parse(allFavorites) : [];
      parsedFavorites.push(newFavorite);
      localStorage.setItem(STORAGE_KEYS.MATERIAL_FAVORITES, JSON.stringify(parsedFavorites));
    } catch (err) {
      logger.error('Error adding favorite:', err);
    }
  },

  removeFavorite: (materialId: string, userId: string): void => {
    try {
      const allFavorites = localStorage.getItem(STORAGE_KEYS.MATERIAL_FAVORITES);
      if (!allFavorites) return;

      const parsedFavorites: MaterialFavorite[] = JSON.parse(allFavorites);
      const filtered = parsedFavorites.filter((f) => !(f.materialId === materialId && f.userId === userId));
      localStorage.setItem(STORAGE_KEYS.MATERIAL_FAVORITES, JSON.stringify(filtered));
    } catch (err) {
      logger.error('Error removing favorite:', err);
    }
  },

  isFavorite: (materialId: string, userId: string): boolean => {
    const favorites = materialFavoritesService.getFavorites(userId);
    return favorites.some((f) => f.materialId === materialId);
  },
};

const materialRatingsService = {
  getRatings: (materialId: string): MaterialRating[] => {
    try {
      const ratings = localStorage.getItem(STORAGE_KEYS.MATERIAL_RATINGS);
      if (!ratings) return [];
      const allRatings: MaterialRating[] = JSON.parse(ratings);
      return allRatings.filter((r) => r.materialId === materialId);
    } catch (err) {
      logger.error('Error getting ratings:', err);
      return [];
    }
  },

  getUserRating: (materialId: string, userId: string): MaterialRating | null => {
    try {
      const ratings = localStorage.getItem(STORAGE_KEYS.MATERIAL_RATINGS);
      if (!ratings) return null;
      const allRatings: MaterialRating[] = JSON.parse(ratings);
      return allRatings.find((r) => r.materialId === materialId && r.userId === userId) || null;
    } catch (err) {
      logger.error('Error getting user rating:', err);
      return null;
    }
  },

  addRating: (materialId: string, userId: string, rating: number, review?: string): void => {
    try {
      const existingRating = materialRatingsService.getUserRating(materialId, userId);
      const timestamp = new Date().toISOString();

      const newRating: MaterialRating = {
        id: existingRating?.id || `rating_${Date.now()}`,
        materialId,
        userId,
        rating,
        review,
        createdAt: existingRating?.createdAt || timestamp,
        updatedAt: timestamp,
      };

      const allRatings = localStorage.getItem(STORAGE_KEYS.MATERIAL_RATINGS);
      const parsedRatings = allRatings ? JSON.parse(allRatings) : [];

      if (existingRating) {
        const index = parsedRatings.findIndex((r: MaterialRating) => r.id === existingRating.id);
        if (index !== -1) {
          parsedRatings[index] = newRating;
        }
      } else {
        parsedRatings.push(newRating);
      }

      localStorage.setItem(STORAGE_KEYS.MATERIAL_RATINGS, JSON.stringify(parsedRatings));
    } catch (err) {
      logger.error('Error adding rating:', err);
    }
  },

  getAverageRating: (materialId: string): number => {
    const ratings = materialRatingsService.getRatings(materialId);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  },

  getRatingCount: (materialId: string): number => {
    return materialRatingsService.getRatings(materialId).length;
  },
};

const readingProgressService = {
  getProgress: (materialId: string, userId: string): ReadingProgress | null => {
    try {
      const progress = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
      if (!progress) return null;
      const allProgress: ReadingProgress[] = JSON.parse(progress);
      return allProgress.find((p) => p.materialId === materialId && p.userId === userId) || null;
    } catch (err) {
      logger.error('Error getting reading progress:', err);
      return null;
    }
  },

  updateProgress: (
    materialId: string,
    userId: string,
    currentPage: number,
    totalPages: number,
    timeSpentMinutes: number = 1
  ): void => {
    try {
      const timestamp = new Date().toISOString();
      const progressPercentage = Math.round((currentPage / totalPages) * 100);
      const existing = readingProgressService.getProgress(materialId, userId);

      const newProgress: ReadingProgress = {
        materialId,
        userId,
        currentPage,
        totalPages,
        progressPercentage,
        lastReadAt: timestamp,
        timeSpentMinutes: existing ? existing.timeSpentMinutes + timeSpentMinutes : timeSpentMinutes,
      };

      const allProgress = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
      const parsedProgress = allProgress ? JSON.parse(allProgress) : [];

      if (existing) {
        const index = parsedProgress.findIndex((p: ReadingProgress) => p.materialId === materialId && p.userId === userId);
        if (index !== -1) {
          parsedProgress[index] = newProgress;
        }
      } else {
        parsedProgress.push(newProgress);
      }

      localStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(parsedProgress));
    } catch (err) {
      logger.error('Error updating reading progress:', err);
    }
  },

  getRecentlyRead: (userId: string, limit: number = 5): ReadingProgress[] => {
    try {
      const progress = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
      if (!progress) return [];
      const allProgress: ReadingProgress[] = JSON.parse(progress);
      return allProgress
        .filter((p) => p.userId === userId)
        .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
        .slice(0, limit);
    } catch (err) {
      logger.error('Error getting recently read:', err);
      return [];
    }
  },
};

const materialSearchService = {
  filterMaterials: (materials: ELibrary[], filters: MaterialSearchFilters): ELibrary[] => {
    return materials.filter((material) => {
      if (filters.subject && material.category !== filters.subject && material.subjectId !== filters.subject) {
        return false;
      }

      if (filters.teacher && material.uploadedByTeacherName !== filters.teacher) {
        return false;
      }

      if (filters.dateRange) {
        const materialDate = new Date(material.uploadedAt);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (filters.dateRange) {
          case 'today':
            if (materialDate < today) return false;
            break;
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (materialDate < weekAgo) return false;
            break;
          }
          case 'month': {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            if (materialDate < monthAgo) return false;
            break;
          }
          case 'year': {
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            if (materialDate < yearAgo) return false;
            break;
          }
        }
      }

      if (filters.fileType) {
        const materialType = material.fileType.toLowerCase();
        if (filters.fileType === 'pdf' && !materialType.includes('pdf')) return false;
        if (filters.fileType === 'doc' && !materialType.includes('doc')) return false;
        if (filters.fileType === 'ppt' && !materialType.includes('ppt')) return false;
        if (filters.fileType === 'video' && !materialType.includes('video') && !materialType.includes('mp4')) return false;
      }

      if (filters.minRating) {
        const avgRating = materialRatingsService.getAverageRating(material.id);
        if (avgRating < filters.minRating) return false;
      }

      return true;
    });
  },

  getAvailableTeachers: (materials: ELibrary[]): string[] => {
    const teachers = materials
      .map((m) => m.uploadedByTeacherName)
      .filter(Boolean) as string[];
    return Array.from(new Set(teachers)).sort();
  },

  searchMaterials: (materials: ELibrary[], query: string): ELibrary[] => {
    const lowercaseQuery = query.toLowerCase();
    return materials.filter(
      (m) =>
        m.title.toLowerCase().includes(lowercaseQuery) ||
        m.description.toLowerCase().includes(lowercaseQuery) ||
        m.category.toLowerCase().includes(lowercaseQuery)
    );
  },
};

export { materialFavoritesService, materialRatingsService, readingProgressService, materialSearchService };
