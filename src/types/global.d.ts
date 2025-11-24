/// <reference types="dom" />
/// <reference types="node" />
/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';

declare global {
  interface Window {
    announceNavigation?: (message: string) => void;
  }

  namespace jest {
    interface Matchers<R = void, T = any> {
      toBeInTheDocument(): R;
      toHaveValue(value: any): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: Record<string, any>): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeChecked(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveFocus(): R;
      toBeEmptyDOMElement(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(html: string): R;
      toHaveDescription(text: string | RegExp): R;
      toHaveDisplayValue(value: any): R;
      toHaveErrorMessage(text: string | RegExp): R;
      toHaveFormValues(values: Record<string, any>): R;
      toHaveRole(role: string): R;
      toHaveAccessibleDescription(text: string | RegExp): R;
      toHaveAccessibleName(text: string | RegExp): R;
      toBePartiallyChecked(): R;
      toBeRequired(): R;
      toBeInvalid(): R;
      toBeValid(): R;
    }
  }
  
  var console: globalThis.Console;
  var setTimeout: (handler: globalThis.TimerHandler, timeout?: number, ...arguments: any[]) => number;
  var clearTimeout: (id?: number) => void;
  var setInterval: (handler: globalThis.TimerHandler, timeout?: number, ...arguments: any[]) => number;
  var clearInterval: (id?: number) => void;
  var requestAnimationFrame: (callback: globalThis.FrameRequestCallback) => number;
  var cancelAnimationFrame: (id: number) => void;
  var localStorage: globalThis.Storage;
  var sessionStorage: globalThis.Storage;
  var navigator: globalThis.Navigator;
  var document: globalThis.Document;
  var window: globalThis.Window;
  var alert: (message?: any) => void;
  var confirm: (message?: string) => boolean;
  var prompt: (message?: string, _default?: string) => string | null;
  var fetch: (input: globalThis.RequestInfo | URL, init?: globalThis.RequestInit) => Promise<Response>;
  var btoa: (data: string) => string;
  var atob: (data: string) => string;
  var Blob: typeof Blob;
  var File: typeof File;
  var FileReader: typeof FileReader;
  var FormData: typeof FormData;
  var URLSearchParams: typeof URLSearchParams;
  var URL: typeof URL;
  var Event: typeof Event;
  var CustomEvent: typeof CustomEvent;
  var EventTarget: typeof EventTarget;
  var HTMLElement: typeof HTMLElement;
  var HTMLInputElement: typeof HTMLInputElement;
  var HTMLFormElement: typeof HTMLFormElement;
  var HTMLDivElement: typeof HTMLDivElement;
  var HTMLImageElement: typeof HTMLImageElement;
  var IntersectionObserver: typeof IntersectionObserver;
  var MutationObserver: typeof MutationObserver;
  var ResizeObserver: typeof ResizeObserver;
  var WebSocket: typeof WebSocket;
  var Worker: typeof Worker;
  var SharedWorker: typeof SharedWorker;
  var ServiceWorker: typeof ServiceWorker;
  var Notification: typeof Notification;
  var Geolocation: typeof Geolocation;
  var GeolocationPosition: typeof GeolocationPosition;
  var GeolocationPositionError: typeof GeolocationPositionError;
  var MediaDevices: typeof MediaDevices;
  var MediaStream: typeof MediaStream;
  var MediaStreamTrack: typeof MediaStreamTrack;
  var RTCPeerConnection: typeof RTCPeerConnection;
  var RTCDataChannel: typeof RTCDataChannel;
  var RTCIceCandidate: typeof RTCIceCandidate;
  var RTCSessionDescription: typeof RTCSessionDescription;
  var Performance: typeof Performance;
  var PerformanceEntry: typeof PerformanceEntry;
  var PerformanceMark: typeof PerformanceMark;
  var PerformanceMeasure: typeof PerformanceMeasure;
  var PerformanceNavigation: typeof PerformanceNavigation;
  var PerformanceResourceTiming: typeof PerformanceResourceTiming;
  var PerformanceTiming: typeof PerformanceTiming;
  var Screen: typeof Screen;
  var ScreenOrientation: typeof ScreenOrientation;
  var VisualViewport: typeof VisualViewport;
  var History: typeof History;
  var Location: typeof Location;
  var PopStateEvent: typeof PopStateEvent;
  var HashChangeEvent: typeof HashChangeEvent;
  var PageTransitionEvent: typeof PageTransitionEvent;
  var ErrorEvent: typeof ErrorEvent;
  var FocusEvent: typeof FocusEvent;
  var KeyboardEvent: typeof KeyboardEvent;
  var MouseEvent: typeof MouseEvent;
  var PointerEvent: typeof PointerEvent;
  var TouchEvent: typeof TouchEvent;
  var WheelEvent: typeof WheelEvent;
  var DragEvent: typeof DragEvent;
  var ClipboardEvent: typeof ClipboardEvent;
  var CompositionEvent: typeof CompositionEvent;
  var InputEvent: typeof InputEvent;
  var UIEvent: typeof UIEvent;
  var ProgressEvent: typeof ProgressEvent;
  var StorageEvent: typeof StorageEvent;
  var MessageEvent: typeof MessageEvent;
  var BeforeUnloadEvent: typeof BeforeUnloadEvent;
  var PageShowEvent: typeof PageShowEvent;
  var PageHideEvent: typeof PageHideEvent;
  var EventListener: typeof EventListener;
  var HeadersInit: typeof HeadersInit;
  var AbortSignal: typeof AbortSignal;
  var URLSearchParams: typeof URLSearchParams;
  var NodeJS: typeof NodeJS;
  var React: typeof React;
  var global: typeof global;
  
  namespace jest {
    interface Matchers<R = void, T = any> {
      toBeInTheDocument(): R;
      toHaveValue(value: any): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: Record<string, any>): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeChecked(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveFocus(): R;
      toBeEmptyDOMElement(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(html: string): R;
      toHaveDescription(text: string | RegExp): R;
      toHaveDisplayValue(value: any): R;
      toHaveErrorMessage(text: string | RegExp): R;
      toHaveFormValues(values: Record<string, any>): R;
      toHaveRole(role: string): R;
      toHaveAccessibleDescription(text: string | RegExp): R;
      toHaveAccessibleName(text: string | RegExp): R;
      toBePartiallyChecked(): R;
      toBeRequired(): R;
      toBeInvalid(): R;
      toBeValid(): R;
    }
  }
}

export {};