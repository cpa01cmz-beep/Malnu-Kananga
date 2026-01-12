import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConflictResolutionModal, ConflictListModal } from '../ConflictResolutionModal';
import * as offlineActionQueueService from '../../services/offlineActionQueueService';

jest.mock('../../services/offlineActionQueueService');

describe('ConflictResolutionModal', () => {
  const mockResolveConflict = jest.fn();
  const mockOnClose = jest.fn();

  const mockConflict = {
    id: 'test-conflict-1',
    type: 'UPDATE' as const,
    entity: 'student',
    endpoint: '/api/students/123',
    timestamp: new Date('2024-01-15T10:30:00').getTime(),
    data: {
      name: 'John Doe',
      grade: '10',
      section: 'A'
    },
    lastError: '409 Conflict: Data already modified'
  };

  const mockServerData = {
    name: 'John Smith',
    grade: '10',
    section: 'B'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (offlineActionQueueService.useOfflineActionQueue as jest.Mock).mockReturnValue({
      resolveConflict: mockResolveConflict
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on modal', () => {
      render(
        <ConflictResolutionModal
          conflict={mockConflict}
          serverData={mockServerData}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have proper label-input associations for merge editor', async () => {
      render(
        <ConflictResolutionModal
          conflict={mockConflict}
          serverData={mockServerData}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByLabelText(/merge changes/i));

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/merge value for name/i);
        expect(nameInput).toBeInTheDocument();
        expect(nameInput).toHaveAttribute('type', 'text');
      });
    });

    it('should have descriptive aria-labels for merge editor inputs', async () => {
      render(
        <ConflictResolutionModal
          conflict={mockConflict}
          serverData={mockServerData}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByLabelText(/merge changes/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/merge value for name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/merge value for grade/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/merge value for section/i)).toBeInTheDocument();
      });
    });

    it('should have proper keyboard navigation for radio buttons', () => {
      render(
        <ConflictResolutionModal
          conflict={mockConflict}
          serverData={mockServerData}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const keepLocalRadio = screen.getByLabelText(/keep my version/i);
      const useServerRadio = screen.getByLabelText(/use server version/i);
      const mergeRadio = screen.getByLabelText(/merge changes/i);

      expect(keepLocalRadio).toBeChecked();

      fireEvent.click(useServerRadio);
      expect(useServerRadio).toBeChecked();

      fireEvent.click(mergeRadio);
      expect(mergeRadio).toBeChecked();
    });

    it('should have aria-describedby for radio button descriptions', () => {
      render(
        <ConflictResolutionModal
          conflict={mockConflict}
          serverData={mockServerData}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const keepLocalRadio = screen.getByLabelText(/keep my version/i);
      expect(keepLocalRadio).toHaveAttribute('aria-describedby', 'keep_local_desc');

      const useServerRadio = screen.getByLabelText(/use server version/i);
      expect(useServerRadio).toHaveAttribute('aria-describedby', 'use_server_desc');

      const mergeRadio = screen.getByLabelText(/merge changes/i);
      expect(mergeRadio).toHaveAttribute('aria-describedby', 'merge_desc');
    });

    it('should have role="region" for merge editor with aria-label', async () => {
      render(
        <ConflictResolutionModal
          conflict={mockConflict}
          serverData={mockServerData}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByLabelText(/merge changes/i));

      await waitFor(() => {
        const mergeRegion = screen.getByRole('region', { name: /merge data editor/i });
        expect(mergeRegion).toBeInTheDocument();
      });
    });
  });

  describe('Conflict Resolution', () => {
    it('should display conflict details correctly', () => {
      render(
        <ConflictResolutionModal
          conflict={mockConflict}
          serverData={mockServerData}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/⚠️ sync conflict detected/i)).toBeInTheDocument();
      expect(screen.getByText(/update student/i)).toBeInTheDocument();
      expect(screen.getByText(/\/api\/students\/123/i)).toBeInTheDocument();
      expect(screen.getByText(/409 conflict: data already modified/i)).toBeInTheDocument();
    });

    it('should allow selecting keep local resolution', () => {
      render(
        <ConflictResolutionModal
          conflict={mockConflict}
          serverData={mockServerData}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText(/resolve conflict/i));

      expect(mockResolveConflict).toHaveBeenCalledWith({
        actionId: 'test-conflict-1',
        resolution: 'keep_local'
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should allow selecting use server resolution', () => {
      render(
        <ConflictResolutionModal
          conflict={mockConflict}
          serverData={mockServerData}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByLabelText(/use server version/i));
      fireEvent.click(screen.getByText(/resolve conflict/i));

      expect(mockResolveConflict).toHaveBeenCalledWith({
        actionId: 'test-conflict-1',
        resolution: 'use_server'
      });
    });

    it('should allow merging data and resolving', async () => {
      const user = userEvent.setup();
      render(
        <ConflictResolutionModal
          conflict={mockConflict}
          serverData={mockServerData}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByLabelText(/merge changes/i));

      await waitFor(() => {
        expect(screen.getByRole('region', { name: /merge data editor/i })).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/merge value for name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'John Merged');

      fireEvent.click(screen.getByText(/resolve conflict/i));

      await waitFor(() => {
        expect(mockResolveConflict).toHaveBeenCalledWith({
          actionId: 'test-conflict-1',
          resolution: 'merge',
          mergedData: {
            name: 'John Merged',
            grade: '10',
            section: 'A'
          }
        });
      });
    });

    it('should disable resolve button when merge is selected but no data', async () => {
      render(
        <ConflictResolutionModal
          conflict={mockConflict}
          serverData={mockServerData}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByLabelText(/merge changes/i));

      await waitFor(async () => {
        const resolveButton = screen.getByRole('button', { name: /resolve conflict/i });
        expect(resolveButton).toBeDisabled();
      });
    });

    it('should show loading state while resolving', async () => {
      mockResolveConflict.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <ConflictResolutionModal
          conflict={mockConflict}
          serverData={mockServerData}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText(/resolve conflict/i));

      expect(screen.getByText(/resolving\.\.\./i)).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should display local and server data', () => {
      render(
        <ConflictResolutionModal
          conflict={mockConflict}
          serverData={mockServerData}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/your local changes/i)).toBeInTheDocument();
      expect(screen.getByText(/server data/i)).toBeInTheDocument();

      const localData = screen.getByText(/"name": "john doe"/i);
      const serverDataElement = screen.getByText(/"name": "john smith"/i);

      expect(localData).toBeInTheDocument();
      expect(serverDataElement).toBeInTheDocument();
    });
  });

  describe('ConflictListModal', () => {
    const mockConflicts = [
      mockConflict,
      {
        id: 'test-conflict-2',
        type: 'CREATE' as const,
        entity: 'assignment',
        endpoint: '/api/assignments',
        timestamp: new Date('2024-01-15T11:00:00').getTime(),
        data: { title: 'New Assignment' },
        lastError: '409 Conflict: Assignment already exists'
      }
    ];

    it('should display list of conflicts', () => {
      render(
        <ConflictListModal
          conflicts={mockConflicts}
          isOpen={true}
          onClose={mockOnClose}
          onConflictSelect={jest.fn()}
        />
      );

      expect(screen.getByText(/⚠️ 2 sync conflicts/i)).toBeInTheDocument();
      expect(screen.getByText(/1\. update student/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. create assignment/i)).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for list', () => {
      render(
        <ConflictListModal
          conflicts={mockConflicts}
          isOpen={true}
          onClose={mockOnClose}
          onConflictSelect={jest.fn()}
        />
      );

      expect(screen.getByRole('list', { name: /list of sync conflicts/i })).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('should have accessible conflict buttons with aria-labels', () => {
      render(
        <ConflictListModal
          conflicts={mockConflicts}
          isOpen={true}
          onClose={mockOnClose}
          onConflictSelect={jest.fn()}
        />
      );

      const conflict1Button = screen.getByRole('button', { name: /view conflict 1: update student/i });
      const conflict2Button = screen.getByRole('button', { name: /view conflict 2: create assignment/i });

      expect(conflict1Button).toBeInTheDocument();
      expect(conflict2Button).toBeInTheDocument();
    });

    it('should call onConflictSelect when conflict is clicked', () => {
      const mockOnConflictSelect = jest.fn();
      render(
        <ConflictListModal
          conflicts={mockConflicts}
          isOpen={true}
          onClose={mockOnClose}
          onConflictSelect={mockOnConflictSelect}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /view conflict 1: update student/i }));

      expect(mockOnConflictSelect).toHaveBeenCalledWith(mockConflicts[0]);
    });

    it('should not render when isOpen is false', () => {
      const { container } = render(
        <ConflictListModal
          conflicts={mockConflicts}
          isOpen={false}
          onClose={mockOnClose}
          onConflictSelect={jest.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
