#!/usr/bin/env node

/**
 * Automated Extension Testing Script
 *
 * This script tests the Chrome extension by:
 * 1. Fetching JavaScript bundles from running demo apps
 * 2. Applying the same detection patterns the extension uses
 * 3. Validating expected environment variables are found
 * 4. Generating a test report
 */

const https = require('https');
const http = require('http');

// Test configuration
const TEST_CASES = [
  {
    name: 'React Demo (Production)',
    url: 'http://localhost:3002/static/js/main.c2a8e1b9.js',
    framework: 'React',
    expectedVars: [
      'REACT_APP_API_BASE_URL',
      'REACT_APP_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_PROJECT_ID',
      'REACT_APP_AUTH_DOMAIN',
      'REACT_APP_ENABLE_LOGGING',
      'REACT_APP_VERSION',
      'REACT_APP_BUILD_NUMBER',
      'REACT_APP_ENVIRONMENT',
      'REACT_APP_SENTRY_DSN'
    ]
  },
  {
    name: 'Vite Demo (Production)',
    url: 'http://localhost:4173/assets/index-D2y3inlv.js',
    framework: 'Vite',
    expectedVars: [
      'VITE_API_URL',
      'VITE_API_KEY',
      'VITE_FEATURE_FLAG_ANALYTICS',
      'VITE_FEATURE_FLAG_DARK_MODE',
      'VITE_APP_VERSION',
      'VITE_ENVIRONMENT',
      'VITE_MAX_UPLOAD_SIZE',
      'VITE_STRIPE_PUBLIC_KEY'
    ]
  },
  {
    name: 'Next.js Demo (Production)',
    url: 'http://localhost:3004/_next/static/chunks/app/page-a60236fa2dab4b22.js',
    framework: 'Next.js',
    expectedVars: [
      'NEXT_PUBLIC_API_ENDPOINT',
      'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'NEXT_PUBLIC_ENABLE_BETA_FEATURES',
      'NEXT_PUBLIC_APP_NAME',
      'NEXT_PUBLIC_MAX_FILE_SIZE',
      'NEXT_PUBLIC_SUPPORT_EMAIL',
      'NEXT_PUBLIC_CDN_URL'
    ]
  },
  {
    name: 'Multicloud Demo (Production)',
    url: 'http://localhost:5184/assets/index-*.js', // Will be discovered
    framework: 'Vite',
    expectedVars: [
      'VITE_AWS_ACCESS_KEY_ID',
      'VITE_AWS_SECRET_ACCESS_KEY',
      'VITE_AZURE_CLIENT_ID',
      'VITE_GOOGLE_API_KEY'
    ]
  },
  {
    name: 'Payment APIs Demo (Production)',
    url: 'http://localhost:5185/assets/index-*.js', // Will be discovered
    framework: 'Vite',
    expectedVars: [
      'VITE_STRIPE_SECRET_KEY',
      'VITE_PAYPAL_CLIENT_ID',
      'VITE_SQUARE_ACCESS_TOKEN',
      'VITE_TWILIO_ACCOUNT_SID'
    ]
  },
  {
    name: 'Vue Demo (Production)',
    url: 'http://localhost:8081/assets/index-*.js', // Will be discovered
    framework: 'Vue',
    expectedVars: [
      'VITE_API_URL',
      'VITE_API_KEY',
      'VITE_FEATURE_FLAG_ANALYTICS',
      'VITE_FEATURE_FLAG_DARK_MODE',
      'VITE_APP_VERSION',
      'VITE_ENVIRONMENT',
      'VITE_MAX_UPLOAD_SIZE',
      'VITE_STRIPE_PUBLIC_KEY',
      'VITE_GOOGLE_ANALYTICS_ID',
      'VITE_SENTRY_DSN'
    ]
  },
  {
    name: 'Svelte Demo (Production)',
    url: 'http://localhost:8082/assets/index-*.js', // Will be discovered
    framework: 'Svelte',
    expectedVars: [
      'VITE_API_URL',
      'VITE_API_KEY',
      'VITE_FEATURE_FLAG_ANALYTICS',
      'VITE_FEATURE_FLAG_DARK_MODE',
      'VITE_APP_VERSION',
      'VITE_ENVIRONMENT',
      'VITE_MAX_UPLOAD_SIZE',
      'VITE_STRIPE_PUBLIC_KEY',
      'VITE_GOOGLE_ANALYTICS_ID',
      'VITE_SENTRY_DSN'
    ]
  },
  {
    name: 'Angular Demo (Production)',
    url: 'http://localhost:8083/main-*.js', // Will be discovered
    framework: 'Angular',
    expectedVars: [
      'apiUrl',
      'apiKey',
      'appVersion',
      'environmentName',
      'maxUploadSize',
      'stripePublicKey',
      'googleAnalyticsId',
      'sentryDsn'
    ]
  }
];

// Fetch content from URL
function fetchContent(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Discover actual asset filename for wildcard URLs
async function discoverAssetUrl(baseUrl) {
  if (!baseUrl.includes('*')) return baseUrl;

  const htmlUrl = baseUrl.split('/assets/')[0];
  try {
    const html = await fetchContent(htmlUrl);
    const match = html.match(/\/assets\/index-[^"']+\.js/);
    if (match) {
      return htmlUrl + match[0];
    }
  } catch (err) {
    console.error(`  ⚠️  Could not discover asset URL for ${baseUrl}`);
  }
  return baseUrl;
}

// Parse script content for environment variables (mirrors extension logic)
function parseScriptForEnvVars(content) {
  const envVars = {};

  if (!content) return envVars;

  // Pattern 13: key-value objects
  const keyValueObjPattern = /\{[^{}]{0,200}key\s*:\s*["']([^"']+)["'][^{}]{0,200}value\s*:\s*["']([^"']+)["'][^{}]{0,200}\}/g;
  for (const match of content.matchAll(keyValueObjPattern)) {
    const friendlyName = match[1];
    const value = match[2];

    const looksLikeEnvValue =
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.match(/^[A-Za-z0-9_.-]{10,}$/) ||
      value === 'true' || value === 'false' ||
      value.match(/^\d+$/) ||
      value.includes('.com') ||
      value.includes('firebase') ||
      value.includes('sentry');

    if (looksLikeEnvValue) {
      const envKeyMap = {
        'API Base URL': 'REACT_APP_API_BASE_URL',
        'Firebase API Key': 'REACT_APP_FIREBASE_API_KEY',
        'Project ID': 'REACT_APP_FIREBASE_PROJECT_ID',
        'Auth Domain': 'REACT_APP_AUTH_DOMAIN',
        'Enable Logging': 'REACT_APP_ENABLE_LOGGING',
        'Version': 'REACT_APP_VERSION',
        'Build Number': 'REACT_APP_BUILD_NUMBER',
        'Environment': 'REACT_APP_ENVIRONMENT',
        'Sentry DSN': 'REACT_APP_SENTRY_DSN',
        'API URL': 'VITE_API_URL',
        'API Key': 'VITE_API_KEY',
        'Analytics': 'VITE_FEATURE_FLAG_ANALYTICS',
        'Dark Mode': 'VITE_FEATURE_FLAG_DARK_MODE',
        'Max Upload': 'VITE_MAX_UPLOAD_SIZE',
        'Stripe Key': 'VITE_STRIPE_PUBLIC_KEY',
        'API Endpoint': 'NEXT_PUBLIC_API_ENDPOINT',
        'Analytics ID': 'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID',
        'Stripe Publishable Key': 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'Beta Features': 'NEXT_PUBLIC_ENABLE_BETA_FEATURES',
        'App Name': 'NEXT_PUBLIC_APP_NAME',
        'Max File Size': 'NEXT_PUBLIC_MAX_FILE_SIZE',
        'Support Email': 'NEXT_PUBLIC_SUPPORT_EMAIL',
        'CDN URL': 'NEXT_PUBLIC_CDN_URL',
      };

      const envKey = envKeyMap[friendlyName] || `DETECTED_${friendlyName.toUpperCase().replace(/\s+/g, '_')}`;
      if (!envVars[envKey]) {
        envVars[envKey] = { value, source: 'key-value pair' };
      }
    }
  }

  // Pattern 14: minified objects
  const minifiedObjPattern = /[a-z]\s*=\s*\{([^}]{50,1000})\}/g;
  for (const match of content.matchAll(minifiedObjPattern)) {
    const objContent = match[1];
    const allPairs = [];

    // Pattern 1: "key":"value" or "key":value
    const quotedKeyPattern = /"([^"]+)"\s*:\s*"?([^,"}\s]+)"?/g;
    for (const kvMatch of objContent.matchAll(quotedKeyPattern)) {
      allPairs.push({ key: kvMatch[1], value: kvMatch[2].replace(/^"|"$/g, '') });
    }

    // Pattern 2: key:"value" or key:value (unquoted key)
    const unquotedKeyPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*:\s*"?([^,"}\s]+)"?/g;
    for (const kvMatch of objContent.matchAll(unquotedKeyPattern)) {
      const key = kvMatch[1];
      const value = kvMatch[2].replace(/^"|"$/g, '');
      if (!allPairs.find(p => p.key === key)) {
        allPairs.push({ key, value });
      }
    }

    let envLikeCount = 0;
    const foundPairs = [];

    for (const pair of allPairs) {
      const key = pair.key;
      const value = pair.value;

      const looksLikeEnvValue =
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.match(/^[A-Z0-9_-]{20,}$/i) ||
        value.match(/^pk_|^sk_|^AI|^G-|^AC/) ||
        value.includes('example.com') ||
        value.includes('.com') ||
        value.includes('api.') ||
        value.includes('firebase') ||
        value === 'true' || value === 'false';

      const isEnvLikeKey =
        key.startsWith('API ') ||
        key.startsWith('VITE_') ||
        key.startsWith('REACT_APP_') ||
        key.startsWith('NEXT_PUBLIC_') ||
        key.includes('URL') ||
        key.includes('Key') ||
        key.includes('API') ||
        key.includes('Analytics') ||
        key.includes('Mode') ||
        key.includes('Version') ||
        key.includes('Environment') ||
        key.includes('Upload');

      if (looksLikeEnvValue && isEnvLikeKey) {
        envLikeCount++;
        foundPairs.push({ key, value });
      }
    }

    if (envLikeCount >= 2) {
      for (const pair of foundPairs) {
        const envKeyMap = {
          'API URL': 'VITE_API_URL',
          'API Key': 'VITE_API_KEY',
          'Analytics': 'VITE_FEATURE_FLAG_ANALYTICS',
          'Dark Mode': 'VITE_FEATURE_FLAG_DARK_MODE',
          'Version': 'VITE_APP_VERSION',
          'Environment': 'VITE_ENVIRONMENT',
          'Max Upload': 'VITE_MAX_UPLOAD_SIZE',
          'Stripe Key': 'VITE_STRIPE_PUBLIC_KEY',
          'API Endpoint': 'NEXT_PUBLIC_API_ENDPOINT',
          'Analytics ID': 'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID',
          'Stripe Publishable Key': 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
          'Beta Features': 'NEXT_PUBLIC_ENABLE_BETA_FEATURES',
          'App Name': 'NEXT_PUBLIC_APP_NAME',
          'Max File Size': 'NEXT_PUBLIC_MAX_FILE_SIZE',
          'Support Email': 'NEXT_PUBLIC_SUPPORT_EMAIL',
          'CDN URL': 'NEXT_PUBLIC_CDN_URL',
        };

        const envKey = envKeyMap[pair.key] || pair.key;
        if (!envVars[envKey]) {
          envVars[envKey] = { value: pair.value, source: 'minified object' };
        }
      }
    }
  }

  // Also check for direct VITE_/REACT_APP_/NEXT_PUBLIC_ patterns
  const directPattern = /((?:VITE_|REACT_APP_|NEXT_PUBLIC_)[A-Z_]+)["']?\s*[=:]\s*["']([^"']+)["']/g;
  for (const match of content.matchAll(directPattern)) {
    const key = match[1];
    const value = match[2];
    if (!envVars[key]) {
      envVars[key] = { value, source: 'direct pattern' };
    }
  }

  // Angular-specific: Look for environment object property patterns
  // Matches: apiUrl:"https://...",apiKey:"...",production:!0
  const angularEnvPattern = /([a-z][a-zA-Z]*)\s*:\s*(?:"([^"]+)"|'([^']+)'|(!0|!1|\d+))/g;
  const angularProps = ['apiUrl', 'apiKey', 'appVersion', 'environmentName', 'maxUploadSize',
                        'stripePublicKey', 'googleAnalyticsId', 'sentryDsn', 'production'];

  for (const match of content.matchAll(angularEnvPattern)) {
    const key = match[1];
    const value = match[2] || match[3] || (match[4] === '!0' ? 'true' : match[4] === '!1' ? 'false' : match[4]);

    if (angularProps.includes(key) && value) {
      if (!envVars[key]) {
        envVars[key] = { value, source: 'angular environment' };
      }
    }
  }

  return envVars;
}

// Run a single test case
async function runTest(testCase) {
  console.log(`\n📝 Testing: ${testCase.name}`);
  console.log(`   Framework: ${testCase.framework}`);

  try {
    // Discover actual URL if wildcard
    const actualUrl = await discoverAssetUrl(testCase.url);
    console.log(`   URL: ${actualUrl}`);

    // Fetch content
    const content = await fetchContent(actualUrl);
    console.log(`   ✓ Fetched ${(content.length / 1024).toFixed(2)} KB`);

    // Parse for env vars
    const foundVars = parseScriptForEnvVars(content);
    const foundKeys = Object.keys(foundVars);
    console.log(`   ✓ Found ${foundKeys.length} environment variables`);

    // Check expected vars
    const missing = [];
    const found = [];

    for (const expectedVar of testCase.expectedVars) {
      if (foundKeys.includes(expectedVar)) {
        found.push(expectedVar);
        console.log(`   ✓ ${expectedVar}: ${foundVars[expectedVar].value.substring(0, 50)}${foundVars[expectedVar].value.length > 50 ? '...' : ''}`);
      } else {
        missing.push(expectedVar);
        console.log(`   ✗ ${expectedVar}: NOT FOUND`);
      }
    }

    const passed = missing.length === 0;
    return {
      testCase: testCase.name,
      passed,
      found: found.length,
      expected: testCase.expectedVars.length,
      missing,
      foundVars
    };

  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
    return {
      testCase: testCase.name,
      passed: false,
      error: error.message
    };
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Chrome Extension - Automated Testing');
  console.log('========================================\n');
  console.log('Testing environment variable detection across all demo apps...\n');

  const results = [];

  for (const testCase of TEST_CASES) {
    const result = await runTest(testCase);
    results.push(result);
  }

  // Summary
  console.log('\n\n📊 Test Summary');
  console.log('===============\n');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const details = result.error
      ? `Error: ${result.error}`
      : `${result.found}/${result.expected} vars detected`;

    console.log(`${status} - ${result.testCase}`);
    console.log(`         ${details}`);

    if (result.missing && result.missing.length > 0) {
      console.log(`         Missing: ${result.missing.join(', ')}`);
    }
  });

  console.log(`\n📈 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)\n`);

  if (passed === total) {
    console.log('🎉 All tests passed! Extension detection is working correctly.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Review the results above.\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
