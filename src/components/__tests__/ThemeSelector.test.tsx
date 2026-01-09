import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ThemeSelector, { ThemeSelectorTrigger } from '../ThemeSelector';
import { useTheme } from '../../hooks/useTheme';

vi.mock('../../hooks/useTheme');

describe('ThemeSelector', () => {
  const mockSetTheme = vi.fn();
  const mockToggleDarkMode = vi.fn();
  const mockResetToDefault = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTheme as ReturnType<typeof vi.mock>).mockReturnValue({
      currentTheme: {
        id: 'default',
        displayName: 'Default',
        description: 'Tema default',
        icon: '🌈',
        colors: { primary: '#3B82F6', accent: '#8B5CF6' },
        isDark: false
      },
      setTheme: mockSetTheme,
      toggleDarkMode: mockToggleDarkMode,
      resetToDefault: mockResetToDefault,
      isReady: true
    });
  });

  it('renders when open and ready', () => {
    render(<ThemeSelector isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Pilih Tema')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ThemeSelector isOpen={false} onClose={vi.fn()} />);
    
    expect(screen.queryByText('Pilih Tema')).not.toBeInTheDocument();
  });

  it('tabs have proper ARIA attributes', () => {
    render(<ThemeSelector isOpen={true} onClose={vi.fn()} />);
    
    const lightTab = screen.getByRole('tab', { name: 'Terang' });
    const darkTab = screen.getByRole('tab', { name: 'Gelap' });
    
    expect(lightTab).toHaveAttribute('aria-selected', 'true');
    expect(lightTab).toHaveAttribute('id', 'tab-light');
    expect(lightTab).toHaveAttribute('aria-controls', 'theme-light-panel');
    
    expect(darkTab).toHaveAttribute('aria-selected', 'false');
    expect(darkTab).toHaveAttribute('id', 'tab-dark');
    expect(darkTab).toHaveAttribute('aria-controls', 'theme-dark-panel');
  });

  it('tablist has proper role and aria-label', () => {
    render(<ThemeSelector isOpen={true} onClose={vi.fn()} />);
    
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
    expect(tablist).toHaveAttribute('aria-label', 'Pilih kategori tema');
  });

  it('tabpanel has proper role and aria-labelledby', () => {
    render(<ThemeSelector isOpen={true} onClose={vi.fn()} />);
    
    const tabpanel = screen.getByRole('tabpanel');
    expect(tabpanel).toBeInTheDocument();
    expect(tabpanel).toHaveAttribute('aria-labelledby', 'tab-light');
    expect(tabpanel).toHaveAttribute('id', 'theme-light-panel');
  });

  it('theme buttons have proper ARIA attributes', () => {
    render(<ThemeSelector isOpen={true} onClose={vi.fn()} />);
    
    const themeButton = screen.getByLabelText(/Pilih tema Default/i);
    expect(themeButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('theme buttons show unselected state', async () => {
    render(<ThemeSelector isOpen={true} onClose={vi.fn()} />);
    
    const otherThemeButton = screen.getByLabelText(/Pilih tema/i);
    if (otherThemeButton) {
      expect(otherThemeButton).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('footer buttons have aria-labels', () => {
    render(<ThemeSelector isOpen={true} onClose={vi.fn()} />);
    
    const resetButton = screen.getByLabelText('Reset tema ke pengaturan default');
    const toggleButton = screen.getByLabelText('Ganti antara mode terang dan gelap');
    
    expect(resetButton).toBeInTheDocument();
    expect(toggleButton).toBeInTheDocument();
  });

  it('icons have aria-hidden="true" in tabs', () => {
    render(<ThemeSelector isOpen={true} onClose={vi.fn()} />);
    
    const sunIcon = screen.getByRole('tab', { name: 'Terang' }).querySelector('svg');
    expect(sunIcon).toHaveAttribute('aria-hidden', 'true');
  });

  it('switches tabs when clicked', async () => {
    render(<ThemeSelector isOpen={true} onClose={vi.fn()} />);
    
    const lightTab = screen.getByRole('tab', { name: 'Terang' });
    const darkTab = screen.getByRole('tab', { name: 'Gelap' });
    
    fireEvent.click(darkTab);
    
    await waitFor(() => {
      expect(lightTab).toHaveAttribute('aria-selected', 'false');
      expect(darkTab).toHaveAttribute('aria-selected', 'true');
    });
    
    const tabpanel = screen.getByRole('tabpanel');
    expect(tabpanel).toHaveAttribute('aria-labelledby', 'tab-dark');
    expect(tabpanel).toHaveAttribute('id', 'theme-dark-panel');
  });

  it('closes when theme is selected', () => {
    const onClose = vi.fn();
    render(<ThemeSelector isOpen={true} onClose={onClose} />);
    
    const themeButton = screen.getByLabelText(/Pilih tema Default/i);
    fireEvent.click(themeButton);
    
    expect(mockSetTheme).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('resets to default when button clicked', () => {
    render(<ThemeSelector isOpen={true} onClose={vi.fn()} />);
    
    const resetButton = screen.getByLabelText('Reset tema ke pengaturan default');
    fireEvent.click(resetButton);
    
    expect(mockResetToDefault).toHaveBeenCalled();
  });

  it('toggles dark mode when button clicked', () => {
    const onClose = vi.fn();
    render(<ThemeSelector isOpen={true} onClose={onClose} />);
    
    const toggleButton = screen.getByLabelText('Ganti antara mode terang dan gelap');
    fireEvent.click(toggleButton);
    
    expect(mockToggleDarkMode).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('keyboard navigation works for tabs', async () => {
    render(<ThemeSelector isOpen={true} onClose={vi.fn()} />);
    
    const lightTab = screen.getByRole('tab', { name: 'Terang' });
    
    lightTab.focus();
    expect(lightTab).toHaveFocus();
    
    fireEvent.keyDown(lightTab, { key: 'ArrowRight' });
    
    const darkTab = screen.getByRole('tab', { name: 'Gelap' });
    await waitFor(() => {
      expect(darkTab).toHaveAttribute('aria-selected', 'true');
    });
  });
});

describe('ThemeSelectorTrigger', () => {
  it('renders with current theme icon', () => {
    const mockTheme = {
      id: 'default',
      displayName: 'Default',
      description: 'Tema default',
      icon: '🌈',
      colors: { primary: '#3B82F6', accent: '#8B5CF6' },
      isDark: false
    };

    render(
      <ThemeSelectorTrigger 
        onClick={vi.fn()} 
        currentTheme={mockTheme} 
      />
    );

    expect(screen.getByLabelText('Pilih Tema')).toBeInTheDocument();
  });

  it('renders without current theme', () => {
    render(
      <ThemeSelectorTrigger 
        onClick={vi.fn()} 
        currentTheme={null} 
      />
    );

    expect(screen.getByLabelText('Pilih Tema')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    
    render(
      <ThemeSelectorTrigger 
        onClick={onClick} 
        currentTheme={null} 
      />
    );

    const button = screen.getByLabelText('Pilih Tema');
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has correct tooltip for theme', () => {
    const mockTheme = {
      id: 'default',
      displayName: 'Default',
      description: 'Tema default',
      icon: '🌈',
      colors: { primary: '#3B82F6', accent: '#8B5CF6' },
      isDark: false
    };

    render(
      <ThemeSelectorTrigger 
        onClick={vi.fn()} 
        currentTheme={mockTheme} 
      />
    );

    const button = screen.getByLabelText('Pilih Tema');
    expect(button).toHaveAttribute('title', 'Default - Tema default');
  });

  it('has no tooltip when no theme', () => {
    render(
      <ThemeSelectorTrigger 
        onClick={vi.fn()} 
        currentTheme={null} 
      />
    );

    const button = screen.getByLabelText('Pilih Tema');
    expect(button).not.toHaveAttribute('title');
  });
});
