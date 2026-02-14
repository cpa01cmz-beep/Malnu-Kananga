import { STORAGE_KEYS, STORAGE_LIMITS } from '../constants';
import { AIFeedback } from '../types';
import { logger } from '../utils/logger';

export interface FeedbackHistoryItem {
  id: string;
  feedback: AIFeedback;
  appliedAt?: string;
  studentName?: string;
  assignmentTitle?: string;
}

const MAX_HISTORY_SIZE = STORAGE_LIMITS.AI_FEEDBACK_HISTORY_MAX || 50;

class FeedbackHistoryService {
  private history: FeedbackHistoryItem[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AI_FEEDBACK_HISTORY);
      if (stored) {
        this.history = JSON.parse(stored);
        if (this.history.length > MAX_HISTORY_SIZE) {
          this.history = this.history.slice(-MAX_HISTORY_SIZE);
        }
      }
    } catch (error) {
      logger.error('Failed to load AI feedback history:', error);
      this.history = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AI_FEEDBACK_HISTORY, JSON.stringify(this.history));
    } catch (error) {
      logger.error('Failed to save AI feedback history:', error);
    }
  }

  addToHistory(
    feedback: AIFeedback,
    options?: {
      studentName?: string;
      assignmentTitle?: string;
    }
  ): void {
    const historyItem: FeedbackHistoryItem = {
      id: feedback.id,
      feedback,
      studentName: options?.studentName,
      assignmentTitle: options?.assignmentTitle
    };

    this.history.push(historyItem);

    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history.shift();
    }

    this.saveToStorage();
    logger.info('Added AI feedback to history', { feedbackId: feedback.id });
  }

  markAsApplied(feedbackId: string): void {
    const item = this.history.find(h => h.id === feedbackId);
    if (item) {
      item.appliedAt = new Date().toISOString();
      this.saveToStorage();
      logger.info('Marked feedback as applied', { feedbackId });
    }
  }

  getHistory(limit?: number): FeedbackHistoryItem[] {
    const result = limit ? this.history.slice(-limit) : this.history;
    return [...result].reverse();
  }

  getHistoryByStudent(studentName: string): FeedbackHistoryItem[] {
    return this.history
      .filter(h => h.studentName?.toLowerCase().includes(studentName.toLowerCase()))
      .reverse();
  }

  getHistoryByAssignment(assignmentTitle: string): FeedbackHistoryItem[] {
    return this.history
      .filter(h => h.assignmentTitle?.toLowerCase().includes(assignmentTitle.toLowerCase()))
      .reverse();
  }

  getAppliedFeedback(limit?: number): FeedbackHistoryItem[] {
    const applied = this.history.filter(h => h.appliedAt);
    const result = limit ? applied.slice(-limit) : applied;
    return [...result].reverse();
  }

  getUnappliedFeedback(): FeedbackHistoryItem[] {
    return this.history
      .filter(h => !h.appliedAt)
      .reverse();
  }

  deleteFromHistory(feedbackId: string): void {
    this.history = this.history.filter(h => h.id !== feedbackId);
    this.saveToStorage();
    logger.info('Deleted feedback from history', { feedbackId });
  }

  clearHistory(): void {
    this.history = [];
    this.saveToStorage();
    logger.info('Cleared AI feedback history');
  }

  getHistoryCount(): number {
    return this.history.length;
  }
}

export const feedbackHistoryService = new FeedbackHistoryService();
