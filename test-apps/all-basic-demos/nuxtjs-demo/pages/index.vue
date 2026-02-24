<template>
  <div class="container">
    <header class="header">
      <div class="logo">N</div>
      <h1>Nuxt.js Environment Demo</h1>
      <p class="subtitle">Powered by Nuxt 3 with Runtime Config</p>
    </header>

    <main class="main">
      <div class="tabs">
        <button
          :class="activeTab === 'config' ? 'tab-active' : 'tab'"
          @click="activeTab = 'config'"
        >
          Configuration
        </button>
        <button
          :class="activeTab === 'features' ? 'tab-active' : 'tab'"
          @click="activeTab = 'features'"
        >
          Features
        </button>
        <button
          :class="activeTab === 'info' ? 'tab-active' : 'tab'"
          @click="activeTab = 'info'"
        >
          Info
        </button>
      </div>

      <section v-if="activeTab === 'config'" class="section">
        <h2>Environment Variables (NUXT_PUBLIC_*)</h2>
        <div class="env-grid">
          <div v-for="(value, key) in publicEnvVars" :key="key" class="env-card">
            <div class="env-key">{{ key }}</div>
            <div class="env-value">{{ value }}</div>
          </div>
        </div>
      </section>

      <section v-if="activeTab === 'features'" class="section">
        <h2>Feature Status</h2>
        <div class="features-grid">
          <div class="feature-card">
            <span class="feature-icon">📊</span>
            <h3>Analytics</h3>
            <p>Google Analytics tracking</p>
            <span class="badge">Active</span>
          </div>
          <div class="feature-card">
            <span class="feature-icon">💳</span>
            <h3>Payments</h3>
            <p>Stripe integration ready</p>
            <span class="badge">Active</span>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🌙</span>
            <h3>Dark Mode</h3>
            <p>Theme switching</p>
            <span :class="config.public.enableDarkMode === 'true' ? 'badge-success' : 'badge'">
              {{ config.public.enableDarkMode === 'true' ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🚀</span>
            <h3>CDN</h3>
            <p>Asset delivery network</p>
            <span class="badge">Active</span>
          </div>
        </div>
      </section>

      <section v-if="activeTab === 'info'" class="section">
        <h2>Application Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">App Name:</span>
            <span class="info-value">{{ config.public.appName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">API Base URL:</span>
            <span class="info-value">{{ config.public.apiBaseUrl }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Max Upload:</span>
            <span class="info-value">{{ (Number(config.public.maxUploadSize) / 1024 / 1024).toFixed(2) }} MB</span>
          </div>
          <div class="info-item">
            <span class="info-label">Framework:</span>
            <span class="info-value">Nuxt 3</span>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>Environment variables detected by your extension</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const config = useRuntimeConfig()
const activeTab = ref('config')

const publicEnvVars = {
  'NUXT_PUBLIC_API_BASE_URL': config.public.apiBaseUrl,
  'NUXT_PUBLIC_GOOGLE_ANALYTICS_ID': config.public.googleAnalyticsId,
  'NUXT_PUBLIC_STRIPE_KEY': config.public.stripeKey,
  'NUXT_PUBLIC_APP_NAME': config.public.appName,
  'NUXT_PUBLIC_ENABLE_DARK_MODE': config.public.enableDarkMode,
  'NUXT_PUBLIC_CDN_URL': config.public.cdnUrl,
  'NUXT_PUBLIC_SENTRY_DSN': config.public.sentryDsn,
  'NUXT_PUBLIC_MAX_UPLOAD_SIZE': config.public.maxUploadSize,
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #00dc82 0%, #003b2e 50%, #000000 100%);
  min-height: 100vh;
}

.container {
  min-height: 100vh;
  color: white;
}

.header {
  text-align: center;
  padding: 3rem 2rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #00dc82;
  text-shadow: 0 0 30px rgba(0, 220, 130, 0.5);
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #00dc82 0%, #36e4a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #888;
  font-size: 1.1rem;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
}

.tab, .tab-active {
  background: none;
  border: none;
  color: #888;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  white-space: nowrap;
}

.tab-active {
  color: #00dc82;
  border-bottom-color: #00dc82;
}

.tab:hover {
  color: #00dc82;
}

.section {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #fff;
}

.env-grid {
  display: grid;
  gap: 1rem;
}

.env-card {
  background: rgba(0, 220, 130, 0.05);
  border: 1px solid rgba(0, 220, 130, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;
}

.env-card:hover {
  background: rgba(0, 220, 130, 0.1);
  border-color: rgba(0, 220, 130, 0.4);
  transform: translateY(-2px);
}

.env-key {
  font-weight: 600;
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.env-value {
  font-family: 'Courier New', monospace;
  color: #00dc82;
  font-size: 1.1rem;
  word-break: break-all;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: rgba(0, 220, 130, 0.05);
  border: 1px solid rgba(0, 220, 130, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s;
}

.feature-card:hover {
  background: rgba(0, 220, 130, 0.1);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.feature-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #888;
  margin-bottom: 1rem;
}

.badge, .badge-success {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.badge {
  background: rgba(0, 220, 130, 0.2);
  color: #00dc82;
  border: 1px solid rgba(0, 220, 130, 0.3);
}

.badge-success {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 220, 130, 0.05);
  border: 1px solid rgba(0, 220, 130, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
}

.info-label {
  color: #888;
  font-weight: 600;
}

.info-value {
  color: #fff;
  font-family: 'Courier New', monospace;
}

.footer {
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 4rem;
}
</style>
