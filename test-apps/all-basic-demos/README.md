# Demo Apps for Chrome Extension Screenshots

Five demo applications showcasing environment variables and dangerous exposed secrets for your Chrome extension screenshots.

## 🎯 Apps Included

### Basic Environment Variables Demos

### 1. Vite + React Demo (`/vite-demo`)
- **Framework**: Vite + React
- **Env Prefix**: `VITE_`
- **Port**: 5173
- **Features**: Modern, fast build tool with beautiful gradient UI

### 2. Next.js Demo (`/nextjs-demo`)
- **Framework**: Next.js 14 (App Router)
- **Env Prefix**: `NEXT_PUBLIC_`
- **Port**: 3000
- **Features**: Server-side rendering, dark theme with tabs

### 3. React Demo (`/react-demo`)
- **Framework**: Create React App
- **Env Prefix**: `REACT_APP_`
- **Port**: 3000
- **Features**: Classic React setup with API integration demo

### Dangerous Exposed Secrets Demos

### 4. Security Dashboard (`/security-dashboard`)
- **Framework**: Vite + React
- **Env Prefix**: `VITE_`
- **Port**: 5173
- **Features**: Dark security-themed UI showcasing 30+ exposed dangerous API keys
- **Highlights**: AWS, Stripe, OpenAI, GitHub, Slack, Firebase, databases, crypto exchanges
- **Perfect for**: Demonstrating security warnings and threat detection

### 5. Leaked Credentials Dashboard (`/leaked-credentials`)
- **Framework**: Next.js 14 (App Router)
- **Env Prefix**: `NEXT_PUBLIC_`
- **Port**: 3001
- **Features**: Colorful animated gradient UI with 50+ exposed credentials
- **Highlights**: Complete Firebase config, Auth0, payment gateways, cloud storage, CI/CD tokens
- **Perfect for**: High-impact screenshots showing comprehensive secret detection

## 🚀 Quick Setup

### Vite Demo
```bash
cd vite-demo
npm install
npm run dev
# Opens at http://localhost:5173
```

### Next.js Demo
```bash
cd nextjs-demo
npm install
npm run dev
# Opens at http://localhost:3000
```

### React Demo
```bash
cd react-demo
npm install
npm start
# Opens at http://localhost:3000
```

### Security Dashboard (Dangerous Keys)
```bash
cd security-dashboard
npm install
npm run dev
# Opens at http://localhost:5173
```

### Leaked Credentials (Dangerous Keys)
```bash
cd leaked-credentials
npm install
npm run dev
# Opens at http://localhost:3001
```

## 📸 Taking Screenshots

### Best Practices for Chrome Store Screenshots

1. **Use Full Browser Width** (1280px or wider)
2. **Capture the Extension Popup** showing detected environment variables
3. **Show Different Scenarios**:
   - Vite demo: Clean, modern environment display
   - Next.js demo: Multiple tabs showing features
   - React demo: Live API integration with status cards
   - Security Dashboard: Dark theme showing critical security alerts
   - Leaked Credentials: Colorful UI highlighting exposed secrets

4. **Recommended Screenshot Sequence**:
   - Screenshot 1: Security Dashboard with extension detecting 30+ dangerous keys
   - Screenshot 2: Extension popup showing severity levels (Critical, High, Medium)
   - Screenshot 3: Leaked Credentials dashboard with colorful categorization
   - Screenshot 4: Vite demo with extension popup overlay
   - Screenshot 5: Next.js demo showing configuration tab
   - Screenshot 6: React demo showing API integration
   - Screenshot 7: Extension settings or security recommendations

### Screenshot Tips

- **Clear the console** before taking screenshots
- **Zoom to 100%** for crisp images
- **Use Chrome DevTools responsive mode** for consistent sizing
- **Highlight key features** with your extension's UI
- **Show real-world value** - these demos include realistic env vars
- **Emphasize security warnings** for dangerous keys (AWS, Stripe, databases)
- **Show the pattern matching** with key formats displayed

## 🎨 Each Demo Features

### Vite Demo Environment Variables
- API URL and API Key
- Feature flags (Analytics, Dark Mode)
- App version and environment
- Upload size limits
- Stripe public key

### Next.js Demo Environment Variables
- API endpoints
- Google Analytics ID
- Stripe publishable key
- Beta feature toggles
- App configuration (name, email, CDN)

### React Demo Environment Variables
- API base URL (with live data fetching)
- Firebase configuration (API key, project ID, auth domain)
- Logging and monitoring (Sentry DSN)
- Version and build information
- Environment designation

### Security Dashboard (Dangerous Keys) 🔴
**30+ Critical & High-Risk Credentials:**
- **AWS**: Access keys, secret keys, session tokens
- **Stripe**: Live secret keys, restricted keys
- **OpenAI & Anthropic**: AI API keys (expensive!)
- **GitHub**: Personal access tokens, OAuth tokens
- **Slack**: Bot tokens, user tokens, webhooks
- **Databases**: MongoDB, PostgreSQL, Redis connection strings
- **Firebase**: Complete configuration
- **Email Services**: SendGrid, Mailgun, Twilio
- **Payment Gateways**: PayPal, Square
- **Crypto**: Coinbase, Binance API keys
- **Infrastructure**: Azure, DigitalOcean, Heroku
- **Private Keys**: RSA keys, JWT secrets

### Leaked Credentials Dashboard (Dangerous Keys) 🟠
**50+ Exposed Secrets Across 12 Categories:**
- Complete AWS infrastructure access
- Payment processing (Stripe, PayPal, Square)
- AI services (OpenAI with org IDs)
- GitHub tokens (PAT, OAuth, App)
- Slack workspace access
- Multiple database credentials
- Complete Firebase project config
- Email service keys (SendGrid, Mailgun, MailChimp)
- Cloud storage (AWS S3, Cloudinary, Azure)
- SMS/Phone (Twilio with all credentials)
- CI/CD tokens (CircleCI, GitLab, Netlify)
- Container registry (Docker Hub, NPM)
- Analytics (Segment, Datadog, New Relic)
- Auth providers (Auth0 complete config)
- Cryptocurrency exchange APIs

## 🚨 Dangerous Key Patterns Detected

Your extension should recognize these patterns:

### Critical Patterns
- **AWS**: `AKIA[0-9A-Z]{16}` (Access Key), `[A-Za-z0-9/+=]{40}` (Secret)
- **Stripe**: `sk_live_[0-9a-zA-Z]{24}`, `rk_live_[0-9a-zA-Z]{24}`
- **OpenAI**: `sk-proj-[A-Za-z0-9]{48}`
- **Anthropic**: `sk-ant-api03-[A-Za-z0-9-_]{95}`
- **GitHub**: `ghp_[A-Za-z0-9]{36}`, `gho_[A-Za-z0-9]{36}`
- **MongoDB**: `mongodb+srv://[credentials]@`
- **PostgreSQL**: `postgresql://[credentials]@`

### High-Risk Patterns
- **Slack**: `xoxb-[0-9]+-[0-9]+-[a-zA-Z0-9]+`
- **SendGrid**: `SG\.[a-zA-Z0-9_-]{22,}`
- **Twilio**: `SK[a-z0-9]{32}`, `AC[a-z0-9]{32}`
- **Firebase**: `AIza[0-9A-Za-z\\-_]{35}`
- **PayPal**: Pattern varies by credential type
- **Private Keys**: `-----BEGIN RSA PRIVATE KEY-----`

See demos for 50+ more patterns!

## 💡 Tips for Extension Screenshots

1. **Show the extension detecting variables immediately** on page load
2. **Demonstrate the count** of environment variables found
3. **Highlight sensitive data warnings** if your extension has them
4. **Show filtering or search capabilities** in your extension
5. **Display copy-to-clipboard features** if available

## 🎯 Environments Shown

All demos display realistic production-like configurations:
- API endpoints and keys
- Third-party service integrations (Stripe, Firebase, Analytics)
- Feature flags and toggles
- Version information
- Environment-specific settings

## 📦 What's Different in Each Framework?

| Feature | Vite | Next.js | React (CRA) |
|---------|------|---------|-------------|
| Prefix | `VITE_` | `NEXT_PUBLIC_` | `REACT_APP_` |
| Access | `import.meta.env` | `process.env` | `process.env` |
| Reload | Hot | Hot | Full reload |
| Build | Rollup | Webpack/Turbopack | Webpack |

## 🔧 Customization

To add more environment variables for your screenshots:

1. **Edit the `.env` file** in each demo
2. **Follow the naming convention** (VITE_, NEXT_PUBLIC_, or REACT_APP_)
3. **Update the component** to display new variables
4. **Restart the dev server**

## ✨ Perfect For

- Chrome Web Store screenshots
- Extension documentation
- Marketing materials
- Tutorial videos
- Blog posts about your extension
- Security awareness training
- Demonstrating threat detection capabilities

## 🔐 Security Extension Features to Highlight

Your extension should showcase:

1. **Pattern Recognition**: Detect 50+ secret formats
2. **Severity Classification**: Critical, High, Medium, Low
3. **Service Identification**: Recognize AWS, GitHub, Stripe, etc.
4. **Real-time Detection**: Alert immediately on page load
5. **Impact Assessment**: Explain what attackers could do
6. **Remediation Guidance**: Suggest how to fix exposures
7. **Export Functionality**: Save findings for security teams
8. **Dashboard Integration**: Track findings over time

## 🎯 Use Cases for Each Demo

- **Vite/Next.js/React Demos**: Show basic environment variable detection
- **Security Dashboard**: Demonstrate comprehensive threat detection with severity levels
- **Leaked Credentials**: Highlight enterprise-scale secret detection capabilities

## 📊 Statistics to Showcase

Based on real-world research:
- **39M secrets** leaked on GitHub in 2024
- **90% remain active** 5 days after detection
- **Attackers exploit** credentials within 5 minutes
- **AWS keys** compromised lead to infrastructure takeover
- **Payment keys** enable financial fraud
- **Database credentials** allow data theft

Use these demos to show how your extension prevents these scenarios!

---

**Pro Tip**: Run all five demos simultaneously on different ports to quickly switch between them while taking screenshots. The Security Dashboard and Leaked Credentials demos provide the most impactful visuals for showcasing security features!
