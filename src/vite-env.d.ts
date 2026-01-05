
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
  readonly API_KEY: string;
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

interface SpeechSynthesisErrorEvent extends Event {
  readonly error: 'canceled' | 'interrupted' | 'not-allowed' | 'synthesis-unavailable';
  readonly utterance: SpeechSynthesisUtterance;
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
}
