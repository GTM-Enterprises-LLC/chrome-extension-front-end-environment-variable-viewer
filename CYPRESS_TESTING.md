# Cypress Testing with Chrome Extension

> **⚠️ IMPORTANT COMPATIBILITY WARNING**
>
> **Cypress does NOT work on macOS 26.2+ (Darwin 25.2.0 or later)**
>
> If you're running macOS 26.2 or later, Cypress will fail with:
> ```
> /Users/.../Cypress.app/Contents/MacOS/Cypress: bad option: --no-sandbox
> Platform: darwin-x64 (macOS - 26.2)
> Cypress Version: 15.8.2
> ```
>
> **Solution:** Use [Playwright](./PLAYWRIGHT_TESTING.md) instead
> - Playwright has native Chrome extension support
> - Works on macOS 26.2+ and all modern operating systems
> - Better extension testing capabilities
> - Run: `npm run test:e2e`
>
> **Cypress is legacy** - Maintained for compatibility with older systems only.

---

This guide explains how to run Cypress E2E tests with the EnvVars Chrome extension loaded.

## System Requirements

- **Operating System**: macOS 25.x or earlier, Windows, Linux
- **NOT Compatible**: macOS 26.2+ (use Playwright instead)
- **Node.js**: v20.1.0, v22.0.0, or v24.0.0+
- **Cypress Version**: 15.8.2

## Prerequisites

1. **Install Dependencies**:
```bash
npm install
```

2. **Start All Test Applications**:
```bash
cd test-apps
docker compose up -d
```

3. **Verify all containers are running**:
```bash
docker compose ps
```

Expected output should show 16 containers (8 prod + 8 dev) running.

## Running Cypress Tests

### Option 1: Interactive Mode (Recommended for Development)

Open Cypress Test Runner:
```bash
npm run cypress:open
```

This will:
- Launch the Cypress Test Runner UI
- Allow you to select and run individual test files
- Provide real-time feedback and debugging

### Option 2: Headless Mode (CI/CD)

Run all tests headlessly:
```bash
npm run test:e2e
```

This will:
- Run all tests in Chrome browser
- Generate videos and screenshots
- Output results to terminal

### Option 3: Specific Test File

Run a specific test file:
```bash
npx cypress run --spec "cypress/e2e/react-demo.cy.js"
```

## Loading the Extension in Cypress

**IMPORTANT**: Cypress doesn't natively support loading Chrome extensions. Here are the workarounds:

### Method 1: Manual Extension Loading (Quick Testing)

1. Load the extension in Chrome manually:
   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this directory

2. Run Cypress tests in the same Chrome profile:
```bash
npx cypress open --browser chrome
```

3. The extension should be available in the Cypress browser

### Method 2: Using Chrome Launch Args (Advanced)

Create a script to launch Cypress with extension:

```bash
#!/bin/bash
# cypress-with-extension.sh

EXTENSION_PATH="$(pwd)"

# Launch Cypress with Chrome args to load extension
npx cypress open --browser chrome --config-file cypress.config.js
```

**Note**: Chrome extensions can't be fully automated in Cypress without custom plugins. The tests focus on verifying the test applications have the expected environment variables that the extension would detect.

## Test Structure

### Test Files

1. **react-demo.cy.js** - Tests React demo (http://localhost:3002)
   - Verifies 9 REACT_APP_* variables

2. **all-frameworks.cy.js** - Tests all 6 framework demos
   - React, Vite, Next.js, Vue, Svelte, Angular
   - Verifies correct variable counts for each

3. **secrets-detection.cy.js** - Tests secret detection demos
   - Multicloud demo (http://localhost:5184)
   - Payment APIs demo (http://localhost:5185)

### Test URLs (from cypress.config.js)

```javascript
{
  reactProd: 'http://localhost:3002',
  viteProd: 'http://localhost:4173',
  nextProd: 'http://localhost:3004',
  vueProd: 'http://localhost:8081',
  svelteProd: 'http://localhost:8082',
  angularProd: 'http://localhost:8083',
  multicloudProd: 'http://localhost:5184',
  paymentProd: 'http://localhost:5185'
}
```

## What the Tests Verify

### Framework Detection Tests
- ✅ Applications load successfully
- ✅ Expected environment variable prefixes are present
- ✅ Correct number of variables detected
- ✅ Variables are visible in page source/DOM

### Secret Detection Tests
- ✅ Multicloud demo has access keys and secrets
- ✅ Payment APIs demo has API keys
- ✅ Correct patterns for credentials detected

## Manual Extension Testing

While Cypress tests verify the test applications, you should manually test the extension:

1. **Load Extension in Chrome**:
   ```
   chrome://extensions/ → Load unpacked → select this directory
   ```

2. **Visit Test URL**:
   ```
   http://localhost:3002 (React demo)
   ```

3. **Click Extension Icon** in toolbar

4. **Verify Extension UI**:
   - Tab navigation works
   - Variables are detected
   - Filters work correctly
   - Secret detection shows warnings
   - Copy and export functions work

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

### Cypress Errors
```bash
# Clear Cypress cache
npx cypress cache clear

# Reinstall Cypress
npm install cypress --save-dev

# Verify Cypress installation
npx cypress verify
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Start test applications
  run: |
    cd test-apps
    docker compose up -d

- name: Wait for applications
  run: sleep 10

- name: Run Cypress tests
  run: npm run test:e2e

- name: Upload test artifacts
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: cypress-screenshots
    path: cypress/screenshots
```

## Test Results

### Expected Output

```
  All Frameworks - Environment Variables Detection
    React Demo
      ✓ should load React application (1234ms)
      ✓ should detect REACT_APP_* variables (567ms)
      ✓ should have at least 9 environment variables (234ms)
    Vite Demo
      ✓ should load Vite application (1123ms)
      ✓ should detect VITE_* variables (456ms)
      ✓ should have at least 8 environment variables (234ms)
    ...

  18 passing (15s)
```

### Generated Artifacts

- **Videos**: `cypress/videos/` - Recording of each test run
- **Screenshots**: `cypress/screenshots/` - Screenshots of failed tests
- **Reports**: Terminal output with pass/fail status

## Troubleshooting

### Extension Not Detected in Tests

The Cypress tests don't directly interact with the extension. They verify that:
1. Test applications are running
2. Environment variables are present in the page
3. Expected patterns exist in the DOM

To test the extension itself, use manual testing or Playwright (which has better extension support).

### All Tests Failing

1. Verify Docker containers are running:
   ```bash
   docker compose ps
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

## Known Issues

### macOS 26.2+ Incompatibility

**Error:**
```
/Users/.../Cypress.app/Contents/MacOS/Cypress: bad option: --no-sandbox
Platform: darwin-x64 (macOS - 26.2)
```

**Cause:** Cypress binary is incompatible with macOS 26.2+ (Darwin kernel 25.2.0+)

**Solutions:**
1. **Use Playwright** (recommended):
   ```bash
   npm run test:e2e
   ```
   See [PLAYWRIGHT_TESTING.md](./PLAYWRIGHT_TESTING.md)

2. **Downgrade macOS** (not recommended)

3. **Use virtual machine** with older macOS version

### Node.js Version Mismatch

**Warning:**
```
EBADENGINE Unsupported engine
package: 'cypress@15.8.2'
required: { node: '^20.1.0 || ^22.0.0 || >=24.0.0' }
current: { node: 'v23.11.1' }
```

**Impact:** Warning only, but may cause issues. Node 23.x is between supported versions.

**Solution:** Use Playwright or downgrade to Node 22.x

## Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [PLAYWRIGHT_TESTING.md](./PLAYWRIGHT_TESTING.md) - **Recommended alternative**
- [TESTING_URLS.md](./TESTING_URLS.md) - Manual testing checklist
- [TESTING.md](./TESTING.md) - Comprehensive testing guide

## Quick Start Summary

```bash
# 1. Install dependencies
npm install

# 2. Start test apps
cd test-apps && docker compose up -d && cd ..

# 3. Run tests
npm run test:e2e

# Or open interactive mode
npm run cypress:open
```

That's it! The tests will verify all test applications are working correctly.
