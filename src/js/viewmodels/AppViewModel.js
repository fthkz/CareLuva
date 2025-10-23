/**
 * App View Model - Single responsibility: Application state and data management
 */
class AppViewModel {
    constructor() {
        this.state = {
            currentSection: 'home',
            isMenuOpen: false,
            isLoading: false,
            userPreferences: {
                animationsEnabled: true,
                theme: 'light',
                language: 'en'
            },
            pageData: {
                hero: null,
                features: [],
                trust: null,
                testimonials: []
            },
            providerAuth: {
                isAuthenticated: false,
                currentUser: null,
                verificationStatus: 'pending',
                isLoading: false,
                error: null
            }
        };
        this.observers = new Map();
        this.cleanupFunctions = [];
        this.isInitialized = false;
    }

    /**
     * Initialize app view model
     */
    init() {
        if (this.isInitialized) {
            console.warn('App view model already initialized');
            return;
        }

        this.loadInitialData();
        this.setupStateObservers();
        this.setupDataBindings();
        this.isInitialized = true;
        console.log('App view model initialized');
    }

    /**
     * Load initial data
     */
    loadInitialData() {
        // Load hero data
        this.loadHeroData();
        
        // Load features data
        this.loadFeaturesData();
        
        // Load trust data
        this.loadTrustData();
        
        // Load testimonials data
        this.loadTestimonialsData();
    }

    /**
     * Load hero data
     */
    loadHeroData() {
        const heroData = {
            title: 'Trusted Healthcare in Turkey',
            subtitle: 'Connect with verified clinics, doctors, and hospitals. Get transparent reviews, real patient stories, and trusted ratings for dental care, hair transplants, and more.',
            stats: [
                { number: '500+', label: 'Verified Clinics' },
                { number: '10,000+', label: 'Happy Patients' },
                { number: '9.2', label: 'Trust Score' }
            ]
        };
        
        this.updateState('pageData.hero', heroData);
    }

    /**
     * Load features data
     */
    loadFeaturesData() {
        const featuresData = [
            {
                icon: 'fas fa-shield-check',
                title: 'Verified Providers',
                description: 'Only licensed clinics with certifications, malpractice insurance, and proven experience make it to our platform.'
            },
            {
                icon: 'fas fa-star',
                title: 'Authentic Reviews',
                description: 'Real patient testimonials with video stories, before/after photos, and verified outcome tracking.'
            },
            {
                icon: 'fas fa-chart-line',
                title: 'Trust Score',
                description: 'Simple 1-10 rating combining reviews, outcomes, responsiveness, and certifications for easy decision making.'
            },
            {
                icon: 'fas fa-video',
                title: 'Clinic Walkthroughs',
                description: 'Visual tours of clinics and staff to familiarize patients and reduce uncertainty before treatment.'
            },
            {
                icon: 'fas fa-user-md',
                title: 'Provider Transparency',
                description: 'Real bios with education, certifications, patient feedback, and availability indicators.'
            },
            {
                icon: 'fas fa-headset',
                title: '24/7 Support',
                description: 'Dedicated support team to help you throughout your healthcare journey in Turkey.'
            }
        ];
        
        this.updateState('pageData.features', featuresData);
    }

    /**
     * Load trust data
     */
    loadTrustData() {
        const trustData = {
            title: 'Building Trust Through Verification',
            description: 'We rigorously verify every healthcare provider to ensure you receive the highest quality care. Our multi-step verification process includes:',
            listItems: [
                { text: 'Medical license verification', icon: 'fas fa-check' },
                { text: 'Malpractice insurance confirmation', icon: 'fas fa-check' },
                { text: 'Minimum 5 years experience requirement', icon: 'fas fa-check' },
                { text: 'Patient outcome tracking', icon: 'fas fa-check' },
                { text: 'Regular quality assessments', icon: 'fas fa-check' }
            ],
            badges: [
                { text: 'Certified', icon: 'fas fa-certificate' },
                { text: 'Insured', icon: 'fas fa-shield-alt' },
                { text: 'Verified', icon: 'fas fa-award' }
            ],
            score: '9.2'
        };
        
        this.updateState('pageData.trust', trustData);
    }

    /**
     * Load testimonials data
     */
    loadTestimonialsData() {
        const testimonialsData = [
            {
                rating: 5,
                content: 'The dental clinic I found through CareLuva exceeded all my expectations. The transparency and verification process gave me complete confidence.',
                author: 'Sarah M.',
                treatment: 'Dental Treatment'
            },
            {
                rating: 5,
                content: 'The hair transplant clinic had a perfect Trust Score and the walkthrough video helped me feel comfortable before arriving.',
                author: 'James L.',
                treatment: 'Hair Transplant'
            },
            {
                rating: 5,
                content: 'CareLuva\'s verification process and patient reviews made it easy to choose the right clinic for my cosmetic surgery.',
                author: 'Emma K.',
                treatment: 'Cosmetic Surgery'
            }
        ];
        
        this.updateState('pageData.testimonials', testimonialsData);
    }

    /**
     * Setup state observers
     */
    setupStateObservers() {
        // Observe current section changes
        this.observeState('currentSection', (newSection, oldSection) => {
            this.handleSectionChange(newSection, oldSection);
        });

        // Observe menu state changes
        this.observeState('isMenuOpen', (isOpen) => {
            this.handleMenuStateChange(isOpen);
        });

        // Observe loading state changes
        this.observeState('isLoading', (isLoading) => {
            this.handleLoadingStateChange(isLoading);
        });

        // Observe page data changes
        this.observeState('pageData', (pageData) => {
            this.updateComponentsWithData(pageData);
        });
    }

    /**
     * Setup data bindings
     */
    setupDataBindings() {
        // Setup data bindings between view model and components
        // This would typically bind data to UI components
        console.log('Data bindings setup');
    }

    /**
     * Valid state paths for validation
     */
    static get VALID_STATE_PATHS() {
        return new Set([
            'currentSection',
            'isMenuOpen',
            'isLoading',
            'userPreferences',
            'userPreferences.animationsEnabled',
            'userPreferences.theme',
            'userPreferences.language',
            'pageData',
            'pageData.hero',
            'pageData.features',
            'pageData.trust',
            'pageData.testimonials',
            'providerAuth',
            'providerAuth.isAuthenticated',
            'providerAuth.currentUser',
            'providerAuth.verificationStatus',
            'providerAuth.isLoading',
            'providerAuth.error'
        ]);
    }

    /**
     * Set state value by path
     * @param {string} path - State path
     * @param {*} value - Value to set
     */
    setStateValue(path, value) {
        if (!AppViewModel.VALID_STATE_PATHS.has(path)) {
            console.error(`Invalid state path: ${path}`);
            return;
        }
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (typeof obj[key] !== 'object' || obj[key] === null) {
                obj[key] = {};
            }
            return obj[key];
        }, this.state);
        target[lastKey] = value;
    }
    /**
     * Update state and notify observers
     * @param {string} path - State path
     * @param {*} value - New value
     */
    updateState(path, value) {
        const oldValue = this.getStateValue(path);
        this.setStateValue(path, value);
        this.notifyObservers(path, value, oldValue);
    }

    /**
     * Get state value by path
     * @param {string} path - State path
     * @returns {*} State value
     */
    getStateValue(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    /**
     * Observe state changes
     * @param {string} path - State path
     * @param {Function} callback - Callback function
     */
    observeState(path, callback) {
        if (!this.observers.has(path)) {
            this.observers.set(path, []);
        }
        this.observers.get(path).push(callback);
    }

    /**
     * Notify observers of state changes
     * @param {string} path - State path
     * @param {*} newValue - New value
     * @param {*} oldValue - Old value
     */
    notifyObservers(path, newValue, oldValue) {
        const observers = this.observers.get(path) || [];
        observers.forEach(callback => {
            try {
                callback(newValue, oldValue);
            } catch (error) {
                console.error('Error in state observer:', error);
            }
        });
    }

    /**
     * Handle section change
     * @param {string} newSection - New section
     * @param {string} oldSection - Old section
     */
    handleSectionChange(newSection, oldSection) {
        console.log(`Section changed from ${oldSection} to ${newSection}`);
        
        // Emit custom event
        EventUtils.createCustomEvent('navigation:change', {
            sectionId: newSection,
            oldSectionId: oldSection
        });
    }

    /**
     * Handle menu state change
     * @param {boolean} isOpen - Is menu open
     */
    handleMenuStateChange(isOpen) {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    /**
     * Handle loading state change
     * @param {boolean} isLoading - Is loading
     */
    handleLoadingStateChange(isLoading) {
        if (isLoading) {
            DOMUtils.addClass(document.body, 'loading');
        } else {
            DOMUtils.removeClass(document.body, 'loading');
        }
    }

    /**
     * Update components with data
     * @param {Object} pageData - Page data
     */
    updateComponentsWithData(pageData) {
        // This would typically update UI components with new data
        // For now, we'll just log the update
        console.log('Updating components with new data:', pageData);
    }

    /**
     * Set current section
     * @param {string} section - Section ID
     */
    setCurrentSection(section) {
        this.updateState('currentSection', section);
    }

    /**
     * Toggle menu state
     */
    toggleMenu() {
        this.updateState('isMenuOpen', !this.state.isMenuOpen);
    }

    /**
     * Set loading state
     * @param {boolean} isLoading - Is loading
     */
    setLoading(isLoading) {
        this.updateState('isLoading', isLoading);
    }

    /**
     * Update user preferences
     * @param {Object} preferences - User preferences
     */
    updateUserPreferences(preferences) {
        const newPreferences = { ...this.state.userPreferences, ...preferences };
        this.updateState('userPreferences', newPreferences);
    }

    /**
     * Get current state
     * @returns {Object} Current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Get page data
     * @returns {Object} Page data
     */
    getPageData() {
        return { ...this.state.pageData };
    }

    /**
     * Get user preferences
     * @returns {Object} User preferences
     */
    getUserPreferences() {
        return { ...this.state.userPreferences };
    }

    /**
     * Get provider authentication state
     * @returns {Object} Provider auth state
     */
    getProviderAuthState() {
        return { ...this.state.providerAuth };
    }

    /**
     * Set provider authentication state
     * @param {Object} authState - Authentication state
     */
    setProviderAuthState(authState) {
        this.updateState('providerAuth', { ...this.state.providerAuth, ...authState });
    }

    /**
     * Set provider user
     * @param {Object} user - Provider user data
     */
    setProviderUser(user) {
        this.updateState('providerAuth', {
            ...this.state.providerAuth,
            currentUser: user,
            isAuthenticated: !!user
        });
    }
    /**
     * Set provider verification status
     * @param {string} status - Verification status
     */
    setProviderVerificationStatus(status) {
        this.updateState('providerAuth.verificationStatus', status);
    }

    /**
     * Set provider loading state
     * @param {boolean} isLoading - Loading state
     */
    setProviderLoading(isLoading) {
        this.updateState('providerAuth.isLoading', isLoading);
    }

    /**
     * Set provider error
     * @param {string} error - Error message
     */
    setProviderError(error) {
        this.updateState('providerAuth.error', error);
    }

    /**
     * Clear provider error
     */
    clearProviderError() {
        this.updateState('providerAuth.error', null);
    }

    /**
     * Check if provider is authenticated
     * @returns {boolean} Is authenticated
     */
    isProviderAuthenticated() {
        return this.state.providerAuth.isAuthenticated;
    }

    /**
     * Get current provider user
     * @returns {Object|null} Current provider user
     */
    getCurrentProviderUser() {
        return this.state.providerAuth.currentUser;
    }

    /**
     * Destroy app view model
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        
        this.observers.clear();
        this.state = null;
        this.isInitialized = false;
        
        console.log('App view model destroyed');
    }
}