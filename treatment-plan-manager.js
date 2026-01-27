/**
 * Treatment Plan Manager
 * Handles multi-appointment treatment series
 */

class TreatmentPlanManager {
    constructor() {
        this.db = null;
    }

    /**
     * Initialize with Firestore instance
     */
    initialize(db) {
        this.db = db;
    }

    /**
     * Create a new treatment plan
     * @param {Object} planData - Treatment plan data
     * @returns {Promise<string>} Treatment plan ID
     */
    async createTreatmentPlan(planData) {
        try {
            if (!this.db) {
                throw new Error('Firestore not initialized');
            }

            const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');

            const plan = {
                clinicId: planData.clinicId,
                clinicName: planData.clinicName,
                patientId: planData.patientId,
                patientEmail: planData.patientEmail,
                patientName: planData.patientName,
                planName: planData.planName,
                description: planData.description || '',
                totalAppointments: planData.appointments.length,
                appointments: planData.appointments.map((apt, index) => ({
                    appointmentId: null, // Will be set when appointment is created
                    sequenceNumber: index + 1,
                    scheduledDate: apt.date,
                    scheduledTime: apt.time,
                    service: apt.service,
                    professionalId: apt.professionalId,
                    professionalName: apt.professionalName,
                    status: 'pending',
                    completedAt: null
                })),
                status: 'active',
                progress: 0,
                careluvaFee: planData.careluvaFee || 50.00, // Single fee for entire plan
                currency: 'TRY',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                completedAt: null,
                cancelledAt: null,
                cancellationReason: null
            };

            const plansRef = collection(this.db, 'treatmentPlans');
            const docRef = await addDoc(plansRef, plan);

            // Create appointments for the plan
            await this.createPlanAppointments(docRef.id, plan.appointments);

            return docRef.id;
        } catch (error) {
            console.error('Error creating treatment plan:', error);
            throw error;
        }
    }

    /**
     * Create appointments for a treatment plan
     */
    async createPlanAppointments(planId, appointments) {
        try {
            const { collection, addDoc, doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');

            const appointmentsRef = collection(this.db, 'appointments');
            const planRef = doc(this.db, 'treatmentPlans', planId);

            for (const apt of appointments) {
                const appointmentData = {
                    clinicId: apt.clinicId,
                    clinicName: apt.clinicName,
                    patientId: apt.patientId,
                    patientEmail: apt.patientEmail,
                    patientName: apt.patientName,
                    professionalId: apt.professionalId,
                    professionalName: apt.professionalName,
                    date: apt.scheduledDate,
                    time: apt.scheduledTime,
                    service: apt.service,
                    reason: `Part of treatment plan: ${apt.planName || 'Treatment Series'}`,
                    status: 'pending',
                    treatmentPlanId: planId,
                    sequenceNumber: apt.sequenceNumber,
                    isPartOfPlan: true,
                    createdAt: serverTimestamp(),
                    requestedAt: serverTimestamp()
                };

                const appointmentRef = await addDoc(appointmentsRef, appointmentData);

                // Update plan with appointment ID
                const planSnap = await planRef.get();
                const planData = planSnap.data();
                const updatedAppointments = planData.appointments.map(a => 
                    a.sequenceNumber === apt.sequenceNumber 
                        ? { ...a, appointmentId: appointmentRef.id }
                        : a
                );

                await updateDoc(planRef, {
                    appointments: updatedAppointments,
                    updatedAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Error creating plan appointments:', error);
            throw error;
        }
    }

    /**
     * Get treatment plan by ID
     */
    async getTreatmentPlan(planId) {
        try {
            if (!this.db) {
                throw new Error('Firestore not initialized');
            }

            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const planRef = doc(this.db, 'treatmentPlans', planId);
            const planSnap = await getDoc(planRef);

            if (!planSnap.exists()) {
                return null;
            }

            return {
                id: planSnap.id,
                ...planSnap.data()
            };
        } catch (error) {
            console.error('Error getting treatment plan:', error);
            throw error;
        }
    }

    /**
     * Get all treatment plans for a patient
     */
    async getPatientTreatmentPlans(patientEmail) {
        try {
            if (!this.db) {
                throw new Error('Firestore not initialized');
            }

            const { collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const plansRef = collection(this.db, 'treatmentPlans');
            const plansQuery = query(
                plansRef,
                where('patientEmail', '==', patientEmail),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(plansQuery);
            const plans = [];

            snapshot.forEach(doc => {
                plans.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return plans;
        } catch (error) {
            console.error('Error getting patient treatment plans:', error);
            throw error;
        }
    }

    /**
     * Get all treatment plans for a clinic
     */
    async getClinicTreatmentPlans(clinicId) {
        try {
            if (!this.db) {
                throw new Error('Firestore not initialized');
            }

            const { collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const plansRef = collection(this.db, 'treatmentPlans');
            const plansQuery = query(
                plansRef,
                where('clinicId', '==', clinicId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(plansQuery);
            const plans = [];

            snapshot.forEach(doc => {
                plans.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return plans;
        } catch (error) {
            console.error('Error getting clinic treatment plans:', error);
            throw error;
        }
    }

    /**
     * Update appointment status in treatment plan
     */
    async updateAppointmentStatus(planId, appointmentId, status) {
        try {
            if (!this.db) {
                throw new Error('Firebase not initialized');
            }

            const { doc, getDoc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const planRef = doc(this.db, 'treatmentPlans', planId);
            const planSnap = await getDoc(planRef);

            if (!planSnap.exists()) {
                throw new Error('Treatment plan not found');
            }

            const planData = planSnap.data();
            const updatedAppointments = planData.appointments.map(apt => {
                if (apt.appointmentId === appointmentId) {
                    return {
                        ...apt,
                        status: status,
                        completedAt: status === 'completed' ? serverTimestamp() : apt.completedAt
                    };
                }
                return apt;
            });

            // Calculate progress
            const completedCount = updatedAppointments.filter(apt => apt.status === 'completed').length;
            const progress = (completedCount / planData.totalAppointments) * 100;

            // Check if plan is complete
            const isComplete = completedCount === planData.totalAppointments;
            const planStatus = isComplete ? 'completed' : planData.status;

            await updateDoc(planRef, {
                appointments: updatedAppointments,
                progress: progress,
                status: planStatus,
                completedAt: isComplete ? serverTimestamp() : planData.completedAt,
                updatedAt: serverTimestamp()
            });

            // If plan is complete, generate invoice
            if (isComplete) {
                await this.generatePlanInvoice(planId);
            }

            return { progress, status: planStatus };
        } catch (error) {
            console.error('Error updating appointment status:', error);
            throw error;
        }
    }

    /**
     * Generate invoice for completed treatment plan
     */
    async generatePlanInvoice(planId) {
        try {
            const plan = await this.getTreatmentPlan(planId);
            if (!plan || plan.status !== 'completed') {
                return;
            }

            // Use invoice generator
            if (window.InvoiceGenerator) {
                const invoiceGenerator = new InvoiceGenerator();
                const treatments = plan.appointments.map(apt => ({
                    appointmentId: apt.appointmentId,
                    patientName: plan.patientName,
                    patientEmail: plan.patientEmail,
                    treatmentDate: apt.completedAt || apt.scheduledDate,
                    treatmentType: apt.service
                }));

                await invoiceGenerator.createInvoice(
                    plan.clinicId,
                    treatments,
                    plan.careluvaFee // Single fee for entire plan
                );
            }
        } catch (error) {
            console.error('Error generating plan invoice:', error);
        }
    }

    /**
     * Cancel treatment plan
     */
    async cancelTreatmentPlan(planId, reason, cancelledBy) {
        try {
            if (!this.db) {
                throw new Error('Firebase not initialized');
            }

            const { doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const planRef = doc(this.db, 'treatmentPlans', planId);

            await updateDoc(planRef, {
                status: 'cancelled',
                cancelledAt: serverTimestamp(),
                cancellationReason: reason,
                cancelledBy: cancelledBy,
                updatedAt: serverTimestamp()
            });

            // Calculate prorated fee if needed
            const plan = await this.getTreatmentPlan(planId);
            const completedCount = plan.appointments.filter(apt => apt.status === 'completed').length;
            const proratedFee = plan.careluvaFee * (completedCount / plan.totalAppointments);

            return { proratedFee, completedCount };
        } catch (error) {
            console.error('Error cancelling treatment plan:', error);
            throw error;
        }
    }

    /**
     * Calculate prorated fee for incomplete treatment plan
     */
    calculateProratedFee(plan) {
        const completedCount = plan.appointments.filter(apt => apt.status === 'completed').length;
        const totalAppointments = plan.totalAppointments;
        
        if (completedCount === 0) {
            return 0; // No fee if nothing completed
        }

        // Prorated fee based on completed appointments
        return plan.careluvaFee * (completedCount / totalAppointments);
    }
}

// Make available globally
window.TreatmentPlanManager = TreatmentPlanManager;

