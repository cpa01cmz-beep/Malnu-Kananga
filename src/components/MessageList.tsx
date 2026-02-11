import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { EmptyState } from './ui/LoadingState';
import { ChatIcon } from './icons/ChatIcon';
import LoadingSpinner from './ui/LoadingSpinner';
import type { Conversation, ConversationFilter } from '../types';

interface MessageListProps {
  onConversationSelect: (conversationId: string, participantId?: string) => void;
  selectedConversationId?: string;
  filter?: 'all' | 'direct' | 'group';
  onManageGroup?: (conversation: Conversation) => void;
  onStartNewConversation?: () => void;
}

export function MessageList({
  onConversationSelect,
  selectedConversationId,
  filter: externalFilter,
  onManageGroup,
  onStartNewConversation,
}: MessageListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'group'>(externalFilter || 'all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const filter: ConversationFilter = {
        type: filterType === 'all' ? undefined : filterType,
        search: searchQuery || undefined,
        unreadOnly: showUnreadOnly,
      };

      const response = await apiService.messages.getConversations(filter);
      if (response.success && response.data) {
        setConversations(response.data);
      }
    } catch (err) {
      setError('Gagal memuat percakapan');
      logger.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType, showUnreadOnly, searchQuery]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (externalFilter) {
      setFilterType(externalFilter);
    }
  }, [externalFilter]);

  useEffect(() => {
    if (!externalFilter) {
      loadConversations();
    }
  }, [externalFilter, loadConversations]);

  useEffect(() => {
    const handleWebSocketMessage = (event: Event) => {
      const customEvent = event as CustomEvent<Record<string, unknown>>;
      const { entity } = customEvent.detail;
      if (entity === 'message' || entity === 'conversation') {
        loadConversations();
      }
    };

    window.addEventListener('realtime-update', handleWebSocketMessage);
    return () => window.removeEventListener('realtime-update', handleWebSocketMessage);
  }, [loadConversations]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleConversationClick = async (conversation: Conversation) => {
    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(p => p.userId !== getCurrentUserId());
      if (otherParticipant) {
        onConversationSelect(conversation.id, otherParticipant.userId);
      }
    } else {
      onConversationSelect(conversation.id);
    }

    if (conversation.unreadCount > 0) {
      await markConversationAsRead(conversation.id);
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    try {
      await apiService.messages.markConversationAsRead(conversationId);
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (err) {
      logger.error('Failed to mark conversation as read:', err);
    }
  };

  const getCurrentUserId = (): string => {
    const userJSON = localStorage.getItem(STORAGE_KEYS.USER);
    if (userJSON) {
      const user = JSON.parse(userJSON);
      return user.id;
    }
    return '';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 86400000) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
      return date.toLocaleDateString('id-ID', { weekday: 'short' });
    }

    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(p => p.userId !== getCurrentUserId());
      if (otherParticipant?.avatar) {
        return otherParticipant.avatar;
      }
      if (otherParticipant?.name) {
        return otherParticipant.name.charAt(0).toUpperCase();
      }
    }
    if (conversation.avatar) {
      return conversation.avatar;
    }
    if (conversation.name) {
      return conversation.name.charAt(0).toUpperCase();
    }
    return '?';
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(p => p.userId !== getCurrentUserId());
      return otherParticipant?.name || conversation.name || 'Tanpa Nama';
    }
    return conversation.name || 'Tanpa Nama';
  };

  const getLastMessage = (conversation: Conversation) => {
    if (conversation.lastMessage) {
      if (conversation.lastMessage.messageType === 'file') {
        return `📎 ${conversation.lastMessage.fileName || 'File'}`;
      }
      return conversation.lastMessage.content;
    }
    return 'Tidak ada pesan';
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="md" color="primary" variant="ring" />
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
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="border-b border-gray-200 p-4">
        <div className="mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Cari percakapan..."
            aria-label="Cari percakapan"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {!externalFilter && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`rounded-lg px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterType('direct')}
              className={`rounded-lg px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                filterType === 'direct'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pribadi
            </button>
            <button
              type="button"
              onClick={() => setFilterType('group')}
              className={`rounded-lg px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                filterType === 'group'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Grup
            </button>
            <button
              type="button"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`rounded-lg px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                showUnreadOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showUnreadOnly ? 'Semua' : 'Belum Dibaca'}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              message={
                searchQuery || filterType !== 'all' || showUnreadOnly
                  ? 'Tidak ada percakapan yang sesuai'
                  : 'Belum ada percakapan'
              }
              subMessage={
                searchQuery || filterType !== 'all' || showUnreadOnly
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Mulai percakapan baru untuk berkomunikasi'
              }
              icon={<ChatIcon />}
              size="md"
              variant="default"
              action={
                onStartNewConversation && !searchQuery && filterType === 'all' && !showUnreadOnly
                  ? {
                      label: 'Mulai Percakapan',
                      onClick: onStartNewConversation,
                    }
                  : undefined
              }
              ariaLabel="Tidak ada percakapan"
            />
          </div>
        ) : (
          <div>
            {conversations.map((conversation) => {
              const isSelected = conversation.id === selectedConversationId;
              const avatar = getConversationAvatar(conversation);
              const name = getConversationName(conversation);
              const lastMessage = getLastMessage(conversation);

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => handleConversationClick(conversation)}
                  className={`w-full border-b border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                   <div className="flex items-start gap-3">
                     <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                        {typeof avatar === 'string' && avatar.startsWith('http') ? (
                          <img
                            src={avatar}
                            alt={name}
                            className="h-full w-full rounded-full object-cover"
                            width={48}
                            height={48}
                            loading="lazy"
                            decoding="async"
                          />
                       ) : (
                         avatar
                       )}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <h4 className="truncate font-semibold text-gray-900">{name}</h4>
                           {conversation.type === 'group' && onManageGroup && (
                             <span className="text-xs text-gray-500">
                               ({conversation.participants?.length || 0})
                             </span>
                           )}
                         </div>
                         <div className="flex items-center gap-2">
                            {conversation.type === 'group' && onManageGroup && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onManageGroup(conversation);
                                }}
                                aria-label="Kelola grup"
                                className="p-1 text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
                              >
                                ⚙️
                              </button>
                            )}
                           <span className="ml-2 flex-shrink-0 text-xs text-gray-500">
                             {conversation.lastMessageAt ? formatTime(conversation.lastMessageAt) : ''}
                           </span>
                         </div>
                       </div>
                       <div className="mt-1 flex items-center justify-between">
                         <p className="truncate text-sm text-gray-600">{lastMessage}</p>
                         {conversation.unreadCount > 0 && (
                           <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white">
                             {conversation.unreadCount}
                           </span>
                         )}
                       </div>
                     </div>
                   </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
