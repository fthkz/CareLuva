/**
 * App Coordinator - Single responsibility: Orchestrating application flow and component coordination
 */
class AppCoordinator {
    constructor() {
        this.components = new Map();
        this.managers = new Map();
        this.viewModel = null;
        this.isInitialized = false;
    }

    /**
     * Initialize application coordinator
     */
    init() {
        if (this.isInitialized) return;

        this.initializeViewModel();
        this.initializeManagers();
        this.initializeComponents();
        this.setupEventListeners();
        
        this.isInitialized = true;
        // App Coordinator initialized
    }

    /**
     * Initialize view model
     */
    initializeViewModel() {
        this.viewModel = new AppViewModel();
        this.viewModel.init();
    }

    /**
     * Initialize managers
     */
    initializeManagers() {
        // Animation Manager
        const animationManager = new AnimationManager();
        animationManager.init();
        this.managers.set('animation', animationManager);

        // Notification Manager
        const notificationManager = new NotificationManager();
        notificationManager.init();
        this.managers.set('notification', notificationManager);

        // Button Manager
        const buttonManager = new ButtonManager();
        buttonManager.init();
        this.managers.set('button', buttonManager);
    }

    /**
     * Initialize components
     */
    initializeComponents() {
        // Navigation Component
        const navigationComponent = new NavigationComponent();
        navigationComponent.init();
        this.components.set('navigation', navigationComponent);

        // Hero Component
        const heroComponent = new HeroComponent();
        heroComponent.init();
        this.components.set('hero', heroComponent);

        // Trust Component
        const trustComponent = new TrustComponent();
        trustComponent.init();
        this.components.set('trust', trustComponent);

        // Video Modal Component
        const videoModalComponent = new VideoModalComponent();
        videoModalComponent.init();
        this.components.set('videoModal', videoModalComponent);

        // AI Matching Component
        const aiMatchingComponent = new AIMatchingComponent();
        aiMatchingComponent.init();
        this.components.set('aiMatching', aiMatchingComponent);

        // Real-time Component
        const realtimeComponent = new RealtimeComponent();
        realtimeComponent.init();
        this.components.set('realtime', realtimeComponent);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen to view model changes
        this.viewModel.addObserver((event, data) => {
            this.handleViewModelChange(event, data);
        });

        // Setup form handling
        this.setupFormHandling();
    }

    /**
     * Handle view model changes
     * @param {string} event - Event type
     * @param {Object} data - Event data
     */
    handleViewModelChange(event, data) {
        switch (event) {
            case 'stateChanged':
                this.handleStateChange(data);
                break;
            case 'initialized':
                // App ViewModel initialized
                break;
        }
    }

    /**
     * Handle state changes
     * @param {Object} data - State change data
     */
    handleStateChange(data) {
        const { newState } = data;
        
        // Handle mobile menu state
        if (newState.isMobileMenuOpen !== undefined) {
            const navigationComponent = this.components.get('navigation');
            if (navigationComponent && newState.isMobileMenuOpen) {
                navigationComponent.toggleMobileMenu();
            }
        }

        // Handle loading state
        if (newState.isLoading !== undefined) {
            this.handleLoadingState(newState.isLoading);
        }
    }

    /**
     * Handle loading state
     * @param {boolean} isLoading - Loading state
     */
    handleLoadingState(isLoading) {
        if (isLoading) {
            DOMUtils.addClass(document.body, 'loading');
        } else {
            DOMUtils.removeClass(document.body, 'loading');
        }
    }

    /**
     * Setup form handling
     */
    setupFormHandling() {
        const forms = DOMUtils.getElements('form');
        const notificationManager = this.managers.get('notification');
        
        forms.forEach(form => {
            DOMUtils.addEventListener(form, 'submit', (e) => {
                e.preventDefault();
                if (notificationManager) {
                    notificationManager.showNotification(
                        'Thank you for your interest! We\'ll be in touch soon.',
                        'success'
                    );
                }
            });
        });
    }

    /**
     * Get component by name
     * @param {string} name - Component name
     * @returns {Object|null}
     */
    getComponent(name) {
        return this.components.get(name) || null;
    }

    /**
     * Get manager by name
     * @param {string} name - Manager name
     * @returns {Object|null}
     */
    getManager(name) {
        return this.managers.get(name) || null;
    }

    /**
     * Get view model
     * @returns {AppViewModel}
     */
    getViewModel() {
        return this.viewModel;
    }

    /**
     * Destroy coordinator and cleanup
     */
    destroy() {
        // Destroy all components
        this.components.forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });

        // Destroy all managers
        this.managers.forEach(manager => {
            if (manager.destroy) {
                manager.destroy();
            }
        });

        // Destroy view model
        if (this.viewModel) {
            this.viewModel.destroy();
        }

        this.components.clear();
        this.managers.clear();
        this.isInitialized = false;
    }
}
