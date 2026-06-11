/**
 * Admin Authentication Guard
 * 
 * Admin pages use Firebase Auth (not Firestore-based auth like provider/patient)
 * This guard checks Firebase Auth state and admin role in Firestore
 */

(function() {
    'use strict';
    
    // Create authentication overlay immediately
    const overlay = document.createElement('div');
    overlay.id = 'auth-check-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    `;
    overlay.innerHTML = `
        <div class="spinner" style="width: 50px; height: 50px; border: 4px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 20px; color: #64748b; font-size: 1rem;">Verifying admin authentication...</p>
    `;
    
    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Insert overlay at the beginning of body
    if (document.body) {
        document.body.insertBefore(overlay, document.body.firstChild);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.insertBefore(overlay, document.body.firstChild);
        });
    }
    
    // Hide main content initially (but allow login section to show)
    const hideMainContent = () => {
        // Only hide the dashboard, not the login section
        const dashboard = document.getElementById('admin-dashboard');
        if (dashboard) {
            dashboard.style.display = 'none';
        }
        // Hide auth-checking message
        const authChecking = document.getElementById('auth-checking');
        if (authChecking) {
            authChecking.style.display = 'none';
        }
    };
    
    // Show main content after authentication
    const showMainContent = () => {
        const overlayEl = document.getElementById('auth-check-overlay');
        const mainContent = document.getElementById('main-content');
        const dashboard = document.getElementById('admin-dashboard');
        const authPendingStyle = document.getElementById('auth-pending-style');
        if (authPendingStyle) {
            authPendingStyle.disabled = true;
        }
        if (overlayEl) {
            overlayEl.style.display = 'none';
        }
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        // Hide login section and show dashboard
        const loginSection = document.getElementById('login-section');
        if (loginSection) {
            loginSection.style.display = 'none';
        }
        if (dashboard) {
            dashboard.style.display = 'block';
        }
    };
    
    // Show login form (only on admin-panel) or redirect to admin-panel
    const showLoginForm = (message) => {
        const isAdminPanel = /admin-panel\.html$/i.test(window.location.pathname) || window.location.href.indexOf('admin-panel') !== -1;
        if (!isAdminPanel) {
            window.location.replace('admin-panel.html');
            return;
        }
        const overlayEl = document.getElementById('auth-check-overlay');
        const mainContent = document.getElementById('main-content');
        const loginSection = document.getElementById('login-section');
        const authChecking = document.getElementById('auth-checking');
        const authPendingStyle = document.getElementById('auth-pending-style');
        if (authPendingStyle) {
            authPendingStyle.disabled = true;
        }
        // Hide overlay
        if (overlayEl) {
            overlayEl.style.display = 'none';
        }
        // Show main content and login section
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        if (loginSection) {
            loginSection.style.display = 'block';
        }
        if (authChecking) {
            authChecking.style.display = 'none';
        }
        // Hide dashboard
        const dashboard = document.getElementById('admin-dashboard');
        if (dashboard) {
            dashboard.style.display = 'none';
        }
        console.log('[Admin Auth Guard] Showing login form');
    };
    
    // Setup admin authentication guard
    window.setupAdminAuthGuard = function() {
        // For admin-panel.html, we work with the existing checkExistingAuth() function
        // We only protect the dashboard, not the login section
        hideMainContent();
        
        let authCheckAttempts = 0;
        const maxAuthCheckAttempts = 50; // 5 seconds max wait
        
        async function checkAdminAuthentication() {
            authCheckAttempts++;
            
            console.log(`[Admin Auth Guard] Check attempt ${authCheckAttempts}/${maxAuthCheckAttempts}`);
            
            // Wait for Firebase to be ready
            if (!window.firebase || !window.firebase.auth || !window.firebase.db) {
                if (authCheckAttempts < maxAuthCheckAttempts) {
                    setTimeout(checkAdminAuthentication, 100);
                } else {
                    console.warn('[Admin Auth Guard] Firebase not ready after', maxAuthCheckAttempts, 'attempts - showing login form');
                    showLoginForm();
                }
                return;
            }
            
            try {
                const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
                const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                
                const auth = window.firebase.auth;
                
                // Check Firebase Auth state
                const user = await new Promise((resolve) => {
                    const unsubscribe = onAuthStateChanged(auth, (user) => {
                        unsubscribe();
                        resolve(user);
                    });
                    // Timeout after 2 seconds
                    setTimeout(() => {
                        unsubscribe();
                        resolve(null);
                    }, 2000);
                });
                
                if (!user) {
                    console.log('[Admin Auth Guard] No Firebase Auth user found - showing login form');
                    showLoginForm();
                    return;
                }
                
                console.log('[Admin Auth Guard] Firebase Auth user found:', user.email);
                
                // Check if user is admin
                const adminDoc = await getDoc(doc(window.firebase.db, 'admins', user.uid));
                
                if (!adminDoc.exists()) {
                    console.log('[Admin Auth Guard] User is not an admin - showing login form');
                    showLoginForm();
                    return;
                }
                
                console.log('[Admin Auth Guard] ✅ Admin authenticated:', adminDoc.data());
                
                // Authentication successful - show content
                showMainContent();
                
                // Dispatch event for other scripts
                window.dispatchEvent(new CustomEvent('admin-auth-verified', {
                    detail: { userId: user.uid, adminData: adminDoc.data() }
                }));
                
            } catch (error) {
                console.error('[Admin Auth Guard] Authentication check error:', error);
                showLoginForm();
            }
        }
        
        // Start authentication check after a delay to let checkExistingAuth() run first
        console.log('[Admin Auth Guard] Starting authentication check...');
        setTimeout(() => {
            checkAdminAuthentication();
        }, 1000); // Give checkExistingAuth() time to run first
    };
    
    // Auto-setup if data attribute is present
    document.addEventListener('DOMContentLoaded', () => {
        const body = document.body;
        if (body && body.dataset.authGuard === 'admin') {
            window.setupAdminAuthGuard();
        }
    });
})();

