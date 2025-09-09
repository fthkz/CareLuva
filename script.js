// CareLuva Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
    
    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header Scroll Effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.trust-item, .step, .feature-card, .testimonial-card').forEach(el => {
        observer.observe(el);
    });
    
    // Trust Score Animation
    function animateTrustScore() {
        const scoreNumbers = document.querySelectorAll('.score-number, .stat-number');
        
        scoreNumbers.forEach(scoreElement => {
            const finalScore = parseFloat(scoreElement.textContent);
            let currentScore = 0;
            const increment = finalScore / 50; // 50 steps for smooth animation
            const duration = 2000; // 2 seconds
            const stepTime = duration / 50;
            
            const timer = setInterval(() => {
                currentScore += increment;
                if (currentScore >= finalScore) {
                    currentScore = finalScore;
                    clearInterval(timer);
                }
                
                if (scoreElement.classList.contains('score-number')) {
                    scoreElement.textContent = currentScore.toFixed(1);
                } else {
                    // For stat numbers, handle different formats
                    const originalText = scoreElement.getAttribute('data-original') || scoreElement.textContent;
                    if (originalText.includes('%')) {
                        scoreElement.textContent = Math.round(currentScore) + '%';
                    } else if (originalText.includes('+')) {
                        scoreElement.textContent = Math.round(currentScore).toLocaleString() + '+';
                    } else {
                        scoreElement.textContent = Math.round(currentScore).toLocaleString();
                    }
                }
            }, stepTime);
        });
    }
    
    // Store original values for stat numbers
    document.querySelectorAll('.stat-number').forEach(el => {
        el.setAttribute('data-original', el.textContent);
        el.textContent = '0';
    });
    
    // Trigger trust score animation when hero section is visible
    const heroObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(animateTrustScore, 500);
                heroObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroObserver.observe(heroSection);
    }
    
    // Progress Bar Animation
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress');
        
        progressBars.forEach(bar => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 500);
        });
    }
    
    // Trigger progress bar animation when trust card is visible
    const trustCardObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateProgressBars();
                trustCardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const trustCard = document.querySelector('.trust-card');
    if (trustCard) {
        trustCardObserver.observe(trustCard);
    }
    
    // Video Placeholder Click Handler
    document.querySelectorAll('.video-placeholder').forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            // In a real implementation, this would open a video modal or navigate to video
            console.log('Video clicked - would open video modal');
            
            // Add a visual feedback
            const playButton = this.querySelector('.play-button');
            if (playButton) {
                playButton.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    playButton.style.transform = 'scale(1.1)';
                }, 100);
                setTimeout(() => {
                    playButton.style.transform = 'scale(1)';
                }, 200);
            }
        });
    });
    
    // CTA Button Click Handlers
    document.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // In a real implementation, handle the actual action
            if (this.textContent.includes('Find Your Provider') || this.textContent.includes('Get Started')) {
                console.log('Navigate to provider search');
            } else if (this.textContent.includes('Join CareLuva')) {
                console.log('Navigate to provider signup');
            } else if (this.textContent.includes('Start Your Search')) {
                console.log('Navigate to search page');
            }
        });
    });
    
    // Form Validation (if forms are added later)
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Testimonial Card Hover Effects
    document.querySelectorAll('.testimonial-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Feature Card Interactions
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
    
    // Trust Score Hover Effect
    document.querySelectorAll('.score-circle').forEach(circle => {
        circle.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 10px 25px rgba(245, 158, 11, 0.3)';
        });
        
        circle.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Lazy Loading for Images (when images are added)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Accessibility Improvements
    // Add keyboard navigation for custom elements
    document.querySelectorAll('.play-button, .score-circle').forEach(element => {
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'button');
        
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Announce dynamic content changes for screen readers
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    // Performance Monitoring
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
            }, 0);
        });
    }
    
    // Error Handling
    window.addEventListener('error', function(e) {
        console.error('JavaScript error:', e.error);
        // In production, you might want to send this to an error tracking service
    });
    
    // Initialize tooltips (if needed later)
    function initTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', function() {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.getAttribute('data-tooltip');
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            });
            
            element.addEventListener('mouseleave', function() {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        });
    }
    
    initTooltips();
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    .tooltip {
        position: absolute;
        background: #1f2937;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 1000;
        pointer-events: none;
        opacity: 0.9;
    }
    
    .tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #1f2937 transparent transparent transparent;
    }
    
    .header.scrolled {
        background-color: rgba(255, 255, 255, 0.98);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .nav-links.active {
        display: flex;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-top: 1px solid #e5e7eb;
    }
    
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    @media (max-width: 768px) {
        .nav-links {
            display: none;
        }
    }
`;
document.head.appendChild(style);