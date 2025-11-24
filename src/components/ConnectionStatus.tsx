import React from 'react';
import { useChatContext } from '../contexts/ChatContext';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { isConnected, connectionError } = useChatContext();

  if (isConnected && !connectionError) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 text-xs ${className}`}>
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} ${!isConnected && 'animate-pulse'}`}></div>
      <span className={isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
        {isConnected ? 'Terhubung' : 'Terputus'}
      </span>
      {connectionError && (
        <span className="text-red-600 dark:text-red-400 ml-2">
          • {connectionError.includes('API_KEY') ? 'Layanan AI tidak tersedia' : 'Koneksi bermasalah'}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;