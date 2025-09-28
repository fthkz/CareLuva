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
        AnimationUtils.createRippleEffect(event.target, event);
    }

    /**
     * Add ripple effect styles
     */
    addRippleStyles() {
        const rippleStyles = `
            button, .btn-primary, .btn-secondary, .btn-outline {
                position: relative;
                overflow: hidden;
            }
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = rippleStyles;
        styleSheet.id = 'ripple-styles';
        document.head.appendChild(styleSheet);
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

        const styleSheet = document.getElementById('ripple-styles');
        if (styleSheet && document.head.contains(styleSheet)) {
            document.head.removeChild(styleSheet);
        }

        this.isInitialized = false;
    }
}
