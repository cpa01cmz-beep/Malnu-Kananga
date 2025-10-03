
import React, { useState, Suspense, lazy } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Header from './components/Header';
import Footer from './components/Footer';
import MetaTags from './components/MetaTags';
import MainContentRouter from './components/MainContentRouter';
import ChatWindowContainer from './components/ChatWindowContainer';
import ModalsContainer from './components/ModalsContainer';
import ErrorBoundary from './components/ErrorBoundary';
import { useKeyboardNavigation, useScreenReader } from './hooks/useKeyboardNavigation';
import { useAuth } from './hooks/useAuth';
import { WebPProvider } from './hooks/useWebP';
import { setupErrorMonitoring } from './services/errorMonitoringConfig';
import { queryClient } from './services/queryClient';
import { featuredPrograms } from './data/featuredPrograms';
import { latestNews } from './data/latestNews';
import { relatedLinks } from './data/relatedLinks';
import { AuthService, User } from './services/authService';

// Lazy load heavy components untuk code splitting
const ChatWindow = lazy(() => import('./components/ChatWindow'));
const StudentDashboard = lazy(() => import('./components/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));
const ParentDashboard = lazy(() => import('./components/ParentDashboard'));


const App: React.FC = () => {
  // Setup error monitoring untuk production dan development
  React.useEffect(() => {
    setupErrorMonitoring();
  }, []);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Authentication hook
  const { isLoggedIn, currentUser, handleLoginSuccess, handleLogout } = useAuth();

  // Accessibility hooks
  useKeyboardNavigation();
  const { announceNavigation } = useScreenReader();

  return (
    <QueryClientProvider client={queryClient}>
      <WebPProvider>
          <Suspense fallback={<DashboardLoadingFallback />}>
              {isLoggedIn && currentUser ? (
                <main id="main-content" role="main" aria-label="Portal utama">
                  {currentUser.role === 'admin' || currentUser.role === 'teacher' ? (
                    <TeacherDashboard onLogout={handleLogout} />
                  ) : currentUser.role === 'parent' ? (
                    <ParentDashboard onLogout={handleLogout} />
                  ) : (
                    <StudentDashboard onLogout={handleLogout} />
                  )}
                </main>
              ) : (
                <main id="main-content" role="main" aria-label="Halaman utama MA Malnu Kananga">
          {/* Hero Section */}
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
                  onClick={() => {
                    document.getElementById('ppdb')?.scrollIntoView({ behavior: 'smooth' });
                    announceNavigation('Penerimaan Peserta Didik Baru');
                  }}
                  className="bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                  aria-label="Navigasi ke informasi PPDB 2025"
                >
                  Info PPDB 2025
                </button>
                <button
                  onClick={() => {
                    document.getElementById('profil')?.scrollIntoView({ behavior: 'smooth' });
                    announceNavigation('Profil Sekolah');
                  }}
                  className="bg-white dark:bg-gray-700 text-green-600 dark:text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                  aria-label="Navigasi ke profil madrasah"
                >
                  Jelajahi Profil
                </button>
              </div>
            </div>
          <Suspense fallback={<DashboardLoadingFallback />}>
              {isLoggedIn && currentUser ? (
                <main id="main-content" role="main" aria-label="Portal utama">
                  {currentUser.role === 'admin' || currentUser.role === 'teacher' ? (
                    <TeacherDashboard onLogout={handleLogout} />
                  ) : currentUser.role === 'parent' ? (
                    <ParentDashboard onLogout={handleLogout} />
                  ) : (
                    <StudentDashboard onLogout={handleLogout} />
                  )}
                </main>
              ) : (
                <main id="main-content" role="main" aria-label="Halaman utama MA Malnu Kananga">
          {/* Hero Section */}
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
                  onClick={() => {
                    document.getElementById('ppdb')?.scrollIntoView({ behavior: 'smooth' });
                    announceNavigation('Penerimaan Peserta Didik Baru');
                  }}
                  className="bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                  aria-label="Navigasi ke informasi PPDB 2025"
                >
                  Info PPDB 2025
                </button>
                <button
                  onClick={() => {
                    document.getElementById('profil')?.scrollIntoView({ behavior: 'smooth' });
                    announceNavigation('Profil Sekolah');
                  }}
                  className="bg-white dark:bg-gray-700 text-green-600 dark:text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                  aria-label="Navigasi ke profil madrasah"
                >
                  Jelajahi Profil
                </button>
              </div>
            </div>
          </section>
=======
          <Suspense fallback={<DashboardLoadingFallback />}>
              {isLoggedIn && currentUser ? (
                <main id="main-content" role="main" aria-label="Portal utama">
                  {currentUser.role === 'admin' || currentUser.role === 'teacher' ? (
                    <TeacherDashboard onLogout={handleLogout} />
                  ) : currentUser.role === 'parent' ? (
                    <ParentDashboard onLogout={handleLogout} />
                  ) : (
                    <StudentDashboard onLogout={handleLogout} />
                  )}
                </main>
              ) : (
                <main id="main-content" role="main" aria-label="Halaman utama MA Malnu Kananga">
          {/* Hero Section */}
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
                  onClick={() => {
                    document.getElementById('ppdb')?.scrollIntoView({ behavior: 'smooth' });
                    announceNavigation('Penerimaan Peserta Didik Baru');
                  }}
                  className="bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                  aria-label="Navigasi ke informasi PPDB 2025"
                >
                  Info PPDB 2025
                </button>
                <button
                  onClick={() => {
                    document.getElementById('profil')?.scrollIntoView({ behavior: 'smooth' });
                    announceNavigation('Profil Sekolah');
                  }}
                  className="bg-white dark:bg-gray-700 text-green-600 dark:text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                  aria-label="Navigasi ke profil madrasah"
                >
                  Jelajahi Profil
                </button>
              </div>
            </div>
          </section>
>>>>>>> 500ad71 (feat: comprehensive project updates - PWA, AI integration, and portal enhancements)

          {/* Skip to main content link untuk screen readers */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-600 text-white px-4 py-2 rounded z-50"
          >
            Lewati ke konten utama
          </a>

          <Header
            onLoginClick={() => setIsLoginOpen(true)}
            onChatClick={() => setIsChatOpen(true)}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
            onPortalClick={() => {
              if (isLoggedIn && currentUser) {
                document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
                announceNavigation('Portal Dashboard');
              }
            }}
          />

          <MainContentRouter
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onLogout={handleLogout}
          />

          <Footer onDocsClick={() => setIsDocsOpen(true)} />

          <ChatWindowContainer
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />

          <ModalsContainer
            isLoginOpen={isLoginOpen}
            isDocsOpen={isDocsOpen}
            onLoginClose={() => setIsLoginOpen(false)}
            onDocsClose={() => setIsDocsOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      </ErrorBoundary>
      </WebPProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;