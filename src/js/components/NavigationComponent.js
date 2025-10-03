/**
 * Navigation Component - Single responsibility: Navigation UI management
 */
class NavigationComponent {
    constructor() {
        this.hamburger = null;
        this.navMenu = null;
        this.navCta = null;
        this.navbar = null;
        this.navLinks = [];
        this.isInitialized = false;
    }

    /**
     * Initialize navigation component
     */
    init() {
        if (this.isInitialized) return;

        this.hamburger = DOMUtils.getElement('.hamburger');
        this.navMenu = DOMUtils.getElement('.nav-menu');
        this.navCta = DOMUtils.getElement('.nav-cta');
        this.navbar = DOMUtils.getElement('.navbar');
        this.navLinks = DOMUtils.getElements('.nav-menu a[href^="#"]');

        this.setupEventListeners();
        this.setupScrollEffect();
        this.setupSmoothScrolling();
        
        this.isInitialized = true;
        // Navigation component initialized
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (this.hamburger) {
            DOMUtils.addEventListener(this.hamburger, 'click', () => this.toggleMobileMenu());
        }
    }

    /**
     * Setup scroll effect for navbar
     */
    setupScrollEffect() {
        if (!this.navbar) return;

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => this.handleScroll(), 10);
        });
    }

    /**
     * Handle scroll event
     */
    handleScroll() {
        if (!this.navbar) return;

        if (window.scrollY > 50) {
            DOMUtils.setStyle(this.navbar, 'backgroundColor', 'rgba(255, 255, 255, 0.98)');
            DOMUtils.setStyle(this.navbar, 'boxShadow', '0 2px 20px rgba(0, 0, 0, 0.1)');
        } else {
            DOMUtils.setStyle(this.navbar, 'backgroundColor', 'rgba(255, 255, 255, 0.95)');
            DOMUtils.setStyle(this.navbar, 'boxShadow', 'none');
        }
    }

    /**
     * Setup smooth scrolling for navigation links
     */
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            DOMUtils.addEventListener(link, 'click', (e) => this.handleSmoothScroll(e));
        });
    }

    /**
     * Handle smooth scroll navigation
     * @param {Event} event - Click event
     */
    handleSmoothScroll(event) {
        event.preventDefault();
        const targetId = event.target.getAttribute('href');
        const targetSection = DOMUtils.getElement(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (!this.hamburger || !this.navMenu || !this.navCta) return;

        DOMUtils.toggleClass(this.hamburger, 'active');
        DOMUtils.toggleClass(this.navMenu, 'active');
        DOMUtils.toggleClass(this.navCta, 'active');
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (!this.hamburger || !this.navMenu || !this.navCta) return;

        DOMUtils.removeClass(this.hamburger, 'active');
        DOMUtils.removeClass(this.navMenu, 'active');
        DOMUtils.removeClass(this.navCta, 'active');
    }

    /**
     * Destroy component and cleanup
     */
    destroy() {
        if (this.hamburger) {
            DOMUtils.removeEventListener(this.hamburger, 'click', this.toggleMobileMenu);
        }
        
        this.navLinks.forEach(link => {
            DOMUtils.removeEventListener(link, 'click', this.handleSmoothScroll);
        });

        this.isInitialized = false;
    }
}
