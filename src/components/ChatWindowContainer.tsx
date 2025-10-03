import React, { Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import ChatWindow from './ChatWindow';

interface ChatWindowContainerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatWindowContainer: React.FC<ChatWindowContainerProps> = ({ isOpen, onClose }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <div
          className={`fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-40 w-[calc(100vw-2.5rem)] max-w-sm h-[70vh] max-h-[600px] transition-all duration-300 ease-in-out ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        >
          <ChatWindow isOpen={isOpen} closeChat={onClose} />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default ChatWindowContainer;