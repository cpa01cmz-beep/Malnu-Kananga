
import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="relative min-h-[85vh] flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/60 via-primary-50/30 to-transparent dark:from-primary-900/20 dark:via-primary-900/10 dark:to-transparent"></div>
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 dark:text-white mb-7 tracking-tight leading-[1.15] animate-scale-in">
          MA Malnu Kananga
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-12 leading-relaxed animate-fade-in">
          Mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up">
          <a href="#ppdb" className="inline-flex items-center justify-center bg-primary-600 text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-primary-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm hover:shadow-md hover:-translate-y-0.5">
            Info PPDB 2025
          </a>
          <a href="#profil" className="inline-flex items-center justify-center bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-500 dark:text-white font-semibold px-7 py-3.5 rounded-lg border border-neutral-200 dark:border-neutral-600 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm hover:shadow-md hover:-translate-y-0.5">
            Jelajahi Profil
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
