# Test Apps Docker Setup

This directory contains test applications for the Chrome Extension Environment Variable Viewer, configured with Docker for both development and production testing.

## Applications Included

### Basic Demos (all-basic-demos/)
1. **React Demo** (Create React App)
   - Dev: http://localhost:3001
   - Prod: http://localhost:3002
   - Framework: React with react-scripts
   - Env prefix: `REACT_APP_*`

2. **Vite Demo**
   - Dev: http://localhost:5173
   - Prod: http://localhost:4173
   - Framework: Vite + React
   - Env prefix: `VITE_*`

3. **Next.js Demo**
   - Dev: http://localhost:3003
   - Prod: http://localhost:3004
   - Framework: Next.js
   - Env prefix: `NEXT_PUBLIC_*`

### Dangerous Keys Demos (dangerous-keys-demos/)
4. **Multicloud Demo**
   - Dev: http://localhost:5174
   - Prod: http://localhost:5184
   - Contains mock AWS, Azure, GCP credentials
   - Env prefix: `VITE_*`

5. **Payment APIs Demo**
   - Dev: http://localhost:5175
   - Prod: http://localhost:5185
   - Contains mock payment API keys (Stripe, PayPal, etc.)
   - Env prefix: `VITE_*`

## Quick Start

### Run All Apps (Development Mode)
```bash
docker compose up react-demo-dev vite-demo-dev nextjs-demo-dev multicloud-demo-dev payment-demo-dev
```

### Run All Apps (Production Mode)
```bash
docker compose up react-demo-prod vite-demo-prod nextjs-demo-prod multicloud-demo-prod payment-demo-prod
```

### Run Everything (Dev + Prod)
```bash
docker compose up
```

**Note:** This guide uses `docker compose` (Docker Compose V2). If you have the older version, use `docker-compose` instead.

### Run Individual Apps

**React Demo:**
```bash
# Development
docker compose up react-demo-dev

# Production
docker compose up react-demo-prod
```

**Vite Demo:**
```bash
# Development
docker compose up vite-demo-dev

# Production
docker compose up vite-demo-prod
```

**Next.js Demo:**
```bash
# Development
docker compose up nextjs-demo-dev

# Production
docker compose up nextjs-demo-prod
```

**Multicloud Demo:**
```bash
# Development
docker compose up multicloud-demo-dev

# Production
docker compose up multicloud-demo-prod
```

**Payment APIs Demo:**
```bash
# Development
docker compose up payment-demo-dev

# Production
docker compose up payment-demo-prod
```

## Testing the Extension

1. **Start the desired apps**:
   ```bash
   docker compose up [service-name]
   ```

2. **Open Chrome and load the extension**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

3. **Test on each app**:
   - Navigate to each running app's URL
   - Click the extension icon
   - Verify environment variables are detected

4. **Compare Dev vs Prod**:
   - Test the same app in both dev and prod modes
   - Verify the extension works in both scenarios
   - Check that bundled variables are detected in production builds

## Expected Behavior

### Development Mode
- Environment variables should be available on `window` object
- Variables may also be in bundled JavaScript
- Live reload/HMR should work

### Production Mode
- Environment variables are baked into bundled JavaScript
- Extension should parse bundled scripts
- Variables should be detected from minified code

## Rebuilding

If you make changes to the apps or Dockerfiles:

```bash
# Rebuild specific service
docker compose build [service-name]

# Rebuild everything
docker compose build

# Force rebuild and restart
docker compose up --build [service-name]
```

## Cleanup

```bash
# Stop all containers
docker compose down

# Stop and remove volumes
docker compose down -v

# Remove all images
docker compose down --rmi all
```

## Troubleshooting

### Port Conflicts
If ports are already in use, modify the ports in `docker-compose.yml`:
```yaml
ports:
  - "NEW_PORT:CONTAINER_PORT"
```

### Build Failures
```bash
# Clean rebuild
docker compose down -v
docker compose build --no-cache [service-name]
docker compose up [service-name]
```

### Hot Reload Not Working
Development containers use volume mounts for hot reload. If changes aren't reflected:
1. Check file permissions
2. Try adding `CHOKIDAR_USEPOLLING=true` environment variable
3. Restart the container

## Running Without Docker

Each app can also be run locally without Docker:

```bash
cd [app-directory]
npm install
npm run dev     # Development
npm run build   # Build for production
npm start       # Serve production (Next.js)
npm run preview # Serve production (Vite)
```

## Environment Variables

Each app has its own `.env` or `.env.local` file with test environment variables. These files contain safe, mock values for testing purposes.

⚠️ **The dangerous-keys-demos intentionally contain patterns that look like real API keys for security testing purposes. These are NOT real credentials.**
