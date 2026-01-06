
export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
}

export interface FeaturedProgram {
  title: string;
  description: string;
  imageUrl: string;
}

export interface LatestNews {
  title: string;
  date: string;
  category: string;
  imageUrl: string;
}

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

// Role tambahan untuk tugas khusus
export type UserExtraRole = 'staff' | 'osis' | null;

export interface Student {
  id: string;
  userId: string;
  nisn: string;
  nis: string;
  class: string;
  className: string;
  address: string;
  phoneNumber: string;
  parentName: string;
  parentPhone: string;
  dateOfBirth: string;
  enrollmentDate: string;
}

export interface Teacher {
  id: string;
  userId: string;
  nip: string;
  subjects: string;
  joinDate: string;
}

export interface Parent {
  id: string;
  userId: string;
  children: ParentChild[];
}

export interface ParentChild {
  relationshipId: string;
  relationshipType: 'ayah' | 'ibu' | 'wali';
  isPrimaryContact: boolean;
  studentId: string;
  nisn: string;
  nis: string;
  class: string;
  className: string;
  dateOfBirth: string;
  studentName: string;
  studentEmail: string;
  classNameFull?: string;
  academicYear?: string;
  semester?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  extraRole?: UserExtraRole;
  status: 'active' | 'inactive';
}

export interface PPDBRegistrant {
  id: string;
  fullName: string;
  nisn: string;
  originSchool: string;
  parentName: string;
  phoneNumber: string;
  email: string;
  address: string;
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documentUrl?: string;
  score?: number;
  rubricScores?: Record<string, number>;
  documentPreviews?: DocumentPreview[];
}

export interface DocumentPreview {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'document';
  size: number;
}

export interface PPDBFilterOptions {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  dateRange: 'all' | 'today' | 'week' | 'month';
  scoreRange: 'all' | 'high' | 'medium' | 'low';
  schoolFilter: string;
}

export interface PPDBSortOptions {
  field: 'registrationDate' | 'fullName' | 'score' | 'status';
  direction: 'asc' | 'desc';
}

export interface PPDBTemplate {
  id: string;
  name: string;
  type: 'approval' | 'rejection';
  subject: string;
  body: string;
  variables: string[];
}

export interface PPDBRubric {
  id: string;
  name: string;
  criteria: {
    id: string;
    name: string;
    weight: number;
    maxScore: number;
    description: string;
  }[];
}

export interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  condition: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  location: string;
  purchaseDate?: string;
  purchasePrice?: number;
  supplier?: string;
  warrantyExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  depreciationRate?: number;
  currentValue?: number;
  qrCode?: string;
  barcode?: string;
  notes?: string;
  assignedTo?: string;
  status?: 'active' | 'maintenance' | 'disposed' | 'lost';
}

export interface MaintenanceSchedule {
  id: string;
  itemId: string;
  itemName: string;
  scheduledDate: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  assignedTo?: string;
  completedDate?: string;
  cost?: number;
  notes?: string;
}

export interface InventoryAudit {
  id: string;
  auditDate: string;
  auditor: string;
  items: AuditItem[];
  status: 'in-progress' | 'completed' | 'approved';
  notes?: string;
  totalItems: number;
  matchedItems: number;
  mismatchedItems: number;
  missingItems: number;
}

export interface AuditItem {
  itemId: string;
  expectedQuantity: number;
  actualQuantity: number;
  condition: 'matched' | 'mismatch' | 'missing';
  notes?: string;
}

export interface InventoryReport {
  totalValue: number;
  totalItems: number;
  categoryBreakdown: CategoryReport[];
  conditionBreakdown: ConditionReport[];
  depreciationData: DepreciationReport[];
  maintenanceSchedule: MaintenanceSchedule[];
}

export interface CategoryReport {
  category: string;
  count: number;
  value: number;
}

export interface ConditionReport {
  condition: string;
  count: number;
  percentage: number;
}

export interface DepreciationReport {
  itemName: string;
  purchaseValue: number;
  currentValue: number;
  depreciationAmount: number;
  depreciationPercentage: number;
}

export interface SchoolEvent {
  id: string;
  eventName: string;
  date: string;
  location: string;
  description: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  organizer?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  registrationDate: string;
  attendanceStatus: 'registered' | 'attended' | 'absent';
  notes?: string;
}

export interface EventBudget {
  id: string;
  eventId: string;
  category: 'Food' | 'Decoration' | 'Equipment' | 'Venue' | 'Marketing' | 'Other';
  itemName: string;
  estimatedCost: number;
  actualCost?: number;
  quantity: number;
  status: 'planned' | 'approved' | 'purchased' | 'completed';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface EventPhoto {
  id: string;
  eventId: string;
  photoUrl: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface EventFeedback {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  overallRating: number;
  organizationRating: number;
  contentRating: number;
  comments?: string;
  wouldRecommend: boolean;
  submittedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  creditHours: number;
}

export interface Class {
  id: string;
  name: string;
  homeroomTeacherId: string;
  academicYear: string;
  semester: '1' | '2';
}

export interface Schedule {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  startTime: string;
  endTime: string;
  room: string;
  subjectName?: string;
  teacherName?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  academicYear: string;
  semester: string;
  assignmentType: string;
  assignmentName: string;
  score: number;
  maxScore: number;
  assignment?: number;
  midExam?: number;
  finalExam?: number;
  createdBy: string;
  createdAt: string;
  subjectName?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  notes: string;
  recordedBy: string;
  createdAt: string;
  className?: string;
}

export interface MaterialFolder {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  description?: string;
  color: string;
  icon: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  materialCount: number;
  subfolders: MaterialFolder[];
}

export interface MaterialVersion {
  id: string;
  materialId: string;
  version: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  changeLog: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface MaterialSharing {
  id: string;
  materialId: string;
  sharedWith: string[]; // User IDs
  sharedBy: string;
  permission: 'view' | 'edit' | 'admin';
  sharedAt: string;
  expiresAt?: string;
}

export interface MaterialTemplate {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: string;
  subjectId?: string;
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
}

export interface MaterialAnalytics {
  id: string;
  materialId: string;
  totalDownloads: number;
  uniqueUsers: number;
  averageRating: number;
  totalReviews: number;
  lastAccessed: string;
  dailyStats: {
    date: string;
    downloads: number;
    uniqueUsers: number;
  }[];
  monthlyStats: {
    month: string;
    downloads: number;
    uniqueUsers: number;
  }[];
}

export interface ELibrary {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  subjectId: string;
  uploadedBy: string;
  uploadedByTeacherName?: string;
  uploadedAt: string;
  downloadCount: number;
  folderId?: string;
  isShared: boolean;
  sharedWith?: string[];
  currentVersion?: string;
  versions?: MaterialVersion[];
  analytics?: MaterialAnalytics;
  templates?: MaterialTemplate[];
}

export interface MaterialFavorite {
  materialId: string;
  userId: string;
  createdAt: string;
}

export interface MaterialRating {
  id: string;
  materialId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProgress {
  materialId: string;
  userId: string;
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  lastReadAt: string;
  timeSpentMinutes: number;
}

export interface MaterialSearchFilters {
  subject?: string;
  teacher?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  fileType?: string;
  minRating?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'umum' | 'akademik' | 'kegiatan' | 'keuangan';
  targetAudience: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
}

export enum VoiceLanguage {
  Indonesian = 'id-ID',
  English = 'en-US',
}

export type SpeechRecognitionState = 'idle' | 'listening' | 'processing' | 'error';

export interface SpeechRecognitionConfig {
  language: VoiceLanguage;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface SpeechRecognitionError {
  error: 'no-speech' | 'audio-capture' | 'not-allowed' | 'network' | 'aborted' | 'unknown';
  message: string;
}

export interface SpeechRecognitionEventCallbacks {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: SpeechRecognitionError) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

export interface SpeechSynthesisVoice {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  voiceURI?: string;
}

export interface SpeechSynthesisConfig {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
}

export type SpeechSynthesisState = 'idle' | 'speaking' | 'paused' | 'error';

export interface SpeechSynthesisError {
  error: 'canceled' | 'interrupted' | 'not-allowed' | 'unknown';
  message: string;
}

export interface SpeechSynthesisEventCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisError) => void;
  onPause?: () => void;
  onResume?: () => void;
  onBoundary?: (event: Event) => void;
}

export interface VoiceSettings {
  recognition: SpeechRecognitionConfig;
  synthesis: SpeechSynthesisConfig;
  enabled: boolean;
  autoReadAI: boolean;
  continuousMode: boolean;
}

export interface VoiceCommand {
  id: string;
  action: string;
  transcript: string;
  confidence: number;
}

export interface VoiceMessage {
  id: string;
  transcript: string;
  isFinal: boolean;
  timestamp: number;
}

// Web Speech API TypeScript interfaces
export interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  
  abort(): void;
  start(): void;
  stop(): void;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: 'no-speech' | 'audio-capture' | 'not-allowed' | 'network' | 'aborted' | 'service-not-allowed';
  message?: string;
}

export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechGrammarList {
  length: number;
  addFromString(string: string, weight?: number): void;
  addFromUri(src: string, weight?: number): void;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
}

export interface SpeechGrammar {
  src: string;
  weight: number;
}

export interface SpeechSynthesis extends EventTarget {
  onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => void) | null;
  paused: boolean;
  pending: boolean;
  speaking: boolean;
  
  cancel(): void;
  getVoices(): SpeechSynthesisVoice[];
  pause(): void;
  resume(): void;
  speak(utterance: SpeechSynthesisUtterance): void;
}

export interface SpeechSynthesisUtterance extends EventTarget {
  lang: string;
  pitch: number;
  rate: number;
  text: string;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  
  onboundary: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => void) | null;
  onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => void) | null;
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => void) | null;
  onmark: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => void) | null;
  onpause: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => void) | null;
  onresume: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => void) | null;
  onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => void) | null;
}

export interface SpeechSynthesisUtteranceConstructor {
  new (text: string): SpeechSynthesisUtterance;
}

export interface SpeechSynthesisEvent extends Event {
  name: string;
  charIndex: number;
  elapsedTime: number;
}

export interface SpeechSynthesisErrorEvent extends Event {
  error: 'canceled' | 'interrupted' | 'synthesis-unavailable' | 'synthesis-failed' | 'language-unavailable' | 'voice-unavailable' | 'text-too-long' | 'rate-not-supported';
}

// Window interface extensions
export interface SpeechWindow {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
  speechSynthesis: SpeechSynthesis;
  SpeechSynthesisUtterance: {
    new (text: string): SpeechSynthesisUtterance;
    prototype: SpeechSynthesisUtterance;
  };
}

export type NotificationType = 'announcement' | 'grade' | 'ppdb' | 'event' | 'library' | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface PushNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  timestamp: string;
  read: boolean;
  priority: NotificationPriority;
  targetRoles?: UserRole[];
  targetExtraRoles?: UserExtraRole[];
  targetUsers?: string[];
  batchSize?: number;
  batchId?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  announcements: boolean;
  grades: boolean;
  ppdbStatus: boolean;
  events: boolean;
  library: boolean;
  system: boolean;
  roleBasedFiltering: boolean;
  batchNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPermission {
  granted: boolean;
  state: 'default' | 'granted' | 'denied';
}

export interface PushSubscriptionOptions {
  userVisibleOnly: boolean;
  applicationServerKey: string | null;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  body: string;
  variables: string[];
  targetRoles?: UserRole[];
  targetExtraRoles?: UserExtraRole[];
  priority: NotificationPriority;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationBatch {
  id: string;
  name: string;
  notifications: PushNotification[];
  scheduledFor: string;
  deliveryMethod: 'immediate' | 'scheduled' | 'manual';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  sentAt?: string;
  failureReason?: string;
}

export interface NotificationAnalytics {
  id: string;
  notificationId: string;
  delivered: number;
  read: number;
  clicked: number;
  dismissed: number;
  timestamp: string;
  roleBreakdown: Record<UserRole, number>;
}

export interface NotificationCenterItem {
  id: string;
  notification: PushNotification;
  status: 'delivered' | 'read' | 'clicked' | 'dismissed';
  deliveredAt: string;
  readAt?: string;
  clickedAt?: string;
  dismissedAt?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  vibrate?: number[];
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationHistoryItem {
  id: string;
  notification: PushNotification;
  clicked: boolean;
  dismissed: boolean;
  deliveredAt: string;
}

export interface Goal {
  id: string;
  studentId: string;
  subject: string;
  targetGrade: string;
  currentGrade: number;
  deadline: string;
  status: 'in-progress' | 'achieved' | 'not-achieved';
  createdAt: string;
}

export interface GradeTrendData {
  date: string;
  subject: string;
  score: number;
  assignmentType: string;
}

export interface SubjectPerformance {
  subject: string;
  averageScore: number;
  assignment: number;
  midExam: number;
  finalExam: number;
  grade: string;
  trend: 'up' | 'down' | 'stable';
  targetGrade?: string;
}

export interface AttendanceGradeCorrelation {
  attendancePercentage: number;
  averageGrade: number;
  correlationScore: number;
  insights: string[];
}
