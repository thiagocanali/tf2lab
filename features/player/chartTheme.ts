/** Canvas-safe TF2 colors. ECharts does not resolve CSS variables. */
export const TF2_CHART = {
  red: '#ff3b30',
  blu: '#3a80ff',
  orange: '#ff9b33',
  text: '#f5f7fb',
  textSoft: '#a9b0cc',
  muted: '#7f8abf',
  axis: 'rgba(255, 255, 255, 0.14)',
  split: 'rgba(255, 255, 255, 0.06)'
} as const

/** ECharts canvas cannot resolve CSS variables like `var(--tf2-red)`. */
export function resolveChartColor(color?: string): string {
  if (!color) return TF2_CHART.red
  if (color.includes('tf2-blu') || color === TF2_CHART.blu) return TF2_CHART.blu
  if (color.includes('tf2-orange') || color === TF2_CHART.orange) return TF2_CHART.orange
  if (color.includes('tf2-red') || color.includes('accent') || color.startsWith('var(')) {
    return TF2_CHART.red
  }
  return color
}

export const tf2Tooltip = {
  backgroundColor: 'rgba(18, 20, 32, 0.96)',
  borderColor: 'rgba(255, 155, 51, 0.45)',
  borderWidth: 1,
  textStyle: {
    color: TF2_CHART.text,
    fontSize: 13,
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  extraCssText:
    'box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45); border-radius: 10px; padding: 8px 12px;'
}
