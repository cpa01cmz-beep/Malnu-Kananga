import React from 'react';
import Card from './Card';

interface LinkCardProps {
  name: string;
  href: string;
  icon: React.ReactNode;
  colorClass: string;
  ariaLabel?: string;
}

const ExternalLinkIcon: React.FC = () => (
  <svg
    className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

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
        aria-label={ariaLabel || `${name} (buka di tab baru)`}
        className="group flex flex-col items-center"
      >
        <Card
          variant="hover"
          className="p-7 sm:p-8 lg:p-10 hover:-translate-y-1 active:scale-95 relative"
        >
          <span
            className="absolute top-2 right-2 text-neutral-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-hidden="true"
          >
            <ExternalLinkIcon />
          </span>
          <div
            className={`flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full ${colorClass} transition-transform duration-300 group-hover:scale-110 shadow-sm hover:shadow-md`}
            aria-hidden="true"
          >
            {icon}
          </div>
          <span className="mt-4 sm:mt-5 lg:mt-6 font-semibold text-center text-sm sm:text-base text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5 justify-center">
            {name}
            <span className="text-neutral-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex" aria-hidden="true">
              <ExternalLinkIcon />
            </span>
          </span>
        </Card>
      </a>
    </li>
  );
};

export default LinkCard;
