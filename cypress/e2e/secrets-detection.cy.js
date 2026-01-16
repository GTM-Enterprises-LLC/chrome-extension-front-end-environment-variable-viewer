describe('Secrets Detection - Multicloud and Payment Demos', () => {
  describe('Multicloud Demo (Hardcoded Secrets)', () => {
    const multicloudUrl = Cypress.env('multicloudProd') || 'http://localhost:5184'

    before(() => {
      cy.visit(multicloudUrl)
      cy.verifyPageLoaded()
    })

    it('should load Multicloud demo', () => {
      cy.get('body').should('be.visible')
    })

    it('should detect VITE_*_ACCESS_KEY_ID pattern', () => {
      cy.get('body').invoke('text').should('match', /VITE_[A-Z_]*ACCESS_KEY_ID/)
    })

    it('should detect VITE_*_SECRET_ACCESS_KEY pattern', () => {
      cy.get('body').invoke('text').should('match', /VITE_[A-Z_]*SECRET_ACCESS_KEY/)
    })

    it('should detect VITE_*_CLIENT_ID pattern', () => {
      cy.get('body').invoke('text').should('match', /VITE_[A-Z_]*CLIENT_ID/)
    })

    it('should detect VITE_*_API_KEY pattern', () => {
      cy.get('body').invoke('text').should('match', /VITE_[A-Z_]*API_KEY/)
    })
  })

  describe('Payment APIs Demo (Hardcoded Secrets)', () => {
    const paymentUrl = Cypress.env('paymentProd') || 'http://localhost:5185'

    before(() => {
      cy.visit(paymentUrl)
      cy.verifyPageLoaded()
    })

    it('should load Payment APIs demo', () => {
      cy.get('body').should('be.visible')
    })

    it('should detect payment API key patterns', () => {
      cy.get('body').invoke('text').should('match', /VITE_[A-Z_]*(STRIPE|PAYPAL|SQUARE|TWILIO)/)
    })

    it('should detect SECRET_KEY pattern', () => {
      cy.get('body').invoke('text').should('match', /SECRET_KEY/)
    })

    it('should detect CLIENT_ID or ACCOUNT_SID patterns', () => {
      cy.get('body').invoke('text').should('match', /(CLIENT_ID|ACCOUNT_SID)/)
    })
  })
})
