/**
 * Test Runner Utility
 * Provides test execution and reporting functionality
 */

class TestRunner {
    constructor() {
        this.results = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
    }
    
    /**
     * Run a single test
     * @param {string} name - Test name
     * @param {Function} testFn - Test function (should return true/false or throw)
     * @param {Object} options - Test options
     * @returns {Promise<Object>} - Test result
     */
    async runTest(name, testFn, options = {}) {
        const startTime = Date.now();
        const result = {
            name,
            status: 'running',
            message: '',
            details: '',
            duration: 0
        };
        
        try {
            const testResult = await testFn();
            const duration = Date.now() - startTime;
            
            if (testResult === true || testResult === undefined) {
                result.status = 'pass';
                result.message = 'Test passed';
                this.passedTests++;
            } else if (testResult === false) {
                result.status = 'fail';
                result.message = 'Test returned false';
                this.failedTests++;
            } else if (typeof testResult === 'object' && testResult.passed !== undefined) {
                result.status = testResult.passed ? 'pass' : 'fail';
                result.message = testResult.message || (testResult.passed ? 'Test passed' : 'Test failed');
                result.details = testResult.details || '';
                if (testResult.passed) {
                    this.passedTests++;
                } else {
                    this.failedTests++;
                }
            } else {
                result.status = 'pass';
                result.message = 'Test passed';
                this.passedTests++;
            }
            
            result.duration = duration;
            this.totalTests++;
            
        } catch (error) {
            result.status = 'fail';
            result.message = `Test failed: ${error.message}`;
            result.details = error.stack || error.toString();
            result.duration = Date.now() - startTime;
            this.failedTests++;
            this.totalTests++;
        }
        
        this.results.push(result);
        return result;
    }
    
    /**
     * Run multiple tests
     * @param {Array<Object>} tests - Array of test objects {name, fn}
     * @returns {Promise<Array>} - Array of test results
     */
    async runTests(tests) {
        const results = [];
        for (const test of tests) {
            const result = await this.runTest(test.name, test.fn, test.options);
            results.push(result);
        }
        return results;
    }
    
    /**
     * Display test result in DOM
     * @param {Object} result - Test result
     * @param {string} containerId - Container element ID
     */
    displayResult(result, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const resultDiv = document.createElement('div');
        resultDiv.className = `test-result ${result.status}`;
        
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏳';
        
        resultDiv.innerHTML = `
            <div class="test-icon">${icon}</div>
            <div class="test-content">
                <div class="test-name">${result.name}</div>
                <div class="test-message">${result.message}</div>
                ${result.details ? `<div class="test-details">${result.details}</div>` : ''}
                <div class="test-message" style="margin-top: 5px; font-size: 12px;">Duration: ${result.duration}ms</div>
            </div>
        `;
        
        container.appendChild(resultDiv);
        
        // Update summary
        this.updateSummary();
    }
    
    /**
     * Update test summary statistics
     */
    updateSummary() {
        document.getElementById('total-tests').textContent = this.totalTests;
        document.getElementById('passed-tests').textContent = this.passedTests;
        document.getElementById('failed-tests').textContent = this.failedTests;
    }
    
    /**
     * Clear results
     */
    clear() {
        this.results = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.updateSummary();
    }
    
    /**
     * Get test report
     * @returns {Object} - Test report
     */
    getReport() {
        return {
            total: this.totalTests,
            passed: this.passedTests,
            failed: this.failedTests,
            passRate: this.totalTests > 0 ? ((this.passedTests / this.totalTests) * 100).toFixed(2) + '%' : '0%',
            results: this.results
        };
    }
}

// Global test runner instance
window.testRunner = new TestRunner();

// Helper function to clear results
function clearResults(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
}

function clearAllResults() {
    clearResults('password-results');
    clearResults('session-results');
    clearResults('integration-results');
    window.testRunner.clear();
}

