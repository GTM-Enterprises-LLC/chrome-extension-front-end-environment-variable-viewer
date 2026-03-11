# CLAUDE.md — Project Information for AI Assistants

This file provides context about the EnvVars Chrome Extension project for AI-assisted development.

## Project Overview

**EnvVars** is a Chrome extension (Manifest V3) that detects exposed environment variables and hardcoded secrets in frontend JavaScript bundles. It supports 10+ frameworks and helps developers and security professionals audit production builds.

- **Developer**: GTM Enterprises LLC (https://gtmenterprisesllc.com)
- **License**: MIT
- **Repository**: https://github.com/GTM-Enterprises-LLC/chrome-extension-front-end-environment-variable-viewer
- **Current Version**: 3.6.0

## Key Files

| File | Purpose |
|------|---------|
| `manifest.json` | Chrome extension manifest (MV3). Contains version, permissions, icons. |
| `popup.html` | Extension popup UI (500×600px). |
| `popup.css` | Popup styling. |
| `popup.js` | Main detection logic — 21+ regex patterns across 10+ frameworks. |
| `package.json` | NPM metadata, scripts, dev dependencies. |
| `CHANGELOG.md` | Version history with feature descriptions. |
| `CHROME_WEB_STORE.md` | Full Chrome Web Store listing content (description, screenshots, etc.). |
| `PRIVACY_POLICY.md` | Extension privacy policy. |
| `README.md` | Developer-facing documentation. |

## Supported Frameworks

| Framework | Variable Pattern | Detection Method |
|-----------|-----------------|-----------------|
| React (CRA) | `REACT_APP_*` | Bundled JS patterns |
| Vite | `VITE_*`, `import.meta.env` | Bundle + inline script |
| Next.js | `NEXT_PUBLIC_*`, `__NEXT_DATA__` | Bundle + global object |
| Vue 3 | `VITE_*` | Vite bundle |
| Svelte | `VITE_*` | Vite bundle |
| Angular | Environment object properties | Compiled bundle |
| Nuxt.js | `NUXT_PUBLIC_*`, `__NUXT__` | Runtime config object |
| Gatsby | `GATSBY_*` | Bundle + window object |
| Generic | `PUBLIC_*`, `NODE_ENV`, `BASE_URL` | Global patterns |

## Hardcoded Secret Detection (21+ patterns)

- AWS Access Keys (`AKIA...`)
- AWS Secret Keys (40-char base64)
- Stripe API Keys (`sk_live_`, `pk_test_`, etc.)
- Google API Keys (`AIza...`)
- UUIDs
- Generic API Keys (32+ alphanumeric)
- Payment providers (PayPal, Square, Twilio)

## Architecture

The extension uses **Manifest V3** with:
- `activeTab` permission: Read current page content
- `scripting` permission: Inject content scripts
- `storage` permission: Persist user preferences
- `host_permissions (<all_urls>)`: Fetch external JS files

`popup.js` injects a content script into the active tab that:
1. Scans inline `<script>` tags
2. Fetches up to 10 external `.js` files
3. Applies 21+ regex patterns against script content
4. Returns detected variables to the popup UI

## Test Applications

Run with Docker from `test-apps/`:

```bash
cd test-apps
docker compose up -d
```

| App | Prod URL | Dev URL |
|-----|----------|---------|
| React | http://localhost:3002 | http://localhost:3001 |
| Vite | http://localhost:4173 | http://localhost:5173 |
| Next.js | http://localhost:3004 | http://localhost:3003 |
| Vue 3 | http://localhost:8081 | http://localhost:5176 |
| Svelte | http://localhost:8082 | http://localhost:5177 |
| Angular | http://localhost:8083 | http://localhost:4200 |
| Nuxt.js | http://localhost:3006 | http://localhost:3005 |
| Gatsby | http://localhost:9000 | http://localhost:8000 |
| Multicloud (secrets) | http://localhost:5184 | http://localhost:5174 |
| Payment APIs (secrets) | http://localhost:5185 | http://localhost:5175 |

## Testing

```bash
# Unit/integration tests
npm test

# Playwright E2E tests (primary)
npm run test:e2e

# Cypress (legacy, macOS 26+ incompatible)
npm run cypress:run
```

## Version Conventions

- Versions follow **semantic versioning**: `MAJOR.MINOR.PATCH`
- **Major**: Breaking changes or major UI overhaul
- **Minor**: New framework support or significant new features
- **Patch**: Bug fixes and minor improvements
- Both `manifest.json` and `package.json` must have matching version numbers
- Update `CHANGELOG.md` and `CHROME_WEB_STORE.md` with every release

## Chrome Web Store Submission Checklist

See `CHROME_WEB_STORE.md` for the complete store listing and pre-launch checklist. Key requirements:
- Privacy policy must be hosted at https://gtmenterprisesllc.com/privacy-policy-envvars
- All 8 screenshots must be captured showing current UI
- Version in manifest.json must match the submitted zip
- Run full Playwright test suite before submission

## Code Style

- Vanilla JS (no build step required for the extension itself)
- ES6+ features used throughout `popup.js`
- CSS uses custom properties and flexbox/grid
- No external runtime dependencies (dev-only: Playwright, Cypress, nodemon)
