/**
 * App ViewModel - Single responsibility: Managing application state and UI logic
 */
class AppViewModel {
    constructor() {
        this.state = {
            isInitialized: false,
            currentSection: 'home',
            isMobileMenuOpen: false,
            isLoading: false
        };
        this.observers = [];
    }

    /**
     * Initialize view model
     */
    init() {
        this.state.isInitialized = true;
        this.notifyObservers('initialized');
        console.log('App ViewModel initialized');
    }

    /**
     * Get current state
     * @returns {Object}
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Update state
     * @param {Object} newState - New state properties
     */
    setState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.notifyObservers('stateChanged', { oldState, newState: this.state });
    }

    /**
     * Set current section
     * @param {string} section - Section name
     */
    setCurrentSection(section) {
        this.setState({ currentSection: section });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        this.setState({ isMobileMenuOpen: !this.state.isMobileMenuOpen });
    }

    /**
     * Set loading state
     * @param {boolean} isLoading - Loading state
     */
    setLoading(isLoading) {
        this.setState({ isLoading });
    }

    /**
     * Add observer
     * @param {Function} callback - Observer callback
     */
    addObserver(callback) {
        this.observers.push(callback);
    }

    /**
     * Remove observer
     * @param {Function} callback - Observer callback
     */
    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    /**
     * Notify observers
     * @param {string} event - Event type
     * @param {Object} data - Event data
     */
    notifyObservers(event, data = {}) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Observer callback error:', error);
            }
        });
    }

    /**
     * Destroy view model
     */
    destroy() {
        this.observers = [];
        this.state = { isInitialized: false };
    }
}
