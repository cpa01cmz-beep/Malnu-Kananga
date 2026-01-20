import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/apiService';
import { STORAGE_KEYS } from '../constants';
import { MessageInput } from './MessageInput';
import type { DirectMessage, Participant } from '../types';

interface MessageThreadProps {
  conversationId: string;
  currentUser: { id: string; name: string; role: string };
  participant?: Participant;
}

interface ReplyPreview {
  id: string;
  content: string;
  senderName: string;
}

export function MessageThread({ conversationId, currentUser, participant }: MessageThreadProps) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ReplyPreview | undefined>();
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  const [conversation, setConversation] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    loadParticipants();
    loadConversation();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleWebSocketMessage = (event: CustomEvent) => {
      const { type, data } = event.detail;
      if (type === 'message_created' && (data as DirectMessage).conversationId === conversationId) {
        setMessages(prev => [...prev, data as DirectMessage]);
        markMessageAsRead((data as DirectMessage).id);
        scrollToBottom();
      }
    };

    window.addEventListener('realtime-update', handleWebSocketMessage as EventListener);
    return () => window.removeEventListener('realtime-update', handleWebSocketMessage as EventListener);
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await apiService.messages.getMessages(conversationId, 100);
      if (response.success && response.data) {
        setMessages(response.data);
      }
    } catch (err) {
      setError('Gagal memuat pesan');
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    try {
      const response = await apiService.messages.getConversation(conversationId);
      if (response.success && response.data) {
        const participantMap: Record<string, Participant> = {};
        response.data.participants.forEach(p => {
          participantMap[p.userId] = p;
        });
        setParticipants(participantMap);
      }
    } catch (err) {
      console.error('Failed to load participants:', err);
    }
  };

  const loadConversation = async () => {
    try {
      const response = await apiService.messages.getConversation(conversationId);
      if (response.success && response.data) {
        setConversation(response.data);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await apiService.messages.markMessageAsRead(messageId);
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string, file?: File) => {
    try {
      const messageData = {
        conversationId,
        messageType: file ? 'file' : 'text',
        content,
        replyTo: replyTo?.id,
      };

      const response = await apiService.messages.sendMessage({ ...messageData, file });
      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data!]);
        setReplyTo(undefined);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  const handleReply = (message: DirectMessage) => {
    const sender = participants[message.senderId];
    setReplyTo({
      id: message.id,
      content: message.content,
      senderName: sender?.name || message.senderName,
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Baru saja';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} mnt lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} hari lalu`;

    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isOwnMessage = (message: DirectMessage) => message.senderId === currentUser.id;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-gray-200 bg-white px-4 py-3">
        {participant ? (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
              {participant.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900">{participant.name}</h3>
              <p className="text-sm text-gray-500">
                {participant.isOnline ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    Online
                  </span>
                ) : (
                  <>
                    Terakhir dilihat {participant.lastSeen ? formatTime(participant.lastSeen) : 'lama'}
                  </>
                )}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-lg font-semibold text-white">
              {conversation?.name?.charAt(0).toUpperCase() || '#'}
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900">{conversation?.name || 'Grup'}</h3>
              <p className="text-sm text-gray-500">
                {conversation?.participants?.length || 0} peserta
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p>Belum ada pesan. Mulai percakapan!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = isOwnMessage(message);
              const sender = participants[message.senderId];

              return (
                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    {!isOwn && (
                      <p className="mb-1 text-xs text-gray-600">
                        {sender?.name || message.senderName}
                      </p>
                    )}
                    {message.replyTo && (
                      <div className="mb-2 rounded-l-lg border-l-4 border-blue-600 bg-blue-50 px-3 py-2">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">
                            {sender?.name || message.senderName}
                          </span>
                          : {message.replyTo}
                        </p>
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900'
                      }`}
                    >
                      {message.messageType === 'file' && message.fileUrl && (
                        <div className="mb-2">
                          <a
                            href={message.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 underline hover:text-blue-800"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            {message.fileName || 'File'}
                          </a>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <div className={`mt-1 text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                        {formatTime(message.createdAt)}
                        {message.status === 'read' && (
                          <span className="ml-2">
                            <svg className="inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                      <button
                        onClick={() => handleReply(message)}
                        className="text-xs text-gray-500 hover:text-blue-600"
                      >
                        Balas
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={loading}
        placeholder={`Kirim pesan ke ${participant.name}...`}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(undefined)}
      />
    </div>
  );
}
