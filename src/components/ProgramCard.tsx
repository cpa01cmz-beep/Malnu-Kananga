
import React from 'react';
import { FeaturedProgram } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface ProgramCardProps {
  program: FeaturedProgram;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  return (
    <article className="bg-white dark:bg-neutral-800 rounded-2xl shadow-card hover:shadow-float border border-neutral-200 dark:border-neutral-700 transition-all duration-300 overflow-hidden h-full flex flex-col group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <ImageWithFallback
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={program.imageUrl}
          alt={program.title}
          fallbackText="Gambar Program Tidak Tersedia"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg sm:text-xl font-bold mb-3 text-neutral-900 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2">{program.title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed flex-grow line-clamp-3 font-medium">{program.description}</p>
      </div>
    </article>
  );
};

export default ProgramCard;