import React from 'react';

const HeroSection: React.FC = () => {
  const handlePPDBClick = () => {
    document.getElementById('ppdb')?.scrollIntoView({ behavior: 'smooth' });
    // Use announceNavigation if available in context
    if (window.announceNavigation) {
      window.announceNavigation('Penerimaan Peserta Didik Baru');
    }
  };

  const handleProfileClick = () => {
    document.getElementById('profil')?.scrollIntoView({ behavior: 'smooth' });
    if (window.announceNavigation) {
      window.announceNavigation('Profil Sekolah');
    }
  };

  return (
    <section id="home" className="relative min-h-dvh flex items-center justify-center text-center px-4 pt-24 pb-12 sm:pt-32" aria-labelledby="hero-title">
      <div className="absolute inset-0 bg-gradient-to-b from-green-100/80 to-transparent dark:from-green-900/40 dark:to-transparent"></div>
      <div className="relative z-10 animate-fade-in-up">
        <h1 id="hero-title" className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
          MA Malnu Kananga
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
          Mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handlePPDBClick}
            className="bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
            aria-label="Navigasi ke informasi PPDB 2025"
          >
            Info PPDB 2025
          </button>
          <button
            onClick={handleProfileClick}
            className="bg-white dark:bg-gray-700 text-green-600 dark:text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
            aria-label="Navigasi ke profil madrasah"
          >
            Jelajahi Profil
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;