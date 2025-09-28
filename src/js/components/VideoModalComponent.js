/**
 * Video Modal Component - Single responsibility: Video modal management
 */
class VideoModalComponent {
    constructor() {
        this.videoPlaceholders = [];
        this.currentModal = null;
        this.isInitialized = false;
    }

    /**
     * Initialize video modal component
     */
    init() {
        if (this.isInitialized) return;

        this.videoPlaceholders = DOMUtils.getElements('.video-placeholder');
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('Video modal component initialized');
    }

    /**
     * Setup event listeners for video placeholders
     */
    setupEventListeners() {
        this.videoPlaceholders.forEach(placeholder => {
            DOMUtils.addEventListener(placeholder, 'click', () => this.showVideoModal());
        });
    }

    /**
     * Show video modal
     */
    showVideoModal() {
        if (this.currentModal) return;

        this.createModal();
        this.addModalStyles();
        this.setupModalEventListeners();
    }

    /**
     * Create modal HTML structure
     */
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <div class="video-container">
                        <div class="video-placeholder-large">
                            <i class="fas fa-play"></i>
                            <p>Video testimonial would play here</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentModal = modal;
    }

    /**
     * Add modal styles
     */
    addModalStyles() {
        const modalStyles = `
            .video-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-content {
                position: relative;
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                overflow: auto;
            }
            .modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: #666;
            }
            .video-container {
                width: 100%;
                height: 400px;
                background: #f3f4f6;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #666;
            }
            .video-placeholder-large {
                text-align: center;
            }
            .video-placeholder-large i {
                font-size: 3rem;
                margin-bottom: 1rem;
                color: #2563eb;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = modalStyles;
        styleSheet.id = 'video-modal-styles';
        document.head.appendChild(styleSheet);
    }

    /**
     * Setup modal event listeners
     */
    setupModalEventListeners() {
        if (!this.currentModal) return;

        const closeButton = DOMUtils.getElement('.modal-close', this.currentModal);
        const overlay = DOMUtils.getElement('.modal-overlay', this.currentModal);

        if (closeButton) {
            DOMUtils.addEventListener(closeButton, 'click', () => this.closeModal());
        }

        if (overlay) {
            DOMUtils.addEventListener(overlay, 'click', () => this.closeModal());
        }

        // Close on escape key
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }

    /**
     * Close modal
     */
    closeModal() {
        if (!this.currentModal) return;

        // Remove modal from DOM
        if (document.body.contains(this.currentModal)) {
            document.body.removeChild(this.currentModal);
        }

        // Remove styles
        const styleSheet = document.getElementById('video-modal-styles');
        if (styleSheet && document.head.contains(styleSheet)) {
            document.head.removeChild(styleSheet);
        }

        // Remove escape key listener
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }

        this.currentModal = null;
    }

    /**
     * Destroy component and cleanup
     */
    destroy() {
        this.videoPlaceholders.forEach(placeholder => {
            DOMUtils.removeEventListener(placeholder, 'click', this.showVideoModal);
        });

        if (this.currentModal) {
            this.closeModal();
        }

        this.isInitialized = false;
    }
}
