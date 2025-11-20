import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeWebPDetection, getWebPSupport, getOptimalImageSrc } from '../utils/webpDetection';

// WebP Context interface
interface WebPContextType {
  supportsWebP: boolean | null;
  isLoading: boolean;
  getOptimalSrc: (src: string) => string;
}

// Create context
const WebPContext = createContext<WebPContextType | undefined>(undefined);

// WebP Provider component
interface WebPProviderProps {
  children: ReactNode;
}

export const WebPProvider: React.FC<WebPProviderProps> = ({ children }) => {
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(getWebPSupport());
  const [isLoading, setIsLoading] = useState<boolean>(supportsWebP === null);

  useEffect(() => {
    // If already detected, no need to run again
    if (supportsWebP !== null) {
      setIsLoading(false);
      return;
    }

    // Initialize detection
    setIsLoading(true);

    initializeWebPDetection()
      .then((result) => {
        setSupportsWebP(result);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to detect WebP support:', error);
        setSupportsWebP(false); // Fallback to false on error
        setIsLoading(false);
      });
  }, []);

  const getOptimalSrc = (src: string): string => {
    return getOptimalImageSrc(src, true);
  };

  const contextValue: WebPContextType = {
    supportsWebP,
    isLoading,
    getOptimalSrc
  };

  return (
    <WebPContext.Provider value={contextValue}>
      {children}
    </WebPContext.Provider>
  );
};

// Custom hook untuk menggunakan WebP context
export const useWebP = (): WebPContextType => {
  const context = useContext(WebPContext);

  if (context === undefined) {
    throw new Error('useWebP must be used within a WebPProvider');
  }

  return context;
};

export default useWebP;