/**
 * Animation Utilities - Single responsibility: Animation helpers
 */
class AnimationUtils {
    /**
     * Easing functions for smooth animations
     */
    static easing = {
        easeOutQuart: (t) => 1 - (--t) * t * t * t,
        easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeOut: (t) => 1 - Math.pow(1 - t, 3),
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
     * @param {Function} callback - Callback function (optional)
     */
    static animateOpacity(element, from, to, duration, callback = null) {
        if (!element) return;

        const startTime = performance.now();
        
        function updateOpacity(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = from + (to - from) * AnimationUtils.easing.easeOutQuart(progress);
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
     * @param {Function} callback - Callback function (optional)
     */
    static animateTransform(element, from, to, duration, callback = null) {
        if (!element) return;

        const startTime = performance.now();
        
        function updateTransform(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.transform = from;
            
            if (progress < 1) {
                requestAnimationFrame(updateTransform);
            } else {
                element.style.transform = to;
                if (callback) {
                    callback();
                }
            }
        }
        
        requestAnimationFrame(updateTransform);
    }

    /**
     * Create ripple effect on button click
     * @param {Event} event - Click event
     * @param {Element} button - Button element
     */
    static createRippleEffect(event, button) {
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
            if (button.contains(ripple)) {
                button.removeChild(ripple);
            }
        }, 600);
    }

    /**
     * Fade in element
     * @param {Element} element - Target element
     * @param {number} duration - Animation duration in ms
     * @param {Function} callback - Callback function (optional)
     */
    static fadeIn(element, duration = 300, callback = null) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        AnimationUtils.animateOpacity(element, 0, 1, duration, callback);
    }

    /**
     * Fade out element
     * @param {Element} element - Target element
     * @param {number} duration - Animation duration in ms
     * @param {Function} callback - Callback function (optional)
     */
    static fadeOut(element, duration = 300, callback = null) {
        if (!element) return;
        
        AnimationUtils.animateOpacity(element, 1, 0, duration, () => {
            element.style.display = 'none';
            if (callback) callback();
        });
    }

    /**
     * Slide down element
     * @param {Element} element - Target element
     * @param {number} duration - Animation duration in ms
     * @param {Function} callback - Callback function (optional)
     */
    static slideDown(element, duration = 300, callback = null) {
        if (!element) return;
        
        const height = element.scrollHeight;
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const startTime = performance.now();
        
        function updateHeight(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentHeight = height * AnimationUtils.easing.easeOutQuart(progress);
            element.style.height = currentHeight + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(updateHeight);
            } else {
                element.style.height = 'auto';
                element.style.overflow = '';
                if (callback) callback();
            }
        }
        
        requestAnimationFrame(updateHeight);
    }

    /**
     * Slide up element
     * @param {Element} element - Target element
     * @param {number} duration - Animation duration in ms
     * @param {Function} callback - Callback function (optional)
     */
    static slideUp(element, duration = 300, callback = null) {
        if (!element) return;
        
        const height = element.scrollHeight;
        element.style.height = height + 'px';
        element.style.overflow = 'hidden';
        
        const startTime = performance.now();
        
        function updateHeight(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentHeight = height * (1 - AnimationUtils.easing.easeOutQuart(progress));
            element.style.height = currentHeight + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(updateHeight);
            } else {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
                if (callback) callback();
            }
        }
        
        requestAnimationFrame(updateHeight);
    }
}
