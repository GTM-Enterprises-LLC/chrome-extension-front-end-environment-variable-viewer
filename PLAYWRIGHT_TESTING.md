# Playwright Testing with Chrome Extension

This guide explains how to run Playwright E2E tests with the EnvVars Chrome extension loaded.

## Why Playwright?

Playwright has several advantages over Cypress for Chrome extension testing:
- **Native Extension Support**: Can load Chrome extensions using `launchPersistentContext`
- **Full Browser Control**: Direct access to browser internals and DevTools
- **Modern OS Compatibility**: Works on macOS 26.2+ and newer Node versions
- **Script Access**: Can read and parse JavaScript bundles (not just HTML)

## Prerequisites

1. **Install Dependencies**:
```bash
npm install
```

2. **Install Playwright Browsers**:
```bash
npx playwright install chromium
```

3. **Start All Test Applications**:
```bash
cd test-apps
docker compose up -d
cd ..
```

4. **Verify all containers are running**:
```bash
cd test-apps && docker compose ps && cd ..
```

Expected output should show 16 containers (8 prod + 8 dev) running.

## Running Playwright Tests

### Option 1: Headless Mode (Default)

Run all tests in headless mode:
```bash
npm run test:e2e
```

This will:
- Run all tests with extension loaded
- Parse JavaScript bundles for env vars
- Generate HTML report
- Output results to terminal

### Option 2: Headed Mode (See Browser)

Run tests with visible browser:
```bash
npm run test:e2e:headed
```

This is useful for:
- Debugging test failures
- Seeing the extension in action
- Verifying visual behavior

### Option 3: UI Mode (Interactive)

Run tests in interactive UI mode:
```bash
npm run test:e2e:ui
```

This provides:
- Visual test runner interface
- Step-by-step debugging
- Time travel through test execution
- Screenshot/video inspection

### Option 4: Debug Mode

Run tests with debugging enabled:
```bash
npm run test:e2e:debug
```

This opens:
- Playwright Inspector
- Step-by-step execution
- Console output
- Network inspection

### Option 5: Specific Test File

Run a specific test file:
```bash
npx playwright test playwright/extension.spec.js
```

## Test Structure

### Test Files

**playwright/extension.spec.js** - Main test suite with three sections:

1. **Framework Detection Tests** (6 tests)
   - React: 9 REACT_APP_* variables
   - Vite: 8 VITE_* variables
   - Next.js: 8 NEXT_PUBLIC_* variables
   - Vue: 10 VITE_* variables
   - Svelte: 10 VITE_* variables
   - Angular: 8 environment config variables

2. **Secret Detection Tests** (2 tests)
   - Multicloud demo: ACCESS_KEY_ID, SECRET_ACCESS_KEY, etc.
   - Payment APIs demo: STRIPE, PAYPAL, SECRET_KEY, etc.

3. **Extension Functionality Tests** (1 test)
   - Extension popup opens correctly
   - Variables are detected and displayed
   - UI elements function properly

### How Tests Work

Unlike Cypress, Playwright can:

1. **Load the Extension**:
```javascript
const context = await chromium.launchPersistentContext('', {
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
  ],
});
```

2. **Access JavaScript Bundles**:
```javascript
const scripts = await page.evaluate(() => {
  return Array.from(document.scripts)
    .map(s => s.src || s.textContent)
    .filter(Boolean);
});
```

3. **Parse Environment Variables**:
```javascript
const scriptContent = scripts.join(' ');
const matches = scriptContent.match(/REACT_APP_/g) || [];
expect(matches.length).toBeGreaterThanOrEqual(9);
```

## Test URLs (from playwright.config.js)

```javascript
{
  REACT_PROD: 'http://localhost:3002',
  VITE_PROD: 'http://localhost:4173',
  NEXT_PROD: 'http://localhost:3004',
  VUE_PROD: 'http://localhost:8081',
  SVELTE_PROD: 'http://localhost:8082',
  ANGULAR_PROD: 'http://localhost:8083',
  MULTICLOUD_PROD: 'http://localhost:5184',
  PAYMENT_PROD: 'http://localhost:5185'
}
```

## What the Tests Verify

### Framework Detection Tests
- ✅ Applications load successfully
- ✅ JavaScript bundles contain environment variables
- ✅ Correct number of variables detected in scripts
- ✅ Variables are accessible to the extension
- ✅ Extension can parse minified/bundled code

### Secret Detection Tests
- ✅ Multicloud demo has hardcoded credentials
- ✅ Payment APIs demo has API keys
- ✅ Correct patterns for secrets detected
- ✅ Extension identifies security risks

### Extension Functionality Tests
- ✅ Extension loads in Chrome
- ✅ Extension popup opens
- ✅ Variables are detected and displayed
- ✅ UI elements are interactive

## Viewing Test Reports

After running tests, view the HTML report:
```bash
npm run playwright:report
```

This opens an interactive report showing:
- Test results and timing
- Screenshots of failures
- Videos of test execution
- Detailed logs and traces

## Manual Extension Testing

While Playwright tests verify detection logic, you should also manually test the extension UI:

1. **Load Extension in Chrome**:
   ```
   chrome://extensions/ → Developer mode ON → Load unpacked → select this directory
   ```

2. **Visit Test URL**:
   ```
   http://localhost:3002 (React demo)
   ```

3. **Click Extension Icon** in toolbar

4. **Verify Extension UI**:
   - Tab navigation works (📋 Variables / 🔍 Script Search)
   - Variables are detected and displayed
   - Filters work correctly
   - Secret detection shows warnings
   - Copy and export functions work
   - Script search finds patterns in JS files

## Debugging Failed Tests

### Container Not Running
```bash
cd test-apps
docker compose restart react-demo-prod
docker compose logs -f react-demo-prod
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3002

# Kill the process
kill -9 <PID>

# Restart container
docker compose restart react-demo-prod
```

### Playwright Errors
```bash
# Clear Playwright cache
rm -rf ~/.cache/ms-playwright

# Reinstall browsers
npx playwright install chromium

# Verify installation
npx playwright --version
```

### Extension Not Loading
If the extension doesn't load in tests:

1. Verify manifest.json is valid
2. Check console output for errors
3. Try loading extension manually in Chrome first
4. Run tests in headed mode to see what's happening

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Start test applications
  run: |
    cd test-apps
    docker compose up -d

- name: Wait for applications
  run: sleep 10

- name: Run Playwright tests
  run: npm run test:e2e

- name: Upload test artifacts
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

## Test Results

### Expected Output

```
Running 9 tests using 1 worker

  ✓ [chromium] › extension.spec.js:48:3 › React - should detect environment variables (2.1s)
  ✓ [chromium] › extension.spec.js:48:3 › Vite - should detect environment variables (1.9s)
  ✓ [chromium] › extension.spec.js:48:3 › Next.js - should detect environment variables (2.0s)
  ✓ [chromium] › extension.spec.js:48:3 › Vue - should detect environment variables (1.8s)
  ✓ [chromium] › extension.spec.js:48:3 › Svelte - should detect environment variables (1.9s)
  ✓ [chromium] › extension.spec.js:48:3 › Angular - should detect environment variables (2.1s)
  ✓ [chromium] › extension.spec.js:95:3 › Multicloud - should detect hardcoded secrets (2.0s)
  ✓ [chromium] › extension.spec.js:95:3 › Payment - should detect hardcoded secrets (1.9s)
  ✓ [chromium] › extension.spec.js:126:1 › Extension popup should open (2.3s)

  9 passed (18s)
```

### Generated Artifacts

- **HTML Report**: `playwright-report/index.html` - Interactive test results
- **Videos**: `test-results/` - Videos of failed tests
- **Screenshots**: `test-results/` - Screenshots of failures
- **Traces**: `test-results/` - Full execution traces for debugging

## Troubleshooting

### All Tests Failing

1. Verify Docker containers are running:
   ```bash
   cd test-apps && docker compose ps
   ```

2. Check container logs:
   ```bash
   docker compose logs
   ```

3. Test URLs manually in browser:
   ```bash
   curl http://localhost:3002
   curl http://localhost:4173
   # etc.
   ```

4. Verify Playwright is installed:
   ```bash
   npx playwright --version
   npx playwright install chromium
   ```

### Extension Not Detected

If tests can't load the extension:

1. Check manifest.json syntax
2. Verify all extension files are present
3. Try loading extension manually in Chrome
4. Check Playwright logs for error messages

### Headed Mode Crashes

If headed mode crashes or hangs:

1. Use debug mode instead: `npm run test:e2e:debug`
2. Check system resources (CPU/RAM)
3. Try running tests one at a time
4. Verify Chrome/Chromium is not running elsewhere

## Playwright vs Cypress

| Feature | Playwright | Cypress |
|---------|-----------|---------|
| Chrome Extension Support | ✅ Native | ❌ Limited |
| macOS 26.2+ | ✅ Works | ❌ Fails |
| Script Parsing | ✅ Full access | ⚠️ Limited |
| Headless Mode | ✅ Yes | ✅ Yes |
| UI Mode | ✅ Modern | ✅ Classic |
| Learning Curve | ⚠️ Moderate | ✅ Easy |

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Testing Chrome Extensions](https://playwright.dev/docs/chrome-extensions)
- [TESTING_URLS.md](./TESTING_URLS.md) - Manual testing checklist
- [TESTING.md](./TESTING.md) - Comprehensive testing guide

## Quick Start Summary

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install chromium

# 3. Start test apps
cd test-apps && docker compose up -d && cd ..

# 4. Run tests
npm run test:e2e

# 5. View report
npm run playwright:report

# Or run in UI mode
npm run test:e2e:ui
```

That's it! Playwright will load the extension and verify all test applications work correctly.
