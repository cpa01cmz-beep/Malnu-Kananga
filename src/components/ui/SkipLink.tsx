import React from 'react';

interface SkipLinkProps {
  targetId?: string;
  label?: string;
  className?: string;
}

const baseClasses = "absolute top-4 left-4 z-[100] px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 transform -translate-y-[200%] focus:translate-y-0";

const variantClasses = "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50 shadow-md hover:shadow-lg";

const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  label = 'Langsung ke konten utama',
  className = '',
}) => {
  return (
    <a
      href={`#${targetId}`}
      className={`${baseClasses} ${variantClasses} ${className}`.replace(/\s+/g, ' ').trim()}
      role="navigation"
      aria-label={label}
    >
      {label}
    </a>
  );
};

export default SkipLink;
