import React, { useState, useCallback, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { Sender } from '../types';
import { getAIResponseStream, initialGreeting } from '../services/geminiService';
import { useChatContext } from '../contexts/ChatContext';

export const useChatLogic = (isOpen: boolean) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<{role: 'user' | 'model', parts: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { 
    isConnected, 
    setIsConnected, 
    connectionError, 
    setConnectionError,
    incrementRetryCount,
    resetRetryCount
  } = useChatContext();

  // Initialize with greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: 'initial', text: initialGreeting, sender: Sender.AI }
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input;
    const userMessage: ChatMessage = { id: Date.now().toString(), text: userMessageText, sender: Sender.User };

    // Add user message to the UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add a placeholder for the AI response to the UI
    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: Sender.AI }]);

    let fullResponse = "";
    let retryCount = 0;
    const maxRetries = 2;

    const attemptSend = async (): Promise<void> => {
      try {
        setIsConnected(true);
        setConnectionError(null);
        
        // Send the current message and the previous history to the AI
        const stream = getAIResponseStream(userMessageText, history);
        
        for await (const chunk of stream) {
          fullResponse += chunk;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
            )
          );
        }
        
        resetRetryCount();
      } catch (error) {
        console.error('Chat error:', error);
        setIsConnected(false);
        
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setConnectionError(errorMsg);
        
        if (retryCount < maxRetries) {
          incrementRetryCount();
          // Show retry message
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId 
                ? { ...msg, text: `Menghubungkan ulang... (percobaan ${retryCount + 1}/${maxRetries})` } 
                : msg
            )
          );
          
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          return attemptSend();
        } else {
          // Final error after all retries
          const errorMessage = errorMsg.includes('API_KEY') 
            ? "Maaf, layanan AI sedang tidak tersedia. Silakan hubungi admin sekolah."
            : errorMsg.includes('fetch') || errorMsg.includes('network')
            ? "Maaf, tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda."
            : "Maaf, terjadi kesalahan. Silakan coba lagi beberapa saat.";
          
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId ? { ...msg, text: errorMessage } : msg
            )
          );
          fullResponse = errorMessage;
          resetRetryCount();
        }
      }
    };

    await attemptSend();
    
    setIsLoading(false);
    
    // Only update history if we got a meaningful response
    if (fullResponse && !fullResponse.includes('Menghubungkan ulang')) {
      setHistory(prev => [...prev,
        { role: 'user', parts: userMessageText },
        { role: 'model', parts: fullResponse }
      ]);
    }
  }, [input, isLoading, history]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSend
  };
};