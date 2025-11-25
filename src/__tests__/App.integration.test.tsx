import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock dependencies that might cause issues
jest.mock('../services/authService', () => ({
  AuthService: {
    getCurrentUser: jest.fn(() => null),
    isAuthenticated: jest.fn(() => false)
  }
}));

jest.mock('../contexts/ChatContext', () => ({
  useChat: () => ({
    isOpen: false,
    openChat: jest.fn(),
    closeChat: jest.fn()
  })
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App Component Integration', () => {
  it('should render without crashing', () => {
    renderWithRouter(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should display main navigation', () => {
    renderWithRouter(<App />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should show login button when not authenticated', () => {
    renderWithRouter(<App />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should have proper accessibility structure', () => {
    renderWithRouter(<App />);
    
    // Check for skip link
    expect(screen.getByRole('link', { name: /skip to content/i })).toBeInTheDocument();
    
    // Check for main landmark
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should handle responsive design', () => {
    renderWithRouter(<App />);
    
    // Check for mobile menu button (should be present on mobile)
    const mobileMenuButton = screen.queryByRole('button', { name: /menu/i });
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it('should load featured content', async () => {
    renderWithRouter(<App />);
    
    // Wait for content to load
    await screen.findByText(/program unggulan/i, {}, { timeout: 5000 });
  });

  it('should have proper meta tags', () => {
    renderWithRouter(<App />);
    
    // Check for title
    expect(document.title).toBe('MA Malnu Kananga - Portal Siswa');
  });

  it('should handle error states gracefully', () => {
    // Mock a component error
    const originalError = console.error;
    console.error = jest.fn();
    
    renderWithRouter(<App />);
    
    // App should still render even if some components fail
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    console.error = originalError;
  });

  it('should be keyboard navigable', () => {
    renderWithRouter(<App />);
    
    // Check for focusable elements
    const focusableElements = screen.getAllByRole('button');
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Tab navigation should work
    focusableElements[0].focus();
    expect(focusableElements[0]).toHaveFocus();
  });
});