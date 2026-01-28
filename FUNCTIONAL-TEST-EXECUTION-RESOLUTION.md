# ✅ CareLuva Functional Test Suite (Manual / Regression)

This document is the **end-to-end functional regression checklist** for CareLuva. It covers the currently implemented pages and workflows, plus the supporting test utilities in `tests/`.

> This file originally started as a “resolution document” for a few admin bugs. Those historical issue writeups are preserved at the bottom as **Appendix A**.

## Document Information
- **Last Updated**: 2026-01-28
- **Project**: CareLuva
- **Scope**: Patient + Provider + Admin flows, plus testing utilities
- **Goal**: Validate “it works in a real browser with the current Firebase/Firestore rules”

---

## 0) Prerequisites (Do this once)

### Local server
- Start the local server (recommended port 8080):

```powershell
powershell -ExecutionPolicy Bypass -File serve-port-8080.ps1
```

### Firebase config
- Confirm `firebase-config.js` is configured for the intended Firebase project (dev/test).
- Open any page and verify the browser console shows Firebase initialized without errors.

### Test accounts / roles
Have at least:
- **Admin account** (present in `admins` collection if rules require it)
- **Provider account** (provider registration exists in `providerRegistrations`)
- **Patient account** (patient exists in `patientUsers`)

### Test data helpers (recommended)
- Open the test hub: `http://localhost:8080/tests/run-tests.html`
- Use the generator UI: `http://localhost:8080/tests/test-data-generator-ui.html`
- Use the functional tracker: `http://localhost:8080/tests/functional-test-tracker.html`

---

## 1) Recommended Execution Order (fastest signal → deeper checks)

1. **Smoke / routing**: basic pages load without JS errors (Section 2)
2. **Auth + session**: provider + patient + admin can log in and remain logged in (Section 3)
3. **Core user journeys**:
   - Patient: find clinic → view profile → book appointment → leave review (Sections 4–6)
   - Provider: dashboard → manage photos → appointments/patients (Sections 7–9)
4. **Admin workflows**: verification + review moderation + service catalog permissions (Sections 10–12)
5. **Test utilities sanity**: test pages run and explain expected permissions (Section 13)

> Note: this is **manual functional testing**. Automated tests (Vitest) are a separate gate and should be green before doing deep manual work.

---

## How to record results (Functional Test Tracker)

Use `http://localhost:8080/tests/functional-test-tracker.html` to track a full regression run.

### What it records
- **Status** per case: Pass / Fail / Skip / N/A / Not run
- **Notes** (error messages, reproduction steps, observations)
- **Evidence links** (screenshots, screen recordings, logs, PR comments)
- **Timestamps** (per case + overall run)

### Persistence + export
- Data is stored in your browser via **localStorage**
- Export as:
  - **JSON** (portable; can be imported later)
  - **Markdown** (easy to paste into PR description / issue)

### Keeping the tracker in sync
The tracker’s case list is designed to mirror this document’s main sections.
If you add/remove functional test cases here, update the tracker case list in `tests/functional-test-tracker.html` (look for the `CASES` array).

## 2) Smoke Tests (Pages load + no console explosions)

For each page below: open it, confirm UI renders, and check the console for uncaught errors.

- **Home**: `/index.html`
- **Patient auth**: `/patient-auth.html`
- **Provider auth**: `/provider-auth.html`
- **Admin panel**: `/admin-panel.html`
- **Find clinics**: `/find-clinics.html`
- **Provider directory/profile**: `/provider-directory.html?id=<clinicId>`
- **Appointment booking**: `/appointment-booking.html`
- **Review system**: `/review-system.html`
- **Provider dashboard**: `/provider-dashboard.html`
- **Clinic photo gallery**: `/clinic-photo-gallery.html`

**Pass criteria**
- No blank/white screen
- No repeated “permission denied” loops
- No uncaught exceptions in console

---

## 3) Authentication + Session Persistence

### 3.1 Patient login + persistence
1. Open `http://localhost:8080/patient-auth.html`
2. Log in
3. Refresh the page
4. Open `http://localhost:8080/patient-dashboard.html`

**Expected**
- User is recognized as logged in after refresh
- Dashboard loads without redirect loops

### 3.2 Provider login + persistence
1. Open `http://localhost:8080/provider-auth.html`
2. Log in
3. Refresh and open `http://localhost:8080/provider-dashboard.html`

**Expected**
- Provider session persists across refresh
- Provider dashboard loads

### 3.3 Admin login + persistence across navigation
1. Open `http://localhost:8080/admin-panel.html`
2. Log in as admin
3. Navigate inside admin features (e.g., verification, service catalog)
4. Return/back; refresh

**Expected**
- Admin remains authenticated
- Pages that require admin do not show “Missing or insufficient permissions”

---

## 4) Patient Journey: Find Clinics + Provider Directory

### 4.1 Find clinics search + filters
1. Open `http://localhost:8080/find-clinics.html`
2. Search by name/location/specialization (whatever UI supports)
3. Use filters (including badge filters if enabled)
4. Click a clinic card

**Expected**
- Results render quickly
- Filters narrow results correctly
- Clicking a clinic opens the correct clinic profile

### 4.2 Provider directory: back navigation and context
1. From find-clinics, open a provider profile
2. Use “Back” / “Back to Search” behavior

**Expected**
- Returns to the correct prior context (patient search vs admin context)

---

## 5) Appointments (Booking + provider view)

### 5.1 Book an appointment (patient-facing)
1. Open `http://localhost:8080/appointment-booking.html`
2. Fill required fields (must include the fields enforced by rules, e.g. `clinicId` and `patientEmail`)
3. Submit

**Expected**
- Appointment is created successfully
- If blocked by rules, the UI shows a clear error explaining what is missing

### 5.2 Provider appointments view
1. Log in as provider
2. Open `http://localhost:8080/provider-appointments.html`
3. Verify the newly created appointment appears

**Expected**
- Provider can view relevant appointments
- Status transitions (if UI supports) work and persist

---

## 6) Reviews (Create + list + admin moderation linkouts)

### 6.1 Create a review
1. Open `http://localhost:8080/review-system.html`
2. Create a review for an existing clinic (use real clinic IDs from generator if available)

**Expected**
- Review saves without permission errors
- Review shows correctly in lists (provider profile / admin moderation)

### 6.2 Admin: review moderation → view clinic profile
1. Open `http://localhost:8080/admin-panel.html`
2. Go to review moderation (where applicable)
3. Click “View Clinic”

**Expected**
- Provider profile loads (by ID; fallback by name works if ID lookup fails)
- Back button returns to admin correctly (or uses history correctly)

---

## 7) Provider Dashboard (Badges + core widgets)

1. Log in as provider
2. Open `http://localhost:8080/provider-dashboard.html`
3. Verify verification badges appear as expected (Certified/Insured/Experienced/Verified)
4. Hover badges (tooltips)

**Expected**
- Badges reflect Firestore data and approval status
- No broken UI states when fields are missing (graceful “not verified yet”)

---

## 8) Photo Gallery (Provider upload + patient display)

Follow the detailed steps in:
- `TESTING-GUIDE.md` (photo gallery + verification workflow)

Minimum regression subset:
1. Provider uploads at least 1 photo
2. Patient can view those photos on provider directory profile
3. Deleting a photo removes it from patient view

---

## 9) Provider tools (Patients / Invoices / Treatment Plans)

If these pages are in use in your environment, do a basic smoke + CRUD sanity test:
- `/provider-patients.html`
- `/provider-invoices.html`
- `/provider-treatment-plans.html`
- `/create-treatment-plan.html`

**Expected**
- Pages load without permission errors
- Any create/update actions show clear success/failure messaging

---

## 10) Admin: Verification Workflow + Badge Status

Use the detailed steps in:
- `TESTING-GUIDE.md`
- `VERIFICATION-TESTING-GUIDE.md`

Minimum regression subset:
1. Admin can open verification modal/workflow for a pending registration
2. Approve → status updates; Verified badge logic becomes consistent
3. “Check Badge Status” reflects expected issues (e.g., expired insurance)

---

## 11) Admin: Service Catalog Permissions

1. While logged in as admin, open `http://localhost:8080/admin-service-catalog.html`

**Expected**
- Loads without “Missing or insufficient permissions”
- If not logged in / not admin, user is redirected or shown an access error with next steps

---

## 12) Admin: Communication Monitor / Payment Verification (smoke)

If you use these in production workflows, perform at least:
- Load the page and confirm data loads (or shows empty states)
- Trigger one action (if safe) and confirm it persists

Pages:
- `/admin-communication-monitor.html`
- `/admin-payment-verification.html`

---

## 13) Test Utilities (Browser-based test pages)

### 13.1 Test hub loads
1. Open `http://localhost:8080/tests/run-tests.html`
2. Open each card and run the suite

**Expected**
- Tests run and clearly explain permission failures (if any)
- Results show pass/fail counts and timing

### 13.2 Data generator sanity
1. Open `http://localhost:8080/tests/test-data-generator-ui.html`
2. Generate + save:
   - Provider registration
   - Patient user
   - Review (with real clinic IDs if available)
   - Appointment (ensure required fields are set)

**Expected**
- Provider/patient/review saves succeed
- If appointment save fails due to rules, UI explains why and what field/auth is missing

---

## Evidence Checklist (what to capture when reporting)
- Browser + OS
- Firebase project ID used
- Page URL
- Screenshot of UI state
- Console error (copy/paste)
- Firestore document path that failed (if relevant)

---

## Appendix A: Historical Issue Resolutions (kept for reference)

## Test Findings Summary

### Issue #1: Provider Profile Not Loading from Review Moderation
**Status**: ✅ RESOLVED

**Description**: 
When clicking "View Clinic" from the admin panel's review moderation section, the provider profile page showed "Loading Provider profile" message but nothing was loaded.

**Root Cause**:
1. Undefined function `checkProviderStatus()` was being called, causing a ReferenceError
2. Variable `clinicId` was not properly declared (missing `let`/`const`)
3. Reviews contained clinic IDs that didn't exist in the `providerRegistrations` collection

**Resolution**:
1. Removed the undefined `checkProviderStatus()` function call
2. Fixed variable declaration: Changed `clinicId = urlParams.get('id')` to `let clinicId = urlParams.get('id')`
3. Added fallback mechanism to find clinics by name if document ID lookup fails
4. Improved error handling with detailed error messages and console logging

**Files Modified**:
- `provider-directory.html`: Fixed initialization, variable scoping, and added fallback lookup
- `admin-review-moderation.js`: Updated to pass clinic ID correctly

**Test Result**: ✅ PASS
- Provider profiles now load correctly when accessed from review moderation
- Error messages are clear and helpful for debugging

---

### Issue #2: Invalid Clinic IDs in Test Reviews
**Status**: ✅ RESOLVED

**Description**: 
Randomly generated test reviews contained clinic IDs that didn't exist in the database, causing "Provider Not Found" errors.

**Root Cause**:
The test data generator (`tests/test-data-generators.js`) was creating random clinic IDs like `clinic-${randomString(10)}` without checking if they exist in Firestore.

**Resolution**:
1. Updated `generateReview()` to accept an optional array of real clinic IDs
2. Added `fetchRealClinicIds()` method to query Firestore for actual clinic document IDs
3. Updated test data generator UI to:
   - Include checkbox to "Use real clinic IDs from Firestore" (checked by default)
   - Automatically fetch real clinic IDs when generating reviews
4. Added admin panel functions to:
   - Delete pending reviews with invalid clinic IDs
   - Generate new reviews with real clinic IDs

**Files Modified**:
- `tests/test-data-generators.js`: Added real clinic ID support
- `tests/test-data-generator-ui.html`: Updated UI to use real IDs
- `admin-review-moderation.js`: Added cleanup and generation functions

**Test Result**: ✅ PASS
- Test reviews now use real clinic IDs by default
- Admin can clean up invalid reviews and generate new ones with valid IDs

---

### Issue #3: Incorrect Back Button Navigation
**Status**: ✅ RESOLVED

**Description**: 
When viewing a clinic profile from the admin panel, the "Back to Search" button navigated to `find-clinics.html` (patient-facing page) instead of returning to the admin panel.

**Root Cause**:
The back button was hardcoded to navigate to the patient search page, regardless of where the user came from.

**Resolution**:
1. Added URL parameter `from=admin` when opening clinic profile from admin panel
2. Updated `provider-directory.html` to detect admin context via:
   - URL parameter `from=admin`
   - Document referrer containing `admin-panel.html`
3. Dynamically updates back button:
   - Shows "Back to Admin Panel" and links to `admin-panel.html` when from admin
   - Shows "Back to Search" and links to `find-clinics.html` for patients

**Files Modified**:
- `provider-directory.html`: Added context detection and dynamic back button
- `admin-review-moderation.js`: Added `from=admin` parameter to URL

**Test Result**: ✅ PASS
- Back button correctly shows "Back to Admin Panel" when accessed from admin
- Navigation works correctly for both admin and patient users

---

### Issue #4: Admin Session Not Persisting Across Tabs
**Status**: ✅ RESOLVED

**Description**: 
When clicking "View Clinic" opened a new tab, and clicking "Back to Admin Panel" showed the login screen instead of the authenticated admin panel.

**Root Cause**:
1. Clinic profile was opening in a new tab (`_blank`)
2. Admin panel didn't check for existing authentication on page load
3. New tab required re-authentication

**Resolution**:
1. Changed navigation to use same window instead of new tab:
   - Changed `window.open(..., '_blank')` to `window.location.href = ...`
2. Added automatic authentication check on admin panel load:
   - Checks Firebase Auth state on page initialization
   - Automatically shows admin dashboard if already authenticated
   - Shows loading state while checking (prevents login screen flash)
3. Updated back button to use browser history:
   - Uses `window.history.back()` to return to previous page
   - Falls back to direct navigation if history unavailable

**Files Modified**:
- `admin-panel.html`: Added `checkExistingAuth()` function and loading state
- `admin-review-moderation.js`: Changed to same-window navigation
- `provider-directory.html`: Updated back button to use history

**Test Result**: ✅ PASS
- Navigation stays in same tab/window
- Admin session persists correctly
- No login screen flash when returning to admin panel
- Smooth navigation experience

---

### Issue #5: Service Catalog Permission Error
**Status**: ✅ RESOLVED

**Description**: 
When clicking "Service Catalog" in admin panel, error occurred: "Error loading service catalog: Missing or insufficient permissions."

**Root Cause**:
1. The `admin-service-catalog.html` page was creating its own Firebase instance without authentication
2. The `checkAdminAuth()` function was a stub that always returned `true` without actually checking authentication
3. Firestore rules require authenticated admin users (`isAdmin()` function checks for admin document)
4. The page was trying to query Firestore without proper authentication context

**Resolution**:
1. Updated Firebase initialization to use existing authenticated instance from admin panel if available
2. Implemented proper admin authentication check:
   - Checks Firebase Auth state
   - Verifies user exists in `admins` collection
   - Redirects to admin panel if not authenticated
3. Made `checkAdminAuth()` async and added proper error handling
4. Added authentication check before loading service catalog
5. Updated initialization to await authentication check before loading data

**Files Modified**:
- `admin-service-catalog.html`: Added proper admin authentication, use existing Firebase instance

**Test Result**: ✅ PASS
- Service catalog now properly authenticates admin users
- Permission errors resolved
- Page redirects to admin panel if user is not authenticated

---

## Summary

### Issues Resolved: 5/5 ✅

1. ✅ Provider Profile Not Loading from Review Moderation
2. ✅ Invalid Clinic IDs in Test Reviews  
3. ✅ Incorrect Back Button Navigation
4. ✅ Admin Session Not Persisting Across Tabs
5. ✅ Service Catalog Permission Error

### Key Improvements

- **Navigation**: Improved user experience with context-aware back buttons and same-window navigation
- **Authentication**: Robust admin authentication checks across all admin pages
- **Data Quality**: Test data generation now uses real clinic IDs by default
- **Error Handling**: Better error messages and fallback mechanisms
- **Session Management**: Proper Firebase Auth session handling across page navigations

### Testing Recommendations

1. Test admin panel navigation flow: Review Moderation → View Clinic → Back to Admin Panel
2. Verify service catalog loads correctly with admin authentication
3. Test review generation with real clinic IDs
4. Verify session persistence when navigating between admin pages
5. Test cleanup of invalid reviews functionality

---

## Sign-off
- **Developer**: AI Assistant
- **Date**: 2026-01-28
- **Status**: ✅ Appendix A issues resolved; main document is the active functional regression suite


