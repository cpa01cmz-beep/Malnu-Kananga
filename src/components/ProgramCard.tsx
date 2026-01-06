
import React from 'react';
import { FeaturedProgram } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface ProgramCardProps {
  program: FeaturedProgram;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  return (
    <article className="bg-white dark:bg-neutral-800 rounded-card-lg shadow-card hover:shadow-card-hover border border-neutral-200 dark:border-neutral-700 transition-all duration-200 overflow-hidden h-full flex flex-col">
      <ImageWithFallback
        className="h-48 w-full object-cover"
        src={program.imageUrl}
        alt={program.title}
        fallbackText="Gambar Program Tidak Tersedia"
      />
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white leading-snug">{program.title}</h3>
        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{program.description}</p>
      </div>
    </article>
  );
};

export default ProgramCard;