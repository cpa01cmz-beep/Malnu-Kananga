export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: false,
      astTransformers: {
        before: [
          {
            path: 'ts-jest-mock-import-meta',
            options: {
              metaObjectReplacement: {
                env: {
                  DEV: true,
                  VITE_WORKER_URL: 'http://localhost:8787',
                  VITE_JWT_SECRET: 'test-secret-key',
                  VITE_USE_SUPABASE: 'false',
                  USE_SUPABASE: 'false'
                }
              }
            }
          }
        ]
      }
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [['@babel/preset-env', { modules: 'commonjs' }]]
    }]
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ]
};