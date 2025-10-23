/**
 * Provider Login Component - Single responsibility: Provider login form
 */
class ProviderLoginComponent {
    constructor() {
        this.isInitialized = false;
        this.cleanupFunctions = [];
    }

    /**
     * Initialize provider login component
     */
    init() {
        if (this.isInitialized) {
            console.warn('Provider login component already initialized');
            return;
        }

        this.setupEventListeners();
        this.isInitialized = true;
        console.log('Provider login component initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for login modal open
        const openHandler = (event) => {
            console.log('ProviderLoginComponent: Received openLogin event');
            this.openLoginModal();
        };

        document.addEventListener('provider:openLogin', openHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:openLogin', openHandler);
        });
    }

    /**
     * Open login modal
     */
    openLoginModal() {
        this.createLoginModal();
        this.animateModalIn();
    }

    /**
     * Create login modal HTML
     */
    createLoginModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('provider-login-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div id="provider-login-modal" class="provider-login-modal">
                <div class="modal-backdrop"></div>
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>Provider Login</h2>
                        <button class="modal-close" aria-label="Close login">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="login-form-container">
                            <div class="login-intro">
                                <h3>Welcome Back!</h3>
                                <p>Sign in to your provider account to manage your clinic profile and view analytics.</p>
                            </div>
                            
                            <form id="provider-login-form" class="login-form">
                                <div class="form-group">
                                    <label for="login-email">Email Address *</label>
                                    <input type="email" id="login-email" name="email" required 
                                           placeholder="Enter your email address">
                                    <div class="error-message" id="login-email-error"></div>
                                </div>

                                <div class="form-group">
                                    <label for="login-password">Password *</label>
                                    <input type="password" id="login-password" name="password" required 
                                           placeholder="Enter your password">
                                    <div class="error-message" id="login-password-error"></div>
                                </div>

                                <div class="form-options">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="rememberMe">
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#" class="forgot-password">Forgot password?</a>
                                </div>

                                <button type="submit" class="btn-primary btn-full">
                                    <span class="btn-text">Sign In</span>
                                    <span class="btn-loading" style="display: none;">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        Signing In...
                                    </span>
                                </button>
                            </form>
                            
                            <div class="login-footer">
                                <p>Don't have an account? 
                                    <a href="#" class="switch-to-register">Join as Provider</a>
                                </p>
                            </div>
                        </div>
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
        const modal = document.getElementById('provider-login-modal');
        if (!modal) return;

        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        const closeModal = () => this.closeLoginModal();
        
        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);

        // Form submission
        const form = modal.querySelector('#provider-login-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLoginSubmit(form);
        });

        // Switch to registration
        const switchToRegister = modal.querySelector('.switch-to-register');
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeLoginModal();
            setTimeout(() => {
                EventUtils.createCustomEvent('provider:openRegistration', {});
            }, 300);
        });

        // Forgot password
        const forgotPassword = modal.querySelector('.forgot-password');
        forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        // Form validation
        const inputs = form.querySelectorAll('input');
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
     * Handle login form submission
     * @param {Element} form - Form element
     */
    async handleLoginSubmit(form) {
        // Validate form
        if (!this.validateForm(form)) {
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        // Get form data
        const formData = new FormData(form);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };

        try {
            // Emit login event
            EventUtils.createCustomEvent('provider:login', loginData);

            // Wait for login to complete
            await new Promise((resolve) => {
                const successHandler = () => {
                    document.removeEventListener('provider:loginSuccess', successHandler);
                    document.removeEventListener('provider:loginError', errorHandler);
                    resolve();
                };

                const errorHandler = () => {
                    document.removeEventListener('provider:loginSuccess', successHandler);
                    document.removeEventListener('provider:loginError', errorHandler);
                    resolve();
                };

                document.addEventListener('provider:loginSuccess', successHandler);
                document.addEventListener('provider:loginError', errorHandler);
            });

        } catch (error) {
            console.error('Login submission error:', error);
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Validate form
     * @param {Element} form - Form element
     * @returns {boolean} Is valid
     */
    validateForm(form) {
        const emailInput = form.querySelector('#login-email');
        const passwordInput = form.querySelector('#login-password');
        
        let isValid = true;

        // Validate email
        if (!this.validateField(emailInput)) {
            isValid = false;
        }

        // Validate password
        if (!this.validateField(passwordInput)) {
            isValid = false;
        }

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

        // Password validation
        if (fieldName === 'password' && value && value.length < 8) {
            isValid = false;
            errorMessage = 'Password must be at least 8 characters long';
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
     * Set loading state
     * @param {boolean} isLoading - Loading state
     */
    setLoadingState(isLoading) {
        const modal = document.getElementById('provider-login-modal');
        if (!modal) return;

        const submitBtn = modal.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        if (isLoading) {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
        } else {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    /**
     * Handle forgot password
     */
    handleForgotPassword() {
        EventUtils.createCustomEvent('notification:show', {
            type: 'info',
            message: 'Password reset feature coming soon! Please contact support for assistance.'
        });
    }

    /**
     * Animate modal in
     */
    animateModalIn() {
        const modal = document.getElementById('provider-login-modal');
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
     * Close login modal
     */
    closeLoginModal() {
        const modal = document.getElementById('provider-login-modal');
        if (!modal) return;

        modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';

        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    /**
     * Destroy component
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        
        // Remove modal if exists
        const modal = document.getElementById('provider-login-modal');
        if (modal) {
            modal.remove();
        }
        
        this.isInitialized = false;
        console.log('Provider login component destroyed');
    }
}
