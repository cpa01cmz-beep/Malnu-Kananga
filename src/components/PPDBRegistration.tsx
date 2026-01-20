
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
import Input from './ui/Input';
import Modal from './ui/Modal';
import FormGrid from './ui/FormGrid';
import { useAutoSave } from '../hooks/useAutoSave';
import { useOfflineActionQueue } from '../services/offlineActionQueueService';
import { OfflineIndicator } from './OfflineIndicator';
import { useNetworkStatus } from '../utils/networkStatus';
import { logger } from '../utils/logger';
import { STORAGE_KEYS } from '../constants';
import { standardValidationRules } from '../hooks/useFieldValidation';
import { HEIGHT_CLASSES } from '../config/heights';

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

  // Educational domain validation for email
  const validateEducationalEmail = (email: string): boolean => {
    if (!email || email.trim() === '') return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return false;
    
    // Check for educational domain (optional, not strict)
    const domain = email.split('@')[1]?.toLowerCase();
    const educationalPatterns = [
      /\.edu$/,
      /\.sch\.id$/,
      /\.ac\.id$/,
      /\.sekolah\.id$/,
      /school/i,
      /sekolah/i
    ];
    
    return educationalPatterns.some(pattern => pattern.test(domain)) || true;
  };

  // Validation rules for each field
  const validationRules = {
    fullName: [
      standardValidationRules.required('Nama lengkap wajib diisi'),
      {
        validate: (value: string) => value.trim().length >= 3,
        message: 'Nama lengkap minimal 3 karakter'
      },
      {
        validate: (value: string) => /^[a-zA-Z\s\-']+$/.test(value.trim()),
        message: 'Nama hanya boleh berisi huruf, spasi, tanda hubung, dan tanda kutip'
      }
    ],
    nisn: [
      standardValidationRules.required('NISN wajib diisi'),
      standardValidationRules.nisn()
    ],
    originSchool: [
      standardValidationRules.required('Asal sekolah wajib diisi'),
      {
        validate: (value: string) => value.trim().length >= 5,
        message: 'Nama sekolah minimal 5 karakter'
      }
    ],
    parentName: [
      standardValidationRules.required('Nama orang tua/wali wajib diisi'),
      {
        validate: (value: string) => value.trim().length >= 3,
        message: 'Nama orang tua/wali minimal 3 karakter'
      }
    ],
    phoneNumber: [
      standardValidationRules.required('Nomor WhatsApp wajib diisi'),
      standardValidationRules.phone(),
      {
        validate: (value: string) => {
          const cleanPhone = value.replace(/\D/g, '');
          return cleanPhone.startsWith('08') || cleanPhone.startsWith('628');
        },
        message: 'Nomor WhatsApp harus diawali dengan 08 atau 628'
      }
    ],
    email: [
      standardValidationRules.required('Email wajib diisi'),
      {
        validate: validateEducationalEmail,
        message: 'Format email tidak valid. Contoh: nama@sekolah.sch.id'
      }
    ],
    address: [
      standardValidationRules.required('Alamat lengkap wajib diisi'),
      {
        validate: (value: string) => value.trim().length >= 20,
        message: 'Alamat lengkap minimal 20 karakter'
      }
    ]
  };

  // Use auto-save for draft data
  const [autoSaveState, autoSaveActions] = useAutoSave<Partial<PPDBRegistrant>>(
    initialFormData,
    {
      storageKey: STORAGE_KEYS.PPDB_DRAFT,
      delay: 2000,
      enableOffline: true,
      onSave: async () => {
        // Draft data is saved to localStorage by hook automatically
        // No API call needed for drafts
      },
      onSaved: () => {
        // Show draft saved notification
        if (Object.values(autoSaveState.data).some(val => val && typeof val === 'string' && val.length > 0)) {
          onShowToast('Draft tersimpan otomatis', 'info');
        }
      },
      onError: () => {
        onShowToast('Gagal menyimpan draft. Pastikan koneksi aktif.', 'error');
      }
    }
  );

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const cleanup = useCallback(() => {
    autoSaveActions.reset(initialFormData);
    setUploadedDocument(null);
    setDiplomaImage(null);
    setExtractedGrades(null);
    setOcrResult(null);
    setShowGradesPreview(false);
    setOcrProgress({ status: 'Idle', progress: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [autoSaveActions, initialFormData]);

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
  const [ocrResult, setOcrResult] = useState<OCRExtractionResult | null>(null);
  const [showGradesPreview, setShowGradesPreview] = useState(false);
  const [diplomaImage, setDiplomaImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasDraftRecovered, setHasDraftRecovered] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      setHasDraftRecovered(false);
    }
  }, [isOpen, cleanup]);

  // Check for and recover draft on component mount
  useEffect(() => {
    if (isOpen && !hasDraftRecovered) {
      const savedDraft = localStorage.getItem(STORAGE_KEYS.PPDB_DRAFT);
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          const hasData = Object.values(draftData).some((val) => val && typeof val === 'string' && val.length > 0);
          
          if (hasData) {
            autoSaveActions.updateData(() => draftData);
            setHasDraftRecovered(true);
            onShowToast('Draft sebelumnya ditemukan. Data telah dimuat ulang.', 'info');
          }
        } catch (error) {
          logger.error('Failed to recover draft:', error);
        }
      }
    }
  }, [isOpen, hasDraftRecovered, autoSaveActions, onShowToast]);

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

  // OCR timeout handler
  useEffect(() => {
    let timeoutId: number;
    
    if (isProcessingOCR) {
      timeoutId = window.setTimeout(() => {
        if (isProcessingOCR) {
          onShowToast('Waktu pemrosesan habis. Silakan coba lagi.', 'error');
          setIsProcessingOCR(false);
          setOcrProgress({ status: 'Idle', progress: 0 });
        }
      }, 60000); // 60 second timeout
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isProcessingOCR, onShowToast]);

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

      setOcrResult(result);

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
    } catch (error) {
      logger.error('OCR processing error:', error);
      onShowToast('Gagal memproses gambar. Silakan coba lagi atau input manual.', 'error');
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const clearDiplomaImage = () => {
    setDiplomaImage(null);
    setExtractedGrades(null);
    setOcrResult(null);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingFinal(true);

    // Validate all required fields
    const validationErrors: string[] = [];
    
    if (!autoSaveState.data.fullName || autoSaveState.data.fullName.trim().length < 3) {
      validationErrors.push('Nama lengkap wajib diisi dan minimal 3 karakter');
    }
    
    if (!autoSaveState.data.nisn || !/^\d{10}$/.test(autoSaveState.data.nisn.replace(/\D/g, ''))) {
      validationErrors.push('NISN wajib diisi dan harus 10 digit angka');
    }
    
    if (!autoSaveState.data.originSchool || autoSaveState.data.originSchool.trim().length < 5) {
      validationErrors.push('Asal sekolah wajib diisi dan minimal 5 karakter');
    }
    
    if (!autoSaveState.data.parentName || autoSaveState.data.parentName.trim().length < 3) {
      validationErrors.push('Nama orang tua/wali wajib diisi dan minimal 3 karakter');
    }
    
    if (!autoSaveState.data.phoneNumber) {
      validationErrors.push('Nomor WhatsApp wajib diisi');
    } else {
      const cleanPhone = autoSaveState.data.phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 13) {
        validationErrors.push('Nomor WhatsApp harus 10-13 digit');
      } else if (!cleanPhone.startsWith('08') && !cleanPhone.startsWith('628')) {
        validationErrors.push('Nomor WhatsApp harus diawali dengan 08 atau 628');
      }
    }
    
    if (!autoSaveState.data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(autoSaveState.data.email.trim())) {
      validationErrors.push('Format email tidak valid');
    }
    
    if (!autoSaveState.data.address || autoSaveState.data.address.trim().length < 20) {
      validationErrors.push('Alamat lengkap wajib diisi dan minimal 20 karakter');
    }
    
    if (validationErrors.length > 0) {
      onShowToast('Mohon lengkapi data dengan benar sebelum mengirim.', 'error');
      logger.info('PPDB validation errors:', validationErrors);
      setIsSubmittingFinal(false);
      return;
    }

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
      ocrMetadata: ocrResult ? {
        extractedGrades: ocrResult.data.grades,
        extractedFullName: ocrResult.data.fullName,
        extractedNisn: ocrResult.data.nisn,
        extractedSchoolName: ocrResult.data.schoolName,
        confidence: ocrResult.confidence,
        quality: ocrResult.quality,
        processedAt: new Date().toISOString(),
      } : undefined,
    };

    try {
      // Check if we should queue for offline sync
      if (!isOnline || isSlow) {
        // Queue PPDB registration using offline action queue
        const actionId = addAction({
          type: 'submit',
          entity: 'ppdb',
          entityId: ppdbData.nisn || generateTempId(),
          data: ppdbData,
          endpoint: '/api/ppdb',
          method: 'POST',
        });

        setIsSubmittingFinal(false);
        onShowToast('Pendaftaran akan dikirim saat koneksi tersedia.', 'info');
        logger.info('PPDB registration queued for offline sync', { actionId, nisn: ppdbData.nisn });
        return;
      }

      // Online submission
      const response = await ppdbAPI.create(ppdbData);

      if (response.success) {
        setIsSubmittingFinal(false);
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

        setIsSubmittingFinal(false);
        onShowToast('Koneksi terputus. Pendaftaran akan dikirim saat online.', 'info');
        logger.info('PPDB registration auto-queued after network failure', { actionId, error });
        return;
      }

      setIsSubmittingFinal(false);
      onShowToast('Gagal mendaftar. Silakan coba lagi.', 'error');
      logger.error('PPDB submission error:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Formulir Pendaftaran PPDB"
      description="Tahun Ajaran 2025/2026"
      size="lg"
      animation="scale-in"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      showCloseButton={true}
      className={HEIGHT_CLASSES.MODAL.FULL}
    >
      <OfflineIndicator
        showSyncButton={true}
        showQueueCount={true}
        position="top-left"
      />
      <div className={`overflow-y-auto p-6 custom-scrollbar ${HEIGHT_CLASSES.MODAL.CONTENT}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* OCR Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 dark:text-green-400 border-b border-green-100 dark:border-green-900 pb-2">
                        Scan Ijazah (Opsional - Auto-Extract Nilai)
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" aria-hidden="true" />
                            <div>
                                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                                    Upload scan ijazah Anda untuk ekstrak nilai otomatis menggunakan AI
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    Sistem akan membaca nilai dari gambar dan mengisi formulir secara otomatis
                                </p>
                            </div>
                        </div>
                        {!isOnline && (
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-2-4.232-2H6.064c-1.538 0-2.462.667-3.232 2L.576 16c-.77 1.333 1.694 2 3.232 2h13.856c1.54 0 2.502-1.667 1.732-3L18.732 9c-.77-1.333-2.694-2-4.232-2z" />
                                </svg>
                                Fitur OCR membutuhkan koneksi internet aktif
                            </p>
                        )}
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
                                    <Button
                                        type="button"
                                        onClick={applyGradesToForm}
                                        variant="green-solid"
                                        size="sm"
                                    >
                                        Gunakan Nilai Ini
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={clearDiplomaImage}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Data Siswa */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 dark:text-green-400 border-b border-green-100 dark:border-green-900 pb-2">Data Calon Siswa</h3>
                     <FormGrid>
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
                            validationRules={validationRules.fullName}
                            helperText={hasDraftRecovered && autoSaveState.data.fullName ? 'Data dari draft' : undefined}
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
                            validationRules={validationRules.nisn}
                            customType="nisn"
                            helperText={hasDraftRecovered && autoSaveState.data.nisn ? 'Data dari draft' : undefined}
                         />
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
                            validationRules={validationRules.originSchool}
                            helperText={hasDraftRecovered && autoSaveState.data.originSchool ? 'Data dari draft' : undefined}
                        />
                     </FormGrid>
                </div>

                {/* Data Kontak */}
                <div className="space-y-4">
                     <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 dark:text-green-400 border-b border-green-100 dark:border-green-900 pb-2">Data Orang Tua & Kontak</h3>
                    <FormGrid>
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
                            validationRules={validationRules.parentName}
                            helperText={hasDraftRecovered && autoSaveState.data.parentName ? 'Data dari draft' : undefined}
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
                            validationRules={validationRules.phoneNumber}
                            customType="phone"
                            helperText={hasDraftRecovered && autoSaveState.data.phoneNumber ? 'Data dari draft' : undefined}
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
                                validationRules={validationRules.email}
                                helperText={hasDraftRecovered && autoSaveState.data.email ? 'Data dari draft' : undefined}
                            />
                        </div>
                    </FormGrid>
                    <Textarea
                        name="address"
                        label="Alamat Lengkap"
                        required
                        value={autoSaveState.data.address}
                        onChange={handleChange}
                        rows={3}
                        size="md"
                        fullWidth
                        validationRules={validationRules.address}
                        helperText={hasDraftRecovered && autoSaveState.data.address ? 'Data dari draft' : undefined}
                    />
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
                        isLoading={isSubmittingFinal || isProcessingOCR}
                        disabled={isProcessingOCR || (!isOnline && !autoSaveState.data)}
                        className="rounded-full font-bold shadow-lg"
                    >
                        {isProcessingOCR ? 'Memproses OCR...' : 
                         isSubmittingFinal ? 'Mengirim Data...' : 
                         !isOnline ? 'Kirim Saat Online' : 'Kirim Pendaftaran'}
                    </Button>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-neutral-500">Dengan mendaftar, Anda menyetujui kebijakan privasi data sekolah.</p>
                        {hasDraftRecovered && (
                            <button
                                type="button"
                                onClick={() => {
                                    localStorage.removeItem(STORAGE_KEYS.PPDB_DRAFT);
                                    autoSaveActions.reset(initialFormData);
                                    setHasDraftRecovered(false);
                                    onShowToast('Draft telah dihapus', 'info');
                                }}
                                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                                Hapus Draft
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    </Modal>
  );
};

export default PPDBRegistration;
