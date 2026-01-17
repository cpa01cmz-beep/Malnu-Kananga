/**
 * Live Classroom Management Service
 * Handles real-time classroom sessions, screen sharing, whiteboard, and participation
 * Milestone 3.0 - Real-Time Collaboration
 */

import { ClassroomSession, SessionParticipant, ClassroomActivity, WhiteboardElement, WhiteboardState } from '../types/realtime.types';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

/**
 * Live Classroom Management Service
 * Manages real-time classroom sessions
 */
class ClassroomManagementService {
  private sessions: Map<string, ClassroomSession> = new Map();
  private activeParticipants: Map<string, Set<string>> = new Map(); // sessionId -> userIds
  private subscribers: Map<string, Set<(event: ClassroomEvent) => void>> = new Map();

  // Configuration
  private readonly config = {
    maxParticipants: 50,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    whiteboardSyncInterval: 1000, // 1 second
    activityRetention: 60 * 60 * 1000, // 1 hour
  };

  /**
   * Create a new classroom session
   */
  async createSession(
    classId: string,
    teacherId: string,
    subject: string,
    metadata?: Record<string, unknown>
  ): Promise<ClassroomSession> {
    const session: ClassroomSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      classId,
      teacherId,
      subject,
      status: 'idle',
      participants: [],
      activities: [],
      isRecording: false,
      ...metadata,
    };

    this.sessions.set(session.id, session);
    this.activeParticipants.set(session.id, new Set());
    this.subscribers.set(session.id, new Set());

    await this.persistSession(session.id);

    logger.info('Classroom session created', {
      sessionId: session.id,
      classId,
      teacherId,
      subject,
    });

    return session;
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId: string): ClassroomSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Start a classroom session
   */
  async startSession(sessionId: string): Promise<ClassroomSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status !== 'idle') {
      throw new Error(`Session is not idle: ${session.status}`);
    }

    session.status = 'active';
    session.startedAt = Date.now();

    await this.persistSession(sessionId);

    this.notifySubscribers(sessionId, {
      type: 'session_started',
      sessionId,
      timestamp: Date.now(),
      data: session,
    });

    logger.info('Classroom session started', { sessionId });

    return session;
  }

  /**
   * Pause a classroom session
   */
  async pauseSession(sessionId: string): Promise<ClassroomSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status !== 'active') {
      throw new Error(`Session is not active: ${session.status}`);
    }

    session.status = 'paused';

    await this.persistSession(sessionId);

    this.notifySubscribers(sessionId, {
      type: 'session_paused',
      sessionId,
      timestamp: Date.now(),
      data: session,
    });

    logger.info('Classroom session paused', { sessionId });

    return session;
  }

  /**
   * Resume a paused session
   */
  async resumeSession(sessionId: string): Promise<ClassroomSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status !== 'paused') {
      throw new Error(`Session is not paused: ${session.status}`);
    }

    session.status = 'active';

    await this.persistSession(sessionId);

    this.notifySubscribers(sessionId, {
      type: 'session_resumed',
      sessionId,
      timestamp: Date.now(),
      data: session,
    });

    logger.info('Classroom session resumed', { sessionId });

    return session;
  }

  /**
   * End a classroom session
   */
  async endSession(sessionId: string): Promise<ClassroomSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.status = 'ended';
    session.endedAt = Date.now();

    // Mark all participants as left
    session.participants.forEach(p => {
      if (!p.leftAt) {
        p.leftAt = Date.now();
      }
    });

    await this.persistSession(sessionId);

    this.notifySubscribers(sessionId, {
      type: 'session_ended',
      sessionId,
      timestamp: Date.now(),
      data: session,
    });

    logger.info('Classroom session ended', { sessionId });

    return session;
  }

  /**
   * Join a classroom session
   */
  async joinSession(
    sessionId: string,
    userId: string,
    userName: string,
    role: 'teacher' | 'student'
  ): Promise<SessionParticipant> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status === 'ended') {
      throw new Error(`Session has ended`);
    }

    const participants = this.activeParticipants.get(sessionId) || new Set();
    if (participants.size >= this.config.maxParticipants) {
      throw new Error(`Session is full (max ${this.config.maxParticipants})`);
    }

    // Check if participant already exists
    let participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      if (participant.leftAt) {
        // Rejoining
        participant.joinedAt = Date.now();
        participant.leftAt = undefined;
      }
    } else {
      // New participant
      participant = {
        userId,
        userName,
        role,
        joinedAt: Date.now(),
        isMuted: role === 'student', // Students are muted by default
        hasRaisedHand: false,
        screenSharing: false,
      };
      session.participants.push(participant);
    }

    participants.add(userId);
    this.activeParticipants.set(sessionId, participants);

    await this.persistSession(sessionId);

    this.notifySubscribers(sessionId, {
      type: 'participant_joined',
      sessionId,
      timestamp: Date.now(),
      data: participant,
    });

    logger.info('Participant joined session', { sessionId, userId, userName, role });

    return participant;
  }

  /**
   * Leave a classroom session
   */
  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.leftAt = Date.now();
      participant.screenSharing = false;
    }

    const participants = this.activeParticipants.get(sessionId);
    if (participants) {
      participants.delete(userId);
      this.activeParticipants.set(sessionId, participants);
    }

    await this.persistSession(sessionId);

    this.notifySubscribers(sessionId, {
      type: 'participant_left',
      sessionId,
      timestamp: Date.now(),
      data: { userId },
    });

    logger.info('Participant left session', { sessionId, userId });
  }

  /**
   * Get active participants for a session
   */
  getActiveParticipants(sessionId: string): SessionParticipant[] {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }

    return session.participants.filter(p => !p.leftAt);
  }

  /**
   * Toggle participant mute status
   */
  async toggleMute(sessionId: string, userId: string, isMuted: boolean): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.isMuted = isMuted;
      await this.persistSession(sessionId);

      this.notifySubscribers(sessionId, {
        type: 'participant_muted',
        sessionId,
        timestamp: Date.now(),
        data: { userId, isMuted },
      });
    }
  }

  /**
   * Raise/lower hand
   */
  async raiseHand(sessionId: string, userId: string, hasRaised: boolean): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.hasRaisedHand = hasRaised;
      await this.persistSession(sessionId);

      this.notifySubscribers(sessionId, {
        type: 'hand_raised',
        sessionId,
        timestamp: Date.now(),
        data: { userId, hasRaised },
      });
    }
  }

  /**
   * Start/stop screen sharing
   */
  async toggleScreenShare(sessionId: string, userId: boolean, isSharing: boolean): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Only one person can share screen at a time
    if (isSharing && session.sharedScreen) {
      throw new Error(`Screen is already being shared by ${session.sharedScreenBy}`);
    }

    session.sharedScreen = isSharing;
    session.sharedScreenBy = isSharing ? String(userId) : undefined;

    const participant = session.participants.find(p => p.userId === String(userId));
    if (participant) {
      participant.screenSharing = isSharing;
    }

    await this.persistSession(sessionId);

    this.notifySubscribers(sessionId, {
      type: 'screen_share',
      sessionId,
      timestamp: Date.now(),
      data: { userId, isSharing },
    });
  }

  /**
   * Update whiteboard element
   */
  async updateWhiteboard(sessionId: string, element: WhiteboardElement): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (!session.whiteboard) {
      session.whiteboard = {
        elements: [],
        backgroundColor: '#ffffff',
        width: 1920,
        height: 1080,
        version: 0,
      };
    }

    // Find and update or add element
    const existingIndex = session.whiteboard.elements.findIndex(e => e.id === element.id);
    if (existingIndex >= 0) {
      session.whiteboard.elements[existingIndex] = element;
    } else {
      session.whiteboard.elements.push(element);
    }

    session.whiteboard.version += 1;

    await this.persistSession(sessionId);

    this.notifySubscribers(sessionId, {
      type: 'whiteboard_update',
      sessionId,
      timestamp: Date.now(),
      data: { whiteboard: session.whiteboard, element },
    });
  }

  /**
   * Clear whiteboard
   */
  async clearWhiteboard(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.whiteboard = {
      elements: [],
      backgroundColor: '#ffffff',
      width: 1920,
      height: 1080,
      version: (session.whiteboard?.version || 0) + 1,
    };

    await this.persistSession(sessionId);

    this.notifySubscribers(sessionId, {
      type: 'whiteboard_cleared',
      sessionId,
      timestamp: Date.now(),
      data: { userId, whiteboard: session.whiteboard },
    });
  }

  /**
   * Add classroom activity
   */
  async addActivity(
    sessionId: string,
    type: ClassroomActivity['type'],
    userId: string,
    content: Record<string, unknown>
  ): Promise<ClassroomActivity> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const activity: ClassroomActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      userId,
      timestamp: Date.now(),
      content,
    };

    session.activities.push(activity);

    // Prune old activities
    session.activities = session.activities.filter(
      a => a.timestamp > Date.now() - this.config.activityRetention
    );

    await this.persistSession(sessionId);

    this.notifySubscribers(sessionId, {
      type: 'activity_added',
      sessionId,
      timestamp: Date.now(),
      data: activity,
    });

    logger.info('Activity added to session', { sessionId, type, userId });

    return activity;
  }

  /**
   * Toggle recording
   */
  async toggleRecording(sessionId: string, isRecording: boolean): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.isRecording = isRecording;

    await this.persistSession(sessionId);

    this.notifySubscribers(sessionId, {
      type: 'recording_toggled',
      sessionId,
      timestamp: Date.now(),
      data: { isRecording },
    });
  }

  /**
   * Subscribe to session events
   */
  subscribe(sessionId: string, callback: (event: ClassroomEvent) => void): () => void {
    if (!this.subscribers.has(sessionId)) {
      this.subscribers.set(sessionId, new Set());
    }

    this.subscribers.get(sessionId)!.add(callback);

    return () => {
      this.subscribers.get(sessionId)?.delete(callback);
    };
  }

  /**
   * Notify all subscribers of a session event
   */
  private notifySubscribers(sessionId: string, event: ClassroomEvent): void {
    const subscribers = this.subscribers.get(sessionId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          logger.error('Error notifying subscriber', { sessionId, error });
        }
      });
    }
  }

  /**
   * Persist session to localStorage
   */
  private async persistSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    const key = `${STORAGE_KEYS.CLASSROOM_SESSIONS}_${sessionId}`;
    localStorage.setItem(key, JSON.stringify(session));
  }

  /**
   * Load session from localStorage
   */
  async loadSession(sessionId: string): Promise<ClassroomSession | null> {
    const key = `${STORAGE_KEYS.CLASSROOM_SESSIONS}_${sessionId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const session = JSON.parse(stored) as ClassroomSession;
        this.sessions.set(sessionId, session);

        // Restore active participants
        const activeSet = new Set(
          session.participants.filter(p => !p.leftAt).map(p => p.userId)
        );
        this.activeParticipants.set(sessionId, activeSet);

        if (!this.subscribers.has(sessionId)) {
          this.subscribers.set(sessionId, new Set());
        }

        return session;
      } catch (error) {
        logger.error('Error loading session from storage', { sessionId, error });
      }
    }

    return null;
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    this.activeParticipants.delete(sessionId);
    this.subscribers.delete(sessionId);

    const key = `${STORAGE_KEYS.CLASSROOM_SESSIONS}_${sessionId}`;
    localStorage.removeItem(key);

    logger.info('Session deleted', { sessionId });
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): ClassroomSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId: string): {
    status: string;
    participantCount: number;
    activeParticipantCount: number;
    duration?: number;
    activityCount: number;
    isRecording: boolean;
    isScreenShared: boolean;
  } | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return undefined;
    }

    const activeParticipants = this.activeParticipants.get(sessionId);

    return {
      status: session.status,
      participantCount: session.participants.length,
      activeParticipantCount: activeParticipants?.size || 0,
      duration: session.startedAt ? Date.now() - session.startedAt : undefined,
      activityCount: session.activities.length,
      isRecording: session.isRecording,
      isScreenShared: !!session.sharedScreen,
    };
  }

  /**
   * Clean up inactive sessions
   */
  async cleanupInactiveSessions(): Promise<void> {
    const now = Date.now();
    const timeout = this.config.sessionTimeout;

    for (const [sessionId, session] of this.sessions) {
      if (
        session.status === 'active' &&
        session.startedAt &&
        now - session.startedAt > timeout
      ) {
        logger.warn('Cleaning up inactive session', { sessionId });
        await this.endSession(sessionId);
      }
    }
  }

  /**
   * Clear all sessions (for testing)
   */
  async clearAllSessions(): Promise<void> {
    this.sessions.clear();
    this.activeParticipants.clear();
    this.subscribers.clear();

    // Clear localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.CLASSROOM_SESSIONS)) {
        localStorage.removeItem(key);
      }
    });

    logger.info('All sessions cleared');
  }
}

/**
 * Classroom Event Types
 */
export type ClassroomEvent =
  | { type: 'session_started'; sessionId: string; timestamp: number; data: ClassroomSession }
  | { type: 'session_paused'; sessionId: string; timestamp: number; data: ClassroomSession }
  | { type: 'session_resumed'; sessionId: string; timestamp: number; data: ClassroomSession }
  | { type: 'session_ended'; sessionId: string; timestamp: number; data: ClassroomSession }
  | { type: 'participant_joined'; sessionId: string; timestamp: number; data: SessionParticipant }
  | { type: 'participant_left'; sessionId: string; timestamp: number; data: { userId: string } }
  | { type: 'participant_muted'; sessionId: string; timestamp: number; data: { userId: string; isMuted: boolean } }
  | { type: 'hand_raised'; sessionId: string; timestamp: number; data: { userId: string; hasRaised: boolean } }
  | { type: 'screen_share'; sessionId: string; timestamp: number; data: { userId: string | boolean; isSharing: boolean } }
  | { type: 'whiteboard_update'; sessionId: string; timestamp: number; data: { whiteboard: WhiteboardState; element: WhiteboardElement } }
  | { type: 'whiteboard_cleared'; sessionId: string; timestamp: number; data: { userId: string; whiteboard: WhiteboardState } }
  | { type: 'activity_added'; sessionId: string; timestamp: number; data: ClassroomActivity }
  | { type: 'recording_toggled'; sessionId: string; timestamp: number; data: { isRecording: boolean } };

// Export singleton instance
export const classroomManagementService = new ClassroomManagementService();

// Export class for testing
export { ClassroomManagementService };
