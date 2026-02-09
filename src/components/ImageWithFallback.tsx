
import React, { useState } from 'react';
import { PhotoIcon } from './icons/PhotoIcon';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  lazy?: boolean;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  className, 
  fallbackText,
  lazy = true,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);

  // Jika src kosong atau terjadi error loading, tampilkan fallback
  if (!src || hasError) {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 ${className}`}
        role="img"
        aria-label={fallbackText || alt || 'Gambar tidak tersedia'}
      >
        <PhotoIcon className="w-12 h-12 mb-2" aria-hidden="true" />
        {fallbackText && <span className="text-xs text-center px-2" aria-hidden="true">{fallbackText}</span>}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      loading={lazy ? "lazy" : "eager"}
      onError={() => setHasError(true)}
      {...props} 
    />
  );
};

export default ImageWithFallback;
