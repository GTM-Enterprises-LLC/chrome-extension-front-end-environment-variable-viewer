// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        clientPort: 3000,
      },
    },
  },
  runtimeConfig: {
    // Private keys (server-only)
    apiSecret: 'server-secret-key',
    // Public keys exposed to the client
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '',
      googleAnalyticsId: process.env.NUXT_PUBLIC_GOOGLE_ANALYTICS_ID || '',
      stripeKey: process.env.NUXT_PUBLIC_STRIPE_KEY || '',
      appName: process.env.NUXT_PUBLIC_APP_NAME || '',
      enableDarkMode: process.env.NUXT_PUBLIC_ENABLE_DARK_MODE || 'false',
      cdnUrl: process.env.NUXT_PUBLIC_CDN_URL || '',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
      maxUploadSize: process.env.NUXT_PUBLIC_MAX_UPLOAD_SIZE || '0',
    }
  },
  app: {
    head: {
      title: 'Nuxt.js Environment Demo',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    }
  }
})
