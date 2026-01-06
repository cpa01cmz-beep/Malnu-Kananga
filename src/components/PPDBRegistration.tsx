
import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ppdbAPI } from '../services/apiService';
import { FileUploadResponse } from '../services/apiService';
import type { PPDBRegistrant } from '../types';
import FileUpload from './FileUpload';
import { ocrService, type OCRExtractionResult, type OCRProgress } from '../services/ocrService';

interface PPDBRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const PPDBRegistration: React.FC<PPDBRegistrationProps> = ({ isOpen, onClose, onShowToast }) => {
  const initialFormData = {
    fullName: '',
    nisn: '',
    originSchool: '',
    parentName: '',
    phoneNumber: '',
    email: '',
    address: '',
  };

  const [formData, setFormData] = useState<Partial<PPDBRegistrant>>({
    fullName: '',
    nisn: '',
    originSchool: '',
    parentName: '',
    phoneNumber: '',
    email: '',
    address: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<FileUploadResponse | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OCRProgress>({ status: 'Idle', progress: 0 });
  const [extractedGrades, setExtractedGrades] = useState<Record<string, number> | null>(null);
  const [showGradesPreview, setShowGradesPreview] = useState(false);
  const [diplomaImage, setDiplomaImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

const cleanup = () => {
    setFormData(initialFormData);
    setUploadedDocument(null);
    setDiplomaImage(null);
    setOcrProgress({ status: 'Idle', progress: 0 });
  };

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          setFormData(prev => ({ ...prev, fullName: result.data.fullName || prev.fullName }));
        }

        if (result.data.nisn) {
          setFormData(prev => ({ ...prev, nisn: result.data.nisn || prev.nisn }));
        }

        if (result.data.schoolName) {
          setFormData(prev => ({ ...prev, originSchool: result.data.schoolName || prev.originSchool }));
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

    try {
      const response = await ppdbAPI.create({
        fullName: formData.fullName!,
        nisn: formData.nisn!,
        originSchool: formData.originSchool!,
        parentName: formData.parentName!,
        phoneNumber: formData.phoneNumber!,
        email: formData.email!,
        address: formData.address!,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        documentUrl: uploadedDocument?.key,
      });

      if (response.success) {
        setIsSubmitting(false);
        onShowToast('Pendaftaran berhasil! Data Anda sedang diverifikasi.', 'success');

        setFormData({
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
    } catch {
      setIsSubmitting(false);
      onShowToast('Gagal mendaftar. Silakan coba lagi.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Formulir Pendaftaran PPDB</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tahun Ajaran 2025/2026</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
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
                                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                        : 'border-green-300 bg-green-50 hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30'
                                }`}
                            >
                                <div className="flex flex-col items-center space-y-2">
                                    <DocumentTextIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {isProcessingOCR ? 'Memproses...' : 'Klik untuk upload ijazah (JPG/PNG)'}
                                    </span>
                                </div>
                            </label>
                        ) : (
                            <div className="relative">
                                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                                    <div className="flex items-center space-x-3">
                                        <DocumentTextIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {diplomaImage.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
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
                                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                            <span>{ocrProgress.status}</span>
                                            <span>{ocrProgress.progress.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${ocrProgress.progress}%` }}
                                            ></div>
                                        </div>
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
                                            className="flex justify-between text-sm bg-white dark:bg-gray-800 rounded px-2 py-1"
                                        >
                                            <span className="text-gray-700 dark:text-gray-300">{subject}</span>
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
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
                        <div>
                            <label htmlFor="ppdb-fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                            <input id="ppdb-fullName" name="fullName" required type="text" value={formData.fullName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" autoComplete="name" />
                        </div>
                        <div>
                            <label htmlFor="ppdb-nisn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NISN</label>
                            <input id="ppdb-nisn" name="nisn" required type="text" value={formData.nisn} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" autoComplete="off" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="ppdb-originSchool" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asal Sekolah</label>
                            <input id="ppdb-originSchool" name="originSchool" required type="text" value={formData.originSchool} onChange={handleChange} placeholder="SMP/MTs..." className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" autoComplete="organization" />
                        </div>
                    </div>
                </div>

                {/* Data Kontak */}
                <div className="space-y-4">
                     <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 dark:text-green-400 border-b border-green-100 dark:border-green-900 pb-2">Data Orang Tua & Kontak</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="ppdb-parentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Orang Tua/Wali</label>
                            <input id="ppdb-parentName" name="parentName" required type="text" value={formData.parentName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" autoComplete="name" />
                        </div>
                        <div>
                            <label htmlFor="ppdb-phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor WhatsApp</label>
                            <input id="ppdb-phoneNumber" name="phoneNumber" required type="tel" value={formData.phoneNumber} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" autoComplete="tel" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="ppdb-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input id="ppdb-email" name="email" required type="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" autoComplete="email" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Lengkap</label>
                            <textarea name="address" required value={formData.address} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500"></textarea>
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

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? 'Mengirim Data...' : 'Kirim Pendaftaran'}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-2">Dengan mendaftar, Anda menyetujui kebijakan privasi data sekolah.</p>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default PPDBRegistration;
