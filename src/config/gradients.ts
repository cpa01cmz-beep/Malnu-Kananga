export interface GradientConfig {
  from: string;
  to: string;
  direction?: 'to-br' | 'to-bl' | 'to-tr' | 'to-tl' | 'to-r' | 'to-l' | 'to-b' | 'to-t';
  text?: 'light' | 'dark';
}

export const GRADIENTS = {
  PRIMARY: {
    main: {
      from: 'from-primary-500',
      to: 'to-primary-600',
      direction: 'to-br',
      text: 'light' as const,
    },
    medium: {
      from: 'from-primary-400',
      to: 'to-primary-600',
      direction: 'to-br',
      text: 'light' as const,
    },
    light: {
      from: 'from-primary-100',
      to: 'to-primary-200',
      direction: 'to-br',
      text: 'dark' as const,
    },
    subtle: {
      from: 'from-primary-50',
      to: 'to-primary-100/50',
      direction: 'to-br',
      text: 'dark' as const,
    },
  },
  NEUTRAL: {
    main: {
      from: 'from-neutral-50',
      to: 'to-neutral-100/80',
      direction: 'to-br',
      text: 'dark' as const,
    },
    dark: {
      from: 'from-neutral-800',
      to: 'to-neutral-800/80',
      direction: 'to-br',
      text: 'light' as const,
    },
  },
  BLUE: {
    main: {
      from: 'from-blue-500',
      to: 'to-indigo-600',
      direction: 'to-br',
      text: 'light' as const,
    },
    light: {
      from: 'from-blue-100',
      to: 'to-blue-200',
      direction: 'to-br',
      text: 'dark' as const,
    },
    soft: {
      from: 'from-blue-100',
      to: 'to-blue-200/50',
      direction: 'to-br',
      text: 'dark' as const,
    },
  },
  GREEN: {
    main: {
      from: 'from-green-500',
      to: 'to-emerald-600',
      direction: 'to-br',
      text: 'light' as const,
    },
    medium: {
      from: 'from-green-400',
      to: 'to-green-600',
      direction: 'to-br',
      text: 'light' as const,
    },
    light: {
      from: 'from-green-100',
      to: 'to-green-200',
      direction: 'to-br',
      text: 'dark' as const,
    },
    soft: {
      from: 'from-green-50',
      to: 'to-emerald-50',
      direction: 'to-br',
      text: 'dark' as const,
    },
  },
  PURPLE: {
    main: {
      from: 'from-purple-500',
      to: 'to-pink-600',
      direction: 'to-br',
      text: 'light' as const,
    },
    light: {
      from: 'from-purple-100',
      to: 'to-purple-200',
      direction: 'to-br',
      text: 'dark' as const,
    },
    soft: {
      from: 'from-purple-50',
      to: 'to-pink-50',
      direction: 'to-br',
      text: 'dark' as const,
    },
  },
  ORANGE: {
    main: {
      from: 'from-orange-500',
      to: 'to-red-600',
      direction: 'to-br',
      text: 'light' as const,
    },
    light: {
      from: 'from-orange-100',
      to: 'to-orange-200',
      direction: 'to-br',
      text: 'dark' as const,
    },
    soft: {
      from: 'from-orange-50',
      to: 'to-red-50',
      direction: 'to-br',
      text: 'dark' as const,
    },
    yellow: {
      from: 'from-yellow-500',
      to: 'to-orange-600',
      direction: 'to-br',
      text: 'light' as const,
    },
  },
  INDIGO: {
    main: {
      from: 'from-indigo-500',
      to: 'to-purple-600',
      direction: 'to-br',
      text: 'light' as const,
    },
    light: {
      from: 'from-indigo-100',
      to: 'to-indigo-200',
      direction: 'to-br',
      text: 'dark' as const,
    },
  },
  BLUE_PURPLE: {
    main: {
      from: 'from-blue-500',
      to: 'to-purple-600',
      direction: 'to-br',
      text: 'light' as const,
    },
  },
  ORANGE_GREEN: {
    soft: {
      from: 'from-orange-50',
      to: 'to-green-50',
      direction: 'to-r' as const,
    },
  },
  PRIMARY_DECORATIVE: {
    main: {
      from: 'from-primary-400',
      to: 'to-primary-600',
      direction: 'to-br' as const,
    },
    soft: {
      from: 'from-primary-100',
      to: 'to-transparent',
      direction: 'to-br' as const,
    },
  },
  CHAT_HEADER: {
    from: 'from-primary-600',
    to: 'to-primary-700',
    direction: 'to-r' as const,
  },
  BACKGROUND: {
    app: {
      from: 'from-[var(--color-surface)]',
      to: 'to-[var(--color-background)]',
      direction: 'to-br' as const,
    },
    hero: {
      from: 'from-primary-50/90',
      to: 'to-primary-100/70',
      direction: 'to-br' as const,
    },
    section: {
      from: 'from-white',
      to: 'to-neutral-50/60',
      direction: 'to-b' as const,
    },
    sectionAlt: {
      from: 'from-neutral-50/70',
      to: 'to-neutral-100/50',
      direction: 'to-b' as const,
    },
    footer: {
      from: 'from-primary-50/90',
      to: 'to-transparent',
      direction: 'to-t' as const,
    },
    profile: {
      from: 'from-white',
      to: 'to-neutral-100/50',
      direction: 'to-b' as const,
    },
    ppdb: {
      from: 'from-primary-50/80',
      to: 'to-neutral-50/60',
      direction: 'to-br' as const,
    },
    relatedLinks: {
      from: 'from-white',
      to: 'to-neutral-100/50',
      direction: 'to-b' as const,
    },
    programs: {
      from: 'from-white',
      to: 'to-neutral-50',
      direction: 'to-b' as const,
    },
    news: {
      from: 'from-neutral-50/70',
      to: 'to-neutral-100/50',
      direction: 'to-b' as const,
    },
  },
} as const;

export const GRADIENT_CLASSES = {
  PRIMARY: 'bg-gradient-to-br from-primary-500 to-primary-600',
  PRIMARY_MEDIUM: 'bg-gradient-to-br from-primary-400 to-primary-600',
  PRIMARY_LIGHT: 'bg-gradient-to-br from-primary-100 to-primary-200',
  PRIMARY_SUBTLE: 'bg-gradient-to-br from-primary-50 to-primary-100/50',
  NEUTRAL: 'bg-gradient-to-br from-neutral-50 to-neutral-100/80',
  NEUTRAL_DARK: 'bg-gradient-to-br from-neutral-800 to-neutral-800/80',
  BLUE_MAIN: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  BLUE_LIGHT: 'bg-gradient-to-br from-blue-100 to-blue-200',
  BLUE_SOFT: 'bg-gradient-to-br from-blue-100 to-blue-200/50',
  BLUE_PURPLE: 'bg-gradient-to-br from-blue-500 to-purple-600',
  GREEN_MAIN: 'bg-gradient-to-br from-green-500 to-emerald-600',
  GREEN_MEDIUM: 'bg-gradient-to-br from-green-400 to-green-600',
  GREEN_LIGHT: 'bg-gradient-to-br from-green-100 to-green-200',
  GREEN_SOFT: 'bg-gradient-to-br from-green-50 to-emerald-50',
  GREEN_TEAL: 'bg-gradient-to-br from-green-500 to-teal-600',
  PURPLE_MAIN: 'bg-gradient-to-br from-purple-500 to-pink-600',
  PURPLE_LIGHT: 'bg-gradient-to-br from-purple-100 to-purple-200',
  PURPLE_SOFT: 'bg-gradient-to-br from-purple-50 to-pink-50',
  ORANGE_MAIN: 'bg-gradient-to-br from-orange-500 to-red-600',
  ORANGE_LIGHT: 'bg-gradient-to-br from-orange-100 to-orange-200',
  ORANGE_SOFT: 'bg-gradient-to-br from-orange-50 to-red-50',
  ORANGE_YELLOW: 'bg-gradient-to-br from-yellow-500 to-orange-600',
  ORANGE_GREEN: 'bg-gradient-to-r from-orange-50 to-green-50',
  INDIGO_MAIN: 'bg-gradient-to-br from-indigo-500 to-purple-600',
  INDIGO_LIGHT: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
  APP_BACKGROUND: 'bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-background)]',
  HERO: 'bg-gradient-to-br from-primary-50/90 via-white/80 to-primary-100/70',
  HERO_DECORATIVE: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-200/40 via-transparent to-transparent',
  SECTION: 'bg-gradient-to-b from-white via-neutral-50/60 to-neutral-100/50',
  SECTION_ALT: 'bg-gradient-to-b from-white via-neutral-50/70 to-neutral-100/50',
  FOOTER: 'bg-gradient-to-t from-primary-50/90 via-primary-50/50 to-transparent',
  PROFILE: 'bg-gradient-to-b from-white via-neutral-50/60 to-neutral-100/50',
  PPDB: 'bg-gradient-to-br from-primary-50/80 via-white to-neutral-50/60',
  RELATED_LINKS: 'bg-gradient-to-b from-white via-neutral-50/70 to-neutral-100/50',
  PROGRAMS: 'bg-gradient-to-b from-white to-neutral-50',
  NEWS: 'bg-gradient-to-b from-neutral-50/70 via-white to-neutral-100/50',
  PRIMARY_DECORATIVE: 'bg-gradient-to-br from-primary-400 to-primary-600',
  PRIMARY_DECORATIVE_SOFT: 'bg-gradient-to-br from-primary-100 to-transparent',
  CHAT_HEADER: 'bg-gradient-to-r from-primary-600 to-primary-700',
  AI_SEMANTIC: 'bg-gradient-to-r from-purple-50 to-pink-50',
} as const;

export const DARK_GRADIENT_CLASSES = {
  HERO: 'bg-gradient-to-br from-primary-900/40 dark:via-neutral-900/80 dark:to-primary-900/30',
  HERO_DECORATIVE: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-800/40 via-transparent to-transparent',
  SECTION: 'bg-gradient-to-b from-neutral-800/50 dark:via-neutral-900/40 dark:to-neutral-900/60',
  SECTION_ALT: 'bg-gradient-to-b from-neutral-800/60 dark:via-neutral-900/50 dark:to-neutral-900/70',
  FOOTER: 'bg-gradient-to-t from-primary-900/50 dark:via-primary-900/20 dark:to-transparent',
  PROFILE: 'bg-gradient-to-b from-neutral-800/50 dark:via-neutral-900/40 dark:to-neutral-900/60',
  PPDB: 'bg-gradient-to-br from-primary-900/30 dark:via-neutral-900 dark:to-neutral-900/40',
  RELATED_LINKS: 'bg-gradient-to-b from-neutral-800/60 dark:via-neutral-900/50 dark:to-neutral-900/70',
  PROGRAMS: 'bg-gradient-to-b from-neutral-800/60 dark:to-neutral-900/40',
  NEWS: 'bg-gradient-to-b from-neutral-900/50 dark:via-neutral-800/60 dark:to-neutral-900/40',
  PRIMARY_DECORATIVE: 'bg-gradient-to-br from-primary-400 to-primary-600',
  PRIMARY_DECORATIVE_SOFT: 'bg-gradient-to-br from-primary-100 to-transparent dark:from-primary-900/20',
  CHAT_HEADER: 'bg-gradient-to-r from-primary-600 to-primary-700',
  AI_SEMANTIC: 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
  PRIMARY_LIGHT: 'dark:from-primary-900/60 dark:to-primary-900/80',
  NEUTRAL: 'dark:from-neutral-900/60 dark:to-neutral-800/60',
  BLUE_SOFT: 'dark:from-blue-900/30 dark:to-blue-800/30',
  GREEN_SOFT: 'dark:from-green-900/20 dark:to-emerald-900/20',
  PURPLE_SOFT: 'dark:from-purple-900/20 dark:to-pink-900/20',
  ORANGE_SOFT: 'dark:from-orange-900/20 dark:to-red-900/20',
  ORANGE_GREEN: 'dark:from-orange-900/20 dark:to-green-900/20',
} as const;

export const getGradientClass = (key: keyof typeof GRADIENT_CLASSES): string => {
  return GRADIENT_CLASSES[key];
};

export const getGradientConfig = (config: GradientConfig): string => {
  const direction = config.direction || 'to-br';
  return `bg-gradient-to-${direction} ${config.from} ${config.to}`;
};

export const getResponsiveGradient = (lightKey: keyof typeof GRADIENT_CLASSES, darkKey?: keyof typeof DARK_GRADIENT_CLASSES): string => {
  const lightGradient = GRADIENT_CLASSES[lightKey];
  const darkGradient = darkKey ? DARK_GRADIENT_CLASSES[darkKey] : DARK_GRADIENT_CLASSES[lightKey.toUpperCase() as keyof typeof DARK_GRADIENT_CLASSES];
  
  return `${lightGradient} ${darkGradient}`;
};
