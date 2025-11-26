import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from '@jest/globals';
import '@testing-library/jest-dom';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  test('should render loading spinner correctly', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByText('Memuat...');
    expect(spinner).toBeInTheDocument();
    
    const spinnerElement = document.querySelector('.animate-spin');
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveClass('h-8', 'w-8');
  });

  test('should render with custom size', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinnerElement = document.querySelector('.animate-spin');
    expect(spinnerElement).toHaveClass('h-12', 'w-12');
  });

  test('should render with custom message', () => {
    render(<LoadingSpinner message="Loading data..." />);
    
    const message = screen.getByText('Loading data...');
    expect(message).toBeInTheDocument();
  });

  test('should render in full screen mode', () => {
    render(<LoadingSpinner fullScreen />);
    
    const container = document.querySelector('.fixed.inset-0');
    expect(container).toBeInTheDocument();
  });

  test('should not render message when message prop is empty', () => {
    render(<LoadingSpinner message="" />);
    
    expect(screen.queryByText('Memuat...')).not.toBeInTheDocument();
  });
});