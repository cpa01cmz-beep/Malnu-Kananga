
import React from 'react';
import GradientButton from '../ui/GradientButton';
import { getResponsiveGradient } from '../../config/gradients';

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 overflow-hidden">
      <div className={`absolute inset-0 ${getResponsiveGradient('HERO')}`}></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-200/40 via-transparent to-transparent dark:from-primary-800/40"></div>
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 mb-8 sm:mb-10 rounded-full bg-primary-100/95 dark:bg-primary-900/80 border border-primary-200/90 dark:border-primary-700/80 backdrop-blur-md shadow-subtle hover:shadow-md animate-scale-in transition-all duration-200 ease-out">
          <span className="flex h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse-slow ring-2 ring-primary-300 dark:ring-primary-700"></span>
          <span className="text-sm font-semibold tracking-wide text-primary-700 dark:text-primary-300">Penerimaan Siswa Baru 2025</span>
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-neutral-900 dark:text-white mb-6 sm:mb-8 tracking-tight leading-[1.1] animate-scale-in">
          MA Malnu Kananga
        </h1>
        <p className="max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl lg:text-3xl text-neutral-600 dark:text-neutral-300 mb-8 sm:mb-10 lg:mb-12 leading-relaxed animate-fade-in font-medium">
          Mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
        </p>
        <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-center animate-fade-in-up">
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

