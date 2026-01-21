import React, { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageThread } from './MessageThread';
import { apiService } from '../services/apiService';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import Modal from './ui/Modal';
import Button from './ui/Button';
import type { Conversation, Participant, User } from '../types';

interface DirectMessageProps {
  currentUser: User;
}

export function DirectMessage({ currentUser }: DirectMessageProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [_selectedParticipantId, setSelectedParticipantId] = useState<string>();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    loadAvailableUsers();
  }, []);

  const loadAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await apiService.users.getAll();
      if (response.success && response.data) {
        const otherUsers = response.data.filter((u: User) => u.id !== currentUser.id);
        setAvailableUsers(otherUsers);
      }
    } catch (err) {
      logger.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleConversationSelect = (conversationId: string, participantId?: string) => {
    setSelectedConversationId(conversationId);
    setSelectedParticipantId(participantId);
  };

  const handleNewChat = async () => {
    if (!selectedUserId) return;

    try {
      setCreatingConversation(true);
      const response = await apiService.messages.createConversation({
        type: 'direct',
        participantIds: [selectedUserId],
      });

      if (response.success && response.data) {
        setShowNewChatModal(false);
        setSelectedConversationId(response.data!.id);
        setSelectedUserId('');
      }
    } catch (err) {
      logger.error('Failed to create conversation:', err);
      window.alert('Gagal membuat percakapan baru');
    } finally {
      setCreatingConversation(false);
    }
  };

  const getSelectedParticipant = (): Participant | undefined => {
    if (!selectedConversationId) return undefined;

    const conversationsJSON = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (conversationsJSON) {
      const conversations: Conversation[] = JSON.parse(conversationsJSON);
      const conversation = conversations.find(c => c.id === selectedConversationId);
      if (conversation) {
        return conversation.participants.find(p => p.userId !== currentUser.id);
      }
    }
    return undefined;
  };

  const selectedParticipant = getSelectedParticipant();

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="w-80 flex-shrink-0">
        <MessageList
          onConversationSelect={handleConversationSelect}
          selectedConversationId={selectedConversationId}
        />
      </div>

      <div className="flex-1 border-l border-gray-200">
        {selectedConversationId ? (
          <MessageThread
            conversationId={selectedConversationId}
            currentUser={currentUser}
            participant={selectedParticipant}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <svg
              className="mb-4 h-24 w-24 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-lg font-medium">Selamat Datang di Pesan</p>
            <p className="mt-2">Pilih percakapan untuk memulai</p>
            <Button
              onClick={() => setShowNewChatModal(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Percakapan Baru
            </Button>
          </div>
        )}
      </div>

      {showNewChatModal && (
        <Modal isOpen={showNewChatModal} onClose={() => setShowNewChatModal(false)}>
          <div className="max-w-md">
            <h2 className="mb-4 text-xl font-semibold">Percakapan Baru</h2>
            <div className="mb-4">
              <label htmlFor="user-select" className="mb-2 block text-sm font-medium text-gray-700">
                Pilih Pengguna
              </label>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : (
                <select
                  id="user-select"
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Pilih pengguna...</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setShowNewChatModal(false)}
                variant="ghost"
              >
                Batal
              </Button>
              <Button
                onClick={handleNewChat}
                disabled={!selectedUserId || creatingConversation}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {creatingConversation ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Membuat...
                  </>
                ) : (
                  'Buat Percakapan'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
