
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

export type UserRole = 'admin' | 'teacher' | 'student';

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
}

export interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  condition: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  location: string;
}

export interface SchoolEvent {
  id: string;
  eventName: string;
  date: string;
  location: string;
  description: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
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
  createdBy: string;
  createdAt: string;
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
  uploadedAt: string;
  downloadCount: number;
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
  onBoundary?: (event: SpeechSynthesisUtteranceEvent) => void;
}

export interface VoiceSettings {
  recognition: SpeechRecognitionConfig;
  synthesis: SpeechSynthesisConfig;
  enabled: boolean;
  autoReadAI: boolean;
  continuousMode: boolean;
}

export interface VoiceMessage {
  id: string;
  transcript: string;
  isFinal: boolean;
  timestamp: number;
}
