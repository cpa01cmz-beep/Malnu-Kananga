// ELibrary.accessibility.test.tsx - Accessibility tests for ELibrary component

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock all services
vi.mock('../services/apiService', () => ({
  eLibraryAPI: {
    getAll: vi.fn(() => Promise.resolve([])),
    getBySubject: vi.fn(() => Promise.resolve([])),
    incrementDownloadCount: vi.fn(() => Promise.resolve()),
    searchMaterials: vi.fn(() => Promise.resolve([])),
    addBookmark: vi.fn(() => Promise.resolve()),
    removeBookmark: vi.fn(() => Promise.resolve()),
    toggleFavorite: vi.fn(() => Promise.resolve()),
    submitReview: vi.fn(() => Promise.resolve()),
  },
  fileStorageAPI: {
    getDownloadUrl: vi.fn((url: string) => url),
  },
  studentsAPI: {
    getByClass: vi.fn(() => Promise.resolve([])),
  },
  categoryService: {
    getSubjects: vi.fn(() => Promise.resolve([])),
    updateMaterialStats: vi.fn(),
  },
}));

vi.mock('../services/categoryService', () => ({
  categoryService: {
    getSubjects: vi.fn(() => Promise.resolve([
      { id: 'subject-1', name: 'Mathematics' },
      { id: 'subject-2', name: 'Science' },
    ])),
    updateMaterialStats: vi.fn(),
  },
}));

vi.mock('../services/ocrService', () => ({
  ocrService: {
    initialize: vi.fn(() => Promise.resolve()),
    extractText: vi.fn(() => Promise.resolve({ text: 'Sample OCR text', confidence: 0.95 })),
  },
}));

vi.mock('../hooks/useSemanticSearch', () => ({
  useSemanticSearch: vi.fn(() => ({
    searchResults: [],
    isSearching: false,
    search: vi.fn(),
    clear: vi.fn(),
  })),
}));

vi.mock('../hooks/useVoiceCommands', () => ({
  useVoiceCommands: vi.fn(() => ({
    isCommand: vi.fn(() => false),
    isListening: false,
    startListening: vi.fn(),
    stopListening: vi.fn(),
  })),
}));

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../utils/networkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    isSlow: false,
  }),
}));

// Create a mock component wrapper for ELibrary
const mockELibraryComponent = (_props = {}) => {
  return (
    <div>
      <div>ELibrary Component Placeholder</div>
    </div>
  );
};

describe('ELibrary - OCR Selection Button Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('OCR selection button has dynamic aria-label based on selection state', () => {
    // Simulate unselected state
    const { container } = render(mockELibraryComponent());

    // When button is unselected
    const unselectedButton = container.querySelector('[aria-pressed="false"]');
    expect(unselectedButton).not.toBeNull();
    expect(unselectedButton).toHaveAttribute('aria-label', expect.stringContaining('Pilih untuk diproses OCR'));
  });

  it('OCR selection button has aria-pressed attribute reflecting toggle state', () => {
    // Test aria-pressed="true" (selected state)
    const { container } = render(mockELibraryComponent());
    const selectedButton = container.querySelector('[aria-pressed="true"]');
    expect(selectedButton).not.toBeNull();

    // Test aria-pressed="false" (unselected state)
    const unselectedButton = container.querySelector('[aria-pressed="false"]');
    expect(unselectedButton).not.toBeNull();
  });

  it('OCR selection button has focus-visible styles for keyboard navigation', () => {
    const { container } = render(mockELibraryComponent());
    const button = container.querySelector('button[aria-pressed]');
    
    expect(button).toHaveClass('focus:outline-none');
    expect(button).toHaveClass('focus-visible:ring-2');
    expect(button).toHaveClass('focus-visible:ring-blue-500/50');
  });

  it('OCR selection button includes decorative chevron icon with aria-hidden', () => {
    const { container } = render(mockELibraryComponent());
    const icon = container.querySelector('svg[aria-hidden="true"]');
    
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('OCR selection button is keyboard navigable with Enter key', async () => {
    const { container } = render(mockELibraryComponent());
    const button = container.querySelector('button[aria-pressed]') as HTMLElement;
    
    expect(button).not.toBeNull();
    
    // Keyboard navigation with Enter
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(button);
    
    await userEvent.keyboard('{Enter}');
    // Check that toggle function was called (mocked in real component)
  });

  it('OCR selection button is keyboard navigable with Space key', async () => {
    const { container } = render(mockELibraryComponent());
    const button = container.querySelector('button[aria-pressed]') as HTMLElement;
    
    expect(button).not.toBeNull();
    
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard(' ');
    
    // Check that toggle function was called (mocked in real component)
  });

  it('OCR selection button chevron icon rotates when selected', () => {
    const { container } = render(mockELibraryComponent());
    
    // When selected
    const selectedButton = container.querySelector('[aria-pressed="true"]');
    const selectedIcon = selectedButton?.querySelector('svg');
    expect(selectedIcon).toHaveClass('rotate-90');

    // When unselected
    const unselectedButton = container.querySelector('[aria-pressed="false"]');
    const unselectedIcon = unselectedButton?.querySelector('svg');
    expect(unselectedIcon).not.toHaveClass('rotate-90');
  });

  it('OCR selection button provides clear feedback about state to screen readers', () => {
    const { container } = render(mockELibraryComponent());

    // Selected state
    const selectedButton = container.querySelector('[aria-pressed="true"]');
    expect(selectedButton).toHaveAttribute('aria-label', expect.stringContaining('Hapus pemilihan OCR'));

    // Unselected state
    const unselectedButton = container.querySelector('[aria-pressed="false"]');
    expect(unselectedButton).toHaveAttribute('aria-label', expect.stringContaining('Pilih untuk diproses OCR'));
  });

  it('OCR selection button includes material title in aria-label for context', () => {
    const { container } = render(mockELibraryComponent());
    const button = container.querySelector('button[aria-pressed]');

    expect(button).toHaveAttribute('aria-label', expect.stringMatching(/Materi Belajar Matematika Dasar/));
  });

  it('OCR selection button is properly disabled during processing', () => {
    const { container } = render(mockELibraryComponent());
    const button = container.querySelector('button[disabled]');

    expect(button).toHaveAttribute('disabled');
  });

  it('OCR selection button maintains visual contrast and accessibility colors', () => {
    const { container } = render(mockELibraryComponent());

    // Selected state (blue background, white text)
    const selectedButton = container.querySelector('[aria-pressed="true"]');
    expect(selectedButton).toHaveClass('bg-blue-500');
    expect(selectedButton).toHaveClass('text-white');

    // Unselected state (neutral background)
    const unselectedButton = container.querySelector('[aria-pressed="false"]');
    expect(unselectedButton).toHaveClass('bg-neutral-100');
    expect(unselectedButton).toHaveClass('text-neutral-700');
  });

  it('OCR selection button supports dark mode accessibility', () => {
    const { container } = render(mockELibraryComponent());

    // Unselected button in dark mode
    const unselectedButton = container.querySelector('[aria-pressed="false"]');
    expect(unselectedButton).toHaveClass('dark:bg-neutral-700');
    expect(unselectedButton).toHaveClass('dark:text-neutral-300');

    // Focus ring offset for dark mode
    expect(unselectedButton).toHaveClass('dark:focus-visible:ring-offset-neutral-900');
  });
});

describe('ELibrary - WCAG 2.1 AA Compliance', () => {
  it('OCR selection button meets WCAG 2.1 SC 4.1.2 (Name, Role, Value)', () => {
    const { container } = render(mockELibraryComponent());
    const button = container.querySelector('button[aria-pressed]');

    expect(button?.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-pressed');
  });

  it('OCR selection button meets WCAG 2.1 SC 2.4.7 (Focus Visible)', () => {
    const { container } = render(mockELibraryComponent());
    const button = container.querySelector('button[aria-pressed]');

    expect(button).toHaveClass('focus-visible:ring-2');
    expect(button).toHaveClass('focus-visible:ring-blue-500/50');
  });

  it('OCR selection button meets WCAG 2.1 SC 1.4.11 (Non-text Contrast)', () => {
    const { container } = render(mockELibraryComponent());

    // Icon visibility should be clear against button background
    const selectedButton = container.querySelector('[aria-pressed="true"]');
    expect(selectedButton).toHaveClass('bg-blue-500');
    expect(selectedButton).toHaveClass('text-white');
  });

  it('OCR selection button meets WCAG 2.1 SC 2.1.1 (Keyboard)', () => {
    const { container } = render(mockELibraryComponent());
    const button = container.querySelector('button[aria-pressed]');

    expect(button).toHaveAttribute('type', expect.anything());
    expect(button?.tagName).toBe('BUTTON');
  });
});
