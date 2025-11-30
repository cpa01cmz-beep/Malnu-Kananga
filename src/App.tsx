
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import DocumentationPage from './components/DocumentationPage';
import SiteEditor from './components/SiteEditor';
import ChatWindow from './components/ChatWindow';
import Toast, { ToastType } from './components/Toast';
import StudentPortal from './components/StudentPortal';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import PPDBRegistration from './components/PPDBRegistration'; 

// Sections
import HeroSection from './components/sections/HeroSection';
import RelatedLinksSection from './components/sections/RelatedLinksSection';
import ProfileSection from './components/sections/ProfileSection';
import ProgramsSection from './components/sections/ProgramsSection';
import NewsSection from './components/sections/NewsSection';
import PPDBSection from './components/sections/PPDBSection';

import { INITIAL_PROGRAMS, INITIAL_NEWS } from './data/defaults';
import type { FeaturedProgram, LatestNews, UserRole, UserExtraRole } from './types'; 
import { STORAGE_KEYS } from './constants'; // Import constants

const App: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPPDBOpen, setIsPPDBOpen] = useState(false);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPublicView, setIsPublicView] = useState(false);

  // Auth State with Persistence
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userExtraRole, setUserExtraRole] = useState<UserExtraRole>(null); 

  // Initialize Auth from LocalStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (savedAuth) {
      try {
        const { role, extraRole, loggedIn } = JSON.parse(savedAuth);
        if (loggedIn && role) {
          setIsLoggedIn(true);
          setUserRole(role);
          setUserExtraRole(extraRole || null);
        }
      } catch (e) {
        console.error("Failed to parse auth session", e);
        localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      }
    }
  }, []);

  // Theme State & Logic
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
  
  // Content State
  const [featuredPrograms, setFeaturedPrograms] = useState<FeaturedProgram[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SITE_CONTENT);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.featuredPrograms || INITIAL_PROGRAMS;
      } catch (e) {
        return INITIAL_PROGRAMS;
      }
    }
    return INITIAL_PROGRAMS;
  });

  const [latestNews, setLatestNews] = useState<LatestNews[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SITE_CONTENT);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.latestNews || INITIAL_NEWS;
      } catch (e) {
        return INITIAL_NEWS;
      }
    }
    return INITIAL_NEWS;
  });

  const handleLoginSuccess = (role: UserRole, extraRole: UserExtraRole = null) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserExtraRole(extraRole);
    setIsLoginOpen(false);
    setIsPublicView(false); 
    
    // Save session including extraRole
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify({ loggedIn: true, role, extraRole }));

    let roleName = role === 'admin' ? 'Administrator' : role === 'teacher' ? 'Guru' : 'Siswa';
    if (extraRole === 'staff') roleName += ' (Staff)';
    if (extraRole === 'osis') roleName += ' (Pengurus OSIS)';

    showToast(`Login berhasil! Selamat datang, ${roleName}.`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserExtraRole(null);
    setIsPublicView(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    showToast('Anda telah logout.', 'info');
  };

  const handleUpdateContent = (newContent: { featuredPrograms: FeaturedProgram[], latestNews: LatestNews[] }) => {
    setFeaturedPrograms(newContent.featuredPrograms);
    setLatestNews(newContent.latestNews);
    localStorage.setItem(STORAGE_KEYS.SITE_CONTENT, JSON.stringify(newContent));
    setIsEditorOpen(false);
    showToast('Konten website berhasil diperbarui! Beralih ke "Lihat Website" untuk melihat hasilnya.', 'success');
  };

  const handleResetContent = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan konten website ke pengaturan awal? Semua perubahan akan dihapus.')) {
      setFeaturedPrograms(INITIAL_PROGRAMS);
      setLatestNews(INITIAL_NEWS);
      localStorage.removeItem(STORAGE_KEYS.SITE_CONTENT);
      showToast('Konten dikembalikan ke pengaturan awal.', 'info');
    }
  };

  // Helper to render the correct dashboard based on role
  const renderDashboard = () => {
      switch (userRole) {
          case 'admin':
              return <AdminDashboard 
                        onOpenEditor={() => setIsEditorOpen(true)} 
                        onShowToast={showToast} 
                     />;
          case 'teacher':
              return <TeacherDashboard 
                        extraRole={userExtraRole} // Pass extra role
                        onShowToast={showToast} 
                     />;
          case 'student':
          default:
              return <StudentPortal 
                        extraRole={userExtraRole} // Pass extra role
                        onShowToast={showToast} 
                     />;
      }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 w-full min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header 
        onLoginClick={() => setIsLoginOpen(true)}
        onChatClick={() => setIsChatOpen(true)}
        onEditClick={() => setIsEditorOpen(true)}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        userExtraRole={userExtraRole} // Pass extra role to header
        onLogout={handleLogout}
        isPublicView={isPublicView}
        onTogglePublicView={() => setIsPublicView(!isPublicView)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      {isLoggedIn && !isPublicView ? (
        renderDashboard()
      ) : (
        <main>
          <HeroSection />
          <RelatedLinksSection />
          <ProfileSection />
          <PPDBSection onRegisterClick={() => setIsPPDBOpen(true)} />
          <ProgramsSection programs={featuredPrograms} />
          <NewsSection news={latestNews} />
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
          siteContext={{ featuredPrograms, latestNews }}
        />
      </div>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <PPDBRegistration 
        isOpen={isPPDBOpen}
        onClose={() => setIsPPDBOpen(false)}
        onShowToast={showToast}
      />

      <DocumentationPage 
        isOpen={isDocsOpen} 
        onClose={() => setIsDocsOpen(false)} 
      />

      <SiteEditor 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        currentContent={{ featuredPrograms, latestNews }}
        onUpdateContent={handleUpdateContent}
        onResetContent={handleResetContent}
      />

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
      />
    </div>
  );
};

export default App;
