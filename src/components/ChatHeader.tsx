import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ChatHeaderProps {
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-green-600 text-white">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
        <h2 className="font-bold text-lg">Asisten AI</h2>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-white/20"
        aria-label="Tutup obrolan"
      >
        <CloseIcon />
      </button>
    </header>
  );
};

export default ChatHeader;