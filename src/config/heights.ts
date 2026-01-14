export interface HeightConfig {
  minHeight?: string;
  maxHeight?: string;
  fixedHeight?: string;
}

export interface SpacingHeightConfig {
  compact: string;
  default: string;
  comfortable: string;
  spacious: string;
}

export const HEIGHTS = {
  VIEWPORT: {
    HALF: 'h-1/2',
    SMALL: 'h-[60vh]',
    MEDIUM: 'h-[70vh]',
    LARGE: 'h-[80vh]',
    XLARGE: 'h-[90vh]',
    FULL: 'h-screen',
  } as const,

  VIEWPORT_MIN: {
    TINY: 'min-h-[44px]',
    SMALL: 'min-h-[100px]',
    MEDIUM: 'min-h-[200px]',
    LARGE: 'min-h-[400px]',
    HERO: 'min-h-[90vh]',
  } as const,

  VIEWPORT_MAX: {
    SMALL: 'max-h-[200px]',
    MEDIUM: 'max-h-[400px]',
    COMPACT: 'max-h-[600px]',
    HALF: 'max-h-[50vh]',
    TALL: 'max-h-[70vh]',
    TALLER: 'max-h-[80vh]',
    TALLEST: 'max-h-[90vh]',
  } as const,

  MODAL: {
    CONTENT: 'max-h-[70vh]',
    FULL: 'max-h-[90vh]',
    SCROLLABLE: 'max-h-[60vh]',
    COMPACT: 'max-h-[200px]',
  } as const,

  CONTENT: {
    MINIMUM: 'min-h-[44px]',
    CARD: 'min-h-[100px]',
    SECTION: 'min-h-[200px]',
    TABLE: 'min-h-[400px]',
    PAGE: 'min-h-[90vh]',
  } as const,

  OVERLAY: {
    MINIMUM: 'min-h-[200px]',
  } as const,
} as const;

export const HEIGHT_CLASSES = {
  MODAL: {
    FULL: 'max-h-[90vh]',
    CONTENT: 'max-h-[70vh]',
    SCROLLABLE: 'max-h-[60vh]',
    COMPACT: 'max-h-[200px]',
  } as const,

  NOTIFICATION: {
    CENTER: 'max-h-[80vh]',
    LIST: 'max-h-[60vh]',
  } as const,

  PARENT: {
    VIEW: 'max-h-[80vh]',
    SETTINGS: 'max-h-[90vh]',
  } as const,

  MATERIAL: {
    LIST: 'max-h-[600px]',
    MODAL: 'max-h-[90vh]',
  } as const,

  FORM: {
    MINIMUM: 'min-h-[44px]',
    CALENDAR_CELL: 'min-h-[60px]',
    CALENDAR_CELL_DESKTOP: 'min-h-[100px]',
  } as const,

  OFFLINE: {
    INDICATOR: 'min-w-[120px]',
    BANNER: 'min-w-[200px]',
  } as const,

  HERO: 'min-h-[90vh]' as const,
  SECTION: 'min-h-[200px]' as const,
  TABLE: 'min-h-[400px]' as const,
  OVERLAY: 'min-h-[200px]' as const,
  DIALOG: 'min-h-[400px]' as const,
} as const;

export const getHeightClass = (key: keyof typeof HEIGHT_CLASSES): string => {
  return HEIGHT_CLASSES[key] as string;
};

export const getViewportHeight = (size: keyof typeof HEIGHTS.VIEWPORT): string => {
  return HEIGHTS.VIEWPORT[size];
};

export const getMinHeight = (size: keyof typeof HEIGHTS.VIEWPORT_MIN): string => {
  return HEIGHTS.VIEWPORT_MIN[size];
};

export const getMaxHeight = (size: keyof typeof HEIGHTS.VIEWPORT_MAX): string => {
  return HEIGHTS.VIEWPORT_MAX[size];
};
