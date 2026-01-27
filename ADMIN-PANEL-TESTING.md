# 🧪 Admin Panel Testing Guide

## Prerequisites

Before testing the admin panel, ensure you have:

1. ✅ **Admin user set up** (see `ADMIN-SETUP.md`)
   - User account created in Firebase Authentication
   - Admin document created in Firestore `admins` collection
   - Document ID matches the user's UID exactly

2. ✅ **Security rules deployed**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. ✅ **Test data available** (optional but recommended)
   - At least one provider registration in `providerRegistrations` collection
   - This helps test the approval/rejection workflow

## How to Access the Admin Panel

### Method 1: Direct Access (admin-panel.html)

1. Open `admin-panel.html` in your browser
2. You'll see a login form
3. Enter your admin credentials:
   - **Email**: Your admin user's email
   - **Password**: Your admin user's password
4. Click **Login** or press Enter

### Method 2: Through Main Application (index.html)

1. Open `index.html` in your browser
2. Look for an admin panel link/button (if available)
3. Or navigate directly to `admin-panel.html`

### Method 3: Local Server

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000

# Then navigate to:
# http://localhost:8000/admin-panel.html
```

## Testing Checklist

### ✅ 1. Authentication Test

**Test Steps:**
1. Open `admin-panel.html`
2. Try logging in with a **non-admin** user
   - **Expected**: Should show "Access Denied" error
3. Try logging in with **invalid credentials**
   - **Expected**: Should show authentication error
4. Log in with **valid admin credentials**
   - **Expected**: Should successfully authenticate and show admin dashboard

**Success Criteria:**
- ✅ Non-admin users are blocked
- ✅ Invalid credentials are rejected
- ✅ Valid admin credentials grant access
- ✅ Admin name/email is displayed in header

### ✅ 2. Connection Test

**Test Steps:**
1. After logging in, check the status message
2. Click **🧪 Test Connection** button
3. Check browser console for Firebase connection status

**Success Criteria:**
- ✅ Status shows "Firebase connected successfully"
- ✅ No connection errors in console
- ✅ Firebase Console link works

### ✅ 3. View Provider Registrations

**Test Steps:**
1. After login, registrations should auto-load
2. Click **🔄 Refresh Data** button
3. Verify registrations are displayed

**Success Criteria:**
- ✅ Registrations are displayed in cards
- ✅ Each registration shows:
  - Clinic name
  - Status badge (pending/approved/rejected)
  - Provider details (type, contact, email, phone, etc.)
  - Registration date
  - Document ID
- ✅ Empty state shows if no registrations exist

### ✅ 4. Approve Registration

**Test Steps:**
1. Find a registration with status "pending"
2. Click **✅ Approve** button
3. Confirm the action
4. Check if status updates

**Success Criteria:**
- ✅ Status changes to "approved"
- ✅ Success message appears
- ✅ Registration card updates immediately
- ✅ Approve/Reject buttons disappear (only shown for pending)
- ✅ Changes persist after page refresh

### ✅ 5. Reject Registration

**Test Steps:**
1. Find a registration with status "pending"
2. Click **❌ Reject** button
3. Confirm the action
4. Check if status updates

**Success Criteria:**
- ✅ Status changes to "rejected"
- ✅ Success message appears
- ✅ Registration card updates immediately
- ✅ Changes persist after page refresh

### ✅ 6. Review Moderation

**Test Steps:**
1. Click **⭐ Review Moderation** button
2. Verify reviews are loaded (if available)
3. Test review moderation features

**Success Criteria:**
- ✅ Reviews are displayed
- ✅ Moderation actions work (if implemented)

### ✅ 7. Logout Test

**Test Steps:**
1. Click **Logout** button in header
2. Verify you're logged out
3. Try accessing admin features again

**Success Criteria:**
- ✅ User is logged out
- ✅ Login form is shown again
- ✅ Cannot access admin features without re-authentication

### ✅ 8. Permission Test

**Test Steps:**
1. Open browser console (F12)
2. Try to manually query `providerRegistrations` collection
3. Verify admin can read the collection

**Success Criteria:**
- ✅ Admin can read `providerRegistrations`
- ✅ Admin can update registration status
- ✅ No permission denied errors

## Expected Behavior

### Successful Login Flow

```
1. User enters credentials → 
2. Firebase Auth authenticates → 
3. System checks admins collection → 
4. Admin document found → 
5. Dashboard loads → 
6. Registrations auto-load
```

### Registration Status Update Flow

```
1. Admin clicks Approve/Reject → 
2. System verifies admin authentication → 
3. Updates Firestore document → 
4. Status badge updates → 
5. Action buttons hide (if status changed from pending)
```

## Common Issues & Solutions

### ❌ "Access Denied: You are not authorized"

**Cause**: User is not in `admins` collection

**Solution**:
1. Verify user exists in Firebase Authentication
2. Check `admins` collection in Firestore
3. Ensure document ID matches user's UID exactly
4. See `ADMIN-SETUP.md` for setup instructions

### ❌ "Firebase not initialized"

**Cause**: Firebase configuration issue

**Solution**:
1. Check `firebase-config.js` exists and is properly configured
2. Verify API keys are correct
3. Check browser console for detailed errors
4. Ensure Firebase project is active

### ❌ "Permission Denied" when loading registrations

**Cause**: Security rules not allowing admin access

**Solution**:
1. Verify security rules are deployed
2. Check that `isAdmin()` function works correctly
3. Ensure admin document exists in `admins` collection
4. Redeploy rules: `firebase deploy --only firestore:rules`

### ❌ No registrations showing

**Cause**: No data in `providerRegistrations` collection

**Solution**:
1. Create a test registration through the registration form
2. Or manually add test data in Firebase Console
3. Verify collection name is exactly `providerRegistrations`

### ❌ Status update not working

**Cause**: Permission or authentication issue

**Solution**:
1. Check browser console for errors
2. Verify admin is still authenticated
3. Check security rules allow admin updates
4. Ensure `currentAdmin` variable is set

## Browser Console Testing

Open browser console (F12) and check for:

### ✅ Good Signs
- `✅ Firebase connected successfully!`
- `✅ Admin authenticated: {email: "...", role: "admin"}`
- `Loaded registrations: [...]`
- `Registration ... updated to approved by ...`

### ❌ Warning Signs
- `PERMISSION_DENIED`
- `Firebase not initialized`
- `Access Denied`
- `Error updating registration status`

## Manual Testing Script

```javascript
// Run in browser console after logging in

// 1. Test admin authentication
console.log('Current admin:', currentAdmin);

// 2. Test Firebase connection
console.log('Firebase ready:', window.firebaseReady);
console.log('Firebase DB:', window.firebase?.db);

// 3. Test loading registrations
loadRegistrations();

// 4. Test connection
testConnection();

// 5. Check admin document
const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
const { getAuth } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
const auth = getAuth();
const user = auth.currentUser;
if (user) {
    const adminDoc = await getDoc(doc(window.firebase.db, 'admins', user.uid));
    console.log('Admin document:', adminDoc.exists() ? adminDoc.data() : 'NOT FOUND');
}
```

## Test Data Setup

To test with sample data, create a test registration:

1. Use the registration form (`complete-registration.html` or `provider-registration.html`)
2. Or manually add in Firebase Console:
   - Collection: `providerRegistrations`
   - Fields:
     ```json
     {
       "clinicName": "Test Clinic",
       "email": "test@example.com",
       "status": "pending",
       "providerType": "Doctor",
       "submittedAt": "2024-01-01T00:00:00.000Z"
     }
     ```

## Performance Testing

1. **Load Time**: Admin panel should load within 2-3 seconds
2. **Registration List**: Should handle 50+ registrations smoothly
3. **Status Updates**: Should complete within 1 second

## Security Testing

1. ✅ **Unauthorized Access**: Non-admin users cannot access
2. ✅ **Session Management**: Logout properly clears session
3. ✅ **Permission Checks**: All operations verify admin status
4. ✅ **Data Validation**: Status updates are validated

## Next Steps After Testing

Once testing is complete:
1. ✅ Document any bugs found
2. ✅ Verify all features work as expected
3. ✅ Test with multiple admin users
4. ✅ Test with real registration data
5. ✅ Set up additional admins if needed

## Quick Test Command

```bash
# Open admin panel in browser
start admin-panel.html

# Or with local server
python -m http.server 8000
# Then navigate to http://localhost:8000/admin-panel.html
```

---

**Need Help?** Check:
- `ADMIN-SETUP.md` for admin user setup
- `MONITORING-PERMISSION-ERRORS.md` for troubleshooting
- Firebase Console for data verification

