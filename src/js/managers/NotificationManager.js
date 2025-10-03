/**
 * Notification Manager - Single responsibility: Managing notifications and user feedback
 */
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.isInitialized = false;
    }

    /**
     * Initialize notification manager
     */
    init() {
        if (this.isInitialized) return;

        this.addNotificationStyles();
        this.isInitialized = true;
        // Notification manager initialized
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     * @param {number} duration - Duration in milliseconds
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        this.addNotificationToDOM(notification);
        this.animateNotificationIn(notification);
        this.scheduleNotificationRemoval(notification, duration);
    }

    /**
     * Create notification element
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     * @returns {Element}
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        return notification;
    }

    /**
     * Add notification to DOM
     * @param {Element} notification - Notification element
     */
    addNotificationToDOM(notification) {
        document.body.appendChild(notification);
        this.notifications.push(notification);
    }

    /**
     * Animate notification in
     * @param {Element} notification - Notification element
     */
    animateNotificationIn(notification) {
        setTimeout(() => {
            DOMUtils.addClass(notification, 'show');
        }, 100);
    }

    /**
     * Schedule notification removal
     * @param {Element} notification - Notification element
     * @param {number} duration - Duration in milliseconds
     */
    scheduleNotificationRemoval(notification, duration) {
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
    }

    /**
     * Remove notification
     * @param {Element} notification - Notification element
     */
    removeNotification(notification) {
        DOMUtils.removeClass(notification, 'show');
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
            
            // Remove from notifications array
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    /**
     * Clear all notifications
     */
    clearAllNotifications() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification);
        });
    }

    /**
     * Add notification styles
     */
    addNotificationStyles() {
        const notificationStyles = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 3000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            .notification-success {
                background-color: #10b981;
            }
            .notification-error {
                background-color: #ef4444;
            }
            .notification-info {
                background-color: #2563eb;
            }
            .notification.show {
                transform: translateX(0);
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = notificationStyles;
        styleSheet.id = 'notification-styles';
        document.head.appendChild(styleSheet);
    }

    /**
     * Destroy manager and cleanup
     */
    destroy() {
        this.clearAllNotifications();
        
        const styleSheet = document.getElementById('notification-styles');
        if (styleSheet && document.head.contains(styleSheet)) {
            document.head.removeChild(styleSheet);
        }
        
        this.isInitialized = false;
    }
}
