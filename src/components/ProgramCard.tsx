
import React from 'react';
import { FeaturedProgram } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface ProgramCardProps {
  program: FeaturedProgram;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 h-full flex flex-col">
      <ImageWithFallback 
        className="h-48 w-full object-cover" 
        src={program.imageUrl} 
        alt={program.title}
        fallbackText="Gambar Program Tidak Tersedia" 
      />
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{program.title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{program.description}</p>
      </div>
    </div>
  );
};

export default ProgramCard;