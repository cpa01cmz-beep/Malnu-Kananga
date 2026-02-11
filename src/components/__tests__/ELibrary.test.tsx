import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ELibrary from '../ELibrary';

vi.mock('../ELibrary/components/LibrarySearch');
vi.mock('../ELibrary/components/CategoryFilter');
vi.mock('../ELibrary/components/MaterialGrid');
vi.mock('../ELibrary/components/ReadingProgress');
vi.mock('../../services/offlineDataService');

describe('ELibrary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    expect(() => render(<ELibrary />)).not.toThrow();
  });

  it('should display library title', () => {
    render(<ELibrary />);
    
    expect(screen.getByText(/e-library/i)).toBeInTheDocument();
  });

  it('should show search functionality', () => {
    render(<ELibrary />);
    
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should display material categories', () => {
    render(<ELibrary />);
    
    expect(screen.getByText(/categories/i)).toBeInTheDocument();
  });

  it('should show material grid', () => {
    render(<ELibrary />);
    
    expect(screen.getByTestId('material-grid')).toBeInTheDocument();
  });

  it('should have proper navigation', () => {
    render(<ELibrary />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should display reading progress for logged-in users', () => {
    render(<ELibrary />);
    
    expect(screen.getByText(/reading progress/i)).toBeInTheDocument();
  });

  it('should handle offline mode', () => {
    render(<ELibrary />);
    
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });
});