
import React from 'react';
import GradientButton from '../ui/GradientButton';
import Heading from '../ui/Heading';
import { getResponsiveGradient } from '../../config/gradients';
import { HEIGHT_CLASSES } from '../../config/heights';

const HeroSection: React.FC = () => {
  const headingId = 'home-heading';

  return (
    <section id="home" aria-labelledby={headingId} className={`relative ${HEIGHT_CLASSES.HERO} flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 overflow-hidden mobile-full-height safe-area-padding`}>
      <div className={`absolute inset-0 ${getResponsiveGradient('HERO')}`}></div>
      <div className={`absolute inset-0 ${getResponsiveGradient('HERO_DECORATIVE', 'HERO_DECORATIVE')}`}></div>
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 sm:mb-10 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/50 dark:to-primary-800/50 border border-primary-200/90 dark:border-primary-700/80 backdrop-blur-lg shadow-lg hover:shadow-xl hover:shadow-primary-500/20 animate-bounce-in transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275) hover:scale-[1.02] group hover-lift-enhanced enhanced-contrast hover-depth glass-effect-elevated badge-polished text-contrast-enhanced mobile-gesture-feedback relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%]">
          <span className="flex h-3 w-3 rounded-full bg-primary-500 animate-pulse ring-2 ring-primary-300 dark:ring-primary-700 group-hover:animate-glow status-indicator success hover-lift-enhanced relative z-10"></span>
          <span className="text-sm font-semibold tracking-wide text-primary-700 dark:text-primary-300 transition-colors duration-300 group-hover:text-primary-800 dark:group-hover:text-primary-200 text-contrast-enhanced relative z-10">Penerimaan Siswa Baru 2025</span>
        </div>
        <Heading
          id={headingId}
          level={1}
          size="5xl"
          weight="bold"
          tracking="tight"
          leading="leading-[1.1]"
          className="text-hero sm:text-6xl md:text-7xl lg:text-8xl mb-6 sm:mb-8 animate-bounce-in animate-delay-200 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent dark:from-primary-400 dark:via-primary-500 dark:to-primary-600 reading-enhanced text-contrast-enhanced hover-lift-enhanced hover:scale-[1.02] transition-transform duration-300"
        >
          MA Malnu Kananga
        </Heading>
        <p className="text-subtitle max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl lg:text-3xl text-neutral-600 dark:text-neutral-300 mb-8 sm:mb-10 lg:mb-12 leading-relaxed animate-fade-in animate-delay-300 font-medium tracking-[-0.01em] prose reading-comfortable text-reveal text-contrast-enhanced hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">
          Mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
        </p>
        <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-center animate-fade-in-up enhanced-mobile-spacing">
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

