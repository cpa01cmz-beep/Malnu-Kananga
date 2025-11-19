export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/src/__mocks__/importMetaMock.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      useESM: false
    }
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: false,
      tsconfig: 'tsconfig.json'
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