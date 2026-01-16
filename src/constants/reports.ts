import type { AvailableMetric, AvailableChart, AvailableTable } from '../types/report.types';

export const AVAILABLE_METRICS: AvailableMetric[] = [
  // Overview Metrics
  {
    id: 'totalStudents',
    label: 'Total Students',
    category: 'overview',
    type: 'number',
    description: 'Total number of students in the system',
  },
  {
    id: 'totalTeachers',
    label: 'Total Teachers',
    category: 'overview',
    type: 'number',
    description: 'Total number of teachers in the system',
  },
  {
    id: 'totalClasses',
    label: 'Total Classes',
    category: 'overview',
    type: 'number',
    description: 'Total number of classes',
  },
  {
    id: 'overallAverageGrade',
    label: 'Overall Average Grade',
    category: 'overview',
    type: 'percentage',
    description: 'Average grade across all students and subjects',
  },
  {
    id: 'overallAttendanceRate',
    label: 'Overall Attendance Rate',
    category: 'overview',
    type: 'percentage',
    description: 'Average attendance rate across all students',
  },

  // Performance Metrics
  {
    id: 'averageGPA',
    label: 'Average GPA',
    category: 'performance',
    type: 'number',
    description: 'Average GPA across all students',
  },
  {
    id: 'improvementRate',
    label: 'Improvement Rate',
    category: 'performance',
    type: 'percentage',
    description: 'Average improvement rate in student performance',
  },
  {
    id: 'assignmentCompletionRate',
    label: 'Assignment Completion Rate',
    category: 'performance',
    type: 'percentage',
    description: 'Percentage of assignments completed on time',
  },

  // Attendance Metrics
  {
    id: 'attendanceRate',
    label: 'Attendance Rate',
    category: 'attendance',
    type: 'percentage',
    description: 'Average attendance rate',
  },
  {
    id: 'attendanceByDay',
    label: 'Attendance by Day',
    category: 'attendance',
    type: 'number',
    description: 'Attendance statistics by day of week',
  },

  // Grade Metrics
  {
    id: 'gradeDistribution',
    label: 'Grade Distribution',
    category: 'grades',
    type: 'percentage',
    description: 'Distribution of grades (A, B, C, D, E)',
  },
  {
    id: 'passRate',
    label: 'Pass Rate',
    category: 'grades',
    type: 'percentage',
    description: 'Percentage of students passing',
  },
];

export const AVAILABLE_CHARTS: AvailableChart[] = [
  {
    id: 'gradeTrend',
    type: 'line',
    label: 'Grade Trend',
    description: 'Line chart showing grade trends over time',
    dataSources: ['studentPerformance', 'teacherEffectiveness', 'schoolWide'],
    requiredMetrics: ['gradeTrend'],
  },
  {
    id: 'attendanceChart',
    type: 'area',
    label: 'Attendance Chart',
    description: 'Area chart showing attendance patterns',
    dataSources: ['schoolWide'],
    requiredMetrics: ['attendanceByDay'],
  },
  {
    id: 'gradeDistribution',
    type: 'pie',
    label: 'Grade Distribution',
    description: 'Pie chart showing grade distribution',
    dataSources: ['schoolWide', 'studentPerformance'],
    requiredMetrics: ['gradeDistribution'],
  },
  {
    id: 'subjectComparison',
    type: 'bar',
    label: 'Subject Comparison',
    description: 'Bar chart comparing performance across subjects',
    dataSources: ['schoolWide', 'studentPerformance', 'teacherEffectiveness'],
    requiredMetrics: ['subjectPerformance'],
  },
  {
    id: 'monthlyTrends',
    type: 'line',
    label: 'Monthly Trends',
    description: 'Line chart showing monthly performance trends',
    dataSources: ['schoolWide'],
    requiredMetrics: ['monthlyTrends'],
  },
  {
    id: 'classPerformance',
    type: 'bar',
    label: 'Class Performance',
    description: 'Bar chart comparing class performance',
    dataSources: ['schoolWide'],
    requiredMetrics: ['classPerformance'],
  },
];

export const AVAILABLE_TABLES: AvailableTable[] = [
  {
    id: 'studentList',
    label: 'Student List',
    description: 'List of all students with basic information',
    dataSource: 'students',
    columns: [
      { key: 'id', label: 'Student ID' },
      { key: 'name', label: 'Name' },
      { key: 'className', label: 'Class' },
      { key: 'gpa', label: 'GPA' },
      { key: 'attendanceRate', label: 'Attendance %' },
    ],
  },
  {
    id: 'teacherList',
    label: 'Teacher List',
    description: 'List of all teachers with performance metrics',
    dataSource: 'teachers',
    columns: [
      { key: 'id', label: 'Teacher ID' },
      { key: 'name', label: 'Name' },
      { key: 'subjects', label: 'Subjects' },
      { key: 'classesTaught', label: 'Classes' },
      { key: 'averageStudentGrade', label: 'Avg Grade' },
    ],
  },
  {
    id: 'classPerformance',
    label: 'Class Performance',
    description: 'Performance metrics for each class',
    dataSource: 'classPerformance',
    columns: [
      { key: 'className', label: 'Class' },
      { key: 'homeroomTeacher', label: 'Teacher' },
      { key: 'studentCount', label: 'Students' },
      { key: 'averageGrade', label: 'Avg Grade' },
      { key: 'attendanceRate', label: 'Attendance %' },
    ],
  },
  {
    id: 'subjectPerformance',
    label: 'Subject Performance',
    description: 'Performance metrics for each subject',
    dataSource: 'subjectPerformance',
    columns: [
      { key: 'subject', label: 'Subject' },
      { key: 'averageScore', label: 'Avg Score' },
      { key: 'passRate', label: 'Pass Rate' },
      { key: 'studentCount', label: 'Students' },
      { key: 'trend', label: 'Trend' },
    ],
  },
  {
    id: 'gradeBreakdown',
    label: 'Grade Breakdown',
    description: 'Detailed grade breakdown by student and subject',
    dataSource: 'grades',
    columns: [
      { key: 'studentId', label: 'Student ID' },
      { key: 'studentName', label: 'Name' },
      { key: 'subject', label: 'Subject' },
      { key: 'grade', label: 'Grade' },
      { key: 'score', label: 'Score' },
    ],
  },
];

export const DEFAULT_REPORT_CONFIG = {
  title: 'Custom Report',
  selectedMetrics: [] as string[],
  selectedCharts: [] as Array<{ type: string; title: string; dataSource: string; metric: string }>,
  selectedTables: [] as Array<{ title: string; dataSource: string; columns: string[] }>,
  dateRange: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: 'Last 30 Days',
  },
  filters: {},
};
