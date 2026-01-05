
import React, { useState } from 'react';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { eLibraryAPI } from '../services/apiService';
import { ELibrary as ELibraryType } from '../types';
import FileUpload from './FileUpload';
import { FileUploadResponse } from '../services/apiService';
import { logger } from '../utils/logger';

interface MaterialUploadProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const MaterialUpload: React.FC<MaterialUploadProps> = ({ onBack, onShowToast }) => {
  const [materials, setMaterials] = useState<ELibraryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Matematika Wajib');
  const [uploadedFile, setUploadedFile] = useState<FileUploadResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
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

  const handleFileUploaded = (fileResponse: FileUploadResponse) => {
    setUploadedFile(fileResponse);
    onShowToast('File berhasil diunggah', 'success');
  };

  const handleFileDeleted = () => {
    setUploadedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !uploadedFile) {
      onShowToast('Mohon lengkapi judul dan unggah file', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const newMaterial: Partial<ELibraryType> = {
        title: newTitle,
        description: newDescription,
        category: newCategory,
        fileUrl: uploadedFile.key,
        fileType: uploadedFile.type,
        fileSize: uploadedFile.size,
        subjectId: undefined,
      };

      const response = await eLibraryAPI.create(newMaterial);
      if (response.success && response.data) {
        setMaterials((prev) => [response.data!, ...prev]);
        setNewTitle('');
        setNewDescription('');
        setUploadedFile(null);
        onShowToast('Materi berhasil ditambahkan', 'success');
      } else {
        onShowToast(response.message || 'Gagal menambahkan materi', 'error');
      }
    } catch (err) {
      onShowToast('Terjadi kesalahan saat menambahkan materi', 'error');
      logger.error('Error creating material:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (material: ELibraryType) => {
    if (!window.confirm('Hapus materi ini? Siswa tidak akan bisa mengaksesnya lagi.')) {
      return;
    }

    try {
      const response = await eLibraryAPI.delete(material.id);
      if (response.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== material.id));
        onShowToast('Materi dihapus', 'info');
      } else {
        onShowToast(response.message || 'Gagal menghapus materi', 'error');
      }
    } catch (err) {
      onShowToast('Terjadi kesalahan saat menghapus materi', 'error');
      logger.error('Error deleting material:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string): 'PDF' | 'DOCX' | 'PPT' | 'VIDEO' => {
    if (fileType.toLowerCase().includes('pdf')) return 'PDF';
    if (fileType.toLowerCase().includes('doc')) return 'DOCX';
    if (fileType.toLowerCase().includes('ppt')) return 'PPT';
    if (fileType.toLowerCase().includes('video') || fileType.toLowerCase().includes('mp4')) return 'VIDEO';
    return 'PDF';
  };

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
              ← Kembali ke Dashboard
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Materi Pembelajaran</h2>
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
              ← Kembali ke Dashboard
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Materi Pembelajaran</h2>
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
            ← Kembali ke Dashboard
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Materi Pembelajaran</h2>
          <p className="text-gray-500 dark:text-gray-400">Bagikan modul, tugas, dan referensi belajar untuk siswa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Formulir Upload</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Materi</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Modul Bab 3..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Deskripsi singkat materi..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option>Matematika Wajib</option>
                  <option>Matematika Peminatan</option>
                  <option>Bahasa Indonesia</option>
                  <option>Bahasa Inggris</option>
                  <option>Fisika</option>
                  <option>Biologi</option>
                  <option>Sejarah Kebudayaan Islam</option>
                  <option>Umum</option>
                </select>
              </div>

              <FileUpload
                onFileUploaded={handleFileUploaded}
                onFileDeleted={handleFileDeleted}
                acceptedFileTypes=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.jpg,.jpeg,.png"
                maxSizeMB={50}
                uploadPath="e-library"
                maxFiles={1}
              />

              <button
                type="submit"
                disabled={submitting || !uploadedFile}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CloudArrowUpIcon className="w-5 h-5" />
                {submitting ? 'Menyimpan...' : 'Upload Materi'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-white">Daftar Materi Saya ({materials.length})</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
              {materials.length > 0 ? (
                materials.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          getFileIcon(item.fileType) === 'PDF'
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
                            : getFileIcon(item.fileType) === 'DOCX'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'
                            : getFileIcon(item.fileType) === 'PPT'
                            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20'
                            : 'bg-purple-100 text-purple-600 dark:bg-purple-900/20'
                        }`}
                      >
                        <DocumentTextIcon />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{item.category}</span>
                          <span>•</span>
                          <span>{formatFileSize(item.fileSize)}</span>
                          <span>•</span>
                          <span>{new Date(item.uploadedAt).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      title="Hapus Materi"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Belum ada materi yang diunggah.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialUpload;
