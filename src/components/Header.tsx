
import React, { useState, useEffect } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ChatIcon } from './icons/ChatIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { UserRole, UserExtraRole } from '../types';
import NotificationCenter from './NotificationCenter';

const navLinkClass = "text-sm sm:text-base text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800";

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
    theme: 'light' | 'dark';
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
    theme,
    onToggleTheme,
    onShowToast
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

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
        ${isScrolled ? 'mt-0 rounded-none shadow-md' : 'mt-4 mx-2 sm:mx-4 rounded-pill'}
    `;

    const navContainerClasses = `
        w-full max-w-7xl mx-auto px-4 sm:px-6
        ${isScrolled ? '' : 'bg-white/85 dark:bg-neutral-800/85 backdrop-blur-xl rounded-pill ring-1 ring-neutral-900/5 dark:ring-white/10 shadow-card'}
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
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                            M
                        </div>
                        <div>
                            <span className="font-bold text-lg text-neutral-900 dark:text-white leading-tight">Malnu Kananga</span>
                            <span className="block text-xs text-neutral-500 dark:text-neutral-400 leading-tight tracking-wide">NPSN: 69881502</span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        <NavLinks />
                    </nav>

                    <div className="flex items-center gap-3">
                        {isLoggedIn && userRole && (
                            <NotificationCenter
                                userRole={userRole}
                                onShowToast={onShowToast}
                            />
                        )}

                        <button
                            onClick={onToggleTheme}
                            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            aria-label="Ganti Tema"
                        >
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        </button>

                         {isLoggedIn ? (
                              <div className="hidden sm:flex items-center gap-2">
                                {userExtraRole && (
                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                                        userExtraRole === 'staff' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                    }`}>
                                        {userExtraRole}
                                    </span>
                                )}

                                {userRole === 'admin' && (
                                    <button
                                        onClick={onEditClick}
                                        className="flex items-center gap-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        title="Buka Editor AI"
                                    >
                                        <SparklesIcon />
                                        <span className="hidden lg:inline">Editor AI</span>
                                    </button>
                                )}

                                <button
                                    onClick={onTogglePublicView}
                                    className="bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                                >
                                    {isPublicView ? 'Lihat Dashboard' : 'Lihat Website'}
                                </button>

                                <button onClick={onLogout} className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-red-200 dark:hover:bg-red-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <button onClick={onChatClick} className="flex items-center gap-2 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <ChatIcon />
                                    <span>Tanya AI</span>
                                </button>
                                <button onClick={onLoginClick} className="bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    Login
                                </button>
                            </div>
                        )}
                          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Buka menu">
                            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-neutral-800 shadow-card mx-2 sm:mx-4 rounded-xl mt-2 p-4 animate-fade-in border border-neutral-200 dark:border-neutral-700">
                    <nav className="flex flex-col gap-3 font-medium text-center">
                        <NavLinks />
                          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 flex flex-col gap-3">
                             {isLoggedIn ? (
                                 <>
                                      <button onClick={() => { onTogglePublicView(); setIsMenuOpen(false); }} className="bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 w-full px-4 py-3 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-500">
                                          {isPublicView ? 'Lihat Dashboard' : 'Lihat Website'}
                                      </button>
                                      <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 w-full px-4 py-3 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500">Logout</button>
                                  </>
                              ) : (
                                  <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="bg-primary-600 text-white w-full px-4 py-3 rounded-lg text-sm font-medium hover:bg-primary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800">Login</button>
                              )}
                          </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
