import React, { useState, useEffect } from 'react';
import { SpacingContext } from '../hooks/useSpacing';

export type Density = 'comfortable' | 'compact' | 'spacious';

const SPACING_PRESETS = {
  comfortable: {
    component: {
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
    section: {
      xs: 'py-4',
      sm: 'py-6',
      md: 'py-8',
      lg: 'py-12',
      xl: 'py-16',
    },
    layout: {
      xs: 'gap-2',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
    },
    micro: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
    },
  },
  compact: {
    component: {
      xs: 'p-1',
      sm: 'p-2',
      md: 'p-3',
      lg: 'p-4',
      xl: 'p-6',
    },
    section: {
      xs: 'py-2',
      sm: 'py-4',
      md: 'py-6',
      lg: 'py-8',
      xl: 'py-12',
    },
    layout: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
    micro: {
      xs: 'gap-0.5',
      sm: 'gap-1',
      md: 'gap-2',
      lg: 'gap-3',
      xl: 'gap-4',
    },
  },
  spacious: {
    component: {
      xs: 'p-3',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12',
    },
    section: {
      xs: 'py-6',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-24',
    },
    layout: {
      xs: 'gap-3',
      sm: 'gap-6',
      md: 'gap-8',
      lg: 'gap-12',
      xl: 'gap-16',
    },
    micro: {
      xs: 'gap-2',
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
  },
};

export const SpacingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [density, setDensity] = useState<Density>(() => {
    // Check for saved preference or use system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('malnu_spacing_density') as Density;
      if (saved && ['comfortable', 'compact', 'spacious'].includes(saved)) {
        return saved;
      }
      
      // Use compact on mobile by default
      if (window.innerWidth < 768) {
        return 'compact';
      }
    }
    return 'comfortable';
  });

  useEffect(() => {
    localStorage.setItem('malnu_spacing_density', density);
  }, [density]);

  const getSpacing = (category: 'component' | 'section' | 'layout' | 'micro', size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): string => {
    return SPACING_PRESETS[density][category][size];
  };

  return (
    <SpacingContext.Provider value={{ density, setDensity, getSpacing }}>
      {children}
    </SpacingContext.Provider>
  );
};

export default SpacingProvider;
