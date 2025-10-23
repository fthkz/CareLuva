/**
 * Authentication Manager - Single responsibility: Provider authentication and session management
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.authState = {
            isLoading: false,
            error: null,
            registrationStep: 1,
            verificationStatus: 'pending'
        };
        this.observers = new Map();
        this.cleanupFunctions = [];
        this.isInitialized = false;
    }

    /**
     * Initialize authentication manager
     */
    init() {
        if (this.isInitialized) {
            console.warn('Auth manager already initialized');
            return;
        }

        this.setupAuthStateObservers();
        this.loadStoredAuth();
        
        // Notify observers of initial state after loading stored auth
        if (this.isAuthenticated) {
            this.notifyObservers('isAuthenticated', this.isAuthenticated);
            this.notifyObservers('currentUser', this.currentUser);
        }
        
        this.setupAuthEventListeners();
        this.isInitialized = true;
        
        console.log('Auth manager initialized');
    }
    /**
     * Setup authentication state observers
     */
    setupAuthStateObservers() {
        // Observe authentication state changes
        this.observeAuthState('isAuthenticated', (isAuth) => {
            this.handleAuthStateChange(isAuth);
        });

        this.observeAuthState('currentUser', (user) => {
            this.handleUserStateChange(user);
        });
    }

    /**
     * Setup authentication event listeners
     */
    setupAuthEventListeners() {
        // Listen for provider registration events
        const registrationHandler = (event) => {
            this.handleProviderRegistration(event.detail);
        };

        document.addEventListener('provider:register', registrationHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:register', registrationHandler);
        });

        // Listen for login events
        const loginHandler = (event) => {
            this.handleProviderLogin(event.detail);
        };

        document.addEventListener('provider:login', loginHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:login', loginHandler);
        });
    }

    /**
     * Load stored authentication data
     */
    loadStoredAuth() {
        try {
            const storedUser = localStorage.getItem('careluva_provider_user');
            const storedAuth = localStorage.getItem('careluva_provider_auth');
            
            if (storedUser && storedAuth) {
                const user = JSON.parse(storedUser);
                const auth = JSON.parse(storedAuth);
                
                // Check if session is still valid (basic check)
                if (auth.expiresAt && Date.now() < auth.expiresAt) {
                    this.currentUser = user;
                    this.isAuthenticated = true;
                    this.authState.verificationStatus = user.verificationStatus || 'pending';
                    
                    console.log('Restored provider session:', user.email);
                } else {
                    this.clearStoredAuth();
                }
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
            this.clearStoredAuth();
        }
    }

    /**
     * Handle provider registration
     * @param {Object} registrationData - Registration form data
     */
    async handleProviderRegistration(registrationData) {
        this.setAuthLoading(true);
        this.clearAuthError();

        try {
            // Validate registration data
            const validationResult = this.validateRegistrationData(registrationData);
            if (!validationResult.isValid) {
                throw new Error(validationResult.errors.join(', '));
            }

            // Simulate API call for registration
            const registrationResult = await this.simulateProviderRegistration(registrationData);
            
            if (registrationResult.success) {
                // Store user data
                this.currentUser = registrationResult.user;
                this.isAuthenticated = true;
                this.authState.verificationStatus = 'pending';
                
                // Store in localStorage
                this.storeAuthData(registrationResult.user, registrationResult.auth);
                
                // Emit success event
                EventUtils.createCustomEvent('provider:registrationSuccess', {
                    user: registrationResult.user,
                    nextStep: 'verification'
                });

                console.log('Provider registration successful:', registrationResult.user.email);
            } else {
                throw new Error(registrationResult.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Provider registration error:', error);
            this.setAuthError(error.message);
            
            EventUtils.createCustomEvent('provider:registrationError', {
                error: error.message
            });
        } finally {
            this.setAuthLoading(false);
        }
    async handleProviderLogin(loginData) {
        this.setAuthLoading(true);
        this.clearAuthError();

        try {
            // Validate login data
            if (!loginData.email || !loginData.password) {
                throw new Error('Email and password are required');
            }

            // Simulate API call for login
            const loginResult = await this.simulateProviderLogin(loginData);
            
            if (loginResult.success) {
                // Store user data
                this.currentUser = loginResult.user;
                this.isAuthenticated = true;
                this.authState.verificationStatus = loginResult.user.verificationStatus || 'pending';
                
                // Notify observers
                this.notifyObservers('currentUser', this.currentUser);
                this.notifyObservers('isAuthenticated', this.isAuthenticated);
                
                // Store in localStorage
                this.storeAuthData(loginResult.user, loginResult.auth);
                
                // Emit success event
                EventUtils.createCustomEvent('provider:loginSuccess', {
                    user: loginResult.user
                });

                console.log('Provider login successful:', loginResult.user.email);
            } else {
                throw new Error(loginResult.error || 'Login failed');
            }
        } catch (error) {
            console.error('Provider login error:', error);
            this.setAuthError(error.message);
            
            EventUtils.createCustomEvent('provider:loginError', {
                error: error.message
            });
        } finally {
            this.setAuthLoading(false);
        }
    }                error: error.message
            });
        } finally {
            this.setAuthLoading(false);
        }
    }

    /**
     * Validate registration data
     * @param {Object} data - Registration data
     * @returns {Object} Validation result
     */
    validateRegistrationData(data) {
        const errors = [];
        
        // Required fields validation
        const requiredFields = [
            'email', 'password', 'confirmPassword', 'clinicName', 
            'contactPerson', 'phone', 'address', 'city', 'country'
        ];
        
        requiredFields.forEach(field => {
            if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
                errors.push(`${field} is required`);
            }
        });
        // Email validation
        if (data.email && !this.isValidEmail(data.email)) {
            errors.push('Invalid email format');
        }

        // Password validation
        if (data.password && data.password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        // Password confirmation
        if (data.password !== data.confirmPassword) {
            errors.push('Passwords do not match');
        }

        // Phone validation
        if (data.phone && !this.isValidPhone(data.phone)) {
            errors.push('Invalid phone number format');
        }

        return {
            isValid: errors.length === 0,
            errors
    async simulateProviderRegistration(data) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if email already exists (simulate)
        const existingUsers = this.getStoredUsers();
        if (existingUsers.some(user => user.email === data.email)) {
            return {
                success: false,
                error: 'Email already registered'
            };
        }

        // Create new user
        const newUser = {
            id: this.generateUserId(),
            email: data.email,
            passwordHash: btoa(data.password), // Simple encoding for simulation only
            clinicName: data.clinicName,
            contactPerson: data.contactPerson,
            phone: data.phone,
            address: data.address,
            city: data.city,
            country: data.country,
            providerType: data.providerType || 'clinic',
            registrationDate: new Date().toISOString(),
            verificationStatus: 'pending',
            profileComplete: false
        };

        // Store user
        this.storeUser(newUser);

        return {
            success: true,
            user: newUser,
            auth: {
                token: this.generateAuthToken(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            }
        };
    }            success: true,
            user: newUser,
            auth: {
                token: this.generateAuthToken(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            }
        };
    }

    /**
     * Simulate provider login API call
     * @param {Object} data - Login data
     * @returns {Promise<Object>} Login result
     */
    async simulateProviderLogin(data) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check credentials
        const users = this.getStoredUsers();
        const user = users.find(u => u.email === data.email);
        
        if (!user) {
            return {
                success: false,
                error: 'Invalid email or password'
            };
        }

        // In a real app, you'd verify the password hash
        // For simulation, we'll accept any password
        if (!data.password) {
            return {
                success: false,
                error: 'Password is required'
            };
        }

        return {
            success: true,
            user: user,
            auth: {
                token: this.generateAuthToken(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            }
        };
    }

    /**
     * Handle authentication state change
     * @param {boolean} isAuthenticated - Authentication status
     */
    handleAuthStateChange(isAuthenticated) {
        if (isAuthenticated) {
            document.body.classList.add('provider-authenticated');
            EventUtils.createCustomEvent('auth:providerAuthenticated', {
                user: this.currentUser
            });
        } else {
            document.body.classList.remove('provider-authenticated');
            EventUtils.createCustomEvent('auth:providerLoggedOut', {});
        }
    }

    /**
     * Handle user state change
     * @param {Object} user - User data
     */
    handleUserStateChange(user) {
        if (user) {
            EventUtils.createCustomEvent('auth:userUpdated', { user });
        }
    }

    /**
     * Set authentication loading state
     * @param {boolean} isLoading - Loading state
     */
    setAuthLoading(isLoading) {
        this.authState.isLoading = isLoading;
        this.notifyObservers('authState.isLoading', isLoading);
    }

    /**
     * Set authentication error
     * @param {string} error - Error message
     */
    setAuthError(error) {
        this.authState.error = error;
        this.notifyObservers('authState.error', error);
    }

    /**
     * Clear authentication error
     */
    clearAuthError() {
        this.authState.error = null;
        this.notifyObservers('authState.error', null);
    }

    /**
     * Store authentication data
     * @param {Object} user - User data
     * @param {Object} auth - Authentication data
     */
    storeAuthData(user, auth) {
        try {
            localStorage.setItem('careluva_provider_user', JSON.stringify(user));
            localStorage.setItem('careluva_provider_auth', JSON.stringify(auth));
        } catch (error) {
            console.error('Error storing auth data:', error);
        }
    }

    /**
     * Clear stored authentication data
     */
    clearStoredAuth() {
        try {
            localStorage.removeItem('careluva_provider_user');
            localStorage.removeItem('careluva_provider_auth');
        } catch (error) {
            console.error('Error clearing stored auth:', error);
        }
    }

    /**
     * Logout provider
     */
    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.authState.verificationStatus = 'pending';
        
        // Notify observers
        this.notifyObservers('currentUser', null);
        this.notifyObservers('isAuthenticated', false);
        
        this.clearStoredAuth();
        
        EventUtils.createCustomEvent('auth:providerLoggedOut', {});
        console.log('Provider logged out');
    }
    /**
     * Get stored users (for simulation)
     * @returns {Array} Stored users
     */
    getStoredUsers() {
        try {
            const stored = localStorage.getItem('careluva_provider_users');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error getting stored users:', error);
            return [];
        }
    }

    /**
     * Store user (for simulation)
     * @param {Object} user - User data
     */
    storeUser(user) {
        try {
            const users = this.getStoredUsers();
            users.push(user);
            localStorage.setItem('careluva_provider_users', JSON.stringify(users));
        } catch (error) {
            console.error('Error storing user:', error);
        }
    }

    /**
     * Generate user ID
     * @returns {string} User ID
     */
    generateUserId() {
        return 'provider_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate auth token
     * @returns {string} Auth token
     */
    generateAuthToken() {
        return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Validate email format
     * @param {string} email - Email address
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{6,15}$/; // Minimum 7 digits total
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }        return emailRegex.test(email);
    }

    /**
     * Validate phone format
     * @param {string} phone - Phone number
     * @returns {boolean} Is valid phone
     */
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    /**
     * Observe authentication state changes
     * @param {string} path - State path
     * @param {Function} callback - Callback function
     */
    observeAuthState(path, callback) {
        if (!this.observers.has(path)) {
            this.observers.set(path, []);
        }
        this.observers.get(path).push(callback);
    }

    /**
     * Notify observers of state changes
     * @param {string} path - State path
     * @param {*} value - New value
     */
    notifyObservers(path, value) {
        const observers = this.observers.get(path) || [];
        observers.forEach(callback => {
            try {
                callback(value);
            } catch (error) {
                console.error('Error in auth state observer:', error);
            }
        });
    }

    /**
     * Get current user
     * @returns {Object|null} Current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Is authenticated
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    /**
     * Get authentication state
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        
        this.observers.clear();
        this.currentUser = null;
        this.isAuthenticated = false;
        this.authState = {
            isLoading: false,
            error: null,
            registrationStep: 1,
            verificationStatus: 'pending'
        };
        this.isInitialized = false;
        
        console.log('Auth manager destroyed');
    }        
        this.observers.clear();
        this.currentUser = null;
        this.isAuthenticated = false;
        this.authState = null;
        this.isInitialized = false;
        
        console.log('Auth manager destroyed');
    }
}
