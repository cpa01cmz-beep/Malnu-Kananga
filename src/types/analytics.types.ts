export interface StudentPerformanceAnalytics {
  studentId: string;
  studentName: string;
  className: string;
  overallGPA: number;
  attendanceRate: number;
  subjectPerformance: SubjectPerformance[];
  gradeTrend: GradeTrendData[];
  improvementRate: number;
  rankInClass: number;
  totalStudents: number;
  topSubjects: string[];
  needsImprovement: string[];
  goals: AnalyticsStudentGoal[];
}

export interface TeacherEffectivenessAnalytics {
  teacherId: string;
  teacherName: string;
  subjects: string[];
  classesTaught: string[];
  studentCount: number;
  averageStudentGrade: number;
  attendanceRate: number;
  assignmentCompletionRate: number;
  gradingTimeliness: number;
  studentSatisfaction: number;
  mostEffectiveSubject: string;
  performanceTrend: TeacherPerformanceTrend[];
  topPerformingClasses: string[];
  studentsAtRisk: string[];
}

export interface SchoolWideAnalytics {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  overallAttendanceRate: number;
  overallAverageGrade: number;
  subjectPerformance: SubjectPerformance[];
  classPerformance: ClassPerformance[];
  attendanceByDay: AttendanceByDay[];
  gradeDistribution: GradeDistributionData;
  studentProgression: StudentProgressionData[];
  topPerformingClasses: string[];
  bottomPerformingClasses: string[];
  subjectPopularity: SubjectPopularity[];
  monthlyTrends: MonthlyTrendData[];
}

export interface SubjectPerformance {
  subject: string;
  averageScore: number;
  assignmentScore: number;
  midExamScore: number;
  finalExamScore: number;
  grade: string;
  trend: 'up' | 'down' | 'stable';
  targetGrade?: string;
  studentCount: number;
  passRate: number;
}

export interface GradeTrendData {
  date: string;
  subject: string;
  score: number;
  assignmentType: string;
  movingAverage?: number;
}

export interface TeacherPerformanceTrend {
  period: string;
  averageGrade: number;
  attendanceRate: number;
  assignmentCompletionRate: number;
  studentSatisfaction: number;
}

export interface ClassPerformance {
  classId: string;
  className: string;
  homeroomTeacher: string;
  studentCount: number;
  averageGrade: number;
  attendanceRate: number;
  gradeDistribution: GradeDistributionData;
  topStudent: string;
  subjects: string[];
  trend: 'up' | 'down' | 'stable';
}

export interface AttendanceByDay {
  day: string;
  present: number;
  absent: number;
  sick: number;
  permission: number;
  percentage: number;
}

export interface GradeDistributionData {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  total: number;
}

export interface StudentProgressionData {
  studentId: string;
  studentName: string;
  currentGPA: number;
  previousGPA: number;
  improvement: number;
  attendanceChange: number;
}

export interface SubjectPopularity {
  subject: string;
  studentCount: number;
  averageGrade: number;
  engagement: 'high' | 'medium' | 'low';
}

export interface MonthlyTrendData {
  month: string;
  year: number;
  totalStudents: number;
  averageAttendance: number;
  averageGrade: number;
  topSubject: string;
  bottomSubject: string;
}

export interface AnalyticsFilters {
  dateRange: DateRange;
  role?: 'student' | 'teacher' | 'admin';
  classId?: string;
  subjectId?: string;
  studentId?: string;
  teacherId?: string;
  academicYear?: string;
  semester?: '1' | '2';
}

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
  movingAverage?: number;
}

export interface LineChartData {
  name: string;
  data: ChartDataPoint[];
}

export interface BarChartData {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface AnalyticsExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeTables: boolean;
  dateRange: DateRange;
  filters: AnalyticsFilters;
}

export interface AnalyticsReport {
  title: string;
  generatedAt: string;
  filters: AnalyticsFilters;
  summary: SchoolWideAnalytics | StudentPerformanceAnalytics | TeacherEffectivenessAnalytics;
  charts: AnalyticsChartData[];
  tables: AnalyticsTableData[];
}

export interface AnalyticsChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: LineChartData | BarChartData | PieChartData[];
  description?: string;
}

export interface AnalyticsTableData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  summary?: Record<string, number>;
}

export interface AnalyticsCache {
  timestamp: number;
  filters: AnalyticsFilters;
  data: SchoolWideAnalytics | StudentPerformanceAnalytics | TeacherEffectivenessAnalytics;
}

export interface AnalyticsInsight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  category: 'performance' | 'attendance' | 'engagement' | 'progress';
  title: string;
  description: string;
  value?: number;
  percentage?: number;
  comparison?: string;
  recommendation?: string;
}

export interface AnalyticsPerformanceMetrics {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  improvementTrend: number;
  consistencyScore: number;
}

export interface AnalyticsStudentGoal {
  id: string;
  studentId: string;
  subject: string;
  targetGrade: string;
  currentGrade: number;
  deadline: string;
  status: 'in-progress' | 'achieved' | 'not-achieved';
  createdAt: string;
}
