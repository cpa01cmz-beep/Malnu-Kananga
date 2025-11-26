import React, { useState, Suspense, lazy } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Header from './components/Header';
import Footer from './components/Footer';

import MainContentRouter from './components/MainContentRouter';
import ChatWindowContainer from './components/ChatWindowContainer';
import ModalsContainer from './components/ModalsContainer';
import ErrorBoundary from './components/ErrorBoundary';
import { ChatProvider } from './contexts/ChatContext';
import { useKeyboardNavigation, useScreenReader } from './hooks/useKeyboardNavigation';
import { useAuth } from './hooks/useAuth';
import { WebPProvider } from './hooks/useWebP';
import { setupErrorMonitoring } from './services/errorMonitoringConfig';
import { queryClient } from './services/queryClient';
import { SupabaseApiService } from './services/supabaseApiService';
import { initGA4, trackEvent } from './utils/analytics';

// Lazy load heavy components untuk code splitting
const StudentDashboard = lazy(() => import('./components/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));
const ParentDashboard = lazy(() => import('./components/ParentDashboard'));

const App: React.FC = () => {
  // Setup error monitoring untuk production dan development
  React.useEffect(() => {
    setupErrorMonitoring();
    
    // Initialize Supabase integration
    SupabaseApiService.initialize();
    
    // Initialize Google Analytics 4
    initGA4();
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
      <ErrorBoundary>
        <ChatProvider>
          <WebPProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {(isLoggedIn && currentUser) ? (
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
                {/* Skip to main content link untuk screen readers */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-600 text-white px-4 py-2 rounded z-50"
                >
                  Lewati ke konten utama
                </a>

                <Header
                  onLoginClick={() => {
                    setIsLoginOpen(true);
                    trackEvent('click', 'navigation', 'login_button');
                  }}
                  onChatClick={() => {
                    setIsChatOpen(true);
                    trackEvent('click', 'navigation', 'chat_button');
                  }}
                  isLoggedIn={Boolean(isLoggedIn)}
                  onLogout={() => {
                    handleLogout();
                    trackEvent('click', 'navigation', 'logout_button');
                  }}
                  onPortalClick={async () => {
                    if (isLoggedIn && currentUser) {
                      document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
                      announceNavigation('Portal Dashboard');
                      trackEvent('click', 'navigation', 'portal_button');
                    }
                  }}
                />

                <MainContentRouter
                  isLoggedIn={Boolean(isLoggedIn)}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />

                <Footer onDocsClick={() => {
                  setIsDocsOpen(true);
                  trackEvent('click', 'navigation', 'docs_button');
                }} />

                <ChatWindowContainer
                  isOpen={isChatOpen}
                  onClose={() => {
                    setIsChatOpen(false);
                    trackEvent('click', 'navigation', 'close_chat');
                  }}
                />

                <ModalsContainer
                  isLoginOpen={isLoginOpen}
                  isDocsOpen={isDocsOpen}
                  onLoginClose={() => setIsLoginOpen(false)}
                  onDocsClose={() => setIsDocsOpen(false)}
                  onLoginSuccess={() => {
                    handleLoginSuccess();
                    trackEvent('login', 'auth', 'login_success');
                  }}
                />
              </main>
            )}
          </Suspense>
          </WebPProvider>
        </ChatProvider>
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;