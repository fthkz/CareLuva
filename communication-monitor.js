/**
 * Communication Monitoring System
 * Tracks and monitors platform communication to prevent offline migration
 */

class CommunicationMonitor {
    constructor() {
        this.violationThresholds = {
            warning: 1,
            suspension: 2,
            permanentBan: 3
        };
    }

    /**
     * Log platform communication
     * @param {string} clinicId - Clinic ID
     * @param {string} patientId - Patient ID
     * @param {string} appointmentId - Appointment ID (optional)
     * @param {string} messageType - Type of communication
     * @param {string} content - Message content
     * @returns {Promise<string>} Communication log ID
     */
    async logCommunication(clinicId, patientId, appointmentId, messageType, content) {
        try {
            if (!window.firebase || !window.firebase.db) {
                throw new Error('Firebase not initialized');
            }

            const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;

            // Check for potential violations
            const violationCheck = await this.checkForViolations(content);

            const communicationData = {
                clinicId: clinicId,
                patientId: patientId,
                appointmentId: appointmentId || null,
                messageType: messageType, // 'message', 'appointment_request', 'review', etc.
                content: content,
                timestamp: serverTimestamp(),
                platform: 'careluva',
                flagged: violationCheck.flagged,
                violationType: violationCheck.violationType,
                violationSeverity: violationCheck.severity
            };

            const docRef = await addDoc(collection(db, 'platformCommunications'), communicationData);

            // If violation detected, handle it
            if (violationCheck.flagged) {
                await this.handleViolation(clinicId, violationCheck);
            }

            return docRef.id;
        } catch (error) {
            console.error('Error logging communication:', error);
            throw error;
        }
    }

    /**
     * Check content for potential violations
     * @param {string} content - Message content to check
     * @returns {Object} Violation check result
     */
    checkForViolations(content) {
        const lowerContent = content.toLowerCase();
        
        // Patterns that indicate offline migration attempts
        const violationPatterns = [
            {
                pattern: /(?:whatsapp|telegram|signal|viber|phone|call me|text me|email me|contact me directly)/i,
                type: 'contact_sharing',
                severity: 'high'
            },
            {
                pattern: /(?:my number|my phone|my email|reach me at|call|text|message)/i,
                type: 'contact_request',
                severity: 'medium'
            },
            {
                pattern: /(?:outside|offline|directly|privately|without platform)/i,
                type: 'offline_suggestion',
                severity: 'medium'
            },
            {
                pattern: /(?:avoid.*fee|skip.*platform|bypass.*careluva)/i,
                type: 'fee_avoidance',
                severity: 'high'
            }
        ];

        for (const violation of violationPatterns) {
            if (violation.pattern.test(lowerContent)) {
                return {
                    flagged: true,
                    violationType: violation.type,
                    severity: violation.severity
                };
            }
        }

        return {
            flagged: false,
            violationType: null,
            severity: null
        };
    }

    /**
     * Handle violation
     * @param {string} clinicId - Clinic ID
     * @param {Object} violationCheck - Violation check result
     */
    async handleViolation(clinicId, violationCheck) {
        try {
            if (!window.firebase || !window.firebase.db) {
                return;
            }

            const { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;

            // Get existing violations for this clinic
            const violationsRef = collection(db, 'communicationViolations');
            const violationsQuery = query(
                violationsRef,
                where('clinicId', '==', clinicId),
                where('resolved', '==', false)
            );
            const violationsSnap = await getDocs(violationsQuery);
            
            const violationCount = violationsSnap.size;
            let severity = 'warning';
            let penaltyAmount = 0;

            // Determine severity based on violation count
            if (violationCount >= this.violationThresholds.permanentBan) {
                severity = 'permanent_ban';
                penaltyAmount = 500.00; // High penalty
            } else if (violationCount >= this.violationThresholds.suspension) {
                severity = 'suspension';
                penaltyAmount = 200.00; // Medium penalty
            } else if (violationCount >= this.violationThresholds.warning) {
                severity = 'warning';
                penaltyAmount = 0; // Warning only
            }

            // Record violation
            await addDoc(collection(db, 'communicationViolations'), {
                clinicId: clinicId,
                violationType: violationCheck.violationType,
                severity: severity,
                description: `Attempted ${violationCheck.violationType}: ${violationCheck.severity} severity`,
                timestamp: serverTimestamp(),
                resolved: false,
                penaltyAmount: penaltyAmount,
                violationCount: violationCount + 1
            });

            // Update clinic status if needed
            if (severity === 'suspension' || severity === 'permanent_ban') {
                const clinicRef = doc(db, 'providerRegistrations', clinicId);
                const clinicSnap = await getDoc(clinicRef);
                
                if (clinicSnap.exists()) {
                    await updateDoc(clinicRef, {
                        status: severity === 'permanent_ban' ? 'suspended' : 'warning',
                        violationCount: violationCount + 1,
                        lastViolation: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                }
            }

            // Send notification to clinic (if email service available)
            await this.sendViolationNotification(clinicId, severity, violationCount + 1);

        } catch (error) {
            console.error('Error handling violation:', error);
        }
    }

    /**
     * Send violation notification
     */
    async sendViolationNotification(clinicId, severity, violationCount) {
        // TODO: Integrate with email service
        console.log('Violation notification would be sent to clinic:', clinicId);
        console.log('Severity:', severity, 'Count:', violationCount);
    }

    /**
     * Get communication history for a clinic
     * @param {string} clinicId - Clinic ID
     * @param {number} limit - Number of records to retrieve
     * @returns {Promise<Array>} Communication history
     */
    async getCommunicationHistory(clinicId, limit = 100) {
        try {
            if (!window.firebase || !window.firebase.db) {
                throw new Error('Firebase not initialized');
            }

            const { collection, query, where, getDocs, orderBy, limit: limitFn } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;

            const communicationsRef = collection(db, 'platformCommunications');
            const communicationsQuery = query(
                communicationsRef,
                where('clinicId', '==', clinicId),
                orderBy('timestamp', 'desc'),
                limitFn(limit)
            );

            const snapshot = await getDocs(communicationsQuery);
            const communications = [];

            snapshot.forEach(doc => {
                communications.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return communications;
        } catch (error) {
            console.error('Error getting communication history:', error);
            throw error;
        }
    }

    /**
     * Get violations for a clinic
     * @param {string} clinicId - Clinic ID
     * @returns {Promise<Array>} Violations list
     */
    async getClinicViolations(clinicId) {
        try {
            if (!window.firebase || !window.firebase.db) {
                throw new Error('Firebase not initialized');
            }

            const { collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;

            const violationsRef = collection(db, 'communicationViolations');
            const violationsQuery = query(
                violationsRef,
                where('clinicId', '==', clinicId),
                orderBy('timestamp', 'desc')
            );

            const snapshot = await getDocs(violationsQuery);
            const violations = [];

            snapshot.forEach(doc => {
                violations.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return violations;
        } catch (error) {
            console.error('Error getting violations:', error);
            throw error;
        }
    }

    /**
     * Resolve violation
     * @param {string} violationId - Violation ID
     * @param {string} resolutionNote - Admin resolution note
     */
    async resolveViolation(violationId, resolutionNote) {
        try {
            if (!window.firebase || !window.firebase.db) {
                throw new Error('Firebase not initialized');
            }

            const { doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const db = window.firebase.db;

            const violationRef = doc(db, 'communicationViolations', violationId);
            await updateDoc(violationRef, {
                resolved: true,
                resolvedAt: serverTimestamp(),
                resolutionNote: resolutionNote,
                resolvedBy: 'admin' // TODO: Get actual admin ID
            });

            return true;
        } catch (error) {
            console.error('Error resolving violation:', error);
            throw error;
        }
    }
}

// Make available globally
window.CommunicationMonitor = CommunicationMonitor;


