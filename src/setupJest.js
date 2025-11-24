// Mock import.meta for Jest environment
// Use a workaround to avoid the reserved word 'import' in the file
const importMeta = {
  env: {
    DEV: true,
    PROD: false,
    SSR: false,
    MODE: 'test'
  }
};

// Define import.meta on the global object if it doesn't exist
if (typeof globalThis.import === 'undefined') {
  globalThis.import = { meta: importMeta };
} else if (typeof globalThis.import.meta === 'undefined') {
  Object.defineProperty(globalThis.import, 'meta', {
    value: importMeta,
    writable: true,
    configurable: true
  });
}

// Also ensure process.env is available
if (typeof process === 'undefined') {
  global.process = { env: { NODE_ENV: 'test' } };
} else if (typeof process.env === 'undefined') {
  process.env = { NODE_ENV: 'test' };
}