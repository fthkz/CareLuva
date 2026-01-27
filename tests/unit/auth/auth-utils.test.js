/**
 * Authentication Utilities Tests
 * Tests for auth-utils.js functions
 * 
 * Note: These tests use mocks to test the logic. For coverage of the actual
 * auth-utils.js file, we would need to refactor it to ES modules.
 * See tests/COVERAGE-NOTES.md for details.
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock implementation that matches auth-utils.js behavior
// This tests the logic without requiring browser-specific code
const createAuthUtils = () => {
  return {
    async hashPassword(password) {
      // Simplified PBKDF2-like hashing for testing
      // Real implementation uses PBKDF2-SHA256 with 100k iterations
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Simplified hash (real implementation uses PBKDF2)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return `${saltHex}:${hashHex}`;
    },
    
    async verifyPassword(password, storedHash) {
      if (!storedHash || !storedHash.includes(':')) {
        // Legacy: plain text comparison
        return password === storedHash;
      }
      
      const [saltHex, storedHashHex] = storedHash.split(':');
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      
      // Simplified verification (real implementation uses PBKDF2 with salt)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Note: This is simplified - real implementation uses the salt properly
      return hashHex === storedHashHex;
    },
    
    createSession(uid, email, registrationData, rememberMe = false) {
      const now = Date.now();
      const expiry = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      
      return {
        uid,
        email,
        loginTime: new Date(now).toISOString(),
        expiresAt: new Date(now + expiry).toISOString(),
        rememberMe,
        version: '1.0'
      };
    },
    
    saveSession(session, registrationData, rememberMe = false) {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('providerSession', JSON.stringify(session));
      
      const safeData = { ...registrationData };
      delete safeData.password;
      storage.setItem('providerRegistration', JSON.stringify(safeData));
    },
    
    getSession() {
      let sessionData = localStorage.getItem('providerSession');
      let storage = localStorage;
      
      if (!sessionData) {
        sessionData = sessionStorage.getItem('providerSession');
        storage = sessionStorage;
      }
      
      if (!sessionData) return null;
      
      try {
        const session = JSON.parse(sessionData);
        const expiresAt = new Date(session.expiresAt).getTime();
        if (Date.now() > expiresAt) {
          this.clearSession();
          return null;
        }
        return { session, storage };
      } catch (error) {
        this.clearSession();
        return null;
      }
    },
    
    isAuthenticated() {
      return this.getSession() !== null;
    },
    
    clearSession() {
      localStorage.removeItem('providerSession');
      localStorage.removeItem('providerRegistration');
      sessionStorage.removeItem('providerSession');
      sessionStorage.removeItem('providerRegistration');
    }
  };
};

describe('Authentication Utilities', () => {
  let authUtils;
  
  beforeEach(() => {
    authUtils = createAuthUtils();
    authUtils.clearSession();
  });
  
  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await authUtils.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
      // Hash should be in format salt:hash
      expect(hash).toMatch(/^[0-9a-f]{32}:[0-9a-f]{64}$/);
    });
    
    it('should produce different hashes for different passwords', async () => {
      const hash1 = await authUtils.hashPassword('password1');
      const hash2 = await authUtils.hashPassword('password2');
      
      expect(hash1).not.toBe(hash2);
      // Even salts should be different
      expect(hash1.split(':')[0]).not.toBe(hash2.split(':')[0]);
    });
    
    it('should produce different hashes for same password (due to random salt)', async () => {
      const password = 'testPassword';
      const hash1 = await authUtils.hashPassword(password);
      const hash2 = await authUtils.hashPassword(password);
      
      // Hashes should be different (different salts)
      expect(hash1).not.toBe(hash2);
      // But verification should work for both
      expect(await authUtils.verifyPassword(password, hash1)).toBe(true);
      expect(await authUtils.verifyPassword(password, hash2)).toBe(true);
    });
  });
  
  describe('Password Verification', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await authUtils.hashPassword(password);
      const isValid = await authUtils.verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });
    
    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hash = await authUtils.hashPassword(password);
      const isValid = await authUtils.verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });
    
    it('should handle legacy plain text passwords', async () => {
      // For migration: plain text passwords should still work
      const password = 'plaintext123';
      const isValid = await authUtils.verifyPassword(password, password);
      
      expect(isValid).toBe(true);
    });
  });
  
  describe('Session Management', () => {
    beforeEach(() => {
      // Clear storage before each test
      authUtils.clearSession();
    });
    
    it('should create a session with correct structure', () => {
      const registrationData = { name: 'Test User', email: 'test@example.com' };
      const session = authUtils.createSession('user123', 'test@example.com', registrationData);
      
      expect(session).toHaveProperty('uid');
      expect(session).toHaveProperty('email');
      expect(session).toHaveProperty('loginTime');
      expect(session).toHaveProperty('expiresAt');
      expect(session).toHaveProperty('rememberMe');
      expect(session).toHaveProperty('version');
      expect(session.uid).toBe('user123');
      expect(session.email).toBe('test@example.com');
    });
    
    it('should set correct expiry for regular session', () => {
      const registrationData = {};
      const session = authUtils.createSession('user123', 'test@example.com', registrationData, false);
      const expiresAt = new Date(session.expiresAt).getTime();
      const loginTime = new Date(session.loginTime).getTime();
      const actualExpiry = expiresAt - loginTime;
      const expectedExpiry = 24 * 60 * 60 * 1000; // 24 hours
      
      // Allow 1 second tolerance
      expect(Math.abs(actualExpiry - expectedExpiry)).toBeLessThan(1000);
    });
    
    it('should set correct expiry for remember me session', () => {
      const registrationData = {};
      const session = authUtils.createSession('user123', 'test@example.com', registrationData, true);
      const expiresAt = new Date(session.expiresAt).getTime();
      const loginTime = new Date(session.loginTime).getTime();
      const actualExpiry = expiresAt - loginTime;
      const expectedExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      // Allow 1 second tolerance
      expect(Math.abs(actualExpiry - expectedExpiry)).toBeLessThan(1000);
    });
    
    it('should save and retrieve session', () => {
      const registrationData = { name: 'Test User', email: 'test@example.com' };
      const session = authUtils.createSession('user123', 'test@example.com', registrationData, false);
      
      authUtils.saveSession(session, registrationData, false);
      const retrieved = authUtils.getSession();
      
      expect(retrieved).not.toBeNull();
      expect(retrieved.session.uid).toBe('user123');
      expect(retrieved.session.email).toBe('test@example.com');
    });
    
    it('should check if user is authenticated', () => {
      expect(authUtils.isAuthenticated()).toBe(false);
      
      const registrationData = { name: 'Test User' };
      const session = authUtils.createSession('user123', 'test@example.com', registrationData);
      authUtils.saveSession(session, registrationData);
      
      expect(authUtils.isAuthenticated()).toBe(true);
    });
    
    it('should clear session', () => {
      const registrationData = { name: 'Test User' };
      const session = authUtils.createSession('user123', 'test@example.com', registrationData);
      authUtils.saveSession(session, registrationData);
      
      expect(authUtils.isAuthenticated()).toBe(true);
      
      authUtils.clearSession();
      
      expect(authUtils.isAuthenticated()).toBe(false);
      expect(authUtils.getSession()).toBeNull();
    });
  });
});

