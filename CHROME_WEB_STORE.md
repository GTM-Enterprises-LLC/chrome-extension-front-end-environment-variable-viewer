# Chrome Web Store Listing - EnvVars

## Extension Name
EnvVars - Environment Variable & Secret Detector

## Summary (132 characters max)
Detect exposed environment variables and hardcoded secrets in React, Vue, Angular, Svelte, Next.js, and other frontend frameworks.

## Description

**EnvVars** is a powerful Chrome extension that instantly detects environment variables and hardcoded secrets exposed in your frontend JavaScript bundles. Perfect for security audits, code reviews, and ensuring production builds don't leak sensitive information.

### 🔍 What It Detects

**Environment Variables:**
- React: `REACT_APP_*` variables
- Vue 3: `VITE_*` variables
- Svelte: `VITE_*` variables
- Next.js: `NEXT_PUBLIC_*` variables
- Angular: Environment object properties
- Vite: `VITE_*` variables
- Nuxt: `NUXT_PUBLIC_*` variables
- Gatsby: `GATSBY_*` variables
- Generic: `NODE_ENV`, `PUBLIC_URL`, `BASE_URL`

**Hardcoded Secrets (NEW in v3.0):**
- AWS Access Keys (`AKIA...`)
- AWS Secret Keys (40-char base64)
- Stripe API Keys (`sk_live_`, `pk_test_`, etc.)
- Google API Keys (`AIza...`)
- UUIDs (common in tokens)
- Generic API Keys (32+ character alphanumeric)
- Payment provider credentials (PayPal, Square, Twilio)

### ✨ Key Features

**🔐 Secret Detection**
- Automatically identifies hardcoded credentials
- Visual warning banner when secrets detected
- Dedicated "🔐 Secrets" filter for quick review
- Helps prevent accidental credential leaks

**🎯 Multi-Framework Support**
- Supports 8+ popular frameworks
- Detects both prefixed variables and minified code
- Works with production and development builds
- Handles webpack, Vite, and esbuild outputs

**🚀 Easy to Use**
- Click extension icon on any webpage
- Instantly see all detected variables
- Filter by framework (React, Vue, Next.js, etc.)
- Search functionality for quick lookup
- **Tab-based interface** for organized navigation
- **Search across all page scripts** in dedicated search tab
- **Copy individual values** with one-click 📋 button
- Copy all, export as JSON, or **export as .env** file

**📊 Advanced Detection**
- Scans inline and external JavaScript files
- Parses minified and obfuscated code
- Detects key-value pairs and object literals
- Supports unquoted keys in minified output
- Analyzes up to 10 external scripts per page

### 🛡️ Security & Privacy

- **No data collection**: All processing happens locally in your browser
- **No external requests**: Extension only reads JavaScript from the current page
- **Open source**: Full source code available on GitHub
- **Offline capable**: Works without internet connection

### 📸 Perfect For

- Security researchers and penetration testers
- DevOps engineers reviewing production builds
- Frontend developers debugging configuration issues
- Code reviewers checking for credential leaks
- QA teams validating environment setups

### 🎨 User Interface

Clean, modern interface with:
- Gradient header with extension icon and refresh button
- **Tab-based navigation** (Variables + Script Search)
- Searchable variable list
- Framework-specific filter buttons (compact design)
- Icon-based source indicators with hover tooltips (saves space!)
- **Dedicated script search tab** to search all page scripts
- Warning banners for detected secrets
- Copy to clipboard functionality
- Export to JSON or .env format for reports
- Responsive design that fits your workflow

### 🔄 Recent Updates (v3.4.0)

**New in v3.4.0:**
- 📑 Tab-based navigation (Variables tab + Script Search tab)
- Extension icon in header for better branding
- Fixed false positive detection of generic properties (name, value, etc.)
- Cleaner, more organized interface

**v3.3.0:**
- 📋 Individual copy buttons for each variable value
- Export to .env format (KEY=value, one per line)
- Full secret values displayed (no truncation)
- Quick copy with visual feedback

**v3.2.0 - UI/UX Improvements:**
- Replaced source text with icons + popovers (cleaner, saves space)
- Icons: 📦 external, 📜 inline/bundled, 🪟 window, ⚠️ hardcoded
- Script search feature across all page scripts
- Compact button design

**v3.1.0 - Framework Support:**
- Full Vue 3, Svelte, Angular support
- Fixed false positive NODE_ENV detection
- Improved pattern matching for minified code

**v3.0.0 - Secret Detection:**
- Hardcoded secret detection (AWS, Stripe, Google, UUIDs)
- Security warning banner
- 21+ detection patterns

**Quality Assurance:**
- Comprehensive Playwright E2E test suite (9 passing tests)
- Automated testing for all 8 frameworks
- Docker-based testing infrastructure
- Well-tested and production-ready

### 📚 Use Cases

**Security Audit:**
Navigate to your production site, click the extension, and instantly see all exposed environment variables and secrets. Perfect for pre-release security reviews.

**Development Debugging:**
Quickly check which environment variables made it into your build. Useful when debugging configuration issues or verifying build processes.

**Code Review:**
Validate that sensitive credentials are not hardcoded in frontend bundles. The 🔐 Secrets filter highlights potential security issues.

**Compliance Check:**
Ensure your application meets security standards by verifying no API keys, tokens, or credentials are exposed in client-side code.

### 🐛 Report Issues

Found a bug or have a feature request? Report it on GitHub:
https://github.com/GTM-Enterprises-LLC/chrome-extension-front-end-environment-variable-viewer/issues

### 💡 Tips

1. Use the search box to quickly find specific variables
2. Click "🔐 Secrets" to review detected credentials
3. Export to JSON for documentation or reports
4. Check both development and production builds
5. Regular audits help catch accidental credential commits

### 🏗️ Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: activeTab, scripting, host_permissions
- **Detection Patterns**: 21+ regex patterns for comprehensive coverage
- **Performance**: Optimized to limit script scanning (max 10 files)
- **Size**: Lightweight extension, minimal resource usage

### 🌟 Why EnvVars?

Unlike manual inspection of JavaScript files, EnvVars:
- Instantly finds variables across multiple files
- Understands framework-specific patterns
- Detects minified and obfuscated code
- Provides a clean, organized interface
- Filters out noise, shows what matters
- Identifies security risks automatically

### 📖 Documentation

Full documentation, testing guide, and demo applications available in the GitHub repository.

---

**Ready to secure your frontend?** Install EnvVars today and ensure your environment variables and secrets are properly managed!

## Category
Developer Tools

## Language
English

## Privacy Policy
https://gtm-enterprises-llc.github.io/chrome-extension-front-end-environment-variable-viewer/privacy-policy.html

## Support URL
https://github.com/GTM-Enterprises-LLC/chrome-extension-front-end-environment-variable-viewer/issues

## Version
3.4.0

## Permissions Justification

**activeTab**
Required to read the current page's JavaScript content and extract environment variables from loaded scripts.

**scripting**
Required to inject content scripts that scan the page's JavaScript bundles for environment variables and secrets.

**host_permissions (<all_urls>)**
Required to fetch and analyze external JavaScript files referenced by the current page. The extension needs to read script content from various CDNs and hosting providers.

## Keywords (separate with commas)
environment variables, env vars, secrets detection, security audit, react, vue, angular, svelte, nextjs, vite, webpack, api keys, aws keys, developer tools, security, code review, frontend security

## Single Purpose Description
Detects and displays environment variables and hardcoded secrets in frontend JavaScript bundles for security auditing and development debugging.

## Screenshots to Upload

### Screenshot 1: Tab-Based Interface (v3.4.0)
**Title**: Modern Tab-Based Navigation
**Description**: NEW in v3.4.0! Separate tabs for Variables and Script Search. Clean, organized interface with extension icon in header. View more variables without scrolling thanks to condensed layout.

### Screenshot 2: Variables Tab with Individual Copy
**Title**: Variables Tab with One-Click Copy
**Description**: View all detected environment variables with individual 📋 copy buttons. Icon-based source indicators (📦 external, 📜 inline, 🪟 window, ⚠️ hardcoded). Compact, space-saving design.

### Screenshot 3: Script Search Tab
**Title**: Script Search Tab - Search All Page Scripts
**Description**: Dedicated tab for searching across all inline and external JavaScript files. Results show line numbers, match count, and highlighted previews with context.

### Screenshot 4: Secrets Detection Warning
**Title**: Hardcoded Secrets Detection & Warning
**Description**: Automatic detection of AWS keys, Stripe keys, Google API keys, UUIDs, and generic API tokens. Visual warning banner alerts you to security risks.

### Screenshot 5: Framework Filters
**Title**: Multi-Framework Support (8+ Frameworks)
**Description**: Filter by React, Vue, Angular, Svelte, Next.js, Vite, Nuxt, Gatsby. Smart filters show only relevant variables. Compact button design maximizes screen space.

### Screenshot 6: Individual Copy & Export Features
**Title**: Copy Individual Values or Export All
**Description**: One-click copy for each variable value. Export all as JSON for reports or .env format for local development. Quick, efficient workflow.

### Screenshot 7: React Production Build Detection
**Title**: React Environment Variables in Production
**Description**: Automatically detects REACT_APP_* variables in production builds, even in minified webpack bundles. Works with all modern bundlers.

### Screenshot 8: Security Audit with Secrets Filter
**Title**: Security Audit View - Secrets Filter
**Description**: Dedicated 🔐 Secrets filter highlights all detected credentials for quick security review. Perfect for pre-release audits and compliance checks.


## Promotional Tiles (optional)

### Small Tile (440x280)
- EnvVars logo
- Text: "Detect Secrets Instantly"
- Tagline: "Security for Frontend Developers"

### Large Tile (920x680)
- EnvVars logo
- Text: "Environment Variable & Secret Detector"
- Subtitle: "React | Vue | Angular | Svelte | Next.js"
- Feature highlights: "🔐 Security Audit | 🎯 Multi-Framework | 🚀 Instant Detection"

### Marquee Tile (1400x560)
- Full interface screenshot
- Text overlay: "Stop Leaking Secrets in Your Frontend"
- CTA: "Install Free Extension"

## Store Icon (128x128)
Use the existing icon128.png - shows a key/lock symbol representing security and environment variables.

## Additional Notes

### Why This Extension?

EnvVars fills a critical gap in frontend security tooling. While backend secrets management is well-established, frontend developers often accidentally expose sensitive credentials in client-side bundles. This extension:

1. **Saves Time**: Manual inspection of minified bundles is tedious and error-prone
2. **Improves Security**: Catches accidental credential commits before they cause breaches
3. **Educational**: Helps developers understand what gets bundled in production
4. **Framework-Agnostic**: Works with modern and legacy frameworks

### Target Audience

- Frontend Developers (React, Vue, Angular, Svelte)
- DevOps Engineers doing security reviews
- Security Researchers and Penetration Testers
- QA Engineers validating builds
- Technical Leads reviewing code

### Monetization

Free and open source. No ads, no tracking, no premium features.

### Update Frequency

Regular updates to support new frameworks and improve detection patterns. See CHANGELOG.md for full version history.

### Support & Community

- GitHub Issues for bug reports
- Active maintenance and updates
- Open to community contributions
- Comprehensive testing suite included

---

## How to Use This Document

1. **Copy each section** to the corresponding field in Chrome Web Store Developer Dashboard
2. **Upload 8 screenshots** showing the features described above
3. **Upload store icon** (128x128)
4. **Optional**: Create and upload promotional tiles
5. **Review privacy policy** link is working
6. **Test the listing** in preview mode before publishing

## Pre-Launch Checklist

- [ ] All screenshots captured and edited (8 screenshots showing v3.4.0 features)
- [ ] Store icon uploaded (128x128)
- [ ] Privacy policy page accessible
- [ ] GitHub issues link working
- [ ] Version number matches manifest.json (3.4.0)
- [ ] Description reviewed for typos
- [ ] Keywords optimized for search
- [ ] Permissions justifications clear and accurate
- [ ] Test extension in incognito mode
- [ ] Verify extension works on multiple sites
- [ ] Run automated tests: `npm run test:e2e` (9 Playwright tests should pass)
- [ ] Run integration tests: `npm test`
- [ ] Test on all 8 demo apps (React, Vue, Angular, Svelte, Next.js, Vite, Multicloud, Payment)
- [ ] Verify tab navigation works smoothly
- [ ] Test individual copy buttons for each variable
- [ ] Test export to JSON and .env formats
- [ ] Verify script search tab functionality
- [ ] Check secrets detection and warning banner

## Post-Launch Actions

1. Monitor Chrome Web Store reviews
2. Respond to user feedback on GitHub Issues
3. Track installation metrics
4. Plan next version features based on feedback
5. Update screenshots as UI evolves

---

**Last Updated**: 2026-01-13
**Version**: 3.4.0
**Maintainer**: GTM Enterprises LLC
