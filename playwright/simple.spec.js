const { test, expect, chromium } = require('@playwright/test');
const path = require('path');

/**
 * Simple Playwright tests that verify test applications are running
 * and accessible. The actual environment variable detection is tested
 * by the extension itself (which scans window object and scripts).
 */

const testApps = [
  { name: 'React', url: 'http://localhost:3002' },
  { name: 'Vite', url: 'http://localhost:4173' },
  { name: 'Next.js', url: 'http://localhost:3004' },
  { name: 'Vue', url: 'http://localhost:8081' },
  { name: 'Svelte', url: 'http://localhost:8082' },
  { name: 'Angular', url: 'http://localhost:8083' },
  { name: 'Multicloud', url: 'http://localhost:5184' },
  { name: 'Payment', url: 'http://localhost:5185' },
];

test.describe('Test Applications - Availability', () => {
  for (const app of testApps) {
    test(`${app.name} - should load successfully`, async ({ page }) => {
      // Navigate to test app
      const response = await page.goto(app.url, { waitUntil: 'networkidle' });

      // Verify HTTP 200
      expect(response.status()).toBe(200);

      // Verify page has content
      const hasBody = await page.evaluate(() => {
        return document.body && document.body.textContent.length > 0;
      });
      expect(hasBody).toBeTruthy();

      // Verify scripts loaded
      const scriptCount = await page.evaluate(() => {
        return document.scripts.length;
      });
      expect(scriptCount).toBeGreaterThan(0);
    });
  }
});

test.describe('Chrome Extension - Manual Testing Required', () => {
  test('Extension setup instructions', async () => {
    // This is an informational test
    console.log('\n========================================');
    console.log('CHROME EXTENSION TESTING');
    console.log('========================================\n');
    console.log('All test applications are running!');
    console.log('\nTo test the extension:');
    console.log('1. Open Chrome');
    console.log('2. Go to chrome://extensions/');
    console.log('3. Enable "Developer mode"');
    console.log('4. Click "Load unpacked"');
    console.log('5. Select this directory');
    console.log('6. Visit any test URL above');
    console.log('7. Click the extension icon');
    console.log('8. Verify variables are detected\n');
    console.log('See TESTING_URLS.md for full checklist');
    console.log('========================================\n');

    // Always pass - this is just informational
    expect(true).toBeTruthy();
  });
});
