import { resolve } from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: [
    resolve(__dirname, 'assets/styles/tokens.css'),
    resolve(__dirname, 'assets/styles/base.css'),
    resolve(__dirname, 'assets/styles/utilities.css'),
    resolve(__dirname, 'assets/styles/animations.css')
  ],

  runtimeConfig: {
    steamApiKey: process.env.STEAM_API_KEY,
    public: {
      logsTfUrl: process.env.LOGS_TF_URL || 'https://logs.tf/api/v1/log'
    }
  }
})
