
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
import { OPACITY_TOKENS, HEADER_NAV_STRINGS, USER_ROLES, UI_SPACING } from '../constants';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { 
  buildNavLinkClasses, 
  HEADER_CONTAINER_CLASSES, 
  HEADER_NAV_WRAPPER_CLASSES, 
  HEADER_INNER_CLASSES,
  HEADER_SCROLLED_CLASSES,
  HEADER_UNSCROLLED_CLASSES
} from '../utils/navigationUtils';



const NavLink = ({ href, children, isMobile = false, isActive = false, prefersReducedMotion = false }: { 
    href: string; 
    children: React.ReactNode; 
    isMobile?: boolean; 
    isActive?: boolean; 
    prefersReducedMotion?: boolean;
}) => {
    const linkClass = buildNavLinkClasses({ isMobile, isActive, prefersReducedMotion });
    
    return (
        <a 
            href={href} 
            className={linkClass}
            aria-current={isActive ? 'page' : undefined}
        >
            {children}
        </a>
    );
};

const NavLinks = ({ isMobile = false, activePath, prefersReducedMotion = false }: { isMobile?: boolean; activePath?: string; prefersReducedMotion?: boolean }) => {
    const isActive = (href: string) => activePath === href;
    
    return (
        <>
            <NavLink href="#home" isActive={isActive('#home')} isMobile={isMobile} prefersReducedMotion={prefersReducedMotion}>{HEADER_NAV_STRINGS.HOME}</NavLink>
            <NavLink href="#profil" isActive={isActive('#profil')} isMobile={isMobile} prefersReducedMotion={prefersReducedMotion}>{HEADER_NAV_STRINGS.PROFILE}</NavLink>
            <NavLink href="#berita" isActive={isActive('#berita')} isMobile={isMobile} prefersReducedMotion={prefersReducedMotion}>{HEADER_NAV_STRINGS.NEWS}</NavLink>
            <NavLink href="#download" isActive={isActive('#download')} isMobile={isMobile} prefersReducedMotion={prefersReducedMotion}>{HEADER_NAV_STRINGS.DOWNLOAD}</NavLink>
            <NavLink href="#login-email" isActive={isActive('#login-email')} isMobile={isMobile} prefersReducedMotion={prefersReducedMotion}>{HEADER_NAV_STRINGS.LOGIN_EMAIL}</NavLink>
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
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const _mobileMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const prefersReducedMotion = useReducedMotion();

    // Touch gesture handling for swipe-to-close
    const minSwipeDistance = 50;
    
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -minSwipeDistance;
        
        // Swipe right to close menu
        if (isRightSwipe && isMenuOpen) {
            setIsMenuOpen(false);
            triggerHapticFeedback('light');
        }
    };

    // Haptic feedback utility
    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if ('vibrate' in navigator && window.innerWidth <= 768) {
            const pattern = {
                light: [10],
                medium: [25],
                heavy: [50]
            };
            navigator.vibrate(pattern[type]);
        }
    };

    const handleMenuToggle = () => {
        triggerHapticFeedback('medium');
        setIsMenuOpen(!isMenuOpen);
    };

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
        ${HEADER_CONTAINER_CLASSES}
        ${isScrolled ? HEADER_SCROLLED_CLASSES : HEADER_UNSCROLLED_CLASSES}
    `;

    const navContainerClasses = `
        ${HEADER_NAV_WRAPPER_CLASSES}
        ${isScrolled ? '' : `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} ${OPACITY_TOKENS.BACKDROP_BLUR_XL} rounded-full ring-1 ring-neutral-900/10% dark:ring-white/10% shadow-card`}
    `;

    const innerNavClasses = `
        ${HEADER_INNER_CLASSES}
        ${isScrolled ? `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} ${OPACITY_TOKENS.BACKDROP_BLUR_XL}` : ''}
    `;

    return (
        <header id="main-nav" className={headerClasses}>
            <div className={navContainerClasses}>
                 <div className={`${innerNavClasses} ${isScrolled ? 'max-w-7xl mx-auto px-4' : ''}`}>
                         <div className={`flex items-center ${UI_SPACING.GAP_TIGHT}`}>
                        <div className={`flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 ${getGradientClass('PRIMARY')} rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 hover-lift-enhanced mobile-touch-target haptic-feedback focus-visible-enhanced`}>
                            {HEADER_NAV_STRINGS.LOGO_TEXT}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-neutral-900 dark:text-white leading-tight sm:text-2xl">{HEADER_NAV_STRINGS.SCHOOL_NAME}</span>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400 leading-tight tracking-wide sm:text-xs">{HEADER_NAV_STRINGS.NPSN_LABEL}</span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-1" aria-label="Menu navigasi desktop">
                        <NavLinks activePath={activePath} prefersReducedMotion={prefersReducedMotion} />
                    </nav>

                    <div className={`flex items-center ${UI_SPACING.GAP_TIGHT}`}>
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
                                    onClick={handleMenuToggle}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleMenuToggle();
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
                    className={`md:hidden ${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} ${OPACITY_TOKENS.BACKDROP_BLUR_XL} shadow-card mx-2 sm:mx-4 rounded-2xl mt-3 p-4 sm:p-6 animate-fade-in border border-neutral-200/60 dark:border-neutral-700/60 safe-area-padding enhanced-mobile-spacing mobile-gesture-feedback glass-effect-elevated nav-polished modal-backdrop-enhanced touch-manipulation`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu navigasi mobile"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    style={{
                        transform: touchStart && touchEnd ? `translateX(${Math.min(0, (touchStart - touchEnd) * 0.3)}px)` : 'translateX(0)',
                        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                >
                    <div className="flex justify-center mb-3">
                        <div className="w-12 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full"></div>
                    </div>
                    <nav
                        id="mobile-menu"
                        className="flex flex-col gap-2 font-medium"
                        role="navigation"
                        aria-label="Menu navigasi utama"
                    >
                        <div className="mobile-nav-enhanced">
                            <NavLinks isMobile={true} activePath={activePath} prefersReducedMotion={prefersReducedMotion} />
                        </div>
                            <div className="pt-6 border-t border-neutral-200/60 dark:border-neutral-700/60 flex flex-col gap-4">
                                  {isLoggedIn ? (
                                     <>
                                    <Button
                                                variant="secondary"
                                                onClick={() => { 
                                                    triggerHapticFeedback('light');
                                                    onTogglePublicView(); 
                                                    setIsMenuOpen(false); 
                                                }}
                                                fullWidth
                                                size="lg"
                                                className="mobile-touch-target haptic-feedback mobile-button mobile-nav-enhanced"
                                            >
                                               {isPublicView ? 'Lihat Dashboard' : 'Lihat Website'}
                                           </Button>
<Button
                                                variant="destructive"
                                                onClick={() => { 
                                                    triggerHapticFeedback('heavy');
                                                    onLogout(); 
                                                    setIsMenuOpen(false); 
                                                }}
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
                                               onClick={() => { 
                                                   triggerHapticFeedback('medium');
                                                   onLoginClick(); 
                                                   setIsMenuOpen(false); 
                                               }}
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
