/** Clean Commerce chart palette — design.md §10, color-system.md §17 */
export const CHART_PRIMARY = 'hsl(168 82% 33%)'
export const CHART_PRIMARY_FILL = 'hsl(168 82% 33% / 0.12)'

export const STATUS_CHART_COLORS: Record<string, string> = {
  processing: 'hsl(32 95% 44%)',
  shipping: 'hsl(207 73% 46%)',
  delivered: 'hsl(160 84% 31%)',
  canceled: 'hsl(0 72% 51%)',
}

export const CHART_GRID = 'hsl(var(--border))'
export const CHART_MUTED = 'hsl(var(--muted-foreground))'

export const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '13px',
}
