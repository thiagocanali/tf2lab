import { resolve } from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@primevue/nuxt-module'
  ],

  css: [
    resolve(__dirname, 'assets/styles/tokens.css'),
    resolve(__dirname, 'assets/styles/base.css'),
    resolve(__dirname, 'assets/styles/utilities.css'),
    resolve(__dirname, 'assets/styles/animations.css')
  ],

  primevue: {
    importTheme: {
      from: '@primevue/themes/nora',
      as: 'Nora'
    },
    options: {
      ripple: true,
      inputStyle: 'filled'
    }
  }
})
