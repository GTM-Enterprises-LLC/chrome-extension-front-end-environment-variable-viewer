import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const envVars = [
    { key: 'API Base URL', value: process.env.REACT_APP_API_BASE_URL, icon: '🌐' },
    { key: 'Firebase API Key', value: process.env.REACT_APP_FIREBASE_API_KEY, icon: '🔥' },
    { key: 'Project ID', value: process.env.REACT_APP_FIREBASE_PROJECT_ID, icon: '📦' },
    { key: 'Auth Domain', value: process.env.REACT_APP_AUTH_DOMAIN, icon: '🔐' },
    { key: 'Enable Logging', value: process.env.REACT_APP_ENABLE_LOGGING, icon: '📝' },
    { key: 'Version', value: process.env.REACT_APP_VERSION, icon: '🏷️' },
    { key: 'Build Number', value: process.env.REACT_APP_BUILD_NUMBER, icon: '🔢' },
    { key: 'Environment', value: process.env.REACT_APP_ENVIRONMENT, icon: '⚙️' },
    { key: 'Sentry DSN', value: process.env.REACT_APP_SENTRY_DSN, icon: '🐛' },
  ];

  useEffect(() => {
    // Fetch demo data using the API from env
    fetch(`${process.env.REACT_APP_API_BASE_URL}/posts?_limit=3`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo">⚛️</div>
        <h1>React Environment Variables Demo</h1>
        <p className="version">
          v{process.env.REACT_APP_VERSION} (Build {process.env.REACT_APP_BUILD_NUMBER})
        </p>
      </header>

      <main className="App-main">
        <section className="env-section">
          <h2>🔧 Environment Configuration</h2>
          <p className="section-desc">All REACT_APP_* variables detected</p>
          <div className="env-container">
            {envVars.map((item, index) => (
              <div key={index} className="env-card">
                <div className="env-header">
                  <span className="env-icon">{item.icon}</span>
                  <span className="env-key">{item.key}</span>
                </div>
                <div className="env-value">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="demo-section">
          <h2>📡 API Integration Demo</h2>
          <p className="section-desc">
            Fetching data from: <code>{process.env.REACT_APP_API_BASE_URL}</code>
          </p>
          {loading ? (
            <div className="loader">Loading...</div>
          ) : (
            <div className="posts-container">
              {data.map(post => (
                <div key={post.id} className="post-card">
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="status-section">
          <h2>✅ Status Check</h2>
          <div className="status-grid">
            <div className="status-card">
              <span className="status-icon">🔥</span>
              <h3>Firebase</h3>
              <span className="status-badge connected">Configured</span>
            </div>
            <div className="status-card">
              <span className="status-icon">📝</span>
              <h3>Logging</h3>
              <span className={`status-badge ${process.env.REACT_APP_ENABLE_LOGGING === 'true' ? 'connected' : 'disconnected'}`}>
                {process.env.REACT_APP_ENABLE_LOGGING === 'true' ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="status-card">
              <span className="status-icon">🐛</span>
              <h3>Error Tracking</h3>
              <span className="status-badge connected">Sentry Active</span>
            </div>
            <div className="status-card">
              <span className="status-icon">⚙️</span>
              <h3>Environment</h3>
              <span className="status-badge env">{process.env.REACT_APP_ENVIRONMENT}</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="App-footer">
        <p>🔍 Use your Chrome extension to detect these environment variables</p>
      </footer>
    </div>
  );
}

export default App;
