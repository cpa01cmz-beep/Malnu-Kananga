
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
import { OPACITY_TOKENS, HEADER_NAV_STRINGS, USER_ROLES } from '../constants';
import { useFocusTrap } from '../hooks/useFocusTrap';

const navLinkClass = "text-sm sm:text-base text-accessible-primary font-semibold px-5 py-3.5 rounded-xl hover:bg-neutral-100/80 dark:hover:bg-neutral-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 hover:scale-[1.03] active:scale-[0.97] active:bg-neutral-100/80 dark:active:bg-neutral-700/60 touch-manipulation hover-underline focus-visible-enhanced enhanced-mobile-spacing mobile-touch-target mobile-nav-enhanced transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275) backdrop-blur-md hover-lift-premium text-contrast-enhanced mobile-gesture-feedback min-h-[52px] glass-effect focus-indicator-enhanced relative overflow-hidden group before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-500 hover:before:translate-x-[100%] before:z-10 before:pointer-events-none";

const mobileNavLinkClass = "block w-full text-left text-lg text-accessible-primary font-semibold px-5 py-4.5 rounded-xl active:bg-neutral-100/80 dark:active:bg-neutral-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 active:scale-[0.98] touch-manipulation hover-underline focus-visible-enhanced mobile-nav-enhanced transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275) border-b border-neutral-100/60 dark:border-neutral-800/60 backdrop-blur-md min-h-[56px] text-contrast-enhanced mobile-gesture-feedback haptic-feedback glass-effect focus-indicator-enhanced hover:bg-neutral-50/80 dark:hover:bg-neutral-700/50";

const NavLink = ({ href, children, isMobile = false, isActive = false }: { 
    href: string; 
    children: React.ReactNode; 
    isMobile?: boolean; 
    isActive?: boolean; 
}) => {
    const linkClass = isMobile ? mobileNavLinkClass : navLinkClass;
    const activeClasses = isActive ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-l-4 border-primary-500' : '';
    
    return (
        <a 
            href={href} 
            className={`${linkClass} ${activeClasses}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {children}
        </a>
    );
};

const NavLinks = ({ isMobile = false, activePath }: { isMobile?: boolean; activePath?: string }) => {
    const isActive = (href: string) => activePath === href;
    
    return (
        <>
            <NavLink href="#home" isActive={isActive('#home')} isMobile={isMobile}>{HEADER_NAV_STRINGS.HOME}</NavLink>
            <NavLink href="#profil" isActive={isActive('#profil')} isMobile={isMobile}>{HEADER_NAV_STRINGS.PROFILE}</NavLink>
            <NavLink href="#berita" isActive={isActive('#berita')} isMobile={isMobile}>{HEADER_NAV_STRINGS.NEWS}</NavLink>
            <NavLink href="#download" isActive={isActive('#download')} isMobile={isMobile}>{HEADER_NAV_STRINGS.DOWNLOAD}</NavLink>
            <NavLink href="#login-email" isActive={isActive('#login-email')} isMobile={isMobile}>{HEADER_NAV_STRINGS.LOGIN_EMAIL}</NavLink>
        </>
    );
};

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
    const [activePath, setActivePath] = useState<string>('');
    const _mobileMenuRef = useRef<HTMLDivElement>(null);
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

    const mobileMenuFocusRef = useFocusTrap({ isOpen: isMenuOpen }) as React.RefObject<HTMLDivElement>;

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMenuOpen) {
                setIsMenuOpen(false);
                menuButtonRef.current?.focus();
            }
        };

        if (isMenuOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isMenuOpen]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 10);
            
            // Update active path based on scroll position
            const sections = ['#home', '#profil', '#berita', '#download'];
            const currentSection = sections.find(section => {
                const element = document.querySelector(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return rect.top <= 100 && rect.bottom >= 100;
                }
                return false;
            });
            
            setActivePath(currentSection || '');
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                        <div className={`flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 ${getGradientClass('PRIMARY')} rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 hover-lift-enhanced mobile-touch-target haptic-feedback focus-visible-enhanced`}>
                            {HEADER_NAV_STRINGS.LOGO_TEXT}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-neutral-900 dark:text-white leading-tight sm:text-2xl">{HEADER_NAV_STRINGS.SCHOOL_NAME}</span>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400 leading-tight tracking-wide sm:text-xs">{HEADER_NAV_STRINGS.NPSN_LABEL}</span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-1" aria-label="Menu navigasi desktop">
                        <NavLinks activePath={activePath} />
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

{userRole === USER_ROLES.ADMIN && (
                                      <Button
                                          variant="primary"
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

                                <Button variant="destructive" onClick={onLogout}>
                                    Logout
                                </Button>
                            </div>
                          ) : (
                              <div className="hidden sm:flex items-center gap-2">
                                    <Button variant="outline" intent="info" onClick={onChatClick} icon={<ChatIcon />} iconPosition="left">
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
                                    tooltip={isMenuOpen ? "Tutup menu" : "Buka menu"}
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
                                    className="touch-manipulation icon-hover enhanced-contrast"
                                />
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div
                    ref={mobileMenuFocusRef}
                    className={`md:hidden ${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} ${OPACITY_TOKENS.BACKDROP_BLUR_XL} shadow-card mx-2 sm:mx-4 rounded-2xl mt-3 p-4 sm:p-6 animate-fade-in border border-neutral-200/60 dark:border-neutral-700/60 safe-area-padding enhanced-mobile-spacing mobile-gesture-feedback glass-effect-elevated nav-polished modal-backdrop-enhanced`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu navigasi mobile"
                >
                    <nav
                        id="mobile-menu"
                        className="flex flex-col gap-2 font-medium"
                        role="navigation"
                        aria-label="Menu navigasi utama"
                    >
                        <div className="mobile-nav-enhanced">
                            <NavLinks isMobile={true} activePath={activePath} />
                        </div>
                            <div className="pt-6 border-t border-neutral-200/60 dark:border-neutral-700/60 flex flex-col gap-4">
                                  {isLoggedIn ? (
                                     <>
                                           <Button
                                               variant="secondary"
                                               onClick={() => { onTogglePublicView(); setIsMenuOpen(false); }}
                                               fullWidth
                                               size="lg"
                                               className="mobile-touch-target haptic-feedback mobile-button mobile-nav-enhanced"
                                           >
                                               {isPublicView ? 'Lihat Dashboard' : 'Lihat Website'}
                                           </Button>
<Button
                                                variant="destructive"
                                                onClick={() => { onLogout(); setIsMenuOpen(false); }}
                                                fullWidth
                                                size="lg"
                                                className="mobile-touch-target haptic-feedback mobile-button mobile-nav-enhanced"
                                            >
                                               Logout
                                           </Button>
                                      </>
                                  ) : (
                                          <Button
                                              variant="primary"
                                              onClick={() => { onLoginClick(); setIsMenuOpen(false); }}
                                              fullWidth
                                              size="lg"
                                              className="mobile-touch-target haptic-feedback mobile-button mobile-nav-enhanced"
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
