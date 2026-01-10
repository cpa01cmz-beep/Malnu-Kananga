import React from 'react';

interface LinkCardProps {
  name: string;
  href: string;
  icon: React.ReactNode;
  colorClass: string;
  ariaLabel?: string;
}

const LinkCard: React.FC<LinkCardProps> = ({
  name,
  href,
  icon,
  colorClass,
  ariaLabel,
}) => {
  return (
    <li role="listitem">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className="group flex flex-col items-center p-7 sm:p-8 lg:p-10 bg-white dark:bg-neutral-800 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 ease-out transform hover:-translate-y-1 hover:bg-white dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 active:scale-95 hover:scale-[1.02]"
      >
        <div 
          className={`flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full ${colorClass} transition-transform duration-300 group-hover:scale-110 shadow-sm hover:shadow-md`}
          aria-hidden="true"
        >
          {icon}
        </div>
        <span className="mt-4 sm:mt-5 lg:mt-6 font-semibold text-center text-sm sm:text-base text-neutral-700 dark:text-neutral-200">
          {name}
        </span>
      </a>
    </li>
  );
};

export default LinkCard;
