# 🔒 Firestore Security Rules Setup Guide

## ⚠️ Critical Security Issue Resolved

Your Firestore database was locked down by Firebase after being left in Test Mode (completely open) for 30+ days. This guide will help you deploy proper security rules to restore access.

## 📋 What Happened

- **Test Mode**: Your database was left completely open to the Internet
- **Auto-Lockdown**: Firebase automatically locked it after 30 days for security
- **Current Status**: All client requests are being denied until security rules are deployed

## 🚀 Quick Fix Steps

### 1. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase in Your Project (if not done)

```bash
firebase init firestore
```

When prompted:
- Select your existing project: `careluva-5635e`
- Use existing `firestore.rules` file: **Yes**
- Use existing `firestore.indexes.json` file: **Yes**

### 4. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

This will deploy the security rules and restore access to your database.

## 📁 Files Created

1. **`firestore.rules`** - Security rules for your Firestore database
2. **`firebase.json`** - Firebase project configuration
3. **`firestore.indexes.json`** - Firestore index configuration (empty for now)

## 🔐 Security Rules Overview

The rules implement the following security model:

### Public Access
- ✅ **providerRegistrations**: Anyone can create (registration submissions), only admins can read/update/delete
- ✅ **reviews**: Anyone can read, authenticated users can create

### Authenticated Users
- ✅ **providers**: Users can read/write their own provider data
- ✅ **appointments**: Users can manage appointments where they are the patient or provider
- ✅ **reviews**: Users can update/delete their own reviews

### Admin Only
- ✅ **providerRegistrations**: Full admin access
- ✅ **admins**: Admin user management
- ✅ **emailNotifications**: Admin read access

### Blocked
- ❌ **test**: All access denied (remove this collection in production)

## 🧪 Testing Your Rules

After deploying, test your application:

1. **Public Registration**: Should work (anyone can submit)
2. **User Login**: Should work (authenticated users can access their data)
3. **Admin Panel**: Should work (admins can access admin collections)

## ⚠️ Important Notes

### Admin Setup
To create the first admin user, you have two options:

**Option 1: Using Firebase Console**
1. Go to Firebase Console → Firestore Database
2. Manually create a document in the `admins` collection
3. Document ID should be the user's UID (from Authentication)
4. Add fields: `email`, `role: "admin"`, `createdAt`

**Option 2: Using Cloud Functions** (Recommended for production)
- Create a Cloud Function to initialize admin users
- This is more secure and scalable

### Test Collection
The `test` collection is currently blocked. If you need it for development:
1. Remove the test collection rules, OR
2. Add a condition to allow access only in development environment

### Review Collection
The rules assume reviews have a `reviewerId` field. If your reviews don't have this:
- Add `reviewerId: request.auth.uid` when creating reviews, OR
- Modify the rules to use a different field for ownership

## 🔄 Updating Rules

After making changes to `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

## 📊 Monitoring

After deployment, monitor your Firebase Console:
1. **Firestore Database** → **Usage** tab
2. Check for any permission denied errors
3. Review security rules in the **Rules** tab

## 🆘 Troubleshooting

### "Permission Denied" Errors

1. **Check Authentication**: Ensure users are properly authenticated
2. **Check Admin Status**: Verify admin users exist in the `admins` collection
3. **Review Rules**: Use Firebase Console → Firestore → Rules → Simulator to test rules

### Rules Not Deploying

1. **Check Firebase CLI**: `firebase --version`
2. **Check Login**: `firebase login:list`
3. **Check Project**: `firebase projects:list`
4. **Set Project**: `firebase use careluva-5635e`

### Still Locked After Deployment

- Rules may take a few minutes to propagate
- Check Firebase Console → Firestore → Rules to verify deployment
- Clear browser cache and try again

## 📚 Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Security Rules Best Practices](https://firebase.google.com/docs/firestore/security/rules-conditions)

## ✅ Next Steps

1. ✅ Deploy the security rules
2. ✅ Test your application
3. ✅ Fix permission errors (email duplicate checks, authentication)
4. ✅ Monitor for any permission errors
5. ✅ Set up admin users (see `ADMIN-SETUP.md`)
6. ✅ Test admin panel features (login, registrations, reviews)
7. ✅ Remove or secure the `test` collection (blocked in security rules)
8. ✅ Implement Patient Management feature
9. ✅ Implement Analytics & Reports feature
10. ✅ Complete Verification Workflow implementation
11. ⏳ Consider setting up Cloud Functions for admin management

---

**Status**: Rules created and ready to deploy
**Last Updated**: Rules configured for CareLuva project structure

