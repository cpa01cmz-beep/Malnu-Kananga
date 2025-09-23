import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import { ChatIcon } from './icons/ChatIcon';
import { CloseIcon } from './icons/CloseIcon';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 transform translate-z-0">
        <button
          onClick={toggleChat}
          className="bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50 transition-transform transform hover:scale-110"
          aria-label={isOpen ? 'Tutup obrolan' : 'Buka obrolan'}
        >
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </button>
      </div>

      {/* Chat Window */}
      <div
        className={`fixed bottom-20 right-5 sm:bottom-24 sm:right-8 z-40 w-[calc(100vw-2.5rem)] max-w-sm h-[70vh] max-h-[600px] transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <ChatWindow isOpen={isOpen} closeChat={toggleChat} />
      </div>
    </>
  );
};

export default ChatWidget;