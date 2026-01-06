
import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="relative min-h-[85vh] flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/70 via-white/60 to-primary-100/50 dark:from-primary-900/25 dark:via-neutral-900/60 dark:to-primary-900/15"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-200/25 via-transparent to-transparent dark:from-primary-800/25"></div>
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 sm:mb-10 rounded-full bg-primary-100 dark:bg-primary-900/60 border border-primary-200/70 dark:border-primary-700/70 backdrop-blur-sm shadow-sm animate-scale-in">
          <span className="flex h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse-slow ring-2 ring-primary-300 dark:ring-primary-700"></span>
          <span className="text-sm font-semibold tracking-wide text-primary-700 dark:text-primary-300">Penerimaan Siswa Baru 2025</span>
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-neutral-900 dark:text-white mb-6 sm:mb-8 lg:mb-9 tracking-tight leading-[1.05] animate-scale-in">
          MA Malnu Kananga
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-600 dark:text-neutral-300 mb-10 sm:mb-12 lg:mb-14 leading-relaxed animate-fade-in">
          Mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in-up">
          <a href="#ppdb" className="inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold px-7 sm:px-8 lg:px-10 py-3.5 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-neutral-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base">
            Info PPDB 2025
          </a>
          <a href="#profil" className="inline-flex items-center justify-center bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold px-7 sm:px-8 lg:px-10 py-3.5 rounded-lg border border-neutral-200 dark:border-neutral-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/40 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-neutral-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm sm:text-base">
            Jelajahi Profil
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
