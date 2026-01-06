import React, { useState, useEffect, useCallback } from 'react';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import HeartIcon from './icons/HeartIcon';
import StarIcon from './icons/StarIcon';
import { eLibraryAPI, fileStorageAPI } from '../services/apiService';
import { ELibrary as ELibraryType, Subject, MaterialRating, ReadingProgress } from '../types';
import { logger } from '../utils/logger';
import { categoryService } from '../services/categoryService';
import {
  materialFavoritesService,
  materialRatingsService,
  readingProgressService,
  materialSearchService,
  MaterialSearchFilters,
} from '../services/eLibraryEnhancements';

interface ELibraryProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  userId?: string;
}

const ELibrary: React.FC<ELibraryProps> = ({ onBack, onShowToast, userId = '' }) => {
  const [materials, setMaterials] = useState<ELibraryType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('Semua');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRecentlyRead, setShowRecentlyRead] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<ELibraryType | null>(null);
  const [userRating, setUserRating] = useState<MaterialRating | null>(null);

  const [filters, setFilters] = useState<MaterialSearchFilters>({
    dateRange: 'all',
  });

  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyRead, setRecentlyRead] = useState<ReadingProgress[]>([]);

  const loadUserPreferences = useCallback(() => {
    const userFavorites = materialFavoritesService.getFavorites(userId);
    setFavorites(userFavorites.map((f) => f.materialId));

    const userRecentlyRead = readingProgressService.getRecentlyRead(userId, 5);
    setRecentlyRead(userRecentlyRead);
  }, [userId]);

  useEffect(() => {
    fetchMaterials();
    fetchSubjects();
    loadUserPreferences();
  }, [loadUserPreferences]);

  useEffect(() => {
    loadUserPreferences();
  }, [materials.length, loadUserPreferences]);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eLibraryAPI.getAll();
      if (response.success && response.data) {
        setMaterials(response.data);
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

  const getSubjectName = (material: ELibraryType): string => {
    if (material.subjectId) {
      const subject = subjects.find((s) => s.id === material.subjectId);
      if (subject) {
        return subject.name;
      }
    }
    return material.category || 'Umum';
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

  const handleFavorite = (material: ELibraryType) => {
    if (favorites.includes(material.id)) {
      materialFavoritesService.removeFavorite(material.id, userId);
      setFavorites(favorites.filter((id) => id !== material.id));
      onShowToast('Dihapus dari favorit', 'info');
    } else {
      materialFavoritesService.addFavorite(material.id, userId);
      setFavorites([...favorites, material.id]);
      onShowToast('Ditambahkan ke favorit', 'success');
    }
  };

  const handleRating = (material: ELibraryType, rating: number, review?: string) => {
    materialRatingsService.addRating(material.id, userId, rating, review);
    onShowToast('Rating berhasil disimpan', 'success');
    setShowRatings(false);
    setSelectedMaterial(null);
    setUserRating(null);
  };

  const handleDownload = async (material: ELibraryType) => {
    onShowToast(`Mulai mengunduh "${material.title}"...`, 'success');

    try {
      await eLibraryAPI.incrementDownloadCount(material.id);

      readingProgressService.updateProgress(material.id, userId, 0, 100, 0);
      loadUserPreferences();

      const downloadUrl = fileStorageAPI.getDownloadUrl(material.fileUrl);
      window.open(downloadUrl, '_blank');
    } catch (err) {
      logger.error('Error downloading file:', err);
      onShowToast('Gagal mengunduh file', 'error');
    }
  };

  const openRatingModal = (material: ELibraryType) => {
    setSelectedMaterial(material);
    const existingRating = materialRatingsService.getUserRating(material.id, userId);
    setUserRating(existingRating);
    setShowRatings(true);
  };

  const getFilteredMaterials = () => {
    let filtered = [...materials];

    if (showFavorites) {
      filtered = filtered.filter((m) => favorites.includes(m.id));
    }

    filtered = materialSearchService.searchMaterials(filtered, search);

    if (filters.subject) {
      filtered = materialSearchService.filterMaterials(filtered, filters);
    }

    if (filterSubject !== 'Semua') {
      filtered = filtered.filter((m) => getSubjectName(m) === filterSubject);
    }

    return filtered;
  };

  const displayMaterials = showFavorites ? getFilteredMaterials() : showRecentlyRead ? materials.filter((m) => recentlyRead.some((p) => p.materialId === m.id)) : getFilteredMaterials();

  const availableSubjects = ['Semua', ...Array.from(new Set(subjects.map((s) => s.name)))].sort();
  const availableTeachers = materialSearchService.getAvailableTeachers(materials);

  const StarRatingInput: React.FC<{ rating: number; onRate: (rating: number) => void }> = ({ rating, onRate }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          aria-label={`Rate ${star} stars`}
        >
          <StarIcon className="w-6 h-6" />
        </button>
      ))}
    </div>
  );

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
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              showFilters ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label="Toggle filters"
          >
            Filter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setShowFavorites(false);
            setShowRecentlyRead(false);
            setShowRatings(false);
          }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            !showFavorites && !showRecentlyRead ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }`}
        >
          Semua ({materials.length})
        </button>
        <button
          onClick={() => {
            setShowFavorites(true);
            setShowRecentlyRead(false);
          }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            showFavorites ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }`}
        >
          Favorit ({favorites.length})
        </button>
        <button
          onClick={() => {
            setShowRecentlyRead(true);
            setShowFavorites(false);
          }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            showRecentlyRead ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }`}
        >
          Terbaru Dibaca ({recentlyRead.length})
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter Mata Pelajaran</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {availableSubjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter Guru</label>
              <select
                value={filters.teacher || ''}
                onChange={(e) => setFilters({ ...filters, teacher: e.target.value || undefined })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Semua Guru</option>
                {availableTeachers.map((teacher) => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter Waktu</label>
              <select
                value={filters.dateRange || 'all'}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as 'all' | 'today' | 'week' | 'month' | 'year' })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayMaterials.length > 0 ? (
          displayMaterials.map((item) => {
            const avgRating = materialRatingsService.getAverageRating(item.id);
            const ratingCount = materialRatingsService.getRatingCount(item.id);
            const progress = readingProgressService.getProgress(item.id, userId);
            const isFavorite = favorites.includes(item.id);

            return (
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFavorite(item)}
                      className={`p-2 rounded-lg transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <HeartIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openRatingModal(item)}
                      className="p-2 rounded-lg text-yellow-400 hover:text-yellow-500 transition-colors"
                      aria-label="Rate this material"
                    >
                      <StarIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 flex-grow">
                  {item.title}
                </h3>

                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-3">
                  <p>
                    Mapel:{' '}
                    <span className="text-gray-700 dark:text-gray-300">{getSubjectName(item)}</span>
                  </p>
                  <p className="text-xs">Diunggah: {new Date(item.uploadedAt).toLocaleDateString('id-ID')}</p>
                  <div className="flex justify-between text-xs opacity-75">
                    <span>{formatFileSize(item.fileSize)}</span>
                    <span>{item.downloadCount} unduhan</span>
                  </div>
                  {avgRating > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <StarIcon className="w-3 h-3 text-yellow-400" />
                      <span className="font-medium">{avgRating}</span>
                      <span className="opacity-75">({ratingCount} rating)</span>
                    </div>
                  )}
                  {progress && progress.progressPercentage > 0 && (
                    <div className="flex items-center gap-2 text-xs mt-2">
                      <span className="text-green-600 dark:text-green-400">Progress: {progress.progressPercentage}%</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDownload(item)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors font-medium text-sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <DocumentTextIcon />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {showFavorites
                ? 'Belum ada materi favorit.'
                : showRecentlyRead
                ? 'Belum ada materi yang dibaca.'
                : 'Tidak ada materi ditemukan untuk filter ini.'}
            </p>
          </div>
        )}
      </div>

      {showRatings && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {userRating ? 'Edit Rating' : 'Beri Rating'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedMaterial.title}</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
              <StarRatingInput
                rating={userRating?.rating || 0}
                onRate={(rating) => setUserRating({ ...userRating, rating } as MaterialRating)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ulasan (Opsional)</label>
              <textarea
                value={userRating?.review || ''}
                onChange={(e) => setUserRating({ ...userRating, review: e.target.value } as MaterialRating)}
                placeholder="Tulis ulasan Anda..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRatings(false);
                  setSelectedMaterial(null);
                  setUserRating(null);
                }}
                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleRating(selectedMaterial, userRating?.rating || 0, userRating?.review)}
                disabled={!userRating || userRating.rating === 0}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ELibrary;
