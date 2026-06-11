/**
 * Authentication Guard for Protected Pages
 *
 * Fast path: if a portal session exists (same tab cache or localStorage), show content
 * immediately and verify in the background — no full-screen spinner on every navigation.
 * Overlay only appears on cold loads with no session hint.
 *
 * Usage:
 * 1. Include auth-utils.js before calling setupAuthGuard (or load both early in body)
 * 2. Call setupAuthGuard('provider') | setupAuthGuard('patient') | setupAuthGuard('admin')
 */

(function () {
    'use strict';

    const AUTH_CACHE_PREFIX = 'careluva_portal_auth_';
    const AUTH_CACHE_TTL_MS = 30 * 60 * 1000; // 30 min — re-verify periodically in background

    let overlayEl = null;
    let overlayStyleEl = null;

    function ensureOverlay() {
        if (overlayEl) {
            overlayEl.style.display = 'flex';
            return overlayEl;
        }
        overlayEl = document.createElement('div');
        overlayEl.id = 'auth-check-overlay';
        overlayEl.style.cssText =
            'position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:9999;' +
            'display:flex;align-items:center;justify-content:center;flex-direction:column;';
        overlayEl.innerHTML =
            '<div class="spinner" style="width:50px;height:50px;border:4px solid #e2e8f0;' +
            'border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite;"></div>' +
            '<p style="margin-top:20px;color:#64748b;font-size:1rem;">Verifying authentication...</p>';
        if (!overlayStyleEl) {
            overlayStyleEl = document.createElement('style');
            overlayStyleEl.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
            document.head.appendChild(overlayStyleEl);
        }
        if (document.body) {
            document.body.insertBefore(overlayEl, document.body.firstChild);
        }
        return overlayEl;
    }

    function hideOverlay() {
        if (overlayEl) {
            overlayEl.style.display = 'none';
        }
    }

    function hideMainContent() {
        const mainContent = document.getElementById('main-content') || document.querySelector('.container');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
    }

    function showMainContent() {
        hideOverlay();
        let mainContent = document.getElementById('main-content');
        if (!mainContent) {
            mainContent = document.querySelector('.container');
        }
        if (!mainContent) {
            mainContent = document.querySelector('body > div.container');
        }
        if (mainContent) {
            mainContent.style.display = 'block';
        } else {
            document.querySelectorAll('.container').forEach(function (container) {
                container.style.display = 'block';
            });
        }
        const pendingStyle = document.getElementById('auth-pending-style');
        if (pendingStyle) {
            pendingStyle.disabled = true;
        }
    }

    function getAuthVerifiedCache(userType) {
        try {
            const raw = sessionStorage.getItem(AUTH_CACHE_PREFIX + userType);
            if (!raw) {
                return null;
            }
            const data = JSON.parse(raw);
            if (!data || !data.userId) {
                return null;
            }
            if (Date.now() - data.verifiedAt > AUTH_CACHE_TTL_MS) {
                sessionStorage.removeItem(AUTH_CACHE_PREFIX + userType);
                return null;
            }
            return data.userId;
        } catch (e) {
            return null;
        }
    }

    function setAuthVerifiedCache(userType, userId) {
        try {
            sessionStorage.setItem(AUTH_CACHE_PREFIX + userType, JSON.stringify({
                userId: userId,
                verifiedAt: Date.now()
            }));
        } catch (e) {
            /* ignore quota errors */
        }
    }

    window.clearAuthGuardCache = function (userType) {
        if (userType) {
            sessionStorage.removeItem(AUTH_CACHE_PREFIX + userType);
            return;
        }
        ['provider', 'patient', 'admin'].forEach(function (t) {
            sessionStorage.removeItem(AUTH_CACHE_PREFIX + t);
        });
    };

    function getSyncStorageUserId(userType) {
        const oldSessionKey = userType === 'provider' ? 'providerSession' : 'patientSession';
        const registrationIdKey = userType === 'provider' ? 'providerRegistrationId' : 'patientUserId';
        const registrationKey = userType === 'provider' ? 'providerRegistration' : 'patientUser';

        if (window.authUtils && window.authUtils.isAuthenticated && window.authUtils.isAuthenticated()) {
            const session = window.authUtils.getSession();
            if (session && session.session && session.session.uid) {
                return session.session.uid;
            }
        }

        let sessionData = localStorage.getItem(oldSessionKey) || sessionStorage.getItem(oldSessionKey);
        if (!sessionData && window.authUtils && window.authUtils.SESSION_CONFIG) {
            const configKey = window.authUtils.SESSION_CONFIG.STORAGE_KEY;
            sessionData = localStorage.getItem(configKey) || sessionStorage.getItem(configKey);
        }

        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                const sessionObj = session.session || session;
                if (sessionObj && sessionObj.uid) {
                    if (sessionObj.expiresAt && Date.now() > new Date(sessionObj.expiresAt).getTime()) {
                        return null;
                    }
                    return sessionObj.uid;
                }
            } catch (e) {
                return null;
            }
        }

        const registrationId = localStorage.getItem(registrationIdKey) || sessionStorage.getItem(registrationIdKey);
        const registrationData = localStorage.getItem(registrationKey) || sessionStorage.getItem(registrationKey);
        if (registrationId && registrationData) {
            return registrationId;
        }

        return null;
    }

    function resolveFastAuthUserId(userType) {
        return getAuthVerifiedCache(userType) || getSyncStorageUserId(userType);
    }

    function redirectToLogin(message, userType) {
        ensureOverlay();
        let loginPage = 'patient-auth.html';
        if (userType === 'admin') {
            loginPage = 'admin-panel.html';
        } else if (userType === 'provider') {
            loginPage = 'provider-auth.html';
        }
        if (message) {
            overlayEl.innerHTML =
                '<div style="text-align:center;">' +
                '<p style="color:#64748b;font-size:1rem;margin-bottom:20px;">' + message + '</p>' +
                '<p style="color:#94a3b8;font-size:0.875rem;">Redirecting to login...</p></div>';
        }
        window.location.href = loginPage;
    }

    window.setupAuthGuard = function (userType) {
        userType = userType || 'provider';

        let authCheckAttempts = 0;
        const maxAuthCheckAttempts = 50;
        let providerHttpOnlyCookieChecked = false;
        let providerHttpOnlyCheckInProgress = false;
        let authResolved = false;

        function applyAuthSuccess(userId, options) {
            options = options || {};
            if (authResolved && window.__authenticatedUserId === userId) {
                return;
            }
            authResolved = true;
            setAuthVerifiedCache(userType, userId);
            showMainContent();
            window.__authenticatedUserId = userId;
            if (!options.silent) {
                console.log('[Auth Guard] Session verified');
            }
            window.dispatchEvent(new CustomEvent('auth-verified', {
                detail: { userId: userId, userType: userType }
            }));
        }

        function failAuth(message) {
            window.clearAuthGuardCache(userType);
            redirectToLogin(message || 'Please log in to access this page.', userType);
        }

        function runStorageAuthCheck(onSuccess, onFail) {
            if (providerHttpOnlyCheckInProgress) {
                return;
            }

            let isAuthenticated = false;
            let userId = null;

            if (window.authUtils && window.authUtils.isAuthenticated && window.authUtils.isAuthenticated()) {
                const session = window.authUtils.getSession();
                if (session && session.session && session.session.uid) {
                    isAuthenticated = true;
                    userId = session.session.uid;
                }
            }

            if (!isAuthenticated) {
                userId = getSyncStorageUserId(userType);
                isAuthenticated = !!userId;

                if (isAuthenticated && window.authUtils && userId) {
                    const registrationIdKey = userType === 'provider' ? 'providerRegistrationId' : 'patientUserId';
                    const registrationKey = userType === 'provider' ? 'providerRegistration' : 'patientUser';
                    const registrationId = localStorage.getItem(registrationIdKey) || sessionStorage.getItem(registrationIdKey);
                    const registrationData = localStorage.getItem(registrationKey) || sessionStorage.getItem(registrationKey);
                    if (registrationId && registrationData && !window.authUtils.isAuthenticated()) {
                        try {
                            const regData = JSON.parse(registrationData);
                            const newSession = window.authUtils.createSession(
                                registrationId,
                                regData.email || '',
                                regData,
                                true
                            );
                            window.authUtils.saveSession(newSession, regData, true);
                            userId = registrationId;
                        } catch (e) {
                            isAuthenticated = false;
                            userId = null;
                        }
                    }
                }
            }

            if (isAuthenticated && userId) {
                onSuccess(userId);
                return;
            }

            if (!window.authUtils && authCheckAttempts < maxAuthCheckAttempts) {
                authCheckAttempts++;
                setTimeout(function () { runFullAuthCheck(false); }, 100);
                return;
            }

            onFail();
        }

        function runFullAuthCheck(background) {
            if (authResolved && background) {
                return;
            }

            if (userType === 'provider' && !providerHttpOnlyCookieChecked && window.authUtils &&
                typeof window.authUtils.verifyProviderSessionCookie === 'function') {
                providerHttpOnlyCookieChecked = true;
                providerHttpOnlyCheckInProgress = true;
                (async function () {
                    try {
                        var cr = await window.authUtils.verifyProviderSessionCookie();
                        if (cr && cr.ok === true && cr.registrationId) {
                            applyAuthSuccess(cr.registrationId, { silent: background });
                            return;
                        }
                        if (typeof window.authUtils.syncProviderSessionCookieFromFirebaseAuth === 'function') {
                            var synced = await window.authUtils.syncProviderSessionCookieFromFirebaseAuth();
                            if (synced && synced.ok === true && synced.registrationId) {
                                applyAuthSuccess(synced.registrationId, { silent: background });
                                return;
                            }
                        }
                    } catch (err) {
                        console.warn('[Auth Guard] HttpOnly verify skipped:', err);
                    } finally {
                        providerHttpOnlyCheckInProgress = false;
                    }
                    runStorageAuthCheck(
                        function (uid) { applyAuthSuccess(uid, { silent: background }); },
                        function () {
                            if (background) {
                                if (authResolved) {
                                    failAuth('Your session expired. Please log in again.');
                                }
                            } else if (!window.authUtils && authCheckAttempts < maxAuthCheckAttempts) {
                                authCheckAttempts++;
                                setTimeout(function () { runFullAuthCheck(false); }, 100);
                            } else {
                                failAuth('Please log in to access this page.');
                            }
                        }
                    );
                })();
                return;
            }

            runStorageAuthCheck(
                function (uid) { applyAuthSuccess(uid, { silent: background }); },
                function () {
                    if (background) {
                        if (authResolved) {
                            failAuth('Your session expired. Please log in again.');
                        }
                    } else if (!window.authUtils && authCheckAttempts < maxAuthCheckAttempts) {
                        authCheckAttempts++;
                        setTimeout(function () { runFullAuthCheck(false); }, 100);
                    } else {
                        failAuth('Please log in to access this page.');
                    }
                }
            );
        }

        const fastUserId = resolveFastAuthUserId(userType);
        if (fastUserId) {
            applyAuthSuccess(fastUserId, { silent: true });
            runFullAuthCheck(true);
            return;
        }

        hideMainContent();
        ensureOverlay();
        if (window.authUtils) {
            runFullAuthCheck(false);
        } else {
            setTimeout(function () { runFullAuthCheck(false); }, 100);
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        const body = document.body;
        if (body && body.dataset.authGuard) {
            window.setupAuthGuard(body.dataset.authGuard);
        }
    });
})();
