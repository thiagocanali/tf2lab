import { computed } from 'vue'
import { featureConfig, type FeatureKey } from '~/shared/config/features'

export const useFeatures = () => {
  const flags = computed(() => featureConfig)

  const isEnabled = (feature: FeatureKey) => {
    return Boolean(flags.value[feature])
  }

  return {
    flags,
    isEnabled
  }
}
