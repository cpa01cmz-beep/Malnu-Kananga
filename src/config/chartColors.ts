export const CHART_COLORS = {
  primary: 'hsl(var(--color-primary-500))',
  primaryDark: 'hsl(var(--color-primary-600))',
  green: 'hsl(var(--color-green-600))',
  blue: 'hsl(var(--color-blue-600))',
  yellow: 'hsl(var(--color-yellow-600))',
  red: 'hsl(var(--color-red-600))',
  purple: 'hsl(var(--color-purple-600))',
  pink: 'hsl(var(--color-pink-600))',
  indigo: 'hsl(var(--color-indigo-600))',
  cyan: 'hsl(var(--color-cyan-600))',
  emerald: 'hsl(var(--color-emerald-600))',
  sky: 'hsl(var(--color-sky-600))',
} as const;

export const CHART_COLORS_DARK = {
  primary: 'hsl(var(--color-primary-400))',
  primaryDark: 'hsl(var(--color-primary-500))',
  green: 'hsl(var(--color-green-500))',
  blue: 'hsl(var(--color-blue-500))',
  yellow: 'hsl(var(--color-yellow-500))',
  red: 'hsl(var(--color-red-500))',
  purple: 'hsl(var(--color-purple-500))',
  pink: 'hsl(var(--color-pink-500))',
  indigo: 'hsl(var(--color-indigo-500))',
  cyan: 'hsl(var(--color-cyan-500))',
  emerald: 'hsl(var(--color-emerald-500))',
  sky: 'hsl(var(--color-sky-500))',
} as const;

export type ChartColor = keyof typeof CHART_COLORS;

export const getChartColor = (color: ChartColor, isDark: boolean = false): string => {
  return isDark ? (CHART_COLORS_DARK[color] || CHART_COLORS[color]) : CHART_COLORS[color];
};
