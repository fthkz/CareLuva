/**
 * Trust Component - Single responsibility: Trust section animations
 */
class TrustComponent {
    constructor() {
        this.trustSection = null;
        this.scoreBars = [];
        this.intersectionObserver = null;
        this.isInitialized = false;
    }

    /**
     * Initialize trust component
     */
    init() {
        if (this.isInitialized) return;

        this.trustSection = DOMUtils.getElement('.trust');
        this.scoreBars = DOMUtils.getElements('.score-fill');

        this.setupScoreAnimation();
        
        this.isInitialized = true;
        // Trust component initialized
    }

    /**
     * Setup trust score animation
     */
    setupScoreAnimation() {
        if (!this.trustSection || this.scoreBars.length === 0) return;

        this.intersectionObserver = new IntersectionObserverUtil();
        
        this.intersectionObserver.observeWithCallback(
            '.trust',
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateScoreBars();
                    }
                });
            },
            { threshold: 0.5 }
        );
    }

    /**
     * Animate score bars
     */
    animateScoreBars() {
        this.scoreBars.forEach((bar, index) => {
            const width = bar.style.width;
            // Reset width to 0 for animation
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = width;
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
