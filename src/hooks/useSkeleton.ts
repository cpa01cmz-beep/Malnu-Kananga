import { useState, useEffect } from 'react';

/**
 * Hook for conditional skeleton loading with delay
 * Moved to separate file to comply with React Fast Refresh rules
 * 
 * @param isLoading - Whether content is currently loading
 * @param delay - Delay in ms before showing skeleton (prevents flicker for fast loads)
 * @returns boolean indicating whether to show skeleton
 */
export const useSkeleton = (isLoading: boolean, delay = 200): boolean => {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (isLoading) {
      timeout = setTimeout(() => {
        setShowSkeleton(true);
      }, delay);
    } else {
      setShowSkeleton(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, delay]);

  return showSkeleton;
};

export default useSkeleton;
