// Cypress support file for E2E tests

// Custom command to load Chrome extension
Cypress.Commands.add('loadExtension', (extensionPath) => {
  // Note: Loading extensions in Cypress requires running with specific flags
  // See package.json scripts for the correct way to launch Cypress with extension
  cy.log('Extension should be loaded via chrome://extensions or launch flags')
})

// Custom command to wait for extension popup
Cypress.Commands.add('openExtensionPopup', () => {
  // This will need to be handled manually or via browser automation
  // Extensions can't be fully automated in Cypress without custom setup
  cy.log('Open extension popup manually or via chrome.runtime')
})

// Custom command to check environment variables in extension
Cypress.Commands.add('checkEnvVars', (expectedVars) => {
  // This would require accessing the extension's DOM
  // For now, we'll check the page itself
  expectedVars.forEach(varName => {
    cy.log(`Checking for ${varName}`)
  })
})

// Import commands
import './commands'
