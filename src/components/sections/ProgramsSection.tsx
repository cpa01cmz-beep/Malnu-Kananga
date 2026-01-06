
import React from 'react';
import ProgramCard from '../ProgramCard';
import { FeaturedProgram } from '../../types';

interface ProgramsSectionProps {
  programs: FeaturedProgram[];
}

const ProgramsSection: React.FC<ProgramsSectionProps> = ({ programs }) => {
  return (
    <section id="program" className="py-20 sm:py-24 bg-white dark:bg-neutral-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-5">Program Unggulan</h2>
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed font-medium">Kurikulum terpadu untuk membentuk pribadi paripurna.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {programs.map((program) => (
            <ProgramCard key={program.title} program={program} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
