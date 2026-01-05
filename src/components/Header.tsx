
import React, { useState, useEffect } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ChatIcon } from './icons/ChatIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { UserRole, UserExtraRole } from '../types';
import NotificationCenter from './NotificationCenter';

const NavLinks = () => (
    <>
        <a href="#home" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors">Beranda</a>
        <a href="#profil" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors">Profil</a>
        <a href="#berita" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors">Berita</a>
        <a href="#download" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors">Download</a>
        <a href="#login-email" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors">Login Email</a>
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
        fixed top-0 left-0 right-0 z-40 transition-all duration-300
        ${isScrolled ? 'mt-0 rounded-none shadow-md' : 'mt-4 mx-2 sm:mx-4 rounded-full'}
    `;

    const navContainerClasses = `
        w-full max-w-7xl mx-auto px-4
        ${isScrolled ? '' : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-full ring-1 ring-gray-900/5 dark:ring-white/10 shadow-lg shadow-black/5'}
    `;

    const innerNavClasses = `
        flex items-center justify-between h-16
        ${isScrolled ? 'bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg' : ''}
    `;

    return (
        <header className={headerClasses}>
            <div className={navContainerClasses}>
                 <div className={`${innerNavClasses} ${isScrolled ? 'max-w-7xl mx-auto px-4' : ''}`}>
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            M
                        </div>
                        <div>
                            <span className="font-bold text-lg text-gray-800 dark:text-white leading-tight">Malnu Kananga</span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400 leading-tight tracking-wider">NPSN: 69881502</span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center space-x-8 font-medium">
                        <NavLinks />
                    </nav>

                    <div className="flex items-center space-x-2">
                        {isLoggedIn && userRole && (
                            <NotificationCenter
                                userRole={userRole}
                                onShowToast={onShowToast}
                            />
                        )}

                        <button
                            onClick={onToggleTheme}
                            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-1"
                            aria-label="Ganti Tema"
                        >
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        </button>

                        {isLoggedIn ? (
                             <div className="hidden sm:flex items-center space-x-2">
                                {/* Role Badge */}
                                {userExtraRole && (
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full mr-2 ${
                                        userExtraRole === 'staff' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                    }`}>
                                        {userExtraRole}
                                    </span>
                                )}

                                {userRole === 'admin' && (
                                    <button 
                                        onClick={onEditClick} 
                                        className="flex items-center gap-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-4 py-2 rounded-full font-semibold text-sm hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                                        title="Buka Editor AI"
                                    >
                                        <SparklesIcon />
                                        <span className="hidden lg:inline">Editor AI</span>
                                    </button>
                                )}

                                <button 
                                    onClick={onTogglePublicView} 
                                    className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {isPublicView ? 'Lihat Dashboard' : 'Lihat Website'}
                                </button>

                                <button onClick={onLogout} className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-5 py-2 rounded-full font-semibold text-sm hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center space-x-2">
                                <button onClick={onChatClick} className="flex items-center gap-2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-4 py-2 rounded-full font-semibold text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                                    <ChatIcon />
                                    <span>Tanya AI</span>
                                </button>
                                <button onClick={onLoginClick} className="bg-green-600 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-green-700 transition-colors">
                                    Login
                                </button>
                            </div>
                        )}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Buka menu">
                            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu (Simplified for brevity, assumes logic mirrors desktop) */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg mx-2 sm:mx-4 rounded-2xl mt-2 p-4">
                    <nav className="flex flex-col space-y-4 font-medium text-center">
                        <NavLinks />
                         <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-3">
                            {isLoggedIn ? (
                                <>
                                    <button onClick={() => { onTogglePublicView(); setIsMenuOpen(false); }} className="bg-gray-100 text-gray-700 w-full px-5 py-2 rounded-full text-sm">
                                        {isPublicView ? 'Lihat Dashboard' : 'Lihat Website'}
                                    </button>
                                    <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="bg-red-100 text-red-700 w-full px-5 py-2 rounded-full text-sm">Logout</button>
                                </>
                            ) : (
                                <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="bg-green-600 text-white w-full px-5 py-2 rounded-full text-sm">Login</button>
                            )}
                         </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
