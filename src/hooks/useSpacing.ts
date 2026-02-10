import { createContext, useContext } from 'react';
import type { Density } from '../providers/SpacingProvider';

export interface SpacingContextType {
  density: Density;
  setDensity: (density: Density) => void;
  getSpacing: (category: 'component' | 'section' | 'layout' | 'micro', size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => string;
}

export const SpacingContext = createContext<SpacingContextType | undefined>(undefined);

/**
 * Hook to access spacing context
 * Moved to separate file to comply with React Fast Refresh rules
 */
export const useSpacing = () => {
  const context = useContext(SpacingContext);
  if (context === undefined) {
    throw new Error('useSpacing must be used within a SpacingProvider');
  }
  return context;
};

export default useSpacing;
