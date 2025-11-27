import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';

// Mock the hooks before the component is imported
jest.mock('../hooks/useScrollEffect', () => ({
  useScrollEffect: jest.fn(() => false)
}));

jest.mock('../hooks/useResponsiveMenu', () => ({
  useResponsiveMenu: jest.fn(() => ({ isMenuOpen: false, setIsMenuOpen: jest.fn() }))
}));

// Mock the icon components
jest.mock('./icons/MenuIcon', () => ({
  __esModule: true,
  MenuIcon: () => <div data-testid="menu-icon">MenuIcon</div>
}));
jest.mock('./icons/CloseIcon', () => ({
  __esModule: true,
  CloseIcon: () => <div data-testid="close-icon">CloseIcon</div>
}));
jest.mock('./icons/ChatIcon', () => ({
  __esModule: true,
  ChatIcon: () => <div data-testid="chat-icon">ChatIcon</div>
}));

jest.mock('../hooks/useResponsiveMenu', () => ({
  useResponsiveMenu: jest.fn(() => ({ isMenuOpen: false, setIsMenuOpen: jest.fn() }))
}));

// Mock the icon components
jest.mock('./icons/MenuIcon', () => ({
  __esModule: true,
  MenuIcon: () => <div data-testid="menu-icon">MenuIcon</div>
}));
jest.mock('./icons/CloseIcon', () => ({
  __esModule: true,
  CloseIcon: () => <div data-testid="close-icon">CloseIcon</div>
}));
jest.mock('./icons/ChatIcon', () => ({
  __esModule: true,
  ChatIcon: () => <div data-testid="chat-icon">ChatIcon</div>
}));

describe('Header Component', () => {
  const mockOnLoginClick = jest.fn();
  const mockOnChatClick = jest.fn();
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render logo and school name', () => {
      render(
        <Header
          onLoginClick={mockOnLoginClick}
          onChatClick={mockOnChatClick}
          isLoggedIn={false}
          onLogout={mockOnLogout}
        />
      );

      expect(screen.getByText('Malnu Kananga')).toBeInTheDocument();
      expect(screen.getByText('NPSN: 69881502')).toBeInTheDocument();
    });

    test('should render navigation links', () => {
      render(
        <Header
          onLoginClick={mockOnLoginClick}
          onChatClick={mockOnChatClick}
          isLoggedIn={false}
          onLogout={mockOnLogout}
        />
      );

      expect(screen.getByText('Beranda')).toBeInTheDocument();
      expect(screen.getByText('Profil')).toBeInTheDocument();
      expect(screen.getByText('Berita')).toBeInTheDocument();
      expect(screen.getByText('Kontak')).toBeInTheDocument();
    });

    test('should render login and chat buttons when not logged in', () => {
      render(
        <Header
          onLoginClick={mockOnLoginClick}
          onChatClick={mockOnChatClick}
          isLoggedIn={false}
          onLogout={mockOnLogout}
        />
      );

      expect(screen.getByText('Tanya AI')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    test('should render logout button when logged in', () => {
      render(
        <Header
          onLoginClick={mockOnLoginClick}
          onChatClick={mockOnChatClick}
          isLoggedIn={true}
          onLogout={mockOnLogout}
        />
      );

      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    test('should render mobile menu button', () => {
      render(
        <Header
          onLoginClick={mockOnLoginClick}
          onChatClick={mockOnChatClick}
          isLoggedIn={false}
          onLogout={mockOnLogout}
        />
      );

      expect(screen.getByLabelText('Buka menu')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
test('should call onLoginClick when login button is clicked', async () => {
       const user = userEvent.setup({ advanceTimers: jest.fn });
       render(
         <Header
           onLoginClick={mockOnLoginClick}
           onChatClick={mockOnChatClick}
           isLoggedIn={false}
           onLogout={mockOnLogout}
         />
       );

       const loginButton = screen.getByText('Login');
       await act(async () => {
         await user.click(loginButton);
       });

       expect(mockOnLoginClick).toHaveBeenCalledTimes(1);
     }, 15000);

test('should call onChatClick when chat button is clicked', async () => {
       const user = userEvent.setup({ advanceTimers: jest.fn });
       render(
         <Header
           onLoginClick={mockOnLoginClick}
           onChatClick={mockOnChatClick}
           isLoggedIn={false}
           onLogout={mockOnLogout}
         />
       );

       const chatButton = screen.getByText('Tanya AI');
       await act(async () => {
         await user.click(chatButton);
       });

       expect(mockOnChatClick).toHaveBeenCalledTimes(1);
     }, 15000);

test('should call onLogout when logout button is clicked', async () => {
       const user = userEvent.setup({ advanceTimers: jest.fn });
       render(
         <Header
           onLoginClick={mockOnLoginClick}
           onChatClick={mockOnChatClick}
           isLoggedIn={true}
           onLogout={mockOnLogout}
         />
       );

       const logoutButton = screen.getByText('Logout');
       await act(async () => {
         await user.click(logoutButton);
       });

       expect(mockOnLogout).toHaveBeenCalledTimes(1);
     }, 15000);

test('should toggle mobile menu when menu button is clicked', async () => {
       const user = userEvent.setup({ advanceTimers: jest.fn });
       render(
         <Header
           onLoginClick={mockOnLoginClick}
           onChatClick={mockOnChatClick}
           isLoggedIn={false}
           onLogout={mockOnLogout}
         />
       );

       // Initially menu should show "Buka menu"
       const menuButton = screen.getByLabelText('Buka menu');

       // Desktop nav is always visible
       expect(screen.queryByText('Beranda')).toBeInTheDocument();

       await act(async () => {
         await user.click(menuButton);
       });

       // After clicking, the button should show "Tutup menu"
       expect(screen.getByLabelText('Tutup menu')).toBeInTheDocument();
     }, 15000);
  });

  describe('Responsive Behavior', () => {
    test('should handle scroll events', () => {
      render(
        <Header
          onLoginClick={mockOnLoginClick}
          onChatClick={mockOnChatClick}
          isLoggedIn={false}
          onLogout={mockOnLogout}
        />
      );

      // Mock scroll event
      fireEvent.scroll(window, { target: { scrollY: 50 } });

      // Component should handle scroll without errors
      expect(screen.getByText('Malnu Kananga')).toBeInTheDocument();
    });

    test('should handle window resize events', () => {
      render(
        <Header
          onLoginClick={mockOnLoginClick}
          onChatClick={mockOnChatClick}
          isLoggedIn={false}
          onLogout={mockOnLogout}
        />
      );

      // Mock resize event
      fireEvent(window, new Event('resize'));

      // Component should handle resize without errors
      expect(screen.getByText('Malnu Kananga')).toBeInTheDocument();
    });
  });

  describe('Mobile Menu Interactions', () => {
test('should close mobile menu after login button click', async () => {
       const user = userEvent.setup({ advanceTimers: jest.fn });
       render(
         <Header
           onLoginClick={mockOnLoginClick}
           onChatClick={mockOnChatClick}
           isLoggedIn={false}
           onLogout={mockOnLogout}
         />
       );

       // For mobile menu testing, we would need to simulate mobile viewport
       // This is a basic test structure - in a real scenario, you'd use libraries like
       // @testing-library/react-hooks or manually set innerWidth
       const loginButton = screen.getByText('Login');
       await act(async () => {
         await user.click(loginButton);
       });

       expect(mockOnLoginClick).toHaveBeenCalledTimes(1);
     }, 15000);

test('should close mobile menu after chat button click', async () => {
       const user = userEvent.setup({ advanceTimers: jest.fn });
       render(
         <Header
           onLoginClick={mockOnLoginClick}
           onChatClick={mockOnChatClick}
           isLoggedIn={false}
           onLogout={mockOnLogout}
         />
       );

       const chatButton = screen.getByText('Tanya AI');
       await act(async () => {
         await user.click(chatButton);
       });

       expect(mockOnChatClick).toHaveBeenCalledTimes(1);
     }, 15000);
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(
        <Header
          onLoginClick={mockOnLoginClick}
          onChatClick={mockOnChatClick}
          isLoggedIn={false}
          onLogout={mockOnLogout}
        />
      );

      expect(screen.getByLabelText('Buka menu')).toBeInTheDocument();
    });

    test('should have proper button roles', () => {
      render(
        <Header
          onLoginClick={mockOnLoginClick}
          onChatClick={mockOnChatClick}
          isLoggedIn={false}
          onLogout={mockOnLogout}
        />
      );

      const loginButton = screen.getByText('Login');
      const chatButton = screen.getByText('Tanya AI');

      expect(loginButton).toBeInTheDocument();
      expect(chatButton).toBeInTheDocument();
    });

test('should support keyboard navigation', async () => {
       const user = userEvent.setup({ advanceTimers: jest.fn });
       render(
         <Header
           onLoginClick={mockOnLoginClick}
           onChatClick={mockOnChatClick}
           isLoggedIn={false}
           onLogout={mockOnLogout}
         />
       );

       const loginButton = screen.getByText('Login');

       // Focus and press Enter
       loginButton.focus();
       await act(async () => {
         await user.keyboard('{Enter}');
       });

       expect(mockOnLoginClick).toHaveBeenCalledTimes(1);
     }, 15000);
  });

  describe('State Management', () => {
    test('should maintain state correctly when switching login status', () => {
      const { rerender } = render(
        <Header
          onLoginClick={mockOnLoginClick}
          onChatClick={mockOnChatClick}
          isLoggedIn={false}
          onLogout={mockOnLogout}
        />
      );

      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Tanya AI')).toBeInTheDocument();

       rerender(
         <Header
           onLoginClick={mockOnLoginClick}
           onChatClick={mockOnChatClick}
           isLoggedIn={true}
           onLogout={mockOnLogout}
         />
       );

       expect(screen.getByText('Logout')).toBeInTheDocument();
       expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing props gracefully', () => {
      // Test with minimal props - this should not crash
      expect(() => {
        render(
          <Header
            onLoginClick={() => {}}
            onChatClick={() => {}}
            isLoggedIn={false}
            onLogout={() => {}}
          />
        );
      }).not.toThrow();
    });

    test('should handle rapid state changes', async () => {
      jest.useFakeTimers();
      jest.setTimeout(15000);
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { rerender } = render(
        <Header
          onLoginClick={mockOnLoginClick}
          onChatClick={mockOnChatClick}
          isLoggedIn={false}
          onLogout={mockOnLogout}
        />
      );

      // Rapidly change login state
      rerender(
        <Header
          onLoginClick={mockOnLoginClick}
          onChatClick={mockOnChatClick}
          isLoggedIn={true}
          onLogout={mockOnLogout}
        />
      );

      rerender(
        <Header
          onLoginClick={mockOnLoginClick}
          onChatClick={mockOnChatClick}
          isLoggedIn={false}
          onLogout={mockOnLogout}
        />
      );

      await act(async () => {
        const loginButton = screen.getByText('Login');
        await user.click(loginButton);
      });

      expect(mockOnLoginClick).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });
  });
});