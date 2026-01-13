export interface DimensionConfig {
  className: string;
  description: string;
  usage: string[];
}

export const DIMENSIONS = {
  MIN_HEIGHT: {
    TOUCH_TARGET: 'min-h-[44px]',
    SMALL: 'min-h-[100px]',
    MEDIUM: 'min-h-[200px]',
    LARGE: 'min-h-[400px]',
    VIEWPORT: 'min-h-[90vh]',
  },
  MAX_HEIGHT: {
    SMALL: 'max-h-[50vh]',
    MEDIUM: 'max-h-[60vh]',
    LARGE: 'max-h-[70vh]',
    XL: 'max-h-[80vh]',
    XXL: 'max-h-[90vh]',
    FIXED_LARGE: 'max-h-[600px]',
  },
  MIN_WIDTH: {
    SMALL: 'min-w-[120px]',
    MEDIUM: 'min-w-[200px]',
  },
  MAX_WIDTH: {
    RESPONSIVE_MD: 'max-w-[80%]',
    RESPONSIVE_LG: 'max-w-[85%]',
  },
} as const;

export type MinHeightKey = keyof typeof DIMENSIONS.MIN_HEIGHT;
export type MaxHeightKey = keyof typeof DIMENSIONS.MAX_HEIGHT;
export type MinWidthKey = keyof typeof DIMENSIONS.MIN_WIDTH;
export type MaxWidthKey = keyof typeof DIMENSIONS.MAX_WIDTH;

export const getMinHeight = (key: MinHeightKey): string => {
  return DIMENSIONS.MIN_HEIGHT[key];
};

export const getMaxHeight = (key: MaxHeightKey): string => {
  return DIMENSIONS.MAX_HEIGHT[key];
};

export const getMinWidth = (key: MinWidthKey): string => {
  return DIMENSIONS.MIN_WIDTH[key];
};

export const getMaxWidth = (key: MaxWidthKey): string => {
  return DIMENSIONS.MAX_WIDTH[key];
};
