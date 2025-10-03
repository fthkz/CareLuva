/**
 * Navigation Component - Single responsibility: Navigation UI logic
 */
class NavigationComponent {
    constructor() {
        this.hamburger = null;
        this.navMenu = null;
        this.navCta = null;
        this.navbar = null;
        this.navLinks = [];
        this.isMenuOpen = false;
        this.cleanupFunctions = [];
    }

    /**
     * Initialize navigation component
     */
    init() {
        this.hamburger = DOMUtils.getElement('.hamburger');
        this.navMenu = DOMUtils.getElement('.nav-menu');
        this.navCta = DOMUtils.getElement('.nav-cta');
        this.navbar = DOMUtils.getElement('.navbar');
        this.navLinks = DOMUtils.getElements('.nav-menu a[href^="#"]');

        if (this.hamburger) {
            this.setupMobileMenu();
        }

        if (this.navLinks.length > 0) {
            this.setupSmoothScrolling();
        }

        if (this.navbar) {
            this.setupScrollEffects();
        }

        console.log('Navigation component initialized');
    }

    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        const toggleMenu = () => {
            this.isMenuOpen = !this.isMenuOpen;
            
            DOMUtils.toggleClass(this.hamburger, 'active');
            DOMUtils.toggleClass(this.navMenu, 'active');
            DOMUtils.toggleClass(this.navCta, 'active');

            // Prevent body scroll when menu is open
            if (this.isMenuOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        };

        const cleanup = EventUtils.addEventListenerWithCleanup(
            this.hamburger, 
            'click', 
            toggleMenu
        );
        this.cleanupFunctions.push(cleanup);
    }

    /**
     * Setup smooth scrolling for navigation links
     */
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            const handleClick = (event) => {
                event.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = DOMUtils.getElement(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    if (this.isMenuOpen) {
                        this.closeMobileMenu();
                    }
                }
            };

            const cleanup = EventUtils.addEventListenerWithCleanup(link, 'click', handleClick);
            this.cleanupFunctions.push(cleanup);
        });
    }

    /**
     * Setup scroll effects for navbar
     */
    setupScrollEffects() {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                DOMUtils.setStyle(this.navbar, 'backgroundColor', 'rgba(255, 255, 255, 0.98)');
                DOMUtils.setStyle(this.navbar, 'boxShadow', '0 2px 20px rgba(0, 0, 0, 0.1)');
            } else {
                DOMUtils.setStyle(this.navbar, 'backgroundColor', 'rgba(255, 255, 255, 0.95)');
                DOMUtils.setStyle(this.navbar, 'boxShadow', 'none');
            }
        };

        const cleanup = EventUtils.handleScroll(handleScroll, 10);
        this.cleanupFunctions.push(cleanup);
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (this.isMenuOpen) {
            this.isMenuOpen = false;
            DOMUtils.removeClass(this.hamburger, 'active');
            DOMUtils.removeClass(this.navMenu, 'active');
            DOMUtils.removeClass(this.navCta, 'active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Update active navigation link based on scroll position
     * @param {string} sectionId - Active section ID
     */
    updateActiveLink(sectionId) {
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
                DOMUtils.addClass(link, 'active');
            } else {
                DOMUtils.removeClass(link, 'active');
            }
        });
    }

    /**
     * Destroy component and cleanup
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        
        // Reset styles
        if (this.navbar) {
            DOMUtils.setStyle(this.navbar, 'backgroundColor', '');
            DOMUtils.setStyle(this.navbar, 'boxShadow', '');
        }
        
        document.body.style.overflow = '';
        
        console.log('Navigation component destroyed');
    }
}
