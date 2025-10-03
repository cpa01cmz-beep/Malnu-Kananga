import React from 'react';
import DesktopNavigation from './DesktopNavigation';
import AuthButtons from './AuthButtons';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { useTouchFeedback } from '../hooks/useTouchFeedback';

interface MobileMenuProps {
  isOpen: boolean;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onChatClick: () => void;
  onLogout: () => void;
  onPortalClick?: () => void;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  isLoggedIn,
  onLoginClick,
  onChatClick,
  onLogout,
  onPortalClick,
  onClose
}) => {
  const { elementRef } = useTouchGestures({
    onSwipeDown: onClose,
    onSwipeLeft: onClose,
  });

  const { handleTouchFeedback } = useTouchFeedback({
    hapticFeedback: true,
    visualFeedback: true,
  });

  if (!isOpen) return null;

  return (
    <div
      ref={elementRef}
      className="md:hidden bg-white dark:bg-gray-800 shadow-lg mx-2 sm:mx-4 rounded-2xl mt-2 p-4 touch-optimized"
      onTouchStart={handleTouchFeedback}
    >
      <nav className="flex flex-col space-y-4 font-medium text-center">
        <DesktopNavigation />
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-3">
          <AuthButtons
            isLoggedIn={isLoggedIn}
            onLoginClick={() => { onLoginClick(); onClose(); }}
            onChatClick={() => { onChatClick(); onClose(); }}
            onLogout={() => { onLogout(); onClose(); }}
            onPortalClick={() => { onPortalClick?.(); onClose(); }}
            showOnMobile={true}
          />
        </div>
      </nav>

      {/* Swipe indicator */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
          <span>Gesek ke bawah atau kiri untuk menutup</span>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;