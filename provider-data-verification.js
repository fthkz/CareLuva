/**
 * Provider Data Verification Utility
 * 
 * Ensures that clinic users can only access their own data.
 * This provides client-side verification as a security layer.
 */

(function() {
    'use strict';
    
    /**
     * Verify that a registration ID belongs to the currently logged-in provider
     * @param {string} registrationId - The registration document ID to verify
     * @returns {Promise<{valid: boolean, data: object|null, error: string|null}>}
     */
    async function verifyClinicOwnership(registrationId) {
        if (!registrationId) {
            return { valid: false, data: null, error: 'No registration ID provided' };
        }
        
        // Check if user is authenticated
        if (!window.authUtils || !window.authUtils.isAuthenticated()) {
            return { valid: false, data: null, error: 'User not authenticated' };
        }
        
        try {
            const sessionInfo = window.authUtils.getSession();
            const sessionData = window.authUtils.getSessionData();
            
            if (!sessionInfo || !sessionInfo.session || !sessionInfo.session.uid) {
                return { valid: false, data: null, error: 'Invalid session' };
            }
            
            // Verify registration ID matches session UID
            if (registrationId !== sessionInfo.session.uid) {
                console.warn('[Data Verification] Registration ID mismatch:', {
                    provided: registrationId,
                    session: sessionInfo.session.uid
                });
                return { valid: false, data: null, error: 'Registration ID does not match session' };
            }
            
            // Check Firebase Auth first (preferred method)
            if (window.firebaseReady && window.firebase?.auth) {
                const currentUser = window.firebase.auth.currentUser;
                
                if (currentUser) {
                    // User is authenticated with Firebase Auth
                    // Verify registrationId matches Firebase Auth UID
                    if (registrationId === currentUser.uid) {
                        // Load registration data to verify
                        if (window.firebase?.db) {
                            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                            const docRef = doc(window.firebase.db, 'providerRegistrations', registrationId);
                            const docSnap = await getDoc(docRef);
                            
                            if (docSnap.exists()) {
                                const registrationData = docSnap.data();
                                // Verify email matches Firebase Auth email
                                if (currentUser.email && registrationData.email) {
                                    if (currentUser.email.toLowerCase() !== registrationData.email.toLowerCase()) {
                                        console.warn('[Data Verification] Email mismatch:', {
                                            firebaseAuth: currentUser.email,
                                            registration: registrationData.email
                                        });
                                        return { valid: false, data: registrationData, error: 'Email does not match Firebase Auth' };
                                    }
                                }
                                return { valid: true, data: registrationData, error: null };
                            }
                        }
                    } else {
                        // Check if firebaseAuthUid matches
                        if (window.firebase?.db) {
                            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                            const docRef = doc(window.firebase.db, 'providerRegistrations', registrationId);
                            const docSnap = await getDoc(docRef);
                            
                            if (docSnap.exists()) {
                                const registrationData = docSnap.data();
                                if (registrationData.firebaseAuthUid === currentUser.uid) {
                                    return { valid: true, data: registrationData, error: null };
                                }
                            }
                        }
                    }
                }
            }
            
            // Fallback: Load registration data to verify email matches (legacy method)
            if (window.firebaseReady && window.firebase?.db) {
                const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                const docRef = doc(window.firebase.db, 'providerRegistrations', registrationId);
                const docSnap = await getDoc(docRef);
                
                if (!docSnap.exists()) {
                    return { valid: false, data: null, error: 'Registration not found' };
                }
                
                const registrationData = docSnap.data();
                
                // Verify email matches (if available in session)
                if (sessionData && sessionData.email && registrationData.email) {
                    if (sessionData.email.toLowerCase() !== registrationData.email.toLowerCase()) {
                        console.warn('[Data Verification] Email mismatch:', {
                            session: sessionData.email,
                            registration: registrationData.email
                        });
                        return { valid: false, data: registrationData, error: 'Email does not match session' };
                    }
                }
                
                return { valid: true, data: registrationData, error: null };
            }
            
            // If Firebase not ready, still verify session UID matches
            return { valid: registrationId === sessionInfo.session.uid, data: null, error: null };
            
        } catch (error) {
            console.error('[Data Verification] Error verifying ownership:', error);
            return { valid: false, data: null, error: error.message };
        }
    }
    
    /**
     * Get and verify the current clinic's registration ID
     * @returns {Promise<{registrationId: string|null, data: object|null, error: string|null}>}
     */
    async function getVerifiedClinicId() {
        // Try Firebase Auth first (preferred method)
        if (window.firebaseReady && window.firebase?.auth) {
            const currentUser = window.firebase.auth.currentUser;
            
            if (currentUser) {
                const registrationId = currentUser.uid;
                const verification = await verifyClinicOwnership(registrationId);
                
                if (verification.valid) {
                    return { registrationId, data: verification.data, error: null };
                }
            }
        }
        
        // Fallback: Use session-based authentication (legacy)
        if (window.authUtils && window.authUtils.isAuthenticated()) {
            const sessionInfo = window.authUtils.getSession();
            if (sessionInfo && sessionInfo.session && sessionInfo.session.uid) {
                const registrationId = sessionInfo.session.uid;
                const verification = await verifyClinicOwnership(registrationId);
                
                if (verification.valid) {
                    return { registrationId, data: verification.data, error: null };
                }
            }
        }
        
        return { registrationId: null, data: null, error: 'User not authenticated' };
    }
    
    // Export functions to window
    window.providerDataVerification = {
        verifyClinicOwnership,
        getVerifiedClinicId
    };
    
    console.log('[Provider Data Verification] Utility loaded');
})();

