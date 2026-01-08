import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeCloud, setActiveCloud] = useState('aws')
  const [scanComplete, setScanComplete] = useState(false)

  useEffect(() => {
    setTimeout(() => setScanComplete(true), 1500)
  }, [])

  const cloudSecrets = {
    aws: [
      {
        name: 'AWS_ACCESS_KEY_ID',
        value: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        severity: 'critical',
        description: 'AWS IAM Access Key',
        risk: 'Full AWS account access - can launch resources, access data, modify IAM',
        cost: 'Potential $10K+ in unauthorized charges',
        icon: '☁️'
      },
      {
        name: 'AWS_SECRET_ACCESS_KEY',
        value: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
        severity: 'critical',
        description: 'AWS IAM Secret Key',
        risk: 'Complete authentication to AWS services',
        cost: 'Unlimited resource access',
        icon: '🔑'
      },
      {
        name: 'AWS_SESSION_TOKEN',
        value: import.meta.env.VITE_AWS_SESSION_TOKEN,
        severity: 'critical',
        description: 'Temporary AWS Session Token',
        risk: 'Active session hijacking, immediate access',
        cost: 'Real-time exploitation window',
        icon: '⏱️'
      }
    ],
    azure: [
      {
        name: 'AZURE_CLIENT_ID',
        value: import.meta.env.VITE_AZURE_CLIENT_ID,
        severity: 'critical',
        description: 'Azure Service Principal Client ID',
        risk: 'Application identity for Azure resources',
        cost: 'Access to subscribed Azure services',
        icon: '🔷'
      },
      {
        name: 'AZURE_CLIENT_SECRET',
        value: import.meta.env.VITE_AZURE_CLIENT_SECRET,
        severity: 'critical',
        description: 'Azure Service Principal Secret',
        risk: 'Full authentication to Azure Active Directory',
        cost: 'Enterprise resource compromise',
        icon: '🔐'
      },
      {
        name: 'AZURE_TENANT_ID',
        value: import.meta.env.VITE_AZURE_TENANT_ID,
        severity: 'high',
        description: 'Azure AD Tenant Identifier',
        risk: 'Organization identification for targeted attacks',
        cost: 'Tenant-level reconnaissance',
        icon: '🏢'
      },
      {
        name: 'AZURE_SUBSCRIPTION_ID',
        value: import.meta.env.VITE_AZURE_SUBSCRIPTION_ID,
        severity: 'high',
        description: 'Azure Subscription ID',
        risk: 'Subscription-level resource enumeration',
        cost: 'Billing and resource discovery',
        icon: '💳'
      }
    ],
    gcp: [
      {
        name: 'GOOGLE_API_KEY',
        value: import.meta.env.VITE_GOOGLE_API_KEY,
        severity: 'critical',
        description: 'Google Cloud API Key',
        risk: 'Access to GCP APIs, Maps, Firebase',
        cost: 'API quota abuse, data exfiltration',
        icon: '🔑'
      },
      {
        name: 'GOOGLE_APPLICATION_CREDENTIALS',
        value: import.meta.env.VITE_GOOGLE_APPLICATION_CREDENTIALS,
        severity: 'critical',
        description: 'GCP Service Account Key Path',
        risk: 'Full service account permissions',
        cost: 'Complete GCP project access',
        icon: '📄'
      },
      {
        name: 'GCP_PROJECT_ID',
        value: import.meta.env.VITE_GCP_PROJECT_ID,
        severity: 'medium',
        description: 'Google Cloud Project ID',
        risk: 'Project identification and targeting',
        cost: 'Reconnaissance information',
        icon: '📦'
      }
    ]
  }

  const safeVars = [
    { name: 'CLOUD_REGION', value: import.meta.env.VITE_CLOUD_REGION },
    { name: 'APP_ENVIRONMENT', value: import.meta.env.VITE_APP_ENVIRONMENT },
    { name: 'LOG_LEVEL', value: import.meta.env.VITE_LOG_LEVEL }
  ]

  const stats = {
    aws: { critical: 3, total: 3, cloudIcon: '☁️', color: '#FF9900' },
    azure: { critical: 2, total: 4, cloudIcon: '🔷', color: '#0078D4' },
    gcp: { critical: 2, total: 3, cloudIcon: '🔴', color: '#4285F4' }
  }

  return (
    <div className="multicloud-app">
      <div className="scan-overlay" style={{ display: scanComplete ? 'none' : 'flex' }}>
        <div className="scanner">
          <div className="scan-line"></div>
          <h2>🔍 Scanning Environment Variables...</h2>
          <div className="scan-progress">
            <div className="scan-bar"></div>
          </div>
        </div>
      </div>

      <header className="cyber-header">
        <div className="header-glitch">
          <div className="status-indicator"></div>
          <h1>MULTI-CLOUD SECURITY SCAN</h1>
        </div>
        <div className="alert-badge">
          <span className="alert-icon">⚠️</span>
          <span>10 CRITICAL VULNERABILITIES DETECTED</span>
        </div>
      </header>

      <div className="cloud-tabs">
        {Object.entries(stats).map(([cloud, data]) => (
          <button
            key={cloud}
            className={`cloud-tab ${activeCloud === cloud ? 'active' : ''}`}
            onClick={() => setActiveCloud(cloud)}
            style={{ borderColor: activeCloud === cloud ? data.color : 'transparent' }}
          >
            <span className="cloud-icon">{data.cloudIcon}</span>
            <span className="cloud-name">{cloud.toUpperCase()}</span>
            <span className="cloud-badge" style={{ backgroundColor: data.color }}>
              {data.critical} CRITICAL
            </span>
          </button>
        ))}
      </div>

      <main className="cyber-main">
        <section className="threats-section">
          <div className="section-title">
            <span className="danger-pulse"></span>
            <h2>🚨 EXPOSED CREDENTIALS - {activeCloud.toUpperCase()}</h2>
          </div>

          <div className="threat-stats">
            <div className="stat-box critical">
              <div className="stat-number">{stats[activeCloud].critical}</div>
              <div className="stat-label">Critical Threats</div>
            </div>
            <div className="stat-box total">
              <div className="stat-number">{stats[activeCloud].total}</div>
              <div className="stat-label">Total Exposed</div>
            </div>
            <div className="stat-box financial">
              <div className="stat-number">$10K+</div>
              <div className="stat-label">Potential Cost</div>
            </div>
          </div>

          <div className="secrets-grid">
            {cloudSecrets[activeCloud].map((secret, index) => (
              <div key={index} className={`secret-card ${secret.severity}`}>
                <div className="card-header">
                  <span className="secret-icon">{secret.icon}</span>
                  <div className="card-title">
                    <div className="secret-name">{secret.name}</div>
                    <span className={`severity-pill ${secret.severity}`}>
                      {secret.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="secret-value-container">
                  <code className="secret-value">{secret.value}</code>
                </div>

                <div className="secret-description">{secret.description}</div>

                <div className="risk-panel">
                  <div className="risk-item">
                    <strong>⚠️ Attack Vector:</strong> {secret.risk}
                  </div>
                  <div className="risk-item">
                    <strong>💰 Impact:</strong> {secret.cost}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="safe-section">
          <h3>✅ Safe Configuration Variables</h3>
          <div className="safe-grid">
            {safeVars.map((v, i) => (
              <div key={i} className="safe-card">
                <span className="safe-icon">✓</span>
                <span className="safe-name">{v.name}</span>
                <span className="safe-value">{v.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="remediation">
          <h3>🔒 Immediate Actions Required</h3>
          <div className="action-grid">
            <div className="action-card">
              <div className="action-number">1</div>
              <h4>Rotate All Credentials</h4>
              <p>Immediately invalidate exposed keys and generate new ones</p>
            </div>
            <div className="action-card">
              <div className="action-number">2</div>
              <h4>Use Secret Managers</h4>
              <p>Store secrets in AWS Secrets Manager, Azure Key Vault, or GCP Secret Manager</p>
            </div>
            <div className="action-card">
              <div className="action-number">3</div>
              <h4>Enable Monitoring</h4>
              <p>Set up CloudWatch, Azure Monitor, and GCP Logging alerts</p>
            </div>
            <div className="action-card">
              <div className="action-number">4</div>
              <h4>Implement IAM Best Practices</h4>
              <p>Use least-privilege access and temporary credentials</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
