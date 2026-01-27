/**
 * Clinic Verification System
 * Handles clinic onboarding criteria verification and badge management
 */

class ClinicVerificationSystem {
    constructor() {
        this.db = null;
        this.verificationCriteria = {
            certified: {
                name: 'Certified',
                description: 'Professional certifications verified',
                requirements: {
                    hasCertifications: true,
                    minCertifications: 1
                }
            },
            insured: {
                name: 'Insured',
                description: 'Malpractice insurance verified',
                requirements: {
                    hasInsurance: true,
                    insuranceValid: true
                }
            },
            experienced: {
                name: 'Experienced',
                description: 'Minimum 3+ years of experience',
                requirements: {
                    minExperienceYears: 3
                }
            },
            verified: {
                name: 'Verified',
                description: 'All requirements met and approved',
                requirements: {
                    allBadges: true,
                    adminApproved: true
                }
            }
        };
    }

    /**
     * Initialize with Firestore instance
     */
    initialize(db) {
        this.db = db;
    }

    /**
     * Verify clinic against all criteria
     */
    async verifyClinic(clinicId) {
        try {
            if (!this.db) {
                throw new Error('Firestore not initialized');
            }

            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const clinicRef = doc(this.db, 'providerRegistrations', clinicId);
            const clinicSnap = await getDoc(clinicRef);

            if (!clinicSnap.exists()) {
                throw new Error('Clinic not found');
            }

            const clinicData = clinicSnap.data();
            const verificationResults = {
                certified: this.checkCertified(clinicData),
                insured: this.checkInsured(clinicData),
                experienced: this.checkExperienced(clinicData),
                verified: false
            };

            // Verified badge requires all other badges
            verificationResults.verified = 
                verificationResults.certified && 
                verificationResults.insured && 
                verificationResults.experienced &&
                clinicData.status === 'approved';

            return verificationResults;
        } catch (error) {
            console.error('Error verifying clinic:', error);
            throw error;
        }
    }

    /**
     * Check Certified badge eligibility
     */
    checkCertified(clinicData) {
        // Check clinic-level certifications
        const hasClinicCerts = clinicData.clinicCertifications && 
                               Array.isArray(clinicData.clinicCertifications) && 
                               clinicData.clinicCertifications.length > 0;

        // Check professional certifications
        const hasProfessionalCerts = clinicData.professionals && 
                                     Array.isArray(clinicData.professionals) &&
                                     clinicData.professionals.some(prof => 
                                         prof.certifications && 
                                         Array.isArray(prof.certifications) && 
                                         prof.certifications.length > 0
                                     );

        return hasClinicCerts || hasProfessionalCerts;
    }

    /**
     * Check Insured badge eligibility
     */
    checkInsured(clinicData) {
        if (!clinicData.insurancePolicyNumber) {
            return false;
        }

        // Check if insurance is valid (not expired)
        if (clinicData.insuranceEndDate) {
            const endDate = new Date(clinicData.insuranceEndDate);
            const today = new Date();
            return endDate >= today;
        }

        return true; // If no end date, assume valid
    }

    /**
     * Check Experienced badge eligibility
     */
    checkExperienced(clinicData) {
        // Check clinic-level experience
        const clinicExperience = this.parseExperienceYears(clinicData.clinicExperienceYears);
        if (clinicExperience >= 3) {
            return true;
        }

        // Check professional experience
        if (clinicData.professionals && Array.isArray(clinicData.professionals)) {
            return clinicData.professionals.some(prof => {
                const profExperience = this.parseExperienceYears(prof.experienceYears);
                return profExperience >= 3;
            });
        }

        return false;
    }

    /**
     * Parse experience years from various formats
     */
    parseExperienceYears(experience) {
        if (!experience) return 0;
        
        if (typeof experience === 'number') {
            return experience;
        }

        if (typeof experience === 'string') {
            // Handle ranges like "3-5", "6-10", "20+"
            if (experience.includes('-')) {
                const parts = experience.split('-');
                return parseInt(parts[0]) || 0;
            }
            if (experience.includes('+')) {
                return parseInt(experience.replace('+', '')) || 0;
            }
            return parseInt(experience) || 0;
        }

        return 0;
    }

    /**
     * Update clinic badges
     */
    async updateClinicBadges(clinicId) {
        try {
            const verificationResults = await this.verifyClinic(clinicId);
            const badges = [];

            if (verificationResults.certified) badges.push('certified');
            if (verificationResults.insured) badges.push('insured');
            if (verificationResults.experienced) badges.push('experienced');
            if (verificationResults.verified) badges.push('verified');

            const { doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const clinicRef = doc(this.db, 'providerRegistrations', clinicId);
            
            await updateDoc(clinicRef, {
                badges: badges,
                badgeVerificationDate: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return badges;
        } catch (error) {
            console.error('Error updating clinic badges:', error);
            throw error;
        }
    }

    /**
     * Get badge status for a clinic
     */
    async getBadgeStatus(clinicId) {
        try {
            const verificationResults = await this.verifyClinic(clinicId);
            const badges = [];

            if (verificationResults.certified) badges.push('certified');
            if (verificationResults.insured) badges.push('insured');
            if (verificationResults.experienced) badges.push('experienced');
            if (verificationResults.verified) badges.push('verified');

            return {
                badges: badges,
                details: verificationResults,
                criteria: this.verificationCriteria
            };
        } catch (error) {
            console.error('Error getting badge status:', error);
            throw error;
        }
    }

    /**
     * Check badge expiry
     */
    checkBadgeExpiry(clinicData) {
        const expiryIssues = [];

        // Check insurance expiry
        if (clinicData.insuranceEndDate) {
            const endDate = new Date(clinicData.insuranceEndDate);
            const today = new Date();
            const daysUntilExpiry = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));

            if (daysUntilExpiry < 0) {
                expiryIssues.push({
                    badge: 'insured',
                    issue: 'Insurance expired',
                    daysOverdue: Math.abs(daysUntilExpiry)
                });
            } else if (daysUntilExpiry < 30) {
                expiryIssues.push({
                    badge: 'insured',
                    issue: 'Insurance expiring soon',
                    daysUntilExpiry: daysUntilExpiry
                });
            }
        }

        return expiryIssues;
    }
}

// Make available globally
window.ClinicVerificationSystem = ClinicVerificationSystem;

