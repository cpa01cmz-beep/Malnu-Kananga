import React, { useState, useEffect, useCallback } from 'react';
import { assignmentsAPI, assignmentSubmissionsAPI, FileUploadResponse } from '../services/apiService';
import { Assignment, AssignmentStatus, AssignmentSubmission, User, UserRole, UserExtraRole } from '../types';
import { useEventNotifications } from '../hooks/useEventNotifications';
import { useCanAccess } from '../hooks/useCanAccess';
import { logger } from '../utils/logger';
import { useOfflineActionQueue } from '../services/offlineActionQueueService';
import { OfflineIndicator } from './OfflineIndicator';
import { useNetworkStatus } from '../utils/networkStatus';
import Button from './ui/Button';
import AccessDenied from './AccessDenied';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import { STORAGE_KEYS } from '../constants';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
import { EmptyState } from './ui/LoadingState';
import FormGrid from './ui/FormGrid';
import DocumentTextIcon from './icons/DocumentTextIcon';
import UserIcon from './icons/UserIcon';
import ClockIcon from './icons/ClockIcon';
import { CheckCircleIcon, AlertCircleIcon } from './icons/StatusIcons';
import XCircleIcon from './icons/XCircleIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';

interface AssignmentGradingProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

type GradingView = 'assignment-list' | 'submissions-list' | 'submission-detail';

type SubmissionStatusFilter = 'all' | 'ungraded' | 'graded';

const AssignmentGrading: React.FC<AssignmentGradingProps> = ({
  onBack,
  onShowToast
}) => {
  const { notifyGradeUpdate } = useEventNotifications();
  const { canAccess } = useCanAccess();
  const { isOnline } = useNetworkStatus();

  const [currentView, setCurrentView] = useState<GradingView>('assignment-list');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatusFilter>('ungraded');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [score, setScore] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { addAction } = useOfflineActionQueue();

  const canGradeAssignments = canAccess('academic.grades');

  const getCurrentUser = (): User | null => {
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

      if (!currentUser) {
        setError('User tidak ditemukan');
        return;
      }

      const response = await assignmentsAPI.getByTeacher(currentUser.id);

      if (response.success && response.data) {
        const publishedAssignments = response.data.filter(
          (a) => a.status === AssignmentStatus.PUBLISHED || a.status === AssignmentStatus.CLOSED
        );
        setAssignments(publishedAssignments);
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

  const fetchSubmissions = async (assignmentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await assignmentSubmissionsAPI.getByAssignment(assignmentId);

      if (response.success && response.data) {
        setSubmissions(response.data);
      } else {
        setError('Gagal memuat data pengumpulan');
      }
    } catch (err) {
      logger.error('Error fetching submissions:', err);
      setError('Gagal memuat data pengumpulan');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setCurrentView('submissions-list');
    fetchSubmissions(assignment.id);
  };

  const handleSelectSubmission = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setScore(submission.score ?? '');
    setFeedback(submission.feedback ?? '');
    setCurrentView('submission-detail');
  };

  const handleBackToSubmissions = () => {
    setSelectedSubmission(null);
    setScore('');
    setFeedback('');
    setCurrentView('submissions-list');
  };

  const handleBackToAssignments = () => {
    setSelectedAssignment(null);
    setSubmissions([]);
    setCurrentView('assignment-list');
  };

  const handleSubmitGrade = async () => {
    if (!selectedSubmission || !selectedAssignment) {
      return;
    }

    const errors: string[] = [];

    if (score === '') {
      errors.push('Mohon masukkan nilai');
    } else if (typeof score === 'number' && (score < 0 || score > selectedAssignment.maxScore)) {
      errors.push(`Nilai harus antara 0 dan ${selectedAssignment.maxScore}`);
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setSubmitting(true);

    try {
      const gradeData: Partial<AssignmentSubmission> = {
        score: typeof score === 'number' ? score : 0,
        feedback: feedback || undefined,
        status: 'graded',
        gradedBy: currentUser?.id,
        gradedAt: new Date().toISOString()
      };

      const response = await assignmentSubmissionsAPI.update(selectedSubmission.id, gradeData);

      if (response.success) {
        const updatedSubmissions = submissions.map((s) =>
          s.id === selectedSubmission.id
            ? { ...s, ...gradeData }
            : s
        );
        setSubmissions(updatedSubmissions);

        notifyGradeUpdate(
          selectedSubmission.studentId,
          selectedAssignment.id,
          selectedAssignment.title,
          typeof score === 'number' ? score : 0
        );

        onShowToast('Nilai berhasil disimpan', 'success');
        handleBackToSubmissions();
      } else {
        setError('Gagal menyimpan nilai');
      }
    } catch (err) {
      logger.error('Error submitting grade:', err);
      setError('Gagal menyimpan nilai');
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredSubmissions = () => {
    switch (statusFilter) {
      case 'ungraded':
        return submissions.filter((s) => s.status !== 'graded');
      case 'graded':
        return submissions.filter((s) => s.status === 'graded');
      default:
        return submissions;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="success" icon={<CheckCircleIcon className="w-4 h-4" />}>Dikirim</Badge>;
      case 'late':
        return <Badge variant="warning" icon={<ClockIcon className="w-4 h-4" />}>Terlambat</Badge>;
      case 'graded':
        return <Badge variant="info" icon={<CheckCircleIcon className="w-4 h-4" />}>Dinilai</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  if (!canGradeAssignments) {
    return <AccessDenied onBack={onBack} />;
  }

  if (loading && currentView === 'assignment-list') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <ExclamationCircleIcon className="w-12 h-12 text-red-500" />
        <div className="text-gray-500">{error}</div>
        <Button onClick={fetchAssignments}>Coba Lagi</Button>
      </div>
    );
  }

  if (currentView === 'assignment-list') {
    return (
      <div className="space-y-6">
        <OfflineIndicator />

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Penilaian Tugas</h2>
          <Button onClick={onBack} variant="secondary">
            Kembali
          </Button>
        </div>

        <div className="space-y-4">
          {assignments.length === 0 ? (
            <EmptyState
              icon={<DocumentTextIcon className="w-12 h-12 text-gray-400" />}
              title="Belum ada tugas"
              description="Anda belum memiliki tugas untuk dinilai"
            />
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectAssignment(assignment)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {assignment.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        {assignment.className}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {new Date(assignment.dueDate).toLocaleDateString('id-ID')}
                      </span>
                      <span className="font-medium">
                        Nilai maksimal: {assignment.maxScore}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(assignment.status)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'submissions-list') {
    const filteredSubmissions = getFilteredSubmissions();
    const ungradedCount = submissions.filter((s) => s.status !== 'graded').length;
    const gradedCount = submissions.filter((s) => s.status === 'graded').length;

    return (
      <div className="space-y-6">
        <OfflineIndicator />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={handleBackToAssignments} variant="secondary">
              Kembali
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedAssignment?.title}
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="flex items-center">
              <UserIcon className="w-4 h-4 mr-1" />
              {submissions.length} pengumpulan
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <Button
              onClick={() => setStatusFilter('all')}
              variant={statusFilter === 'all' ? 'primary' : 'secondary'}
              size="sm"
            >
              Semua ({submissions.length})
            </Button>
            <Button
              onClick={() => setStatusFilter('ungraded')}
              variant={statusFilter === 'ungraded' ? 'primary' : 'secondary'}
              size="sm"
            >
              Belum Dinilai ({ungradedCount})
            </Button>
            <Button
              onClick={() => setStatusFilter('graded')}
              variant={statusFilter === 'graded' ? 'primary' : 'secondary'}
              size="sm"
            >
              Sudah Dinilai ({gradedCount})
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Memuat data...</div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <EmptyState
            icon={<DocumentTextIcon className="w-12 h-12 text-gray-400" />}
            title="Tidak ada pengumpulan"
            description={
              statusFilter === 'ungraded'
                ? 'Semua pengumpulan telah dinilai'
                : 'Belum ada pengumpulan untuk filter ini'
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectSubmission(submission)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.studentName}
                      </h3>
                      {getStatusBadge(submission.status)}
                      {submission.score !== undefined && (
                        <span className="text-sm font-medium text-gray-700">
                          Nilai: {submission.score}/{selectedAssignment?.maxScore}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Dikirim: {new Date(submission.submittedAt).toLocaleString('id-ID')}
                    </p>
                    {submission.submissionText && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {submission.submissionText}
                      </p>
                    )}
                    {submission.attachments && submission.attachments.length > 0 && (
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                        {submission.attachments.length} lampiran
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'submission-detail' && selectedSubmission && selectedAssignment) {
    return (
      <div className="space-y-6">
        <OfflineIndicator />

        <div className="flex items-center space-x-4">
          <Button onClick={handleBackToSubmissions} variant="secondary">
            Kembali
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">
            Detail Pengumpulan
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informasi Tugas
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Judul:</span>
                  <p className="text-gray-900 font-medium">{selectedAssignment.title}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Deskripsi:</span>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedAssignment.description}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Tenggat Waktu:</span>
                  <p className="text-gray-900">
                    {new Date(selectedAssignment.dueDate).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Nilai Maksimal:</span>
                  <p className="text-gray-900 font-medium">
                    {selectedAssignment.maxScore}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Informasi Siswa
                </h3>
                {getStatusBadge(selectedSubmission.status)}
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Nama:</span>
                  <p className="text-gray-900 font-medium">{selectedSubmission.studentName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Waktu Pengumpulan:</span>
                  <p className="text-gray-900">
                    {new Date(selectedSubmission.submittedAt).toLocaleString('id-ID')}
                  </p>
                </div>
                {selectedSubmission.score !== undefined && (
                  <div>
                    <span className="text-sm text-gray-500">Nilai Saat Ini:</span>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedSubmission.score}/{selectedAssignment.maxScore}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedSubmission.submissionText && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Jawaban Siswa
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedSubmission.submissionText}
                </p>
              </div>
            )}

            {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Lampiran ({selectedSubmission.attachments.length})
                </h3>
                <div className="space-y-2">
                  {selectedSubmission.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attachment.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => downloadFile(attachment.fileUrl, attachment.fileName)}
                        variant="secondary"
                        size="sm"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                        Unduh
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSubmission.feedback && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Feedback Sebelumnya
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedSubmission.feedback}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Beri Penilaian
              </h3>

              {validationErrors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-red-800 mb-2">
                        Validasi Gagal
                      </h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <FormGrid>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nilai (0-{selectedAssignment.maxScore})
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max={selectedAssignment.maxScore}
                    step="0.5"
                    value={score}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                      setScore(val);
                    }}
                    placeholder={`Masukkan nilai (0-${selectedAssignment.maxScore})`}
                    error={
                      typeof score === 'number' &&
                      (score < 0 || score > selectedAssignment.maxScore)
                        ? `Nilai harus antara 0 dan ${selectedAssignment.maxScore}`
                        : undefined
                    }
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback (Opsional)
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Berikan feedback untuk siswa..."
                    rows={6}
                  />
                </div>
              </FormGrid>

              <div className="mt-6 flex space-x-3">
                <Button
                  onClick={handleSubmitGrade}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Nilai'}
                </Button>
                <Button
                  onClick={handleBackToSubmissions}
                  variant="secondary"
                  disabled={submitting}
                >
                  Batal
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-2" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">
                      Tips Penilaian
                    </h4>
                    <p className="text-sm text-blue-700">
                      Pastikan nilai yang diberikan sesuai dengan rubrik tugas.
                      Feedback yang jelas dan spesifik akan membantu siswa meningkatkan
                      kinerja mereka di masa depan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AssignmentGrading;
