/**
 * Trust Score Calculator
 * Calculates a 1-10 trust score for clinics based on multiple factors
 */

class TrustScoreCalculator {
    constructor() {
        this.weights = {
            reviews: 0.35,        // Review quality and quantity (35%)
            responsiveness: 0.25,  // Response times (25%)
            credentials: 0.20,     // Certifications and credentials (20%)
            transparency: 0.15,    // Pricing transparency (15%)
            experience: 0.05       // Years of experience (5%)
        };
    }

    /**
     * Calculate trust score for a clinic
     * @param {Object} clinicData - Clinic registration data
     * @param {Object} reviewData - Review statistics (optional)
     * @param {Object} pricingData - Pricing data (optional)
     * @param {Object} appointmentData - Appointment statistics (optional)
     * @returns {Object} Trust score details
     */
    calculateTrustScore(clinicData, reviewData = null, pricingData = null, appointmentData = null) {
        const scores = {
            reviews: this.calculateReviewScore(reviewData),
            responsiveness: this.calculateResponsivenessScore(appointmentData),
            credentials: this.calculateCredentialsScore(clinicData),
            transparency: this.calculateTransparencyScore(pricingData),
            experience: this.calculateExperienceScore(clinicData)
        };

        // Calculate weighted total
        const totalScore = 
            scores.reviews * this.weights.reviews +
            scores.responsiveness * this.weights.responsiveness +
            scores.credentials * this.weights.credentials +
            scores.transparency * this.weights.transparency +
            scores.experience * this.weights.experience;

        // Round to 1 decimal place and ensure it's between 0-10
        const finalScore = Math.min(10, Math.max(0, Math.round(totalScore * 10) / 10));

        return {
            score: finalScore,
            breakdown: scores,
            weights: this.weights,
            level: this.getTrustLevel(finalScore),
            color: this.getTrustColor(finalScore)
        };
    }

    /**
     * Calculate review score (0-10)
     */
    calculateReviewScore(reviewData) {
        if (!reviewData || !reviewData.averageRating) {
            return 5.0; // Neutral score if no reviews
        }

        const rating = reviewData.averageRating || 0;
        const reviewCount = reviewData.reviewCount || 0;
        
        // Base score from rating (0-5 stars = 0-10 points)
        let score = rating * 2;
        
        // Boost based on review quantity (more reviews = more reliable)
        if (reviewCount >= 50) {
            score = Math.min(10, score + 1.0);
        } else if (reviewCount >= 20) {
            score = Math.min(10, score + 0.5);
        } else if (reviewCount >= 10) {
            score = Math.min(10, score + 0.3);
        } else if (reviewCount < 3) {
            score = score * 0.8; // Penalty for very few reviews
        }
        
        return Math.min(10, Math.max(0, score));
    }

    /**
     * Calculate responsiveness score (0-10)
     */
    calculateResponsivenessScore(appointmentData) {
        if (!appointmentData || !appointmentData.averageResponseTime) {
            return 5.0; // Neutral if no data
        }

        const avgResponseTime = appointmentData.averageResponseTime; // in hours
        
        // Fast response = higher score
        if (avgResponseTime <= 2) {
            return 10.0; // Excellent (responds within 2 hours)
        } else if (avgResponseTime <= 6) {
            return 8.0; // Very good (responds within 6 hours)
        } else if (avgResponseTime <= 12) {
            return 6.0; // Good (responds within 12 hours)
        } else if (avgResponseTime <= 24) {
            return 4.0; // Moderate (responds within 24 hours)
        } else if (avgResponseTime <= 48) {
            return 2.0; // Slow (responds within 48 hours)
        } else {
            return 1.0; // Very slow (more than 48 hours)
        }
    }

    /**
     * Calculate credentials score (0-10)
     */
    calculateCredentialsScore(clinicData) {
        let score = 0;
        
        // Certifications (clinic level)
        if (clinicData.clinicCertifications && Array.isArray(clinicData.clinicCertifications)) {
            score += Math.min(3, clinicData.clinicCertifications.length * 0.5);
        }
        
        // Professional certifications
        if (clinicData.professionals && Array.isArray(clinicData.professionals)) {
            const professionalCerts = clinicData.professionals.reduce((sum, prof) => {
                return sum + (prof.certifications && Array.isArray(prof.certifications) ? prof.certifications.length : 0);
            }, 0);
            score += Math.min(3, professionalCerts * 0.3);
        }
        
        // Insurance
        if (clinicData.insuranceProvider && clinicData.insurancePolicyNumber) {
            score += 2.0;
            // Bonus for valid insurance
            if (clinicData.insuranceEndDate && new Date(clinicData.insuranceEndDate) >= new Date()) {
                score += 1.0;
            }
        }
        
        // Medical license
        if (clinicData.medicalLicense || 
            (clinicData.professionals && clinicData.professionals.some(p => p.medicalLicense))) {
            score += 1.0;
        }
        
        return Math.min(10, score);
    }

    /**
     * Calculate transparency score (0-10)
     */
    calculateTransparencyScore(pricingData) {
        if (!pricingData || !pricingData.services || pricingData.status !== 'approved') {
            return 0; // No pricing = no transparency
        }
        
        const serviceCount = Object.keys(pricingData.services).length;
        
        // More services with pricing = higher transparency
        if (serviceCount >= 20) {
            return 10.0;
        } else if (serviceCount >= 15) {
            return 8.5;
        } else if (serviceCount >= 10) {
            return 7.0;
        } else if (serviceCount >= 5) {
            return 5.0;
        } else if (serviceCount >= 3) {
            return 3.0;
        } else {
            return 1.0;
        }
    }

    /**
     * Calculate experience score (0-10)
     */
    calculateExperienceScore(clinicData) {
        const clinicExp = clinicData.clinicExperienceYears;
        let experienceYears = 0;
        
        if (typeof clinicExp === 'number') {
            experienceYears = clinicExp;
        } else if (typeof clinicExp === 'string') {
            // Handle ranges like "3-5", "6-10", etc.
            if (clinicExp.includes('-')) {
                experienceYears = parseInt(clinicExp.split('-')[0]);
            } else if (clinicExp.includes('+')) {
                experienceYears = parseInt(clinicExp.replace('+', ''));
            } else {
                experienceYears = parseInt(clinicExp) || 0;
            }
        }
        
        // Professional experience
        if (clinicData.professionals && Array.isArray(clinicData.professionals)) {
            const avgProfExp = clinicData.professionals.reduce((sum, prof) => {
                const exp = prof.experienceYears || prof.experience || 0;
                return sum + (typeof exp === 'number' ? exp : parseInt(exp) || 0);
            }, 0) / clinicData.professionals.length;
            
            experienceYears = Math.max(experienceYears, avgProfExp);
        }
        
        // Legacy support
        if (!experienceYears && clinicData.experienceYears) {
            const exp = clinicData.experienceYears;
            if (typeof exp === 'string') {
                if (exp.includes('-')) {
                    experienceYears = parseInt(exp.split('-')[0]);
                } else if (exp.includes('+')) {
                    experienceYears = parseInt(exp.replace('+', ''));
                }
            }
        }
        
        // Score based on years (capped at 10)
        if (experienceYears >= 20) return 10.0;
        if (experienceYears >= 15) return 8.5;
        if (experienceYears >= 10) return 7.0;
        if (experienceYears >= 5) return 5.0;
        if (experienceYears >= 3) return 3.0;
        return 1.0;
    }

    /**
     * Get trust level label
     */
    getTrustLevel(score) {
        if (score >= 9.0) return 'Excellent';
        if (score >= 7.5) return 'Very Good';
        if (score >= 6.0) return 'Good';
        if (score >= 4.5) return 'Fair';
        if (score >= 3.0) return 'Below Average';
        return 'Poor';
    }

    /**
     * Get trust color
     */
    getTrustColor(score) {
        if (score >= 8.0) return '#10b981'; // Green
        if (score >= 6.0) return '#3b82f6'; // Blue
        if (score >= 4.0) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    }

    /**
     * Generate HTML for trust score display
     */
    generateTrustScoreHTML(trustScoreData, size = 'medium') {
        const { score, level, color, breakdown } = trustScoreData;
        
        const sizes = {
            small: { fontSize: '1rem', circleSize: '60px' },
            medium: { fontSize: '1.5rem', circleSize: '80px' },
            large: { fontSize: '2rem', circleSize: '120px' }
        };
        
        const sizeStyle = sizes[size] || sizes.medium;
        
        return `
            <div class="trust-score-display" style="display: flex; align-items: center; gap: 20px;">
                <div class="trust-score-circle" style="
                    width: ${sizeStyle.circleSize};
                    height: ${sizeStyle.circleSize};
                    border-radius: 50%;
                    background: ${color};
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                ">
                    <div style="font-size: ${sizeStyle.fontSize};">${score.toFixed(1)}</div>
                    <div style="font-size: 0.5em; opacity: 0.9;">/10</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">Trust Score: ${level}</div>
                    <div style="font-size: 0.875rem; color: #6b7280;">Based on reviews, responsiveness, credentials, and transparency</div>
                </div>
            </div>
        `;
    }

    /**
     * Generate breakdown HTML
     */
    generateBreakdownHTML(trustScoreData) {
        const { breakdown, weights } = trustScoreData;
        
        return `
            <div class="trust-score-breakdown" style="margin-top: 20px;">
                <h4 style="margin-bottom: 15px; color: #1f2937;">Score Breakdown</h4>
                <div style="display: grid; gap: 12px;">
                    ${Object.entries(breakdown).map(([category, score]) => {
                        const weight = weights[category] * 100;
                        const categoryNames = {
                            reviews: 'Reviews & Ratings',
                            responsiveness: 'Response Times',
                            credentials: 'Credentials & Certifications',
                            transparency: 'Pricing Transparency',
                            experience: 'Experience'
                        };
                        
                        return `
                            <div style="padding: 12px; background: #f9fafb; border-radius: 8px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <span style="font-weight: 500; color: #374151;">${categoryNames[category] || category}</span>
                                    <span style="font-weight: 700; color: #1f2937;">${score.toFixed(1)}/10</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                                        <div style="height: 100%; width: ${(score / 10) * 100}%; background: #3b82f6; transition: width 0.3s;"></div>
                                    </div>
                                    <span style="font-size: 0.75rem; color: #6b7280;">${weight.toFixed(0)}% weight</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
}

// Make available globally
window.TrustScoreCalculator = TrustScoreCalculator;

