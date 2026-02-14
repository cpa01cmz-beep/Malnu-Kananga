/**
 * Online Assessment Configuration - Flexy: Never hardcode exam options!
 * Centralized exam-specific configurations for timed assessments
 */

import { STORAGE_KEY_PREFIX } from '../constants';

export interface ExamSecurityConfig {
    /** Enable anti-tab-switch detection */
    antiTabSwitch: boolean;
    /** Number of tab switches allowed before warning */
    maxTabSwitches: number;
    /** Enable anti-copy-paste */
    antiCopyPaste: boolean;
    /** Enable anti-right-click */
    antiRightClick: boolean;
    /** Enable fullscreen requirement */
    requireFullscreen: boolean;
    /** Enable webcam (future feature) */
    enableWebcam: boolean;
    /** Enable auto-submit on expiry */
    autoSubmit: boolean;
    /** Enable question randomization */
    randomizeQuestions: boolean;
    /** Enable answer randomization for multiple choice */
    randomizeAnswers: boolean;
}

export interface ExamTimingConfig {
    /** Duration in minutes */
    duration: number;
    /** Warning time in minutes before auto-submit */
    warningTime: number;
    /** Enable countdown timer display */
    showTimer: boolean;
    /** Enable time warning alerts */
    enableTimeWarnings: boolean;
    /** Time warning thresholds in minutes */
    warningThresholds: number[];
    /** Enable pause/resume (for exceptional cases) */
    allowPause: boolean;
    /** Maximum pause time in minutes */
    maxPauseTime: number;
}

export interface ExamAttemptAuditLog {
    id: string;
    examId: string;
    studentId: string;
    attemptId: string;
    event: ExamAuditEvent;
    timestamp: string;
    details: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}

export type ExamAuditEvent =
    | 'exam_started'
    | 'exam_submitted'
    | 'exam_auto_submitted'
    | 'exam_paused'
    | 'exam_resumed'
    | 'exam_timeout_warning'
    | 'tab_switch_detected'
    | 'copy_attempt_detected'
    | 'paste_attempt_detected'
    | 'right_click_detected'
    | 'fullscreen_entered'
    | 'fullscreen_exited'
    | 'question_viewed'
    | 'answer_changed'
    | 'exam_abandoned';

export const EXAM_SECURITY_CONFIG: ExamSecurityConfig = {
    antiTabSwitch: true,
    maxTabSwitches: 3,
    antiCopyPaste: true,
    antiRightClick: false,
    requireFullscreen: false,
    enableWebcam: false,
    autoSubmit: true,
    randomizeQuestions: false,
    randomizeAnswers: false,
};

export const EXAM_TIMING_CONFIG: ExamTimingConfig = {
    duration: 60,
    warningTime: 5,
    showTimer: true,
    enableTimeWarnings: true,
    warningThresholds: [15, 10, 5, 3, 1],
    allowPause: false,
    maxPauseTime: 0,
};

export const EXAM_CONFIG = {
    /** Default exam duration in minutes */
    DEFAULT_DURATION: 60,
    /** Minimum exam duration in minutes */
    MIN_DURATION: 10,
    /** Maximum exam duration in minutes */
    MAX_DURATION: 180,
    /** Warning time before auto-submit in minutes */
    WARNING_TIME: 5,
    /** Maximum tab switches before flagging */
    MAX_TAB_SWITCHES: 3,
    /** Auto-save interval in seconds */
    AUTO_SAVE_INTERVAL: 15,
    /** Question navigation timeout in seconds */
    QUESTION_NAVIGATION_TIMEOUT: 300,
    /** Grace period after timer expires in seconds */
    GRACE_PERIOD_SECONDS: 30,
    /** Minimum time before submission allowed in seconds */
    MIN_TIME_BEFORE_SUBMIT: 30,
    /** Storage key prefix for exam attempts */
    STORAGE_PREFIX: `${STORAGE_KEY_PREFIX}exam_`,
    /** Maximum exam attempts per student */
    MAX_ATTEMPTS: 3,
    /** Enable detailed audit logging */
    ENABLE_AUDIT_LOG: true,
} as const;

export const EXAM_STATUS = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    PAUSED: 'paused',
    SUBMITTED: 'submitted',
    AUTO_SUBMITTED: 'auto_submitted',
    TIMED_OUT: 'timed_out',
    ABANDONED: 'abandoned',
    GRADED: 'graded',
} as const;

export const EXAM_STATUS_LABELS: Record<string, string> = {
    [EXAM_STATUS.NOT_STARTED]: 'Belum Dimulai',
    [EXAM_STATUS.IN_PROGRESS]: 'Sedang Berlangsung',
    [EXAM_STATUS.PAUSED]: 'Ditunda',
    [EXAM_STATUS.SUBMITTED]: 'Dikumpulkan',
    [EXAM_STATUS.AUTO_SUBMITTED]: 'Dikumpulkan Otomatis',
    [EXAM_STATUS.TIMED_OUT]: 'Waktu Habis',
    [EXAM_STATUS.ABANDONED]: 'Ditinggalkan',
    [EXAM_STATUS.GRADED]: 'Sudah Dinilai',
} as const;
