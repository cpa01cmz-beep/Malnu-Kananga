import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ELibrary from '../ELibrary';
import { logger } from '../../utils/logger';

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

vi.mock('../../services/apiService', () => ({
  eLibraryAPI: {
    getMaterials: vi.fn(() => Promise.resolve([])),
    getSubjects: vi.fn(() => Promise.resolve([]))
  },
  fileStorageAPI: {
    downloadFile: vi.fn(() => Promise.resolve({ url: '' }))
  }
}));

vi.mock('../../hooks/useSemanticSearch');
vi.mock('../../hooks/useVoiceCommands');

describe('ELibrary Keyboard Navigation', () => {
  const defaultProps = {
    onBack: vi.fn(),
    onShowToast: vi.fn()
  };

  it('should activate advanced search filter with Enter key', () => {
    render(<ELibrary {...defaultProps} />);

    const advancedSearchButton = screen.getByLabelText('Pencarian lanjutan');
    
    advancedSearchButton.focus();
    fireEvent.keyDown(advancedSearchButton, { key: 'Enter' });

    expect(advancedSearchButton).toHaveFocus();
  });

  it('should activate advanced search filter with Space key', () => {
    render(<ELibrary {...defaultProps} />);

    const advancedSearchButton = screen.getByLabelText('Pencarian lanjutan');
    
    advancedSearchButton.focus();
    fireEvent.keyDown(advancedSearchButton, { key: ' ' });

    expect(advancedSearchButton).toHaveFocus();
  });

  it('should toggle favorites filter with Enter key', () => {
    render(<ELibrary {...defaultProps} />);

    const favoritesButton = screen.getByLabelText('Tampilkan hanya favorit');
    
    favoritesButton.focus();
    fireEvent.keyDown(favoritesButton, { key: 'Enter' });

    expect(favoritesButton).toHaveFocus();
  });

  it('should toggle favorites filter with Space key', () => {
    render(<ELibrary {...defaultProps} />);

    const favoritesButton = screen.getByLabelText('Tampilkan hanya favorit');
    
    favoritesButton.focus();
    fireEvent.keyDown(favoritesButton, { key: ' ' });

    expect(favoritesButton).toHaveFocus();
  });

  it('should toggle semantic mode with Enter key', () => {
    render(<ELibrary {...defaultProps} />);

    const semanticModeButton = screen.getByLabelText('Pencarian semantik AI');
    
    semanticModeButton.focus();
    fireEvent.keyDown(semanticModeButton, { key: 'Enter' });

    expect(semanticModeButton).toHaveFocus();
  });

  it('should toggle semantic mode with Space key', () => {
    render(<ELibrary {...defaultProps} />);

    const semanticModeButton = screen.getByLabelText('Pencarian semantik AI');
    
    semanticModeButton.focus();
    fireEvent.keyDown(semanticModeButton, { key: ' ' });

    expect(semanticModeButton).toHaveFocus();
  });

  it('should toggle semantic options with Enter key', () => {
    render(<ELibrary {...defaultProps} />);

    const semanticOptionsButton = screen.getByLabelText('Opsi pencarian semantik');
    
    semanticOptionsButton.focus();
    fireEvent.keyDown(semanticOptionsButton, { key: 'Enter' });

    expect(semanticOptionsButton).toHaveFocus();
  });

  it('should toggle semantic options with Space key', () => {
    render(<ELibrary {...defaultProps} />);

    const semanticOptionsButton = screen.getByLabelText('Opsi pencarian semantik');
    
    semanticOptionsButton.focus();
    fireEvent.keyDown(semanticOptionsButton, { key: ' ' });

    expect(semanticOptionsButton).toHaveFocus();
  });

  it('should have proper aria-labels for all filter buttons', () => {
    render(<ELibrary {...defaultProps} />);

    expect(screen.getByLabelText('Pencarian lanjutan')).toBeInTheDocument();
    expect(screen.getByLabelText('Tampilkan hanya favorit')).toBeInTheDocument();
    expect(screen.getByLabelText('Pencarian semantik AI')).toBeInTheDocument();
    expect(screen.getByLabelText('Opsi pencarian semantik')).toBeInTheDocument();
  });

  it('should prevent default behavior on Space key activation', () => {
    render(<ELibrary {...defaultProps} />);

    const advancedSearchButton = screen.getByLabelText('Pencarian lanjutan');
    const preventDefault = vi.fn();
    
    advancedSearchButton.focus();
    fireEvent.keyDown(advancedSearchButton, { 
      key: ' ',
      preventDefault 
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('should prevent default behavior on Enter key activation', () => {
    render(<ELibrary {...defaultProps} />);

    const favoritesButton = screen.getByLabelText('Tampilkan hanya favorit');
    const preventDefault = vi.fn();
    
    favoritesButton.focus();
    fireEvent.keyDown(favoritesButton, { 
      key: 'Enter',
      preventDefault 
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('should handle Enter key with correct keyCode', () => {
    render(<ELibrary {...defaultProps} />);

    const semanticModeButton = screen.getByLabelText('Pencarian semantik AI');
    const preventDefault = vi.fn();
    
    semanticModeButton.focus();
    fireEvent.keyDown(semanticModeButton, { 
      keyCode: 13,
      preventDefault 
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('should handle Space key with correct keyCode', () => {
    render(<ELibrary {...defaultProps} />);

    const semanticOptionsButton = screen.getByLabelText('Opsi pencarian semantik');
    const preventDefault = vi.fn();
    
    semanticOptionsButton.focus();
    fireEvent.keyDown(semanticOptionsButton, { 
      keyCode: 32,
      preventDefault 
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('should not trigger on other keys', () => {
    render(<ELibrary {...defaultProps} />);

    const advancedSearchButton = screen.getByLabelText('Pencarian lanjutan');
    const preventDefault = vi.fn();
    
    advancedSearchButton.focus();
    fireEvent.keyDown(advancedSearchButton, { 
      key: 'Tab',
      preventDefault 
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });
});
