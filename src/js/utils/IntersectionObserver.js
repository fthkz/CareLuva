/**
 * Intersection Observer Utility - Single responsibility: Intersection observer management
 */
class IntersectionObserverUtil {
    constructor() {
        this.observers = new Map();
        this.defaultOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
    }

    /**
     * Create intersection observer
     * @param {Function} callback - Callback function
     * @param {Object} options - Observer options
     * @returns {IntersectionObserver}
     */
    createObserver(callback, options = {}) {
        const observerOptions = { ...this.defaultOptions, ...options };
        return new IntersectionObserver(callback, observerOptions);
    }

    /**
     * Observe element with animation callback
     * @param {Element} element - Target element
     * @param {string} animationClass - CSS class to add on intersection
     * @param {Object} options - Observer options
     * @returns {IntersectionObserver}
     */
    observeWithAnimation(element, animationClass = 'animate-in', options = {}) {
        const observer = this.createObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(animationClass);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        observer.observe(element);
        return observer;
    }

    /**
     * Observe multiple elements with animation
     * @param {NodeList|Array} elements - Target elements
     * @param {string} animationClass - CSS class to add on intersection
     * @param {Object} options - Observer options
     * @returns {IntersectionObserver}
     */
    observeMultipleWithAnimation(elements, animationClass = 'animate-in', options = {}) {
        const observer = this.createObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(animationClass);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        elements.forEach(element => {
            observer.observe(element);
        });

        return observer;
    }

    /**
     * Observe element with custom callback
     * @param {Element} element - Target element
     * @param {Function} callback - Custom callback function
     * @param {Object} options - Observer options
     * @returns {IntersectionObserver}
     */
    observeWithCallback(element, callback, options = {}) {
        const observer = this.createObserver(callback, options);
        observer.observe(element);
        return observer;
    }

    /**
     * Observe element for counter animation
     * @param {Element} element - Target element
     * @param {Function} animationCallback - Animation function to call
     * @param {Object} options - Observer options
     * @returns {IntersectionObserver}
     */
    observeForCounterAnimation(element, animationCallback, options = {}) {
        const observerOptions = { threshold: 0.5, ...options };
        const observer = this.createObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animationCallback();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        observer.observe(element);
        return observer;
    }

    /**
     * Observe element for scroll-based effects
     * @param {Element} element - Target element
     * @param {Function} callback - Callback function
     * @param {Object} options - Observer options
     * @returns {IntersectionObserver}
     */
    observeForScrollEffects(element, callback, options = {}) {
        const observer = this.createObserver(callback, options);
        observer.observe(element);
        return observer;
    }

    /**
     * Disconnect observer
     * @param {IntersectionObserver} observer - Observer to disconnect
     */
    disconnect(observer) {
        if (observer) {
            observer.disconnect();
        }
    }

    /**
     * Disconnect all observers
     */
    disconnectAll() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
    }

    /**
     * Store observer for later management
     * @param {string} key - Unique key for observer
     * @param {IntersectionObserver} observer - Observer to store
     */
    storeObserver(key, observer) {
        this.observers.set(key, observer);
    }

    /**
     * Get stored observer
     * @param {string} key - Observer key
     * @returns {IntersectionObserver|null}
     */
    getObserver(key) {
        return this.observers.get(key) || null;
    }

    /**
     * Remove stored observer
     * @param {string} key - Observer key
     */
    removeObserver(key) {
        const observer = this.observers.get(key);
        if (observer) {
            observer.disconnect();
            this.observers.delete(key);
        }
    }
}

// Create global instance (if not already exists)
if (typeof window.IntersectionObserverUtil === 'undefined') {
    window.IntersectionObserverUtil = new IntersectionObserverUtil();
}