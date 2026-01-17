
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import ChatWindow from './components/ChatWindow';
import Toast, { ToastType } from './components/Toast';
import ThemeSelector from './components/ThemeSelector';
import SkipLink, { SkipTarget } from './components/ui/SkipLink';
import SuspenseLoading from './components/ui/SuspenseLoading';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ConfirmationDialog from './components/ui/ConfirmationDialog';
import { logger } from './utils/logger';
import { useTheme } from './hooks/useTheme';
import { HEIGHTS } from './config/heights';
import { initializeMonitoring, setMonitoringUser } from './utils/initializeMonitoring';

// Lazy load modal/dialog components
const DocumentationPage = lazy(() => import('./components/DocumentationPage'));
const SiteEditor = lazy(() => import('./components/SiteEditor'));
const PPDBRegistration = lazy(() => import('./components/PPDBRegistration'));

// Lazy load heavy dashboard components
const StudentPortal = lazy(() => import('./components/StudentPortal'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));
const ParentDashboard = lazy(() => import('./components/ParentDashboard'));

// Lazy load public sections to reduce initial bundle size
const HeroSection = lazy(() => import('./components/sections/HeroSection'));
const RelatedLinksSection = lazy(() => import('./components/sections/RelatedLinksSection'));
const ProfileSection = lazy(() => import('./components/sections/ProfileSection'));
const ProgramsSection = lazy(() => import('./components/sections/ProgramsSection'));
const NewsSection = lazy(() => import('./components/sections/NewsSection'));
const PPDBSection = lazy(() => import('./components/sections/PPDBSection'));

import type { FeaturedProgram, LatestNews, UserRole, UserExtraRole } from './types';
import { STORAGE_KEYS } from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import { NotificationProvider } from './contexts/NotificationContext';
import { api } from './services/apiService';
import { permissionService } from './services/permissionService';
import { unifiedNotificationManager } from './services/unifiedNotificationManager';


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
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSWUpdateConfirmOpen, setIsSWUpdateConfirmOpen] = useState(false);

  // Auth State with Persistence via Hook
  const [authSession, setAuthSession] = useLocalStorage<AuthSession>(STORAGE_KEYS.AUTH_SESSION, {
    loggedIn: false,
    role: null,
    extraRole: null
  });

  const { loggedIn: isLoggedIn, role: userRole, extraRole: userExtraRole } = authSession;

  // Initialize Advanced Theme System using useTheme hook for proper sync
  const { isReady: themeReady } = useTheme();

  useEffect(() => {
    // Initialize all monitoring services on app mount
    initializeMonitoring();
  }, []);

  useEffect(() => {
    // Ensure ThemeManager is available throughout app
    if (themeReady) {
      logger.info('Theme system initialized and ready');
    }
  }, [themeReady]);

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
          // Set monitoring user context
          setMonitoringUser({
            id: user.id,
            email: user.email,
            role: user.role,
            extraRole: user.extraRole,
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
    
    // Initialize push notification service
    unifiedNotificationManager.requestPermission().then((granted: boolean) => {
      if (granted) {
        logger.info('Push notifications enabled on app initialization');
      }
    }).catch(error => {
      logger.warn('Failed to enable push notifications:', error);
    });
  }, [siteContent.featuredPrograms.length, siteContent.latestNews.length, setAuthSession, setSiteContent]);

  useEffect(() => {
    const handleSWUpdate = () => setIsSWUpdateConfirmOpen(true);
    window.addEventListener('sw-update-available', handleSWUpdate);
    return () => window.removeEventListener('sw-update-available', handleSWUpdate);
  }, []);

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
    setIsResetConfirmOpen(true);
  };

  const confirmResetContent = async () => {
    const { INITIAL_PROGRAMS, INITIAL_NEWS } = await import('./data/defaults');
    setSiteContent({
      featuredPrograms: INITIAL_PROGRAMS,
      latestNews: INITIAL_NEWS
    });
    setIsResetConfirmOpen(false);
    showToast('Konten dikembalikan ke pengaturan awal.', 'info');
  };

  const handleSWUpdate = () => {
    (window as typeof window & { updatePWA?: () => void }).updatePWA?.();
    setIsSWUpdateConfirmOpen(false);
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
                <Suspense fallback={<SuspenseLoading message="Memuat dashboard admin..." />}>
                    <AdminDashboard
                      onOpenEditor={() => setIsEditorOpen(true)}
                      onShowToast={showToast}
                    />
                </Suspense>
              );
          case 'teacher':
              return (
                <Suspense fallback={<SuspenseLoading message="Memuat dashboard guru..." />}>
                    <TeacherDashboard
                      extraRole={userExtraRole}
                      onShowToast={showToast}
                    />
                </Suspense>
              );
          case 'parent':
              return (
                <Suspense fallback={<SuspenseLoading message="Memuat dashboard wali murid..." />}>
                    <ParentDashboard
                      onShowToast={showToast}
                    />
                </Suspense>
              );
          case 'student':
          default:
              return (
                <Suspense fallback={<SuspenseLoading message="Memuat portal siswa..." />}>
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
      <ErrorBoundary>
        <div className="w-full min-h-screen font-sans antialiased text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 transition-colors duration-300">
      <SkipLink
        targets={[
          { id: 'main-nav', label: 'Langsung ke navigasi utama' },
          { id: 'main-content', label: 'Langsung ke konten utama' },
          { id: 'footer', label: 'Langsung ke footer' },
        ] as SkipTarget[]}
      />
      <div id="main-nav" tabIndex={-1}>
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
      </div>

      {isLoggedIn && !isPublicView ? (
        <main id="main-content" tabIndex={-1}>
          {renderDashboard()}
        </main>
      ) : (
        <main id="main-content" tabIndex={-1}>
          <Suspense fallback={<SuspenseLoading message="Memuat halaman..." />}>
            <HeroSection />
          </Suspense>
          <Suspense fallback={<SuspenseLoading message="Memuat tautan..." />}>
            <RelatedLinksSection />
          </Suspense>
          <Suspense fallback={<SuspenseLoading message="Memuat profil..." />}>
            <ProfileSection />
          </Suspense>
          <Suspense fallback={<SuspenseLoading message="Memuat PPDB..." />}>
            <PPDBSection onRegisterClick={() => setIsPPDBOpen(true)} />
          </Suspense>
          {/* Robustness Fix: Added fallback to empty array to prevent crashes if localStorage data is corrupted/incomplete */}
          <Suspense fallback={<SuspenseLoading message="Memuat program..." />}>
            <ProgramsSection programs={siteContent?.featuredPrograms || []} />
          </Suspense>
          <Suspense fallback={<SuspenseLoading message="Memuat berita..." />}>
            <NewsSection news={siteContent?.latestNews || []} />
          </Suspense>
        </main>
      )}

      <Footer
        onDocsClick={() => setIsDocsOpen(true)}
      />

      <div
        className={`fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-40 w-[calc(100vw-2.5rem)] max-w-sm ${HEIGHTS.VIEWPORT.MEDIUM} ${HEIGHTS.VIEWPORT_MAX.COMPACT} transition-all duration-300 ease-in-out ${
          isChatOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-hidden={!isChatOpen}
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
      
      <Suspense fallback={<SuspenseLoading message="Memuat formulir pendaftaran..." />}>
        <PPDBRegistration
          isOpen={isPPDBOpen}
          onClose={() => setIsPPDBOpen(false)}
          onShowToast={showToast}
        />
      </Suspense>

      <Suspense fallback={<SuspenseLoading message="Memuat dokumentasi..." />}>
        <DocumentationPage
          isOpen={isDocsOpen}
          onClose={() => setIsDocsOpen(false)}
        />
      </Suspense>

      <Suspense fallback={<SuspenseLoading message="Memuat editor..." />}>
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

      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        title="Reset Konten Website"
        message="Apakah Anda yakin ingin mengembalikan konten website ke pengaturan awal? Semua perubahan akan dihapus secara permanen."
        confirmText="Ya, Reset"
        cancelText="Batal"
        type="danger"
        onConfirm={confirmResetContent}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <ConfirmationDialog
        isOpen={isSWUpdateConfirmOpen}
        title="Update Tersedia"
        message="Konten baru tersedia untuk aplikasi. Apakah Anda ingin memperbarui sekarang?"
        confirmText="Ya, Update"
        cancelText="Nanti Saja"
        type="info"
        onConfirm={handleSWUpdate}
        onCancel={() => setIsSWUpdateConfirmOpen(false)}
      />
      </div>
      </ErrorBoundary>
    </NotificationProvider>
  );
};

export default App;
