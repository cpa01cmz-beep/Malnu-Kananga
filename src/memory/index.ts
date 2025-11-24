// Main exports
export { MemoryBank } from './MemoryBank';
export { MemoryService } from './services/MemoryService';

// Storage adapters - dynamic imports for better code splitting
export const LocalStorageAdapter = () => import('./storage/LocalStorageAdapter').then(m => m.LocalStorageAdapter);
export const CloudStorageAdapter = () => import('./storage/CloudStorageAdapter').then(m => m.CloudStorageAdapter);

// Utilities
export * from './utils/memoryUtils';

// Types
export * from './types';

// Configuration
export * from './config';