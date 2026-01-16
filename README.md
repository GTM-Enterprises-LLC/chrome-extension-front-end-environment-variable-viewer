# EnvVars - Environment Variable & Secret Detector

A powerful Chrome extension that detects environment variables and hardcoded secrets from popular frontend frameworks including React, Vue, Angular, Svelte, Vite, Next.js, and more.

## 🌟 Features

### 🔐 Secret Detection (v3.0+)
Automatically identifies hardcoded credentials and sensitive data:
- **AWS Keys**: Access keys (`AKIA...`) and secret keys (40-char base64)
- **Stripe Keys**: Live/test keys (`sk_live_`, `pk_test_`, etc.)
- **Google API Keys**: Keys starting with `AIza...`
- **UUIDs**: Common in API tokens and authentication
- **Generic API Keys**: 32+ character alphanumeric patterns
- **Payment Providers**: PayPal, Square, Twilio credentials

Visual warning banner alerts you when secrets are detected, with dedicated 🔐 Secrets filter for quick security audits.

### 🎯 Multi-Framework Support
Detects environment variables from **8+ frameworks**:
- **React** (Create React App) - `REACT_APP_*`
- **Vue 3** - `VITE_*` variables
- **Svelte** - `VITE_*` variables
- **Angular** - Environment object properties
- **Vite** - `VITE_*`, `import.meta.env`
- **Next.js** - `NEXT_PUBLIC_*`, `__NEXT_DATA__`
- **Nuxt.js** - `NUXT_PUBLIC_*`, `__NUXT__`
- **Gatsby** - `GATSBY_*`
- **Generic** - `PUBLIC_*`, `NODE_ENV`, `BASE_URL`

### 📋 Modern UI (v3.2-v3.4)
- **Tab-Based Navigation** (v3.4): Separate tabs for Variables and Script Search
- **Individual Copy Buttons** (v3.3): One-click copy for each variable value
- **Script Search** (v3.2): Search text across all page scripts with line numbers
- **Icon-Based Sources** (v3.2): Space-saving icons (📦 external, 📜 inline, 🪟 window, ⚠️ hardcoded)
- **Condensed Layout** (v3.4): More variables visible without scrolling
- **Smart Filtering**: Filter by framework, secrets, or search
- **Export Options**: JSON or `.env` file format

### 📦 Detection Methods
- Bundled JavaScript files (production builds with webpack/Vite/esbuild)
- External JavaScript files (up to 10 scripts analyzed)
- Inline scripts and minified code
- `window` object variables
- Framework-specific config objects (`__NEXT_DATA__`, `__NUXT__`, etc.)
- `window.env`, `window._env`, `window.config`
- Meta tags

## 🚀 Installation

### Method 1: Chrome Web Store (Recommended)
Coming soon! The extension will be available on the Chrome Web Store.

### Method 2: Load Unpacked Extension (Development)

1. **Download/Clone** this repository to your computer

2. **Open Chrome Extensions Page**:
   - Navigate to `chrome://extensions/`
   - Or click the three dots menu → More Tools → Extensions

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**:
   - Click "Load unpacked"
   - Select the extension folder
   - The extension icon should appear in your toolbar

### Method 3: Pack and Install

1. In Chrome Extensions page with Developer mode enabled
2. Click "Pack extension"
3. Select the extension folder as the extension root
4. Click "Pack Extension" to create a .crx file
5. Drag and drop the .crx file onto the Extensions page

## 📖 Usage

1. **Navigate** to any webpage with a frontend application
2. **Click** the extension icon in your Chrome toolbar
3. **View** all detected environment variables in the Variables tab
4. **Search Scripts** using the dedicated Script Search tab
5. **Filter** by category (All, Secrets, React, Vue, etc.)
6. **Search** for specific variables using the search box
7. **Copy** individual values with 📋 button or export all as JSON/.env

## 🔍 What It Detects

### Environment Variables

#### React (Create React App)
```
REACT_APP_API_URL=https://api.example.com
REACT_APP_AUTH_DOMAIN=auth.example.com
NODE_ENV=production
PUBLIC_URL=/app
```

#### Vue 3 / Svelte (Vite)
```
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
VITE_ENABLE_ANALYTICS=true
MODE=production
```

#### Next.js
```
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_STRIPE_KEY=pk_test_abc123
```

#### Angular
```
apiUrl: "https://api.example.com"
apiKey: "abc123..."
environment: "production"
```

### Hardcoded Secrets (⚠️ Security Risk)

The extension detects 21 secret patterns including:

| Pattern | Example | Risk |
|---------|---------|------|
| AWS Access Key | `AKIA...` (20 chars) | Critical - AWS account access |
| AWS Secret Key | 40-char base64 | Critical - Full AWS permissions |
| Stripe Live Key | `sk_live_...` | Critical - Payment processing |
| Stripe Test Key | `sk_test_...` | Medium - Test environment |
| Google API Key | `AIza...` | High - Google services access |
| UUID Token | `550e8400-e29b-...` | Medium - Authentication tokens |
| Generic API Key | 32+ alphanumeric | Variable - Depends on service |

## 🛡️ Security & Privacy

- ✅ **No data collection**: All processing happens locally in your browser
- ✅ **No external requests**: Extension only reads JavaScript from the current page
- ✅ **Open source**: Full source code available on GitHub
- ✅ **Offline capable**: Works without internet connection
- ✅ **Minimal permissions**: Only `activeTab` and `scripting` required

[View Privacy Policy](./PRIVACY_POLICY.md)

## 🔧 Permissions

This extension requires:
- **activeTab**: To read environment variables from the current tab
- **scripting**: To inject content scripts that extract variables
- **host_permissions (`<all_urls>`)**: To analyze JavaScript on any website

All permissions are used exclusively for local analysis. No data leaves your browser.

## 🧪 Testing

### Automated Testing with Playwright

The extension includes comprehensive E2E tests with Playwright:

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Run E2E tests (9 tests - all should pass)
npm run test:e2e

# Run tests with visible browser
npm run test:e2e:headed

# Interactive UI mode
npm run test:e2e:ui

# View test report
npm run playwright:report
```

### Manual Testing

The project includes 8 test applications for manual verification:

```bash
# Start all test applications with Docker
cd test-apps
docker compose up -d
cd ..

# Or run individual apps (see test-apps/README.md)
```

Test URLs:
- React: http://localhost:3002
- Vite: http://localhost:4173
- Next.js: http://localhost:3004
- Vue: http://localhost:8081
- Svelte: http://localhost:8082
- Angular: http://localhost:8083
- Multicloud (secrets): http://localhost:5184
- Payment APIs (secrets): http://localhost:5185

See [TESTING_URLS.md](./TESTING_URLS.md) for complete testing checklist.

### Testing Documentation

- [PLAYWRIGHT_TESTING.md](./PLAYWRIGHT_TESTING.md) - E2E testing with Playwright (recommended)
- [CYPRESS_TESTING.md](./CYPRESS_TESTING.md) - E2E testing with Cypress (compatibility issues on macOS 26+)
- [TESTING.md](./TESTING.md) - Complete testing guide
- [TESTING_URLS.md](./TESTING_URLS.md) - Manual testing checklist

## 🐛 Troubleshooting

### Understanding Build-time vs Runtime Variables

**Build-time variables** (most common):
- Environment variables are replaced by build tools (Webpack, Vite, Rollup) during compilation
- Example: `process.env.REACT_APP_API_URL` becomes `"https://api.example.com"` in the bundle
- This extension parses these bundled values!

**Runtime variables** (less common):
- Environment variables exposed on `window` object or in separate config files
- Loaded dynamically when the page loads

### No Variables Detected

If you're not seeing any variables:

1. **Verify it's a supported framework**:
   - Check for React DevTools, Vue DevTools, or browser extension indicators

2. **Open the bundle in DevTools**:
   - Press F12 → Sources tab
   - Look for files like `main.[hash].js`, `app.[hash].js`, or `chunk-[hash].js`
   - Search (Ctrl+F) for your framework prefix:
     - React: `REACT_APP_`
     - Vite: `VITE_` or `import.meta.env`
     - Next.js: `NEXT_PUBLIC_` or `__NEXT_DATA__`
     - Vue: `VUE_APP_`

3. **Use Script Search tab**:
   - Click "🔍 Script Search" tab in the extension
   - Search for your framework prefix
   - See exactly where variables appear with line numbers

4. **Test with included demos**:
   - Use the 8 test applications in `test-apps/` directory
   - Verify extension works correctly on known good apps

### Common Scenarios

**Variables in bundle but extension doesn't find them**:
- Variable names might be completely obfuscated
- Try searching for actual values (URLs, API keys) instead

**Only some variables detected**:
- Some values might be identical to others and get deduplicated
- Some patterns in minified code might not match regex patterns

**False positives (generic properties)**:
- v3.4.0 includes comprehensive blacklist for `name`, `value`, `type`, etc.
- Report additional false positives on GitHub

## 📁 Project Structure

```
chrome-extension-front-end-environment-variable-viewer/
├── manifest.json              # Extension configuration (v3.4.0)
├── popup.html                 # Extension popup UI
├── popup.css                  # Popup styling
├── popup.js                   # Main detection logic (21 patterns)
├── icon16.png, icon48.png, icon128.png  # Extension icons
├── README.md                  # This file
├── CHANGELOG.md               # Version history
├── CHROME_WEB_STORE.md        # Store listing content
├── PRIVACY_POLICY.md          # Privacy policy
├── .gitignore                 # Git ignore rules
├── package.json               # NPM scripts and dependencies
├── playwright.config.js       # Playwright test configuration
├── playwright/                # E2E test specs
│   ├── simple.spec.js         # App availability tests (9 tests)
│   └── extension.spec.js      # Advanced extension tests
├── cypress.config.js          # Cypress configuration (legacy)
├── cypress/                   # Cypress test specs (legacy)
├── test-apps/                 # 8 demo applications
│   ├── docker-compose.yml     # Run all apps with Docker
│   ├── all-basic-demos/       # React, Vite, Next.js, Vue, Svelte, Angular
│   └── dangerous-keys-demos/  # Multicloud, Payment APIs (secrets)
└── TESTING*.md                # Testing documentation
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new detection patterns
4. Submit a pull request

[Report Issues on GitHub](https://github.com/GTM-Enterprises-LLC/chrome-extension-front-end-environment-variable-viewer/issues)

## ⚠️ Known Limitations

- Only detects variables exposed to the browser (not build-time only vars without values)
- Cannot access variables from iframes with different origins
- Some heavily minified/obfuscated code may hide variable names
- Detection patterns may not catch all possible secret formats

## 📜 License

MIT License - Feel free to use and modify as needed.

## 📊 Version History

### v3.4.0 (2026-01-13) - Tab Navigation & UI Polish
- **Tab-Based Navigation**: Separate tabs for Variables and Script Search
- **Condensed UI**: More variables visible, improved information density
- **Fixed False Positives**: Blacklist for generic properties (name, value, etc.)
- **Header Enhancement**: Extension icon in popup header
- **Testing Infrastructure**: Playwright E2E tests (9 passing tests)
- **Project Cleanup**: Added .gitignore, removed node_modules from git

### v3.3.0 (2026-01-13) - Copy & Export Improvements
- **Individual Copy Buttons**: 📋 icon next to each variable value
- **Export to .env Format**: Standard KEY=value format with proper quoting
- **Full Secret Display**: No truncation of detected secrets

### v3.2.0 (2026-01-13) - Space-Saving & Script Search
- **Script Search Feature**: Dedicated search across all page scripts
- **Icon-Based Sources**: Replaced text with icons + hover tooltips
- **Compact Design**: Smaller buttons and cleaner layout

### v3.1.0 (2026-01-13) - Framework Expansion
- **Vue 3 Support**: VITE_* variables in Vue applications
- **Svelte Support**: VITE_* variables in Svelte applications
- **Angular Support**: Environment object properties
- **Fixed**: False positive NODE_ENV detection in generic objects

### v3.0.0 (2026-01-12) - Secret Detection
- **Hardcoded Secret Detection**: 21 patterns for AWS, Stripe, Google, UUIDs, etc.
- **Security Warning Banner**: Visual alerts when secrets detected
- **Secrets Filter**: Dedicated filter for quick security review
- **Detection Patterns**: AKIA keys, 40-char secrets, payment keys, API keys

### v2.1.0 - Docker Testing & Infrastructure
- Docker support for all test applications
- docker-compose.yml for easy testing setup
- Dev and prod mode Dockerfiles
- Comprehensive testing documentation

### v2.0.0 - Multi-Framework Release
- Added support for Vite, Next.js, Vue, Nuxt, Gatsby
- Framework-specific detection patterns
- Enhanced Next.js `__NEXT_DATA__` parsing
- Nuxt.js `__NUXT__` config detection
- Vite `import.meta.env` pattern recognition

### v1.1.0 - Bundle Parsing
- Bundled JavaScript parsing for production builds
- Detects variables replaced by Webpack DefinePlugin
- Parses external script files
- Multiple regex patterns for minified code

### v1.0.0 - Initial Release
- Basic React environment variable detection
- Multiple detection methods
- Filtering and search
- Copy and export functionality

---

**Made with ❤️ for developers and security professionals**

[Chrome Web Store](#) | [GitHub](https://github.com/GTM-Enterprises-LLC/chrome-extension-front-end-environment-variable-viewer) | [Report Issues](https://github.com/GTM-Enterprises-LLC/chrome-extension-front-end-environment-variable-viewer/issues)
