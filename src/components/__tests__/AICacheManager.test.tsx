import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AICacheManager from '../AICacheManager';

describe('AICacheManager', () => {
  const mockStats = {
    chat: {
      totalEntries: 10,
      totalHits: 8,
      totalMisses: 2,
      hitRate: 0.8,
      memoryUsage: 1024,
      oldestEntry: new Date('2024-01-01T10:00:00')
    },
    analysis: {
      totalEntries: 5,
      totalHits: 4,
      totalMisses: 1,
      hitRate: 0.8,
      memoryUsage: 512,
      oldestEntry: new Date('2024-01-02T11:00:00')
    },
    editor: {
      totalEntries: 3,
      totalHits: 2,
      totalMisses: 1,
      hitRate: 0.667,
      memoryUsage: 256,
      oldestEntry: new Date('2024-01-03T12:00:00')
    }
  };

  const mockAICacheHook = {
    stats: {
      total: {
        entries: 18,
        hits: 14,
        misses: 4,
        hitRate: 0.778,
        memoryUsage: 1792
      },
      chat: mockStats.chat,
      analysis: mockStats.analysis,
      editor: mockStats.editor
    },
    isLoading: false,
    clearAll: vi.fn(),
    clearChat: vi.fn(),
    clearAnalysis: vi.fn(),
    clearEditor: vi.fn(),
    refresh: vi.fn()
  };

  vi.mock('../hooks/useAICache', () => ({
    useAICache: () => mockAICacheHook
  }));

  it('renders cache manager with accessible expand/collapse buttons', () => {
    render(<AICacheManager />);

    const expandButtons = screen.getAllByRole('button').filter(button => {
      return button.getAttribute('aria-label')?.includes('Expand') || button.getAttribute('aria-label')?.includes('Collapse');
    });

    expect(expandButtons.length).toBeGreaterThan(0);
  });

  it('has proper aria-label on expand/collapse buttons', () => {
    render(<AICacheManager />);

    const firstExpandButton = screen.getAllByRole('button').find(button =>
      button.getAttribute('aria-label')?.includes('Chat Cache')
    );

    expect(firstExpandButton).toBeDefined();
    expect(firstExpandButton).toHaveAttribute('aria-expanded');
  });

  it('has aria-expanded attribute that reflects state', () => {
    render(<AICacheManager />);

    const expandButtons = screen.getAllByRole('button').filter(button =>
      button.getAttribute('aria-label')?.includes('Expand') || button.getAttribute('aria-label')?.includes('Collapse')
    );

    expandButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-expanded');
      const ariaExpanded = button.getAttribute('aria-expanded');
      expect(ariaExpanded === 'true' || ariaExpanded === 'false').toBe(true);
    });
  });

  it('has accessible refresh button with aria-label', () => {
    render(<AICacheManager />);

    const refreshButton = screen.getByLabelText('Refresh cache statistics');
    expect(refreshButton).toBeInTheDocument();
  });

  it('has accessible clear all button with aria-label', () => {
    render(<AICacheManager />);

    const clearAllButton = screen.getByLabelText(/Clear all/i);
    expect(clearAllButton).toBeInTheDocument();
  });

  it('has accessible section clear buttons with aria-label', () => {
    render(<AICacheManager />);

    const clearChatButton = screen.getByLabelText('Clear Chat Cache');
    const clearAnalysisButton = screen.getByLabelText('Clear Analysis Cache');
    const clearEditorButton = screen.getByLabelText('Clear Editor Cache');

    expect(clearChatButton).toBeInTheDocument();
    expect(clearAnalysisButton).toBeInTheDocument();
    expect(clearEditorButton).toBeInTheDocument();
  });

  it('displays cache statistics correctly', () => {
    render(<AICacheManager />);

    expect(screen.getByText('Total Entries')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('Overall Hit Rate')).toBeInTheDocument();
    expect(screen.getByText('77.8%')).toBeInTheDocument();
  });

  it('renders loading state properly', () => {
    mockAICacheHook.isLoading = true;
    render(<AICacheManager />);

    expect(screen.queryByText('Total Entries')).not.toBeInTheDocument();
  });
});
