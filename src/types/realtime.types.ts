/**
 * Real-Time Collaboration Types
 *
 * Real-Time Collaboration System
 * Milestone 3.0 - Real-Time Collaboration
 * Last Updated: 2026-01-16
 */

/**
 * Document Operation Types (for Operational Transformation)
 */
export enum OperationType {
  INSERT = 'insert',
  DELETE = 'delete',
  RETAIN = 'retain',
  REPLACE = 'replace',
  FORMAT = 'format',
}

/**
 * Document Operation
 */
export interface DocumentOperation {
  id: string;
  type: OperationType;
  position: number;
  length?: number;
  content?: string;
  attributes?: Record<string, unknown>;
  userId: string;
  timestamp: number;
  documentId: string;
}

/**
 * Collaborative Document State
 */
export interface CollaborativeDocument {
  id: string;
  title: string;
  content: string;
  version: number;
  operations: DocumentOperation[];
  collaborators: Collaborator[];
  lastModified: number;
  ownerId: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: number;
}

/**
 * Document Change Event
 */
export interface DocumentChangeEvent {
  documentId: string;
  operation: DocumentOperation;
  version: number;
  applied: boolean;
  conflict?: boolean;
}

/**
 * Collaborator Presence
 */
export interface Collaborator {
  userId: string;
  userName: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  avatar?: string;
  isConnected: boolean;
  cursor?: CursorPosition;
  selection?: SelectionRange;
  lastActivity: number;
  isEditing: boolean;
}

/**
 * Cursor Position
 */
export interface CursorPosition {
  line: number;
  column: number;
}

/**
 * Selection Range
 */
export interface SelectionRange {
  start: CursorPosition;
  end: CursorPosition;
}

/**
 * Classroom Session State
 */
export interface ClassroomSession {
  id: string;
  classId: string;
  teacherId: string;
  subject: string;
  status: 'idle' | 'active' | 'paused' | 'ended';
  startedAt?: number;
  endedAt?: number;
  participants: SessionParticipant[];
  activities: ClassroomActivity[];
  sharedScreen?: boolean;
  sharedScreenBy?: string;
  whiteboard?: WhiteboardState;
  isRecording: boolean;
}

/**
 * Session Participant
 */
export interface SessionParticipant {
  userId: string;
  userName: string;
  role: 'teacher' | 'student';
  joinedAt: number;
  leftAt?: number;
  isMuted: boolean;
  hasRaisedHand: boolean;
  screenSharing: boolean;
}

/**
 * Classroom Activity
 */
export interface ClassroomActivity {
  id: string;
  type: 'screen_share' | 'whiteboard' | 'poll' | 'quiz' | 'announcement' | 'question';
  userId: string;
  timestamp: number;
  content: Record<string, unknown>;
}

/**
 * Whiteboard State
 */
export interface WhiteboardState {
  elements: WhiteboardElement[];
  backgroundColor: string;
  width: number;
  height: number;
  version: number;
}

/**
 * Whiteboard Element
 */
export interface WhiteboardElement {
  id: string;
  type: 'freehand' | 'text' | 'shape' | 'image';
  userId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

/**
 * Chat Message
 */
export interface ChatMessage {
  id: string;
  conversationId: string;
  fromUserId: string;
  toUserId?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: ChatAttachment[];
  timestamp: number;
  isRead: boolean;
  readBy?: string[];
  reactions?: MessageReaction[];
  isEdited: boolean;
  editedAt?: number;
}

/**
 * Chat Attachment
 */
export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: number;
}

/**
 * Message Reaction
 */
export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: number;
}

/**
 * Conversation
 */
export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'classroom';
  participants: ConversationParticipant[];
  unreadCount: number;
  lastMessage?: ChatMessage;
  lastActivity: number;
  metadata?: Record<string, unknown>;
}

/**
 * Conversation Participant
 */
export interface ConversationParticipant {
  userId: string;
  userName: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  avatar?: string;
  lastRead?: number;
  typing?: boolean;
  typingSince?: number;
}

/**
 * Typing Indicator
 */
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

/**
 * Presence Update Event
 */
export interface PresenceUpdateEvent {
  userId: string;
  presence: 'online' | 'away' | 'busy' | 'offline';
  status?: string;
  lastActivity: number;
}

/**
 * Real-Time Grade Update
 */
export interface GradeUpdate {
  id: string;
  studentId: string;
  subject: string;
  grade: number;
  gradedBy: string;
  gradedAt: number;
  comment?: string;
  attachments?: string[];
  isPublished: boolean;
}

/**
 * Grade Update Event
 */
export interface GradeUpdateEvent {
  gradeId: string;
  studentId: string;
  subject: string;
  previousGrade?: number;
  newGrade: number;
  gradedBy: string;
  timestamp: number;
}

/**
 * Conflict Resolution Strategy
 */
export enum ConflictStrategy {
  LAST_WRITE_WINS = 'last_write_wins',
  OPERATIONAL_TRANSFORM = 'operational_transform',
  CRDT = 'crdt',
  MANUAL = 'manual',
}

/**
 * Conflict Event
 */
export interface ConflictEvent {
  id: string;
  type: 'document' | 'grade' | 'chat' | 'classroom';
  resourceId: string;
  operations: DocumentOperation[];
  detectedAt: number;
  resolved?: boolean;
  resolution?: ConflictResolution;
}

/**
 * Conflict Resolution
 */
export interface ConflictResolution {
  strategy: ConflictStrategy;
  resolvedBy: string;
  resolvedAt: number;
  selectedOperation?: string;
  mergedContent?: string;
}

/**
 * Real-Time Service Config
 */
export interface RealTimeConfig {
  // Document Collaboration
  maxOperations: number;
  operationRetention: number;
  autoSaveInterval: number;
  conflictStrategy: ConflictStrategy;

  // Classroom
  maxParticipants: number;
  sessionTimeout: number;
  whiteboardSyncInterval: number;

  // Chat
  messageRetention: number;
  typingIndicatorTimeout: number;
  messageHistoryLimit: number;

  // Presence
  presenceUpdateInterval: number;
  offlineThreshold: number;

  // General
  enablePersistence: boolean;
  enableEncryption: boolean;
  maxRetries: number;
  retryDelay: number;
}
