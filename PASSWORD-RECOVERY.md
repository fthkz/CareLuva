# 🔑 Password Recovery Guide

## Important: Passwords Cannot Be Retrieved

**Passwords are securely hashed and cannot be viewed or retrieved.** This is a security feature to protect your account.

## ✅ How to Reset Your Password

### Method 1: Use Password Reset (Recommended)

1. Go to `provider-auth.html`
2. Enter your email address (or use "Can't remember your email?" to find it)
3. Click **"Forgot Password?"**
4. Check your email inbox for the password reset link
5. Click the link in the email to set a new password

### Method 2: Find Your Email First

If you can't remember which email you used:

1. Go to `provider-auth.html`
2. Click **"Can't remember your email?"** link
3. The system will check your browser's storage for registered emails
4. If found, click "Use This Email" to fill it in
5. Then use "Forgot Password?" to reset

## 🔍 Where Your Email Might Be Stored

The system checks:
- **Registration Data** - From when you completed registration
- **Session Data** - From previous logins

## 📧 If You Can't Find Your Email

1. **Check your email inbox** for:
   - Registration confirmation emails
   - Welcome emails from CareLuva
   - Any emails mentioning your clinic registration

2. **Check other devices** where you might have registered

3. **Contact Support** if you registered with a different email or device

## 🛠️ For Administrators

If you need to help a provider who forgot their password:

1. **Check Firestore Console**:
   - Go to Firebase Console → Firestore Database
   - Collection: `providerRegistrations`
   - Find the provider's registration document
   - Check the `email` field

2. **Use Password Reset**:
   - Have the provider use the "Forgot Password?" feature
   - Or use Firebase Console → Authentication → Users
   - Find the user and click "Reset Password"

3. **Cannot View Passwords**:
   - Passwords are hashed and cannot be viewed
   - Only password reset is possible

## 🔐 Security Notes

- Passwords are never stored in plain text
- Passwords are hashed using Firebase Authentication
- Only password reset is possible, not password retrieval
- This is a security best practice

## 📝 Quick Steps

1. **Forgot Password?**
   - Enter email → Click "Forgot Password?" → Check email → Reset

2. **Forgot Email?**
   - Click "Can't remember your email?" → Use found email → Reset password

3. **Still Stuck?**
   - Check email inbox for registration emails
   - Contact support with your clinic name

---

**Note**: The password reset feature uses Firebase Authentication's built-in password reset system, which sends a secure reset link to your email.

