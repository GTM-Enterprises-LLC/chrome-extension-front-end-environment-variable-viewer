# Automated Testing Guide

## Overview

This project includes automated testing for the Chrome extension's environment variable detection capabilities. The test suite validates that the extension correctly identifies and extracts environment variables from production and development builds across different frameworks.

## Quick Start

### Run Tests

```bash
# Run all tests
npm test

# Or directly
node test-extension.js
```

### Prerequisites

- Node.js installed
- Demo apps running via Docker:
  ```bash
  docker compose -f test-apps/docker-compose.yml up -d
  ```

## Test Structure

### Test Script: `test-extension.js`

The automated test script:
1. Fetches JavaScript bundles from running demo apps
2. Applies the same detection patterns the extension uses
3. Validates expected environment variables are found
4. Generates a pass/fail report

### Test Cases

Each test case validates a specific demo app:

| Demo | Framework | Port | Expected Vars |
|------|-----------|------|---------------|
| React Demo (Prod) | Create React App | 3002 | 9 `REACT_APP_*` vars |
| Vite Demo (Prod) | Vite + React | 4173 | 8 `VITE_*` vars |
| Next.js Demo (Prod) | Next.js 14 | 3004 | 8 `NEXT_PUBLIC_*` vars |
| Multicloud Demo (Prod) | Vite | 5184 | 4 `VITE_*` cloud keys |
| Payment APIs Demo (Prod) | Vite | 5185 | 4 `VITE_*` payment keys |

### Test Output

```
🧪 Chrome Extension - Automated Testing
========================================

📝 Testing: React Demo (Production)
   Framework: React
   URL: http://localhost:3002/static/js/main.c2a8e1b9.js
   ✓ Fetched 141.25 KB
   ✓ Found 8 environment variables
   ✓ REACT_APP_API_BASE_URL: https://jsonplaceholder.typicode.com
   ✓ REACT_APP_FIREBASE_API_KEY: AIzaSyDemoKey123456789
   ...

📊 Test Summary
===============
✅ PASS - React Demo (Production)
         9/9 vars detected
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Test Extension

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Start demo apps
        run: |
          docker compose -f test-apps/docker-compose.yml up -d
          sleep 30  # Wait for apps to be ready

      - name: Run tests
        run: npm test

      - name: Stop demo apps
        run: docker compose -f test-apps/docker-compose.yml down
```

## Manual Testing

### Test in Chrome

1. **Load Extension:**
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

2. **Test Each Demo:**
   ```bash
   # Start demos
   docker compose -f test-apps/docker-compose.yml up -d
   ```

3. **Visit Each URL:**
   - React: http://localhost:3002
   - Vite: http://localhost:4173
   - Next.js: http://localhost:3004
   - Multicloud: http://localhost:5184
   - Payment APIs: http://localhost:5185

4. **Open Extension:**
   - Click extension icon
   - Verify environment variables are detected
   - Check correct framework prefix (REACT_APP_, VITE_, etc.)

### Test Development Mode

```bash
# Start dev servers
docker compose -f test-apps/docker-compose.yml down
docker compose -f test-apps/docker-compose.yml up -d \
  react-demo-dev vite-demo-dev nextjs-demo-dev \
  multicloud-demo-dev payment-demo-dev

# Visit dev URLs
# React: http://localhost:3001
# Vite: http://localhost:5173
# Next.js: http://localhost:3003
# Multicloud: http://localhost:5174
# Payment APIs: http://localhost:5175
```

## Troubleshooting

### Tests Fail with "Connection Refused"

**Cause:** Demo apps not running
**Solution:**
```bash
docker compose -f test-apps/docker-compose.yml ps
docker compose -f test-apps/docker-compose.yml up -d
```

### Tests Pass but Extension Doesn't Detect Variables

**Cause:** Extension not reloaded after code changes
**Solution:**
1. Go to `chrome://extensions`
2. Find "EnvVars"
3. Click reload button 🔄

### Specific Variables Not Detected

**Cause:** Pattern mismatch or minification issues
**Debug:**
```bash
# Check what's in the bundle
curl http://localhost:3002/static/js/main.c2a8e1b9.js | grep "REACT_APP"

# Check extension patterns in popup.js
# Look for Pattern 13 and Pattern 14
```

## Extending Tests

### Add New Test Case

Edit `test-extension.js`:

```javascript
const TEST_CASES = [
  // ... existing cases
  {
    name: 'New Demo',
    url: 'http://localhost:PORT/path/to/bundle.js',
    framework: 'Framework Name',
    expectedVars: [
      'EXPECTED_VAR_1',
      'EXPECTED_VAR_2'
    ]
  }
];
```

### Add New Detection Pattern

1. Add pattern to `popup.js` (`parseScriptForEnvVars` function)
2. Add same pattern to `test-extension.js` (`parseScriptForEnvVars` function)
3. Run tests to validate

## Performance

- Test suite runs in ~5-10 seconds
- Each bundle fetch: ~0.5-1 second
- Pattern matching: ~0.1-0.5 seconds per bundle
- Total: ~3-5 seconds for all 5 demos

## Known Limitations

1. **Wildcard URLs:** Some demos use content-hashed filenames (`index-[hash].js`). The test script automatically discovers these.

2. **Missing Variables:** Some variables may not be detected if:
   - They're in dynamically imported chunks not checked
   - They're obfuscated beyond recognition
   - The pattern matching needs improvement

3. **False Positives:** Very rare, but possible if code contains env-like patterns

## Current Test Results

As of version 2.5.0:
- React Demo: 8/9 vars (89%) ✓
- Vite Demo: 4/8 vars (50%) ⚠️
- Next.js Demo: Needs improvement
- Multicloud Demo: Needs improvement
- Payment APIs Demo: Needs improvement

See test output for detailed results.
