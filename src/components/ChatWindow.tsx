
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, FeaturedProgram, LatestNews, VoiceCommand } from '../types';
import { Sender } from '../types';
import { getAIResponseStream, initialGreeting } from '../services/geminiService';
import { CloseIcon } from './icons/CloseIcon';
import { BrainIcon } from './icons/BrainIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { SendIcon } from './icons/SendIcon';
import MarkdownRenderer from './MarkdownRenderer';
import { GRADIENT_CLASSES } from '../config/gradients';
import Textarea from './ui/Textarea';
import TypingIndicator from './TypingIndicator';
import VoiceInputButton from './VoiceInputButton';
import VoiceSettings from './VoiceSettings';
import IconButton from './ui/IconButton';
import { useVoiceSynthesis } from '../hooks/useVoiceSynthesis';
import { useVoiceQueue } from '../hooks/useVoiceQueue';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

import { ToastType } from './Toast';

interface ChatWindowProps {
  isOpen: boolean;
  closeChat: () => void;
  siteContext: {
    featuredPrograms: FeaturedProgram[];
    latestNews: LatestNews[];
  };
  onShowToast?: (msg: string, type: ToastType) => void;
}

const MAX_HISTORY_SIZE = 20;
const MAX_MESSAGES_SIZE = 100;

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, closeChat, siteContext, onShowToast }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<{role: 'user' | 'model', parts: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [autoReadAI, setAutoReadAI] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{role: 'user' | 'model', parts: string}[]>([]);
  const lastAIResponseRef = useRef<string>('');
  const chatRef = useFocusTrap({ isOpen, onClose: closeChat });

  const synthesis = useVoiceSynthesis();

  const voiceQueue = useVoiceQueue(
    (text) => synthesis.speak(text),
    () => synthesis.stop(),
    {
      onMessageStart: (msg) => {
        logger.debug('Reading message:', msg.id);
      },
      onMessageEnd: (msg) => {
        logger.debug('Finished reading message:', msg.id);
      },
      onQueueError: (error) => {
        logger.error('Queue error:', error);
      },
    }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([
            { id: 'initial', text: initialGreeting, sender: Sender.AI }
        ]);
    }
    return () => {
        setHistory([]);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    if (isOpen) {
      try {
        const savedSettings = localStorage.getItem(STORAGE_KEYS.VOICE_STORAGE_KEY);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setAutoReadAI(parsedSettings.autoReadAI || false);
        }
      } catch (error) {
        logger.error('Failed to load voice settings:', error);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessageText = input;
    const userMessage: ChatMessage = { id: Date.now().toString(), text: userMessageText, sender: Sender.User };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: Sender.AI }]);

    let fullResponse = "";
    try {
      const currentHistory = historyRef.current;
      const stream = getAIResponseStream(userMessageText, currentHistory, siteContext, isThinkingMode);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
      
      lastAIResponseRef.current = fullResponse;
      
      if (autoReadAI && synthesis.isSupported && fullResponse) {
        const aiMessage: ChatMessage = { id: aiMessageId, text: fullResponse, sender: Sender.AI };
        voiceQueue.addMessage(aiMessage);
      }
    } catch (error) {
      logger.error("Error streaming response:", error);
      const errorMessage = "Maaf, terjadi kesalahan. Silakan coba lagi.";
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId ? { ...msg, text: errorMessage } : msg
        )
      );
      fullResponse = errorMessage;
    } finally {
      setIsLoading(false);
      setHistory(prev => {
        const newHistory: {role: 'user' | 'model', parts: string}[] = [...prev, 
          { role: 'user' as const, parts: userMessageText },
          { role: 'model' as const, parts: fullResponse }
        ];
        // Limit history size to prevent memory leaks
        const limitedHistory = newHistory.length > MAX_HISTORY_SIZE 
          ? newHistory.slice(-MAX_HISTORY_SIZE)
          : newHistory;
        historyRef.current = limitedHistory;
        return limitedHistory;
      });
      
      // Limit messages size to prevent memory leaks
      setMessages(prev => {
        if (prev.length > MAX_MESSAGES_SIZE) {
          return prev.slice(-MAX_MESSAGES_SIZE);
        }
        return prev;
      });
    }
  }, [input, isLoading, siteContext, isThinkingMode, autoReadAI, synthesis, voiceQueue]);

  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    logger.debug('Handling voice command:', command);

    switch (command.action) {
      case 'OPEN_SETTINGS': {
        setShowVoiceSettings(true);
        synthesis.speak('Pengaturan suara dibuka');
        break;
      }
      case 'CLOSE_SETTINGS': {
        setShowVoiceSettings(false);
        synthesis.speak('Pengaturan suara ditutup');
        break;
      }
      case 'STOP_SPEAKING': {
        voiceQueue.stop();
        synthesis.stop();
        synthesis.speak('Pembacaan dihentikan');
        break;
      }
      case 'PAUSE_SPEAKING': {
        voiceQueue.pause();
        synthesis.speak('Pembacaan dijeda');
        break;
      }
      case 'RESUME_SPEAKING': {
        voiceQueue.resume();
        synthesis.speak('Pembacaan dilanjutkan');
        break;
      }
      case 'READ_ALL': {
        const aiMessages = messages.filter((msg) => msg.sender === Sender.AI);
        if (aiMessages.length > 0) {
          voiceQueue.addMessages(aiMessages);
          synthesis.speak(`Membaca ${aiMessages.length} pesan`);
        } else {
          synthesis.speak('Tidak ada pesan AI untuk dibaca');
        }
        break;
      }
      case 'CLEAR_CHAT': {
        setMessages([{ id: 'initial', text: initialGreeting, sender: Sender.AI }]);
        setHistory([]);
        synthesis.speak('Percakapan dibersihkan');
        break;
      }
      case 'SEND_MESSAGE': {
        handleSend();
        break;
      }
      case 'TOGGLE_VOICE': {
        const newState = !autoReadAI;
        setAutoReadAI(newState);
        synthesis.speak(newState ? 'Fitur suara diaktifkan' : 'Fitur suara dimatikan');
        break;
      }
      default:
        logger.debug('Unknown command:', command.action);
    }
  }, [messages, autoReadAI, synthesis, voiceQueue, handleSend]);

  return (
    <div
      ref={chatRef}
      className="flex flex-col h-full bg-white dark:bg-neutral-800 rounded-xl shadow-card-hover border border-neutral-200 dark:border-neutral-700 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Asisten AI - Obrolan dengan asisten kecerdasan buatan"
    >
      <header className={`flex items-center justify-between px-4 py-3.5 ${GRADIENT_CLASSES.CHAT_HEADER} text-white flex-shrink-0`}>
        <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-white rounded-full mr-1 animate-pulse shadow-sm"></div>
            <h2 className="font-semibold text-sm">Asisten AI</h2>
        </div>
        <div className="flex items-center gap-2">
             {voiceQueue.isPlaying && (
              <div className="flex items-center gap-2 bg-white/10% rounded-lg px-2.5 py-1.5">
                <span className="text-xs font-medium text-white mr-1.5">
                  {voiceQueue.currentIndex + 1}/{voiceQueue.queueSize}
                </span>
                {voiceQueue.isPaused ? (
                  <IconButton
                    onClick={() => {
                      voiceQueue.resume();
                      synthesis.speak('Melanjutkan pembacaan');
                    }}
                    ariaLabel="Lanjutkan baca"
                    size="sm"
                    className="p-1.5 bg-white/10% hover:bg-white/20% text-white focus:ring-white/50%"
                    icon={
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    }
                  />
                ) : (
                  <IconButton
                    onClick={() => {
                      voiceQueue.pause();
                      synthesis.speak('Pembacaan dijeda');
                    }}
                    ariaLabel="Jeda baca"
                    size="sm"
                    className="p-1.5 bg-white/10% hover:bg-white/20% text-white focus:ring-white/50%"
                    icon={
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    }
                  />
                )}
                <IconButton
                  onClick={() => {
                    voiceQueue.skip();
                  }}
                  ariaLabel="Lewati pesan"
                  size="sm"
                  className="p-1.5 bg-white/10% hover:bg-white/20% text-white focus:ring-white/50%"
                  icon={
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                    </svg>
                  }
                />
                <IconButton
                  onClick={() => {
                    voiceQueue.stop();
                    synthesis.stop();
                    synthesis.speak('Pembacaan dihentikan');
                  }}
                  ariaLabel="Hentikan baca"
                  size="sm"
                  className="p-1.5 bg-white/10% hover:bg-white/20% text-white focus:ring-white/50%"
                  icon={
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  }
                />
              </div>
            )}

               {synthesis.isSupported && (
                  <IconButton
                    onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                    ariaLabel="Buka pengaturan suara"
                    tooltip={showVoiceSettings ? "Tutup pengaturan suara" : "Pengaturan Suara"}
                    size="md"
                    variant={showVoiceSettings ? 'primary' : 'ghost'}
                    className={`p-2 ${showVoiceSettings ? 'bg-white text-primary-700' : 'bg-primary-700 text-primary-200 hover:bg-primary-800'}`}
                    icon={<SpeakerWaveIcon className="w-4 h-4" />}
                  />
               )}

                <IconButton
                    onClick={() => setIsThinkingMode(!isThinkingMode)}
                    ariaLabel={isThinkingMode ? "Matikan Mode Berpikir Dalam" : "Aktifkan Mode Berpikir Dalam"}
                    tooltip={isThinkingMode ? "Mode Berpikir Dalam: Aktif" : "Aktifkan Mode Berpikir Dalam"}
                    size="md"
                    variant={isThinkingMode ? 'primary' : 'ghost'}
                    className={`p-2 flex items-center gap-1 ${isThinkingMode ? 'bg-white text-primary-700' : 'bg-primary-700 text-primary-200 hover:bg-primary-800'}`}
                    icon={<BrainIcon className="w-4 h-4" />}
                >
                  {isThinkingMode && <span className="text-xs font-semibold px-1">Thinking</span>}
                </IconButton>

                <IconButton
                  onClick={closeChat}
                  ariaLabel="Tutup obrolan"
                  size="md"
                  variant="ghost"
                  className="p-2 bg-white/10% hover:bg-white/20% text-white focus:ring-white/50%"
                  icon={<CloseIcon />}
                />
        </div>
      </header>

      <div
        className="flex-1 px-4 py-4 overflow-y-auto bg-neutral-50/80 dark:bg-neutral-900/80 custom-scrollbar"
        role="log"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Pesan obrolan"
      >
        <ul className="flex flex-col gap-3.5" role="list">
          {messages.map((message) => (
            <li
              key={message.id}
              className={`flex items-end max-w-[85%] sm:max-w-[80%] gap-2 ${
                message.sender === Sender.User ? 'self-end flex-row-reverse' : 'self-start'
              }`}
              role="listitem"
              aria-label={`${message.sender === Sender.User ? 'Anda' : 'Asisten'}: ${message.text}`}
            >
              <div
                  className={`rounded-xl px-4 py-3 text-sm md:text-base leading-relaxed shadow-sm ${
                    message.sender === Sender.User
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                      : 'bg-neutral-200/95 dark:bg-neutral-700/95 backdrop-blur-sm text-neutral-800 dark:text-neutral-200'
                  }`}
               >
                {message.sender === Sender.AI ? (
                    <MarkdownRenderer content={message.text} />
                ) : (
                    message.text
                )}

                  {isLoading && message.sender === Sender.AI && !message.text && (
                     <div className="mt-1">
                         <TypingIndicator />
                         {isThinkingMode && <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-1">Sedang berpikir mendalam...</span>}
                     </div>
                  )}
              </div>
            </li>
          ))}
          <div ref={messagesEndRef} />
        </ul>
      </div>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-white/95% dark:bg-neutral-800/95% backdrop-blur-sm flex-shrink-0 rounded-b-xl shadow-sm">
        <div className="flex items-end gap-2.5">
          <Textarea
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
              placeholder={isThinkingMode ? "Ketik pertanyaan kompleks..." : "Ketik pertanyaan Anda..."}
              fullWidth={true}
              className="min-h-[44px]"
              autoResize={true}
              minRows={1}
              maxRows={5}
          />
          <IconButton
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            ariaLabel="Kirim pesan"
            size="md"
            variant="primary"
            className="p-2.5 mb-0.5"
            icon={<SendIcon />}
          />
          <VoiceInputButton
            onTranscript={(transcript) => {
              setInput(transcript);
            }}
            onCommand={(command: VoiceCommand) => {
              handleVoiceCommand(command);
            }}
            disabled={isLoading}
            onError={(error) => {
              logger.error('Voice input error:', error);
              if (error && !error.includes('tidak mendukung')) {
                logger.info('Voice Error:', error);
              }
            }}
          />
           {synthesis.isSupported && messages.some((msg) => msg.sender === Sender.AI) && !voiceQueue.isPlaying && (
              <IconButton
                 onClick={() => {
                    const aiMessages = messages.filter((msg) => msg.sender === Sender.AI);
                    if (aiMessages.length > 0) {
                      voiceQueue.addMessages(aiMessages);
                      synthesis.speak(`Membaca ${aiMessages.length} pesan`);
                    }
                  }}
                 ariaLabel="Baca semua pesan AI"
                 tooltip="Baca semua pesan AI"
                 size="md"
                 variant="primary"
                 className="p-2.5 mb-0.5"
                 icon={
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                   </svg>
                 }
              />
             )}
        </div>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettings isOpen={showVoiceSettings} onClose={() => setShowVoiceSettings(false)} onShowToast={onShowToast} />
    </div>
  );
};

export default ChatWindow;
