# Fix Firebase "requests-from-referer-are-blocked" Error

## Problem
You're getting this error when trying to log in:
```
Firebase: Error (auth/requests-from-referer-http://localhost:8000-are-blocked.)
```

This happens even though `localhost` is already in the authorized domains list.

## Troubleshooting Steps (if localhost is already authorized)

### Step 1: Clear Browser Cache
1. **Chrome/Edge**: Press `Ctrl+Shift+Delete` → Select "Cached images and files" → Clear
2. **Or use Incognito/Private mode**: `Ctrl+Shift+N` (Chrome) or `Ctrl+Shift+P` (Firefox)
3. Try logging in again in the cleared/incognito browser

### Step 2: Check API Key Restrictions
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **careluva-5635e**
3. Go to **Project Settings** (gear icon) → **General** tab
4. Scroll to **Your apps** section
5. Find your Web app and click on it
6. Check the **API Key** restrictions
7. If there are HTTP referrer restrictions, make sure `localhost:8000` or `localhost:*` is allowed
8. Or temporarily remove restrictions to test

### Step 3: Verify Authorized Domains Format
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Make sure `localhost` appears exactly as `localhost` (not `localhost:8000`)
3. If it's not there, add it
4. Wait 1-2 minutes for changes to propagate

### Step 4: Try Different Port
Sometimes Firebase has issues with specific ports. Try:
- `http://localhost:8080/admin-panel.html` (if you have a server on 8080)
- `http://localhost:3000/admin-panel.html` (if you have a server on 3000)
- Or use `http://127.0.0.1:8000/admin-panel.html` instead

### Step 5: Check Browser Console
1. Open browser DevTools (`F12`)
2. Go to **Console** tab
3. Look for any additional error messages
4. Check the **Network** tab for failed requests

### Step 6: Verify Firebase Config
Make sure `firebase-config.js` has the correct `authDomain`:
```javascript
authDomain: "careluva-5635e.firebaseapp.com"
```

### Step 7: Try Different Browser
Test in a different browser to rule out browser-specific issues:
- Chrome
- Firefox
- Edge

### Step 8: Check Firebase SDK Version
The current version is `12.3.0`. If issues persist, you might need to:
- Update to the latest version
- Or try a slightly older stable version

## Common Solutions
1. **Clear browser cache** - Most common fix
2. **Use incognito mode** - Rules out cache/cookie issues
3. **Wait 2-3 minutes** - Firebase changes can take time to propagate
4. **Check API key restrictions** - Make sure localhost is allowed
5. **Try 127.0.0.1 instead of localhost** - Sometimes works when localhost doesn't

## Still Not Working?
If none of the above work, try:
1. Remove `localhost` from authorized domains
2. Wait 1 minute
3. Add `localhost` back
4. Wait 2 minutes
5. Clear browser cache
6. Try again

