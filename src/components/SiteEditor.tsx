
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, FeaturedProgram, LatestNews } from '../types';
import { Sender } from '../types';
import { getAIEditorResponse } from '../services/geminiService';
import { CloseIcon } from './icons/CloseIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon'; 
import ProgramCard from './ProgramCard';
import NewsCard from './NewsCard';
import MarkdownRenderer from './MarkdownRenderer';
import AutoResizeTextarea from './AutoResizeTextarea';
import TypingIndicator from './TypingIndicator';

interface SiteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: {
    featuredPrograms: FeaturedProgram[];
    latestNews: LatestNews[];
  };
  onUpdateContent: (newContent: { featuredPrograms: FeaturedProgram[], latestNews: LatestNews[] }) => void;
  onResetContent: () => void; 
}

// Define the structure of content the AI returns
interface SiteContent {
    featuredPrograms: FeaturedProgram[];
    latestNews: LatestNews[];
}

const SiteEditor: React.FC<SiteEditorProps> = ({ isOpen, onClose, currentContent, onUpdateContent, onResetContent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // FIX: Properly typed state instead of 'any'
  const [proposedContent, setProposedContent] = useState<SiteContent | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
            { id: 'initial', text: 'Halo! Saya asisten editor AI Anda. Beri tahu saya perubahan apa yang ingin Anda buat pada konten **"Program Unggulan"** atau **"Berita Terbaru"**. \n\nContoh:\n- "Tambahkan program baru tentang Robotika"\n- "Ubah judul berita pertama menjadi lebih menarik"', sender: Sender.AI }
        ]);
      }
      setProposedContent(null);
      setInput('');
    }
  }, [isOpen, messages.length]);

  // Auto-scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, proposedContent, scrollToBottom]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), text: input, sender: Sender.User };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setProposedContent(null);

    try {
      const newContent = await getAIEditorResponse(userMessage.text, currentContent);
      setProposedContent(newContent);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Tentu, saya sudah menyiapkan perubahannya. Silakan tinjau **pratinjau visual** di bawah ini dan klik 'Terapkan Perubahan' jika sudah sesuai.",
        sender: Sender.AI
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Maaf, terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: Sender.AI
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (proposedContent) {
        onUpdateContent(proposedContent);
    }
  };

  const handleCancel = () => {
      setProposedContent(null);
      const cancelMessage: ChatMessage = {
          id: Date.now().toString(),
          text: "Perubahan dibatalkan. Ada lagi yang ingin Anda ubah?",
          sender: Sender.AI
      };
      setMessages(prev => [...prev, cancelMessage]);
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Website Editor</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={onResetContent}
                className="p-2 rounded-full text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Reset Konten ke Default"
                aria-label="Reset konten"
            >
                <ArrowPathIcon />
            </button>
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Tutup">
                <CloseIcon />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Chat History */}
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === Sender.User ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === Sender.AI && <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0"><SparklesIcon className="h-5 w-5"/></div>}
                <div className={`max-w-lg p-3 rounded-2xl ${msg.sender === Sender.User ? 'bg-green-600 text-white rounded-br-lg' : 'bg-gray-100 dark:bg-gray-700 rounded-bl-lg'}`}>
                  <MarkdownRenderer content={msg.text} />
                </div>
              </div>
            ))}
             {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0"><SparklesIcon className="h-5 w-5"/></div>
                    <div className="max-w-lg p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 rounded-bl-lg">
                        <TypingIndicator />
                    </div>
                </div>
            )}
             <div ref={messagesEndRef} />
          </div>
          
          {/* Proposed Changes Preview */}
          {proposedContent && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Pratinjau Perubahan</h3>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Preview Mode</span>
                </div>
                
                <div className="space-y-8 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    {/* Programs Preview */}
                    {proposedContent.featuredPrograms && proposedContent.featuredPrograms.length > 0 && (
                        <div>
                            <h4 className="text-sm uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-4">Program Unggulan</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {proposedContent.featuredPrograms.map((program: FeaturedProgram, idx: number) => (
                                    <div key={idx} className="origin-top-left transform transition-transform">
                                        <ProgramCard program={program} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* News Preview */}
                    {proposedContent.latestNews && proposedContent.latestNews.length > 0 && (
                        <div>
                             <h4 className="text-sm uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-4">Berita Terbaru</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {proposedContent.latestNews.map((news: LatestNews, idx: number) => (
                                    <div key={idx} className="origin-top-left transform transition-transform">
                                        <NewsCard newsItem={news} />
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
                
                {/* Advanced Data View */}
                <details className="mt-4">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-green-600 transition-colors select-none">Tampilkan Data JSON Mentah (Debug)</summary>
                    <div className="bg-gray-900 p-4 rounded-lg max-h-40 overflow-y-auto mt-2 custom-scrollbar">
                        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{JSON.stringify(proposedContent, null, 2)}</pre>
                    </div>
                </details>

                 <div className="mt-6 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800 py-4 border-t border-gray-100 dark:border-gray-700/50">
                    <button onClick={handleCancel} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors">
                        Batalkan
                    </button>
                    <button onClick={handleApply} className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-full hover:bg-green-700 shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5">
                        Terapkan Perubahan
                    </button>
                </div>
            </div>
          )}
        </main>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          <AutoResizeTextarea
             value={input}
             onChange={setInput}
             onSend={handleSend}
             disabled={isLoading}
             placeholder={isLoading ? "AI sedang berpikir..." : "Ketik permintaan Anda..."}
          />
           <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
                Perubahan hanya bersifat sementara di sesi ini.
            </p>
        </footer>
      </div>
    </div>
  );
};

export default SiteEditor;
