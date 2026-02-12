import React, { useState, useEffect } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { XMarkIcon } from './icons/MaterialIcons';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { assignmentsAPI, FileUploadResponse } from '../services/apiService';
import { 
  Assignment, 
  AssignmentType, 
  AssignmentStatus, 
  Subject, 
  Class,
  User
} from '../types';
import { STORAGE_KEYS, INPUT_MIN_VALUES } from '../constants';
import { unifiedNotificationManager } from '../services/notifications/unifiedNotificationManager';
import { useEventNotifications } from '../hooks/useEventNotifications';
import FileUpload from './FileUpload';
import { logger } from '../utils/logger';
import { categoryService } from '../services/categoryService';
import {
  executeWithRetry
} from '../utils/teacherErrorHandler';
import { useCanAccess } from '../hooks/useCanAccess';
import { OfflineIndicator } from './OfflineIndicator';
import Button from './ui/Button';
import AccessDenied from './AccessDenied';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import {
  VALIDATION_MESSAGES,
  SUCCESS_MESSAGES,
  API_ERROR_MESSAGES,
  ERROR_MESSAGES,
} from '../utils/errorMessages';

interface AssignmentCreationProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

interface RubricFormData {
  name: string;
  description: string;
  maxScore: number;
  weight: number;
}

const AssignmentCreation: React.FC<AssignmentCreationProps> = ({ onBack, onShowToast }) => {
  const { notifyAssignmentCreate } = useEventNotifications();
  
  const { canAccess } = useCanAccess();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AssignmentType>(AssignmentType.ASSIGNMENT);
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [dueDate, setDueDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [attachments, setAttachments] = useState<FileUploadResponse[]>([]);
  
  const [useRubric, setUseRubric] = useState(false);
  const [rubricCriteria, setRubricCriteria] = useState<RubricFormData[]>([
    { name: '', description: '', maxScore: 0, weight: 0 }
  ]);
  
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  };

  const authUser = getCurrentUser();
  const canCreateAssignment = canAccess('academic.assignments.create');

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  const fetchSubjects = async () => {
    try {
      const fetchedSubjects = await categoryService.getSubjects();
      setSubjects(fetchedSubjects);
      if (fetchedSubjects.length > 0) {
        setSubjectId(fetchedSubjects[0].id);
      }
    } catch (err) {
      logger.error('Error fetching subjects:', err);
      setError(API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await categoryService.getClasses();
      setClasses(response);
      if (response.length > 0) {
        setClassId(response[0].id);
      }
    } catch (err) {
      logger.error('Error fetching classes:', err);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!title.trim()) errors.push(VALIDATION_MESSAGES.TITLE_REQUIRED);
    if (!description.trim()) errors.push(VALIDATION_MESSAGES.DESCRIPTION_REQUIRED);
    if (!subjectId) errors.push(VALIDATION_MESSAGES.SUBJECT_REQUIRED);
    if (!classId) errors.push(VALIDATION_MESSAGES.CLASS_REQUIRED);
    if (maxScore <= 0) errors.push(VALIDATION_MESSAGES.MAX_SCORE_INVALID);
    if (!dueDate) errors.push(VALIDATION_MESSAGES.DUE_DATE_REQUIRED);
    
    if (useRubric) {
      let rubricTotal = 0;
      rubricCriteria.forEach((criteria, index) => {
        if (!criteria.name.trim()) {
          errors.push(VALIDATION_MESSAGES.RUBRIC_NAME_REQUIRED(index));
        }
        if (criteria.maxScore <= 0) {
          errors.push(VALIDATION_MESSAGES.RUBRIC_MAX_SCORE_INVALID(index));
        }
        if (criteria.weight < 0 || criteria.weight > 100) {
          errors.push(VALIDATION_MESSAGES.RUBRIC_WEIGHT_INVALID(index));
        }
        rubricTotal += criteria.weight;
      });

      if (Math.abs(rubricTotal - 100) > 0.01) {
        errors.push(VALIDATION_MESSAGES.RUBRIC_TOTAL_WEIGHT(rubricTotal));
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleFileUpload = (fileResponse: FileUploadResponse) => {
    setAttachments([...attachments, fileResponse]);
    onShowToast(SUCCESS_MESSAGES.MATERIAL_UPLOADED, 'success');
  };

  const handleRemoveAttachment = (fileId: string) => {
    setAttachments(attachments.filter(f => f.key !== fileId));
  };

  const addRubricCriteria = () => {
    setRubricCriteria([
      ...rubricCriteria,
      { name: '', description: '', maxScore: 0, weight: 0 }
    ]);
  };

  const removeRubricCriteria = (index: number) => {
    setRubricCriteria(rubricCriteria.filter((_, i) => i !== index));
  };

  const updateRubricCriteria = (index: number, field: keyof RubricFormData, value: string | number) => {
    const updated = [...rubricCriteria];
    updated[index] = { ...updated[index], [field]: value };
    setRubricCriteria(updated);
  };

  const handleSubmit = async (action: 'draft' | 'publish' = 'draft') => {
    if (!validateForm()) {
      onShowToast(ERROR_MESSAGES.VALIDATION_ERROR, 'error');
      return;
    }

    setSubmitting(true);
    const submitStatus = action === 'publish' ? AssignmentStatus.PUBLISHED : AssignmentStatus.DRAFT;

    try {
      const assignmentData: Partial<Assignment> = {
        title: title.trim(),
        description: description.trim(),
        type,
        subjectId,
        classId,
        teacherId: authUser?.id || '',
        academicYear: '2025-2026',
        semester: '1',
        maxScore,
        dueDate,
        status: submitStatus,
        attachments: attachments.map(att => ({
          id: att.key,
          assignmentId: '',
          fileName: att.name,
          fileUrl: att.url,
          fileType: att.type,
          fileSize: att.size,
          uploadedAt: new Date().toISOString(),
        })),
      };

      if (useRubric && rubricCriteria.some(c => c.name.trim())) {
        assignmentData.rubric = {
          id: '',
          assignmentId: '',
          criteria: rubricCriteria.map((c, i) => ({
            id: `criteria-${i}`,
            name: c.name.trim(),
            description: c.description.trim(),
            maxScore: c.maxScore,
            weight: c.weight,
          })),
          totalScore: rubricCriteria.reduce((sum, c) => sum + c.maxScore, 0),
          createdAt: new Date().toISOString(),
        };
      }

      const result = await executeWithRetry({
        operation: () => assignmentsAPI.create(assignmentData),
        onError: (error) => {
          onShowToast(`${API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR}: ${error.message}`, 'error');
        }
      });

      if (result.success && result.data) {
        const responseData = result.data as { id: string; title: string };
        await unifiedNotificationManager.showNotification({
          id: `assignment-${action}-${responseData.id}`,
          type: 'grade',
          title: action === 'publish' ? 'Tugas Dipublikasikan' : 'Draft Tugas Disimpan',
          body: `${title} berhasil ${action === 'publish' ? 'dipublikasikan' : 'disimpan'}`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'normal'
        });

        await notifyAssignmentCreate(responseData.id, responseData.title);

        onShowToast(
          action === 'publish'
            ? SUCCESS_MESSAGES.ASSIGNMENT_CREATED
            : SUCCESS_MESSAGES.ASSIGNMENT_CREATED,
          'success'
        );
        onBack();
      } else {
        throw new Error(result.message || 'Gagal membuat tugas');
      }
    } catch (err) {
      logger.error('Error creating assignment:', err);
      onShowToast(API_ERROR_MESSAGES.OPERATION_FAILED, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!canCreateAssignment) {
    return <AccessDenied />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <OfflineIndicator />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Buat Tugas Baru
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Buat tugas untuk siswa dengan rubrik dan lampiran
          </p>
        </div>
        <Button variant="secondary" onClick={onBack}>
          Kembali
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
          <h4 className="font-bold mb-2">Kesalahan Validasi:</h4>
          <ul className="list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit('draft');
        }}
        className="space-y-6"
      >
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul Tugas *
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul tugas"
              className="w-full"
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Deskripsi *
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat tentang tugas ini"
              rows={3}
              className="w-full"
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jenis Tugas *
              </label>
              <Select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as AssignmentType)}
                className="w-full"
                disabled={submitting}
              >
                {Object.values(AssignmentType).map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nilai Maksimal *
              </label>
              <Input
                id="maxScore"
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                min={INPUT_MIN_VALUES.SCORE}
                className="w-full"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mata Pelajaran *
              </label>
              <Select
                id="subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full"
                disabled={submitting || subjects.length === 0}
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kelas *
              </label>
              <Select
                id="class"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full"
                disabled={submitting || classes.length === 0}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tanggal Tenggat *
            </label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full"
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Instruksi Lengkap
            </label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instruksi detail untuk mengerjakan tugas"
              rows={5}
              className="w-full"
              disabled={submitting}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Lampiran
          </h2>
          
          <FileUpload
            onFileUploaded={handleFileUpload}
            acceptedFileTypes=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4"
            maxSizeMB={10}
            disabled={submitting}
          />

          {attachments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                File Terunggah:
              </h3>
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between bg-gray-50 dark:bg-neutral-700 rounded-lg px-4 py-2"
                >
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {attachment.fileName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttachment(attachment.id)}
                    disabled={submitting}
                    ariaLabel="Hapus lampiran"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Rubrik Penilaian
            </h2>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useRubric"
                checked={useRubric}
                onChange={(e) => setUseRubric(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                disabled={submitting}
              />
              <label
                htmlFor="useRubric"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Gunakan Rubrik
              </label>
            </div>
          </div>

          {useRubric && (
            <div className="space-y-4">
              {rubricCriteria.map((criteria, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Kriteria {index + 1}
                    </h3>
                    {rubricCriteria.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRubricCriteria(index)}
                        disabled={submitting}
                        ariaLabel="Hapus kriteria"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Nama Kriteria"
                      value={criteria.name}
                      onChange={(e) => updateRubricCriteria(index, 'name', e.target.value)}
                      placeholder="Misalnya: Struktur Konten"
                      disabled={submitting}
                    />

                    <Input
                      label="Nilai Maksimal"
                      type="number"
                      value={criteria.maxScore}
                      onChange={(e) => updateRubricCriteria(index, 'maxScore', Number(e.target.value))}
                      min={INPUT_MIN_VALUES.SCORE}
                      disabled={submitting}
                    />

                    <div className="md:col-span-2">
                      <Textarea
                        label="Deskripsi Kriteria"
                        value={criteria.description}
                        onChange={(e) => updateRubricCriteria(index, 'description', e.target.value)}
                        placeholder="Deskripsi detail kriteria penilaian"
                        rows={2}
                        disabled={submitting}
                      />
                    </div>

                    <Input
                      label="Bobot (%)"
                      type="number"
                      value={criteria.weight}
                      onChange={(e) => updateRubricCriteria(index, 'weight', Number(e.target.value))}
                      min="0"
                      max="100"
                      disabled={submitting}
                    />
                  </div>
                </div>
              ))}

              <Button
                variant="secondary"
                onClick={addRubricCriteria}
                disabled={submitting}
                icon={<PlusIcon className="h-4 w-4 mr-2" />}
              >
                Tambah Kriteria
              </Button>

              {useRubric && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Total Bobot: {rubricCriteria.reduce((sum, c) => sum + c.weight, 0)}% 
                    {rubricCriteria.reduce((sum, c) => sum + c.weight, 0) === 100 ? ' ✓' : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Button
            variant="secondary"
            onClick={onBack}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={submitting}
            isLoading={submitting}
          >
            Simpan Draft
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit('publish')}
            disabled={submitting}
            isLoading={submitting}
          >
            Publikasikan Tugas
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentCreation;