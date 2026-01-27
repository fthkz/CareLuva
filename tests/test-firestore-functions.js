/**
 * Firestore Operations Test Suite
 * Tests for Firestore read, write, update, delete, and query operations
 */

// Test data storage
window.testDocumentIds = [];

/**
 * Check Firebase connection
 */
async function testFirebaseConnection() {
    const container = document.getElementById('connection-results');
    container.innerHTML = '';
    
    const tests = [
        {
            name: 'Firebase app initialized',
            fn: async () => {
                if (!window.firebase || !window.firebase.app) {
                    return { passed: false, message: 'Firebase app not initialized' };
                }
                return { passed: true, message: 'Firebase app initialized correctly' };
            }
        },
        {
            name: 'Firestore database connected',
            fn: async () => {
                if (!window.firebase || !window.firebase.db) {
                    return { passed: false, message: 'Firestore database not connected' };
                }
                return { passed: true, message: 'Firestore database connected correctly' };
            }
        },
        {
            name: 'Firestore collections accessible',
            fn: async () => {
                try {
                    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    // Try to access a collection that should be accessible (providerRegistrations allows create)
                    const testCollection = collection(window.firebase.db, 'providerRegistrations');
                    await getDocs(testCollection);
                    return { passed: true, message: 'Firestore collections accessible' };
                } catch (error) {
                    // Check if it's a permission error
                    if (error.code === 'permission-denied' || error.message.includes('permission') || error.message.includes('Permission')) {
                        return { 
                            passed: false, 
                            message: 'Firestore security rules blocking access', 
                            details: `Permission denied. The 'test' collection is blocked by security rules. For testing, you can:\n1. Temporarily allow test collection in firestore.rules (development only)\n2. Use allowed collections like 'providerRegistrations' for create operations\n3. Run tests with authenticated user\n\nError: ${error.message}` 
                        };
                    }
                    return { passed: false, message: 'Cannot access Firestore collections', details: error.message };
                }
            }
        }
    ];
    
    for (const test of tests) {
        const result = await window.testRunner.runTest(test.name, test.fn);
        window.testRunner.displayResult(result, 'connection-results');
    }
}

/**
 * Firestore Write Tests
 */
async function runWriteTests() {
    const container = document.getElementById('write-results');
    container.innerHTML = '';
    
    const tests = [
        {
            name: 'Write document - Basic write',
            fn: async () => {
                try {
                    const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const testData = {
                        testType: 'write',
                        message: 'Basic write test',
                        timestamp: serverTimestamp(),
                        createdAt: new Date().toISOString(),
                        _test: true  // Mark as test document
                    };
                    
                    const docRef = await addDoc(collection(window.firebase.db, 'test'), testData);
                    window.testDocumentIds.push(docRef.id);
                    
                    if (!docRef.id) {
                        return { passed: false, message: 'Document ID not returned' };
                    }
                    
                    return { passed: true, message: 'Document written successfully', details: `Document ID: ${docRef.id}` };
                } catch (error) {
                    const errorDetails = `Error Code: ${error.code || 'unknown'}\nError Message: ${error.message}\n\nTroubleshooting:\n1. Check Firebase Console → Firestore → Rules to verify test collection rule is deployed\n2. Rule should be: allow read, write: if true;\n3. Wait 1-2 minutes after deploying rules for propagation\n4. Clear browser cache and try again\n5. Verify you're using the correct Firebase project`;
                    return { passed: false, message: 'Write operation failed', details: errorDetails };
                }
            }
        },
        {
            name: 'Write document - With nested objects',
            fn: async () => {
                try {
                    const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const testData = {
                        testType: 'nested',
                        nested: {
                            level1: {
                                level2: 'deep value',
                                number: 42
                            },
                            array: [1, 2, 3]
                        },
                        createdAt: new Date().toISOString()
                    };
                    
                    const docRef = await addDoc(collection(window.firebase.db, 'test'), testData);
                    window.testDocumentIds.push(docRef.id);
                    
                    return { passed: true, message: 'Nested object written successfully', details: `Document ID: ${docRef.id}` };
                } catch (error) {
                    return { passed: false, message: 'Nested object write failed', details: error.message };
                }
            }
        },
        {
            name: 'Write document - With arrays',
            fn: async () => {
                try {
                    const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const testData = {
                        testType: 'array',
                        tags: ['test', 'firestore', 'array'],
                        numbers: [1, 2, 3, 4, 5],
                        objects: [
                            { name: 'Item 1', value: 10 },
                            { name: 'Item 2', value: 20 }
                        ],
                        createdAt: new Date().toISOString()
                    };
                    
                    const docRef = await addDoc(collection(window.firebase.db, 'test'), testData);
                    window.testDocumentIds.push(docRef.id);
                    
                    return { passed: true, message: 'Array data written successfully', details: `Document ID: ${docRef.id}` };
                } catch (error) {
                    return { passed: false, message: 'Array write failed', details: error.message };
                }
            }
        },
        {
            name: 'Write document - With timestamps',
            fn: async () => {
                try {
                    const { collection, addDoc, serverTimestamp, Timestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const testData = {
                        testType: 'timestamp',
                        serverTime: serverTimestamp(),
                        clientTime: Timestamp.now(),
                        createdAt: new Date().toISOString()
                    };
                    
                    const docRef = await addDoc(collection(window.firebase.db, 'test'), testData);
                    window.testDocumentIds.push(docRef.id);
                    
                    return { passed: true, message: 'Timestamp data written successfully', details: `Document ID: ${docRef.id}` };
                } catch (error) {
                    return { passed: false, message: 'Timestamp write failed', details: error.message };
                }
            }
        },
        {
            name: 'Write document - Set with merge',
            fn: async () => {
                try {
                    const { collection, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const testDoc = doc(collection(window.firebase.db, 'test'));
                    const testData = {
                        testType: 'setMerge',
                        initial: 'value',
                        createdAt: new Date().toISOString()
                    };
                    
                    await setDoc(testDoc, testData);
                    window.testDocumentIds.push(testDoc.id);
                    
                    // Merge update
                    await setDoc(testDoc, { updated: 'value' }, { merge: true });
                    
                    return { passed: true, message: 'Set with merge successful', details: `Document ID: ${testDoc.id}` };
                } catch (error) {
                    return { passed: false, message: 'Set with merge failed', details: error.message };
                }
            }
        }
    ];
    
    for (const test of tests) {
        const result = await window.testRunner.runTest(test.name, test.fn);
        window.testRunner.displayResult(result, 'write-results');
    }
}

/**
 * Firestore Read Tests
 */
async function runReadTests() {
    const container = document.getElementById('read-results');
    container.innerHTML = '';
    
    // Create a test document first
    let testDocId = null;
    try {
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        const testData = {
            testType: 'read',
            message: 'Read test document',
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(window.firebase.db, 'test'), testData);
        testDocId = docRef.id;
        window.testDocumentIds.push(testDocId);
    } catch (error) {
        container.innerHTML = '<div class="test-result fail"><div class="test-icon">❌</div><div class="test-content"><div class="test-name">Setup Failed</div><div class="test-message">Could not create test document: ' + error.message + '</div></div></div>';
        return;
    }
    
    const tests = [
        {
            name: 'Read document - Get by ID',
            fn: async () => {
                try {
                    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const docRef = doc(window.firebase.db, 'test', testDocId);
                    const docSnap = await getDoc(docRef);
                    
                    if (!docSnap.exists()) {
                        return { passed: false, message: 'Document does not exist' };
                    }
                    
                    const data = docSnap.data();
                    if (data.testType !== 'read') {
                        return { passed: false, message: 'Document data incorrect', details: JSON.stringify(data) };
                    }
                    
                    return { passed: true, message: 'Document read successfully', details: `Document ID: ${testDocId}` };
                } catch (error) {
                    return { passed: false, message: 'Read operation failed', details: error.message };
                }
            }
        },
        {
            name: 'Read document - Non-existent document',
            fn: async () => {
                try {
                    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const docRef = doc(window.firebase.db, 'test', 'non-existent-id-12345');
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        return { passed: false, message: 'Non-existent document returned data' };
                    }
                    
                    return { passed: true, message: 'Non-existent document handled correctly' };
                } catch (error) {
                    return { passed: false, message: 'Read non-existent document failed', details: error.message };
                }
            }
        },
        {
            name: 'Read collection - Get all documents',
            fn: async () => {
                try {
                    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const querySnapshot = await getDocs(collection(window.firebase.db, 'test'));
                    
                    if (querySnapshot.empty) {
                        return { passed: false, message: 'Collection is empty (expected at least test documents)' };
                    }
                    
                    const count = querySnapshot.size;
                    return { passed: true, message: 'Collection read successfully', details: `Found ${count} documents` };
                } catch (error) {
                    return { passed: false, message: 'Collection read failed', details: error.message };
                }
            }
        }
    ];
    
    for (const test of tests) {
        const result = await window.testRunner.runTest(test.name, test.fn);
        window.testRunner.displayResult(result, 'read-results');
    }
}

/**
 * Firestore Update Tests
 */
async function runUpdateTests() {
    const container = document.getElementById('update-results');
    container.innerHTML = '';
    
    // Create a test document first
    let testDocId = null;
    try {
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        const testData = {
            testType: 'update',
            message: 'Original message',
            value: 10,
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(window.firebase.db, 'test'), testData);
        testDocId = docRef.id;
        window.testDocumentIds.push(testDocId);
    } catch (error) {
        container.innerHTML = '<div class="test-result fail"><div class="test-icon">❌</div><div class="test-content"><div class="test-name">Setup Failed</div><div class="test-message">Could not create test document: ' + error.message + '</div></div></div>';
        return;
    }
    
    const tests = [
        {
            name: 'Update document - Single field',
            fn: async () => {
                try {
                    const { doc, updateDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const docRef = doc(window.firebase.db, 'test', testDocId);
                    await updateDoc(docRef, { message: 'Updated message' });
                    
                    const docSnap = await getDoc(docRef);
                    const data = docSnap.data();
                    
                    if (data.message !== 'Updated message') {
                        return { passed: false, message: 'Field not updated', details: `Expected: Updated message, Got: ${data.message}` };
                    }
                    
                    return { passed: true, message: 'Single field updated successfully' };
                } catch (error) {
                    return { passed: false, message: 'Update operation failed', details: error.message };
                }
            }
        },
        {
            name: 'Update document - Multiple fields',
            fn: async () => {
                try {
                    const { doc, updateDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const docRef = doc(window.firebase.db, 'test', testDocId);
                    await updateDoc(docRef, {
                        message: 'Multiple update',
                        value: 20,
                        updatedAt: new Date().toISOString()
                    });
                    
                    const docSnap = await getDoc(docRef);
                    const data = docSnap.data();
                    
                    if (data.message !== 'Multiple update' || data.value !== 20) {
                        return { passed: false, message: 'Multiple fields not updated correctly', details: JSON.stringify(data) };
                    }
                    
                    return { passed: true, message: 'Multiple fields updated successfully' };
                } catch (error) {
                    return { passed: false, message: 'Multiple field update failed', details: error.message };
                }
            }
        },
        {
            name: 'Update document - Nested field',
            fn: async () => {
                try {
                    const { doc, updateDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const docRef = doc(window.firebase.db, 'test', testDocId);
                    await updateDoc(docRef, {
                        'nested.field': 'nested value'
                    });
                    
                    const docSnap = await getDoc(docRef);
                    const data = docSnap.data();
                    
                    if (!data.nested || data.nested.field !== 'nested value') {
                        return { passed: false, message: 'Nested field not updated', details: JSON.stringify(data) };
                    }
                    
                    return { passed: true, message: 'Nested field updated successfully' };
                } catch (error) {
                    return { passed: false, message: 'Nested field update failed', details: error.message };
                }
            }
        }
    ];
    
    for (const test of tests) {
        const result = await window.testRunner.runTest(test.name, test.fn);
        window.testRunner.displayResult(result, 'update-results');
    }
}

/**
 * Firestore Query Tests
 */
async function runQueryTests() {
    const container = document.getElementById('query-results');
    container.innerHTML = '';
    
    // Create test documents
    const testDocIds = [];
    try {
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        
        for (let i = 0; i < 3; i++) {
            const testData = {
                testType: 'query',
                index: i,
                category: i % 2 === 0 ? 'even' : 'odd',
                value: i * 10,
                createdAt: new Date().toISOString()
            };
            const docRef = await addDoc(collection(window.firebase.db, 'test'), testData);
            testDocIds.push(docRef.id);
            window.testDocumentIds.push(docRef.id);
        }
    } catch (error) {
        container.innerHTML = '<div class="test-result fail"><div class="test-icon">❌</div><div class="test-content"><div class="test-name">Setup Failed</div><div class="test-message">Could not create test documents: ' + error.message + '</div></div></div>';
        return;
    }
    
    const tests = [
        {
            name: 'Query - Where clause (equality)',
            fn: async () => {
                try {
                    const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const q = query(collection(window.firebase.db, 'test'), where('category', '==', 'even'));
                    const querySnapshot = await getDocs(q);
                    
                    if (querySnapshot.empty) {
                        return { passed: false, message: 'Query returned no results' };
                    }
                    
                    const count = querySnapshot.size;
                    return { passed: true, message: 'Where query successful', details: `Found ${count} documents with category='even'` };
                } catch (error) {
                    return { passed: false, message: 'Where query failed', details: error.message };
                }
            }
        },
        {
            name: 'Query - Order by',
            fn: async () => {
                try {
                    const { collection, query, orderBy, getDocs } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const q = query(collection(window.firebase.db, 'test'), orderBy('value', 'asc'));
                    const querySnapshot = await getDocs(q);
                    
                    if (querySnapshot.empty) {
                        return { passed: false, message: 'Order by query returned no results' };
                    }
                    
                    const docs = [];
                    querySnapshot.forEach(doc => {
                        docs.push(doc.data().value);
                    });
                    
                    const isSorted = docs.every((val, i) => i === 0 || docs[i - 1] <= val);
                    
                    if (!isSorted) {
                        return { passed: false, message: 'Results not sorted correctly', details: `Values: ${docs.join(', ')}` };
                    }
                    
                    return { passed: true, message: 'Order by query successful', details: `Sorted values: ${docs.join(', ')}` };
                } catch (error) {
                    return { passed: false, message: 'Order by query failed', details: error.message };
                }
            }
        },
        {
            name: 'Query - Limit',
            fn: async () => {
                try {
                    const { collection, query, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const q = query(collection(window.firebase.db, 'test'), limit(2));
                    const querySnapshot = await getDocs(q);
                    
                    if (querySnapshot.size > 2) {
                        return { passed: false, message: 'Limit not applied', details: `Got ${querySnapshot.size} documents, expected max 2` };
                    }
                    
                    return { passed: true, message: 'Limit query successful', details: `Got ${querySnapshot.size} documents` };
                } catch (error) {
                    return { passed: false, message: 'Limit query failed', details: error.message };
                }
            }
        }
    ];
    
    for (const test of tests) {
        const result = await window.testRunner.runTest(test.name, test.fn);
        window.testRunner.displayResult(result, 'query-results');
    }
}

/**
 * Firestore Delete Tests
 */
async function runDeleteTests() {
    const container = document.getElementById('delete-results');
    container.innerHTML = '';
    
    // Create a test document first
    let testDocId = null;
    try {
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        const testData = {
            testType: 'delete',
            message: 'To be deleted',
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(window.firebase.db, 'test'), testData);
        testDocId = docRef.id;
        window.testDocumentIds.push(testDocId);
    } catch (error) {
        container.innerHTML = '<div class="test-result fail"><div class="test-icon">❌</div><div class="test-content"><div class="test-name">Setup Failed</div><div class="test-message">Could not create test document: ' + error.message + '</div></div></div>';
        return;
    }
    
    const tests = [
        {
            name: 'Delete document - By ID',
            fn: async () => {
                try {
                    const { doc, deleteDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    
                    const docRef = doc(window.firebase.db, 'test', testDocId);
                    await deleteDoc(docRef);
                    
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        return { passed: false, message: 'Document still exists after delete' };
                    }
                    
                    // Remove from test IDs
                    const index = window.testDocumentIds.indexOf(testDocId);
                    if (index > -1) {
                        window.testDocumentIds.splice(index, 1);
                    }
                    
                    return { passed: true, message: 'Document deleted successfully' };
                } catch (error) {
                    return { passed: false, message: 'Delete operation failed', details: error.message };
                }
            }
        }
    ];
    
    for (const test of tests) {
        const result = await window.testRunner.runTest(test.name, test.fn);
        window.testRunner.displayResult(result, 'delete-results');
    }
}

/**
 * Cleanup all test data
 */
async function cleanupTestData() {
    if (!confirm('Are you sure you want to delete all test documents? This cannot be undone.')) {
        return;
    }
    
    const container = document.getElementById('delete-results');
    container.innerHTML = '<div class="test-result running"><div class="test-icon">⏳</div><div class="test-content"><div class="test-name">Cleaning up...</div><div class="test-message">Deleting test documents...</div></div></div>';
    
    try {
        const { collection, getDocs, doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        
        const querySnapshot = await getDocs(collection(window.firebase.db, 'test'));
        let deletedCount = 0;
        let errorCount = 0;
        
        for (const docSnap of querySnapshot.docs) {
            try {
                await deleteDoc(doc(window.firebase.db, 'test', docSnap.id));
                deletedCount++;
            } catch (error) {
                console.error('Error deleting document:', docSnap.id, error);
                errorCount++;
            }
        }
        
        window.testDocumentIds = [];
        
        container.innerHTML = `<div class="test-result pass"><div class="test-icon">✅</div><div class="test-content"><div class="test-name">Cleanup Complete</div><div class="test-message">Deleted ${deletedCount} documents${errorCount > 0 ? `, ${errorCount} errors` : ''}</div></div></div>`;
    } catch (error) {
        container.innerHTML = `<div class="test-result fail"><div class="test-icon">❌</div><div class="test-content"><div class="test-name">Cleanup Failed</div><div class="test-message">${error.message}</div></div></div>`;
    }
}

/**
 * Run all Firestore tests
 */
async function runAllFirestoreTests() {
    await testFirebaseConnection();
    await runWriteTests();
    await runReadTests();
    await runUpdateTests();
    await runQueryTests();
    await runDeleteTests();
}

function clearAllResults() {
    clearResults('connection-results');
    clearResults('write-results');
    clearResults('read-results');
    clearResults('update-results');
    clearResults('query-results');
    clearResults('delete-results');
    clearResults('integration-results');
    window.testRunner.clear();
}

