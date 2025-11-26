import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'student',
};

describe('Header Component', () => {
  const mockOnLogin = jest.fn();
  const mockOnLogout = jest.fn();
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders header with navigation', () => {
    render(
      <Header
        user={null}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByText(/ma malnu kananga/i)).toBeInTheDocument();
    expect(screen.getByText(/beranda/i)).toBeInTheDocument();
    expect(screen.getByText(/tentang/i)).toBeInTheDocument();
  });

  test('shows login button when user is not authenticated', () => {
    render(
      <Header
        user={null}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument();
  });

  test('shows user menu when authenticated', () => {
    render(
      <Header
        user={mockUser}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /keluar/i })).toBeInTheDocument();
  });

  test('handles navigation clicks', async () => {
    const user = userEvent.setup();
    
    render(
      <Header
        user={null}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onNavigate={mockOnNavigate}
      />
    );

    const aboutLink = screen.getByText(/tentang/i);
    await user.click(aboutLink);

    expect(mockOnNavigate).toHaveBeenCalledWith('/about');
  });

  test('handles login click', async () => {
    const user = userEvent.setup();
    
    render(
      <Header
        user={null}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onNavigate={mockOnNavigate}
      />
    );

    const loginButton = screen.getByRole('button', { name: /masuk/i });
    await user.click(loginButton);

    expect(mockOnLogin).toHaveBeenCalled();
  });

  test('handles logout click', async () => {
    const user = userEvent.setup();
    
    render(
      <Header
        user={mockUser}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onNavigate={mockOnNavigate}
      />
    );

    const logoutButton = screen.getByRole('button', { name: /keluar/i });
    await user.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalled();
  });

  test('shows mobile menu on small screens', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(
      <Header
        user={null}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onNavigate={mockOnNavigate}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  test('toggles mobile menu', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(
      <Header
        user={null}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onNavigate={mockOnNavigate}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    expect(screen.getByText(/beranda/i)).toBeVisible();
  });

  test('shows notification bell for authenticated users', () => {
    render(
      <Header
        user={mockUser}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onNavigate={mockOnNavigate}
        notificationCount={3}
      />
    );

    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('handles search functionality', async () => {
    const user = userEvent.setup();
    const mockOnSearch = jest.fn();
    
    render(
      <Header
        user={null}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onNavigate={mockOnNavigate}
        onSearch={mockOnSearch}
      />
    );

    const searchInput = screen.getByPlaceholderText(/cari/i);
    await user.type(searchInput, 'test query');

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  test('displays user avatar when available', () => {
    const userWithAvatar = {
      ...mockUser,
      avatar: 'https://example.com/avatar.jpg',
    };

    render(
      <Header
        user={userWithAvatar}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onNavigate={mockOnNavigate}
      />
    );

    const avatar = screen.getByRole('img', { name: /test user/i });
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  test('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <Header
        user={null}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onNavigate={mockOnNavigate}
      />
    );

    await user.tab();
    expect(screen.getByText(/beranda/i)).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(mockOnNavigate).toHaveBeenCalledWith('/');
  });
});