/**
 * Button Manager - Single responsibility: Button interactions and state management
 */
class ButtonManager {
    constructor() {
        this.buttons = new Map();
        this.buttonStates = new Map();
        this.cleanupFunctions = [];
    }

    /**
     * Initialize button manager
     */
    init() {
        this.setupButtonHandlers();
        this.setupButtonStates();
        console.log('Button manager initialized');
    }

    /**
     * Setup button event handlers
     */
    setupButtonHandlers() {
        const buttons = DOMUtils.getElements('button, .btn-primary, .btn-secondary, .btn-outline');
        
        buttons.forEach(button => {
            this.registerButton(button);
        });
    }

    /**
     * Register button with manager
     * @param {Element} button - Button element
     */
    registerButton(button) {
        const buttonId = this.generateButtonId(button);
        this.buttons.set(buttonId, button);
        this.buttonStates.set(buttonId, {
            isDisabled: false,
            isLoading: false,
            isActive: false
        });

        this.setupButtonEventHandlers(button, buttonId);
    }

    /**
     * Generate unique button ID
     * @param {Element} button - Button element
     * @returns {string} Button ID
     */
    generateButtonId(button) {
        return button.id || `btn-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Setup button event handlers
     * @param {Element} button - Button element
     * @param {string} buttonId - Button ID
     */
    setupButtonEventHandlers(button, buttonId) {
        const handleClick = (event) => {
            if (this.isButtonDisabled(buttonId)) {
                event.preventDefault();
                return;
            }

            this.handleButtonClick(button, buttonId, event);
        };

        const handleMouseEnter = () => {
            this.handleButtonHover(button, buttonId, true);
        };

        const handleMouseLeave = () => {
            this.handleButtonHover(button, buttonId, false);
        };

        const handleFocus = () => {
            this.handleButtonFocus(button, buttonId, true);
        };

        const handleBlur = () => {
            this.handleButtonFocus(button, buttonId, false);
        };

        const clickCleanup = EventUtils.addEventListenerWithCleanup(button, 'click', handleClick);
        const enterCleanup = EventUtils.addEventListenerWithCleanup(button, 'mouseenter', handleMouseEnter);
        const leaveCleanup = EventUtils.addEventListenerWithCleanup(button, 'mouseleave', handleMouseLeave);
        const focusCleanup = EventUtils.addEventListenerWithCleanup(button, 'focus', handleFocus);
        const blurCleanup = EventUtils.addEventListenerWithCleanup(button, 'blur', handleBlur);

        this.cleanupFunctions.push(clickCleanup, enterCleanup, leaveCleanup, focusCleanup, blurCleanup);
    }

    /**
     * Handle button click
     * @param {Element} button - Button element
     * @param {string} buttonId - Button ID
     * @param {Event} event - Click event
     */
    handleButtonClick(button, buttonId, event) {
        const state = this.buttonStates.get(buttonId);
        
        // Toggle active state for toggle buttons
        if (button.dataset.toggle === 'true') {
            this.toggleButtonState(buttonId);
        }

        // Handle loading state
        if (button.dataset.loading === 'true') {
            this.setButtonLoading(buttonId, true);
        }

        // Emit custom event
        EventUtils.createCustomEvent('button:click', {
            buttonId: buttonId,
            button: button,
            event: event
        });

        // Call custom click handler if defined
        const clickHandler = button.dataset.clickHandler;
        if (clickHandler && window[clickHandler]) {
            window[clickHandler](button, buttonId, event);
        }
    }

    /**
     * Handle button hover
     * @param {Element} button - Button element
     * @param {string} buttonId - Button ID
     * @param {boolean} isHovered - Is hovered state
     */
    handleButtonHover(button, buttonId, isHovered) {
        if (isHovered) {
            DOMUtils.addClass(button, 'hovered');
        } else {
            DOMUtils.removeClass(button, 'hovered');
        }

        EventUtils.createCustomEvent('button:hover', {
            buttonId: buttonId,
            button: button,
            isHovered: isHovered
        });
    }

    /**
     * Handle button focus
     * @param {Element} button - Button element
     * @param {string} buttonId - Button ID
     * @param {boolean} isFocused - Is focused state
     */
    handleButtonFocus(button, buttonId, isFocused) {
        if (isFocused) {
            DOMUtils.addClass(button, 'focused');
        } else {
            DOMUtils.removeClass(button, 'focused');
        }

        EventUtils.createCustomEvent('button:focus', {
            buttonId: buttonId,
            button: button,
            isFocused: isFocused
        });
    }

    /**
     * Setup button states
     */
    setupButtonStates() {
        const buttons = DOMUtils.getElements('button, .btn-primary, .btn-secondary, .btn-outline');
        
        buttons.forEach(button => {
            const buttonId = this.generateButtonId(button);
            
            // Set initial disabled state
            if (button.disabled || button.dataset.disabled === 'true') {
                this.setButtonDisabled(buttonId, true);
            }

            // Set initial loading state
            if (button.dataset.loading === 'true') {
                this.setButtonLoading(buttonId, true);
            }

            // Set initial active state
            if (button.dataset.active === 'true') {
                this.setButtonActive(buttonId, true);
            }
        });
    }

    /**
     * Set button disabled state
     * @param {string} buttonId - Button ID
     * @param {boolean} disabled - Disabled state
     */
    setButtonDisabled(buttonId, disabled) {
        const button = this.buttons.get(buttonId);
        const state = this.buttonStates.get(buttonId);
        
        if (button && state) {
            state.isDisabled = disabled;
            button.disabled = disabled;
            
            if (disabled) {
                DOMUtils.addClass(button, 'disabled');
            } else {
                DOMUtils.removeClass(button, 'disabled');
            }
        }
    }

    /**
     * Set button loading state
     * @param {string} buttonId - Button ID
     * @param {boolean} loading - Loading state
     */
    setButtonLoading(buttonId, loading) {
        const button = this.buttons.get(buttonId);
        const state = this.buttonStates.get(buttonId);
        
        if (button && state) {
            state.isLoading = loading;
            
            if (loading) {
                DOMUtils.addClass(button, 'loading');
                this.setButtonDisabled(buttonId, true);
                
                // Add loading spinner
                const spinner = DOMUtils.createElement('span', {
                    className: 'button-spinner'
                }, '<i class="fas fa-spinner fa-spin"></i>');
                
                button.appendChild(spinner);
            } else {
                DOMUtils.removeClass(button, 'loading');
                this.setButtonDisabled(buttonId, false);
                
                // Remove loading spinner
                const spinner = DOMUtils.getElement('.button-spinner', button);
                if (spinner) {
                    button.removeChild(spinner);
                }
            }
        }
    }

    /**
     * Set button active state
     * @param {string} buttonId - Button ID
     * @param {boolean} active - Active state
     */
    setButtonActive(buttonId, active) {
        const button = this.buttons.get(buttonId);
        const state = this.buttonStates.get(buttonId);
        
        if (button && state) {
            state.isActive = active;
            
            if (active) {
                DOMUtils.addClass(button, 'active');
            } else {
                DOMUtils.removeClass(button, 'active');
            }
        }
    }

    /**
     * Toggle button state
     * @param {string} buttonId - Button ID
     */
    toggleButtonState(buttonId) {
        const state = this.buttonStates.get(buttonId);
        if (state) {
            this.setButtonActive(buttonId, !state.isActive);
        }
    }

    /**
     * Check if button is disabled
     * @param {string} buttonId - Button ID
     * @returns {boolean} Is disabled
     */
    isButtonDisabled(buttonId) {
        const state = this.buttonStates.get(buttonId);
        return state ? state.isDisabled : false;
    }

    /**
     * Check if button is loading
     * @param {string} buttonId - Button ID
     * @returns {boolean} Is loading
     */
    isButtonLoading(buttonId) {
        const state = this.buttonStates.get(buttonId);
        return state ? state.isLoading : false;
    }

    /**
     * Check if button is active
     * @param {string} buttonId - Button ID
     * @returns {boolean} Is active
     */
    isButtonActive(buttonId) {
        const state = this.buttonStates.get(buttonId);
        return state ? state.isActive : false;
    }

    /**
     * Get button state
     * @param {string} buttonId - Button ID
     * @returns {Object} Button state
     */
    getButtonState(buttonId) {
        return this.buttonStates.get(buttonId) || {};
    }

    /**
     * Get all button states
     * @returns {Map} All button states
     */
    getAllButtonStates() {
        return new Map(this.buttonStates);
    }

    /**
     * Destroy button manager
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        
        this.buttons.clear();
        this.buttonStates.clear();
        
        console.log('Button manager destroyed');
    }
}
