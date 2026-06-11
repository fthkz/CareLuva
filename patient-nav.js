/**
 * Shared Patient Top Navigation
 *
 * Usage:
 *   <body data-patient-nav-active="dashboard">
 *     <script src="patient-nav.js"></script>
 *
 * Active keys (primary):
 *   dashboard | find-clinics | recommendations | pricing | favorites | records
 *   booking | review
 * Active keys (account dropdown):
 *   account | edit-profile | change-password
 *
 * Structure (mirrors provider-nav: primary work items + in-line Discover
 * dropdown + settings "Account" dropdown at end + user menu).
 *
 * Features:
 *   - Logo (CareLuva) is a link to patient-dashboard.html
 *   - Top bar with primary nav, Discover dropdown, and Account dropdown
 *   - User dropdown (patient name, my account, dashboard, logout)
 *   - Active-state highlight via body[data-patient-nav-active]
 *   - Mobile-responsive hamburger menu
 *   - Self-contained styles (no dependency on page CSS)
 */
(function () {
    'use strict';

    if (window.__patientNavInjected) return;
    window.__patientNavInjected = true;

    var ACTIVE = (document.body && document.body.dataset && document.body.dataset.patientNavActive) || '';

    // Primary work items + in-line Discover dropdown (mirrors provider Treatments dropdown)
    var PRIMARY_ITEMS = [
        { key: 'dashboard', label: 'Dashboard', href: 'patient-dashboard.html', icon: 'fa-gauge-high' },
        {
            key: 'find-clinics',
            label: 'Find clinics',
            href: 'find-clinics.html',
            icon: 'fa-magnifying-glass',
            // Sub-flows highlight as Find clinics
            highlightFor: ['find-clinics', 'booking', 'review']
        },
        {
            key: 'discover',
            label: 'Discover',
            icon: 'fa-compass',
            children: [
                { key: 'recommendations', label: 'Recommendations', href: 'clinic-recommendations.html', icon: 'fa-wand-magic-sparkles' },
                { key: 'pricing', label: 'Compare prices', href: 'price-comparison.html', icon: 'fa-scale-balanced' },
                { key: 'favorites', label: 'Favorite clinics', href: 'favorite-clinics.html', icon: 'fa-heart' }
            ]
        },
        { key: 'records', label: 'Medical records', href: 'patient-medical-records.html', icon: 'fa-file-medical' }
    ];

    // Settings dropdown at end of primary (mirrors provider Clinic dropdown)
    var ACCOUNT_ITEMS = [
        { key: 'account', label: 'My profile', href: 'patient-account.html', icon: 'fa-user' },
        { key: 'edit-profile', label: 'Edit profile', href: 'patient-account.html?action=edit-profile', icon: 'fa-user-pen' },
        { key: 'change-password', label: 'Change password', href: 'patient-auth.html?action=change-password', icon: 'fa-key' }
    ];

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
'.pnav-divider{height:1px;background:#e5e7eb;margin:.35rem .25rem;}' +
'.pnav-right{display:flex;align-items:center;gap:.5rem;}' +
'.pnav-user-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.4rem .6rem;background:#f9fafb;border:1px solid #e5e7eb;border-radius:999px;cursor:pointer;font-family:inherit;font-size:.875rem;font-weight:500;color:#111827;transition:background .15s,border-color .15s;}' +
'.pnav-user-btn:hover{background:#f3f4f6;border-color:#d1d5db;}' +
'.pnav-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#10b981,#3b82f6);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:.8rem;}' +
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
/* Portal shell — nav flush to top, consistent content width */ +
'body.patient-portal{padding:0!important;margin:0;}' +
'body.patient-portal>#main-content:not(.container){padding:0;margin:0;max-width:none;width:100%;}' +
'body.patient-portal #main-content.container,' +
'body.patient-portal>#main-content>.container,' +
'body.patient-portal>#main-content:not(.container)>.container,' +
'body.patient-portal>.container#main-content{box-sizing:border-box;width:100%;margin-left:auto;margin-right:auto;padding:2rem 1.25rem;max-width:1400px;}' +
'body.patient-portal .page-title-row{margin-bottom:1.5rem;}' +
'body.patient-portal .page-title-row h1{font-size:1.5rem;font-weight:600;color:#1f2937;margin:0;}';

    function injectStyles() {
        if (document.getElementById('pnav-styles-patient')) return;
        var s = document.createElement('style');
        s.id = 'pnav-styles-patient';
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

    function getPatientData() {
        try {
            if (window.authUtils && typeof window.authUtils.getSessionData === 'function') {
                var data = window.authUtils.getSessionData();
                if (data) return data;
            }
        } catch (e) {}
        try {
            var raw = localStorage.getItem('patientUser') ||
                      sessionStorage.getItem('patientUser');
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        try {
            var s = localStorage.getItem('patientSession') ||
                    sessionStorage.getItem('patientSession');
            if (s) return JSON.parse(s);
        } catch (e) {}
        return null;
    }

    function getName(data) {
        if (!data) return 'My Account';
        return data.firstName && data.lastName
            ? data.firstName + ' ' + data.lastName
            : data.firstName || data.name || data.email || 'My Account';
    }

    function getEmail(data) {
        if (!data) return '';
        return data.email || '';
    }

    function getInitials(name) {
        if (!name) return 'P';
        var parts = String(name).trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    function isActiveItem(item) {
        if (item.children && item.children.length) {
            return item.children.some(function (c) { return c.key === ACTIVE; });
        }
        if (item.highlightFor && item.highlightFor.indexOf(ACTIVE) !== -1) return true;
        return item.key === ACTIVE;
    }

    function renderPrimary() {
        return PRIMARY_ITEMS.map(function (item) {
            var isActive = isActiveItem(item);
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

    function renderAccountDropdown() {
        var isActive = ACCOUNT_ITEMS.some(function (c) { return c.key === ACTIVE; });
        return '' +
            '<div class="pnav-item" data-pnav-dropdown>' +
                '<button type="button" class="pnav-link' + (isActive ? ' is-active' : '') + '" data-pnav-toggle>' +
                    'Account' +
                    '<span class="pnav-caret" aria-hidden="true">▾</span>' +
                '</button>' +
                '<div class="pnav-dropdown">' +
                    ACCOUNT_ITEMS.map(function (c) {
                        return '<a href="' + c.href + '"' + (c.key === ACTIVE ? ' class="is-active"' : '') + '>' +
                            c.label +
                            '</a>';
                    }).join('') +
                '</div>' +
            '</div>';
    }

    function renderUserMenu(data) {
        var name = getName(data);
        var email = getEmail(data);
        var initials = getInitials(name);
        var safeName = String(name).replace(/</g, '&lt;');
        var safeEmail = String(email).replace(/</g, '&lt;');
        return '' +
            '<div class="pnav-item" data-pnav-dropdown>' +
                '<button type="button" class="pnav-user-btn" data-pnav-toggle aria-haspopup="true" aria-expanded="false">' +
                    '<span class="pnav-avatar">' + initials + '</span>' +
                    '<span class="pnav-user-name">' + safeName + '</span>' +
                    '<span class="pnav-user-caret" aria-hidden="true">▾</span>' +
                '</button>' +
                '<div class="pnav-dropdown align-right" style="min-width:260px;">' +
                    '<div class="pnav-user-header">' +
                        '<div class="pnav-user-h-name">' + safeName + '</div>' +
                        (email ? '<div class="pnav-user-h-email">' + safeEmail + '</div>' : '') +
                    '</div>' +
                    '<a href="patient-account.html"' + (ACTIVE === 'account' ? ' class="is-active"' : '') + '>' +
                        'My profile' +
                    '</a>' +
                    '<a href="patient-account.html?action=edit-profile"' + (ACTIVE === 'edit-profile' ? ' class="is-active"' : '') + '>' +
                        'Edit profile' +
                    '</a>' +
                    '<a href="patient-auth.html?action=change-password"' + (ACTIVE === 'change-password' ? ' class="is-active"' : '') + '>' +
                        'Change password' +
                    '</a>' +
                    '<div class="pnav-divider"></div>' +
                    '<button type="button" class="pnav-logout" data-pnav-logout>' +
                        'Logout' +
                    '</button>' +
                '</div>' +
            '</div>';
    }

    function buildNav() {
        var data = getPatientData();
        var navEl = document.createElement('header');
        navEl.className = 'pnav-root';
        navEl.setAttribute('role', 'navigation');
        navEl.innerHTML = '' +
            '<div class="pnav-bar">' +
                '<div class="pnav-left">' +
                    '<a href="patient-dashboard.html" class="pnav-logo" aria-label="Go to dashboard">' +
                        '<h2>CareLuva</h2>' +
                    '</a>' +
                    '<button type="button" class="pnav-toggle" aria-label="Toggle navigation" data-pnav-mobile-toggle>' +
                        '<span></span><span></span><span></span>' +
                    '</button>' +
                '</div>' +
                '<nav class="pnav-primary" id="patientNavPrimary">' +
                    renderPrimary() +
                    renderAccountDropdown() +
                '</nav>' +
                '<div class="pnav-right">' +
                    renderUserMenu(data) +
                '</div>' +
            '</div>';
        return navEl;
    }

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

        var mobileBtn = navEl.querySelector('[data-pnav-mobile-toggle]');
        var primary = navEl.querySelector('#patientNavPrimary');
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

        var logoutBtn = navEl.querySelector('[data-pnav-logout]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                patientLogout();
            });
        }
    }

    function patientLogout() {
        try {
            if (window.authUtils && typeof window.authUtils.clearSession === 'function') {
                window.authUtils.clearSession();
            }
        } catch (e) {}
        try {
            localStorage.removeItem('patientUser');
            localStorage.removeItem('patientSession');
            localStorage.removeItem('patientId');
            sessionStorage.removeItem('patientUser');
            sessionStorage.removeItem('patientSession');
            sessionStorage.removeItem('patientId');
            if (typeof window.clearAuthGuardCache === 'function') {
                window.clearAuthGuardCache('patient');
            }
        } catch (e) {}
        window.location.href = 'patient-auth.html';
    }

    if (typeof window.logout !== 'function') {
        window.logout = patientLogout;
    }
    window.patientLogout = patientLogout;

    function init() {
        ensureFontAwesome();
        injectStyles();
        if (document.body) {
            document.body.classList.add('patient-portal');
        }
        var nav = buildNav();
        if (document.body.firstChild) {
            document.body.insertBefore(nav, document.body.firstChild);
        } else {
            document.body.appendChild(nav);
        }
        attachBehavior(nav);

        window.addEventListener('auth-verified', refreshUserName);
        setTimeout(refreshUserName, 400);
    }

    function refreshUserName() {
        var data = getPatientData();
        if (!data) return;
        var nameEl = document.querySelector('.pnav-user-name');
        var hName = document.querySelector('.pnav-user-h-name');
        var hEmail = document.querySelector('.pnav-user-h-email');
        var avatar = document.querySelector('.pnav-avatar');
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
