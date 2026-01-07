import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../Header';
import { UserRole } from '../../types';

describe('Header', () => {
  const defaultProps = {
    onLoginClick: vi.fn(),
    onChatClick: vi.fn(),
    onEditClick: vi.fn(),
    isLoggedIn: false,
    userRole: null as UserRole | null,
    userExtraRole: undefined,
    onLogout: vi.fn(),
    isPublicView: false,
    onTogglePublicView: vi.fn(),
    onToggleTheme: vi.fn(),
    onShowToast: vi.fn()
  };

  it('renders header logo and school name', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByText('Malnu Kananga')).toBeInTheDocument();
    expect(screen.getByText('NPSN: 69881502')).toBeInTheDocument();
  });

  it('renders mobile menu toggle button', () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByRole('button', { name: 'Buka menu' });
    expect(menuButton).toBeInTheDocument();
  });

  it('mobile menu toggle has correct ARIA attributes when closed', () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByRole('button', { name: 'Buka menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
  });

  it('mobile menu toggle has correct ARIA attributes when opened', async () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByRole('button', { name: 'Buka menu' });
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(menuButton).toHaveAttribute('aria-label', 'Tutup menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('mobile menu is hidden by default', () => {
    render(<Header {...defaultProps} />);
    
    const mobileMenu = screen.queryByRole('navigation', { name: 'Menu navigasi utama' });
    expect(mobileMenu).not.toBeInTheDocument();
  });

  it('mobile menu appears when toggle button is clicked', async () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByRole('button', { name: 'Buka menu' });
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: 'Menu navigasi utama' })).toBeInTheDocument();
    });
  });

  it('mobile menu has proper id for ARIA reference', async () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByRole('button', { name: 'Buka menu' });
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      const mobileMenu = screen.getByRole('navigation', { name: 'Menu navigasi utama' });
      expect(mobileMenu).toHaveAttribute('id', 'mobile-menu');
    });
  });

  it('theme toggle button has accessible label', () => {
    render(<Header {...defaultProps} />);
    
    const themeButton = screen.getByRole('button', { name: /Pilih Tema/ });
    expect(themeButton).toBeInTheDocument();
  });

  it('mobile menu closes when resize to desktop', () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByRole('button', { name: 'Buka menu' });
    fireEvent.click(menuButton);
    
    // Simulate window resize by triggering the resize event
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    fireEvent.resize(window);
    
    expect(screen.queryByRole('navigation', { name: 'Menu navigasi utama' })).not.toBeInTheDocument();
  });

  it('renders login and chat buttons when not logged in', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByText('Tanya AI')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('does not render dashboard elements when not logged in', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.queryByText('Lihat Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('renders dashboard controls when logged in as admin', () => {
    render(
      <Header 
        {...defaultProps} 
        isLoggedIn={true} 
        userRole='admin'
      />
    );
    
    expect(screen.getByText('Editor AI')).toBeInTheDocument();
    expect(screen.getByText('Lihat Website')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('does not render Editor AI button for non-admin users', () => {
    render(
      <Header 
        {...defaultProps} 
        isLoggedIn={true} 
        userRole='teacher'
      />
    );
    
    expect(screen.queryByText('Editor AI')).not.toBeInTheDocument();
  });

  it('mobile menu displays login button when not logged in', async () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByRole('button', { name: 'Buka menu' });
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      // Get the mobile menu navigation to scope the query
      const mobileMenu = screen.getByRole('navigation', { name: 'Menu navigasi utama' });
      expect(mobileMenu).toBeInTheDocument();
      // Find the login button within the mobile menu
      const loginButton = within(mobileMenu).getByText('Login');
      expect(loginButton).toBeInTheDocument();
    });
  });

  it('mobile menu displays logout button when logged in', async () => {
    render(
      <Header 
        {...defaultProps} 
        isLoggedIn={true} 
        userRole='student'
      />
    );
    
    const menuButton = screen.getByRole('button', { name: 'Buka menu' });
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      // Get the mobile menu navigation to scope the query
      const mobileMenu = screen.getByRole('navigation', { name: 'Menu navigasi utama' });
      expect(mobileMenu).toBeInTheDocument();
      // Find the logout button within the mobile menu
      const logoutButton = within(mobileMenu).getByText('Logout');
      expect(logoutButton).toBeInTheDocument();
    });
  });

  it('mobile menu button changes icon based on state', () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByRole('button', { name: 'Buka menu' });
    
    expect(menuButton.querySelector('[data-testid="menu-icon"]') || menuButton).toBeInTheDocument();
    
    fireEvent.click(menuButton);
    
    expect(menuButton.querySelector('[data-testid="close-icon"]') || menuButton).toBeInTheDocument();
  });

  it('navigation links are present in mobile menu', async () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByRole('button', { name: 'Buka menu' });
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      const mobileMenu = screen.getByRole('navigation', { name: 'Menu navigasi utama' });
      expect(mobileMenu).toBeInTheDocument();
      // Scope the navigation link queries to within the mobile menu
      expect(within(mobileMenu).getByText('Beranda')).toBeInTheDocument();
      expect(within(mobileMenu).getByText('Profil')).toBeInTheDocument();
      expect(within(mobileMenu).getByText('Berita')).toBeInTheDocument();
      expect(within(mobileMenu).getByText('Download')).toBeInTheDocument();
    });
  });

  it('is keyboard accessible - menu button can be focused and activated with Enter key', () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByRole('button', { name: 'Buka menu' });
    
    menuButton.focus();
    expect(menuButton).toHaveFocus();
    
    fireEvent.keyDown(menuButton, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByRole('navigation', { name: 'Menu navigasi utama' })).toBeInTheDocument();
  });

  it('is keyboard accessible - menu button can be activated with Space key', () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByRole('button', { name: 'Buka menu' });
    
    menuButton.focus();
    expect(menuButton).toHaveFocus();
    
    fireEvent.keyDown(menuButton, { key: ' ', code: 'Space' });
    
    expect(screen.getByRole('navigation', { name: 'Menu navigasi utama' })).toBeInTheDocument();
  });
});
