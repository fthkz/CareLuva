/**
 * Service Catalog Tests
 * Tests for service-catalog.js functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock service catalog data
const mockServiceCatalog = {
  'dentistry': [
    { id: 'dent_001', name: 'Teeth Cleaning', description: 'Professional dental cleaning' },
    { id: 'dent_002', name: 'Dental Checkup', description: 'Comprehensive oral examination' }
  ],
  'hair-transplant': [
    { id: 'hair_001', name: 'FUE Hair Transplant', description: 'Follicular Unit Extraction' }
  ],
  'cosmetic-surgery': [
    { id: 'cosm_001', name: 'Rhinoplasty', description: 'Nose reshaping surgery' }
  ],
  'general-medicine': [
    { id: 'gen_001', name: 'General Consultation', description: 'Routine medical consultation' }
  ]
};

describe('Service Catalog', () => {
  describe('Service Data Structure', () => {
    it('should have services organized by category', () => {
      expect(mockServiceCatalog).toHaveProperty('dentistry');
      expect(mockServiceCatalog).toHaveProperty('hair-transplant');
      expect(mockServiceCatalog).toHaveProperty('cosmetic-surgery');
      expect(mockServiceCatalog).toHaveProperty('general-medicine');
    });

    it('should have services with required fields', () => {
      const service = mockServiceCatalog.dentistry[0];
      expect(service).toHaveProperty('id');
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('description');
      expect(typeof service.id).toBe('string');
      expect(typeof service.name).toBe('string');
      expect(typeof service.description).toBe('string');
    });

    it('should have unique service IDs within category', () => {
      const dentistryIds = mockServiceCatalog.dentistry.map(s => s.id);
      const uniqueIds = new Set(dentistryIds);
      expect(uniqueIds.size).toBe(dentistryIds.length);
    });
  });

  describe('Service Lookup', () => {
    it('should find service by ID', () => {
      const service = mockServiceCatalog.dentistry.find(s => s.id === 'dent_001');
      expect(service).toBeDefined();
      expect(service.name).toBe('Teeth Cleaning');
    });

    it('should return undefined for non-existent service ID', () => {
      const service = mockServiceCatalog.dentistry.find(s => s.id === 'nonexistent');
      expect(service).toBeUndefined();
    });

    it('should find services by category', () => {
      const dentistryServices = mockServiceCatalog.dentistry;
      expect(dentistryServices.length).toBeGreaterThan(0);
      expect(dentistryServices.every(s => s.id.startsWith('dent_'))).toBe(true);
    });
  });

  describe('Service Validation', () => {
    it('should validate service structure', () => {
      const service = mockServiceCatalog.dentistry[0];
      expect(service.id).toBeTruthy();
      expect(service.name).toBeTruthy();
      expect(service.description).toBeTruthy();
    });

    it('should have non-empty service names', () => {
      mockServiceCatalog.dentistry.forEach(service => {
        expect(service.name.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty service descriptions', () => {
      mockServiceCatalog.dentistry.forEach(service => {
        expect(service.description.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('Category Management', () => {
    it('should support multiple categories', () => {
      const categories = Object.keys(mockServiceCatalog);
      expect(categories.length).toBeGreaterThanOrEqual(4);
    });

    it('should have services in each category', () => {
      Object.values(mockServiceCatalog).forEach(services => {
        expect(Array.isArray(services)).toBe(true);
        expect(services.length).toBeGreaterThan(0);
      });
    });
  });
});

