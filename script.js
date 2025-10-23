// CareLuva Landing Page JavaScript - Simplified Version

document.addEventListener('DOMContentLoaded', function() {
    // Wait for components to be initialized
    setTimeout(() => {
        // Provider Registration Button Handler
        const providerRegistrationBtn = document.querySelector('[data-action="open-provider-registration"]');
        if (providerRegistrationBtn) {
            console.log('Provider registration button found, adding event listener');
            providerRegistrationBtn.addEventListener('click', function() {
                console.log('Provider registration button clicked');
                // Always use direct event dispatch for reliability
                const event = new CustomEvent('provider:openRegistration', {});
                document.dispatchEvent(event);
                console.log('Registration event dispatched');
            });
        } else {
            console.log('Provider registration button not found');
        }

        // Provider Login Button Handler
        const providerLoginBtn = document.querySelector('[data-action="open-provider-login"]');
        if (providerLoginBtn) {
            console.log('Provider login button found, adding event listener');
            providerLoginBtn.addEventListener('click', function() {
                console.log('Provider login button clicked');
                // Always use direct event dispatch for reliability
                const event = new CustomEvent('provider:openLogin', {});
                document.dispatchEvent(event);
                console.log('Login event dispatched');
            });
        } else {
            console.log('Provider login button not found');
        }
    }, 100);

    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navCta = document.querySelector('.nav-cta');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            navCta.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .testimonial-card, .trust-content, .section-header');
    animateElements.forEach(el => {
        observer.observe(el);
    });

// Trust Score Animation
const scoreBars = document.querySelectorAll('.score-fill');
const trustSection = document.querySelector('.trust');

const trustObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            scoreBars.forEach((bar, index) => {
                setTimeout(() => {
                    const targetWidth = bar.style.width;
                    bar.style.width = '0%';
                    // Force reflow
                    bar.offsetHeight;
                    bar.style.width = targetWidth;
                }, index * 200);
            });
        }
    });
}, { threshold: 0.5 });

if (trustSection) {
    trustObserver.observe(trustSection);
}
    // Counter Animation for Hero Stats
    const statNumbers = document.querySelectorAll('.stat-number');
    const heroSection = document.querySelector('.hero');

    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNumbers.forEach((stat, index) => {
                    const target = stat.textContent;
                    const isDecimal = target.includes('.');
                    const finalNumber = isDecimal ? parseFloat(target) : parseInt(target);
                    
                    animateCounter(stat, 0, finalNumber, 2000, isDecimal);
                });
            }
        });
    }, { threshold: 0.5 });

    if (heroSection) {
        counterObserver.observe(heroSection);
    }

    // Counter animation function
    function animateCounter(element, start, end, duration, isDecimal = false) {
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (end - start) * easeOutQuart(progress);
            element.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }

    // Easing function
    function easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }

    // Video placeholder click handlers
    const videoPlaceholders = document.querySelectorAll('.video-placeholder');
    videoPlaceholders.forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            showVideoModal();
        });
    });

    // Video modal function
    function showVideoModal() {
        // Create modal overlay
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

        // Add modal styles
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

        // Add styles to head
        const styleSheet = document.createElement('style');
        styleSheet.textContent = modalStyles;
        document.head.appendChild(styleSheet);

        // Add modal to body
        document.body.appendChild(modal);

        // Close modal handlers
        const closeModal = () => {
            document.body.removeChild(modal);
            document.head.removeChild(styleSheet);
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Button click animations
    const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary, .btn-outline');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    console.log('CareLuva landing page initialized successfully!');
});
