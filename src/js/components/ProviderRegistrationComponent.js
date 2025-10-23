/**
 * Provider Registration Component - Single responsibility: Provider registration form and workflow
 */
class ProviderRegistrationComponent {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {};
        this.validationErrors = {};
        this.isInitialized = false;
        this.cleanupFunctions = [];
    }

    /**
     * Initialize provider registration component
     */
    init() {
        if (this.isInitialized) {
            console.warn('Provider registration component already initialized');
            return;
        }

        this.setupEventListeners();
        this.isInitialized = true;
        console.log('Provider registration component initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for registration modal open
        const openHandler = (event) => {
            console.log('ProviderRegistrationComponent: Received openRegistration event');
            this.openRegistrationModal();
        };

        document.addEventListener('provider:openRegistration', openHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:openRegistration', openHandler);
        });

        // Listen for registration step changes
        const stepHandler = (event) => {
            this.handleStepChange(event.detail);
        };

        document.addEventListener('provider:stepChange', stepHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:stepChange', stepHandler);
        });
    }

    /**
     * Open registration modal
     */
    openRegistrationModal() {
        this.createRegistrationModal();
        this.showStep(1);
        this.animateModalIn();
    }

    /**
     * Create registration modal HTML
     */
    createRegistrationModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('provider-registration-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div id="provider-registration-modal" class="provider-registration-modal">
                <div class="modal-backdrop"></div>
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>Join CareLuva as a Provider</h2>
                        <button class="modal-close" aria-label="Close registration">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 20%"></div>
                        </div>
                        <div class="progress-steps">
                            <div class="step active" data-step="1">
                                <span class="step-number">1</span>
                                <span class="step-label">Basic Info</span>
                            </div>
                            <div class="step" data-step="2">
                                <span class="step-number">2</span>
                                <span class="step-label">Credentials</span>
                            </div>
                            <div class="step" data-step="3">
                                <span class="step-number">3</span>
                                <span class="step-label">Verification</span>
                            </div>
                            <div class="step" data-step="4">
                                <span class="step-number">4</span>
                                <span class="step-label">Account</span>
                            </div>
                            <div class="step" data-step="5">
                                <span class="step-number">5</span>
                                <span class="step-label">Review</span>
                            </div>
                        </div>
                    </div>

                    <div class="modal-content">
                        <form id="provider-registration-form" class="registration-form">
                            <!-- Step 1: Basic Information -->
                            <div class="form-step active" data-step="1">
                                <div class="step-header">
                                    <h3>Basic Information</h3>
                                    <p>Tell us about your clinic or hospital</p>
                                </div>
                                
                                <div class="form-group">
                                    <label for="provider-type">Provider Type *</label>
                                    <select id="provider-type" name="providerType" required>
                                        <option value="">Select provider type</option>
                                        <option value="clinic">Clinic</option>
                                        <option value="hospital">Hospital</option>
                                        <option value="dental-clinic">Dental Clinic</option>
                                        <option value="cosmetic-clinic">Cosmetic Clinic</option>
                                        <option value="hair-transplant-clinic">Hair Transplant Clinic</option>
                                    </select>
                                    <div class="error-message" id="provider-type-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="clinic-name">Clinic/Hospital Name *</label>
                                    <input type="text" id="clinic-name" name="clinicName" required 
                                           placeholder="Enter your clinic or hospital name">
                                    <div class="error-message" id="clinic-name-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="contact-person">Contact Person *</label>
                                    <input type="text" id="contact-person" name="contactPerson" required 
                                           placeholder="Full name of the main contact person">
                                    <div class="error-message" id="contact-person-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="email">Email Address *</label>
                                    <input type="email" id="email" name="email" required 
                                           placeholder="Enter your business email">
                                    <div class="error-message" id="email-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="phone">Phone Number *</label>
                                    <input type="tel" id="phone" name="phone" required 
                                           placeholder="+90 555 123 4567">
                                    <div class="error-message" id="phone-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="address">Address *</label>
                                    <textarea id="address" name="address" required 
                                              placeholder="Enter your clinic address"></textarea>
                                    <div class="error-message" id="address-error"></div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="city">City *</label>
                                        <input type="text" id="city" name="city" required 
                                               placeholder="Istanbul">
                                        <div class="error-message" id="city-error"></div>
                                    </div>
                                    <div class="form-group">
                                        <label for="country">Country *</label>
                                        <input type="text" id="country" name="country" required 
                                               placeholder="Turkey" value="Turkey">
                                        <div class="error-message" id="country-error"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 2: Credentials -->
                            <div class="form-step" data-step="2">
                                <div class="step-header">
                                    <h3>Medical Credentials</h3>
                                    <p>Upload your medical licenses and certifications</p>
                                </div>

                                <div class="form-group">
                                    <label for="medical-license">Medical License Number *</label>
                                    <input type="text" id="medical-license" name="medicalLicense" required 
                                           placeholder="Enter your medical license number">
                                    <div class="error-message" id="medical-license-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="license-file">Medical License Document *</label>
                                    <div class="file-upload">
                                        <input type="file" id="license-file" name="licenseFile" required 
                                               accept=".pdf,.jpg,.jpeg,.png">
                                        <label for="license-file" class="file-upload-label">
                                            <i class="fas fa-upload"></i>
                                            <span>Upload Medical License</span>
                                        </label>
                                    </div>
                                    <div class="error-message" id="license-file-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="specialization">Specialization *</label>
                                    <select id="specialization" name="specialization" required>
                                        <option value="">Select specialization</option>
                                        <option value="general-medicine">General Medicine</option>
                                        <option value="dentistry">Dentistry</option>
                                        <option value="cosmetic-surgery">Cosmetic Surgery</option>
                                        <option value="hair-transplant">Hair Transplant</option>
                                        <option value="dermatology">Dermatology</option>
                                        <option value="ophthalmology">Ophthalmology</option>
                                        <option value="orthopedics">Orthopedics</option>
                                        <option value="cardiology">Cardiology</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <div class="error-message" id="specialization-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="experience-years">Years of Experience *</label>
                                    <input type="number" id="experience-years" name="experienceYears" required 
                                           min="1" max="50" placeholder="5">
                                    <div class="error-message" id="experience-years-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="additional-certs">Additional Certifications</label>
                                    <div class="file-upload">
                                        <input type="file" id="additional-certs" name="additionalCerts" 
                                               accept=".pdf,.jpg,.jpeg,.png" multiple>
                                        <label for="additional-certs" class="file-upload-label">
                                            <i class="fas fa-upload"></i>
                                            <span>Upload Additional Certifications</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 3: Verification -->
                            <div class="form-step" data-step="3">
                                <div class="step-header">
                                    <h3>Insurance & Verification</h3>
                                    <p>Provide insurance and verification documents</p>
                                </div>

                                <div class="form-group">
                                    <label for="malpractice-insurance">Malpractice Insurance *</label>
                                    <div class="file-upload">
                                        <input type="file" id="malpractice-insurance" name="malpracticeInsurance" required 
                                               accept=".pdf,.jpg,.jpeg,.png">
                                        <label for="malpractice-insurance" class="file-upload-label">
                                            <i class="fas fa-upload"></i>
                                            <span>Upload Malpractice Insurance</span>
                                        </label>
                                    </div>
                                    <div class="error-message" id="malpractice-insurance-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="business-license">Business License *</label>
                                    <div class="file-upload">
                                        <input type="file" id="business-license" name="businessLicense" required 
                                               accept=".pdf,.jpg,.jpeg,.png">
                                        <label for="business-license" class="file-upload-label">
                                            <i class="fas fa-upload"></i>
                                            <span>Upload Business License</span>
                                        </label>
                                    </div>
                                    <div class="error-message" id="business-license-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="clinic-photos">Clinic Photos</label>
                                    <div class="file-upload">
                                        <input type="file" id="clinic-photos" name="clinicPhotos" 
                                               accept=".jpg,.jpeg,.png" multiple>
                                        <label for="clinic-photos" class="file-upload-label">
                                            <i class="fas fa-camera"></i>
                                            <span>Upload Clinic Photos</span>
                                        </label>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="website">Website (Optional)</label>
                                    <input type="url" id="website" name="website" 
                                           placeholder="https://yourclinic.com">
                                </div>

                                <div class="form-group">
                                    <label for="languages">Languages Spoken</label>
                                    <div class="checkbox-group">
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="languages" value="turkish">
                                            <span>Turkish</span>
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="languages" value="english">
                                            <span>English</span>
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="languages" value="arabic">
                                            <span>Arabic</span>
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="languages" value="german">
                                            <span>German</span>
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="languages" value="french">
                                            <span>French</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 4: Account Setup -->
                            <div class="form-step" data-step="4">
                                <div class="step-header">
                                    <h3>Account Setup</h3>
                                    <p>Create your secure account</p>
                                </div>

                                <div class="form-group">
                                    <label for="password">Password *</label>
                                    <input type="password" id="password" name="password" required 
                                           placeholder="Create a strong password">
                                    <div class="password-strength">
                                        <div class="strength-bar">
                                            <div class="strength-fill"></div>
                                        </div>
                                        <span class="strength-text">Password strength</span>
                                    </div>
                                    <div class="error-message" id="password-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="confirm-password">Confirm Password *</label>
                                    <input type="password" id="confirm-password" name="confirmPassword" required 
                                           placeholder="Confirm your password">
                                    <div class="error-message" id="confirm-password-error"></div>
                                </div>

                                <div class="form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="termsAccepted" required>
                                        <span>I agree to the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a> *</span>
                                    </label>
                                    <div class="error-message" id="termsAccepted-error"></div>
                                </div>

                                <div class="form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="marketingConsent">
                                        <span>I would like to receive updates and marketing communications</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Step 5: Review & Submit -->
                            <div class="form-step" data-step="5">
                                <div class="step-header">
                                    <h3>Review & Submit</h3>
                                    <p>Please review your information before submitting</p>
                                </div>

                                <div class="review-section">
                                    <div class="review-group">
                                        <h4>Basic Information</h4>
                                        <div class="review-item">
                                            <span class="review-label">Provider Type:</span>
                                            <span class="review-value" id="review-provider-type">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Clinic/Hospital Name:</span>
                                            <span class="review-value" id="review-clinic-name">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Contact Person:</span>
                                            <span class="review-value" id="review-contact-person">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Email:</span>
                                            <span class="review-value" id="review-email">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Phone:</span>
                                            <span class="review-value" id="review-phone">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Address:</span>
                                            <span class="review-value" id="review-address">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">City:</span>
                                            <span class="review-value" id="review-city">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Country:</span>
                                            <span class="review-value" id="review-country">-</span>
                                        </div>
                                    </div>

                                    <div class="review-group">
                                        <h4>Medical Credentials</h4>
                                        <div class="review-item">
                                            <span class="review-label">Medical License:</span>
                                            <span class="review-value" id="review-medical-license">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Specialization:</span>
                                            <span class="review-value" id="review-specialization">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Years of Experience:</span>
                                            <span class="review-value" id="review-experience-years">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">License Document:</span>
                                            <span class="review-value" id="review-license-file">-</span>
                                        </div>
                                    </div>

                                    <div class="review-group">
                                        <h4>Verification Documents</h4>
                                        <div class="review-item">
                                            <span class="review-label">Malpractice Insurance:</span>
                                            <span class="review-value" id="review-malpractice-insurance">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Business License:</span>
                                            <span class="review-value" id="review-business-license">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Clinic Photos:</span>
                                            <span class="review-value" id="review-clinic-photos">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Website:</span>
                                            <span class="review-value" id="review-website">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Languages:</span>
                                            <span class="review-value" id="review-languages">-</span>
                                        </div>
                                    </div>

                                    <div class="review-group">
                                        <h4>Account Information</h4>
                                        <div class="review-item">
                                            <span class="review-label">Email:</span>
                                            <span class="review-value" id="review-account-email">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Terms Accepted:</span>
                                            <span class="review-value" id="review-terms-accepted">-</span>
                                        </div>
                                        <div class="review-item">
                                            <span class="review-label">Marketing Consent:</span>
                                            <span class="review-value" id="review-marketing-consent">-</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" id="prev-step" disabled>Previous</button>
                        <button type="button" class="btn-primary" id="next-step">Next Step</button>
                        <button type="button" class="btn-primary" id="submit-registration" style="display: none;">Complete Registration</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupModalEventListeners();
    }

    /**
     * Setup modal event listeners
     */
    setupModalEventListeners() {
        const modal = document.getElementById('provider-registration-modal');
        if (!modal) return;

        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        const closeModal = () => this.closeRegistrationModal();
        
        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
        
        // Navigation buttons
        const prevBtn = modal.querySelector('#prev-step');
        const nextBtn = modal.querySelector('#next-step');
        const submitBtn = modal.querySelector('#submit-registration');
        
        prevBtn.addEventListener('click', () => this.previousStep());
        nextBtn.addEventListener('click', () => this.nextStep());
        submitBtn.addEventListener('click', () => this.submitRegistration());

        // Form validation
        const form = modal.querySelector('#provider-registration-form');
        this.setupFormValidation(form);

        // Password strength indicator
        const passwordInput = modal.querySelector('#password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }
    }

    /**
     * Setup form validation
     * @param {Element} form - Form element
     */
    setupFormValidation(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    /**
     * Show specific step
     * @param {number} step - Step number
     */
    showStep(step) {
        const modal = document.getElementById('provider-registration-modal');
        if (!modal) return;

        // Update current step
        this.currentStep = step;

        // Update progress bar
        const progressFill = modal.querySelector('.progress-fill');
        const progressPercentage = (step / this.totalSteps) * 100;
        progressFill.style.width = `${progressPercentage}%`;

        // Update step indicators
        const steps = modal.querySelectorAll('.step');
        steps.forEach((stepEl, index) => {
            const stepNumber = index + 1;
            stepEl.classList.toggle('active', stepNumber === step);
            stepEl.classList.toggle('completed', stepNumber < step);
        });

        // Show/hide form steps
        const formSteps = modal.querySelectorAll('.form-step');
        formSteps.forEach((stepEl, index) => {
            const stepNumber = index + 1;
            stepEl.classList.toggle('active', stepNumber === step);
        });

        // If showing review step, populate it with data
        if (step === 5) {
            this.populateReviewStep();
        }

        // Update navigation buttons
        const prevBtn = modal.querySelector('#prev-step');
        const nextBtn = modal.querySelector('#next-step');
        const submitBtn = modal.querySelector('#submit-registration');

        prevBtn.disabled = step === 1;
        
        if (step === this.totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            submitBtn.style.display = 'none';
        }
    }

    /**
     * Go to next step
     */
    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            this.showStep(this.currentStep + 1);
        }
    }

    /**
     * Go to previous step
     */
    previousStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    /**
     * Validate current step
     * @returns {boolean} Is valid
     */
    validateCurrentStep() {
        const modal = document.getElementById('provider-registration-modal');
        if (!modal) return false;

        const currentStepEl = modal.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (!currentStepEl) return false;

        const requiredFields = currentStepEl.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Validate individual field
     * @param {Element} field - Field element
     * @returns {boolean} Is valid
     */
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Phone validation
        if (fieldName === 'phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }

        // Password validation
        if (fieldName === 'password' && value) {
            if (value.length < 8) {
                isValid = false;
                errorMessage = 'Password must be at least 8 characters long';
            }
        }

        // Password confirmation
        if (fieldName === 'confirmPassword' && value) {
            const password = document.getElementById('password')?.value;
            if (value !== password) {
                isValid = false;
                errorMessage = 'Passwords do not match';
            }
        }

        // Show/hide error
        this.showFieldError(field, errorMessage);
        return isValid;
    }

    /**
     * Show field error
     * @param {Element} field - Field element
     * @param {string} message - Error message
     */
    showFieldError(field, message) {
        const errorEl = document.getElementById(`${field.name}-error`);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = message ? 'block' : 'none';
        }

        if (message) {
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    }

    /**
     * Clear field error
     * @param {Element} field - Field element
     */
    clearFieldError(field) {
        this.showFieldError(field, '');
    }

    /**
     * Update password strength indicator
     * @param {string} password - Password value
     */
    updatePasswordStrength(password) {
        const modal = document.getElementById('provider-registration-modal');
        if (!modal) return;

        const strengthFill = modal.querySelector('.strength-fill');
        const strengthText = modal.querySelector('.strength-text');
        
        if (!strengthFill || !strengthText) return;

        const strength = this.calculatePasswordStrength(password);
        const percentage = (strength.score / 4) * 100;
        
        strengthFill.style.width = `${percentage}%`;
        strengthFill.className = `strength-fill ${strength.level}`;
        strengthText.textContent = strength.text;
    }

    /**
     * Calculate password strength
     * @param {string} password - Password
     * @returns {Object} Strength info
     */
    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const levels = {
            0: { level: 'weak', text: 'Very Weak' },
            1: { level: 'weak', text: 'Weak' },
            2: { level: 'fair', text: 'Fair' },
            3: { level: 'good', text: 'Good' },
            4: { level: 'strong', text: 'Strong' },
            5: { level: 'strong', text: 'Very Strong' }
        };

        return {
            score: Math.min(score, 4),
            level: levels[Math.min(score, 4)].level,
            text: levels[Math.min(score, 4)].text
        };
    }

    /**
     * Populate review step with collected data
     */
    populateReviewStep() {
        const modal = document.getElementById('provider-registration-modal');
        if (!modal) return;

        // Helper function to get display value
        const getDisplayValue = (value, defaultValue = 'Not provided') => {
            if (!value || value === '' || value === undefined || value === null) {
                return defaultValue;
            }
            if (Array.isArray(value)) {
                return value.length > 0 ? value.join(', ') : defaultValue;
            }
            if (typeof value === 'boolean') {
                return value ? 'Yes' : 'No';
            }
            if (value instanceof FileList) {
                return value.length > 0 ? `${value.length} file(s) uploaded` : defaultValue;
            }
            return value;
        };

        // Helper function to format provider type
        const formatProviderType = (type) => {
            if (!type) return 'Not provided';
            return type.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        };

        // Helper function to format specialization
        const formatSpecialization = (spec) => {
            if (!spec) return 'Not provided';
            return spec.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        };

        // Populate basic information
        document.getElementById('review-provider-type').textContent = 
            formatProviderType(this.formData.providerType);
        document.getElementById('review-clinic-name').textContent = 
            getDisplayValue(this.formData.clinicName);
        document.getElementById('review-contact-person').textContent = 
            getDisplayValue(this.formData.contactPerson);
        document.getElementById('review-email').textContent = 
            getDisplayValue(this.formData.email);
        document.getElementById('review-phone').textContent = 
            getDisplayValue(this.formData.phone);
        document.getElementById('review-address').textContent = 
            getDisplayValue(this.formData.address);
        document.getElementById('review-city').textContent = 
            getDisplayValue(this.formData.city);
        document.getElementById('review-country').textContent = 
            getDisplayValue(this.formData.country);

        // Populate medical credentials
        document.getElementById('review-medical-license').textContent = 
            getDisplayValue(this.formData.medicalLicense);
        document.getElementById('review-specialization').textContent = 
            formatSpecialization(this.formData.specialization);
        document.getElementById('review-experience-years').textContent = 
            getDisplayValue(this.formData.experienceYears, 'Not specified');
        document.getElementById('review-license-file').textContent = 
            getDisplayValue(this.formData.licenseFile);

        // Populate verification documents
        document.getElementById('review-malpractice-insurance').textContent = 
            getDisplayValue(this.formData.malpracticeInsurance);
        document.getElementById('review-business-license').textContent = 
            getDisplayValue(this.formData.businessLicense);
        document.getElementById('review-clinic-photos').textContent = 
            getDisplayValue(this.formData.clinicPhotos);
        document.getElementById('review-website').textContent = 
            getDisplayValue(this.formData.website);
        document.getElementById('review-languages').textContent = 
            getDisplayValue(this.formData.languages);

        // Populate account information
        document.getElementById('review-account-email').textContent = 
            getDisplayValue(this.formData.email);
        document.getElementById('review-terms-accepted').textContent = 
            getDisplayValue(this.formData.termsAccepted);
        document.getElementById('review-marketing-consent').textContent = 
            getDisplayValue(this.formData.marketingConsent);
    }

    /**
     * Save current step data
     */
    saveCurrentStepData() {
        const modal = document.getElementById('provider-registration-modal');
        if (!modal) return;

        const currentStepEl = modal.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (!currentStepEl) return;

        const formData = new FormData();
        const inputs = currentStepEl.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (input.checked) {
                    if (input.name === 'languages') {
                        if (!this.formData.languages) this.formData.languages = [];
                        this.formData.languages.push(input.value);
                    } else {
                        this.formData[input.name] = true;
                    }
                }
            } else if (input.type === 'file') {
                if (input.files.length > 0) {
                    this.formData[input.name] = input.files;
                }
            } else {
                this.formData[input.name] = input.value;
            }
        });
    }

    /**
     * Submit registration
     */
    async submitRegistration() {
        if (!this.validateCurrentStep()) {
            return;
        }

        this.saveCurrentStepData();
        
        // Don't include sensitive password in event payload
        const { password, confirmPassword, ...safeData } = this.formData;
        
        // Show loading state
        const submitBtn = document.querySelector('#submit-registration');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        try {
            // Emit registration event
            EventUtils.createCustomEvent('provider:register', {
                ...safeData,
                password: password  // Only include if truly needed
            });

            // Wait for registration to complete
            await new Promise((resolve) => {
                const successHandler = () => {
                    document.removeEventListener('provider:registrationSuccess', successHandler);
                    document.removeEventListener('provider:registrationError', errorHandler);
                    resolve();
                };

                const errorHandler = () => {
                    document.removeEventListener('provider:registrationSuccess', successHandler);
                    document.removeEventListener('provider:registrationError', errorHandler);
                    resolve();
                };

                document.addEventListener('provider:registrationSuccess', successHandler);
                document.addEventListener('provider:registrationError', errorHandler);
            });

        } catch (error) {
            console.error('Registration submission error:', error);
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    /**
     * Handle step change
     * @param {Object} detail - Step change details
     */
    handleStepChange(detail) {
        if (detail.step) {
            this.showStep(detail.step);
        }
    }

    /**
     * Animate modal in
     */
    animateModalIn() {
        const modal = document.getElementById('provider-registration-modal');
        if (!modal) return;

        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        
        requestAnimationFrame(() => {
            modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });
    }

    /**
     * Close registration modal
     */
    closeRegistrationModal() {
        const modal = document.getElementById('provider-registration-modal');
        if (!modal) return;

        modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';

        setTimeout(() => {
            modal.remove();
            this.currentStep = 1;
            this.formData = {};
            this.validationErrors = {};
        }, 300);
    }

    /**
     * Destroy component
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        
        // Remove modal if exists
        const modal = document.getElementById('provider-registration-modal');
        if (modal) {
            modal.remove();
        }
        
        this.isInitialized = false;
        console.log('Provider registration component destroyed');
    }
}
