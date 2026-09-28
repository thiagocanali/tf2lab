export default defineNuxtPlugin(() => {
  const { locale } = useLocale()
  useHead(() => ({ htmlAttrs: { lang: locale.value === 'pt' ? 'pt-BR' : 'en' } }))
})
