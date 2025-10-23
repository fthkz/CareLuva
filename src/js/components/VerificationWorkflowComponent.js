/**
 * Verification Workflow Component - Single responsibility: Provider verification process
 */
class VerificationWorkflowComponent {
    constructor() {
        this.verificationSteps = [
            {
                id: 'document-upload',
                title: 'Document Upload',
                description: 'Upload your medical license and certifications',
                status: 'pending',
                required: true
            },
            {
                id: 'background-check',
                title: 'Background Check',
                description: 'Verification of credentials and experience',
                status: 'pending',
                required: true
            },
            {
                id: 'insurance-verification',
                title: 'Insurance Verification',
                description: 'Confirm malpractice insurance coverage',
                status: 'pending',
                required: true
            },
            {
                id: 'final-approval',
                title: 'Final Approval',
                description: 'Review and approval by CareLuva team',
                status: 'pending',
                required: true
            }
        ];
        this.isInitialized = false;
        this.cleanupFunctions = [];
    }

    /**
     * Initialize verification workflow component
     */
    init() {
        if (this.isInitialized) {
            console.warn('Verification workflow component already initialized');
            return;
        }

        this.setupEventListeners();
        this.isInitialized = true;
        console.log('Verification workflow component initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for verification status updates
        const statusHandler = (event) => {
            this.handleVerificationStatusUpdate(event.detail);
        };

        document.addEventListener('verification:statusUpdate', statusHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('verification:statusUpdate', statusHandler);
        });

        // Listen for verification modal open
        const openHandler = (event) => {
            this.openVerificationModal();
        };

        document.addEventListener('verification:openModal', openHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('verification:openModal', openHandler);
        });
    }

    /**
     * Open verification modal
     */
    openVerificationModal() {
        this.createVerificationModal();
        this.updateVerificationStatus();
        this.animateModalIn();
    }

    /**
     * Create verification modal HTML
     */
    createVerificationModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('verification-workflow-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div id="verification-workflow-modal" class="verification-workflow-modal">
                <div class="modal-backdrop"></div>
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>Verification Status</h2>
                        <button class="modal-close" aria-label="Close verification">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="verification-overview">
                            <div class="verification-status">
                                <div class="status-icon">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div class="status-info">
                                    <h3>Verification in Progress</h3>
                                    <p>We're reviewing your documents and credentials. This process typically takes 2-3 business days.</p>
                                </div>
                            </div>
                            
                            <div class="verification-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 25%"></div>
                                </div>
                                <span class="progress-text">1 of 4 steps completed</span>
                            </div>
                        </div>

                        <div class="verification-steps">
                            <h4>Verification Steps</h4>
                            <div class="steps-list">
                                ${this.verificationSteps.map(step => `
                                    <div class="verification-step ${step.status}" data-step="${step.id}">
                                        <div class="step-icon">
                                            <i class="fas fa-${this.getStepIcon(step.status)}"></i>
                                        </div>
                                        <div class="step-content">
                                            <h5>${step.title}</h5>
                                            <p>${step.description}</p>
                                            <span class="step-status">${this.getStepStatusText(step.status)}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="verification-actions">
                            <div class="action-info">
                                <i class="fas fa-info-circle"></i>
                                <p>You'll receive email notifications as each step is completed. If you have any questions, please contact our support team.</p>
                            </div>
                            
                            <div class="action-buttons">
                                <button class="btn-secondary" id="contact-support">Contact Support</button>
                                <button class="btn-primary" id="upload-additional-docs">Upload Additional Documents</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupModalEventListeners();
    }

    /**
     * Setup modal event listeners
     */
    setupModalEventListeners() {
        const modal = document.getElementById('verification-workflow-modal');
        if (!modal) return;

        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        const closeModal = () => this.closeVerificationModal();
        
        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
        
        // Action buttons
        const contactSupportBtn = modal.querySelector('#contact-support');
        const uploadDocsBtn = modal.querySelector('#upload-additional-docs');
        
        contactSupportBtn.addEventListener('click', () => this.contactSupport());
        uploadDocsBtn.addEventListener('click', () => this.uploadAdditionalDocuments());
    }

    /**
     * Get step icon based on status
     * @param {string} status - Step status
     * @returns {string} Icon class
     */
    getStepIcon(status) {
        switch (status) {
            case 'completed':
                return 'check-circle';
            case 'in-progress':
                return 'spinner fa-spin';
            case 'failed':
                return 'exclamation-circle';
            default:
                return 'clock';
        }
    }

    /**
     * Get step status text
     * @param {string} status - Step status
     * @returns {string} Status text
     */
    getStepStatusText(status) {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'in-progress':
                return 'In Progress';
            case 'failed':
                return 'Needs Attention';
            default:
                return 'Pending';
        }
    }

    /**
     * Update verification status
     */
    updateVerificationStatus() {
        const modal = document.getElementById('verification-workflow-modal');
        if (!modal) return;

        // Update progress bar
        const completedSteps = this.verificationSteps.filter(step => step.status === 'completed').length;
        const progressPercentage = (completedSteps / this.verificationSteps.length) * 100;
        
        const progressFill = modal.querySelector('.progress-fill');
        const progressText = modal.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${completedSteps} of ${this.verificationSteps.length} steps completed`;
        }

        // Update step statuses
        this.verificationSteps.forEach(step => {
            const stepElement = modal.querySelector(`[data-step="${step.id}"]`);
            if (stepElement) {
                stepElement.className = `verification-step ${step.status}`;
                
                const icon = stepElement.querySelector('.step-icon i');
                const statusText = stepElement.querySelector('.step-status');
                
                if (icon) {
                    icon.className = `fas fa-${this.getStepIcon(step.status)}`;
                }
                
                if (statusText) {
                    statusText.textContent = this.getStepStatusText(step.status);
                }
            }
        });

        // Update overall status
        const statusIcon = modal.querySelector('.status-icon i');
        const statusTitle = modal.querySelector('.status-info h3');
        const statusDescription = modal.querySelector('.status-info p');

        if (completedSteps === this.verificationSteps.length) {
            // All steps completed
            if (statusIcon) statusIcon.className = 'fas fa-check-circle';
            if (statusTitle) statusTitle.textContent = 'Verification Complete!';
            if (statusDescription) {
                statusDescription.textContent = 'Congratulations! Your clinic has been verified and is now live on CareLuva.';
            }
        } else if (completedSteps > 0) {
            // Some steps completed
            if (statusIcon) statusIcon.className = 'fas fa-clock';
            if (statusTitle) statusTitle.textContent = 'Verification in Progress';
            if (statusDescription) {
                statusDescription.textContent = 'We\'re reviewing your documents and credentials. This process typically takes 2-3 business days.';
            }
        }
    }

    /**
     * Handle verification status update
     * @param {Object} detail - Status update detail
     */
    handleVerificationStatusUpdate(detail) {
        const { stepId, status, message } = detail;
        
        // Update step status
        const step = this.verificationSteps.find(s => s.id === stepId);
        if (step) {
            step.status = status;
            
            // Update modal if it's open
            const modal = document.getElementById('verification-workflow-modal');
            if (modal) {
                this.updateVerificationStatus();
            }
        }

        // Show notification
        if (message) {
            EventUtils.createCustomEvent('notification:show', {
                type: status === 'completed' ? 'success' : 'info',
                message: message
            });
        }
    }

    /**
     * Contact support
     */
    contactSupport() {
        // Open support contact form or redirect to support page
        EventUtils.createCustomEvent('support:openContact', {
            subject: 'Verification Process Inquiry'
        });
        
        // Show notification
        EventUtils.createCustomEvent('notification:show', {
            type: 'info',
            message: 'Opening support contact form...'
        });
    }

    /**
     * Upload additional documents
     */
    uploadAdditionalDocuments() {
        // Open document upload modal
        EventUtils.createCustomEvent('documents:openUpload', {
            context: 'verification'
        });
        
        // Show notification
        EventUtils.createCustomEvent('notification:show', {
            type: 'info',
            message: 'Opening document upload...'
        });
    }

    /**
     * Animate modal in
     */
    animateModalIn() {
        const modal = document.getElementById('verification-workflow-modal');
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
     * Close verification modal
     */
    closeVerificationModal() {
        const modal = document.getElementById('verification-workflow-modal');
        if (!modal) return;

        modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';

        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    /**
     * Simulate verification process (for demo purposes)
     */
    simulateVerificationProcess() {
        let currentStep = 0;
        
        const processStep = () => {
            if (currentStep < this.verificationSteps.length) {
                const step = this.verificationSteps[currentStep];
                
                // Mark as in progress
                this.handleVerificationStatusUpdate({
                    stepId: step.id,
                    status: 'in-progress',
                    message: `${step.title} is now in progress`
                });

                // Simulate processing time
                setTimeout(() => {
                    // Mark as completed
                    this.handleVerificationStatusUpdate({
                        stepId: step.id,
                        status: 'completed',
                        message: `${step.title} has been completed successfully`
                    });

                    currentStep++;
                    if (currentStep < this.verificationSteps.length) {
                        setTimeout(processStep, 2000); // Wait 2 seconds before next step
                    } else {
                        // All steps completed
                        setTimeout(() => {
                            this.handleVerificationStatusUpdate({
                                stepId: 'final-approval',
                                status: 'completed',
                                message: 'Congratulations! Your clinic has been verified and is now live on CareLuva.'
                            });
                        }, 1000);
                    }
                }, 3000); // 3 seconds processing time
            }
        };

        // Start the process
        setTimeout(processStep, 1000);
    }

    /**
     * Get verification status
     * @returns {Object} Verification status
     */
    getVerificationStatus() {
        const completedSteps = this.verificationSteps.filter(step => step.status === 'completed').length;
        const totalSteps = this.verificationSteps.length;
        
        return {
            completed: completedSteps,
            total: totalSteps,
            percentage: (completedSteps / totalSteps) * 100,
            isComplete: completedSteps === totalSteps,
            steps: [...this.verificationSteps]
        };
    }

    /**
     * Destroy component
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        
        // Remove modal if exists
        const modal = document.getElementById('verification-workflow-modal');
        if (modal) {
            modal.remove();
        }
        
        this.isInitialized = false;
        console.log('Verification workflow component destroyed');
    }
}
