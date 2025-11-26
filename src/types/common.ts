// Enhanced type definitions to replace 'any' types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface StudentData {
  id: string;
  name: string;
  email: string;
  grade: number;
  attendance: number;
  assignments: AssignmentData[];
}

export interface AssignmentData {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
}

export interface TeacherData {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  classes: ClassData[];
}

export interface ClassData {
  id: string;
  name: string;
  grade: number;
  students: StudentData[];
}

export interface SupportRequestData {
  id: string;
  studentId: string;
  type: 'academic' | 'technical' | 'personal';
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface MemoryData {
  id: string;
  type: 'conversation' | 'knowledge' | 'context';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: string[];
}

export interface ErrorContext {
  componentName: string;
  props: string[];
  hasCustomFallback: boolean;
  hasCustomErrorHandler: boolean;
  stackTrace?: string;
}

export interface AnalyticsEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

// Generic function types
export type AsyncFunction<T = void> = () => Promise<T>;
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Service response types
export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Configuration types
export interface DatabaseConfig {
  url: string;
  apiKey: string;
  options?: Record<string, unknown>;
}

export interface AuthConfig {
  secretKey: string;
  tokenExpiry: number;
  refreshThreshold: number;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}