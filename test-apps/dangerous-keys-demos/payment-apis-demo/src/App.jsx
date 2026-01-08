import { useState } from 'react'
import './App.css'

function App() {
  const [selectedProvider, setSelectedProvider] = useState('stripe')

  const paymentSecrets = {
    stripe: [
      {
        name: 'STRIPE_SECRET_KEY',
        value: import.meta.env.VITE_STRIPE_SECRET_KEY,
        severity: 'critical',
        icon: '💳',
        risk: 'Full payment processing access',
        impact: 'Create charges, refunds, access customer data, modify subscriptions',
        cost: 'Unlimited fraudulent transactions'
      },
      {
        name: 'STRIPE_PUBLISHABLE_KEY',
        value: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        severity: 'medium',
        icon: '🔓',
        risk: 'Public key exposure',
        impact: 'Client-side payment form exploitation',
        cost: 'Payment flow manipulation'
      },
      {
        name: 'STRIPE_WEBHOOK_SECRET',
        value: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET,
        severity: 'critical',
        icon: '🔔',
        risk: 'Webhook verification bypass',
        impact: 'Forge payment events, fake successful payments',
        cost: 'Complete payment system compromise'
      }
    ],
    paypal: [
      {
        name: 'PAYPAL_CLIENT_ID',
        value: import.meta.env.VITE_PAYPAL_CLIENT_ID,
        severity: 'critical',
        icon: '🅿️',
        risk: 'PayPal API authentication',
        impact: 'Access merchant account, process payments',
        cost: 'Unauthorized payment processing'
      },
      {
        name: 'PAYPAL_CLIENT_SECRET',
        value: import.meta.env.VITE_PAYPAL_CLIENT_SECRET,
        severity: 'critical',
        icon: '🔑',
        risk: 'Complete PayPal API access',
        impact: 'Full merchant account control',
        cost: 'Account takeover, fund theft'
      },
      {
        name: 'PAYPAL_WEBHOOK_ID',
        value: import.meta.env.VITE_PAYPAL_WEBHOOK_ID,
        severity: 'high',
        icon: '📡',
        risk: 'Webhook event forgery',
        impact: 'Fake transaction notifications',
        cost: 'Payment confirmation bypass'
      }
    ],
    square: [
      {
        name: 'SQUARE_ACCESS_TOKEN',
        value: import.meta.env.VITE_SQUARE_ACCESS_TOKEN,
        severity: 'critical',
        icon: '⬛',
        risk: 'Square API full access',
        impact: 'Process payments, access customer data, modify inventory',
        cost: 'Complete merchant account control'
      },
      {
        name: 'SQUARE_APPLICATION_ID',
        value: import.meta.env.VITE_SQUARE_APPLICATION_ID,
        severity: 'medium',
        icon: '📱',
        risk: 'Application identification',
        impact: 'Target specific Square integration',
        cost: 'Reconnaissance for attacks'
      }
    ],
    twilio: [
      {
        name: 'TWILIO_ACCOUNT_SID',
        value: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
        severity: 'critical',
        icon: '📞',
        risk: 'Twilio account identifier',
        impact: 'Send SMS/calls, access logs, phone number hijacking',
        cost: 'Massive SMS spam, verification bypass'
      },
      {
        name: 'TWILIO_AUTH_TOKEN',
        value: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
        severity: 'critical',
        icon: '🔐',
        risk: 'Full Twilio authentication',
        impact: 'Complete control over communication channels',
        cost: 'Unlimited SMS/call charges'
      }
    ]
  }

  const providers = {
    stripe: { name: 'Stripe', color: '#635bff', icon: '💳', count: 3 },
    paypal: { name: 'PayPal', color: '#00457c', icon: '🅿️', count: 3 },
    square: { name: 'Square', color: '#006aff', icon: '⬛', count: 2 },
    twilio: { name: 'Twilio', color: '#f22f46', icon: '📞', count: 2 }
  }

  const totalCritical = Object.values(paymentSecrets).flat().filter(s => s.severity === 'critical').length

  return (
    <div className="payment-app">
      <div className="neon-bg"></div>
      
      <header className="payment-header">
        <div className="header-content">
          <h1 className="neon-title">
            <span className="neon-icon">💰</span>
            PAYMENT GATEWAY SCANNER
          </h1>
          <div className="critical-alert">
            <span className="alert-flash">⚠️</span>
            <span>{totalCritical} CRITICAL PAYMENT KEYS EXPOSED</span>
          </div>
        </div>
      </header>

      <div className="provider-selector">
        {Object.entries(providers).map(([key, provider]) => (
          <button
            key={key}
            className={`provider-btn ${selectedProvider === key ? 'active' : ''}`}
            onClick={() => setSelectedProvider(key)}
            style={{
              '--provider-color': provider.color,
              borderColor: selectedProvider === key ? provider.color : 'transparent'
            }}
          >
            <span className="provider-icon">{provider.icon}</span>
            <span className="provider-name">{provider.name}</span>
            <span className="provider-count">{provider.count}</span>
          </button>
        ))}
      </div>

      <main className="payment-main">
        <section className="vulnerabilities">
          <div className="section-header">
            <h2>
              <span className="danger-indicator"></span>
              {providers[selectedProvider].name} API Keys Exposed
            </h2>
            <div className="severity-meter">
              <div className="meter-bar" style={{ width: '95%', backgroundColor: providers[selectedProvider].color }}></div>
              <span className="meter-label">THREAT LEVEL: CRITICAL</span>
            </div>
          </div>

          <div className="warning-banner">
            <strong>⚠️ Financial Security Breach</strong>
            <p>Exposed {providers[selectedProvider].name} credentials can lead to unauthorized transactions, customer data theft, and complete payment system compromise.</p>
          </div>

          <div className="secrets-container">
            {paymentSecrets[selectedProvider].map((secret, index) => (
              <div key={index} className={`payment-card ${secret.severity}`}>
                <div className="card-glow" style={{ backgroundColor: providers[selectedProvider].color }}></div>
                
                <div className="card-top">
                  <div className="key-info">
                    <span className="key-icon">{secret.icon}</span>
                    <div>
                      <div className="key-name">{secret.name}</div>
                      <span className={`severity-label ${secret.severity}`}>
                        {secret.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="key-value-box">
                  <code className="key-value">{secret.value}</code>
                  <button className="copy-btn">📋</button>
                </div>

                <div className="risk-details">
                  <div className="risk-row">
                    <span className="risk-label">🎯 Attack Surface:</span>
                    <span className="risk-text">{secret.risk}</span>
                  </div>
                  <div className="risk-row">
                    <span className="risk-label">💥 Exploit Impact:</span>
                    <span className="risk-text">{secret.impact}</span>
                  </div>
                  <div className="risk-row">
                    <span className="risk-label">💰 Financial Risk:</span>
                    <span className="risk-text critical-text">{secret.cost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mitigation">
          <h2>🛡️ Security Recommendations</h2>
          <div className="recommendations">
            <div className="rec-card">
              <div className="rec-icon">🔄</div>
              <h3>Rotate Keys Immediately</h3>
              <p>Invalidate all exposed credentials and generate new ones through your provider dashboard</p>
            </div>
            <div className="rec-card">
              <div className="rec-icon">🔒</div>
              <h3>Use Environment Variables</h3>
              <p>Never hardcode payment keys. Store in secure vaults or environment variables not committed to repos</p>
            </div>
            <div className="rec-card">
              <div className="rec-icon">📊</div>
              <h3>Enable Monitoring</h3>
              <p>Set up alerts for suspicious transactions and API usage patterns</p>
            </div>
            <div className="rec-card">
              <div className="rec-icon">🔐</div>
              <h3>Implement Rate Limiting</h3>
              <p>Add API rate limits and IP whitelisting to prevent automated exploitation</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
