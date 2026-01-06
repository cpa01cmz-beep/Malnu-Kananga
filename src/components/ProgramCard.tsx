
import React from 'react';
import { FeaturedProgram } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface ProgramCardProps {
  program: FeaturedProgram;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  return (
    <article className="bg-white dark:bg-neutral-800 rounded-card-lg shadow-card hover:shadow-card-hover border border-neutral-200 dark:border-neutral-700 transition-all duration-300 overflow-hidden h-full flex flex-col group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 hover:-translate-y-0.5">
      <ImageWithFallback
        className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        src={program.imageUrl}
        alt={program.title}
        fallbackText="Gambar Program Tidak Tersedia"
      />
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold mb-2.5 text-neutral-900 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2">{program.title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed flex-grow line-clamp-3">{program.description}</p>
      </div>
    </article>
  );
};

export default ProgramCard;