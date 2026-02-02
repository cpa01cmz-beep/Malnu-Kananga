
import React from 'react';
import { calculateFinalGrade } from '../../utils/teacherValidation';
import ProgressBar from '../ui/ProgressBar';

export interface GradingStatsProps {
  grades: Array<{
    id: string;
    name: string;
    nis: string;
    assignment: number;
    midExam: number;
    finalExam: number;
  }>;
}

const GradingStats: React.FC<GradingStatsProps> = ({ grades }) => {
  const calculateGradeStatistics = () => {
    if (grades.length === 0) return null;

    const finalScores = grades.map(g => calculateFinalGrade(g.assignment, g.midExam, g.finalExam));
    const average = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
    const maxScore = Math.max(...finalScores);
    const minScore = Math.min(...finalScores);

    const gradeDistribution = {
      A: finalScores.filter(score => score >= 85).length,
      B: finalScores.filter(score => score >= 75 && score < 85).length,
      C: finalScores.filter(score => score >= 60 && score < 75).length,
      D: finalScores.filter(score => score < 60).length
    };

    return { average, maxScore, minScore, gradeDistribution };
  };

  const stats = calculateGradeStatistics();
  if (!stats) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6 animate-scale-in">
      <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-4">Grade Distribution Statistics</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.average.toFixed(1)}</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Class Average</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.maxScore}</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Highest Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.minScore}</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Lowest Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">{grades.length}</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Students</div>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(stats.gradeDistribution).map(([grade, count]) => {
          const percentage = (count / grades.length) * 100;
          const colorMap: Record<string, 'green' | 'blue' | 'warning' | 'error'> = {
            A: 'green',
            B: 'blue',
            C: 'warning',
            D: 'error'
          };

          return (
            <div key={grade} className="flex items-center gap-3">
              <div className="w-8 text-center font-bold text-neutral-700 dark:text-neutral-300">{grade}</div>
              <ProgressBar
                value={percentage}
                max={100}
                size="xl"
                color={colorMap[grade] || 'primary'}
                showLabel={true}
                label={`${count} students (${percentage.toFixed(1)}%)`}
                aria-label={`Grade ${grade}: ${count} students (${percentage.toFixed(1)}%)`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GradingStats;
