# CareLuva Test Suite

Comprehensive testing infrastructure for the CareLuva platform.

## 📁 Test Structure

```
tests/
├── README.md                          # This file
├── test-runner.js                     # Test runner utility
├── test-utilities.js                  # Firebase test utilities
├── test-data-generators.js            # Test data generation functions
├── test-auth-utils.html              # Authentication tests UI
├── test-auth-functions.js            # Authentication test cases
├── test-firestore-operations.html    # Firestore tests UI
├── test-firestore-functions.js       # Firestore test cases
├── test-data-generator-ui.html       # Test data generator UI
└── run-tests.html                    # Test suite runner hub
```

## 🚀 Quick Start

### 1. Start Local Server

```powershell
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File serve-port-8080.ps1

# Or use any local server on port 8080
```

### 2. Open Test Runner

Navigate to: `http://localhost:8080/tests/run-tests.html`

### 3. Run Tests

Click on any test suite card to open and run tests.

## 📋 Test Suites

### 🔐 Authentication Tests (`test-auth-utils.html`)

Tests for `auth-utils.js` including:

- **Password Hashing Tests**
  - Basic password hashing functionality
  - Different passwords produce different hashes
  - Same password produces different hashes (salt verification)
  - Password verification (correct/incorrect passwords)
  - Legacy plain text password support
  - Special characters and edge cases

- **Session Management Tests**
  - Session creation (regular and remember me)
  - Session storage and retrieval
  - Session expiry handling
  - Session refresh
  - Session cleanup
  - Authentication status checks

- **Integration Tests**
  - Full authentication flow
  - Session persistence simulation

**To Run:**
1. Open `tests/test-auth-utils.html` in browser
2. Click "Run Password Tests", "Run Session Tests", or "Run All Tests"
3. View results in the test results section

### 🔥 Firestore Operations Tests (`test-firestore-operations.html`)

Tests for Firestore database operations:

- **Connection Tests**
  - Firebase app initialization
  - Firestore database connection
  - Collection accessibility

- **Write Operations**
  - Basic document write
  - Nested objects
  - Arrays
  - Timestamps
  - Set with merge

- **Read Operations**
  - Get document by ID
  - Read non-existent documents
  - Read entire collection

- **Update Operations**
  - Single field update
  - Multiple fields update
  - Nested field update

- **Query Operations**
  - Where clauses
  - Order by
  - Limit

- **Delete Operations**
  - Delete by ID
  - Cleanup test data

**To Run:**
1. Ensure Firebase is configured (`firebase-config.js`)
2. Open `tests/test-firestore-operations.html` in browser
3. Click test buttons to run individual test suites
4. Use "Cleanup All Test Data" to remove test documents

**⚠️ Warning:** These tests create real data in Firestore. Use a test/development environment.

### 📊 Test Data Generator (`test-data-generator-ui.html`)

Generate test data for:

- **Provider Registrations**
  - Clinic information
  - Certifications
  - Malpractice insurance
  - Experience data
  - Multiple statuses (pending, approved, rejected)

- **Patient Registrations**
  - Patient information
  - Contact details
  - Address information

- **Appointments**
  - Appointment scheduling
  - Multiple statuses
  - Provider/patient associations

- **Reviews**
  - Ratings (1-5 stars)
  - Comments
  - Provider associations

**To Use:**
1. Open `tests/test-data-generator-ui.html`
2. Configure generation parameters
3. Click "Generate" to create test data
4. Click "Save to Firestore" to save to database (optional)
5. Copy JSON for manual use

## 🛠️ Test Utilities

### Test Runner (`test-runner.js`)

Core test execution engine:

```javascript
// Run a single test
await window.testRunner.runTest('Test Name', async () => {
    // Test code
    return true; // or { passed: true, message: 'Success' }
});

// Display result
window.testRunner.displayResult(result, 'container-id');

// Get test report
const report = window.testRunner.getReport();
```

### Firebase Test Utils (`test-utilities.js`)

Helper functions for Firebase testing:

```javascript
// Initialize Firebase
await window.FirebaseTestUtils.initializeFirebase();

// Create test document
const docId = await window.FirebaseTestUtils.createTestDocument('collection', { data: 'value' });

// Read test document
const doc = await window.FirebaseTestUtils.readTestDocument('collection', docId);

// Cleanup test documents
const deleted = await window.FirebaseTestUtils.cleanupTestDocuments('collection');

// Measure performance
const metrics = await window.FirebaseTestUtils.measurePerformance(async () => {
    // Operation to measure
});
```

### Test Data Generators (`test-data-generators.js`)

Generate test data programmatically:

```javascript
// Generate single provider registration
const provider = window.TestDataGenerator.generateProviderRegistration({
    status: 'approved'
});

// Generate multiple providers
const providers = window.TestDataGenerator.generateProviderRegistrations(10, {
    status: 'pending'
});

// Generate appointments
const appointments = window.TestDataGenerator.generateAppointments(5, {
    providerId: 'specific-provider-id'
});

// Generate reviews
const reviews = window.TestDataGenerator.generateReviews(20, {
    providerId: 'specific-provider-id'
});
```

## 📝 Writing New Tests

### 1. Create Test HTML Page

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Test Suite</title>
    <link rel="stylesheet" href="../src/css/base/reset.css">
    <style>
        /* Your styles */
    </style>
</head>
<body>
    <div id="test-results"></div>
    
    <script src="test-runner.js"></script>
    <script>
        async function runMyTests() {
            const tests = [
                {
                    name: 'My Test Case',
                    fn: async () => {
                        // Test code
                        return true;
                    }
                }
            ];
            
            for (const test of tests) {
                const result = await window.testRunner.runTest(test.name, test.fn);
                window.testRunner.displayResult(result, 'test-results');
            }
        }
    </script>
</body>
</html>
```

### 2. Add Test Cases

```javascript
{
    name: 'Test Name',
    fn: async () => {
        // Test implementation
        // Return true/false or { passed: true/false, message: '...', details: '...' }
        return { passed: true, message: 'Test passed' };
    }
}
```

### 3. Use Test Utilities

```javascript
// Use Firebase test utils
await window.FirebaseTestUtils.waitForFirebase();
const docId = await window.FirebaseTestUtils.createTestDocument('test', { data: 'value' });

// Use test data generators
const testData = window.TestDataGenerator.generateProviderRegistration();
```

## 🎯 Test Execution Workflow

1. **Setup**
   - Start local server
   - Ensure Firebase is configured
   - Open test runner hub

2. **Run Tests**
   - Select test suite
   - Click "Run Tests" button
   - Review results

3. **Generate Test Data** (if needed)
   - Open test data generator
   - Configure parameters
   - Generate and save data

4. **Cleanup**
   - Use cleanup functions to remove test data
   - Review test reports

## 📊 Test Reports

Each test suite provides:

- **Test Results**: Pass/fail status for each test
- **Test Details**: Error messages, execution time, additional info
- **Summary Statistics**: Total tests, passed, failed, pass rate

## 🔧 Configuration

### Firebase Configuration

Ensure `firebase-config.js` is properly configured:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    // ...
};
```

### Test Environment

- Use test/development Firebase project
- Ensure Firestore security rules allow test operations
- Test collection should be accessible for testing

## ⚠️ Important Notes

1. **Test Data**: Tests create real data in Firestore. Use test environment only.
2. **Security Rules**: Some tests may fail if security rules are too restrictive.
3. **Cleanup**: Always cleanup test data after testing.
4. **Performance**: Some tests measure performance - results may vary.

## 🐛 Troubleshooting

### Firebase Not Initialized

- Check `firebase-config.js` exists and is correct
- Verify Firebase project is active
- Check browser console for errors

### Tests Failing

- Check Firebase connection
- Verify security rules allow test operations
- Check browser console for detailed errors
- Ensure test data is properly formatted

### Test Data Not Saving

- Verify Firebase is initialized
- Check Firestore security rules
- Ensure collection names are correct
- Check browser console for errors

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Test Plan Document](../comprehensive_test_plan.md)

## 🤝 Contributing

When adding new tests:

1. Follow existing test structure
2. Use test runner utilities
3. Include proper error handling
4. Add test documentation
5. Update this README

---

**Happy Testing! 🚀**

