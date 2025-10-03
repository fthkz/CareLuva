/**
 * App Coordinator - Single responsibility: Application flow and state coordination
 */
class AppCoordinator {
    constructor() {
        this.components = new Map();
        this.managers = new Map();
        this.viewModels = new Map();
        this.isInitialized = false;
        this.cleanupFunctions = [];
    }

    /**
     * Initialize application coordinator
     */
    init() {
        if (this.isInitialized) {
            console.warn('App coordinator already initialized');
            return;
        }

        this.initializeManagers();
        this.initializeComponents();
        this.initializeViewModels();
        this.setupGlobalEventHandlers();
        this.setupApplicationFlow();

        this.isInitialized = true;
        console.log('App coordinator initialized');
    }

    /**
     * Initialize managers
     */
    initializeManagers() {
        // Initialize animation manager
        const animationManager = new AnimationManager();
        animationManager.init();
        this.managers.set('animation', animationManager);

        // Initialize button manager
        const buttonManager = new ButtonManager();
        buttonManager.init();
        this.managers.set('button', buttonManager);

        // Initialize notification manager
        const notificationManager = new NotificationManager();
        notificationManager.init();
        this.managers.set('notification', notificationManager);
    }

    /**
     * Initialize components
     */
    initializeComponents() {
        // Initialize navigation component
        const navigationComponent = new NavigationComponent();
        navigationComponent.init();
        this.components.set('navigation', navigationComponent);

        // Initialize hero component
        const heroComponent = new HeroComponent();
        heroComponent.init();
        this.components.set('hero', heroComponent);

        // Initialize features component
        const featuresComponent = new FeaturesComponent();
        featuresComponent.init();
        this.components.set('features', featuresComponent);

        // Initialize trust component
        const trustComponent = new TrustComponent();
        trustComponent.init();
        this.components.set('trust', trustComponent);

        // Initialize testimonials component
        const testimonialsComponent = new TestimonialsComponent();
        testimonialsComponent.init();
        this.components.set('testimonials', testimonialsComponent);
    }

    /**
     * Initialize view models
     */
    initializeViewModels() {
        // Initialize app view model
        const appViewModel = new AppViewModel();
        appViewModel.init();
        this.viewModels.set('app', appViewModel);
    }

    /**
     * Setup global event handlers
     */
    setupGlobalEventHandlers() {
        // Handle form submissions
        this.setupFormHandlers();

        // Handle page visibility changes
        this.setupVisibilityHandlers();

        // Handle window resize
        this.setupResizeHandlers();

        // Handle custom events
        this.setupCustomEventHandlers();
    }

    /**
     * Setup form handlers
     */
    setupFormHandlers() {
        const forms = DOMUtils.getElements('form');
        
        forms.forEach(form => {
            const cleanup = EventUtils.handleFormSubmission(
                form,
                (data, formElement) => {
                    this.handleFormSubmission(data, formElement);
                },
                (error, formElement) => {
                    this.handleFormError(error, formElement);
                }
            );
            
            this.cleanupFunctions.push(cleanup);
        });
    }

    /**
     * Setup visibility handlers
     */
    setupVisibilityHandlers() {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                this.handlePageHidden();
            } else {
                this.handlePageVisible();
            }
        };

        const cleanup = EventUtils.addEventListenerWithCleanup(
            document, 
            'visibilitychange', 
            handleVisibilityChange
        );
        
        this.cleanupFunctions.push(cleanup);
    }

    /**
     * Setup resize handlers
     */
    setupResizeHandlers() {
        const handleResize = EventUtils.debounce(() => {
            this.handleWindowResize();
        }, 250);

        const cleanup = EventUtils.handleWindowResize(handleResize);
        this.cleanupFunctions.push(cleanup);
    }

    /**
     * Setup custom event handlers
     */
    setupCustomEventHandlers() {
        // Handle button clicks
        const buttonClickCleanup = EventUtils.listenForCustomEvent('button:click', (event) => {
            this.handleButtonClick(event.detail);
        });
        this.cleanupFunctions.push(buttonClickCleanup);

        // Handle navigation events
        const navigationCleanup = EventUtils.listenForCustomEvent('navigation:change', (event) => {
            this.handleNavigationChange(event.detail);
        });
        this.cleanupFunctions.push(navigationCleanup);
    }

    /**
     * Setup application flow
     */
    setupApplicationFlow() {
        // Initialize lazy loading
        this.setupLazyLoading();

        // Setup performance monitoring
        this.setupPerformanceMonitoring();

        // Setup error handling
        this.setupErrorHandling();
    }

    /**
     * Setup lazy loading
     */
    setupLazyLoading() {
        const images = DOMUtils.getElements('img[data-src]');
        
        if (images.length > 0) {
            const imageObserver = IntersectionObserverUtil.createObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }
        });
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.getNotificationManager().error('An unexpected error occurred. Please try again.');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.getNotificationManager().error('An unexpected error occurred. Please try again.');
        });
    }

    /**
     * Handle form submission
     * @param {Object} data - Form data
     * @param {Element} form - Form element
     */
    handleFormSubmission(data, form) {
        console.log('Form submitted:', data);
        
        // Show success notification
        this.getNotificationManager().success('Thank you for your interest! We\'ll be in touch soon.');
        
        // Reset form
        form.reset();
    }

    /**
     * Handle form error
     * @param {Error} error - Error object
     * @param {Element} form - Form element
     */
    handleFormError(error, form) {
        console.error('Form error:', error);
        this.getNotificationManager().error('There was an error submitting the form. Please try again.');
    }

    /**
     * Handle page hidden
     */
    handlePageHidden() {
        // Pause animations and timers
        const animationManager = this.getAnimationManager();
        if (animationManager) {
            animationManager.pauseAnimations();
        }
    }

    /**
     * Handle page visible
     */
    handlePageVisible() {
        // Resume animations and timers
        const animationManager = this.getAnimationManager();
        if (animationManager) {
            animationManager.resumeAnimations();
        }
    }

    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Update responsive components
        this.components.forEach(component => {
            if (component.handleResize) {
                component.handleResize();
            }
        });
    }

    /**
     * Handle button click
     * @param {Object} detail - Button click detail
     */
    handleButtonClick(detail) {
        const { buttonId, button } = detail;
        
        // Handle specific button actions
        if (button.dataset.action) {
            this.handleButtonAction(button.dataset.action, button);
        }
    }

    /**
     * Handle button action
     * @param {string} action - Button action
     * @param {Element} button - Button element
     */
    handleButtonAction(action, button) {
        switch (action) {
            case 'scroll-to-top':
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'toggle-menu':
                const navigationComponent = this.getComponent('navigation');
                if (navigationComponent) {
                    navigationComponent.toggleMobileMenu();
                }
                break;
            case 'show-video':
                const testimonialsComponent = this.getComponent('testimonials');
                if (testimonialsComponent) {
                    testimonialsComponent.showVideoModal();
                }
                break;
            default:
                console.log('Unknown button action:', action);
        }
    }

    /**
     * Handle navigation change
     * @param {Object} detail - Navigation change detail
     */
    handleNavigationChange(detail) {
        const { sectionId } = detail;
        
        // Update active navigation link
        const navigationComponent = this.getComponent('navigation');
        if (navigationComponent) {
            navigationComponent.updateActiveLink(sectionId);
        }
    }

    /**
     * Get component by name
     * @param {string} name - Component name
     * @returns {Object} Component instance
     */
    getComponent(name) {
        return this.components.get(name);
    }

    /**
     * Get manager by name
     * @param {string} name - Manager name
     * @returns {Object} Manager instance
     */
    getManager(name) {
        return this.managers.get(name);
    }

    /**
     * Get view model by name
     * @param {string} name - View model name
     * @returns {Object} View model instance
     */
    getViewModel(name) {
        return this.viewModels.get(name);
    }

    /**
     * Get animation manager
     * @returns {AnimationManager} Animation manager
     */
    getAnimationManager() {
        return this.getManager('animation');
    }

    /**
     * Get button manager
     * @returns {ButtonManager} Button manager
     */
    getButtonManager() {
        return this.getManager('button');
    }

    /**
     * Get notification manager
     * @returns {NotificationManager} Notification manager
     */
    getNotificationManager() {
        return this.getManager('notification');
    }

    /**
     * Destroy application coordinator
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];

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

        // Destroy all view models
        this.viewModels.forEach(viewModel => {
            if (viewModel.destroy) {
                viewModel.destroy();
            }
        });

        this.components.clear();
        this.managers.clear();
        this.viewModels.clear();
        this.isInitialized = false;

        console.log('App coordinator destroyed');
    }
}
