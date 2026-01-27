/**
 * Invoice Generator
 * Generates invoices for CareLuva fees charged to clinics
 */

class InvoiceGenerator {
    constructor() {
        this.invoiceCounter = 0;
        this.bankAccountDetails = {
            bankName: 'Garanti BBVA', // Configure your bank
            accountName: 'CareLuva Ltd. Şti.',
            accountNumber: 'TR...', // Configure your IBAN
            IBAN: 'TR...', // Configure your IBAN
            branchName: '...',
            branchCode: '...'
        };
    }

    /**
     * Generate invoice number
     */
    generateInvoiceNumber() {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const counter = String(++this.invoiceCounter).padStart(4, '0');
        return `INV-${year}${month}-${counter}`;
    }

    /**
     * Create invoice for completed treatments
     * @param {string} clinicId - Clinic ID
     * @param {Array} treatments - Array of completed treatments
     * @param {number} feePerTreatment - Fee per treatment
     * @returns {Object} Invoice data
     */
    async createInvoice(clinicId, treatments, feePerTreatment = 50.00) {
        try {
            if (!window.firebase || !window.firebase.db) {
                throw new Error('Firebase not initialized');
            }

            const { collection, addDoc, doc, getDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;

            // Load clinic data
            const clinicRef = doc(db, 'providerRegistrations', clinicId);
            const clinicSnap = await getDoc(clinicRef);
            
            if (!clinicSnap.exists()) {
                throw new Error('Clinic not found');
            }

            const clinicData = clinicSnap.data();

            // Calculate total amount
            const totalAmount = treatments.length * feePerTreatment;

            // Generate invoice number
            const invoiceNumber = this.generateInvoiceNumber();

            // Calculate due date (30 days from today)
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);

            // Create invoice data
            const invoiceData = {
                invoiceNumber: invoiceNumber,
                clinicId: clinicId,
                clinicName: clinicData.clinicName || clinicData.name || 'Unknown Clinic',
                clinicEmail: clinicData.email,
                treatments: treatments.map(treatment => ({
                    appointmentId: treatment.appointmentId,
                    patientName: treatment.patientName,
                    patientEmail: treatment.patientEmail,
                    treatmentDate: treatment.treatmentDate,
                    treatmentType: treatment.treatmentType || 'General Treatment',
                    careluvaFee: feePerTreatment
                })),
                totalAmount: totalAmount,
                currency: 'TRY',
                status: 'pending',
                paymentMethod: null, // Will be set when payment is made
                
                // Bank account details for manual payment
                bankAccountDetails: {
                    bankName: this.bankAccountDetails.bankName,
                    accountName: this.bankAccountDetails.accountName,
                    IBAN: this.bankAccountDetails.IBAN,
                    accountNumber: this.bankAccountDetails.accountNumber,
                    branchName: this.bankAccountDetails.branchName,
                    branchCode: this.bankAccountDetails.branchCode
                },
                
                // Payment instructions (Turkish)
                paymentInstructions: `
Lütfen ödemeyi aşağıdaki banka hesabına yapınız:
Banka: ${this.bankAccountDetails.bankName}
Hesap Adı: ${this.bankAccountDetails.accountName}
IBAN: ${this.bankAccountDetails.IBAN}
Açıklama: ${invoiceNumber}

Ödeme yaptıktan sonra dekontu yükleyiniz.
                `.trim(),
                
                // Payment tracking
                transferReference: null,
                transferDate: null,
                transferAmount: null,
                paymentReceiptUrl: null,
                paymentVerified: false,
                paymentVerifiedBy: null,
                paymentVerifiedAt: null,
                
                // iyzico payment fields
                iyzicoPaymentId: null,
                iyzicoTransactionId: null,
                iyzicoPaymentMethodId: null,
                
                // Dates
                dueDate: dueDate.toISOString().split('T')[0],
                remindersSent: [],
                overdueRemindersSent: [],
                lateFee: 0.00,
                lateFeeApplied: false,
                
                createdAt: serverTimestamp(),
                sentAt: serverTimestamp(),
                paidAt: null
            };

            // Save to Firestore
            const invoiceRef = await addDoc(collection(db, 'invoices'), invoiceData);
            console.log('✅ Invoice created:', invoiceRef.id);

            // Send invoice email notification (if email service is available)
            await this.sendInvoiceEmail(clinicData.email, invoiceData);

            return {
                invoiceId: invoiceRef.id,
                invoiceData: invoiceData
            };

        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    }

    /**
     * Send invoice email (placeholder - requires email service)
     */
    async sendInvoiceEmail(clinicEmail, invoiceData) {
        // TODO: Integrate with email service
        console.log('Invoice email would be sent to:', clinicEmail);
        console.log('Invoice number:', invoiceData.invoiceNumber);
    }

    /**
     * Generate invoice PDF (placeholder)
     */
    async generateInvoicePDF(invoiceData) {
        // TODO: Implement PDF generation
        // Can use libraries like jsPDF or pdfkit
        console.log('PDF generation for invoice:', invoiceData.invoiceNumber);
        return null;
    }

    /**
     * Get invoice by ID
     */
    async getInvoice(invoiceId) {
        try {
            if (!window.firebase || !window.firebase.db) {
                throw new Error('Firebase not initialized');
            }

            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;

            const invoiceRef = doc(db, 'invoices', invoiceId);
            const invoiceSnap = await getDoc(invoiceRef);

            if (!invoiceSnap.exists()) {
                return null;
            }

            return {
                id: invoiceSnap.id,
                ...invoiceSnap.data()
            };
        } catch (error) {
            console.error('Error getting invoice:', error);
            throw error;
        }
    }

    /**
     * Get all invoices for a clinic
     */
    async getClinicInvoices(clinicId) {
        try {
            if (!window.firebase || !window.firebase.db) {
                throw new Error('Firebase not initialized');
            }

            const { collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;

            const invoicesRef = collection(db, 'invoices');
            const invoicesQuery = query(
                invoicesRef,
                where('clinicId', '==', clinicId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(invoicesQuery);
            const invoices = [];

            snapshot.forEach(doc => {
                invoices.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return invoices;
        } catch (error) {
            console.error('Error getting clinic invoices:', error);
            throw error;
        }
    }

    /**
     * Update invoice status
     */
    async updateInvoiceStatus(invoiceId, status, additionalData = {}) {
        try {
            if (!window.firebase || !window.firebase.db) {
                throw new Error('Firebase not initialized');
            }

            const { doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;

            const invoiceRef = doc(db, 'invoices', invoiceId);
            const updateData = {
                status: status,
                updatedAt: serverTimestamp(),
                ...additionalData
            };

            if (status === 'paid') {
                updateData.paidAt = serverTimestamp();
            }

            await updateDoc(invoiceRef, updateData);
            console.log('✅ Invoice status updated:', invoiceId, status);

            return true;
        } catch (error) {
            console.error('Error updating invoice status:', error);
            throw error;
        }
    }

    /**
     * Calculate late fee
     */
    calculateLateFee(invoiceData) {
        if (invoiceData.status !== 'overdue') {
            return 0;
        }

        const dueDate = new Date(invoiceData.dueDate);
        const today = new Date();
        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

        if (daysOverdue <= 0) {
            return 0;
        }

        // Late fee: 2% per month (approximately 0.067% per day)
        const dailyRate = 0.00067;
        const lateFee = invoiceData.totalAmount * dailyRate * daysOverdue;

        // Cap at 20% of invoice amount
        const maxLateFee = invoiceData.totalAmount * 0.20;
        return Math.min(lateFee, maxLateFee);
    }

    /**
     * Apply late fee to invoice
     */
    async applyLateFee(invoiceId) {
        try {
            const invoice = await this.getInvoice(invoiceId);
            if (!invoice) {
                throw new Error('Invoice not found');
            }

            const lateFee = this.calculateLateFee(invoice);
            
            if (lateFee > 0 && !invoice.lateFeeApplied) {
                await this.updateInvoiceStatus(invoiceId, 'overdue', {
                    lateFee: lateFee,
                    lateFeeApplied: true
                });

                return lateFee;
            }

            return invoice.lateFee || 0;
        } catch (error) {
            console.error('Error applying late fee:', error);
            throw error;
        }
    }
}

// Make available globally
window.InvoiceGenerator = InvoiceGenerator;


