describe('Angular Demo - Environment Variables Detection', () => {
  const angularUrl = Cypress.env('angularProd') || 'http://localhost:8083'

  before(() => {
    cy.visit(angularUrl)
    cy.verifyPageLoaded()
  })

  it('should load Angular demo application', () => {
    cy.contains('Environment Configuration').should('be.visible')
  })

  it('should display Angular environment section', () => {
    cy.get('body').invoke('text').should('include', 'Environment Configuration')
  })

  it('should detect Angular environment keys on the page', () => {
    const expectedKeys = [
      'apiUrl',
      'apiKey',
      'production',
      'version',
      'environmentName',
      'maxUploadSize',
      'stripePublicKey',
      'googleAnalyticsId',
      'sentryDsn'
    ]

    expectedKeys.forEach(key => {
      cy.checkForEnvVarOnPage(key)
    })
  })

  it('should have at least 8 environment-related keys', () => {
    cy.get('body').then($body => {
      const text = $body.text()
      const angularEnvKeys = [
        'apiUrl',
        'apiKey',
        'production',
        'version',
        'environmentName',
        'maxUploadSize',
        'stripePublicKey',
        'googleAnalyticsId',
        'sentryDsn',
        'analyticsEnabled',
        'darkModeEnabled'
      ]
      const foundCount = angularEnvKeys.filter(key => text.includes(key)).length
      expect(foundCount).to.be.at.least(8)
    })
  })

  it('should show Angular-specific env values in the UI', () => {
    cy.get('body').invoke('text').then(text => {
      const hasProdValues = /angular-api\.example\.com|angular_key_99999|pk_test_angular|UA-ANGULAR/.test(text)
      const hasDevValues = /localhost:3000|dev_key_12345|pk_test_dev|UA-DEV|sentry\.io/.test(text)
      expect(hasProdValues || hasDevValues).to.be.true
    })
  })
})
