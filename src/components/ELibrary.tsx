import React, { useState, useEffect, useCallback } from 'react';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { StarIcon, BookmarkIcon, FunnelIcon } from './icons/MaterialIcons';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { eLibraryAPI, fileStorageAPI } from '../services/apiService';
import { ELibrary as ELibraryType, Subject, Bookmark, Review, ReadingProgress, OCRStatus, OCRProcessingState, SearchOptions } from '../types';
import { useSemanticSearch } from '../hooks/useSemanticSearch';
import { logger } from '../utils/logger';
import { categoryService } from '../services/categoryService';
import { CategoryValidator } from '../utils/categoryValidator';
import { STORAGE_KEYS } from '../constants';
import { ocrService } from '../services/ocrService';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { CardSkeleton } from './ui/Skeleton';
import ErrorMessage from './ui/ErrorMessage';

interface ELibraryProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  userId?: string;
}

const ELibrary: React.FC<ELibraryProps> = ({ onBack, onShowToast }) => {
  const [materials, setMaterials] = useState<ELibraryType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('Semua');
  const [search, setSearch] = useState('');
  
  // Semantic Search State
  const [isSemanticMode, setIsSemanticMode] = useState(false);
  const [showSemanticOptions, setShowSemanticOptions] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Advanced search filters
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
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

  // Semantic search hook
  const semanticSearchHook = useSemanticSearch(materials, {
    includeOCR: searchOptions.includeOCR,
    minRelevanceScore: 0.3,
    maxResults: 20,
    enableQueryExpansion: true,
    includeRelated: true
  });

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
  }, [loadStudentData]);

  // Debounced search for semantic search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Trigger semantic search when debounced search changes
  useEffect(() => {
    if (isSemanticMode && debouncedSearch.trim()) {
      semanticSearchHook.semanticSearch(debouncedSearch);
    } else if (!isSemanticMode) {
      semanticSearchHook.clearSearch();
    }
  }, [debouncedSearch, isSemanticMode, semanticSearchHook]);

  const fetchMaterials = async () => {
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
  };

  const fetchSubjects = async () => {
    try {
      const fetchedSubjects = await categoryService.getSubjects();
      setSubjects(fetchedSubjects);
    } catch (err) {
      logger.error('Error fetching subjects:', err);
    }
  };

  const toggleBookmark = (materialId: string) => {
    const existingBookmark = bookmarks.find(b => b.materialId === materialId);
    let newBookmarks;
    
    if (existingBookmark) {
      newBookmarks = bookmarks.filter(b => b.materialId !== materialId);
      onShowToast('Bookmark dihapus', 'info');
    } else {
      const newBookmark: Bookmark = {
        id: `bookmark_${Date.now()}`,
        materialId,
        userId: 'current_student', // In real app, this would be the actual student ID
        createdAt: new Date().toISOString()
      };
      newBookmarks = [...bookmarks, newBookmark];
      onShowToast('Materi ditambahkan ke bookmark', 'success');
    }
    
    setBookmarks(newBookmarks);
    localStorage.setItem(STORAGE_KEYS.STUDENT_BOOKMARKS, JSON.stringify(newBookmarks));
  };

  const toggleFavorite = (materialId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(materialId)) {
      newFavorites.delete(materialId);
      onShowToast('Dihapus dari favorit', 'info');
    } else {
      newFavorites.add(materialId);
      onShowToast('Ditambahkan ke favorit', 'success');
    }
    setFavorites(newFavorites);
    localStorage.setItem(STORAGE_KEYS.STUDENT_FAVORITES, JSON.stringify(Array.from(newFavorites)));
  };

  const updateReadingProgress = (materialId: string, progress: number, isCompleted: boolean = false) => {
    const newProgress = new Map(readingProgress);
    newProgress.set(materialId, {
      materialId,
      userId: 'current_student',
      currentPosition: progress,
      lastReadAt: new Date().toISOString(),
      readTime: (newProgress.get(materialId)?.readTime || 0) + 1,
      isCompleted
    });
    setReadingProgress(newProgress);
    localStorage.setItem(STORAGE_KEYS.STUDENT_READING_PROGRESS, JSON.stringify(Array.from(newProgress)));
  };

  const toggleOfflineDownload = (materialId: string, _fileUrl: string) => {
    const newOfflineDownloads = new Set(offlineDownloads);
    if (newOfflineDownloads.has(materialId)) {
      newOfflineDownloads.delete(materialId);
      onShowToast('Materi dihapus dari unduhan offline', 'info');
    } else {
      // Simulate offline download (in real app, you'd use Service Workers)
      if ('serviceWorker' in navigator && 'caches' in window) {
        // Register offline download
        newOfflineDownloads.add(materialId);
        setOfflineDownloads(newOfflineDownloads);
        localStorage.setItem(STORAGE_KEYS.STUDENT_OFFLINE_DOWNLOADS, JSON.stringify(Array.from(newOfflineDownloads)));
        onShowToast('Materi tersedia untuk akses offline', 'success');
      } else {
        onShowToast('Browser tidak mendukung akses offline', 'error');
      }
    }
  };

  const openRatingModal = (material: ELibraryType) => {
    setSelectedMaterialForRating(material);
    setUserRating(0);
    setUserReview('');
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (!selectedMaterialForRating || userRating === 0) {
      onShowToast('Pilih rating terlebih dahulu', 'error');
      return;
    }

    const newReview: Review = {
      id: `review_${Date.now()}`,
      materialId: selectedMaterialForRating.id,
      userId: 'current_student',
      rating: userRating,
      comment: userReview,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    localStorage.setItem(STORAGE_KEYS.STUDENT_REVIEWS, JSON.stringify(updatedReviews));

    // Update material rating (in real app, this would be saved to server)
    onShowToast('Review berhasil ditambahkan!', 'success');
    setShowRatingModal(false);
    
    // Simulate updating material average rating
    // In real implementation, this would be handled by the API
    setTimeout(() => {
      onShowToast('Terima kasih atas review Anda!', 'info');
    }, 1000);
  };

  const getSubjectName = (material: ELibraryType): string => {
    // If material has subjectId, use it to fetch the actual subject name
    if (material.subjectId) {
      const subject = subjects.find(s => s.id === material.subjectId);
      if (subject) {
        return subject.name;
      }
    }
    // Fallback to category for backwards compatibility
    return material.category || 'Umum';
  };

  const getSubjectStats = () => {
    return CategoryValidator.getCategoryStatistics(subjects, materials);
  };

  const getFileType = (fileType: string): 'PDF' | 'DOCX' | 'PPT' | 'VIDEO' => {
    if (fileType.toLowerCase().includes('pdf')) return 'PDF';
    if (fileType.toLowerCase().includes('doc')) return 'DOCX';
    if (fileType.toLowerCase().includes('ppt')) return 'PPT';
    if (fileType.toLowerCase().includes('video') || fileType.toLowerCase().includes('mp4')) return 'VIDEO';
    return 'PDF';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getAvailableSubjects = (): string[] => {
    // Combine subjects from API and existing categories for backwards compatibility
    const subjectNames = subjects.map(s => s.name);
    const categoryNames = materials.map(m => m.category).filter(Boolean);
    const allSubjects = ['Semua', ...Array.from(new Set([...subjectNames, ...categoryNames]))];
    return allSubjects.sort();
  };

  const getSubjectWithCount = (subjectName: string): string => {
    if (subjectName === 'Semua') {
      return `Semua (${materials.length})`;
    }
    
    const count = materials.filter(m => getSubjectName(m) === subjectName).length;
    return `${subjectName} (${count})`;
  };

  const filteredMaterials = (() => {
    // Use semantic search results when in semantic mode and there are results
    if (isSemanticMode && semanticSearchHook.searchResults.length > 0) {
      const semanticResultMaterials = semanticSearchHook.searchResults.map(result => result.material);
      
      return semanticResultMaterials.filter((m) => {
        const matchSubject = filterSubject === 'Semua' || getSubjectName(m) === filterSubject;
        const matchTeacher = !filterTeacher || m.uploadedBy.toLowerCase().includes(filterTeacher.toLowerCase());
        const matchFavorites = !showOnlyFavorites || favorites.has(m.id);
        const matchRating = filterRating === 0 || (m.averageRating && m.averageRating >= filterRating);
        
        // Date range filter
        const materialDate = new Date(m.uploadedAt);
        const now = new Date();
        let matchDate = true;
        if (filterDateRange === 'week') {
          matchDate = materialDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (filterDateRange === 'month') {
          matchDate = materialDate >= new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (filterDateRange === 'semester') {
          matchDate = materialDate >= new Date(now.getFullYear(), 0, 1);
        }
        
        return matchSubject && matchTeacher && matchFavorites && matchRating && matchDate;
      }).sort((a, b) => {
        // Preserve semantic search order when in semantic mode
        const aIndex = semanticSearchHook.searchResults.findIndex(r => r.material.id === a.id);
        const bIndex = semanticSearchHook.searchResults.findIndex(r => r.material.id === b.id);
        
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex; // Keep semantic order
        }
        
        // Fall back to regular sorting for unranked items
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'date':
            return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
          case 'rating':
            return (b.averageRating || 0) - (a.averageRating || 0);
          case 'downloads':
            return b.downloadCount - a.downloadCount;
          default:
            return 0;
        }
      });
    }
    
    // Traditional search/filter logic
    return materials.filter((m) => {
      const matchSubject = filterSubject === 'Semua' || getSubjectName(m) === filterSubject;
      
      // Enhanced search with OCR support
      let matchSearch = false;
      if (search.trim()) {
        const lowerQuery = search.toLowerCase();
        
        // Search in metadata
        const inMetadata = 
          m.title.toLowerCase().includes(lowerQuery) ||
          m.description?.toLowerCase().includes(lowerQuery) ||
          m.category.toLowerCase().includes(lowerQuery);

        // Search in OCR text if enabled and available
        const inOCR = searchOptions.includeOCR && 
                       m.ocrStatus === 'completed' && 
                       (m.isSearchable === true) &&
                       m.ocrText?.toLowerCase().includes(lowerQuery);

        matchSearch = Boolean(inMetadata || inOCR);
      } else {
        matchSearch = true; // No search query = match all
      }
      
      // Advanced filters
      const matchTeacher = !filterTeacher || m.uploadedBy.toLowerCase().includes(filterTeacher.toLowerCase());
      const matchFavorites = !showOnlyFavorites || favorites.has(m.id);
      const matchRating = filterRating === 0 || (m.averageRating && m.averageRating >= filterRating);
      
      // Date range filter
      const materialDate = new Date(m.uploadedAt);
      const now = new Date();
      let matchDate = true;
      if (filterDateRange === 'week') {
        matchDate = materialDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (filterDateRange === 'month') {
        matchDate = materialDate >= new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (filterDateRange === 'semester') {
        matchDate = materialDate >= new Date(now.getFullYear(), 0, 1);
      }
      
      return matchSubject && matchSearch && matchTeacher && matchFavorites && matchRating && matchDate;
    }).sort((a, b) => {
      // Sorting logic
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'downloads':
          return b.downloadCount - a.downloadCount;
        default:
          return 0;
      }
    });
  })();

  const handleDownload = async (material: ELibraryType) => {
    onShowToast(`Mulai mengunduh "${material.title}"...`, 'success');

    try {
      await eLibraryAPI.incrementDownloadCount(material.id);

      // Update reading progress when downloading
      const currentProgress = readingProgress.get(material.id);
      if (currentProgress && !currentProgress.isCompleted) {
        updateReadingProgress(material.id, Math.min(currentProgress.currentPosition + 0.1, 1));
      } else if (!currentProgress) {
        updateReadingProgress(material.id, 0.1);
      }

      const downloadUrl = fileStorageAPI.getDownloadUrl(material.fileUrl);
      window.open(downloadUrl, '_blank');
    } catch (err) {
      logger.error('Error downloading file:', err);
      onShowToast('Gagal mengunduh file', 'error');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Kembali ke Portal
            </Button>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">E-Library & Materi</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Kembali ke Portal
            </Button>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">E-Library & Materi</h2>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <ErrorMessage 
            title="Error Loading Materials" 
            message={error} 
            variant="card" 
          />
          <Button
            onClick={fetchMaterials}
            variant="danger"
            size="sm"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  // OCR Integration Functions
  const initializeOCR = async (): Promise<void> => {
    try {
      await ocrService.initialize((progress) => {
        logger.debug('OCR initialization progress:', progress);
      });
    } catch (error) {
      logger.error('OCR initialization failed:', error);
      onShowToast('Gagal menginisialisasi OCR', 'error');
    }
  };

  const processDocumentOCR = async (material: ELibraryType): Promise<void> => {
    if (!ocrEnabled) {
      onShowToast('Fitur OCR tidak diaktifkan', 'info');
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

      // Calculate confidence-based searchable status
      const isSearchable = (result.confidence || 0) >= 50;
      const ocrText = result.text.trim();

      // Update material with OCR results
      const updatedMaterial = {
        ...material,
        ocrStatus: 'completed' as OCRStatus,
        ocrProgress: 100,
        ocrText,
        ocrConfidence: result.confidence,
        ocrProcessedAt: new Date().toISOString(),
        isSearchable
      };

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

      onShowToast(
        `Dokumen "${material.title}" berhasil diproses${isSearchable ? ' dan dapat dicari' : ' (rendah keyakinan)'}`, 
        'success'
      );
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
      
      onShowToast(`Gagal memproses dokumen "${material.title}"`, 'error');
    }
  };

  const batchProcessOCR = async (materialIds: string[]): Promise<void> => {
    if (!ocrEnabled) {
      onShowToast('Fitur OCR tidak diaktifkan', 'info');
      return;
    }

    let processed = 0;
    let failed = 0;

    onShowToast(`Memproses ${materialIds.length} dokumen...`, 'info');

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

    onShowToast(
      `Selesai: ${processed} berhasil, ${failed} gagal`, 
      failed > 0 ? 'error' : 'success'
    );
  };

  const toggleOCRForMaterial = async (materialId: string): Promise<void> => {
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
  };

  const processSelectedOCR = async (): Promise<void> => {
    if (selectedForOCR.size === 0) {
      onShowToast('Pilih minimal satu dokumen untuk diproses', 'info');
      return;
    }

    await batchProcessOCR(Array.from(selectedForOCR));
    setSelectedForOCR(new Set());
  };

  const enableOCR = (): void => {
    setOcrEnabled(true);
    localStorage.setItem(STORAGE_KEYS.MATERIALS_OCR_ENABLED, 'true');
    initializeOCR();
    onShowToast('Fitur OCR diaktifkan', 'success');
  };

  const disableOCR = (): void => {
    setOcrEnabled(false);
    localStorage.setItem(STORAGE_KEYS.MATERIALS_OCR_ENABLED, 'false');
    onShowToast('Fitur OCR dinonaktifkan', 'info');
  };

  

  const availableSubjects = getAvailableSubjects();
  const subjectStats = getSubjectStats();

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
            ← Kembali ke Portal
          </Button>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">E-Library & Materi</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Akses modul pembelajaran dan tugas digital.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder={isSemanticMode ? "Cari dengan AI..." : "Cari materi..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full md:w-48 px-4 py-2 rounded-full border ${
              isSemanticMode 
                ? 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 focus:ring-purple-500' 
                : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus:ring-green-500'
            } text-neutral-900 dark:text-white focus:ring-2 focus:outline-none`}
          />
          <Button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            variant={showAdvancedSearch ? 'success' : 'secondary'}
            size="md"
            className="p-2"
            aria-label="Pencarian lanjutan"
          >
            <FunnelIcon className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            variant={showOnlyFavorites ? 'info' : 'secondary'}
            size="md"
            className="p-2"
            aria-label="Tampilkan hanya favorit"
          >
            <StarIcon className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => setIsSemanticMode(!isSemanticMode)}
            variant={isSemanticMode ? 'success' : 'secondary'}
            size="md"
            className="p-2"
            aria-label="Pencarian semantik AI"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {isSemanticMode ? '🧠' : '🔍'}
            </div>
          </Button>
          <Button
            onClick={() => setShowSemanticOptions(!showSemanticOptions)}
            variant={showSemanticOptions ? 'success' : 'secondary'}
            size="md"
            className="p-2"
            aria-label="Opsi pencarian semantik"
          >
            <div className="w-5 h-5 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
              ⚙️
            </div>
          </Button>
          <Button
            onClick={() => setShowOCROptions(!showOCROptions)}
            variant={showOCROptions || ocrEnabled ? 'primary' : 'secondary'}
            size="md"
            className="p-2"
            aria-label="Pengaturan OCR"
          >
            <div className="w-5 h-5 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
              <DocumentTextIcon />
            </div>
          </Button>
        </div>
      </div>

      {/* Advanced Search Panel */}
      {showAdvancedSearch && (
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 mb-6 border border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Teacher Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Guru Pengupload
              </label>
              <input
                type="text"
                placeholder="Nama guru..."
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Rentang Waktu
              </label>
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value as 'all' | 'week' | 'month' | 'semester')}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="all">Semua Waktu</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
                <option value="semester">Semester Ini</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Rating Minimal
              </label>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`p-1.5 rounded transition-colors ${
                      filterRating === rating
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-600'
                    }`}
                  >
                    {rating === 0 ? 'Semua' : '★'.repeat(rating)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Urutkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'title' | 'date' | 'rating' | 'downloads')}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="date">Terbaru</option>
                <option value="title">Judul</option>
                <option value="rating">Rating</option>
                <option value="downloads">Terpopuler</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                setFilterTeacher('');
                setFilterDateRange('all');
                setFilterRating(0);
                setSortBy('date');
              }}
              variant="ghost"
              size="sm"
            >
              Hapus Filter
            </Button>
          </div>
        </div>
      )}

      {/* OCR Options Panel */}
      {showOCROptions && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-6 border border-purple-200 dark:border-purple-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Pengaturan OCR</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* OCR Status */}
            <div>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Status OCR</h4>
              <div className="space-y-2">
                {!ocrEnabled ? (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-neutral-400 rounded-full"></div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">OCR dinonaktifkan</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 dark:text-green-400">OCR aktif</span>
                  </div>
                )}
                
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  {materials.filter(m => m.ocrStatus === 'completed').length} dari {materials.length} dokumen diproses
                </div>
              </div>
            </div>

            {/* OCR Controls */}
            <div>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Kontrol</h4>
              <div className="space-y-2">
                {ocrEnabled ? (
                  <Button
                    onClick={disableOCR}
                    variant="danger"
                    size="sm"
                    fullWidth
                  >
                    Nonaktifkan OCR
                  </Button>
                ) : (
                  <Button
                    onClick={enableOCR}
                    variant="success"
                    size="sm"
                    fullWidth
                  >
                    Aktifkan OCR
                  </Button>
                )}
                
                {ocrEnabled && (
                  <>
                    <Button
                      onClick={() => batchProcessOCR(materials.filter(m => m.ocrStatus !== 'completed').map(m => m.id))}
                      disabled={!ocrEnabled || materials.filter(m => m.ocrStatus !== 'completed').length === 0}
                      variant="primary"
                      size="sm"
                      fullWidth
                    >
                      Proses Semua ({materials.filter(m => m.ocrStatus !== 'completed').length})
                    </Button>
                    
                    <Button
                      onClick={processSelectedOCR}
                      disabled={selectedForOCR.size === 0}
                      variant="info"
                      size="sm"
                      fullWidth
                    >
                      Proses Dipilih ({selectedForOCR.size})
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Search Settings */}
            <div>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Pencarian</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={searchOptions.includeOCR}
                    onChange={(e) => setSearchOptions(prev => ({ ...prev, includeOCR: e.target.checked }))}
                    className="w-4 h-4 rounded border-neutral-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Sertakan teks OCR</span>
                </label>
                
                <div>
                  <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                    Keyakinan minimum: {searchOptions.minConfidence}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={searchOptions.minConfidence}
                    onChange={(e) => setSearchOptions(prev => ({ ...prev, minConfidence: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
</div>
       )}

      {/* Semantic Search Options Panel */}
      {showSemanticOptions && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 mb-6 border border-purple-200 dark:border-purple-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">🧠 Pencarian Semantik AI</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Status */}
            <div>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Status Pencarian</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isSemanticMode ? 'bg-green-500' : 'bg-neutral-400'}`}></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {isSemanticMode ? 'Pencarian AI Aktif' : 'Pencarian Normal'}
                  </span>
                </div>
                
                {semanticSearchHook.isSearching && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-600 dark:text-blue-400">Menganalisis dengan AI...</span>
                  </div>
                )}
                
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  {isSemanticMode && semanticSearchHook.searchResults.length > 0 
                    ? `${semanticSearchHook.searchResults.length} hasil ditemukan dengan AI`
                    : isSemanticMode 
                    ? 'Masukkan query untuk mencari dengan AI'
                    : 'Gunakan pencarian normal atau aktifkan AI'
                  }
                </div>
              </div>
            </div>

            {/* AI Search Controls */}
            <div>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Kontrol Pencarian AI</h4>
              <div className="space-y-2">
                <Button
                  onClick={() => setIsSemanticMode(!isSemanticMode)}
                  variant={isSemanticMode ? 'danger' : 'success'}
                  size="sm"
                  fullWidth
                >
                  {isSemanticMode ? 'Nonaktifkan Pencarian AI' : 'Aktifkan Pencarian AI'}
                </Button>
                
                {semanticSearchHook.error && (
                  <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    ⚠️ {semanticSearchHook.error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Suggestions */}
          {isSemanticMode && semanticSearchHook.suggestedQueries.length > 0 && (
            <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Saran Pencarian</h4>
              <div className="flex flex-wrap gap-2">
                {semanticSearchHook.suggestedQueries.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setSearch(suggestion)}
                    className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded-full text-xs hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results Info */}
          {isSemanticMode && semanticSearchHook.searchResults.length > 0 && (
            <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Hasil Pencarian Semantik</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {semanticSearchHook.searchResults.slice(0, 3).map((result, index) => (
                  <div key={index} className="flex items-center justify-between text-xs bg-white dark:bg-neutral-800 p-2 rounded">
                    <div className="flex-1">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {result.material.title}
                      </span>
                      <div className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Relevansi: {Math.round(result.relevanceScore * 100)}% - {result.relevanceReason}
                      </div>
                    </div>
                    <div className="ml-2 text-purple-600 dark:text-purple-400">
                      {Math.round(result.relevanceScore * 100)}%
                    </div>
                  </div>
                ))}
                {semanticSearchHook.searchResults.length > 3 && (
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                    +{semanticSearchHook.searchResults.length - 3} hasil lainnya
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
          {availableSubjects.map((subject) => (
            <Button
              key={subject}
              onClick={() => setFilterSubject(subject)}
              variant={filterSubject === subject ? 'primary' : 'ghost'}
              size="sm"
              className={`whitespace-nowrap ${filterSubject === subject ? '' : 'text-neutral-600 dark:text-neutral-300'}`}
            >
              {getSubjectWithCount(subject)}
            </Button>
          ))}
        </div>
        
        {subjectStats.length > 0 && (
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg px-4 py-2">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Statistik Materi</div>
            <div className="flex flex-wrap gap-2">
              {subjectStats.slice(0, 3).map((stat) => (
                <div key={stat.subject.id} className="text-xs">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {stat.subject.name}:
                  </span>
                  <span className="ml-1 text-neutral-600 dark:text-neutral-400">
                    {stat.materialCount}
                  </span>
                </div>
              ))}
              {subjectStats.length > 3 && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  +{subjectStats.length - 3} lainnya
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-all hover:-translate-y-1 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-xl ${
                    getFileType(item.fileType) === 'PDF'
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20'
                      : getFileType(item.fileType) === 'DOCX'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                      : getFileType(item.fileType) === 'PPT'
                      ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
                      : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'
                  }`}
                >
                  <DocumentTextIcon />
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => toggleBookmark(item.id)}
                    variant={bookmarks.some(b => b.materialId === item.id) ? 'info' : 'ghost'}
                    size="sm"
                    className="p-1.5"
                    aria-label="Bookmark"
                  >
                    <BookmarkIcon className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={() => toggleFavorite(item.id)}
                    variant={favorites.has(item.id) ? 'info' : 'ghost'}
                    size="sm"
                    className="p-1.5"
                    aria-label="Favorit"
                  >
                    <StarIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-neutral-900 dark:text-white line-clamp-2 mb-2 flex-grow">
                {item.title}
              </h3>

              {/* Semantic Search Information */}
              {isSemanticMode && semanticSearchHook.searchResults.length > 0 && (() => {
                const semanticResult = semanticSearchHook.searchResults.find(r => r.material.id === item.id);
                if (semanticResult) {
                  return (
                    <div className="mb-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                          🧠 Relevansi AI
                        </span>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                          {Math.round(semanticResult.relevanceScore * 100)}%
                        </span>
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        {semanticResult.relevanceReason}
                      </div>
                      {semanticResult.matchedConcepts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {semanticResult.matchedConcepts.slice(0, 3).map((concept, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded text-xs">
                              {concept}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              <div className="text-sm text-neutral-500 dark:text-neutral-400 space-y-2 mb-4">
                <p>
                  Mapel:{' '}
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {getSubjectName(item)}
                  </span>
                  {item.subjectId && (
                    <Badge variant="success" size="sm">
                      ✓ Valid
                    </Badge>
                  )}
                </p>
                <p className="text-xs">
                  Diunggah: {new Date(item.uploadedAt).toLocaleDateString('id-ID')}
                </p>
                <div className="flex justify-between text-xs">
                  <span>{formatFileSize(item.fileSize)}</span>
                  <span>{item.downloadCount} unduhan</span>
                </div>
                
                {/* Rating Display */}
                {item.averageRating && (
                  <div className="flex items-center gap-1">
                    <div className="flex text-yellow-500">
                      {'★'.repeat(Math.floor(item.averageRating))}{'☆'.repeat(5 - Math.floor(item.averageRating))}
                    </div>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      {item.averageRating.toFixed(1)} ({item.totalReviews || 0})
                    </span>
                  </div>
                )}
                
                {/* Reading Progress */}
                {readingProgress.has(item.id) && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600 dark:text-blue-400">Progress Baca</span>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {Math.round((readingProgress.get(item.id)?.currentPosition || 0) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(readingProgress.get(item.id)?.currentPosition || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* OCR Status */}
                {ocrEnabled && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-600 dark:text-neutral-400">OCR</span>
                      {ocrProcessing.has(item.id) && (
                        <span className="text-blue-600 dark:text-blue-400">
                          {ocrProcessing.get(item.id)?.progress || 0}%
                        </span>
                      )}
                    </div>
                    
                    {/* OCR Status Display */}
                    {ocrProcessing.has(item.id) ? (
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${ocrProcessing.get(item.id)?.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          Memproses...
                        </span>
                      </div>
                    ) : item.ocrStatus === 'completed' ? (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${
                          item.isSearchable 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          ✓ {item.ocrConfidence}% keyakinan
                        </span>
                        {item.isSearchable && (
                          <span className="text-xs text-purple-600 dark:text-purple-400">
                            ( dapat dicari )
                          </span>
                        )}
                      </div>
                    ) : item.ocrStatus === 'failed' ? (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        ✗ Gagal diproses
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">
                        Belum diproses
                      </span>
                    )}
                  </div>
                )}
              </div>

              {ocrEnabled && (
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => toggleOCRForMaterial(item.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedForOCR.has(item.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                    disabled={ocrProcessing.has(item.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedForOCR.has(item.id)}
                      onChange={() => {}}
                      className="w-3 h-3 rounded border-neutral-300"
                      readOnly
                    />
                    {selectedForOCR.has(item.id) ? 'Dipilih' : 'Pilih'}
                  </button>
                  
                  {item.ocrStatus !== 'processing' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => processDocumentOCR(item)}
                      disabled={ocrProcessing.has(item.id)}
                    >
                      Proses
                    </Button>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(item)}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download
                </Button>
                
                <Button
                  onClick={() => openRatingModal(item)}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  aria-label="Beri rating dan review"
                >
                  <StarIcon className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={() => toggleOfflineDownload(item.id, item.fileUrl)}
                  variant={offlineDownloads.has(item.id) ? 'success' : 'ghost'}
                  size="sm"
                  className="p-2"
                  aria-label={offlineDownloads.has(item.id) ? 'Tersedia offline' : 'Unduh untuk akses offline'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                  </svg>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 mb-4">
              <DocumentTextIcon />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">Tidak ada materi ditemukan untuk filter ini.</p>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedMaterialForRating && (
        <div className="fixed inset-0 bg-black/50% flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Beri Rating dan Review
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                "{selectedMaterialForRating.title}"
              </p>
            </div>

            <div className="p-6">
              {/* Rating Stars */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Rating
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setUserRating(rating)}
                      className="text-3xl transition-colors"
                    >
                      <span className={rating <= userRating ? 'text-yellow-500' : 'text-neutral-300'}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Review (Opsional)
                </label>
                <textarea
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  placeholder="Bagikan pengalaman Anda dengan materi ini..."
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-2">
              <Button
                onClick={() => setShowRatingModal(false)}
                variant="secondary"
                size="sm"
              >
                Batal
              </Button>
              <Button
                onClick={submitRating}
                disabled={userRating === 0}
                variant="success"
                size="sm"
              >
                Kirim Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ELibrary;
