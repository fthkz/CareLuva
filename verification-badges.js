/**
 * Verification Badges System
 * Displays verification badges for providers based on their verification status
 */

class VerificationBadges {
    constructor() {
        this.badgeTypes = {
            certified: {
                name: 'Certified',
                icon: '✓',
                color: '#10b981',
                bgColor: '#d1fae5',
                description: 'Professional certifications verified'
            },
            insured: {
                name: 'Insured',
                icon: '🛡️',
                color: '#3b82f6',
                bgColor: '#dbeafe',
                description: 'Malpractice insurance verified'
            },
            experienced: {
                name: 'Experienced',
                icon: '⭐',
                color: '#f59e0b',
                bgColor: '#fef3c7',
                description: 'Minimum 3+ years of experience'
            },
            verified: {
                name: 'Verified',
                icon: '✓',
                color: '#8b5cf6',
                bgColor: '#ede9fe',
                description: 'Fully verified by CareLuva'
            },
            transparent: {
                name: 'Transparent Pricing',
                icon: '$',
                color: '#10b981',
                bgColor: '#d1fae5',
                description: 'Complete pricing information available'
            }
        };
    }

    /**
     * Calculate which badges a provider should have based on their data
     * @param {Object} providerData - Provider registration data
     * @returns {Array} Array of badge keys the provider qualifies for
     */
    calculateBadges(providerData) {
        const badges = [];

        // Certified badge - has certifications (clinic or professional level)
        const hasClinicCertifications = providerData.clinicCertifications && 
            Array.isArray(providerData.clinicCertifications) && 
            providerData.clinicCertifications.length > 0;
        
        const hasProfessionalCertifications = providerData.professionals && 
            Array.isArray(providerData.professionals) &&
            providerData.professionals.some(prof => 
                prof.certifications && 
                Array.isArray(prof.certifications) && 
                prof.certifications.length > 0
            );
        
        const hasOldCertifications = providerData.certifications && 
            Array.isArray(providerData.certifications) && 
            providerData.certifications.length > 0;
        
        if (hasClinicCertifications || hasProfessionalCertifications || hasOldCertifications) {
            badges.push('certified');
        }

        // Insured badge - has valid malpractice insurance
        if (providerData.insuranceProvider && 
            providerData.insurancePolicyNumber &&
            providerData.insuranceStartDate &&
            providerData.insuranceEndDate) {
            // Check if insurance is not expired
            const endDate = new Date(providerData.insuranceEndDate);
            const today = new Date();
            if (endDate >= today) {
                badges.push('insured');
            }
        }

        // Experienced badge - has minimum 3 years experience (clinic or professional level)
        const clinicExperience = providerData.clinicExperienceYears;
        const hasClinicExperience = clinicExperience && (
            (typeof clinicExperience === 'string' && parseInt(clinicExperience) >= 3) ||
            (typeof clinicExperience === 'number' && clinicExperience >= 3)
        );
        
        const hasProfessionalExperience = providerData.professionals && 
            Array.isArray(providerData.professionals) &&
            providerData.professionals.some(prof => {
                const exp = prof.experienceYears || prof.experience;
                return exp && (
                    (typeof exp === 'string' && parseInt(exp) >= 3) ||
                    (typeof exp === 'number' && exp >= 3)
                );
            });
        
        // Legacy support
        const hasOldExperience = providerData.experienceYears && (
            providerData.experienceYears === '3-5' || 
            providerData.experienceYears === '6-10' || 
            providerData.experienceYears === '11-15' || 
            providerData.experienceYears === '16-20' || 
            providerData.experienceYears === '20+'
        );
        
        if (hasClinicExperience || hasProfessionalExperience || hasOldExperience) {
            badges.push('experienced');
        }

        // Verified badge - all requirements met and status is approved
        if (providerData.status === 'approved' && 
            badges.includes('certified') && 
            badges.includes('insured') && 
            badges.includes('experienced')) {
            badges.push('verified');
        }

        // Pricing Transparency badge - has pricing for multiple services (checked separately, not in main badges)
        // This is calculated separately as it requires pricing data lookup

        return badges;
    }

    /**
     * Check if provider has transparent pricing
     * @param {Object} providerData - Provider registration data
     * @param {Object} pricingData - Service pricing data (optional)
     * @returns {boolean} True if provider has transparent pricing
     */
    hasTransparentPricing(providerData, pricingData = null) {
        if (!pricingData || !pricingData.services) return false;
        
        // Consider transparent if has pricing for at least 5 services
        const serviceCount = Object.keys(pricingData.services || {}).length;
        return serviceCount >= 5 && pricingData.status === 'approved';
    }

    /**
     * Generate HTML for a single badge
     * @param {string} badgeKey - Key of the badge to display
     * @param {string} size - Size: 'small', 'medium', 'large'
     * @returns {string} HTML string for the badge
     */
    generateBadgeHTML(badgeKey, size = 'medium') {
        const badge = this.badgeTypes[badgeKey];
        if (!badge) return '';

        const sizes = {
            small: { fontSize: '0.75rem', padding: '0.25rem 0.5rem', iconSize: '0.875rem' },
            medium: { fontSize: '0.875rem', padding: '0.375rem 0.75rem', iconSize: '1rem' },
            large: { fontSize: '1rem', padding: '0.5rem 1rem', iconSize: '1.25rem' }
        };

        const sizeStyle = sizes[size] || sizes.medium;

        return `
            <span class="verification-badge" 
                  data-badge="${badgeKey}" 
                  title="${badge.description}"
                  style="
                      display: inline-flex;
                      align-items: center;
                      gap: 0.375rem;
                      padding: ${sizeStyle.padding};
                      background: ${badge.bgColor};
                      color: ${badge.color};
                      border: 1px solid ${badge.color};
                      border-radius: 6px;
                      font-size: ${sizeStyle.fontSize};
                      font-weight: 600;
                      white-space: nowrap;
                      cursor: help;
                  ">
                <span style="font-size: ${sizeStyle.iconSize};">${badge.icon}</span>
                <span>${badge.name}</span>
            </span>
        `;
    }

    /**
     * Generate HTML for multiple badges
     * @param {Array} badgeKeys - Array of badge keys to display
     * @param {string} size - Size: 'small', 'medium', 'large'
     * @param {string} layout - Layout: 'horizontal', 'vertical', 'grid'
     * @returns {string} HTML string for all badges
     */
    generateBadgesHTML(badgeKeys, size = 'medium', layout = 'horizontal') {
        if (!badgeKeys || badgeKeys.length === 0) {
            return '<span style="color: #6b7280; font-size: 0.875rem;">No verification badges</span>';
        }

        const layoutStyles = {
            horizontal: 'display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;',
            vertical: 'display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start;',
            grid: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem;'
        };

        const badgesHTML = badgeKeys
            .map(key => this.generateBadgeHTML(key, size))
            .join('');

        return `
            <div class="verification-badges-container" style="${layoutStyles[layout] || layoutStyles.horizontal}">
                ${badgesHTML}
            </div>
        `;
    }

    /**
     * Render badges for a provider
     * @param {Object} providerData - Provider registration data
     * @param {HTMLElement} container - Container element to render badges in
     * @param {Object} options - Options: { size, layout }
     */
    renderBadges(providerData, container, options = {}) {
        if (!container) {
            console.error('Container element not provided');
            return;
        }

        const badges = this.calculateBadges(providerData);
        const { size = 'medium', layout = 'horizontal' } = options;

        container.innerHTML = this.generateBadgesHTML(badges, size, layout);
    }

    /**
     * Get badge status summary
     * @param {Object} providerData - Provider registration data
     * @returns {Object} Summary of badge status
     */
    getBadgeSummary(providerData) {
        const badges = this.calculateBadges(providerData);
        const allBadges = ['certified', 'insured', 'experienced', 'verified'];
        
        return {
            earned: badges,
            missing: allBadges.filter(b => !badges.includes(b)),
            total: allBadges.length,
            earnedCount: badges.length,
            isFullyVerified: badges.includes('verified')
        };
    }
}

// Make available globally
window.VerificationBadges = VerificationBadges;

