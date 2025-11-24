/// <reference types="dom" />
/// <reference types="node" />

declare global {
  interface Window {
    announceNavigation?: (message: string) => void;
  }
}

export {};