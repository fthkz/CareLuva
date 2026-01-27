# 📋 Password Reset & Registration Improvements - Implementation Plan

## Overview
This document outlines the plan for three improvements to the authentication and registration system.

**⚠️ IMPORTANT UPDATE**: The authentication system has been changed to **Firestore-only** (no Firebase Auth accounts for providers). This document has been updated to reflect the current implementation.

## 🔄 Implementation Status Summary

### ✅ Completed
- **Password Hashing**: PBKDF2-SHA256 with 100,000 iterations
- **Session Management**: Improved with expiry (24h/7d) and validation
- **Password Reset**: Firestore token-based system (1-hour expiry)
- **Password Security**: Passwords hashed before storage, never in sessions

### 🔄 In Progress
- **Password Reset Page**: Needs dedicated page (currently modal-based)
- **Email Service Integration**: Reset links shown in modal (needs email sending)

### ⏸️ On Hold
- **Activation Email**: Requires email service setup
- **Email Finder Removal**: Pending implementation

### 📋 Key Changes from Original Plan
1. **No Firebase Auth**: Providers are Firestore-only (no Auth accounts created)
2. **Password Hashing**: Implemented (not in original plan)
3. **Session Management**: Implemented (not in original plan)
4. **Token-Based Reset**: Uses Firestore tokens (not Firebase Auth reset emails)

---

## 1. ⏸️ Activation Email Upon Registration (ON HOLD)

### Current State
- ✅ Registration saves to Firestore `providerRegistrations` collection
- ✅ Passwords are **hashed** before storage (PBKDF2-SHA256)
- ❌ No email is sent upon registration
- ❌ No account activation step exists
- ⚠️ **Providers are Firestore-only** (no Firebase Auth accounts created)

### Current Implementation Notes
- **Authentication**: Firestore-based only (no Firebase Auth)
- **Password Security**: Passwords are hashed using Web Crypto API (PBKDF2)
- **Session Management**: Improved session management with expiry (24h/7d)

### Proposed Changes (Future)

#### Step 1.1: Update Registration Flow
**File**: `complete-registration.html`
- After successful Firestore save (line ~954)
- Before redirecting to dashboard
- Send activation/verification email via email service (NOT Firebase Auth)
- Store activation token in Firestore

#### Step 1.2: Email Verification Process
**Implementation Options**:
- **Option A**: Custom activation email via EmailJS, SendGrid, or Cloud Functions
  - Generate activation token
  - Store token in Firestore with expiry
  - Send email with activation link
  - User clicks link to verify email
  - Update `emailVerified` status in Firestore
  
- **Option B**: Use third-party email service API
  - More control over email content
  - Can include custom activation link
  - Requires email service setup

**Recommended**: Option A (Custom implementation with email service)

#### Step 1.3: Registration Flow Changes
**Current Flow**:
```
Registration Form → Hash Password → Save to Firestore → Redirect to Dashboard
```

**Proposed Flow**:
```
Registration Form → Hash Password → Save to Firestore → 
Generate Activation Token → Send Activation Email → 
Show "Check Your Email" Screen → 
User Clicks Activation Link → Verify Token → 
Update emailVerified in Firestore → Redirect to Dashboard
```

#### Step 1.4: Files to Modify
1. **complete-registration.html**
   - Function: `saveRegistrationToFirebase()` (around line 920)
   - After Firestore save, add:
     - Generate activation token
     - Store token in Firestore with expiry
     - Send activation email via email service
     - Show "Check Your Email" screen instead of immediate redirect
     - **Note**: Do NOT create Firebase Auth account (providers are Firestore-only)

2. **provider-registration.html**
   - Similar changes to registration flow
   - Ensure consistency across registration pages

3. **provider-dashboard.html**
   - Add check for email verification status from Firestore
   - Show warning/reminder if email not verified
   - Block certain features until verified (optional)

#### Step 1.5: New Screen/Component
**File**: Create `email-verification-pending.html` or add to existing page
- Display message: "Please check your email to activate your account"
- Show email address used
- "Resend verification email" button
- "Change email" option (if needed)
- Link to login page

#### Step 1.6: Security Rules Update
**File**: `firestore.rules`
- May need to allow users to update their own `emailVerified` status
- Or handle verification status in Firebase Auth only

#### Step 1.7: Email Template (if using custom)
- Design activation email template
- Include activation link
- Include clinic name and registration details
- Branding consistent with CareLuva

---

## 2. 🗑️ Remove "Can't Remember My Email" Link and Code

### Current State
- Link exists in `provider-auth.html` (line ~400)
- Function: `showFindEmailModal()` (around line 820)
- Checks localStorage for stored emails

### Proposed Changes

#### Step 2.1: Remove UI Elements
**File**: `provider-auth.html`
- Remove the "Can't remember your email?" link (line ~400)
- Remove associated styling if any

#### Step 2.2: Remove JavaScript Functions
**File**: `provider-auth.html`
- Remove `showFindEmailModal()` function (entire function, ~50-100 lines)
- Remove event listener for the link in `DOMContentLoaded` handler
- Clean up any related helper functions

#### Step 2.3: Remove from Documentation
**Files**:
- `PASSWORD-RECOVERY.md` - Remove references to email finder
- `PASSWORD-RESET-TROUBLESHOOTING.md` - Remove email finder mentions
- Update any guides that reference this feature

#### Step 2.4: Verification
- Search codebase for any other references to "find email" or "remember email"
- Remove all occurrences
- Test that login page still works without the link

---

## 3. 🔄 Forgot Password Navigation to Separate Screen

### Current State
- "Forgot Password?" link triggers `handleForgotPassword()` function
- Function shows pop-up/modal with email input
- Password reset happens in modal

### Proposed Changes

#### Step 3.1: Create New Password Reset Page
**File**: Create `password-reset.html`
- Dedicated page for password reset
- Clean, focused UI
- Email input field
- Submit button
- Link back to login page
- Instructions/help text

#### Step 3.2: Update Navigation
**File**: `provider-auth.html`
- Change "Forgot Password?" link from `onclick` handler to:
  - `href="password-reset.html"` (simple navigation)
  - Or `onclick="window.location.href='password-reset.html'"`

#### Step 3.3: Move Password Reset Logic
**File**: `password-reset.html` (new file)
- Move `handleForgotPassword()` logic to new page
- Move `sendPasswordResetEmail()` function
- Update to work as page-level functions (not modal-based)
- Add form submission handler
- Add success/error message display (inline, not modal)

#### Step 3.4: Update Password Reset Flow
**Current Flow**:
```
Click "Forgot Password?" → Modal opens → Enter email → Reset email sent → Modal shows success
```

**New Flow**:
```
Click "Forgot Password?" → Navigate to password-reset.html → 
Enter email → Submit → Reset email sent → Show success message on page → 
Option to go back to login
```

#### Step 3.5: Remove Modal Code
**File**: `provider-auth.html`
- Remove `handleForgotPassword()` function
- Remove `sendPasswordResetEmail()` function (move to new page)
- Remove any modal-related code for password reset
- Keep only the navigation link

#### Step 3.6: New Page Structure
**File**: `password-reset.html`
```
- Header with CareLuva branding
- Title: "Reset Your Password"
- Form:
  - Email input field
  - Submit button
  - "Back to Login" link
- Success message area (inline)
- Error message area (inline)
- Help text/instructions
- Footer with support contact (optional)
```

#### Step 3.7: Success/Error Handling
- After successful reset request:
  - Show success message on page
  - Display email address
  - Show instructions (check inbox, spam folder)
  - "Back to Login" button
  - "Resend Email" option (optional)

- On error:
  - Show error message inline
  - Keep form visible for retry
  - Show helpful error messages

#### Step 3.8: Current Password Reset Implementation
**Current State** (Already Implemented):
- ✅ Password reset uses **Firestore token-based system** (NOT Firebase Auth)
- ✅ System checks Firestore `providerRegistrations` collection
- ✅ Generates secure reset token (crypto.getRandomValues)
- ✅ Stores token in Firestore with 1-hour expiry
- ✅ Passwords are **hashed** before storage (PBKDF2-SHA256)
- ⚠️ Reset link is shown in modal (needs to move to dedicated page)
- ⚠️ Email service integration pending (currently shows link in modal)

**What Needs to Change**:
- Move password reset logic from modal to dedicated `password-reset.html` page
- Integrate email service to send reset links (currently shows in modal)
- Remove modal-based password reset code

---

## Implementation Order

### Phase 1: Remove Email Finder (Simplest)
1. Remove "Can't remember my email?" link
2. Remove `showFindEmailModal()` function
3. Remove event listeners
4. Update documentation
5. Test login page

### Phase 2: Password Reset Page (Medium)
1. Create `password-reset.html`
2. Move password reset logic from `provider-auth.html`
3. Update "Forgot Password?" link to navigate to new page
4. Test password reset flow
5. Update documentation

### Phase 3: Activation Email (Most Complex - ON HOLD)
1. **Note**: Do NOT create Firebase Auth accounts (providers are Firestore-only)
2. Set up email service (EmailJS, SendGrid, or Cloud Functions)
3. Generate activation token and store in Firestore
4. Send activation email via email service
5. Create "Check Your Email" screen
6. Create activation verification handler
7. Update dashboard to check verification status from Firestore
8. Test full registration → verification → login flow
9. Update documentation

---

## Files to Create

1. **password-reset.html** (new)
   - Dedicated password reset page
   - Form, validation, success/error handling

2. **email-verification-pending.html** (new, optional)
   - Or add to existing registration completion page
   - Shows "Check your email" message
   - Resend verification option

## Files to Modify

1. **provider-auth.html**
   - Remove email finder link and code
   - Update "Forgot Password?" to navigate to new page
   - Remove password reset modal code

2. **complete-registration.html**
   - Add Firebase Auth account creation
   - Add email verification sending
   - Update redirect flow

3. **provider-registration.html**
   - Similar changes to complete-registration.html

4. **provider-dashboard.html**
   - Add email verification status check
   - Show verification reminder if needed

5. **firestore.rules** (if needed)
   - Update rules for email verification status

6. **PASSWORD-RECOVERY.md**
   - Update to reflect new password reset page
   - Remove email finder references

7. **PASSWORD-RESET-TROUBLESHOOTING.md**
   - Update troubleshooting steps
   - Remove email finder references

---

## Testing Checklist

### Phase 1: Email Finder Removal
- [ ] Link removed from login page
- [ ] No JavaScript errors in console
- [ ] Login page functions normally
- [ ] No broken references

### Phase 2: Password Reset Page
- [ ] New page loads correctly
- [ ] Email input and submit work
- [ ] Success message displays correctly
- [ ] Error handling works
- [ ] Navigation back to login works
- [ ] Account creation from Firestore works
- [ ] Reset email is received

### Phase 3: Activation Email
- [ ] Registration creates Firebase Auth account
- [ ] Verification email is sent
- [ ] "Check Your Email" screen displays
- [ ] Email verification link works
- [ ] Dashboard shows verification status
- [ ] Resend verification works (if implemented)

---

## Considerations

### Security
- ✅ Passwords are **hashed** before storage (PBKDF2-SHA256) - **IMPLEMENTED**
- ✅ Passwords never stored in session storage - **IMPLEMENTED**
- ✅ Password reset tokens expire after 1 hour - **IMPLEMENTED**
- ⚠️ Email verification prevents unauthorized account creation (pending)
- ⚠️ Email service needed for secure password reset link delivery (pending)

### User Experience
- Clear instructions at each step
- Helpful error messages
- Easy navigation between pages
- Consistent branding

### Edge Cases
- What if user never receives activation email?
- What if user requests multiple password resets?
- What if email address changes?
- What if registration fails partway through?

### Future Enhancements (Not in Scope)
- SMS verification option
- Two-factor authentication
- Password strength requirements
- Account recovery questions

---

## Estimated Complexity

1. **Remove Email Finder**: ⭐ Easy (30 minutes)
   - Simple removal of code
   - Low risk

2. **Password Reset Page**: ⭐⭐ Medium (2-3 hours)
   - New page creation
   - Logic migration
   - Testing required

3. **Activation Email**: ⭐⭐⭐ Complex (4-6 hours)
   - Multiple file changes
   - New flow implementation
   - Email verification handling
   - Testing full flow

---

## Dependencies

- ✅ Firestore is properly configured
- ✅ Password hashing is implemented (Web Crypto API)
- ✅ Session management is implemented
- ⚠️ Email service must be set up (EmailJS, SendGrid, or Cloud Functions)
- ⚠️ Firestore security rules may need updates for activation tokens
- All registration forms should be consistent
- **Note**: Firebase Authentication is NOT used for providers (Firestore-only)

---

## ✅ Recently Completed (Not in Original Plan)

### Password Hashing
- ✅ Implemented PBKDF2-SHA256 password hashing
- ✅ Passwords hashed before storage in Firestore
- ✅ Supports migration (verifies both hashed and plain text)
- ✅ Password reset hashes new passwords

### Session Management
- ✅ Improved session management with expiry
- ✅ Regular sessions: 24 hours
- ✅ "Remember Me" sessions: 7 days
- ✅ Automatic session validation
- ✅ Session refresh on activity

### Password Reset (Partially Complete)
- ✅ Firestore token-based password reset
- ✅ Secure token generation
- ✅ Token expiry (1 hour)
- ✅ Password hashing on reset
- ⚠️ Still uses modal (needs dedicated page)
- ⚠️ Email service not integrated (shows link in modal)

---

**Status**: 
- Phase 1: ⏸️ On Hold (Email Finder removal - pending)
- Phase 2: 🔄 In Progress (Password Reset Page - needs email service)
- Phase 3: ⏸️ On Hold (Activation Email - needs email service setup)

**Last Updated**: Updated to reflect Firestore-only authentication and password hashing implementation

