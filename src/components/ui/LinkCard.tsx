import React from 'react';
import Card from './Card';

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
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className="group flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 rounded-xl transition-all duration-200"
      >
        <Card
          variant="hover"
          className="p-7 sm:p-8 lg:p-10 hover:-translate-y-1 active:scale-95"
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
        </Card>
      </a>
    </li>
  );
};

export default LinkCard;
