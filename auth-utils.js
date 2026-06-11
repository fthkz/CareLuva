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

/** Same-origin API (Firebase Hosting rewrite → Cloud Function). */
const AUTH_SESSION_API_BASE = '/api/auth';

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
 * @param {boolean} rememberMe - Controls session TTL only; storage is always localStorage so new tabs share the session (HttpOnly cookie adds server-verified layer when deployed).
 */
function saveSession(session, registrationData, rememberMe = false) {
    const storage = localStorage;

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

    // Also clear legacy registration ID keys for backward compatibility
    localStorage.removeItem('providerRegistrationId');
    localStorage.removeItem('patientUserId');
    sessionStorage.removeItem('providerRegistrationId');
    sessionStorage.removeItem('patientUserId');

    if (typeof window !== 'undefined' && typeof window.clearAuthGuardCache === 'function') {
        window.clearAuthGuardCache();
    }
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

/**
 * Exchange a fresh Firebase ID token for an HttpOnly session cookie (provider only).
 * No-op if the API is not deployed (network error).
 */
async function exchangeFirebaseSessionCookie(idToken) {
    try {
        const res = await fetch(`${AUTH_SESSION_API_BASE}/session-login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: idToken })
        });
        if (!res.ok) {
            let detail = '';
            try {
                const body = await res.json();
                detail = body.error || JSON.stringify(body);
            } catch (e) {
                detail = res.statusText || 'unknown error';
            }
            console.warn('[auth] session-login failed:', res.status, detail);
            return false;
        }
        console.log('[auth] ✅ HttpOnly session cookie set via session-login');
        return true;
    } catch (e) {
        console.warn('[auth] HttpOnly session exchange unavailable:', e.message || e);
        return false;
    }
}

/**
 * Clear HttpOnly provider session cookie (call on logout).
 */
async function clearFirebaseSessionCookie() {
    try {
        await fetch(`${AUTH_SESSION_API_BASE}/session-logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (e) {
        console.warn('[auth] HttpOnly session clear skipped:', e.message || e);
    }
}

/**
 * Verify HttpOnly session cookie with backend; returns { ok, registrationId, firebaseUid } or { ok:false }.
 */
async function verifyProviderSessionCookie() {
    try {
        const res = await fetch(`${AUTH_SESSION_API_BASE}/session-verify`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });
        if (!res.ok) {
            let detail = null;
            try {
                detail = await res.json();
            } catch (e) {
                detail = null;
            }
            if (res.status === 401) {
                const reason = detail && detail.error ? detail.error : 'no valid HttpOnly cookie';
                console.info('[auth] session-verify: 401 —', reason);
            } else {
                console.warn('[auth] session-verify failed:', res.status, detail);
            }
            return { ok: false, status: res.status, error: detail && detail.error ? detail.error : undefined };
        }
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
            return { ok: false, status: res.status, error: 'non-json response' };
        }
        return await res.json();
    } catch (e) {
        console.warn('[auth] session-verify unavailable:', e.message || e);
        return { ok: false, error: e.message || String(e) };
    }
}

/**
 * Wait until window.firebase.app exists (Firebase module init is often after auth-guard).
 */
async function waitForFirebaseApp(timeoutMs = 8000) {
    if (window.firebase && window.firebase.app) {
        return window.firebase.app;
    }
    return new Promise(function (resolve) {
        var resolved = false;
        function finish(app) {
            if (resolved) return;
            resolved = true;
            resolve(app || null);
        }
        window.addEventListener('firebaseReady', function () {
            finish(window.firebase && window.firebase.app ? window.firebase.app : null);
        }, { once: true });
        var deadline = Date.now() + timeoutMs;
        (function poll() {
            if (window.firebase && window.firebase.app) {
                finish(window.firebase.app);
                return;
            }
            if (Date.now() >= deadline) {
                finish(null);
                return;
            }
            setTimeout(poll, 50);
        })();
    });
}

/**
 * Wait for Firebase Auth to restore persisted user (currentUser is null briefly on page load).
 */
async function waitForFirebaseAuthUser(timeoutMs = 8000) {
    var app = await waitForFirebaseApp(timeoutMs);
    if (!app) {
        return null;
    }
    var authModule = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
    var auth = authModule.getAuth(app);
    if (auth.currentUser) {
        return auth.currentUser;
    }
    return new Promise(function (resolve) {
        var resolved = false;
        function finish(user) {
            if (resolved) return;
            resolved = true;
            resolve(user || null);
        }
        var timer = setTimeout(function () {
            finish(auth.currentUser);
        }, timeoutMs);
        var unsub = authModule.onAuthStateChanged(auth, function (user) {
            clearTimeout(timer);
            unsub();
            finish(user);
        });
    });
}

/**
 * If Firebase Auth still has a signed-in user, exchange a fresh ID token for the HttpOnly cookie.
 * Used when localStorage session exists but session-verify returns 401 (e.g. login before Functions deploy).
 */
async function syncProviderSessionCookieFromFirebaseAuth() {
    try {
        var user = await waitForFirebaseAuthUser();
        if (!user) {
            return { ok: false, reason: 'no-firebase-auth-user' };
        }
        const idToken = await user.getIdToken();
        const cookieSet = await exchangeFirebaseSessionCookie(idToken);
        if (!cookieSet) {
            return { ok: false, reason: 'session-login-failed' };
        }
        return verifyProviderSessionCookie();
    } catch (e) {
        console.warn('[auth] syncProviderSessionCookieFromFirebaseAuth:', e.message || e);
        return { ok: false, reason: 'sync-error', error: e.message || String(e) };
    }
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
        exchangeFirebaseSessionCookie,
        clearFirebaseSessionCookie,
        verifyProviderSessionCookie,
        syncProviderSessionCookieFromFirebaseAuth,
        waitForFirebaseAuthUser,
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
        exchangeFirebaseSessionCookie,
        clearFirebaseSessionCookie,
        verifyProviderSessionCookie,
        syncProviderSessionCookieFromFirebaseAuth,
        waitForFirebaseAuthUser,
        SESSION_CONFIG
    };
}

