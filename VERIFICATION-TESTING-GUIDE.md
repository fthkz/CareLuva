# 🧪 Verification System Testing Guide

This guide will help you test the three new verification features:
1. **Admin Panel - Verification Criteria Review**
2. **Provider Dashboard - Verification Badges Display**
3. **Find Clinics - Badge Filtering**

---

## 📋 Prerequisites

Before testing, ensure you have:

1. ✅ **Local server running** (port 8080)
   ```powershell
   powershell -ExecutionPolicy Bypass -File serve-port-8080.ps1
   ```

2. ✅ **Firebase configured** and connected
   - Check browser console for Firebase connection status

3. ✅ **Test accounts ready**:
   - Admin account (for admin panel testing)
   - Provider account with verification data (for dashboard testing)
   - Patient account (for find-clinics testing)

---

## 🧪 Test 1: Admin Panel - Verification Criteria Review

### Step 1: Access Admin Panel
1. Navigate to: `http://localhost:8080/admin-panel.html`
2. Log in with your admin credentials

### Step 2: View Provider Registrations
1. After login, registrations should auto-load
2. Look for provider registration cards
3. Each card should show:
   - Basic clinic information (name, email, phone, etc.)
   - **NEW: Verification Criteria Section** (🔍 Verification Criteria)

### Step 3: Review Verification Criteria

For each registration, verify the following sections appear:

#### ✅ Certifications Section
- **Expected**: Shows list of certifications with:
  - Certification name
  - Certificate number (if provided)
  - Issue date (if provided)
- **Visual Indicator**: 
  - Green border (left) = Certifications provided ✅
  - Red border = No certifications ❌

#### ✅ Malpractice Insurance Section
- **Expected**: Shows:
  - Insurance provider name
  - Policy number
  - Coverage dates (start - end)
  - Validity status (✓ Valid or ⚠️ Expired)
  - Link to view insurance certificate document
- **Visual Indicator**:
  - Green border = Insurance provided ✅
  - Red border = Missing insurance ❌

#### ✅ Experience Validation Section
- **Expected**: Shows:
  - Years of experience
  - Status: "✓ Meets minimum 3 years requirement" or "⚠️ Does not meet minimum 3 years requirement"
- **Visual Indicator**:
  - Green border = Meets requirement ✅
  - Red border = Does not meet requirement ❌

#### ✅ Documents Section
- **Expected**: Lists all uploaded documents:
  - Medical License Document (with download link) ✓
  - Insurance Certificate (with download link) ✓
  - Business License (optional, if uploaded)
  - Additional Medical Documents (if any)
- **Visual Indicator**:
  - Green border = Required documents uploaded ✅
  - Yellow border = Some documents missing ⚠️

#### ✅ Verification Summary
- **Expected**: Shows overall status:
  - "✅ All verification criteria met - Ready for approval" (green background)
  - "⚠️ Some verification criteria missing - Review required" (yellow background)

### Step 4: Test Document Links
1. Click on document links (e.g., "📄 View Insurance Certificate")
2. **Expected**: Document should open in a new tab/window
3. Verify the document URL is valid and accessible

### Step 5: Test Approval Workflow
1. Find a registration with all verification criteria met
2. Click **✅ Approve** button
3. **Expected**: 
   - Status changes to "approved"
   - Success message appears
   - Registration card updates immediately

---

## 🧪 Test 2: Provider Dashboard - Verification Badges Display

### Step 1: Create/Update Provider Registration with Verification Data

**Option A: Use Existing Registration**
- If you have a provider account, log in and check dashboard

**Option B: Create New Registration**
1. Navigate to: `http://localhost:8080/complete-registration.html`
2. Fill out the registration form:
   - **Step 1**: Basic information
   - **Step 2**: Medical Credentials
     - Add at least one certification (name, number, issue date)
     - Select experience years (3-5, 6-10, 11-15, 16-20, or 20+)
     - Upload Medical License document
   - **Step 3**: Verification
     - Enter insurance provider name
     - Enter insurance policy number
     - Set insurance start date (past date)
     - Set insurance end date (future date)
     - Upload Insurance Certificate document
3. Submit registration

### Step 2: Access Provider Dashboard
1. Log in to provider account: `http://localhost:8080/provider-auth.html`
2. Navigate to: `http://localhost:8080/provider-dashboard.html`

### Step 3: Verify Badges Display
1. Look at the **Welcome Section** (below welcome message)
2. **Expected**: You should see a **Verification Badges Container**

### Step 4: Check Badge Types

Based on your registration data, you should see badges:

#### ✅ Certified Badge (✓ Certified)
- **Condition**: Has at least one certification
- **Color**: Green (#10b981)
- **Icon**: ✓

#### ✅ Insured Badge (🛡️ Insured)
- **Condition**: Has valid malpractice insurance (not expired)
- **Color**: Blue (#3b82f6)
- **Icon**: 🛡️

#### ✅ Experienced Badge (⭐ Experienced)
- **Condition**: Has 3+ years experience (3-5, 6-10, 11-15, 16-20, or 20+)
- **Color**: Orange (#f59e0b)
- **Icon**: ⭐

#### ✅ Verified Badge (✓ Verified)
- **Condition**: All three above badges + status is "approved"
- **Color**: Purple (#8b5cf6)
- **Icon**: ✓

### Step 5: Test Badge Hover
1. Hover over each badge
2. **Expected**: Tooltip should show badge description

### Step 6: Test Different Scenarios

#### Scenario A: Missing Certifications
- Remove certifications from registration
- **Expected**: "Certified" badge should disappear
- **Expected**: "Verified" badge should disappear (if it was there)

#### Scenario B: Expired Insurance
- Set insurance end date to past date
- **Expected**: "Insured" badge should disappear
- **Expected**: "Verified" badge should disappear

#### Scenario C: Less Than 3 Years Experience
- Set experience to less than 3 years
- **Expected**: "Experienced" badge should disappear
- **Expected**: "Verified" badge should disappear

---

## 🧪 Test 3: Find Clinics - Badge Filtering

### Step 1: Access Find Clinics Page
1. Log in as patient: `http://localhost:8080/patient-auth.html`
2. Navigate to: `http://localhost:8080/find-clinics.html`

### Step 2: Locate Badge Filters
1. Look at the **Filters** sidebar (left side)
2. Find the **"Verification Badges"** section
3. **Expected**: You should see 4 checkbox options:
   - ✓ Certified
   - 🛡️ Insured
   - ⭐ Experienced
   - ✓ Fully Verified

### Step 3: Test Individual Badge Filters

#### Test A: Filter by "Certified"
1. Check the **"✓ Certified"** checkbox
2. **Expected**: 
   - Only clinics with certifications should be displayed
   - Other clinics should be hidden
   - Clinic cards should show the "Certified" badge

#### Test B: Filter by "Insured"
1. Uncheck "Certified", check **"🛡️ Insured"**
2. **Expected**: 
   - Only clinics with valid insurance should be displayed
   - Clinic cards should show the "Insured" badge

#### Test C: Filter by "Experienced"
1. Uncheck "Insured", check **"⭐ Experienced"**
2. **Expected**: 
   - Only clinics with 3+ years experience should be displayed
   - Clinic cards should show the "Experienced" badge

#### Test D: Filter by "Fully Verified"
1. Uncheck "Experienced", check **"✓ Fully Verified"**
2. **Expected**: 
   - Only clinics with all badges (Certified + Insured + Experienced + Approved) should be displayed
   - Clinic cards should show the "Verified" badge

### Step 4: Test Multiple Badge Filters
1. Check multiple badges (e.g., "Certified" + "Insured")
2. **Expected**: 
   - Only clinics that have ALL selected badges should be displayed
   - Example: If both "Certified" and "Insured" are checked, only clinics with BOTH badges appear

### Step 5: Test Combined Filters
1. Select a badge filter (e.g., "Certified")
2. Also select other filters (e.g., specialization, location)
3. **Expected**: 
   - Results should match ALL selected criteria
   - Badge filter works in combination with other filters

### Step 6: Test Clear Filters
1. Select some badge filters
2. Click **"Clear"** button
3. **Expected**: 
   - All badge filters should be unchecked
   - All clinics should be displayed again

### Step 7: Verify Badge Display on Clinic Cards
1. Look at clinic cards in the results
2. **Expected**: 
   - Each clinic card should display its earned badges
   - Badges should match the filter criteria when filtered
   - Badge icons and colors should be visible

---

## 🐛 Troubleshooting

### Issue: Badges not showing on provider dashboard
**Solution**:
1. Check browser console for errors
2. Verify `verification-badges.js` is loaded (check Network tab)
3. Verify provider data includes required fields (certifications, insurance, experienceYears)
4. Check that `VerificationBadges` class is available: `console.log(window.VerificationBadges)`

### Issue: Badge filters not working
**Solution**:
1. Check browser console for JavaScript errors
2. Verify `verification-badges.js` is loaded on find-clinics page
3. Verify `VerificationBadges` class has `calculateBadges()` method
4. Check that clinic data includes required fields

### Issue: Admin panel not showing verification criteria
**Solution**:
1. Verify provider registration includes new fields:
   - `certifications` (array)
   - `insuranceProvider`, `insurancePolicyNumber`
   - `insuranceStartDate`, `insuranceEndDate`
   - `experienceYears`
   - `documents` (object with license, insurance URLs)
2. Check browser console for errors
3. Refresh the page and reload registrations

### Issue: Document links not working
**Solution**:
1. Verify documents were uploaded to Firebase Storage
2. Check that `documents` object in Firestore has valid URLs
3. Verify Firebase Storage rules allow read access
4. Check browser console for CORS or permission errors

---

## ✅ Success Criteria

### Admin Panel
- ✅ Verification criteria section appears for all registrations
- ✅ All 4 sections (Certifications, Insurance, Experience, Documents) display correctly
- ✅ Document links are clickable and open documents
- ✅ Verification summary shows correct status
- ✅ Color coding (green/yellow/red) works correctly

### Provider Dashboard
- ✅ Badges appear in welcome section
- ✅ Correct badges display based on provider data
- ✅ Badges update when data changes
- ✅ Badge tooltips show descriptions on hover
- ✅ Badge styling is consistent and readable

### Find Clinics
- ✅ Badge filter checkboxes appear in filters section
- ✅ Individual badge filters work correctly
- ✅ Multiple badge filters work together
- ✅ Badge filters combine with other filters correctly
- ✅ Clinic cards display badges correctly
- ✅ Clear button resets badge filters

---

## 📝 Test Data Requirements

To fully test all features, you'll need:

1. **Provider Registration with Full Verification**:
   - At least 1 certification
   - Valid malpractice insurance (future end date)
   - 3+ years experience
   - All required documents uploaded
   - Status: "approved"

2. **Provider Registration with Partial Verification**:
   - Some but not all criteria met
   - Status: "pending"

3. **Provider Registration with No Verification**:
   - Missing certifications, insurance, or experience
   - Status: "pending"

---

## 🎯 Quick Test Checklist

- [ ] Admin panel shows verification criteria section
- [ ] Certifications section displays correctly
- [ ] Insurance section shows validity status
- [ ] Experience validation works
- [ ] Documents section lists all uploaded files
- [ ] Document links are clickable
- [ ] Verification summary shows correct status
- [ ] Provider dashboard displays badges
- [ ] Badges match provider data
- [ ] Badge tooltips work
- [ ] Find clinics shows badge filters
- [ ] Individual badge filters work
- [ ] Multiple badge filters work together
- [ ] Badge filters combine with other filters
- [ ] Clinic cards show badges
- [ ] Clear button resets filters

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify Firebase connection
3. Check Firestore data structure matches expected format
4. Verify all scripts are loaded correctly
5. Review the troubleshooting section above

Happy Testing! 🚀

