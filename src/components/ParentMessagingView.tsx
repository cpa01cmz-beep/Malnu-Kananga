import React, { useState, useEffect } from 'react';
import { UserIcon } from './icons/UserIcon';
import { SendIcon } from './icons/SendIcon';

import { ToastType } from './Toast';
import type { ParentChild, ParentTeacher, ParentMessage } from '../types';
import { parentsAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import { validateAndSanitizeMessage, validateParentMessage } from '../utils/parentValidation';
import Button from './ui/Button';

interface ParentMessagingViewProps {
  onShowToast: (msg: string, type: ToastType) => void;
  children: ParentChild[];
}

const ParentMessagingView: React.FC<ParentMessagingViewProps> = ({ onShowToast, children }) => {
  const [selectedChild, setSelectedChild] = useState<ParentChild | null>(null);
  const [messages, setMessages] = useState<ParentMessage[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<ParentTeacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<ParentTeacher | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (children.length > 0) {
      setSelectedChild(children[0]);
    }
  }, [children]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedChild) return;

      setLoading(true);
      try {
        const [messagesResponse, teachersResponse] = await Promise.all([
          parentsAPI.getMessages(selectedChild.studentId),
          parentsAPI.getAvailableTeachers(selectedChild.studentId)
        ]);

        if (messagesResponse.success) {
          setMessages(messagesResponse.data || []);
        }

        if (teachersResponse.success && teachersResponse.data) {
          setAvailableTeachers(teachersResponse.data);
          if (teachersResponse.data.length > 0) {
            setSelectedTeacher(teachersResponse.data[0]);
          }
        }
      } catch (error) {
        logger.error('Failed to fetch messaging data:', error);
        onShowToast('Gagal memuat data pesan', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedChild, onShowToast]);

  const handleSendMessage = async () => {
    if (!selectedChild || !selectedTeacher || !newMessage.trim() || !messageSubject.trim()) {
      onShowToast('Mohon lengkapi semua field', 'error');
      return;
    }

    const messageInput = {
      sender: 'parent' as const,
      childName: selectedChild.studentName,
      teacherName: selectedTeacher.teacherName,
      subject: messageSubject,
      message: newMessage.trim()
    };

    const validation = validateAndSanitizeMessage(messageInput);
    if (!validation.isValid) {
      onShowToast('Validasi gagal: ' + validation.errors.join(', '), 'error');
      return;
    }

    setSending(true);
    try {
      const response = await parentsAPI.sendMessage(validation.sanitized!);

      if (response.success && response.data) {
        const messageValidation = validateParentMessage(response.data);
        if (!messageValidation.isValid) {
          logger.error('Server returned invalid message data:', messageValidation.errors);
        }

        setMessages([response.data, ...messages]);
        setNewMessage('');
        setMessageSubject('');
        onShowToast('Pesan terkirim', 'success');
      } else {
        onShowToast('Gagal mengirim pesan', 'error');
      }
    } catch (error) {
      logger.error('Failed to send message:', error);
      onShowToast('Gagal mengirim pesan', 'error');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-sm border border-neutral-100 dark:border-neutral-700">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-6"></div>
          <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-sm border border-neutral-100 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Pesan Guru</h2>
          <div className="flex items-center gap-4">
            {children.length > 1 && (
              <select
                value={selectedChild?.studentId || ''}
                onChange={(e) => setSelectedChild(children.find(c => c.studentId === e.target.value) || null)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
              >
                {children.map((child) => (
                  <option key={child.studentId} value={child.studentId}>
                    {child.studentName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teachers List */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Guru Tersedia</h3>
            <div className="space-y-3">
              {availableTeachers.map((teacher) => (
                <button
                  key={teacher.teacherId}
                  onClick={() => setSelectedTeacher(teacher)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedTeacher?.teacherId === teacher.teacherId
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <UserIcon />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">{teacher.teacherName}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{teacher.subject}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">{teacher.className}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-6 h-96 overflow-y-auto mb-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SendIcon />
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400">Belum ada pesan</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                    Mulai percakapan dengan guru anak
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'parent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-2xl ${
                          message.sender === 'parent'
                            ? 'bg-green-600 text-white'
                            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                        }`}
                      >
                        {message.sender === 'teacher' && (
                          <p className="text-xs opacity-75 mb-1">{message.teacherName}</p>
                        )}
                        {message.sender === 'parent' && (
                          <p className="text-xs opacity-75 mb-1">Ke: {message.teacherName}</p>
                        )}
                        <p className="font-semibold text-sm mb-1">{message.subject}</p>
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-2 ${
                          message.sender === 'parent' ? 'text-green-100' : 'text-neutral-500 dark:text-neutral-400'
                        }`}>
                          {formatDate(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            {selectedTeacher && (
              <div className="space-y-3">
                <input
                  id="message-subject"
                  name="subject"
                  type="text"
                  placeholder="Subjek pesan"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                  autoComplete="off"
                />
                <div className="flex gap-2">
                  <input
                    id="message-body"
                    name="message"
                    type="text"
                    placeholder="Ketik pesan..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                    autoComplete="off"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim() || !messageSubject.trim()}
                    variant="green-solid"
                    isLoading={sending}
                    icon={!sending ? <SendIcon /> : undefined}
                    iconPosition="left"
                  >
                    {sending ? 'Mengirim...' : 'Kirim'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-sm border border-neutral-100 dark:border-neutral-700">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Tips Komunikasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          <div>• Tulis pesan yang jelas dan ringkas</div>
          <div>• Sertakan subjek yang relevan</div>
          <div>• Hormati waktu respon guru</div>
          <div>• Fokus pada hal-hal penting terkait pembelajaran</div>
        </div>
      </div>
    </div>
  );
};

export default ParentMessagingView;