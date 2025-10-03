/**
 * Notification Manager - Single responsibility: Notification display and management
 */
class NotificationManager {
    constructor() {
        this.notifications = new Map();
        this.notificationQueue = [];
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        this.cleanupFunctions = [];
    }

    /**
     * Initialize notification manager
     */
    init() {
        this.setupNotificationContainer();
        this.setupGlobalHandlers();
        console.log('Notification manager initialized');
    }

    /**
     * Setup notification container
     */
    setupNotificationContainer() {
        let container = DOMUtils.getElement('.notification-container');
        
        if (!container) {
            container = DOMUtils.createElement('div', {
                className: 'notification-container'
            });
            
            // Add container styles
            this.addContainerStyles();
            
            document.body.appendChild(container);
        }
    }

    /**
     * Add notification container styles
     */
    addContainerStyles() {
        const containerStyles = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 3000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            }
            
            .notification {
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease, opacity 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                background-color: #10b981;
            }
            
            .notification-error {
                background-color: #ef4444;
            }
            
            .notification-warning {
                background-color: #f59e0b;
            }
            
            .notification-info {
                background-color: #2563eb;
            }
            
            .notification-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 1.2rem;
                opacity: 0.7;
                transition: opacity 0.2s ease;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                transition: width linear;
            }
        `;

        const styleSheet = DOMUtils.createElement('style', {}, containerStyles);
        document.head.appendChild(styleSheet);
    }

    /**
     * Setup global handlers
     */
    setupGlobalHandlers() {
        // Listen for custom notification events
        const cleanup = EventUtils.listenForCustomEvent('notification:show', (event) => {
            this.show(event.detail.message, event.detail.type, event.detail.options);
        });
        
        this.cleanupFunctions.push(cleanup);
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     * @param {Object} options - Notification options
     */
    show(message, type = 'info', options = {}) {
        const notificationId = this.generateNotificationId();
        const duration = options.duration || this.defaultDuration;
        const closable = options.closable !== false;
        const persistent = options.persistent || false;

        const notification = this.createNotification(notificationId, message, type, closable);
        
        this.notifications.set(notificationId, {
            element: notification,
            type: type,
            message: message,
            options: options,
            timer: null
        });

        this.addNotificationToContainer(notification);
        this.animateNotificationIn(notification);

        // Auto-remove notification if not persistent
        if (!persistent && duration > 0) {
            this.scheduleNotificationRemoval(notificationId, duration);
        }

        // Limit number of notifications
        this.limitNotifications();

        return notificationId;
    }

    /**
     * Create notification element
     * @param {string} id - Notification ID
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     * @param {boolean} closable - Is closable
     * @returns {Element} Notification element
     */
    createNotification(id, message, type, closable) {
        const notification = DOMUtils.createElement('div', {
            className: `notification notification-${type}`,
            'data-notification-id': id
        });

        const content = DOMUtils.createElement('div', {
            className: 'notification-content'
        }, message);

        DOMUtils.appendChild(notification, content);

        if (closable) {
            const closeButton = DOMUtils.createElement('button', {
                className: 'notification-close'
            }, '×');
            
            const closeHandler = () => {
                this.hide(id);
            };
            
            const cleanup = EventUtils.addEventListenerWithCleanup(closeButton, 'click', closeHandler);
            this.cleanupFunctions.push(cleanup);
            
            DOMUtils.appendChild(notification, closeButton);
        }

        return notification;
    }

    /**
     * Add notification to container
     * @param {Element} notification - Notification element
     */
    addNotificationToContainer(notification) {
        const container = DOMUtils.getElement('.notification-container');
        if (container) {
            container.appendChild(notification);
        }
    }

    /**
     * Animate notification in
     * @param {Element} notification - Notification element
     */
    animateNotificationIn(notification) {
        // Force reflow
        notification.offsetHeight;
        
        // Add show class
        DOMUtils.addClass(notification, 'show');
    }

    /**
     * Schedule notification removal
     * @param {string} notificationId - Notification ID
     * @param {number} duration - Duration in milliseconds
     */
    scheduleNotificationRemoval(notificationId, duration) {
        const notificationData = this.notifications.get(notificationId);
        if (!notificationData) return;

        const timer = setTimeout(() => {
            this.hide(notificationId);
        }, duration);

        notificationData.timer = timer;
    }

    /**
     * Hide notification
     * @param {string} notificationId - Notification ID
     */
    hide(notificationId) {
        const notificationData = this.notifications.get(notificationId);
        if (!notificationData) return;

        const notification = notificationData.element;
        
        // Clear timer if exists
        if (notificationData.timer) {
            clearTimeout(notificationData.timer);
        }

        // Animate out
        DOMUtils.removeClass(notification, 'show');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(notificationId);
        }, 300);
    }

    /**
     * Hide all notifications
     */
    hideAll() {
        this.notifications.forEach((notificationData, id) => {
            this.hide(id);
        });
    }

    /**
     * Limit number of notifications
     */
    limitNotifications() {
        if (this.notifications.size > this.maxNotifications) {
            const oldestId = this.notifications.keys().next().value;
            this.hide(oldestId);
        }
    }

    /**
     * Generate unique notification ID
     * @returns {string} Notification ID
     */
    generateNotificationId() {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Show success notification
     * @param {string} message - Success message
     * @param {Object} options - Notification options
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    /**
     * Show error notification
     * @param {string} message - Error message
     * @param {Object} options - Notification options
     */
    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    /**
     * Show warning notification
     * @param {string} message - Warning message
     * @param {Object} options - Notification options
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    /**
     * Show info notification
     * @param {string} message - Info message
     * @param {Object} options - Notification options
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    /**
     * Get notification count
     * @returns {number} Notification count
     */
    getNotificationCount() {
        return this.notifications.size;
    }

    /**
     * Get all notifications
     * @returns {Map} All notifications
     */
    getAllNotifications() {
        return new Map(this.notifications);
    }

    /**
     * Update notification message
     * @param {string} notificationId - Notification ID
     * @param {string} newMessage - New message
     */
    updateNotification(notificationId, newMessage) {
        const notificationData = this.notifications.get(notificationId);
        if (!notificationData) return;

        const content = DOMUtils.getElement('.notification-content', notificationData.element);
        if (content) {
            content.textContent = newMessage;
        }
    }

    /**
     * Destroy notification manager
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        
        this.hideAll();
        this.notifications.clear();
        this.notificationQueue = [];
        
        // Remove notification container
        const container = DOMUtils.getElement('.notification-container');
        if (container) {
            container.remove();
        }
        
        console.log('Notification manager destroyed');
    }
}
