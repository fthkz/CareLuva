/**
 * Hero Component - Single responsibility: Hero section UI logic
 */
class HeroComponent {
    constructor() {
        this.heroSection = null;
        this.statNumbers = [];
        this.cleanupFunctions = [];
    }

    /**
     * Initialize hero component
     */
    init() {
        this.heroSection = DOMUtils.getElement('.hero');
        this.statNumbers = DOMUtils.getElements('.stat-number');

        if (this.statNumbers.length > 0) {
            this.setupCounterAnimations();
        }

        console.log('Hero component initialized');
    }

    /**
     * Setup counter animations for hero stats
     */
    setupCounterAnimations() {
        if (!this.heroSection) return;

        const animateCounters = () => {
            this.statNumbers.forEach((stat, index) => {
                const target = stat.textContent;
                const isDecimal = target.includes('.');
                const finalNumber = isDecimal ? parseFloat(target) : parseInt(target);
                
                // Add delay between counters
                setTimeout(() => {
                    AnimationUtils.animateCounter(stat, 0, finalNumber, 2000, isDecimal);
                }, index * 200);
            });
        };

        const observer = IntersectionObserverUtil.observeForCounterAnimation(
            this.heroSection, 
            animateCounters
        );

        // Store observer for cleanup
        IntersectionObserverUtil.storeObserver('hero-counters', observer);
    }

    /**
     * Get hero section data
     * @returns {Object} Hero data
     */
    getHeroData() {
        const title = DOMUtils.getElement('.hero-title');
        const subtitle = DOMUtils.getElement('.hero-subtitle');
        
        return {
            title: title ? title.textContent : '',
            subtitle: subtitle ? subtitle.textContent : '',
            stats: this.getStatsData()
        };
    }

    /**
     * Get hero stats data
     * @returns {Array} Stats data
     */
    getStatsData() {
        const stats = [];
        const statElements = DOMUtils.getElements('.stat');
        
        statElements.forEach(stat => {
            const number = DOMUtils.getElement('.stat-number', stat);
            const label = DOMUtils.getElement('.stat-label', stat);
            
            if (number && label) {
                stats.push({
                    number: number.textContent,
                    label: label.textContent
                });
            }
        });
        
        return stats;
    }

    /**
     * Update hero title
     * @param {string} newTitle - New title text
     */
    updateTitle(newTitle) {
        const titleElement = DOMUtils.getElement('.hero-title');
        if (titleElement) {
            titleElement.textContent = newTitle;
        }
    }

    /**
     * Update hero subtitle
     * @param {string} newSubtitle - New subtitle text
     */
    updateSubtitle(newSubtitle) {
        const subtitleElement = DOMUtils.getElement('.hero-subtitle');
        if (subtitleElement) {
            subtitleElement.textContent = newSubtitle;
        }
    }

    /**
     * Update hero stats
     * @param {Array} newStats - New stats data
     */
    updateStats(newStats) {
        const statElements = DOMUtils.getElements('.stat');
        
        newStats.forEach((stat, index) => {
            if (statElements[index]) {
                const numberElement = DOMUtils.getElement('.stat-number', statElements[index]);
                const labelElement = DOMUtils.getElement('.stat-label', statElements[index]);
                
                if (numberElement) {
                    numberElement.textContent = stat.number;
                }
                if (labelElement) {
                    labelElement.textContent = stat.label;
                }
            }
        });
    }

    /**
     * Animate hero elements on scroll
     */
    animateOnScroll() {
        const heroElements = DOMUtils.getElements('.hero-content > *');
        
        if (heroElements.length > 0) {
            IntersectionObserverUtil.observeMultipleWithAnimation(
                heroElements, 
                'animate-in'
            );
        }
    }

    /**
     * Destroy component and cleanup
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        
        IntersectionObserverUtil.removeObserver('hero-counters');
        
        console.log('Hero component destroyed');
    }
}
