export interface ColorIconConfig {
  className: string;
  label: string;
}

export const COLOR_ICONS: Record<string, ColorIconConfig> = {
  sky: {
    className: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400',
    label: 'Ikon Biru Langit'
  },
  emerald: {
    className: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    label: 'Ikon Hijau Zamrud'
  },
  amber: {
    className: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    label: 'Ikon Kuning Kehijauan'
  },
  indigo: {
    className: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
    label: 'Ikon Biru Nilam'
  },
  blue: {
    className: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    label: 'Ikon Biru'
  },
  red: {
    className: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
    label: 'Ikon Merah'
  },
  green: {
    className: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
    label: 'Ikon Hijau'
  },
  purple: {
    className: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
    label: 'Ikon Ungu'
  },
  orange: {
    className: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
    label: 'Ikon Oranye'
  },
  pink: {
    className: 'bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400',
    label: 'Ikon Merah Muda'
  },
  teal: {
    className: 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400',
    label: 'Ikon Teal'
  },
  cyan: {
    className: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400',
    label: 'Ikon Cyan'
  }
} as const;

export type ColorIconKey = keyof typeof COLOR_ICONS;

export const getColorIconClass = (color: ColorIconKey | string): string => {
  if (color in COLOR_ICONS) {
    return COLOR_ICONS[color as ColorIconKey].className;
  }
  return COLOR_ICONS.blue.className;
};

export const getColorIconLabel = (color: ColorIconKey | string): string => {
  if (color in COLOR_ICONS) {
    return COLOR_ICONS[color as ColorIconKey].label;
  }
  return COLOR_ICONS.blue.label;
};
