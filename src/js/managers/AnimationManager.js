/**
 * Animation Manager - Single responsibility: Managing all animations and intersection observers
 */
class AnimationManager {
    constructor() {
        this.intersectionObserver = null;
        this.animationElements = [];
        this.isInitialized = false;
    }

    /**
     * Initialize animation manager
     */
    init() {
        if (this.isInitialized) return;

        this.intersectionObserver = new IntersectionObserverUtil();
        this.setupAnimations();
        
        this.isInitialized = true;
        // Animation manager initialized
    }

    /**
     * Setup all animations
     */
    setupAnimations() {
        // Setup general animations for feature cards, testimonials, etc.
        this.intersectionObserver.observeForAnimation(
            '.feature-card, .testimonial-card, .trust-content, .section-header',
            'animate-in'
        );
    }

    /**
     * Add animation element
     * @param {string} selector - CSS selector
     * @param {string} animationClass - Animation class to add
     * @param {Object} options - Observer options
     */
    addAnimation(selector, animationClass = 'animate-in', options = {}) {
        this.intersectionObserver.observeForAnimation(selector, animationClass, options);
    }

    /**
     * Remove animation
     * @param {string} selector - CSS selector
     */
    removeAnimation(selector) {
        this.intersectionObserver.unobserve(selector);
    }

    /**
     * Animate element manually
     * @param {Element} element - Element to animate
     * @param {string} animationClass - Animation class
     */
    animateElement(element, animationClass = 'animate-in') {
        if (!element) return;
        DOMUtils.addClass(element, animationClass);
    }

    /**
     * Destroy manager and cleanup
     */
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnectAll();
        }
        this.isInitialized = false;
    }
}
