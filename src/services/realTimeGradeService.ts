/**
 * Real-Time Grade Update Service
 * Handles real-time grade updates with notifications to parents and students
 * Milestone 3.0 - Real-Time Collaboration
 */

import { GradeUpdate, GradeUpdateEvent } from '../types/realtime.types';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

/**
 * Real-Time Grade Service
 * Manages grade updates with real-time notifications
 */
class RealTimeGradeService {
  private grades: Map<string, GradeUpdate> = new Map();
  private subscribers: Map<string, Set<(event: GradeUpdateEvent) => void>> = new Map(); // studentId -> callbacks
  private pendingUpdates: Map<string, GradeUpdate[]> = new Map(); // studentId -> pending updates

  // Configuration
  private readonly config = {
    updateRetention: 90 * 24 * 60 * 60 * 1000, // 90 days
    maxPendingUpdates: 50,
    autoSyncInterval: 5000, // 5 seconds
  };

  /**
   * Create or update a grade
   */
  async updateGrade(grade: GradeUpdate): Promise<GradeUpdateEvent> {
    const existing = this.grades.get(grade.id);

    // If updating, store previous value
    const previousGrade = existing?.grade;

    // Store grade
    this.grades.set(grade.id, grade);

    // Add to pending updates
    const pending = this.pendingUpdates.get(grade.studentId) || [];
    pending.push(grade);
    if (pending.length > this.config.maxPendingUpdates) {
      pending.shift(); // Remove oldest
    }
    this.pendingUpdates.set(grade.studentId, pending);

    // Persist to localStorage
    await this.persistGrade(grade.id);

    // Create event
    const event: GradeUpdateEvent = {
      gradeId: grade.id,
      studentId: grade.studentId,
      subject: grade.subject,
      previousGrade,
      newGrade: grade.grade,
      gradedBy: grade.gradedBy,
      timestamp: Date.now(),
    };

    // Notify subscribers (student and potentially parents)
    this.notifySubscribers(grade.studentId, event);

    // Also notify teacher
    this.notifySubscribers(grade.gradedBy, event);

    logger.info('Grade updated', {
      gradeId: grade.id,
      studentId: grade.studentId,
      subject: grade.subject,
      grade: grade.grade,
      previousGrade,
    });

    return event;
  }

  /**
   * Publish a grade (make visible to student/parent)
   */
  async publishGrade(gradeId: string, teacherId: string): Promise<void> {
    const grade = this.grades.get(gradeId);
    if (!grade) {
      throw new Error(`Grade not found: ${gradeId}`);
    }

    if (grade.gradedBy !== teacherId) {
      throw new Error(`User ${teacherId} is not authorized to publish this grade`);
    }

    if (grade.isPublished) {
      return; // Already published
    }

    grade.isPublished = true;

    await this.persistGrade(gradeId);

    // Notify student
    const event: GradeUpdateEvent = {
      gradeId: grade.id,
      studentId: grade.studentId,
      subject: grade.subject,
      newGrade: grade.grade,
      gradedBy: grade.gradedBy,
      timestamp: Date.now(),
    };

    this.notifySubscribers(grade.studentId, event);

    logger.info('Grade published', { gradeId, studentId: grade.studentId });
  }

  /**
   * Get a grade by ID
   */
  getGrade(gradeId: string): GradeUpdate | undefined {
    return this.grades.get(gradeId);
  }

  /**
   * Get all grades for a student
   */
  getStudentGrades(studentId: string, subject?: string): GradeUpdate[] {
    const allGrades = Array.from(this.grades.values()).filter(g => g.studentId === studentId);

    if (subject) {
      return allGrades.filter(g => g.subject === subject);
    }

    return allGrades.sort((a, b) => b.gradedAt - a.gradedAt);
  }

  /**
   * Get all grades for a class
   */
  getClassGrades(classId: string, subject?: string): GradeUpdate[] {
    // In a real implementation, classId would be a field in GradeUpdate
    // For now, return all grades as placeholder
    const allGrades = Array.from(this.grades.values());

    if (subject) {
      return allGrades.filter(g => g.subject === subject);
    }

    return allGrades.sort((a, b) => b.gradedAt - a.gradedAt);
  }

  /**
   * Get grades by teacher
   */
  getTeacherGrades(teacherId: string): GradeUpdate[] {
    return Array.from(this.grades.values())
      .filter(g => g.gradedBy === teacherId)
      .sort((a, b) => b.gradedAt - a.gradedAt);
  }

  /**
   * Get pending grade updates for a student
   */
  getPendingUpdates(studentId: string): GradeUpdate[] {
    return this.pendingUpdates.get(studentId) || [];
  }

  /**
   * Clear pending updates for a student (after viewing)
   */
  clearPendingUpdates(studentId: string): void {
    this.pendingUpdates.delete(studentId);
  }

  /**
   * Subscribe to grade updates for a student
   */
  subscribe(studentId: string, callback: (event: GradeUpdateEvent) => void): () => void {
    if (!this.subscribers.has(studentId)) {
      this.subscribers.set(studentId, new Set());
    }

    this.subscribers.get(studentId)!.add(callback);

    return () => {
      this.subscribers.get(studentId)?.delete(callback);
    };
  }

  /**
   * Notify subscribers of a grade update
   */
  private notifySubscribers(studentId: string, event: GradeUpdateEvent): void {
    const subscribers = this.subscribers.get(studentId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          logger.error('Error notifying grade subscriber', { studentId, error });
        }
      });
    }
  }

  /**
   * Persist grade to localStorage
   */
  private async persistGrade(gradeId: string): Promise<void> {
    const grade = this.grades.get(gradeId);
    if (!grade) {
      return;
    }

    const key = `${STORAGE_KEYS.GRADES}_${gradeId}`;
    localStorage.setItem(key, JSON.stringify(grade));
  }

  /**
   * Load grade from localStorage
   */
  async loadGrade(gradeId: string): Promise<GradeUpdate | null> {
    const key = `${STORAGE_KEYS.GRADES}_${gradeId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const grade = JSON.parse(stored) as GradeUpdate;
        this.grades.set(gradeId, grade);
        return grade;
      } catch (error) {
        logger.error('Error loading grade from storage', { gradeId, error });
      }
    }

    return null;
  }

  /**
   * Delete a grade
   */
  async deleteGrade(gradeId: string, teacherId: string): Promise<void> {
    const grade = this.grades.get(gradeId);
    if (!grade) {
      throw new Error(`Grade not found: ${gradeId}`);
    }

    if (grade.gradedBy !== teacherId) {
      throw new Error(`User ${teacherId} is not authorized to delete this grade`);
    }

    this.grades.delete(gradeId);

    const key = `${STORAGE_KEYS.GRADES}_${gradeId}`;
    localStorage.removeItem(key);

    logger.info('Grade deleted', { gradeId, studentId: grade.studentId });
  }

  /**
   * Get grade statistics for a student
   */
  getStudentStats(studentId: string): {
    totalGrades: number;
    publishedGrades: number;
    average: number;
    highestGrade: number;
    lowestGrade: number;
    subjects: string[];
  } {
    const grades = this.getStudentGrades(studentId).filter(g => g.isPublished);

    if (grades.length === 0) {
      return {
        totalGrades: 0,
        publishedGrades: 0,
        average: 0,
        highestGrade: 0,
        lowestGrade: 0,
        subjects: [],
      };
    }

    const gradeValues = grades.map(g => g.grade);
    const subjects = Array.from(new Set(grades.map(g => g.subject)));

    return {
      totalGrades: this.getStudentGrades(studentId).length,
      publishedGrades: grades.length,
      average: gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length,
      highestGrade: Math.max(...gradeValues),
      lowestGrade: Math.min(...gradeValues),
      subjects,
    };
  }

  /**
   * Get grade statistics for a class
   */
  getClassStats(_classId: string): {
    studentCount: number;
    average: number;
    gradeDistribution: Record<string, number>;
  } {
    // Placeholder implementation
    return {
      studentCount: 0,
      average: 0,
      gradeDistribution: {},
    };
  }

  /**
   * Clear all grades (for testing)
   */
  async clearAllGrades(): Promise<void> {
    this.grades.clear();
    this.subscribers.clear();
    this.pendingUpdates.clear();

    // Clear localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.GRADES)) {
        localStorage.removeItem(key);
      }
    });

    logger.info('All grades cleared');
  }

  /**
   * Prune old grades
   */
  pruneOldGrades(): void {
    const cutoff = Date.now() - this.config.updateRetention;

    for (const [gradeId, grade] of this.grades.entries()) {
      if (grade.gradedAt < cutoff) {
        this.grades.delete(gradeId);

        const key = `${STORAGE_KEYS.GRADES}_${gradeId}`;
        localStorage.removeItem(key);
      }
    }
  }
}

// Export singleton instance
export const realTimeGradeService = new RealTimeGradeService();

// Export class for testing
export { RealTimeGradeService };
