
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import ChatWindow from './components/ChatWindow';
import Toast, { ToastType } from './components/Toast';
import ThemeSelector from './components/ThemeSelector';
import SkipLink, { SkipTarget } from './components/ui/SkipLink';
import { logger } from './utils/logger';
import { ThemeManager } from './services/themeManager';

// Lazy load modal/dialog components
const DocumentationPage = lazy(() => import('./components/DocumentationPage'));
const SiteEditor = lazy(() => import('./components/SiteEditor'));
const PPDBRegistration = lazy(() => import('./components/PPDBRegistration'));

// Lazy load heavy dashboard components
const StudentPortal = lazy(() => import('./components/StudentPortal'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));
const ParentDashboard = lazy(() => import('./components/ParentDashboard'));

import HeroSection from './components/sections/HeroSection';
import RelatedLinksSection from './components/sections/RelatedLinksSection';
import ProfileSection from './components/sections/ProfileSection';
import ProgramsSection from './components/sections/ProgramsSection';
import NewsSection from './components/sections/NewsSection';
import PPDBSection from './components/sections/PPDBSection';

import type { FeaturedProgram, LatestNews, UserRole, UserExtraRole } from './types';
import { STORAGE_KEYS } from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import { NotificationProvider } from './contexts/NotificationContext';
import { api } from './services/apiService';
import { permissionService } from './services/permissionService';

// Auth Session Interface
interface AuthSession {
  loggedIn: boolean;
  role: UserRole | null;
  extraRole: UserExtraRole | null;
}

// Content Interface
interface SiteContent {
  featuredPrograms: FeaturedProgram[];
  latestNews: LatestNews[];
}

const App: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPPDBOpen, setIsPPDBOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPublicView, setIsPublicView] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

  // Auth State with Persistence via Hook
  const [authSession, setAuthSession] = useLocalStorage<AuthSession>(STORAGE_KEYS.AUTH_SESSION, {
    loggedIn: false,
    role: null,
    extraRole: null
  });

  const { loggedIn: isLoggedIn, role: userRole, extraRole: userExtraRole } = authSession;

  // Initialize Advanced Theme System
  useEffect(() => {
    ThemeManager.getInstance();
    // Theme system handles its own initialization
  }, []);

  // Content State via Hook - lazy load defaults to reduce initial bundle
  const [siteContent, setSiteContent] = useLocalStorage<SiteContent>(STORAGE_KEYS.SITE_CONTENT, {
    featuredPrograms: [],
    latestNews: []
  });

  // Check for existing JWT token on mount and load default content if empty
  const hasLoadedContent = useRef(false);

  useEffect(() => {
    const checkAuth = () => {
      if (api.auth.isAuthenticated()) {
        const user = api.auth.getCurrentUser();
        if (user) {
          setAuthSession({
            loggedIn: true,
            role: user.role,
            extraRole: null
          });
        }
      }
    };
    
    const loadDefaultContent = async () => {
      if (!hasLoadedContent.current && (siteContent.featuredPrograms.length === 0 || siteContent.latestNews.length === 0)) {
        hasLoadedContent.current = true;
        const { INITIAL_PROGRAMS, INITIAL_NEWS } = await import('./data/defaults');
        setSiteContent({
          featuredPrograms: INITIAL_PROGRAMS,
          latestNews: INITIAL_NEWS
        });
      }
    };
    
    checkAuth();
    loadDefaultContent();
  }, [siteContent.featuredPrograms.length, siteContent.latestNews.length, setAuthSession, setSiteContent]);

  const toggleTheme = () => {
    setIsThemeSelectorOpen(true);
  };
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleLoginSuccess = (role: UserRole, extraRole: UserExtraRole = null) => {
    // Validate role combination
    if (!permissionService.isValidRoleCombination(role, extraRole)) {
      showToast('Kombinasi peran tidak valid.', 'error');
      return;
    }

    setAuthSession({ loggedIn: true, role, extraRole });
    setIsLoginOpen(false);
    setIsPublicView(false); 
    
    // Log successful login
    permissionService.hasPermission(role, extraRole, 'system.admin', {
      userId: 'current-user',
      ip: window.location.hostname
    });
    
    let roleName = role === 'admin' ? 'Administrator' : role === 'teacher' ? 'Guru' : role === 'parent' ? 'Wali Murid' : 'Siswa';
    if (extraRole === 'staff') roleName += ' (Staff)';
    if (extraRole === 'osis') roleName += ' (Pengurus OSIS)';

    showToast(`Login berhasil! Selamat datang, ${roleName}.`, 'success');
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      logger.error('Logout error:', err);
    } finally {
      setAuthSession({ loggedIn: false, role: null, extraRole: null });
      setIsPublicView(false);
      showToast('Anda telah logout.', 'info');
    }
  };

  const handleUpdateContent = (newContent: SiteContent) => {
    setSiteContent(newContent);
    setIsEditorOpen(false);
    showToast('Konten website berhasil diperbarui! Beralih ke "Lihat Website" untuk melihat hasilnya.', 'success');
  };

  const handleResetContent = async () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan konten website ke pengaturan awal? Semua perubahan akan dihapus.')) {
      const { INITIAL_PROGRAMS, INITIAL_NEWS } = await import('./data/defaults');
      setSiteContent({
        featuredPrograms: INITIAL_PROGRAMS,
        latestNews: INITIAL_NEWS
      });
      showToast('Konten dikembalikan ke pengaturan awal.', 'info');
    }
  };

  // Helper to render the correct dashboard based on role with permission checks
  const renderDashboard = () => {
      // Validate user can access dashboard
      const dashboardAccess = permissionService.canAccessResource(
        userRole!, 
        userExtraRole!, 
        'content', 
        'read', 
        { userId: 'current-user', ip: window.location.hostname }
      );
      
      if (!dashboardAccess.granted) {
        showToast('Anda tidak memiliki akses ke dashboard.', 'error');
        handleLogout();
        return null;
      }

      switch (userRole) {
          case 'admin':
              return (
                <Suspense fallback={<div className="flex flex-col justify-center items-center h-64 space-y-3 animate-pulse"><div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-700"></div><p className="text-neutral-500 dark:text-neutral-400 font-medium">Memuat dashboard admin...</p></div>}>
                    <AdminDashboard
                      onOpenEditor={() => setIsEditorOpen(true)}
                      onShowToast={showToast}
                    />
                </Suspense>
              );
          case 'teacher':
              return (
                <Suspense fallback={<div className="flex flex-col justify-center items-center h-64 space-y-3 animate-pulse"><div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-700"></div><p className="text-neutral-500 dark:text-neutral-400 font-medium">Memuat dashboard guru...</p></div>}>
                    <TeacherDashboard
                      extraRole={userExtraRole}
                      onShowToast={showToast}
                    />
                </Suspense>
              );
          case 'parent':
              return (
                <Suspense fallback={<div className="flex flex-col justify-center items-center h-64 space-y-3 animate-pulse"><div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-700"></div><p className="text-neutral-500 dark:text-neutral-400 font-medium">Memuat dashboard wali murid...</p></div>}>
                    <ParentDashboard
                      onShowToast={showToast}
                    />
                </Suspense>
              );
          case 'student':
          default:
              return (
                <Suspense fallback={<div className="flex flex-col justify-center items-center h-64 space-y-3 animate-pulse"><div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-700"></div><p className="text-neutral-500 dark:text-neutral-400 font-medium">Memuat portal siswa...</p></div>}>
                    <StudentPortal
                      extraRole={userExtraRole}
                      onShowToast={showToast}
                  />
                </Suspense>
              );
      }
  };

  return (
    <NotificationProvider>
      <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-background)] w-full min-h-screen font-sans text-[var(--color-text)] transition-colors duration-300 antialiased">
      <SkipLink 
        targets={[
          { id: 'main-nav', label: 'Langsung ke navigasi utama' },
          { id: 'main-content', label: 'Langsung ke konten utama' },
          { id: 'kontak', label: 'Langsung ke footer' },
        ] as SkipTarget[]} 
      />
      <Header
        onLoginClick={() => setIsLoginOpen(true)}
        onChatClick={() => setIsChatOpen(true)}
        onEditClick={() => setIsEditorOpen(true)}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        userExtraRole={userExtraRole}
        onLogout={handleLogout}
        isPublicView={isPublicView}
        onTogglePublicView={() => setIsPublicView(!isPublicView)}
        onToggleTheme={toggleTheme}
        onShowToast={showToast}
      />

      {isLoggedIn && !isPublicView ? (
        <main id="main-content" tabIndex={-1}>
          {renderDashboard()}
        </main>
      ) : (
        <main id="main-content">
          <HeroSection />
          <RelatedLinksSection />
          <ProfileSection />
          <PPDBSection onRegisterClick={() => setIsPPDBOpen(true)} />
          {/* Robustness Fix: Added fallback to empty array to prevent crashes if localStorage data is corrupted/incomplete */}
          <ProgramsSection programs={siteContent?.featuredPrograms || []} />
          <NewsSection news={siteContent?.latestNews || []} />
        </main>
      )}

      <Footer onDocsClick={() => setIsDocsOpen(true)} />

      <div
        className={`fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-40 w-[calc(100vw-2.5rem)] max-w-sm h-[70vh] max-h-[600px] transition-all duration-300 ease-in-out ${
          isChatOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <ChatWindow 
          isOpen={isChatOpen} 
          closeChat={() => setIsChatOpen(false)} 
          siteContext={siteContent || { featuredPrograms: [], latestNews: [] }}
          onShowToast={showToast}
        />
      </div>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <Suspense fallback={<div className="flex flex-col justify-center items-center h-64 space-y-3 animate-pulse"><div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-700"></div><p className="text-neutral-500 dark:text-neutral-400 font-medium">Memuat formulir pendaftaran...</p></div>}>
        <PPDBRegistration 
          isOpen={isPPDBOpen}
          onClose={() => setIsPPDBOpen(false)}
          onShowToast={showToast}
        />
      </Suspense>

      <Suspense fallback={<div className="flex flex-col justify-center items-center h-64 space-y-3 animate-pulse"><div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-700"></div><p className="text-neutral-500 dark:text-neutral-400 font-medium">Memuat dokumentasi...</p></div>}>
        <DocumentationPage 
          isOpen={isDocsOpen} 
          onClose={() => setIsDocsOpen(false)} 
        />
      </Suspense>

      <Suspense fallback={<div className="flex flex-col justify-center items-center h-64 space-y-3 animate-pulse"><div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-700"></div><p className="text-neutral-500 dark:text-neutral-400 font-medium">Memuat editor...</p></div>}>
        <SiteEditor 
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          currentContent={siteContent || { featuredPrograms: [], latestNews: [] }}
          onUpdateContent={handleUpdateContent}
          onResetContent={handleResetContent}
        />
      </Suspense>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      <ThemeSelector
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
      />
    </div>
    </NotificationProvider>
  );
};

export default App;
