
import React, { useState, useEffect } from 'react';
import type { ChatMessage, FeaturedProgram, LatestNews } from '../types';
import { Sender } from '../types';
import { getAIEditorResponse } from '../services/geminiService';
import { CloseIcon } from './icons/CloseIcon';
import { SendIcon } from './icons/SendIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface SiteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: {
    featuredPrograms: FeaturedProgram[];
    latestNews: LatestNews[];
  };
  onUpdateContent: (newContent: { featuredPrograms: FeaturedProgram[], latestNews: LatestNews[] }) => void;
}

const SiteEditor: React.FC<SiteEditorProps> = ({ isOpen, onClose, currentContent, onUpdateContent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proposedContent, setProposedContent] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        { id: 'initial', text: 'Halo! Saya asisten editor AI Anda. Beri tahu saya perubahan apa yang ingin Anda buat pada konten "Program Unggulan" atau "Berita Terbaru". \n\nContoh: "Tambahkan program baru tentang Robotika" atau "Ubah judul berita pertama menjadi lebih menarik".', sender: Sender.AI }
      ]);
      setProposedContent(null);
      setInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
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
        text: "Tentu, saya sudah menyiapkan perubahannya. Silakan tinjau di bawah ini dan klik 'Terapkan Perubahan' jika sudah sesuai.",
        sender: Sender.AI
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Maaf, terjadi kesalahan: ${error.message}`,
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
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Tutup">
            <CloseIcon />
          </button>
        </header>

        <main className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Chat History */}
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === Sender.User ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === Sender.AI && <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0"><SparklesIcon className="h-5 w-5"/></div>}
                <div className={`max-w-lg p-3 rounded-2xl ${msg.sender === Sender.User ? 'bg-green-600 text-white rounded-br-lg' : 'bg-gray-100 dark:bg-gray-700 rounded-bl-lg'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
             {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0"><SparklesIcon className="h-5 w-5"/></div>
                    <div className="max-w-lg p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 rounded-bl-lg">
                        <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                        </div>
                    </div>
                </div>
            )}
          </div>
          
          {/* Proposed Changes Preview */}
          {proposedContent && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Pratinjau Perubahan:</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{JSON.stringify(proposedContent, null, 2)}</pre>
                </div>
                 <div className="mt-4 flex justify-end gap-3">
                    <button onClick={() => setProposedContent(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                        Tolak
                    </button>
                    <button onClick={handleApply} className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-full hover:bg-green-700">
                        Terapkan Perubahan
                    </button>
                </div>
            </div>
          )}
        </main>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "AI sedang berpikir..." : "Ketik permintaan Anda..."}
              className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-gray-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-green-600 text-white rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              aria-label="Kirim"
            >
              <SendIcon />
            </button>
          </form>
           <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
                Perubahan hanya bersifat sementara dan akan kembali seperti semula setelah halaman dimuat ulang.
            </p>
        </footer>
      </div>
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
            animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SiteEditor;
