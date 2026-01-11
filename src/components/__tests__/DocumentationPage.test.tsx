import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DocumentationPage from '../DocumentationPage';

describe('DocumentationPage', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  it('renders modal with correct title', () => {
    render(<DocumentationPage {...defaultProps} />);
    
    expect(screen.getByText('Pusat Bantuan')).toBeInTheDocument();
  });

  it('renders all accordion sections', () => {
    render(<DocumentationPage {...defaultProps} />);
    
    expect(screen.getByText('Untuk Pengguna Umum')).toBeInTheDocument();
    expect(screen.getByText('Untuk Siswa')).toBeInTheDocument();
    expect(screen.getByText('Untuk Guru & Staf')).toBeInTheDocument();
    expect(screen.getByText('Untuk Wali Murid')).toBeInTheDocument();
  });

  it('accordion button has correct ARIA attributes when closed', () => {
    render(<DocumentationPage {...defaultProps} />);
    
    const button = screen.getByText('Untuk Pengguna Umum').closest('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls');
    expect(button).toHaveAttribute('id');
  });

  it('accordion button has correct ARIA attributes when opened', async () => {
    render(<DocumentationPage {...defaultProps} />);
    
    const button = screen.getByText('Untuk Pengguna Umum').closest('button');
    if (!button) throw new Error('Button not found');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('accordion content has correct ARIA attributes', () => {
    render(<DocumentationPage {...defaultProps} />);
    
    const button = screen.getByText('Untuk Pengguna Umum').closest('button');
    if (!button) throw new Error('Button not found');
    
    const controlsId = button?.getAttribute('aria-controls');
    const content = document.getElementById(controlsId || '');
    
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute('role', 'region');
    expect(content).toHaveAttribute('aria-labelledby', button?.id);
  });

  it('accordion content is hidden when closed', () => {
    render(<DocumentationPage {...defaultProps} />);
    
    const button = screen.getByText('Untuk Siswa').closest('button');
    if (!button) throw new Error('Button not found');
    
    const controlsId = button?.getAttribute('aria-controls');
    const content = document.getElementById(controlsId || '');
    
    expect(content).toHaveClass('hidden');
    expect(content).toHaveAttribute('aria-hidden', 'true');
  });

  it('accordion content is visible when opened', async () => {
    render(<DocumentationPage {...defaultProps} />);
    
    const button = screen.getByText('Untuk Siswa').closest('button');
    if (!button) throw new Error('Button not found');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
    
    const controlsId = button?.getAttribute('aria-controls');
    const content = document.getElementById(controlsId || '');
    
    expect(content).not.toHaveClass('hidden');
    expect(content).toHaveAttribute('aria-hidden', 'false');
  });

  it('accordion toggles on Enter key', async () => {
    render(<DocumentationPage {...defaultProps} />);
    
    const button = screen.getByText('Untuk Pengguna Umum').closest('button');
    if (!button) throw new Error('Button not found');
    
    expect(button).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.keyDown(button, { key: 'Enter' });
    
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('accordion toggles on Space key', async () => {
    render(<DocumentationPage {...defaultProps} />);
    
    const button = screen.getByText('Untuk Pengguna Umum').closest('button');
    if (!button) throw new Error('Button not found');
    
    expect(button).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.keyDown(button, { key: ' ' });
    
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('chevron icon has aria-hidden attribute', () => {
    render(<DocumentationPage {...defaultProps} />);
    
    const button = screen.getByText('Untuk Pengguna Umum').closest('button');
    if (!button) throw new Error('Button not found');
    
    const icon = button?.querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onClose when modal close button is clicked', () => {
    render(<DocumentationPage {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /tutup/i });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders documentation content for general users', () => {
    render(<DocumentationPage {...defaultProps} />);
    
    expect(screen.getByText(/Selamat datang di website MA Malnu Kananga/)).toBeInTheDocument();
    expect(screen.getByText(/Asisten AI/)).toBeInTheDocument();
  });

  it('renders documentation content for students', async () => {
    render(<DocumentationPage {...defaultProps} />);
    
    const button = screen.getByText('Untuk Siswa').closest('button');
    if (!button) throw new Error('Button not found');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Portal Siswa/)).toBeInTheDocument();
    });
  });
});
