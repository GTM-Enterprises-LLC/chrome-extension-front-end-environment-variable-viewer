# Changelog

All notable changes to the EnvVars Chrome Extension will be documented in this file.

## [3.4.0] - 2026-01-13

### 🎨 UI/UX Improvements

**Tab-Based Navigation:**
- Converted script search from collapsible panel to dedicated tab
- Two-tab layout: "📋 Variables" and "🔍 Script Search"
- Cleaner, more organized interface
- Scripts load automatically on first tab switch

**Condensed UI:**
- Reduced padding, margins, and font sizes throughout the extension
- Smaller header (20px icon, 16px title)
- Compact tabs (8px padding, 11px font)
- Smaller buttons (4px padding, 9px font for filters)
- Tighter spacing between elements (8px gap for env items)
- More environment variables visible at once without scrolling
- Improved information density without sacrificing readability

**Header Enhancement:**
- Added extension icon to popup header
- Improves brand recognition and visual appeal

### 🐛 Bug Fixes

**Fixed False Positive Detection:**
- Added comprehensive blacklist for generic JavaScript properties
- Filters out common properties: name, value, type, id, key, data, and 20+ others
- Also filters generic values to prevent false matches
- Prevents detection of common non-environment properties
- Significantly reduces noise in results for better accuracy

## [3.3.0] - 2026-01-13

### ✨ New Features

**Individual Copy Buttons:**
- Added 📋 copy icon next to each environment variable value
- Click to copy individual values to clipboard
- Visual feedback (✓) on successful copy
- Hover effect for better discoverability

**Export to .env Format:**
- New "Export .env" button in footer (orange color)
- Exports variables in standard KEY=value format
- Automatically quotes values with spaces or special characters
- Perfect for copying to local development environments
- One variable per line, ready to use

### 🔧 Improvements

**Full Secret Display:**
- Removed truncation of detected secrets
- AWS secrets, Stripe keys, and API keys now show full values
- No more "..." - see complete credentials for proper auditing
- Makes it easier to identify and report exposed secrets

## [3.2.0] - 2026-01-13

### 🎨 UI/UX Improvements

**Space-Saving Design:**
- Replaced long source text with icon-based popovers (hover to see full source)
- Icons: 📦 (external), 📜 (inline/bundled), 🪟 (window), ⚠️ (hardcoded/detected)
- Reduced filter button font size from 12px to 10px for cleaner layout
- Filter button text shortened (e.g., "REACT_APP_*" → "REACT_APP")

### ✨ New Features

**🔍 Script Search:**
- New "Search Scripts" feature to search text across all page scripts
- Searches both inline and external JavaScript files
- Shows matching results with line numbers and highlighted matches
- Preview shows context around each match (truncated for long lines)
- Caches scripts for fast searching
- Results grouped by file with match count

### 🔧 Improvements

- Cleaner, more compact interface saves vertical space
- Source information accessible via tooltip on hover
- Visual icons make source type immediately recognizable
- Better readability with reduced button sizes

## [3.1.0] - 2026-01-13

### 🎉 New Framework Support

**Vue, Svelte, and Angular** - The extension now fully supports detecting environment variables from these popular frameworks:

- **Vue 3 (Vite)**: Detects `VITE_` prefixed variables in Vue applications
- **Svelte (Vite)**: Detects `VITE_` prefixed variables in Svelte applications
- **Angular**: Detects environment object properties (apiUrl, apiKey, etc.)

### ✨ New Features

- Added test demo apps for Vue, Svelte, and Angular
- Added Docker support for all new demo apps
- Enhanced test-extension.js to validate detection across all 8 frameworks
- Added Angular-specific pattern detection for environment objects

### 🐛 Bug Fixes

- **Fixed false positive NODE_ENV detection**: Pattern 10 was too aggressive and matched any occurrence of "production", "development", or "test" in quotes. Now only matches actual NODE_ENV assignments.
- **Fixed long env var key wrapping**: Environment variable keys now use `text-overflow: ellipsis` instead of wrapping to multiple lines

### 🔧 Improvements

- Made NODE_ENV detection more strict - only matches explicit assignments like `NODE_ENV="production"`
- Updated docker-compose.yml with 6 new services (Vue dev/prod, Svelte dev/prod, Angular dev/prod)
- Improved popup.css to handle long variable names elegantly with ellipsis
- Added Angular environment property detection (apiUrl, apiKey, production, etc.)

### 📚 Documentation

- Test suite now covers 8 frameworks: React, Vite, Next.js, Vue, Svelte, Angular, Multicloud, Payment APIs
- Updated test cases with proper port mappings (8081, 8082, 8083 for prod builds)

## [3.0.0] - 2026-01-13

### 🎉 Major Features

**Hardcoded Secret Detection** - The extension now detects hardcoded sensitive credentials and API keys that should never be in frontend code:

- **AWS Keys**: Detects `AKIA...` access keys and 40-character secret keys
- **Stripe Keys**: Detects `sk_live_`, `pk_live_`, `sk_test_`, `pk_test_` patterns
- **Google API Keys**: Detects `AIza...` keys
- **UUIDs**: Detects UUID patterns (common in tokens)
- **Generic API Keys**: Detects long alphanumeric strings (32+ chars) with entropy

### ✨ New Features

- Added `🔐 Secrets` filter button to quickly view detected hardcoded secrets
- Visual warning banner when secrets are detected
- Pattern 15: Name-value pair detection for credential displays
- Pattern 16-21: Specific patterns for AWS, Stripe, Google, and generic API keys
- Improved Vite environment variable detection with name-value pairs

### 🔧 Improvements

- Enhanced detection for unquoted object keys (common in Vite minified output)
- Better handling of mixed quote styles in minified code
- Increased object size limit from 500 to 1000 characters
- Added comprehensive credential mapping for cloud providers
- Added support for Twilio, PayPal, Square credentials

### 📚 Documentation

- Added comprehensive [TESTING.md](TESTING.md) guide
- Created automated test suite ([test-extension.js](test-extension.js))
- Added CI/CD integration examples

### 🎨 UI Changes

- New secrets filter button with warning color scheme
- Animated warning banner for detected secrets
- Updated extension description to mention secret detection

## [2.5.0] - 2026-01-13

### 🔧 Improvements

- Fixed Pattern 13 to work without `const envVars=` declaration
- Pattern 13 now detects inline `{key:...,value:...}` structures
- Pattern 14 enhanced to detect both quoted and unquoted keys
- Added support for friendly name mapping (React, Vite, Next.js)
- Improved minified code detection

### 🐛 Bug Fixes

- Fixed detection of Vite variables with unquoted keys
- Improved API key value detection (lowered threshold from 20 to 10 chars)
- Added support for boolean values ("true", "false")
- Added support for large numbers (file sizes, etc.)

## [2.4.0] - 2026-01-13

### 🔧 Improvements

- Fixed Next.js Dockerfile for proper production builds
- Added comprehensive friendly name mapping for Next.js variables
- Improved Pattern 13 and Pattern 14 for better minified code support

## [2.3.0] - 2026-01-13

### ✨ New Features

- Pattern 12: Vite's inline `import.meta.env` object detection
- Pattern 13: React's envVars array structure detection
- Pattern 14: Minified object literal detection

### 🔧 Improvements

- Added ES6 module import scanning
- Improved detection for dynamically loaded modules
- Better handling of Vite development mode

## [2.2.0] - 2026-01-13

### 🔧 Improvements

- Docker setup for all test apps
- Production build support for demos

## [2.1.0] - Initial Version

### ✨ Features

- Basic environment variable detection
- Support for React, Vite, Next.js, Vue, Nuxt, Gatsby
- Copy all and export JSON functionality
- Filter by framework
- Search functionality

---

## Migration Guide

### Upgrading to 3.0.0

**New Feature: Secret Detection**

The extension now automatically detects hardcoded secrets. To use:

1. Reload the extension in Chrome
2. Visit any web page
3. Click the 🔐 Secrets filter to see detected secrets
4. A warning banner appears if secrets are found

**Breaking Changes:** None - this is backward compatible

**Recommended Actions:**
- Review any detected secrets in your applications
- Move sensitive credentials to backend services
- Use environment variables only for non-sensitive configuration

---

## Detection Patterns Summary

| Pattern | Description | Example |
|---------|-------------|---------|
| 1-11 | Framework env vars | `REACT_APP_*`, `VITE_*`, `NEXT_PUBLIC_*` |
| 12 | Vite import.meta.env | `import.meta.env = {VITE_*: "..."}` |
| 13 | key-value objects | `{key:"API URL",value:"..."}` |
| 14 | Minified objects | `n={"API URL":"..."}` |
| 15 | name-value pairs | `{name:"AWS_ACCESS_KEY_ID",value:"..."}` |
| 16 | AWS access keys | `AKIA[0-9A-Z]{16}` |
| 17 | AWS secrets | 40-char base64-like strings |
| 18 | UUIDs | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| 19 | Stripe keys | `sk_live_*`, `pk_test_*`, etc. |
| 20 | Google API keys | `AIza[0-9A-Za-z_-]{35}` |
| 21 | Generic API keys | 32+ char alphanumeric strings |

---

## Testing

Run automated tests:
```bash
npm test
```

See [TESTING.md](TESTING.md) for detailed testing guide.

---

## Support

- Report issues: https://github.com/anthropics/claude-code/issues
- Documentation: See README.md and TESTING.md
