import React from 'react';
import { StudentQuiz } from '../StudentQuiz';
import { Quiz, QuizAttempt } from '../../types';
import { STORAGE_KEYS } from '../../constants';
import { logger } from '../../utils/logger';
import { autoIntegrateQuizAttempt } from '../../services/quizGradeIntegrationService';

interface StudentPortalQuizProps {
  selectedQuiz: Quiz | null;
  currentView: string;
  onSubmit: (attempt: QuizAttempt) => void;
  onCancel: () => void;
  onSetCurrentView: (view: string) => void;
}

export const StudentPortalQuiz: React.FC<StudentPortalQuizProps> = ({
  selectedQuiz,
  currentView,
  onSubmit,
  onCancel,
  onSetCurrentView,
}) => {
  const handleQuizSubmit = async (attempt: QuizAttempt) => {
    logger.info('Quiz submitted:', attempt);

    try {
      const quizzesStr = localStorage.getItem(STORAGE_KEYS.QUIZZES);
      if (quizzesStr) {
        const quizzes: Quiz[] = JSON.parse(quizzesStr);
        const quiz = quizzes.find(q => q.id === attempt.quizId);

        if (quiz && quiz.autoIntegration?.enabled) {
          await autoIntegrateQuizAttempt(attempt, quiz, quiz.teacherId);
        }
      }
    } catch (error) {
      logger.error('Failed to auto-integrate quiz attempt:', error);
    }

    onSubmit(attempt);
  };

  const handleQuizCancel = () => {
    onCancel();
    onSetCurrentView('home');
  };

  if (currentView === 'quiz') {
    return (
      <div className="animate-fade-in-up">
        {!selectedQuiz ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400">
            <p>Pilih kuis dari daftar yang tersedia (Fitur akan tersedia di Phase 3)</p>
            <button
              onClick={() => onSetCurrentView('home')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Kembali
            </button>
          </div>
        ) : (
          <StudentQuiz
            quiz={selectedQuiz}
            onSubmit={handleQuizSubmit}
            onCancel={handleQuizCancel}
          />
        )}
      </div>
    );
  }

  if (currentView === 'quiz-history') {
    return (
      <div className="animate-fade-in-up">
        <div className="p-6 text-center text-gray-600 dark:text-gray-400">Coming Soon: Quiz History</div>
      </div>
    );
  }

  return null;
};

export default StudentPortalQuiz;
