/**
 * Button Manager - Single responsibility: Managing button interactions and ripple effects
 */
class ButtonManager {
    constructor() {
        this.buttons = [];
        this.isInitialized = false;
    }

    /**
     * Initialize button manager
     */
    init() {
        if (this.isInitialized) return;

        this.buttons = DOMUtils.getElements('button, .btn-primary, .btn-secondary, .btn-outline');
        this.setupButtonEffects();
        this.addRippleStyles();
        
        this.isInitialized = true;
        console.log('Button manager initialized');
    }

    /**
     * Setup button effects
     */
    setupButtonEffects() {
        this.buttons.forEach(button => {
            DOMUtils.addEventListener(button, 'click', (e) => this.handleButtonClick(e));
        });
    }

    /**
     * Handle button click
     * @param {Event} event - Click event
     */
    handleButtonClick(event) {
        // Simple click handling without fancy effects
        console.log('Button clicked:', event.target.textContent);
    }

    /**
     * Add simple button styles
     */
    addRippleStyles() {
        // Removed fancy ripple effects for simplicity
        console.log('Button styles initialized');
    }

    /**
     * Add button to manager
     * @param {Element} button - Button element
     */
    addButton(button) {
        if (!button) return;
        
        DOMUtils.addEventListener(button, 'click', (e) => this.handleButtonClick(e));
        this.buttons.push(button);
    }

    /**
     * Remove button from manager
     * @param {Element} button - Button element
     */
    removeButton(button) {
        if (!button) return;
        
        DOMUtils.removeEventListener(button, 'click', this.handleButtonClick);
        
        const index = this.buttons.indexOf(button);
        if (index > -1) {
            this.buttons.splice(index, 1);
        }
    }

    /**
     * Destroy manager and cleanup
     */
    destroy() {
        this.buttons.forEach(button => {
            DOMUtils.removeEventListener(button, 'click', this.handleButtonClick);
        });

        this.isInitialized = false;
    }
}
