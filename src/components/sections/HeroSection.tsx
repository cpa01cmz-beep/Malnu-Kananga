
import React from 'react';
import GradientButton from '../ui/GradientButton';
import Heading from '../ui/Heading';
import { getResponsiveGradient } from '../../config/gradients';
import { HEIGHT_CLASSES } from '../../config/heights';
import { UI_SPACING } from '../../constants';
import { buildTypographyClasses, TYPOGRAPHY_PATTERNS } from '../../utils/typographyUtils';

const HeroSection: React.FC = () => {
  const headingId = 'home-heading';

  return (
    <section id="home" aria-labelledby={headingId} className={`relative ${HEIGHT_CLASSES.HERO} flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 overflow-hidden mobile-full-height safe-area-padding`}>
      <div className={`absolute inset-0 ${getResponsiveGradient('HERO')}`}></div>
      <div className={`absolute inset-0 ${getResponsiveGradient('HERO_DECORATIVE', 'HERO_DECORATIVE')}`}></div>
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className={`inline-flex items-center ${UI_SPACING.GAP_TIGHT} ${UI_SPACING.PADDING_COMFORTABLE} mb-8 sm:mb-10 rounded-full bg-primary-100/95 dark:bg-primary-900/80 border border-primary-200/90 dark:border-primary-700/80 backdrop-blur-md shadow-md hover:shadow-lg animate-scale-in transition-all duration-300 hover:scale-[1.05] group glass-effect text-contrast-enhanced mobile-gesture-feedback`}>
          <span className="flex h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse ring-2 ring-primary-300 dark:ring-primary-700 group-hover:animate-pulse status-indicator"></span>
          <span className="text-sm font-semibold tracking-wide text-primary-700 dark:text-primary-300 transition-colors duration-300 group-hover:text-primary-800 dark:group-hover:text-primary-200 text-contrast-enhanced">Penerimaan Siswa Baru 2025</span>
        </div>
        <Heading
          id={headingId}
          level={1}
          size="5xl"
          weight="bold"
          tracking="tight"
          leading="leading-[1.1]"
          className={`${buildTypographyClasses({ 
  size: 'base', 
  responsive: { sm: '6xl', md: '7xl', lg: '8xl' }
})} ${TYPOGRAPHY_PATTERNS.display.hero} mb-6 sm:mb-8 animate-scale-in bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent dark:from-primary-400 dark:via-primary-500 dark:to-primary-600 reading-enhanced text-contrast-enhanced`}
        >
          MA Malnu Kananga
        </Heading>
        <p className={`max-w-3xl mx-auto ${buildTypographyClasses({ 
  size: 'lg', 
  responsive: { sm: 'xl', md: '2xl', lg: '3xl' },
  weight: 'medium',
  leading: 'relaxed',
  tracking: 'tight'
})} text-neutral-600 dark:text-neutral-300 mb-8 sm:mb-10 lg:mb-12 animate-fade-in reading-comfortable text-contrast-enhanced`}>
          Mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
        </p>
        <div className={`flex flex-col sm:flex-row ${UI_SPACING.GAP_NORMAL} sm:${UI_SPACING.GAP_LOOSE} justify-center items-center animate-fade-in-up`}>
          <GradientButton
            variant="primary"
            href="#ppdb"
          >
            Info PPDB 2025
          </GradientButton>
          <GradientButton
            variant="secondary"
            href="#profil"
          >
            Jelajahi Profil
          </GradientButton>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

