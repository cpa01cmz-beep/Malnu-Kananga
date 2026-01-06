
import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-32 pb-20 sm:pt-40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/80 via-primary-50/40 to-transparent dark:from-primary-900/30 dark:via-primary-900/15 dark:to-transparent"></div>
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight leading-tight animate-scale-in">
          MA Malnu Kananga
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-10 leading-relaxed animate-fade-in">
          Mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
          <a href="#ppdb" className="inline-flex items-center justify-center bg-primary-600 text-white font-medium px-8 py-4 rounded-pill shadow-card hover:shadow-float hover:bg-primary-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-400 focus:ring-opacity-50 transform hover:-translate-y-0.5">
            Info PPDB 2025
          </a>
          <a href="#profil" className="inline-flex items-center justify-center bg-white dark:bg-neutral-800 text-primary-600 dark:text-white font-medium px-8 py-4 rounded-pill shadow-card hover:shadow-float hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-400 focus:ring-opacity-50 border border-neutral-200 dark:border-neutral-600 transform hover:-translate-y-0.5">
            Jelajahi Profil
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
