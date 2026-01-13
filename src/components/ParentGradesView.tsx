import React, { useState, useEffect } from 'react';
import { ToastType } from './Toast';
import Badge from './ui/Badge';
import type { ParentChild, Grade } from '../types';
import { parentsAPI } from '../services/apiService';
import { parentGradeNotificationService } from '../services/parentGradeNotificationService';
import { logger } from '../utils/logger';
import PDFExportButton from './ui/PDFExportButton';
import { pdfExportService } from '../services/pdfExportService';
import { TableSkeleton } from './ui/Skeleton';
import { EmptyState } from './ui/LoadingState';
import { getContainer } from '../config/styling';

interface ParentGradesViewProps {
  onShowToast: (msg: string, type: ToastType) => void;
  child: ParentChild;
}

const ParentGradesView: React.FC<ParentGradesViewProps> = ({ onShowToast, child }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const response = await parentsAPI.getChildGrades(child.studentId);
        if (response.success && response.data) {
          setGrades(response.data);
          setError(null);

          // Process each grade for potential notifications
          // This ensures parents get notified about new grades when they view the page
          response.data.forEach(grade => {
            parentGradeNotificationService.processGradeUpdate(child, grade);
          });

        } else {
          setError(response.message || 'Gagal memuat nilai');
        }
      } catch (err) {
        logger.error('Failed to fetch child grades:', err);
        setError('Gagal memuat nilai');
        onShowToast('Gagal memuat nilai', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.studentId, onShowToast]);

  const subjects = Array.from(new Set(grades.map(g => g.subjectName)));
  const filteredGrades = selectedSubject === 'all' 
    ? grades 
    : grades.filter(g => g.subjectName === selectedSubject);

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const gradesData = filteredGrades.map(grade => ({
        subjectName: grade.subjectName || grade.assignmentName,
        grade: grade.score,
        className: '-',
        semester: grade.semester,
        remarks: grade.assignmentType
      }));
      
      pdfExportService.createGradesReport(gradesData, {
        name: child.studentName,
        id: child.studentId
      });
      
      onShowToast('Laporan nilai berhasil diexport ke PDF', 'success');
    } catch (error) {
      logger.error('Failed to export grades PDF:', error);
      onShowToast('Gagal melakukan export PDF', 'error');
    } finally {
      setExporting(false);
    }
  };

  const calculateAverage = (subjectGrades: Grade[]) => {
    if (subjectGrades.length === 0) return 0;
    const total = subjectGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0);
    return Math.round(total / subjectGrades.length);
  };

  return (
    <div className={`${getContainer('CARD_XL')} p-8`}>
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
        Nilai Akademik - {child.studentName}
      </h2>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      ) : grades.length === 0 ? (
        <EmptyState message="Belum ada nilai tersedia" size="md" />
      ) : (
        <>
          {/* Header with Export */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Nilai {child.studentName}
            </h3>
            <PDFExportButton
              onExport={handleExportPDF}
              loading={exporting}
              label="Export Nilai"
            />
          </div>

          {/* Subject Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Filter Mata Pelajaran
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="pb-3 font-semibold text-neutral-900 dark:text-white">Mata Pelajaran</th>
                  <th className="pb-3 font-semibold text-neutral-900 dark:text-white">Tipe</th>
                  <th className="pb-3 font-semibold text-neutral-900 dark:text-white">Nama Tugas</th>
                  <th className="pb-3 font-semibold text-neutral-900 dark:text-white">Nilai</th>
                  <th className="pb-3 font-semibold text-neutral-900 dark:text-white">Tahun</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade) => (
                  <tr key={grade.id} className="border-b border-neutral-100 dark:border-neutral-800">
                    <td className="py-3 text-neutral-900 dark:text-white">{grade.subjectName}</td>
                    <td className="py-3">
                      <Badge variant="info" size="sm">
                        {grade.assignmentType}
                      </Badge>
                    </td>
                    <td className="py-3 text-neutral-600 dark:text-neutral-400">{grade.assignmentName}</td>
                    <td className="py-3">
                      <span className={`font-bold ${
                        grade.score >= 80 ? 'text-green-600 dark:text-green-400' :
                        grade.score >= 70 ? 'text-blue-600 dark:text-blue-400' :
                        grade.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {grade.score}/{grade.maxScore}
                      </span>
                    </td>
                    <td className="py-3 text-neutral-600 dark:text-neutral-400">{grade.academicYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {selectedSubject === 'all' && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(subject => {
                const subjectGrades = grades.filter(g => g.subjectName === subject);
                const avg = calculateAverage(subjectGrades);
                return (
                  <div key={subject} className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{subject}</div>
                    <div className={`text-2xl font-bold ${
                      avg >= 80 ? 'text-green-600 dark:text-green-400' :
                      avg >= 70 ? 'text-blue-600 dark:text-blue-400' :
                      avg >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {avg}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-500">Rata-rata</div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ParentGradesView;
