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
    
    // Pattern 10: Direct NODE_ENV detection (all frameworks use this)
    const nodeEnvMatch = content.match(/["'](?:production|development|test)["']/);
    if (nodeEnvMatch && !envVars.NODE_ENV) {
      const env = nodeEnvMatch[0].replace(/["']/g, '');
      if (env === 'production' || env === 'development' || env === 'test') {
        envVars.NODE_ENV = {
          value: env,
          source: 'bundled script (detected)'
        };
      }
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
    
    // Second, get all external script URLs and fetch them
    const scriptUrlsResult = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        return scripts.map(script => {
          const src = script.src;
          // Only return scripts from the same origin or with full URLs
          if (src && (src.startsWith('http') || src.startsWith('/'))) {
            return src;
          }
          return null;
        }).filter(Boolean);
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
  
  // Pattern 10: Direct NODE_ENV detection
  const nodeEnvMatch = content.match(/["'](?:production|development|test)["']/);
  if (nodeEnvMatch && !envVars.NODE_ENV) {
    const env = nodeEnvMatch[0].replace(/["']/g, '');
    if (env === 'production' || env === 'development' || env === 'test') {
      envVars.NODE_ENV = { value: env, source: source + ' (detected)' };
    }
  }
  
  // Pattern 11: Vite mode
  const viteModeMatch = content.match(/mode\s*:\s*["'](production|development)["']/);
  if (viteModeMatch && !envVars.MODE) {
    envVars.MODE = { value: viteModeMatch[1], source: source + ' (Vite mode)' };
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
          <span class="env-source">${escapeHtml(source)}</span>
        </div>
        <div class="env-value ${isEmpty ? 'empty' : ''}">
          ${escapeHtml(displayValue)}
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
