// Jest setup file to handle import.meta.env
// Mock import.meta.env for Node.js environment
global.import = {
  meta: {
    env: {
      DEV: true,
      MODE: 'test',
      PROD: false,
      SSR: false
    }
  }
};