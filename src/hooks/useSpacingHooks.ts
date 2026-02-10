import { useSpacing } from '../providers/SpacingProvider';

// Utility hooks for specific spacing patterns
export const useComponentSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
  const { getSpacing } = useSpacing();
  return getSpacing('component', size);
};

export const useSectionSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
  const { getSpacing } = useSpacing();
  return getSpacing('section', size);
};

export const useLayoutSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
  const { getSpacing } = useSpacing();
  return getSpacing('layout', size);
};

export const useMicroSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
  const { getSpacing } = useSpacing();
  return getSpacing('micro', size);
};

// Responsive spacing utilities
export const useResponsiveSpacing = () => {
  const { density } = useSpacing();
  
  return {
    // Card spacing
    card: `p-4 md:p-6 ${density === 'compact' ? 'lg:p-4' : density === 'spacious' ? 'lg:p-8' : 'lg:p-6'}`,
    
    // Section spacing
    section: `py-8 md:py-12 ${density === 'compact' ? 'lg:py-8' : density === 'spacious' ? 'lg:py-16' : 'lg:py-12'}`,
    
    // Form field spacing
    formField: `mb-4 md:mb-6 ${density === 'compact' ? 'lg:mb-4' : density === 'spacious' ? 'lg:mb-8' : 'lg:mb-6'}`,
    
    // Button group spacing
    buttonGroup: `gap-2 md:gap-3 ${density === 'compact' ? 'lg:gap-2' : density === 'spacious' ? 'lg:gap-4' : 'lg:gap-3'}`,
    
    // Grid spacing
    grid: `grid gap-4 md:gap-6 ${density === 'compact' ? 'lg:gap-4' : density === 'spacious' ? 'lg:gap-8' : 'lg:gap-6'}`,
  };
};