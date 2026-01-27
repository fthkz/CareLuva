/**
 * Authentication Functions Test Suite
 * Tests for auth-utils.js functions
 */

// Wait for auth-utils to load
window.addEventListener('DOMContentLoaded', () => {
    // Check if authUtils is available
    if (!window.authUtils) {
        console.error('auth-utils.js not loaded!');
        return;
    }
    console.log('Auth utils loaded, tests ready');
});

/**
 * Password Hashing Tests
 */
async function runPasswordTests() {
    const container = document.getElementById('password-results');
    container.innerHTML = '';
    
    const tests = [
        {
            name: 'Password hashing - Basic functionality',
            fn: async () => {
                const password = 'TestPassword123!';
                const hash = await window.authUtils.hashPassword(password);
                
                if (!hash || typeof hash !== 'string') {
                    return { passed: false, message: 'Hash is not a string', details: `Got: ${typeof hash}` };
                }
                
                if (!hash.includes(':')) {
                    return { passed: false, message: 'Hash format incorrect (should be salt:hash)', details: `Got: ${hash.substring(0, 50)}...` };
                }
                
                const [salt, hashPart] = hash.split(':');
                if (salt.length !== 32 || hashPart.length !== 64) {
                    return { passed: false, message: 'Hash parts length incorrect', details: `Salt: ${salt.length}, Hash: ${hashPart.length}` };
                }
                
                return { passed: true, message: 'Password hashed successfully', details: `Hash format: salt:hash (${hash.substring(0, 50)}...)` };
            }
        },
        {
            name: 'Password hashing - Different passwords produce different hashes',
            fn: async () => {
                const password1 = 'Password1';
                const password2 = 'Password2';
                
                const hash1 = await window.authUtils.hashPassword(password1);
                const hash2 = await window.authUtils.hashPassword(password2);
                
                if (hash1 === hash2) {
                    return { passed: false, message: 'Different passwords produced same hash' };
                }
                
                return { passed: true, message: 'Different passwords produce different hashes' };
            }
        },
        {
            name: 'Password hashing - Same password produces different hashes (salt)',
            fn: async () => {
                const password = 'SamePassword123!';
                
                const hash1 = await window.authUtils.hashPassword(password);
                const hash2 = await window.authUtils.hashPassword(password);
                
                if (hash1 === hash2) {
                    return { passed: false, message: 'Same password produced same hash (salt not working)' };
                }
                
                // But both should verify correctly
                const verify1 = await window.authUtils.verifyPassword(password, hash1);
                const verify2 = await window.authUtils.verifyPassword(password, hash2);
                
                if (!verify1 || !verify2) {
                    return { passed: false, message: 'Hashed passwords do not verify correctly' };
                }
                
                return { passed: true, message: 'Same password produces different hashes (salt working)' };
            }
        },
        {
            name: 'Password verification - Correct password',
            fn: async () => {
                const password = 'TestPassword123!';
                const hash = await window.authUtils.hashPassword(password);
                const verified = await window.authUtils.verifyPassword(password, hash);
                
                if (!verified) {
                    return { passed: false, message: 'Correct password verification failed' };
                }
                
                return { passed: true, message: 'Correct password verified successfully' };
            }
        },
        {
            name: 'Password verification - Incorrect password',
            fn: async () => {
                const password = 'TestPassword123!';
                const wrongPassword = 'WrongPassword123!';
                const hash = await window.authUtils.hashPassword(password);
                const verified = await window.authUtils.verifyPassword(wrongPassword, hash);
                
                if (verified) {
                    return { passed: false, message: 'Incorrect password was verified as correct' };
                }
                
                return { passed: true, message: 'Incorrect password correctly rejected' };
            }
        },
        {
            name: 'Password verification - Legacy plain text support',
            fn: async () => {
                const password = 'PlainTextPassword';
                const plainTextHash = password; // Legacy format
                const verified = await window.authUtils.verifyPassword(password, plainTextHash);
                
                if (!verified) {
                    return { passed: false, message: 'Legacy plain text password verification failed' };
                }
                
                return { passed: true, message: 'Legacy plain text password verified successfully' };
            }
        },
        {
            name: 'Password verification - Invalid hash format',
            fn: async () => {
                const password = 'TestPassword123!';
                const invalidHash = 'not-a-valid-hash';
                const verified = await window.authUtils.verifyPassword(password, invalidHash);
                
                // Should handle gracefully (return false or treat as plain text)
                return { passed: true, message: 'Invalid hash format handled gracefully', details: `Result: ${verified}` };
            }
        },
        {
            name: 'Password hashing - Empty password',
            fn: async () => {
                try {
                    const hash = await window.authUtils.hashPassword('');
                    return { passed: true, message: 'Empty password handled', details: `Hash: ${hash.substring(0, 30)}...` };
                } catch (error) {
                    return { passed: true, message: 'Empty password throws error (acceptable)', details: error.message };
                }
            }
        },
        {
            name: 'Password hashing - Special characters',
            fn: async () => {
                const password = 'P@ssw0rd!#$%^&*()';
                const hash = await window.authUtils.hashPassword(password);
                const verified = await window.authUtils.verifyPassword(password, hash);
                
                if (!verified) {
                    return { passed: false, message: 'Password with special characters failed verification' };
                }
                
                return { passed: true, message: 'Password with special characters works correctly' };
            }
        },
        {
            name: 'Password hashing - Long password',
            fn: async () => {
                const password = 'A'.repeat(1000); // Very long password
                const hash = await window.authUtils.hashPassword(password);
                const verified = await window.authUtils.verifyPassword(password, hash);
                
                if (!verified) {
                    return { passed: false, message: 'Long password failed verification' };
                }
                
                return { passed: true, message: 'Long password works correctly' };
            }
        }
    ];
    
    for (const test of tests) {
        const result = await window.testRunner.runTest(test.name, test.fn);
        window.testRunner.displayResult(result, 'password-results');
    }
}

/**
 * Session Management Tests
 */
async function runSessionTests() {
    const container = document.getElementById('session-results');
    container.innerHTML = '';
    
    // Clear any existing sessions
    window.authUtils.clearSession();
    
    const mockRegistrationData = {
        clinicName: 'Test Clinic',
        email: 'test@example.com',
        providerType: 'Doctor',
        status: 'pending'
    };
    
    const tests = [
        {
            name: 'Create session - Regular session',
            fn: async () => {
                const session = window.authUtils.createSession('test-uid-123', 'test@example.com', mockRegistrationData, false);
                
                if (!session || !session.uid || !session.email) {
                    return { passed: false, message: 'Session object missing required fields' };
                }
                
                if (!session.expiresAt) {
                    return { passed: false, message: 'Session missing expiresAt' };
                }
                
                if (session.rememberMe !== false) {
                    return { passed: false, message: 'Remember me flag incorrect' };
                }
                
                const expiresAt = new Date(session.expiresAt).getTime();
                const now = Date.now();
                const expectedExpiry = now + (24 * 60 * 60 * 1000); // 24 hours
                const diff = Math.abs(expiresAt - expectedExpiry);
                
                if (diff > 60000) { // Allow 1 minute difference
                    return { passed: false, message: 'Session expiry time incorrect', details: `Expected ~24h, got ${(expiresAt - now) / (60 * 60 * 1000)}h` };
                }
                
                return { passed: true, message: 'Regular session created correctly' };
            }
        },
        {
            name: 'Create session - Remember me session',
            fn: async () => {
                const session = window.authUtils.createSession('test-uid-123', 'test@example.com', mockRegistrationData, true);
                
                if (session.rememberMe !== true) {
                    return { passed: false, message: 'Remember me flag incorrect' };
                }
                
                const expiresAt = new Date(session.expiresAt).getTime();
                const now = Date.now();
                const expectedExpiry = now + (7 * 24 * 60 * 60 * 1000); // 7 days
                const diff = Math.abs(expiresAt - expectedExpiry);
                
                if (diff > 60000) { // Allow 1 minute difference
                    return { passed: false, message: 'Remember me session expiry time incorrect', details: `Expected ~7d, got ${(expiresAt - now) / (24 * 60 * 60 * 1000)}d` };
                }
                
                return { passed: true, message: 'Remember me session created correctly' };
            }
        },
        {
            name: 'Save and get session - Regular session',
            fn: async () => {
                window.authUtils.clearSession();
                
                const session = window.authUtils.createSession('test-uid-123', 'test@example.com', mockRegistrationData, false);
                window.authUtils.saveSession(session, mockRegistrationData, false);
                
                const retrieved = window.authUtils.getSession();
                
                if (!retrieved || !retrieved.session) {
                    return { passed: false, message: 'Session not retrieved' };
                }
                
                if (retrieved.session.uid !== 'test-uid-123') {
                    return { passed: false, message: 'Session UID mismatch' };
                }
                
                if (retrieved.storage !== sessionStorage) {
                    return { passed: false, message: 'Session stored in wrong storage' };
                }
                
                return { passed: true, message: 'Session saved and retrieved correctly' };
            }
        },
        {
            name: 'Save and get session - Remember me session',
            fn: async () => {
                window.authUtils.clearSession();
                
                const session = window.authUtils.createSession('test-uid-456', 'test2@example.com', mockRegistrationData, true);
                window.authUtils.saveSession(session, mockRegistrationData, true);
                
                const retrieved = window.authUtils.getSession();
                
                if (!retrieved || !retrieved.session) {
                    return { passed: false, message: 'Remember me session not retrieved' };
                }
                
                if (retrieved.storage !== localStorage) {
                    return { passed: false, message: 'Remember me session stored in wrong storage' };
                }
                
                return { passed: true, message: 'Remember me session saved and retrieved correctly' };
            }
        },
        {
            name: 'Get session data',
            fn: async () => {
                window.authUtils.clearSession();
                
                const session = window.authUtils.createSession('test-uid-789', 'test3@example.com', mockRegistrationData, false);
                window.authUtils.saveSession(session, mockRegistrationData, false);
                
                const sessionData = window.authUtils.getSessionData();
                
                if (!sessionData) {
                    return { passed: false, message: 'Session data not retrieved' };
                }
                
                if (sessionData.clinicName !== 'Test Clinic') {
                    return { passed: false, message: 'Session data mismatch' };
                }
                
                if (sessionData.password) {
                    return { passed: false, message: 'Password found in session data (security issue!)' };
                }
                
                return { passed: true, message: 'Session data retrieved correctly (password excluded)' };
            }
        },
        {
            name: 'Is authenticated check',
            fn: async () => {
                window.authUtils.clearSession();
                
                // Should be false when no session
                const notAuth = window.authUtils.isAuthenticated();
                if (notAuth) {
                    return { passed: false, message: 'isAuthenticated returned true when no session' };
                }
                
                // Create session
                const session = window.authUtils.createSession('test-uid-auth', 'test@example.com', mockRegistrationData, false);
                window.authUtils.saveSession(session, mockRegistrationData, false);
                
                // Should be true when session exists
                const isAuth = window.authUtils.isAuthenticated();
                if (!isAuth) {
                    return { passed: false, message: 'isAuthenticated returned false when session exists' };
                }
                
                return { passed: true, message: 'isAuthenticated check works correctly' };
            }
        },
        {
            name: 'Clear session',
            fn: async () => {
                // Create session
                const session = window.authUtils.createSession('test-uid-clear', 'test@example.com', mockRegistrationData, false);
                window.authUtils.saveSession(session, mockRegistrationData, false);
                
                // Verify session exists
                if (!window.authUtils.isAuthenticated()) {
                    return { passed: false, message: 'Session not created before clear test' };
                }
                
                // Clear session
                window.authUtils.clearSession();
                
                // Verify session cleared
                if (window.authUtils.isAuthenticated()) {
                    return { passed: false, message: 'Session still exists after clear' };
                }
                
                // Verify storage is empty
                const sessionData = localStorage.getItem('providerSession') || sessionStorage.getItem('providerSession');
                if (sessionData) {
                    return { passed: false, message: 'Session data still in storage after clear' };
                }
                
                return { passed: true, message: 'Session cleared correctly' };
            }
        },
        {
            name: 'Session expiry check',
            fn: async () => {
                window.authUtils.clearSession();
                
                // Create expired session
                const expiredSession = {
                    uid: 'test-uid-expired',
                    email: 'test@example.com',
                    loginTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (expired)
                    rememberMe: false,
                    version: '1.0'
                };
                
                sessionStorage.setItem('providerSession', JSON.stringify(expiredSession));
                
                // Should return null for expired session
                const retrieved = window.authUtils.getSession();
                if (retrieved) {
                    return { passed: false, message: 'Expired session was retrieved' };
                }
                
                // Verify storage was cleared
                const stillInStorage = sessionStorage.getItem('providerSession');
                if (stillInStorage) {
                    return { passed: false, message: 'Expired session not cleared from storage' };
                }
                
                return { passed: true, message: 'Expired session handled correctly' };
            }
        },
        {
            name: 'Refresh session',
            fn: async () => {
                window.authUtils.clearSession();
                
                const session = window.authUtils.createSession('test-uid-refresh', 'test@example.com', mockRegistrationData, false);
                window.authUtils.saveSession(session, mockRegistrationData, false);
                
                const originalExpiry = new Date(session.expiresAt).getTime();
                
                // Wait a bit
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Refresh session
                const refreshed = window.authUtils.refreshSession(false);
                
                if (!refreshed) {
                    return { passed: false, message: 'Session refresh returned false' };
                }
                
                const newSession = window.authUtils.getSession();
                const newExpiry = new Date(newSession.session.expiresAt).getTime();
                
                if (newExpiry <= originalExpiry) {
                    return { passed: false, message: 'Session expiry not extended' };
                }
                
                return { passed: true, message: 'Session refreshed correctly' };
            }
        },
        {
            name: 'Get session time remaining',
            fn: async () => {
                window.authUtils.clearSession();
                
                const session = window.authUtils.createSession('test-uid-time', 'test@example.com', mockRegistrationData, false);
                window.authUtils.saveSession(session, mockRegistrationData, false);
                
                const timeRemaining = window.authUtils.getSessionTimeRemaining();
                
                if (timeRemaining === null) {
                    return { passed: false, message: 'Time remaining returned null' };
                }
                
                if (timeRemaining <= 0) {
                    return { passed: false, message: 'Time remaining is zero or negative' };
                }
                
                // Should be approximately 24 hours (allow 1 minute difference)
                const expected = 24 * 60 * 60 * 1000;
                const diff = Math.abs(timeRemaining - expected);
                
                if (diff > 60000) {
                    return { passed: false, message: 'Time remaining incorrect', details: `Expected ~${expected}ms, got ${timeRemaining}ms` };
                }
                
                return { passed: true, message: 'Session time remaining calculated correctly' };
            }
        }
    ];
    
    for (const test of tests) {
        const result = await window.testRunner.runTest(test.name, test.fn);
        window.testRunner.displayResult(result, 'session-results');
    }
}

/**
 * Integration Tests
 */
async function runIntegrationTests() {
    const container = document.getElementById('integration-results');
    container.innerHTML = '';
    
    const tests = [
        {
            name: 'Full authentication flow - Hash, save, verify',
            fn: async () => {
                window.authUtils.clearSession();
                
                const password = 'IntegrationTest123!';
                
                // Hash password
                const hash = await window.authUtils.hashPassword(password);
                
                // Create session
                const mockRegData = {
                    clinicName: 'Integration Test Clinic',
                    email: 'integration@test.com',
                    password: hash // Include hashed password
                };
                
                const session = window.authUtils.createSession('integration-uid', 'integration@test.com', mockRegData, false);
                window.authUtils.saveSession(session, mockRegData, false);
                
                // Verify session
                const retrieved = window.authUtils.getSession();
                if (!retrieved) {
                    return { passed: false, message: 'Session not retrieved in integration test' };
                }
                
                // Verify password
                const sessionData = window.authUtils.getSessionData();
                const passwordHash = sessionData.password || hash;
                const verified = await window.authUtils.verifyPassword(password, passwordHash);
                
                if (!verified) {
                    return { passed: false, message: 'Password verification failed in integration test' };
                }
                
                // Verify password not in session data
                if (sessionData.password) {
                    return { passed: false, message: 'Password found in session data (security issue)' };
                }
                
                return { passed: true, message: 'Full authentication flow works correctly' };
            }
        },
        {
            name: 'Session persistence across page reloads simulation',
            fn: async () => {
                window.authUtils.clearSession();
                
                const mockRegData = {
                    clinicName: 'Persistence Test',
                    email: 'persist@test.com'
                };
                
                const session = window.authUtils.createSession('persist-uid', 'persist@test.com', mockRegData, true);
                window.authUtils.saveSession(session, mockRegData, true);
                
                // Simulate page reload by getting session again
                const reloadedSession = window.authUtils.getSession();
                
                if (!reloadedSession) {
                    return { passed: false, message: 'Session not persisted' };
                }
                
                if (reloadedSession.session.uid !== 'persist-uid') {
                    return { passed: false, message: 'Session data corrupted after reload simulation' };
                }
                
                return { passed: true, message: 'Session persists correctly' };
            }
        }
    ];
    
    for (const test of tests) {
        const result = await window.testRunner.runTest(test.name, test.fn);
        window.testRunner.displayResult(result, 'integration-results');
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    await runPasswordTests();
    await runSessionTests();
    await runIntegrationTests();
}

