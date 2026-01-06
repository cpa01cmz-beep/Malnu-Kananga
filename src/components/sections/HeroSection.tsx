
import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/70 via-white/50 to-primary-100/40 dark:from-primary-900/25 dark:via-neutral-900/50 dark:to-primary-900/15"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-200/20 via-transparent to-transparent dark:from-primary-800/20"></div>
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary-100/80 dark:bg-primary-900/30 border border-primary-200/50 dark:border-primary-700/50 backdrop-blur-sm animate-scale-in">
          <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Penerimaan Siswa Baru 2025</span>
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight leading-[1.1] animate-scale-in">
          MA Malnu Kananga
        </h1>
        <p className="max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 mb-10 leading-relaxed animate-fade-in font-light">
          Mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in-up">
          <a href="#ppdb" className="inline-flex items-center justify-center bg-primary-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-primary-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-base">
            Info PPDB 2025
          </a>
          <a href="#profil" className="inline-flex items-center justify-center bg-white/80 dark:bg-neutral-800/80 text-primary-700 dark:text-primary-300 font-semibold px-8 py-4 rounded-xl border border-neutral-200/80 dark:border-neutral-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 text-base">
            Jelajahi Profil
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
