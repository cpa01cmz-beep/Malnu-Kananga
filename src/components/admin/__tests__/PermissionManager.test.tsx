import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import PermissionManager from '../PermissionManager';

describe('PermissionManager', () => {
  const mockOnShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders permission management system with tabs', () => {
    render(<PermissionManager onShowToast={mockOnShowToast} />);

    expect(screen.getByText('Permission Management System')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'User Permissions' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Role Matrix' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Audit Logs' })).toBeInTheDocument();
  });

  it('displays user role dropdown with options', () => {
    render(<PermissionManager onShowToast={mockOnShowToast} />);

    const userRoleSelect = screen.getByLabelText('User Role');
    expect(userRoleSelect).toBeInTheDocument();
    expect(within(userRoleSelect).getByText('Administrator')).toBeInTheDocument();
    expect(within(userRoleSelect).getByText('Teacher')).toBeInTheDocument();
    expect(within(userRoleSelect).getByText('Student')).toBeInTheDocument();
    expect(within(userRoleSelect).getByText('Parent')).toBeInTheDocument();
  });

  it('displays extra role dropdown with options', () => {
    render(<PermissionManager onShowToast={mockOnShowToast} />);

    const extraRoleSelect = screen.getByLabelText('Extra Role');
    expect(extraRoleSelect).toBeInTheDocument();
    expect(within(extraRoleSelect).getByText('None')).toBeInTheDocument();
    expect(within(extraRoleSelect).getByText('Staff')).toBeInTheDocument();
    expect(within(extraRoleSelect).getByText('OSIS')).toBeInTheDocument();
  });

  it('calls validate function when validate button is clicked', async () => {
    render(<PermissionManager onShowToast={mockOnShowToast} />);

    const validateButton = screen.getByRole('button', { name: 'Validate' });
    await userEvent.click(validateButton);

    expect(mockOnShowToast).toHaveBeenCalledWith('Role combination is valid', 'success');
  });

  it('calls export function when export button is clicked', async () => {
    render(<PermissionManager onShowToast={mockOnShowToast} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    await userEvent.click(exportButton);

    expect(mockOnShowToast).toHaveBeenCalledWith('Permission matrix exported', 'success');
  });

  it('displays role-permission matrix table when matrix tab is active', async () => {
    render(<PermissionManager onShowToast={mockOnShowToast} />);

    const matrixTab = screen.getByRole('tab', { name: 'Role Matrix' });
    await userEvent.click(matrixTab);

    expect(screen.getByText('Role-Permission Matrix')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('displays audit logs when audit tab is active', async () => {
    render(<PermissionManager onShowToast={mockOnShowToast} />);

    const auditTab = screen.getByRole('tab', { name: 'Audit Logs' });
    await userEvent.click(auditTab);

    expect(screen.getByText('Recent Audit Logs (Last 24 hours)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('displays granted permissions with success badges', () => {
    render(<PermissionManager onShowToast={mockOnShowToast} />);

    const grantedBadges = screen.getAllByText('granted');
    expect(grantedBadges.length).toBeGreaterThan(0);
  });

  it('displays denied permissions with error badges', () => {
    render(<PermissionManager onShowToast={mockOnShowToast} />);

    const allBadges = screen.getAllByText((content) => content === 'granted' || content === 'denied');
    expect(allBadges.length).toBeGreaterThan(0);
  });

  it('shows empty audit logs message when no logs exist', async () => {
    render(<PermissionManager onShowToast={mockOnShowToast} />);

    const auditTab = screen.getByRole('tab', { name: 'Audit Logs' });
    await userEvent.click(auditTab);

    expect(screen.getByText((content) => content.includes('No audit logs found'))).toBeInTheDocument();
  });

  it('has proper keyboard navigation for tabs', async () => {
    render(<PermissionManager onShowToast={mockOnShowToast} />);

    const permissionsTab = screen.getByRole('tab', { name: 'User Permissions' });
    permissionsTab.focus();

    await userEvent.keyboard('{ArrowRight}');

    const matrixTab = screen.getByRole('tab', { name: 'Role Matrix' });
    expect(matrixTab).toHaveFocus();
  });
});
