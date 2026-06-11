# Fix Admin Login "requests-from-referer-are-blocked" Error

## Problem
Admin login fails with:
```
Firebase: Error (auth/requests-from-referer-http://localhost:8000-are-blocked.)
```

But provider/patient login works fine.

## Root Cause
- **Admin login** uses **Firebase Auth** (`signInWithEmailAndPassword`) - requires referer authorization
- **Provider/Patient login** uses **Firestore-based auth** (queries Firestore directly) - no referer check

## Solution: Check API Key Restrictions

The issue is likely with **API Key HTTP referrer restrictions**, not authorized domains.

### Step 1: Check API Key Restrictions
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **careluva-5635e**
3. Go to **Project Settings** (gear icon) → **General** tab
4. Scroll to **Your apps** section
5. Find your **Web app** (should show your app ID)
6. Click on the **API Key** link (or go to [Google Cloud Console](https://console.cloud.google.com/))
7. In Google Cloud Console:
   - Go to **APIs & Services** → **Credentials**
   - Find your Firebase API key (starts with `AIza...`)
   - Click on it to edit
   - Check **Application restrictions**
   - If set to **HTTP referrers (web sites)**, you need to add:
     - `http://localhost:8000/*`
     - `http://127.0.0.1:8000/*`
     - `http://localhost:8080/*` (if using port 8080)
     - `http://localhost:3000/*` (if using port 3000)
   - Or temporarily set to **None** to test (NOT recommended for production)

### Step 2: Verify Admin User Exists in Firebase Auth
The admin user must exist in **Firebase Authentication**, not just in Firestore `admins` collection.

1. Go to Firebase Console → **Authentication** → **Users**
2. Check if your admin email exists there
3. If not, you need to create the user:
   - Option A: Create via Firebase Console
     - Go to **Authentication** → **Users** → **Add user**
     - Enter admin email and password
     - Copy the **UID**
   - Option B: Use Firebase CLI
     ```bash
     firebase auth:import users.json
     ```
   - Option C: Register via your app first, then add to `admins` collection

### Step 3: Verify Admin Document in Firestore
1. Go to Firebase Console → **Firestore Database**
2. Check `admins` collection
3. Verify there's a document with:
   - **Document ID** = User's UID (from Firebase Auth)
   - Fields: `email`, `name`, `role: "admin"`, etc.

### Step 4: Test
1. Clear browser cache
2. Try logging in again at `http://localhost:8000/admin-panel.html`
3. If still fails, check browser console (F12) for detailed error

## Alternative: Use Firestore-Based Auth for Admin (Like Provider Login)

If you want to avoid Firebase Auth entirely, you could modify admin login to use Firestore-based authentication like provider login does. However, this is less secure and not recommended.

## Quick Test: Check if Admin User Exists in Firebase Auth

Run this in browser console on admin-panel.html:
```javascript
// Check if user exists in Firebase Auth
const { getAuth, fetchSignInMethodsForEmail } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
const auth = window.firebase.auth;
const email = 'your-admin-email@example.com';
const methods = await fetchSignInMethodsForEmail(auth, email);
console.log('Sign-in methods for', email, ':', methods);
// If empty array [], user doesn't exist in Firebase Auth
```

## Most Likely Fix

**Check API Key HTTP referrer restrictions** - this is the most common cause when localhost is already in authorized domains but Firebase Auth still blocks requests.

