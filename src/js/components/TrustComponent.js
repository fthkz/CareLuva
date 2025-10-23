/**
 * Trust Component - Single responsibility: Trust section UI logic
 */
class TrustComponent {
    constructor() {
        this.trustSection = null;
        this.scoreBars = [];
        this.cleanupFunctions = [];
    }
    /**
     * Initialize trust component
     */
    init() {
        this.trustSection = DOMUtils.getElement('.trust');
        this.scoreBars = DOMUtils.getElements('.score-fill');

        if (this.scoreBars.length > 0) {
            this.setupScoreAnimations();
        }

        this.setupAnimations();

        console.log('Trust component initialized');
    }

    /**
     * Setup score bar animations
     */
    setupScoreAnimations() {
        if (!this.trustSection) return;

        const animateScoreBars = () => {
            this.scoreBars.forEach((bar, index) => {
                const width = window.getComputedStyle(bar).width;
                bar.style.width = '0%';
                
                setTimeout(() => {
                    bar.style.width = width;
                }, index * 200);
            });
        };
        const observer = IntersectionObserverUtil.observeForCounterAnimation(
            this.trustSection,
            animateScoreBars
        );

        IntersectionObserverUtil.storeObserver('trust-scores', observer);
    }

    /**
     * Setup general animations
     */
    setupAnimations() {
        const trustContent = DOMUtils.getElement('.trust-content');
        if (trustContent) {
            IntersectionObserverUtil.observeWithAnimation(trustContent, 'animate-in');
        }
    }

    /**
     * Get trust data
     * @returns {Object} Trust data
     */
    getTrustData() {
        const title = DOMUtils.getElement('.trust-text h2');
        const description = DOMUtils.getElement('.trust-text p');
        const trustList = DOMUtils.getElements('.trust-list li');
        const badges = DOMUtils.getElements('.badge');
        const scoreNumber = DOMUtils.getElement('.score-number');
        
        const listItems = Array.from(trustList).map(li => {
            const text = li.textContent.trim();
            const icon = DOMUtils.getElement('i', li);
            return {
                text: text,
                icon: icon ? icon.className : ''
            };
        });

        const badgeData = Array.from(badges).map(badge => {
            const text = badge.textContent.trim();
            const icon = DOMUtils.getElement('i', badge);
            return {
                text: text,
                icon: icon ? icon.className : ''
            };
        });

        return {
            title: title ? title.textContent : '',
            description: description ? description.textContent : '',
            listItems: listItems,
            badges: badgeData,
            score: scoreNumber ? scoreNumber.textContent : ''
        };
    }

    /**
     * Update trust score
     * @param {number} newScore - New trust score
     */
    updateTrustScore(newScore) {
        const scoreNumber = DOMUtils.getElement('.score-number');
        if (scoreNumber) {
            scoreNumber.textContent = newScore;
        }
    }

    /**
     * Update score breakdown
     * @param {Array} breakdown - Score breakdown data
     */
    updateScoreBreakdown(breakdown) {
        const scoreItems = DOMUtils.getElements('.score-item');
        
        breakdown.forEach((item, index) => {
            if (scoreItems[index]) {
                const scoreFill = DOMUtils.getElement('.score-fill', scoreItems[index]);
                const scoreValue = DOMUtils.getElements('span', scoreItems[index]);
                
                if (scoreFill) {
                    scoreFill.style.width = `${item.percentage}%`;
                }
                
                if (scoreValue.length > 2) {
                    scoreValue[scoreValue.length - 1].textContent = item.score;
                }
            }
        });
    }

    /**
     * Add trust list item
     * @param {string} text - Item text
     * @param {string} icon - Icon class
     */
    addTrustListItem(text, icon = 'fas fa-check') {
    addTrustListItem(text, icon = 'fas fa-check') {
        const trustList = DOMUtils.getElement('.trust-list');
        if (!trustList) return;

    addTrustBadge(text, icon = 'fas fa-award') {
        const trustBadges = DOMUtils.getElement('.trust-badges');
        if (!trustBadges) return;

        const badge = DOMUtils.createElement('div', { className: 'badge' });
        const iconElement = DOMUtils.createElement('i', { className: icon });
        const textSpan = DOMUtils.createElement('span');
        textSpan.textContent = text;
        DOMUtils.appendChild(badge, iconElement);
        DOMUtils.appendChild(badge, textSpan);

        DOMUtils.appendChild(trustBadges, badge);
    }    removeTrustListItem(index) {
        const trustList = DOMUtils.getElement('.trust-list');
        if (!trustList) return;

        const listItems = DOMUtils.getElements('.trust-list li');
        if (listItems[index]) {
            trustList.removeChild(listItems[index]);
        }
    }

    /**
     * Add trust badge
     * @param {string} text - Badge text
     * @param {string} icon - Icon class
     */
    addTrustBadge(text, icon = 'fas fa-award') {
        const trustBadges = DOMUtils.getElement('.trust-badges');
        if (!trustBadges) return;

        const badge = DOMUtils.createElement('div', {
            className: 'badge'
        }, `<i class="${icon}"></i> <span>${text}</span>`);
        
        DOMUtils.appendChild(trustBadges, badge);
    }

    /**
     * Remove trust badge
     * @param {number} index - Badge index to remove
     */
    removeTrustBadge(index) {
        const trustBadges = DOMUtils.getElement('.trust-badges');
        if (!trustBadges) return;

        const badges = DOMUtils.getElements('.badge');
        if (badges[index]) {
            trustBadges.removeChild(badges[index]);
        }
    }

    /**
     * Animate trust section elements
     */
    animateElements() {
        const trustElements = DOMUtils.getElements('.trust-text > *');
        
        if (trustElements.length > 0) {
            IntersectionObserverUtil.observeMultipleWithAnimation(
                trustElements,
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
        
        IntersectionObserverUtil.removeObserver('trust-scores');
        
        console.log('Trust component destroyed');
    }
}
