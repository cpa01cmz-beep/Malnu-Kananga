import React, { useState, useEffect } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { assignmentsAPI, assignmentSubmissionsAPI, FileUploadResponse } from '../services/apiService';
import { Assignment, AssignmentType, AssignmentStatus, AssignmentSubmission, Student } from '../types';
import { useEventNotifications } from '../hooks/useEventNotifications';
import { useCanAccess } from '../hooks/useCanAccess';
import { logger } from '../utils/logger';
import { useOfflineActionQueue } from '../services/offlineActionQueueService';
import { OfflineIndicator } from './OfflineIndicator';
import { useNetworkStatus } from '../utils/networkStatus';
import Button from './ui/Button';
import AccessDenied from './AccessDenied';
import Textarea from './ui/Textarea';
import FileUpload from './FileUpload';
import { STORAGE_KEYS } from '../constants';
import Badge from './ui/Badge';
import { EmptyState } from './ui/LoadingState';
import FormGrid from './ui/FormGrid';

interface StudentAssignmentsProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  studentId: string;
  studentName: string;
}

type AssignmentView = 'list' | 'detail' | 'submit';

const StudentAssignments: React.FC<StudentAssignmentsProps> = ({
  onBack,
  onShowToast,
  studentId,
  studentName
}) => {
  const { notifyAssignmentSubmit } = useEventNotifications();
  const { canAccess } = useCanAccess();
  const { isOnline } = useNetworkStatus();

  const [currentView, setCurrentView] = useState<AssignmentView>('list');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmission>>({});
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submissionText, setSubmissionText] = useState('');
  const [attachments, setAttachments] = useState<FileUploadResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { addAction } = useOfflineActionQueue();

  const canSubmitAssignments = canAccess('academic.assignments.submit');

  const getCurrentUser = (): Student | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await assignmentsAPI.getByStatus(AssignmentStatus.PUBLISHED);

      if (response.success && response.data) {
        const studentAssignments = response.data.filter((assignment) => {
          if (currentUser?.class) {
            return assignment.classId === currentUser.class;
          }
          return false;
        });

        setAssignments(studentAssignments);

        await fetchSubmissions();
      } else {
        setError('Gagal memuat data tugas');
      }
    } catch (err) {
      logger.error('Error fetching assignments:', err);
      setError('Gagal memuat data tugas');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await assignmentSubmissionsAPI.getByStudent(studentId);

      if (response.success && response.data) {
        const submissionMap: Record<string, AssignmentSubmission> = {};
        response.data.forEach((submission) => {
          submissionMap[submission.assignmentId] = submission;
        });
        setSubmissions(submissionMap);
      }
    } catch (err) {
      logger.error('Error fetching submissions:', err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !canSubmitAssignments) {
      return;
    }

    const errors: string[] = [];

    if (!submissionText.trim() && attachments.length === 0) {
      errors.push('Mohon isi teks tugas atau unggah lampiran');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setSubmitting(true);

    try {
      const submissionData: Partial<AssignmentSubmission> = {
        assignmentId: selectedAssignment.id,
        studentId: studentId,
        studentName: studentName,
        submissionText: submissionText || undefined,
        attachments: attachments.map((a) => ({
          id: a.id,
          submissionId: '',
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          fileType: a.fileType,
          fileSize: a.fileSize,
          uploadedAt: a.uploadedAt
        })),
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };

      const response = await assignmentSubmissionsAPI.create(submissionData);

      if (response.success && response.data) {
        await notifyAssignmentSubmit(selectedAssignment.id, response.data.id, selectedAssignment.title);

        onShowToast('Tugas berhasil dikirim', 'success');

        setSubmissions((prev) => ({
          ...prev,
          [selectedAssignment.id]: response.data!
        }));

        setCurrentView('list');
        setSelectedAssignment(null);
        setSubmissionText('');
        setAttachments([]);
      } else {
        onShowToast('Gagal mengirim tugas', 'error');
      }
    } catch (err) {
      logger.error('Error submitting assignment:', err);
      onShowToast('Gagal mengirim tugas', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    const submission = submissions[assignment.id];

    if (submission) {
      setCurrentView('detail');
    } else {
      setCurrentView('submit');
    }
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    const submission = submissions[assignment.id];

    if (!submission) {
      return { status: 'pending', label: 'Belum Dikirim', color: 'gray' as const };
    }

    if (assignment.dueDate && new Date(submission.submittedAt) > new Date(assignment.dueDate)) {
      return { status: 'late', label: 'Terlambat', color: 'yellow' as const };
    }

    if (submission.status === 'graded') {
      return { status: 'graded', label: 'Dinilai', color: 'green' as const };
    }

    return { status: 'submitted', label: 'Dikirim', color: 'blue' as const };
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { text: 'Telat', days: Math.abs(days), isOverdue: true };
    }

    if (days === 0) {
      return { text: 'Hari ini', days: 0, isOverdue: false };
    }

    if (days === 1) {
      return { text: '1 hari', days: 1, isOverdue: false };
    }

    return { text: `${days} hari`, days, isOverdue: false };
  };

  const getTypeLabel = (type: AssignmentType) => {
    const labels: Record<AssignmentType, string> = {
      [AssignmentType.ASSIGNMENT]: 'Tugas',
      [AssignmentType.PROJECT]: 'Proyek',
      [AssignmentType.QUIZ]: 'Kuis',
      [AssignmentType.EXAM]: 'Ujian',
      [AssignmentType.LAB_WORK]: 'Praktikum',
      [AssignmentType.PRESENTATION]: 'Presentasi',
      [AssignmentType.HOMEWORK]: 'PR',
      [AssignmentType.OTHER]: 'Lainnya'
    };
    return labels[type] || type;
  };

  if (!canSubmitAssignments) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      {!isOnline && <OfflineIndicator />}

      {currentView === 'list' && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Daftar Tugas
            </h2>
            <Button variant="ghost" onClick={onBack}>
              Kembali
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-300">Memuat tugas...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
              <Button
                variant="red-solid"
                size="sm"
                className="mt-4"
                onClick={fetchAssignments}
              >
                Coba Lagi
              </Button>
            </div>
          ) : assignments.length === 0 ? (
            <EmptyState
              icon={<DocumentTextIcon />}
              title="Tidak ada tugas"
              submessage="Anda belum memiliki tugas yang perlu diselesaikan"
              actionLabel="Coba Lagi"
              onAction={fetchAssignments}
            />
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment) => {
                const statusInfo = getSubmissionStatus(assignment);
                const daysInfo = getDaysRemaining(assignment.dueDate);

                return (
                  <div
                    key={assignment.id}
                    className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleSelectAssignment(assignment)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            {assignment.title}
                          </h3>
                          <Badge variant="primary" size="sm">
                            {getTypeLabel(assignment.type)}
                          </Badge>
                        </div>

                        <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-3 line-clamp-2">
                          {assignment.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                          <span>
                            Mata Pelajaran: {assignment.subjectName || '-'}
                          </span>
                          <span>
                            Nilai Maksimal: {assignment.maxScore}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={statusInfo.color === 'green' ? 'success' : statusInfo.color === 'yellow' ? 'warning' : statusInfo.color === 'blue' ? 'primary' : 'secondary'}
                          size="sm"
                        >
                          {statusInfo.label}
                        </Badge>

                        <div className={`text-sm font-medium ${daysInfo.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-neutral-600 dark:text-neutral-300'}`}>
                          {daysInfo.text}
                        </div>

                        <span className="text-xs text-neutral-400 dark:text-neutral-500">
                          {new Date(assignment.dueDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {currentView === 'detail' && selectedAssignment && (
        <>
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setCurrentView('list')}>
              Kembali
            </Button>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Detail Tugas
            </h2>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {selectedAssignment.title}
              </h3>
              <Badge variant="primary" size="sm">
                {getTypeLabel(selectedAssignment.type)}
              </Badge>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-neutral-600 dark:text-neutral-300">
                {selectedAssignment.description}
              </p>

              {selectedAssignment.instructions && (
                <div className="mt-4">
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    Instruksi:
                  </h4>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    {selectedAssignment.instructions}
                  </p>
                </div>
              )}
            </div>

            {submissions[selectedAssignment.id] && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Tugas Sudah Dikirim
                </h4>
                {submissions[selectedAssignment.id].submissionText && (
                  <p className="text-neutral-700 dark:text-neutral-300 mb-2">
                    {submissions[selectedAssignment.id].submissionText}
                  </p>
                )}

                {submissions[selectedAssignment.id].attachments && submissions[selectedAssignment.id].attachments.length > 0 && (
                  <div className="mt-2">
                    <h5 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Lampiran:
                    </h5>
                    <div className="space-y-1">
                      {submissions[selectedAssignment.id].attachments.map((att) => (
                        <div key={att.id} className="text-sm text-neutral-600 dark:text-neutral-400">
                          • {att.fileName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {submissions[selectedAssignment.id].status === 'graded' && (
                  <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="font-semibold text-green-900 dark:text-green-200">
                      Nilai: {submissions[selectedAssignment.id].score}
                    </div>
                    {submissions[selectedAssignment.id].feedback && (
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                        {submissions[selectedAssignment.id].feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                  Lampiran Tugas:
                </h4>
                <div className="space-y-2">
                  {selectedAssignment.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {attachment.fileName}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {currentView === 'submit' && selectedAssignment && (
        <>
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setCurrentView('list')}>
              Kembali
            </Button>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Kirim Tugas
            </h2>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {selectedAssignment.title}
              </h3>
              <Badge variant="primary" size="sm">
                {getTypeLabel(selectedAssignment.type)}
              </Badge>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-6">
              <p className="text-neutral-600 dark:text-neutral-300">
                {selectedAssignment.description}
              </p>

              {selectedAssignment.instructions && (
                <div className="mt-4">
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    Instruksi:
                  </h4>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    {selectedAssignment.instructions}
                  </p>
                </div>
              )}
            </div>

            {validationErrors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">
                  Harap Perbaiki Error Berikut:
                </h4>
                <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <FormGrid>
              <div className="col-span-2">
                <Textarea
                  id="submissionText"
                  label="Teks Tugas"
                  placeholder="Tulis jawaban Anda di sini..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  errorText={validationErrors.includes('Mohon isi teks tugas atau unggah lampiran') ? 'Mohon isi teks tugas atau unggah lampiran' : undefined}
                  required
                />
              </div>

              <div className="col-span-2">
                <FileUpload
                  acceptedFileTypes=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                  maxSizeMB={10}
                  onFileUploaded={(file) => setAttachments([...attachments, file])}
                  existingFiles={attachments.map(a => ({ id: a.key, key: a.key, name: a.name, size: a.size, type: a.type, uploadDate: a.uploadedAt }))}
                  multiple
                />
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Maksimal 10MB per file. Format yang diizinkan: PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG, PNG
                </p>
              </div>
            </FormGrid>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setCurrentView('list');
                  setSubmissionText('');
                  setAttachments([]);
                  setValidationErrors([]);
                }}
                disabled={submitting}
              >
                Batal
              </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting || (!submissionText && attachments.length === 0)}
          >
            {submitting ? 'Mengirim...' : 'Kirim Tugas'}
          </Button>
            </div>

            {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                  Lampiran Tugas:
                </h4>
                <div className="space-y-2">
                  {selectedAssignment.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {attachment.fileName}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAssignments;
