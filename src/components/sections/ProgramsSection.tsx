
import React from 'react';
import ProgramCard from '../ProgramCard';
import { FeaturedProgram } from '../../types';
import Section from '../ui/Section';

interface ProgramsSectionProps {
  programs: FeaturedProgram[];
}

const ProgramsSection: React.FC<ProgramsSectionProps> = ({ programs }) => {
  return (
    <Section
      id="program"
      title="Program Unggulan"
      subtitle="Kurikulum terpadu untuk membentuk pribadi paripurna."
      className="bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-800/60 dark:to-neutral-900/40"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {programs.map((program) => (
          <ProgramCard key={program.title} program={program} />
        ))}
      </div>
    </Section>
  );
};

export default ProgramsSection;
