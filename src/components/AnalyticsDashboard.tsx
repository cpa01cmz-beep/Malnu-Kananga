import React, { useState, useCallback } from 'react';
import {
  ChartBarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { analyticsService } from '../../services/analyticsService';
import { logger } from '../../utils/logger';
import type {
  SchoolWideAnalytics,
  StudentPerformanceAnalytics,
  TeacherEffectivenessAnalytics,
  AnalyticsFilters,
  AnalyticsInsight,
  MonthlyTrendData,
  GradeTrendData,
} from '../../types/analytics.types';
import type { UserRole } from '../../types';
import DateRangeFilter from './DateRangeFilter';
import {
  PerformanceTrendChart,
  AttendanceChart,
  GradeDistributionChart,
  SubjectComparisonChart,
} from './AnalyticsCharts';

interface AnalyticsDashboardProps {
  userRole: UserRole;
  userId?: string;
  onShowToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userRole,
  userId,
  onShowToast,
}) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<
    SchoolWideAnalytics | StudentPerformanceAnalytics | TeacherEffectivenessAnalytics | null
  >(null);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'attendance' | 'grades'>('overview');
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      label: 'Last 30 Days',
    },
    role: userRole,
    academicYear: new Date().getFullYear().toString(),
    semester: '1',
  });

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      let data: SchoolWideAnalytics | StudentPerformanceAnalytics | TeacherEffectivenessAnalytics;

      if (userRole === 'admin') {
        data = await analyticsService.getSchoolWideAnalytics(filters);
      } else if (userRole === 'student' && userId) {
        data = await analyticsService.getStudentPerformanceAnalytics(userId, filters);
      } else if (userRole === 'teacher' && userId) {
        data = await analyticsService.getTeacherEffectivenessAnalytics(userId, filters);
      } else {
        throw new Error('Invalid role or missing user ID');
      }

      setAnalytics(data);
      setInsights(analyticsService.generateInsights(data));
      onShowToast('Analytics loaded successfully', 'success');
    } catch (error) {
      logger.error('Error loading analytics:', error);
      onShowToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, userRole, userId, onShowToast]);

  const handleFiltersChange = (newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    loadAnalytics();
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!analytics) return;

    try {
      await analyticsService.exportAnalyticsReport(analytics, {
        format,
        includeCharts: true,
        includeTables: true,
        dateRange: filters.dateRange,
        filters,
      });
      onShowToast(`Report exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      logger.error('Error exporting report:', error);
      onShowToast('Failed to export report', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-500 dark:text-neutral-400">
        <ExclamationTriangleIcon className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Export as PDF"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Export as Excel"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      <DateRangeFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
      />

      {insights.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Insights & Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  insight.type === 'positive'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : insight.type === 'negative'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : insight.type === 'warning'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {insight.type === 'positive' ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : insight.type === 'negative' ? (
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      {insight.description}
                    </p>
                    {insight.recommendation && (
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">
                        💡 {insight.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Key Metrics
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'performance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'attendance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'grades'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
              }`}
            >
              Grades
            </button>
          </div>
        </div>

        {activeTab === 'overview' && <OverviewTab analytics={analytics} />}
        {activeTab === 'performance' && <PerformanceTab analytics={analytics} />}
        {activeTab === 'attendance' && <AttendanceTab analytics={analytics} />}
        {activeTab === 'grades' && <GradesTab analytics={analytics} />}
      </div>
    </div>
  );
};

const OverviewTab: React.FC<{
  analytics: SchoolWideAnalytics | StudentPerformanceAnalytics | TeacherEffectivenessAnalytics;
}> = ({ analytics }) => {
  if ('totalStudents' in analytics) {
    const schoolAnalytics = analytics as SchoolWideAnalytics;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<UserGroupIcon className="w-8 h-8" />}
          title="Total Students"
          value={schoolAnalytics.totalStudents}
          color="blue"
        />
        <MetricCard
          icon={<AcademicCapIcon className="w-8 h-8" />}
          title="Average Grade"
          value={`${schoolAnalytics.overallAverageGrade.toFixed(1)}%`}
          color="green"
        />
        <MetricCard
          icon={<CalendarIcon className="w-8 h-8" />}
          title="Attendance Rate"
          value={`${schoolAnalytics.overallAttendanceRate.toFixed(1)}%`}
          color="purple"
        />
        <MetricCard
          icon={<ChartBarIcon className="w-8 h-8" />}
          title="Total Teachers"
          value={schoolAnalytics.totalTeachers}
          color="orange"
        />
      </div>
    );
  }

  if ('studentName' in analytics) {
    const studentAnalytics = analytics as StudentPerformanceAnalytics;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<AcademicCapIcon className="w-8 h-8" />}
          title="GPA"
          value={studentAnalytics.overallGPA.toFixed(2)}
          color="blue"
        />
        <MetricCard
          icon={<CalendarIcon className="w-8 h-8" />}
          title="Attendance"
          value={`${studentAnalytics.attendanceRate.toFixed(1)}%`}
          color="green"
        />
        <MetricCard
          icon={<UserGroupIcon className="w-8 h-8" />}
          title="Class Rank"
          value={`${studentAnalytics.rankInClass}/${studentAnalytics.totalStudents}`}
          color="purple"
        />
        <MetricCard
          icon={<ChartBarIcon className="w-8 h-8" />}
          title="Improvement"
          value={`${studentAnalytics.improvementRate.toFixed(1)}%`}
          color="orange"
          trend={studentAnalytics.improvementRate >= 0 ? 'up' : 'down'}
        />
      </div>
    );
  }

  return null;
};

const PerformanceTab: React.FC<{
  analytics: SchoolWideAnalytics | StudentPerformanceAnalytics | TeacherEffectivenessAnalytics;
}> = ({ analytics }) => {
  if ('subjectPerformance' in analytics) {
    const schoolAnalytics = analytics as SchoolWideAnalytics;
    return (
      <div className="space-y-6">
        <SubjectComparisonChart data={schoolAnalytics.subjectPerformance} height={400} />
        {schoolAnalytics.monthlyTrends.length > 0 && (
          <PerformanceTrendChart
            data={{
              name: 'Monthly Grade Trends',
              data: schoolAnalytics.monthlyTrends.map((trend: MonthlyTrendData) => ({
                name: trend.month,
                value: trend.averageGrade,
              })),
            }}
            height={350}
          />
        )}
      </div>
    );
  }

  if ('subjectPerformance' in analytics) {
    const studentAnalytics = analytics as StudentPerformanceAnalytics;
    return (
      <div className="space-y-6">
        <SubjectComparisonChart data={studentAnalytics.subjectPerformance} height={400} />
        <PerformanceTrendChart
          data={{
            name: 'Grade Trend',
            data: studentAnalytics.gradeTrend.map((trend: GradeTrendData) => ({
              name: trend.date,
              value: trend.score,
              movingAverage: trend.movingAverage,
            })),
          }}
          height={350}
          showMovingAverage
        />
      </div>
    );
  }

  return <p className="text-neutral-600 dark:text-neutral-400">No performance data available</p>;
};

const AttendanceTab: React.FC<{
  analytics: SchoolWideAnalytics | StudentPerformanceAnalytics | TeacherEffectivenessAnalytics;
}> = ({ analytics }) => {
  if ('attendanceByDay' in analytics) {
    const schoolAnalytics = analytics as SchoolWideAnalytics;
    return <AttendanceChart data={schoolAnalytics.attendanceByDay} height={400} />;
  }

  if ('attendanceRate' in analytics) {
    const studentAnalytics = analytics as StudentPerformanceAnalytics;
    return (
      <div className="text-center py-12">
        <CalendarIcon className="w-16 h-16 mx-auto text-purple-600 dark:text-purple-400 mb-4" />
        <p className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          {studentAnalytics.attendanceRate.toFixed(1)}%
        </p>
        <p className="text-neutral-600 dark:text-neutral-400">Overall Attendance Rate</p>
      </div>
    );
  }

  return <p className="text-neutral-600 dark:text-neutral-400">No attendance data available</p>;
};

const GradesTab: React.FC<{
  analytics: SchoolWideAnalytics | StudentPerformanceAnalytics | TeacherEffectivenessAnalytics;
}> = ({ analytics }) => {
  if ('gradeDistribution' in analytics) {
    const schoolAnalytics = analytics as SchoolWideAnalytics;
    return <GradeDistributionChart data={schoolAnalytics.gradeDistribution} height={400} />;
  }

  return <p className="text-neutral-600 dark:text-neutral-400">No grade distribution data available</p>;
};

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: 'up' | 'down';
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-500',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-500',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-500',
  };

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
  };

  return (
    <div className={`${colorClasses[color]} border-l-4 rounded-lg p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className={iconColorClasses[color]}>{icon}</div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
    </div>
  );
};

export default AnalyticsDashboard;
