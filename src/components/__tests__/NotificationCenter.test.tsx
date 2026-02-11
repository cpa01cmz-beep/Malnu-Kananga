import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import NotificationCenter from '../NotificationCenter';
import { usePushNotifications } from '../../hooks/useUnifiedNotifications';
import { NotificationTemplateService } from '../../services/notificationTemplates';
import { USER_ROLES } from '../../constants';
import type { UserRole, NotificationHistoryItem, NotificationType } from '../../types';

vi.mock('../../hooks/useUnifiedNotifications');
vi.mock('../../services/notificationTemplates');

const mockUsePushNotifications = vi.mocked(usePushNotifications);
const mockNotificationTemplateService = vi.mocked(NotificationTemplateService);

describe('NotificationCenter Component', () => {
  const mockOnNotificationClick = vi.fn();
  const mockOnShowToast = vi.fn();

  const createMockProps = (userRole: UserRole = USER_ROLES.STUDENT) => ({
    userRole,
    onNotificationClick: mockOnNotificationClick,
    onShowToast: mockOnShowToast,
  });

  const mockNotification: NotificationHistoryItem = {
    id: '1',
    notification: {
      id: 'notif-1',
      title: 'Test Notification',
      body: 'This is a test notification',
      type: 'assignment' as NotificationType,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal',
    },
    clicked: false,
    dismissed: false,
    deliveredAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUsePushNotifications.mockReturnValue({
      history: [mockNotification],
      permissionGranted: true,
      permissionDenied: false,
      markAsRead: vi.fn(),
      clearHistory: vi.fn(),
      createNotification: vi.fn(),
      showNotification: vi.fn(),
      isInitialized: true,
      settings: {
        enabled: true,
        sound: true,
        vibration: true,
        desktop: true,
      },
      historySlice: [],
      updateSettings: vi.fn(),
      clearHistorySlice: vi.fn(),
      useOCRValidationMonitor: vi.fn(),
    } as any);

    mockNotificationTemplateService.getRelevantNotificationTypes = vi.fn().mockReturnValue([
      'assignment',
      'grade',
      'attendance',
    ] as NotificationType[]);
  });

  it('should render without crashing', () => {
    const props = createMockProps();
    expect(() => render(<NotificationCenter {...props} />)).not.toThrow();
  });

  it('should display notification bell icon', () => {
    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('should open notification panel when bell is clicked', async () => {
    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    });
  });

  it('should display notifications when panel is open', async () => {
    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
      expect(screen.getByText('This is a test notification')).toBeInTheDocument();
    });
  });

  it('should filter notifications by type', async () => {
    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      const typeFilter = screen.getByText(/assignment/i);
      fireEvent.click(typeFilter);
    });
  });

  it('should filter notifications by status', async () => {
    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      const unreadFilter = screen.getByText(/unread/i);
      fireEvent.click(unreadFilter);
    });
  });

  it('should search notifications', async () => {
    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search notifications/i);
      fireEvent.change(searchInput, { target: { value: 'Test' } });
    });
  });

  it('should mark notification as read when clicked', async () => {
    const mockMarkAsRead = vi.fn();
    mockUsePushNotifications.mockReturnValue({
      ...mockUsePushNotifications(),
      markAsRead: mockMarkAsRead,
    });

    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      const notificationItem = screen.getByText('Test Notification');
      fireEvent.click(notificationItem);
    });

    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('should call onNotificationClick when notification is clicked', async () => {
    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      const notificationItem = screen.getByText('Test Notification');
      fireEvent.click(notificationItem);
    });

    expect(mockOnNotificationClick).toHaveBeenCalledWith(mockNotification);
  });

  it('should clear all notifications when clear button is clicked', async () => {
    const mockClearHistory = vi.fn();
    mockUsePushNotifications.mockReturnValue({
      ...mockUsePushNotifications(),
      clearHistory: mockClearHistory,
    });

    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      const clearButton = screen.getByText(/clear all/i);
      fireEvent.click(clearButton);
    });

    expect(mockClearHistory).toHaveBeenCalled();
  });

  it('should show empty state when no notifications', async () => {
    mockUsePushNotifications.mockReturnValue({
      ...mockUsePushNotifications(),
      history: [],
    });

    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
    });
  });

  it('should display permission denied state when notifications are disabled', () => {
    mockUsePushNotifications.mockReturnValue({
      ...mockUsePushNotifications(),
      permissionGranted: false,
      permissionDenied: true,
    });

    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    expect(screen.getByText(/enable notifications/i)).toBeInTheDocument();
  });

  it('should show different notification types based on user role', () => {
    mockNotificationTemplateService.getRelevantNotificationTypes = vi.fn().mockReturnValue([
      'grade',
      'attendance',
    ] as NotificationType[]);

    const props = createMockProps(USER_ROLES.TEACHER);
    render(<NotificationCenter {...props} />);
    
    expect(mockNotificationTemplateService.getRelevantNotificationTypes).toHaveBeenCalledWith(USER_ROLES.TEACHER);
  });

  it('should handle keyboard navigation', async () => {
    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    
    fireEvent.keyDown(bellButton, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    });
  });

  it('should close panel when escape key is pressed', async () => {
    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByText(/notifications/i)).not.toBeInTheDocument();
    });
  });

  it('should display notification timestamp', async () => {
    const props = createMockProps();
    render(<NotificationCenter {...props} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText(/test notification/i)).toBeInTheDocument();
    });
  });
});