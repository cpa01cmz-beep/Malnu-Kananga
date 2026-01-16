import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PerformanceTrendChart, AttendanceChart, GradeDistributionChart, SubjectComparisonChart } from '../AnalyticsCharts';
import type { LineChartData } from '../../../types/analytics.types';

describe('AnalyticsCharts', () => {
  describe('PerformanceTrendChart', () => {
    it('should render chart with data', () => {
      const data: LineChartData = {
        name: 'Performance Trend',
        data: [
          { name: 'Jan', value: 85 },
          { name: 'Feb', value: 88 },
          { name: 'Mar', value: 92 },
        ],
      };

      render(<PerformanceTrendChart data={data} height={300} />);

      expect(screen.getByText('Performance Trend')).toBeInTheDocument();
    });

    it('should render chart with moving average', () => {
      const data: LineChartData = {
        name: 'Performance Trend',
        data: [
          { name: 'Jan', value: 85, movingAverage: 85 },
          { name: 'Feb', value: 88, movingAverage: 86.5 },
        ],
      };

      render(<PerformanceTrendChart data={data} height={300} showMovingAverage />);

      expect(screen.getByText('Performance Trend')).toBeInTheDocument();
    });

    it('should render with custom height', () => {
      const data: LineChartData = {
        name: 'Performance Trend',
        data: [{ name: 'Jan', value: 85 }],
      };

      const { container } = render(<PerformanceTrendChart data={data} height={400} />);

      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toHaveStyle({ height: '400px' });
    });
  });

  describe('AttendanceChart', () => {
    it('should render chart with attendance data', () => {
      const data = [
        {
          day: 'Senin',
          present: 45,
          absent: 2,
          sick: 1,
          permission: 2,
          percentage: 91.8,
        },
        {
          day: 'Selasa',
          present: 48,
          absent: 1,
          sick: 1,
          permission: 0,
          percentage: 96,
        },
      ];

      render(<AttendanceChart data={data} height={300} />);

      expect(screen.getByText('Attendance by Day')).toBeInTheDocument();
    });

    it('should render with custom height', () => {
      const data = [
        {
          day: 'Senin',
          present: 45,
          absent: 2,
          sick: 1,
          permission: 2,
          percentage: 91.8,
        },
      ];

      const { container } = render(<AttendanceChart data={data} height={400} />);

      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toHaveStyle({ height: '400px' });
    });
  });

  describe('GradeDistributionChart', () => {
    it('should render chart with grade distribution data', () => {
      const data = {
        A: 15,
        B: 20,
        C: 10,
        D: 5,
        E: 2,
        total: 52,
      };

      render(<GradeDistributionChart data={data} height={300} />);

      expect(screen.getByText('Grade Distribution (52 students)')).toBeInTheDocument();
    });

    it('should filter out empty grades', () => {
      const data = {
        A: 15,
        B: 20,
        C: 10,
        D: 0,
        E: 0,
        total: 45,
      };

      render(<GradeDistributionChart data={data} height={300} />);

      expect(screen.getByText('Grade Distribution (45 students)')).toBeInTheDocument();
    });

    it('should render with custom height', () => {
      const data = {
        A: 15,
        B: 20,
        C: 10,
        D: 5,
        E: 2,
        total: 52,
      };

      const { container } = render(<GradeDistributionChart data={data} height={400} />);

      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toHaveStyle({ height: '400px' });
    });
  });

  describe('SubjectComparisonChart', () => {
    it('should render chart with subject comparison data', () => {
      const data = [
        {
          subject: 'Mathematics',
          averageScore: 85,
          assignmentScore: 88,
          midExamScore: 84,
          finalExamScore: 83,
        },
        {
          subject: 'Physics',
          averageScore: 78,
          assignmentScore: 80,
          midExamScore: 77,
          finalExamScore: 77,
        },
      ];

      render(<SubjectComparisonChart data={data} height={300} />);

      expect(screen.getByText('Subject Performance Comparison')).toBeInTheDocument();
    });

    it('should render with custom height', () => {
      const data = [
        {
          subject: 'Mathematics',
          averageScore: 85,
          assignmentScore: 88,
          midExamScore: 84,
          finalExamScore: 83,
        },
      ];

      const { container } = render(<SubjectComparisonChart data={data} height={400} />);

      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toHaveStyle({ height: '400px' });
    });
  });
});
