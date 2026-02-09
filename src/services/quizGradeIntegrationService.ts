import { Grade, Quiz, QuizAttempt, AssignmentType } from '../types';
import { gradesAPI } from './apiService';
import { unifiedNotificationManager } from './notifications/unifiedNotificationManager';
import { logger } from '../utils/logger';
import { STORAGE_KEYS, STORAGE_KEY_PATTERNS } from '../constants';

/**
 * Quiz Grade Integration Service
 * 
 * Purpose: Convert QuizAttempt to Grade entries for unified grade analytics
 * 
 * Features:
 * - Automatic grade entry creation from quiz attempts
 * - Deduplication (prevents duplicate grade entries)
 * - Batch processing for multiple quiz attempts
 * - Integration with existing grades API
 * - Error handling and logging
 * - Automatic triggering on quiz completion
 * - Notifications on auto-integration
 * - Audit log for integrated grades
 * 
 * @module quizGradeIntegrationService
 */

interface QuizGradeIntegrationOptions {
  skipExisting: boolean;
  overwriteDuplicates: boolean;
  autoIntegrate?: boolean;
  minPassingScore?: number;
}

export interface QuizAutoIntegrationAudit {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  score: number;
  maxScore: number;
  percentage: number;
  gradeId?: string;
  status: 'success' | 'failed' | 'skipped';
  reason?: string;
  integratedAt: string;
  triggeredBy: 'automatic' | 'manual';
}

interface IntegrationResult {
  success: boolean;
  gradeId?: string;
  error?: string;
  message: string;
}

interface BatchIntegrationResult {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  results: IntegrationResult[];
}

const DEFAULT_OPTIONS: QuizGradeIntegrationOptions = {
  skipExisting: true,
  overwriteDuplicates: false,
  autoIntegrate: true,
  minPassingScore: 0,
};

/**
 * Check if a grade entry already exists for a quiz attempt
 * @param quizAttempt - The quiz attempt to check
 * @returns Existing grade or null
 */
async function findExistingGrade(quizAttempt: QuizAttempt): Promise<Grade | null> {
  try {
    const gradesResponse = await gradesAPI.getAll();
    
    if (!gradesResponse.success || !gradesResponse.data) {
      return null;
    }

    const existing = gradesResponse.data.find(grade =>
      grade.studentId === quizAttempt.studentId &&
      grade.assignmentType === 'quiz' &&
      grade.assignmentName === `Quiz-${quizAttempt.quizId}-attempt-${quizAttempt.attemptNumber}`
    );

    return existing || null;
  } catch (error) {
    logger.error('Error checking for existing grade:', error);
    return null;
  }
}

/**
 * Convert a QuizAttempt to a Grade entry
 * @param quizAttempt - The quiz attempt to convert
 * @param quiz - The quiz metadata
 * @param teacherId - The teacher's user ID
 * @returns Grade object
 */
function convertToGrade(
  quizAttempt: QuizAttempt,
  quiz: Quiz,
  teacherId: string
): Omit<Grade, 'id' | 'createdAt'> {
  return {
    studentId: quizAttempt.studentId,
    subjectId: quiz.subjectId,
    classId: quiz.classId,
    academicYear: quiz.academicYear,
    semester: quiz.semester,
    assignmentType: 'quiz' as AssignmentType,
    assignmentName: `Quiz-${quiz.id}-attempt-${quizAttempt.attemptNumber}`,
    score: quizAttempt.score,
    maxScore: quizAttempt.maxScore,
    createdBy: teacherId,
    subjectName: quiz.subjectName,
  };
}

/**
 * Create a grade entry from a quiz attempt
 * @param quizAttempt - The quiz attempt
 * @param quiz - The quiz metadata
 * @param teacherId - The teacher's user ID
 * @param options - Integration options
 * @returns Integration result
 */
async function integrateQuizAttempt(
  quizAttempt: QuizAttempt,
  quiz: Quiz,
  teacherId: string,
  options: QuizGradeIntegrationOptions = DEFAULT_OPTIONS
): Promise<IntegrationResult> {
  try {
    if (options.skipExisting) {
      const existing = await findExistingGrade(quizAttempt);
      if (existing) {
        return {
          success: false,
          message: `Grade entry already exists for attempt ${quizAttempt.attemptNumber}`,
        };
      }
    }

    const gradeData = convertToGrade(quizAttempt, quiz, teacherId);
    const createResponse = await gradesAPI.create(gradeData);

    if (!createResponse.success) {
      return {
        success: false,
        error: createResponse.error || 'Failed to create grade entry',
        message: 'Failed to create grade entry',
      };
    }

    return {
      success: true,
      gradeId: createResponse.data?.id,
      message: `Grade entry created for quiz attempt ${quizAttempt.attemptNumber}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error integrating quiz attempt:', error);
    return {
      success: false,
      error: errorMessage,
      message: `Failed to integrate quiz attempt: ${errorMessage}`,
    };
  }
}

/**
 * Integrate multiple quiz attempts in batch
 * @param attempts - Array of quiz attempts
 * @param quizzes - Map of quizId to Quiz metadata
 * @param teacherId - The teacher's user ID
 * @param options - Integration options
 * @returns Batch integration result
 */
async function integrateQuizAttemptsBatch(
  attempts: QuizAttempt[],
  quizzes: Map<string, Quiz>,
  teacherId: string,
  options: QuizGradeIntegrationOptions = DEFAULT_OPTIONS
): Promise<BatchIntegrationResult> {
  const results: IntegrationResult[] = [];
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (const attempt of attempts) {
    const quiz = quizzes.get(attempt.quizId);
    
    if (!quiz) {
      results.push({
        success: false,
        error: `Quiz ${attempt.quizId} not found`,
        message: `Quiz ${attempt.quizId} not found`,
      });
      failed++;
      continue;
    }

    const result = await integrateQuizAttempt(attempt, quiz, teacherId, options);
    results.push(result);

    if (result.success) {
      succeeded++;
    } else if (result.message.includes('already exists')) {
      skipped++;
    } else {
      failed++;
    }
  }

  return {
    total: attempts.length,
    succeeded,
    failed,
    skipped,
    results,
  };
}

/**
 * Get quiz attempts from localStorage
 * @param studentId - Optional student ID filter
 * @param quizId - Optional quiz ID filter
 * @returns Array of quiz attempts
 */
function getQuizAttempts(
  studentId?: string,
  quizId?: string
): QuizAttempt[] {
  try {
    const allAttempts: QuizAttempt[] = [];
    
    if (quizId) {
      const specificKey = STORAGE_KEYS.QUIZ_ATTEMPTS(quizId);
      const stored = localStorage.getItem(specificKey);
      
      if (stored) {
        allAttempts.push(...JSON.parse(stored));
      }
    } else {
      const storageKeys = Object.keys(localStorage);
      const quizAttemptKeys = storageKeys.filter(key => key.startsWith(STORAGE_KEY_PATTERNS.QUIZ_ATTEMPTS));
      
      for (const key of quizAttemptKeys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          allAttempts.push(...JSON.parse(stored));
        }
      }
    }

    let attempts = allAttempts;

    if (studentId) {
      attempts = attempts.filter(a => a.studentId === studentId);
    }

    return attempts;
  } catch (error) {
    logger.error('Error loading quiz attempts:', error);
    return [];
  }
}

/**
 * Get quiz metadata from localStorage
 * @param quizId - The quiz ID
 * @returns Quiz object or null
 */
function getQuiz(quizId: string): Quiz | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    
    if (!stored) {
      return null;
    }

    const quizzes: Quiz[] = JSON.parse(stored);
    return quizzes.find(q => q.id === quizId) || null;
  } catch (error) {
    logger.error('Error loading quiz:', error);
    return null;
  }
}

/**
 * Main integration function: integrate all pending quiz attempts
 * @param teacherId - The teacher's user ID
 * @param options - Integration options
 * @returns Batch integration result
 */
async function integrateAllQuizAttempts(
  teacherId: string,
  options: QuizGradeIntegrationOptions = DEFAULT_OPTIONS
): Promise<BatchIntegrationResult> {
  const attempts = getQuizAttempts();
  
  if (attempts.length === 0) {
    return {
      total: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      results: [],
    };
  }

  const uniqueQuizIds = [...new Set(attempts.map(a => a.quizId))];
  const quizzes = new Map<string, Quiz>();

  for (const quizId of uniqueQuizIds) {
    const quiz = getQuiz(quizId);
    if (quiz) {
      quizzes.set(quizId, quiz);
    }
  }

  return integrateQuizAttemptsBatch(attempts, quizzes, teacherId, options);
}

/**
 * Integrate quiz attempts for a specific student
 * @param studentId - The student's ID
 * @param teacherId - The teacher's user ID
 * @param options - Integration options
 * @returns Batch integration result
 */
async function integrateStudentQuizAttempts(
  studentId: string,
  teacherId: string,
  options: QuizGradeIntegrationOptions = DEFAULT_OPTIONS
): Promise<BatchIntegrationResult> {
  const attempts = getQuizAttempts(studentId);
  
  if (attempts.length === 0) {
    return {
      total: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      results: [],
    };
  }

  const uniqueQuizIds = [...new Set(attempts.map(a => a.quizId))];
  const quizzes = new Map<string, Quiz>();

  for (const quizId of uniqueQuizIds) {
    const quiz = getQuiz(quizId);
    if (quiz) {
      quizzes.set(quizId, quiz);
    }
  }

  return integrateQuizAttemptsBatch(attempts, quizzes, teacherId, options);
}

/**
 * Integrate a specific quiz's attempts
 * @param quizId - The quiz ID
 * @param teacherId - The teacher's user ID
 * @param options - Integration options
 * @returns Batch integration result
 */
async function integrateQuizAttempts(
  quizId: string,
  teacherId: string,
  options: QuizGradeIntegrationOptions = DEFAULT_OPTIONS
): Promise<BatchIntegrationResult> {
  const attempts = getQuizAttempts(undefined, quizId);
  const quiz = getQuiz(quizId);
  
  if (!quiz || attempts.length === 0) {
    return {
      total: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      results: [],
    };
  }

  const quizzes = new Map<string, Quiz>();
  quizzes.set(quizId, quiz);

  return integrateQuizAttemptsBatch(attempts, quizzes, teacherId, options);
}

/**
 * Delete grade entries created from quiz attempts
 * @param quizId - The quiz ID
 * @returns Success indicator
 */
async function removeQuizGrades(quizId: string): Promise<{ success: boolean; deleted: number }> {
  try {
    const gradesResponse = await gradesAPI.getAll();
    
    if (!gradesResponse.success || !gradesResponse.data) {
      return { success: false, deleted: 0 };
    }

    const quizGrades = gradesResponse.data.filter(grade =>
      grade.assignmentType === 'quiz' &&
      grade.assignmentName.includes(`Quiz-${quizId}-`)
    );

    let deleted = 0;
    for (const grade of quizGrades) {
      const deleteResponse = await gradesAPI.delete(grade.id);
      if (deleteResponse.success) {
        deleted++;
      }
    }

    return { success: true, deleted };
  } catch (error) {
    logger.error('Error removing quiz grades:', error);
    return { success: false, deleted: 0 };
  }
}

/**
 * Get statistics on quiz-grade integration status
 * @returns Integration statistics
 */
function getIntegrationStatus(): {
  totalAttempts: number;
  integratedCount: number;
  pendingCount: number;
} {
  const attempts = getQuizAttempts();
  
  return {
    totalAttempts: attempts.length,
    integratedCount: 0,
    pendingCount: attempts.length,
  };
}

/**
 * Save audit log entry for auto-integrated grades
 * @param auditEntry - Audit entry to save
 */
function saveAuditLog(auditEntry: QuizAutoIntegrationAudit): void {
  try {
    const auditLogs = getAuditLogs();
    auditLogs.push(auditEntry);
    localStorage.setItem(
      STORAGE_KEYS.QUIZ_GRADE_INTEGRATION_AUDIT,
      JSON.stringify(auditLogs)
    );
    logger.debug('Audit log saved:', auditEntry);
  } catch (error) {
    logger.error('Failed to save audit log:', error);
  }
}

/**
 * Get audit logs for auto-integrated grades
 * @returns Array of audit log entries
 */
function getAuditLogs(): QuizAutoIntegrationAudit[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_GRADE_INTEGRATION_AUDIT);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    logger.error('Failed to load audit logs:', error);
    return [];
  }
}

/**
 * Check if quiz meets auto-integration criteria
 * @param quiz - Quiz to check
 * @param attempt - Quiz attempt to check
 * @returns Validation result
 */
function checkAutoIntegrationEligibility(
  quiz: Quiz,
  attempt: QuizAttempt
): { eligible: boolean; reason?: string } {
  if (!quiz.autoIntegration?.enabled) {
    return { eligible: false, reason: 'Auto-integration disabled for quiz' };
  }

  const minScore = quiz.autoIntegration.minPassingScore ?? quiz.passingScore;
  if (attempt.percentage < minScore) {
    return {
      eligible: false,
      reason: `Score ${attempt.percentage}% below minimum ${minScore}%`,
    };
  }

  if (!quiz.autoIntegration.includeEssays) {
    const hasEssayQuestions = quiz.questions.some(q => q.type === 'essay');
    if (hasEssayQuestions) {
      return {
        eligible: false,
        reason: 'Essay questions require manual grading',
      };
    }
  }

  return { eligible: true };
}

/**
 * Automatically integrate a quiz attempt on completion
 * @param attempt - Quiz attempt to integrate
 * @param quiz - Quiz metadata
 * @param teacherId - Teacher's user ID
 * @returns Integration result
 */
async function autoIntegrateQuizAttempt(
  attempt: QuizAttempt,
  quiz: Quiz,
  teacherId: string
): Promise<IntegrationResult> {
  try {
    const eligibility = checkAutoIntegrationEligibility(quiz, attempt);
    
    if (!eligibility.eligible) {
      const auditEntry: QuizAutoIntegrationAudit = {
        id: `audit_${Date.now()}`,
        quizId: quiz.id,
        quizTitle: quiz.title,
        studentId: attempt.studentId,
        studentName: attempt.studentName,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        status: 'skipped',
        reason: eligibility.reason,
        integratedAt: new Date().toISOString(),
        triggeredBy: 'automatic',
      };
      
      saveAuditLog(auditEntry);
      
      return {
        success: false,
        message: `Auto-integration skipped: ${eligibility.reason}`,
      };
    }

    const result = await integrateQuizAttempt(
      attempt,
      quiz,
      teacherId,
      DEFAULT_OPTIONS
    );

    if (result.success) {
      const auditEntry: QuizAutoIntegrationAudit = {
        id: `audit_${Date.now()}`,
        quizId: quiz.id,
        quizTitle: quiz.title,
        studentId: attempt.studentId,
        studentName: attempt.studentName,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        gradeId: result.gradeId,
        status: 'success',
        integratedAt: new Date().toISOString(),
        triggeredBy: 'automatic',
      };
      
      saveAuditLog(auditEntry);

      await unifiedNotificationManager.notifyGradeUpdate(
        attempt.studentName,
        quiz.subjectName || quiz.subjectId,
        undefined,
        attempt.score
      );

      logger.info(
        `Auto-integrated quiz attempt: ${attempt.quizId} - ${attempt.studentName} (${attempt.percentage}%)`
      );
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Auto-integration failed:', error);
    
    const auditEntry: QuizAutoIntegrationAudit = {
      id: `audit_${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentId: attempt.studentId,
      studentName: attempt.studentName,
      attemptNumber: attempt.attemptNumber,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      status: 'failed',
      reason: errorMessage,
      integratedAt: new Date().toISOString(),
      triggeredBy: 'automatic',
    };
    
    saveAuditLog(auditEntry);

    return {
      success: false,
      error: errorMessage,
      message: `Auto-integration failed: ${errorMessage}`,
    };
  }
}

/**
 * Retroactively integrate all pending quiz attempts (batch operation)
 * @param teacherId - Teacher's user ID
 * @param options - Integration options
 * @returns Batch integration result
 */
async function retroactiveIntegration(
  teacherId: string,
  options: QuizGradeIntegrationOptions = DEFAULT_OPTIONS
): Promise<BatchIntegrationResult> {
  logger.info('Starting retroactive integration of pending quiz attempts...');
  
  const attempts = getQuizAttempts();
  
  if (attempts.length === 0) {
    logger.info('No pending quiz attempts found');
    return {
      total: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      results: [],
    };
  }

  const uniqueQuizIds = [...new Set(attempts.map(a => a.quizId))];
  const quizzes = new Map<string, Quiz>();

  for (const quizId of uniqueQuizIds) {
    const quiz = getQuiz(quizId);
    if (quiz) {
      quizzes.set(quizId, quiz);
    }
  }

  const results: IntegrationResult[] = [];
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (const attempt of attempts) {
    const quiz = quizzes.get(attempt.quizId);
    
    if (!quiz) {
      results.push({
        success: false,
        error: `Quiz ${attempt.quizId} not found`,
        message: `Quiz ${attempt.quizId} not found`,
      });
      failed++;
      continue;
    }

    const result = await integrateQuizAttempt(attempt, quiz, teacherId, options);
    results.push(result);

    if (result.success) {
      succeeded++;
    } else if (result.message.includes('already exists')) {
      skipped++;
    } else {
      failed++;
    }
  }

  logger.info(
    `Retroactive integration complete: ${succeeded} succeeded, ${failed} failed, ${skipped} skipped`
  );

  return {
    total: attempts.length,
    succeeded,
    failed,
    skipped,
    results,
  };
}

export type {
  QuizGradeIntegrationOptions,
  IntegrationResult,
  BatchIntegrationResult,
};
export {
  integrateQuizAttempt,
  integrateQuizAttemptsBatch,
  integrateAllQuizAttempts,
  integrateStudentQuizAttempts,
  integrateQuizAttempts,
  removeQuizGrades,
  getIntegrationStatus,
  getQuizAttempts,
  getQuiz,
  findExistingGrade,
  convertToGrade,
  autoIntegrateQuizAttempt,
  retroactiveIntegration,
  getAuditLogs,
  checkAutoIntegrationEligibility,
  saveAuditLog,
};
