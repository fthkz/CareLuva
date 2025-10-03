/**
 * DOM Utilities - Single responsibility: DOM manipulation helpers
 */
class DOMUtils {
    /**
     * Get element by selector with error handling
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (optional)
     * @returns {Element|null}
     */
    static getElement(selector, parent = document) {
        const element = parent.querySelector(selector);
        if (!element) {
            // Element not found
        }
        return element;
    }
    /**
     * Get all elements by selector
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (optional)
     * @returns {NodeList}
     */
    static getElements(selector, parent = document) {
        return parent.querySelectorAll(selector);
    }

    /**
     * Add event listener with error handling
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    static addEventListener(element, event, handler, options = {}) {
        if (!element) {
            // Cannot add event listener to null element
            return;
        }
        element.addEventListener(event, handler, options);
    }

    /**
     * Remove event listener
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     */
    static removeEventListener(element, event, handler) {
        if (!element) return;
        element.removeEventListener(event, handler);
    }

    /**
     * Toggle class on element
     * @param {Element} element - Target element
     * @param {string} className - Class name to toggle
     * @param {boolean} force - Force add/remove (optional)
     */
    static toggleClass(element, className, force) {
        if (!element) return;
        element.classList.toggle(className, force);
    }

    /**
     * Add class to element
     * @param {Element} element - Target element
     * @param {string} className - Class name to add
     */
    static addClass(element, className) {
        if (!element) return;
        element.classList.add(className);
    }

    /**
     * Remove class from element
     * @param {Element} element - Target element
     * @param {string} className - Class name to remove
     */
    static removeClass(element, className) {
        if (!element) return;
        element.classList.remove(className);
    }

    /**
     * Check if element has class
     * @param {Element} element - Target element
     * @param {string} className - Class name to check
     * @returns {boolean}
     */
    static hasClass(element, className) {
        return element ? element.classList.contains(className) : false;
    }

    /**
     * Set element style
     * @param {Element} element - Target element
     * @param {string} property - CSS property
     * @param {string} value - CSS value
     */
    static setStyle(element, property, value) {
        if (!element) return;
        element.style[property] = value;
    }

    /**
     * Get element style
     * @param {Element} element - Target element
     * @param {string} property - CSS property
     * @returns {string}
     */
    static getStyle(element, property) {
        return element ? element.style[property] : '';
    }
}
