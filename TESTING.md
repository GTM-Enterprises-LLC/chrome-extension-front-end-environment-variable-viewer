# Testing Guide

## Overview

This project includes comprehensive automated testing for the Chrome extension. Three levels of testing ensure quality and reliability:

1. **E2E Testing with Playwright** (Recommended) - Browser automation testing with extension loaded
2. **E2E Testing with Cypress** (Legacy) - Alternative browser testing (macOS 26+ compatibility issues)
3. **Unit/Integration Testing** - JavaScript detection pattern validation

## Testing Frameworks

### 🎭 Playwright (Recommended)

**Best for:** End-to-end testing with Chrome extension support

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Run E2E tests (9 tests - should all pass)
npm run test:e2e

# Run with visible browser
npm run test:e2e:headed

# Interactive UI mode for debugging
npm run test:e2e:ui

# View HTML test report
npm run playwright:report
```

**Why Playwright:**
- Native Chrome extension support via `launchPersistentContext`
- Works on macOS 26.2+ and all modern OS versions
- Can access and parse JavaScript bundles
- Interactive debugging tools
- Modern, actively maintained

**See:** [PLAYWRIGHT_TESTING.md](./PLAYWRIGHT_TESTING.md) for complete guide

### 🌲 Cypress (Legacy)

**Best for:** Users on macOS 25.x or earlier

```bash
# Run Cypress tests
npm run cypress:run

# Open Cypress UI
npm run cypress:open
```

**⚠️ Known Issues:**
- Incompatible with macOS 26.2+ (Darwin 25.2.0)
- Error: "bad option: --no-sandbox"
- Use Playwright instead on newer systems

**See:** [CYPRESS_TESTING.md](./CYPRESS_TESTING.md) for complete guide

### ⚙️ Unit/Integration Testing

**Best for:** Fast validation of detection patterns

```bash
# Run all tests
npm test

# Or directly
node test-extension.js
```

## Quick Start

### Option 1: Playwright E2E Tests (Recommended)

```bash
# 1. Start test applications
cd test-apps && docker compose up -d && cd ..

# 2. Run Playwright tests
npm run test:e2e

# Expected: 9 passed (all green)
```

### Option 2: Unit/Integration Tests

```bash
# Run detection pattern tests
npm test
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
