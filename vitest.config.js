import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Test file patterns
    include: ['tests/**/*.test.js', 'tests/**/*.spec.js'],
    exclude: ['node_modules', 'dist', '.git'],
    
    // Global test setup
    setupFiles: ['./tests/setup/vitest-setup.js'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        '*.html',
        'dev/',
        '**/*.test.js',
        '**/*.spec.js'
      ],
      include: [
        'auth-utils.js',
        '*.js',
        'src/**/*.js'
      ]
    },
    
    // Test timeout
    testTimeout: 10000,
    
    // Globals (for convenience)
    globals: true,
    
    // Reporter configuration
    reporters: ['verbose', 'json', 'html'],
    outputFile: {
      json: './tests/results/test-results.json',
      html: './tests/results/test-results.html'
    },
    
    // Test file naming
    testNamePattern: undefined,
    
    // Watch mode
    watch: false,
    
    // Parallel execution
    threads: true,
    maxThreads: 4,
    minThreads: 1
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@tests': resolve(__dirname, './tests'),
      '@src': resolve(__dirname, './src')
    }
  }
});

