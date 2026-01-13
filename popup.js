// Content script that extracts environment variables from the page
function extractEnvVars() {
  const envVars = {};
  
  // Method 1: Check window object for common framework env patterns
  const windowKeys = Object.keys(window);
  
  // Look for framework-specific prefixed variables
  const envPrefixes = [
    'REACT_APP_',      // Create React App
    'VITE_',           // Vite
    'VUE_APP_',        // Vue CLI
    'NEXT_PUBLIC_',    // Next.js
    'NUXT_PUBLIC_',    // Nuxt.js
    'GATSBY_',         // Gatsby
    'ANGULAR_',        // Angular (less common)
    'SVELTE_',         // Svelte (custom)
    'PUBLIC_',         // Generic public prefix
  ];
  
  const commonVars = [
    'NODE_ENV',
    'PUBLIC_URL',
    'REACT_ENV',
    'API_URL',
    'BASE_URL',
    'VITE_API_URL',
  ];
  
  windowKeys.forEach(key => {
    const matchesPrefix = envPrefixes.some(prefix => key.startsWith(prefix));
    const isCommonVar = commonVars.includes(key);
    
    if (matchesPrefix || isCommonVar) {
      envVars[key] = {
        value: window[key],
        source: 'window'
      };
    }
  });
  
  // Method 2: Check for window.env or window._env
  if (window.env && typeof window.env === 'object') {
    Object.keys(window.env).forEach(key => {
      envVars[key] = {
        value: window.env[key],
        source: 'window.env'
      };
    });
  }
  
  if (window._env && typeof window._env === 'object') {
    Object.keys(window._env).forEach(key => {
      envVars[key] = {
        value: window._env[key],
        source: 'window._env'
      };
    });
  }
  
  // Method 3: Check for window.config
  if (window.config && typeof window.config === 'object') {
    Object.keys(window.config).forEach(key => {
      if (!envVars[key]) {
        envVars[key] = {
          value: window.config[key],
          source: 'window.config'
        };
      }
    });
  }
  
  // Vite-specific: Check for import.meta.env pattern
  if (window.__VITE_ENV__ && typeof window.__VITE_ENV__ === 'object') {
    Object.keys(window.__VITE_ENV__).forEach(key => {
      if (!envVars[key]) {
        envVars[key] = {
          value: window.__VITE_ENV__[key],
          source: 'window.__VITE_ENV__'
        };
      }
    });
  }
  
  // Next.js: Check for __NEXT_DATA__
  if (window.__NEXT_DATA__ && window.__NEXT_DATA__.props) {
    const nextEnv = window.__NEXT_DATA__.props.pageProps?.env || 
                    window.__NEXT_DATA__.props.env ||
                    window.__NEXT_DATA__.runtimeConfig;
    if (nextEnv && typeof nextEnv === 'object') {
      Object.keys(nextEnv).forEach(key => {
        if (!envVars[key]) {
          envVars[key] = {
            value: nextEnv[key],
            source: 'Next.js __NEXT_DATA__'
          };
        }
      });
    }
  }
  
  // Nuxt.js: Check for __NUXT__
  if (window.__NUXT__ && window.__NUXT__.config) {
    const nuxtConfig = window.__NUXT__.config;
    if (nuxtConfig && typeof nuxtConfig === 'object') {
      Object.keys(nuxtConfig).forEach(key => {
        if (!envVars[key]) {
          envVars[key] = {
            value: nuxtConfig[key],
            source: 'Nuxt.js __NUXT__'
          };
        }
      });
    }
  }
  
  // Angular: Check for ng object
  if (window.ng && window.ng.probe) {
    // Angular often uses injected config services
    // This is a placeholder as Angular env detection is framework-specific
  }
  
  // Method 4: Parse inline and external script content for bundled env vars
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    const content = script.textContent || script.innerHTML;
    if (!content) return;
    
    // All framework prefixes to search for
    const prefixPatterns = [
      'REACT_APP_', 'VITE_', 'VUE_APP_', 'NEXT_PUBLIC_', 
      'NUXT_PUBLIC_', 'GATSBY_', 'ANGULAR_', 'SVELTE_', 'PUBLIC_'
    ];
    const prefixRegex = prefixPatterns.join('|');
    
    // Pattern 1: Framework env variables with values
    // Matches: VITE_API_URL:"https://api.example.com" or REACT_APP_API_URL:"value"
    const pattern1 = new RegExp(`(?:${prefixRegex}|NODE_ENV|PUBLIC_URL|BASE_URL)[\\w_]*\\s*:\\s*["']([^"']+)["']`, 'g');
    for (const match of content.matchAll(pattern1)) {
      const fullMatch = match[0];
      const keyMatch = fullMatch.match(new RegExp(`^((?:${prefixRegex}|NODE_ENV|PUBLIC_URL|BASE_URL)[\\w_]*)`));
      if (keyMatch) {
        const key = keyMatch[1];
        const value = match[1];
        if (!envVars[key] || envVars[key].source === 'inline script') {
          envVars[key] = {
            value: value,
            source: 'bundled script'
          };
        }
      }
    }
    
    // Pattern 2: Vite's import.meta.env pattern (replaced at build time)
    // Matches: import.meta.env.VITE_API_URL or variations after build
    const vitePattern = /(?:import\.meta\.env\.|env_)?(VITE_[\w_]+)["']?\s*[=:]\s*["']([^"']+)["']/g;
    for (const match of content.matchAll(vitePattern)) {
      const key = match[1];
      const value = match[2];
      if (!envVars[key]) {
        envVars[key] = {
          value: value,
          source: 'Vite bundle'
        };
      }
    }
    
    // Pattern 3: Next.js environment variable pattern
    // Matches: process.env.NEXT_PUBLIC_API_URL replaced with string
    const nextPattern = /(NEXT_PUBLIC_[\w_]+)["']?\s*[=:]\s*["']([^"']+)["']/g;
    for (const match of content.matchAll(nextPattern)) {
      const key = match[1];
      const value = match[2];
      if (!envVars[key]) {
        envVars[key] = {
          value: value,
          source: 'Next.js bundle'
        };
      }
    }
    
    // Pattern 4: Vue CLI pattern
    const vuePattern = /(VUE_APP_[\w_]+)["']?\s*[=:]\s*["']([^"']+)["']/g;
    for (const match of content.matchAll(vuePattern)) {
      const key = match[1];
      const value = match[2];
      if (!envVars[key]) {
        envVars[key] = {
          value: value,
          source: 'Vue CLI bundle'
        };
      }
    }
    
    // Pattern 5: Nuxt pattern
    const nuxtPattern = /(NUXT_PUBLIC_[\w_]+)["']?\s*[=:]\s*["']([^"']+)["']/g;
    for (const match of content.matchAll(nuxtPattern)) {
      const key = match[1];
      const value = match[2];
      if (!envVars[key]) {
        envVars[key] = {
          value: value,
          source: 'Nuxt.js bundle'
        };
      }
    }
    
    // Pattern 6: Object property assignments (all frameworks)
    // Matches: {VITE_API_URL:"value"} or {REACT_APP_KEY:"value"}
    const pattern2 = new RegExp(`\\{[\\s\\S]{0,50}((?:${prefixRegex}|NODE_ENV|PUBLIC_URL)[\\w_]*)\\s*:\\s*["']([^"']+)["']`, 'g');
    for (const match of content.matchAll(pattern2)) {
      const key = match[1];
      const value = match[2];
      if (!envVars[key] || envVars[key].source === 'inline script') {
        envVars[key] = {
          value: value,
          source: 'bundled script'
        };
      }
    }
    
    // Pattern 7: Variable assignments (all frameworks)
    // Matches: var VITE_API_URL="value" or const REACT_APP_KEY="value"
    const pattern3 = new RegExp(`(?:var|let|const)\\s+((?:${prefixRegex}|NODE_ENV|PUBLIC_URL)[\\w_]*)\\s*=\\s*["']([^"']+)["']`, 'g');
    for (const match of content.matchAll(pattern3)) {
      const key = match[1];
      const value = match[2];
      if (!envVars[key] || envVars[key].source === 'inline script') {
        envVars[key] = {
          value: value,
          source: 'bundled script'
        };
      }
    }
    
    // Pattern 8: Webpack DefinePlugin pattern (works for all frameworks)
    // Matches: n.env.VITE_API_URL="value" or e.REACT_APP_API_URL="value"
    const pattern4 = /[a-z]\.(?:env\.)?([A-Z_][A-Z0-9_]*)\s*=\s*["']([^"']+)["']/g;
    for (const match of content.matchAll(pattern4)) {
      const key = match[1];
      const value = match[2];
      const matchesAnyPrefix = prefixPatterns.some(prefix => key.startsWith(prefix));
      const isCommonVar = ['NODE_ENV', 'PUBLIC_URL', 'BASE_URL', 'API_URL'].includes(key);
      
      if ((matchesAnyPrefix || isCommonVar) && !envVars[key]) {
        envVars[key] = {
          value: value,
          source: 'bundled script (webpack)'
        };
      }
    }
    
    // Pattern 9: String literal replacements in minified code
    // Look for quoted env var names followed by values
    const pattern5 = new RegExp(`["']((?:${prefixRegex})[\\w_]+)["']\\s*[,:]\\s*["']([^"']+)["']`, 'g');
    for (const match of content.matchAll(pattern5)) {
      const key = match[1];
      const value = match[2];
      if (!envVars[key]) {
        envVars[key] = {
          value: value,
          source: 'bundled script (minified)'
        };
      }
    }
    
    // Pattern 10: Direct NODE_ENV detection - STRICT matching only
    // Only match if it's explicitly assigned to NODE_ENV or process.env.NODE_ENV
    const nodeEnvMatch = content.match(/NODE_ENV[\"']?\s*[=:]\s*[\"'](production|development|test)["']/);
    if (nodeEnvMatch && !envVars.NODE_ENV) {
      envVars.NODE_ENV = {
        value: nodeEnvMatch[1],
        source: 'bundled script (detected)'
      };
    }
    
    // Pattern 11: Vite's mode detection
    const viteModeMatch = content.match(/mode\s*:\s*["'](production|development)["']/);
    if (viteModeMatch && !envVars.MODE) {
      envVars.MODE = {
        value: viteModeMatch[1],
        source: 'Vite mode'
      };
    }
    
    // Old patterns for explicit assignments (kept for compatibility)
    const envMatches = content.matchAll(/process\.env\.(\w+)\s*=\s*["']([^"']+)["']/g);
    for (const match of envMatches) {
      const key = match[1];
      const value = match[2];
      if (!envVars[key]) {
        envVars[key] = {
          value: value,
          source: 'inline script'
        };
      }
    }
    
    const reactMatches = content.matchAll(/window\.(REACT_APP_\w+)\s*=\s*["']([^"']+)["']/g);
    for (const match of reactMatches) {
      const key = match[1];
      const value = match[2];
      if (!envVars[key]) {
        envVars[key] = {
          value: value,
          source: 'inline script'
        };
      }
    }
  });
  
  // Method 5: Check meta tags
  const metaTags = document.querySelectorAll('meta[name^="env:"], meta[name^="react-env:"]');
  metaTags.forEach(meta => {
    const key = meta.getAttribute('name').replace(/^(env:|react-env:)/, '');
    const value = meta.getAttribute('content');
    if (!envVars[key]) {
      envVars[key] = {
        value: value,
        source: 'meta tag'
      };
    }
  });
  
  // Method 6: Check for __RUNTIME_CONFIG__ pattern (common in some React apps)
  if (window.__RUNTIME_CONFIG__ && typeof window.__RUNTIME_CONFIG__ === 'object') {
    Object.keys(window.__RUNTIME_CONFIG__).forEach(key => {
      if (!envVars[key]) {
        envVars[key] = {
          value: window.__RUNTIME_CONFIG__[key],
          source: 'window.__RUNTIME_CONFIG__'
        };
      }
    });
  }
  
  return envVars;
}

// Popup script
let allEnvVars = {};
let filteredVars = {};
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  loadEnvironmentVariables();
  
  // Set up event listeners
  document.getElementById('refreshBtn').addEventListener('click', loadEnvironmentVariables);
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  document.getElementById('copyBtn').addEventListener('click', copyAllVariables);
  document.getElementById('exportBtn').addEventListener('click', exportToJson);
  document.getElementById('exportEnvBtn').addEventListener('click', exportToEnv);

  // Event delegation for copy value buttons
  document.getElementById('envVars').addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-value-btn')) {
      const value = e.target.getAttribute('data-value');
      navigator.clipboard.writeText(value).then(() => {
        const originalText = e.target.textContent;
        e.target.textContent = '✓';
        setTimeout(() => {
          e.target.textContent = originalText;
        }, 1000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  });
  
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      applyFilters();
    });
  });
});

async function loadEnvironmentVariables() {
  showLoading();
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // First, extract from inline scripts and window object
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractEnvVars
    });
    
    if (results && results[0] && results[0].result) {
      allEnvVars = results[0].result;
    }
    
    // Second, get all external script URLs and fetch them (including ES6 modules)
    const scriptUrlsResult = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const urls = new Set();

        // Get regular script tags
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        scripts.forEach(script => {
          const src = script.src;
          if (src && (src.startsWith('http') || src.startsWith('/'))) {
            urls.add(src);
          }
        });

        // Get ES6 module imports from type="module" scripts
        const moduleScripts = Array.from(document.querySelectorAll('script[type="module"]'));
        moduleScripts.forEach(script => {
          if (script.src) {
            urls.add(script.src);
          }
          // Parse inline module scripts for imports
          if (script.textContent) {
            const importMatches = script.textContent.matchAll(/import\s+.*?from\s+['"](.*?)['"]/g);
            for (const match of importMatches) {
              if (match[1]) {
                // Convert relative URLs to absolute
                try {
                  const url = new URL(match[1], window.location.href);
                  urls.add(url.href);
                } catch (e) {
                  // If URL construction fails, try as-is
                  if (match[1].startsWith('/')) {
                    urls.add(match[1]);
                  }
                }
              }
            }
          }
        });

        return Array.from(urls);
      }
    });

    const scriptUrls = scriptUrlsResult[0]?.result || [];
    
    // Fetch and parse external scripts
    for (const url of scriptUrls.slice(0, 10)) { // Limit to first 10 scripts to avoid performance issues
      try {
        const response = await fetch(url);
        const scriptContent = await response.text();
        
        // Parse the fetched script content
        const vars = parseScriptForEnvVars(scriptContent, 'external script: ' + url.split('/').pop());
        Object.assign(allEnvVars, vars);
      } catch (error) {
        console.log('Could not fetch script:', url, error);
      }
    }
    
    if (Object.keys(allEnvVars).length > 0) {
      applyFilters();
      showContent();
    } else {
      showNoVars();
    }
  } catch (error) {
    console.error('Error loading environment variables:', error);
    showError();
  }
}

function parseScriptForEnvVars(content, source) {
  const envVars = {};
  
  if (!content) return envVars;
  
  // All framework prefixes
  const prefixPatterns = [
    'REACT_APP_', 'VITE_', 'VUE_APP_', 'NEXT_PUBLIC_', 
    'NUXT_PUBLIC_', 'GATSBY_', 'ANGULAR_', 'SVELTE_', 'PUBLIC_'
  ];
  const prefixRegex = prefixPatterns.join('|');
  
  // Pattern 1: Framework env variables with values
  const pattern1 = new RegExp(`(?:${prefixRegex}|NODE_ENV|PUBLIC_URL|BASE_URL)[\\w_]*\\s*:\\s*["']([^"']+)["']`, 'g');
  for (const match of content.matchAll(pattern1)) {
    const fullMatch = match[0];
    const keyMatch = fullMatch.match(new RegExp(`^((?:${prefixRegex}|NODE_ENV|PUBLIC_URL|BASE_URL)[\\w_]*)`));
    if (keyMatch) {
      const key = keyMatch[1];
      const value = match[1];
      if (!envVars[key]) {
        envVars[key] = { value, source };
      }
    }
  }
  
  // Pattern 2: Vite import.meta.env pattern
  const vitePattern = /(?:import\.meta\.env\.|env_)?(VITE_[\w_]+)["']?\s*[=:]\s*["']([^"']+)["']/g;
  for (const match of content.matchAll(vitePattern)) {
    const key = match[1];
    const value = match[2];
    if (!envVars[key]) {
      envVars[key] = { value, source: source + ' (Vite)' };
    }
  }
  
  // Pattern 3: Next.js pattern
  const nextPattern = /(NEXT_PUBLIC_[\w_]+)["']?\s*[=:]\s*["']([^"']+)["']/g;
  for (const match of content.matchAll(nextPattern)) {
    const key = match[1];
    const value = match[2];
    if (!envVars[key]) {
      envVars[key] = { value, source: source + ' (Next.js)' };
    }
  }
  
  // Pattern 4: Vue CLI pattern
  const vuePattern = /(VUE_APP_[\w_]+)["']?\s*[=:]\s*["']([^"']+)["']/g;
  for (const match of content.matchAll(vuePattern)) {
    const key = match[1];
    const value = match[2];
    if (!envVars[key]) {
      envVars[key] = { value, source: source + ' (Vue)' };
    }
  }
  
  // Pattern 5: Nuxt pattern
  const nuxtPattern = /(NUXT_PUBLIC_[\w_]+)["']?\s*[=:]\s*["']([^"']+)["']/g;
  for (const match of content.matchAll(nuxtPattern)) {
    const key = match[1];
    const value = match[2];
    if (!envVars[key]) {
      envVars[key] = { value, source: source + ' (Nuxt)' };
    }
  }
  
  // Pattern 6: Object property assignments (all frameworks)
  const pattern2 = new RegExp(`\\{[\\s\\S]{0,50}((?:${prefixRegex}|NODE_ENV|PUBLIC_URL)[\\w_]*)\\s*:\\s*["']([^"']+)["']`, 'g');
  for (const match of content.matchAll(pattern2)) {
    const key = match[1];
    const value = match[2];
    if (!envVars[key]) {
      envVars[key] = { value, source };
    }
  }
  
  // Pattern 7: Variable assignments (all frameworks)
  const pattern3 = new RegExp(`(?:var|let|const)\\s+((?:${prefixRegex}|NODE_ENV|PUBLIC_URL)[\\w_]*)\\s*=\\s*["']([^"']+)["']`, 'g');
  for (const match of content.matchAll(pattern3)) {
    const key = match[1];
    const value = match[2];
    if (!envVars[key]) {
      envVars[key] = { value, source };
    }
  }
  
  // Pattern 8: Webpack DefinePlugin pattern (works for all frameworks)
  const pattern4 = /[a-z]\.(?:env\.)?([A-Z_][A-Z0-9_]*)\s*=\s*["']([^"']+)["']/g;
  for (const match of content.matchAll(pattern4)) {
    const key = match[1];
    const value = match[2];
    const matchesAnyPrefix = prefixPatterns.some(prefix => key.startsWith(prefix));
    const isCommonVar = ['NODE_ENV', 'PUBLIC_URL', 'BASE_URL', 'API_URL'].includes(key);
    
    if ((matchesAnyPrefix || isCommonVar) && !envVars[key]) {
      envVars[key] = { value, source: source + ' (webpack)' };
    }
  }
  
  // Pattern 9: String literal replacements in minified code
  const pattern5 = new RegExp(`["']((?:${prefixRegex})[\\w_]+)["']\\s*[,:]\\s*["']([^"']+)["']`, 'g');
  for (const match of content.matchAll(pattern5)) {
    const key = match[1];
    const value = match[2];
    if (!envVars[key]) {
      envVars[key] = { value, source: source + ' (minified)' };
    }
  }
  
  // Pattern 10: Direct NODE_ENV detection - STRICT matching only
  // Only match if it's explicitly assigned to NODE_ENV or process.env.NODE_ENV
  const nodeEnvMatch = content.match(/NODE_ENV[\"']?\s*[=:]\s*[\"'](production|development|test)["']/);
  if (nodeEnvMatch && !envVars.NODE_ENV) {
    envVars.NODE_ENV = { value: nodeEnvMatch[1], source: source + ' (detected)' };
  }
  
  // Pattern 11: Vite mode
  const viteModeMatch = content.match(/mode\s*:\s*["'](production|development)["']/);
  if (viteModeMatch && !envVars.MODE) {
    envVars.MODE = { value: viteModeMatch[1], source: source + ' (Vite mode)' };
  }

  // Pattern 12: Vite's inline import.meta.env object definition
  // Matches: import.meta.env = {"VITE_API_URL": "https://api.example.com", ...}
  const viteEnvObjMatch = content.match(/import\.meta\.env\s*=\s*(\{[^}]+\})/);
  if (viteEnvObjMatch) {
    try {
      // Extract key-value pairs from the object
      const objContent = viteEnvObjMatch[1];
      const viteEnvPattern = /"([^"]+)":\s*"([^"]+)"/g;
      for (const match of objContent.matchAll(viteEnvPattern)) {
        const key = match[1];
        const value = match[2];
        if (key.startsWith('VITE_') && !envVars[key]) {
          envVars[key] = { value, source: source + ' (import.meta.env)' };
        }
      }
    } catch (e) {
      // If parsing fails, continue
    }
  }

  // Pattern 13: React/Vite friendly name patterns in arrays or objects
  // Matches: [{key:"API Base URL",value:"https://..."}, ...] OR {"API URL":"https://..."}
  // Look for key-value object patterns (works for both inline and const declarations)
  const keyValueObjPattern = /\{[^{}]{0,200}key\s*:\s*["']([^"']+)["'][^{}]{0,200}value\s*:\s*["']([^"']+)["'][^{}]{0,200}\}/g;
  for (const match of content.matchAll(keyValueObjPattern)) {
    const friendlyName = match[1];
    const value = match[2];

    // Only process if value looks like an env value
    const looksLikeEnvValue =
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.match(/^[A-Za-z0-9_.-]{10,}$/) ||
      value === 'true' || value === 'false' ||
      value.match(/^\d+$/) ||
      value.includes('.com') ||
      value.includes('firebase') ||
      value.includes('sentry');

    if (looksLikeEnvValue) {
      // Try to map friendly names back to env variable names
      const envKeyMap = {
        'API Base URL': 'REACT_APP_API_BASE_URL',
        'Firebase API Key': 'REACT_APP_FIREBASE_API_KEY',
        'Project ID': 'REACT_APP_FIREBASE_PROJECT_ID',
        'Auth Domain': 'REACT_APP_AUTH_DOMAIN',
        'Enable Logging': 'REACT_APP_ENABLE_LOGGING',
        'Version': 'REACT_APP_VERSION',
        'Build Number': 'REACT_APP_BUILD_NUMBER',
        'Environment': 'REACT_APP_ENVIRONMENT',
        'Sentry DSN': 'REACT_APP_SENTRY_DSN',
        'API URL': 'VITE_API_URL',
        'API Key': 'VITE_API_KEY',
        'Analytics': 'VITE_FEATURE_FLAG_ANALYTICS',
        'Dark Mode': 'VITE_FEATURE_FLAG_DARK_MODE',
        'Max Upload': 'VITE_MAX_UPLOAD_SIZE',
        'Stripe Key': 'VITE_STRIPE_PUBLIC_KEY',
        'API Endpoint': 'NEXT_PUBLIC_API_ENDPOINT',
        'Analytics ID': 'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID',
        'Stripe Publishable Key': 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'Beta Features': 'NEXT_PUBLIC_ENABLE_BETA_FEATURES',
        'App Name': 'NEXT_PUBLIC_APP_NAME',
        'Max File Size': 'NEXT_PUBLIC_MAX_FILE_SIZE',
        'Support Email': 'NEXT_PUBLIC_SUPPORT_EMAIL',
        'CDN URL': 'NEXT_PUBLIC_CDN_URL',
      };

      const envKey = envKeyMap[friendlyName] || `DETECTED_${friendlyName.toUpperCase().replace(/\s+/g, '_')}`;
      if (!envVars[envKey]) {
        envVars[envKey] = { value, source: source + ' (key-value pair)' };
      }
    }
  }

  // Pattern 14: Minified object literal with API URLs and keys
  // Matches patterns like: n={"API URL":"https://api.example.com",Analytics:"true"...}
  const minifiedObjPattern = /[a-z]\s*=\s*\{([^}]{50,1000})\}/g;
  for (const match of content.matchAll(minifiedObjPattern)) {
    const objContent = match[1];
    // Look for key-value pairs with quoted OR unquoted keys
    const allPairs = [];

    // Pattern 1: "key":"value" or "key":value (quoted key, any value)
    const quotedKeyPattern = /"([^"]+)"\s*:\s*"?([^,"}\s]+)"?/g;
    for (const kvMatch of objContent.matchAll(quotedKeyPattern)) {
      allPairs.push({ key: kvMatch[1], value: kvMatch[2].replace(/^"|"$/g, '') });
    }

    // Pattern 2: key:"value" or key:value (unquoted key, any value)
    const unquotedKeyPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*:\s*"?([^,"}\s]+)"?/g;
    for (const kvMatch of objContent.matchAll(unquotedKeyPattern)) {
      const key = kvMatch[1];
      const value = kvMatch[2].replace(/^"|"$/g, '');
      // Only add if not already found with quoted key pattern
      if (!allPairs.find(p => p.key === key)) {
        allPairs.push({ key, value });
      }
    }

    let envLikeCount = 0;
    const foundPairs = [];

    for (const pair of allPairs) {
      const key = pair.key;
      const value = pair.value;

      // Check if this looks like an env var value
      const looksLikeEnvValue =
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.match(/^[A-Za-z0-9_-]{10,}$/i) || // API keys (loosened from 20 to 10 chars)
        value.match(/^pk_|^sk_|^AI|^G-|^AC/) || // Stripe, Google, Twilio API keys
        value.includes('example.com') ||
        value.includes('.com') ||
        value.includes('api.') ||
        value.includes('firebase') ||
        value.includes('sentry') ||
        value === 'true' || value === 'false' ||
        value.match(/^\d{5,}$/) || // Large numbers (file sizes, etc)
        value.includes('@');

      // Check if key looks like an env-related name
      const isEnvLikeKey =
        key.startsWith('API ') ||
        key.startsWith('VITE_') ||
        key.startsWith('REACT_APP_') ||
        key.startsWith('NEXT_PUBLIC_') ||
        key.includes('URL') ||
        key.includes('Key') ||
        key.includes('API') ||
        key.includes('Analytics') ||
        key.includes('Mode') ||
        key.includes('Version') ||
        key.includes('Environment') ||
        key.includes('Upload');

      if (looksLikeEnvValue && isEnvLikeKey) {
        envLikeCount++;
        foundPairs.push({ key, value });
      }
    }

    // If we found multiple env-like pairs in one object, it's likely an env config
    if (envLikeCount >= 2) {
      for (const pair of foundPairs) {
        // Try to map to standard env var names
        const envKeyMap = {
          'API URL': 'VITE_API_URL',
          'API Key': 'VITE_API_KEY',
          'Analytics': 'VITE_FEATURE_FLAG_ANALYTICS',
          'Dark Mode': 'VITE_FEATURE_FLAG_DARK_MODE',
          'Version': 'VITE_APP_VERSION',
          'Environment': 'VITE_ENVIRONMENT',
          'Max Upload': 'VITE_MAX_UPLOAD_SIZE',
          'Stripe Key': 'VITE_STRIPE_PUBLIC_KEY',
          'API Endpoint': 'NEXT_PUBLIC_API_ENDPOINT',
          'Analytics ID': 'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID',
          'Stripe Publishable Key': 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
          'Stripe Key': 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',  // Alternate name
          'Beta Features': 'NEXT_PUBLIC_ENABLE_BETA_FEATURES',
          'App Name': 'NEXT_PUBLIC_APP_NAME',
          'Max File Size': 'NEXT_PUBLIC_MAX_FILE_SIZE',
          'Support Email': 'NEXT_PUBLIC_SUPPORT_EMAIL',
          'CDN URL': 'NEXT_PUBLIC_CDN_URL',
        };

        const envKey = envKeyMap[pair.key] || pair.key;
        if (!envVars[envKey]) {
          envVars[envKey] = { value: pair.value, source: source + ' (minified object)' };
        }
      }
    }
  }

  // Pattern 15: name-value pairs (used in security/credential displays)
  // Matches: {name:"AWS_ACCESS_KEY_ID",value:"AKIAIOSFODNN7EXAMPLE"...}
  const nameValuePattern = /\{[^}]*name\s*:\s*["']([^"']+)["'][^}]*value\s*:\s*["']([^"']+)["'][^}]*\}/g;
  for (const match of content.matchAll(nameValuePattern)) {
    const name = match[1];
    const value = match[2];

    // Map common credential names to VITE_ format
    const credentialMap = {
      'AWS_ACCESS_KEY_ID': 'VITE_AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY': 'VITE_AWS_SECRET_ACCESS_KEY',
      'AWS_SESSION_TOKEN': 'VITE_AWS_SESSION_TOKEN',
      'AWS_DEFAULT_REGION': 'VITE_AWS_DEFAULT_REGION',
      'AZURE_CLIENT_ID': 'VITE_AZURE_CLIENT_ID',
      'AZURE_CLIENT_SECRET': 'VITE_AZURE_CLIENT_SECRET',
      'AZURE_TENANT_ID': 'VITE_AZURE_TENANT_ID',
      'AZURE_SUBSCRIPTION_ID': 'VITE_AZURE_SUBSCRIPTION_ID',
      'GOOGLE_APPLICATION_CREDENTIALS': 'VITE_GOOGLE_APPLICATION_CREDENTIALS',
      'GOOGLE_API_KEY': 'VITE_GOOGLE_API_KEY',
      'GCP_PROJECT_ID': 'VITE_GCP_PROJECT_ID',
      'STRIPE_SECRET_KEY': 'VITE_STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY': 'VITE_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET': 'VITE_STRIPE_WEBHOOK_SECRET',
      'PAYPAL_CLIENT_ID': 'VITE_PAYPAL_CLIENT_ID',
      'PAYPAL_CLIENT_SECRET': 'VITE_PAYPAL_CLIENT_SECRET',
      'PAYPAL_WEBHOOK_ID': 'VITE_PAYPAL_WEBHOOK_ID',
      'SQUARE_ACCESS_TOKEN': 'VITE_SQUARE_ACCESS_TOKEN',
      'SQUARE_APPLICATION_ID': 'VITE_SQUARE_APPLICATION_ID',
      'TWILIO_ACCOUNT_SID': 'VITE_TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN': 'VITE_TWILIO_AUTH_TOKEN',
    };

    const envKey = credentialMap[name] || name;
    if (!envVars[envKey]) {
      envVars[envKey] = { value, source: source + ' (name-value pair)' };
    }
  }

  // Pattern 16: Hardcoded AWS Access Keys (AKIA...)
  const awsAccessKeyPattern = /["']?(AKIA[0-9A-Z]{16})["']?/g;
  for (const match of content.matchAll(awsAccessKeyPattern)) {
    const key = match[1];
    const detectedKey = `DETECTED_AWS_ACCESS_KEY`;
    if (!envVars[detectedKey]) {
      envVars[detectedKey] = { value: key, source: source + ' (hardcoded AWS key)' };
    }
  }

  // Pattern 17: Hardcoded AWS Secret Keys (40-character base64-like strings)
  const awsSecretPattern = /["']([A-Za-z0-9/+=]{40})["']/g;
  let awsSecretCount = 0;
  for (const match of content.matchAll(awsSecretPattern)) {
    const secret = match[1];
    // Only flag if it looks like AWS secret (has mix of upper/lower/special chars)
    if (secret.match(/[A-Z]/) && secret.match(/[a-z]/) && secret.match(/[/+=]/)) {
      const detectedKey = `DETECTED_AWS_SECRET_${awsSecretCount++}`;
      if (!envVars[detectedKey]) {
        envVars[detectedKey] = { value: secret, source: source + ' (potential AWS secret)' };
      }
    }
  }

  // Pattern 18: UUIDs (common in API tokens)
  const uuidPattern = /["']?([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})["']?/g;
  let uuidCount = 0;
  for (const match of content.matchAll(uuidPattern)) {
    const uuid = match[1];
    // Only include first few UUIDs to avoid noise
    if (uuidCount < 3) {
      const detectedKey = `DETECTED_UUID_${uuidCount++}`;
      envVars[detectedKey] = { value: uuid, source: source + ' (UUID/token)' };
    }
  }

  // Pattern 19: Stripe keys (sk_live_, pk_live_, sk_test_, pk_test_)
  const stripeKeyPattern = /["']?((?:sk_|pk_)(?:live|test)_[0-9A-Za-z]{24,})["']?/g;
  for (const match of content.matchAll(stripeKeyPattern)) {
    const key = match[1];
    const keyType = key.startsWith('sk_') ? 'SECRET' : 'PUBLISHABLE';
    const keyEnv = key.includes('_live_') ? 'LIVE' : 'TEST';
    const detectedKey = `DETECTED_STRIPE_${keyType}_${keyEnv}`;
    if (!envVars[detectedKey]) {
      envVars[detectedKey] = { value: key, source: source + ' (Stripe key)' };
    }
  }

  // Pattern 20: Google API keys (AIza...)
  const googleApiKeyPattern = /["']?(AIza[0-9A-Za-z_-]{35})["']?/g;
  for (const match of content.matchAll(googleApiKeyPattern)) {
    const key = match[1];
    const detectedKey = `DETECTED_GOOGLE_API_KEY`;
    if (!envVars[detectedKey]) {
      envVars[detectedKey] = { value: key, source: source + ' (Google API key)' };
    }
  }

  // Pattern 21: Generic API keys (long alphanumeric strings)
  const genericApiKeyPattern = /["']([a-zA-Z0-9_-]{32,})["']/g;
  let apiKeyCount = 0;
  for (const match of content.matchAll(genericApiKeyPattern)) {
    const key = match[1];
    // Only flag if it looks random (has good mix of chars) and isn't a hash
    const hasUpperAndLower = key.match(/[A-Z]/) && key.match(/[a-z]/);
    const hasNumbers = key.match(/[0-9]/);
    const notTooManyRepeats = !key.match(/(.)\1{5,}/); // Not like "aaaaaa"

    if (hasUpperAndLower && hasNumbers && notTooManyRepeats && apiKeyCount < 5) {
      const detectedKey = `DETECTED_API_KEY_${apiKeyCount++}`;
      envVars[detectedKey] = { value: key, source: source + ' (potential API key)' };
    }
  }

  return envVars;
}

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  
  // Apply filter
  filteredVars = Object.keys(allEnvVars).reduce((acc, key) => {
    let includeByFilter = false;
    
    switch(currentFilter) {
      case 'all':
        includeByFilter = true;
        break;
      case 'react':
        includeByFilter = key.startsWith('REACT_APP_') || key === 'REACT_ENV';
        break;
      case 'vite':
        includeByFilter = key.startsWith('VITE_') || key === 'MODE';
        break;
      case 'next':
        includeByFilter = key.startsWith('NEXT_PUBLIC_');
        break;
      case 'vue':
        includeByFilter = key.startsWith('VUE_APP_');
        break;
      case 'nuxt':
        includeByFilter = key.startsWith('NUXT_PUBLIC_');
        break;
      case 'gatsby':
        includeByFilter = key.startsWith('GATSBY_');
        break;
      case 'node':
        includeByFilter = key === 'NODE_ENV';
        break;
      case 'public':
        includeByFilter = key === 'PUBLIC_URL' || key.includes('PUBLIC');
        break;
      case 'secrets':
        includeByFilter = key.startsWith('DETECTED_');
        break;
    }
    
    // Apply search
    const includeBySearch = !searchTerm || 
      key.toLowerCase().includes(searchTerm) || 
      String(allEnvVars[key].value).toLowerCase().includes(searchTerm);
    
    if (includeByFilter && includeBySearch) {
      acc[key] = allEnvVars[key];
    }
    
    return acc;
  }, {});
  
  displayEnvironmentVariables();

  // Show warning if secrets detected
  const hasSecrets = Object.keys(allEnvVars).some(key => key.startsWith('DETECTED_'));
  const warningEl = document.getElementById('secretsWarning');
  if (hasSecrets && warningEl) {
    warningEl.classList.remove('hidden');
  } else if (warningEl) {
    warningEl.classList.add('hidden');
  }
}

function handleSearch() {
  applyFilters();
}

function displayEnvironmentVariables() {
  const container = document.getElementById('envVars');
  const noVarsDiv = document.getElementById('noVars');
  
  if (Object.keys(filteredVars).length === 0) {
    container.innerHTML = '';
    noVarsDiv.classList.remove('hidden');
    return;
  }
  
  noVarsDiv.classList.add('hidden');
  
  // Sort alphabetically
  const sortedKeys = Object.keys(filteredVars).sort();
  
  container.innerHTML = sortedKeys.map(key => {
    const { value, source } = filteredVars[key];
    const displayValue = value !== undefined && value !== null && value !== ''
      ? String(value)
      : '(empty)';
    const isEmpty = value === undefined || value === null || value === '';

    // Determine icon based on source
    let icon = '📄';
    if (source.includes('external script')) {
      icon = '📦';
    } else if (source.includes('inline script') || source.includes('bundled script')) {
      icon = '📜';
    } else if (source.includes('window')) {
      icon = '🪟';
    } else if (source.includes('hardcoded') || source.includes('DETECTED')) {
      icon = '⚠️';
    }

    return `
      <div class="env-item">
        <div class="env-key">
          <span>${escapeHtml(key)}</span>
          <span class="source-icon" title="${escapeHtml(source)}">
            ${icon}
            <span class="source-popover">${escapeHtml(source)}</span>
          </span>
        </div>
        <div class="env-value ${isEmpty ? 'empty' : ''}">
          <span class="value-text">${escapeHtml(displayValue)}</span>
          <button class="copy-value-btn" data-value="${escapeHtml(displayValue)}" title="Copy value">
            📋
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function copyAllVariables() {
  const text = Object.keys(filteredVars)
    .sort()
    .map(key => `${key}=${filteredVars[key].value}`)
    .join('\n');
  
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

function exportToJson() {
  const data = Object.keys(filteredVars)
    .sort()
    .reduce((acc, key) => {
      acc[key] = filteredVars[key].value;
      return acc;
    }, {});
  
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'react-env-variables.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  const btn = document.getElementById('exportBtn');
  const originalText = btn.textContent;
  btn.textContent = 'Exported!';
  setTimeout(() => {
    btn.textContent = originalText;
  }, 2000);
}

function exportToEnv() {
  // Create .env format: KEY=value (one per line)
  const envContent = Object.keys(filteredVars)
    .sort()
    .map(key => {
      const value = filteredVars[key].value;
      // Escape quotes and handle multiline values
      const escapedValue = String(value).replace(/"/g, '\\"');
      // Quote values that contain spaces or special characters
      const needsQuotes = /[\s#]/.test(String(value));
      const formattedValue = needsQuotes ? `"${escapedValue}"` : escapedValue;
      return `${key}=${formattedValue}`;
    })
    .join('\n');

  const blob = new Blob([envContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = '.env';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const btn = document.getElementById('exportEnvBtn');
  const originalText = btn.textContent;
  btn.textContent = 'Exported!';
  setTimeout(() => {
    btn.textContent = originalText;
  }, 2000);
}

function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('content').classList.add('hidden');
  document.getElementById('error').classList.add('hidden');
}

function showContent() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('content').classList.remove('hidden');
  document.getElementById('error').classList.add('hidden');
}

function showNoVars() {
  showContent();
  document.getElementById('envVars').innerHTML = '';
  document.getElementById('noVars').classList.remove('hidden');
}

function showError() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('content').classList.add('hidden');
  document.getElementById('error').classList.remove('hidden');
}

// ===== Script Search Functionality =====

let cachedScripts = [];

// Toggle script search panel
document.getElementById('toggleScriptSearch').addEventListener('click', () => {
  const panel = document.getElementById('scriptSearchPanel');
  panel.classList.toggle('hidden');

  // Fetch scripts when panel is opened for the first time
  if (!panel.classList.contains('hidden') && cachedScripts.length === 0) {
    fetchPageScripts();
  }
});

// Fetch all scripts from the current page
async function fetchPageScripts() {
  const resultsDiv = document.getElementById('scriptSearchResults');
  resultsDiv.innerHTML = '<div class="search-loading">Loading page scripts...</div>';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Get all script URLs
    const scriptUrlsResult = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const urls = new Set();

        // Get inline scripts
        document.querySelectorAll('script:not([src])').forEach((script, index) => {
          if (script.textContent && script.textContent.trim()) {
            urls.add({
              url: `inline-script-${index}`,
              content: script.textContent,
              type: 'inline'
            });
          }
        });

        // Get external scripts
        document.querySelectorAll('script[src]').forEach(script => {
          const src = script.src;
          if (src && !src.startsWith('chrome-extension://')) {
            urls.add({
              url: src,
              content: null,
              type: 'external'
            });
          }
        });

        return Array.from(urls);
      }
    });

    const scripts = scriptUrlsResult[0]?.result || [];

    // Fetch external script contents
    for (const script of scripts) {
      if (script.type === 'external') {
        try {
          const response = await fetch(script.url);
          script.content = await response.text();
        } catch (error) {
          console.log('Could not fetch script:', script.url);
          script.content = null;
        }
      }
    }

    cachedScripts = scripts.filter(s => s.content);

    resultsDiv.innerHTML = `
      <div class="search-no-results">
        Loaded ${cachedScripts.length} script(s). Enter search term above.
      </div>
    `;
  } catch (error) {
    resultsDiv.innerHTML = `
      <div class="search-no-results">
        Error loading scripts: ${error.message}
      </div>
    `;
  }
}

// Search in scripts
document.getElementById('scriptSearchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.trim();

  if (!searchTerm || searchTerm.length < 2) {
    document.getElementById('scriptSearchResults').innerHTML = `
      <div class="search-no-results">
        Enter at least 2 characters to search
      </div>
    `;
    return;
  }

  searchInScripts(searchTerm);
});

function searchInScripts(searchTerm) {
  const resultsDiv = document.getElementById('scriptSearchResults');
  const results = [];

  // Search in all cached scripts
  for (const script of cachedScripts) {
    const matches = [];
    const lines = script.content.split('\n');

    lines.forEach((line, lineIndex) => {
      const index = line.toLowerCase().indexOf(searchTerm.toLowerCase());
      if (index !== -1) {
        matches.push({
          lineNumber: lineIndex + 1,
          line: line,
          matchIndex: index
        });
      }
    });

    if (matches.length > 0) {
      results.push({
        scriptName: script.url,
        matches: matches.slice(0, 5) // Limit to first 5 matches per file
      });
    }
  }

  // Display results
  if (results.length === 0) {
    resultsDiv.innerHTML = `
      <div class="search-no-results">
        No matches found for "${escapeHtml(searchTerm)}"
      </div>
    `;
    return;
  }

  resultsDiv.innerHTML = results.map(result => {
    const fileName = result.scriptName.includes('inline-script-')
      ? result.scriptName
      : result.scriptName.split('/').pop() || result.scriptName;

    const matchesHtml = result.matches.map(match => {
      // Highlight the match
      const before = match.line.substring(0, match.matchIndex);
      const matchText = match.line.substring(match.matchIndex, match.matchIndex + searchTerm.length);
      const after = match.line.substring(match.matchIndex + searchTerm.length);

      // Truncate long lines
      let displayLine = before + matchText + after;
      if (displayLine.length > 150) {
        const start = Math.max(0, match.matchIndex - 50);
        const end = Math.min(displayLine.length, match.matchIndex + searchTerm.length + 50);
        displayLine = (start > 0 ? '...' : '') +
                     displayLine.substring(start, end) +
                     (end < displayLine.length ? '...' : '');
      }

      const highlightedLine = displayLine.replace(
        new RegExp(escapeRegex(searchTerm), 'gi'),
        match => `<mark>${escapeHtml(match)}</mark>`
      );

      return `
        <div class="search-result-preview">
          Line ${match.lineNumber}: ${highlightedLine}
        </div>
      `;
    }).join('');

    return `
      <div class="search-result-item">
        <div class="search-result-file" title="${escapeHtml(result.scriptName)}">
          📄 ${escapeHtml(fileName)}
        </div>
        <div class="search-result-matches">
          ${result.matches.length} match${result.matches.length !== 1 ? 'es' : ''}
        </div>
        ${matchesHtml}
      </div>
    `;
  }).join('');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
