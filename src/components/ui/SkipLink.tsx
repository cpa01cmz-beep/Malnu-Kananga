import React from 'react';

export interface SkipTarget {
  id: string;
  label: string;
}

interface SkipLinkProps {
  targetId?: string;
  label?: string;
  className?: string;
  targets?: SkipTarget[];
}

const baseClasses = "z-[100] px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 transform -translate-y-[200%] focus:translate-y-0 shadow-md hover:shadow-lg";

const linkClasses = "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50 focus-visible:ring-4 focus-visible:ring-primary-500/30";

const containerClasses = "absolute top-4 left-4 flex flex-col gap-2";

const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  label = 'Langsung ke konten utama',
  className = '',
  targets,
}) => {
  const skipTargets = targets || [{ id: targetId, label }];

  const handleSkip = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      targetElement.focus();
    }
  };

  if (skipTargets.length === 1) {
    const target = skipTargets[0];
    return (
      <a
        href={`#${target.id}`}
        className={`${baseClasses} ${linkClasses} absolute top-4 left-4 ${className}`.replace(/\s+/g, ' ').trim()}
        role="navigation"
        aria-label={target.label}
        onClick={(e) => handleSkip(e, target.id)}
      >
        {target.label}
      </a>
    );
  }

  return (
    <nav className={containerClasses} aria-label="Tautan navigasi cepat">
      {skipTargets.map((target) => (
        <a
          key={target.id}
          href={`#${target.id}`}
          className={`${baseClasses} ${linkClasses} ${className}`.replace(/\s+/g, ' ').trim()}
          aria-label={target.label}
          onClick={(e) => handleSkip(e, target.id)}
        >
          {target.label}
        </a>
      ))}
    </nav>
  );
};

export default SkipLink;
