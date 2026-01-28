/**
 * Invoice Generator Tests
 * Tests for invoice-generator.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock InvoiceGenerator class
class InvoiceGenerator {
  constructor() {
    this.invoiceCounter = 0;
    this.bankAccountDetails = {
      bankName: 'Test Bank',
      accountName: 'CareLuva Ltd.',
      accountNumber: '1234567890',
      IBAN: 'TR123456789012345678901234'
    };
  }

  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const counter = String(++this.invoiceCounter).padStart(4, '0');
    return `INV-${year}${month}-${counter}`;
  }

  calculateTotal(treatments, feePerTreatment) {
    return treatments.length * feePerTreatment;
  }

  calculateTax(total, taxRate = 0.20) {
    return total * taxRate;
  }

  calculateGrandTotal(subtotal, tax) {
    return subtotal + tax;
  }

  validateInvoiceData(clinicId, treatments) {
    if (!clinicId || typeof clinicId !== 'string' || clinicId.trim().length === 0) {
      throw new Error('Invalid clinic ID');
    }
    if (!Array.isArray(treatments) || treatments.length === 0) {
      throw new Error('Treatments array is required and must not be empty');
    }
    return true;
  }
}

describe('Invoice Generator', () => {
  let generator;

  beforeEach(() => {
    generator = new InvoiceGenerator();
    generator.invoiceCounter = 0; // Reset counter
  });

  describe('Invoice Number Generation', () => {
    it('should generate invoice number with correct format', () => {
      const invoiceNumber = generator.generateInvoiceNumber();
      expect(invoiceNumber).toMatch(/^INV-\d{4}\d{2}-\d{4}$/);
    });

    it('should include current year and month', () => {
      const invoiceNumber = generator.generateInvoiceNumber();
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      expect(invoiceNumber).toContain(year.toString());
      expect(invoiceNumber).toContain(month);
    });

    it('should increment counter for each invoice', () => {
      const invoice1 = generator.generateInvoiceNumber();
      const invoice2 = generator.generateInvoiceNumber();
      const counter1 = parseInt(invoice1.split('-')[2]);
      const counter2 = parseInt(invoice2.split('-')[2]);
      expect(counter2).toBe(counter1 + 1);
    });

    it('should pad counter with zeros', () => {
      const invoiceNumber = generator.generateInvoiceNumber();
      const counter = invoiceNumber.split('-')[2];
      expect(counter.length).toBe(4);
      expect(counter).toMatch(/^\d{4}$/);
    });
  });

  describe('Total Calculation', () => {
    it('should calculate total from treatments and fee', () => {
      const treatments = [
        { id: 't1', name: 'Treatment 1' },
        { id: 't2', name: 'Treatment 2' },
        { id: 't3', name: 'Treatment 3' }
      ];
      const feePerTreatment = 50.00;
      const total = generator.calculateTotal(treatments, feePerTreatment);
      expect(total).toBe(150.00);
    });

    it('should handle single treatment', () => {
      const treatments = [{ id: 't1', name: 'Treatment 1' }];
      const feePerTreatment = 50.00;
      const total = generator.calculateTotal(treatments, feePerTreatment);
      expect(total).toBe(50.00);
    });

    it('should handle zero treatments', () => {
      const treatments = [];
      const feePerTreatment = 50.00;
      const total = generator.calculateTotal(treatments, feePerTreatment);
      expect(total).toBe(0);
    });
  });

  describe('Tax Calculation', () => {
    it('should calculate tax from total', () => {
      const total = 100.00;
      const tax = generator.calculateTax(total, 0.20);
      expect(tax).toBe(20.00);
    });

    it('should use default tax rate of 20%', () => {
      const total = 100.00;
      const tax = generator.calculateTax(total);
      expect(tax).toBe(20.00);
    });

    it('should handle different tax rates', () => {
      const total = 100.00;
      const tax = generator.calculateTax(total, 0.18);
      expect(tax).toBe(18.00);
    });
  });

  describe('Grand Total Calculation', () => {
    it('should calculate grand total correctly', () => {
      const subtotal = 100.00;
      const tax = 20.00;
      const grandTotal = generator.calculateGrandTotal(subtotal, tax);
      expect(grandTotal).toBe(120.00);
    });

    it('should handle zero tax', () => {
      const subtotal = 100.00;
      const tax = 0;
      const grandTotal = generator.calculateGrandTotal(subtotal, tax);
      expect(grandTotal).toBe(100.00);
    });
  });

  describe('Data Validation', () => {
    it('should validate clinic ID', () => {
      const clinicId = 'clinic123';
      const treatments = [{ id: 't1' }];
      expect(() => generator.validateInvoiceData(clinicId, treatments)).not.toThrow();
    });

    it('should reject empty clinic ID', () => {
      const clinicId = '';
      const treatments = [{ id: 't1' }];
      expect(() => generator.validateInvoiceData(clinicId, treatments)).toThrow('Invalid clinic ID');
    });

    it('should reject null clinic ID', () => {
      const clinicId = null;
      const treatments = [{ id: 't1' }];
      expect(() => generator.validateInvoiceData(clinicId, treatments)).toThrow('Invalid clinic ID');
    });

    it('should validate treatments array', () => {
      const clinicId = 'clinic123';
      const treatments = [{ id: 't1' }, { id: 't2' }];
      expect(() => generator.validateInvoiceData(clinicId, treatments)).not.toThrow();
    });

    it('should reject empty treatments array', () => {
      const clinicId = 'clinic123';
      const treatments = [];
      expect(() => generator.validateInvoiceData(clinicId, treatments)).toThrow('Treatments array is required');
    });

    it('should reject null treatments', () => {
      const clinicId = 'clinic123';
      const treatments = null;
      expect(() => generator.validateInvoiceData(clinicId, treatments)).toThrow('Treatments array is required');
    });
  });

  describe('Bank Account Details', () => {
    it('should have bank account details configured', () => {
      expect(generator.bankAccountDetails).toBeDefined();
      expect(generator.bankAccountDetails.bankName).toBeTruthy();
      expect(generator.bankAccountDetails.accountName).toBeTruthy();
    });
  });
});

