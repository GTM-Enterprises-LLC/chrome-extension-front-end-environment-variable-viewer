# Test Apps Summary

This directory contains all test applications for the Chrome Extension Environment Variable Viewer.

## Quick Links
- [Docker Testing Guide](./DOCKER_TESTING.md) - Complete Docker setup and testing instructions
- [Basic Demos README](./all-basic-demos/README.md) - Standard framework demos
- [Dangerous Keys Demos README](./dangerous-keys-demos/DANGEROUS-KEYS-README.md) - Security testing demos

## Automated Testing with Playwright

The extension includes comprehensive E2E tests using Playwright:

```bash
# From project root, start all test apps
cd test-apps && docker compose up -d && cd ..

# Run Playwright E2E tests (9 tests)
npm run test:e2e

# Expected output: 9 passed
```

**What it tests:**
- All 8 test applications load successfully (React, Vite, Next.js, Vue, Svelte, Angular, Multicloud, Payment)
- JavaScript files are accessible
- HTTP 200 responses
- Extension can be loaded with each app

See [../PLAYWRIGHT_TESTING.md](../PLAYWRIGHT_TESTING.md) for complete guide.

## Running Tests Manually

### With Docker (Recommended)
```bash
# Start all production servers (recommended for testing)
docker compose up -d

# Or start specific apps
docker compose up react-demo-prod vite-demo-prod nextjs-demo-prod

# Or start all dev servers
docker compose up react-demo-dev vite-demo-dev nextjs-demo-dev
```

### Without Docker
```bash
cd test-apps/all-basic-demos/[app-name]
npm install
npm run dev  # or npm run build && npm run preview
```

## Port Mapping

| App | Dev Port | Prod Port |
|-----|----------|-----------|
| React Demo | 3001 | 3002 |
| Vite Demo | 5173 | 4173 |
| Next.js Demo | 3003 | 3004 |
| Multicloud Demo | 5174 | 5184 |
| Payment APIs Demo | 5175 | 5185 |

## Testing Checklist

For each app, verify:
- [ ] Extension detects variables in **development** mode
- [ ] Extension detects variables in **production** build
- [ ] All environment variables are found
- [ ] Source attribution is correct
- [ ] Copy and export functions work

## Apps Overview

### Basic Demos
1. **react-demo** - Create React App with `REACT_APP_*` variables
2. **vite-demo** - Vite + React with `VITE_*` variables
3. **nextjs-demo** - Next.js with `NEXT_PUBLIC_*` variables

### Dangerous Keys Demos
4. **multicloud-demo** - Mock cloud provider credentials (AWS, Azure, GCP)
5. **payment-apis-demo** - Mock payment API keys (Stripe, PayPal, Square, etc.)

⚠️ All credentials in dangerous-keys-demos are mock/fake for testing purposes only.
