import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = React.memo(({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
        M
      </div>
      <div>
        <span className="font-bold text-lg text-gray-800 dark:text-white leading-tight">Malnu Kananga</span>
        <span className="block text-xs text-gray-500 dark:text-gray-400 leading-tight tracking-wider">NPSN: 69881502</span>
      </div>
    </div>
  );
});

export default Logo;