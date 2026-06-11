/**
 * Provider session API — Firebase Admin session cookies (HttpOnly, SameSite).
 *
 * Deploy: npm install in functions/ then firebase deploy --only functions
 * Hosting must rewrite /api/auth/* to function authApi (see firebase.json).
 */
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Firebase Hosting rewrites strip all cookies except __session (see Firebase Hosting cache docs).
 * Do not rename without updating hosting/session-verify behavior.
 */
const COOKIE_NAME = '__session';
const SESSION_COOKIE_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days (Firebase allows up to 2 weeks)

const DEFAULT_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:5000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5000',
    'https://careluva-5635e.web.app',
    'https://careluva-5635e.firebaseapp.com'
];

function getAllowedOrigins() {
    const extra = process.env.ALLOWED_ORIGINS;
    if (!extra) return DEFAULT_ALLOWED_ORIGINS;
    return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...extra.split(',').map((s) => s.trim()).filter(Boolean)])];
}

const corsMiddleware = cors({
    origin(origin, callback) {
        if (!origin) {
            callback(null, true);
            return;
        }
        if (getAllowedOrigins().includes(origin)) {
            callback(null, origin);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
});

function getCookie(req, name) {
    const raw = req.headers.cookie;
    if (!raw) return null;
    const parts = raw.split(';');
    for (let i = 0; i < parts.length; i++) {
        const segment = parts[i].trim();
        const eq = segment.indexOf('=');
        if (eq === -1) continue;
        const k = segment.slice(0, eq).trim();
        if (k === name) {
            return decodeURIComponent(segment.slice(eq + 1).trim());
        }
    }
    return null;
}

/**
 * Resolve Firestore provider registration document id from Firebase Auth uid.
 */
async function resolveProviderRegistrationId(firebaseUid) {
    const db = admin.firestore();
    const byId = await db.collection('providerRegistrations').doc(firebaseUid).get();
    if (byId.exists) return byId.id;
    const snap = await db.collection('providerRegistrations').where('firebaseAuthUid', '==', firebaseUid).limit(1).get();
    if (!snap.empty) return snap.docs[0].id;
    return null;
}

const app = express();
app.disable('x-powered-by');
app.set('etag', false);
app.use(corsMiddleware);
app.use(express.json({ limit: '32kb' }));

/** Hosting passes __session only; auth responses must never be CDN/browser cached */
app.use('/api/auth', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

app.post('/api/auth/session-login', async (req, res) => {
    try {
        const idToken = req.body && req.body.idToken;
        if (!idToken || typeof idToken !== 'string') {
            res.status(400).json({ ok: false, error: 'idToken required' });
            return;
        }
        const decoded = await admin.auth().verifyIdToken(idToken);
        if (!decoded || !decoded.uid) {
            res.status(401).json({ ok: false, error: 'Invalid token' });
            return;
        }
        const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn: SESSION_COOKIE_MAX_AGE_MS });
        const maxAgeSec = Math.floor(SESSION_COOKIE_MAX_AGE_MS / 1000);
        const forwarded = req.get('x-forwarded-proto');
        const useSecure = forwarded === 'https' || (req.secure === true);
        const cookieLine = `${COOKIE_NAME}=${sessionCookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${useSecure ? '; Secure' : ''}`;
        res.setHeader('Set-Cookie', cookieLine);
        res.status(200).json({ ok: true });
    } catch (e) {
        console.error('session-login error', e);
        res.status(401).json({ ok: false, error: 'Session login failed' });
    }
});

app.post('/api/auth/session-logout', async (req, res) => {
    try {
        const cookieVal = getCookie(req, COOKIE_NAME);
        if (cookieVal) {
            try {
                const decoded = await admin.auth().verifySessionCookie(cookieVal, true);
                await admin.auth().revokeRefreshTokens(decoded.sub);
            } catch (e) {
                console.warn('session-logout revoke skipped', e.message);
            }
        }
        const forwarded = req.get('x-forwarded-proto');
        const useSecure = forwarded === 'https' || (req.secure === true);
        const clearLine = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${useSecure ? '; Secure' : ''}`;
        res.setHeader('Set-Cookie', clearLine);
        res.status(200).json({ ok: true });
    } catch (e) {
        console.error('session-logout error', e);
        res.status(500).json({ ok: false });
    }
});

app.get('/api/auth/session-verify', async (req, res) => {
    try {
        const cookieVal = getCookie(req, COOKIE_NAME);
        if (!cookieVal) {
            res.status(401).json({ ok: false });
            return;
        }
        const decoded = await admin.auth().verifySessionCookie(cookieVal, true);
        const registrationId = await resolveProviderRegistrationId(decoded.uid);
        if (!registrationId) {
            res.status(401).json({ ok: false, error: 'No provider registration' });
            return;
        }
        res.status(200).json({ ok: true, registrationId: registrationId, firebaseUid: decoded.uid });
    } catch (e) {
        res.status(401).json({ ok: false });
    }
});

exports.authApi = onRequest(
    {
        region: 'us-central1',
        invoker: 'public'
    },
    app
);
