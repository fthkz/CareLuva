/**
 * AI Matching Component - Advanced Healthcare Matching System
 * Handles AI-powered clinic and doctor matching functionality
 */
class AIMatchingComponent {
    constructor() {
        this.isInitialized = false;
        this.matchingForm = null;
        this.processingElement = null;
        this.resultsElement = null;
        this.matchButton = null;
        this.isProcessing = false;
        
        // Constants
        this.CONSTANTS = {
            PROCESSING_DELAY: 3000,
            MAX_RESULTS: 3,
            MIN_SCORE_VARIATION: -0.5,
            MAX_SCORE_VARIATION: 0.5,
            SCORE_MULTIPLIER: 0.4
        };
        
        // Mock data for demonstration
        this.mockClinics = [
            {
                id: 1,
                name: "Istanbul Dental Excellence",
                specialty: "Dental Care",
                score: 9.8,
                description: "Leading dental clinic with 15+ years experience in cosmetic and restorative dentistry.",
                features: ["Implants", "Veneers", "Orthodontics", "24/7 Support"],
                location: "Istanbul, Turkey",
                priceRange: "$$$"
            },
            {
                id: 2,
                name: "Ankara Hair Restoration Center",
                specialty: "Hair Transplant",
                score: 9.5,
                description: "Specialized hair transplant clinic using FUE and DHI techniques with natural results.",
                features: ["FUE Technique", "DHI Method", "PRP Treatment", "Free Consultation"],
                location: "Ankara, Turkey",
                priceRange: "$$"
            },
            {
                id: 3,
                name: "Izmir Cosmetic Surgery Institute",
                specialty: "Cosmetic Surgery",
                score: 9.2,
                description: "Premium cosmetic surgery center offering comprehensive aesthetic procedures.",
                features: ["Rhinoplasty", "Breast Surgery", "Liposuction", "Recovery Support"],
                location: "Izmir, Turkey",
                priceRange: "$$$"
            }
        ];
    }

    /**
     * Initialize AI matching component
     */
    init() {
        if (this.isInitialized) return;

        this.matchingForm = DOMUtils.getElement('.ai-matching-form');
        this.processingElement = DOMUtils.getElement('.ai-processing');
        this.resultsElement = DOMUtils.getElement('.ai-results');
        this.matchButton = DOMUtils.getElement('.ai-match-btn');

        this.setupEventListeners();
        this.setupFormValidation();
        
        this.isInitialized = true;
        // AI Matching component initialized
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (this.matchButton) {
            DOMUtils.addEventListener(this.matchButton, 'click', (e) => this.handleMatching(e));
        }

        // Form input validation
        const formInputs = DOMUtils.getElements('.ai-matching-form input, .ai-matching-form select, .ai-matching-form textarea');
        formInputs.forEach(input => {
            DOMUtils.addEventListener(input, 'input', () => this.validateForm());
        });
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        if (!this.matchingForm) return;

        // Add real-time validation
        const requiredFields = DOMUtils.getElements('.ai-matching-form [required]');
        requiredFields.forEach(field => {
            DOMUtils.addEventListener(field, 'blur', () => this.validateField(field));
        });
    }

    /**
     * Handle AI matching process
     */
    async handleMatching(e) {
        e.preventDefault();
        
        if (this.isProcessing) return;

        try {
            const formData = this.getFormData();
            if (!this.validateFormData(formData)) {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }

            this.startProcessing();
            
            // Simulate AI processing time
            await this.simulateAIProcessing();
            
            const matches = this.findMatches(formData);
            this.displayResults(matches);
            
        } catch (error) {
            // AI Matching error handled
            this.showNotification('An error occurred during matching. Please try again.', 'error');
        } finally {
            this.stopProcessing();
        }
    }

    /**
     * Get form data
     */
    getFormData() {
        if (!this.matchingForm) {
            throw new Error('Matching form not found');
        }
        
        const formData = new FormData(this.matchingForm);
        return {
            treatment: this.sanitizeInput(formData.get('treatment') || ''),
            location: this.sanitizeInput(formData.get('location') || ''),
            budget: this.sanitizeInput(formData.get('budget') || ''),
            timeline: this.sanitizeInput(formData.get('timeline') || ''),
            preferences: this.sanitizeInput(formData.get('preferences') || ''),
            medicalHistory: this.sanitizeInput(formData.get('medicalHistory') || '')
        };
    }

    /**
     * Sanitize user input to prevent XSS attacks
     * @param {string} input - The input string to sanitize
     * @returns {string} - Sanitized input string
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input.trim().replace(/[<>]/g, '');
    }

    /**
     * Validate form data
     */
    validateFormData(data) {
        return data.treatment && data.location && data.budget;
    }

    /**
     * Validate individual field
     */
    validateField(field) {
        const isValid = field.checkValidity();
        const fieldGroup = field.closest('.form-group');
        
        if (fieldGroup) {
            if (isValid) {
                DOMUtils.removeClass(fieldGroup, 'error');
            } else {
                DOMUtils.addClass(fieldGroup, 'error');
            }
        }
        
        return isValid;
    }

    /**
     * Validate entire form
     */
    validateForm() {
        const requiredFields = DOMUtils.getElements('.ai-matching-form [required]');
        const isValid = requiredFields.every(field => this.validateField(field));
        
        if (this.matchButton) {
            this.matchButton.disabled = !isValid;
            DOMUtils.toggleClass(this.matchButton, 'disabled', !isValid);
        }
        
        return isValid;
    }

    /**
     * Start AI processing animation
     */
    startProcessing() {
        this.isProcessing = true;
        
        if (this.processingElement) {
            DOMUtils.addClass(this.processingElement, 'active');
        }
        
        if (this.resultsElement) {
            DOMUtils.removeClass(this.resultsElement, 'active');
        }
        
        if (this.matchButton) {
            this.matchButton.disabled = true;
            this.matchButton.innerHTML = '<i class="fas fa-cog fa-spin"></i> Processing...';
        }

        // Show processing steps
        this.showProcessingSteps();
    }

    /**
     * Stop AI processing animation
     */
    stopProcessing() {
        this.isProcessing = false;
        
        if (this.processingElement) {
            DOMUtils.removeClass(this.processingElement, 'active');
        }
        
        if (this.matchButton) {
            this.matchButton.disabled = false;
            this.matchButton.innerHTML = '<i class="fas fa-brain"></i> Find My Match';
        }
    }

    /**
     * Show processing steps
     */
    showProcessingSteps() {
        const steps = [
            'Analyzing your requirements...',
            'Searching verified clinics...',
            'Calculating compatibility scores...',
            'Ranking best matches...'
        ];

        let currentStep = 0;
        const stepInterval = setInterval(() => {
            if (currentStep < steps.length && this.processingElement) {
                const processingText = DOMUtils.getElement('.processing-text', this.processingElement);
                if (processingText) {
                    processingText.textContent = steps[currentStep];
                }
                currentStep++;
            } else {
                clearInterval(stepInterval);
            }
        }, 800);
    }

    /**
     * Simulate AI processing
     */
    async simulateAIProcessing() {
        return new Promise(resolve => {
            setTimeout(resolve, this.CONSTANTS.PROCESSING_DELAY);
        });
    }

    /**
     * Find matching clinics (mock AI algorithm)
     */
    findMatches(formData) {
        // Simple matching algorithm for demonstration
        return this.mockClinics
            .filter(clinic => {
                // Filter by treatment type
                if (formData.treatment && !clinic.specialty.toLowerCase().includes(formData.treatment.toLowerCase())) {
                    return false;
                }
                
                // Filter by location
                if (formData.location && !clinic.location.toLowerCase().includes(formData.location.toLowerCase())) {
                    return false;
                }
                
                return true;
            })
            .map(clinic => ({
                ...clinic,
                compatibilityScore: this.calculateCompatibilityScore(clinic, formData)
            }))
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
            .slice(0, this.CONSTANTS.MAX_RESULTS);
    }

    /**
     * Calculate compatibility score between clinic and user requirements
     * @param {Object} clinic - Clinic data object
     * @param {Object} formData - User form data
     * @returns {number} - Compatibility score between 0 and 10
     */
    calculateCompatibilityScore(clinic, formData) {
        let score = clinic.score;
        
        // Adjust score based on preferences
        if (formData.budget === 'high' && clinic.priceRange === '$$$') {
            score += 0.5;
        } else if (formData.budget === 'medium' && clinic.priceRange === '$$') {
            score += 0.3;
        }
        
        // Add some randomness for demonstration
        score += (Math.random() - 0.5) * this.CONSTANTS.SCORE_MULTIPLIER;
        
        return Math.min(10, Math.max(0, score));
    }

    /**
     * Display matching results
     */
    displayResults(matches) {
        if (!this.resultsElement) return;

        // Clear previous results
        this.resultsElement.innerHTML = '';

        if (matches.length === 0) {
            this.resultsElement.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No matches found</h3>
                    <p>Try adjusting your search criteria or contact our support team for assistance.</p>
                </div>
            `;
        } else {
            matches.forEach((match, index) => {
                const resultCard = this.createResultCard(match, index);
                this.resultsElement.appendChild(resultCard);
            });
        }

        DOMUtils.addClass(this.resultsElement, 'active');
        
        // Animate results
        setTimeout(() => {
            const resultCards = DOMUtils.getElements('.result-card', this.resultsElement);
            resultCards.forEach((card, index) => {
                setTimeout(() => {
                    DOMUtils.addClass(card, 'animate-in');
                }, index * 200);
            });
        }, 100);

        this.showNotification(`Found ${matches.length} perfect matches for you!`, 'success');
    }

    /**
     * Create result card element
     */
    createResultCard(match, index) {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-header">
                <div class="result-icon">
                    <i class="fas fa-hospital"></i>
                </div>
                <div class="result-title">${match.name}</div>
                <div class="result-score">${match.compatibilityScore.toFixed(1)}</div>
            </div>
            <div class="result-description">${match.description}</div>
            <div class="result-features">
                ${match.features.map(feature => `<span class="result-feature">${feature}</span>`).join('')}
            </div>
            <div class="result-actions">
                <button class="btn btn-primary btn-sm">View Details</button>
                <button class="btn btn-outline btn-sm">Contact Clinic</button>
            </div>
        `;

        // Add click handlers
        const viewDetailsBtn = DOMUtils.getElement('.btn-primary', card);
        const contactBtn = DOMUtils.getElement('.btn-outline', card);

        if (viewDetailsBtn) {
            DOMUtils.addEventListener(viewDetailsBtn, 'click', () => this.viewClinicDetails(match));
        }

        if (contactBtn) {
            DOMUtils.addEventListener(contactBtn, 'click', () => this.contactClinic(match));
        }

        return card;
    }

    /**
     * View clinic details
     */
    viewClinicDetails(clinic) {
        this.showNotification(`Opening details for ${clinic.name}`, 'info');
        // In a real application, this would open a detailed view or modal
    }

    /**
     * Contact clinic
     */
    contactClinic(clinic) {
        this.showNotification(`Connecting you with ${clinic.name}`, 'info');
        // In a real application, this would initiate contact
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Use the notification manager if available
        if (window.app && window.app.notificationManager) {
            window.app.notificationManager.show(message, type);
        } else {
            // Log message handled
        }
    }

    /**
     * Destroy component and cleanup
     */
    destroy() {
        if (this.matchButton) {
            this.matchButton.removeEventListener('click', this.handleMatching);
        }

        this.isInitialized = false;
        // AI Matching component destroyed
    }
}
