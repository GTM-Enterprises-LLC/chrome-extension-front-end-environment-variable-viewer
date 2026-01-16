describe('All Frameworks - Environment Variables Detection', () => {
  const testApps = [
    {
      name: 'React',
      url: Cypress.env('reactProd') || 'http://localhost:3002',
      prefix: 'REACT_APP_',
      expectedCount: 9
    },
    {
      name: 'Vite',
      url: Cypress.env('viteProd') || 'http://localhost:4173',
      prefix: 'VITE_',
      expectedCount: 8
    },
    {
      name: 'Next.js',
      url: Cypress.env('nextProd') || 'http://localhost:3004',
      prefix: 'NEXT_PUBLIC_',
      expectedCount: 8
    },
    {
      name: 'Vue 3',
      url: Cypress.env('vueProd') || 'http://localhost:8081',
      prefix: 'VITE_',
      expectedCount: 10
    },
    {
      name: 'Svelte',
      url: Cypress.env('svelteProd') || 'http://localhost:8082',
      prefix: 'VITE_',
      expectedCount: 10
    },
    {
      name: 'Angular',
      url: Cypress.env('angularProd') || 'http://localhost:8083',
      prefix: null, // Angular uses environment object
      expectedCount: 8
    }
  ]

  testApps.forEach(app => {
    describe(`${app.name} Demo`, () => {
      it(`should load ${app.name} application`, () => {
        cy.visit(app.url)
        cy.verifyPageLoaded()
        cy.get('body').should('be.visible')
      })

      if (app.prefix) {
        it(`should detect ${app.prefix}* variables`, () => {
          cy.visit(app.url)
          cy.get('body').invoke('text').should('include', app.prefix)
        })

        it(`should have at least ${app.expectedCount} environment variables`, () => {
          cy.visit(app.url)
          cy.get('body').then($body => {
            const text = $body.text()
            const varCount = (text.match(new RegExp(app.prefix, 'g')) || []).length
            expect(varCount).to.be.at.least(app.expectedCount)
          })
        })
      } else {
        it('should have Angular environment configuration', () => {
          cy.visit(app.url)
          cy.get('body').invoke('text').should('match', /apiUrl|apiKey|environment/)
        })
      }
    })
  })
})
