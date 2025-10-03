
import React, { useState, Suspense } from 'react';
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
        <ErrorBoundary>
          <div className="bg-gray-50 dark:bg-gray-900 w-full min-h-screen font-sans text-gray-800 dark:text-gray-200">
          <MetaTags />

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