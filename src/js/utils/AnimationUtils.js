/**
 * Animation Utilities - Single responsibility: Animation helpers
 */
class AnimationUtils {
    /**
     * Easing functions
     */
    static easing = {
        easeOutQuart: (t) => 1 - (--t) * t * t * t,
        easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        linear: (t) => t
    };

    /**
     * Animate counter from start to end value
     * @param {Element} element - Target element
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} duration - Animation duration in ms
     * @param {boolean} isDecimal - Whether to show decimal places
     * @param {Function} easing - Easing function
     */
    static animateCounter(element, start, end, duration, isDecimal = false, easing = AnimationUtils.easing.easeOutQuart) {
        if (!element) return;

        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (end - start) * easing(progress);
            element.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }

    /**
     * Animate element opacity
     * @param {Element} element - Target element
     * @param {number} from - Start opacity
     * @param {number} to - End opacity
     * @param {number} duration - Animation duration in ms
     * @param {Function} callback - Callback function
     */
    static animateOpacity(element, from, to, duration, callback) {
        if (!element) return;

        element.style.opacity = from;
        const startTime = performance.now();
        
        function updateOpacity(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = from + (to - from) * AnimationUtils.easing.easeInOut(progress);
            element.style.opacity = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateOpacity);
            } else if (callback) {
                callback();
            }
        }
        
        requestAnimationFrame(updateOpacity);
    }

    /**
     * Animate element transform
     * @param {Element} element - Target element
     * @param {string} from - Start transform
     * @param {string} to - End transform
     * @param {number} duration - Animation duration in ms
     * @param {Function} callback - Callback function
     */
    static animateTransform(element, from, to, duration, callback) {
        if (!element) return;

        element.style.transform = from;
        const startTime = performance.now();
        
        function updateTransform(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Simple linear interpolation for transform
            element.style.transform = progress < 1 ? from : to;
            
            if (progress < 1) {
                requestAnimationFrame(updateTransform);
            } else if (callback) {
                callback();
            }
        }
        
        requestAnimationFrame(updateTransform);
    }

    /**
     * Create ripple effect on button click
     * @param {Element} button - Button element
     * @param {Event} event - Click event
     */
    static createRippleEffect(button, event) {
        if (!button) return;

        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        button.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }
}
