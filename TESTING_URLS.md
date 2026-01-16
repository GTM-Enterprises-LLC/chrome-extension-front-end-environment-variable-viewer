# Testing URLs - EnvVars Extension

All Docker containers are now running! Use these URLs to test the extension across all supported frameworks.

## 🚀 Production Builds (Recommended for Testing)

These are minified production builds that best represent real-world usage:

### Basic Framework Demos

| Framework | URL | Expected Variables |
|-----------|-----|-------------------|
| **React** | http://localhost:3002 | 9 vars (REACT_APP_*) |
| **Vite** | http://localhost:4173 | 8 vars (VITE_*) |
| **Next.js** | http://localhost:3004 | 8 vars (NEXT_PUBLIC_*) |
| **Vue 3** | http://localhost:8081 | 10 vars (VITE_*) |
| **Svelte** | http://localhost:8082 | 10 vars (VITE_*) |
| **Angular** | http://localhost:8083 | 8 vars (environment object) |

### Security Test Demos (Hardcoded Secrets)

| Demo | URL | Expected Secrets |
|------|-----|-----------------|
| **Multicloud** | http://localhost:5184 | AWS keys, Azure client ID, Google API key |
| **Payment APIs** | http://localhost:5185 | Stripe, PayPal, Square, Twilio credentials |

## 🔧 Development Builds (Optional)

These are unminified development builds with hot-reload:

| Framework | URL |
|-----------|-----|
| **React Dev** | http://localhost:3001 |
| **Vite Dev** | http://localhost:5173 |
| **Next.js Dev** | http://localhost:3003 |
| **Vue 3 Dev** | http://localhost:5176 |
| **Svelte Dev** | http://localhost:5177 |
| **Angular Dev** | http://localhost:4200 |
| **Multicloud Dev** | http://localhost:5174 |
| **Payment APIs Dev** | http://localhost:5175 |

---

## 📋 Testing Checklist

Test the extension on each production URL and verify:

### React Demo (http://localhost:3002)
- [ ] REACT_APP_API_BASE_URL detected
- [ ] REACT_APP_FIREBASE_API_KEY detected
- [ ] REACT_APP_FIREBASE_PROJECT_ID detected
- [ ] REACT_APP_AUTH_DOMAIN detected
- [ ] REACT_APP_ENABLE_LOGGING detected
- [ ] REACT_APP_VERSION detected
- [ ] REACT_APP_BUILD_NUMBER detected
- [ ] REACT_APP_ENVIRONMENT detected
- [ ] REACT_APP_SENTRY_DSN detected
- [ ] Total: 9 variables
- [ ] Filter by "React" works
- [ ] Search functionality works
- [ ] Copy all works
- [ ] Export JSON works

### Vite Demo (http://localhost:4173)
- [ ] VITE_API_URL detected
- [ ] VITE_API_KEY detected
- [ ] VITE_FEATURE_FLAG_ANALYTICS detected
- [ ] VITE_FEATURE_FLAG_DARK_MODE detected
- [ ] VITE_APP_VERSION detected
- [ ] VITE_ENVIRONMENT detected
- [ ] VITE_MAX_UPLOAD_SIZE detected
- [ ] VITE_STRIPE_PUBLIC_KEY detected
- [ ] Total: 8 variables
- [ ] Filter by "Vite" works

### Next.js Demo (http://localhost:3004)
- [ ] NEXT_PUBLIC_API_ENDPOINT detected
- [ ] NEXT_PUBLIC_GOOGLE_ANALYTICS_ID detected
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY detected
- [ ] NEXT_PUBLIC_ENABLE_BETA_FEATURES detected
- [ ] NEXT_PUBLIC_APP_NAME detected
- [ ] NEXT_PUBLIC_MAX_FILE_SIZE detected
- [ ] NEXT_PUBLIC_SUPPORT_EMAIL detected
- [ ] NEXT_PUBLIC_CDN_URL detected
- [ ] Total: 8 variables
- [ ] Filter by "Next.js" works

### Vue 3 Demo (http://localhost:8081) ⭐ NEW
- [ ] VITE_API_URL detected
- [ ] VITE_API_KEY detected
- [ ] VITE_FEATURE_FLAG_ANALYTICS detected
- [ ] VITE_FEATURE_FLAG_DARK_MODE detected
- [ ] VITE_APP_VERSION detected
- [ ] VITE_ENVIRONMENT detected
- [ ] VITE_MAX_UPLOAD_SIZE detected
- [ ] VITE_STRIPE_PUBLIC_KEY detected
- [ ] VITE_GOOGLE_ANALYTICS_ID detected
- [ ] VITE_SENTRY_DSN detected
- [ ] Total: 10 variables
- [ ] Filter by "Vite" works

### Svelte Demo (http://localhost:8082) ⭐ NEW
- [ ] VITE_API_URL detected
- [ ] VITE_API_KEY detected
- [ ] VITE_FEATURE_FLAG_ANALYTICS detected
- [ ] VITE_FEATURE_FLAG_DARK_MODE detected
- [ ] VITE_APP_VERSION detected
- [ ] VITE_ENVIRONMENT detected
- [ ] VITE_MAX_UPLOAD_SIZE detected
- [ ] VITE_STRIPE_PUBLIC_KEY detected
- [ ] VITE_GOOGLE_ANALYTICS_ID detected
- [ ] VITE_SENTRY_DSN detected
- [ ] Total: 10 variables
- [ ] Filter by "Vite" works

### Angular Demo (http://localhost:8083) ⭐ NEW
- [ ] apiUrl detected
- [ ] apiKey detected
- [ ] production detected
- [ ] appVersion detected
- [ ] environmentName detected
- [ ] maxUploadSize detected
- [ ] stripePublicKey detected
- [ ] googleAnalyticsId detected
- [ ] sentryDsn detected
- [ ] Total: 9 variables (environment object properties)
- [ ] Variables show actual values from environment.ts

### Multicloud Demo (http://localhost:5184) 🔐 SECRETS
- [ ] VITE_AWS_ACCESS_KEY_ID detected
- [ ] VITE_AWS_SECRET_ACCESS_KEY detected
- [ ] VITE_AZURE_CLIENT_ID detected
- [ ] VITE_GOOGLE_API_KEY detected
- [ ] **Secrets warning banner appears**
- [ ] Click "🔐 Secrets" filter shows detected credentials
- [ ] Warning banner is animated (pulse effect)

### Payment APIs Demo (http://localhost:5185) 🔐 SECRETS
- [ ] VITE_STRIPE_SECRET_KEY detected
- [ ] VITE_PAYPAL_CLIENT_ID detected
- [ ] VITE_SQUARE_ACCESS_TOKEN detected
- [ ] VITE_TWILIO_ACCOUNT_SID detected
- [ ] **Secrets warning banner appears**
- [ ] Click "🔐 Secrets" filter shows detected credentials

---

## 🎯 Feature Testing

### General Features to Test on Any URL:
- [ ] Extension icon appears in Chrome toolbar
- [ ] Click icon opens popup window (500x600px)
- [ ] **NEW v3.4: Extension icon (48x48) appears in header**
- [ ] Gradient header displays "EnvVars"
- [ ] Refresh button (🔄) works
- [ ] **NEW v3.4: Two tabs visible** - "📋 Variables" and "🔍 Script Search"
- [ ] **NEW v3.4: Variables tab is active by default**
- [ ] Search box filters variables in real-time
- [ ] Filter buttons highlight when active
- [ ] Filter buttons are compact (smaller font size)
- [ ] Filter text is shorter (e.g., "REACT_APP" not "REACT_APP_*")
- [ ] Clicking filter twice deactivates it
- [ ] Long variable names show ellipsis (no wrapping)
- [ ] **NEW v3.2: Source icons appear** (📦📜🪟⚠️) instead of text
- [ ] **NEW v3.2: Hover over icons shows source popover** with full details
- [ ] **NEW v3.2: Popover has dark background** with white text
- [ ] **NEW v3.3: Copy icon (📋) next to each value**
- [ ] **NEW v3.3: Secrets show full values** (no truncation)
- [ ] Variable values are displayed correctly
- [ ] Scrolling works smoothly for long lists
- [ ] **NEW v3.4: No false positive "name" / "value" detection**

### Secret Detection Features:
- [ ] 🔐 Secrets button has warning color (yellow/orange)
- [ ] Clicking secrets filter shows only detected credentials
- [ ] Warning banner appears when secrets detected
- [ ] Banner text: "⚠️ Hardcoded secrets detected! These should never be in frontend code."
- [ ] No warning banner when no secrets present

### Export Features:
- [ ] "Copy All" button copies all variables to clipboard
- [ ] "Export JSON" button downloads JSON file
- [ ] JSON format is valid and parseable
- [ ] JSON includes all detected variables with metadata

### Copy & Export Features (NEW in v3.3.0):
- [ ] **Copy icon (📋) appears** next to each variable value
- [ ] Copy icon is semi-transparent until hover
- [ ] Clicking copy icon copies that specific value
- [ ] Icon changes to ✓ briefly after successful copy
- [ ] **"Export .env" button** appears in footer (orange)
- [ ] Export .env creates downloadable .env file
- [ ] .env file format is KEY=value (one per line)
- [ ] Values with spaces are automatically quoted
- [ ] Special characters are properly escaped
- [ ] File downloads as ".env" (no extension issue)

### Script Search Features (NEW in v3.4.0 - Tab-Based):
- [ ] **NEW v3.4: "🔍 Script Search" tab appears** in tab navigation
- [ ] **NEW v3.4: Clicking tab switches to search interface**
- [ ] **NEW v3.4: Tab button highlights when active**
- [ ] **NEW v3.4: Search input is prominent** (not collapsible)
- [ ] Panel shows "Loading page scripts..." when first opened
- [ ] Panel loads and shows count (e.g., "Loaded 5 script(s)")
- [ ] Search input field appears in tab
- [ ] Typing search term (2+ chars) triggers search
- [ ] Results show file name (📄 icon)
- [ ] Results show match count per file
- [ ] Results show line numbers for each match
- [ ] Search term is highlighted with yellow background
- [ ] Long lines are truncated with "..."
- [ ] Context shown around matches
- [ ] Multiple files with matches are grouped separately
- [ ] "No matches found" message for no results
- [ ] Searches both inline and external scripts
- [ ] Results update as you type (live search)
- [ ] **NEW v3.4: Switching between tabs preserves search results**

---

## 🐛 Bug Testing

Test for these potential issues:

### UI Issues:
- [ ] No horizontal scrolling in popup
- [ ] All text is readable (no overflow)
- [ ] Buttons are clickable (no overlapping)
- [ ] No console errors in DevTools
- [ ] Extension works in incognito mode

### Detection Issues:
- [ ] No false positive NODE_ENV detection (fixed in v3.1)
- [ ] Minified code is properly parsed
- [ ] Quoted and unquoted keys both work
- [ ] Mixed quote styles (single/double) handled
- [ ] Very long values don't break layout

### Edge Cases:
- [ ] Works on pages with no JavaScript
- [ ] Works on pages with many scripts
- [ ] Handles invalid/malformed JSON
- [ ] Doesn't crash on huge variable values
- [ ] Refreshing page updates results

---

## 📸 Screenshot Locations (v3.4.0)

For Chrome Web Store listing, capture these updated screenshots:

1. **Main Interface with Tabs**: http://localhost:4173 (Vite demo showing new tab navigation)
2. **Script Search Tab**: http://localhost:3002 (React with search tab active and results)
3. **Secrets Warning**: http://localhost:5184 (Multicloud with banner and icons)
4. **Framework Filters (Compact)**: http://localhost:8081 (Vue with filter buttons)
5. **Copy & Export Features**: http://localhost:8082 (Svelte with copy buttons and export options)
6. **React Detection**: http://localhost:3002 (React with all 9 vars and icons)
7. **Secret Filter View**: http://localhost:5185 (Payment APIs, secrets filter active)
8. **Header with Icon**: http://localhost:8083 (Angular - showing header icon)

### Screenshot Guidelines:
- Show the **new tab navigation** (📋 Variables / 🔍 Script Search)
- Capture **both tabs** in separate screenshots
- Show **header with extension icon**
- Highlight **clean tab-based layout**
- Show **icon popovers** (📦📜🪟⚠️) prominently
- Capture **script search in dedicated tab**
- Ensure all **new UI improvements** are visible

---

## 🔄 Container Management

### Start All Containers:
```bash
cd test-apps
docker compose up -d
```

### Stop All Containers:
```bash
docker compose down
```

### Restart Specific Container:
```bash
docker compose restart vue-demo-prod
```

### View Logs:
```bash
docker compose logs -f vue-demo-prod
```

### Rebuild After Code Changes:
```bash
docker compose up -d --build
```

---

## ✅ Quick Test Script

Run this to test all production URLs quickly:

```bash
# Test all production endpoints
for url in \
  http://localhost:3002 \
  http://localhost:4173 \
  http://localhost:3004 \
  http://localhost:8081 \
  http://localhost:8082 \
  http://localhost:8083 \
  http://localhost:5184 \
  http://localhost:5185; do
  echo "Testing $url"
  curl -sI "$url" | grep "HTTP"
done
```

Expected output: All should return `HTTP/1.1 200 OK`

---

## 🎉 Ready for Release!

Once all tests pass:

1. ✅ All containers running
2. ✅ All URLs accessible
3. ✅ Extension detects variables correctly
4. ✅ No console errors
5. ✅ Screenshots captured
6. ✅ Chrome Web Store documentation ready
7. ✅ Privacy policy accessible
8. ✅ GitHub issues link working

**Next Steps:**
1. Load unpacked extension in Chrome
2. Test on all production URLs above
3. Capture 8 screenshots for Chrome Web Store
4. Review and upload CHROME_WEB_STORE.md content
5. Submit for review! 🚀

---

**Last Updated**: 2026-01-13
**Version**: 3.4.0
**Total Test URLs**: 16 (8 prod + 8 dev)
**Frameworks Covered**: 8 (React, Vite, Next.js, Vue, Svelte, Angular, Multicloud, Payment APIs)
**New Features in v3.4.0**: Tab-based navigation, Header icon, Fixed false positives
**Previous Features**: Individual copy buttons, .env export, Icon popovers, Script search
