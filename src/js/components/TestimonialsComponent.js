/**
 * Testimonials Component - Single responsibility: Testimonials section UI logic
 */
class TestimonialsComponent {
    constructor() {
        this.testimonialsSection = null;
        this.testimonialCards = [];
        this.videoPlaceholders = [];
        this.cleanupFunctions = [];
    }

    /**
     * Initialize testimonials component
     */
    init() {
        // Cleanup previous initialization
        this.destroy();

        this.testimonialsSection = DOMUtils.getElement('.testimonials');
        this.testimonialCards = DOMUtils.getElements('.testimonial-card');
        this.videoPlaceholders = DOMUtils.getElements('.video-placeholder');

        if (this.testimonialCards.length > 0) {
            this.setupAnimations();
            this.setupHoverEffects();
        }

        if (this.videoPlaceholders.length > 0) {
            this.setupVideoHandlers();
        }

        console.log('Testimonials component initialized');
    }
    /**
     * Setup animations for testimonial cards
     */
    setupAnimations() {
        if (!this.testimonialsSection) return;

        const observer = IntersectionObserverUtil.observeMultipleWithAnimation(
            this.testimonialCards,
            'animate-in'
        );

        IntersectionObserverUtil.storeObserver('testimonials-animation', observer);
    }

    /**
     * Setup hover effects for testimonial cards
     */
    setupHoverEffects() {
        this.testimonialCards.forEach(card => {
            const handleMouseEnter = () => {
                DOMUtils.addClass(card, 'hovered');
            };

            const handleMouseLeave = () => {
                DOMUtils.removeClass(card, 'hovered');
            };

            const enterCleanup = EventUtils.addEventListenerWithCleanup(card, 'mouseenter', handleMouseEnter);
            const leaveCleanup = EventUtils.addEventListenerWithCleanup(card, 'mouseleave', handleMouseLeave);
            
            this.cleanupFunctions.push(enterCleanup, leaveCleanup);
        });
    }

    /**
     * Setup video placeholder handlers
     */
    setupVideoHandlers() {
        this.videoPlaceholders.forEach(placeholder => {
            const handleClick = () => {
                this.showVideoModal(placeholder);
            };

            const cleanup = EventUtils.addEventListenerWithCleanup(placeholder, 'click', handleClick);
            this.cleanupFunctions.push(cleanup);
        });
    }

    /**
     * Show video modal
     * @param {Element} placeholder - Video placeholder element
     */
    showVideoModal(placeholder) {
        const modal = this.createVideoModal(placeholder);
        document.body.appendChild(modal);

        // Add modal styles
        this.addModalStyles();

        // Setup modal event handlers
        this.setupModalHandlers(modal);
    }

    /**
     * Create video modal
     * @param {Element} placeholder - Video placeholder element
     * @returns {Element} Modal element
     */
    createVideoModal(placeholder) {
        const modal = DOMUtils.createElement('div', {
            className: 'video-modal'
        });

        const modalContent = DOMUtils.createElement('div', {
            className: 'modal-overlay'
        }, `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="video-container">
                    <div class="video-placeholder-large">
                        <i class="fas fa-play"></i>
                        <p>Video testimonial would play here</p>
                    </div>
                </div>
            </div>
        `);

        DOMUtils.appendChild(modal, modalContent);
        return modal;
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

        const styleSheet = DOMUtils.createElement('style', {}, modalStyles);
        document.head.appendChild(styleSheet);
    }

    /**
     * Setup modal event handlers
    setupModalHandlers(modal) {
        const closeModal = () => {
            document.body.removeChild(modal);
            const styleSheet = document.head.querySelector('style:last-of-type');
            if (styleSheet) {
                document.head.removeChild(styleSheet);
            }
        };

        const closeButton = DOMUtils.getElement('.modal-close', modal);
        const overlay = DOMUtils.getElement('.modal-overlay', modal);
        const modalContent = DOMUtils.getElement('.modal-content', modal);

        if (closeButton) {
            const cleanup = EventUtils.addEventListenerWithCleanup(closeButton, 'click', closeModal);
            this.cleanupFunctions.push(cleanup);
        }

        if (overlay) {
            const handleOverlayClick = (e) => {
                if (e.target === overlay) {
                    closeModal();
                }
            };
            const cleanup = EventUtils.addEventListenerWithCleanup(overlay, 'click', handleOverlayClick);
            this.cleanupFunctions.push(cleanup);
        }

        // Prevent clicks inside modal content from closing the modal
        if (modalContent) {
            const stopPropagation = (e) => e.stopPropagation();
            const cleanup = EventUtils.addEventListenerWithCleanup(modalContent, 'click', stopPropagation);
            this.cleanupFunctions.push(cleanup);
        }

        // Close on escape key
        const escapeCleanup = EventUtils.handleEscapeKey(closeModal);
        this.cleanupFunctions.push(escapeCleanup);
    }        this.cleanupFunctions.push(escapeCleanup);
    }

    /**
     * Get testimonials data
     * @returns {Array} Testimonials data
     */
    getTestimonialsData() {
        const testimonials = [];
        
        this.testimonialCards.forEach(card => {
            const rating = DOMUtils.getElements('.testimonial-rating i', card);
            const content = DOMUtils.getElement('.testimonial-content p', card);
            const author = DOMUtils.getElement('.testimonial-author strong', card);
            const treatment = DOMUtils.getElement('.testimonial-author span', card);
            
            if (content && author) {
                testimonials.push({
                    rating: rating.length,
                    content: content.textContent,
                    author: author.textContent,
                    treatment: treatment ? treatment.textContent : ''
                });
            }
        });
        
        return testimonials;
    }

    /**
     * Add new testimonial
     * @param {Object} data - Testimonial data
     * @param {number} index - Insertion index (optional)
     */
    addTestimonial(data, index = -1) {
        const testimonialsGrid = DOMUtils.getElement('.testimonials-grid');
        if (!testimonialsGrid) return;

        const card = this.createTestimonialCard(data);
        
        if (index >= 0 && index < this.testimonialCards.length) {
            testimonialsGrid.insertBefore(card, this.testimonialCards[index]);
        } else {
            testimonialsGrid.appendChild(card);
        }

        // Reinitialize to include new card
        this.init();
    }

    /**
     * Create testimonial card element
     * @param {Object} data - Testimonial data
     * @returns {Element} Testimonial card element
     */
    createTestimonialCard(data) {
        const card = DOMUtils.createElement('div', {
            className: 'testimonial-card'
        });

        const video = DOMUtils.createElement('div', {
            className: 'testimonial-video'
        }, `
            <div class="video-placeholder">
                <i class="fas fa-play"></i>
            </div>
        `);

        const content = DOMUtils.createElement('div', {
            className: 'testimonial-content'
        }, `
            <div class="testimonial-rating">
                ${'<i class="fas fa-star"></i>'.repeat(data.rating || 5)}
            </div>
            <p>${data.content}</p>
            <div class="testimonial-author">
                <strong>${data.author}</strong>
                <span>${data.treatment || ''}</span>
            </div>
        `);

        DOMUtils.appendChild(card, video);
        DOMUtils.appendChild(card, content);

        return card;
    }

    /**
     * Remove testimonial
     * @param {number} index - Testimonial index to remove
     */
    removeTestimonial(index) {
        const card = this.testimonialCards[index];
        if (!card) return;

        const testimonialsGrid = DOMUtils.getElement('.testimonials-grid');
        if (testimonialsGrid && testimonialsGrid.contains(card)) {
            testimonialsGrid.removeChild(card);
            this.init(); // Reinitialize to update references
        }
    }

    /**
     * Filter testimonials
     * @param {string} searchTerm - Search term
     */
    filterTestimonials(searchTerm) {
        this.testimonialCards.forEach(card => {
            const content = DOMUtils.getElement('.testimonial-content p', card);
            const author = DOMUtils.getElement('.testimonial-author strong', card);
            const treatment = DOMUtils.getElement('.testimonial-author span', card);
            
            const contentText = content ? content.textContent.toLowerCase() : '';
            const authorText = author ? author.textContent.toLowerCase() : '';
            const treatmentText = treatment ? treatment.textContent.toLowerCase() : '';
            const searchLower = searchTerm.toLowerCase();
            
            const isVisible = contentText.includes(searchLower) || 
                            authorText.includes(searchLower) || 
                            treatmentText.includes(searchLower);
            
            if (isVisible) {
                DOMUtils.removeClass(card, 'hidden');
            } else {
                DOMUtils.addClass(card, 'hidden');
            }
        });
    }

    /**
     * Show all testimonials
     */
    showAllTestimonials() {
        this.testimonialCards.forEach(card => {
            DOMUtils.removeClass(card, 'hidden');
        });
    }

    /**
     * Destroy component and cleanup
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        
        IntersectionObserverUtil.removeObserver('testimonials-animation');
        
        console.log('Testimonials component destroyed');
    }
}
