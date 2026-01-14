
import React from 'react';
import { FeaturedProgram } from '../types';
import ImageWithFallback from './ImageWithFallback';
import Card from './ui/Card';

interface ProgramCardProps {
  program: FeaturedProgram;
  onClick?: () => void;
  ariaLabel?: string;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, onClick, ariaLabel }) => {
  const cardAriaLabel = ariaLabel || `View details for ${program.title}`;

  return (
    <Card
      variant={onClick ? "hover" : "default"}
      onClick={onClick}
      aria-label={cardAriaLabel}
      className="overflow-hidden h-full flex flex-col group"
      padding="none"
    >
      <div className="relative overflow-hidden aspect-video bg-neutral-100 dark:bg-neutral-700">
        <ImageWithFallback
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          src={program.imageUrl}
          alt={program.title}
          fallbackText="Gambar Program Tidak Tersedia"
        />
      </div>
      <div className="p-6 sm:p-7 flex-grow flex flex-col">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-neutral-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">{program.title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed flex-grow line-clamp-3">{program.description}</p>
        {onClick && (
          <div className="mt-4 flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-all duration-200 ease-out">
            <span>Lihat Selengkapnya</span>
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProgramCard;
