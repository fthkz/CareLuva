#!/usr/bin/env node

/**
 * Automated Test Runner
 * Runs all tests and generates reports
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const TEST_COMMANDS = {
  all: 'npm test',
  unit: 'npm run test:auth && npm run test:firestore',
  integration: 'npm run test:integration',
  coverage: 'npm run test:coverage'
};

async function runTests(testType = 'all') {
  console.log(`\n🧪 Running ${testType} tests...\n`);
  
  try {
    const command = TEST_COMMANDS[testType] || TEST_COMMANDS.all;
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
    
    console.log(`\n✅ ${testType} tests completed successfully!\n`);
    return { success: true, output: stdout };
  } catch (error) {
    console.error(`\n❌ ${testType} tests failed:\n`);
    console.error(error.stdout || error.message);
    return { success: false, error: error.message, output: error.stdout };
  }
}

async function generateReport() {
  console.log('\n📊 Generating test report...\n');
  
  try {
    // Check if test results exist
    const resultsPath = path.join(process.cwd(), 'tests/results/test-results.json');
    
    try {
      const results = await fs.readFile(resultsPath, 'utf-8');
      const data = JSON.parse(results);
      
      console.log('Test Results Summary:');
      console.log(`  Total Tests: ${data.numTotalTests || 0}`);
      console.log(`  Passed: ${data.numPassedTests || 0}`);
      console.log(`  Failed: ${data.numFailedTests || 0}`);
      console.log(`  Duration: ${data.duration || 0}ms\n`);
      
      return data;
    } catch (err) {
      console.log('No test results file found. Run tests first.\n');
      return null;
    }
  } catch (error) {
    console.error('Error generating report:', error.message);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  
  console.log('🚀 CareLuva Automated Test Runner\n');
  console.log('Available test types:');
  console.log('  - all (default): Run all tests');
  console.log('  - unit: Run unit tests only');
  console.log('  - integration: Run integration tests only');
  console.log('  - coverage: Run tests with coverage report\n');
  
  const result = await runTests(testType);
  
  if (result.success) {
    await generateReport();
    process.exit(0);
  } else {
    console.error('\n❌ Tests failed. Check output above for details.\n');
    process.exit(1);
  }
}

main();

