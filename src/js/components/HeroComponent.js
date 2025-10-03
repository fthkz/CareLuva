/**
 * Hero Component - Single responsibility: Hero section animations and interactions
 */
class HeroComponent {
    constructor() {
        this.heroSection = null;
        this.statNumbers = [];
        this.intersectionObserver = null;
        this.isInitialized = false;
    }

    /**
     * Initialize hero component
     */
    init() {
        if (this.isInitialized) return;

        this.heroSection = DOMUtils.getElement('.hero');
        this.statNumbers = DOMUtils.getElements('.stat-number');

        this.setupCounterAnimation();
        
        this.isInitialized = true;
        // Hero component initialized
    }

    /**
     * Setup counter animation for hero stats
     */
    setupCounterAnimation() {
        if (!this.heroSection || this.statNumbers.length === 0) return;

        this.intersectionObserver = new IntersectionObserverUtil();
        
        this.intersectionObserver.observeWithCallback(
            '.hero',
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounters();
                    }
                });
            },
            { threshold: 0.5 }
        );
    }

    /**
     * Animate counter numbers
     */
    animateCounters() {
        this.statNumbers.forEach((stat, index) => {
            const target = stat.textContent;
            const isDecimal = target.includes('.');
            const finalNumber = isDecimal ? parseFloat(target) : parseInt(target);
            
            // Add delay between counters
            setTimeout(() => {
                AnimationUtils.animateCounter(stat, 0, finalNumber, 2000, isDecimal);
            }, index * 200);
        });
    }

    /**
     * Destroy component and cleanup
     */
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnectAll();
        }
        this.isInitialized = false;
    }
}
