import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  isConnected: boolean;
  setIsConnected: (_connected: boolean) => void;
  connectionError: string | null;
  setConnectionError: (_error: string | null) => void;
  retryCount: number;
  incrementRetryCount: () => void;
  resetRetryCount: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const incrementRetryCount = () => setRetryCount(prev => prev + 1);
  const resetRetryCount = () => setRetryCount(0);

  return (
    <ChatContext.Provider
      value={{
        isConnected,
        setIsConnected,
        connectionError,
        setConnectionError,
        retryCount,
        incrementRetryCount,
        resetRetryCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};