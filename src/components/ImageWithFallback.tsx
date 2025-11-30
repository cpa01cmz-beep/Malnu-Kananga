
import React, { useState } from 'react';
import { PhotoIcon } from './icons/PhotoIcon';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  className, 
  fallbackText,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);

  // Jika src kosong atau terjadi error loading, tampilkan fallback
  if (!src || hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 ${className}`}>
        <PhotoIcon className="w-12 h-12 mb-2" />
        {fallbackText && <span className="text-xs text-center px-2">{fallbackText}</span>}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setHasError(true)}
      {...props} 
    />
  );
};

export default ImageWithFallback;
