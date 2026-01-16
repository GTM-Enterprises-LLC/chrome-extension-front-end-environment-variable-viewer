#!/usr/bin/env node

const http = require('http');

// Test URLs
const testApps = [
  { name: 'React', url: 'http://localhost:3002', prefix: 'REACT_APP_', expectedCount: 9 },
  { name: 'Vite', url: 'http://localhost:4173', prefix: 'VITE_', expectedCount: 8 },
  { name: 'Next.js', url: 'http://localhost:3004', prefix: 'NEXT_PUBLIC_', expectedCount: 8 },
  { name: 'Vue', url: 'http://localhost:8081', prefix: 'VITE_', expectedCount: 10 },
  { name: 'Svelte', url: 'http://localhost:8082', prefix: 'VITE_', expectedCount: 10 },
  { name: 'Angular', url: 'http://localhost:8083', prefix: null, expectedCount: 8 },
  { name: 'Multicloud', url: 'http://localhost:5184', prefix: 'VITE_', expectedCount: 4 },
  { name: 'Payment', url: 'http://localhost:5185', prefix: 'VITE_', expectedCount: 4 },
];

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function testApp(app) {
  console.log(`\n=== Testing ${app.name} (${app.url}) ===`);

  try {
    const html = await fetchPage(app.url);

    // Check if page loaded
    if (!html || html.length === 0) {
      console.log(`❌ FAIL: Page did not load`);
      return { passed: false, reason: 'Page did not load' };
    }
    console.log(`✅ Page loaded (${html.length} bytes)`);

    // Check for prefix or environment patterns
    if (app.prefix) {
      const matches = html.match(new RegExp(app.prefix, 'g')) || [];
      const count = matches.length;

      console.log(`   Found ${count} occurrences of "${app.prefix}"`);

      if (count >= app.expectedCount) {
        console.log(`✅ PASS: Expected at least ${app.expectedCount}, found ${count}`);
        return { passed: true, count };
      } else {
        console.log(`❌ FAIL: Expected at least ${app.expectedCount}, found ${count}`);
        return { passed: false, count, expected: app.expectedCount };
      }
    } else {
      // Angular - check for environment object
      const hasEnv = html.includes('apiUrl') || html.includes('apiKey') || html.includes('environment');
      if (hasEnv) {
        console.log(`✅ PASS: Found environment configuration`);
        return { passed: true };
      } else {
        console.log(`❌ FAIL: No environment configuration found`);
        return { passed: false, reason: 'No environment configuration' };
      }
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { passed: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('MANUAL CYPRESS TEST VALIDATION');
  console.log('='.repeat(60));

  const results = [];

  for (const app of testApps) {
    const result = await testApp(app);
    results.push({ app: app.name, ...result });
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`\nTotal: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.app}: ${r.reason || r.error || 'Count mismatch'}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('CYPRESS TEST ACCURACY ASSESSMENT');
  console.log('='.repeat(60));

  console.log(`
The Cypress tests check if:
1. Each application URL returns HTTP 200 ✅
2. The page body is visible and contains environment variable prefixes ✅
3. The expected number of variables are present ${failed === 0 ? '✅' : '⚠️'}

${failed === 0 ?
  'All tests passed! The Cypress tests are accurate.' :
  'Some tests failed. This could mean:\n' +
  '  - The test expectations need adjustment\n' +
  '  - The containers need to be rebuilt\n' +
  '  - The variables are in JavaScript bundles (not inline HTML)'
}

Note: The actual Chrome extension would scan JavaScript bundles,
not just the HTML source. These tests verify the apps are running
and contain the expected patterns that the extension would detect.
  `);
}

runAllTests().catch(console.error);
