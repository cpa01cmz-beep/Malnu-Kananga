import React from 'react';
import { ChatIcon } from './icons/ChatIcon';
import { useTouchFeedback } from '../hooks/useTouchFeedback';

interface AuthButtonsProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onChatClick: () => void;
  onLogout: () => void;
  showOnMobile?: boolean;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({
  isLoggedIn,
  onLoginClick,
  onChatClick,
  onLogout,
  showOnMobile = false
}) => {
  const mobileClasses = showOnMobile ? '' : 'hidden sm:flex';
  const buttonClasses = showOnMobile ? 'w-full text-center touch-target' : 'touch-target';
  const { handleTouchFeedback } = useTouchFeedback();

  if (isLoggedIn) {
    return (
      <div className={`${mobileClasses} items-center space-x-2`}>
        <button
          onClick={onLogout}
          onTouchStart={handleTouchFeedback}
          className={`bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 transition-colors touch-optimized ${buttonClasses}`}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className={`${mobileClasses} items-center space-x-2`}>
      <button
        onClick={onChatClick}
        onTouchStart={handleTouchFeedback}
        className={`flex items-center gap-2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-4 py-2 rounded-full font-semibold text-sm hover:bg-green-200 dark:hover:bg-green-800 active:bg-green-300 dark:active:bg-green-700 transition-colors touch-optimized ${buttonClasses}`}
      >
        <ChatIcon />
        <span>Tanya AI</span>
      </button>
      <button
        onClick={onLoginClick}
        onTouchStart={handleTouchFeedback}
        className={`bg-blue-600 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors touch-optimized ${buttonClasses}`}
      >
        Login
      </button>
    </div>
  );
};

export default AuthButtons;