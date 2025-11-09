
import React from 'react';
import Logo from './Logo';
import DesktopNavigation from './DesktopNavigation';
import AuthButtons from './AuthButtons';
import MobileMenuButton from './MobileMenuButton';
import MobileMenu from './MobileMenu';
import { ChatIcon } from './icons/ChatIcon';
import { CloseIcon } from './icons/CloseIcon';
import { MenuIcon } from './icons/MenuIcon';
import { useScrollEffect } from '../hooks/useScrollEffect';
import { useResponsiveMenu } from '../hooks/useResponsiveMenu';
import { useTouchFeedback } from '../hooks/useTouchFeedback';

interface HeaderProps {
    onLoginClick: () => void;
    onChatClick: () => void;
    isLoggedIn: boolean;
    onLogout: () => void;
    onPortalClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onChatClick, isLoggedIn, onLogout, onPortalClick }) => {
    const isScrolled = useScrollEffect();
    const { isMenuOpen, setIsMenuOpen } = useResponsiveMenu();
    const { handleTouchFeedback } = useTouchFeedback();



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
                    <Logo />

                    <DesktopNavigation />

                    <div className="flex items-center space-x-2">
                       {isLoggedIn ? (
                            <div className="hidden sm:flex items-center space-x-2">
                               <a href="#" className="bg-green-600 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-green-700 transition-colors">
                                   Portal
                               </a>
                               <button onClick={onLogout} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
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
                       {/* Mobile Menu Button */}
                       <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}>
                           {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                       </button>
                    </div>
                </div>
            </div>

            <MobileMenu
                isOpen={isMenuOpen}
                isLoggedIn={isLoggedIn}
                onLoginClick={onLoginClick}
                onChatClick={onChatClick}
                onLogout={onLogout}
                onPortalClick={onPortalClick}
                onClose={() => setIsMenuOpen(false)}
            />
        </header>
    );
};

export default Header;