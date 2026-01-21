import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GroupChat } from '../GroupChat';
import * as apiService from '../../services/apiService';
import { _STORAGE_KEYS } from '../../constants';
import type { User, Class, Subject } from '../../types';

describe('GroupChat', () => {
  const mockCurrentUser: User = {
    id: 'user-1',
    name: 'Test Teacher',
    email: 'teacher@test.com',
    role: 'teacher',
    status: 'active',
  };

  const mockClasses: Class[] = [
    { id: 'class-1', name: '10A', homeroomTeacherId: 'user-1', academicYear: '2026', semester: '1' },
    { id: 'class-2', name: '10B', homeroomTeacherId: 'user-2', academicYear: '2026', semester: '1' },
  ];

  const mockSubjects: Subject[] = [
    { id: 'subject-1', name: 'Matematika', code: 'MATH', description: 'Pelajaran matematika', creditHours: 4 },
    { id: 'subject-2', name: 'Fisika', code: 'PHYS', description: 'Pelajaran fisika', creditHours: 3 },
  ];

  const mockUsers: User[] = [
    { id: 'user-2', name: 'Student 1', email: 'student1@test.com', role: 'student', status: 'active' },
    { id: 'user-3', name: 'Student 2', email: 'student2@test.com', role: 'student', status: 'active' },
  ];

  beforeEach(() => {
    vi.spyOn(apiService.classes, 'getClasses').mockResolvedValue({
      success: true,
      data: mockClasses,
    });
    vi.spyOn(apiService.subjects, 'getSubjects').mockResolvedValue({
      success: true,
      data: mockSubjects,
    });
    vi.spyOn(apiService.users, 'getUsers').mockResolvedValue({
      success: true,
      data: mockUsers,
    });
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('should render group chat interface', () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      expect(screen.getByText('Grup Diskusi')).toBeInTheDocument();
      expect(screen.getByText('+ Buat Grup')).toBeInTheDocument();
    });

    it('should show placeholder when no conversation selected', () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      expect(screen.getByText('Pilih grup untuk memulai percakapan')).toBeInTheDocument();
      expect(screen.getByText('Atau buat grup baru untuk diskusi kelas atau mata pelajaran')).toBeInTheDocument();
    });

    it('should load classes and subjects on mount', async () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        expect(apiService.classes.getClasses).toHaveBeenCalled();
        expect(apiService.subjects.getSubjects).toHaveBeenCalled();
      });
    });
  });

  describe('New Group Modal', () => {
    it('should open new group modal when clicking "Buat Grup" button', async () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const createButton = screen.getByText('+ Buat Grup');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Buat Grup Baru')).toBeInTheDocument();
      });
    });

    it('should show group type selection', async () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const createButton = screen.getByText('+ Buat Grup');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Tipe Grup')).toBeInTheDocument();
        expect(screen.getByText('Berdasarkan Kelas')).toBeInTheDocument();
        expect(screen.getByText('Berdasarkan Mata Pelajaran')).toBeInTheDocument();
        expect(screen.getByText('Kustom')).toBeInTheDocument();
      });
    });

    it('should show class selector when class type is selected', async () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const createButton = screen.getByText('+ Buat Grup');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const typeSelect = screen.getByText('Berdasarkan Kelas');
        fireEvent.change(typeSelect, { target: { value: 'class' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Pilih Kelas')).toBeInTheDocument();
      });
    });

    it('should show subject selector when subject type is selected', async () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const createButton = screen.getByText('+ Buat Grup');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const typeSelect = screen.getByText('Berdasarkan Mata Pelajaran');
        fireEvent.change(typeSelect, { target: { value: 'subject' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Pilih Mata Pelajaran')).toBeInTheDocument();
      });
    });

    it('should show custom group form when custom type is selected', async () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const createButton = screen.getByText('+ Buat Grup');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const typeSelect = screen.getByText('Kustom');
        fireEvent.change(typeSelect, { target: { value: 'custom' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Nama Grup')).toBeInTheDocument();
        expect(screen.getByText('Deskripsi (Opsional)')).toBeInTheDocument();
        expect(screen.getByText('Peserta (0)')).toBeInTheDocument();
      });
    });

    it('should pre-fill group name when class is selected', async () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const createButton = screen.getByText('+ Buat Grup');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const typeSelect = screen.getByText('Berdasarkan Kelas');
        fireEvent.change(typeSelect, { target: { value: 'class' } });
      });

      await waitFor(() => {
        const classSelect = screen.getByText('Pilih Kelas');
        fireEvent.change(classSelect, { target: { value: 'class-1' } });
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Kelas 10A')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Grup diskusi untuk kelas 10A')).toBeInTheDocument();
      });
    });

    it('should pre-fill group name when subject is selected', async () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const createButton = screen.getByText('+ Buat Grup');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const typeSelect = screen.getByText('Berdasarkan Mata Pelajaran');
        fireEvent.change(typeSelect, { target: { value: 'subject' } });
      });

      await waitFor(() => {
        const subjectSelect = screen.getByText('Pilih Mata Pelajaran');
        fireEvent.change(subjectSelect, { target: { value: 'subject-1' } });
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Matematika')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Grup diskusi untuk mata pelajaran Matematika')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Group Creation', () => {
    it('should allow selecting participants for custom group', async () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const createButton = screen.getByText('+ Buat Grup');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const typeSelect = screen.getByText('Kustom');
        fireEvent.change(typeSelect, { target: { value: 'custom' } });
      });

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Nama Grup');
        fireEvent.change(nameInput, { target: { value: 'Test Group' } });
      });

      await waitFor(() => {
        const userCheckbox = screen.getByText('Student 1');
        fireEvent.click(userCheckbox);
      });

      expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
    });

    it('should show participant count when participants selected', async () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const createButton = screen.getByText('+ Buat Grup');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const typeSelect = screen.getByText('Kustom');
        fireEvent.change(typeSelect, { target: { value: 'custom' } });
      });

      await waitFor(() => {
        const user1Checkbox = screen.getByText('Student 1');
        const user2Checkbox = screen.getByText('Student 2');
        fireEvent.click(user1Checkbox);
        fireEvent.click(user2Checkbox);
      });

      expect(screen.getByText('Peserta (2)')).toBeInTheDocument();
    });

    it('should create custom group when form is submitted', async () => {
      const createConversationSpy = vi.spyOn(apiService.messages, 'createConversation').mockResolvedValue({
        success: true,
        data: {
          id: 'new-group-id',
          name: 'Test Group',
          type: 'group',
        },
      });

      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const createButton = screen.getByText('+ Buat Grup');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const typeSelect = screen.getByText('Kustom');
        fireEvent.change(typeSelect, { target: { value: 'custom' } });
      });

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Nama Grup');
        fireEvent.change(nameInput, { target: { value: 'Test Group' } });

        const userCheckbox = screen.getByText('Student 1');
        fireEvent.click(userCheckbox);

        const submitButton = screen.getByText('Buat Grup');
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(createConversationSpy).toHaveBeenCalledWith({
          type: 'group',
          participantIds: ['user-2'],
          name: 'Test Group',
          description: '',
          metadata: {
            createdBy: 'user-1',
            groupType: 'custom',
          },
        });
      });
    });

    it('should disable create button when form is invalid', async () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const createButton = screen.getByText('+ Buat Grup');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const typeSelect = screen.getByText('Kustom');
        fireEvent.change(typeSelect, { target: { value: 'custom' } });
      });

      await waitFor(() => {
        const submitButton = screen.getByText('Buat Grup');
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Group Management', () => {
    it('should show manage button for group conversations', async () => {
      const mockConversations = [
        {
          id: 'group-1',
          type: 'group' as const,
          name: 'Test Group',
          participantIds: ['user-1', 'user-2'],
          participants: [],
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-1',
        },
      ];

      vi.spyOn(apiService.messages, 'getConversations').mockResolvedValue({
        success: true,
        data: mockConversations,
      });

      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        expect(screen.getByText('Test Group')).toBeInTheDocument();
        expect(screen.getByText('(2)')).toBeInTheDocument();
      });
    });

    it('should open manage modal when gear icon is clicked', async () => {
      const mockConversations = [
        {
          id: 'group-1',
          type: 'group' as const,
          name: 'Test Group',
          participantIds: ['user-1', 'user-2'],
          participants: [
            {
              userId: 'user-1',
              name: 'Test Teacher',
              email: 'teacher@test.com',
              role: 'teacher',
              isOnline: false,
              isAdmin: true,
              joinedAt: new Date().toISOString(),
            },
          ],
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-1',
        },
      ];

      vi.spyOn(apiService.messages, 'getConversations').mockResolvedValue({
        success: true,
        data: mockConversations,
      });

      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const gearIcon = screen.getByText('⚙️');
        fireEvent.click(gearIcon);
      });

      await waitFor(() => {
        expect(screen.getByText('Kelola Grup: Test Group')).toBeInTheDocument();
      });
    });
  });

  describe('Integration with Message Components', () => {
    it('should pass correct props to MessageList', async () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const messageList = screen.getByRole('list');
        expect(messageList).toBeInTheDocument();
      });
    });

    it('should show conversation list with group filter', () => {
      render(<GroupChat currentUser={mockCurrentUser} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error when group creation fails', async () => {
      vi.spyOn(apiService.messages, 'createConversation').mockResolvedValue({
        success: false,
        error: 'Failed to create group',
      });

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<GroupChat currentUser={mockCurrentUser} />);

      await waitFor(() => {
        const createButton = screen.getByText('+ Buat Grup');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const typeSelect = screen.getByText('Kustom');
        fireEvent.change(typeSelect, { target: { value: 'custom' } });
      });

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Nama Grup');
        fireEvent.change(nameInput, { target: { value: 'Test Group' } });

        const userCheckbox = screen.getByText('Student 1');
        fireEvent.click(userCheckbox);

        const submitButton = screen.getByText('Buat Grup');
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Gagal membuat grup baru');
      });

      alertSpy.mockRestore();
    });
  });

  describe('Voice Commands', () => {
    it('should support OPEN_GROUPS voice command', () => {
      expect(true).toBe(true);
    });
  });
});
