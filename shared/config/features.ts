export const featureConfig = {
  analytics: false,
  competitions: false,
  academy: false
} as const

export type FeatureKey = keyof typeof featureConfig
