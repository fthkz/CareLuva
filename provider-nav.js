/**
 * Shared Provider Top Navigation
 *
 * Usage:
 *   <body data-provider-nav-active="dashboard">
 *     <script src="provider-nav.js"></script>
 *
 * Active keys:
 *   dashboard | appointments | patients | treatments | analytics | billing
 *   clinic-profile | account-settings | professionals | schedules | pricing | packages | gallery
 *
 * Features:
 *   - Logo (CareLuva wordmark, same as index.html) links to provider-dashboard.html
 *   - Top bar: operational links (dashboard, appointments, patients, treatments, analytics, billing)
 *   - Account dropdown: profile & settings (#settings), then catalog / master-data links (grouped)
 *   - Active-state highlight (set via body[data-provider-nav-active])
 *   - Mobile-responsive hamburger menu
 *   - Self-contained styles (no dependency on page CSS)
 */
(function () {
    'use strict';

    if (window.__providerNavInjected) return;
    window.__providerNavInjected = true;

    var ACTIVE = (document.body && document.body.dataset && document.body.dataset.providerNavActive) || '';

    // Nav data
    var PRIMARY_ITEMS = [
        { key: 'dashboard', label: 'Dashboard', href: 'provider-dashboard.html', icon: 'fa-gauge-high' },
        { key: 'appointments', label: 'Appointments', href: 'provider-appointments.html', icon: 'fa-calendar-check' },
        { key: 'patients', label: 'Patients', href: 'provider-patients.html', icon: 'fa-users' },
        {
            key: 'treatments',
            label: 'Treatments',
            icon: 'fa-notes-medical',
            children: [
                { key: 'treatments', label: 'Treatment plans', href: 'provider-treatment-plans.html', icon: 'fa-clipboard-list' },
                { key: 'treatments', label: 'Create new plan', href: 'create-treatment-plan.html', icon: 'fa-plus' }
            ]
        },
        { key: 'analytics', label: 'Analytics', href: 'provider-analytics.html', icon: 'fa-chart-line' },
        { key: 'billing', label: 'Billing', href: 'provider-invoices.html', icon: 'fa-file-invoice-dollar' }
    ];

    var PROFILE_ACCOUNT_ITEMS = [
        {
            key: 'clinic-profile',
            label: 'Clinic profile',
            href: 'provider-clinic-profile.html',
            icon: 'fa-hospital',
            isActive: function () { return ACTIVE === 'clinic-profile'; }
        },
        {
            key: 'account-settings',
            label: 'Settings',
            href: 'provider-settings.html',
            icon: 'fa-cog',
            isActive: function () { return ACTIVE === 'account-settings'; }
        }
    ];

    // Catalog & master data (not on the primary operational bar).
    var MASTER_DATA_ITEMS = [
        { key: 'professionals', label: 'Professionals', href: 'manage-professionals.html', icon: 'fa-user-md' },
        { key: 'schedules', label: 'Schedules', href: 'professional-schedules.html', icon: 'fa-calendar-days' },
        { key: 'pricing', label: 'Service pricing', href: 'service-pricing-management.html', icon: 'fa-dollar-sign' },
        { key: 'packages', label: 'Service packages', href: 'service-packages-management.html', icon: 'fa-box' },
        { key: 'gallery', label: 'Photo gallery', href: 'clinic-photo-gallery.html', icon: 'fa-images' }
    ];

    // ============================================================
    // STYLES
    // ============================================================
    var css = '' +
'.pnav-root{position:sticky;top:0;z-index:1000;background:#ffffff;border-bottom:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,.05);font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;}' +
'.pnav-bar{display:flex;align-items:center;justify-content:space-between;max-width:1400px;margin:0 auto;padding:.6rem 1.25rem;gap:1rem;}' +
'.pnav-left{display:flex;align-items:center;gap:1.25rem;}' +
'.pnav-logo{text-decoration:none;display:inline-flex;align-items:center;}' +
'.pnav-logo h2{margin:0;font-size:1.5rem;font-weight:700;color:#2563eb;line-height:1;}' +
'.pnav-logo:hover h2{color:#1d4ed8;}' +
'.pnav-primary{display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;}' +
'.pnav-item{position:relative;}' +
'.pnav-link{display:inline-flex;align-items:center;gap:.25rem;padding:.55rem .8rem;border-radius:8px;color:#1f2937;text-decoration:none;font-size:.9rem;font-weight:500;line-height:1;transition:background .15s ease,color .15s ease;cursor:pointer;background:none;border:none;font-family:inherit;}' +
'.pnav-link:hover{color:#2563eb;background:#f3f4f6;}' +
'.pnav-link.is-active{color:#2563eb;background:#eff6ff;}' +
'.pnav-caret{font-size:.65rem;margin-left:.2rem;color:#9ca3af;font-weight:400;}' +
'.pnav-dropdown{position:absolute;top:calc(100% + 6px);left:0;min-width:240px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.08);padding:.4rem;display:none;z-index:1001;}' +
'.pnav-dropdown.is-open{display:block;animation:pnavFade .12s ease-out;}' +
'.pnav-dropdown.align-right{left:auto;right:0;}' +
'.pnav-dropdown a,.pnav-dropdown button{display:block;padding:.55rem .7rem;border-radius:6px;color:#1f2937;text-decoration:none;font-size:.875rem;font-weight:500;white-space:nowrap;width:100%;text-align:left;background:none;border:none;cursor:pointer;font-family:inherit;}' +
'.pnav-dropdown a:hover,.pnav-dropdown button:hover{background:#f3f4f6;color:#2563eb;}' +
'.pnav-dropdown a.is-active{color:#2563eb;background:#eff6ff;}' +
'.pnav-dropdown-label{display:block;padding:.35rem .7rem .2rem;font-size:.65rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;}' +
'.pnav-dropdown-label:first-child{padding-top:.15rem;}' +
'.pnav-divider{height:1px;background:#e5e7eb;margin:.35rem .25rem;}' +
'.pnav-right{display:flex;align-items:center;gap:.5rem;}' +
'.pnav-user-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.4rem .6rem;background:#f9fafb;border:1px solid #e5e7eb;border-radius:999px;cursor:pointer;font-family:inherit;font-size:.875rem;font-weight:500;color:#111827;transition:background .15s,border-color .15s;}' +
'.pnav-user-btn:hover{background:#f3f4f6;border-color:#d1d5db;}' +
'.pnav-user-btn.is-active{background:#eff6ff;border-color:#bfdbfe;color:#1d4ed8;}' +
'.pnav-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:.8rem;}' +
'.pnav-user-name{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
'.pnav-user-caret{color:#9ca3af;font-size:.7rem;}' +
'.pnav-user-header{padding:.6rem .7rem;border-bottom:1px solid #e5e7eb;margin-bottom:.35rem;}' +
'.pnav-user-header .pnav-user-h-name{font-weight:600;color:#111827;font-size:.875rem;line-height:1.3;}' +
'.pnav-user-header .pnav-user-h-email{font-size:.75rem;color:#6b7280;line-height:1.3;margin-top:.15rem;word-break:break-all;}' +
'.pnav-logout{color:#dc2626 !important;}' +
'.pnav-logout:hover{color:#b91c1c !important;background:#fef2f2 !important;}' +
'.pnav-toggle{display:none;flex-direction:column;justify-content:center;gap:5px;background:none;border:none;cursor:pointer;padding:.35rem .5rem;border-radius:6px;width:2rem;height:2rem;}' +
'.pnav-toggle span{display:block;width:22px;height:2px;background:#1f2937;border-radius:1px;}' +
'.pnav-toggle:hover{background:#f3f4f6;}' +
'@keyframes pnavFade{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}' +
'@media (max-width: 980px){' +
  '.pnav-toggle{display:inline-flex;}' +
  '.pnav-primary{display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border-bottom:1px solid #e5e7eb;flex-direction:column;align-items:stretch;padding:.5rem;gap:0;box-shadow:0 8px 20px rgba(0,0,0,.06);}' +
  '.pnav-primary.is-open{display:flex;}' +
  '.pnav-primary .pnav-link{justify-content:flex-start;width:100%;padding:.7rem .9rem;}' +
  '.pnav-primary .pnav-item{width:100%;}' +
  '.pnav-primary .pnav-dropdown{position:static;display:none;box-shadow:none;border:none;padding:0 0 0 1.5rem;min-width:0;}' +
  '.pnav-primary .pnav-dropdown.is-open{display:block;}' +
  '.pnav-user-name{display:none;}' +
'}' +
'@media print{.pnav-root{display:none !important;}}' +
/* Portal shell — align all provider pages with dashboard (nav flush to top) */ +
'body.provider-portal{padding:0!important;margin:0;}' +
'body.provider-portal>#main-content:not(.container){padding:0;margin:0;max-width:none;width:100%;}' +
'body.provider-portal #main-content.container,' +
'body.provider-portal>#main-content>.container,' +
'body.provider-portal>#main-content:not(.container)>.container{box-sizing:border-box;width:100%;margin-left:auto;margin-right:auto;padding:2rem 1.25rem;}' +
'body.provider-portal:not([data-provider-nav-active=clinic-profile]):not([data-provider-nav-active=account-settings]) #main-content.container,' +
'body.provider-portal:not([data-provider-nav-active=clinic-profile]):not([data-provider-nav-active=account-settings])>#main-content>.container,' +
'body.provider-portal:not([data-provider-nav-active=clinic-profile]):not([data-provider-nav-active=account-settings])>#main-content:not(.container)>.container{max-width:1400px;}' +
'body.provider-portal[data-provider-nav-active=clinic-profile] #main-content.container,' +
'body.provider-portal[data-provider-nav-active=account-settings] #main-content.container{max-width:720px;}' +
'body.provider-portal .page-title-row{margin-bottom:1.5rem;}' +
'body.provider-portal .page-title-row h1{font-size:1.5rem;font-weight:600;color:#1f2937;margin:0;}';

    function injectStyles() {
        if (document.getElementById('pnav-styles')) return;
        var s = document.createElement('style');
        s.id = 'pnav-styles';
        s.textContent = css;
        // Ensure Font Awesome is available (most provider pages already include it).
        document.head.appendChild(s);
    }

    function ensureFontAwesome() {
        // Add FA only if it's not already loaded by the page.
        var has = !!document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"]');
        if (has) return;
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(l);
    }

    // ============================================================
    // SESSION HELPERS
    // ============================================================
    function getClinicData() {
        try {
            if (window.authUtils && typeof window.authUtils.getSessionData === 'function') {
                var data = window.authUtils.getSessionData();
                if (data) return data;
            }
        } catch (e) {}
        try {
            var raw = localStorage.getItem('providerRegistration') ||
                      sessionStorage.getItem('providerRegistration');
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        try {
            var s = localStorage.getItem('providerSession') ||
                    sessionStorage.getItem('providerSession');
            if (s) return JSON.parse(s);
        } catch (e) {}
        return null;
    }

    function getClinicName(data) {
        if (!data) return 'My Clinic';
        return data.clinicName || data.name || data.email || 'My Clinic';
    }

    function getClinicEmail(data) {
        if (!data) return '';
        return data.email || '';
    }

    function getInitials(name) {
        if (!name) return 'C';
        var parts = String(name).trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    // ============================================================
    // RENDER
    // ============================================================
    function renderPrimary() {
        return PRIMARY_ITEMS.map(function (item) {
            var isActive = item.key === ACTIVE ||
                (item.children && item.children.some(function (c) { return c.key === ACTIVE; }));
            if (item.children && item.children.length) {
                return '' +
                    '<div class="pnav-item" data-pnav-dropdown>' +
                        '<button type="button" class="pnav-link' + (isActive ? ' is-active' : '') + '" data-pnav-toggle>' +
                            item.label +
                            '<span class="pnav-caret" aria-hidden="true">▾</span>' +
                        '</button>' +
                        '<div class="pnav-dropdown">' +
                            item.children.map(function (c) {
                                return '<a href="' + c.href + '"' + (c.key === ACTIVE ? ' class="is-active"' : '') + '>' +
                                    c.label +
                                    '</a>';
                            }).join('') +
                        '</div>' +
                    '</div>';
            }
            return '' +
                '<div class="pnav-item">' +
                    '<a href="' + item.href + '" class="pnav-link' + (isActive ? ' is-active' : '') + '">' +
                        item.label +
                    '</a>' +
                '</div>';
        }).join('');
    }

    function isAccountDropdownActive() {
        if (PROFILE_ACCOUNT_ITEMS.some(function (c) {
            return typeof c.isActive === 'function' ? c.isActive() : c.key === ACTIVE;
        })) return true;
        if (MASTER_DATA_ITEMS.some(function (c) { return c.key === ACTIVE; })) return true;
        return false;
    }

    function renderAccountMenuLinks() {
        var parts = [];
        parts.push('<span class="pnav-dropdown-label">Profile &amp; account</span>');
        PROFILE_ACCOUNT_ITEMS.forEach(function (c) {
            var active = typeof c.isActive === 'function' ? c.isActive() : (c.key === ACTIVE);
            parts.push('<a href="' + c.href + '"' + (active ? ' class="is-active"' : '') + '>' +
                c.label + '</a>');
        });
        parts.push('<div class="pnav-divider"></div>');
        parts.push('<span class="pnav-dropdown-label">Catalog &amp; setup</span>');
        MASTER_DATA_ITEMS.forEach(function (c) {
            parts.push('<a href="' + c.href + '"' + (c.key === ACTIVE ? ' class="is-active"' : '') + '>' +
                c.label + '</a>');
        });
        return parts.join('');
    }

    function renderUserMenu(data) {
        var name = getClinicName(data);
        var email = getClinicEmail(data);
        var initials = getInitials(name);
        var safeName = String(name).replace(/</g, '&lt;');
        var safeEmail = String(email).replace(/</g, '&lt;');
        var accountMenuActive = isAccountDropdownActive();
        return '' +
            '<div class="pnav-item" data-pnav-dropdown>' +
                '<button type="button" class="pnav-user-btn' + (accountMenuActive ? ' is-active' : '') + '" data-pnav-toggle aria-haspopup="true" aria-expanded="false">' +
                    '<span class="pnav-avatar">' + initials + '</span>' +
                    '<span class="pnav-user-name">' + safeName + '</span>' +
                    '<span class="pnav-user-caret" aria-hidden="true">▾</span>' +
                '</button>' +
                '<div class="pnav-dropdown align-right" style="min-width:260px;">' +
                    '<div class="pnav-user-header">' +
                        '<div class="pnav-user-h-name">' + safeName + '</div>' +
                        (email ? '<div class="pnav-user-h-email">' + safeEmail + '</div>' : '') +
                    '</div>' +
                    renderAccountMenuLinks() +
                    '<div class="pnav-divider"></div>' +
                    '<button type="button" class="pnav-logout" data-pnav-logout>' +
                        'Logout' +
                    '</button>' +
                '</div>' +
            '</div>';
    }

    function buildNav() {
        var data = getClinicData();
        var navEl = document.createElement('header');
        navEl.className = 'pnav-root';
        navEl.setAttribute('role', 'navigation');
        navEl.innerHTML = '' +
            '<div class="pnav-bar">' +
                '<div class="pnav-left">' +
                    '<a href="provider-dashboard.html" class="pnav-logo" aria-label="Go to dashboard">' +
                        '<h2>CareLuva</h2>' +
                    '</a>' +
                    '<button type="button" class="pnav-toggle" aria-label="Toggle navigation" data-pnav-mobile-toggle>' +
                        '<span></span><span></span><span></span>' +
                    '</button>' +
                '</div>' +
                '<nav class="pnav-primary" id="pnavPrimary">' +
                    renderPrimary() +
                '</nav>' +
                '<div class="pnav-right">' +
                    renderUserMenu(data) +
                '</div>' +
            '</div>';
        return navEl;
    }

    // ============================================================
    // BEHAVIOR
    // ============================================================
    function closeAllDropdowns(except) {
        var open = document.querySelectorAll('.pnav-dropdown.is-open');
        for (var i = 0; i < open.length; i++) {
            if (open[i] === except) continue;
            open[i].classList.remove('is-open');
            var btn = open[i].parentElement && open[i].parentElement.querySelector('[data-pnav-toggle]');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        }
    }

    function attachBehavior(navEl) {
        // Dropdown toggles
        var toggles = navEl.querySelectorAll('[data-pnav-toggle]');
        for (var i = 0; i < toggles.length; i++) {
            toggles[i].addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var parent = this.parentElement;
                if (!parent) return;
                var dd = parent.querySelector('.pnav-dropdown');
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

        // Mobile menu toggle
        var mobileBtn = navEl.querySelector('[data-pnav-mobile-toggle]');
        var primary = navEl.querySelector('#pnavPrimary');
        if (mobileBtn && primary) {
            mobileBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                primary.classList.toggle('is-open');
            });
        }

        // Click-outside / Esc close
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

        // Logout
        var logoutBtn = navEl.querySelector('[data-pnav-logout]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                providerLogout();
            });
        }
    }

    function providerLogout() {
        (async function () {
            try {
                if (window.authUtils && typeof window.authUtils.clearFirebaseSessionCookie === 'function') {
                    await window.authUtils.clearFirebaseSessionCookie();
                }
            } catch (e) {}
            try {
                if (window.authUtils && typeof window.authUtils.clearSession === 'function') {
                    window.authUtils.clearSession();
                }
            } catch (e) {}
            try {
                localStorage.removeItem('providerRegistration');
                localStorage.removeItem('providerSession');
                localStorage.removeItem('providerRegistrationId');
                sessionStorage.removeItem('providerRegistration');
                sessionStorage.removeItem('providerSession');
                sessionStorage.removeItem('providerRegistrationId');
                if (typeof window.clearAuthGuardCache === 'function') {
                    window.clearAuthGuardCache('provider');
                }
            } catch (e) {}
            window.location.href = 'provider-auth.html';
        })();
    }

    // Expose so existing onclick="logout()" usages still work if anyone left them.
    if (typeof window.logout !== 'function') {
        window.logout = providerLogout;
    }
    window.providerLogout = providerLogout;

    // ============================================================
    // INIT
    // ============================================================
    function init() {
        ensureFontAwesome();
        injectStyles();
        if (document.body) {
            document.body.classList.add('provider-portal');
        }
        var nav = buildNav();
        if (document.body.firstChild) {
            document.body.insertBefore(nav, document.body.firstChild);
        } else {
            document.body.appendChild(nav);
        }
        attachBehavior(nav);

        // Keep user name fresh if the page populates session after nav renders
        window.addEventListener('auth-verified', refreshUserName);
        setTimeout(refreshUserName, 400);
    }

    function refreshUserName() {
        var data = getClinicData();
        if (!data) return;
        var nameEl = document.querySelector('.pnav-user-name');
        var hName = document.querySelector('.pnav-user-h-name');
        var hEmail = document.querySelector('.pnav-user-h-email');
        var avatar = document.querySelector('.pnav-avatar');
        var name = getClinicName(data);
        var email = getClinicEmail(data);
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
