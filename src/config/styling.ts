export interface StylingConfig {
  className: string;
  description: string;
  usage: string[];
}

export const SHADOWS = {
  NONE: 'shadow-none',
  SM: 'shadow-sm',
  MD: 'shadow-md',
  LG: 'shadow-lg',
  XL: 'shadow-xl',
  INNER: 'shadow-inner',
  CARD: 'shadow-sm',
  CARD_HOVER: 'shadow-md',
  FLOAT: 'shadow-lg',
} as const;

export const RADIUS = {
  NONE: 'rounded-none',
  SM: 'rounded-sm',
  MD: 'rounded-md',
  LG: 'rounded-lg',
  XL: 'rounded-xl',
  '2XL': 'rounded-2xl',
  '3XL': 'rounded-3xl',
  FULL: 'rounded-full',
  TL: 'rounded-tl',
  TR: 'rounded-tr',
  BL: 'rounded-bl',
  BR: 'rounded-br',
  T: 'rounded-t',
  B: 'rounded-b',
  L: 'rounded-l',
  R: 'rounded-r',
} as const;

export const SURFACES = {
  DEFAULT: 'bg-white dark:bg-neutral-800',
  CARD: 'bg-white dark:bg-neutral-800',
  MODAL: 'bg-white dark:bg-neutral-800',
  DROPDOWN: 'bg-white dark:bg-neutral-800',
  INPUT: 'bg-white dark:bg-neutral-800',
} as const;

export const BORDERS = {
  DEFAULT: 'border border-neutral-200 dark:border-neutral-700',
  CARD: 'border border-neutral-200 dark:border-neutral-700',
  MODAL: 'border border-neutral-200 dark:border-neutral-700',
  INPUT: 'border border-neutral-200 dark:border-neutral-700',
  LIGHT: 'border-neutral-200 dark:border-neutral-700',
  HEAVY: 'border-2 border-neutral-300 dark:border-neutral-600',
} as const;

export const CONTAINERS = {
  CARD: 'bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700',
  CARD_XL: 'bg-white dark:bg-neutral-800 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700',
  CARD_LG: 'bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700',
  CARD_MD: 'bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-700',
  CARD_SM: 'bg-white dark:bg-neutral-800 rounded-md shadow-sm border border-neutral-100 dark:border-neutral-700',
  CARD_GRADIENT: 'rounded-2xl p-6 text-white shadow-lg',
  CARD_GRADIENT_LG: 'rounded-xl p-6 text-white shadow-card transition-all duration-200 ease-out',
} as const;

export type ShadowKey = keyof typeof SHADOWS;
export type RadiusKey = keyof typeof RADIUS;
export type SurfaceKey = keyof typeof SURFACES;
export type BorderKey = keyof typeof BORDERS;
export type ContainerKey = keyof typeof CONTAINERS;

export const getShadow = (key: ShadowKey): string => {
  return SHADOWS[key];
};

export const getRadius = (key: RadiusKey): string => {
  return RADIUS[key];
};

export const getSurface = (key: SurfaceKey): string => {
  return SURFACES[key];
};

export const getBorder = (key: BorderKey): string => {
  return BORDERS[key];
};

export const getContainer = (key: ContainerKey): string => {
  return CONTAINERS[key];
};
