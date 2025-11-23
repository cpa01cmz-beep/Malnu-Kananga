import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
};

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders home page by default', () => {
    renderWithRouter();

    expect(screen.getByText(/ma malnu kananga/i)).toBeInTheDocument();
  });

  test('navigates to about page', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const aboutLink = screen.getByText(/tentang/i);
    await user.click(aboutLink);

    expect(screen.getByText(/tentang kami/i)).toBeInTheDocument();
  });

  test('navigates to student dashboard', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const dashboardLink = screen.getByText(/dashboard siswa/i);
    await user.click(dashboardLink);

    expect(screen.getByText(/dashboard siswa/i)).toBeInTheDocument();
  });

  test('navigates to parent dashboard', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const parentLink = screen.getByText(/dashboard orang tua/i);
    await user.click(parentLink);

    expect(screen.getByText(/dashboard orang tua/i)).toBeInTheDocument();
  });

  test('navigates to teacher dashboard', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const teacherLink = screen.getByText(/dashboard guru/i);
    await user.click(teacherLink);

    expect(screen.getByText(/dashboard guru/i)).toBeInTheDocument();
  });

  test('handles 404 routes', () => {
    renderWithRouter(['/non-existent-route']);

    expect(screen.getByText(/halaman tidak ditemukan/i)).toBeInTheDocument();
  });

  test('maintains scroll position on navigation', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    window.scrollTo = jest.fn();

    const aboutLink = screen.getByText(/tentang/i);
    await user.click(aboutLink);

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('handles browser back button', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const aboutLink = screen.getByText(/tentang/i);
    await user.click(aboutLink);

    expect(screen.getByText(/tentang kami/i)).toBeInTheDocument();

    await user.goBack();

    expect(screen.getByText(/ma malnu kananga/i)).toBeInTheDocument();
  });

  test('loads featured programs on home page', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/program unggulan/i)).toBeInTheDocument();
    });
  });

  test('loads latest news on home page', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/berita terbaru/i)).toBeInTheDocument();
    });
  });

  test('handles authentication state changes', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const loginButton = screen.getByText(/masuk/i);
    await user.click(loginButton);

    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  test('displays offline indicator when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    renderWithRouter();

    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });

  test('handles responsive design', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithRouter();

    const mobileMenu = screen.getByRole('button', { name: /menu/i });
    expect(mobileMenu).toBeInTheDocument();
  });

  test('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.tab();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('main')).toHaveFocus();
  });

  test('handles error boundaries gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    renderWithRouter();

    const errorButton = screen.getByText(/trigger error/i);
    await userEvent.click(errorButton);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('maintains theme preferences', () => {
    localStorage.setItem('theme', 'dark');

    renderWithRouter();

    expect(document.documentElement).toHaveClass('dark');
  });

  test('handles language switching', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const languageButton = screen.getByRole('button', { name: /language/i });
    await user.click(languageButton);

    const englishOption = screen.getByText('English');
    await user.click(englishOption);

    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  test('supports deep linking', () => {
    renderWithRouter(['/tentang']);

    expect(screen.getByText(/tentang kami/i)).toBeInTheDocument();
  });

  test('handles route parameters correctly', () => {
    renderWithRouter(['/program/1']);

    expect(screen.getByText(/program detail/i)).toBeInTheDocument();
  });

  test('maintains component state on navigation', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const searchInput = screen.getByPlaceholderText(/cari/i);
    await user.type(searchInput, 'test');

    const aboutLink = screen.getByText(/tentang/i);
    await user.click(aboutLink);

    const homeLink = screen.getByText(/beranda/i);
    await user.click(homeLink);

    expect(searchInput).toHaveValue('test');
  });
});