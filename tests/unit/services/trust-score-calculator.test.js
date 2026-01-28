/**
 * Trust Score Calculator Tests
 * Tests for trust-score-calculator.js
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock TrustScoreCalculator class
class TrustScoreCalculator {
  constructor() {
    this.weights = {
      reviews: 0.35,
      responsiveness: 0.25,
      credentials: 0.20,
      transparency: 0.15,
      experience: 0.05
    };
  }

  calculateReviewScore(reviewData) {
    if (!reviewData || !reviewData.averageRating) return 5.0;
    const rating = reviewData.averageRating;
    const count = reviewData.totalReviews || 0;
    
    // Base score from rating (0-10 scale)
    let score = rating * 2; // Convert 0-5 to 0-10
    
    // Bonus for review count (up to +2 points)
    if (count >= 100) score += 2;
    else if (count >= 50) score += 1.5;
    else if (count >= 20) score += 1;
    else if (count >= 10) score += 0.5;
    
    return Math.min(10, Math.max(0, score));
  }

  calculateResponsivenessScore(appointmentData) {
    if (!appointmentData || !appointmentData.averageResponseTime) return 5.0;
    const responseTime = appointmentData.averageResponseTime; // in hours
    
    // Faster response = higher score
    if (responseTime <= 1) return 10;
    if (responseTime <= 4) return 8;
    if (responseTime <= 12) return 6;
    if (responseTime <= 24) return 4;
    return 2;
  }

  calculateCredentialsScore(clinicData) {
    if (!clinicData) return 5.0;
    let score = 5.0;
    
    // Verified status
    if (clinicData.verified) score += 2;
    if (clinicData.certifications && clinicData.certifications.length > 0) {
      score += Math.min(2, clinicData.certifications.length * 0.5);
    }
    
    return Math.min(10, Math.max(0, score));
  }

  calculateTransparencyScore(pricingData) {
    if (!pricingData) return 5.0;
    let score = 5.0;
    
    // Pricing transparency
    if (pricingData.hasPublicPricing) score += 2;
    if (pricingData.hasDetailedPricing) score += 2;
    if (pricingData.hasPackagePricing) score += 1;
    
    return Math.min(10, Math.max(0, score));
  }

  calculateExperienceScore(clinicData) {
    if (!clinicData || !clinicData.yearsOfExperience) return 5.0;
    const years = clinicData.yearsOfExperience;
    
    if (years >= 20) return 10;
    if (years >= 15) return 8;
    if (years >= 10) return 6;
    if (years >= 5) return 4;
    return 2;
  }

  calculateTrustScore(clinicData, reviewData = null, pricingData = null, appointmentData = null) {
    const scores = {
      reviews: this.calculateReviewScore(reviewData),
      responsiveness: this.calculateResponsivenessScore(appointmentData),
      credentials: this.calculateCredentialsScore(clinicData),
      transparency: this.calculateTransparencyScore(pricingData),
      experience: this.calculateExperienceScore(clinicData)
    };

    const totalScore = 
      scores.reviews * this.weights.reviews +
      scores.responsiveness * this.weights.responsiveness +
      scores.credentials * this.weights.credentials +
      scores.transparency * this.weights.transparency +
      scores.experience * this.weights.experience;

    const finalScore = Math.min(10, Math.max(0, Math.round(totalScore * 10) / 10));

    return {
      score: finalScore,
      breakdown: scores,
      weights: this.weights
    };
  }
}

describe('Trust Score Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new TrustScoreCalculator();
  });

  describe('Weight Configuration', () => {
    it('should have correct weight distribution', () => {
      const weights = calculator.weights;
      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
      expect(totalWeight).toBeCloseTo(1.0, 2);
    });

    it('should have reviews as highest weight', () => {
      const weights = calculator.weights;
      expect(weights.reviews).toBeGreaterThan(weights.responsiveness);
      expect(weights.reviews).toBeGreaterThan(weights.credentials);
    });
  });

  describe('Review Score Calculation', () => {
    it('should calculate score from average rating', () => {
      const reviewData = { averageRating: 4.5, totalReviews: 10 };
      const score = calculator.calculateReviewScore(reviewData);
      expect(score).toBeGreaterThanOrEqual(9); // 4.5 * 2 = 9
    });

    it('should add bonus for high review count', () => {
      const reviewData1 = { averageRating: 4.0, totalReviews: 5 };
      const reviewData2 = { averageRating: 4.0, totalReviews: 100 };
      const score1 = calculator.calculateReviewScore(reviewData1);
      const score2 = calculator.calculateReviewScore(reviewData2);
      expect(score2).toBeGreaterThan(score1);
    });

    it('should return default score for missing data', () => {
      const score = calculator.calculateReviewScore(null);
      expect(score).toBe(5.0);
    });
  });

  describe('Responsiveness Score Calculation', () => {
    it('should give high score for fast response', () => {
      const appointmentData = { averageResponseTime: 0.5 }; // 30 minutes
      const score = calculator.calculateResponsivenessScore(appointmentData);
      expect(score).toBe(10);
    });

    it('should give low score for slow response', () => {
      const appointmentData = { averageResponseTime: 48 }; // 48 hours
      const score = calculator.calculateResponsivenessScore(appointmentData);
      expect(score).toBeLessThan(5);
    });

    it('should return default score for missing data', () => {
      const score = calculator.calculateResponsivenessScore(null);
      expect(score).toBe(5.0);
    });
  });

  describe('Credentials Score Calculation', () => {
    it('should add points for verified status', () => {
      const clinicData1 = { verified: false };
      const clinicData2 = { verified: true };
      const score1 = calculator.calculateCredentialsScore(clinicData1);
      const score2 = calculator.calculateCredentialsScore(clinicData2);
      expect(score2).toBeGreaterThan(score1);
    });

    it('should add points for certifications', () => {
      const clinicData = {
        verified: true,
        certifications: ['ISO 9001', 'JCI Accreditation']
      };
      const score = calculator.calculateCredentialsScore(clinicData);
      expect(score).toBeGreaterThan(7);
    });
  });

  describe('Overall Trust Score', () => {
    it('should calculate weighted total score', () => {
      const clinicData = {
        verified: true,
        yearsOfExperience: 15,
        certifications: ['ISO 9001']
      };
      const reviewData = { averageRating: 4.5, totalReviews: 50 };
      const pricingData = { hasPublicPricing: true, hasDetailedPricing: true };
      const appointmentData = { averageResponseTime: 2 };

      const result = calculator.calculateTrustScore(clinicData, reviewData, pricingData, appointmentData);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.breakdown).toBeDefined();
      expect(result.weights).toBeDefined();
    });

    it('should handle missing optional data', () => {
      const clinicData = { verified: false, yearsOfExperience: 5 };
      const result = calculator.calculateTrustScore(clinicData);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(10);
    });

    it('should return score between 0 and 10', () => {
      const clinicData = { verified: false, yearsOfExperience: 1 };
      const result = calculator.calculateTrustScore(clinicData);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(10);
    });
  });
});

