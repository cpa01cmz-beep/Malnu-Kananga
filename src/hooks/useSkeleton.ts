import { useState, useEffect } from 'react';

// Hook for conditional skeleton loading with delay
export const useSkeleton = (isLoading: boolean, delay = 200) => {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

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
