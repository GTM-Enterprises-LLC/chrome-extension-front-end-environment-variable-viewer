import * as React from "react"
import { useState } from "react"
import "../styles/global.css"

const publicEnvVars = {
  'GATSBY_API_URL': process.env.GATSBY_API_URL,
  'GATSBY_GOOGLE_ANALYTICS_ID': process.env.GATSBY_GOOGLE_ANALYTICS_ID,
  'GATSBY_STRIPE_PUBLIC_KEY': process.env.GATSBY_STRIPE_PUBLIC_KEY,
  'GATSBY_APP_TITLE': process.env.GATSBY_APP_TITLE,
  'GATSBY_ENABLE_COMMENTS': process.env.GATSBY_ENABLE_COMMENTS,
  'GATSBY_CDN_URL': process.env.GATSBY_CDN_URL,
  'GATSBY_SENTRY_DSN': process.env.GATSBY_SENTRY_DSN,
  'GATSBY_CONTENTFUL_SPACE_ID': process.env.GATSBY_CONTENTFUL_SPACE_ID,
}

const IndexPage = () => {
  const [activeTab, setActiveTab] = useState('config')

  return (
    <div className="container">
      <header className="header">
        <div className="logo">G</div>
        <h1>Gatsby Environment Demo</h1>
        <p className="subtitle">Powered by Gatsby 5 Static Site Generator</p>
      </header>

      <main className="main">
        <div className="tabs">
          <button
            className={activeTab === 'config' ? 'tab-active' : 'tab'}
            onClick={() => setActiveTab('config')}
          >
            Configuration
          </button>
          <button
            className={activeTab === 'features' ? 'tab-active' : 'tab'}
            onClick={() => setActiveTab('features')}
          >
            Features
          </button>
          <button
            className={activeTab === 'info' ? 'tab-active' : 'tab'}
            onClick={() => setActiveTab('info')}
          >
            Info
          </button>
        </div>

        {activeTab === 'config' && (
          <section className="section">
            <h2>Environment Variables (GATSBY_*)</h2>
            <div className="env-grid">
              {Object.entries(publicEnvVars).map(([key, value]) => (
                <div key={key} className="env-card">
                  <div className="env-key">{key}</div>
                  <div className="env-value">{String(value)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'features' && (
          <section className="section">
            <h2>Feature Status</h2>
            <div className="features-grid">
              <div className="feature-card">
                <span className="feature-icon">📊</span>
                <h3>Analytics</h3>
                <p>Google Analytics tracking</p>
                <span className="badge">Active</span>
              </div>
              <div className="feature-card">
                <span className="feature-icon">💳</span>
                <h3>Payments</h3>
                <p>Stripe integration ready</p>
                <span className="badge">Active</span>
              </div>
              <div className="feature-card">
                <span className="feature-icon">💬</span>
                <h3>Comments</h3>
                <p>User commenting system</p>
                <span className={process.env.GATSBY_ENABLE_COMMENTS === 'true' ? 'badge-success' : 'badge'}>
                  {process.env.GATSBY_ENABLE_COMMENTS === 'true' ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="feature-card">
                <span className="feature-icon">📝</span>
                <h3>CMS</h3>
                <p>Contentful integration</p>
                <span className="badge">Active</span>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'info' && (
          <section className="section">
            <h2>Application Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">App Title:</span>
                <span className="info-value">{process.env.GATSBY_APP_TITLE}</span>
              </div>
              <div className="info-item">
                <span className="info-label">API URL:</span>
                <span className="info-value">{process.env.GATSBY_API_URL}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Contentful Space:</span>
                <span className="info-value">{process.env.GATSBY_CONTENTFUL_SPACE_ID}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Framework:</span>
                <span className="info-value">Gatsby 5</span>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Environment variables detected by your extension</p>
      </footer>
    </div>
  )
}

export default IndexPage

export const Head = () => <title>Gatsby Environment Demo</title>
