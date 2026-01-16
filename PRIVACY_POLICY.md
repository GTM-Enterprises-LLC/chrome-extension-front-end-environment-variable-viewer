# Privacy Policy for EnvVars Chrome Extension

**Last Updated: January 15, 2026**
**Version: 3.4.0**

## Overview

EnvVars ("the Extension") is a browser extension developed by GTM Enterprises LLC that helps developers view environment variables from frontend JavaScript frameworks. This privacy policy explains how the Extension handles user data.

## Data Collection

### What We Collect

The Extension reads the following data from web pages you visit **only when you click the extension icon**:

- **JavaScript environment variables** exposed by frontend frameworks (React, Vite, Next.js, Vue, Nuxt, Gatsby, etc.)
- **Script content** on the active page to detect bundled environment variable patterns
- **Framework-specific configuration objects** (e.g., `window.__NEXT_DATA__`, `window.__NUXT__`)

### What We Do NOT Collect

- ❌ Personal information (name, email, address)
- ❌ Browsing history or web activity
- ❌ Passwords or authentication credentials
- ❌ Financial or payment information
- ❌ Location data
- ❌ Health information
- ❌ Any data from pages you don't explicitly activate the extension on

## Data Storage

- **No data is stored** by the Extension
- **No data is transmitted** to external servers
- All processing happens locally in your browser
- Environment variable data is displayed only in the extension popup and is discarded when the popup closes

## Data Sharing

We do not sell, trade, or transfer any user data to third parties. The Extension operates entirely offline and locally.

## Permissions Explained

| Permission | Why It's Needed |
|------------|-----------------|
| `activeTab` | To access the current page when you click the extension icon |
| `scripting` | To inject a content script that reads environment variables from the page |
| `<all_urls>` | To work on any website where developers need to inspect environment variables |

## Third-Party Services

The Extension does not integrate with any third-party analytics, advertising, or tracking services.

## Development and Testing

The Extension includes automated testing infrastructure (Playwright, Cypress) for quality assurance. **These testing tools are development-only dependencies** and are:
- NOT included in the distributed extension
- NOT executed when you use the extension
- NOT able to access your data
- Used only by developers to ensure extension quality

## Open Source

This extension is open source. You can review the complete source code at:
https://github.com/GTM-Enterprises-LLC/chrome-extension-front-end-environment-variable-viewer

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be posted to this page with an updated revision date.

## Contact

If you have questions about this privacy policy or the Extension's data practices, please:

- **Open an issue** on our GitHub repository: https://github.com/GTM-Enterprises-LLC/chrome-extension-front-end-environment-variable-viewer/issues
- **Email**: [Your email address]

## Consent

By using the EnvVars Chrome Extension, you consent to this privacy policy.

---

*GTM Enterprises LLC*
