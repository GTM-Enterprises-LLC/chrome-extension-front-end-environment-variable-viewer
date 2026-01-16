// Custom Cypress commands

// Command to verify page loaded successfully
Cypress.Commands.add('verifyPageLoaded', () => {
  cy.document().its('readyState').should('equal', 'complete')
  cy.get('body').should('be.visible')
})

// Command to check for specific text on page
Cypress.Commands.add('checkForEnvVarOnPage', (varName) => {
  cy.document().then(doc => {
    const bodyText = doc.body.innerText || doc.body.textContent
    const found = bodyText.includes(varName)
    cy.log(`Variable ${varName} ${found ? 'found' : 'not found'} on page`)
    expect(found).to.be.true
  })
})

// Command to check page source for env vars
Cypress.Commands.add('checkPageSource', (expectedVars) => {
  cy.request(Cypress.config('baseUrl')).then((response) => {
    expectedVars.forEach(varName => {
      expect(response.body).to.include(varName)
    })
  })
})
