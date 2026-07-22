import { resolve } from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: [
    resolve(__dirname, 'assets/styles/tokens.css'),
    resolve(__dirname, 'assets/styles/base.css'),
    resolve(__dirname, 'assets/styles/utilities.css'),
    resolve(__dirname, 'assets/styles/animations.css')
  ]
})
