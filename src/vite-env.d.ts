
declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: unknown) => void
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GEMINI_API_KEY: string;
  // Flexy: School configuration for multi-tenant support
  readonly VITE_SCHOOL_NAME: string;
  readonly VITE_SCHOOL_NPSN: string;
  readonly VITE_SCHOOL_ADDRESS: string;
  readonly VITE_SCHOOL_PHONE: string;
  readonly VITE_SCHOOL_EMAIL: string;
  readonly VITE_SCHOOL_WEBSITE: string;
  readonly VITE_ADMIN_EMAIL: string;
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown;
  onerror: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown;
  onstart: (this: SpeechRecognition, ev: Event) => unknown;
  onend: (this: SpeechRecognition, ev: Event) => unknown;
  onspeechstart: (this: SpeechRecognition, ev: Event) => unknown;
  onspeechend: (this: SpeechRecognition, ev: Event) => unknown;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: 'no-speech' | 'audio-capture' | 'not-allowed' | 'network' | 'aborted';
  readonly message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechSynthesisVoice {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  voiceURI?: string;
}

interface SpeechSynthesisUtteranceEvent extends Event {
  readonly name: string;
  readonly utterance: SpeechSynthesisUtterance;
  readonly elapsedTime: number;
}

interface SpeechSynthesisUtterance extends EventTarget {
  text: string;
  lang: string;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  rate: number;
  pitch: number;
  onstart: (this: SpeechSynthesisUtterance, ev: Event) => unknown;
  onend: (this: SpeechSynthesisUtterance, ev: Event) => unknown;
  onerror: (this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => unknown;
  onpause: (this: SpeechSynthesisUtterance, ev: Event) => unknown;
  onresume: (this: SpeechSynthesisUtterance, ev: Event) => unknown;
  onboundary: (this: SpeechSynthesisUtterance, ev: SpeechSynthesisUtteranceEvent) => unknown;
}

interface SpeechSynthesisErrorEvent extends Event {
  readonly error: 'canceled' | 'interrupted' | 'not-allowed' | 'synthesis-unavailable';
  readonly utterance: SpeechSynthesisUtterance;
}

interface SpeechSynthesis {
  speak(utterance: SpeechSynthesisUtterance): void;
  cancel(): void;
  pause(): void;
  resume(): void;
  getVoices(): SpeechSynthesisVoice[];
  readonly speaking: boolean;
  readonly pending: boolean;
  readonly paused: boolean;
  onvoiceschanged: (this: SpeechSynthesis, ev: Event) => unknown;
}

  interface Window {
   SpeechRecognition: {
     prototype: SpeechRecognition;
     new(): SpeechRecognition;
   };
   webkitSpeechRecognition: {
     prototype: SpeechRecognition;
     new(): SpeechRecognition;
   };
   speechSynthesis: SpeechSynthesis;
   Notification: {
     new (title: string, options?: NotificationOptions): Notification;
     permission: NotificationPermission;
     requestPermission(): Promise<NotificationPermission>;
   };
 }

 interface Notification {
   readonly title: string;
   readonly body: string;
   readonly tag: string;
   readonly icon: string;
   readonly badge: string;
   readonly image: string;
   readonly timestamp: number;
   readonly data: Record<string, unknown>;
   onclick: ((this: Notification, ev: Event) => void) | null;
   close(): void;
 }

 interface NotificationOptions {
   body?: string;
   icon?: string;
   badge?: string;
   image?: string;
   tag?: string;
   timestamp?: number;
   requireInteraction?: boolean;
   vibrate?: number[];
   data?: Record<string, unknown>;
 }

 /* eslint-disable no-undef */
interface NotificationPermission extends string {
/* eslint-enable no-undef */
   readonly 'default': NotificationPermission;
   readonly 'granted': NotificationPermission;
   readonly 'denied': NotificationPermission;
 }

 interface PushSubscription {
   readonly endpoint: string;
   readonly expirationTime: number | null;
   readonly options: PushSubscriptionOptions;
   getKey(name: 'p256dh' | 'auth'): ArrayBuffer | null;
   unsubscribe(): Promise<boolean>;
 }

 interface PushSubscriptionOptions {
   userVisibleOnly: boolean;
   applicationServerKey: Uint8Array | null;
 }
