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

  // Next.js: Deep scan __NEXT_DATA__ for environment variables
  if (window.__NEXT_DATA__) {
    const nextData = window.__NEXT_DATA__;

    // Helper to recursively scan objects for env-like keys
    function scanNextDataForEnv(obj, path, depth) {
      if (!obj || typeof obj !== 'object' || depth > 6) return;
      try {
        const keys = Object.keys(obj);
        for (const key of keys) {
          const value = obj[key];
          // Direct match: key starts with NEXT_PUBLIC_
          if (typeof key === 'string' && key.startsWith('NEXT_PUBLIC_') && value !== undefined && value !== null) {
            if (!envVars[key]) {
              envVars[key] = {
                value: String(value),
                source: 'Next.js __NEXT_DATA__ (' + path + ')'
              };
            }
          }
          // Recurse into nested objects/arrays
          if (value && typeof value === 'object') {
            scanNextDataForEnv(value, path + '.' + key, depth + 1);
          }
        }
      } catch (e) { /* skip inaccessible properties */ }
    }

    // Scan specific known locations first
    const knownPaths = [
      nextData.props?.pageProps?.env,
      nextData.props?.pageProps,
      nextData.props?.env,
      nextData.props,
      nextData.runtimeConfig,
      nextData.runtimeConfig?.publicRuntimeConfig,
      nextData.runtimeConfig?.serverRuntimeConfig,
      nextData.query,
    ];
    for (const obj of knownPaths) {
      if (obj && typeof obj === 'object') {
        scanNextDataForEnv(obj, '__NEXT_DATA__', 0);
      }
    }

    // Full recursive scan of the entire __NEXT_DATA__ tree
    scanNextDataForEnv(nextData, '__NEXT_DATA__', 0);
  }

  // Next.js App Router: Parse RSC flight data from self.__next_f.push() scripts
  const allScriptTags = document.querySelectorAll('script');
  allScriptTags.forEach(script => {
    const content = script.textContent || '';
    if (content.includes('self.__next_f.push')) {
      // Extract flight data strings
      const flightMatches = content.matchAll(/self\.__next_f\.push\(\[\d+,"((?:[^"\\]|\\.)*)"\]\)/g);
      for (const fm of flightMatches) {
        try {
          const flightData = fm[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
          // Look for NEXT_PUBLIC_ references in flight data
          const envInFlight = flightData.matchAll(/(NEXT_PUBLIC_[\w_]+)["']?\s*[=:]\s*["']([^"'\\]+)["']/g);
          for (const em of envInFlight) {
            if (!envVars[em[1]]) {
              envVars[em[1]] = { value: em[2], source: 'Next.js RSC flight data' };
            }
          }
          // Also look for key-value JSON patterns in flight data
          const jsonInFlight = flightData.matchAll(/"(NEXT_PUBLIC_[\w_]+)"\s*:\s*"([^"\\]+)"/g);
          for (const jm of jsonInFlight) {
            if (!envVars[jm[1]]) {
              envVars[jm[1]] = { value: jm[2], source: 'Next.js RSC flight data' };
            }
          }
        } catch (e) { /* skip malformed flight data */ }
      }
    }
  });

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
    try {
      const components = document.querySelectorAll('[ng-version]');
      components.forEach(component => {
        const debugElement = window.ng.probe(component);
        if (debugElement && debugElement.componentInstance) {
          const instance = debugElement.componentInstance;
          if (instance.envVars && typeof instance.envVars === 'object') {
            Object.keys(instance.envVars).forEach(key => {
              if (!envVars[key]) {
                envVars[key] = {
                  value: instance.envVars[key],
                  source: 'Angular component'
                };
              }
            });
          }
          if (instance.environment && typeof instance.environment === 'object') {
            Object.keys(instance.environment).forEach(key => {
              if (!envVars[key]) {
                envVars[key] = {
                  value: instance.environment[key],
                  source: 'Angular environment'
                };
              }
            });
          }
        }
      });
    } catch (e) {
      // Angular debug mode might not be available in production
    }
  }

  // Angular: Check for common global environment object
  if (window.environment && typeof window.environment === 'object') {
    Object.keys(window.environment).forEach(key => {
      if (!envVars[key]) {
        envVars[key] = {
          value: window.environment[key],
          source: 'window.environment (Angular)'
        };
      }
    });
  }

  // Method 4: Parse inline and external script content for bundled env vars
  const scripts = document.querySelectorAll('script');

  const processScriptContent = (content) => {
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

    // Pattern 12: Angular environment object detection
    const angularEnvProps = [
      'production', 'apiUrl', 'apiKey', 'apiEndpoint', 'baseUrl', 'baseURL',
      'environmentName', 'environment', 'appVersion', 'version',
      'stripePublicKey', 'stripeKey', 'googleAnalyticsId', 'analyticsId',
      'sentryDsn', 'sentryUrl', 'firebaseConfig', 'awsConfig',
      'maxUploadSize', 'uploadLimit', 'featureFlags', 'features',
      'debugMode', 'enableLogging', 'logLevel'
    ];

    angularEnvProps.forEach(prop => {
      const angularPattern1 = new RegExp(`\\b${prop}\\s*:\\s*["']([^"']+)["']`, 'gi');
      const angularMatch1 = content.match(angularPattern1);
      if (angularMatch1 && !envVars[prop]) {
        const valueMatch = angularMatch1[0].match(/["']([^"']+)["']/);
        if (valueMatch) {
          envVars[prop] = {
            value: valueMatch[1],
            source: 'Angular bundle'
          };
        }
      }

      const angularPattern2 = new RegExp(`\\b${prop}\\s*:\\s*(!0|!1|true|false)\\b`, 'gi');
      const angularMatch2 = content.match(angularPattern2);
      if (angularMatch2 && !envVars[prop]) {
        const valueMatch = angularMatch2[0].match(/:\s*(!0|!1|true|false)/i);
        if (valueMatch) {
          let boolValue = valueMatch[1];
          if (boolValue === '!0' || boolValue === 'true') boolValue = 'true';
          if (boolValue === '!1' || boolValue === 'false') boolValue = 'false';
          envVars[prop] = {
            value: boolValue,
            source: 'Angular bundle'
          };
        }
      }

      const angularPattern3 = new RegExp(`\\b${prop}\\s*:\\s*(\\d+)\\b`, 'gi');
      const angularMatch3 = content.match(angularPattern3);
      if (angularMatch3 && !envVars[prop]) {
        const valueMatch = angularMatch3[0].match(/:\s*(\d+)/);
        if (valueMatch) {
          envVars[prop] = {
            value: valueMatch[1],
            source: 'Angular bundle'
          };
        }
      }
    });

    const envVarsObjectMatch = content.match(/envVars\s*=\s*\{([^}]{0,500})\}/);
    if (envVarsObjectMatch) {
      const objContent = envVarsObjectMatch[1];
      angularEnvProps.forEach(prop => {
        const propPattern = new RegExp(`${prop}\\s*:\\s*(?:["']([^"']+)["']|(!0|!1|true|false)|(\\d+))`, 'i');
        const propMatch = objContent.match(propPattern);
        if (propMatch && !envVars[prop]) {
          let value = propMatch[1] || propMatch[2] || propMatch[3];
          if (value === '!0' || value === 'true') value = 'true';
          if (value === '!1' || value === 'false') value = 'false';
          envVars[prop] = {
            value: value,
            source: 'Angular component envVars'
          };
        }
      });
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

    // Next.js: Decode inline source maps to find env var names and values.
    // Search for source maps directly in the script content
    const sourceMapPattern = /\/\/# sourceMappingURL=data:application\/json[^,]*;base64,([A-Za-z0-9+\/=]+)/g;
    for (const smMatch of content.matchAll(sourceMapPattern)) {
      try {
        const decoded = atob(smMatch[1]);
        let smJson;
        try { smJson = JSON.parse(decoded); } catch (e) { continue; }
        if (!smJson || !smJson.sourcesContent) continue;

        // Compiled code is everything before the source map
        const compiledCode = content.substring(0, smMatch.index);

        for (const origSrc of smJson.sourcesContent) {
          if (!origSrc || !origSrc.includes('NEXT_PUBLIC_')) continue;

          // Label pattern: 'Label': process.env.NEXT_PUBLIC_X
          const labelPat = /['"]([^'"]+)['"]\s*:\s*process\.env\.(NEXT_PUBLIC_[\w_]+)/g;
          for (const ref of origSrc.matchAll(labelPat)) {
            const label = ref[1];
            const envName = ref[2];
            if (envVars[envName] && envVars[envName].value !== '(detected in source)' && envVars[envName].value !== '(referenced)') continue;
            const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            try {
              const pat = new RegExp("['\"]" + escapedLabel + "['\"]\\s*:\\s*['\"]([^'\"]{1,500})['\"]");
              const m = compiledCode.match(pat);
              if (m && m[1]) {
                envVars[envName] = { value: m[1], source: 'inline script (Next.js)' };
              }
            } catch (e) { /* skip */ }
          }

          // Context matching: use surrounding text to find replacement values
          const contextPat = /(.{0,60})process\.env\.(NEXT_PUBLIC_[\w_]+)/g;
          for (const ref of origSrc.matchAll(contextPat)) {
            const envName = ref[2];
            if (envVars[envName] && envVars[envName].value !== '(detected in source)' && envVars[envName].value !== '(referenced)') continue;
            const before = ref[1].replace(/\s+$/, '');
            const anchor = before.slice(-25);
            if (anchor.length >= 3) {
              const escapedAnchor = anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              try {
                const pat = new RegExp(escapedAnchor + '\\s*["\']([^"\']{1,500})["\']');
                const m = compiledCode.match(pat);
                if (m && m[1]) {
                  envVars[envName] = { value: m[1], source: 'inline script (Next.js)' };
                }
              } catch (e) { /* skip */ }
            }
          }

          // Register remaining as detected
          const anyPat = /process\.env\.(NEXT_PUBLIC_[\w_]+)/g;
          for (const ref of origSrc.matchAll(anyPat)) {
            if (!envVars[ref[1]]) {
              envVars[ref[1]] = { value: '(detected in source)', source: 'inline script (Next.js source map)' };
            }
          }
        }
      } catch (e) { /* skip */ }
    }

    // Next.js: Find process.env.NEXT_PUBLIC_* references not yet replaced
    const procEnvMatches = content.matchAll(/process\.env\.(NEXT_PUBLIC_[\w_]+)/g);
    for (const match of procEnvMatches) {
      if (!envVars[match[1]]) {
        envVars[match[1]] = { value: '(referenced)', source: 'inline script (Next.js process.env ref)' };
      }
    }
  };

  // Process inline scripts immediately
  scripts.forEach(script => {
    if (!script.src) {
      const content = script.textContent || script.innerHTML;
      processScriptContent(content);
    }
  });

  // Fetch and process external scripts
  const externalScripts = Array.from(scripts).filter(s => s.src);
  externalScripts.forEach(script => {
    try {
      fetch(script.src)
        .then(response => response.text())
        .then(content => {
          processScriptContent(content);
        })
        .catch(err => {
          console.log('Could not fetch external script:', script.src, err);
        });
    } catch (err) {
      console.log('Error fetching script:', err);
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
let currentFrameworkFilter = '';

const THEME_STORAGE_KEY = 'envViewerTheme';

function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  const sunEl = document.querySelector('.theme-icon.theme-sun');
  const moonEl = document.querySelector('.theme-icon.theme-moon');
  if (sunEl && moonEl) {
    if (theme === 'dark') {
      sunEl.classList.add('hidden');
      moonEl.classList.remove('hidden');
    } else {
      sunEl.classList.remove('hidden');
      moonEl.classList.add('hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Load saved theme from local storage (persists reliably when popup closes)
  try {
    const { [THEME_STORAGE_KEY]: savedTheme } = await chrome.storage.local.get(THEME_STORAGE_KEY);
    const theme = savedTheme === 'dark' ? 'dark' : 'light';
    applyTheme(theme);
  } catch (_) {
    applyTheme('light');
  }

  document.getElementById('themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    // Fire-and-forget: write immediately so it persists even if user closes popup right after
    chrome.storage.local.set({ [THEME_STORAGE_KEY]: next }).catch(() => { });
  });

  loadEnvironmentVariables();

  // Set up event listeners
  document.getElementById('refreshBtn').addEventListener('click', loadEnvironmentVariables);
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  document.getElementById('copyBtn').addEventListener('click', copyAllVariables);
  document.getElementById('exportBtn').addEventListener('click', exportToJson);
  document.getElementById('exportEnvBtn').addEventListener('click', exportToEnv);

  // Event delegation for copy value buttons
  document.getElementById('envVars').addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-value-btn');
    if (!btn) return;
    const value = btn.getAttribute('data-value');
    navigator.clipboard.writeText(value).then(() => {
      const copyIcon = '<svg class="icon" focusable="false"><use href="#icon-copy"></use></svg>';
      const originalHtml = btn.innerHTML;
      btn.innerHTML = 'Copied';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = copyIcon;
        btn.classList.remove('copied');
      }, 1500);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentFilter = e.currentTarget.dataset.filter;
      currentFrameworkFilter = '';
      const frameworkSelect = document.getElementById('frameworkSelect');
      frameworkSelect.value = '';
      frameworkSelect.classList.remove('active');
      applyFilters();
    });
  });

  // Framework dropdown — selecting a framework clears button selection and highlights dropdown
  document.getElementById('frameworkSelect').addEventListener('change', (e) => {
    const select = e.target;
    currentFrameworkFilter = select.value || '';
    if (currentFrameworkFilter) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      currentFilter = '';
      select.classList.add('active');
    } else {
      currentFilter = 'all';
      document.querySelector('.filter-btn[data-filter="all"]')?.classList.add('active');
      select.classList.remove('active');
    }
    applyFilters();
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
        const baseUrl = window.location.origin;

        // Get regular script tags
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        scripts.forEach(script => {
          const src = script.src;
          if (src && !src.startsWith('chrome-extension://')) {
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
                try {
                  const url = new URL(match[1], window.location.href);
                  urls.add(url.href);
                } catch (e) {
                  if (match[1].startsWith('/')) {
                    urls.add(baseUrl + match[1]);
                  }
                }
              }
            }
          }
        });

        // Get preloaded/modulepreloaded scripts (Next.js, Vite, etc. use these)
        const preloadLinks = document.querySelectorAll(
          'link[rel="preload"][as="script"], link[rel="modulepreload"], link[rel="prefetch"][as="script"]'
        );
        preloadLinks.forEach(link => {
          const href = link.href;
          if (href && !href.startsWith('chrome-extension://')) {
            urls.add(href);
          }
        });

        // Next.js: Discover chunks from __BUILD_MANIFEST
        if (window.__BUILD_MANIFEST) {
          try {
            const manifest = window.__BUILD_MANIFEST;
            const chunkPaths = new Set();
            // Collect all chunk paths from all pages
            Object.keys(manifest).forEach(page => {
              const chunks = manifest[page];
              if (Array.isArray(chunks)) {
                chunks.forEach(chunk => chunkPaths.add(chunk));
              }
            });
            // Convert relative paths to full URLs
            chunkPaths.forEach(chunkPath => {
              // Next.js chunks are relative to /_next/
              const fullUrl = baseUrl + '/_next/' + chunkPath;
              urls.add(fullUrl);
            });
          } catch (e) { /* skip if manifest parsing fails */ }
        }

        // Next.js: Discover chunks from __BUILD_MANIFEST_CB (async chunks)
        if (window.__NEXT_DATA__?.buildId) {
          // Also check for common Next.js chunk patterns in existing script tags
          const nextScripts = document.querySelectorAll('script[src*="/_next/"]');
          nextScripts.forEach(script => {
            if (script.src) urls.add(script.src);
          });
        }

        return Array.from(urls);
      }
    });

    const scriptUrls = scriptUrlsResult[0]?.result || [];

    // Detect if this is a Next.js app (needs more chunks scanned)
    const isNextJs = scriptUrls.some(url => url.includes('/_next/'));
    const scriptLimit = isNextJs ? 50 : 20;

    // Fetch and parse external scripts in parallel batches for better performance
    const urlsToFetch = scriptUrls.slice(0, scriptLimit);
    const batchSize = 10;
    const fetchedScripts = []; // Track fetched scripts for external .map processing
    for (let i = 0; i < urlsToFetch.length; i += batchSize) {
      const batch = urlsToFetch.slice(i, i + batchSize);
      const fetchPromises = batch.map(async (url) => {
        try {
          const response = await fetch(url);
          const scriptContent = await response.text();
          return { url, content: scriptContent };
        } catch (error) {
          console.log('Could not fetch script:', url, error);
          return null;
        }
      });
      const results2 = await Promise.all(fetchPromises);
      for (const result of results2) {
        if (result && result.content) {
          fetchedScripts.push(result);
          const vars = parseScriptForEnvVars(result.content, 'external script: ' + result.url.split('/').pop());
          // Only add vars that are new or upgrade "(detected in source)" placeholders
          for (const [key, val] of Object.entries(vars)) {
            if (!allEnvVars[key] ||
              (allEnvVars[key].value === '(detected in source)' && val.value !== '(detected in source)') ||
              (allEnvVars[key].value === '(referenced)' && val.value !== '(referenced)' && val.value !== '(detected in source)')) {
              allEnvVars[key] = val;
            }
          }
        }
      }
    }

    // Next.js Production: Fetch external .map files to correlate env var names with values.
    if (isNextJs) {
      const mapUrls = [];
      for (const script of fetchedScripts) {
        // Check for explicit sourceMappingURL pointing to an external file
        const smUrlMatch = script.content.match(/\/\/# sourceMappingURL=([^\s]+\.map)\s*$/m);
        if (smUrlMatch && !smUrlMatch[1].startsWith('data:')) {
          try {
            const mapUrl = new URL(smUrlMatch[1], script.url).href;
            mapUrls.push({ mapUrl, scriptUrl: script.url, content: script.content });
          } catch (e) { /* skip invalid URL */ }
        } else if (script.url.includes('/_next/')) {
          // Speculatively try <script-url>.map for Next.js production scripts
          mapUrls.push({ mapUrl: script.url + '.map', scriptUrl: script.url, content: script.content });
        }
      }

      // Fetch .map files in parallel batches
      for (let i = 0; i < mapUrls.length; i += batchSize) {
        const mapBatch = mapUrls.slice(i, i + batchSize);
        const mapPromises = mapBatch.map(async (entry) => {
          try {
            const response = await fetch(entry.mapUrl);
            if (!response.ok) return null;
            const contentType = response.headers.get('content-type') || '';
            // Only parse JSON responses (avoid HTML error pages)
            if (contentType.includes('html')) return null;
            const mapText = await response.text();
            const mapJson = JSON.parse(mapText);
            return { ...entry, mapJson };
          } catch (e) {
            return null;
          }
        });
        const mapResults = await Promise.all(mapPromises);
        for (const mapResult of mapResults) {
          if (!mapResult || !mapResult.mapJson) continue;
          const smVars = processSourceMapForNextEnv(
            mapResult.content,
            mapResult.mapJson,
            'external script: ' + mapResult.scriptUrl.split('/').pop()
          );
          for (const [key, val] of Object.entries(smVars)) {
            if (!allEnvVars[key] ||
              (allEnvVars[key].value === '(detected in source)' && val.value !== '(detected in source)') ||
              (allEnvVars[key].value === '(referenced)' && val.value !== '(referenced)' && val.value !== '(detected in source)')) {
              allEnvVars[key] = val;
            }
          }
        }
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

  // Save original content before eval pre-processing (for per-eval Next.js detection)
  const originalContent = content;

  // Pre-process: Extract and unescape eval() strings so patterns can match their contents.
  // In Next.js/webpack dev mode, compiled code is wrapped in:
  //   eval("...escaped code...") OR eval(__webpack_require__.ts("...escaped code..."))
  // where quotes are escaped as \" and newlines as \n, preventing regex patterns from matching.
  if (content.includes('eval(')) {
    let extraContent = '';
    let searchPos = 0;
    while (searchPos < content.length) {
      // Find eval( then scan forward to find the first " or ' which starts the string
      const evalIdx = content.indexOf('eval(', searchPos);
      if (evalIdx === -1) break;
      // Scan forward from eval( to find the opening quote (skip wrapper functions like __webpack_require__.ts()
      let quotePos = evalIdx + 5;
      let quoteChar = '';
      while (quotePos < content.length && quotePos < evalIdx + 80) {
        if (content[quotePos] === '"' || content[quotePos] === "'") {
          quoteChar = content[quotePos];
          break;
        }
        quotePos++;
      }
      if (!quoteChar) { searchPos = evalIdx + 5; continue; }
      const codeStart = quotePos + 1;
      // Walk forward to find the unescaped closing quote
      let pos = codeStart;
      let isEscaped = false;
      while (pos < content.length) {
        if (isEscaped) { isEscaped = false; pos++; continue; }
        if (content[pos] === '\\') { isEscaped = true; pos++; continue; }
        if (content[pos] === quoteChar) break;
        pos++;
      }
      if (pos < content.length && pos > codeStart) {
        const rawEval = content.substring(codeStart, pos);
        // Only process eval strings that might contain env vars (skip tiny ones)
        if (rawEval.length > 100) {
          const unescaped = rawEval.replace(/\\(.)/g, function (_m, c) {
            switch (c) {
              case 'n': return '\n'; case 't': return '\t'; case 'r': return '\r';
              case '"': return '"'; case "'": return "'"; case '\\': return '\\';
              default: return c;
            }
          });
          extraContent += '\n' + unescaped;
        }
      }
      searchPos = pos + 1;
    }
    if (extraContent) {
      content = content + extraContent;
    }
  }

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

      // Blacklist common generic JavaScript properties that are never env vars
      const genericBlacklist = [
        'name', 'value', 'type', 'id', 'key', 'data', 'options', 'config',
        'params', 'props', 'state', 'index', 'length', 'size', 'count',
        'status', 'code', 'message', 'error', 'result', 'response', 'label',
        'title', 'text', 'description', 'className', 'style', 'children',
        'href', 'src', 'alt', 'placeholder', 'disabled', 'enabled', 'visible'
      ];

      // Also blacklist generic values
      const genericValues = [
        'value', 'name', 'type', 'id', 'key', 'data', 'text', 'label',
        'title', 'description', 'null', 'undefined', 'object', 'function'
      ];

      if (genericBlacklist.includes(key.toLowerCase()) ||
        genericValues.includes(value.toLowerCase())) {
        continue; // Skip generic property names and values
      }

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

  // Pattern 15b: Next.js - Process each eval("...") string independently.
  {
    let evalSearchPos = 0;
    while (evalSearchPos < originalContent.length) {
      // Find eval( - handles both eval("...") and eval(__webpack_require__.ts("..."))
      const evalIdx = originalContent.indexOf('eval(', evalSearchPos);
      if (evalIdx === -1) break;

      // Scan forward from eval( to find the opening quote (within 80 chars to skip wrapper fns)
      let quotePos = evalIdx + 5;
      let quoteChar = '';
      while (quotePos < originalContent.length && quotePos < evalIdx + 80) {
        if (originalContent[quotePos] === '"' || originalContent[quotePos] === "'") {
          quoteChar = originalContent[quotePos];
          break;
        }
        quotePos++;
      }
      if (!quoteChar) { evalSearchPos = evalIdx + 5; continue; }

      const codeStart = quotePos + 1;
      let pos = codeStart;
      let isEscaped = false;
      while (pos < originalContent.length) {
        if (isEscaped) { isEscaped = false; pos++; continue; }
        if (originalContent[pos] === '\\') { isEscaped = true; pos++; continue; }
        if (originalContent[pos] === quoteChar) break;
        pos++;
      }

      if (pos >= originalContent.length || pos <= codeStart) {
        evalSearchPos = pos + 1;
        continue;
      }

      const rawEval = originalContent.substring(codeStart, pos);
      evalSearchPos = pos + 1;
      if (rawEval.length < 200) continue;

      const unescaped = rawEval.replace(/\\(.)/g, function (_m, c) {
        switch (c) {
          case 'n': return '\n'; case 't': return '\t'; case 'r': return '\r';
          case '"': return '"'; case "'": return "'"; case '\\': return '\\';
          default: return c;
        }
      });

      const smMatch = unescaped.match(/\/\/# sourceMappingURL=data:application\/json[^,]*;base64,([A-Za-z0-9+\/=]+)/);
      if (!smMatch) continue;

      const compiledCode = unescaped.substring(0, smMatch.index);
      if (!compiledCode) continue;

      let sourceMapJson;
      try {
        const decoded = atob(smMatch[1]);
        sourceMapJson = JSON.parse(decoded);
      } catch (e) {
        continue;
      }

      if (!sourceMapJson || !sourceMapJson.sourcesContent) continue;

      const smResults = processSourceMapForNextEnv(compiledCode, sourceMapJson, source);
      for (const [key, val] of Object.entries(smResults)) {
        if (!envVars[key] ||
          (envVars[key].value === '(detected in source)' && val.value !== '(detected in source)') ||
          (envVars[key].value === '(referenced)' && val.value !== '(referenced)' && val.value !== '(detected in source)')) {
          envVars[key] = val;
        }
      }
    }
  }

  // Pattern 15b-fallback: Non-eval source maps (production builds, turbopack)
  {
    const smPattern = /\/\/# sourceMappingURL=data:application\/json[^,]*;base64,([A-Za-z0-9+\/=]+)/g;
    for (const match of content.matchAll(smPattern)) {
      try {
        const decoded = atob(match[1]);
        let smJson;
        try { smJson = JSON.parse(decoded); } catch (e) { continue; }
        if (!smJson || !smJson.sourcesContent) continue;

        const compiledCode = content.substring(Math.max(0, match.index - 200000), match.index);

        const smResults = processSourceMapForNextEnv(compiledCode, smJson, source);
        for (const [key, val] of Object.entries(smResults)) {
          if (!envVars[key] ||
            (envVars[key].value === '(detected in source)' && val.value !== '(detected in source)') ||
            (envVars[key].value === '(referenced)' && val.value !== '(referenced)' && val.value !== '(detected in source)')) {
            envVars[key] = val;
          }
        }
      } catch (e) { /* skip */ }
    }
  }

  // Pattern 15c: Next.js - process.env.NEXT_PUBLIC_* that wasn't replaced (edge cases)
  const processEnvNextPattern = /process\.env\.(NEXT_PUBLIC_[\w_]+)/g;
  for (const match of content.matchAll(processEnvNextPattern)) {
    const key = match[1];
    if (!envVars[key]) {
      envVars[key] = { value: '(referenced)', source: source + ' (Next.js process.env ref)' };
    }
  }

  // Pattern 15d: Next.js turbopack module format
  // Turbopack uses a different module wrapper: [id, {...}, function(module, exports, require) { ... }]
  const turbopackEnvPattern = /\["NEXT_PUBLIC_([\w_]+)"\]\s*[=:]\s*["']([^"']+)["']/g;
  for (const match of content.matchAll(turbopackEnvPattern)) {
    const key = 'NEXT_PUBLIC_' + match[1];
    const value = match[2];
    if (!envVars[key]) {
      envVars[key] = { value, source: source + ' (Next.js turbopack)' };
    }
  }

  // Pattern 15e: Next.js edge runtime / middleware env pattern
  // Matches: env:{"NEXT_PUBLIC_X":"value"} or "env":{...}
  const nextEnvObjPattern = /["']?env["']?\s*:\s*\{([^}]*NEXT_PUBLIC_[^}]+)\}/g;
  for (const match of content.matchAll(nextEnvObjPattern)) {
    const objContent = match[1];
    const kvPattern = /["']?(NEXT_PUBLIC_[\w_]+)["']?\s*:\s*["']([^"']+)["']/g;
    for (const kv of objContent.matchAll(kvPattern)) {
      if (!envVars[kv[1]]) {
        envVars[kv[1]] = { value: kv[2], source: source + ' (Next.js env object)' };
      }
    }
  }

  // Pattern 16: Access Keys starting with AKIA (common pattern)
  const accessKeyPattern = /["']?(AKIA[0-9A-Z]{16})["']?/g;
  for (const match of content.matchAll(accessKeyPattern)) {
    const key = match[1];
    const detectedKey = `ACCESS_KEY_ID`;
    if (!envVars[detectedKey]) {
      envVars[detectedKey] = { value: key, source: source + ' (hardcoded access key)' };
    }
  }

  // Pattern 17: Secret Keys (40-character base64-like strings)
  const secretKeyPattern = /["']([A-Za-z0-9/+=]{40})["']/g;
  let secretKeyCount = 0;
  for (const match of content.matchAll(secretKeyPattern)) {
    const secret = match[1];
    // Only flag if it looks like a secret key (has mix of upper/lower/special chars)
    if (secret.match(/[A-Z]/) && secret.match(/[a-z]/) && secret.match(/[/+=]/)) {
      const detectedKey = `SECRET_KEY${secretKeyCount > 0 ? '_' + secretKeyCount : ''}`;
      envVars[detectedKey] = { value: secret, source: source + ' (potential secret key)' };
      secretKeyCount++;
    }
  }

  // Pattern 18: UUIDs (common in API tokens)
  const uuidPattern = /["']?([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})["']?/g;
  let uuidCount = 0;
  for (const match of content.matchAll(uuidPattern)) {
    const uuid = match[1];
    // Only include first few UUIDs to avoid noise
    if (uuidCount < 3) {
      const detectedKey = `UUID_TOKEN${uuidCount > 0 ? '_' + uuidCount : ''}`;
      envVars[detectedKey] = { value: uuid, source: source + ' (UUID token)' };
      uuidCount++;
    }
  }

  // Pattern 19: Payment Keys (sk_*, pk_* patterns)
  const paymentKeyPattern = /["']?((?:sk_|pk_)(?:live|test)_[0-9A-Za-z]{24,})["']?/g;
  for (const match of content.matchAll(paymentKeyPattern)) {
    const key = match[1];
    const keyType = key.startsWith('sk_') ? 'SECRET' : 'PUBLIC';
    const keyEnv = key.includes('_live_') ? 'LIVE' : 'TEST';
    const detectedKey = `PAYMENT_${keyType}_${keyEnv}`;
    if (!envVars[detectedKey]) {
      envVars[detectedKey] = { value: key, source: source + ' (payment API key)' };
    }
  }

  // Pattern 20: API keys starting with AIza (common pattern)
  const aizaKeyPattern = /["']?(AIza[0-9A-Za-z_-]{35})["']?/g;
  for (const match of content.matchAll(aizaKeyPattern)) {
    const key = match[1];
    const detectedKey = `API_KEY_AIZA`;
    if (!envVars[detectedKey]) {
      envVars[detectedKey] = { value: key, source: source + ' (API key)' };
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
      const detectedKey = `API_KEY${apiKeyCount > 0 ? '_' + apiKeyCount : ''}`;
      envVars[detectedKey] = { value: key, source: source + ' (potential API key)' };
      apiKeyCount++;
    }
  }

  // Angular environment object detection
  const angularEnvProps = [
    'production', 'apiUrl', 'apiKey', 'apiEndpoint', 'baseUrl', 'baseURL',
    'environmentName', 'environment', 'appVersion', 'version',
    'stripePublicKey', 'stripeKey', 'googleAnalyticsId', 'analyticsId',
    'sentryDsn', 'sentryUrl', 'firebaseConfig', 'awsConfig',
    'maxUploadSize', 'uploadLimit', 'featureFlags', 'features',
    'debugMode', 'enableLogging', 'logLevel'
  ];

  angularEnvProps.forEach(prop => {
    const angularPattern1 = new RegExp(`\\b${prop}\\s*:\\s*["']([^"']+)["']`, 'gi');
    const angularMatch1 = content.match(angularPattern1);
    if (angularMatch1 && !envVars[prop]) {
      const valueMatch = angularMatch1[0].match(/["']([^"']+)["']/);
      if (valueMatch) {
        envVars[prop] = {
          value: valueMatch[1],
          source: source + ' (Angular)'
        };
      }
    }

    // Pattern for boolean values: production:!0 or production:true
    const angularPattern2 = new RegExp(`\\b${prop}\\s*:\\s*(!0|!1|true|false)\\b`, 'gi');
    const angularMatch2 = content.match(angularPattern2);
    if (angularMatch2 && !envVars[prop]) {
      const valueMatch = angularMatch2[0].match(/:\s*(!0|!1|true|false)/i);
      if (valueMatch) {
        let boolValue = valueMatch[1];
        if (boolValue === '!0' || boolValue.toLowerCase() === 'true') boolValue = 'true';
        if (boolValue === '!1' || boolValue.toLowerCase() === 'false') boolValue = 'false';
        envVars[prop] = {
          value: boolValue,
          source: source + ' (Angular)'
        };
      }
    }

    // Pattern for numeric values: maxUploadSize:41943040
    const angularPattern3 = new RegExp(`\\b${prop}\\s*:\\s*(\\d+)\\b`, 'gi');
    const angularMatch3 = content.match(angularPattern3);
    if (angularMatch3 && !envVars[prop]) {
      const valueMatch = angularMatch3[0].match(/:\s*(\d+)/);
      if (valueMatch) {
        envVars[prop] = {
          value: valueMatch[1],
          source: source + ' (Angular)'
        };
      }
    }
  });

  return envVars;
}


// Reusable helper: correlate env var names from source maps with compiled values.
function processSourceMapForNextEnv(compiledCode, sourceMapJson, source) {
  const envVars = {};
  if (!sourceMapJson || !sourceMapJson.sourcesContent) return envVars;

  for (const origSrc of sourceMapJson.sourcesContent) {
    if (!origSrc || !origSrc.includes('NEXT_PUBLIC_')) continue;

    // Strategy 1: Label pattern - 'Label': process.env.NEXT_PUBLIC_X
    const labelPat = /['"]([^'"]+)['"]\s*:\s*process\.env\.(NEXT_PUBLIC_[\w_]+)/g;
    for (const ref of origSrc.matchAll(labelPat)) {
      const label = ref[1];
      const envName = ref[2];
      if (envVars[envName] && envVars[envName].value !== '(detected in source)' && envVars[envName].value !== '(referenced)') continue;
      const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try {
        const pat = new RegExp("['\"]" + escapedLabel + "['\"]\\s*:\\s*['\"]([^'\"]{1,500})['\"]");
        const m = compiledCode.match(pat);
        if (m && m[1]) {
          envVars[envName] = { value: m[1], source: source + ' (Next.js)' };
        }
      } catch (e) { /* skip */ }
    }

    // Strategy 2: Variable assignment - const x = process.env.NEXT_PUBLIC_X
    const assignPat = /(?:const|let|var)\s+(\w+)\s*=\s*process\.env\.(NEXT_PUBLIC_[\w_]+)/g;
    for (const ref of origSrc.matchAll(assignPat)) {
      const varName = ref[1];
      const envName = ref[2];
      if (envVars[envName] && envVars[envName].value !== '(detected in source)' && envVars[envName].value !== '(referenced)') continue;
      const safeVar = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try {
        const pat = new RegExp('(?:const|let|var)?\\s*' + safeVar + '\\s*=\\s*["\']([^"\']{1,500})["\']');
        const m = compiledCode.match(pat);
        if (m && m[1]) {
          envVars[envName] = { value: m[1], source: source + ' (Next.js)' };
        }
      } catch (e) { /* skip */ }
    }

    // Strategy 3: Context matching - use surrounding text to find replacement values
    const contextPat = /(.{0,60})process\.env\.(NEXT_PUBLIC_[\w_]+)/g;
    for (const ref of origSrc.matchAll(contextPat)) {
      const envName = ref[2];
      if (envVars[envName] && envVars[envName].value !== '(detected in source)' && envVars[envName].value !== '(referenced)') continue;
      const before = ref[1].replace(/\s+$/, '');
      const anchor = before.slice(-25);
      if (anchor.length >= 3) {
        const escapedAnchor = anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        try {
          const pat = new RegExp(escapedAnchor + '\\s*["\']([^"\']{1,500})["\']');
          const m = compiledCode.match(pat);
          if (m && m[1]) {
            envVars[envName] = { value: m[1], source: source + ' (Next.js)' };
          }
        } catch (e) { /* skip */ }
      }
    }

    // Fallback: Register remaining as detected
    const anyPat = /process\.env\.(NEXT_PUBLIC_[\w_]+)/g;
    for (const ref of origSrc.matchAll(anyPat)) {
      if (!envVars[ref[1]]) {
        envVars[ref[1]] = { value: '(detected in source)', source: source + ' (Next.js source map)' };
      }
    }
  }
  return envVars;
}

function includeByFramework(key, framework) {
  if (!framework) return true;
  switch (framework) {
    case 'react': return key.startsWith('REACT_APP_') || key === 'REACT_ENV';
    case 'vite': return key.startsWith('VITE_') || key === 'MODE';
    case 'next': return key.startsWith('NEXT_PUBLIC_');
    case 'vue': return key.startsWith('VUE_APP_');
    case 'nuxt': return key.startsWith('NUXT_PUBLIC_');
    case 'gatsby': return key.startsWith('GATSBY_');
    default: return true;
  }
}

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();

  filteredVars = Object.keys(allEnvVars).reduce((acc, key) => {
    let includeByCategory = false;
    // If a framework is selected, filter only by framework (ignore All/Secrets/NODE_ENV)
    if (currentFrameworkFilter) {
      includeByCategory = includeByFramework(key, currentFrameworkFilter);
    } else {
      switch (currentFilter) {
        case 'all':
          includeByCategory = true;
          break;
        case 'secrets':
          includeByCategory = key.includes('SECRET') || key.includes('ACCESS_KEY') ||
            key.includes('UUID_TOKEN') || key.includes('PAYMENT_') ||
            key.includes('API_KEY');
          break;
        case 'node':
          includeByCategory = key === 'NODE_ENV';
          break;
        default:
          includeByCategory = true;
      }
    }

    const includeBySearch = !searchTerm ||
      key.toLowerCase().includes(searchTerm) ||
      String(allEnvVars[key].value).toLowerCase().includes(searchTerm);

    if (includeByCategory && includeBySearch) {
      acc[key] = allEnvVars[key];
    }
    return acc;
  }, {});

  displayEnvironmentVariables();

  // Show warning if secrets detected
  const hasSecrets = Object.keys(allEnvVars).some(key =>
    key.includes('SECRET') || key.includes('ACCESS_KEY') ||
    key.includes('UUID_TOKEN') || key.includes('PAYMENT_') ||
    key.includes('API_KEY')
  );
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

    return `
      <div class="env-item">
        <div class="env-key">
          <span>${escapeHtml(key)}</span>
        </div>
        <div class="env-value ${isEmpty ? 'empty' : ''}">
          <span class="value-text">${escapeHtml(displayValue)}</span>
          <button class="copy-value-btn" data-value="${escapeHtml(displayValue)}" title="Copy value" type="button">
            <svg class="icon" focusable="false"><use href="#icon-copy"></use></svg>
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

// ===== Tab Navigation =====

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');

    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Load scripts when switching to search tab for the first time
    if (tabName === 'search' && cachedScripts.length === 0) {
      fetchPageScripts();
    }
  });
});

// ===== Script Search Functionality =====

let cachedScripts = [];

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
          <svg class="icon" focusable="false"><use href="#icon-file"></use></svg>
          ${escapeHtml(fileName)}
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
