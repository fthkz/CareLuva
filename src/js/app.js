/**
 * CareLuva Application - Main entry point
 * Modular architecture following single responsibility principle
 */

// Global application instance
let appCoordinator = null;

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize the application coordinator
        appCoordinator = new AppCoordinator();
        appCoordinator.init();
        
        console.log('CareLuva application initialized successfully!');
        
        // Emit application ready event
        EventUtils.createCustomEvent('app:ready', {
            timestamp: Date.now(),
            version: '1.0.0'
        });
        
    } catch (error) {
        console.error('Failed to initialize CareLuva application:', error);
        
        // Show error notification if notification manager is available
        if (window.NotificationManager) {
            const notificationManager = new NotificationManager();
            notificationManager.init();
            notificationManager.error('Failed to load the application. Please refresh the page.');
        }
    }
});

/**
 * Cleanup application when page is unloaded
 */
window.addEventListener('beforeunload', function() {
    if (appCoordinator) {
        appCoordinator.destroy();
        appCoordinator = null;
    }
});

/**
 * Handle application errors
 */
window.addEventListener('error', function(event) {
    console.error('Application error:', event.error);
    
    if (appCoordinator) {
        const notificationManager = appCoordinator.getNotificationManager();
        if (notificationManager) {
            notificationManager.error('An unexpected error occurred. Please try again.');
        }
    }
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (appCoordinator) {
        const notificationManager = appCoordinator.getNotificationManager();
        if (notificationManager) {
            notificationManager.error('An unexpected error occurred. Please try again.');
        }
    }
});

/**
 * Export for global access
 */
window.CareLuva = {
    getAppCoordinator: () => appCoordinator,
    getComponent: (name) => appCoordinator ? appCoordinator.getComponent(name) : null,
    getManager: (name) => appCoordinator ? appCoordinator.getManager(name) : null,
    getViewModel: (name) => appCoordinator ? appCoordinator.getViewModel(name) : null
};
