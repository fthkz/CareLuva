/**
 * CareLuva Application Entry Point
 * Single responsibility: Application initialization and coordination
 */
class CareLuvaApp {
    constructor() {
        this.coordinator = null;
        this.isInitialized = false;
    }

    /**
     * Initialize application
     */
    init() {
        if (this.isInitialized) return;

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    /**
     * Initialize application components
     */
    initializeApp() {
        try {
            // Initialize the main coordinator
            this.coordinator = new AppCoordinator();
            this.coordinator.init();

            this.isInitialized = true;
            // CareLuva application initialized successfully!
        } catch (error) {
            // Failed to initialize CareLuva application
        }
    }

    /**
     * Get application coordinator
     * @returns {AppCoordinator}
     */
    getCoordinator() {
        return this.coordinator;
    }

    /**
     * Destroy application
     */
    destroy() {
        if (this.coordinator) {
            this.coordinator.destroy();
        }
        this.isInitialized = false;
    }
}

// Initialize application
const app = new CareLuvaApp();
app.init();

// Export for potential external use
window.CareLuvaApp = CareLuvaApp;
window.app = app;
