const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3002',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    viewportWidth: 1280,
    viewportHeight: 720,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    // Test app URLs
    reactProd: 'http://localhost:3002',
    viteProd: 'http://localhost:4173',
    nextProd: 'http://localhost:3004',
    vueProd: 'http://localhost:8081',
    svelteProd: 'http://localhost:8082',
    angularProd: 'http://localhost:8083',
    multicloudProd: 'http://localhost:5184',
    paymentProd: 'http://localhost:5185',
  }
})
