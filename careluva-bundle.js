/**
 * CareLuva Bundle - All JavaScript components bundled for Live Preview compatibility
 * This file contains all the necessary JavaScript in the correct order
 */

// ============================================================================
// UTILITY CLASSES
// ============================================================================

/**
 * DOM Utilities
 */
class DOMUtils {
    static createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }

    static show(element) {
        if (element) element.style.display = 'block';
    }

    static hide(element) {
        if (element) element.style.display = 'none';
    }

    static addClass(element, className) {
        if (element) element.classList.add(className);
    }

    static removeClass(element, className) {
        if (element) element.classList.remove(className);
    }
}

/**
 * Event Utilities
 */
class EventUtils {
    static createCustomEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
        return event;
    }
}

/**
 * Animation Utilities
 */
class AnimationUtils {
    static fadeIn(element, duration = 300) {
        if (!element) return;
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = performance.now();
        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    static fadeOut(element, duration = 300) {
        if (!element) return;
        
        let start = performance.now();
        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            element.style.opacity = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        requestAnimationFrame(animate);
    }
}

// ============================================================================
// VIEW MODEL
// ============================================================================

class AppViewModel {
    constructor() {
        this.state = {
            providerAuth: {
                isAuthenticated: false,
                currentUser: null,
                isVerified: false,
                loading: false,
                error: null
            }
        };
    }

    getProviderAuthState() {
        return this.state.providerAuth;
    }

    setProviderAuthState(newState) {
        this.state.providerAuth = { ...this.state.providerAuth, ...newState };
    }

    setProviderUser(user) {
        this.state.providerAuth.currentUser = user;
        this.state.providerAuth.isAuthenticated = !!user;
    }

    setProviderVerificationStatus(isVerified) {
        this.state.providerAuth.isVerified = isVerified;
    }

    setProviderLoading(loading) {
        this.state.providerAuth.loading = loading;
    }

    setProviderError(error) {
        this.state.providerAuth.error = error;
    }

    clearProviderError() {
        this.state.providerAuth.error = null;
    }

    isProviderAuthenticated() {
        return this.state.providerAuth.isAuthenticated;
    }

    getCurrentProviderUser() {
        return this.state.providerAuth.currentUser;
    }
}

// ============================================================================
// MANAGERS
// ============================================================================

class AuthManager {
    constructor() {
        this.viewModel = new AppViewModel();
        this.cleanupFunctions = [];
        this.isFirebaseAvailable = false;
    }

    async init() {
        console.log('AuthManager initializing...');
        
        try {
            // Check if Firebase is available
            if (window.firebase && window.firebase.auth) {
                console.log('Firebase detected, using Firebase AuthManager');
                this.isFirebaseAvailable = true;
                // Use Firebase AuthManager if available
                if (window.FirebaseAuthManager) {
                    this.firebaseAuthManager = new window.FirebaseAuthManager();
                    await this.firebaseAuthManager.init();
                    console.log('Firebase AuthManager initialized successfully');
                    return;
                }
            }
            
            console.log('Using mock AuthManager (Firebase not available)');
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing AuthManager:', error);
            console.log('Falling back to mock AuthManager');
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Listen for registration events
        const registrationHandler = (event) => {
            this.handleRegistration(event.detail);
        };
        document.addEventListener('provider:register', registrationHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:register', registrationHandler);
        });

        // Listen for login events
        const loginHandler = (event) => {
            this.handleLogin(event.detail);
        };
        document.addEventListener('provider:login', loginHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:login', loginHandler);
        });
    }

    async handleRegistration(formData) {
        try {
            this.viewModel.setProviderLoading(true);
            this.viewModel.clearProviderError();

            // Validate password
            if (!formData.password || formData.password.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Simulate registration process
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create user object
            const user = {
                id: Date.now().toString(),
                email: formData.email,
                clinicName: formData.clinicName,
                isVerified: false,
                createdAt: new Date().toISOString()
            };

            // Save to localStorage
            localStorage.setItem('careluva_provider_user', JSON.stringify(user));

            this.viewModel.setProviderUser(user);
            this.viewModel.setProviderLoading(false);

            // Emit success event
            EventUtils.createCustomEvent('provider:registrationSuccess', { user });

        } catch (error) {
            this.viewModel.setProviderError(error.message);
            this.viewModel.setProviderLoading(false);
            EventUtils.createCustomEvent('provider:registrationError', { error: error.message });
        }
    }

    async handleLogin(credentials) {
        try {
            this.viewModel.setProviderLoading(true);
            this.viewModel.clearProviderError();

            // Simulate login process
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check localStorage for existing user
            const savedUser = localStorage.getItem('careluva_provider_user');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                if (user.email === credentials.email) {
                    this.viewModel.setProviderUser(user);
                    this.viewModel.setProviderLoading(false);
                    EventUtils.createCustomEvent('provider:loginSuccess', { user });
                    return;
                }
            }

            throw new Error('Invalid credentials');

        } catch (error) {
            this.viewModel.setProviderError(error.message);
            this.viewModel.setProviderLoading(false);
            EventUtils.createCustomEvent('provider:loginError', { error: error.message });
        }
    }

    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
    }
}

// ============================================================================
// COMPONENTS
// ============================================================================

class ProviderRegistrationComponent {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {};
        this.validationErrors = {};
        this.isInitialized = false;
        this.cleanupFunctions = [];
    }

    init() {
        if (this.isInitialized) {
            console.warn('Provider registration component already initialized');
            return;
        }

        this.createModal();
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('Provider registration component initialized');
    }

    createModal() {
        this.modal = DOMUtils.createElement('div', 'provider-registration-modal');
        this.modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Join as Provider</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="step-indicator">
                            <div class="step active" data-step="1">1</div>
                            <div class="step" data-step="2">2</div>
                            <div class="step" data-step="3">3</div>
                            <div class="step" data-step="4">4</div>
                        </div>
                        <form id="providerRegistrationForm">
                            <div class="step-content" data-step="1">
                                <h3>Basic Information</h3>
                                <div class="form-group">
                                    <label for="clinicName">Clinic/Hospital Name *</label>
                                    <input type="text" id="clinicName" name="clinicName" required>
                                </div>
                                <div class="form-group">
                                    <label for="email">Email Address *</label>
                                    <input type="email" id="email" name="email" required>
                                </div>
                                <div class="form-group">
                                    <label for="phone">Phone Number *</label>
                                    <input type="tel" id="phone" name="phone" required>
                                </div>
                            </div>
                            <div class="step-content" data-step="2" style="display: none;">
                                <h3>Medical Credentials</h3>
                                <div class="form-group">
                                    <label for="licenseNumber">Medical License Number *</label>
                                    <input type="text" id="licenseNumber" name="licenseNumber" required>
                                </div>
                                <div class="form-group">
                                    <label for="specialization">Specialization *</label>
                                    <select id="specialization" name="specialization" required>
                                        <option value="">Select Specialization</option>
                                        <option value="general">General Medicine</option>
                                        <option value="dentistry">Dentistry</option>
                                        <option value="cosmetic">Cosmetic Surgery</option>
                                        <option value="dermatology">Dermatology</option>
                                        <option value="cardiology">Cardiology</option>
                                    </select>
                                </div>
                            </div>
                            <div class="step-content" data-step="3" style="display: none;">
                                <h3>Account Setup</h3>
                                <div class="form-group">
                                    <label for="password">Password *</label>
                                    <input type="password" id="password" name="password" required>
                                </div>
                                <div class="form-group">
                                    <label for="confirmPassword">Confirm Password *</label>
                                    <input type="password" id="confirmPassword" name="confirmPassword" required>
                                </div>
                            </div>
                            <div class="step-content" data-step="4" style="display: none;">
                                <h3>Review & Submit</h3>
                                <div class="review-content">
                                    <p>Please review your information before submitting.</p>
                                    <div id="reviewData"></div>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" id="prevStep" style="display: none;">Previous</button>
                                <button type="button" class="btn-primary" id="nextStep">Next</button>
                                <button type="submit" class="btn-primary" id="submitForm" style="display: none;">Submit Registration</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    setupEventListeners() {
        // Listen for modal open
        const openHandler = (event) => {
            console.log('ProviderRegistrationComponent: Received openRegistration event');
            this.openRegistrationModal();
        };
        document.addEventListener('provider:openRegistration', openHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:openRegistration', openHandler);
        });

        // Modal close
        const closeBtn = this.modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.closeModal());

        // Form navigation
        const nextBtn = this.modal.querySelector('#nextStep');
        const prevBtn = this.modal.querySelector('#prevStep');
        const submitBtn = this.modal.querySelector('#submitForm');

        nextBtn.addEventListener('click', () => this.nextStep());
        prevBtn.addEventListener('click', () => this.prevStep());
        submitBtn.addEventListener('click', (e) => this.submitForm(e));

        // Close on overlay click
        const overlay = this.modal.querySelector('.modal-overlay');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal();
        });
    }

    openRegistrationModal() {
        console.log('Opening registration modal');
        this.modal.style.display = 'block';
        AnimationUtils.fadeIn(this.modal);
    }

    closeModal() {
        console.log('Closing registration modal');
        AnimationUtils.fadeOut(this.modal, 200);
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.resetForm();
        }, 200);
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            this.currentStep++;
            this.updateStepDisplay();
    validateCurrentStep() {
        const currentStepElement = this.modal.querySelector(`[data-step="${this.currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('input[required], select[required]');
        
        for (let input of inputs) {
            if (!input.value.trim()) {
                alert(`Please fill in ${input.name || input.id}`);
                input.focus();
                return false;
            }
            
            // Validate email format
            if (input.type === 'email' && !this.isValidEmail(input.value)) {
                alert('Please enter a valid email address');
                input.focus();
                return false;
            }
            
            // Validate phone format (basic check)
            if (input.type === 'tel' && !this.isValidPhone(input.value)) {
                alert('Please enter a valid phone number');
                input.focus();
                return false;
            }
        }
        return true;
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    isValidPhone(phone) {
        return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }
            if (!input.value.trim()) {
                alert(`Please fill in ${input.name || input.id}`);
                input.focus();
                return false;
            }
        }
        return true;
    }

    saveCurrentStepData() {
        const currentStepElement = this.modal.querySelector(`[data-step="${this.currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            this.formData[input.name || input.id] = input.value;
        });
    }

    updateStepDisplay() {
        // Update step indicators
        const steps = this.modal.querySelectorAll('.step');
        steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
        });

        // Update step content
        const stepContents = this.modal.querySelectorAll('.step-content');
        stepContents.forEach((content, index) => {
            content.style.display = index + 1 === this.currentStep ? 'block' : 'none';
        });

        // Update buttons
        const prevBtn = this.modal.querySelector('#prevStep');
        const nextBtn = this.modal.querySelector('#nextStep');
        const submitBtn = this.modal.querySelector('#submitForm');

        prevBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
        nextBtn.style.display = this.currentStep < 4 ? 'inline-block' : 'none';
        submitBtn.style.display = this.currentStep === 4 ? 'inline-block' : 'none';

        // Update review data on step 4
        if (this.currentStep === 4) {
            this.updateReviewData();
        }
    }

    updateReviewData() {
        const reviewData = this.modal.querySelector('#reviewData');
        reviewData.innerHTML = `
            <div class="review-item"><strong>Clinic Name:</strong> ${this.formData.clinicName}</div>
            <div class="review-item"><strong>Email:</strong> ${this.formData.email}</div>
            <div class="review-item"><strong>Phone:</strong> ${this.formData.phone}</div>
            <div class="review-item"><strong>License:</strong> ${this.formData.licenseNumber}</div>
            <div class="review-item"><strong>Specialization:</strong> ${this.formData.specialization}</div>
        `;
    }

    submitForm(e) {
        e.preventDefault();
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            console.log('Submitting registration form:', this.formData);
            EventUtils.createCustomEvent('provider:register', this.formData);
            this.closeModal();
        }
    }

    resetForm() {
        this.currentStep = 1;
        this.formData = {};
        this.updateStepDisplay();
        const form = this.modal.querySelector('#providerRegistrationForm');
        form.reset();
    }

    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        if (this.modal) {
            this.modal.remove();
        }
    }
}

class ProviderLoginComponent {
    constructor() {
        this.modal = null;
        this.cleanupFunctions = [];
    }

    init() {
        console.log('ProviderLoginComponent initialized');
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        this.modal = DOMUtils.createElement('div', 'provider-login-modal');
        this.modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Provider Login</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="providerLoginForm">
                            <div class="form-group">
                                <label for="loginEmail">Email Address *</label>
                                <input type="email" id="loginEmail" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">Password *</label>
                                <input type="password" id="loginPassword" name="password" required>
                            </div>
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="rememberMe" name="rememberMe">
                                    Remember me
                                </label>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" id="cancelLogin">Cancel</button>
                                <button type="submit" class="btn-primary">Login</button>
                            </div>
                            <div class="form-footer">
                                <a href="#" id="forgotPassword">Forgot your password?</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    setupEventListeners() {
        // Listen for modal open
        const openHandler = (event) => {
            console.log('ProviderLoginComponent: Received openLogin event');
            this.openLoginModal();
        };
        document.addEventListener('provider:openLogin', openHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:openLogin', openHandler);
        });

        // Modal close
        const closeBtn = this.modal.querySelector('.modal-close');
        const cancelBtn = this.modal.querySelector('#cancelLogin');
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());

        // Form submission
        const form = this.modal.querySelector('#providerLoginForm');
        form.addEventListener('submit', (e) => this.submitForm(e));

        // Close on overlay click
        const overlay = this.modal.querySelector('.modal-overlay');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal();
        });
    }

    openLoginModal() {
        console.log('Opening login modal');
        this.modal.style.display = 'block';
        AnimationUtils.fadeIn(this.modal);
    }

    closeModal() {
        console.log('Closing login modal');
        AnimationUtils.fadeOut(this.modal, 200);
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.resetForm();
        }, 200);
    }

    submitForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };
        
        console.log('Submitting login form:', credentials);
        EventUtils.createCustomEvent('provider:login', credentials);
        this.closeModal();
    }

    resetForm() {
        const form = this.modal.querySelector('#providerLoginForm');
        form.reset();
    }

    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        if (this.modal) {
            this.modal.remove();
        }
    }
}

// ============================================================================
// COORDINATOR
// ============================================================================

class AppCoordinator {
    constructor() {
        this.components = new Map();
        this.managers = new Map();
        this.viewModels = new Map();
        this.cleanupFunctions = [];
    }

    init() {
        console.log('AppCoordinator initializing...');
        this.initializeViewModels();
        this.initializeManagers();
        this.initializeComponents();
        this.setupCustomEventHandlers();
        console.log('AppCoordinator initialized successfully');
    }

    initializeViewModels() {
        const appViewModel = new AppViewModel();
        this.viewModels.set('app', appViewModel);
    }

    initializeManagers() {
        const authManager = new AuthManager();
        authManager.init();
        this.managers.set('auth', authManager);
    }

    initializeComponents() {
        // Initialize provider registration component
        const providerRegistrationComponent = new ProviderRegistrationComponent();
        providerRegistrationComponent.init();
        this.components.set('providerRegistration', providerRegistrationComponent);
        console.log('ProviderRegistrationComponent initialized');

        // Initialize provider login component
        const providerLoginComponent = new ProviderLoginComponent();
        providerLoginComponent.init();
        this.components.set('providerLogin', providerLoginComponent);
        console.log('ProviderLoginComponent initialized');
    }

    setupCustomEventHandlers() {
        // Handle registration success
        const registrationSuccessHandler = (event) => {
            this.handleProviderRegistrationSuccess(event.detail);
        };
        document.addEventListener('provider:registrationSuccess', registrationSuccessHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:registrationSuccess', registrationSuccessHandler);
        });

        // Handle login success
        const loginSuccessHandler = (event) => {
            this.handleProviderLoginSuccess(event.detail);
        };
        document.addEventListener('provider:loginSuccess', loginSuccessHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:loginSuccess', loginSuccessHandler);
        });

        // Handle registration error
        const registrationErrorHandler = (event) => {
            this.handleProviderError(event.detail);
        };
        document.addEventListener('provider:registrationError', registrationErrorHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:registrationError', registrationErrorHandler);
        });
    }

    handleProviderRegistrationSuccess(detail) {
        console.log('Provider registration successful:', detail);
        alert('Registration successful! Welcome to CareLuva!');
        // In a real app, you would redirect to dashboard or verification page
    }

    handleProviderLoginSuccess(detail) {
        console.log('Provider login successful:', detail);
        alert('Login successful! Welcome back!');
        // In a real app, you would redirect to dashboard
    }

    handleProviderError(detail) {
        console.error('Provider error:', detail);
        alert('Error: ' + detail.error);
    }

    getAuthManager() {
        return this.managers.get('auth');
    }

    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.components.forEach(component => component.destroy());
        this.managers.forEach(manager => manager.destroy());
    }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

// Global application instance
let appCoordinator = null;

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Prevent re-initialization
        if (appCoordinator) {
            console.warn('CareLuva application already initialized');
            return;
        }

        // Initialize the application coordinator
        appCoordinator = new AppCoordinator();
        appCoordinator.init();        
        console.log('CareLuva application initialized successfully!');
        console.log('AppCoordinator components:', Array.from(appCoordinator.components.keys()));
        
    } catch (error) {
        console.error('Failed to initialize CareLuva application:', error);
    }

    // ============================================================================
    // BUTTON HANDLERS
    // ============================================================================
    // Provider Registration Button Handler
    const providerRegistrationBtn = document.querySelector('[data-action="open-provider-registration"]');
    if (providerRegistrationBtn) {
        console.log('Provider registration button found, adding event listener');
        providerRegistrationBtn.addEventListener('click', function() {
            console.log('Provider registration button clicked');
            // Always use direct event dispatch for reliability
            const event = new CustomEvent('provider:openRegistration', {});
            document.dispatchEvent(event);
            console.log('Registration event dispatched');
        });
    } else {
        console.log('Provider registration button not found');
    }

    // Provider Login Button Handler
    const providerLoginBtn = document.querySelector('[data-action="open-provider-login"]');
    if (providerLoginBtn) {
        console.log('Provider login button found, adding event listener');
        providerLoginBtn.addEventListener('click', function() {
            console.log('Provider login button clicked');
            // Always use direct event dispatch for reliability
            const event = new CustomEvent('provider:openLogin', {});
            document.dispatchEvent(event);
            console.log('Login event dispatched');
        });
    } else {
        console.log('Provider login button not found');
    }
});

/**
 * Cleanup application when page is unloaded
 */
window.addEventListener('beforeunload', function() {
    if (appCoordinator) {
        appCoordinator.destroy();
        appCoordinator = null;
    }
});

// Export for global access
window.CareLuva = {
    getAppCoordinator: () => appCoordinator,
    getComponent: (name) => appCoordinator ? appCoordinator.components.get(name) : null,
    getManager: (name) => appCoordinator ? appCoordinator.managers.get(name) : null,
    getViewModel: (name) => appCoordinator ? appCoordinator.viewModels.get(name) : null
};

console.log('CareLuva bundle loaded successfully!');
