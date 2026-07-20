import { computed } from 'vue'
import { featureConfig, type FeatureKey } from '~/shared/config/features'
import { useRuntimeConfig } from '#imports'

export const useFeatures = () => {
  const runtime = useRuntimeConfig()

  // Allow runtimeConfig.public.featureFlags to override defaults
  const remoteFlags = computed(() => runtime?.public?.featureFlags ?? {})

  const flags = computed(() => ({ ...featureConfig, ...remoteFlags.value }))

  const isEnabled = (feature: FeatureKey) => {
    return Boolean(flags.value[feature])
  }

  return {
    flags,
    isEnabled
  }
}
