// Response Time Calculator and Display
// Calculates average response times for clinics and professionals

class ResponseTimeCalculator {
    constructor() {
        this.fastThreshold = 2; // hours
        this.moderateThreshold = 24; // hours
    }

    // Calculate average response time from appointments
    calculateAverageResponseTime(appointments) {
        const confirmedAppointments = appointments.filter(apt => 
            apt.status === 'confirmed' && apt.responseTimeHours != null
        );

        if (confirmedAppointments.length === 0) {
            return null;
        }

        const totalResponseTime = confirmedAppointments.reduce((sum, apt) => 
            sum + (apt.responseTimeHours || 0), 0
        );

        return totalResponseTime / confirmedAppointments.length;
    }

    // Get response time indicator
    getResponseTimeIndicator(averageHours) {
        if (averageHours === null || averageHours === undefined) {
            return {
                label: 'No Data',
                color: '#9ca3af',
                icon: 'fas fa-question-circle',
                description: 'Insufficient data to calculate response time'
            };
        }

        if (averageHours <= this.fastThreshold) {
            return {
                label: 'Fast',
                color: '#10b981',
                icon: 'fas fa-bolt',
                description: `Average response time: ${averageHours.toFixed(1)} hours`
            };
        } else if (averageHours <= this.moderateThreshold) {
            return {
                label: 'Moderate',
                color: '#f59e0b',
                icon: 'fas fa-clock',
                description: `Average response time: ${averageHours.toFixed(1)} hours`
            };
        } else {
            return {
                label: 'Slow',
                color: '#ef4444',
                icon: 'fas fa-exclamation-triangle',
                description: `Average response time: ${averageHours.toFixed(1)} hours`
            };
        }
    }

    // Generate response time badge HTML
    generateResponseTimeBadge(averageHours, size = 'medium') {
        const indicator = this.getResponseTimeIndicator(averageHours);
        const sizeClasses = {
            small: '12px',
            medium: '14px',
            large: '16px'
        };
        const fontSize = sizeClasses[size] || sizeClasses.medium;

        return `
            <div style="
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: ${indicator.color}15;
                border: 1px solid ${indicator.color};
                border-radius: 6px;
                font-size: ${fontSize};
                font-weight: 600;
                color: ${indicator.color};
            " title="${indicator.description}">
                <i class="${indicator.icon}"></i>
                <span>${indicator.label} Response</span>
            </div>
        `;
    }

    // Calculate response time for a specific professional
    calculateProfessionalResponseTime(appointments, professionalId) {
        const professionalAppointments = appointments.filter(apt => 
            apt.professionalId === professionalId && 
            apt.status === 'confirmed' && 
            apt.responseTimeHours != null
        );

        return this.calculateAverageResponseTime(professionalAppointments);
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.ResponseTimeCalculator = ResponseTimeCalculator;
}

