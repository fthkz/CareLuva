# Fix API Key Restrictions for Admin Login

## Problem
Getting 403 Forbidden error:
```
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAbSxm6yDqa25lxOuynlZV7icrcb_Os27A 403 (Forbidden)
Firebase: Error (auth/requests-from-referer-http://localhost:8000-are-blocked.)
```

## Root Cause
Your Firebase API key has **HTTP referrer restrictions** that are blocking requests from `http://localhost:8000`.

## Solution: Update API Key Restrictions

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/apis/credentials?project=careluva-5635e
2. Or navigate manually:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select project: **careluva-5635e**
   - Go to **APIs & Services** → **Credentials**

### Step 2: Find Your API Key
1. Look for the API key: `AIzaSyAbSxm6yDqa25lxOuynlZV7icrcb_Os27A`
2. Click on it to edit

### Step 3: Update Application Restrictions
1. Under **Application restrictions**, you'll see one of these:
   - **None** (no restrictions) - This should work, but check anyway
   - **HTTP referrers (web sites)** - This is likely your issue
   - **IP addresses** - Less common for web apps

2. If set to **HTTP referrers (web sites)**:
   - Click **Add an item**
   - Add these referrers (one per line):
     ```
     http://localhost:8000/*
     http://127.0.0.1:8000/*
     http://localhost:8080/*
     http://127.0.0.1:8080/*
     http://localhost:3000/*
     http://127.0.0.1:3000/*
     ```
   - **Important**: Use `/*` at the end (not just `/`)
   - Click **Save**

3. **Temporary Test** (NOT for production):
   - Set to **None** to test if this fixes the issue
   - If it works, then add the referrers back properly

### Step 4: Wait and Test
1. Wait 1-2 minutes for changes to propagate
2. Clear browser cache or use incognito mode
3. Try logging in again at `http://localhost:8000/admin-panel.html`

## Alternative: Check if Multiple API Keys Exist

Sometimes Firebase projects have multiple API keys. Check:

1. In Google Cloud Console → **APIs & Services** → **Credentials**
2. Look for all API keys (they all start with `AIza...`)
3. Check restrictions on each one
4. Make sure the one used in `firebase-config.js` has the correct restrictions

## Verify API Key in Code

Your `firebase-config.js` uses:
```javascript
apiKey: "AIzaSyAbSxm6yDqa25lxOuynlZV7icrcb_Os27A"
```

Make sure this exact key has the restrictions updated.

## Quick Test After Fix

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try logging in
4. Look for the request to `identitytoolkit.googleapis.com`
5. Check if it returns **200 OK** instead of **403 Forbidden**

## Still Not Working?

If you've updated the restrictions and it still doesn't work:

1. **Wait longer** - Changes can take up to 5 minutes
2. **Check for typos** - Make sure referrers are exactly:
   - `http://localhost:8000/*` (with `/*` at the end)
   - Not `http://localhost:8000/` (missing `*`)
3. **Try 127.0.0.1** - Use `http://127.0.0.1:8000/admin-panel.html` instead
4. **Check browser console** - Look for any other errors
5. **Verify admin user exists** - Make sure the admin user exists in Firebase Authentication (not just Firestore)

