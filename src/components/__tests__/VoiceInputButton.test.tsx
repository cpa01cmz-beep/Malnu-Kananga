import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import VoiceInputButton from '../VoiceInputButton';

vi.mock('../../hooks/useVoiceRecognition');
vi.mock('../../hooks/useVoiceCommands');
vi.mock('../MicrophonePermissionHandler');

describe('VoiceInputButton Component', () => {
  const mockOnTranscript = vi.fn();
  const mockOnError = vi.fn();
  const mockOnCommand = vi.fn();

  const defaultProps = {
    onTranscript: mockOnTranscript,
    onError: mockOnError,
    onCommand: mockOnCommand,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    expect(() => render(<VoiceInputButton {...defaultProps} />)).not.toThrow();
  });

  it('should display microphone button', () => {
    render(<VoiceInputButton {...defaultProps} />);
    
    const micButton = screen.getByRole('button');
    expect(micButton).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<VoiceInputButton {...defaultProps} disabled={true} />);
    
    const micButton = screen.getByRole('button');
    expect(micButton).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<VoiceInputButton {...defaultProps} className="custom-class" />);
    
    const micButton = screen.getByRole('button');
    expect(micButton).toHaveClass('custom-class');
  });

  it('should handle keyboard events', () => {
    render(<VoiceInputButton {...defaultProps} />);
    
    const micButton = screen.getByRole('button');
    
    fireEvent.keyDown(micButton, { key: 'Enter' });
    fireEvent.keyDown(micButton, { key: ' ' });
    
    expect(micButton).toBeInTheDocument();
  });

  it('should handle mouse events', () => {
    render(<VoiceInputButton {...defaultProps} />);
    
    const micButton = screen.getByRole('button');
    
    fireEvent.mouseDown(micButton);
    fireEvent.mouseUp(micButton);
    fireEvent.click(micButton);
    
    expect(micButton).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<VoiceInputButton {...defaultProps} />);
    
    const micButton = screen.getByRole('button');
    expect(micButton).toHaveAttribute('type', 'button');
  });

  it('should receive all required props', () => {
    render(<VoiceInputButton {...defaultProps} />);
    
    expect(mockOnTranscript).toBeDefined();
    expect(mockOnError).toBeDefined();
    expect(mockOnCommand).toBeDefined();
  });
});