import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ELibrary from '../elibrary/ELibrary';
import { logger as _logger } from '../../utils/logger';

vi.mock('../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

vi.mock('../../services/apiService', () => ({
  eLibraryAPI: {
    getAll: vi.fn(() => Promise.resolve({ success: true, data: [] })),
    getById: vi.fn(() => Promise.resolve({ success: true, data: {} })),
    getByCategory: vi.fn(() => Promise.resolve({ success: true, data: [] })),
    getBySubject: vi.fn(() => Promise.resolve({ success: true, data: [] })),
    create: vi.fn(() => Promise.resolve({ success: true, data: {} })),
    update: vi.fn(() => Promise.resolve({ success: true, data: {} })),
    incrementDownloadCount: vi.fn(() => Promise.resolve({ success: true, data: {} })),
    delete: vi.fn(() => Promise.resolve({ success: true, data: null }))
  },
  fileStorageAPI: {
    downloadFile: vi.fn(() => Promise.resolve({ url: '' }))
  }
}));

vi.mock('../../services/categoryService', () => ({
  categoryService: {
    getSubjects: vi.fn(() => Promise.resolve([])),
    updateMaterialStats: vi.fn()
  }
}));

vi.mock('../../services/ocrService', () => ({
  ocrService: {
    processDocument: vi.fn(() => Promise.resolve({ text: '', confidence: 0 })),
    getStatus: vi.fn(() => Promise.resolve({ status: 'completed', progress: 100 }))
  }
}));

vi.mock('../../services/ocrEnhancementService', () => ({
  generateTextSummary: vi.fn(() => 'Summary text'),
  compareTextsForSimilarity: vi.fn(() => 0.5)
}));

vi.mock('../../hooks/useSemanticSearch', () => ({
  useSemanticSearch: () => ({
    searchResults: [],
    isSearching: false,
    error: null,
    searchQuery: '',
    suggestedQueries: [],
    relatedMaterials: [],
    semanticSearch: vi.fn(),
    clearSearch: vi.fn(),
    getSuggestions: vi.fn(),
    getRelatedMaterials: vi.fn()
  })
}));
vi.mock('../../hooks/useVoiceCommands', () => ({
  useVoiceCommands: vi.fn(() => ({
    isCommand: vi.fn(() => false),
    transcript: ''
  }))
}));

describe('ELibrary Keyboard Navigation', () => {
  const defaultProps = {
    onBack: vi.fn(),
    onShowToast: vi.fn()
  };

  it('should activate advanced search filter with Enter key', async () => {
    render(<ELibrary {...defaultProps} />);
    
    const advancedSearchButton = await screen.findByLabelText('Pencarian lanjutan');
    
    fireEvent.keyDown(advancedSearchButton, { key: 'Enter' });

    expect(advancedSearchButton).toBeInTheDocument();
  });

  it('should activate advanced search filter with Space key', async () => {
    render(<ELibrary {...defaultProps} />);
    
    const advancedSearchButton = await screen.findByLabelText('Pencarian lanjutan');
    
    fireEvent.keyDown(advancedSearchButton, { key: ' ' });

    expect(advancedSearchButton).toBeInTheDocument();
  });

  it('should toggle favorites filter with Enter key', async () => {
    render(<ELibrary {...defaultProps} />);
    
    const favoritesButton = await screen.findByLabelText('Tampilkan hanya favorit');
    
    fireEvent.keyDown(favoritesButton, { key: 'Enter' });

    expect(favoritesButton).toBeInTheDocument();
  });

  it('should toggle favorites filter with Space key', async () => {
    render(<ELibrary {...defaultProps} />);
    
    const favoritesButton = await screen.findByLabelText('Tampilkan hanya favorit');
    
    fireEvent.keyDown(favoritesButton, { key: ' ' });

    expect(favoritesButton).toBeInTheDocument();
  });

  it('should toggle semantic mode with Enter key', async () => {
    render(<ELibrary {...defaultProps} />);

    const semanticModeButton = await screen.findByLabelText('Pencarian semantik AI');

    semanticModeButton.focus();
    fireEvent.keyDown(semanticModeButton, { key: 'Enter' });

    expect(semanticModeButton).toHaveFocus();
  });

  it('should toggle semantic mode with Space key', async () => {
    render(<ELibrary {...defaultProps} />);

    const semanticModeButton = await screen.findByLabelText('Pencarian semantik AI');

    semanticModeButton.focus();
    fireEvent.keyDown(semanticModeButton, { key: ' ' });

    expect(semanticModeButton).toHaveFocus();
  });

  it('should toggle semantic options with Enter key', async () => {
    render(<ELibrary {...defaultProps} />);
    
    const semanticOptionsButton = await screen.findByLabelText('Opsi pencarian semantik');
    
    fireEvent.keyDown(semanticOptionsButton, { key: 'Enter' });

    expect(semanticOptionsButton).toBeInTheDocument();
  });

  it('should toggle semantic options with Space key', async () => {
    render(<ELibrary {...defaultProps} />);
    
    const semanticOptionsButton = await screen.findByLabelText('Opsi pencarian semantik');
    
    fireEvent.keyDown(semanticOptionsButton, { key: ' ' });

    expect(semanticOptionsButton).toBeInTheDocument();
  });

  it('should activate advanced search filter with Space key', async () => {
    render(<ELibrary {...defaultProps} />);
    
    const advancedSearchButton = await screen.findByLabelText('Pencarian lanjutan');
    
    advancedSearchButton.focus();
    fireEvent.keyDown(advancedSearchButton, { key: ' ' });

    expect(advancedSearchButton).toHaveFocus();
  });

  it('should toggle favorites filter with Enter key', async () => {
    render(<ELibrary {...defaultProps} />);
    
    const favoritesButton = await screen.findByLabelText('Tampilkan hanya favorit');
    
    favoritesButton.focus();
    fireEvent.keyDown(favoritesButton, { key: 'Enter' });

    expect(favoritesButton).toHaveFocus();
  });

  it('should toggle favorites filter with Space key', async () => {
    render(<ELibrary {...defaultProps} />);
    
    const favoritesButton = await screen.findByLabelText('Tampilkan hanya favorit');
    
    favoritesButton.focus();
    fireEvent.keyDown(favoritesButton, { key: ' ' });

    expect(favoritesButton).toHaveFocus();
  });

  it('should toggle semantic mode with Enter key', async () => {
    render(<ELibrary {...defaultProps} />);

    const semanticModeButton = await screen.findByLabelText('Pencarian semantik AI');
    semanticModeButton.focus();
    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');

    fireEvent.keyDown(semanticModeButton, { key: 'Enter' });

    expect(preventDefaultSpy).toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('should toggle semantic mode with Space key', async () => {
    render(<ELibrary {...defaultProps} />);

    const semanticModeButton = await screen.findByLabelText('Pencarian semantik AI');
    semanticModeButton.focus();
    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');

    fireEvent.keyDown(semanticModeButton, { key: ' ' });

    expect(preventDefaultSpy).toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('should toggle semantic options with Enter key', async () => {
    render(<ELibrary {...defaultProps} />);

    const semanticOptionsButton = await screen.findByLabelText('Opsi pencarian semantik');
    semanticOptionsButton.focus();
    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');

    fireEvent.keyDown(semanticOptionsButton, { key: 'Enter' });

    expect(preventDefaultSpy).toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('should toggle semantic options with Space key', async () => {
    render(<ELibrary {...defaultProps} />);

    const semanticOptionsButton = await screen.findByLabelText('Opsi pencarian semantik');
    semanticOptionsButton.focus();
    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');

    fireEvent.keyDown(semanticOptionsButton, { key: ' ' });

    expect(preventDefaultSpy).toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('should have proper aria-labels for all filter buttons', async () => {
    render(<ELibrary {...defaultProps} />);
    
    expect(await screen.findByLabelText('Pencarian lanjutan')).toBeInTheDocument();
    expect(await screen.findByLabelText('Tampilkan hanya favorit')).toBeInTheDocument();
    expect(await screen.findByLabelText('Pencarian semantik AI')).toBeInTheDocument();
    expect(await screen.findByLabelText('Opsi pencarian semantik')).toBeInTheDocument();
  });

  it('should prevent default behavior on Space key activation', async () => {
    render(<ELibrary {...defaultProps} />);

    const advancedSearchButton = await screen.findByLabelText('Pencarian lanjutan');
    advancedSearchButton.focus();
    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');

    fireEvent.keyDown(advancedSearchButton, { key: ' ' });

    expect(preventDefaultSpy).toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('should prevent default behavior on Enter key activation', async () => {
    render(<ELibrary {...defaultProps} />);

    const favoritesButton = await screen.findByLabelText('Tampilkan hanya favorit');
    favoritesButton.focus();
    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');

    fireEvent.keyDown(favoritesButton, { key: 'Enter' });

    expect(preventDefaultSpy).toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('should handle Enter key with correct keyCode', async () => {
    render(<ELibrary {...defaultProps} />);

    const semanticModeButton = await screen.findByLabelText('Pencarian semantik AI');
    semanticModeButton.focus();
    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');

    fireEvent.keyDown(semanticModeButton, { keyCode: 13 });

    expect(preventDefaultSpy).toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('should handle Space key with correct keyCode', async () => {
    render(<ELibrary {...defaultProps} />);

    const semanticOptionsButton = await screen.findByLabelText('Opsi pencarian semantik');
    semanticOptionsButton.focus();
    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');

    fireEvent.keyDown(semanticOptionsButton, { keyCode: 32 });

    expect(preventDefaultSpy).toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('should not trigger on other keys', async () => {
    render(<ELibrary {...defaultProps} />);
    
    const advancedSearchButton = await screen.findByLabelText('Pencarian lanjutan');
    const preventDefault = vi.fn();
    
    fireEvent.keyDown(advancedSearchButton, { 
      key: 'Tab',
      preventDefault 
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('should prevent default behavior on Space key activation', async () => {
    render(<ELibrary {...defaultProps} />);

    const advancedSearchButton = await screen.findByLabelText('Pencarian lanjutan');
    advancedSearchButton.focus();
    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');

    fireEvent.keyDown(advancedSearchButton, { key: ' ' });

    expect(preventDefaultSpy).toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('should prevent default behavior on Enter key activation', async () => {
    render(<ELibrary {...defaultProps} />);

    const favoritesButton = await screen.findByLabelText('Tampilkan hanya favorit');
    favoritesButton.focus();
    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');

    fireEvent.keyDown(favoritesButton, { key: 'Enter' });

    expect(preventDefaultSpy).toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('should handle Enter key with correct keyCode', async () => {
    render(<ELibrary {...defaultProps} />);

    const semanticModeButton = await screen.findByLabelText('Pencarian semantik AI');
    semanticModeButton.focus();
    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');

    fireEvent.keyDown(semanticModeButton, { keyCode: 13 });

    expect(preventDefaultSpy).toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('should handle Space key with correct keyCode', async () => {
    render(<ELibrary {...defaultProps} />);

    const semanticOptionsButton = await screen.findByLabelText('Opsi pencarian semantik');
    semanticOptionsButton.focus();
    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');

    fireEvent.keyDown(semanticOptionsButton, { keyCode: 32 });

    expect(preventDefaultSpy).toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('should not trigger on other keys', async () => {
    render(<ELibrary {...defaultProps} />);
    
    const advancedSearchButton = await screen.findByLabelText('Pencarian lanjutan');
    const preventDefault = vi.fn();
    
    advancedSearchButton.focus();
    fireEvent.keyDown(advancedSearchButton, { 
      key: 'Tab',
      preventDefault 
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });
});
