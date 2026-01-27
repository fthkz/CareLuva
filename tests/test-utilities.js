/**
 * Test Utilities for Firebase Testing
 * Helper functions for testing Firebase operations
 */

class FirebaseTestUtils {
    /**
     * Initialize Firebase for testing
     * @returns {Promise<Object>} - Firebase app and db
     */
    static async initializeFirebase() {
        if (window.firebase && window.firebase.db) {
            return window.firebase;
        }
        
        try {
            const firebaseConfig = await import('../firebase-config.js');
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js');
            const { getFirestore } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            
            const app = initializeApp(firebaseConfig.default);
            const db = getFirestore(app);
            
            window.firebase = { app, db };
            window.firebaseReady = true;
            
            return window.firebase;
        } catch (error) {
            throw new Error(`Firebase initialization failed: ${error.message}`);
        }
    }
    
    /**
     * Wait for Firebase to be ready
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<void>}
     */
    static async waitForFirebase(timeout = 10000) {
        const startTime = Date.now();
        
        while (!window.firebaseReady) {
            if (Date.now() - startTime > timeout) {
                throw new Error('Firebase initialization timeout');
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!window.firebase || !window.firebase.db) {
            throw new Error('Firebase not initialized');
        }
    }
    
    /**
     * Create a test document
     * @param {string} collection - Collection name
     * @param {Object} data - Document data
     * @returns {Promise<string>} - Document ID
     */
    static async createTestDocument(collection, data) {
        await this.waitForFirebase();
        
        const { collection: getCollection, addDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        
        const docRef = await addDoc(getCollection(window.firebase.db, collection), {
            ...data,
            _test: true,
            _createdAt: new Date().toISOString()
        });
        
        return docRef.id;
    }
    
    /**
     * Read a test document
     * @param {string} collection - Collection name
     * @param {string} docId - Document ID
     * @returns {Promise<Object|null>} - Document data or null
     */
    static async readTestDocument(collection, docId) {
        await this.waitForFirebase();
        
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        
        const docRef = doc(window.firebase.db, collection, docId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            return null;
        }
        
        return { id: docSnap.id, ...docSnap.data() };
    }
    
    /**
     * Update a test document
     * @param {string} collection - Collection name
     * @param {string} docId - Document ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<void>}
     */
    static async updateTestDocument(collection, docId, updates) {
        await this.waitForFirebase();
        
        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        
        const docRef = doc(window.firebase.db, collection, docId);
        await updateDoc(docRef, {
            ...updates,
            _updatedAt: new Date().toISOString()
        });
    }
    
    /**
     * Delete a test document
     * @param {string} collection - Collection name
     * @param {string} docId - Document ID
     * @returns {Promise<void>}
     */
    static async deleteTestDocument(collection, docId) {
        await this.waitForFirebase();
        
        const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        
        const docRef = doc(window.firebase.db, collection, docId);
        await deleteDoc(docRef);
    }
    
    /**
     * Cleanup all test documents from a collection
     * @param {string} collection - Collection name
     * @returns {Promise<number>} - Number of documents deleted
     */
    static async cleanupTestDocuments(collection) {
        await this.waitForFirebase();
        
        const { collection: getCollection, getDocs, doc, deleteDoc, query, where } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        
        const q = query(getCollection(window.firebase.db, collection), where('_test', '==', true));
        const querySnapshot = await getDocs(q);
        
        let deletedCount = 0;
        for (const docSnap of querySnapshot.docs) {
            try {
                await deleteDoc(doc(window.firebase.db, collection, docSnap.id));
                deletedCount++;
            } catch (error) {
                console.error(`Error deleting document ${docSnap.id}:`, error);
            }
        }
        
        return deletedCount;
    }
    
    /**
     * Query test documents
     * @param {string} collection - Collection name
     * @param {Array} conditions - Query conditions [{field, operator, value}]
     * @param {Object} options - Query options {orderBy, limit, etc.}
     * @returns {Promise<Array>} - Array of documents
     */
    static async queryTestDocuments(collection, conditions = [], options = {}) {
        await this.waitForFirebase();
        
        const { collection: getCollection, query, where, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        
        let q = getCollection(window.firebase.db, collection);
        
        // Apply where conditions
        for (const condition of conditions) {
            q = query(q, where(condition.field, condition.operator, condition.value));
        }
        
        // Apply order by
        if (options.orderBy) {
            q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
        }
        
        // Apply limit
        if (options.limit) {
            q = query(q, limit(options.limit));
        }
        
        const querySnapshot = await getDocs(q);
        const documents = [];
        
        querySnapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        
        return documents;
    }
    
    /**
     * Batch create documents
     * @param {string} collection - Collection name
     * @param {Array<Object>} documents - Array of document data
     * @returns {Promise<Array<string>>} - Array of document IDs
     */
    static async batchCreateDocuments(collection, documents) {
        await this.waitForFirebase();
        
        const { collection: getCollection, writeBatch, doc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        
        const batch = writeBatch(window.firebase.db);
        const docIds = [];
        
        for (const data of documents) {
            const docRef = doc(getCollection(window.firebase.db, collection));
            docIds.push(docRef.id);
            batch.set(docRef, {
                ...data,
                _test: true,
                _createdAt: new Date().toISOString()
            });
        }
        
        await batch.commit();
        return docIds;
    }
    
    /**
     * Batch delete documents
     * @param {string} collection - Collection name
     * @param {Array<string>} docIds - Array of document IDs
     * @returns {Promise<void>}
     */
    static async batchDeleteDocuments(collection, docIds) {
        await this.waitForFirebase();
        
        const { collection: getCollection, writeBatch, doc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        
        const batch = writeBatch(window.firebase.db);
        
        for (const docId of docIds) {
            const docRef = doc(getCollection(window.firebase.db, collection), docId);
            batch.delete(docRef);
        }
        
        await batch.commit();
    }
    
    /**
     * Test Firestore security rules
     * @param {string} collection - Collection name
     * @param {string} operation - Operation type ('read', 'write', 'update', 'delete')
     * @param {Object} data - Document data (for write/update)
     * @returns {Promise<Object>} - Test result
     */
    static async testSecurityRules(collection, operation, data = {}) {
        await this.waitForFirebase();
        
        try {
            const { collection: getCollection, doc, getDoc, addDoc, updateDoc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            
            const colRef = getCollection(window.firebase.db, collection);
            const docRef = doc(colRef);
            
            let result;
            
            switch (operation) {
                case 'read':
                    result = await getDoc(docRef);
                    return { allowed: result.exists(), error: null };
                    
                case 'write':
                    result = await addDoc(colRef, data);
                    return { allowed: true, docId: result.id, error: null };
                    
                case 'update':
                    result = await updateDoc(docRef, data);
                    return { allowed: true, error: null };
                    
                case 'delete':
                    result = await deleteDoc(docRef);
                    return { allowed: true, error: null };
                    
                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }
        } catch (error) {
            return {
                allowed: false,
                error: error.message,
                code: error.code
            };
        }
    }
    
    /**
     * Measure operation performance
     * @param {Function} operation - Operation to measure
     * @returns {Promise<Object>} - Performance metrics
     */
    static async measurePerformance(operation) {
        const startTime = performance.now();
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : null;
        
        try {
            const result = await operation();
            const endTime = performance.now();
            const endMemory = performance.memory ? performance.memory.usedJSHeapSize : null;
            
            return {
                success: true,
                duration: endTime - startTime,
                memoryUsed: endMemory && startMemory ? endMemory - startMemory : null,
                result
            };
        } catch (error) {
            const endTime = performance.now();
            
            return {
                success: false,
                duration: endTime - startTime,
                error: error.message
            };
        }
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.FirebaseTestUtils = FirebaseTestUtils;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseTestUtils;
}

