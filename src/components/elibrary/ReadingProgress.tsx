import React from 'react';
import ProgressBar from '../../ui/ProgressBar';

export interface ReadingProgressProps {
  materialId: string;
  title: string;
  currentPosition: number;
  isCompleted: boolean;
  readTime: number;
  lastReadAt?: string;
}

const ReadingProgressDisplay: React.FC<ReadingProgressProps> = ({
  title,
  currentPosition,
  isCompleted,
  readTime,
  lastReadAt
}) => {
  const progressPercent = Math.round(currentPosition * 100);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-blue-600 dark:text-blue-400">Progress Baca</span>
        <span className="text-neutral-600 dark:text-neutral-400">
          {progressPercent}%
        </span>
      </div>
      <ProgressBar
        value={progressPercent}
        size="sm"
        color={isCompleted ? 'green' : 'blue'}
        aria-label={`Reading progress: ${progressPercent}%`}
      />
      {readTime > 0 && (
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Dibaca {readTime}x
        </div>
      )}
      {lastReadAt && (
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          Terakhir: {new Date(lastReadAt).toLocaleDateString('id-ID')}
        </div>
      )}
    </div>
  );
};

export default ReadingProgressDisplay;
