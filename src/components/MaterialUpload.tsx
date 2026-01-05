
import React, { useState } from 'react';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { eLibraryAPI } from '../services/apiService';
import { ELibrary as ELibraryType, Subject } from '../types';
import FileUpload from './FileUpload';
import { FileUploadResponse } from '../services/apiService';
import { logger } from '../utils/logger';
import { categoryService } from '../services/categoryService';
import { CategoryValidator } from '../utils/categoryValidator';
import { CategoryValidationResult } from '../services/categoryService';

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
  const [newCategory, setNewCategory] = useState('');
  const [_newSubjectId, setNewSubjectId] = useState('');
  const [uploadedFile, setUploadedFile] = useState<FileUploadResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [categoryValidation, setCategoryValidation] = useState<CategoryValidationResult | null>(null);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionDescription, setSuggestionDescription] = useState('');

  React.useEffect(() => {
    fetchMaterials();
    fetchSubjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSubjects = async () => {
    setSubjectsLoading(true);
    try {
      const fetchedSubjects = await categoryService.getSubjects();
      setSubjects(fetchedSubjects);
      // Set default category to first available subject
      if (fetchedSubjects.length > 0 && !newCategory) {
        setNewCategory(fetchedSubjects[0].name);
        setNewSubjectId(fetchedSubjects[0].id);
      }
    } catch (err) {
      logger.error('Error fetching subjects:', err);
      onShowToast('Gagal memuat data mata pelajaran', 'error');
    } finally {
      setSubjectsLoading(false);
    }
  };

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

    // Validate category selection
    const validation = CategoryValidator.validateSubjectName(newCategory, subjects, materials.map(m => m.category));
    if (!validation.valid) {
      onShowToast(validation.error, 'error');
      setCategoryValidation(validation);
      return;
    }

    setSubmitting(true);
    try {
      const selectedSubject = subjects.find(s => s.name === newCategory);
      
      const newMaterial: Partial<ELibraryType> = {
        title: newTitle,
        description: newDescription,
        category: newCategory,
        fileUrl: uploadedFile.key,
        fileType: uploadedFile.type,
        fileSize: uploadedFile.size,
        subjectId: selectedSubject?.id,
      };

      const response = await eLibraryAPI.create(newMaterial);
      if (response.success && response.data) {
        setMaterials((prev) => [response.data!, ...prev]);
        setNewTitle('');
        setNewDescription('');
        setUploadedFile(null);
        setCategoryValidation(null);
        onShowToast('Materi berhasil ditambahkan', 'success');
        
        // Update material statistics
        categoryService.updateMaterialStats([...materials, response.data]);
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
        const updatedMaterials = materials.filter((m) => m.id !== material.id);
        setMaterials(updatedMaterials);
        onShowToast('Materi dihapus', 'info');
        
        // Update material statistics
        categoryService.updateMaterialStats(updatedMaterials);
      } else {
        onShowToast(response.message || 'Gagal menghapus materi', 'error');
      }
    } catch (err) {
      onShowToast('Terjadi kesalahan saat menghapus materi', 'error');
      logger.error('Error deleting material:', err);
    }
  };

  const handleCategoryChange = (category: string) => {
    setNewCategory(category);
    setCategoryValidation(null);
    
    const selectedSubject = subjects.find(s => s.name === category);
    setNewSubjectId(selectedSubject?.id || '');
  };

  const handleSuggestCategory = async () => {
    if (!newCategory.trim() || !suggestionDescription.trim()) {
      onShowToast('Lengkapi nama kategori dan deskripsi', 'error');
      return;
    }

    const validation = CategoryValidator.validateNewCategorySuggestion(newCategory, suggestionDescription, subjects);
    if (!validation.valid) {
      onShowToast(validation.error, 'error');
      return;
    }

    const success = await categoryService.suggestNewCategory({
      name: newCategory.trim(),
      description: suggestionDescription.trim(),
      suggestedBy: 'teacher' // In real implementation, this would be the actual teacher ID
    });

    if (success) {
      onShowToast('Kategori baru berhasil diusulkan. Admin akan meninjau usulan Anda.', 'success');
      setShowSuggestionForm(false);
      setSuggestionDescription('');
      setNewCategory('');
      setNewSubjectId('');
    } else {
      onShowToast('Gagal mengusulkan kategori baru', 'error');
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
                {subjectsLoading ? (
                  <div className="animate-pulse">
                    <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ) : (
                  <>
                    <select
                      value={newCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none ${
                        categoryValidation && !categoryValidation.valid
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Pilih Kategori</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.name}>
                          {subject.name} ({subject.code})
                        </option>
                      ))}
                    </select>
                    
                    {categoryValidation && !categoryValidation.valid && (
                      <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {categoryValidation.error}
                        {categoryValidation.suggestions && categoryValidation.suggestions.length > 0 && (
                          <ul className="mt-1 ml-4 list-disc">
                            {categoryValidation.suggestions.map((suggestion, index) => (
                              <li key={index} className="cursor-pointer hover:text-green-600" 
                                  onClick={() => handleCategoryChange(suggestion)}>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {subjects.length} mata pelajaran tersedia
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSuggestionForm(!showSuggestionForm)}
                        className="text-xs text-green-600 hover:text-green-700 font-medium"
                      >
                        Ajukan Kategori Baru
                      </button>
                    </div>

                    {showSuggestionForm && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Usul Kategori Baru
                        </h4>
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Nama kategori baru"
                          className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                        />
                        <textarea
                          value={suggestionDescription}
                          onChange={(e) => setSuggestionDescription(e.target.value)}
                          placeholder="Jelaskan mengapa kategori ini diperlukan..."
                          rows={2}
                          className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSuggestCategory}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Ajukan
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowSuggestionForm(false);
                              setSuggestionDescription('');
                            }}
                            className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
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
