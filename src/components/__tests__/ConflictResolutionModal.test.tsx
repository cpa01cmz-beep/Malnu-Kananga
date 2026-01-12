import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConflictResolutionModal, ConflictListModal } from '../ConflictResolutionModal';
import * as offlineActionQueueService from '../../services/offlineActionQueueService';

vi.mock('../../services/offlineActionQueueService');

describe('ConflictResolutionModal', () => {
  const mockResolveConflict = vi.fn();
  const mockOnClose = vi.fn();

  const mockConflict = {
    id: 'test-conflict-1',
    type: 'update' as const,
    entity: 'user' as const,
    entityId: 'user-123',
    endpoint: '/api/users/123',
    timestamp: new Date('2024-01-15T10:30:00').getTime(),
    data: {
      name: 'John Doe',
      grade: '10',
      section: 'A'
    },
    status: 'conflict' as const,
    retryCount: 1,
    lastError: '409 Conflict: Data already modified',
    method: 'PUT' as const
  };

  const mockServerData = {
    name: 'John Smith',
    grade: '10',
    section: 'B'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (offlineActionQueueService.useOfflineActionQueue as any).mockReturnValue({
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

    it('should have aria-describedby linking to local and server data values', async () => {
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
        expect(nameInput).toHaveAttribute('aria-describedby');
        const describedBy = nameInput.getAttribute('aria-describedby');
        expect(describedBy).toContain('merge-name-local');
        expect(describedBy).toContain('merge-name-server');
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
      expect(screen.getByText(/update user/i)).toBeInTheDocument();
      expect(screen.getByText(/\/api\/users\/123/i)).toBeInTheDocument();
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

    it('should show merge editor when merge is selected', async () => {
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

      expect(screen.getByRole('heading', { name: /your local changes/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /server data/i })).toBeInTheDocument();

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
        type: 'create' as const,
        entity: 'assignment' as const,
        entityId: 'assignment-456',
        endpoint: '/api/assignments',
        timestamp: new Date('2024-01-15T11:00:00').getTime(),
        data: { title: 'New Assignment' },
        status: 'conflict' as const,
        retryCount: 0,
        lastError: '409 Conflict: Assignment already exists',
        method: 'POST' as const
      }
    ];

    it('should display list of conflicts', () => {
      render(
        <ConflictListModal
          conflicts={mockConflicts}
          isOpen={true}
          onClose={mockOnClose}
          onConflictSelect={vi.fn()}
        />
      );

      expect(screen.getByText(/⚠️ 2 sync conflicts/i)).toBeInTheDocument();
      const conflictButtons = screen.getAllByRole('listitem');
      expect(conflictButtons).toHaveLength(2);
    });

    it('should have proper ARIA attributes for list', () => {
      render(
        <ConflictListModal
          conflicts={mockConflicts}
          isOpen={true}
          onClose={mockOnClose}
          onConflictSelect={vi.fn()}
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
          onConflictSelect={vi.fn()}
        />
      );

      const conflictButtons = screen.getAllByRole('listitem');
      expect(conflictButtons).toHaveLength(2);
      expect(conflictButtons[0]).toHaveAttribute('aria-label', 'View conflict 1: update user');
      expect(conflictButtons[1]).toHaveAttribute('aria-label', 'View conflict 2: create assignment');
    });

    it('should call onConflictSelect when conflict is clicked', () => {
      const mockOnConflictSelect = vi.fn();
      render(
        <ConflictListModal
          conflicts={mockConflicts}
          isOpen={true}
          onClose={mockOnClose}
          onConflictSelect={mockOnConflictSelect}
        />
      );

      const conflictButtons = screen.getAllByRole('listitem');
      fireEvent.click(conflictButtons[0]);

      expect(mockOnConflictSelect).toHaveBeenCalledWith(mockConflicts[0]);
    });

    it('should not render when isOpen is false', () => {
      const { container } = render(
        <ConflictListModal
          conflicts={mockConflicts}
          isOpen={false}
          onClose={mockOnClose}
          onConflictSelect={vi.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
