// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@primevue/nuxt-module'
  ],
  css: [
    '~/assets/styles/tokens.css',
    '~/assets/styles/base.css',
    '~/assets/styles/utilities.css',
    '~/assets/styles/animations.css'
  ],
  primevue: {
    importTheme: {
      from: '@primeuix/themes/umd/nora.js',
      as: 'theme'
    },
    options: {
      ripple: true,
      inputStyle: 'filled'
    }
  }
})
