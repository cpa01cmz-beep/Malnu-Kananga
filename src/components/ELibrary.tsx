import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { eLibraryAPI, fileStorageAPI } from '../services/apiService';
import { ELibrary as ELibraryType } from '../types';
import { logger } from '../utils/logger';

interface ELibraryProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ELibrary: React.FC<ELibraryProps> = ({ onBack, onShowToast }) => {
  const [materials, setMaterials] = useState<ELibraryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('Semua');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eLibraryAPI.getAll();
      if (response.success && response.data) {
        setMaterials(response.data);
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

  const getSubjectName = (material: ELibraryType): string => {
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

  const getSubjects = (): string[] => {
    const subjects = materials.map((m) => getSubjectName(m));
    return ['Semua', ...Array.from(new Set(subjects))];
  };

  const filteredMaterials = materials.filter((m) => {
    const matchSubject = filterSubject === 'Semua' || getSubjectName(m) === filterSubject;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  const handleDownload = async (material: ELibraryType) => {
    onShowToast(`Mulai mengunduh "${material.title}"...`, 'success');

    try {
      await eLibraryAPI.incrementDownloadCount(material.id);

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

  const subjects = getSubjects();

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
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setFilterSubject(subject)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filterSubject === subject
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {subject}
          </button>
        ))}
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
                <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">
                  {getFileType(item.fileType)}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 flex-grow">
                {item.title}
              </h3>

              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                <p>
                  Mapel: <span className="text-gray-700 dark:text-gray-300">{getSubjectName(item)}</span>
                </p>
                <div className="flex justify-between text-xs opacity-75">
                  <span>{new Date(item.uploadedAt).toLocaleDateString('id-ID')}</span>
                  <span>{formatFileSize(item.fileSize)}</span>
                </div>
              </div>

              <button
                onClick={() => handleDownload(item)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors font-medium text-sm"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download
              </button>
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
    </div>
  );
};

export default ELibrary;
