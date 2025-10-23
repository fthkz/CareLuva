/**
 * Event Utilities - Single responsibility: Event handling helpers
 */
class EventUtils {
    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Execute immediately on first call
     * @returns {Function} Debounced function
     */
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Add event listener with automatic cleanup
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     * @returns {Function} Cleanup function
     */
    static addEventListenerWithCleanup(element, event, handler, options = {}) {
        if (!element) return () => {};

        element.addEventListener(event, handler, options);
        
        return () => {
            element.removeEventListener(event, handler, options);
        };
    }

    /**
     * Add multiple event listeners
     * @param {Element} element - Target element
     * @param {Object} events - Event types and handlers
     * @param {Object} options - Event options
     * @returns {Function} Cleanup function
     */
    static addMultipleEventListeners(element, events, options = {}) {
        if (!element) return () => {};

        const cleanupFunctions = [];
        
        Object.entries(events).forEach(([event, handler]) => {
            const cleanup = EventUtils.addEventListenerWithCleanup(element, event, handler, options);
            cleanupFunctions.push(cleanup);
        });
        
        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }

    /**
     * Handle form submission with validation
     * @param {Element} form - Form element
     * @param {Function} onSubmit - Submit handler
     * @param {Function} onError - Error handler
     * @returns {Function} Cleanup function
     */
    static handleFormSubmission(form, onSubmit, onError = null) {
        if (!form) return () => {};

        const handleSubmit = (event) => {
            event.preventDefault();
            
            try {
                const formData = new FormData(form);
                const data = {};
                for (const [key, value] of formData.entries()) {
                    if (data[key]) {
                        data[key] = Array.isArray(data[key])
                            ? [...data[key], value]
                            : [data[key], value];
                    } else {
                        data[key] = value;
                    }
                }
                onSubmit(data, form);
            } catch (error) {
                console.error('Form submission error:', error);
                if (onError) {
                    onError(error, form);
                }
            }
        };

        return EventUtils.addEventListenerWithCleanup(form, 'submit', handleSubmit);
    }
    /**
     * Handle click outside element
     * @param {Element} element - Target element
     * @param {Function} callback - Callback function
     * @returns {Function} Cleanup function
     */
    static handleClickOutside(element, callback) {
        if (!element) return () => {};

        const handleClick = (event) => {
            if (!element.contains(event.target)) {
                callback(event);
            }
        };

        // Defer to next tick to avoid capturing the initiating click
        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClick);
        }, 0);
        
        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClick);
        };
    }
    /**
     * Handle escape key press
     * @param {Function} callback - Callback function
     * @returns {Function} Cleanup function
     */
    static handleEscapeKey(callback) {
        const handleKeydown = (event) => {
            if (event.key === 'Escape') {
                callback(event);
            }
        };

        return EventUtils.addEventListenerWithCleanup(document, 'keydown', handleKeydown);
    }
    static debounce(func, wait, immediate = false) {
        let timeout;
        const executedFunction = function(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
        executedFunction.cancel = () => clearTimeout(timeout);
        return executedFunction;
    }

    static handleWindowResize(callback, delay = 250) {
        const debouncedCallback = EventUtils.debounce(callback, delay);
        const cleanup = EventUtils.addEventListenerWithCleanup(window, 'resize', debouncedCallback);
        return () => {
            debouncedCallback.cancel();
            cleanup();
        };
    }     * @param {number} delay - Debounce delay in milliseconds
     * @returns {Function} Cleanup function
     */
    static handleWindowResize(callback, delay = 250) {
        const debouncedCallback = EventUtils.debounce(callback, delay);
        return EventUtils.addEventListenerWithCleanup(window, 'resize', debouncedCallback);
    }
static throttle(func, limit) {
    let inThrottle;
    let timeoutId;
    const executedFunction = function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            timeoutId = setTimeout(() => inThrottle = false, limit);
        }
    };
    executedFunction.cancel = () => {
        clearTimeout(timeoutId);
        inThrottle = false;
    };
    return executedFunction;
}

static handleScroll(callback, limit = 16) {
    const throttledCallback = EventUtils.throttle(callback, limit);
    const cleanup = EventUtils.addEventListenerWithCleanup(window, 'scroll', throttledCallback);
    return () => {
        throttledCallback.cancel();
        cleanup();
    };
}     * @param {number} limit - Throttle limit in milliseconds
     * @returns {Function} Cleanup function
     */
    static handleScroll(callback, limit = 16) {
        const throttledCallback = EventUtils.throttle(callback, limit);
        return EventUtils.addEventListenerWithCleanup(window, 'scroll', throttledCallback);
    }

    /**
     * Create custom event
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail data
     * @param {Element} target - Target element (default: document)
     * @returns {CustomEvent}
     */
    static createCustomEvent(eventName, detail = {}, target = document) {
        const event = new CustomEvent(eventName, { detail });
        target.dispatchEvent(event);
        return event;
    }

    /**
     * Listen for custom event
     * @param {string} eventName - Event name
     * @param {Function} handler - Event handler
     * @param {Element} target - Target element (default: document)
     * @returns {Function} Cleanup function
     */
    static listenForCustomEvent(eventName, handler, target = document) {
        return EventUtils.addEventListenerWithCleanup(target, eventName, handler);
    }
}
