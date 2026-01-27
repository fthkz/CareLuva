/**
 * iyzico Payment Gateway Integration
 * Turkish-compliant payment processing for CareLuva
 */

class IyzicoIntegration {
    constructor() {
        // iyzico API credentials (should be stored securely)
        this.apiKey = null; // Set via initialize()
        this.secretKey = null; // Set via initialize()
        this.baseUrl = 'https://api.iyzipay.com'; // Production URL
        // this.baseUrl = 'https://sandbox-api.iyzipay.com'; // Sandbox URL for testing
    }

    /**
     * Initialize iyzico with API credentials
     * @param {string} apiKey - iyzico API key
     * @param {string} secretKey - iyzico secret key
     * @param {boolean} sandbox - Use sandbox environment
     */
    initialize(apiKey, secretKey, sandbox = false) {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.baseUrl = sandbox ? 'https://sandbox-api.iyzipay.com' : 'https://api.iyzipay.com';
    }

    /**
     * Create payment method (save card for future use)
     * @param {Object} cardData - Card information
     * @param {string} customerId - Customer identifier
     * @returns {Promise<Object>} Payment method data
     */
    async createPaymentMethod(cardData, customerId) {
        try {
            // iyzico API call to create payment method
            // This is a simplified version - actual implementation requires iyzico SDK
            const response = await this.makeIyzicoRequest('/payment-method/create', {
                locale: 'tr',
                conversationId: customerId,
                card: {
                    cardHolderName: cardData.cardHolderName,
                    cardNumber: cardData.cardNumber,
                    expireMonth: cardData.expireMonth,
                    expireYear: cardData.expireYear,
                    cvc: cardData.cvc
                }
            });

            return {
                paymentMethodId: response.paymentMethodId,
                binNumber: response.binNumber,
                lastFourDigits: response.lastFourDigits,
                cardType: response.cardType,
                cardAssociation: response.cardAssociation
            };
        } catch (error) {
            console.error('Error creating payment method:', error);
            throw error;
        }
    }

    /**
     * Charge payment method
     * @param {string} paymentMethodId - Saved payment method ID
     * @param {number} amount - Amount to charge
     * @param {string} currency - Currency (TRY)
     * @param {Object} customerData - Customer information
     * @param {string} invoiceId - Invoice ID for reference
     * @returns {Promise<Object>} Payment result
     */
    async chargePaymentMethod(paymentMethodId, amount, currency, customerData, invoiceId) {
        try {
            const response = await this.makeIyzicoRequest('/payment/create', {
                locale: 'tr',
                conversationId: invoiceId,
                price: amount.toFixed(2),
                paidPrice: amount.toFixed(2),
                currency: currency,
                installment: 1,
                paymentCard: {
                    cardToken: paymentMethodId
                },
                buyer: {
                    id: customerData.clinicId,
                    name: customerData.clinicName,
                    surname: customerData.contactPerson || '',
                    email: customerData.email,
                    identityNumber: customerData.taxId || '',
                    city: customerData.city || '',
                    country: customerData.country || 'Turkey',
                    zipCode: customerData.zipCode || '',
                    registrationAddress: customerData.address || ''
                },
                billingAddress: {
                    contactName: customerData.contactPerson || customerData.clinicName,
                    city: customerData.city || '',
                    country: customerData.country || 'Turkey',
                    address: customerData.address || ''
                }
            });

            if (response.status === 'success') {
                return {
                    success: true,
                    paymentId: response.paymentId,
                    transactionId: response.paymentTransactionId,
                    amount: amount,
                    currency: currency,
                    status: 'paid'
                };
            } else {
                throw new Error(response.errorMessage || 'Payment failed');
            }
        } catch (error) {
            console.error('Error charging payment method:', error);
            throw error;
        }
    }

    /**
     * Make iyzico API request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @returns {Promise<Object>} Response data
     */
    async makeIyzicoRequest(endpoint, data) {
        if (!this.apiKey || !this.secretKey) {
            throw new Error('iyzico not initialized. Please call initialize() first.');
        }

        // Create authorization header
        const authString = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64');

        // Make request to iyzico API
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`iyzico API error: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Handle iyzico webhook (payment confirmation)
     * @param {Object} webhookData - Webhook payload from iyzico
     * @returns {Promise<Object>} Processed webhook data
     */
    async handleWebhook(webhookData) {
        try {
            // Verify webhook signature (if iyzico provides signature verification)
            // Process webhook data
            const paymentId = webhookData.paymentId;
            const status = webhookData.status;
            const amount = webhookData.amount;

            return {
                paymentId: paymentId,
                status: status,
                amount: amount,
                processed: true
            };
        } catch (error) {
            console.error('Error handling webhook:', error);
            throw error;
        }
    }

    /**
     * Refund payment
     * @param {string} paymentId - Original payment ID
     * @param {number} amount - Refund amount (optional, full refund if not specified)
     * @returns {Promise<Object>} Refund result
     */
    async refundPayment(paymentId, amount = null) {
        try {
            const refundData = {
                locale: 'tr',
                conversationId: paymentId,
                paymentId: paymentId
            };

            if (amount) {
                refundData.price = amount.toFixed(2);
            }

            const response = await this.makeIyzicoRequest('/payment/cancel', refundData);

            if (response.status === 'success') {
                return {
                    success: true,
                    refundId: response.paymentId,
                    amount: amount || response.price
                };
            } else {
                throw new Error(response.errorMessage || 'Refund failed');
            }
        } catch (error) {
            console.error('Error refunding payment:', error);
            throw error;
        }
    }
}

// Make available globally
window.IyzicoIntegration = IyzicoIntegration;


