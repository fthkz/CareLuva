/**
 * Animation Manager - Single responsibility: Animation coordination and management
 */
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.isAnimationsEnabled = true;
        this.cleanupFunctions = [];
    }

    /**
     * Initialize animation manager
     */
    init() {
        this.setupGlobalAnimations();
        this.setupPerformanceOptimizations();
        console.log('Animation manager initialized');
    }

    /**
     * Setup global animations
     */
    setupGlobalAnimations() {
        // Setup button ripple effects
        this.setupButtonAnimations();
        
        // Setup scroll-based animations
        this.setupScrollAnimations();
        
        // Setup intersection observer animations
        this.setupIntersectionAnimations();
    }

    /**
     * Setup button animations
     */
    setupButtonAnimations() {
        const buttons = DOMUtils.getElements('button, .btn-primary, .btn-secondary, .btn-outline');
        
        buttons.forEach(button => {
            const handleClick = (event) => {
                if (this.isAnimationsEnabled) {
                    AnimationUtils.createRippleEffect(event, button);
                }
            };

            const cleanup = EventUtils.addEventListenerWithCleanup(button, 'click', handleClick);
            this.cleanupFunctions.push(cleanup);
        });
    }

    /**
     * Setup scroll-based animations
     */
    setupScrollAnimations() {
        const handleScroll = EventUtils.throttle(() => {
            if (!this.isAnimationsEnabled) return;
            
            // Trigger scroll-based animations
            this.triggerScrollAnimations();
        }, 16);

        const cleanup = EventUtils.addEventListenerWithCleanup(window, 'scroll', handleScroll);
        this.cleanupFunctions.push(cleanup);
    }

    /**
     * Setup intersection observer animations
     */
    setupIntersectionAnimations() {
        // Animate elements on scroll
        const animateElements = DOMUtils.getElements('.feature-card, .testimonial-card, .trust-content, .section-header');
        
        if (animateElements.length > 0) {
            const observer = IntersectionObserverUtil.observeMultipleWithAnimation(
                animateElements,
                'animate-in'
            );
            
            IntersectionObserverUtil.storeObserver('global-animations', observer);
        }
    }

    /**
     * Trigger scroll-based animations
     */
    triggerScrollAnimations() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Parallax effects
        this.updateParallaxElements(scrollY);
        
        // Progress indicators
        this.updateProgressIndicators(scrollY, windowHeight);
    }

    /**
     * Update parallax elements
     * @param {number} scrollY - Scroll position
     */
    updateParallaxElements(scrollY) {
        const parallaxElements = DOMUtils.getElements('[data-parallax]');
        
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    /**
     * Update progress indicators
     * @param {number} scrollY - Scroll position
     * @param {number} windowHeight - Window height
     */
    updateProgressIndicators(scrollY, windowHeight) {
        const progressElements = DOMUtils.getElements('[data-progress]');
        
        progressElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrollY;
            const elementHeight = rect.height;
            
            const progress = Math.max(0, Math.min(1, 
                (scrollY + windowHeight - elementTop) / (windowHeight + elementHeight)
            ));
            
            element.style.setProperty('--progress', progress);
        });
    }

    /**
     * Setup performance optimizations
     */
    setupPerformanceOptimizations() {
        // Reduce animations on low-end devices
        if (this.isLowEndDevice()) {
            this.disableAnimations();
        }

        // Pause animations when tab is not visible
        const handleVisibilityChange = () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        };

        const cleanup = EventUtils.addEventListenerWithCleanup(document, 'visibilitychange', handleVisibilityChange);
        this.cleanupFunctions.push(cleanup);
    }

    /**
     * Check if device is low-end
     * @returns {boolean} Is low-end device
     */
    isLowEndDevice() {
        // Simple heuristic for low-end devices
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const memory = navigator.deviceMemory;
        
        return (
            (connection && connection.effectiveType === 'slow-2g') ||
            (memory && memory <= 2) ||
            window.innerWidth < 768
        );
    }

    /**
     * Register animation
     * @param {string} name - Animation name
     * @param {Function} animationFunction - Animation function
     */
    registerAnimation(name, animationFunction) {
        this.animations.set(name, animationFunction);
    }

    /**
     * Play animation
     * @param {string} name - Animation name
     * @param {Object} options - Animation options
     */
    playAnimation(name, options = {}) {
        if (!this.isAnimationsEnabled) return;
        
        const animation = this.animations.get(name);
        if (animation) {
            animation(options);
        } else {
            console.warn(`Animation "${name}" not found`);
        }
    }

    /**
     * Stop animation
     * @param {string} name - Animation name
     */
    stopAnimation(name) {
        const animation = this.animations.get(name);
        if (animation && animation.stop) {
            animation.stop();
        }
    }

    /**
     * Enable animations
     */
    enableAnimations() {
        this.isAnimationsEnabled = true;
        document.body.classList.remove('animations-disabled');
    }

    /**
     * Disable animations
     */
    disableAnimations() {
        this.isAnimationsEnabled = false;
        document.body.classList.add('animations-disabled');
    }

    /**
     * Pause animations
     */
    pauseAnimations() {
        document.body.classList.add('animations-paused');
    }

    /**
     * Resume animations
     */
    resumeAnimations() {
        document.body.classList.remove('animations-paused');
    }

    /**
     * Animate element with custom animation
     * @param {Element} element - Target element
     * @param {string} animationType - Animation type
     * @param {Object} options - Animation options
     */
    animateElement(element, animationType, options = {}) {
        if (!this.isAnimationsEnabled || !element) return;

        switch (animationType) {
            case 'fadeIn':
                AnimationUtils.fadeIn(element, options.duration, options.callback);
                break;
            case 'fadeOut':
                AnimationUtils.fadeOut(element, options.duration, options.callback);
                break;
            case 'slideDown':
                AnimationUtils.slideDown(element, options.duration, options.callback);
                break;
            case 'slideUp':
                AnimationUtils.slideUp(element, options.duration, options.callback);
                break;
            case 'counter':
                AnimationUtils.animateCounter(
                    element, 
                    options.start, 
                    options.end, 
                    options.duration, 
                    options.isDecimal
                );
                break;
            default:
                console.warn(`Unknown animation type: ${animationType}`);
        }
    }

    /**
     * Destroy animation manager
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        
        this.animations.clear();
        IntersectionObserverUtil.removeObserver('global-animations');
        
        console.log('Animation manager destroyed');
    }
}
