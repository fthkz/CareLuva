# 🧪 Testing Guide - Photo Gallery & Enhanced Verification

This guide will help you test the newly implemented features:
1. **Photo Gallery Management** (Clinic uploads)
2. **Photo Gallery Display** (Patient viewing)
3. **Enhanced Admin Verification Workflow**
4. **Badge Status Management**

---

## 📋 Prerequisites

1. ✅ **Local server running** (port 8080)
   ```powershell
   powershell -ExecutionPolicy Bypass -File serve-port-8080.ps1
   ```

2. ✅ **Firebase configured** and connected
   - Check browser console for Firebase connection status

3. ✅ **Test accounts ready**:
   - Provider account (for photo uploads)
   - Admin account (for verification workflow)
   - Patient account (for viewing gallery)

---

## 🖼️ Test 1: Photo Gallery Upload (Provider)

### Step 1: Access Photo Gallery Management
1. Navigate to: `http://localhost:8080/provider-auth.html`
2. Log in with your provider credentials
3. Click on your name in the header → **Account Settings**
4. Click on **"Photo Gallery"** card → **"Manage Gallery"**

### Step 2: Upload Clinic Facility Photos
1. In the upload form:
   - **Category**: Select "Clinic Facilities"
   - **Photos**: Click the upload area or drag and drop images
   - Select 2-3 images (PNG, JPG, or GIF format, max 10MB each)
2. Click **"Upload Photos"**
3. **Expected**: 
   - Success message appears
   - Photos appear in the gallery under "Clinic Facilities" filter
   - Upload form resets

### Step 3: Upload Professional Photos
1. **Category**: Select "Professionals"
2. **Select Professional**: Choose a professional from the dropdown (if you have professionals in your registration)
3. **Photos**: Upload 1-2 professional photos
4. Click **"Upload Photos"**
5. **Expected**: 
   - Photos appear in gallery with professional name labels
   - Photos show under "Professionals" filter

### Step 4: Upload Service Photos
1. **Category**: Select "Services"
2. **Photos**: Upload 1-2 service-related images
3. Click **"Upload Photos"**
4. **Expected**: Photos appear in gallery under "Services" filter

### Step 5: Test Gallery Filters
1. Click on filter buttons: "All", "Clinic Facilities", "Professionals", "Services"
2. **Expected**: Gallery updates to show only photos from selected category

### Step 6: Delete a Photo
1. Hover over any photo in the gallery
2. Click the **trash icon** (appears on hover)
3. Confirm deletion
4. **Expected**: Photo is removed from gallery

### Step 7: Test File Validation
1. Try uploading a file larger than 10MB
2. **Expected**: Error message appears, file is rejected
3. Try uploading a non-image file (e.g., PDF)
4. **Expected**: File is filtered out (only images accepted)

---

## 👁️ Test 2: Photo Gallery Display (Patient View)

### Step 1: Find a Clinic with Photos
1. Navigate to: `http://localhost:8080/patient-auth.html`
2. Log in with patient credentials
3. Go to **"Find Clinics"** page
4. Find and click on a clinic that has uploaded photos

### Step 2: View Photo Gallery
1. Scroll down to the **"Photo Gallery"** section
2. **Expected**: 
   - Gallery is organized by categories:
     - Clinic Facilities
     - Professionals (with names if tagged)
     - Services
   - Photos are displayed in a grid layout

### Step 3: View Full-Size Photos
1. Click on any photo in the gallery
2. **Expected**: 
   - Full-screen modal opens
   - Photo displays at larger size
   - Close button (×) appears in top-right
3. Click outside the photo or the × button
4. **Expected**: Modal closes

### Step 4: Test Empty Gallery
1. Find a clinic that hasn't uploaded photos yet
2. **Expected**: 
   - Gallery section shows "No photos available yet" message
   - Empty state icon is displayed

---

## 🔍 Test 3: Enhanced Admin Verification Workflow

### Step 1: Access Admin Panel
1. Navigate to: `http://localhost:8080/admin-panel.html`
2. Log in with admin credentials
3. Click **"🔄 Refresh Data"** to load registrations

### Step 2: Open Verification Workflow
1. Find a registration with status "pending"
2. Click **"Review & Approve"** button
3. **Expected**: 
   - Modal opens with "Step-by-Step Verification"
   - Shows clinic name and email at top
   - Displays 4 verification steps with checkboxes

### Step 3: Review Each Verification Step
Check each step:

**Step 1: Certifications Verification**
- ✅ Green background = Certifications provided
- ❌ Red background = No certifications found
- Checkbox should reflect the status

**Step 2: Malpractice Insurance Verification**
- ✅ Green = Valid insurance (not expired)
- ❌ Red = Missing or expired insurance
- Shows insurance validity status

**Step 3: Experience Requirement**
- ✅ Green = Meets 3+ years requirement
- ❌ Red = Does not meet requirement
- Shows experience validation

**Step 4: Document Verification**
- ✅ Green = Required documents uploaded
- ❌ Red = Missing documents
- Shows document status

### Step 4: Review Verification Summary
1. Check the "Verification Summary" section at bottom
2. **Expected**: 
   - Green background = All criteria met
   - Yellow background = Some criteria missing
   - Shows overall status

### Step 5: Approve Registration
1. If all criteria are met:
   - Click **"✅ Approve"** button
   - **Expected**: 
     - Registration status changes to "approved"
     - Success message appears
     - Registration list refreshes
2. If some criteria are missing:
   - Click **"✅ Approve"** button
   - **Expected**: 
     - Confirmation dialog appears
     - You can still approve after confirming
     - Registration is approved

### Step 6: Reject Registration
1. Click **"❌ Reject"** button
2. **Expected**: 
   - Registration status changes to "rejected"
   - Success message appears
   - Registration list refreshes

---

## 🛡️ Test 4: Badge Status Management

### Step 1: Check Badge Status
1. In admin panel, find a registration with status "approved"
2. Click **"Check Badge Status"** button
3. **Expected**: 
   - Modal opens showing "Badge Status Check"
   - Displays clinic name
   - Shows 4 badge statuses:
     - Certified Badge
     - Insured Badge
     - Experienced Badge
     - Verified Badge

### Step 2: Review Badge Statuses
For each badge, check:

**Certified Badge**
- ✅ Green = Active (certifications present)
- ❌ Red = Inactive (missing certifications)

**Insured Badge**
- ✅ Green = Active (valid insurance)
- ❌ Red = Inactive (expired or missing insurance)
- Shows expiry date if active

**Experienced Badge**
- ✅ Green = Active (meets requirement)
- ❌ Red = Inactive (doesn't meet requirement)

**Verified Badge**
- ✅ Green = Active (all criteria met + approved)
- ❌ Red = Inactive (not all criteria met)

### Step 3: Review Issues Section
1. If any badges are inactive, check the "Issues Found" section
2. **Expected**: 
   - Yellow warning box appears
   - Lists specific issues preventing badge activation
   - Examples: "Missing certifications", "Insurance expired", etc.

### Step 4: Test with Expired Insurance
1. Find a clinic with insurance that has expired (end date in the past)
2. Click **"Check Badge Status"**
3. **Expected**: 
   - Insured Badge shows as ❌ Inactive
   - Issue listed: "Insurance expired or will expire soon"
   - Insurance expiry date is displayed

---

## 🐛 Troubleshooting

### Issue: Photos not uploading
**Solutions**:
1. Check browser console for errors
2. Verify Firebase Storage is configured
3. Check file size (must be < 10MB)
4. Verify file is an image format (PNG, JPG, GIF)
5. Check Firestore rules allow `clinicPhotos` collection writes

### Issue: Gallery not displaying on provider directory
**Solutions**:
1. Verify photos were uploaded successfully
2. Check `clinicId` matches the provider's registration ID
3. Check browser console for Firestore query errors
4. Verify Firestore rules allow `clinicPhotos` collection reads

### Issue: Verification workflow not opening
**Solutions**:
1. Check admin is logged in
2. Verify Firebase is initialized
3. Check browser console for errors
4. Ensure registration ID is valid

### Issue: Badge status shows incorrect information
**Solutions**:
1. Verify provider registration data is complete
2. Check insurance end date format
3. Verify experience years field format
4. Check certifications array structure

---

## ✅ Success Criteria

### Photo Gallery
- ✅ Provider can upload photos in all 3 categories
- ✅ Photos appear in gallery immediately after upload
- ✅ Gallery filters work correctly
- ✅ Photos can be deleted
- ✅ Patient can view gallery on provider directory
- ✅ Full-size photo modal works
- ✅ Empty state displays correctly

### Verification Workflow
- ✅ Modal opens with all 4 steps
- ✅ Each step shows correct status (green/red)
- ✅ Verification summary reflects overall status
- ✅ Approve button works (with confirmation if needed)
- ✅ Reject button works
- ✅ Registration status updates correctly

### Badge Status
- ✅ All 4 badges show correct status
- ✅ Expired insurance is detected
- ✅ Issues are listed when badges are inactive
- ✅ Insurance expiry dates display correctly

---

## 📝 Test Data Requirements

To fully test all features, you'll need:

1. **Provider Account**:
   - At least one professional in registration
   - Valid insurance (not expired)
   - Certifications
   - 3+ years experience
   - Documents uploaded

2. **Test Images**:
   - Clinic facility photos (2-3 images)
   - Professional photos (1-2 images)
   - Service photos (1-2 images)
   - All images should be < 10MB

3. **Admin Account**:
   - Access to admin panel
   - Permissions to approve/reject registrations

---

## 🎯 Quick Test Checklist

- [ ] Upload clinic facility photos
- [ ] Upload professional photos
- [ ] Upload service photos
- [ ] Test gallery filters
- [ ] Delete a photo
- [ ] View gallery as patient
- [ ] Open full-size photo modal
- [ ] Open verification workflow
- [ ] Review all 4 verification steps
- [ ] Approve a registration
- [ ] Check badge status
- [ ] Verify expired insurance detection

---

## 📞 Need Help?

If you encounter any issues:
1. Check browser console for errors
2. Verify Firebase connection
3. Check Firestore rules are deployed
4. Ensure all required fields are present in test data

---

**Happy Testing! 🚀**

