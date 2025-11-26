import React, { useState, useRef } from 'react';
import { _Assignment as Assignment, currentParent } from '../data/parentData';

interface _FileList {
  length: number;
  item(_index: number): File | null;
  [_index: number]: File;
}

interface SubmissionData {
  file?: File;
  notes?: string;
  submittedBy: string;
}

interface AssignmentSubmissionProps {
  assignment: Assignment;
  onClose: () => void;
  onSubmit: (_assignmentId: string, _submissionData: SubmissionData) => Promise<void>;
=======
  onSubmit: (_assignmentId: string, _submissionData: SubmissionData) => Promise<void>;
>>>>>>> a799b7f (fix(pr#304): address review comments)
}

const AssignmentSubmission: React.FC<AssignmentSubmissionProps> = ({
  assignment,
  onClose,
  onSubmit
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      console.error('Tipe file tidak didukung. Silakan upload file PDF, Word, gambar, atau text.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error('Ukuran file terlalu besar. Maksimal 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile && !notes.trim()) {
      console.error('Silakan pilih file atau tulis catatan sebelum mengumpulkan.');
      return;
    }

    setIsSubmitting(true);

    const submissionData: SubmissionData = {
      file: selectedFile || undefined,
      notes: notes.trim() || undefined,
      submittedBy: currentParent.id
    };

    try {
      const submissionData: SubmissionData = {
        file: selectedFile || undefined,
        notes: notes.trim() || undefined,
        submittedBy: currentParent.id
      };
      await onSubmit(assignment.id, submissionData);

      // Close modal after successful submission
      onClose();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      console.error('Terjadi kesalahan saat mengumpulkan tugas. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc': case 'docx': return '📝';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
      case 'txt': return '📃';
      default: return '📎';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kumpulkan Tugas</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{assignment.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400"
            aria-label="Tutup modal pengumpulan tugas"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Assignment Details */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mata Pelajaran</p>
                <p className="font-medium text-gray-900 dark:text-white">{assignment.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Guru Pengampu</p>
                <p className="font-medium text-gray-900 dark:text-white">{assignment.teacherName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Batas Pengumpulan</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(assignment.dueDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nilai Maksimal</p>
                <p className="font-medium text-gray-900 dark:text-white">{assignment.maxScore}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Deskripsi Tugas</p>
              <p className="text-gray-900 dark:text-white">{assignment.description}</p>
            </div>
            {assignment.instructions && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Instruksi</p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-blue-900 dark:text-blue-100 text-sm whitespace-pre-line">
                    {assignment.instructions}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Tugas
            </label>

            <div
              role="button"
              tabIndex={0}
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  : selectedFile
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div>
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                    >
                      Pilih File
                    </button>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      atau drag dan drop file ke sini
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      PDF, Word, Gambar, atau Text (maks. 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan atau keterangan jika diperlukan..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={4}
            />
          </div>

          {/* Submission Info */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">ℹ️</span>
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Informasi Pengumpulan
                </p>
                <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Pastikan file yang diupload sesuai dengan instruksi</li>
                  <li>• File akan diperiksa oleh guru pengampu mata pelajaran</li>
                  <li>• Anda akan menerima notifikasi ketika tugas sudah dinilai</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!selectedFile && !notes.trim())}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Mengumpulkan...</span>
                </>
              ) : (
                <>
                  <span>Kumpulkan Tugas</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSubmission;