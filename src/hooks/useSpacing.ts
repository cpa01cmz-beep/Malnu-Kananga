import { useContext } from 'react';
import { SpacingContext } from '../providers/SpacingProvider';

export const useSpacing = () => {
  const context = useContext(SpacingContext);
  if (context === undefined) {
    throw new Error('useSpacing must be used within a SpacingProvider');
  }
  return context;
};

export default useSpacing;
