
import React from 'react';
import { FeaturedProgram } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface ProgramCardProps {
  program: FeaturedProgram;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  return (
    <article className="bg-white dark:bg-neutral-800 rounded-2xl shadow-card hover:shadow-float border border-neutral-200 dark:border-neutral-700 transition-all duration-300 ease-out overflow-hidden h-full flex flex-col group focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 hover:-translate-y-0.5 hover:scale-[1.01]">
      <div className="relative overflow-hidden aspect-video bg-neutral-100 dark:bg-neutral-700">
        <ImageWithFallback
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          src={program.imageUrl}
          alt={program.title}
          fallbackText="Gambar Program Tidak Tersedia"
        />
      </div>
      <div className="p-6 sm:p-7 flex-grow flex flex-col">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 text-neutral-900 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2">{program.title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed flex-grow line-clamp-3">{program.description}</p>
      </div>
    </article>
  );
};

export default ProgramCard;