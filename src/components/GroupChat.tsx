import React, { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageThread } from './MessageThread';
import { MessageInput } from './MessageInput';
import { apiService } from '../services/apiService';
import { STORAGE_KEYS } from '../constants';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import Select from './ui/Select';
import type { Conversation, User, Class, Subject } from '../types';

interface GroupChatProps {
  currentUser: User;
}

export function GroupChat({ currentUser }: GroupChatProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showManageGroupModal, setShowManageGroupModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation>();
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupType, setGroupType] = useState<'class' | 'subject' | 'custom'>('class');
  const [selectedClass, setSelectedClass] = useState<string>();
  const [selectedSubject, setSelectedSubject] = useState<string>();
  const [creatingGroup, setCreatingGroup] = useState(false);

  useEffect(() => {
    loadClasses();
    loadSubjects();
    loadAvailableUsers();
  }, []);

  useEffect(() => {
    if (groupType === 'class' && selectedClass) {
      loadClassParticipants(selectedClass);
      setGroupName(`Kelas ${selectedClass}`);
      setGroupDescription(`Grup diskusi untuk kelas ${selectedClass}`);
    } else if (groupType === 'subject' && selectedSubject) {
      loadSubjectParticipants(selectedSubject);
      const subject = subjects.find(s => s.id === selectedSubject);
      setGroupName(subject?.name || '');
      setGroupDescription(`Grup diskusi untuk mata pelajaran ${subject?.name}`);
    }
  }, [groupType, selectedClass, selectedSubject]);

  const loadClasses = async () => {
    try {
      const response = await apiService.classes.getClasses();
      if (response.success && response.data) {
        setClasses(response.data);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await apiService.subjects.getSubjects();
      if (response.success && response.data) {
        setSubjects(response.data);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.users.getUsers();
      if (response.success && response.data) {
        const otherUsers = response.data.filter(u => u.id !== currentUser.id);
        setAvailableUsers(otherUsers);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClassParticipants = async (classId: string) => {
    try {
      const response = await apiService.students.getStudents();
      if (response.success && response.data) {
        const classStudents = response.data.filter(s => s.class === classId);
        const participantIds = classStudents.map(s => s.userId);
        setSelectedParticipants(participantIds);
      }
    } catch (err) {
      console.error('Failed to load class participants:', err);
    }
  };

  const loadSubjectParticipants = async (subjectId: string) => {
    try {
      const students = await apiService.students.getStudents();
      const schedules = await apiService.schedules.getSchedules();

      if (students.success && students.data && schedules.success && schedules.data) {
        const subjectSchedules = schedules.data.filter(s => s.subjectId === subjectId);
        const classIds = [...new Set(subjectSchedules.map(s => s.classId))];

        const classStudents = students.data.filter(s => classIds.includes(s.class));
        const participantIds = classStudents.map(s => s.userId);
        setSelectedParticipants(participantIds);
      }
    } catch (err) {
      console.error('Failed to load subject participants:', err);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedParticipants.length === 0) {
      alert('Nama grup dan peserta wajib diisi');
      return;
    }

    try {
      setCreatingGroup(true);
      const response = await apiService.messages.createConversation({
        type: 'group',
        participantIds: selectedParticipants,
        name: groupName,
        description: groupDescription,
        metadata: {
          createdBy: currentUser.id,
          groupType,
          classId: selectedClass,
          subjectId: selectedSubject,
        },
      });

      if (response.success && response.data) {
        setShowNewGroupModal(false);
        setSelectedConversationId(response.data!.id);
        setGroupName('');
        setGroupDescription('');
        setSelectedParticipants([]);
        setSelectedClass(undefined);
        setSelectedSubject(undefined);
      }
    } catch (err) {
      console.error('Failed to create group:', err);
      alert('Gagal membuat grup baru');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleToggleParticipant = (userId: string) => {
    if (groupType === 'class' || groupType === 'subject') {
      return;
    }
    setSelectedParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleManageGroup = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowManageGroupModal(true);
  };

  const handleAddParticipant = async (userId: string) => {
    if (!selectedConversationId) return;

    try {
      const response = await apiService.messages.updateConversation(selectedConversationId, {
        participantIds: [...selectedConversation!.participantIds, userId],
      });

      if (response.success) {
        setSelectedConversation({
          ...selectedConversation!,
          participantIds: [...selectedConversation!.participantIds, userId],
        });
      }
    } catch (err) {
      console.error('Failed to add participant:', err);
      alert('Gagal menambahkan peserta');
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    if (!selectedConversationId) return;

    try {
      const response = await apiService.messages.updateConversation(selectedConversationId, {
        participantIds: selectedConversation!.participantIds.filter(id => id !== userId),
      });

      if (response.success) {
        setSelectedConversation({
          ...selectedConversation!,
          participantIds: selectedConversation!.participantIds.filter(id => id !== userId),
        });
      }
    } catch (err) {
      console.error('Failed to remove participant:', err);
      alert('Gagal menghapus peserta');
    }
  };

  const isCurrentUserAdmin = selectedConversation?.participants?.find(
    p => p.userId === currentUser.id
  )?.isAdmin;

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r bg-white">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900">Grup Diskusi</h2>
            <Button
              onClick={() => setShowNewGroupModal(true)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Buat Grup
            </Button>
          </div>
        </div>
        <MessageList
          currentUser={currentUser}
          onConversationSelect={handleConversationSelect}
          filter="group"
          onManageGroup={handleManageGroup}
        />
      </div>

      <div className="flex-1 bg-gray-100">
        {selectedConversationId ? (
          <div className="flex h-full flex-col">
            <MessageThread
              currentUser={currentUser}
              conversationId={selectedConversationId}
            />
            <MessageInput
              currentUser={currentUser}
              conversationId={selectedConversationId}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">Pilih grup untuk memulai percakapan</p>
              <p className="text-sm text-gray-400">
                Atau buat grup baru untuk diskusi kelas atau mata pelajaran
              </p>
            </div>
          </div>
        )}
      </div>

      {showNewGroupModal && (
        <Modal onClose={() => setShowNewGroupModal(false)} title="Buat Grup Baru">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Grup
              </label>
              <Select
                value={groupType}
                onChange={(e) => {
                  setGroupType(e.target.value as 'class' | 'subject' | 'custom');
                  setSelectedParticipants([]);
                }}
                className="w-full"
              >
                <option value="class">Berdasarkan Kelas</option>
                <option value="subject">Berdasarkan Mata Pelajaran</option>
                <option value="custom">Kustom</option>
              </Select>
            </div>

            {groupType === 'class' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Kelas
                </label>
                <Select
                  value={selectedClass || ''}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full"
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.semester})
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {groupType === 'subject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Mata Pelajaran
                </label>
                <Select
                  value={selectedSubject || ''}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full"
                >
                  <option value="">Pilih Mata Pelajaran</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {groupType === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Grup
                  </label>
                  <Input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Contoh: Tim Proyek Matematika"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi (Opsional)
                  </label>
                  <Input
                    type="text"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Deskripsi grup..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peserta ({selectedParticipants.length})
                  </label>
                  {loading ? (
                    <p className="text-sm text-gray-500">Memuat peserta...</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
                      {availableUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500">{user.role}</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(user.id)}
                            onChange={() => handleToggleParticipant(user.id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {groupType !== 'custom' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>{selectedParticipants.length} peserta</strong> akan ditambahkan ke grup ini secara otomatis
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowNewGroupModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={creatingGroup || selectedParticipants.length === 0 || !groupName}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingGroup ? 'Membuat...' : 'Buat Grup'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showManageGroupModal && selectedConversation && (
        <Modal
          onClose={() => setShowManageGroupModal(false)}
          title={`Kelola Grup: ${selectedConversation.name || 'Grup Tanpa Nama'}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Grup
              </label>
              <Input
                type="text"
                value={selectedConversation.name || ''}
                onChange={(e) =>
                  setSelectedConversation({
                    ...selectedConversation,
                    name: e.target.value,
                  })
                }
                className="w-full"
                disabled={!isCurrentUserAdmin}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <Input
                type="text"
                value={selectedConversation.description || ''}
                onChange={(e) =>
                  setSelectedConversation({
                    ...selectedConversation,
                    description: e.target.value,
                  })
                }
                className="w-full"
                disabled={!isCurrentUserAdmin}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peserta ({selectedConversation.participants?.length || 0})
              </label>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
                {selectedConversation.participants?.map((participant) => (
                  <div
                    key={participant.userId}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {participant.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {participant.role}
                          {participant.isAdmin && ' (Admin)'}
                        </p>
                      </div>
                    </div>
                    {isCurrentUserAdmin &&
                      participant.userId !== currentUser.id && (
                        <Button
                          onClick={() => handleRemoveParticipant(participant.userId)}
                          className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                        >
                          Hapus
                        </Button>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {isCurrentUserAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tambah Peserta
                </label>
                <Select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddParticipant(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full"
                >
                  <option value="">Pilih pengguna untuk ditambahkan...</option>
                  {availableUsers
                    .filter(
                      (u) =>
                        !selectedConversation.participantIds?.includes(u.id)
                    )
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                </Select>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowManageGroupModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Tutup
              </Button>
              {isCurrentUserAdmin && (
                <Button
                  onClick={async () => {
                    try {
                      await apiService.messages.updateConversation(
                        selectedConversation.id,
                        {
                          name: selectedConversation.name,
                          description: selectedConversation.description,
                        }
                      );
                      setShowManageGroupModal(false);
                    } catch (err) {
                      console.error('Failed to update group:', err);
                      alert('Gagal mengupdate grup');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
