# Appointment Authentication Guide

## Understanding Appointment Creation Requirements

### Firestore Rules for Appointments

Looking at `firestore.rules` lines 110-116:

```javascript
allow create: if isAuthenticated() &&
               request.resource.data.keys().hasAll(['providerId', 'patientId']) &&
               (request.resource.data.patientId == request.auth.uid || 
                request.resource.data.providerId == request.auth.uid);
```

### What This Means

To create an appointment, you need:

1. **Firebase Authentication** (not just Firestore session)
   - `isAuthenticated()` checks `request.auth != null`
   - This requires a Firebase Auth account, not just a Firestore session

2. **UID Match Requirement**
   - The authenticated user's UID (`request.auth.uid`) must match:
     - Either `patientId` in the appointment (if you're a patient)
     - Or `providerId` in the appointment (if you're a provider)

## Important Note: Authentication Mismatch

⚠️ **CareLuva uses Firestore-only authentication** (sessions stored in localStorage/sessionStorage), but the appointment rules require **Firebase Auth** (`request.auth.uid`).

This means:
- **Provider/Patient login** uses Firestore sessions (not Firebase Auth)
- **Appointment creation** requires Firebase Auth (not Firestore sessions)
- These are **two different authentication systems**

## Solutions for Testing Appointments

### Option 1: Use Firebase Auth (Recommended for Testing)

1. **Create a Firebase Auth account** (separate from Firestore registration):
   - Go to Firebase Console → Authentication
   - Add a test user manually, OR
   - Use Google Sign-In if implemented

2. **Login with Firebase Auth** in your test page:
   ```javascript
   import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
   await signInWithEmailAndPassword(auth, 'test@example.com', 'password');
   ```

3. **Generate appointments with matching UIDs**:
   - Use the Firebase Auth UID as `patientId` or `providerId`
   - Then save to Firestore

### Option 2: Update Test Data Generator to Use Firebase Auth

The test data generator could:
1. Check if user is authenticated with Firebase Auth
2. Use `request.auth.uid` as the patientId/providerId
3. Generate appointments with matching UIDs

### Option 3: Use Test Collection (For Testing Only)

For pure testing without authentication:
- Generate appointment data
- Save to `test` collection (which allows unauthenticated writes)
- This won't test the real appointment flow, but allows data generation

### Option 4: Update Firestore Rules (Development Only)

Temporarily allow unauthenticated appointment creation for testing:

```javascript
// TEMPORARY - DEVELOPMENT ONLY
allow create: if true; // Allow anyone to create (for testing)
```

**⚠️ WARNING**: Never deploy this to production!

## Current System Architecture

### Provider Authentication
- **Storage**: Firestore `providerRegistrations` collection
- **Session**: localStorage/sessionStorage (via `auth-utils.js`)
- **UID**: Document ID from `providerRegistrations`
- **Firebase Auth**: Not used (Firestore-only)

### Patient Authentication
- **Storage**: Firestore `patientUsers` collection
- **Session**: localStorage/sessionStorage (via `auth-utils.js`)
- **UID**: Document ID from `patientUsers`
- **Firebase Auth**: Not used (Firestore-only)

### Appointment Requirements
- **Requires**: Firebase Auth (`request.auth.uid`)
- **Mismatch**: App uses Firestore-only auth
- **Result**: Appointments can't be created with current auth system

## Recommended Approach for Testing

### For Test Data Generator:

1. **Generate appointment data** (works - no auth needed)
2. **Show warning** that saving requires Firebase Auth
3. **Provide option** to:
   - Copy JSON for manual use
   - Save to test collection (for testing structure)
   - Use with authenticated Firebase Auth user

### For Real Appointments:

The application needs to either:
1. **Use Firebase Auth** for appointment creation, OR
2. **Update Firestore rules** to allow Firestore-only auth users to create appointments

## Quick Test: Check Your Auth Status

Run this in browser console on the test data generator page:

```javascript
// Check Firebase Auth
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
const auth = getAuth();
console.log('Firebase Auth User:', auth.currentUser);
console.log('Firebase Auth UID:', auth.currentUser?.uid);

// Check Firestore Session
console.log('Provider Session:', window.authUtils?.getSession());
console.log('Patient Session:', sessionStorage.getItem('patientSession'));
```

## Summary

**To save appointments, you need:**
- ✅ Firebase Auth account (not just Firestore session)
- ✅ UID matching patientId or providerId in appointment data
- ✅ Currently, CareLuva uses Firestore-only auth, so appointments can't be saved

**For testing:**
- ✅ Generate appointment data (works)
- ✅ Copy JSON for manual testing
- ✅ Use test collection for structure testing
- ⚠️ Saving to `appointments` collection requires Firebase Auth

---

**Note**: This is a known architecture mismatch that should be addressed in the application design.

