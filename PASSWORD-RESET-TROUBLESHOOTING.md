# 🔧 Password Reset Email Not Received - Troubleshooting Guide

## Common Reasons & Solutions

### 1. ✅ Check Spam/Junk Folder
- **Most common issue**: Password reset emails often go to spam
- Check your spam/junk folder
- In Gmail, also check the "Promotions" tab
- Mark the email as "Not Spam" if found

### 2. ⏱️ Wait a Few Minutes
- Firebase emails can take 2-5 minutes to arrive
- Sometimes up to 10 minutes during high traffic
- Don't request multiple resets immediately (this can cause delays)

### 3. 📧 Verify Email Address
- Make sure you're using the **exact email** you registered with
- Check for typos (common: .com vs .co, gmail vs gmai)
- Use the "Can't remember your email?" feature to find it

### 4. 🔍 Account Creation from Firestore Registration

**Good News!** The system now automatically creates a Firebase Auth account from your Firestore registration when you request a password reset.

**How it works:**
1. You request password reset with your email
2. System checks Firebase Auth (if account exists, sends reset email)
3. If no Auth account, system checks Firestore `providerRegistrations`
4. If found in Firestore, automatically creates Firebase Auth account
5. Then sends password reset email

**To check your registration:**
1. Go to [Firestore Console](https://console.firebase.google.com/project/careluva-5635e/firestore)
2. Collection: `providerRegistrations`
3. Search for your email address
4. If found: Your account will be created automatically when you request password reset

### 5. 🆕 Account Not in Firebase Auth

If you registered but don't have a Firebase Auth account:

**Option A: Use Google Sign-In**
- Try logging in with Google Sign-In instead
- This creates a Firebase Auth account automatically

**Option B: Contact Support**
- Provide your clinic name and email
- Support can help set up your Firebase Auth account

**Option C: Re-register with Auth**
- Complete registration again, ensuring Firebase Auth account is created
- This happens automatically when using email/password registration

### 6. 🔄 Request Another Reset

If the first email didn't arrive:
1. Wait 5-10 minutes
2. Try requesting another reset
3. Check all email folders again

### 7. 🚫 Too Many Requests

If you see "too many requests" error:
- Wait 15-30 minutes before trying again
- Firebase limits reset requests to prevent abuse

## 🔍 How to Check Your Account Status

### Method 1: Check Browser Console
1. Open provider-auth.html
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Click "Forgot Password?"
5. Look for error messages that indicate account status

### Method 2: Check Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/careluva-5635e)
2. Click **Authentication** → **Users**
3. Search for your email
4. If found: Account exists, email should work
5. If not found: Account needs to be created

### Method 3: Check Firestore Registration
1. Go to [Firestore Console](https://console.firebase.google.com/project/careluva-5635e/firestore)
2. Collection: `providerRegistrations`
3. Search for your email
4. This shows if you registered, but doesn't mean you have Firebase Auth

## 🛠️ Alternative Solutions

### Solution 1: Admin Password Reset
If you're an admin or have admin access:
1. Go to Firebase Console → Authentication → Users
2. Find the user
3. Click the user → Click "Reset Password"
4. This sends a reset email from the console

### Solution 2: Create New Account
If you can't recover the old account:
1. Use a different email address
2. Complete registration again
3. Make sure to use email/password (not just Firestore registration)

### Solution 3: Contact Support
Provide:
- Your clinic name
- Email address used for registration
- Registration date (if known)
- Any error messages you see

## 📋 Quick Checklist

- [ ] Checked spam/junk folder
- [ ] Waited 5-10 minutes
- [ ] Verified email address is correct
- [ ] Checked Firebase Console for account existence
- [ ] Tried requesting reset again
- [ ] Checked browser console for errors
- [ ] Tried Google Sign-In as alternative

## 🔐 Security Note

Firebase password reset emails:
- Are sent from `noreply@firebaseapp.com` or your custom domain
- Contain a secure, time-limited reset link
- Expire after a certain time (usually 1 hour)
- Can only be used once

## 📞 Still Need Help?

If none of these solutions work:
1. Check the browser console for specific error messages
2. Verify your email in Firebase Console
3. Contact support with:
   - Your email address
   - Error messages from console
   - Screenshot of the issue

---

**Last Updated**: Password reset troubleshooting guide

