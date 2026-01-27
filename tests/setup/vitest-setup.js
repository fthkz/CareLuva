/**
 * Vitest Setup File
 * Global test configuration and utilities
 */

import { beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Set up DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:8080',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock;
global.sessionStorage = localStorageMock;

// Mock Firebase (will be initialized in individual tests)
global.window.firebase = {
  app: null,
  auth: null,
  db: null,
  analytics: null
};

global.window.firebaseReady = false;

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

// Clean up after each test
afterEach(() => {
  // Clear localStorage
  localStorage.clear();
  sessionStorage.clear();
  
  // Reset mocks
  vi.clearAllMocks();
  
  // Clear DOM
  document.body.innerHTML = '';
});

// Global test utilities
global.createMockElement = (tag = 'div', attributes = {}) => {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
};

global.waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Export test utilities
export { dom, localStorageMock };

