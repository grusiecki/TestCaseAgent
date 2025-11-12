import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment configuration
    environment: 'happy-dom',
    
    // Global setup and teardown
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    
    // Pool options for better stability in CI
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/__tests__/**',
        '**/types.ts',
        '**/*.d.ts',
        'src/env.d.ts',
        'astro.config.mjs',
        'eslint.config.js',
      ],
      // Set thresholds for critical code paths
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    
    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/**/__tests__/**/*.{ts,tsx}',
    ],
    
    // Watch mode configuration
    watch: false,
    
    // Reporting
    reporters: ['verbose'],
    
    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

