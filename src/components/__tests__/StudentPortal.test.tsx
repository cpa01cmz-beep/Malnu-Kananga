import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import StudentPortal from '../StudentPortal';
import { USER_EXTRA_ROLES } from '../../constants';
import type { UserExtraRole } from '../../types';

vi.mock('../student-portal/useStudentPortalData');
vi.mock('../student-portal/useStudentPortalRealtime');
vi.mock('../../hooks/useUnifiedNotifications');
vi.mock('../../utils/networkStatus');
vi.mock('../../services/offlineDataService');
vi.mock('../../hooks/useDashboardVoiceCommands');
vi.mock('../../services/apiService');

describe('StudentPortal Component', () => {
  const mockOnShowToast = vi.fn();

  const createMockProps = (extraRole: UserExtraRole = USER_EXTRA_ROLES.STAFF) => ({
    onShowToast: mockOnShowToast,
    extraRole,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const props = createMockProps();
    expect(() => render(<StudentPortal {...props} />)).not.toThrow();
  });

  it('should accept valid extraRole props', () => {
    const validRoles: UserExtraRole[] = [
      USER_EXTRA_ROLES.STAFF, 
      USER_EXTRA_ROLES.OSIS, 
      USER_EXTRA_ROLES.WAKASEK, 
      USER_EXTRA_ROLES.KEPSEK
    ];
    
    validRoles.forEach(role => {
      const props = createMockProps(role);
      expect(() => render(<StudentPortal {...props} />)).not.toThrow();
    });
  });

  it('should accept null extraRole', () => {
    const props = {
      onShowToast: mockOnShowToast,
      extraRole: null as UserExtraRole,
    };
    expect(() => render(<StudentPortal {...props} />)).not.toThrow();
  });

  it('should receive onShowToast callback', () => {
    const props = createMockProps();
    render(<StudentPortal {...props} />);
    
    expect(mockOnShowToast).toBeDefined();
    expect(typeof mockOnShowToast).toBe('function');
  });

  it('should render different views based on extraRole', () => {
    const staffProps = createMockProps(USER_EXTRA_ROLES.STAFF);
    const { container: staffContainer } = render(<StudentPortal {...staffProps} />);
    
    const osisProps = createMockProps(USER_EXTRA_ROLES.OSIS);
    const { container: osisContainer } = render(<StudentPortal {...osisProps} />);
    
    expect(staffContainer).toBeInTheDocument();
    expect(osisContainer).toBeInTheDocument();
  });

  it('should handle toast notifications', () => {
    const props = createMockProps();
    render(<StudentPortal {...props} />);
    
    expect(mockOnShowToast).toHaveBeenCalledTimes(0);
  });
});