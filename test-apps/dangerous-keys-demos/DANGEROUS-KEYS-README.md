# 🔐 Dangerous Keys Detection - Demo Apps for Chrome Extension

Professional demo applications showcasing **exposed sensitive credentials** that your Chrome extension detects. Perfect for Chrome Web Store screenshots and documentation.

## 🎯 Demo Apps Included

### 1. **Multi-Cloud Security Scanner** (`/multicloud-demo`)
**Theme:** Cyberpunk / Matrix-style  
**Port:** 5174  
**Exposed Secrets:**
- ☁️ **AWS**: Access Keys, Secret Keys, Session Tokens
- 🔷 **Azure**: Client ID, Client Secret, Tenant ID, Subscription ID  
- 🔴 **Google Cloud**: API Keys, Service Account Credentials, Project IDs

**UI Features:**
- Animated security scan overlay
- Tabbed interface for switching between cloud providers
- Glowing neon effects and animated threat indicators
- Real-time threat statistics dashboard
- Color-coded severity levels (Critical/High/Medium)

### 2. **Payment Gateway Scanner** (`/payment-apis-demo`)
**Theme:** Neon / Synthwave  
**Port:** 5175  
**Exposed Secrets:**
- 💳 **Stripe**: Secret Keys, Publishable Keys, Webhook Secrets
- 🅿️ **PayPal**: Client ID, Client Secret, Webhook IDs
- ⬛ **Square**: Access Tokens, Application IDs
- 📞 **Twilio**: Account SID, Auth Tokens

**UI Features:**
- Radiant neon glow effects
- Provider-specific color schemes
- Financial impact warnings
- Interactive provider selection buttons
- Animated alert banners

## 🚀 Quick Start

### Installation & Running

```bash
# Multi-Cloud Demo
cd multicloud-demo
npm install
npm run dev
# Opens at http://localhost:5174

# Payment APIs Demo
cd payment-apis-demo
npm install
npm run dev
# Opens at http://localhost:5175
```

## 📸 Screenshot Guidelines

### Best Practices for Chrome Store

1. **Use High Resolution**: 1280x800 or 1920x1080
2. **Show Extension Popup**: Overlay your extension's detection popup on these demos
3. **Capture Key Moments**:
   - The scanning animation (if timed right)
   - Full list of detected secrets
   - Severity indicators and warnings
   - Different cloud/payment providers

### Recommended Screenshot Sequence

**Screenshot 1: Multi-Cloud - AWS Tab**
- Shows AWS credentials with CRITICAL severity
- Extension popup displaying detected AWS keys
- Threat statistics visible

**Screenshot 2: Multi-Cloud - Azure Tab**
- Different cloud provider's secrets
- Demonstrates multi-platform detection

**Screenshot 3: Payment APIs - Stripe**
- Financial credentials exposure
- Shows risk impact and cost warnings

**Screenshot 4: Payment APIs - PayPal**
- Alternative payment provider
- Demonstrates comprehensive API coverage

**Screenshot 5: Extension Close-Up**
- Focus on your extension's UI
- List all detected dangerous patterns

## 🔍 What Makes These Keys "Dangerous"

### Critical Severity (Immediate Action Required)

These credentials provide complete access to production systems:

**AWS Credentials**
- Can launch expensive EC2 instances
- Access S3 buckets with customer data
- Modify IAM policies and create backdoors
- **Real Cost**: $10,000+ in unauthorized charges (documented cases)

**Payment API Keys**
- Process unauthorized transactions
- Access customer payment information
- Create refunds and chargebacks
- **Real Cost**: Unlimited fraudulent transactions

**Azure Credentials**
- Full Azure AD access
- Subscription-level resource control
- **Real Cost**: Enterprise infrastructure compromise

### Based on Research From:

- [awslabs/git-secrets](https://github.com/awslabs/git-secrets) - AWS's official secret detection patterns
- [mazen160/secrets-patterns-db](https://github.com/mazen160/secrets-patterns-db) - 1600+ regex patterns for secret detection
- [trufflesecurity/trufflehog](https://github.com/trufflesecurity/trufflehog) - 800+ secret types classification
- [Puliczek/awesome-list-of-secrets-in-environment-variables](https://github.com/Puliczek/awesome-list-of-secrets-in-environment-variables) - Comprehensive environment variable secrets list

## 🎨 Design Themes Explained

### Cyberpunk Theme (Multi-Cloud)
- **Colors**: Cyan (#00f5ff), Pink (#ff006e), Purple (#8b5cf6)
- **Inspiration**: Matrix, cybersecurity aesthetics
- **Effect**: Conveys technical security scanning
- **Perfect For**: Enterprise/DevOps audience

### Neon Theme (Payment APIs)
- **Colors**: Neon Pink (#ff0080), Neon Blue (#00d9ff), Neon Green (#39ff14)
- **Inspiration**: Synthwave, 80s neon
- **Effect**: Eye-catching, modern
- **Perfect For**: FinTech/Security audience

## 💡 Customization Tips

### Adding More Secrets

Edit the `.env` file in each demo:

```bash
# Multi-Cloud Demo
cd multicloud-demo
nano .env
# Add: VITE_YOUR_NEW_KEY=value

# Payment APIs Demo  
cd payment-apis-demo
nano .env
# Add: VITE_YOUR_NEW_KEY=value
```

Then update the component arrays in `src/App.jsx` to display them.

### Changing Colors

Each demo has CSS variables in `src/App.css`:

```css
/* Multi-Cloud */
--cyber-pink: #ff006e;
--cyber-blue: #00f5ff;

/* Payment APIs */
--neon-pink: #ff0080;
--neon-blue: #00d9ff;
```

## 📊 Exposed Secrets by Category

| Category | Secrets | Severity | Demos |
|----------|---------|----------|-------|
| Cloud (AWS) | 3 keys | CRITICAL | Multi-Cloud |
| Cloud (Azure) | 4 keys | CRITICAL | Multi-Cloud |
| Cloud (GCP) | 3 keys | CRITICAL | Multi-Cloud |
| Payments (Stripe) | 3 keys | CRITICAL | Payment APIs |
| Payments (PayPal) | 3 keys | CRITICAL | Payment APIs |
| Payments (Square) | 2 keys | CRITICAL | Payment APIs |
| Communications | 2 keys | CRITICAL | Payment APIs |

**Total: 20 Dangerous Credentials Exposed**

## 🛡️ Security Education Value

These demos help users understand:

1. **What exposed keys look like** in real applications
2. **The severity** of different credential types
3. **Financial impact** of exposed payment keys
4. **Attack vectors** enabled by each secret type
5. **Why detection matters** for preventing breaches

## 🎬 Marketing Use Cases

- **Chrome Web Store Screenshots**: Show your extension in action
- **Blog Posts**: Illustrate security concepts
- **Documentation**: Provide visual examples
- **Social Media**: Eye-catching security demos
- **Product Demos**: Live presentations to customers

## ⚠️ Disclaimer

All credentials in these demos are:
- ✅ **Fictional examples** (not real working keys)
- ✅ **Safe to display publicly**
- ✅ **Based on real patterns** but with dummy values
- ✅ **For educational purposes only**

**Never** use real production credentials in demos or screenshots.

## 📝 Additional Resources

### Secret Detection Patterns
- [GitHub Secret Scanning Patterns](https://docs.github.com/en/code-security/secret-scanning/introduction/supported-secret-scanning-patterns)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

### Real-World Incidents
- Uber 2016: $57M records exposed via GitHub keys
- Tesla 2018: AWS keys in public repo led to cryptomining
- Codecov 2021: Credential harvesting supply chain attack

## 🤝 Contributing

Want to add more secret types? Create an issue or PR with:
1. New secret patterns (with dummy values)
2. Severity classification
3. Impact description
4. Suggested UI design

---

**Built with React + Vite | Designed for Security Awareness | Perfect for Chrome Extension Marketing**
