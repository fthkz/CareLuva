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
     * @param {string} selector - CSS selector
     * @param {string} animationClass - Class to add on intersection
     * @param {Object} options - Observer options
     */
    observeForAnimation(selector, animationClass = 'animate-in', options = {}) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;

        const observer = this.createObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(animationClass);
                }
            });
        }, options);

        elements.forEach(el => observer.observe(el));
        this.observers.set(selector, observer);
    }

    /**
     * Observe element with custom callback
     * @param {string} selector - CSS selector
     * @param {Function} callback - Custom callback function
     * @param {Object} options - Observer options
     */
    observeWithCallback(selector, callback, options = {}) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;

        const observer = this.createObserver(callback, options);
        elements.forEach(el => observer.observe(el));
        this.observers.set(selector, observer);
    }

    /**
     * Stop observing elements
     * @param {string} selector - CSS selector
     */
    unobserve(selector) {
        const observer = this.observers.get(selector);
        if (observer) {
            observer.disconnect();
            this.observers.delete(selector);
        }
    }

    /**
     * Stop all observers
     */
    disconnectAll() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }

    /**
     * Get observer by selector
     * @param {string} selector - CSS selector
     * @returns {IntersectionObserver|null}
     */
    getObserver(selector) {
        return this.observers.get(selector) || null;
    }
}
