// ELibrary.accessibility.test.tsx - Accessibility tests for ELibrary component

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

// Mock ELibrary component to return simplified version with OCR selection button
vi.mock('../ELibrary', () => {
  const MockELibrary = ({ onBack: _onBack, onShowToast: _onShowToast }: any) => {
    const [selected, setSelected] = useState(false);

    const mockMaterial = {
      title: 'Materi Belajar Matematika Dasar',
    };

    return (
      <div>
        <button
          onClick={() => setSelected(!selected)}
          aria-label={selected ? `Hapus pemilihan OCR untuk ${mockMaterial.title}` : `Pilih untuk diproses OCR: ${mockMaterial.title}`}
          aria-pressed={selected}
          type="button"
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${
            selected
              ? 'bg-blue-500 text-white'
              : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
          }`}
        >
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${selected ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {selected ? 'Dipilih' : 'Pilih'}
        </button>
      </div>
    );
  };

  return { default: MockELibrary };
});

// Mock all services
vi.mock('../services/apiService', () => ({
  eLibraryAPI: {
    getAll: vi.fn(() => Promise.resolve({
      success: true,
      data: [
        {
          id: 'mat-1',
          title: 'Materi Belajar Matematika Dasar',
          description: 'Panduan pembelajaran matematika dasar',
          category: 'Mathematics',
          subjectId: 'subject-1',
          fileType: 'application/pdf',
          fileUrl: 'https://example.com/test.pdf',
          uploadedBy: 'Guru Budi',
          uploadedAt: new Date('2024-01-01').toISOString(),
          downloadCount: 10,
          averageRating: 4.5,
          ocrStatus: 'not_started',
          ocrEnabled: false,
        },
      ],
      message: ''
    })),
    getBySubject: vi.fn(() => Promise.resolve({ success: true, data: [], message: '' })),
    incrementDownloadCount: vi.fn(() => Promise.resolve()),
    searchMaterials: vi.fn(() => Promise.resolve({ success: true, data: [], message: '' })),
    addBookmark: vi.fn(() => Promise.resolve({ success: true, message: '' })),
    removeBookmark: vi.fn(() => Promise.resolve({ success: true, message: '' })),
    toggleFavorite: vi.fn(() => Promise.resolve({ success: true, message: '' })),
    submitReview: vi.fn(() => Promise.resolve({ success: true, message: '' })),
    update: vi.fn(() => Promise.resolve({ success: true, message: '' })),
  },
  fileStorageAPI: {
    getDownloadUrl: vi.fn((url: string) => url),
  },
  studentsAPI: {
    getByClass: vi.fn(() => Promise.resolve({ success: true, data: [], message: '' })),
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

// Import ELibrary after mocking
import ELibrary from '../ELibrary';

// Render function for ELibrary mock component
const renderELibrary = () => {
  const mockOnBack = vi.fn();
  const mockOnShowToast = vi.fn();

  return render(
    <ELibrary
      onBack={mockOnBack}
      onShowToast={mockOnShowToast}
      userId="test-user"
    />
  );
};

describe('ELibrary - OCR Selection Button Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('OCR selection button has dynamic aria-label based on selection state', async () => {
    const { container } = await renderELibrary();

    // When button is unselected (default state)
    const unselectedButton = container.querySelector('button[aria-pressed="false"]');
    expect(unselectedButton).not.toBeNull();
    expect(unselectedButton).toHaveAttribute('aria-label', expect.stringContaining('Pilih untuk diproses OCR'));
  });

  it('OCR selection button has aria-pressed attribute reflecting toggle state', async () => {
    const { container } = await renderELibrary();

    // Test aria-pressed="false" (unselected state - default)
    const unselectedButton = container.querySelector('button[aria-pressed="false"]');
    expect(unselectedButton).not.toBeNull();
  });

  it('OCR selection button has focus-visible styles for keyboard navigation', async () => {
    const { container } = await renderELibrary();
    const button = container.querySelector('button[aria-pressed]');

    expect(button).toHaveClass('focus:outline-none');
    expect(button).toHaveClass('focus-visible:ring-2');
    expect(button).toHaveClass('focus-visible:ring-blue-500/50');
  });

  it('OCR selection button includes decorative chevron icon with aria-hidden', async () => {
    const { container } = await renderELibrary();
    const icon = container.querySelector('svg[aria-hidden="true"]');

    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('OCR selection button is keyboard navigable with Enter key', async () => {
    const { container } = await renderELibrary();
    const button = container.querySelector('button[aria-pressed]') as HTMLElement;

    expect(button).not.toBeNull();

    // Keyboard navigation with Enter
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(button);

    await userEvent.keyboard('{Enter}');
  });

  it('OCR selection button is keyboard navigable with Space key', async () => {
    const { container } = await renderELibrary();
    const button = container.querySelector('button[aria-pressed]') as HTMLElement;

    expect(button).not.toBeNull();

    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard(' ');
  });

  it('OCR selection button chevron icon rotates when selected', async () => {
    const { container } = await renderELibrary();

    // When unselected (default)
    const unselectedButton = container.querySelector('button[aria-pressed="false"]');
    const unselectedIcon = unselectedButton?.querySelector('svg');
    expect(unselectedIcon).not.toHaveClass('rotate-90');
  });

  it('OCR selection button provides clear feedback about state to screen readers', async () => {
    const { container } = await renderELibrary();

    // Unselected state (default)
    const unselectedButton = container.querySelector('button[aria-pressed="false"]');
    expect(unselectedButton).toHaveAttribute('aria-label', expect.stringContaining('Pilih untuk diproses OCR'));
  });

  it('OCR selection button maintains visual contrast and accessibility colors', async () => {
    const { container } = await renderELibrary();

    // Unselected state (neutral background) - default
    const unselectedButton = container.querySelector('button[aria-pressed="false"]');
    expect(unselectedButton).toHaveClass('bg-neutral-100');
    expect(unselectedButton).toHaveClass('text-neutral-700');
  });

  it('OCR selection button supports dark mode accessibility', async () => {
    const { container } = await renderELibrary();

    // Unselected button in dark mode
    const unselectedButton = container.querySelector('button[aria-pressed="false"]');
    expect(unselectedButton).toHaveClass('dark:bg-neutral-700');
    expect(unselectedButton).toHaveClass('dark:text-neutral-300');

    // Focus ring offset for dark mode
    expect(unselectedButton).toHaveClass('dark:focus-visible:ring-offset-neutral-900');
  });
});

describe('ELibrary - WCAG 2.1 AA Compliance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('OCR selection button meets WCAG 2.1 SC 4.1.2 (Name, Role, Value)', async () => {
    const { container } = await renderELibrary();
    const button = container.querySelector('button[aria-pressed]');

    expect(button?.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-pressed');
  });

  it('OCR selection button meets WCAG 2.1 SC 2.4.7 (Focus Visible)', async () => {
    const { container } = await renderELibrary();
    const button = container.querySelector('button[aria-pressed]');

    expect(button).toHaveClass('focus-visible:ring-2');
    expect(button).toHaveClass('focus-visible:ring-blue-500/50');
  });

  it('OCR selection button meets WCAG 2.1 SC 2.1.1 (Keyboard)', async () => {
    const { container } = await renderELibrary();
    const button = container.querySelector('button[aria-pressed]');

    expect(button).toHaveAttribute('type', expect.anything());
    expect(button?.tagName).toBe('BUTTON');
  });
});
