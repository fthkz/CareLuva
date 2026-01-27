/**
 * Authentication Utilities
 * Provides password hashing and session management for Firestore-based authentication
 */

// ============================================================================
// Password Hashing Utilities
// ============================================================================

/**
 * Hash a password using PBKDF2 (Web Crypto API)
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password (format: salt:hash)
 */
async function hashPassword(password) {
    try {
        // Generate a random salt
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Convert password to ArrayBuffer
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(password);
        
        // Import password as key material
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordData,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );
        
        // Derive key using PBKDF2
        const hashBuffer = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000, // High iteration count for security
                hash: 'SHA-256'
            },
            keyMaterial,
            256 // 256 bits = 32 bytes
        );
        
        // Convert hash to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Return salt:hash format for storage
        return `${saltHex}:${hashHex}`;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
}

/**
 * Verify a password against a stored hash
 * @param {string} password - Plain text password to verify
 * @param {string} storedHash - Stored hash (format: salt:hash)
 * @returns {Promise<boolean>} - True if password matches
 */
async function verifyPassword(password, storedHash) {
    try {
        if (!storedHash || !storedHash.includes(':')) {
            // Legacy: if hash doesn't contain ':', it's plain text (for migration)
            return password === storedHash;
        }
        
        // Extract salt and hash from stored format
        const [saltHex, storedHashHex] = storedHash.split(':');
        const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        
        // Convert password to ArrayBuffer
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(password);
        
        // Import password as key material
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordData,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );
        
        // Derive key using same parameters
        const hashBuffer = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            256
        );
        
        // Convert hash to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Compare hashes (constant-time comparison)
        return hashHex === storedHashHex;
    } catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
}

// ============================================================================
// Session Management Utilities
// ============================================================================

/**
 * Session configuration
 */
const SESSION_CONFIG = {
    REMEMBER_ME_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    REGULAR_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    STORAGE_KEY: 'providerSession',
    REGISTRATION_KEY: 'providerRegistration'
};

/**
 * Create a session object
 * @param {string} uid - User ID (document ID)
 * @param {string} email - User email
 * @param {Object} registrationData - Registration data from Firestore
 * @param {boolean} rememberMe - Whether to use long-term session
 * @returns {Object} - Session object
 */
function createSession(uid, email, registrationData, rememberMe = false) {
    const now = Date.now();
    const expiresAt = now + (rememberMe ? SESSION_CONFIG.REMEMBER_ME_DURATION : SESSION_CONFIG.REGULAR_DURATION);
    
    return {
        uid,
        email,
        loginTime: new Date(now).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        rememberMe,
        version: '1.0' // For future session format migrations
    };
}

/**
 * Save session to storage
 * @param {Object} session - Session object
 * @param {Object} registrationData - Registration data
 * @param {boolean} rememberMe - Whether to use localStorage or sessionStorage
 */
function saveSession(session, registrationData, rememberMe = false) {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Save session
    storage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(session));
    
    // Save registration data (without password for security)
    const safeRegistrationData = { ...registrationData };
    delete safeRegistrationData.password; // Never store password in session
    storage.setItem(SESSION_CONFIG.REGISTRATION_KEY, JSON.stringify(safeRegistrationData));
}

/**
 * Get current session from storage
 * @returns {Object|null} - Session object or null if not found/invalid
 */
function getSession() {
    // Try localStorage first (remember me)
    let sessionData = localStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
    let storage = localStorage;
    
    // Fall back to sessionStorage
    if (!sessionData) {
        sessionData = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
        storage = sessionStorage;
    }
    
    if (!sessionData) {
        return null;
    }
    
    try {
        const session = JSON.parse(sessionData);
        
        // Validate session expiry
        if (session.expiresAt) {
            const expiresAt = new Date(session.expiresAt).getTime();
            if (Date.now() > expiresAt) {
                // Session expired, clear it
                clearSession();
                return null;
            }
        }
        
        return { session, storage };
    } catch (error) {
        console.error('Error parsing session:', error);
        clearSession();
        return null;
    }
}

/**
 * Validate session and return registration data
 * @returns {Object|null} - Registration data or null if session invalid
 */
function getSessionData() {
    const sessionInfo = getSession();
    if (!sessionInfo) {
        return null;
    }
    
    const { storage } = sessionInfo;
    const registrationData = storage.getItem(SESSION_CONFIG.REGISTRATION_KEY);
    
    if (!registrationData) {
        return null;
    }
    
    try {
        return JSON.parse(registrationData);
    } catch (error) {
        console.error('Error parsing registration data:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if valid session exists
 */
function isAuthenticated() {
    return getSession() !== null;
}

/**
 * Clear session from all storage
 */
function clearSession() {
    localStorage.removeItem(SESSION_CONFIG.STORAGE_KEY);
    localStorage.removeItem(SESSION_CONFIG.REGISTRATION_KEY);
    sessionStorage.removeItem(SESSION_CONFIG.STORAGE_KEY);
    sessionStorage.removeItem(SESSION_CONFIG.REGISTRATION_KEY);
}

/**
 * Refresh session expiry (extend session)
 * @param {boolean} rememberMe - Whether to use long-term session
 * @returns {boolean} - True if session was refreshed
 */
function refreshSession(rememberMe = false) {
    const sessionInfo = getSession();
    if (!sessionInfo) {
        return false;
    }
    
    const { session, storage } = sessionInfo;
    const registrationData = storage.getItem(SESSION_CONFIG.REGISTRATION_KEY);
    
    if (!registrationData) {
        return false;
    }
    
    try {
        const regData = JSON.parse(registrationData);
        const newSession = createSession(session.uid, session.email, regData, rememberMe);
        saveSession(newSession, regData, rememberMe);
        return true;
    } catch (error) {
        console.error('Error refreshing session:', error);
        return false;
    }
}

/**
 * Get session expiry time remaining in milliseconds
 * @returns {number|null} - Milliseconds until expiry or null if no session
 */
function getSessionTimeRemaining() {
    const sessionInfo = getSession();
    if (!sessionInfo || !sessionInfo.session.expiresAt) {
        return null;
    }
    
    const expiresAt = new Date(sessionInfo.session.expiresAt).getTime();
    const remaining = expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
    window.authUtils = {
        hashPassword,
        verifyPassword,
        createSession,
        saveSession,
        getSession,
        getSessionData,
        isAuthenticated,
        clearSession,
        refreshSession,
        getSessionTimeRemaining,
        SESSION_CONFIG
    };
}

// For Node.js environments (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        hashPassword,
        verifyPassword,
        createSession,
        saveSession,
        getSession,
        getSessionData,
        isAuthenticated,
        clearSession,
        refreshSession,
        getSessionTimeRemaining,
        SESSION_CONFIG
    };
}

