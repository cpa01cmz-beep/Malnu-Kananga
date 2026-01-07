
import React, { useState, useEffect } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ChatIcon } from './icons/ChatIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { UserRole, UserExtraRole } from '../types';
import NotificationCenter from './NotificationCenter';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import { ThemeManager } from '../services/themeManager';
import { getGradientClass } from '../config/gradients';

const navLinkClass = "text-sm sm:text-base text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 ease-out font-semibold px-4 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 hover:scale-[1.01] active:scale-95";

const NavLinks = () => (
    <>
        <a href="#home" className={navLinkClass}>Beranda</a>
        <a href="#profil" className={navLinkClass}>Profil</a>
        <a href="#berita" className={navLinkClass}>Berita</a>
        <a href="#download" className={navLinkClass}>Download</a>
        <a href="#login-email" className={navLinkClass}>Login Email</a>
    </>
);

interface HeaderProps {
    onLoginClick: () => void;
    onChatClick: () => void;
    onEditClick: () => void;
    isLoggedIn: boolean;
    userRole: UserRole | null;
    userExtraRole?: UserExtraRole;
    onLogout: () => void;
    isPublicView: boolean;
    onTogglePublicView: () => void;
    onToggleTheme: () => void;
    onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const Header: React.FC<HeaderProps> = ({
    onLoginClick,
    onChatClick,
    onEditClick,
    isLoggedIn,
    userRole,
    userExtraRole,
    onLogout,
    isPublicView,
    onTogglePublicView,
    onToggleTheme,
    onShowToast
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<import('../config/themes').Theme | null>(null);

    useEffect(() => {
        const themeManager = ThemeManager.getInstance();
        const handleThemeChange = (theme: import('../config/themes').Theme) => {
            setCurrentTheme(theme);
        };

        setCurrentTheme(themeManager.getCurrentTheme());
        themeManager.addListener(handleThemeChange);

        return () => {
            themeManager.removeListener(handleThemeChange);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const headerClasses = `
        fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out
        ${isScrolled ? 'mt-0 rounded-none shadow-card' : 'mt-4 mx-2 sm:mx-4 rounded-full'}
    `;

    const navContainerClasses = `
        w-full max-w-7xl mx-auto px-4 sm:px-6
        ${isScrolled ? '' : 'bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl rounded-full ring-1 ring-neutral-900/10 dark:ring-white/10 shadow-card'}
    `;

    const innerNavClasses = `
        flex items-center justify-between h-16
        ${isScrolled ? 'bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl' : ''}
    `;

    return (
        <header className={headerClasses}>
            <div className={navContainerClasses}>
                 <div className={`${innerNavClasses} ${isScrolled ? 'max-w-7xl mx-auto px-4' : ''}`}>
                        <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-11 h-11 ${getGradientClass('PRIMARY')} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900`}>
                            M
                        </div>
                        <div>
                            <span className="font-bold text-lg text-neutral-900 dark:text-white leading-tight">Malnu Kananga</span>
                            <span className="block text-xs text-neutral-500 dark:text-neutral-400 leading-tight tracking-wide">NPSN: 69881502</span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-1" aria-label="Menu navigasi desktop">
                        <NavLinks />
                    </nav>

                    <div className="flex items-center gap-2">
                        {isLoggedIn && userRole && (
                            <NotificationCenter
                                userRole={userRole}
                                onShowToast={onShowToast}
                            />
                        )}

                        <IconButton
                            icon={currentTheme?.isDark ? <SunIcon /> : <MoonIcon />}
                            ariaLabel="Pilih Tema"
                            tooltip={currentTheme ? `${currentTheme.displayName} - Klik untuk Ubah Tema` : undefined}
                            size="lg"
                            onClick={onToggleTheme}
                        />

                           {isLoggedIn ? (
                               <div className="hidden sm:flex items-center gap-2">
                                {userExtraRole && (
                                    <span className={`text-xs font-bold px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 ${
                                        userExtraRole === 'staff' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 focus:ring-indigo-500' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 focus:ring-orange-500'
                                    }`}>
                                        {userExtraRole}
                                    </span>
                                )}

                                 {userRole === 'admin' && (
                                      <button
                                          onClick={onEditClick}
                                          className="flex items-center gap-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 hover:scale-[1.02] active:scale-95"
                                          title="Buka Editor AI"
                                      >
                                          <SparklesIcon />
                                          <span className="hidden lg:inline">Editor AI</span>
                                      </button>
                                 )}

                                <button
                                     onClick={onTogglePublicView}
                                     className="bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-neutral-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 hover:scale-[1.02] active:scale-95"
                                 >
                                     {isPublicView ? 'Lihat Dashboard' : 'Lihat Website'}
                                 </button>

                                <Button variant="danger" onClick={onLogout}>
                                    Logout
                                </Button>
                            </div>
                          ) : (
                              <div className="hidden sm:flex items-center gap-2">
                                   <Button variant="info" onClick={onChatClick} icon={<ChatIcon />} iconPosition="left">
                                        <span>Tanya AI</span>
                                    </Button>
                                    <Button onClick={onLoginClick}>
                                        Login
                                    </Button>
                              </div>
                          )}
<IconButton
                                    icon={isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                                    ariaLabel={isMenuOpen ? "Tutup menu" : "Buka menu"}
                                    size="lg"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setIsMenuOpen(!isMenuOpen);
                                        }
                                    }}
                                    aria-expanded={isMenuOpen}
                                    aria-controls="mobile-menu"
                                />
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div
                    className="md:hidden bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl shadow-card mx-2 sm:mx-4 rounded-xl mt-2 p-4 sm:p-5 animate-fade-in border border-neutral-200 dark:border-neutral-700"
                >
                    <nav
                        id="mobile-menu"
                        className="flex flex-col gap-2.5 sm:gap-3 font-medium text-center"
                        role="navigation"
                        aria-label="Menu navigasi utama"
                    >
                        <NavLinks />
                           <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 flex flex-col gap-2">
                               {isLoggedIn ? (
                                   <>
                                          <button onClick={() => { onTogglePublicView(); setIsMenuOpen(false); }} className="bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 w-full px-4 py-3 rounded-lg font-semibold text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-neutral-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 hover:scale-[1.02] active:scale-95">
                                               {isPublicView ? 'Lihat Dashboard' : 'Lihat Website'}
                                          </button>
                                          <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 w-full px-4 py-3 rounded-lg font-semibold text-sm hover:bg-red-200 dark:hover:bg-red-800/50 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 hover:scale-[1.02] active:scale-95">Logout</button>
                                     </>
                                 ) : (
                                        <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="bg-primary-600 text-white w-full px-4 py-3 rounded-lg font-semibold text-sm hover:bg-primary-700 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95">Login</button>
                                 )}
                           </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
