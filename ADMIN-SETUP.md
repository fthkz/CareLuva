# 👤 Admin User Setup Guide

## Overview

Admin users are required to:
- Review and approve provider registrations
- Access the admin panel
- Manage provider accounts
- Moderate reviews

## ⚠️ Important

The security rules prevent creating admin users from the client side. You need to create the first admin user manually through the Firebase Console.

## Method 1: Firebase Console (Recommended for First Admin)

### Step 1: Create a User Account
1. Go to your application and register a user account (or use an existing account)
2. Note the user's email address
3. Go to Firebase Console → Authentication → Users
4. Find the user and copy their **UID** (User ID)

### Step 2: Create Admin Document in Firestore
1. Go to Firebase Console → Firestore Database
2. Click **Start collection** (if `admins` collection doesn't exist)
3. Collection ID: `admins`
4. Click **Add document**
5. **Document ID**: Paste the user's UID from Step 1
6. Add the following fields:

| Field | Type | Value |
|-------|------|-------|
| `uid` | string | (same as document ID) |
| `email` | string | user's email address |
| `name` | string | Admin User (or actual name) |
| `role` | string | admin |
| `permissions` | array | `["view_registrations", "approve_registrations", "reject_registrations", "manage_providers", "moderate_reviews"]` |
| `createdAt` | timestamp | (current date/time) |
| `createdBy` | string | manual_setup |

7. Click **Save**

### Step 3: Verify Admin Access
1. Log in to your application with the admin user's credentials
2. Navigate to the admin panel
3. You should now have full admin access

## Method 2: Using Firebase CLI Script

We've created a helper script that you can run to set up the first admin user.

### Prerequisites
- Firebase CLI installed and logged in
- User account already created in Firebase Authentication

### Steps
1. Get the user's UID from Firebase Console → Authentication → Users
2. Run the setup script (see `setup-admin.js` or use the command below)

```bash
# Using Node.js
node setup-admin.js <USER_UID> <USER_EMAIL>

# Or using Firebase CLI directly
firebase firestore:set admins/<USER_UID> '{"uid":"<USER_UID>","email":"<USER_EMAIL>","role":"admin","name":"Admin User","permissions":["view_registrations","approve_registrations","reject_registrations"],"createdAt":"<TIMESTAMP>","createdBy":"cli_setup"}'
```

## Method 3: Temporary Rule Modification (Development Only)

⚠️ **WARNING**: Only use this in development. Never deploy this to production!

1. Temporarily modify `firestore.rules` line 113:
   ```javascript
   allow create: if true; // TEMPORARY: Allow anyone to create admin (DEV ONLY)
   ```

2. Deploy the modified rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. Use the admin panel to create your first admin user

4. **IMMEDIATELY** revert the rule back to:
   ```javascript
   allow create: if isAdmin() || false;
   ```

5. Redeploy:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Admin Document Structure

```json
{
  "uid": "user-uid-from-authentication",
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "admin",
  "permissions": [
    "view_registrations",
    "approve_registrations",
    "reject_registrations",
    "manage_providers",
    "moderate_reviews"
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "createdBy": "manual_setup"
}
```

## Permissions Reference

- `view_registrations` - View provider registration submissions
- `approve_registrations` - Approve provider registrations
- `reject_registrations` - Reject provider registrations
- `manage_providers` - Manage provider accounts
- `moderate_reviews` - Moderate and manage reviews

## Adding Additional Admins

Once you have at least one admin user, you can:
1. Use the admin panel (if it has admin management features)
2. Manually add through Firebase Console (same as Method 1)
3. Use Cloud Functions for automated admin management

## Troubleshooting

### "Permission Denied" when accessing admin panel
- Verify the user exists in the `admins` collection
- Check that the document ID matches the user's UID exactly
- Ensure the user is logged in with the correct account

### Admin user can't create other admins
- This is expected behavior - only existing admins can create new admins
- Use Firebase Console to add additional admins manually
- Or implement a Cloud Function for admin management

### Can't find user UID
1. Go to Firebase Console → Authentication → Users
2. Find the user by email
3. Click on the user to view details
4. Copy the UID from the user details page

## Security Best Practices

1. **Limit Admin Access**: Only grant admin access to trusted users
2. **Use Strong Passwords**: Ensure admin accounts use strong, unique passwords
3. **Enable 2FA**: Enable two-factor authentication for admin accounts
4. **Audit Logs**: Regularly review admin actions (if logging is implemented)
5. **Regular Review**: Periodically review the `admins` collection and remove unnecessary admins

## Next Steps

After setting up your first admin:
1. ✅ Test admin panel access
2. ✅ Review provider registrations
3. ✅ Test approval/rejection workflows
4. ✅ Set up additional admins if needed

