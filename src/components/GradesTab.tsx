import React from 'react';
import { Grade } from '../data/studentData';

interface GradesTabProps {
  grades: Grade[];
  getGradeColor: (grade: string) => string;
}

const GradesTab: React.FC<GradesTabProps> = ({ grades, getGradeColor }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nilai Akademik</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {grades.map((grade) => (
            <div key={grade.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{grade.subjectName}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Semester {grade.semester} - {grade.academicYear}</p>
                </div>
                <span className={`px-2 py-1 text-sm font-medium rounded-full ${getGradeColor(grade.finalGrade || '')}`}>
                  {grade.finalGrade} ({grade.gradePoint?.toFixed(1)})
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">UTS</p>
                  <p className="font-medium text-gray-900 dark:text-white">{grade.midtermScore || '-'}/100</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">UAS</p>
                  <p className="font-medium text-gray-900 dark:text-white">{grade.finalScore || '-'}/100</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Tugas</p>
                  <p className="font-medium text-gray-900 dark:text-white">{grade.assignmentScore || '-'}/100</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Kehadiran</p>
                  <p className="font-medium text-gray-900 dark:text-white">{grade.attendanceScore || '-'}/100</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GradesTab;