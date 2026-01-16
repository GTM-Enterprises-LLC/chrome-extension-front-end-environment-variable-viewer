describe('React Demo - Environment Variables Detection', () => {
  const reactUrl = Cypress.env('reactProd') || 'http://localhost:3002'

  before(() => {
    cy.visit(reactUrl)
    cy.verifyPageLoaded()
  })

  it('should load React demo application', () => {
    cy.contains('Environment Configuration').should('be.visible')
  })

  it('should detect REACT_APP_* variables on the page', () => {
    const expectedVars = [
      'REACT_APP_API_BASE_URL',
      'REACT_APP_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_PROJECT_ID',
      'REACT_APP_AUTH_DOMAIN',
      'REACT_APP_ENABLE_LOGGING',
      'REACT_APP_VERSION',
      'REACT_APP_BUILD_NUMBER',
      'REACT_APP_ENVIRONMENT',
      'REACT_APP_SENTRY_DSN'
    ]

    expectedVars.forEach(varName => {
      cy.checkForEnvVarOnPage(varName)
    })
  })

  it('should have 9 React environment variables', () => {
    cy.get('body').then($body => {
      const text = $body.text()
      const reactVarCount = (text.match(/REACT_APP_/g) || []).length
      expect(reactVarCount).to.be.at.least(9)
    })
  })
})
