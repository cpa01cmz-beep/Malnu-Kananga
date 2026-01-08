export const CHART_COLORS = {
  primary: '#8EEF88',
  primaryDark: '#4FD853',
  green: '#16a34a',
  blue: '#2563eb',
  yellow: '#eab308',
  red: '#dc2626',
  purple: '#7c3aed',
  pink: '#db2777',
  indigo: '#8884d8',
  cyan: '#10b981',
  emerald: '#10b981',
  sky: '#3b82f6',
} as const;

export type ChartColor = keyof typeof CHART_COLORS;
