
import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="relative min-h-dvh flex items-center justify-center text-center px-4 pt-24 pb-12 sm:pt-32">
      <div className="absolute inset-0 bg-gradient-to-b from-green-100/80 to-transparent dark:from-green-900/40 dark:to-transparent"></div>
      <div className="relative z-10 animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
          MA Malnu Kananga
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
          Mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#ppdb" className="bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50">
            Info PPDB 2025
          </a>
          <a href="#profil" className="bg-white dark:bg-gray-700 text-green-600 dark:text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50">
            Jelajahi Profil
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
