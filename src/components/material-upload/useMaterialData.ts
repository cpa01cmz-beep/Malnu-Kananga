import { useState, useCallback, useEffect } from 'react';
import { ELibrary as ELibraryType, Subject } from '../../types';
import { eLibraryAPI } from '../../services/apiService';
import { categoryService } from '../../services/categoryService';
import { CategoryValidator } from '../../utils/categoryValidator';
import { CategoryValidationResult } from '../../services/categoryService';
import { executeWithRetry, createToastHandler } from '../../utils/teacherErrorHandler';
import { useOfflineActionQueue } from '../../services/offlineActionQueueService';
import { useNetworkStatus } from '../../utils/networkStatus';
import { useEventNotifications } from '../../hooks/useEventNotifications';
import { unifiedNotificationManager } from '../../services/notifications/unifiedNotificationManager';
import { logger } from '../../utils/logger';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_ERROR_MESSAGES,
  USER_GUIDANCE,
} from '../../utils/errorMessages';
import { RETRY_CONFIG } from '../../constants';
import { validateMaterialData } from '../../utils/teacherValidation';

interface UseMaterialDataOptions {
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

interface UseMaterialDataReturn {
  // State
  materials: ELibraryType[];
  subjects: Subject[];
  loading: boolean;
  subjectsLoading: boolean;
  error: string | null;
  categoryValidation: CategoryValidationResult | null;

  // Actions
  fetchMaterials: () => Promise<void>;
  fetchSubjects: () => Promise<void>;
  createMaterial: (materialData: {
    title: string;
    description: string;
    category: string;
    subjectId?: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    folderId?: string;
  }) => Promise<void>;
  deleteMaterial: (material: ELibraryType) => Promise<void>;
  setCategoryValidation: (validation: CategoryValidationResult | null) => void;

  // Filter helpers
  getFilteredMaterials: (
    allMaterials: ELibraryType[],
    filters: {
      searchQuery: string;
      filterCategory: string;
      filterFileType: string;
      filterShared: boolean | null;
      selectedFolder?: { id: string };
    }
  ) => ELibraryType[];
  clearFilters: (setFilters: (filters: {
    searchQuery: string;
    filterCategory: string;
    filterFileType: string;
    filterShared: boolean | null;
  }) => void) => void;
  getActiveFilterCount: (filters: {
    searchQuery: string;
    filterCategory: string;
    filterFileType: string;
    filterShared: boolean | null;
  }) => number;
}

export function useMaterialData({ onShowToast }: UseMaterialDataOptions): UseMaterialDataReturn {
  const toast = createToastHandler(onShowToast);
  const { notifyLibraryUpdate } = useEventNotifications();
  const { isOnline, isSlow } = useNetworkStatus();
  const { addAction } = useOfflineActionQueue();

  const [materials, setMaterials] = useState<ELibraryType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryValidation, setCategoryValidation] = useState<CategoryValidationResult | null>(null);

  useEffect(() => {
    fetchSubjects();
    fetchMaterials();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSubjects = useCallback(async () => {
    setSubjectsLoading(true);
    try {
      const fetchedSubjects = await categoryService.getSubjects();
      setSubjects(fetchedSubjects);
    } catch (err) {
      logger.error('Error fetching subjects:', err);
      onShowToast(API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 'error');
    } finally {
      setSubjectsLoading(false);
    }
  }, [onShowToast]);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eLibraryAPI.getAll();
      if (response.success && response.data) {
        setMaterials(response.data);
      } else {
        setError(response.message || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
      }
    } catch (err) {
      setError(API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
      logger.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFilteredMaterials = useCallback((
    allMaterials: ELibraryType[],
    filters: {
      searchQuery: string;
      filterCategory: string;
      filterFileType: string;
      filterShared: boolean | null;
      selectedFolder?: { id: string };
    }
  ): ELibraryType[] => {
    const { searchQuery, filterCategory, filterFileType, filterShared, selectedFolder } = filters;
    let filtered = allMaterials;

    if (selectedFolder) {
      filtered = filtered.filter(m => m.folderId === selectedFolder.id);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query)
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(m => m.category === filterCategory);
    }

    if (filterFileType !== 'all') {
      const fileTypeMap: Record<string, string[]> = {
        'PDF': ['pdf'],
        'DOCX': ['doc', 'docx'],
        'PPT': ['ppt', 'pptx'],
        'VIDEO': ['video', 'mp4']
      };
      const extensions = fileTypeMap[filterFileType] || [];
      filtered = filtered.filter(m =>
        extensions.some(ext => m.fileType.toLowerCase().includes(ext))
      );
    }

    if (filterShared !== null) {
      filtered = filtered.filter(m => m.isShared === filterShared);
    }

    return filtered;
  }, []);

  const clearFilters = useCallback((
    setFilters: (filters: {
      searchQuery: string;
      filterCategory: string;
      filterFileType: string;
      filterShared: boolean | null;
    }) => void
  ) => {
    setFilters({
      searchQuery: '',
      filterCategory: 'all',
      filterFileType: 'all',
      filterShared: null
    });
  }, []);

  const getActiveFilterCount = useCallback((filters: {
    searchQuery: string;
    filterCategory: string;
    filterFileType: string;
    filterShared: boolean | null;
  }): number => {
    const { searchQuery, filterCategory, filterFileType, filterShared } = filters;
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filterCategory !== 'all') count++;
    if (filterFileType !== 'all') count++;
    if (filterShared !== null) count++;
    return count;
  }, []);

  const createMaterial = useCallback(async (materialData: {
    title: string;
    description: string;
    category: string;
    subjectId?: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    folderId?: string;
  }): Promise<void> => {
    const { title, description, category, subjectId, fileUrl, fileType, fileSize, folderId } = materialData;

    const validation = validateMaterialData(materialData);
    if (!validation.isValid) {
      toast.error(ERROR_MESSAGES.VALIDATION_ERROR);
      return;
    }

    if (!fileUrl) {
      toast.error('File harus diunggah terlebih dahulu');
      return;
    }

    const categoryValidation = CategoryValidator.validateSubjectName(category, subjects, materials.map(m => m.category));
    if (!categoryValidation.valid) {
      setCategoryValidation(categoryValidation);
      toast.error(categoryValidation.error || 'Kategori harus dipilih');
      return;
    }

    const newMaterial: Partial<ELibraryType> = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      fileUrl,
      fileType,
      fileSize,
      subjectId,
      folderId,
    };

    try {
      if (!isOnline || isSlow) {
        const actionId = addAction({
          type: 'create',
          entity: 'material',
          entityId: `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          data: newMaterial,
          endpoint: '/api/library',
          method: 'POST',
        });

        const tempMaterial: ELibraryType = {
          ...newMaterial as ELibraryType,
          id: actionId,
          uploadedBy: 'current_user',
          uploadedAt: new Date().toISOString(),
          downloadCount: 0,
          isShared: false,
        };
        setMaterials((prev) => [tempMaterial, ...prev]);

        toast.info(USER_GUIDANCE.SYNCING);
        logger.info('Material upload queued for offline sync', { actionId, title });
        return;
      }

      const createOperation = async () => {
        return await eLibraryAPI.create(newMaterial);
      };

      const result = await executeWithRetry({
        operation: createOperation,
        config: {
          maxRetries: RETRY_CONFIG.DEFAULT_MAX_RETRIES,
          retryDelay: RETRY_CONFIG.DEFAULT_INITIAL_DELAY * 2
        }
      });

      if (result.success && result.data) {
        const uploadResult = result.data as { success: boolean; data: ELibraryType; message?: string };
        if (uploadResult.success && uploadResult.data) {
          setMaterials((prev) => [uploadResult.data, ...prev]);
          toast.success(SUCCESS_MESSAGES.MATERIAL_UPLOADED);

          categoryService.updateMaterialStats([...materials, uploadResult.data]);

          await notifyLibraryUpdate(uploadResult.data.title, uploadResult.data.category);

          await unifiedNotificationManager.showNotification({
            id: `material-${uploadResult.data.id}-${Date.now()}`,
            type: 'library',
            title: 'Materi Baru Tersedia',
            body: `Materi "${uploadResult.data.title}" telah ditambahkan ke perpustakaan`,
            icon: '📚',
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'normal',
            targetRoles: ['student', 'teacher'],
            data: {
              action: 'view_material',
              materialId: uploadResult.data.id,
              category: uploadResult.data.category
            }
          });
        } else {
          toast.error(uploadResult.message || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
      } else {
        toast.error(result.error || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
      }
    } catch (err) {
      if (!isOnline) {
        const queuedMaterial = { ...newMaterial };
        const actionId = addAction({
          type: 'create',
          entity: 'material',
          entityId: `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          data: queuedMaterial,
          endpoint: '/api/library',
          method: 'POST',
        });

        const tempMaterial: ELibraryType = {
          ...queuedMaterial as ELibraryType,
          id: actionId,
          uploadedBy: 'current_user',
          uploadedAt: new Date().toISOString(),
          downloadCount: 0,
          isShared: false,
        };
        setMaterials((prev) => [tempMaterial, ...prev]);

        toast.info(USER_GUIDANCE.SYNCING);
        logger.info('Material upload auto-queued after network failure', { actionId, error: err });
        return;
      }

      logger.error('Error creating material:', err);
      toast.error(API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }, [subjects, materials, isOnline, isSlow, addAction, toast, notifyLibraryUpdate]);

  const deleteMaterial = useCallback(async (material: ELibraryType) => {
    try {
      const deleteOperation = async () => {
        return await eLibraryAPI.delete(material.id);
      };

      const result = await executeWithRetry({
        operation: deleteOperation,
        config: {
          maxRetries: RETRY_CONFIG.DEFAULT_MAX_RETRIES,
          retryDelay: RETRY_CONFIG.DEFAULT_INITIAL_DELAY
        }
      });

      if (result.success) {
        const updatedMaterials = materials.filter((m) => m.id !== material.id);
        setMaterials(updatedMaterials);
        toast.info(SUCCESS_MESSAGES.MATERIAL_DELETED);
        categoryService.updateMaterialStats(updatedMaterials);
      } else {
        toast.error(result.error || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
      }
    } catch (err) {
      logger.error('Error deleting material:', err);
      toast.error(API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }, [materials, toast]);

  return {
    materials,
    subjects,
    loading,
    subjectsLoading,
    error,
    categoryValidation,
    fetchMaterials,
    fetchSubjects,
    createMaterial,
    deleteMaterial,
    setCategoryValidation,
    getFilteredMaterials,
    clearFilters,
    getActiveFilterCount,
  };
}
