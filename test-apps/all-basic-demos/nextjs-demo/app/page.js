'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function Home() {
  const [activeTab, setActiveTab] = useState('config')

  const publicEnvVars = {
    'API Endpoint': process.env.NEXT_PUBLIC_API_ENDPOINT,
    'Analytics ID': process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    'Stripe Key': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    'Beta Features': process.env.NEXT_PUBLIC_ENABLE_BETA_FEATURES,
    'App Name': process.env.NEXT_PUBLIC_APP_NAME,
    'Max File Size': process.env.NEXT_PUBLIC_MAX_FILE_SIZE,
    'Support Email': process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    'CDN URL': process.env.NEXT_PUBLIC_CDN_URL,
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>▲</div>
        <h1>Next.js Environment Demo</h1>
        <p className={styles.subtitle}>Powered by Next.js 14 App Router</p>
      </header>

      <main className={styles.main}>
        <div className={styles.tabs}>
          <button 
            className={activeTab === 'config' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('config')}
          >
            📋 Configuration
          </button>
          <button 
            className={activeTab === 'features' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('features')}
          >
            ⚡ Features
          </button>
          <button 
            className={activeTab === 'info' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('info')}
          >
            ℹ️ Info
          </button>
        </div>

        {activeTab === 'config' && (
          <section className={styles.section}>
            <h2>Environment Variables (NEXT_PUBLIC_*)</h2>
            <div className={styles.envGrid}>
              {Object.entries(publicEnvVars).map(([key, value]) => (
                <div key={key} className={styles.envCard}>
                  <div className={styles.envKey}>{key}</div>
                  <div className={styles.envValue}>{String(value)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'features' && (
          <section className={styles.section}>
            <h2>Feature Status</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <span className={styles.featureIcon}>📊</span>
                <h3>Analytics</h3>
                <p>Google Analytics tracking</p>
                <span className={styles.badge}>Active</span>
              </div>
              <div className={styles.featureCard}>
                <span className={styles.featureIcon}>💳</span>
                <h3>Payments</h3>
                <p>Stripe integration ready</p>
                <span className={styles.badge}>Active</span>
              </div>
              <div className={styles.featureCard}>
                <span className={styles.featureIcon}>🧪</span>
                <h3>Beta Features</h3>
                <p>Experimental functionality</p>
                <span className={styles.badgeSuccess}>
                  {process.env.NEXT_PUBLIC_ENABLE_BETA_FEATURES === 'true' ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className={styles.featureCard}>
                <span className={styles.featureIcon}>🚀</span>
                <h3>CDN</h3>
                <p>Asset delivery network</p>
                <span className={styles.badge}>Active</span>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'info' && (
          <section className={styles.section}>
            <h2>Application Information</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>App Name:</span>
                <span className={styles.infoValue}>{process.env.NEXT_PUBLIC_APP_NAME}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Support Email:</span>
                <span className={styles.infoValue}>{process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Max Upload:</span>
                <span className={styles.infoValue}>
                  {(Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Framework:</span>
                <span className={styles.infoValue}>Next.js 14</span>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Environment variables detected by your extension</p>
      </footer>
    </div>
  )
}
