
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast, { ToastType } from './components/Toast';
import SkipLink, { SkipTarget } from './components/ui/SkipLink';
import SuspenseLoading from './components/ui/SuspenseLoading';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ScrollToTop from './components/ui/ScrollToTop';
import { logger } from './utils/logger';
import { useTheme } from './hooks/useTheme';
import { HEIGHTS } from './config/heights';
import { initializeMonitoring, setMonitoringUser } from './utils/initializeMonitoring';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';
import type { Command } from './components/ui/CommandPalette';

// Lazy load non-critical components to reduce initial bundle size
const ChatWindow = lazy(() => import('./components/ChatWindow'));
const LoginModal = lazy(() => import('./components/LoginModal'));
const ThemeSelector = lazy(() => import('./components/ThemeSelector'));
const ConfirmationDialog = lazy(() => import('./components/ui/ConfirmationDialog'));
const CommandPalette = lazy(() => import('./components/ui/CommandPalette').then(m => ({ default: m.CommandPalette })));

// Lazy load modal/dialog components
const DocumentationPage = lazy(() => import('./components/DocumentationPage'));
const SiteEditor = lazy(() => import('./components/SiteEditor'));
const PPDBRegistration = lazy(() => import('./components/PPDBRegistration'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));

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
import { STORAGE_KEYS, USER_ROLES, ROLE_DISPLAY_NAMES } from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import { NotificationProvider } from './contexts/NotificationContext';
import { api } from './services/apiService';
import { permissionService } from './services/permissionService';
import { unifiedNotificationManager } from './services/notifications/unifiedNotificationManager';


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
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Auth State with Persistence via Hook
  const [authSession, setAuthSession] = useLocalStorage<AuthSession>(STORAGE_KEYS.AUTH_SESSION, {
    loggedIn: false,
    role: null,
    extraRole: null
  });

  const { loggedIn: isLoggedIn, role: userRole, extraRole: userExtraRole } = authSession;

  // Initialize Advanced Theme System using useTheme hook for proper sync
  const { isReady: themeReady } = useTheme();

  usePerformanceMonitoring();

  useEffect(() => {
    initializeMonitoring();
  }, []);

  useEffect(() => {
    // Ensure ThemeManager is available throughout app
    if (themeReady) {
      logger.info('Theme system initialized and ready');
    }
  }, [themeReady]);

  useEffect(() => {
    // Check URL for reset token
    const urlParams = new window.URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
    }
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
      if (!hasLoadedContent.current) {
        hasLoadedContent.current = true;
        const { INITIAL_PROGRAMS, INITIAL_NEWS } = await import('./data/defaults');
        setSiteContent((prevContent: SiteContent) => {
          // Only set defaults if content is empty
          if (prevContent.featuredPrograms.length === 0 || prevContent.latestNews.length === 0) {
            return {
              featuredPrograms: INITIAL_PROGRAMS,
              latestNews: INITIAL_NEWS
            };
          }
          return prevContent;
        });
      }
    };
    
    checkAuth();
    loadDefaultContent().catch((error) => {
      logger.error('Failed to load default content:', error);
    });
    
    // Only check permission status, don't request on load (Lighthouse best practice)
    // Permission will be requested when user interacts with notification settings
    const permissionStatus = unifiedNotificationManager.isPermissionGranted();
    if (permissionStatus) {
      logger.info('Push notifications already granted');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setToast((prev: typeof toast) => ({ ...prev, isVisible: false }));
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
    
    let roleName = ROLE_DISPLAY_NAMES[role];
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
    try {
      const { INITIAL_PROGRAMS, INITIAL_NEWS } = await import('./data/defaults');
      setSiteContent({
        featuredPrograms: INITIAL_PROGRAMS,
        latestNews: INITIAL_NEWS
      });
      setIsResetConfirmOpen(false);
      showToast('Konten dikembalikan ke pengaturan awal.', 'info');
    } catch (error) {
      logger.error('Failed to reset content:', error);
      showToast('Gagal mengembalikan konten ke pengaturan awal.', 'error');
    }
  };

  const handleSWUpdate = () => {
    (window as typeof window & { updatePWA?: () => void }).updatePWA?.();
    setIsSWUpdateConfirmOpen(false);
  };

  // Define commands for Command Palette
  const commands: Command[] = [
    {
      id: 'toggle-theme',
      label: 'Ganti Tema',
      description: 'Buka pemilih tema',
      shortcut: 'Ctrl+Shift+T',
      category: 'Tampilan',
      action: () => setIsThemeSelectorOpen(true),
    },
    {
      id: 'toggle-chat',
      label: isChatOpen ? 'Tutup Chat' : 'Buka Chat',
      description: 'Toggle jendela chat AI',
      category: 'Navigasi',
      action: () => setIsChatOpen(!isChatOpen),
    },
    {
      id: 'open-docs',
      label: 'Buka Dokumentasi',
      description: 'Lihat dokumentasi aplikasi',
      category: 'Bantuan',
      action: () => setIsDocsOpen(true),
    },
    ...(isLoggedIn
      ? [
          {
            id: 'logout',
            label: 'Logout',
            description: 'Keluar dari aplikasi',
            category: 'Akun',
            action: handleLogout,
          },
        ]
      : [
          {
            id: 'login',
            label: 'Login',
            description: 'Masuk ke aplikasi',
            category: 'Akun',
            action: () => setIsLoginOpen(true),
          },
        ]),
  ];

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'k',
        metaKey: true,
        description: 'Buka Command Palette (Cmd+K)',
        action: () => setIsCommandPaletteOpen(true),
      },
      {
        key: 'k',
        ctrlKey: true,
        description: 'Buka Command Palette (Ctrl+K)',
        action: () => setIsCommandPaletteOpen(true),
      },
      {
        key: 'Escape',
        description: 'Tutup Command Palette',
        action: () => setIsCommandPaletteOpen(false),
        disabled: !isCommandPaletteOpen,
      },
    ],
  });

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
          case USER_ROLES.ADMIN:
              return (
                <Suspense fallback={<SuspenseLoading message="Memuat dashboard admin..." />}>
                    <AdminDashboard
                      onOpenEditor={() => setIsEditorOpen(true)}
                      onShowToast={showToast}
                    />
                </Suspense>
              );
          case USER_ROLES.TEACHER:
              return (
                <Suspense fallback={<SuspenseLoading message="Memuat dashboard guru..." />}>
                    <TeacherDashboard
                      extraRole={userExtraRole}
                      onShowToast={showToast}
                    />
                </Suspense>
              );
          case USER_ROLES.PARENT:
              return (
                <Suspense fallback={<SuspenseLoading message="Memuat dashboard wali murid..." />}>
                    <ParentDashboard
                      onShowToast={showToast}
                    />
                </Suspense>
              );
          case USER_ROLES.STUDENT:
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
        {resetToken ? (
          <Suspense fallback={<SuspenseLoading message="Memuat halaman reset password..." />}>
            <ResetPassword />
          </Suspense>
        ) : (
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
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-40 w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)] max-w-sm ${HEIGHTS.VIEWPORT.MEDIUM} ${HEIGHTS.VIEWPORT_MAX.COMPACT} transition-all duration-300 ease-in-out ${
          isChatOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-hidden={!isChatOpen}
      >
        <Suspense fallback={<SuspenseLoading message="Memuat asisten AI..." />}>
          <ChatWindow
            isOpen={isChatOpen}
            closeChat={() => setIsChatOpen(false)}
            siteContext={siteContent || { featuredPrograms: [], latestNews: [] }}
            onShowToast={showToast}
          />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </Suspense>
      
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

      <ScrollToTop
        showThreshold={400}
        position="bottom-right"
        size="md"
        variant="elevated"
        showProgress={true}
      />

      <Suspense fallback={null}>
        <ThemeSelector
          isOpen={isThemeSelectorOpen}
          onClose={() => setIsThemeSelectorOpen(false)}
        />
      </Suspense>

      <Suspense fallback={null}>
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
      </Suspense>

      <Suspense fallback={null}>
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
      </Suspense>

      <Suspense fallback={null}>
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          commands={commands}
          placeholder="Cari perintah atau navigasi... (ketik ? untuk bantuan)"
        />
      </Suspense>
      </div>
      )}
      </ErrorBoundary>
    </NotificationProvider>
  );
};

export default App;
