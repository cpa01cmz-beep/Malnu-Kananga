
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

export type UserExtraRole = 'staff' | 'osis' | 'wakasek' | 'kepsek' | null;

export enum AssignmentType {
  ASSIGNMENT = 'assignment',
  PROJECT = 'project',
  QUIZ = 'quiz',
  EXAM = 'exam',
  LAB_WORK = 'lab_work',
  PRESENTATION = 'presentation',
  HOMEWORK = 'homework',
  OTHER = 'other',
}

export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

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

export interface ParentTeacher {
  teacherId: string;
  teacherName: string;
  subject: string;
  className: string;
  availableSlots?: TimeSlot[];
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface ParentMeeting {
  id: string;
  childId: string;
  childName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  agenda: string;
  notes?: string;
  location: string;
}

export interface ParentMessage {
  id: string;
  sender: 'parent' | 'teacher';
  teacherName?: string;
  childName?: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ParentPayment {
  id: string;
  childId?: string;
  paymentType: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: string;
  method?: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  extraRole?: UserExtraRole;
  status: 'active' | 'inactive';
  phone?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  dateOfBirth?: string;
}

export interface PPDBRegistrant {
  id: string;
  userId?: string;
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
  ocrMetadata?: {
    extractedGrades?: Record<string, number>;
    extractedFullName?: string;
    extractedNisn?: string;
    extractedSchoolName?: string;
    confidence?: number;
    quality?: {
      isSearchable: boolean;
      isHighQuality: boolean;
      estimatedAccuracy: number;
      wordCount: number;
      characterCount: number;
      hasMeaningfulContent: boolean;
      documentType: 'unknown' | 'academic' | 'administrative' | 'form' | 'certificate';
    };
    processedAt?: string;
  };
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

export interface OCRExtractionResult {
  text: string;
  confidence: number;
  data: {
    grades?: Record<string, number>;
    fullName?: string;
    nisn?: string;
    schoolName?: string;
  };
  quality: OCRTextQuality;
  extractedAt?: string;
}

export interface OCRTextQuality {
  isSearchable: boolean;
  isHighQuality: boolean;
  estimatedAccuracy: number;
  wordCount: number;
  characterCount: number;
  hasMeaningfulContent: boolean;
  documentType: 'unknown' | 'academic' | 'administrative' | 'form' | 'certificate';
}

export interface OCRProgress {
  status: string;
  progress: number;
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

// Enhanced Teacher Data Types for Validation
export interface GradeFormData {
  studentId: string;
  assignment: number;
  midExam: number;
  finalExam: number;
}

export interface TeacherFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  class?: string;
  room?: string;
}

export interface GradeBatchOperation {
  studentIds: string[];
  operation: 'reset' | 'bulk_fill' | 'delete';
  data?: Partial<GradeFormData>;
}

export interface ClassBatchOperation {
  studentIds: string[];
  operation: 'mark_present' | 'mark_absent' | 'move_class';
  targetClass?: string;
  notes?: string;
}

export interface MaterialBatchOperation {
  materialIds: string[];
  operation: 'move_folder' | 'change_category' | 'delete' | 'archive';
  targetFolder?: string;
  targetCategory?: string;
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

export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: AssignmentType;
  subjectId: string;
  classId: string;
  teacherId: string;
  academicYear: string;
  semester: string;
  maxScore: number;
  dueDate: string;
  status: AssignmentStatus;
  attachments?: AssignmentAttachment[];
  rubric?: AssignmentRubric;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  subjectName?: string;
  className?: string;
  teacherName?: string;
}

export interface AssignmentAttachment {
  id: string;
  assignmentId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface AssignmentRubric {
  id: string;
  assignmentId: string;
  criteria: RubricCriteria[];
  totalScore: number;
  createdAt: string;
}

export interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  weight: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionText?: string;
  attachments: SubmissionAttachment[];
  submittedAt: string;
  score?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  status: 'draft' | 'submitted' | 'late' | 'graded';
}

export interface SubmissionAttachment {
  id: string;
  submissionId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface AIFeedback {
  id: string;
  assignmentId: string;
  submissionId: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedScore?: number;
  generatedAt: string;
  aiModel: string;
  confidence: number;
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
  sharedRoles?: UserRole[]; // Role-based sharing
  sharedExtraRoles?: UserExtraRole[]; // Extra role-based sharing
  isPublic: boolean;
  sharedBy: string;
  permission: 'view' | 'edit' | 'admin';
  sharedAt: string;
  expiresAt?: string;
  auditLog?: MaterialShareAudit[];
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

export interface MaterialSharePermission {
  id: string;
  userId?: string;
  role?: UserRole;
  extraRole?: UserExtraRole;
  permission: 'view' | 'edit' | 'admin';
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  lastAccessed?: string;
  accessCount: number;
}

export interface MaterialShareSettings {
  isPublic: boolean;
  allowAnonymous: boolean;
  requirePassword: boolean;
  password?: string;
  publicLink?: string;
  publicLinkExpiresAt?: string;
}

export interface MaterialShareAudit {
  id: string;
  materialId: string;
  userId: string;
  userName: string;
  action: 'shared' | 'accessed' | 'downloaded' | 'revoked' | 'permission_changed';
  details: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
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
  sharePermissions?: MaterialSharePermission[];
  shareSettings?: MaterialShareSettings;
  currentVersion?: string;
  versions?: MaterialVersion[];
  analytics?: MaterialAnalytics;
  templates?: MaterialTemplate[];
  averageRating?: number;
  totalReviews?: number;
  readingProgress?: ReadingProgress;
  isBookmarked?: boolean;
  isFavorite?: boolean;
  // OCR Integration Fields
  ocrStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  ocrProgress?: number;
  ocrText?: string;
  ocrConfidence?: number;
  ocrProcessedAt?: string;
  ocrError?: string;
  isSearchable?: boolean;
  ocrQuality?: OCRTextQuality;
  documentType?: 'unknown' | 'academic' | 'administrative' | 'form' | 'certificate';
  aiSummary?: string;
  plagiarismFlags?: PlagiarismFlag[];
}

// OCR Related Types
export type OCRStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface OCRUpdate {
  ocrStatus: OCRStatus;
  ocrProgress?: number;
  ocrText?: string;
  ocrConfidence?: number;
  ocrProcessedAt?: string;
  ocrError?: string;
  isSearchable?: boolean;
  ocrQuality?: OCRTextQuality;
  documentType?: 'unknown' | 'academic' | 'administrative' | 'form' | 'certificate';
  aiSummary?: string;
  plagiarismFlags?: PlagiarismFlag[];
}

export interface OCRTextQuality {
  isSearchable: boolean;
  isHighQuality: boolean;
  estimatedAccuracy: number;
  wordCount: number;
  characterCount: number;
  hasMeaningfulContent: boolean;
  documentType: 'unknown' | 'academic' | 'administrative' | 'form' | 'certificate';
}

export interface PlagiarismFlag {
  materialId: string;
  similarity: number;
  matchedText: string;
  details: string;
  flaggedAt: string;
}

export interface OCRProcessingState {
  materialId: string;
  status: OCRStatus;
  progress: number;
  startTime: Date;
  estimatedTimeRemaining?: number;
  error?: string;
}

export interface SearchOptions {
  includeOCR?: boolean;
  minConfidence?: number;
  limit?: number;
  offset?: number;
}

export interface ReadingProgress {
  materialId: string;
  userId: string;
  currentPosition: number;
  totalPages?: number;
  lastReadAt: string;
  readTime: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Bookmark {
  id: string;
  materialId: string;
  userId: string;
  pageNumber?: number;
  position?: number;
  note?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  materialId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfflineDownload {
  id: string;
  materialId: string;
  userId: string;
  downloadUrl: string;
  downloadedAt: string;
  fileSize: number;
  isAvailable: boolean;
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



export interface MaterialSearchFilters {
  subject?: string;
  teacher?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  fileType?: string;
  minRating?: number;
}

export enum AnnouncementCategory {
  UMUM = 'umum',
  AKADEMIK = 'akademik',
  KEGIATAN = 'kegiatan',
  KEUANGAN = 'keuangan',
}

export enum AnnouncementTargetType {
  ALL = 'all',
  ROLES = 'roles',
  CLASSES = 'classes',
  SPECIFIC = 'specific',
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  targetType: AnnouncementTargetType;
  targetAudience?: string;
  targetRoles?: string[];
  targetClasses?: string[];
  targetUsers?: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  updatedAt?: string;
  readBy?: string[];
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  category: AnnouncementCategory;
  targetType: AnnouncementTargetType;
  targetAudience?: string;
  targetRoles?: string[];
  targetClasses?: string[];
  targetUsers?: string[];
  expiresAt?: string;
  sendNotification?: boolean;
}

export interface AnnouncementAnalytics {
  totalSent: number;
  readCount: number;
  clickCount: number;
  byRole: Record<string, number>;
  byClass: Record<string, number>;
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
  data?: {
    query?: string;
    [key: string]: unknown;
  };
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

export type NotificationType = 'announcement' | 'grade' | 'ppdb' | 'event' | 'library' | 'system' | 'ocr' | 'ocr_validation' | 'missing_grades';

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
  ocr: boolean;
  roleBasedFiltering: boolean;
  batchNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  voiceNotifications: VoiceNotificationSettings;
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
  roleBreakdown: Partial<Record<UserRole, number>>;
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

export interface VoiceNotificationSettings {
  enabled: boolean;
  highPriorityOnly: boolean;
  respectQuietHours: boolean;
  voiceSettings: {
    rate: number;
    pitch: number;
    volume: number;
  };
  categories: {
    grades: boolean;
    attendance: boolean;
    system: boolean;
    meetings: boolean;
  };
}

export interface VoiceNotification {
  id: string;
  notificationId: string;
  text: string;
  priority: NotificationPriority;
  category: VoiceNotificationCategory;
  timestamp: string;
  isSpeaking: boolean;
  wasSpoken: boolean;
}

export type VoiceNotificationCategory = 'grade' | 'attendance' | 'system' | 'meeting';

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

export interface ClassGradeAnalytics {
  classId: string;
  className: string;
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  gradeDistribution: GradeDistribution;
  submissionRate: number;
  subjectBreakdown: SubjectAnalytics[];
  topPerformers: StudentPerformance[];
  needsAttention: StudentPerformance[];
  lastUpdated: string;
}

export interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
}

export interface SubjectAnalytics {
  subjectId: string;
  subjectName: string;
  averageScore: number;
  totalAssignments: number;
  totalSubmissions: number;
  submissionRate: number;
  averageCompletionTime: number;
  gradeDistribution: GradeDistribution;
  trend: 'improving' | 'declining' | 'stable';
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  averageScore: number;
  totalAssignments: number;
  completedAssignments: number;
  submissionRate: number;
  gradeDistribution: GradeDistribution;
  trend: 'improving' | 'declining' | 'stable';
  lastSubmission?: string;
}

export interface AssignmentAnalytics {
  assignmentId: string;
  assignmentTitle: string;
  subjectName: string;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  averageScore: number;
  maxScore: number;
  gradeDistribution: GradeDistribution;
  submissionRate: number;
  gradingProgress: number;
  averageFeedbackLength: number;
  lateSubmissions: number;
}

export interface OCRValidationEvent {
  id: string;
  type: 'validation-failure' | 'validation-warning' | 'validation-success';
  documentId: string;
  documentType: string;
  confidence: number;
  issues: string[];
  timestamp: string;
  userId: string;
  userRole: UserRole;
  actionUrl?: string;
}

export interface OCRValidationNotificationData extends OCRValidationEvent {
  requiresReview: boolean;
  automatedRetryCount?: number;
  nextAction?: 'review' | 'reprocess' | 'manual-entry';
}

export enum QuizDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum QuizQuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  FILL_BLANK = 'fill_blank',
  MATCHING = 'matching',
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuizQuestionType;
  difficulty: QuizDifficulty;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  materialReference?: string;
  tags?: string[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  academicYear: string;
  semester: string;
  questions: QuizQuestion[];
  totalPoints: number;
  duration: number;
  passingScore: number;
  attempts: number;
  status: 'draft' | 'published' | 'closed' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  subjectName?: string;
  className?: string;
  teacherName?: string;
  materialIds?: string[];
  aiGenerated: boolean;
  aiConfidence?: number;
}

export interface QuizGenerationOptions {
  materialIds: string[];
  questionCount: number;
  questionTypes: QuizQuestionType[];
  difficulty: QuizDifficulty;
  totalPoints?: number;
  focusAreas?: string[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  answers: Record<string, string | string[]>;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  submittedAt?: string;
  timeSpent: number;
  attemptNumber: number;
}

export interface QuizAnalytics {
  quizId: string;
  title: string;
  totalAttempts: number;
  averageScore: number;
  averagePercentage: number;
  passRate: number;
  averageTimeSpent: number;
  averageDuration: number;
  questionPerformance: Array<{
    questionId: string;
    question: string;
    correctRate: number;
    averageScore: number;
  }>;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';

export type ConversationType = 'direct' | 'group';

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  recipientAvatar?: string;
  messageType: MessageType;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  status: MessageStatus;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  replyTo?: string;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participantIds: string[];
  participants: Participant[];
  lastMessage?: DirectMessage;
  unreadCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  avatar?: string;
  description?: string;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

export interface Participant {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  joinedAt: string;
  lastSeen?: string;
  isOnline: boolean;
  isAdmin?: boolean;
}

export interface ConversationFilter {
  type?: ConversationType;
  search?: string;
  unreadOnly?: boolean;
  archived?: boolean;
}

export interface MessageSendRequest {
  conversationId: string;
  messageType: MessageType;
  content: string;
  file?: File;
  replyTo?: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationCreateRequest {
  type: ConversationType;
  participantIds: string[];
  name?: string;
  description?: string;
  avatar?: string;
  metadata?: Record<string, unknown>;
}

export interface MessageReadReceipt {
  messageId: string;
  userId: string;
  readAt: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

export interface StudyPlan {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  subjects: StudyPlanSubject[];
  schedule: StudyPlanSchedule[];
  recommendations: StudyPlanRecommendation[];
  createdAt: string;
  validUntil: string;
  status: 'active' | 'completed' | 'expired';
}

export interface StudyPlanSubject {
  subjectName: string;
  currentGrade: number;
  targetGrade: string;
  priority: 'high' | 'medium' | 'low';
  weeklyHours: number;
  focusAreas: string[];
  resources: string[];
}

export interface StudyPlanSchedule {
  dayOfWeek: string;
  timeSlot: string;
  subject: string;
  activity: 'study' | 'practice' | 'review' | 'assignment';
  duration: number;
}

export interface StudyPlanRecommendation {
  category: 'study_tips' | 'time_management' | 'subject_advice' | 'general';
  title: string;
  description: string;
  priority: number;
}

export interface StudyPlanAnalytics {
  planId: string;
  studentId: string;
  studentName: string;
  planTitle: string;
  overallProgress: number;
  completionRate: number;
  adherenceRate: number;
  performanceImprovement: PerformanceImprovement;
  subjectProgress: SubjectProgress[];
  weeklyActivity: WeeklyActivity[];
  effectivenessScore: number;
  recommendations: AnalyticsRecommendation[];
  lastUpdated: string;
}

export interface PerformanceImprovement {
  averageGradeChange: number;
  subjectsImproved: number;
  subjectsDeclined: number;
  subjectsMaintained: number;
  topImprovements: SubjectImprovement[];
}

export interface SubjectImprovement {
  subjectName: string;
  previousGrade: number;
  currentGrade: number;
  improvement: number;
}

export interface SubjectProgress {
  subjectName: string;
  targetGrade: number;
  currentGrade: number;
  progress: number;
  priority: 'high' | 'medium' | 'low';
  sessionsCompleted: number;
  sessionsTotal: number;
  averageSessionDuration: number;
}

export interface WeeklyActivity {
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalStudyHours: number;
  scheduledHours: number;
  adherenceRate: number;
  subjectsStudied: string[];
  activitiesCompleted: number;
  activitiesTotal: number;
}

export interface AnalyticsRecommendation {
  type: 'improvement' | 'maintenance' | 'warning' | 'success';
  category: 'schedule' | 'subject' | 'habits' | 'goals';
  title: string;
  description: string;
  actionable: boolean;
}

export interface StudyPlanHistory {
  planId: string;
  planTitle: string;
  status: 'active' | 'completed' | 'expired';
  createdAt: string;
  completedAt?: string;
  effectivenessScore?: number;
  overallProgress: number;
}
