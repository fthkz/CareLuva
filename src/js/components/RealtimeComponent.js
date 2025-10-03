/**
 * Real-time Component - Live Healthcare Data and Notifications
 * Handles real-time updates, live counters, and notifications
 */
class RealtimeComponent {
    constructor() {
        this.isInitialized = false;
        this.counters = new Map();
        this.charts = new Map();
        this.notifications = [];
        this.updateInterval = null;
        this.notificationContainer = null;
        
        // Constants
        this.CONSTANTS = {
            UPDATE_INTERVAL: 5000,
            NOTIFICATION_DURATION: 5000,
            ANIMATION_DURATION: 1000,
            MAX_ACTIVITY_ITEMS: 5,
            NOTIFICATION_PROBABILITY: 0.3,
            COUNTER_VARIATION: 20
        };
        
        // Mock data for demonstration
        this.mockData = {
            activePatients: 1247,
            availableClinics: 523,
            completedTreatments: 8942,
            averageWaitTime: 12,
            successRate: 98.7,
            satisfactionScore: 4.9
        };
    }

    /**
     * Initialize real-time component
     */
    init() {
        if (this.isInitialized) return;

        try {
            this.setupNotificationContainer();
            this.setupCounters();
            this.setupCharts();
            this.setupActivityFeed();
            this.startRealTimeUpdates();
            
            this.isInitialized = true;
            console.log('Real-time component initialized');
        } catch (error) {
            console.error('Failed to initialize real-time component:', error);
            throw error;
        }
    }

    /**
     * Setup notification container
     */
    setupNotificationContainer() {
        // Create notification container if it doesn't exist
        this.notificationContainer = DOMUtils.getElement('.live-notifications');
        if (!this.notificationContainer) {
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.className = 'live-notifications';
            document.body.appendChild(this.notificationContainer);
        }
    }

    /**
     * Setup real-time counters
     */
    setupCounters() {
        const counterElements = DOMUtils.getElements('.realtime-counter-value');
        counterElements.forEach(element => {
            const key = element.dataset.counter || element.textContent;
            this.counters.set(key, {
                element: element,
                currentValue: parseInt(element.textContent) || 0,
                targetValue: parseInt(element.textContent) || 0
            });
        });
    }

    /**
     * Setup real-time charts
     */
    setupCharts() {
        const chartElements = DOMUtils.getElements('.realtime-chart');
        chartElements.forEach((element, index) => {
            this.charts.set(index, {
                element: element,
                data: this.generateMockChartData()
            });
        });
    }

    /**
     * Setup activity feed
     */
    setupActivityFeed() {
        const activityContainers = DOMUtils.getElements('.realtime-activity');
        activityContainers.forEach(container => {
            this.populateActivityFeed(container);
        });
    }

    /**
     * Start real-time updates
     */
    startRealTimeUpdates() {
        // Update counters every 5 seconds
        this.updateInterval = setInterval(() => {
            this.updateCounters();
            this.updateCharts();
            this.updateActivityFeed();
            this.generateRandomNotification();
        }, this.CONSTANTS.UPDATE_INTERVAL);

        // Initial update
        this.updateCounters();
        this.updateCharts();
    }

    /**
     * Update real-time counters
     */
    updateCounters() {
        this.counters.forEach((counter, key) => {
            // Generate new target value with small variations
            const variation = Math.floor(Math.random() * this.CONSTANTS.COUNTER_VARIATION) - (this.CONSTANTS.COUNTER_VARIATION / 2);
            counter.targetValue = Math.max(0, counter.currentValue + variation);
            
            // Animate to new value
            this.animateCounter(counter);
        });
    }

    /**
     * Animate counter value
     */
    animateCounter(counter) {
        const startValue = counter.currentValue;
        const endValue = counter.targetValue;
        const duration = this.CONSTANTS.ANIMATION_DURATION;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
            
            counter.element.textContent = this.formatNumber(currentValue);
            counter.currentValue = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Update real-time charts
     */
    updateCharts() {
        this.charts.forEach((chart, index) => {
            this.updateChart(chart);
        });
    }

    /**
     * Update individual chart
     */
    updateChart(chart) {
        const newData = this.generateMockChartData();
        chart.data = newData;
        
        // Update chart visualization
        this.renderChart(chart);
    }

    /**
     * Render chart visualization
     */
    renderChart(chart) {
        const chartElement = chart.element;
        const data = chart.data;
        
        // Clear existing chart content
        chartElement.innerHTML = '';
        
        // Create chart line
        const line = document.createElement('div');
        line.className = 'realtime-chart-line';
        chartElement.appendChild(line);
        
        // Create chart points
        const pointsContainer = document.createElement('div');
        pointsContainer.className = 'realtime-chart-points';
        chartElement.appendChild(pointsContainer);
        
        // Add data points
        data.forEach((value, index) => {
            const point = document.createElement('div');
            point.className = 'realtime-chart-point';
            point.style.left = `${(index / (data.length - 1)) * 100}%`;
            point.style.bottom = `${value}%`;
            pointsContainer.appendChild(point);
        });
    }

    /**
     * Update activity feed
     */
    updateActivityFeed() {
        const activityContainers = DOMUtils.getElements('.realtime-activity');
        activityContainers.forEach(container => {
            this.addActivityItem(container);
        });
    }

    /**
     * Add new activity item
     */
    addActivityItem(container) {
        const activities = [
            { icon: 'fas fa-user-plus', text: 'New patient registered', time: '1 min ago' },
            { icon: 'fas fa-check-circle', text: 'Treatment completed successfully', time: '2 min ago' },
            { icon: 'fas fa-star', text: 'New 5-star review received', time: '3 min ago' },
            { icon: 'fas fa-calendar', text: 'Appointment scheduled', time: '4 min ago' },
            { icon: 'fas fa-heart', text: 'Patient satisfaction improved', time: '5 min ago' }
        ];
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        
        const activityItem = document.createElement('div');
        activityItem.className = 'realtime-activity-item';
        activityItem.innerHTML = `
            <div class="realtime-activity-icon">
                <i class="${randomActivity.icon}"></i>
            </div>
            <div class="realtime-activity-text">${randomActivity.text}</div>
            <div class="realtime-activity-time">${randomActivity.time}</div>
        `;
        
        // Add to top of container
        container.insertBefore(activityItem, container.firstChild);
        
        // Remove old items (keep only 5)
        const items = DOMUtils.getElements('.realtime-activity-item', container);
        if (items.length > 5) {
            items[items.length - 1].remove();
        }
        
        // Animate new item
        DOMUtils.addClass(activityItem, 'animate-in');
    }

    /**
     * Populate activity feed with initial data
     */
    populateActivityFeed(container) {
        const initialActivities = [
            { icon: 'fas fa-user-plus', text: 'New patient registered', time: '1 min ago' },
            { icon: 'fas fa-check-circle', text: 'Treatment completed successfully', time: '2 min ago' },
            { icon: 'fas fa-star', text: 'New 5-star review received', time: '3 min ago' },
            { icon: 'fas fa-calendar', text: 'Appointment scheduled', time: '4 min ago' },
            { icon: 'fas fa-heart', text: 'Patient satisfaction improved', time: '5 min ago' }
        ];
        
        initialActivities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'realtime-activity-item';
            activityItem.innerHTML = `
                <div class="realtime-activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="realtime-activity-text">${activity.text}</div>
                <div class="realtime-activity-time">${activity.time}</div>
            `;
            container.appendChild(activityItem);
        });
    }

    /**
     * Generate random notification
     */
    generateRandomNotification() {
        if (Math.random() < 0.3) { // 30% chance
            const notifications = [
                { type: 'success', title: 'New Match Found', message: 'We found a perfect clinic match for your requirements!' },
                { type: 'info', title: 'Update Available', message: 'New features and improvements are now available.' },
                { type: 'success', title: 'Treatment Completed', message: 'Your scheduled treatment has been completed successfully.' },
                { type: 'info', title: 'Review Request', message: 'Please share your experience to help other patients.' }
            ];
            
            const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
            this.showNotification(randomNotification.title, randomNotification.message, randomNotification.type);
        }
    }

    /**
     * Show live notification
     */
    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'live-notification';
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="live-notification-header">
                <div class="live-notification-icon">
                    <i class="${iconMap[type] || iconMap.info}"></i>
                </div>
                <div class="live-notification-title">${title}</div>
                <button class="live-notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="live-notification-message">${message}</div>
        `;
        
        // Add close functionality
        const closeBtn = DOMUtils.getElement('.live-notification-close', notification);
        if (closeBtn) {
            DOMUtils.addEventListener(closeBtn, 'click', () => this.removeNotification(notification));
        }
        
        // Add to container
        this.notificationContainer.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);
        
        // Store reference
        this.notifications.push(notification);
    }

    /**
     * Remove notification
     */
    removeNotification(notification) {
        if (notification && notification.parentNode) {
            DOMUtils.addClass(notification, 'removing');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                const index = this.notifications.indexOf(notification);
                if (index > -1) {
                    this.notifications.splice(index, 1);
                }
            }, 300);
        }
    }

    /**
     * Generate mock chart data
     */
    generateMockChartData() {
        const data = [];
        const points = 8;
        
        for (let i = 0; i < points; i++) {
            const value = Math.random() * 80 + 10; // 10-90%
            data.push(value);
        }
        
        return data;
    }

    /**
     * Format number for display
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Update progress bars
     */
    updateProgressBars() {
        const progressBars = DOMUtils.getElements('.realtime-progress-fill');
        progressBars.forEach(bar => {
            const newWidth = Math.random() * 100;
            bar.style.width = `${newWidth}%`;
        });
    }

    /**
     * Destroy component and cleanup
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // Clear notifications
        this.notifications.forEach(notification => {
            this.removeNotification(notification);
        });
        this.notifications = [];
        
        // Clear maps
        this.counters.clear();
        this.charts.clear();
        
        // Remove notification container
        if (this.notificationContainer && this.notificationContainer.parentNode) {
            this.notificationContainer.parentNode.removeChild(this.notificationContainer);
            this.notificationContainer = null;
        }
        
        this.isInitialized = false;
        console.log('Real-time component destroyed');
    }
}
