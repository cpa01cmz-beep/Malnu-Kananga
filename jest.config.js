export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/src/test-globals.d.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts', 'jest-extended/all'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/?(*.)(test|spec).(ts|tsx|js)'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^./authService$': '<rootDir>/src/__mocks__/authService.ts',
    '^../services/authService$': '<rootDir>/src/__mocks__/authService.ts',
    '^../utils/envValidation$': '<rootDir>/src/__mocks__/envValidation.js',
    '^uuid$': '<rootDir>/src/__mocks__/uuid.js'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: './tsconfig.test.json'
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [['@babel/preset-env', { 
        modules: 'commonjs',
        targets: {
          node: 'current'
        }
      }]]
    }]
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  extensionsToTreatAsEsm: []
};