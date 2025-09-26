import type { Config } from 'jest';
import { createDefaultPreset } from 'ts-jest';

const config: Config = {
  ...createDefaultPreset(),
  testEnvironment: 'node', // para tests de backend

  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],

  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@shared$': '<rootDir>/src/shared/index.ts',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@style/(.*)$': '<rootDir>/src/style/$1',
  },

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  transformIgnorePatterns: [
    '/node_modules/(?!bson|mongoose)/'
  ],

  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/dist/'],

  collectCoverage: true,
  collectCoverageFrom: ['src/**/__test__/**/*.{ts,tsx}', '!**/node_modules/**'],
};

export default config;
