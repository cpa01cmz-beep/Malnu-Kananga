
import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, FeaturedProgram, LatestNews } from '../types';
import { Sender } from '../types';
import Button from './ui/Button';
import { getAIEditorResponse } from '../services/geminiService';
import { validateAICommand, type AuditLogEntry } from '../utils/aiEditorValidator';
import { CloseIcon } from './icons/CloseIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import ProgramCard from './ProgramCard';
import NewsCard from './NewsCard';
import MarkdownRenderer from './MarkdownRenderer';
import Textarea from './ui/Textarea';
import TypingIndicator from './TypingIndicator';
import IconButton from './ui/IconButton';
import Modal from './ui/Modal';
import { SendIcon } from './icons/SendIcon';
import { logger } from '../utils/logger';
import { STORAGE_KEYS } from '../constants';
import { HEIGHTS } from '../config/heights';

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

// Change history entry interface
interface ChangeHistoryEntry {
  id: string;
  timestamp: Date;
  changes: string;
  appliedContent: SiteContent;
  previousContent: SiteContent;
}

const SiteEditor: React.FC<SiteEditorProps> = ({ isOpen, onClose, currentContent, onUpdateContent, onResetContent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // FIX: Properly typed state instead of 'any'
  const [proposedContent, setProposedContent] = useState<SiteContent | null>(null);
  const [changeHistory, setChangeHistory] = useState<ChangeHistoryEntry[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingContent, setPendingContent] = useState<SiteContent | null>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [inputError, setInputError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; resetTime: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
            { id: 'initial', text: 'Halo! Saya asisten editor AI Anda dengan sistem validasi keamanan. Beri tahu saya perubahan apa yang ingin Anda buat pada konten **"Program Unggulan"** atau **"Berita Terbaru"**. \n\nContoh perintah yang valid:\n- "Tambahkan program baru tentang Robotika"\n- "Ubah judul berita pertama menjadi lebih menarik"\n- "Hapus program terakhir"\n\n🛡️ **Keamanan**: Perintah berbahaya atau akses sistem akan diblokir otomatis.\n\n💡 **Tips:** Anda dapat membatalkan hingga 5 perubahan terakhir menggunakan tombol Undo.', sender: Sender.AI }
        ]);
      }
      setProposedContent(null);
      setInput('');
      setInputError('');
      setValidationError('');
    }
  }, [isOpen, messages.length]);

  // Auto-scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, proposedContent, scrollToBottom]);

  // Character count and validation
  useEffect(() => {
    setCharacterCount(input.length);
    
    // Basic input validation
    if (input.length > 1000) {
      setInputError('Maksimal 1000 karakter');
    } else if (input.trim().length > 0 && input.trim().length < 3) {
      setInputError('Minimal 3 karakter untuk permintaan yang bermakna');
    } else if (/[<>]/.test(input)) {
      setInputError('Mohon hindari penggunaan tag HTML');
    } else {
      setInputError('');
    }
  }, [input]);

  // Save initial content to localStorage for undo functionality
  useEffect(() => {
    if (isOpen) {
      const savedHistory = localStorage.getItem(STORAGE_KEYS.SITE_EDITOR_HISTORY);
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          setChangeHistory(parsed.map((entry: ChangeHistoryEntry) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          })));
        } catch (e) {
          logger.warn('Failed to load change history:', e);
        }
      }
    }
  }, [isOpen]);

  // Get current user ID for rate limiting and audit logging
  const getUserId = useCallback(() => {
    try {
      const authSession = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (authSession) {
        const session = JSON.parse(authSession);
        return session.user?.id || session.userId || 'anonymous';
      }
    } catch (e) {
      logger.warn('Failed to get user ID for rate limiting:', e);
    }
    return 'anonymous';
  }, []);

  // Rate limit countdown timer
  useEffect(() => {
    if (rateLimitInfo) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now >= rateLimitInfo.resetTime) {
          setRateLimitInfo(null);
        } else {
          setRateLimitInfo(prev => prev ? { ...prev, remaining: Math.max(0, prev.resetTime - now) } : null);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [rateLimitInfo]);

  // Enhanced error recovery with rollback
  const handleValidationError = useCallback((error: string) => {
    setValidationError(error);
    setInputError('');
    
    const errorMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `🛡️ **Keamanan**: ${error}`,
      sender: Sender.AI
    };
    setMessages(prev => [...prev, errorMessage]);
  }, []);

  // Audit log helper
  const logUserAction = useCallback((action: string, details: string) => {
    const userId = getUserId();
    try {
      const logs: AuditLogEntry[] = JSON.parse(localStorage.getItem('malnu_ai_editor_audit_log') || '[]');
      logs.unshift({
        timestamp: Date.now(),
        action: 'command_validated',
        userId,
        commandHash: action,
        reason: details
      });
      const trimmedLogs = logs.slice(0, 100);
      localStorage.setItem('malnu_ai_editor_audit_log', JSON.stringify(trimmedLogs));
    } catch (e) {
      logger.warn('Failed to log user action:', e);
    }
  }, [getUserId]);

  const saveToHistory = (changes: string, appliedContent: SiteContent, previousContent: SiteContent) => {
    const newEntry: ChangeHistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      changes,
      appliedContent,
      previousContent
    };
    
    const updatedHistory = [newEntry, ...changeHistory].slice(0, 5); // Keep only last 5 changes
    setChangeHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEYS.SITE_EDITOR_HISTORY, JSON.stringify(updatedHistory));
  };

  const undoLastChange = () => {
    if (changeHistory.length > 0) {
      const lastChange = changeHistory[0];
      onUpdateContent(lastChange.previousContent);
      setChangeHistory(prev => prev.slice(1));
      localStorage.setItem(STORAGE_KEYS.SITE_EDITOR_HISTORY, JSON.stringify(changeHistory.slice(1)));
      
      const undoMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `✅ Perubahan terakhir telah dibatalkan: "${lastChange.changes}"`,
        sender: Sender.AI
      };
      setMessages(prev => [...prev, undoMessage]);
      setProposedContent(null);
    }
  };

  const generateChangeSummary = (before: SiteContent | null, after: SiteContent | null): string => {
    const changes: string[] = [];
    
    // Handle null cases
    if (!before || !after) {
      return 'Loading initial content...';
    }
    
    // Compare featured programs
    const beforePrograms = before.featuredPrograms?.length || 0;
    const afterPrograms = after.featuredPrograms?.length || 0;
    if (beforePrograms !== afterPrograms) {
      changes.push(`${afterPrograms > beforePrograms ? 'Menambah' : 'Menghapus'} ${Math.abs(afterPrograms - beforePrograms)} program unggulan`);
    }
    
    // Compare news
    const beforeNews = before.latestNews?.length || 0;
    const afterNews = after.latestNews?.length || 0;
    if (beforeNews !== afterNews) {
      changes.push(`${afterNews > beforeNews ? 'Menambah' : 'Menghapus'} ${Math.abs(afterNews - beforeNews)} berita`);
    }
    
    if (changes.length === 0) {
      changes.push('Memperbarui konten yang ada');
    }
    
    return changes.join(', ');
  };

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading || inputError) return;

    const userId = getUserId();
    
    // Validate command using enhanced centralized validator
    const validation = validateAICommand(input, userId);
    if (!validation.isValid) {
      handleValidationError(validation.error || 'Perintah tidak valid');
      
      // Set rate limit info if provided
      if (validation.error?.includes('menunggu')) {
        const waitTime = parseInt(validation.error.match(/\d+/)?.[0] || '60');
        setRateLimitInfo({
          remaining: waitTime * 1000,
          resetTime: Date.now() + (waitTime * 1000)
        });
      }
      
      logUserAction('command_blocked', validation.error || 'Unknown validation error');
      return;
    }
    
    setValidationError('');

    const userMessage: ChatMessage = { id: Date.now().toString(), text: input, sender: Sender.User };
    setMessages(prev => [...prev, userMessage]);
    const requestText = validation.sanitizedPrompt || input;
    setInput('');
    setIsLoading(true);
    setProposedContent(null);

    try {
      const newContent = await getAIEditorResponse(requestText, currentContent);
      
      // Enhanced content validation
      if (!newContent || typeof newContent !== 'object') {
        throw new Error('Respon AI mengembalikan format yang tidak valid');
      }
      
      // Structure validation with rollback support
      if (!newContent.featuredPrograms && !newContent.latestNews) {
        throw new Error('Respon AI tidak mengandung struktur data yang diharapkan');
      }
      
      setProposedContent(newContent);
      logUserAction('request_success', `Generated ${newContent.featuredPrograms?.length || 0} programs, ${newContent.latestNews?.length || 0} news items`);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "✨ Saya sudah menyiapkan perubahannya dengan validasi keamanan. Silakan tinjau **pratinjau visual** di bawah ini dan klik 'Terapkan Perubahan' jika sudah sesuai.\n\n🛡️ **Keamanan**: Semua perubahan telah melalui proses validasi.",
        sender: Sender.AI
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      let errorMessage = 'Maaf, terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = '❌ **Koneksi gagal**: Tidak dapat terhubung ke server AI. Silakan periksa koneksi internet Anda dan coba lagi.';
        } else if (error.message.includes('timeout')) {
          errorMessage = '⏱️ **Timeout**: Permintaan terlalu lama. Silakan coba lagi dengan permintaan yang lebih sederhana.';
        } else if (error.message.includes('rate limit') || error.message.includes('quota') || error.message.includes('menunggu')) {
          errorMessage = '🚫 **Batas terlampaui**: Terlalu banyak permintaan. Silakan tunggu beberapa saat sebelum mencoba lagi.';
          // Extract wait time and set rate limit info
          const waitTime = parseInt(error.message.match(/\d+/)?.[0] || '60');
          setRateLimitInfo({
            remaining: waitTime * 1000,
            resetTime: Date.now() + (waitTime * 1000)
          });
        } else if (error.message.includes('invalid') || error.message.includes('parse') || error.message.includes('format')) {
          errorMessage = '🔧 **Format tidak valid**: AI mengembalikan data yang tidak benar. Silakan coba instruksi yang lebih spesifik atau sederhana.';
        } else if (error.message.includes('struktur') || error.message.includes('valid') || error.message.includes('keamanan')) {
          errorMessage = '🛡️ **Validasi keamanan gagal**: Respon AI tidak memenuhi standar keamanan. Silakan coba lagi dengan instruksi yang berbeda.';
        } else if (error.message.includes('melebihi batas')) {
          errorMessage = '📊 **Batas konten terlampaui**: Terlalu banyak perubahan dalam satu permintaan. Silakan lakukan perubahan secara bertahap.';
        } else {
          errorMessage = `❌ **Error**: ${error.message}`;
        }
      }
      
      logUserAction('request_failed', errorMessage);
      
      const errorChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        sender: Sender.AI
      };
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (proposedContent) {
      setPendingContent(proposedContent);
      setShowConfirmation(true);
    }
  };

  const handleConfirmApply = () => {
    if (pendingContent) {
      const changeSummary = generateChangeSummary(currentContent, pendingContent);
      saveToHistory(changeSummary, pendingContent, currentContent);
      onUpdateContent(pendingContent);
      setProposedContent(null);
      setPendingContent(null);
      setShowConfirmation(false);
      
      const confirmMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `✅ **Berhasil!** Perubahan telah diterapkan: ${changeSummary}`,
        sender: Sender.AI
      };
      setMessages(prev => [...prev, confirmMessage]);
    }
  };

  const handleCancel = () => {
      setProposedContent(null);
      const cancelMessage: ChatMessage = {
          id: Date.now().toString(),
          text: "🚫 Perubahan dibatalkan. Ada lagi yang ingin Anda ubah?",
          sender: Sender.AI
      };
      setMessages(prev => [...prev, cancelMessage]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnEscape={true}
      closeOnBackdropClick={true}
      showCloseButton={false}
      className={`bg-white dark:bg-neutral-800 rounded-2xl shadow-xl w-full max-w-4xl ${HEIGHTS.VIEWPORT.XLARGE} flex flex-col`}
    >
      <header className="flex justify-between items-center p-5 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <SparklesIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">AI Website Editor <span className="text-xs font-normal text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">🛡️ Dilindungi</span></h2>
          {changeHistory.length > 0 && (
            <Button
              onClick={undoLastChange}
              variant="info"
              size="sm"
              className="px-2 py-1 text-xs rounded-full"
              title={`Undo ${changeHistory.length} perubahan terakhir`}
            >
              ↶ Undo ({changeHistory.length})
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            onClick={onResetContent}
            icon={<ArrowPathIcon />}
            ariaLabel="Reset konten"
            tooltip="Reset Konten ke Default"
            variant="ghost"
            size="md"
            className="rounded-full hover:text-red-600 dark:hover:text-red-400"
          />
          <IconButton
            onClick={onClose}
            icon={<CloseIcon />}
            ariaLabel="Tutup"
            variant="ghost"
            size="md"
            className="rounded-full"
          />
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Chat History */}
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === Sender.User ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === Sender.AI && <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0"><SparklesIcon className="h-5 w-5" aria-hidden="true"/></div>}
                <div className={`max-w-lg p-3 rounded-2xl ${msg.sender === Sender.User ? 'bg-green-600 text-white rounded-br-lg' : 'bg-neutral-100 dark:bg-neutral-700 rounded-bl-lg'}`}>
                  <MarkdownRenderer content={msg.text} />
                </div>
              </div>
            ))}
             {isLoading && (
                  <div className="flex items-start gap-3 justify-start">
                     <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0"><SparklesIcon className="h-5 w-5" aria-hidden="true"/></div>
                     <div className="max-w-lg p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-700 rounded-bl-lg">
                        <TypingIndicator />
                    </div>
                </div>
            )}
             <div ref={messagesEndRef} />
          </div>
          
          {/* Proposed Changes Preview */}
          {proposedContent && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Pratinjau Perubahan</h3>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Preview Mode</span>
                </div>
                
                <div className="space-y-8 bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                    {/* Programs Preview */}
                    {proposedContent.featuredPrograms && proposedContent.featuredPrograms.length > 0 && (
                        <div>
                            <h4 className="text-sm uppercase tracking-wide font-semibold text-neutral-500 dark:text-neutral-400 mb-4">Program Unggulan</h4>
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
                             <h4 className="text-sm uppercase tracking-wide font-semibold text-neutral-500 dark:text-neutral-400 mb-4">Berita Terbaru</h4>
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
                    <summary className="text-xs text-neutral-500 cursor-pointer hover:text-green-600 transition-colors select-none">Tampilkan Data JSON Mentah (Debug)</summary>
                    <div className="bg-neutral-900 p-4 rounded-lg max-h-40 overflow-y-auto mt-2 custom-scrollbar">
                        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{JSON.stringify(proposedContent, null, 2)}</pre>
                    </div>
                </details>

                 <div className="mt-6 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-neutral-800 py-4 border-t border-neutral-100 dark:border-neutral-700/50">
                    <Button variant="secondary" onClick={handleCancel}>
                        Batalkan
                    </Button>
                    <Button variant="success" onClick={handleApply}>
                        Terapkan Perubahan
                    </Button>
                </div>
            </div>
          )}
      </main>

      <footer className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex-shrink-0">
          <div className="space-y-3">
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
                  placeholder={isLoading ? "AI sedang berpikir..." : "Ketik permintaan Anda..."}
                  fullWidth={true}
                  className={HEIGHTS.CONTENT.MINIMUM}
                  autoResize={true}
                 minRows={1}
                 maxRows={5}
              />
<IconButton
                 onClick={handleSend}
                 disabled={isLoading || !input.trim() || !!inputError || !!validationError || !!rateLimitInfo}
                 ariaLabel={rateLimitInfo ? "Dibatasi rate limit" : "Kirim permintaan"}
                 size="md"
                 variant={rateLimitInfo ? "secondary" : "primary"}
                 className="p-2.5 mb-0.5"
                 icon={<SendIcon />}
               />
            </div>
            
            {/* Character count and validation */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={`text-xs ${characterCount > 1000 ? 'text-red-500 font-medium' : 'text-neutral-400 dark:text-neutral-500'}`}>
                  {characterCount}/1000 karakter
                </span>
                {inputError && (
                  <span className="text-xs text-red-500 animate-pulse">
                    {inputError}
                  </span>
                )}
                {validationError && (
                  <span className="text-xs text-orange-500 animate-pulse">
                    🛡️ {validationError}
                  </span>
                )}
                {rateLimitInfo && (
                  <span className="text-xs text-yellow-500 animate-pulse flex items-center gap-1">
                    ⏱️ Rate limit: {Math.ceil(rateLimitInfo.remaining / 1000)}s
                  </span>
                )}
              </div>
              
              {/* Status indicators */}
              <div className="flex items-center gap-2">
                {input.length > 0 && !inputError && !validationError && !rateLimitInfo && (
                  <span className="text-xs text-green-500">✓ Siap dikirim</span>
                )}
                {rateLimitInfo && (
                  <span className="text-xs text-yellow-500">🚫 Rate limited</span>
                )}
                {isLoading && (
                  <span className="text-xs text-blue-500">🔄 Memproses...</span>
                )}
              </div>
            </div>
            
            <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
              💡 Anda dapat membatalkan hingga 5 perubahan terakhir • Perubahan tersimpan di browser
            </p>
          </div>
      </footer>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setPendingContent(null);
        }}
        size="md"
        showCloseButton={false}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-600 text-lg">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Konfirmasi Perubahan
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-neutral-600 dark:text-neutral-300 text-sm">
              Apakah Anda yakin ingin menerapkan perubahan berikut?
            </p>

            <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                Ringkasan Perubahan:
              </div>
              <div className="text-sm text-neutral-800 dark:text-neutral-200">
                {generateChangeSummary(currentContent, pendingContent!)}
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600">
                <div className="text-xs uppercase tracking-wide font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                  Rincian:
                </div>
                <ul className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {pendingContent?.featuredPrograms?.map((prog, idx) => (
                    <li key={`preview-prog-${idx}`} className="flex items-center gap-1">
                      <span className="text-green-500">•</span>
                      <span>Program: {prog.title}</span>
                    </li>
                  )) || []}
                  {pendingContent?.latestNews?.map((news, idx) => (
                    <li key={`preview-news-${idx}`} className="flex items-center gap-1">
                      <span className="text-blue-500">•</span>
                      <span>Berita: {news.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 text-sm">ℹ️</span>
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  Perubahan akan disimpan di riwayat dan dapat dibatalkan dengan tombol Undo.
                </p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-sm">🛡️</span>
                <div className="text-xs text-green-800 dark:text-green-200">
                  <p className="font-semibold mb-1">Keamanan Terverifikasi:</p>
                  <ul className="space-y-0.5 ml-4">
                    <li>• Input divalidasi terhadap pola berbahaya</li>
                    <li>• Struktur data telah diperiksa</li>
                    <li>• Rate limit diterapkan untuk mencegah abuse</li>
                    <li>• Semua perubahan diaudit untuk keamanan</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                setShowConfirmation(false);
                setPendingContent(null);
              }}
              variant="secondary"
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirmApply}
              variant="success"
            >
              Ya, Terapkan Perubahan
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};

export default SiteEditor;
