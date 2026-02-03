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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Input
            id="material-title"
            name="title"
            label="Judul Materi"
            placeholder="Contoh: Modul Bab 3..."
            value={newTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            fullWidth
            required
            autoComplete="off"
          />
        </div>
        <div className="mt-6">
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

      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Textarea
            label="Deskripsi"
            placeholder="Deskripsi singkat materi..."
            value={newDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            fullWidth
            minRows={3}
            maxRows={6}
          />
        </div>
        <div className="mt-6">
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
      />
      {categoryValidation && !categoryValidation.valid && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{categoryValidation.error}</p>
      )}

      <FileUpload
        onFileUploaded={onFileUploaded}
        onFileDeleted={() => onFileDeleted()}
        maxSizeMB={50}
        acceptedFileTypes=".pdf,.doc,.docx,.ppt,.pptx,.mp4"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="submit"
          variant="blue-solid"
          disabled={submitting || !uploadedFile}
        >
          {submitting ? 'Mengunggah...' : 'Tambah Materi'}
        </Button>
      </div>
    </form>
  );
}
