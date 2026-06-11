/**
 * Shared Admin Top Navigation
 *
 * Usage:
 *   <body data-admin-nav-active="dashboard">
 *     <script src="admin-nav.js"></script>
 *
 * Active keys (primary):
 *   dashboard | verification | reviews | payments | communications
 * Active keys (operations dropdown):
 *   catalog | migration | password-reset
 *
 * Structure (mirrors provider-nav: primary monitoring tasks + settings
 * "Operations" dropdown at end + user menu).
 *
 * Special behavior:
 *   - On admin-panel.html the nav is hidden when the login form is visible
 *     (i.e. the user is not yet authenticated). It auto-shows once
 *     #admin-dashboard becomes visible.
 *   - On all other admin sub-pages, the nav renders immediately (those pages
 *     are protected by admin-auth-guard.js and only render their body when
 *     auth has been verified).
 *   - Hash-based actions (#reviews, #password-reset) on admin-panel.html are
 *     auto-promoted to ACTIVE so the right nav item highlights.
 */
(function () {
    'use strict';

    if (window.__adminNavInjected) return;
    window.__adminNavInjected = true;

    // Allow URL hash to override body data attribute so that #reviews / #password-reset
    // highlight the right nav item when landing on admin-panel.html via a deep link.
    var hashKey = (window.location.hash || '').replace(/^#/, '').toLowerCase();
    var bodyKey = (document.body && document.body.dataset && document.body.dataset.adminNavActive) || '';
    var ACTIVE = hashKey || bodyKey || '';

    // Daily monitoring tasks
    var PRIMARY_ITEMS = [
        { key: 'dashboard', label: 'Dashboard', href: 'admin-panel.html', icon: 'fa-gauge-high' },
        { key: 'verification', label: 'Verification', href: 'admin-verification-workflow.html', icon: 'fa-shield-halved' },
        { key: 'reviews', label: 'Reviews', href: 'admin-panel.html#reviews', icon: 'fa-star' },
        { key: 'payments', label: 'Payments', href: 'admin-payment-verification.html', icon: 'fa-money-check-dollar' },
        { key: 'communications', label: 'Communications', href: 'admin-communication-monitor.html', icon: 'fa-comments' }
    ];

    // Settings dropdown at end of primary (mirror of provider Clinic dropdown)
    var OPERATIONS_ITEMS = [
        { key: 'catalog', label: 'Service catalog', href: 'admin-service-catalog.html', icon: 'fa-list-check' },
        { key: 'migration', label: 'Provider migration', href: 'migrate-providers-to-firebase-auth.html', icon: 'fa-arrows-rotate' },
        { key: 'password-reset', label: 'Password reset', href: 'admin-panel.html#password-reset', icon: 'fa-key' },
        { key: 'firebase-console', label: 'Firebase console', href: 'https://console.firebase.google.com', icon: 'fa-fire', external: true }
    ];

    var css = '' +
'.anav-root{position:sticky;top:0;z-index:1000;background:#0f172a;color:#e2e8f0;border-bottom:1px solid #1e293b;box-shadow:0 1px 3px rgba(0,0,0,.1);font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;}' +
'.anav-bar{display:flex;align-items:center;justify-content:space-between;max-width:1400px;margin:0 auto;padding:.6rem 1.25rem;gap:1rem;}' +
'.anav-left{display:flex;align-items:center;gap:1.25rem;}' +
'.anav-logo{text-decoration:none;display:inline-flex;align-items:center;gap:.5rem;}' +
'.anav-logo h2{margin:0;font-size:1.5rem;font-weight:700;color:#fff;line-height:1;}' +
'.anav-logo:hover h2{color:#93c5fd;}' +
'.anav-logo .anav-badge{font-size:.65rem;font-weight:700;background:#dc2626;color:#fff;padding:.15rem .45rem;border-radius:4px;letter-spacing:.05em;text-transform:uppercase;}' +
'.anav-primary{display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;}' +
'.anav-item{position:relative;}' +
'.anav-link{display:inline-flex;align-items:center;gap:.25rem;padding:.55rem .8rem;border-radius:8px;color:#cbd5e1;text-decoration:none;font-size:.9rem;font-weight:500;line-height:1;transition:background .15s ease,color .15s ease;cursor:pointer;background:none;border:none;font-family:inherit;}' +
'.anav-link:hover{background:#1e293b;color:#fff;}' +
'.anav-link.is-active{background:#1d4ed8;color:#fff;}' +
'.anav-caret{font-size:.65rem;margin-left:.2rem;color:#94a3b8;font-weight:400;}' +
'.anav-dropdown{position:absolute;top:calc(100% + 6px);left:0;min-width:240px;background:#fff;color:#374151;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.15);padding:.4rem;display:none;z-index:1001;}' +
'.anav-dropdown.is-open{display:block;animation:anavFade .12s ease-out;}' +
'.anav-dropdown.align-right{left:auto;right:0;}' +
'.anav-dropdown a,.anav-dropdown button{display:block;padding:.55rem .7rem;border-radius:6px;color:#374151;text-decoration:none;font-size:.875rem;font-weight:500;white-space:nowrap;width:100%;text-align:left;background:none;border:none;cursor:pointer;font-family:inherit;}' +
'.anav-dropdown a:hover,.anav-dropdown button:hover{background:#f3f4f6;color:#2563eb;}' +
'.anav-dropdown a.is-active{color:#2563eb;background:#eff6ff;}' +
'.anav-divider{height:1px;background:#e5e7eb;margin:.35rem .25rem;}' +
'.anav-right{display:flex;align-items:center;gap:.5rem;}' +
'.anav-user-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.4rem .6rem;background:#1e293b;border:1px solid #334155;border-radius:999px;cursor:pointer;font-family:inherit;font-size:.875rem;font-weight:500;color:#e2e8f0;transition:background .15s,border-color .15s;}' +
'.anav-user-btn:hover{background:#334155;border-color:#475569;}' +
'.anav-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#dc2626,#7c3aed);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:.8rem;}' +
'.anav-user-name{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
'.anav-user-caret{color:#94a3b8;font-size:.7rem;}' +
'.anav-user-header{padding:.6rem .7rem;border-bottom:1px solid #e5e7eb;margin-bottom:.35rem;}' +
'.anav-user-header .anav-user-h-name{font-weight:600;color:#111827;font-size:.875rem;line-height:1.3;}' +
'.anav-user-header .anav-user-h-email{font-size:.75rem;color:#6b7280;line-height:1.3;margin-top:.15rem;word-break:break-all;}' +
'.anav-logout{color:#dc2626 !important;}' +
'.anav-logout:hover{color:#b91c1c !important;background:#fef2f2 !important;}' +
'.anav-toggle{display:none;flex-direction:column;justify-content:center;gap:5px;background:none;border:none;cursor:pointer;padding:.35rem .5rem;border-radius:6px;width:2rem;height:2rem;}' +
'.anav-toggle span{display:block;width:22px;height:2px;background:#cbd5e1;border-radius:1px;}' +
'.anav-toggle:hover{background:#1e293b;}' +
'@keyframes anavFade{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}' +
'@media (max-width: 980px){' +
  '.anav-toggle{display:inline-flex;}' +
  '.anav-primary{display:none;position:absolute;top:100%;left:0;right:0;background:#0f172a;border-bottom:1px solid #1e293b;flex-direction:column;align-items:stretch;padding:.5rem;gap:0;box-shadow:0 8px 20px rgba(0,0,0,.2);}' +
  '.anav-primary.is-open{display:flex;}' +
  '.anav-primary .anav-link{justify-content:flex-start;width:100%;padding:.7rem .9rem;}' +
  '.anav-primary .anav-item{width:100%;}' +
  '.anav-primary .anav-dropdown{position:static;display:none;box-shadow:none;border:none;background:transparent;padding:0 0 0 1.5rem;min-width:0;}' +
  '.anav-primary .anav-dropdown a,.anav-primary .anav-dropdown button{color:#cbd5e1;}' +
  '.anav-primary .anav-dropdown a:hover,.anav-primary .anav-dropdown button:hover{background:#1e293b;color:#fff;}' +
  '.anav-primary .anav-dropdown.is-open{display:block;}' +
  '.anav-user-name{display:none;}' +
'}' +
'@media print{.anav-root{display:none !important;}}' +
/* Portal shell — nav flush to top, full-width bar, aligned content */ +
'body.admin-portal{padding:0!important;margin:0!important;max-width:none!important;width:100%;}' +
'body.admin-portal>#main-content:not(.container){padding:0;margin:0;max-width:none;width:100%;}' +
'body.admin-portal #main-content.container,' +
'body.admin-portal>#main-content>.container,' +
'body.admin-portal>#main-content:not(.container)>.container,' +
'body.admin-portal>.container#main-content{box-sizing:border-box;width:100%;margin-left:auto;margin-right:auto;max-width:1400px;}' +
'body.admin-portal:not([data-admin-nav-active=dashboard]) #main-content.container,' +
'body.admin-portal:not([data-admin-nav-active=dashboard])>#main-content>.container{padding:2rem 1.25rem;}' +
'body.admin-portal[data-admin-nav-active=dashboard] #main-content.container{margin-top:0;margin-bottom:2rem;}' +
'body.admin-portal .page-title-row{margin-bottom:1.5rem;}' +
'body.admin-portal .page-title-row h1{font-size:1.5rem;font-weight:600;color:#1f2937;margin:0;}';

    function injectStyles() {
        if (document.getElementById('anav-styles')) return;
        var s = document.createElement('style');
        s.id = 'anav-styles';
        s.textContent = css;
        document.head.appendChild(s);
    }

    function ensureFontAwesome() {
        var has = !!document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"]');
        if (has) return;
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(l);
    }

    function getAdminData() {
        // admin-auth-guard.js stores under different keys; try a few
        try {
            var keys = ['adminUser', 'adminSession', 'adminAuth'];
            for (var i = 0; i < keys.length; i++) {
                var raw = localStorage.getItem(keys[i]) || sessionStorage.getItem(keys[i]);
                if (raw) {
                    try { return JSON.parse(raw); } catch (e) { return { email: raw }; }
                }
            }
        } catch (e) {}
        try {
            if (window.firebase && window.firebase.auth) {
                var u = window.firebase.auth.currentUser;
                if (u) return { email: u.email, displayName: u.displayName };
            }
        } catch (e) {}
        return null;
    }

    function getName(data) {
        if (!data) return 'Admin';
        return data.displayName || data.name || data.email || 'Admin';
    }

    function getEmail(data) {
        if (!data) return '';
        return data.email || '';
    }

    function getInitials(name) {
        if (!name) return 'A';
        var parts = String(name).trim().split(/[\s@]/);
        if (parts.length === 1 || !parts[1]) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }

    function isActiveItem(item) {
        if (item.children && item.children.length) {
            return item.children.some(function (c) { return c.key === ACTIVE; });
        }
        return item.key === ACTIVE;
    }

    function renderPrimary() {
        var html = PRIMARY_ITEMS.map(function (item) {
            var isActive = isActiveItem(item);
            return '' +
                '<div class="anav-item">' +
                    '<a href="' + item.href + '" class="anav-link' + (isActive ? ' is-active' : '') + '">' +
                        item.label +
                    '</a>' +
                '</div>';
        }).join('');

        // Operations dropdown (settings group, mirror of provider Clinic dropdown)
        var opsActive = OPERATIONS_ITEMS.some(function (t) { return t.key === ACTIVE; });
        html += '' +
            '<div class="anav-item" data-anav-dropdown>' +
                '<button type="button" class="anav-link' + (opsActive ? ' is-active' : '') + '" data-anav-toggle>' +
                    'Operations' +
                    '<span class="anav-caret" aria-hidden="true">▾</span>' +
                '</button>' +
                '<div class="anav-dropdown">' +
                    OPERATIONS_ITEMS.map(function (t) {
                        var extAttr = t.external ? ' target="_blank" rel="noopener noreferrer"' : '';
                        return '<a href="' + t.href + '"' + extAttr + (t.key === ACTIVE ? ' class="is-active"' : '') + '>' +
                            t.label +
                            '</a>';
                    }).join('') +
                '</div>' +
            '</div>';
        return html;
    }

    function renderUserMenu(data) {
        var name = getName(data);
        var email = getEmail(data);
        var initials = getInitials(name);
        var safeName = String(name).replace(/</g, '&lt;');
        var safeEmail = String(email).replace(/</g, '&lt;');
        return '' +
            '<div class="anav-item" data-anav-dropdown>' +
                '<button type="button" class="anav-user-btn" data-anav-toggle aria-haspopup="true" aria-expanded="false">' +
                    '<span class="anav-avatar">' + initials + '</span>' +
                    '<span class="anav-user-name">' + safeName + '</span>' +
                    '<span class="anav-user-caret" aria-hidden="true">▾</span>' +
                '</button>' +
                '<div class="anav-dropdown align-right" style="min-width:260px;">' +
                    '<div class="anav-user-header">' +
                        '<div class="anav-user-h-name">' + safeName + '</div>' +
                        (email ? '<div class="anav-user-h-email">' + safeEmail + '</div>' : '') +
                    '</div>' +
                    '<a href="admin-panel.html"' + (ACTIVE === 'dashboard' ? ' class="is-active"' : '') + '>' +
                        'Admin dashboard' +
                    '</a>' +
                    '<div class="anav-divider"></div>' +
                    '<button type="button" class="anav-logout" data-anav-logout>' +
                        'Logout' +
                    '</button>' +
                '</div>' +
            '</div>';
    }

    function buildNav() {
        var data = getAdminData();
        var navEl = document.createElement('header');
        navEl.className = 'anav-root';
        navEl.setAttribute('role', 'navigation');
        navEl.innerHTML = '' +
            '<div class="anav-bar">' +
                '<div class="anav-left">' +
                    '<a href="admin-panel.html" class="anav-logo" aria-label="Go to admin dashboard">' +
                        '<h2>CareLuva</h2>' +
                        '<span class="anav-badge">Admin</span>' +
                    '</a>' +
                    '<button type="button" class="anav-toggle" aria-label="Toggle navigation" data-anav-mobile-toggle>' +
                        '<span></span><span></span><span></span>' +
                    '</button>' +
                '</div>' +
                '<nav class="anav-primary" id="adminNavPrimary">' +
                    renderPrimary() +
                '</nav>' +
                '<div class="anav-right">' +
                    renderUserMenu(data) +
                '</div>' +
            '</div>';
        return navEl;
    }

    function closeAllDropdowns(except) {
        var open = document.querySelectorAll('.anav-dropdown.is-open');
        for (var i = 0; i < open.length; i++) {
            if (open[i] === except) continue;
            open[i].classList.remove('is-open');
            var btn = open[i].parentElement && open[i].parentElement.querySelector('[data-anav-toggle]');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        }
    }

    function attachBehavior(navEl) {
        var toggles = navEl.querySelectorAll('[data-anav-toggle]');
        for (var i = 0; i < toggles.length; i++) {
            toggles[i].addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var parent = this.parentElement;
                if (!parent) return;
                var dd = parent.querySelector('.anav-dropdown');
                if (!dd) return;
                var willOpen = !dd.classList.contains('is-open');
                closeAllDropdowns(willOpen ? dd : null);
                if (willOpen) {
                    dd.classList.add('is-open');
                    this.setAttribute('aria-expanded', 'true');
                } else {
                    dd.classList.remove('is-open');
                    this.setAttribute('aria-expanded', 'false');
                }
            });
        }

        var mobileBtn = navEl.querySelector('[data-anav-mobile-toggle]');
        var primary = navEl.querySelector('#adminNavPrimary');
        if (mobileBtn && primary) {
            mobileBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                primary.classList.toggle('is-open');
            });
        }

        document.addEventListener('click', function (e) {
            if (!navEl.contains(e.target)) {
                closeAllDropdowns();
                if (primary) primary.classList.remove('is-open');
            }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeAllDropdowns();
                if (primary) primary.classList.remove('is-open');
            }
        });

        var logoutBtn = navEl.querySelector('[data-anav-logout]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                adminLogout();
            });
        }
    }

    function adminLogout() {
        try {
            if (window.firebase && window.firebase.auth && typeof window.firebase.auth.signOut === 'function') {
                window.firebase.auth.signOut();
            }
        } catch (e) {}
        try {
            var keys = ['adminUser', 'adminSession', 'adminAuth'];
            for (var i = 0; i < keys.length; i++) {
                localStorage.removeItem(keys[i]);
                sessionStorage.removeItem(keys[i]);
            }
        } catch (e) {}
        window.location.href = 'admin-panel.html';
    }

    // Expose so existing onclick="logout()" usages still work in admin-panel.
    if (typeof window.logout !== 'function') {
        window.logout = adminLogout;
    }
    window.adminLogout = adminLogout;

    // ============================================================
    // Visibility control for admin-panel.html (hide nav until logged in)
    // ============================================================
    function setNavVisible(navEl, visible) {
        if (!navEl) return;
        navEl.style.display = visible ? '' : 'none';
    }

    function watchPanelAuthState(navEl) {
        // On admin-panel.html the login form/dashboard toggle visibility.
        // We hide the nav unless the dashboard is visible.
        var dashboard = document.getElementById('admin-dashboard');
        if (!dashboard) return; // Not the admin-panel page; nothing to do.

        var loginHeader = document.getElementById('login-header');

        function syncVisibility() {
            var visible = dashboard.style.display && dashboard.style.display !== 'none';
            setNavVisible(navEl, !!visible);
            // Hide the legacy login-header when the dashboard (and our nav) is visible.
            if (loginHeader) loginHeader.style.display = visible ? 'none' : '';
        }
        syncVisibility();

        // Observe attribute/style changes so we react when the page reveals it.
        try {
            var mo = new MutationObserver(syncVisibility);
            mo.observe(dashboard, { attributes: true, attributeFilter: ['style', 'class'] });
        } catch (e) {}

        // Safety net: poll briefly in case mutations are missed.
        var ticks = 0;
        var iv = setInterval(function () {
            syncVisibility();
            if (++ticks > 30) clearInterval(iv);
        }, 1000);
    }

    function init() {
        ensureFontAwesome();
        injectStyles();
        if (document.body) {
            document.body.classList.add('admin-portal');
        }
        var nav = buildNav();
        if (document.body.firstChild) {
            document.body.insertBefore(nav, document.body.firstChild);
        } else {
            document.body.appendChild(nav);
        }
        attachBehavior(nav);
        watchPanelAuthState(nav);
        setTimeout(refreshUserName, 400);
    }

    function refreshUserName() {
        var data = getAdminData();
        if (!data) return;
        var nameEl = document.querySelector('.anav-user-name');
        var hName = document.querySelector('.anav-user-h-name');
        var hEmail = document.querySelector('.anav-user-h-email');
        var avatar = document.querySelector('.anav-avatar');
        var name = getName(data);
        var email = getEmail(data);
        if (nameEl) nameEl.textContent = name;
        if (hName) hName.textContent = name;
        if (hEmail) hEmail.textContent = email;
        if (avatar) avatar.textContent = getInitials(name);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
