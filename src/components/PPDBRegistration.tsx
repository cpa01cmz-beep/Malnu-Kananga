
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ppdbAPI } from '../services/apiService';
import { FileUploadResponse } from '../services/apiService';
import type { PPDBRegistrant } from '../types';
import { useEventNotifications } from '../hooks/useEventNotifications';
import FileUpload from './FileUpload';
import { ocrService, type OCRExtractionResult, type OCRProgress } from '../services/ocrService';
import Textarea from './ui/Textarea';
import ProgressBar from './ui/ProgressBar';
import Button from './ui/Button';
import { useAutoSave } from '../hooks/useAutoSave';
import { useOfflineActionQueue } from '../services/offlineActionQueueService';
import { OfflineIndicator } from './OfflineIndicator';
import { useNetworkStatus } from '../utils/networkStatus';
import { logger } from '../utils/logger';
import Input from './ui/Input';

interface PPDBRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const PPDBRegistration: React.FC<PPDBRegistrationProps> = ({ isOpen, onClose, onShowToast }) => {
  // Event notifications hook
  const { notifyPPDBStatus, useMonitorLocalStorage } = useEventNotifications();
  
  const initialFormData = useMemo(() => ({
    fullName: '',
    nisn: '',
    originSchool: '',
    parentName: '',
    phoneNumber: '',
    email: '',
    address: '',
  }), []);

  // Use auto-save for draft data
  const [autoSaveState, autoSaveActions] = useAutoSave<Partial<PPDBRegistrant>>(
    initialFormData,
    {
      storageKey: 'malnu_ppdb_draft',
      delay: 2000,
      enableOffline: true,
      onSave: async () => {
        // Draft data is saved to localStorage by the hook automatically
        // No API call needed for drafts
      },
      onSaved: () => {
        // Silently save drafts, no toast needed
      },
      onError: () => {
        // Silently handle draft save errors
      }
    }
  );

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const cleanup = useCallback(() => {
    autoSaveActions.reset(initialFormData);
    setUploadedDocument(null);
    setDiplomaImage(null);
    setOcrProgress({ status: 'Idle', progress: 0 });
  }, [autoSaveActions, initialFormData]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<FileUploadResponse | null>(null);

  // Network status and offline queue
  const { isOnline, isSlow } = useNetworkStatus();
  const {
    sync: _sync,
    addAction,
    getPendingCount: _getPendingCount,
  } = useOfflineActionQueue();
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OCRProgress>({ status: 'Idle', progress: 0 });
  const [extractedGrades, setExtractedGrades] = useState<Record<string, number> | null>(null);
  const [showGradesPreview, setShowGradesPreview] = useState(false);
  const [diplomaImage, setDiplomaImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen, cleanup]);

  // Monitor PPDB localStorage for new registrations and notify admins
  useMonitorLocalStorage('malnu_ppdb_registrants', (newValue, oldValue) => {
    // Check for new PPDB registrations
    if (oldValue && typeof oldValue === 'object' && newValue && typeof newValue === 'object') {
      const oldRegistrants = Array.isArray(oldValue) ? oldValue : [];
      const newRegistrants = Array.isArray(newValue) ? newValue : [];
      
      if (newRegistrants.length > oldRegistrants.length) {
        const newCount = newRegistrants.length - oldRegistrants.length;
        notifyPPDBStatus(newCount);
      }
    } else if (newValue && Array.isArray(newValue)) {
      // First time loading or admin view
      const pendingCount = newValue.filter((r: PPDBRegistrant) => r.status === 'pending').length;
      if (pendingCount > 0) {
        notifyPPDBStatus(pendingCount);
      }
    }
  });

  if (!isOpen) return null;

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    autoSaveActions.updateData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUploaded = (fileResponse: FileUploadResponse) => {
    setUploadedDocument(fileResponse);
  };

  const handleFileDeleted = () => {
    setUploadedDocument(null);
  };

  const handleDiplomaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      onShowToast('Mohon upload file gambar (JPG/PNG)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('Ukuran file maksimal 5MB', 'error');
      return;
    }

    setDiplomaImage(file);
    setIsProcessingOCR(true);
    setShowGradesPreview(false);

    try {
      await ocrService.initialize((progress) => {
        setOcrProgress(progress);
      });

      const result: OCRExtractionResult = await ocrService.extractTextFromImage(file, (progress) => {
        setOcrProgress(progress);
      });

      if (result.data.grades && Object.keys(result.data.grades).length > 0) {
        setExtractedGrades(result.data.grades);
        setShowGradesPreview(true);
        onShowToast(`Berhasil mengekstrak ${Object.keys(result.data.grades).length} nilai dari ijazah`, 'success');

        if (result.data.fullName) {
          autoSaveActions.updateData(prev => ({ ...prev, fullName: result.data.fullName || prev.fullName }));
        }

        if (result.data.nisn) {
          autoSaveActions.updateData(prev => ({ ...prev, nisn: result.data.nisn || prev.nisn }));
        }

        if (result.data.schoolName) {
          autoSaveActions.updateData(prev => ({ ...prev, originSchool: result.data.schoolName || prev.originSchool }));
        }
      } else {
        onShowToast('Tidak dapat mengekstrak nilai dari gambar. Silakan input manual.', 'info');
      }
    } catch {
      onShowToast('Gagal memproses gambar. Silakan coba lagi atau input manual.', 'error');
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const clearDiplomaImage = () => {
    setDiplomaImage(null);
    setExtractedGrades(null);
    setShowGradesPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyGradesToForm = () => {
    if (extractedGrades) {
      onShowToast('Nilai dari ijazah telah tercatat. Silakan lengkapi data diri.', 'success');
      setShowGradesPreview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ppdbData: Partial<PPDBRegistrant> = {
      fullName: autoSaveState.data.fullName!,
      nisn: autoSaveState.data.nisn!,
      originSchool: autoSaveState.data.originSchool!,
      parentName: autoSaveState.data.parentName!,
      phoneNumber: autoSaveState.data.phoneNumber!,
      email: autoSaveState.data.email!,
      address: autoSaveState.data.address!,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      documentUrl: uploadedDocument?.key,
    };

    try {
      // Check if we should queue for offline sync
      if (!isOnline || isSlow) {
        // Queue PPDB registration using the offline action queue
        const actionId = addAction({
          type: 'submit',
          entity: 'ppdb',
          entityId: ppdbData.nisn || generateTempId(),
          data: ppdbData,
          endpoint: '/api/ppdb',
          method: 'POST',
        });

        setIsSubmitting(false);
        onShowToast('Pendaftaran akan dikirim saat koneksi tersedia.', 'info');
        logger.info('PPDB registration queued for offline sync', { actionId, nisn: ppdbData.nisn });
        return;
      }

      // Online submission
      const response = await ppdbAPI.create(ppdbData);

      if (response.success) {
        setIsSubmitting(false);
        onShowToast('Pendaftaran berhasil! Data Anda sedang diverifikasi.', 'success');

        // Notify admins about new PPDB registration using event notifications hook
        await notifyPPDBStatus(1);

        autoSaveActions.reset({
          fullName: '',
          nisn: '',
          originSchool: '',
          parentName: '',
          phoneNumber: '',
          email: '',
          address: '',
        });

        setUploadedDocument(null);
        onClose();
      } else {
        throw new Error(response.error || 'Gagal mendaftar');
      }
    } catch (error) {
      // Auto-queue on network failure
      if (!isOnline) {
        const actionId = addAction({
          type: 'submit',
          entity: 'ppdb',
          entityId: ppdbData.nisn || generateTempId(),
          data: ppdbData,
          endpoint: '/api/ppdb',
          method: 'POST',
        });

        setIsSubmitting(false);
        onShowToast('Koneksi terputus. Pendaftaran akan dikirim saat online.', 'info');
        logger.info('PPDB registration auto-queued after network failure', { actionId, error });
        return;
      }

      setIsSubmitting(false);
      onShowToast('Gagal mendaftar. Silakan coba lagi.', 'error');
      logger.error('PPDB submission error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/80 flex items-center justify-center z-50 p-4" onClick={onClose} role="presentation">
      <OfflineIndicator 
        showSyncButton={true}
        showQueueCount={true}
        position="top-left"
      />
      <div 
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Formulir Pendaftaran PPDB</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Tahun Ajaran 2025/2026</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">
            <CloseIcon />
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* OCR Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 dark:text-green-400 border-b border-green-100 dark:border-green-900 pb-2">
                        Scan Ijazah (Opsional - Auto-Extract Nilai)
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                                    Upload scan ijazah Anda untuk ekstrak nilai otomatis menggunakan AI
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    Sistem akan membaca nilai dari gambar dan mengisi formulir secara otomatis
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleDiplomaUpload}
                            className="hidden"
                            id="diploma-upload"
                            disabled={isProcessingOCR}
                        />

                        {!diplomaImage ? (
                            <label
                                htmlFor="diploma-upload"
                                className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                    isProcessingOCR
                                        ? 'border-neutral-300 bg-neutral-50 cursor-not-allowed'
                                        : 'border-green-300 bg-green-50 hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30'
                                }`}
                            >
                                    <div className="flex flex-col items-center space-y-2">
                                    <div className="w-8 h-8 text-green-600 dark:text-green-400">
                                        <DocumentTextIcon />
                                    </div>
                                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                        {isProcessingOCR ? 'Memproses...' : 'Klik untuk upload ijazah (JPG/PNG)'}
                                    </span>
                                </div>
                            </label>
                        ) : (
                            <div className="relative">
                                <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-700 rounded-lg p-3">
                                    <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 text-green-600 dark:text-green-400">
                                        <DocumentTextIcon />
                                    </div>
                                    <div>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                {diplomaImage.name}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {(diplomaImage.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearDiplomaImage}
                                        disabled={isProcessingOCR}
                                        className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-50"
                                        aria-label="Hapus gambar"
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>
                                {isProcessingOCR && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                                            <span>{ocrProgress.status}</span>
                                            <span>{ocrProgress.progress.toFixed(0)}%</span>
                                        </div>
                                        <ProgressBar
                                            value={ocrProgress.progress}
                                            size="md"
                                            color="success"
                                            aria-label={`OCR processing: ${ocrProgress.status}`}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {extractedGrades && showGradesPreview && (
                            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 animate-scale-in">
                                <h4 className="text-sm font-bold text-yellow-900 dark:text-yellow-100 mb-3">
                                    Nilai Terdeteksi dari Ijazah:
                                </h4>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {Object.entries(extractedGrades).map(([subject, grade]) => (
                                        <div
                                            key={subject}
                                            className="flex justify-between text-sm bg-white dark:bg-neutral-800 rounded px-2 py-1"
                                        >
                                            <span className="text-neutral-700 dark:text-neutral-300">{subject}</span>
                                            <span className="font-bold text-green-600 dark:text-green-400">{grade}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={applyGradesToForm}
                                        className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Gunakan Nilai Ini
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearDiplomaImage}
                                        className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                                    >
                                        Ulangi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Data Siswa */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 dark:text-green-400 border-b border-green-100 dark:border-green-900 pb-2">Data Calon Siswa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            id="ppdb-fullName"
                            name="fullName"
                            label="Nama Lengkap"
                            required
                            type="text"
                            value={autoSaveState.data.fullName}
                            onChange={handleChange}
                            autoComplete="name"
                            size="md"
                            fullWidth
                        />
                        <Input
                            id="ppdb-nisn"
                            name="nisn"
                            label="NISN"
                            required
                            type="text"
                            value={autoSaveState.data.nisn}
                            onChange={handleChange}
                            autoComplete="off"
                            size="md"
                            fullWidth
                        />
                        <div className="md:col-span-2">
                            <Input
                                id="ppdb-originSchool"
                                name="originSchool"
                                label="Asal Sekolah"
                                required
                                type="text"
                                value={autoSaveState.data.originSchool}
                                onChange={handleChange}
                                placeholder="SMP/MTs..."
                                autoComplete="organization"
                                size="md"
                                fullWidth
                            />
                        </div>
                    </div>
                </div>

                {/* Data Kontak */}
                <div className="space-y-4">
                     <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 dark:text-green-400 border-b border-green-100 dark:border-green-900 pb-2">Data Orang Tua & Kontak</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            id="ppdb-parentName"
                            name="parentName"
                            label="Nama Orang Tua/Wali"
                            required
                            type="text"
                            value={autoSaveState.data.parentName}
                            onChange={handleChange}
                            autoComplete="name"
                            size="md"
                            fullWidth
                        />
                        <Input
                            id="ppdb-phoneNumber"
                            name="phoneNumber"
                            label="Nomor WhatsApp"
                            required
                            type="tel"
                            value={autoSaveState.data.phoneNumber}
                            onChange={handleChange}
                            autoComplete="tel"
                            size="md"
                            fullWidth
                        />
                        <div className="md:col-span-2">
                            <Input
                                id="ppdb-email"
                                name="email"
                                label="Email"
                                required
                                type="email"
                                value={autoSaveState.data.email}
                                onChange={handleChange}
                                autoComplete="email"
                                size="md"
                                fullWidth
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Textarea
                                name="address"
                                label="Alamat Lengkap"
                                required
                                value={autoSaveState.data.address}
                                onChange={handleChange}
                                rows={3}
                                size="md"
                            />
                        </div>
                     </div>
                </div>

                {/* Upload Dokumen */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 dark:text-green-400 border-b border-green-100 dark:border-green-900 pb-2">Upload Dokumen (Opsional)</h3>
                    <FileUpload
                        onFileUploaded={handleFileUploaded}
                        onFileDeleted={handleFileDeleted}
                        acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
                        maxSizeMB={5}
                        uploadPath="ppdb-documents"
                        maxFiles={1}
                    />
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700">
                    <Button
                        type="submit"
                        variant="green-solid"
                        size="lg"
                        fullWidth
                        isLoading={isSubmitting}
                        className="rounded-full font-bold shadow-lg"
                    >
                        {isSubmitting ? 'Mengirim Data...' : 'Kirim Pendaftaran'}
                    </Button>
                    <p className="text-center text-xs text-neutral-500 mt-2">Dengan mendaftar, Anda menyetujui kebijakan privasi data sekolah.</p>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default PPDBRegistration;
