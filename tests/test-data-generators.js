/**
 * Test Data Generators
 * Generate test data for various CareLuva entities
 */

class TestDataGenerator {
    /**
     * Generate a random string
     * @param {number} length - Length of string
     * @returns {string}
     */
    static randomString(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    /**
     * Generate a random email
     * @returns {string}
     */
    static randomEmail() {
        return `test.${this.randomString(8)}@careluva.test`;
    }
    
    /**
     * Generate a random phone number
     * @returns {string}
     */
    static randomPhone() {
        return `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    }
    
    /**
     * Generate a random date in the past
     * @param {number} daysAgo - Days ago
     * @returns {string}
     */
    static randomPastDate(daysAgo = 365) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
        return date.toISOString();
    }
    
    /**
     * Generate a random date in the future
     * @param {number} daysAhead - Days ahead
     * @returns {string}
     */
    static randomFutureDate(daysAhead = 365) {
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
        return date.toISOString();
    }
    
    /**
     * Generate provider registration data
     * @param {Object} overrides - Override default values
     * @returns {Object}
     */
    static generateProviderRegistration(overrides = {}) {
        const baseData = {
            clinicName: `Test Clinic ${this.randomString(6)}`,
            email: this.randomEmail(),
            phone: this.randomPhone(),
            providerType: this.randomChoice(['Doctor', 'Dentist', 'Surgeon', 'Therapist']),
            address: {
                street: `${Math.floor(Math.random() * 9999)} Test Street`,
                city: this.randomChoice(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']),
                state: this.randomChoice(['NY', 'CA', 'IL', 'TX', 'AZ']),
                zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
                country: 'USA'
            },
            languages: this.randomChoices(['English', 'Spanish', 'French', 'German', 'Italian'], 1, 3),
            specialties: this.randomChoices(['General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics'], 1, 2),
            certifications: [
                {
                    name: `Certification ${this.randomString(5)}`,
                    issuingOrganization: 'Test Medical Board',
                    issueDate: this.randomPastDate(730),
                    certificateNumber: `CERT-${this.randomString(8)}`
                }
            ],
            malpracticeInsurance: {
                provider: `Insurance Co ${this.randomString(4)}`,
                policyNumber: `POL-${this.randomString(10)}`,
                coverageAmount: Math.floor(Math.random() * 5000000) + 1000000,
                startDate: this.randomPastDate(365),
                endDate: this.randomFutureDate(365)
            },
            experienceYears: Math.floor(Math.random() * 20) + 3, // 3-23 years
            status: this.randomChoice(['pending', 'approved', 'rejected']),
            submittedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        return { ...baseData, ...overrides };
    }
    
    /**
     * Generate patient registration data
     * @param {Object} overrides - Override default values
     * @returns {Object}
     */
    static generatePatientRegistration(overrides = {}) {
        const firstName = this.randomChoice(['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily']);
        const lastName = this.randomChoice(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia']);
        const email = overrides.email || this.randomEmail();
        
        const baseData = {
            // Required fields for Firestore rules
            email: email,
            name: `${firstName} ${lastName}`, // Required by Firestore rules
            password: `TestPassword${this.randomString(8)}!`, // Required by Firestore rules (will be hashed in real app)
            // Additional fields
            firstName: firstName,
            lastName: lastName,
            phone: this.randomPhone(),
            dateOfBirth: this.randomPastDate(365 * 50), // Up to 50 years ago
            gender: this.randomChoice(['Male', 'Female', 'Other', 'Prefer not to say']),
            address: {
                street: `${Math.floor(Math.random() * 9999)} Patient Street`,
                city: this.randomChoice(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']),
                state: this.randomChoice(['NY', 'CA', 'IL', 'TX', 'AZ']),
                zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
                country: 'USA'
            },
            createdAt: new Date().toISOString()
        };
        
        return { ...baseData, ...overrides };
    }
    
    /**
     * Generate appointment data
     * @param {Object} overrides - Override default values
     * @returns {Object}
     */
    static generateAppointment(overrides = {}) {
        const baseData = {
            providerId: overrides.providerId || `provider-${this.randomString(10)}`,
            patientId: overrides.patientId || `patient-${this.randomString(10)}`,
            clinicId: overrides.clinicId || `clinic-${this.randomString(10)}`,
            patientEmail: overrides.patientEmail || this.randomEmail(),
            service: this.randomChoice(['General Consultation', 'Teeth Cleaning', 'Checkup', 'Follow-up']),
            date: this.randomFutureDate(30), // Within next 30 days
            time: this.randomChoice(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']),
            status: this.randomChoice(['scheduled', 'completed', 'cancelled', 'no-show']),
            notes: `Test appointment notes ${this.randomString(20)}`,
            createdAt: new Date().toISOString()
        };
        
        return { ...baseData, ...overrides };
    }
    
    /**
     * Generate review data
     * @param {Object} overrides - Override default values
     * @param {Array} availableClinicIds - Optional array of real clinic IDs to choose from
     * @returns {Object}
     */
    static generateReview(overrides = {}, availableClinicIds = null) {
        // Use provided clinicId, or pick from available clinic IDs, or generate random
        let clinicId;
        if (overrides.clinicId) {
            clinicId = overrides.clinicId;
        } else if (availableClinicIds && availableClinicIds.length > 0) {
            clinicId = this.randomChoice(availableClinicIds);
        } else {
            // WARNING: Random clinic IDs will likely not exist in the database
            clinicId = `clinic-${this.randomString(10)}`;
            console.warn('⚠️ Generated random clinicId that may not exist:', clinicId);
        }
        
        const baseData = {
            // Required fields for Firestore rules
            reviewerName: overrides.reviewerName || `Patient ${this.randomString(5)}`, // Required: reviewerName (not patientName)
            reviewText: overrides.reviewText || `Test review comment ${this.randomString(30)}`, // Required: reviewText (not comment)
            clinicId: clinicId, // Required: clinicId
            // Additional fields
            providerId: overrides.providerId || `provider-${this.randomString(10)}`,
            patientId: overrides.patientId || `patient-${this.randomString(10)}`,
            rating: Math.floor(Math.random() * 5) + 1, // 1-5
            status: this.randomChoice(['pending', 'approved', 'rejected']),
            createdAt: this.randomPastDate(90), // Within last 90 days
            updatedAt: new Date().toISOString()
        };
        
        return { ...baseData, ...overrides };
    }
    
    /**
     * Generate service pricing data
     * @param {Object} overrides - Override default values
     * @returns {Object}
     */
    static generateServicePricing(overrides = {}) {
        const baseData = {
            clinicId: overrides.clinicId || `clinic-${this.randomString(10)}`,
            services: {
                [`service-${this.randomString(8)}`]: {
                    category: this.randomChoice(['dentistry', 'hair-transplant', 'cosmetic-surgery', 'general-medicine']),
                    price: Math.floor(Math.random() * 5000) + 50,
                    serviceName: `Service ${this.randomString(6)}`
                }
            },
            status: this.randomChoice(['pending', 'approved', 'rejected']),
            submittedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        return { ...baseData, ...overrides };
    }
    
    /**
     * Generate multiple provider registrations
     * @param {number} count - Number of registrations to generate
     * @param {Object} overrides - Override default values for all
     * @returns {Array}
     */
    static generateProviderRegistrations(count, overrides = {}) {
        const registrations = [];
        for (let i = 0; i < count; i++) {
            registrations.push(this.generateProviderRegistration(overrides));
        }
        return registrations;
    }
    
    /**
     * Generate multiple appointments
     * @param {number} count - Number of appointments to generate
     * @param {Object} overrides - Override default values for all
     * @returns {Array}
     */
    static generateAppointments(count, overrides = {}) {
        const appointments = [];
        for (let i = 0; i < count; i++) {
            appointments.push(this.generateAppointment(overrides));
        }
        return appointments;
    }
    
    /**
     * Generate multiple reviews
     * @param {number} count - Number of reviews to generate
     * @param {Object} overrides - Override default values for all
     * @param {Array} availableClinicIds - Optional array of real clinic IDs to choose from
     * @returns {Array}
     */
    static generateReviews(count, overrides = {}, availableClinicIds = null) {
        const reviews = [];
        for (let i = 0; i < count; i++) {
            reviews.push(this.generateReview(overrides, availableClinicIds));
        }
        return reviews;
    }
    
    /**
     * Fetch real clinic IDs from Firestore (async)
     * @param {Object} db - Firestore database instance
     * @param {number} limit - Maximum number of clinic IDs to fetch (default: 50)
     * @returns {Promise<Array>} Array of clinic document IDs
     */
    static async fetchRealClinicIds(db, limit = 50) {
        try {
            const { collection, getDocs, query, limit: limitQuery } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const providersRef = collection(db, 'providerRegistrations');
            const q = query(providersRef, limitQuery(limit));
            const snapshot = await getDocs(q);
            
            const clinicIds = [];
            snapshot.forEach((doc) => {
                clinicIds.push(doc.id);
            });
            
            console.log(`✅ Fetched ${clinicIds.length} real clinic IDs from Firestore`);
            return clinicIds;
        } catch (error) {
            console.error('❌ Error fetching clinic IDs:', error);
            console.warn('⚠️ Will use random clinic IDs (may not exist)');
            return [];
        }
    }
    
    /**
     * Random choice from array
     * @param {Array} array - Array to choose from
     * @returns {*}
     */
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    /**
     * Random choices from array (multiple)
     * @param {Array} array - Array to choose from
     * @param {number} min - Minimum choices
     * @param {number} max - Maximum choices
     * @returns {Array}
     */
    static randomChoices(array, min = 1, max = array.length) {
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.TestDataGenerator = TestDataGenerator;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestDataGenerator;
}

