
import React from 'react';
import FieldVoiceInput from '../FieldVoiceInput';
import { calculateFinalGrade, calculateGradeLetter } from '../../utils/teacherValidation';
import { VoiceLanguage } from '../../types';

export interface GradeInputRowProps {
  student: {
    id: string;
    name: string;
    nis: string;
    assignment: number;
    midExam: number;
    finalExam: number;
  };
  _isEditing: boolean;
  inlineErrors: Record<string, string> | undefined;
  onInputChange: (id: string, field: 'assignment' | 'midExam' | 'finalExam', value: string) => void;
}

const GradeInputRow: React.FC<GradeInputRowProps> = ({ student, _isEditing, inlineErrors, onInputChange }) => {
  const finalScore = calculateFinalGrade(student.assignment, student.midExam, student.finalExam);
  const gradeLetter = calculateGradeLetter(finalScore);

  return (
    <>
      <td className="px-2 py-4 text-center sm:px-4">
        <div className="flex flex-row items-center justify-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <input
              type="number"
              value={student.assignment}
              onChange={(e) => onInputChange(student.id, 'assignment', e.target.value)}
              min="0"
              max="100"
              aria-label={`Nilai assignment untuk ${student.name}`}
              className={`w-full sm:max-w-16 text-center p-1 rounded border bg-white dark:bg-neutral-800 focus:ring-2 ${
                inlineErrors?.assignment
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-200 dark:border-neutral-600 focus:ring-green-500'
              }`}
            />
            {inlineErrors?.assignment && (
              <span className="text-xs text-red-600 dark:text-red-400 max-w-20 truncate">
                {inlineErrors.assignment}
              </span>
            )}
          </div>
          <FieldVoiceInput
            fieldName={`assignment-${student.id}`}
            fieldLabel="Nilai Tugas"
            fieldType={{ type: 'number' }}
            onValueChange={(value) => onInputChange(student.id, 'assignment', value)}
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
              onChange={(e) => onInputChange(student.id, 'midExam', e.target.value)}
              min="0"
              max="100"
              aria-label={`Nilai UTS untuk ${student.name}`}
              className={`w-full sm:max-w-16 text-center p-1 rounded border bg-white dark:bg-neutral-800 focus:ring-2 ${
                inlineErrors?.midExam
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-200 dark:border-neutral-600 focus:ring-green-500'
              }`}
            />
            {inlineErrors?.midExam && (
              <span className="text-xs text-red-600 dark:text-red-400 max-w-20 truncate">
                {inlineErrors.midExam}
              </span>
            )}
          </div>
          <FieldVoiceInput
            fieldName={`midExam-${student.id}`}
            fieldLabel="Nilai UTS"
            fieldType={{ type: 'number' }}
            onValueChange={(value) => onInputChange(student.id, 'midExam', value)}
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
              onChange={(e) => onInputChange(student.id, 'finalExam', e.target.value)}
              min="0"
              max="100"
              aria-label={`Nilai UAS untuk ${student.name}`}
              className={`w-full sm:max-w-16 text-center p-1 rounded border bg-white dark:bg-neutral-800 focus:ring-2 ${
                inlineErrors?.finalExam
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-200 dark:border-neutral-600 focus:ring-green-500'
              }`}
            />
            {inlineErrors?.finalExam && (
              <span className="text-xs text-red-600 dark:text-red-400 max-w-20 truncate">
                {inlineErrors.finalExam}
              </span>
            )}
          </div>
          <FieldVoiceInput
            fieldName={`finalExam-${student.id}`}
            fieldLabel="Nilai UAS"
            fieldType={{ type: 'number' }}
            onValueChange={(value) => onInputChange(student.id, 'finalExam', value)}
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
    </>
  );
};

export default GradeInputRow;
