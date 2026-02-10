import React from 'react';
import { Subject, VoiceLanguage } from '../../types';
import FileUpload from '../FileUpload';
import { FileUploadResponse as FileUploadResponseType } from '../../services/apiService';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import FieldVoiceInput from '../FieldVoiceInput';
import Button from '../ui/Button';

interface MaterialFormProps {
  newTitle: string;
  newDescription: string;
  newCategory: string;
  _newSubjectId?: string;
  uploadedFile: FileUploadResponseType | null;
  subjects: Subject[];
  subjectsLoading: boolean;
  categoryValidation: { valid: boolean; error?: string } | null;

  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onCategoryChange: (category: string, subjectId: string) => void;
  onFileUploaded: (file: FileUploadResponseType) => void;
  onFileDeleted: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export function MaterialForm({
  newTitle,
  newDescription,
  newCategory,
  _newSubjectId,
  uploadedFile,
  subjects,
  subjectsLoading,
  categoryValidation,

  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onFileUploaded,
  onFileDeleted,
  onSubmit,
  submitting,
}: MaterialFormProps) {
  const handleCategoryChange = (category: string) => {
    const selectedSubject = subjects.find(s => s.name === category);
    onCategoryChange(category, selectedSubject?.id || '');
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <Input
            id="material-title"
            name="title"
            label="Judul Materi"
            placeholder="Contoh: Modul Bab 3..."
            value={newTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            fullWidth
            size="md"
            required
            autoComplete="off"
          />
        </div>
        <div className="flex-shrink-0 sm:mt-7">
          <FieldVoiceInput
            fieldName="materialTitle"
            fieldLabel="Judul Materi"
            onValueChange={onTitleChange}
            fieldType={{ type: 'text', textTransform: 'title-case' }}
            language={VoiceLanguage.Indonesian}
            enableFeedback={true}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <Textarea
            label="Deskripsi"
            placeholder="Deskripsi singkat materi..."
            value={newDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            fullWidth
            size="md"
            minRows={3}
            maxRows={6}
          />
        </div>
        <div className="flex-shrink-0 sm:mt-7">
          <FieldVoiceInput
            fieldName="materialDescription"
            fieldLabel="Deskripsi Materi"
            onValueChange={onDescriptionChange}
            fieldType={{ type: 'textarea' }}
            language={VoiceLanguage.Indonesian}
            enableFeedback={true}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Select
          id="material-category"
          name="category"
          label="Kategori / Mata Pelajaran"
          placeholder="Pilih kategori..."
          value={newCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          options={[
            { value: '', label: 'Pilih kategori...' },
            ...subjects.map((s) => ({ value: s.name, label: s.name }))
          ]}
          disabled={subjectsLoading}
          required
          size="md"
        />
        {categoryValidation && !categoryValidation.valid && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 animate-fade-in-up">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {categoryValidation.error}
          </p>
        )}
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/10 dark:to-blue-900/10 rounded-xl p-4 sm:p-6 border border-primary-200 dark:border-primary-700">
        <FileUpload
          onFileUploaded={onFileUploaded}
          onFileDeleted={() => onFileDeleted()}
          maxSizeMB={50}
          acceptedFileTypes=".pdf,.doc,.docx,.ppt,.pptx,.mp4"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <div className="text-sm text-neutral-500 dark:text-neutral-400 order-2 sm:order-1">
          {uploadedFile ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              File siap diunggah
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Pilih file terlebih dahulu
            </span>
          )}
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={submitting || !uploadedFile}
          size="lg"
          fullWidth={true}
          className="order-1 sm:order-2"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Mengunggah...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Materi
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
