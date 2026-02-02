import { useState, useEffect, useCallback } from 'react';
import { eLibraryAPI } from '../../services/apiService';
import { ELibrary as ELibraryType, Subject, Bookmark, Review, ReadingProgress, OCRStatus, OCRProcessingState, SearchOptions, PlagiarismFlag } from '../../types';
import { STORAGE_KEYS } from '../../constants';
import { categoryService } from '../../services/categoryService';
import { CategoryValidator } from '../../utils/categoryValidator';
import { ocrService } from '../../services/ocrService';
import { generateTextSummary, compareTextsForSimilarity } from '../../services/ocrEnhancementService';
import { logger } from '../../utils/logger';

export interface UseELibraryDataProps {
  userId?: string;
}

export interface UseELibraryDataReturn {
  // State
  materials: ELibraryType[];
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  filterSubject: string;
  search: string;
  isSemanticMode: boolean;
  showAdvancedSearch: boolean;
  filterTeacher: string;
  filterDateRange: 'all' | 'week' | 'month' | 'semester';
  filterRating: number;
  sortBy: 'title' | 'date' | 'rating' | 'downloads';
  bookmarks: Bookmark[];
  favorites: Set<string>;
  showOnlyFavorites: boolean;
  readingProgress: Map<string, ReadingProgress>;
  offlineDownloads: Set<string>;
  showRatingModal: boolean;
  selectedMaterialForRating: ELibraryType | null;
  userRating: number;
  userReview: string;
  reviews: Review[];
  showVoiceHelp: boolean;
  ocrProcessing: Map<string, OCRProcessingState>;
  selectedForOCR: Set<string>;
  showOCROptions: boolean;
  ocrEnabled: boolean;
  searchOptions: SearchOptions;
  semanticSearchResults: any[];
  
  // Setters
  setMaterials: React.Dispatch<React.SetStateAction<ELibraryType[]>>;
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setFilterSubject: React.Dispatch<React.SetStateAction<string>>;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setIsSemanticMode: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAdvancedSearch: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterTeacher: React.Dispatch<React.SetStateAction<string>>;
  setFilterDateRange: React.Dispatch<React.SetStateAction<'all' | 'week' | 'month' | 'semester'>>;
  setFilterRating: React.Dispatch<React.SetStateAction<number>>;
  setSortBy: React.Dispatch<React.SetStateAction<'title' | 'date' | 'rating' | 'downloads'>>;
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
  setShowOnlyFavorites: React.Dispatch<React.SetStateAction<boolean>>;
  setReadingProgress: React.Dispatch<React.SetStateAction<Map<string, ReadingProgress>>>;
  setOfflineDownloads: React.Dispatch<React.SetStateAction<Set<string>>>;
  setShowRatingModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedMaterialForRating: React.Dispatch<React.SetStateAction<ELibraryType | null>>;
  setUserRating: React.Dispatch<React.SetStateAction<number>>;
  setUserReview: React.Dispatch<React.SetStateAction<string>>;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  setShowVoiceHelp: React.Dispatch<React.SetStateAction<boolean>>;
  setOcrProcessing: React.Dispatch<React.SetStateAction<Map<string, OCRProcessingState>>>;
  setSelectedForOCR: React.Dispatch<React.SetStateAction<Set<string>>>;
  setShowOCROptions: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  
  // Data Functions
  fetchMaterials: () => Promise<void>;
  fetchSubjects: () => Promise<void>;
  loadStudentData: () => void;
  toggleBookmark: (materialId: string) => void;
  toggleFavorite: (materialId: string) => void;
  updateReadingProgress: (materialId: string, progress: number, isCompleted?: boolean) => void;
  toggleOfflineDownload: (materialId: string, fileUrl: string) => void;
  openRatingModal: (material: ELibraryType) => void;
  submitRating: () => void;
  getSubjectName: (material: ELibraryType) => string;
  getSubjectStats: () => any[];
  getFileType: (fileType: string) => 'PDF' | 'DOCX' | 'PPT' | 'VIDEO';
  formatFileSize: (bytes: number) => string;
  getAvailableSubjects: () => string[];
  getSubjectWithCount: (subjectName: string) => string;
  handleDownload: (material: ELibraryType) => Promise<void>;
  
  // OCR Functions
  initializeOCR: () => Promise<void>;
  processDocumentOCR: (material: ELibraryType) => Promise<void>;
  batchProcessOCR: (materialIds: string[]) => Promise<void>;
  toggleOCRForMaterial: (materialId: string) => Promise<void>;
  processSelectedOCR: () => Promise<void>;
  enableOCR: () => void;
  disableOCR: () => void;
}

export const useELibraryData = ({ userId = 'current_student' }: UseELibraryDataProps = {}): UseELibraryDataReturn => {
  const [materials, setMaterials] = useState<ELibraryType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('Semua');
  const [search, setSearch] = useState('');
  
  // Semantic Search State
  const [isSemanticMode, setIsSemanticMode] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  // Advanced search filters
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'week' | 'month' | 'semester'>('all');
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'rating' | 'downloads'>('date');
  
  // Student features
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [readingProgress, setReadingProgress] = useState<Map<string, ReadingProgress>>(new Map());
  const [offlineDownloads, setOfflineDownloads] = useState<Set<string>>(new Set());
  
  // Rating system
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedMaterialForRating, setSelectedMaterialForRating] = useState<ELibraryType | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);

  // Voice commands help
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);

  // OCR Integration State
  const [ocrProcessing, setOcrProcessing] = useState<Map<string, OCRProcessingState>>(new Map());
  const [selectedForOCR, setSelectedForOCR] = useState<Set<string>>(new Set());
  const [showOCROptions, setShowOCROptions] = useState(false);
  const [ocrEnabled, setOcrEnabled] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.MATERIALS_OCR_ENABLED) === 'true';
  });
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    includeOCR: true,
    minConfidence: 50
  });

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eLibraryAPI.getAll();
      if (response.success && response.data) {
        setMaterials(response.data);
        // Update material statistics for category service
        categoryService.updateMaterialStats(response.data);
      } else {
        setError(response.message || 'Gagal mengambil data materi');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data materi');
      logger.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const fetchedSubjects = await categoryService.getSubjects();
      setSubjects(fetchedSubjects);
    } catch (err) {
      logger.error('Error fetching subjects:', err);
    }
  }, []);

  const loadStudentData = useCallback(() => {
    // Load bookmarks from localStorage
    try {
      const savedBookmarks = localStorage.getItem(STORAGE_KEYS.STUDENT_BOOKMARKS);
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
      
      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem(STORAGE_KEYS.STUDENT_FAVORITES);
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }
      
      // Load reading progress from localStorage
      const savedProgress = localStorage.getItem(STORAGE_KEYS.STUDENT_READING_PROGRESS);
      if (savedProgress) {
        setReadingProgress(new Map(JSON.parse(savedProgress)));
      }
      
      // Load offline downloads from localStorage
      const savedOffline = localStorage.getItem(STORAGE_KEYS.STUDENT_OFFLINE_DOWNLOADS);
      if (savedOffline) {
        setOfflineDownloads(new Set(JSON.parse(savedOffline)));
      }
      
      // Load reviews from localStorage
      const savedReviews = localStorage.getItem(STORAGE_KEYS.STUDENT_REVIEWS);
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      }
    } catch (err) {
      logger.error('Error loading student data:', err);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
    fetchSubjects();
    loadStudentData();
  }, [fetchMaterials, fetchSubjects, loadStudentData]);

  const toggleBookmark = useCallback((materialId: string) => {
    const existingBookmark = bookmarks.find(b => b.materialId === materialId);
    let newBookmarks;
    
    if (existingBookmark) {
      newBookmarks = bookmarks.filter(b => b.materialId !== materialId);
    } else {
      const newBookmark: Bookmark = {
        id: `bookmark_${Date.now()}`,
        materialId,
        userId,
        createdAt: new Date().toISOString()
      };
      newBookmarks = [...bookmarks, newBookmark];
    }
    
    setBookmarks(newBookmarks);
    localStorage.setItem(STORAGE_KEYS.STUDENT_BOOKMARKS, JSON.stringify(newBookmarks));
  }, [bookmarks, userId]);

  const toggleFavorite = useCallback((materialId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(materialId)) {
      newFavorites.delete(materialId);
    } else {
      newFavorites.add(materialId);
    }
    setFavorites(newFavorites);
    localStorage.setItem(STORAGE_KEYS.STUDENT_FAVORITES, JSON.stringify(Array.from(newFavorites)));
  }, [favorites]);

  const updateReadingProgress = useCallback((materialId: string, progress: number, isCompleted: boolean = false) => {
    const newProgress = new Map(readingProgress);
    newProgress.set(materialId, {
      materialId,
      userId,
      currentPosition: progress,
      lastReadAt: new Date().toISOString(),
      readTime: (newProgress.get(materialId)?.readTime || 0) + 1,
      isCompleted
    });
    setReadingProgress(newProgress);
    localStorage.setItem(STORAGE_KEYS.STUDENT_READING_PROGRESS, JSON.stringify(Array.from(newProgress)));
  }, [readingProgress, userId]);

  const toggleOfflineDownload = useCallback((materialId: string, fileUrl: string) => {
    const newOfflineDownloads = new Set(offlineDownloads);
    if (newOfflineDownloads.has(materialId)) {
      newOfflineDownloads.delete(materialId);
    } else {
      // Simulate offline download (in real app, you'd use Service Workers)
      if ('serviceWorker' in navigator && 'caches' in window) {
        // Register offline download
        newOfflineDownloads.add(materialId);
        setOfflineDownloads(newOfflineDownloads);
        localStorage.setItem(STORAGE_KEYS.STUDENT_OFFLINE_DOWNLOADS, JSON.stringify(Array.from(newOfflineDownloads)));
      }
    }
  }, [offlineDownloads]);

  const openRatingModal = useCallback((material: ELibraryType) => {
    setSelectedMaterialForRating(material);
    setUserRating(0);
    setUserReview('');
    setShowRatingModal(true);
  }, []);

  const submitRating = useCallback(() => {
    if (!selectedMaterialForRating || userRating === 0) {
      return;
    }

    const newReview: Review = {
      id: `review_${Date.now()}`,
      materialId: selectedMaterialForRating.id,
      userId,
      rating: userRating,
      comment: userReview,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    localStorage.setItem(STORAGE_KEYS.STUDENT_REVIEWS, JSON.stringify(updatedReviews));
    setShowRatingModal(false);
  }, [selectedMaterialForRating, userRating, userReview, reviews, userId]);

  const getSubjectName = useCallback((material: ELibraryType): string => {
    // If material has subjectId, use it to fetch actual subject name
    if (material.subjectId) {
      const subject = subjects.find(s => s.id === material.subjectId);
      if (subject) {
        return subject.name;
      }
    }
    // Fallback to category for backwards compatibility
    return material.category || 'Umum';
  }, [subjects]);

  const getSubjectStats = useCallback(() => {
    return CategoryValidator.getCategoryStatistics(subjects, materials);
  }, [subjects, materials]);

  const getFileType = useCallback((fileType: string): 'PDF' | 'DOCX' | 'PPT' | 'VIDEO' => {
    if (fileType.toLowerCase().includes('pdf')) return 'PDF';
    if (fileType.toLowerCase().includes('doc')) return 'DOCX';
    if (fileType.toLowerCase().includes('ppt')) return 'PPT';
    if (fileType.toLowerCase().includes('video') || fileType.toLowerCase().includes('mp4')) return 'VIDEO';
    return 'PDF';
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }, []);

  const getAvailableSubjects = useCallback((): string[] => {
    // Combine subjects from API and existing categories for backwards compatibility
    const subjectNames = subjects.map(s => s.name);
    const categoryNames = materials.map(m => m.category).filter(Boolean);
    const allSubjects = ['Semua', ...Array.from(new Set([...subjectNames, ...categoryNames]))];
    return allSubjects.sort();
  }, [subjects, materials]);

  const getSubjectWithCount = useCallback((subjectName: string): string => {
    if (subjectName === 'Semua') {
      return `Semua (${materials.length})`;
    }
    
    const count = materials.filter(m => getSubjectName(m) === subjectName).length;
    return `${subjectName} (${count})`;
  }, [materials, getSubjectName]);

  const handleDownload = useCallback(async (material: ELibraryType) => {
    try {
      await eLibraryAPI.incrementDownloadCount(material.id);

      // Update reading progress when downloading
      const currentProgress = readingProgress.get(material.id);
      if (currentProgress && !currentProgress.isCompleted) {
        updateReadingProgress(material.id, Math.min(currentProgress.currentPosition + 0.1, 1));
      } else if (!currentProgress) {
        updateReadingProgress(material.id, 0.1);
      }
    } catch (err) {
      logger.error('Error downloading file:', err);
    }
  }, [readingProgress, updateReadingProgress]);

  // OCR Integration Functions
  const initializeOCR = useCallback(async (): Promise<void> => {
    try {
      await ocrService.initialize((progress) => {
        logger.debug('OCR initialization progress:', progress);
      });
    } catch (error) {
      logger.error('OCR initialization failed:', error);
    }
  }, []);

  const processDocumentOCR = useCallback(async (material: ELibraryType): Promise<void> => {
    if (!ocrEnabled) {
      return;
    }

    try {
      // Update processing state
      const processingState: OCRProcessingState = {
        materialId: material.id,
        status: 'processing',
        progress: 0,
        startTime: new Date()
      };
      
      setOcrProcessing(prev => new Map(prev.set(material.id, processingState)));
      
      // Initialize OCR if not already done
      await initializeOCR();

      // Create file object from file URL
      const response = await fetch(material.fileUrl);
      const blob = await response.blob();
      const file = new File([blob], material.title, { type: material.fileType });

      // Extract text from document
      const result = await ocrService.extractTextFromImage(
        file,
        (progress) => {
          setOcrProcessing(prev => {
            const updated = new Map(prev);
            const existing = updated.get(material.id);
            if (existing) {
              updated.set(material.id, {
                ...existing,
                progress: progress.progress
              });
            }
            return updated;
          });
        }
      );

      // Validate OCR quality before proceeding
      if (!result.quality.hasMeaningfulContent) {
        throw new Error('Dokumen tidak mengandung teks yang bermakna. Pastikan dokumen memiliki teks yang jelas.');
      }

      // Use quality assessment from OCR service
      const ocrText = result.text.trim();
      const isSearchable = result.quality.isSearchable;
      
      if (!isSearchable) {
        logger.warn(`Low quality OCR for material ${material.id}: confidence ${result.confidence}%`);
      }

      // Update material with OCR results
      let updatedMaterial = {
        ...material,
        ocrStatus: 'completed' as OCRStatus,
        ocrProgress: 100,
        ocrText,
        ocrConfidence: result.confidence,
        ocrProcessedAt: new Date().toISOString(),
        isSearchable,
        ocrQuality: result.quality,
        documentType: result.quality.documentType
      };

      // Generate AI summary for academic documents
      if (result.quality.isHighQuality && result.quality.documentType === 'academic') {
        try {
          const summary = await generateTextSummary(ocrText);
          updatedMaterial = {
            ...updatedMaterial,
            aiSummary: summary
          };
          logger.info(`Generated AI summary for material ${material.id}`);
        } catch (error) {
          logger.warn(`Failed to generate AI summary for material ${material.id}:`, error);
        }
      }

      // Check for plagiarism against other materials
      const plagiarismFlags: PlagiarismFlag[] = [];
      if (result.quality.isSearchable) {
        const otherMaterials = materials.filter(m => m.id !== material.id && m.ocrText && m.ocrText.length > 50);
        
        for (const otherMaterial of otherMaterials.slice(0, 5)) {
          try {
            const similarity = await compareTextsForSimilarity(ocrText, otherMaterial.ocrText!);
            if (similarity.isPlagiarized) {
              plagiarismFlags.push({
                materialId: otherMaterial.id,
                similarity: similarity.similarity,
                matchedText: otherMaterial.title,
                details: similarity.details,
                flaggedAt: new Date().toISOString()
              });
            }
          } catch (error) {
            logger.warn(`Failed to compare materials for plagiarism:`, error);
          }
        }
      }

      if (plagiarismFlags.length > 0) {
        updatedMaterial = {
          ...updatedMaterial,
          plagiarismFlags
        };
        logger.warn(`Plagiarism detected for material ${material.id}: ${plagiarismFlags.length} flags`);
      }

      // Update material via API
      await eLibraryAPI.update(material.id, updatedMaterial);
      
      // Update local state
      setMaterials(prev => prev.map(m => 
        m.id === material.id ? updatedMaterial : m
      ));

      // Clear processing state
      setOcrProcessing(prev => {
        const updated = new Map(prev);
        updated.delete(material.id);
        return updated;
      });
    } catch (error) {
      logger.error('OCR processing failed:', error);
      
      // Update with error status
      const errorState: OCRProcessingState = {
        materialId: material.id,
        status: 'failed',
        progress: 0,
        startTime: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setOcrProcessing(prev => new Map(prev.set(material.id, errorState)));
    }
  }, [ocrEnabled, materials, initializeOCR]);

  const batchProcessOCR = useCallback(async (materialIds: string[]): Promise<void> => {
    if (!ocrEnabled) {
      return;
    }

    let processed = 0;
    let failed = 0;

    for (const materialId of materialIds) {
      const material = materials.find(m => m.id === materialId);
      if (material && material.ocrStatus !== 'completed' && material.ocrStatus !== 'processing') {
        try {
          await processDocumentOCR(material);
          processed++;
        } catch (error) {
          logger.error(`Failed to process material ${materialId}:`, error);
          failed++;
        }
      }
    }
  }, [ocrEnabled, materials, processDocumentOCR]);

  const toggleOCRForMaterial = useCallback(async (materialId: string): Promise<void> => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    if (selectedForOCR.has(materialId)) {
      setSelectedForOCR(prev => {
        const updated = new Set(prev);
        updated.delete(materialId);
        return updated;
      });
    } else {
      setSelectedForOCR(prev => new Set(prev).add(materialId));
    }
  }, [materials, selectedForOCR]);

  const processSelectedOCR = useCallback(async (): Promise<void> => {
    if (selectedForOCR.size === 0) {
      return;
    }

    await batchProcessOCR(Array.from(selectedForOCR));
    setSelectedForOCR(new Set());
  }, [selectedForOCR, batchProcessOCR]);

  const enableOCR = useCallback((): void => {
    setOcrEnabled(true);
    localStorage.setItem(STORAGE_KEYS.MATERIALS_OCR_ENABLED, 'true');
    initializeOCR();
  }, [initializeOCR]);

  const disableOCR = useCallback((): void => {
    setOcrEnabled(false);
    localStorage.setItem(STORAGE_KEYS.MATERIALS_OCR_ENABLED, 'false');
  }, []);

  // Placeholder for semantic search results (will be handled by component)
  const [semanticSearchResults, setSemanticSearchResults] = useState<any[]>([]);

  return {
    // State
    materials,
    subjects,
    loading,
    error,
    filterSubject,
    search,
    isSemanticMode,
    showAdvancedSearch,
    filterTeacher,
    filterDateRange,
    filterRating,
    sortBy,
    bookmarks,
    favorites,
    showOnlyFavorites,
    readingProgress,
    offlineDownloads,
    showRatingModal,
    selectedMaterialForRating,
    userRating,
    userReview,
    reviews,
    showVoiceHelp,
    ocrProcessing,
    selectedForOCR,
    showOCROptions,
    ocrEnabled,
    searchOptions,
    semanticSearchResults,
    
    // Setters
    setMaterials,
    setSubjects,
    setLoading,
    setError,
    setFilterSubject,
    setSearch,
    setIsSemanticMode,
    setShowAdvancedSearch,
    setFilterTeacher,
    setFilterDateRange,
    setFilterRating,
    setSortBy,
    setBookmarks,
    setFavorites,
    setShowOnlyFavorites,
    setReadingProgress,
    setOfflineDownloads,
    setShowRatingModal,
    setSelectedMaterialForRating,
    setUserRating,
    setUserReview,
    setReviews,
    setShowVoiceHelp,
    setOcrProcessing,
    setSelectedForOCR,
    setShowOCROptions,
    setSearchOptions,
    
    // Data Functions
    fetchMaterials,
    fetchSubjects,
    loadStudentData,
    toggleBookmark,
    toggleFavorite,
    updateReadingProgress,
    toggleOfflineDownload,
    openRatingModal,
    submitRating,
    getSubjectName,
    getSubjectStats,
    getFileType,
    formatFileSize,
    getAvailableSubjects,
    getSubjectWithCount,
    handleDownload,
    
    // OCR Functions
    initializeOCR,
    processDocumentOCR,
    batchProcessOCR,
    toggleOCRForMaterial,
    processSelectedOCR,
    enableOCR,
    disableOCR
  };
};
