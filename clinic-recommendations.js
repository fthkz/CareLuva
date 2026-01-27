/**
 * Clinic Recommendation Engine
 * Provides personalized clinic recommendations based on patient preferences
 * Implements all 4 phases: Basic matching, Enhanced matching, Personalization, ML
 */

class ClinicRecommendationEngine {
    constructor() {
        // Base weights for different matching factors (sum to 1.0)
        this.baseWeights = {
            trustScore: 0.30,        // Trust Score importance (30%)
            price: 0.25,             // Price matching (25%)
            availability: 0.20,      // Appointment availability (20%)
            location: 0.15,          // Location proximity (15%)
            specialization: 0.10     // Specialization match (10%)
        };
        
        // Personalized weights (adjusted based on user behavior)
        this.personalizedWeights = { ...this.baseWeights };
        
        // Trust Score thresholds
        this.trustScoreThresholds = {
            minimum: 6.0,           // Minimum Trust Score to recommend
            preferred: 8.0           // Preferred Trust Score
        };
        
        // ML model parameters (simple linear model for Phase 4)
        this.mlModel = {
            weights: { ...this.baseWeights },
            learningRate: 0.01,
            trainingData: []
        };
    }

    /**
     * Get personalized recommendations (Main entry point)
     * @param {Object} patientPreferences - Patient preferences
     * @param {Array} clinics - Available clinics
     * @param {Object} context - Additional context (date, service, etc.)
     * @param {string} patientId - Patient ID for personalization
     * @returns {Array} Sorted array of recommended clinics with scores
     */
    async getRecommendations(patientPreferences, clinics, context = {}, patientId = null) {
        // Load patient behavior data for personalization (Phase 3)
        if (patientId) {
            await this.loadPatientPreferences(patientId);
        }
        
        const scoredClinics = [];
        
        for (const clinic of clinics) {
            // Calculate match score for this clinic
            const matchScore = await this.calculateMatchScore(
                clinic,
                patientPreferences,
                context,
                patientId
            );
            
            if (matchScore.totalScore > 0) {
                scoredClinics.push({
                    clinic: clinic,
                    score: matchScore.totalScore,
                    breakdown: matchScore.breakdown,
                    reasons: matchScore.reasons,
                    explanation: this.generateExplanation(matchScore)
                });
            }
        }
        
        // Sort by total score (highest first)
        scoredClinics.sort((a, b) => b.score - a.score);
        
        // Apply ML model adjustments (Phase 4)
        if (this.mlModel.trainingData.length > 10) {
            scoredClinics.forEach(rec => {
                rec.mlAdjustedScore = this.applyMLModel(rec, patientPreferences);
            });
            // Re-sort by ML-adjusted score if available
            scoredClinics.sort((a, b) => 
                (b.mlAdjustedScore || b.score) - (a.mlAdjustedScore || a.score)
            );
        }
        
        // Track recommendation generation (Phase 3 & 4)
        if (patientId) {
            this.trackRecommendationGeneration(patientId, scoredClinics.slice(0, 5), patientPreferences);
        }
        
        return scoredClinics;
    }

    /**
     * Calculate match score for a single clinic
     */
    async calculateMatchScore(clinic, preferences, context, patientId = null) {
        const breakdown = {};
        const reasons = [];
        let totalScore = 0;
        
        // Use personalized weights if available (Phase 3)
        const weights = patientId ? this.personalizedWeights : this.baseWeights;
        
        // 1. Trust Score Matching (30% weight)
        const trustScore = this.calculateTrustScoreMatch(clinic, preferences);
        breakdown.trustScore = trustScore.score;
        totalScore += trustScore.score * weights.trustScore;
        if (trustScore.reason) reasons.push(trustScore.reason);
        
        // 2. Price Matching (25% weight)
        const priceMatch = await this.calculatePriceMatch(clinic, preferences, context);
        breakdown.price = priceMatch.score;
        totalScore += priceMatch.score * weights.price;
        if (priceMatch.reason) reasons.push(priceMatch.reason);
        
        // 3. Availability Matching (20% weight) - Phase 2
        const availabilityMatch = await this.calculateAvailabilityMatch(clinic, preferences, context);
        breakdown.availability = availabilityMatch.score;
        totalScore += availabilityMatch.score * weights.availability;
        if (availabilityMatch.reason) reasons.push(availabilityMatch.reason);
        
        // 4. Location Matching (15% weight) - Phase 2 Enhanced
        const locationMatch = await this.calculateLocationMatch(clinic, preferences);
        breakdown.location = locationMatch.score;
        totalScore += locationMatch.score * weights.location;
        if (locationMatch.reason) reasons.push(locationMatch.reason);
        
        // 5. Specialization Matching (10% weight)
        const specializationMatch = this.calculateSpecializationMatch(clinic, preferences);
        breakdown.specialization = specializationMatch.score;
        totalScore += specializationMatch.score * weights.specialization;
        if (specializationMatch.reason) reasons.push(specializationMatch.reason);
        
        // Phase 3: Add personalization factors
        if (patientId) {
            const personalizationScore = await this.calculatePersonalizationScore(clinic, patientId);
            breakdown.personalization = personalizationScore.score;
            totalScore += personalizationScore.score * 0.1; // 10% bonus for personalization
            if (personalizationScore.reason) reasons.push(personalizationScore.reason);
        }
        
        return {
            totalScore: Math.min(1.0, totalScore), // Cap at 1.0
            breakdown: breakdown,
            reasons: reasons
        };
    }

    /**
     * Trust Score Matching
     */
    calculateTrustScoreMatch(clinic, preferences) {
        const trustScore = clinic.trustScore || 0;
        const minTrustScore = preferences.minTrustScore || this.trustScoreThresholds.minimum;
        const preferredTrustScore = preferences.preferredTrustScore || this.trustScoreThresholds.preferred;
        
        // If below minimum, return 0
        if (trustScore < minTrustScore) {
            return { score: 0, reason: null };
        }
        
        // Score based on how close to preferred
        let score = 0;
        if (trustScore >= preferredTrustScore) {
            score = 1.0; // Perfect match
        } else {
            // Linear interpolation between minimum and preferred
            score = (trustScore - minTrustScore) / (preferredTrustScore - minTrustScore);
        }
        
        const reason = trustScore >= 8.0 
            ? `Excellent Trust Score (${trustScore.toFixed(1)}/10)`
            : trustScore >= 6.0
            ? `Good Trust Score (${trustScore.toFixed(1)}/10)`
            : null;
        
        return { score, reason };
    }

    /**
     * Price Matching
     */
    async calculatePriceMatch(clinic, preferences, context) {
        const maxBudget = preferences.maxBudget;
        const preferredBudget = preferences.preferredBudget;
        const serviceId = context.serviceId;
        
        if (!maxBudget || !serviceId) {
            return { score: 0.5, reason: null }; // Neutral if no budget specified
        }
        
        // Load pricing for this clinic
        const pricingData = await this.loadClinicPricing(clinic.id);
        if (!pricingData || !pricingData.services || !pricingData.services[serviceId]) {
            return { score: 0.3, reason: 'Pricing not available' };
        }
        
        const servicePrice = parseFloat(pricingData.services[serviceId].price || 0);
        
        // Check if within budget
        if (servicePrice > maxBudget) {
            return { score: 0, reason: `Price ($${servicePrice.toFixed(2)}) exceeds budget` };
        }
        
        // Score based on how close to preferred budget
        let score = 1.0;
        if (preferredBudget && servicePrice > preferredBudget) {
            // Penalty for exceeding preferred budget
            const excess = servicePrice - preferredBudget;
            const budgetRange = maxBudget - preferredBudget;
            score = Math.max(0.5, 1.0 - (excess / budgetRange));
        }
        
        // Bonus for being below preferred budget
        if (preferredBudget && servicePrice < preferredBudget) {
            const savings = preferredBudget - servicePrice;
            const savingsPercent = (savings / preferredBudget) * 100;
            if (savingsPercent > 20) {
                score = 1.0; // Great deal
            }
        }
        
        const reason = servicePrice <= preferredBudget
            ? `Great price: $${servicePrice.toFixed(2)}`
            : `Within budget: $${servicePrice.toFixed(2)}`;
        
        return { score, reason };
    }

    /**
     * Availability Matching (Phase 2)
     */
    async calculateAvailabilityMatch(clinic, preferences, context) {
        const preferredDate = context.preferredDate;
        const preferredTime = context.preferredTime;
        
        if (!preferredDate) {
            return { score: 0.5, reason: null }; // Neutral if no date specified
        }
        
        // Check if clinic has availability on preferred date
        const availability = await this.checkClinicAvailability(
            clinic.id,
            preferredDate,
            preferredTime
        );
        
        if (availability.hasExactSlot) {
            return {
                score: 1.0,
                reason: `Available on ${new Date(preferredDate).toLocaleDateString()}${preferredTime ? ` at ${preferredTime}` : ''}`
            };
        } else if (availability.hasSlots) {
            return {
                score: 0.9,
                reason: `Available on ${new Date(preferredDate).toLocaleDateString()}`
            };
        } else if (availability.hasNearbySlots) {
            return {
                score: 0.7,
                reason: `Available within 3 days of preferred date`
            };
        } else if (availability.hasSlotsThisWeek) {
            return {
                score: 0.5,
                reason: 'Available this week'
            };
        } else {
            return {
                score: 0.3,
                reason: 'Limited availability - check calendar'
            };
        }
    }

    /**
     * Location Matching (Phase 2 - Enhanced with distance)
     */
    async calculateLocationMatch(clinic, preferences) {
        const patientLocation = preferences.location; // City or address
        const clinicLocation = clinic.city || clinic.address;
        
        if (!patientLocation || !clinicLocation) {
            return { score: 0.5, reason: null };
        }
        
        // Simple city matching (can be enhanced with distance calculation)
        const patientCity = patientLocation.toLowerCase().trim();
        const clinicCity = clinicLocation.toLowerCase().trim();
        
        if (patientCity === clinicCity) {
            return { score: 1.0, reason: `Same city: ${clinic.city || clinicCity}` };
        } else if (clinicCity.includes(patientCity) || patientCity.includes(clinicCity)) {
            return { score: 0.8, reason: `Nearby: ${clinic.city || clinicCity}` };
        } else {
            // Calculate approximate distance (simple string similarity)
            const similarity = this.calculateStringSimilarity(patientCity, clinicCity);
            if (similarity > 0.5) {
                return { score: 0.6, reason: `Similar location: ${clinic.city || clinicCity}` };
            }
            return { score: 0.4, reason: `Location: ${clinic.city || clinicCity}` };
        }
    }

    /**
     * Specialization Matching
     */
    calculateSpecializationMatch(clinic, preferences) {
        const preferredSpecialization = preferences.specialization;
        
        if (!preferredSpecialization) {
            return { score: 0.5, reason: null };
        }
        
        const clinicSpecialization = (clinic.specialization || '').toLowerCase();
        const preferred = preferredSpecialization.toLowerCase();
        
        if (clinicSpecialization === preferred) {
            return {
                score: 1.0,
                reason: `Matches specialization: ${clinic.specialization}`
            };
        } else if (clinicSpecialization.includes(preferred) || preferred.includes(clinicSpecialization)) {
            return {
                score: 0.7,
                reason: `Related specialization: ${clinic.specialization}`
            };
        } else {
            return { score: 0.3, reason: null };
        }
    }

    /**
     * Personalization Score (Phase 3)
     */
    async calculatePersonalizationScore(clinic, patientId) {
        let score = 0;
        const reasons = [];
        
        // Check if clinic is in favorites
        const isFavorite = await this.isClinicFavorite(patientId, clinic.id);
        if (isFavorite) {
            score += 0.3;
            reasons.push('In your favorites');
        }
        
        // Check if patient has booked with this clinic before
        const hasBookedBefore = await this.hasBookedBefore(patientId, clinic.id);
        if (hasBookedBefore) {
            score += 0.4;
            reasons.push('You\'ve booked here before');
        }
        
        // Check if similar to previously viewed clinics
        const similarToViewed = await this.isSimilarToViewed(patientId, clinic);
        if (similarToViewed) {
            score += 0.2;
            reasons.push('Similar to clinics you viewed');
        }
        
        // Check if matches patient's preferred characteristics
        const matchesPreferences = await this.matchesHistoricalPreferences(patientId, clinic);
        if (matchesPreferences) {
            score += 0.1;
            reasons.push('Matches your preferences');
        }
        
        return {
            score: Math.min(1.0, score),
            reason: reasons.length > 0 ? reasons.join(', ') : null
        };
    }

    /**
     * Apply ML Model (Phase 4)
     */
    applyMLModel(recommendation, preferences) {
        if (this.mlModel.trainingData.length < 10) {
            return recommendation.score; // Not enough data
        }
        
        // Simple linear model adjustment
        const baseScore = recommendation.score;
        let mlAdjustment = 0;
        
        // Adjust based on historical success patterns
        const successPattern = this.analyzeSuccessPattern(recommendation, preferences);
        mlAdjustment = successPattern.adjustment;
        
        return Math.min(1.0, Math.max(0, baseScore + mlAdjustment));
    }

    /**
     * Analyze success pattern for ML
     */
    analyzeSuccessPattern(recommendation, preferences) {
        // Find similar recommendations that led to bookings
        const similarRecs = this.mlModel.trainingData.filter(data => {
            return Math.abs(data.recommendation.score - recommendation.score) < 0.2 &&
                   data.outcome === 'booked';
        });
        
        if (similarRecs.length > 0) {
            const successRate = similarRecs.length / this.mlModel.trainingData.length;
            return {
                adjustment: successRate * 0.1, // Small positive adjustment
                confidence: successRate
            };
        }
        
        return { adjustment: 0, confidence: 0 };
    }

    /**
     * Load patient preferences for personalization (Phase 3)
     */
    async loadPatientPreferences(patientId) {
        try {
            if (!window.firebase || !window.firebase.db) return;
            
            const { doc, getDoc, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;
            
            // Load patient behavior data
            const behaviorRef = doc(db, 'patientBehavior', patientId);
            const behaviorSnap = await getDoc(behaviorRef);
            
            if (behaviorSnap.exists()) {
                const behavior = behaviorSnap.data();
                
                // Adjust weights based on behavior
                if (behavior.preferredFactors) {
                    this.personalizedWeights = {
                        trustScore: behavior.preferredFactors.trustScore || this.baseWeights.trustScore,
                        price: behavior.preferredFactors.price || this.baseWeights.price,
                        availability: behavior.preferredFactors.availability || this.baseWeights.availability,
                        location: behavior.preferredFactors.location || this.baseWeights.location,
                        specialization: behavior.preferredFactors.specialization || this.baseWeights.specialization
                    };
                }
            }
        } catch (error) {
            console.error('Error loading patient preferences:', error);
        }
    }

    /**
     * Track recommendation generation (Phase 3 & 4)
     */
    async trackRecommendationGeneration(patientId, recommendations, preferences) {
        try {
            if (!window.firebase || !window.firebase.db) return;
            
            const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;
            
            await addDoc(collection(db, 'recommendationHistory'), {
                patientId: patientId,
                recommendations: recommendations.map(r => ({
                    clinicId: r.clinic.id,
                    score: r.score,
                    mlAdjustedScore: r.mlAdjustedScore || null
                })),
                preferences: preferences,
                timestamp: serverTimestamp(),
                date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error('Error tracking recommendations:', error);
        }
    }

    /**
     * Record recommendation outcome (Phase 4 - ML training)
     */
    async recordOutcome(patientId, clinicId, recommendationScore, outcome) {
        // outcome: 'viewed', 'booked', 'favorited', 'ignored'
        try {
            if (!window.firebase || !window.firebase.db) return;
            
            const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;
            
            const outcomeData = {
                patientId: patientId,
                clinicId: clinicId,
                recommendationScore: recommendationScore,
                outcome: outcome,
                timestamp: serverTimestamp()
            };
            
            await addDoc(collection(db, 'recommendationOutcomes'), outcomeData);
            
            // Update ML model training data
            this.mlModel.trainingData.push({
                recommendation: { score: recommendationScore },
                outcome: outcome
            });
            
            // Keep only last 1000 records
            if (this.mlModel.trainingData.length > 1000) {
                this.mlModel.trainingData = this.mlModel.trainingData.slice(-1000);
            }
            
            // Update patient behavior
            await this.updatePatientBehavior(patientId, clinicId, outcome);
            
        } catch (error) {
            console.error('Error recording outcome:', error);
        }
    }

    /**
     * Update patient behavior (Phase 3)
     */
    async updatePatientBehavior(patientId, clinicId, outcome) {
        try {
            if (!window.firebase || !window.firebase.db) return;
            
            const { doc, getDoc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;
            
            const behaviorRef = doc(db, 'patientBehavior', patientId);
            const behaviorSnap = await getDoc(behaviorRef);
            
            const currentBehavior = behaviorSnap.exists() ? behaviorSnap.data() : {
                viewedClinics: [],
                bookedClinics: [],
                favoritedClinics: [],
                preferredFactors: { ...this.baseWeights },
                updatedAt: serverTimestamp()
            };
            
            // Update based on outcome
            if (outcome === 'viewed' && !currentBehavior.viewedClinics.includes(clinicId)) {
                currentBehavior.viewedClinics.push(clinicId);
            } else if (outcome === 'booked' && !currentBehavior.bookedClinics.includes(clinicId)) {
                currentBehavior.bookedClinics.push(clinicId);
            } else if (outcome === 'favorited' && !currentBehavior.favoritedClinics.includes(clinicId)) {
                currentBehavior.favoritedClinics.push(clinicId);
            }
            
            // Adjust preferred factors based on behavior
            currentBehavior.preferredFactors = this.calculatePreferredFactors(currentBehavior);
            currentBehavior.updatedAt = serverTimestamp();
            
            await setDoc(behaviorRef, currentBehavior);
            
            // Update personalized weights
            this.personalizedWeights = currentBehavior.preferredFactors;
            
        } catch (error) {
            console.error('Error updating patient behavior:', error);
        }
    }

    /**
     * Calculate preferred factors from behavior (Phase 3)
     */
    calculatePreferredFactors(behavior) {
        // Analyze which factors matter most to this patient
        // Based on their booking/viewing patterns
        
        const factors = { ...this.baseWeights };
        
        // If patient frequently books high Trust Score clinics, increase weight
        // If patient frequently books low-price clinics, increase price weight
        // etc.
        
        // For now, return base weights (can be enhanced with actual analysis)
        return factors;
    }

    /**
     * Helper: Load clinic pricing
     */
    async loadClinicPricing(clinicId) {
        try {
            if (!window.firebase || !window.firebase.db) return null;
            
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;
            
            const pricingRef = doc(db, 'servicePricing', clinicId);
            const pricingSnap = await getDoc(pricingRef);
            
            if (pricingSnap.exists()) {
                const data = pricingSnap.data();
                if (data.status === 'approved') {
                    return data;
                }
            }
            return null;
        } catch (error) {
            console.error('Error loading clinic pricing:', error);
            return null;
        }
    }

    /**
     * Helper: Check clinic availability (Phase 2)
     */
    async checkClinicAvailability(clinicId, date, preferredTime = null) {
        try {
            if (!window.firebase || !window.firebase.db) {
                return { hasExactSlot: false, hasSlots: false, hasNearbySlots: false, hasSlotsThisWeek: false };
            }
            
            const { collection, query, where, getDocs, Timestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;
            
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);
            
            // Check professional schedules
            const schedulesRef = collection(db, 'professionalSchedules');
            const schedulesQuery = query(schedulesRef, where('clinicId', '==', clinicId));
            const schedulesSnap = await getDocs(schedulesQuery);
            
            if (schedulesSnap.empty) {
                return { hasExactSlot: false, hasSlots: false, hasNearbySlots: false, hasSlotsThisWeek: false };
            }
            
            // Check existing appointments
            const appointmentsRef = collection(db, 'appointments');
            const appointmentsQuery = query(
                appointmentsRef,
                where('clinicId', '==', clinicId),
                where('date', '>=', Timestamp.fromDate(startOfDay)),
                where('date', '<=', Timestamp.fromDate(endOfDay))
            );
            const appointmentsSnap = await getDocs(appointmentsQuery);
            
            const bookedSlots = new Set();
            appointmentsSnap.forEach(doc => {
                const apt = doc.data();
                if (apt.time) bookedSlots.add(apt.time);
            });
            
            // Check if there are available slots
            let hasExactSlot = false;
            let hasSlots = false;
            
            schedulesSnap.forEach(doc => {
                const schedule = doc.data();
                const dayOfWeek = targetDate.getDay();
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const dayName = dayNames[dayOfWeek];
                
                if (schedule.weeklySchedule && schedule.weeklySchedule[dayName] && schedule.weeklySchedule[dayName].enabled) {
                    const timeSlots = schedule.weeklySchedule[dayName].timeSlots || [];
                    const availableSlots = timeSlots.filter(slot => !bookedSlots.has(slot));
                    
                    if (availableSlots.length > 0) {
                        hasSlots = true;
                        if (preferredTime && availableSlots.includes(preferredTime)) {
                            hasExactSlot = true;
                        }
                    }
                }
            });
            
            // Check nearby dates (within 3 days) - simplified to avoid recursion
            let hasNearbySlots = false;
            if (!hasSlots && schedulesSnap.size > 0) {
                // Check if any professional has availability in the next 3 days
                for (let i = 1; i <= 3; i++) {
                    const checkDate = new Date(targetDate);
                    checkDate.setDate(checkDate.getDate() + i);
                    const checkDayOfWeek = checkDate.getDay();
                    const checkDayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const checkDayName = checkDayNames[checkDayOfWeek];
                    
                    // Quick check if any schedule has this day enabled
                    let foundAvailable = false;
                    schedulesSnap.forEach(doc => {
                        const schedule = doc.data();
                        if (schedule.weeklySchedule && schedule.weeklySchedule[checkDayName] && schedule.weeklySchedule[checkDayName].enabled) {
                            foundAvailable = true;
                        }
                    });
                    
                    if (foundAvailable) {
                        hasNearbySlots = true;
                        break;
                    }
                }
            }
            
            // Check this week - simplified
            let hasSlotsThisWeek = false;
            if (!hasSlots && !hasNearbySlots && schedulesSnap.size > 0) {
                // Check if any day this week has availability
                const weekStart = new Date(targetDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                for (let i = 0; i < 7; i++) {
                    const checkDate = new Date(weekStart);
                    checkDate.setDate(checkDate.getDate() + i);
                    const checkDayOfWeek = checkDate.getDay();
                    const checkDayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const checkDayName = checkDayNames[checkDayOfWeek];
                    
                    let foundAvailable = false;
                    schedulesSnap.forEach(doc => {
                        const schedule = doc.data();
                        if (schedule.weeklySchedule && schedule.weeklySchedule[checkDayName] && schedule.weeklySchedule[checkDayName].enabled) {
                            foundAvailable = true;
                        }
                    });
                    
                    if (foundAvailable) {
                        hasSlotsThisWeek = true;
                        break;
                    }
                }
            }
            
            return { hasExactSlot, hasSlots, hasNearbySlots, hasSlotsThisWeek };
        } catch (error) {
            console.error('Error checking availability:', error);
            return { hasExactSlot: false, hasSlots: false, hasNearbySlots: false, hasSlotsThisWeek: false };
        }
    }

    /**
     * Helper: Check if clinic is favorite
     */
    async isClinicFavorite(patientId, clinicId) {
        try {
            if (!window.firebase || !window.firebase.db) return false;
            
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;
            
            // Get patient email from patientId or session
            let patientEmail = patientId;
            if (window.authUtils) {
                const session = window.authUtils.getSession();
                if (session && session.registrationData) {
                    patientEmail = session.registrationData.email;
                }
            }
            
            const favoritesRef = doc(db, 'patientFavorites', patientEmail);
            const favoritesSnap = await getDoc(favoritesRef);
            
            if (favoritesSnap.exists()) {
                const clinicIds = favoritesSnap.data().clinicIds || [];
                return clinicIds.includes(clinicId);
            }
            return false;
        } catch (error) {
            console.error('Error checking favorite:', error);
            return false;
        }
    }

    /**
     * Helper: Check if patient has booked before
     */
    async hasBookedBefore(patientId, clinicId) {
        try {
            if (!window.firebase || !window.firebase.db) return false;
            
            const { collection, query, where, getDocs, limit } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;
            
            // Get patient email
            let patientEmail = patientId;
            if (window.authUtils) {
                const session = window.authUtils.getSession();
                if (session && session.registrationData) {
                    patientEmail = session.registrationData.email;
                }
            }
            
            const appointmentsRef = collection(db, 'appointments');
            const appointmentsQuery = query(
                appointmentsRef,
                where('patientEmail', '==', patientEmail),
                where('clinicId', '==', clinicId),
                limit(1)
            );
            const appointmentsSnap = await getDocs(appointmentsQuery);
            
            return !appointmentsSnap.empty;
        } catch (error) {
            console.error('Error checking booking history:', error);
            return false;
        }
    }

    /**
     * Helper: Check if similar to viewed clinics
     */
    async isSimilarToViewed(patientId, clinic) {
        try {
            if (!window.firebase || !window.firebase.db) return false;
            
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;
            
            const behaviorRef = doc(db, 'patientBehavior', patientId);
            const behaviorSnap = await getDoc(behaviorRef);
            
            if (!behaviorSnap.exists()) return false;
            
            const behavior = behaviorSnap.data();
            const viewedClinics = behavior.viewedClinics || [];
            
            // Check if any viewed clinic has similar characteristics
            for (const viewedClinicId of viewedClinics.slice(-10)) { // Last 10 viewed
                const viewedClinicRef = doc(db, 'providerRegistrations', viewedClinicId);
                const viewedClinicSnap = await getDoc(viewedClinicRef);
                
                if (viewedClinicSnap.exists()) {
                    const viewedClinic = viewedClinicSnap.data();
                    if (this.areClinicsSimilar(clinic, viewedClinic)) {
                        return true;
                    }
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error checking similar clinics:', error);
            return false;
        }
    }

    /**
     * Helper: Check if clinics are similar
     */
    areClinicsSimilar(clinic1, clinic2) {
        // Check specialization
        if (clinic1.specialization === clinic2.specialization) return true;
        
        // Check location
        if (clinic1.city === clinic2.city) return true;
        
        // Check Trust Score range
        const score1 = clinic1.trustScore || 0;
        const score2 = clinic2.trustScore || 0;
        if (Math.abs(score1 - score2) < 1.0) return true;
        
        return false;
    }

    /**
     * Helper: Check if matches historical preferences
     */
    async matchesHistoricalPreferences(patientId, clinic) {
        try {
            if (!window.firebase || !window.firebase.db) return false;
            
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;
            
            const behaviorRef = doc(db, 'patientBehavior', patientId);
            const behaviorSnap = await getDoc(behaviorRef);
            
            if (!behaviorSnap.exists()) return false;
            
            const behavior = behaviorSnap.data();
            const bookedClinics = behavior.bookedClinics || [];
            
            // Check if clinic matches pattern of booked clinics
            if (bookedClinics.length > 0) {
                // Analyze common characteristics of booked clinics
                // For now, simple check
                return bookedClinics.length > 0; // If patient has booked before, they likely have preferences
            }
            
            return false;
        } catch (error) {
            console.error('Error checking historical preferences:', error);
            return false;
        }
    }

    /**
     * Helper: Calculate string similarity
     */
    calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    /**
     * Helper: Levenshtein distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Generate recommendation explanation
     */
    generateExplanation(matchScore) {
        const reasons = matchScore.reasons.filter(r => r);
        const topReasons = reasons.slice(0, 3);
        
        return {
            summary: `Match Score: ${(matchScore.totalScore * 100).toFixed(0)}%`,
            reasons: topReasons,
            breakdown: matchScore.breakdown
        };
    }

    /**
     * Collaborative Filtering (Phase 4)
     * Find clinics that similar patients liked
     */
    async getCollaborativeRecommendations(patientId, clinics) {
        try {
            if (!window.firebase || !window.firebase.db) return [];
            
            const { collection, query, where, getDocs, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;
            
            // Find patients with similar behavior
            const behaviorRef = doc(db, 'patientBehavior', patientId);
            const behaviorSnap = await getDoc(behaviorRef);
            
            if (!behaviorSnap.exists()) return [];
            
            const currentBehavior = behaviorSnap.data();
            
            // Find other patients who booked similar clinics
            const allBehaviorRef = collection(db, 'patientBehavior');
            const allBehaviorSnap = await getDocs(allBehaviorRef);
            
            const similarPatients = [];
            allBehaviorSnap.forEach(doc => {
                if (doc.id === patientId) return;
                
                const otherBehavior = doc.data();
                const similarity = this.calculateBehaviorSimilarity(currentBehavior, otherBehavior);
                
                if (similarity > 0.5) {
                    similarPatients.push({
                        patientId: doc.id,
                        similarity: similarity,
                        bookedClinics: otherBehavior.bookedClinics || []
                    });
                }
            });
            
            // Get clinics that similar patients booked
            const recommendedClinicIds = new Set();
            similarPatients.forEach(patient => {
                patient.bookedClinics.forEach(clinicId => {
                    recommendedClinicIds.add(clinicId);
                });
            });
            
            // Filter clinics to only those recommended
            return clinics.filter(clinic => recommendedClinicIds.has(clinic.id));
            
        } catch (error) {
            console.error('Error in collaborative filtering:', error);
            return [];
        }
    }

    /**
     * Calculate behavior similarity
     */
    calculateBehaviorSimilarity(behavior1, behavior2) {
        const booked1 = new Set(behavior1.bookedClinics || []);
        const booked2 = new Set(behavior2.bookedClinics || []);
        
        const intersection = new Set([...booked1].filter(x => booked2.has(x)));
        const union = new Set([...booked1, ...booked2]);
        
        if (union.size === 0) return 0;
        
        return intersection.size / union.size; // Jaccard similarity
    }
}

// Make available globally
window.ClinicRecommendationEngine = ClinicRecommendationEngine;

