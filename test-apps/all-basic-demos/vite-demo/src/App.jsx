import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const envVars = {
    'API URL': import.meta.env.VITE_API_URL,
    'API Key': import.meta.env.VITE_API_KEY,
    'Analytics': import.meta.env.VITE_FEATURE_FLAG_ANALYTICS,
    'Dark Mode': import.meta.env.VITE_FEATURE_FLAG_DARK_MODE,
    'Version': import.meta.env.VITE_APP_VERSION,
    'Environment': import.meta.env.VITE_ENVIRONMENT,
    'Max Upload': import.meta.env.VITE_MAX_UPLOAD_SIZE,
    'Stripe Key': import.meta.env.VITE_STRIPE_PUBLIC_KEY,
  }

  return (
    <div className="app">
      <header>
        <h1>🚀 Vite + React Demo</h1>
        <p className="subtitle">Environment Variables Showcase</p>
      </header>

      <main>
        <section className="env-section">
          <h2>Environment Configuration</h2>
          <div className="env-grid">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="env-item">
                <span className="env-key">{key}:</span>
                <span className="env-value">{String(value)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="demo-section">
          <h2>Interactive Demo</h2>
          <div className="card">
            <button onClick={() => setCount((count) => count + 1)}>
              Count is {count}
            </button>
            <p className="info">
              Running in <strong>{import.meta.env.VITE_ENVIRONMENT}</strong> mode
            </p>
          </div>
        </section>

        <section className="features-section">
          <h2>Feature Flags</h2>
          <div className="features">
            <div className={`feature ${import.meta.env.VITE_FEATURE_FLAG_ANALYTICS === 'true' ? 'enabled' : 'disabled'}`}>
              <span className="icon">📊</span>
              <span>Analytics: {import.meta.env.VITE_FEATURE_FLAG_ANALYTICS === 'true' ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className={`feature ${import.meta.env.VITE_FEATURE_FLAG_DARK_MODE === 'true' ? 'enabled' : 'disabled'}`}>
              <span className="icon">🌙</span>
              <span>Dark Mode: {import.meta.env.VITE_FEATURE_FLAG_DARK_MODE === 'true' ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
