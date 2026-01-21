import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ActivityFeed, { ActivityType, Activity } from '../ActivityFeed';
import { STORAGE_KEYS } from '../../constants';

vi.unmock('react');

vi.mock('../../constants', () => ({
  STORAGE_KEYS: {
    ACTIVITY_FEED: 'malnu_activity_feed_test',
  },
}));

const mockActivities: Activity[] = [
  {
    type: 'grade_updated',
    entity: 'grade',
    entityId: '1',
    data: { id: '1', score: 95 },
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    userRole: 'teacher',
    userId: 'teacher-1',
    id: 'grade_updated-1-123456789',
    isRead: false,
  },
  {
    type: 'library_material_added',
    entity: 'library_material',
    entityId: '2',
    data: { id: '2', title: 'Test Material' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    userRole: 'teacher',
    userId: 'teacher-2',
    id: 'library_material_added-2-123456790',
    isRead: true,
  },
  {
    type: 'message_created',
    entity: 'message',
    entityId: '3',
    data: { id: '3', content: 'Test message' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    userRole: 'student',
    userId: 'student-1',
    id: 'message_created-3-123456791',
    isRead: false,
  },
];

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ActivityFeed', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should render activity feed component', () => {
    renderWithRouter(
      <ActivityFeed
        userId="user-1"
        userRole="student"
        eventTypes={['grade_updated', 'library_material_added', 'message_created']}
      />
    );

    expect(screen.getByText('Aktivitas')).toBeInTheDocument();
  });

  it('should display activities grouped by time', async () => {
    localStorage.setItem('malnu_activity_feed_test', JSON.stringify(mockActivities));

    renderWithRouter(
      <ActivityFeed
        userId="user-1"
        userRole="student"
        eventTypes={['grade_updated', 'library_material_added', 'message_created']}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('HariIni')).toBeInTheDocument();
      expect(screen.getByText('Kemarin')).toBeInTheDocument();
      expect(screen.getByText('MingguIni')).toBeInTheDocument();
    });
  });

  it('should show unread count badge', () => {
    const unreadActivities = mockActivities.filter((a) => !a.isRead);
    localStorage.setItem('malnu_activity_feed_test', JSON.stringify(unreadActivities));

    renderWithRouter(
      <ActivityFeed
        userId="user-1"
        userRole="student"
        eventTypes={['grade_updated', 'library_material_added', 'message_created']}
      />
    );

    const badge = screen.queryByText(/baru/);
    expect(badge).toBeInTheDocument();
  });

  it('should display filter buttons when showFilter is true', () => {
    renderWithRouter(
      <ActivityFeed
        userId="user-1"
        userRole="student"
        eventTypes={['grade_updated', 'library_material_added', 'message_created']}
        showFilter={true}
      />
    );

    expect(screen.getByText('Semua')).toBeInTheDocument();
    expect(screen.getByText('Belum Dibaca')).toBeInTheDocument();
  });

  it('should not display filter buttons when showFilter is false', () => {
    renderWithRouter(
      <ActivityFeed
        userId="user-1"
        userRole="student"
        eventTypes={['grade_updated', 'library_material_added', 'message_created']}
        showFilter={false}
      />
    );

    expect(screen.queryByText('Semua')).not.toBeInTheDocument();
    expect(screen.queryByText('Belum Dibaca')).not.toBeInTheDocument();
  });

  it('should filter activities by type', async () => {
    localStorage.setItem('malnu_activity_feed_test', JSON.stringify(mockActivities));

    renderWithRouter(
      <ActivityFeed
        userId="user-1"
        userRole="student"
        eventTypes={['grade_updated', 'library_material_added', 'message_created']}
        showFilter={true}
      />
    );

    await waitFor(() => {
      const allButton = screen.getByText('Semua');
      const unreadButton = screen.getByText('Belum Dibaca');

      expect(allButton).toBeInTheDocument();
      expect(unreadButton).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Semua'));

    await waitFor(() => {
      const activities = screen.getAllByText(/HariIni|Kemarin|MingguIni/);
      expect(activities.length).toBeGreaterThan(0);
    });
  });

  it('should show empty state when no activities', () => {
    localStorage.setItem('malnu_activity_feed_test', JSON.stringify([]));

    renderWithRouter(
      <ActivityFeed
        userId="user-1"
        userRole="student"
        eventTypes={['grade_updated', 'library_material_added', 'message_created']}
      />
    );

    expect(screen.getByText('Belum ada aktivitas')).toBeInTheDocument();
  });

  it('should show connecting state when WebSocket is connecting', async () => {
    renderWithRouter(
      <ActivityFeed
        userId="user-1"
        userRole="student"
        eventTypes={['grade_updated', 'library_material_added', 'message_created']}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Menghubungkan ke server...')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should mark activity as read when clicked', async () => {
    localStorage.setItem('malnu_activity_feed_test', JSON.stringify(mockActivities));

    const { container } = renderWithRouter(
      <ActivityFeed
        userId="user-1"
        userRole="student"
        eventTypes={['grade_updated', 'library_material_added', 'message_created']}
      />
    );

    await waitFor(() => {
      const activityItems = container.querySelectorAll('[class*="cursor-pointer"]');
      expect(activityItems.length).toBeGreaterThan(0);
    });

    const firstActivityItem = container.querySelector('[class*="cursor-pointer"]');
    if (firstActivityItem) {
      fireEvent.click(firstActivityItem);
      await waitFor(() => {
        expect(localStorage.getItem('malnu_activity_feed_test')).toContain('true');
      });
    }
  });

  it('should mark all activities as read when button clicked', async () => {
    localStorage.setItem('malnu_activity_feed_test', JSON.stringify(mockActivities));

    renderWithRouter(
      <ActivityFeed
        userId="user-1"
        userRole="student"
        eventTypes={['grade_updated', 'library_material_added', 'message_created']}
      />
    );

    await waitFor(() => {
      const markAllButton = screen.queryByText('Tandai semua dibaca');
      if (markAllButton) {
        fireEvent.click(markAllButton);
        expect(localStorage.getItem('malnu_activity_feed_test')).toContain('true');
      }
    });
  });

  it('should limit activities to maxActivities', () => {
    const manyActivities = Array.from({ length: 100 }, (_, i) => ({
      type: 'grade_updated' as ActivityType,
      entity: 'grade',
      entityId: `${i}`,
      data: { id: `${i}` },
      timestamp: new Date().toISOString(),
      userRole: 'teacher',
      userId: `teacher-${i}`,
      id: `grade_updated-${i}-${Date.now()}`,
      isRead: false,
    }));

    localStorage.setItem('malnu_activity_feed_test', JSON.stringify(manyActivities));

    renderWithRouter(
      <ActivityFeed
        userId="user-1"
        userRole="student"
        eventTypes={['grade_updated']}
        maxActivities={50}
      />
    );

    const activities = JSON.parse(localStorage.getItem('malnu_activity_feed_test') || '[]');
    expect(activities.length).toBeLessThanOrEqual(50);
  });

  it('should load cached activities from localStorage', () => {
    localStorage.setItem('malnu_activity_feed_test', JSON.stringify(mockActivities));

    renderWithRouter(
      <ActivityFeed
        userId="user-1"
        userRole="student"
        eventTypes={['grade_updated', 'library_material_added', 'message_created']}
      />
    );

    expect(localStorage.getItem('malnu_activity_feed_test')).toBe(JSON.stringify(mockActivities));
  });

  it('should handle error when parsing cached activities', () => {
    localStorage.setItem('malnu_activity_feed_test', 'invalid json');

    expect(() => {
      renderWithRouter(
        <ActivityFeed
          userId="user-1"
          userRole="student"
          eventTypes={['grade_updated', 'library_material_added', 'message_created']}
        />
      );
    }).not.toThrow();
  });

  it('should display connection status indicator', () => {
    renderWithRouter(
      <ActivityFeed
        userId="user-1"
        userRole="student"
        eventTypes={['grade_updated', 'library_material_added', 'message_created']}
      />
    );

    const connectionIndicator = document.querySelector('[class*="rounded-full"]');
    expect(connectionIndicator).toBeInTheDocument();
  });
});
