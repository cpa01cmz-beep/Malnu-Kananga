/**
 * Global declarations for Cloudflare Worker environment
 * These declarations resolve ESLint errors for worker-specific globals
 */

/* global self, indexedDB, clients, Response, Request, Headers, FetchEvent, caches */

// Worker environment globals
declare const self: WorkerGlobalScope;
declare const indexedDB: IDBFactory;
declare const clients: Clients;

// Web API globals
declare const Response: typeof Response;
declare const Request: typeof Request;
declare const Headers: typeof Headers;
declare const FetchEvent: typeof FetchEvent;
declare const caches: CacheStorage;

export {};