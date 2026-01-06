import React, { useState, useEffect, useCallback } from 'react';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { StarIcon, BookmarkIcon, FunnelIcon } from './icons/MaterialIcons';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { eLibraryAPI, fileStorageAPI } from '../services/apiService';
import { ELibrary as ELibraryType, Subject, Bookmark, Review } from '../types';
import { logger } from '../utils/logger';
import { categoryService } from '../services/categoryService';
import { CategoryValidator } from '../utils/categoryValidator';

interface ELibraryProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ELibrary: React.FC<ELibraryProps> = ({ onBack, onShowToast }) => {
  const [materials, setMaterials] = useState<ELibraryType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('Semua');
  const [search, setSearch] = useState('');
  
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
  const [readingProgress, setReadingProgress] = useState<Map<string, { currentPosition: number; lastReadAt: string; readTime: number; isCompleted: boolean }>>(new Map());
  const [offlineDownloads, setOfflineDownloads] = useState<Set<string>>(new Set());
  
  // Rating system
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedMaterialForRating, setSelectedMaterialForRating] = useState<ELibraryType | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);

  const loadStudentData = useCallback(() => {
    // Load bookmarks from localStorage
    try {
      const savedBookmarks = localStorage.getItem('student_bookmarks');
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
      
      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem('student_favorites');
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }
      
      // Load reading progress from localStorage
      const savedProgress = localStorage.getItem('student_reading_progress');
      if (savedProgress) {
        setReadingProgress(new Map(JSON.parse(savedProgress)));
      }
      
      // Load offline downloads from localStorage
      const savedOffline = localStorage.getItem('student_offline_downloads');
      if (savedOffline) {
        setOfflineDownloads(new Set(JSON.parse(savedOffline)));
      }
      
      // Load reviews from localStorage
      const savedReviews = localStorage.getItem('student_reviews');
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
    localStorage.setItem('student_bookmarks', JSON.stringify(newBookmarks));
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
    localStorage.setItem('student_favorites', JSON.stringify(Array.from(newFavorites)));
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
    localStorage.setItem('student_reading_progress', JSON.stringify(Array.from(newProgress)));
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
        localStorage.setItem('student_offline_downloads', JSON.stringify(Array.from(newOfflineDownloads)));
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
    localStorage.setItem('student_reviews', JSON.stringify(updatedReviews));

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

  const filteredMaterials = materials.filter((m) => {
    const matchSubject = filterSubject === 'Semua' || getSubjectName(m) === filterSubject;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
                       m.description.toLowerCase().includes(search.toLowerCase());
    
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
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
              ← Kembali ke Portal
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">E-Library & Materi</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
              ← Kembali ke Portal
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">E-Library & Materi</h2>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchMaterials}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const availableSubjects = getAvailableSubjects();
  const subjectStats = getSubjectStats();

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
            ← Kembali ke Portal
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">E-Library & Materi</h2>
          <p className="text-gray-500 dark:text-gray-400">Akses modul pembelajaran dan tugas digital.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Cari materi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-48 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className={`p-2 rounded-lg border transition-colors ${
              showAdvancedSearch 
                ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            title="Pencarian lanjutan"
          >
            <FunnelIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`p-2 rounded-lg border transition-colors ${
              showOnlyFavorites 
                ? 'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            title="Tampilkan hanya favorit"
          >
            <StarIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Advanced Search Panel */}
      {showAdvancedSearch && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Teacher Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Guru Pengupload
              </label>
              <input
                type="text"
                placeholder="Nama guru..."
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rentang Waktu
              </label>
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value as 'all' | 'week' | 'month' | 'semester')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="all">Semua Waktu</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
                <option value="semester">Semester Ini</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-gray-600'
                    }`}
                  >
                    {rating === 0 ? 'Semua' : '★'.repeat(rating)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Urutkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'title' | 'date' | 'rating' | 'downloads')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
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
            <button
              onClick={() => {
                setFilterTeacher('');
                setFilterDateRange('all');
                setFilterRating(0);
                setSortBy('date');
              }}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Hapus Filter
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
          {availableSubjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setFilterSubject(subject)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterSubject === subject
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {getSubjectWithCount(subject)}
            </button>
          ))}
        </div>
        
        {subjectStats.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Statistik Materi</div>
            <div className="flex flex-wrap gap-2">
              {subjectStats.slice(0, 3).map((stat) => (
                <div key={stat.subject.id} className="text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {stat.subject.name}:
                  </span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400">
                    {stat.materialCount}
                  </span>
                </div>
              ))}
              {subjectStats.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
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
              className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all hover:-translate-y-1 flex flex-col"
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
                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleBookmark(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      bookmarks.some(b => b.materialId === item.id)
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-gray-600'
                    }`}
                    title="Bookmark"
                  >
                    <BookmarkIcon className="w-4 h-4" />
                  </button>
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      favorites.has(item.id)
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-gray-600'
                    }`}
                    title="Favorit"
                  >
                    <StarIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 flex-grow">
                {item.title}
              </h3>

              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2 mb-4">
                <p>
                  Mapel:{' '}
                  <span className="text-gray-700 dark:text-gray-300">
                    {getSubjectName(item)}
                  </span>
                  {item.subjectId && (
                    <span className="ml-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 px-1.5 py-0.5 rounded">
                      ✓ Valid
                    </span>
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
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {item.averageRating.toFixed(1)} ({item.totalReviews || 0})
                    </span>
                  </div>
                )}
                
                {/* Reading Progress */}
                {readingProgress.has(item.id) && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600 dark:text-blue-400">Progress Baca</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Math.round((readingProgress.get(item.id)?.currentPosition || 0) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(readingProgress.get(item.id)?.currentPosition || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(item)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors font-medium text-sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download
                </button>
                
                {/* Rating Button */}
                <button
                  onClick={() => openRatingModal(item)}
                  className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-gray-600 transition-colors"
                  title="Beri rating dan review"
                >
                  <StarIcon className="w-4 h-4" />
                </button>
                
                {/* Offline Download Button */}
                <button
                  onClick={() => toggleOfflineDownload(item.id, item.fileUrl)}
                  className={`p-2 rounded-lg transition-colors ${
                    offlineDownloads.has(item.id)
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-gray-600'
                  }`}
                  title={offlineDownloads.has(item.id) ? 'Tersedia offline' : 'Unduh untuk akses offline'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <DocumentTextIcon />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Tidak ada materi ditemukan untuk filter ini.</p>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedMaterialForRating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Beri Rating dan Review
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                "{selectedMaterialForRating.title}"
              </p>
            </div>

            <div className="p-6">
              {/* Rating Stars */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Rating
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setUserRating(rating)}
                      className="text-3xl transition-colors"
                    >
                      <span className={rating <= userRating ? 'text-yellow-500' : 'text-gray-300'}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review (Opsional)
                </label>
                <textarea
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  placeholder="Bagikan pengalaman Anda dengan materi ini..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={submitRating}
                disabled={userRating === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kirim Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ELibrary;
