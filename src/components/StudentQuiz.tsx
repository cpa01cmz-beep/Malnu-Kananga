import React, { useState, useEffect, useCallback } from 'react';
import type { Quiz, QuizQuestion, QuizAttempt } from '../types';
import { QuizQuestionType } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import Badge from './ui/Badge';
import Modal from './ui/Modal';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { logger } from '../utils/logger';
import { STORAGE_KEYS } from '../constants';

interface StudentQuizProps {
  quiz: Quiz;
  onSubmit: (attempt: QuizAttempt) => void;
  onCancel: () => void;
}

interface QuizProgress {
  currentQuestion: number;
  answers: Record<string, string | string[]>;
  timeRemaining: number;
  startTime: number;
}

interface QuestionProps {
  question: QuizQuestion;
  index: number;
  answer: string | string[];
  onAnswerChange: (answer: string | string[]) => void;
  disabled: boolean;
}

function QuestionRenderer({ question, answer, onAnswerChange, disabled }: QuestionProps) {
  const handleChange = (value: string) => {
    onAnswerChange(value);
  };

  if (question.type === QuizQuestionType.MULTIPLE_CHOICE) {
    return (
      <div className="space-y-3 mt-4">
        {question.options?.map((option, optIndex) => (
          <label
            key={optIndex}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              answer === option
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option}
              checked={answer === option}
              onChange={(e) => !disabled && handleChange(e.target.value)}
              disabled={disabled}
              className="mt-1 h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="flex-1 text-gray-900 dark:text-gray-100">
              <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
              {option}
            </span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === QuizQuestionType.TRUE_FALSE) {
    return (
      <div className="space-y-3 mt-4">
        {['Benar', 'Salah'].map((option) => (
          <label
            key={option}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              answer === option
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option}
              checked={answer === option}
              onChange={(e) => !disabled && handleChange(e.target.value)}
              disabled={disabled}
              className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-900 dark:text-gray-100">{option}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === QuizQuestionType.SHORT_ANSWER || question.type === QuizQuestionType.ESSAY) {
    return (
      <div className="mt-4">
        <Textarea
          value={answer as string}
          onChange={(e) => !disabled && handleChange(e.target.value)}
          disabled={disabled}
          placeholder={
            question.type === QuizQuestionType.SHORT_ANSWER
              ? 'Masukkan jawaban singkat...'
              : 'Masukkan jawaban esai...'
          }
          rows={question.type === QuizQuestionType.ESSAY ? 6 : 2}
          className="w-full"
        />
      </div>
    );
  }

  return null;
}

export function StudentQuiz({ quiz, onSubmit, onCancel }: StudentQuizProps) {
  const [progress, setProgress] = useState<QuizProgress>({
    currentQuestion: 0,
    answers: {},
    timeRemaining: quiz.duration * 60,
    startTime: Date.now(),
  });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState<string[]>([]);

  const currentQuestion = quiz.questions[progress.currentQuestion];
  const progressPercentage = ((progress.currentQuestion + 1) / quiz.questions.length) * 100;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: string | string[]) => {
    setProgress(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: answer,
      },
    }));
  };

  const handlePrevious = () => {
    if (progress.currentQuestion > 0) {
      setProgress(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    }
  };

  const handleNext = () => {
    if (progress.currentQuestion < quiz.questions.length - 1) {
      setProgress(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
      }));
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setProgress(prev => ({
      ...prev,
      currentQuestion: index,
    }));
  };

  const validateQuiz = useCallback((): { valid: boolean; unanswered: string[] } => {
    const unanswered: string[] = [];
    
    quiz.questions.forEach((question) => {
      const answer = progress.answers[question.id];
      if (!answer || (typeof answer === 'string' && !answer.trim())) {
        unanswered.push(question.id);
      }
    });

    return {
      valid: unanswered.length === 0,
      unanswered,
    };
  }, [quiz.questions, progress.answers]);

  const calculateScore = useCallback((): number => {
    let totalScore = 0;

    quiz.questions.forEach((question) => {
      const studentAnswer = progress.answers[question.id];
      if (!studentAnswer) return;

      if (question.type === QuizQuestionType.MULTIPLE_CHOICE) {
        if (studentAnswer === question.correctAnswer) {
          totalScore += question.points;
        }
      } else if (question.type === QuizQuestionType.TRUE_FALSE) {
        if (studentAnswer === question.correctAnswer) {
          totalScore += question.points;
        }
      } else if (question.type === QuizQuestionType.SHORT_ANSWER) {
        const correctAnswer = question.correctAnswer as string;
        if (studentAnswer.toString().toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
          totalScore += question.points;
        }
      }
    });

    return totalScore;
  }, [quiz.questions, progress.answers]);

  const handleSubmit = () => {
    const validation = validateQuiz();
    if (!validation.valid) {
      setUnansweredQuestions(validation.unanswered);
      setShowSubmitModal(false);
      return;
    }

    const timeSpent = Math.floor((Date.now() - progress.startTime) / 1000);
    const score = calculateScore();
    const maxScore = quiz.totalPoints;
    const percentage = (score / maxScore) * 100;
    const passed = percentage >= quiz.passingScore;

    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      quizId: quiz.id,
      studentId: '', 
      studentName: '',
      answers: progress.answers,
      score,
      maxScore,
      percentage,
      passed,
      startedAt: new Date(progress.startTime).toISOString(),
      submittedAt: new Date().toISOString(),
      timeSpent,
      attemptNumber: 1,
    };

    onSubmit(attempt);
  };

  const handleCancelSubmit = () => {
    setShowSubmitModal(false);
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    try {
      handleSubmit();
    } catch (error) {
      logger.error('Failed to submit quiz:', error);
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = useCallback(() => {
    logger.info('Quiz time expired, auto-submitting...');
    const timeSpent = Math.floor((Date.now() - progress.startTime) / 1000);
    const score = calculateScore();
    const maxScore = quiz.totalPoints;
    const percentage = (score / maxScore) * 100;
    const passed = percentage >= quiz.passingScore;

    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      quizId: quiz.id,
      studentId: '', 
      studentName: '',
      answers: progress.answers,
      score,
      maxScore,
      percentage,
      passed,
      startedAt: new Date(progress.startTime).toISOString(),
      submittedAt: new Date().toISOString(),
      timeSpent,
      attemptNumber: 1,
    };

    onSubmit(attempt);
  }, [progress, quiz, calculateScore, onSubmit]);

  const handleAutoSave = useCallback(() => {
    try {
      const autoSaveData = {
        quizId: quiz.id,
        currentQuestion: progress.currentQuestion,
        answers: progress.answers,
        timeRemaining: progress.timeRemaining,
        startTime: progress.startTime,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        STORAGE_KEYS.QUIZ_AUTO_SAVE(quiz.id),
        JSON.stringify(autoSaveData)
      );
      logger.debug('Quiz auto-saved:', autoSaveData);
    } catch (error) {
      logger.error('Failed to auto-save quiz:', error);
    }
  }, [quiz.id, progress]);

  const loadAutoSave = useCallback(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEYS.QUIZ_AUTO_SAVE(quiz.id));
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setProgress(prev => ({
          ...prev,
          currentQuestion: parsed.currentQuestion,
          answers: parsed.answers,
          timeRemaining: parsed.timeRemaining,
          startTime: parsed.startTime,
        }));
        logger.debug('Quiz auto-save loaded:', parsed);
      }
    } catch (error) {
      logger.error('Failed to load auto-save:', error);
    }
  }, [quiz.id]);

  const clearAutoSave = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.QUIZ_AUTO_SAVE(quiz.id));
      logger.debug('Quiz auto-save cleared');
    } catch (error) {
      logger.error('Failed to clear auto-save:', error);
    }
  }, [quiz.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const newTimeRemaining = Math.max(0, prev.timeRemaining - 1);
        
        if (newTimeRemaining === 60 && !showTimeWarning) {
          setShowTimeWarning(true);
        }
        
        if (newTimeRemaining <= 0) {
          clearInterval(timer);
          return prev;
        }
        
        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimeWarning]);

  useEffect(() => {
    if (progress.timeRemaining <= 0) {
      handleAutoSubmit();
    }
  }, [progress.timeRemaining, handleAutoSubmit]);

  useEffect(() => {
    loadAutoSave();

    const autoSaveInterval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => {
      clearInterval(autoSaveInterval);
      clearAutoSave();
    };
  }, [loadAutoSave, handleAutoSave, clearAutoSave]);

  const isLastQuestion = progress.currentQuestion === quiz.questions.length - 1;
  const isFirstQuestion = progress.currentQuestion === 0;
  const hasAnswer = progress.answers[currentQuestion.id] !== undefined;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {quiz.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {quiz.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onCancel}>
              Batal
            </Button>
          </div>
        </div>

        <Card className={`p-4 ${
          progress.timeRemaining <= 60 ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
          progress.timeRemaining <= 300 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
          'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Waktu Tersisa
                </span>
                <p className={`text-2xl font-bold ${
                  progress.timeRemaining <= 60 ? 'text-red-600 dark:text-red-400' :
                  progress.timeRemaining <= 300 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-gray-900 dark:text-gray-100'
                }`}>
                  {formatTime(progress.timeRemaining)}
                </p>
              </div>
              {showTimeWarning && (
                <Badge variant="warning">
                  ⚠️ Kurang dari 1 menit!
                </Badge>
              )}
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Progres
              </span>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {progress.currentQuestion + 1} dari {quiz.questions.length}
              </p>
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
            hasAnswer
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
          }`}>
            {progress.currentQuestion + 1}
          </span>
          <div className="flex-1">
            <p className="font-medium text-lg text-gray-900 dark:text-gray-100">
              {currentQuestion.question}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="info" size="sm">
                {currentQuestion.type.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" size="sm">
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="outline" size="sm">
                {currentQuestion.points} poin
              </Badge>
            </div>
          </div>
        </div>

        <QuestionRenderer
          question={currentQuestion}
          index={progress.currentQuestion}
          answer={progress.answers[currentQuestion.id] || ''}
          onAnswerChange={handleAnswerChange}
          disabled={isSubmitting}
        />

        {unansweredQuestions.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              ⚠️ {unansweredQuestions.length} pertanyaan belum dijawab. Harap jawab semua pertanyaan sebelum mengirim.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstQuestion || isSubmitting}
          >
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            Sebelumnya
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={() => setShowSubmitModal(true)}
              disabled={!hasAnswer || isSubmitting}
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              Kirim Kuis
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!hasAnswer || isSubmitting}
            >
              Selanjutnya
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Navigasi Pertanyaan
        </h3>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {quiz.questions.map((_, index) => {
            const isAnswered = progress.answers[quiz.questions[index].id] !== undefined;
            const isCurrent = index === progress.currentQuestion;
            return (
              <button
                key={index}
                onClick={() => handleJumpToQuestion(index)}
                disabled={isSubmitting}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                  isCurrent
                    ? 'bg-blue-500 text-white'
                    : isAnswered
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                } ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                aria-label={`Pergi ke pertanyaan ${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </Card>

      {showSubmitModal && (
        <Modal
          isOpen
          onClose={handleCancelSubmit}
          title="Konfirmasi Pengiriman"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Anda yakin ingin mengirim kuis ini?
            </p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Jawaban</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {Object.keys(progress.answers).length}/{quiz.questions.length}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Waktu</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {formatTime(Math.floor((Date.now() - progress.startTime) / 1000))}
                </p>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Setelah dikirim, jawaban tidak dapat diubah.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancelSubmit} disabled={isSubmitting}>
                Batal
              </Button>
              <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Mengirim...' : 'Ya, Kirim Kuis'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
