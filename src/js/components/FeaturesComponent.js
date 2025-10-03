/**
 * Features Component - Single responsibility: Features section UI logic
 */
class FeaturesComponent {
    constructor() {
        this.featuresSection = null;
        this.featureCards = [];
        this.cleanupFunctions = [];
    }

    /**
     * Initialize features component
     */
    init() {
        this.featuresSection = DOMUtils.getElement('.features');
        this.featureCards = DOMUtils.getElements('.feature-card');

        if (this.featureCards.length > 0) {
            this.setupAnimations();
            this.setupHoverEffects();
        }

        console.log('Features component initialized');
    }

    /**
     * Setup animations for feature cards
     */
    setupAnimations() {
        if (!this.featuresSection) return;

        const observer = IntersectionObserverUtil.observeMultipleWithAnimation(
            this.featureCards,
            'animate-in'
        );

        IntersectionObserverUtil.storeObserver('features-animation', observer);
    }

    /**
     * Setup hover effects for feature cards
     */
    setupHoverEffects() {
        this.featureCards.forEach(card => {
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
     * Get features data
     * @returns {Array} Features data
     */
    getFeaturesData() {
        const features = [];
        
        this.featureCards.forEach(card => {
            const icon = DOMUtils.getElement('.feature-icon i', card);
            const title = DOMUtils.getElement('h3', card);
            const description = DOMUtils.getElement('p', card);
            
            if (title && description) {
                features.push({
                    icon: icon ? icon.className : '',
                    title: title.textContent,
                    description: description.textContent
                });
            }
        });
        
        return features;
    }

    /**
     * Update feature card
     * @param {number} index - Card index
     * @param {Object} data - New feature data
     */
    updateFeatureCard(index, data) {
        const card = this.featureCards[index];
        if (!card) return;

        if (data.title) {
            const titleElement = DOMUtils.getElement('h3', card);
            if (titleElement) {
                titleElement.textContent = data.title;
            }
        }

        if (data.description) {
            const descriptionElement = DOMUtils.getElement('p', card);
            if (descriptionElement) {
                descriptionElement.textContent = data.description;
            }
        }

        if (data.icon) {
            const iconElement = DOMUtils.getElement('.feature-icon i', card);
            if (iconElement) {
                iconElement.className = data.icon;
            }
        }
    }

    /**
     * Add new feature card
     * @param {Object} data - Feature data
     * @param {number} index - Insertion index (optional)
     */
    addFeatureCard(data, index = -1) {
        const featuresGrid = DOMUtils.getElement('.features-grid');
        if (!featuresGrid) return;

        const card = this.createFeatureCard(data);
        
        if (index >= 0 && index < this.featureCards.length) {
            featuresGrid.insertBefore(card, this.featureCards[index]);
        } else {
            featuresGrid.appendChild(card);
        }

        // Reinitialize to include new card
        this.init();
    }

    /**
     * Create feature card element
     * @param {Object} data - Feature data
     * @returns {Element} Feature card element
     */
    createFeatureCard(data) {
        const card = DOMUtils.createElement('div', {
            className: 'feature-card'
        });

        const icon = DOMUtils.createElement('div', {
            className: 'feature-icon'
        }, `<i class="${data.icon}"></i>`);

        const title = DOMUtils.createElement('h3', {}, data.title);
        const description = DOMUtils.createElement('p', {}, data.description);

        DOMUtils.appendChild(card, icon);
        DOMUtils.appendChild(card, title);
        DOMUtils.appendChild(card, description);

        return card;
    }

    /**
     * Remove feature card
     * @param {number} index - Card index to remove
     */
    removeFeatureCard(index) {
        const card = this.featureCards[index];
        if (!card) return;

        const featuresGrid = DOMUtils.getElement('.features-grid');
        if (featuresGrid && featuresGrid.contains(card)) {
            featuresGrid.removeChild(card);
            this.init(); // Reinitialize to update references
        }
    }

    /**
     * Filter feature cards
     * @param {string} searchTerm - Search term
     */
    filterFeatureCards(searchTerm) {
        this.featureCards.forEach(card => {
            const title = DOMUtils.getElement('h3', card);
            const description = DOMUtils.getElement('p', card);
            
            const titleText = title ? title.textContent.toLowerCase() : '';
            const descriptionText = description ? description.textContent.toLowerCase() : '';
            const searchLower = searchTerm.toLowerCase();
            
            const isVisible = titleText.includes(searchLower) || descriptionText.includes(searchLower);
            
            if (isVisible) {
                DOMUtils.removeClass(card, 'hidden');
            } else {
                DOMUtils.addClass(card, 'hidden');
            }
        });
    }

    /**
     * Show all feature cards
     */
    showAllFeatureCards() {
        this.featureCards.forEach(card => {
            DOMUtils.removeClass(card, 'hidden');
        });
    }

    /**
     * Destroy component and cleanup
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        
        IntersectionObserverUtil.removeObserver('features-animation');
        
        console.log('Features component destroyed');
    }
}
