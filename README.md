# Environment Variable Viewer - Chrome Extension

A Chrome extension that detects and displays environment variables from popular frontend frameworks including React, Vite, Next.js, Vue, Nuxt, Gatsby, and more.

## Features

- 🔍 **Multi-Framework Support**: Detects environment variables from:
  - **React** (Create React App) - `REACT_APP_*`
  - **Vite** - `VITE_*`, `import.meta.env`
  - **Next.js** - `NEXT_PUBLIC_*`, `__NEXT_DATA__`
  - **Vue.js** (Vue CLI) - `VUE_APP_*`
  - **Nuxt.js** - `NUXT_PUBLIC_*`, `__NUXT__`
  - **Gatsby** - `GATSBY_*`
  - **Angular** - Custom patterns
  - **Svelte** - Custom patterns
  - **Generic** - `PUBLIC_*`, `NODE_ENV`, `BASE_URL`

- 📦 **Detection Methods**:
  - Bundled JavaScript files (production builds)
  - External JavaScript files
  - Inline scripts and minified code
  - `window` object variables
  - Framework-specific config objects (`__NEXT_DATA__`, `__NUXT__`, etc.)
  - `window.env`, `window._env`, `window.config`
  - Meta tags
  
- 🎯 **Smart Filtering**: Filter by framework (React, Vite, Next.js, Vue, etc.)
- 🔎 **Search Functionality**: Quickly find specific variables
- 📋 **Copy & Export**: Copy all variables or export as JSON
- 🎨 **Clean UI**: Modern, responsive interface
- 🔄 **Refresh**: Reload variables on demand

## Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download/Clone** this extension folder to your computer

2. **Open Chrome Extensions Page**:
   - Navigate to `chrome://extensions/`
   - Or click the three dots menu → More Tools → Extensions

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**:
   - Click "Load unpacked"
   - Select the `react-env-viewer` folder
   - The extension icon should appear in your toolbar

### Method 2: Pack and Install

1. In Chrome Extensions page with Developer mode enabled
2. Click "Pack extension"
3. Select the `react-env-viewer` folder as the extension root
4. Click "Pack Extension" to create a .crx file
5. Drag and drop the .crx file onto the Extensions page

## Usage

1. **Navigate** to any webpage with a React application
2. **Click** the extension icon in your Chrome toolbar
3. **View** all detected environment variables
4. **Filter** by category or search for specific variables
5. **Copy** variables to clipboard or export as JSON

## What It Detects

The extension looks for environment variable patterns from all major frontend frameworks:

### React (Create React App)
- **REACT_APP_*** - Environment variables (e.g., `REACT_APP_API_URL`)
- **NODE_ENV** - Development/production mode
- **PUBLIC_URL** - Public assets path

### Vite
- **VITE_*** - Vite environment variables (e.g., `VITE_API_URL`)
- **import.meta.env** - Vite's environment access pattern
- **MODE** - Build mode (development/production)

### Next.js
- **NEXT_PUBLIC_*** - Browser-exposed variables (e.g., `NEXT_PUBLIC_API_URL`)
- **__NEXT_DATA__** - Next.js page data with embedded config

### Vue.js (Vue CLI)
- **VUE_APP_*** - Vue environment variables (e.g., `VUE_APP_API_URL`)

### Nuxt.js
- **NUXT_PUBLIC_*** - Nuxt 3 public runtime config
- **__NUXT__** - Nuxt config object

### Gatsby
- **GATSBY_*** - Gatsby environment variables

### Generic Patterns
- **PUBLIC_*** - Generic public variables
- **NODE_ENV** - Node environment
- **BASE_URL** - Base URL configuration
- Custom config objects in `window.env`, `window._env`, `window.config`

## Example Variables

### React
```
REACT_APP_API_URL=https://api.example.com
REACT_APP_AUTH_DOMAIN=auth.example.com
NODE_ENV=production
PUBLIC_URL=/app
```

### Vite
```
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My Vite App
VITE_ENABLE_ANALYTICS=true
MODE=production
```

### Next.js
```
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_STRIPE_KEY=pk_live_abc123
```

### Vue.js
```
VUE_APP_API_URL=https://api.example.com
VUE_APP_TITLE=My Vue App
NODE_ENV=production
```

## Permissions

This extension requires:
- **activeTab**: To read environment variables from the current tab
- **scripting**: To inject content scripts that extract variables

## Privacy

- No data is collected or transmitted
- All processing happens locally in your browser
- Variables are only displayed to you and never shared

## Troubleshooting

### Understanding Build-time vs Runtime Variables

**Build-time variables** (most common in all frameworks):
- Environment variables are replaced by build tools (Webpack, Vite, Rollup) during compilation
- Example: `process.env.REACT_APP_API_URL` or `import.meta.env.VITE_API_URL` becomes `"https://api.example.com"` in the bundle
- This extension parses these bundled values!

**Runtime variables** (less common):
- Environment variables exposed on `window` object or in separate config files
- Loaded dynamically when the page loads

### No Variables Detected

If you're not seeing any variables, try these steps:

1. **Verify it's a supported framework**: 
   - React, Vite, Next.js, Vue, Nuxt, Gatsby, etc.
   - Check React DevTools, Vue DevTools, or browser extension indicators
   
2. **Open the bundle in DevTools**:
   - Press F12 → Sources tab
   - Look for files like `main.[hash].js`, `app.[hash].js`, or `chunk-[hash].js`
   - Search (Ctrl+F) for your framework prefix:
     - React: Search for `REACT_APP_`
     - Vite: Search for `VITE_` or `import.meta.env`
     - Next.js: Search for `NEXT_PUBLIC_` or `__NEXT_DATA__`
     - Vue: Search for `VUE_APP_`
   - If you can find them, the extension should detect them

3. **Manual verification in console**:
   ```javascript
   // Check for framework-specific patterns
   
   // React
   Object.keys(window).filter(k => k.startsWith('REACT_APP_'))
   
   // Vite
   Object.keys(window).filter(k => k.startsWith('VITE_'))
   
   // Next.js
   console.log(window.__NEXT_DATA__)
   
   // Vue/Nuxt
   console.log(window.__NUXT__)
   
   // Search all scripts
   Array.from(document.querySelectorAll('script')).forEach(script => {
     const patterns = ['REACT_APP_', 'VITE_', 'NEXT_PUBLIC_', 'VUE_APP_'];
     patterns.forEach(pattern => {
       if (script.textContent.includes(pattern)) {
         console.log(`Found ${pattern} in:`, script.src || 'inline');
       }
     });
   });
   ```

4. **Test with included test files**:
   - `test-page.html` - React runtime variables
   - `test-bundled.html` - React production build
   - `test-vite.html` - Vite application
   - `test-nextjs.html` - Next.js application
   - `test-vue.html` - Vue.js application

### Common Scenarios

**Scenario 1**: You see variables in the bundle but extension doesn't find them
- The variable names might be completely obfuscated
- Try looking for the actual values instead (URLs, API keys, etc.)

**Scenario 2**: You know your app has env vars but nothing appears
- Variables might be in a service worker or web worker
- Variables might be loaded from a separate config API call

**Scenario 3**: Only some variables are detected
- Some values might be identical to others and get deduplicated
- Some patterns in minified code might not match the regex patterns

## Development

### File Structure

```
react-env-viewer/
├── manifest.json       # Extension configuration
├── popup.html          # Extension popup UI
├── popup.css           # Popup styling
├── popup.js            # Main logic and content script
├── icon16.png          # 16x16 icon
├── icon48.png          # 48x48 icon
├── icon128.png         # 128x128 icon
└── README.md           # This file
```

### Making Changes

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Known Limitations

- Only detects variables that are exposed to the browser (not build-time only)
- Cannot access variables from iframes with different origins
- Some minified/obfuscated code may hide variable names

## Contributing

Feel free to submit issues or pull requests to improve the extension!

## License

MIT License - Feel free to use and modify as needed.

## Version History

- **2.0.0** (Multi-Framework Release)
  - 🎉 Added support for Vite, Next.js, Vue, Nuxt, Gatsby, and more
  - Added framework-specific detection patterns
  - New filters for different frameworks
  - Framework-specific test pages (Vite, Next.js, Vue)
  - Improved regex patterns for all build tools
  - Enhanced Next.js `__NEXT_DATA__` parsing
  - Added Nuxt.js `__NUXT__` config detection
  - Vite `import.meta.env` pattern recognition
  
- **1.1.0** (Bundle Parsing)
  - Added bundled JavaScript parsing for production builds
  - Detects variables replaced by Webpack DefinePlugin
  - Parses external script files
  - Multiple regex patterns for minified code detection
  - Added test-bundled.html for realistic testing
  
- **1.0.0** (Initial Release)
  - Basic React environment variable detection
  - Multiple detection methods
  - Filtering and search
  - Copy and export functionality
