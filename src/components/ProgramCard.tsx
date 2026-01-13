
import React from 'react';
import { FeaturedProgram } from '../types';
import ImageCard from './ui/ImageCard';

interface ProgramCardProps {
  program: FeaturedProgram;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  return (
    <ImageCard
      imageUrl={program.imageUrl}
      imageAlt={program.title}
      title={program.title}
      variant="hover"
      ariaLabel={program.title}
    >
      {program.description}
    </ImageCard>
  );
};

export default ProgramCard;
