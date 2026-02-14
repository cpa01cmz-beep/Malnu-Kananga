import { STORAGE_KEYS } from '../constants';
import { EXAM_CONFIG, EXAM_STATUS, type ExamAttemptAuditLog, type ExamAuditEvent } from '../config/exam-config';
import type { Quiz, QuizAttempt, QuizQuestion } from '../types/quiz';
import { generateId } from '../utils/idGenerator';
import { logger } from '../utils/logger';

export interface ExamSession {
    examId: string;
    exam: Quiz;
    studentId: string;
    studentName: string;
    status: string;
    startTime: number;
    endTime: number;
    remainingTime: number;
    currentQuestionIndex: number;
    answers: Record<string, string | string[]>;
    tabSwitchCount: number;
    pausedTime: number;
    auditLog: ExamAttemptAuditLog[];
    randomizedQuestions?: string[];
    questionOrder: number[];
}

export interface ExamStartResult {
    success: boolean;
    session?: ExamSession;
    message: string;
    remainingAttempts?: number;
}

export interface ExamSubmitResult {
    success: boolean;
    attempt?: QuizAttempt;
    message: string;
}

class OnlineAssessmentService {
    private activeSession: ExamSession | null = null;
    private timerInterval: ReturnType<typeof setInterval> | null = null;
    private visibilityChangeHandler: (() => void) | null = null;
    private beforeUnloadHandler: ((e: Event) => void) | null = null;
    private copyPasteHandler: ((e: Event) => void) | null = null;

    private getStorageKey(studentId: string, examId: string): string {
        return `${EXAM_CONFIG.STORAGE_PREFIX}${studentId}_${examId}`;
    }

    startExam(exam: Quiz, studentId: string, studentName: string): ExamStartResult {
        try {
            const existingAttempts = this.getAttemptCount(studentId, exam.id);
            if (existingAttempts >= EXAM_CONFIG.MAX_ATTEMPTS) {
                return {
                    success: false,
                    message: `Anda telah mencapai batas maksimal ${EXAM_CONFIG.MAX_ATTEMPTS} kali percobaan.`,
                };
            }

            const now = Date.now();
            const durationMs = exam.duration * 60 * 1000;
            
            let questionOrder: number[] = [];
            if (exam.randomizeQuestions) {
                questionOrder = this.shuffleArray(Array.from({ length: exam.questions.length }, (_, i) => i));
            } else {
                questionOrder = Array.from({ length: exam.questions.length }, (_, i) => i);
            }

            const session: ExamSession = {
                examId: exam.id,
                exam,
                studentId,
                studentName,
                status: EXAM_STATUS.IN_PROGRESS,
                startTime: now,
                endTime: now + durationMs,
                remainingTime: durationMs,
                currentQuestionIndex: 0,
                answers: {},
                tabSwitchCount: 0,
                pausedTime: 0,
                auditLog: [],
                randomizedQuestions: exam.randomizeQuestions ? questionOrder.map(i => exam.questions[i].id) : undefined,
                questionOrder,
            };

            this.activeSession = session;
            this.saveSession(session);
            this.logAuditEvent('exam_started', { duration: exam.duration });

            return {
                success: true,
                session,
                message: 'Ujian dimulai successfully',
                remainingAttempts: EXAM_CONFIG.MAX_ATTEMPTS - existingAttempts - 1,
            };
        } catch (error) {
            logger.error('Error starting exam:', error);
            return {
                success: false,
                message: 'Gagal memulai ujian. Silakan coba lagi.',
            };
        }
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    private randomizeAnswers(question: QuizQuestion): QuizQuestion {
        if (question.type !== 'multiple_choice' || !question.options || !question.shuffleOptions) {
            return question;
        }
        const correctAnswer = question.correctAnswer;
        const shuffledOptions = this.shuffleArray([...question.options]);
        const correctIndex = shuffledOptions.indexOf(correctAnswer as string);
        
        return {
            ...question,
            options: shuffledOptions,
            correctAnswer: shuffledOptions[correctIndex],
        };
    }

    getActiveSession(): ExamSession | null {
        return this.activeSession;
    }

    loadSession(studentId: string, examId: string): ExamSession | null {
        try {
            const key = this.getStorageKey(studentId, examId);
            const stored = localStorage.getItem(key);
            if (stored) {
                this.activeSession = JSON.parse(stored);
                return this.activeSession;
            }
        } catch (error) {
            logger.error('Error loading exam session:', error);
        }
        return null;
    }

    private saveSession(session: ExamSession): void {
        try {
            const key = this.getStorageKey(session.studentId, session.examId);
            localStorage.setItem(key, JSON.stringify(session));
        } catch (error) {
            logger.error('Error saving exam session:', error);
        }
    }

    updateAnswer(questionId: string, answer: string | string[]): void {
        if (!this.activeSession) return;
        
        this.activeSession.answers[questionId] = answer;
        this.activeSession.remainingTime = this.activeSession.endTime - Date.now();
        this.saveSession(this.activeSession);
        
        this.logAuditEvent('answer_changed', { questionId, answer });
    }

    getCurrentQuestion(): QuizQuestion | null {
        if (!this.activeSession) return null;
        
        const questionIndex = this.activeSession.questionOrder[this.activeSession.currentQuestionIndex];
        return this.activeSession.exam.questions[questionIndex] || null;
    }

    getQuestions(): QuizQuestion[] {
        if (!this.activeSession) return [];
        
        return this.activeSession.questionOrder.map(
            (idx) => this.activeSession!.exam.questions[idx]
        );
    }

    navigateToQuestion(index: number): void {
        if (!this.activeSession) return;
        
        if (index >= 0 && index < this.activeSession.exam.questions.length) {
            this.activeSession.currentQuestionIndex = index;
            this.saveSession(this.activeSession);
            this.logAuditEvent('question_viewed', { questionIndex: index });
        }
    }

    nextQuestion(): void {
        if (!this.activeSession) return;
        
        if (this.activeSession.currentQuestionIndex < this.activeSession.exam.questions.length - 1) {
            this.navigateToQuestion(this.activeSession.currentQuestionIndex + 1);
        }
    }

    previousQuestion(): void {
        if (!this.activeSession) return;
        
        if (this.activeSession.currentQuestionIndex > 0) {
            this.navigateToQuestion(this.activeSession.currentQuestionIndex - 1);
        }
    }

    getRemainingTime(): number {
        if (!this.activeSession) return 0;
        
        const remaining = Math.max(0, this.activeSession.endTime - Date.now());
        this.activeSession.remainingTime = remaining;
        return remaining;
    }

    startTimer(callback: (remaining: number) => void): void {
        this.stopTimer();
        
        this.timerInterval = setInterval(() => {
            const remaining = this.getRemainingTime();
            
            if (remaining <= 0) {
                this.stopTimer();
                this.handleAutoSubmit();
            }
            
            callback(remaining);
        }, 1000);
    }

    stopTimer(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    private handleAutoSubmit(): void {
        if (!this.activeSession) return;
        
        this.logAuditEvent('exam_auto_submitted', { 
            remainingTime: 0,
            answeredQuestions: Object.keys(this.activeSession.answers).length,
        });
        
        this.submitExam();
    }

    submitExam(): ExamSubmitResult {
        if (!this.activeSession) {
            return {
                success: false,
                message: 'Tidak ada sesi ujian yang aktif.',
            };
        }

        try {
            const now = Date.now();
            const timeSpent = Math.floor((now - this.activeSession.startTime) / 1000);
            
            if (timeSpent < EXAM_CONFIG.MIN_TIME_BEFORE_SUBMIT) {
                return {
                    success: false,
                    message: `Anda harus menyelesaikan minimal ${EXAM_CONFIG.MIN_TIME_BEFORE_SUBMIT} detik sebelum mengumpulkan.`,
                };
            }

            const score = this.calculateScore();
            const percentage = (score / this.activeSession.exam.totalPoints) * 100;
            const passed = percentage >= this.activeSession.exam.passingScore;

            const attempt: QuizAttempt = {
                id: generateId({ prefix: 'attempt' }),
                quizId: this.activeSession.examId,
                studentId: this.activeSession.studentId,
                studentName: this.activeSession.studentName,
                answers: this.activeSession.answers,
                score,
                maxScore: this.activeSession.exam.totalPoints,
                percentage,
                passed,
                startedAt: new Date(this.activeSession.startTime).toISOString(),
                submittedAt: new Date(now).toISOString(),
                timeSpent,
                attemptNumber: this.getAttemptCount(this.activeSession.studentId, this.activeSession.examId) + 1,
            };

            this.saveAttempt(attempt);
            this.logAuditEvent('exam_submitted', { score, percentage, passed });
            this.clearSession();
            this.stopTimer();
            this.removeEventListeners();

            return {
                success: true,
                attempt,
                message: passed ? 'Selamat! Anda lulus ujian.' : 'Ujian telah dikumpulkan. Silakan lihat hasil Anda.',
            };
        } catch (error) {
            logger.error('Error submitting exam:', error);
            return {
                success: false,
                message: 'Gagal mengumpulkan ujian. Silakan coba lagi.',
            };
        }
    }

    private calculateScore(): number {
        if (!this.activeSession) return 0;
        
        let score = 0;
        
        for (const question of this.activeSession.exam.questions) {
            const userAnswer = this.activeSession.answers[question.id];
            if (!userAnswer) continue;
            
            const correctAnswer = question.correctAnswer;
            
            if (Array.isArray(correctAnswer)) {
                const userAns = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
                const isCorrect = correctAnswer.length === userAns.length &&
                    correctAnswer.every((a) => userAns.includes(a));
                if (isCorrect) score += question.points;
            } else {
                if (userAnswer === correctAnswer) score += question.points;
            }
        }
        
        return score;
    }

    private getAttemptCount(studentId: string, examId: string): number {
        try {
            const key = STORAGE_KEYS.QUIZ_ATTEMPTS(examId);
            const stored = localStorage.getItem(key);
            if (stored) {
                const attempts: QuizAttempt[] = JSON.parse(stored);
                return attempts.filter(a => a.studentId === studentId).length;
            }
        } catch (error) {
            logger.error('Error getting attempt count:', error);
        }
        return 0;
    }

    private saveAttempt(attempt: QuizAttempt): void {
        try {
            const key = STORAGE_KEYS.QUIZ_ATTEMPTS(attempt.quizId);
            const stored = localStorage.getItem(key);
            const attempts: QuizAttempt[] = stored ? JSON.parse(stored) : [];
            attempts.push(attempt);
            localStorage.setItem(key, JSON.stringify(attempts));
        } catch (error) {
            logger.error('Error saving attempt:', error);
        }
    }

    private clearSession(): void {
        if (!this.activeSession) return;
        
        try {
            const key = this.getStorageKey(this.activeSession.studentId, this.activeSession.examId);
            localStorage.removeItem(key);
        } catch (error) {
            logger.error('Error clearing session:', error);
        }
        
        this.activeSession = null;
    }

    setupAntiCheat(): void {
        if (!this.activeSession) return;

        this.visibilityChangeHandler = () => {
            if (document.visibilityState === 'hidden') {
                this.activeSession!.tabSwitchCount++;
                this.logAuditEvent('tab_switch_detected', { 
                    count: this.activeSession!.tabSwitchCount,
                    maxAllowed: EXAM_CONFIG.MAX_TAB_SWITCHES,
                });
                
                if (this.activeSession!.tabSwitchCount > EXAM_CONFIG.MAX_TAB_SWITCHES) {
                    logger.warn('Tab switch limit exceeded', { 
                        count: this.activeSession!.tabSwitchCount 
                    });
                }
            }
        };
        
        document.addEventListener('visibilitychange', this.visibilityChangeHandler);

        this.beforeUnloadHandler = (e: Event) => {
            e.preventDefault();
            (e as unknown as { returnValue: string }).returnValue = '';
        };
        
        window.addEventListener('beforeunload', this.beforeUnloadHandler);

        this.copyPasteHandler = (e: Event) => {
            e.preventDefault();
            this.logAuditEvent('copy_attempt_detected', { type: e.type });
        };
        
        document.addEventListener('copy', this.copyPasteHandler);
        document.addEventListener('cut', this.copyPasteHandler);
        document.addEventListener('paste', this.copyPasteHandler);
    }

    private removeEventListeners(): void {
        if (this.visibilityChangeHandler) {
            document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
            this.visibilityChangeHandler = null;
        }
        
        if (this.beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this.beforeUnloadHandler);
            this.beforeUnloadHandler = null;
        }
        
        if (this.copyPasteHandler) {
            document.removeEventListener('copy', this.copyPasteHandler);
            document.removeEventListener('cut', this.copyPasteHandler);
            document.removeEventListener('paste', this.copyPasteHandler);
            this.copyPasteHandler = null;
        }
    }

    private logAuditEvent(event: ExamAuditEvent, details: Record<string, unknown>): void {
        if (!this.activeSession || !EXAM_CONFIG.ENABLE_AUDIT_LOG) return;
        
        const auditEntry: ExamAttemptAuditLog = {
            id: generateId({ prefix: 'audit' }),
            examId: this.activeSession.examId,
            studentId: this.activeSession.studentId,
            attemptId: this.activeSession.examId,
            event,
            timestamp: new Date().toISOString(),
            details,
            userAgent: navigator.userAgent,
        };
        
        this.activeSession.auditLog.push(auditEntry);
        this.saveSession(this.activeSession);
    }

    getAuditLog(): ExamAttemptAuditLog[] {
        return this.activeSession?.auditLog || [];
    }

    abandonExam(): void {
        if (!this.activeSession) return;
        
        this.logAuditEvent('exam_abandoned', { 
            answeredQuestions: Object.keys(this.activeSession.answers).length,
            timeSpent: Date.now() - this.activeSession.startTime,
        });
        
        this.clearSession();
        this.stopTimer();
        this.removeEventListeners();
    }

    getExamAttempts(studentId: string, examId: string): QuizAttempt[] {
        try {
            const key = STORAGE_KEYS.QUIZ_ATTEMPTS(examId);
            const stored = localStorage.getItem(key);
            if (stored) {
                const attempts: QuizAttempt[] = JSON.parse(stored);
                return attempts.filter(a => a.studentId === studentId);
            }
        } catch (error) {
            logger.error('Error getting exam attempts:', error);
        }
        return [];
    }

    hasPassedExam(studentId: string, examId: string): boolean {
        const attempts = this.getExamAttempts(studentId, examId);
        return attempts.some(a => a.passed);
    }

    getBestScore(studentId: string, examId: string): number {
        const attempts = this.getExamAttempts(studentId, examId);
        if (attempts.length === 0) return 0;
        
        return Math.max(...attempts.map(a => a.percentage));
    }
}

export const onlineAssessmentService = new OnlineAssessmentService();
