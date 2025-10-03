
import React from 'react';
import Logo from './Logo';
import DesktopNavigation from './DesktopNavigation';
import AuthButtons from './AuthButtons';
import MobileMenuButton from './MobileMenuButton';
import MobileMenu from './MobileMenu';
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
                        <AuthButtons
                            isLoggedIn={isLoggedIn}
                            onLoginClick={onLoginClick}
                            onChatClick={onChatClick}
                            onLogout={onLogout}
                            onPortalClick={onPortalClick}
                        />
                        <div onTouchStart={handleTouchFeedback}>
                          <MobileMenuButton
                              isMenuOpen={isMenuOpen}
                              onToggle={() => setIsMenuOpen(!isMenuOpen)}
                          />
                        </div>
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