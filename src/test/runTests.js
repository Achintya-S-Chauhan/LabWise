/**
 * LABWISE - Standalone CLI Test Runner
 * Execute via: node src/test/runTests.js
 */

import { runAllTests } from './testSuite.js';

console.log('='.repeat(70));
console.log('  LABWISE - VERIFICATION TEST SUITE RUNNER');
console.log('  Code Crack 3.0 Mandatory Acceptance Test Cases');
console.log('='.repeat(70));

const results = runAllTests();
let passedCount = 0;

results.forEach((test) => {
  const status = test.passed ? 'PASS [✓]' : 'FAIL [✗]';
  console.log(`\nTest #${test.id}: ${test.name}`);
  console.log(`Status:      ${status}`);
  console.log(`Description: ${test.description}`);
  if (test.details) {
    console.log(`Details:     ${JSON.stringify(test.details, null, 2)}`);
  }
  if (test.error) {
    console.error(`Error:       ${test.error}`);
  }
  if (test.passed) passedCount++;
});

console.log('\n' + '='.repeat(70));
console.log(`SUMMARY: ${passedCount} / ${results.length} Tests Passed (${Math.round((passedCount / results.length) * 100)}%)`);
console.log('='.repeat(70));

if (passedCount !== results.length) {
  process.exit(1);
} else {
  console.log('All 10 verification test criteria satisfied with 100% compliance.');
}

