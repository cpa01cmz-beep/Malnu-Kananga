import React from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { CloseIcon } from './icons/CloseIcon';
import { useTouchFeedback } from '../hooks/useTouchFeedback';

interface MobileMenuButtonProps {
  isMenuOpen: boolean;
  onToggle: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isMenuOpen, onToggle }) => {
  const { handleTouchFeedback } = useTouchFeedback();

  return (
    <button
      onClick={onToggle}
      onTouchStart={handleTouchFeedback}
      className="md:hidden p-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors touch-optimized min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
    >
      {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
    </button>
  );
};

export default MobileMenuButton;