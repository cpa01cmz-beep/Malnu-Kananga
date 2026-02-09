
import React from 'react';
import FieldVoiceInput from '../FieldVoiceInput';
import { calculateFinalGrade, calculateGradeLetter, validateGradeInput } from '../../utils/teacherValidation';
import { VoiceLanguage } from '../../types';
import Button from '../ui/Button';
import { logger } from '../../utils/logger';
import { GRADE_LIMITS } from '../../constants';

export interface GradingListProps {
  grades: Array<{
    id: string;
    name: string;
    nis: string;
    assignment: number;
    midExam: number;
    finalExam: number;
  }>;
  isBatchMode: boolean;
  isEditing: string | null;
  selectedStudents: Set<string>;
  inlineErrors: Record<string, Record<string, string> | undefined>;
  onGradeEdit: (id: string, field: 'assignment' | 'midExam' | 'finalExam', value: string) => void;
  onReset: (id: string, name: string) => void;
  toggleStudentSelection: (id: string) => void;
  setResetDialog: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    studentId: string;
    studentName: string;
  }>>;
}

const GradingList: React.FC<GradingListProps> = ({
  grades,
  isBatchMode,
  isEditing,
  selectedStudents,
  inlineErrors,
  onGradeEdit,
  onReset,
  toggleStudentSelection,
  setResetDialog,
}) => {

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
          <thead className="bg-neutral-50 dark:bg-neutral-700 text-xs uppercase font-semibold text-neutral-500 dark:text-neutral-400">
            <tr>
              {isBatchMode && (
                <th className="px-4 py-4 text-center w-12">Select</th>
              )}
              <th className="px-6 py-4">Siswa</th>
              <th className="px-4 py-4 text-center w-24">Tugas (30%)</th>
              <th className="px-4 py-4 text-center w-24">UTS (30%)</th>
              <th className="px-4 py-4 text-center w-24">UAS (40%)</th>
              <th className="px-6 py-4 text-center">Nilai Akhir</th>
              <th className="px-6 py-4 text-center">Predikat</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {grades.map((student) => {
              const finalScore = calculateFinalGrade(student.assignment, student.midExam, student.finalExam);
              const gradeLetter = calculateGradeLetter(finalScore);
              const isSelected = selectedStudents.has(student.id);

              return (
                <tr key={student.id} className={`hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}>
                  {isBatchMode && (
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleStudentSelection(student.id)}
                        aria-label={`Pilih siswa ${student.name}`}
                        className="w-4 h-4 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900 dark:text-white">{student.name}</div>
                    <div className="text-xs text-neutral-500">NIS: {student.nis}</div>
                  </td>

                  <td className="px-2 py-4 text-center sm:px-4">
                    <div className="flex flex-row items-center justify-center gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="number"
                          value={student.assignment}
                          onChange={(e) => onGradeEdit(student.id, 'assignment', e.target.value)}
                           min={GRADE_LIMITS.MIN}
                          max={GRADE_LIMITS.MAX}
                          aria-label={`Nilai assignment untuk ${student.name}`}
                          className={`w-full sm:max-w-16 text-center p-1 rounded border bg-white dark:bg-neutral-800 focus:ring-2 ${
                            inlineErrors[student.id]?.assignment
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-neutral-200 dark:border-neutral-600 focus:ring-green-500'
                          }`}
                        />
                        {inlineErrors[student.id]?.assignment && (
                          <span className="text-xs text-red-600 dark:text-red-400 max-w-20 truncate">
                            {inlineErrors[student.id]!.assignment}
                          </span>
                        )}
                      </div>
                      <FieldVoiceInput
                        fieldName={`assignment-${student.id}`}
                        fieldLabel="Nilai Tugas"
                        fieldType={{ type: 'number' }}
                        onValueChange={(value) => onGradeEdit(student.id, 'assignment', value)}
                        language={VoiceLanguage.Indonesian}
                        compact={true}
                        showFeedback={false}
                      />
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center sm:px-4">
                    <div className="flex flex-row items-center justify-center gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="number"
                          value={student.midExam}
                          onChange={(e) => onGradeEdit(student.id, 'midExam', e.target.value)}
                           min={GRADE_LIMITS.MIN}
                          max={GRADE_LIMITS.MAX}
                          aria-label={`Nilai UTS untuk ${student.name}`}
                          className={`w-full sm:max-w-16 text-center p-1 rounded border bg-white dark:bg-neutral-800 focus:ring-2 ${
                            inlineErrors[student.id]?.midExam
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-neutral-200 dark:border-neutral-600 focus:ring-green-500'
                          }`}
                        />
                        {inlineErrors[student.id]?.midExam && (
                          <span className="text-xs text-red-600 dark:text-red-400 max-w-20 truncate">
                            {inlineErrors[student.id]!.midExam}
                          </span>
                        )}
                      </div>
                      <FieldVoiceInput
                        fieldName={`midExam-${student.id}`}
                        fieldLabel="Nilai UTS"
                        fieldType={{ type: 'number' }}
                        onValueChange={(value) => onGradeEdit(student.id, 'midExam', value)}
                        language={VoiceLanguage.Indonesian}
                        compact={true}
                        showFeedback={false}
                      />
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center sm:px-4">
                    <div className="flex flex-row items-center justify-center gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="number"
                          value={student.finalExam}
                          onChange={(e) => onGradeEdit(student.id, 'finalExam', e.target.value)}
                           min={GRADE_LIMITS.MIN}
                          max={GRADE_LIMITS.MAX}
                          aria-label={`Nilai UAS untuk ${student.name}`}
                          className={`w-full sm:max-w-16 text-center p-1 rounded border bg-white dark:bg-neutral-800 focus:ring-2 ${
                            inlineErrors[student.id]?.finalExam
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-neutral-200 dark:border-neutral-600 focus:ring-green-500'
                          }`}
                        />
                        {inlineErrors[student.id]?.finalExam && (
                          <span className="text-xs text-red-600 dark:text-red-400 max-w-20 truncate">
                            {inlineErrors[student.id]!.finalExam}
                          </span>
                        )}
                      </div>
                      <FieldVoiceInput
                        fieldName={`finalExam-${student.id}`}
                        fieldLabel="Nilai UAS"
                        fieldType={{ type: 'number' }}
                        onValueChange={(value) => onGradeEdit(student.id, 'finalExam', value)}
                        language={VoiceLanguage.Indonesian}
                        compact={true}
                        showFeedback={false}
                      />
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center font-bold text-neutral-900 dark:text-white">
                    <div className="flex flex-col">
                      <span>{finalScore.toFixed(1)}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {calculateFinalGrade(student.assignment, student.midExam, student.finalExam).toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        gradeLetter === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                        gradeLetter === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                        gradeLetter === 'C' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                    }`}>
                      {gradeLetter}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      {isEditing === student.id && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => {
                            const validation = validateGradeInput({
                              assignment: student.assignment,
                              midExam: student.midExam,
                              finalExam: student.finalExam
                            });

                            if (!validation.isValid) {
                              logger.error('Validation failed:', validation.errors);
                              return;
                            }

                            onReset(student.id, student.name);
                          }}
                        >
                          Simpan
                        </Button>
                      )}
                      <button
                        onClick={() => {
                          setResetDialog({
                            isOpen: true,
                            studentId: student.id,
                            studentName: student.name
                          });
                        }}
                        className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
                      >
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradingList;
