# 🗺️ CareLuva Development Roadmap

This document tracks planned features and improvements for CareLuva. These are ongoing development items that may be completed before or after production launch.

## 📋 Planned Features

### Provider Account Functionalities
- [x] Complete Billing & Payment functionality
  - [x] Implement payment processing integration (Manual bank transfer + iyzico)
  - [x] Add billing history and invoice management (`provider-invoices.html`)
  - [x] Set up payment method management (iyzico integration structure)
  - [x] Integrate with payment gateway (iyzico - Turkish-compliant)
  - [x] Add invoice generation and download (PDF placeholder)
  - [x] Treatment plan management (`provider-treatment-plans.html`)
  - [x] Professional schedule management (`professional-schedules.html`)
  - [x] Service pricing management (`service-pricing-management.html`)
  - [x] Service packages management (`service-packages-management.html`)
  - [x] Photo gallery management (`clinic-photo-gallery.html`)

### Patient User Registration & Authentication
- [x] Create patient user registration/authentication screen (similar to `provider-auth.html`)
  - [x] Design patient login/registration page
  - [x] Implement patient authentication system
  - [x] Add password hashing and session management for patients
  - [x] Create patient profile management
- [x] Update navigation flow for patient users
  - [x] Currently, clicking "Find Clinics" directly navigates to `find-clinics.html`
  - [x] Add patient login/registration flow before accessing clinic search
  - [x] Implement authentication check before allowing clinic search
  - [x] Redirect unauthenticated users to patient auth page
- [x] Create patient dashboard/profile page
  - [x] Patient profile management
  - [x] Appointment history
  - [x] Favorite clinics
  - [x] Medical records (Option 1 - Minimal Approach - Implemented)
    - [x] Appointment history tracking (non-medical data only)
    - [x] Basic appointment summaries
    - [x] No detailed medical records stored
    - [x] GDPR-compliant minimal data approach
  - [ ] Medical records (Option 2 - Patient-Controlled Summary - Future)
    - [ ] Patient-owned medical summary (allergies, medications, chronic conditions)
    - [ ] Explicit consent system
    - [ ] Encrypted storage
    - [ ] Patient control (view/edit/delete)
    - [ ] GDPR compliance (Article 9 - explicit consent)
    - [ ] Data portability and right to erasure
  - [ ] Medical records (Option 3 - Link-Only Approach - Future)
    - [ ] Link to clinic patient portals
    - [ ] No medical data stored on CareLuva
    - [ ] Patient accesses records via clinic systems
    - [ ] Reference IDs only (no actual medical data)

### Clinic Onboarding & Verification System
- [x] Implement clinic onboarding criteria verification
  - [x] Certifications validation and storage
  - [x] Malpractice insurance verification and documentation
  - [x] Minimum years of experience requirement check
  - [x] Document upload and verification workflow
  - [x] Admin review and approval process
- [x] Verification badges system
  - [x] Design and implement verification badge UI components
  - [x] Display verification badges prominently on provider profiles
  - [x] Display verification badges on patient-facing clinic listings
  - [x] Badge types: Certified, Insured, Experienced, Verified
  - [x] Badge status management (active, expired, pending)
  - [x] Clinic verification system (`clinic-verification-system.js`)
  - [x] Admin verification workflow page (`admin-verification-workflow.html`)
  - [x] Badge expiry checking and warnings

### Provider Transparency & Profile Enhancement
- [x] Real provider bios and credentials
  - [x] Doctor education history display (implemented in provider-directory.html)
  - [x] Professional experience timeline (implemented)
  - [x] Certifications and licenses showcase (implemented)
  - [x] Specializations and areas of expertise (implemented)
  - [x] Professional achievements and awards (implemented)
- [x] Patient feedback integration
  - [x] Review aggregation and display (implemented)
  - [x] Rating breakdown by category (service, communication, etc.) (implemented)
  - [x] Response to reviews functionality (implemented)
  - [x] Review moderation system (implemented)
- [x] Response times and availability
  - [x] Average response time calculation (implemented)
  - [x] Response time indicators (Fast, Moderate, Slow) (implemented)
  - [x] Real-time availability status (structure in place)
  - [x] Availability calendar integration (professional schedules implemented)
  - [x] Appointment booking availability display (implemented)
- [x] Transparent pricing system
  - [x] Service catalog management (provided by CareLuva)
    - [x] CareLuva provides service catalog for each category (Dentistry, Hair Transplant, Cosmetic Surgery, etc.)
    - [x] Clinics/hospitals select which services they provide from the catalog
    - [x] Clinics enter pricing information for selected services
    - [x] Admin review and approval process for service selections and pricing
    - [x] Published services and pricing displayed on clinic/hospital profile pages
  - [x] Category-based service lists (Dentistry, Cosmetic Surgery, etc.)
  - [x] Service pricing display on provider profiles
  - [x] Price comparison features
  - [x] Service package options
  - [x] Pricing transparency badges

### Trust Score Metric System
- [x] Trust Score calculation algorithm
  - [x] Review quality and quantity analysis
  - [x] Patient outcomes tracking
  - [x] Provider responsiveness metrics
  - [x] Certification and credential weighting
  - [x] Composite 1-10 Trust Score calculation
- [x] Trust Score display and UI
  - [x] Trust Score visualization (1-10 scale)
  - [x] Score breakdown by category
  - [x] Trust Score badges and indicators
  - [x] Historical score trends
- [x] AI-Powered Clinic Recommendations
  - [x] Patient preference analysis (budget, trust score expectations)
  - [x] Appointment date availability matching
  - [x] Clinic availability integration
  - [x] Personalized clinic suggestions algorithm
  - [x] Recommendation explanation and reasoning
  - [x] Multi-factor matching (location, specialization, price, trust score)
  - [x] Machine learning model for improved recommendations over time
  - [x] Collaborative filtering for similar patients
  - [x] Patient behavior tracking and learning
  - [x] Personalized weight adjustments based on user preferences
  - [x] Real-time availability checking
  - [x] Recommendation outcome tracking for ML training

### CareLuva Revenue Model & Payment Tracking
- [x] Revenue model implementation
  - [x] Fixed price per patient per treatment (charged to clinic/hospital)
  - [x] Fee structure definition and configuration
  - [x] Billing system for clinics/hospitals
  - [x] Invoice generation for CareLuva fees
  - [x] Payment processing for clinic fees (Manual bank transfer + iyzico)
  - [x] Manual bank transfer payment system (MVP)
  - [x] iyzico payment gateway integration (Turkish-compliant)
  - [x] Payment receipt upload and verification
  - [x] Admin payment verification dashboard
  - [x] Late fee calculation and application
  - [x] Payment reminder system structure
- [x] Prevent offline conversation migration (Challenge #1)
  - [x] Platform communication tracking and logging
  - [x] Conversation monitoring system
  - [x] Terms of Service enforcement (require platform communication)
  - [x] Warning system for clinics attempting to go offline
  - [x] Penalty system for violations (suspension, fee penalties)
  - [x] Communication audit trail
  - [x] Patient education about platform benefits (in Patient T&C)
  - [x] Incentivize platform communication (better visibility, trust score boost)
  - [x] Terms & Conditions documents (Provider and Patient) with platform communication requirements
  - [x] Admin communication monitoring dashboard
  - [x] Violation detection and automated handling
- [x] Treatment verification and payment confirmation (Challenge #2)
  - [x] Treatment completion verification system
    - [x] Post-appointment confirmation from patient (structure in place)
    - [x] Treatment completion form/checklist (structure in place)
    - [x] Photo/document upload for treatment proof (optional, privacy-compliant) - via payment receipt upload
    - [x] Patient feedback/confirmation after treatment (integrated with review system)
  - [x] Payment tracking and confirmation
    - [x] Payment receipt upload system (patient or clinic)
    - [x] Payment confirmation workflow
    - [ ] Integration with clinic payment systems (if available) - Future enhancement
    - [ ] Third-party payment verification (bank statements, payment gateway integration) - Future enhancement
    - [x] Automated payment matching algorithms (structure in place)
  - [x] Invoice generation and tracking
    - [x] Automated invoice creation for completed treatments
    - [x] Invoice status tracking (sent, paid, overdue)
    - [x] Payment reminder system structure (requires email service for automation)
    - [x] Late payment penalties and interest calculation
  - [x] Audit and compliance system
    - [x] Random audit checks structure (admin verification dashboard)
    - [x] Dispute resolution process (in T&C documents)
    - [x] Fraud detection algorithms (violation detection in communication monitor)
    - [ ] Compliance reporting for tax purposes - Future enhancement
- [x] Multi-appointment treatment series handling (Challenge #3)
  - [x] Treatment plan/series management
    - [x] Create treatment plans with multiple appointments
    - [x] Link appointments to treatment plans
    - [x] Track treatment plan progress
    - [x] Treatment plan completion tracking
  - [x] Fee calculation for treatment series
    - [x] Single fee per treatment plan (not per appointment)
    - [x] Partial completion fee calculation
    - [x] Treatment plan cancellation/refund policies
    - [x] Prorated fees for incomplete treatments
  - [x] Appointment series tracking
    - [x] Appointment sequence management
    - [x] Treatment milestone tracking
    - [x] Series completion verification
    - [x] Individual appointment status within series
  - [x] Billing and invoicing for series
    - [x] Invoice generation upon series completion
    - [x] Progress-based billing (if applicable)
    - [x] Series cancellation handling
    - [x] Refund policy for incomplete series
  - [x] Treatment Plan Manager (`treatment-plan-manager.js`)
  - [x] Create treatment plan page (`create-treatment-plan.html`)
  - [x] Provider treatment plans page (`provider-treatment-plans.html`)

### Security Enhancements
- [ ] Migrate to Firebase Authentication (Future Enhancement)
  - [ ] Evaluate migration benefits (social login, MFA, enhanced security)
  - [ ] Plan hybrid approach (keep Firestore-only for existing users, add Firebase Auth for new users)
  - [ ] Implement Firebase Auth for new user registrations
  - [ ] Add social login support (Google, Facebook, Apple Sign-In)
  - [ ] Implement Multi-Factor Authentication (MFA/2FA)
  - [ ] Add email verification with Firebase Auth
  - [ ] Implement phone authentication (SMS-based)
  - [ ] Migrate existing users from Firestore-only to Firebase Auth
  - [ ] Update security rules to use `request.auth.uid` for enhanced security
  - [ ] Add user analytics and session management dashboard
  - [ ] Implement enterprise features (SAML SSO, compliance features)
  - [ ] See `FIREBASE-AUTH-VS-FIRESTORE-AUTH.md` for detailed comparison and migration guide
  - **Note**: Current Firestore-only auth is working and secure. Migration should be considered when:
    - Users request social login features
    - MFA/2FA is required for compliance
    - Scaling to 1,000+ active users
    - Enterprise features are needed
    - Enhanced security analytics are required

## 📝 Notes

### Current Status
- Last Updated: 2026-01-27
- Focus Areas: Provider transparency, Trust metrics, Clinic verification, AI recommendations, Revenue model & payment tracking, Security enhancements

### Dependencies
- Patient authentication system needs to be compatible with existing Firestore structure
- Payment integration requires compliance with healthcare payment regulations
- Patient registration should follow similar security patterns as provider registration
- Trust Score system requires historical data collection and analysis
- AI recommendation engine needs sufficient clinic and patient data for training
- Service catalog must be finalized and provided by CareLuva before pricing transparency implementation
- Verification system requires integration with certification and insurance verification services
- Revenue model requires legal and tax compliance review
- Payment tracking system may require integration with payment gateways or banking APIs
- Treatment verification may require patient consent and privacy compliance (HIPAA, GDPR)
- Multi-appointment series requires clear definition of treatment plan structure
- Firebase Auth migration requires careful planning to avoid disrupting existing users (see `FIREBASE-AUTH-VS-FIRESTORE-AUTH.md`)

---

**Note**: This roadmap is separate from production-critical changes. See `PRODUCTION-CHANGES.md` for items that must be completed before launch.

