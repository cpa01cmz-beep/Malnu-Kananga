
import React from 'react';
import { FeaturedProgram } from '../types';
import ImageWithFallback from './ImageWithFallback';
import Card from './ui/Card';

interface ProgramCardProps {
  program: FeaturedProgram;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  return (
    <Card
      variant="default"
      className="overflow-hidden h-full flex flex-col"
      padding="none"
    >
      <div className="relative overflow-hidden aspect-video bg-neutral-100 dark:bg-neutral-700">
        <ImageWithFallback
          className="h-full w-full object-cover"
          src={program.imageUrl}
          alt={program.title}
          fallbackText="Gambar Program Tidak Tersedia"
        />
      </div>
      <div className="p-6 sm:p-7 flex-grow flex flex-col">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-neutral-900 dark:text-white leading-snug line-clamp-2">{program.title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed flex-grow line-clamp-3">{program.description}</p>
      </div>
    </Card>
  );
};

export default ProgramCard;
