# 🔍 Monitoring Permission Errors in Firebase Console

## How to Monitor Permission Errors

### 1. Access Firebase Console
1. Go to: https://console.firebase.google.com/project/careluva-5635e/overview
2. Navigate to **Firestore Database** → **Usage** tab
3. Or go directly to: https://console.firebase.google.com/project/careluva-5635e/firestore/usage

### 2. Check Real-time Metrics
- **Reads**: Monitor read operations and permission denials
- **Writes**: Monitor write operations and permission denials
- **Deletes**: Monitor delete operations and permission denials

### 3. View Logs
1. Go to **Firebase Console** → **Firestore Database** → **Usage** tab
2. Look for **Permission Denied** errors in the metrics
3. Check the **Logs** section for detailed error messages

### 4. Use Rules Simulator
1. Go to **Firestore Database** → **Rules** tab
2. Click **Rules Playground** or **Simulator**
3. Test your rules with different scenarios:
   - Unauthenticated user creating `providerRegistrations`
   - Authenticated user reading their own `providers` document
   - Admin user reading `providerRegistrations`

### 5. Browser Console Monitoring
Open your browser's Developer Console (F12) and look for:
- `PERMISSION_DENIED` errors
- Firebase error messages
- Failed Firestore operations

## ⚠️ Known Potential Issues

### Issue 1: Email Duplicate Check Query
**Location**: `complete-registration.html` (lines 2018-2022)

**Problem**: The code queries `providerRegistrations` to check for existing emails, but security rules only allow admins to read this collection.

```javascript
// This will fail for unauthenticated users
const emailQuery = window.firebase.query(registrationsRef, window.firebase.where('email', '==', email));
const querySnapshot = await window.firebase.getDocs(emailQuery);
```

**Security Rule**:
```javascript
// Only admins can read all registrations
allow read: if isAdmin();
```

**Solution Options**:
1. **Remove the duplicate check** (simplest) - Let the backend handle duplicates
2. **Use Firebase Auth** - Check `fetchSignInMethodsForEmail()` instead (already implemented as fallback)
3. **Create a Cloud Function** - Handle duplicate checking server-side
4. **Modify rules** - Allow users to query only their own email (requires authentication)

**Current Behavior**: The code catches the error and allows registration to proceed (line 2049), which is acceptable but the query will fail silently.

### Issue 2: Provider Registration Creation
**Status**: ✅ Should work correctly

The `addDoc` operation on `providerRegistrations` should work because:
- Security rules allow anyone to create (line 24-26 of firestore.rules)
- Required fields (`email`, `clinicName`) are validated

## 📊 What to Look For

### Common Permission Errors

1. **PERMISSION_DENIED on `providerRegistrations` read**
   - **Cause**: Unauthenticated user trying to query registrations
   - **Location**: Email duplicate check
   - **Impact**: Low (error is caught and handled)

2. **PERMISSION_DENIED on `providers` read/write**
   - **Cause**: User not authenticated or trying to access another user's data
   - **Solution**: Ensure users are logged in before accessing provider dashboard

3. **PERMISSION_DENIED on `appointments`**
   - **Cause**: User trying to access appointments they don't own
   - **Solution**: Verify `patientId` or `providerId` matches `request.auth.uid`

4. **PERMISSION_DENIED on admin operations**
   - **Cause**: User not in `admins` collection
   - **Solution**: Add user to `admins` collection in Firestore

## 🔧 Testing Checklist

- [ ] Test provider registration (unauthenticated user)
- [ ] Test email duplicate check (should fail gracefully)
- [ ] Test provider dashboard access (authenticated user)
- [ ] Test admin panel access (admin user)
- [ ] Test appointment creation (authenticated user)
- [ ] Test review creation (unauthenticated user)
- [ ] Test review reading (unauthenticated user)

## 📈 Monitoring Best Practices

1. **Set up Alerts** (if using Firebase Blaze plan):
   - Go to Firebase Console → Alerts
   - Set up alerts for permission denied errors

2. **Regular Checks**:
   - Check Usage tab daily during development
   - Review error logs weekly
   - Monitor after deploying new features

3. **Error Tracking**:
   - Use Firebase Crashlytics for client-side errors
   - Log permission errors to a monitoring service
   - Track error rates over time

## 🚨 Immediate Actions if Errors Found

1. **Check the specific error** in Firebase Console → Firestore → Usage
2. **Review the security rules** for the affected collection
3. **Test in Rules Simulator** to reproduce the issue
4. **Fix the rule or the code** based on the error
5. **Redeploy rules** if changes were made: `firebase deploy --only firestore:rules`
6. **Test again** to verify the fix

## 📝 Quick Reference

**Firebase Console Links**:
- Overview: https://console.firebase.google.com/project/careluva-5635e/overview
- Firestore Database: https://console.firebase.google.com/project/careluva-5635e/firestore
- Usage Metrics: https://console.firebase.google.com/project/careluva-5635e/firestore/usage
- Rules: https://console.firebase.google.com/project/careluva-5635e/firestore/rules

**Deploy Rules Command**:
```bash
firebase deploy --only firestore:rules
```

