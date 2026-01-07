
import React, { useState } from 'react';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { ShareIcon } from './icons/MaterialIcons';
import { eLibraryAPI } from '../services/apiService';
import { ELibrary as ELibraryType, Subject, MaterialFolder } from '../types';
import FileUpload from './FileUpload';
import { FileUploadResponse } from '../services/apiService';
import { logger } from '../utils/logger';
import { categoryService } from '../services/categoryService';
import { CategoryValidator } from '../utils/categoryValidator';
import { CategoryValidationResult } from '../services/categoryService';
import { validateMaterialData } from '../utils/teacherValidation';
import { 
  executeWithRetry, 
  createToastHandler 
} from '../utils/teacherErrorHandler';
import ConfirmationDialog from './ui/ConfirmationDialog';
import FolderNavigation from './FolderNavigation';
import { CardSkeleton } from './ui/Skeleton';
import ErrorMessage from './ui/ErrorMessage';
import MaterialSharing from './MaterialSharing';
import VersionControl from './VersionControl';
import MaterialAnalytics from './MaterialAnalytics';
import MaterialTemplatesLibrary from './MaterialTemplatesLibrary';
import Button from './ui/Button';

interface MaterialUploadProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const MaterialUpload: React.FC<MaterialUploadProps> = ({ onBack, onShowToast }) => {
  const [materials, setMaterials] = useState<ELibraryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'upload' | 'templates' | 'management'>('upload');
  const [selectedMaterial, setSelectedMaterial] = useState<ELibraryType | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<MaterialFolder | undefined>(undefined);

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
  const [_validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Enhanced error handling state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  });
  
  const toast = createToastHandler(onShowToast);

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
    
    // Clear previous errors
    
    // Validate form data
    const materialData = {
      title: newTitle,
      description: newDescription,
      category: newCategory,
      fileUrl: uploadedFile?.key,
      fileType: uploadedFile?.type,
      fileSize: uploadedFile?.size
    };
    
    const validation = validateMaterialData(materialData);
    if (!validation.isValid) {
      toast.error('Perbaiki kesalahan validasi sebelum melanjutkan');
      return;
    }
    
    if (!uploadedFile) {
      setValidationErrors(['Mohon unggah file']);
      return;
    }

    // Validate category selection
    const categoryValidation = CategoryValidator.validateSubjectName(newCategory, subjects, materials.map(m => m.category));
    if (!categoryValidation.valid) {
      setCategoryValidation(categoryValidation);
      toast.error(categoryValidation.error || 'Kategori tidak valid');
      return;
    }

    // Show confirmation dialog
    setConfirmDialog({
      isOpen: true,
      title: 'Tambah Materi Baru',
      message: `Apakah Anda yakin ingin menambahkan materi "${newTitle}" ke kategori "${newCategory}"?`,
      type: 'info',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        doSubmitMaterial();
      }
    });
  };
  
  const doSubmitMaterial = async () => {
    setSubmitting(true);

    try {
      const selectedSubject = subjects.find(s => s.name === newCategory);
      
      const newMaterial: Partial<ELibraryType> = {
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory.trim(),
        fileUrl: uploadedFile!.key,
        fileType: uploadedFile!.type,
        fileSize: uploadedFile!.size,
        subjectId: selectedSubject?.id,
        folderId: selectedFolder?.id,
      };

      const createOperation = async () => {
        return await eLibraryAPI.create(newMaterial);
      };

      const result = await executeWithRetry({
        operation: createOperation,
        config: {
          maxRetries: 3,
          retryDelay: 2000
        }
      });
      
      if (result.success && result.data) {
        const uploadResult = result.data as { success: boolean; data: ELibraryType; message?: string };
        if (uploadResult.success && uploadResult.data) {
          setMaterials((prev) => [uploadResult.data, ...prev]);
          setNewTitle('');
          setNewDescription('');
          setUploadedFile(null);
          setCategoryValidation(null);
          toast.success('Materi berhasil ditambahkan');
          
          categoryService.updateMaterialStats([...materials, uploadResult.data]);
        } else {
          toast.error(uploadResult.message || 'Gagal menambahkan materi');
        }
      } else {
        toast.error(result.error || 'Gagal menambahkan materi');
      }
    } catch (err) {
      logger.error('Error creating material:', err);
      toast.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (material: ELibraryType) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Materi',
      message: `Apakah Anda yakin ingin menghapus materi "${material.title}"? Siswa tidak akan bisa mengakses materi ini lagi dan tindakan ini tidak dapat dibatalkan.`,
      type: 'danger',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        doDeleteMaterial(material);
      }
    });
  };
  
  const doDeleteMaterial = async (material: ELibraryType) => {
    try {
      const deleteOperation = async () => {
        return await eLibraryAPI.delete(material.id);
      };

      const result = await executeWithRetry({
        operation: deleteOperation,
        config: {
          maxRetries: 3,
          retryDelay: 1000
        }
      });
      
      if (result.success) {
        const updatedMaterials = materials.filter((m) => m.id !== material.id);
        setMaterials(updatedMaterials);
        toast.info('Materi dihapus');
        
        categoryService.updateMaterialStats(updatedMaterials);
      } else {
        toast.error(result.error || 'Gagal menghapus materi');
      }
    } catch (err) {
      logger.error('Error deleting material:', err);
      toast.error(err);
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
      onShowToast(validation.error || 'Saran kategori tidak valid', 'error');
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

  const handleShowMaterialDetails = (material: ELibraryType) => {
    // Placeholder for material details functionality
    onShowToast(`Detail materi: ${material.title}`, 'info');
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
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Kembali ke Dashboard
            </Button>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Upload Materi Pembelajaran</h2>
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
              ← Kembali ke Dashboard
            </Button>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Upload Materi Pembelajaran</h2>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <ErrorMessage 
            title="Error Loading Materials" 
            message={error} 
            variant="card" 
          />
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
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
            ← Kembali ke Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Manajemen Materi</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Kelola materi pembelajaran dengan folder, berbagi, dan kontrol versi.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('upload')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'upload' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setSelectedView('templates')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'templates' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600'
            }`}
          >
            Template
          </button>
          <button
            onClick={() => setSelectedView('management')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'management' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600'
            }`}
          >
            Kelola
          </button>
        </div>
      </div>

      {selectedView === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <FolderNavigation
              selectedFolderId={selectedFolder?.id}
              onFolderSelect={setSelectedFolder}
              onShowToast={onShowToast}
              materials={materials}
            />
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Formulir Upload</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="material-title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Judul Materi</label>
                <input
                  id="material-title"
                  name="title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Modul Bab 3..."
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Deskripsi</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Deskripsi singkat materi..."
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Kategori</label>
                {subjectsLoading ? (
                  <div className="animate-pulse">
                    <div className="w-full h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
                  </div>
                ) : (
                  <>
                    <select
                      value={newCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none ${
                        categoryValidation && !categoryValidation.valid
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-neutral-300 dark:border-neutral-600'
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
                      <div>
                      <ErrorMessage 
                        title="Validation Error" 
                        message={categoryValidation.error || 'Invalid category'} 
                        variant="inline" 
                      />
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
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
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
                      <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-600">
                        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Usul Kategori Baru
                        </h4>
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Nama kategori baru"
                          className="w-full px-3 py-2 mb-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                        />
                        <textarea
                          value={suggestionDescription}
                          onChange={(e) => setSuggestionDescription(e.target.value)}
                          placeholder="Jelaskan mengapa kategori ini diperlukan..."
                          rows={2}
                          className="w-full px-3 py-2 mb-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
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
                            className="px-3 py-1 bg-neutral-300 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 text-sm rounded-lg hover:bg-neutral-400 dark:hover:bg-neutral-500 transition-colors"
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

          <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex justify-between items-center">
              <h3 className="font-bold text-neutral-800 dark:text-white">
                {selectedFolder ? selectedFolder.name : 'Semua Materi'} ({materials.filter(m => !selectedFolder || m.folderId === selectedFolder.id).length})
              </h3>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-700 max-h-[600px] overflow-y-auto">
              {materials.filter(m => !selectedFolder || m.folderId === selectedFolder.id).length > 0 ? (
                materials.filter(m => !selectedFolder || m.folderId === selectedFolder.id).map((item) => (
                  <div key={item.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
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
                          <h4 className="font-semibold text-neutral-900 dark:text-white line-clamp-1 cursor-pointer hover:text-blue-600" onClick={() => handleShowMaterialDetails(item)}>
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded">{item.category}</span>
                            <span>•</span>
                            <span>{formatFileSize(item.fileSize)}</span>
                            <span>•</span>
                            <span>{new Date(item.uploadedAt).toLocaleDateString('id-ID')}</span>
                          </div>
                          
                          {/* Enhancement indicators */}
                          <div className="flex items-center gap-2 mt-2">
                            {item.isShared && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-300 rounded">
                                <ShareIcon className="w-3 h-3 inline mr-1" />
                                Dibagikan
                              </span>
                            )}
                            {item.currentVersion && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 rounded">
                                v{item.currentVersion}
                              </span>
                            )}
                            {item.analytics && (
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                👁️ {item.analytics.totalDownloads}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <button
                          onClick={() => handleShowMaterialDetails(item)}
                          className="p-2 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                          title="Kelola materi"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          title="Hapus Materi"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                  {selectedFolder ? `Belum ada materi di folder "${selectedFolder.name}".` : 'Belum ada materi yang diunggah.'}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      )}

      {selectedView === 'templates' && (
        <MaterialTemplatesLibrary
          onShowToast={onShowToast}
          onSelectTemplate={(template) => {
            setNewTitle(template.title);
            setNewDescription(template.description);
            setNewCategory(template.category);
            const subject = subjects.find(s => s.id === template.subjectId);
            if (subject) {
              setNewCategory(subject.name);
              setNewSubjectId(subject.id);
            }
            setSelectedView('upload');
            onShowToast(`Template "${template.title}" telah dimuat. Silakan unggah file Anda.`, 'success');
          }}
        />
      )}

      {selectedView === 'management' && selectedMaterial && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{selectedMaterial.title}</h3>
                <p className="text-neutral-500 dark:text-neutral-400">{selectedMaterial.description}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedMaterial(null);
                  setSelectedView('upload');
                }}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Berbagi Materi</h4>
                <MaterialSharing
                  material={selectedMaterial}
                  onShowToast={onShowToast}
                  onSharingUpdate={fetchMaterials}
                />
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Kontrol Versi</h4>
                <VersionControl
                  material={selectedMaterial}
                  onShowToast={onShowToast}
                  onVersionUpdate={fetchMaterials}
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Analytics</h4>
              <MaterialAnalytics
                material={selectedMaterial}
                onShowToast={onShowToast}
              />
            </div>
          </div>
        </div>
      )}
        
        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          isLoading={submitting}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
        />
    </div>
  );
};

export default MaterialUpload;
