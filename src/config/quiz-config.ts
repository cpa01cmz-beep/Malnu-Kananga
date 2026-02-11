/**
 * Quiz Configuration - Flexy: Never hardcode quiz options!
 * Centralized quiz types, question types, and answer options
 */

import { CheckCircleIcon, ListBulletIcon, PencilSquareIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { ComponentType } from 'react';

export interface QuestionType {
    id: string;
    label: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    maxOptions?: number;
    minOptions?: number;
}

export const QUESTION_TYPES: QuestionType[] = [
    {
        id: 'multiple_choice',
        label: 'Pilihan Ganda',
        description: 'Pilih satu jawaban yang benar',
        icon: ListBulletIcon,
        minOptions: 2,
        maxOptions: 6,
    },
    {
        id: 'true_false',
        label: 'Benar / Salah',
        description: 'Pilih benar atau salah',
        icon: CheckCircleIcon,
        minOptions: 2,
        maxOptions: 2,
    },
    {
        id: 'essay',
        label: 'Essay',
        description: 'Jawaban terbuka',
        icon: PencilSquareIcon,
    },
    {
        id: 'short_answer',
        label: 'Jawaban Singkat',
        description: 'Jawaban singkat dan padat',
        icon: DocumentTextIcon,
    },
] as const;

export const TRUE_FALSE_OPTIONS = [
    { value: 'true', label: 'Benar' },
    { value: 'false', label: 'Salah' },
] as const;

export const QUIZ_TYPES = {
    PRACTICE: 'practice',
    EXAM: 'exam',
    HOMEWORK: 'homework',
    REMEDIAL: 'remedial',
} as const;

export const QUIZ_TYPE_LABELS: Record<string, string> = {
    [QUIZ_TYPES.PRACTICE]: 'Latihan',
    [QUIZ_TYPES.EXAM]: 'Ujian',
    [QUIZ_TYPES.HOMEWORK]: 'Tugas',
    [QUIZ_TYPES.REMEDIAL]: 'Remedial',
} as const;

export const QUIZ_CONFIG = {
    /** Default total points for a quiz */
    DEFAULT_TOTAL_POINTS: 100,
    /** Default question count */
    DEFAULT_QUESTION_COUNT: 10,
    /** Default duration in minutes */
    DEFAULT_DURATION_MINUTES: 30,
    /** Default passing score percentage */
    DEFAULT_PASSING_SCORE: 70,
    /** Default points per question */
    DEFAULT_POINTS_PER_QUESTION: 10,
    /** Minimum total points */
    MIN_TOTAL_POINTS: 10,
    /** Maximum total points */
    MAX_TOTAL_POINTS: 500,
    /** Points step increment */
    POINTS_STEP: 10,
    /** Minimum questions per quiz */
    MIN_QUESTIONS: 1,
    /** Maximum questions per quiz */
    MAX_QUESTIONS: 100,
    /** Minimum duration in minutes */
    MIN_DURATION: 5,
    /** Maximum duration in minutes */
    MAX_DURATION: 180,
    /** Auto-save interval in seconds */
    AUTO_SAVE_INTERVAL: 30,
} as const;

export const QUESTION_DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
} as const;

export const QUESTION_DIFFICULTY_LABELS: Record<string, string> = {
    [QUESTION_DIFFICULTY.EASY]: 'Mudah',
    [QUESTION_DIFFICULTY.MEDIUM]: 'Sedang',
    [QUESTION_DIFFICULTY.HARD]: 'Sulit',
} as const;
