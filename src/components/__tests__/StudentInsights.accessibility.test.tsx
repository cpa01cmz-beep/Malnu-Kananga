import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import StudentInsights from '../StudentInsights';

// Mock the useStudentInsights hook
vi.mock('../../hooks/useStudentInsights', () => ({
  useStudentInsights: vi.fn(() => ({
    insights: {
      gradePerformance: [
        {
          subject: 'Matematika',
          averageScore: 85,
          grade: 'A',
          trend: 'improving',
          assignments: [80, 85, 90],
          exams: [82, 87]
        },
        {
          subject: 'Bahasa Indonesia',
          averageScore: 78,
          grade: 'B',
          trend: 'declining',
          assignments: [80, 78, 76],
          exams: [79, 77]
        },
        {
          subject: 'Fisika',
          averageScore: 82,
          grade: 'B',
          trend: 'stable',
          assignments: [80, 82, 84],
          exams: [81, 83]
        }
      ],
      attendanceInsight: {
        totalDays: 100,
        present: 95,
        sick: 3,
        permitted: 2,
        absent: 0,
        percentage: 95,
        impactOnGrades: 'Kehadiran sangat baik mendukung prestasi akademik'
      },
      studyRecommendations: [
        {
          priority: 'high',
          subject: 'Bahasa Indonesia',
          recommendation: 'Focus on writing exercises',
          timeAllocation: '30 minutes daily',
          resources: ['Textbook', 'Online exercises']
        }
      ],
      performanceTrends: [
        { month: 'Jan 2024', averageScore: 80, attendanceRate: 95 },
        { month: 'Feb 2024', averageScore: 82, attendanceRate: 97 }
      ],
      overallPerformance: {
        gpa: 3.7,
        classRank: '5/30',
        totalSubjects: 6,
        improvementRate: 2.5
      },
      aiAnalysis: 'Analisis AI menunjukkan performa yang baik',
      motivationalMessage: 'Terus pertahankan prestasi Anda!',
      lastUpdated: new Date().toISOString()
    },
    loading: false,
    error: null,
    refreshInsights: vi.fn(),
    enabled: true,
    setEnabled: vi.fn(),
    isGenerating: false
  }))
}));

describe('StudentInsights Accessibility', () => {
  const mockOnBack = vi.fn();
  const mockOnShowToast = vi.fn();

  it('should render trend icons with proper ARIA attributes', () => {
    const { container } = render(
      <StudentInsights onBack={mockOnBack} onShowToast={mockOnShowToast} />
    );

    const trendIconSpans = container.querySelectorAll('[role="img"][aria-label^="Tren"]');
    
    expect(trendIconSpans.length).toBeGreaterThan(0);
    
    trendIconSpans.forEach((span) => {
      expect(span).toHaveAttribute('role', 'img');
      expect(span.getAttribute('aria-label')).toMatch(/^Tren (Meningkat|Menurun|Stabil)$/);
    });
  });

  it('should include sr-only text labels for screen readers', () => {
    const { container } = render(
      <StudentInsights onBack={mockOnBack} onShowToast={mockOnShowToast} />
    );

    const srOnlyLabels = container.querySelectorAll('.sr-only');
    
    expect(srOnlyLabels.length).toBeGreaterThan(0);
    
    srOnlyLabels.forEach((label) => {
      const labelText = label.textContent?.trim();
      expect(['Meningkat', 'Menurun', 'Stabil']).toContain(labelText);
    });
  });

  it('should use appropriate colors for each trend type', () => {
    const { container } = render(
      <StudentInsights onBack={mockOnBack} onShowToast={mockOnShowToast} />
    );

    const improvingIcon = Array.from(container.querySelectorAll('[role="img"]')).find(
      span => span.getAttribute('aria-label') === 'Tren Meningkat'
    );
    expect(improvingIcon).toHaveClass('text-green-600', 'dark:text-green-400');

    const decliningIcon = Array.from(container.querySelectorAll('[role="img"]')).find(
      span => span.getAttribute('aria-label') === 'Tren Menurun'
    );
    expect(decliningIcon).toHaveClass('text-red-600', 'dark:text-red-400');

    const stableIcon = Array.from(container.querySelectorAll('[role="img"]')).find(
      span => span.getAttribute('aria-label') === 'Tren Stabil'
    );
    expect(stableIcon).toHaveClass('text-blue-600', 'dark:text-blue-400');
  });

  it('should display correct visual icons for each trend', () => {
    const { container } = render(
      <StudentInsights onBack={mockOnBack} onShowToast={mockOnShowToast} />
    );

    const icons = container.querySelectorAll('[role="img"]');
    
    icons.forEach((icon) => {
      const ariaLabel = icon.getAttribute('aria-label');
      const visualIcon = icon.textContent?.replace(/\s/g, '');
      
      // The icon contains both the visual icon and sr-only text
      if (ariaLabel === 'Tren Meningkat') {
        expect(visualIcon).toBe('↗Meningkat');
      } else if (ariaLabel === 'Tren Menurun') {
        expect(visualIcon).toBe('↘Menurun');
      } else if (ariaLabel === 'Tren Stabil') {
        expect(visualIcon).toBe('→Stabil');
      }
    });
  });
});
