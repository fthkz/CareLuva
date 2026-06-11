/**
 * Role-aware top navigation for shared pages (e.g. provider-directory.html).
 * Loads patient-nav, provider-nav, or admin-nav based on session / URL context.
 */
(function () {
    'use strict';

    if (window.__portalNavLoader) return;
    window.__portalNavLoader = true;

    function storageHas(keys) {
        for (var i = 0; i < keys.length; i++) {
            if (localStorage.getItem(keys[i]) || sessionStorage.getItem(keys[i])) return true;
        }
        return false;
    }

    function fromAdminContext() {
        var p = new URLSearchParams(location.search);
        if (p.get('from') === 'admin') return true;
        try {
            var ref = document.referrer || '';
            return /admin-panel\.html|admin-verification|admin-service-catalog|admin-payment|admin-communication/.test(ref);
        } catch (e) {
            return false;
        }
    }

    function navAlreadyMounted() {
        return !!(window.__patientNavInjected || window.__providerNavInjected || window.__adminNavInjected);
    }

    function mountNav(userType) {
        if (navAlreadyMounted()) return;

        var cfg;
        if (userType === 'admin' || fromAdminContext()) {
            cfg = { src: 'admin-nav.js', attr: 'data-admin-nav-active', active: 'reviews' };
        } else if (userType === 'provider' ||
            (storageHas(['providerSession', 'providerRegistration']) &&
                !storageHas(['patientSession', 'patientUser']))) {
            cfg = { src: 'provider-nav.js', attr: 'data-provider-nav-active', active: 'dashboard' };
        } else {
            cfg = { src: 'patient-nav.js', attr: 'data-patient-nav-active', active: 'find-clinics' };
        }

        document.body.setAttribute(cfg.attr, cfg.active);
        var el = document.createElement('script');
        el.src = cfg.src;
        el.async = false;
        document.body.insertBefore(el, document.body.firstChild);
    }

    window.mountCareLuvaPortalNav = mountNav;

    function tryEarlyMount() {
        if (fromAdminContext() ||
            storageHas(['patientSession', 'patientUser', 'providerSession', 'providerRegistration'])) {
            mountNav();
        }
    }

    if (document.body) {
        tryEarlyMount();
    } else {
        document.addEventListener('DOMContentLoaded', tryEarlyMount);
    }

    window.addEventListener('auth-verified', function (ev) {
        var t = ev.detail && ev.detail.userType;
        if (t) mountNav(t);
    });
})();
