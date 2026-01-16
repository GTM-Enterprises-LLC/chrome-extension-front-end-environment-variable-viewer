const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for testing Chrome extension
 * with all test applications
 */
module.exports = defineConfig({
  testDir: './playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Test application URLs
  env: {
    REACT_PROD: 'http://localhost:3002',
    VITE_PROD: 'http://localhost:4173',
    NEXT_PROD: 'http://localhost:3004',
    VUE_PROD: 'http://localhost:8081',
    SVELTE_PROD: 'http://localhost:8082',
    ANGULAR_PROD: 'http://localhost:8083',
    MULTICLOUD_PROD: 'http://localhost:5184',
    PAYMENT_PROD: 'http://localhost:5185',
  },
});
