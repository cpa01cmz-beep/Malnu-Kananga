
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
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    speechSynthesis: SpeechSynthesis;
    SpeechSynthesisUtterance: {
      new (text: string): SpeechSynthesisUtterance;
      prototype: SpeechSynthesisUtterance;
    };
  }
}

export interface SpeechWindow {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
  speechSynthesis: SpeechSynthesis;
  SpeechSynthesisUtterance: {
    new (text: string): SpeechSynthesisUtterance;
    prototype: SpeechSynthesisUtterance;
  };
}
