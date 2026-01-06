
import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="relative min-h-dvh flex items-center justify-center text-center px-4 pt-24 pb-12 sm:pt-32">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-100/80 to-transparent dark:from-primary-900/40 dark:to-transparent"></div>
      <div className="relative z-10 animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-neutral-900 dark:text-white mb-6 tracking-tight">
          MA Malnu Kananga
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-10 leading-relaxed">
          Mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#ppdb" className="bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-pill shadow-card hover:shadow-float hover:bg-primary-700 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary-400 focus:ring-opacity-50">
            Info PPDB 2025
          </a>
          <a href="#profil" className="bg-white dark:bg-neutral-700 text-primary-600 dark:text-white font-semibold px-8 py-3.5 rounded-pill shadow-card hover:shadow-float hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary-400 focus:ring-opacity-50">
            Jelajahi Profil
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
