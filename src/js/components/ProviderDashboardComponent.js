/**
 * Provider Dashboard Component - Single responsibility: Provider dashboard management
 */
class ProviderDashboardComponent {
    constructor() {
        this.currentView = 'overview';
        this.dashboardData = {
            overview: {
                totalPatients: 0,
                monthlyInquiries: 0,
                averageRating: 0,
                verificationStatus: 'pending'
            },
            profile: {
                clinicName: '',
                contactPerson: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                country: '',
                website: '',
                description: '',
                services: [],
                languages: [],
                photos: [],
                videos: []
            },
            analytics: {
                pageViews: 0,
                profileViews: 0,
                inquiryRate: 0,
                responseTime: 0,
                reviews: [],
                ratings: {
                    overall: 0,
                    communication: 0,
                    quality: 0,
                    value: 0
                }
            },
            patients: {
                inquiries: [],
                appointments: [],
                reviews: []
            }
        };
        this.isInitialized = false;
        this.cleanupFunctions = [];
    }

    /**
     * Initialize provider dashboard component
     */
    init() {
        if (this.isInitialized) {
            console.warn('Provider dashboard component already initialized');
            return;
        }

        this.setupEventListeners();
        this.loadDashboardData();
        this.isInitialized = true;
        console.log('Provider dashboard component initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for dashboard open events
        const openHandler = (event) => {
            this.openDashboard();
        };

        document.addEventListener('provider:openDashboard', openHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:openDashboard', openHandler);
        });

        // Listen for view changes
        const viewHandler = (event) => {
            this.switchView(event.detail.view);
        };

        document.addEventListener('dashboard:switchView', viewHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('dashboard:switchView', viewHandler);
        });

        // Listen for profile updates
        const updateHandler = (event) => {
            this.handleProfileUpdate(event.detail);
        };

        document.addEventListener('dashboard:updateProfile', updateHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('dashboard:updateProfile', updateHandler);
        });
    }

    /**
     * Load dashboard data
     */
    loadDashboardData() {
        // Load from localStorage or API
        const storedData = localStorage.getItem('careluva_provider_dashboard');
        if (storedData) {
            try {
                this.dashboardData = { ...this.dashboardData, ...JSON.parse(storedData) };
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }

        // Load current user data
        const currentUser = this.getCurrentProviderUser();
        if (currentUser) {
            this.dashboardData.profile = { ...this.dashboardData.profile, ...currentUser };
        }
    }

    /**
     * Get current provider user
     * @returns {Object|null} Current provider user
     */
    getCurrentProviderUser() {
        try {
            const storedUser = localStorage.getItem('careluva_provider_user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Error getting current provider user:', error);
            return null;
        }
    }

    /**
     * Open provider dashboard
     */
    openDashboard() {
        this.createDashboardModal();
        this.showView(this.currentView);
        this.animateModalIn();
    }

    /**
     * Create dashboard modal HTML
     */
    createDashboardModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('provider-dashboard-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div id="provider-dashboard-modal" class="provider-dashboard-modal">
                <div class="modal-backdrop"></div>
                <div class="modal-container">
                    <div class="modal-header">
                        <div class="header-content">
                            <h2>Provider Dashboard</h2>
                            <div class="user-info">
                                <span class="clinic-name">${this.dashboardData.profile.clinicName || 'Your Clinic'}</span>
                                <span class="verification-status ${this.dashboardData.overview.verificationStatus}">
                                    ${this.getVerificationStatusText(this.dashboardData.overview.verificationStatus)}
                                </span>
                            </div>
                        </div>
                        <button class="modal-close" aria-label="Close dashboard">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="dashboard-content">
                        <div class="dashboard-sidebar">
                            <nav class="dashboard-nav">
                                <button class="nav-item active" data-view="overview">
                                    <i class="fas fa-chart-pie"></i>
                                    <span>Overview</span>
                                </button>
                                <button class="nav-item" data-view="profile">
                                    <i class="fas fa-user-edit"></i>
                                    <span>Profile</span>
                                </button>
                                <button class="nav-item" data-view="analytics">
                                    <i class="fas fa-chart-line"></i>
                                    <span>Analytics</span>
                                </button>
                                <button class="nav-item" data-view="patients">
                                    <i class="fas fa-users"></i>
                                    <span>Patients</span>
                                </button>
                                <button class="nav-item" data-view="settings">
                                    <i class="fas fa-cog"></i>
                                    <span>Settings</span>
                                </button>
                            </nav>
                        </div>
                        
                        <div class="dashboard-main">
                            <div class="dashboard-view" id="dashboard-overview">
                                ${this.createOverviewView()}
                            </div>
                            
                            <div class="dashboard-view" id="dashboard-profile" style="display: none;">
                                ${this.createProfileView()}
                            </div>
                            
                            <div class="dashboard-view" id="dashboard-analytics" style="display: none;">
                                ${this.createAnalyticsView()}
                            </div>
                            
                            <div class="dashboard-view" id="dashboard-patients" style="display: none;">
                                ${this.createPatientsView()}
                            </div>
                            
                            <div class="dashboard-view" id="dashboard-settings" style="display: none;">
                                ${this.createSettingsView()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupDashboardEventListeners();
    }

    /**
     * Create overview view HTML
     */
    createOverviewView() {
        return `
            <div class="view-header">
                <h3>Dashboard Overview</h3>
                <p>Welcome back! Here's what's happening with your clinic.</p>
            </div>
            
            <div class="overview-stats">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-number">${this.dashboardData.overview.totalPatients}</span>
                        <span class="stat-label">Total Patients</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-number">${this.dashboardData.overview.monthlyInquiries}</span>
                        <span class="stat-label">Monthly Inquiries</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-number">${this.dashboardData.overview.averageRating}</span>
                        <span class="stat-label">Average Rating</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-shield-check"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-number">${this.getVerificationStatusText(this.dashboardData.overview.verificationStatus)}</span>
                        <span class="stat-label">Verification Status</span>
                    </div>
                </div>
            </div>
            
            <div class="overview-actions">
                <div class="action-card">
                    <h4>Quick Actions</h4>
                    <div class="action-buttons">
                        <button class="btn-primary" data-action="edit-profile">
                            <i class="fas fa-edit"></i>
                            Edit Profile
                        </button>
                        <button class="btn-secondary" data-action="view-analytics">
                            <i class="fas fa-chart-line"></i>
                            View Analytics
                        </button>
                        <button class="btn-secondary" data-action="manage-photos">
                            <i class="fas fa-camera"></i>
                            Manage Photos
                        </button>
                    </div>
                </div>
                
                <div class="action-card">
                    <h4>Recent Activity</h4>
                    <div class="activity-list">
                        <div class="activity-item">
                            <i class="fas fa-envelope"></i>
                            <span>New inquiry from Sarah M.</span>
                            <span class="activity-time">2 hours ago</span>
                        </div>
                        <div class="activity-item">
                            <i class="fas fa-star"></i>
                            <span>New 5-star review received</span>
                            <span class="activity-time">1 day ago</span>
                        </div>
                        <div class="activity-item">
                            <i class="fas fa-user"></i>
                            <span>Profile viewed 15 times</span>
                            <span class="activity-time">2 days ago</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create profile view HTML
     */
    createProfileView() {
        return `
            <div class="view-header">
                <h3>Clinic Profile</h3>
                <p>Manage your clinic information and appearance on CareLuva.</p>
            </div>
            
            <form class="profile-form" id="profile-form">
                <div class="form-section">
                    <h4>Basic Information</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="clinic-name">Clinic Name *</label>
                            <input type="text" id="clinic-name" name="clinicName" 
                                   value="${this.dashboardData.profile.clinicName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="contact-person">Contact Person *</label>
                            <input type="text" id="contact-person" name="contactPerson" 
                                   value="${this.dashboardData.profile.contactPerson || ''}" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="email">Email *</label>
                            <input type="email" id="email" name="email" 
                                   value="${this.dashboardData.profile.email || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone *</label>
                            <input type="tel" id="phone" name="phone" 
                                   value="${this.dashboardData.profile.phone || ''}" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="address">Address *</label>
                        <textarea id="address" name="address" required>${this.dashboardData.profile.address || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="city">City *</label>
                            <input type="text" id="city" name="city" 
                                   value="${this.dashboardData.profile.city || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="country">Country *</label>
                            <input type="text" id="country" name="country" 
                                   value="${this.dashboardData.profile.country || ''}" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="website">Website</label>
                        <input type="url" id="website" name="website" 
                               value="${this.dashboardData.profile.website || ''}" 
                               placeholder="https://yourclinic.com">
                    </div>
                </div>
                
                <div class="form-section">
                    <h4>Description & Services</h4>
                    <div class="form-group">
                        <label for="description">Clinic Description *</label>
                        <textarea id="description" name="description" required 
                                  placeholder="Tell patients about your clinic, specialties, and approach to care...">${this.dashboardData.profile.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Services Offered</label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="services" value="general-medicine" 
                                       ${this.dashboardData.profile.services?.includes('general-medicine') ? 'checked' : ''}>
                                <span>General Medicine</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="services" value="dentistry" 
                                       ${this.dashboardData.profile.services?.includes('dentistry') ? 'checked' : ''}>
                                <span>Dentistry</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="services" value="cosmetic-surgery" 
                                       ${this.dashboardData.profile.services?.includes('cosmetic-surgery') ? 'checked' : ''}>
                                <span>Cosmetic Surgery</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="services" value="hair-transplant" 
                                       ${this.dashboardData.profile.services?.includes('hair-transplant') ? 'checked' : ''}>
                                <span>Hair Transplant</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="services" value="dermatology" 
                                       ${this.dashboardData.profile.services?.includes('dermatology') ? 'checked' : ''}>
                                <span>Dermatology</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Languages Spoken</label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="languages" value="turkish" 
                                       ${this.dashboardData.profile.languages?.includes('turkish') ? 'checked' : ''}>
                                <span>Turkish</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="languages" value="english" 
                                       ${this.dashboardData.profile.languages?.includes('english') ? 'checked' : ''}>
                                <span>English</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="languages" value="arabic" 
                                       ${this.dashboardData.profile.languages?.includes('arabic') ? 'checked' : ''}>
                                <span>Arabic</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="languages" value="german" 
                                       ${this.dashboardData.profile.languages?.includes('german') ? 'checked' : ''}>
                                <span>German</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4>Media</h4>
                    <div class="form-group">
                        <label>Clinic Photos</label>
                        <div class="file-upload">
                            <input type="file" id="clinic-photos" name="clinicPhotos" 
                                   accept=".jpg,.jpeg,.png" multiple>
                            <label for="clinic-photos" class="file-upload-label">
                                <i class="fas fa-camera"></i>
                                <span>Upload Clinic Photos</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Clinic Video</label>
                        <div class="file-upload">
                            <input type="file" id="clinic-video" name="clinicVideo" 
                                   accept=".mp4,.mov,.avi">
                            <label for="clinic-video" class="file-upload-label">
                                <i class="fas fa-video"></i>
                                <span>Upload Clinic Video</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" data-action="cancel-profile">Cancel</button>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        `;
    }

    /**
     * Create analytics view HTML
     */
    createAnalyticsView() {
        return `
            <div class="view-header">
                <h3>Analytics & Performance</h3>
                <p>Track your clinic's performance and patient engagement.</p>
            </div>
            
            <div class="analytics-overview">
                <div class="analytics-card">
                    <h4>Profile Views</h4>
                    <div class="metric">
                        <span class="metric-value">${this.dashboardData.analytics.profileViews}</span>
                        <span class="metric-label">This Month</span>
                    </div>
                    <div class="metric-trend positive">
                        <i class="fas fa-arrow-up"></i>
                        <span>+12% from last month</span>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4>Inquiry Rate</h4>
                    <div class="metric">
                        <span class="metric-value">${this.dashboardData.analytics.inquiryRate}%</span>
                        <span class="metric-label">Conversion Rate</span>
                    </div>
                    <div class="metric-trend positive">
                        <i class="fas fa-arrow-up"></i>
                        <span>+5% from last month</span>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4>Response Time</h4>
                    <div class="metric">
                        <span class="metric-value">${this.dashboardData.analytics.responseTime}h</span>
                        <span class="metric-label">Average Response</span>
                    </div>
                    <div class="metric-trend negative">
                        <i class="fas fa-arrow-down"></i>
                        <span>-2h from last month</span>
                    </div>
                </div>
            </div>
            
            <div class="analytics-charts">
                <div class="chart-card">
                    <h4>Monthly Views</h4>
                    <div class="chart-placeholder">
                        <i class="fas fa-chart-bar"></i>
                        <p>Chart visualization would go here</p>
                    </div>
                </div>
                
                <div class="chart-card">
                    <h4>Patient Reviews</h4>
                    <div class="reviews-summary">
                        <div class="rating-breakdown">
                            <div class="rating-item">
                                <span>Overall</span>
                                <div class="rating-stars">
                                    ${this.createStarRating(this.dashboardData.analytics.ratings.overall)}
                                </div>
                                <span class="rating-value">${this.dashboardData.analytics.ratings.overall}</span>
                            </div>
                            <div class="rating-item">
                                <span>Communication</span>
                                <div class="rating-stars">
                                    ${this.createStarRating(this.dashboardData.analytics.ratings.communication)}
                                </div>
                                <span class="rating-value">${this.dashboardData.analytics.ratings.communication}</span>
                            </div>
                            <div class="rating-item">
                                <span>Quality</span>
                                <div class="rating-stars">
                                    ${this.createStarRating(this.dashboardData.analytics.ratings.quality)}
                                </div>
                                <span class="rating-value">${this.dashboardData.analytics.ratings.quality}</span>
                            </div>
                            <div class="rating-item">
                                <span>Value</span>
                                <div class="rating-stars">
                                    ${this.createStarRating(this.dashboardData.analytics.ratings.value)}
                                </div>
                                <span class="rating-value">${this.dashboardData.analytics.ratings.value}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create patients view HTML
     */
    createPatientsView() {
        return `
            <div class="view-header">
                <h3>Patient Management</h3>
                <p>Manage patient inquiries, appointments, and reviews.</p>
            </div>
            
            <div class="patients-tabs">
                <button class="tab-button active" data-tab="inquiries">Inquiries</button>
                <button class="tab-button" data-tab="appointments">Appointments</button>
                <button class="tab-button" data-tab="reviews">Reviews</button>
            </div>
            
            <div class="patients-content">
                <div class="tab-content active" id="inquiries-tab">
                    <div class="inquiries-list">
                        <div class="inquiry-item">
                            <div class="inquiry-header">
                                <div class="patient-info">
                                    <h5>Sarah M.</h5>
                                    <span class="inquiry-date">2 hours ago</span>
                                </div>
                                <span class="inquiry-status new">New</span>
                            </div>
                            <p class="inquiry-message">Hi, I'm interested in dental treatment. Could you please provide more information about your services and pricing?</p>
                            <div class="inquiry-actions">
                                <button class="btn-primary btn-sm">Respond</button>
                                <button class="btn-secondary btn-sm">Mark as Read</button>
                            </div>
                        </div>
                        
                        <div class="inquiry-item">
                            <div class="inquiry-header">
                                <div class="patient-info">
                                    <h5>James L.</h5>
                                    <span class="inquiry-date">1 day ago</span>
                                </div>
                                <span class="inquiry-status responded">Responded</span>
                            </div>
                            <p class="inquiry-message">Thank you for the information. I would like to schedule a consultation for next week.</p>
                            <div class="inquiry-actions">
                                <button class="btn-primary btn-sm">Schedule</button>
                                <button class="btn-secondary btn-sm">View Details</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-content" id="appointments-tab">
                    <div class="appointments-list">
                        <div class="appointment-item">
                            <div class="appointment-info">
                                <h5>Sarah M. - Dental Consultation</h5>
                                <span class="appointment-date">Tomorrow, 2:00 PM</span>
                            </div>
                            <div class="appointment-actions">
                                <button class="btn-primary btn-sm">Confirm</button>
                                <button class="btn-secondary btn-sm">Reschedule</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-content" id="reviews-tab">
                    <div class="reviews-list">
                        <div class="review-item">
                            <div class="review-header">
                                <div class="patient-info">
                                    <h5>Sarah M.</h5>
                                    <div class="review-rating">
                                        ${this.createStarRating(5)}
                                    </div>
                                </div>
                                <span class="review-date">1 week ago</span>
                            </div>
                            <p class="review-text">Excellent service! The staff was very professional and the treatment was exactly what I needed. Highly recommended!</p>
                            <div class="review-actions">
                                <button class="btn-secondary btn-sm">Reply</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create settings view HTML
     */
    createSettingsView() {
        return `
            <div class="view-header">
                <h3>Account Settings</h3>
                <p>Manage your account preferences and security settings.</p>
            </div>
            
            <div class="settings-sections">
                <div class="settings-section">
                    <h4>Account Information</h4>
                    <div class="settings-item">
                        <div class="setting-info">
                            <h5>Email Address</h5>
                            <p>${this.dashboardData.profile.email || 'Not set'}</p>
                        </div>
                        <button class="btn-secondary btn-sm">Change</button>
                    </div>
                    
                    <div class="settings-item">
                        <div class="setting-info">
                            <h5>Password</h5>
                            <p>Last changed 30 days ago</p>
                        </div>
                        <button class="btn-secondary btn-sm">Change</button>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h4>Notifications</h4>
                    <div class="settings-item">
                        <div class="setting-info">
                            <h5>Email Notifications</h5>
                            <p>Receive notifications about new inquiries and reviews</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="settings-item">
                        <div class="setting-info">
                            <h5>SMS Notifications</h5>
                            <p>Receive SMS alerts for urgent inquiries</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h4>Privacy & Security</h4>
                    <div class="settings-item">
                        <div class="setting-info">
                            <h5>Profile Visibility</h5>
                            <p>Control who can see your clinic profile</p>
                        </div>
                        <select class="setting-select">
                            <option value="public">Public</option>
                            <option value="verified">Verified Users Only</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h4>Danger Zone</h4>
                    <div class="settings-item">
                        <div class="setting-info">
                            <h5>Delete Account</h5>
                            <p>Permanently delete your account and all data</p>
                        </div>
                        <button class="btn-danger btn-sm">Delete Account</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create star rating HTML
     * @param {number} rating - Rating value
     * @returns {string} Star rating HTML
     */
    createStarRating(rating) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const starClass = i <= rating ? 'fas fa-star' : 'far fa-star';
            stars.push(`<i class="${starClass}"></i>`);
        }
        return stars.join('');
    }

    /**
     * Get verification status text
     * @param {string} status - Verification status
     * @returns {string} Status text
     */
    getVerificationStatusText(status) {
        switch (status) {
            case 'verified':
                return 'Verified';
            case 'pending':
                return 'Pending';
            case 'rejected':
                return 'Rejected';
            default:
                return 'Unknown';
        }
    }

    /**
     * Setup dashboard event listeners
     */
    setupDashboardEventListeners() {
        const modal = document.getElementById('provider-dashboard-modal');
        if (!modal) return;

        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        const closeModal = () => this.closeDashboard();
        
        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);

        // Navigation
        const navItems = modal.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.switchView(view);
            });
        });

        // Profile form
        const profileForm = modal.querySelector('#profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileSubmit(profileForm);
            });
        }

        // Quick actions
        const actionButtons = modal.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleQuickAction(button.dataset.action);
            });
        });

        // Tab navigation
        const tabButtons = modal.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });
    }

    /**
     * Switch dashboard view
     * @param {string} view - View name
     */
    switchView(view) {
        const modal = document.getElementById('provider-dashboard-modal');
        if (!modal) return;

        // Update navigation
        const navItems = modal.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        // Update views
        const views = modal.querySelectorAll('.dashboard-view');
        views.forEach(viewEl => {
            viewEl.style.display = viewEl.id === `dashboard-${view}` ? 'block' : 'none';
        });

        this.currentView = view;
    }

    /**
     * Switch tab in patients view
     * @param {string} tab - Tab name
     */
    switchTab(tab) {
        const modal = document.getElementById('provider-dashboard-modal');
        if (!modal) return;

        // Update tab buttons
        const tabButtons = modal.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tab);
        });

        // Update tab content
        const tabContents = modal.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tab}-tab`);
        });
    }

    /**
     * Handle profile form submission
     * @param {Element} form - Form element
     */
    handleProfileSubmit(form) {
        const formData = new FormData(form);
        const profileData = {};

        // Initialize arrays for multi-value fields
        profileData.services = [];
        profileData.languages = [];

        // Collect form data
        for (const [key, value] of formData.entries()) {
            if (key === 'services' || key === 'languages') {
                profileData[key].push(value);
            } else {
                profileData[key] = value;
            }
        }

        // Update dashboard data
        this.dashboardData.profile = { ...this.dashboardData.profile, ...profileData };

        // Save to localStorage
        this.saveDashboardData();

        // Show success message
        if (typeof EventUtils !== 'undefined') {
            EventUtils.createCustomEvent('notification:show', {
                type: 'success',
                message: 'Profile updated successfully!'
            });
        }

        console.log('Profile updated:', profileData);
    }
    /**
     * Handle quick actions
     * @param {string} action - Action name
     */
    handleQuickAction(action) {
        switch (action) {
            case 'edit-profile':
                this.switchView('profile');
                break;
            case 'view-analytics':
                this.switchView('analytics');
                break;
            case 'manage-photos':
                // Open photo management modal
                if (typeof EventUtils !== 'undefined') {
                    EventUtils.createCustomEvent('notification:show', {
                        type: 'info',
                        message: 'Photo management feature coming soon!'
                    });
                }
                break;
            default:
                console.log('Unknown quick action:', action);
        }
    }
    /**
     * Handle profile update
     * @param {Object} detail - Update detail
     */
    handleProfileUpdate(detail) {
        this.dashboardData.profile = { ...this.dashboardData.profile, ...detail };
        this.saveDashboardData();
    }

    /**
     * Save dashboard data
     */
    saveDashboardData() {
        try {
            localStorage.setItem('careluva_provider_dashboard', JSON.stringify(this.dashboardData));
        } catch (error) {
            console.error('Error saving dashboard data:', error);
        }
    }

    /**
     * Show specific view
     * @param {string} view - View name
     */
    showView(view) {
        this.switchView(view);
    }

    /**
     * Animate modal in
     */
    animateModalIn() {
        const modal = document.getElementById('provider-dashboard-modal');
        if (!modal) return;

        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        
        requestAnimationFrame(() => {
            modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });
    }

    /**
     * Close dashboard
     */
    closeDashboard() {
        const modal = document.getElementById('provider-dashboard-modal');
        if (!modal) return;

        modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';

        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    /**
     * Destroy component
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        
        // Remove modal if exists
        const modal = document.getElementById('provider-dashboard-modal');
        if (modal) {
            modal.remove();
        }
        
        this.isInitialized = false;
        console.log('Provider dashboard component destroyed');
    }
}
