
import React, { useState, useEffect, useRef } from 'react';
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
import Badge from './ui/Badge';
import { ThemeManager } from '../services/themeManager';
import { getGradientClass } from '../config/gradients';
import { OPACITY_TOKENS, HEADER_NAV_STRINGS } from '../constants';

const navLinkClass = "text-sm sm:text-base text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 ease-out font-semibold px-4 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 hover:scale-[1.01] active:scale-95";

const NavLinks = () => (
    <>
        <a href="#home" className={navLinkClass}>{HEADER_NAV_STRINGS.HOME}</a>
        <a href="#profil" className={navLinkClass}>{HEADER_NAV_STRINGS.PROFILE}</a>
        <a href="#berita" className={navLinkClass}>{HEADER_NAV_STRINGS.NEWS}</a>
        <a href="#download" className={navLinkClass}>{HEADER_NAV_STRINGS.DOWNLOAD}</a>
        <a href="#login-email" className={navLinkClass}>{HEADER_NAV_STRINGS.LOGIN_EMAIL}</a>
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
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

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

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMenuOpen) {
                setIsMenuOpen(false);
                menuButtonRef.current?.focus();
            }
        };

        const handleTab = (e: KeyboardEvent) => {
            if (!isMenuOpen || !mobileMenuRef.current) return;

            const focusableElements = mobileMenuRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        if (isMenuOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('keydown', handleTab);
            const firstFocusable = mobileMenuRef.current?.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) as HTMLElement;
            firstFocusable?.focus();
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleTab);
        };
    }, [isMenuOpen]);

    const headerClasses = `
        fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out
        ${isScrolled ? 'mt-0 rounded-none shadow-card' : 'mt-4 mx-2 sm:mx-4 rounded-full'}
    `;

    const navContainerClasses = `
        w-full max-w-7xl mx-auto px-4 sm:px-6
        ${isScrolled ? '' : `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} ${OPACITY_TOKENS.BACKDROP_BLUR_XL} rounded-full ring-1 ring-neutral-900/10% dark:ring-white/10% shadow-card`}
    `;

    const innerNavClasses = `
        flex items-center justify-between h-16
        ${isScrolled ? `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} ${OPACITY_TOKENS.BACKDROP_BLUR_XL}` : ''}
    `;

    return (
        <header id="main-nav" className={headerClasses}>
            <div className={navContainerClasses}>
                 <div className={`${innerNavClasses} ${isScrolled ? 'max-w-7xl mx-auto px-4' : ''}`}>
                        <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 ${getGradientClass('PRIMARY')} rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900`}>
                            {HEADER_NAV_STRINGS.LOGO_TEXT}
                        </div>
                        <div>
                            <span className="font-bold text-lg text-neutral-900 dark:text-white leading-tight">{HEADER_NAV_STRINGS.SCHOOL_NAME}</span>
                            <span className="block text-xs text-neutral-500 dark:text-neutral-400 leading-tight tracking-wide">{HEADER_NAV_STRINGS.NPSN_LABEL}</span>
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
                                      <Badge
                                          variant={userExtraRole === 'staff' ? 'info' : userExtraRole === 'osis' ? 'warning' : 'neutral'}
                                          size="sm"
                                          rounded={false}
                                      >
                                          {userExtraRole}
                                      </Badge>
                                  )}

                                 {userRole === 'admin' && (
                                     <Button
                                         variant="indigo"
                                         onClick={onEditClick}
                                          icon={<SparklesIcon aria-hidden="true" />}
                                         iconPosition="left"
                                         title={HEADER_NAV_STRINGS.AI_EDITOR_OPEN}
                                     >
                                         <span className="hidden lg:inline">{HEADER_NAV_STRINGS.AI_EDITOR}</span>
                                     </Button>
                                  )}

                                  <Button
                                      variant="secondary"
                                      onClick={onTogglePublicView}
                                  >
                                      {isPublicView ? HEADER_NAV_STRINGS.VIEW_DASHBOARD : HEADER_NAV_STRINGS.VIEW_WEBSITE}
                                  </Button>

                                <Button variant="danger" onClick={onLogout}>
                                    Logout
                                </Button>
                            </div>
                          ) : (
                              <div className="hidden sm:flex items-center gap-2">
                                    <Button variant="info" onClick={onChatClick} icon={<ChatIcon />} iconPosition="left">
                                         <span>{HEADER_NAV_STRINGS.AI_ASK}</span>
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
                    ref={mobileMenuRef}
                    className={`md:hidden ${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} ${OPACITY_TOKENS.BACKDROP_BLUR_XL} shadow-card mx-2 sm:mx-4 rounded-xl mt-2 p-4 sm:p-5 animate-fade-in border border-neutral-200 dark:border-neutral-700`}
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
                                           <Button
                                               variant="secondary"
                                               onClick={() => { onTogglePublicView(); setIsMenuOpen(false); }}
                                               fullWidth
                                           >
                                               {isPublicView ? 'Lihat Dashboard' : 'Lihat Website'}
                                           </Button>
                                           <Button
                                               variant="danger"
                                               onClick={() => { onLogout(); setIsMenuOpen(false); }}
                                               fullWidth
                                           >
                                               Logout
                                           </Button>
                                      </>
                                  ) : (
                                          <Button
                                              variant="primary"
                                              onClick={() => { onLoginClick(); setIsMenuOpen(false); }}
                                              fullWidth
                                          >
                                              Login
                                          </Button>
                                   )}
                            </div>
                     </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
