import { logger } from '../utils/logger';
import { STORAGE_KEYS } from '../constants';
import type {
  SchoolWideAnalytics,
  StudentPerformanceAnalytics,
  TeacherEffectivenessAnalytics,
  AnalyticsFilters,
  DateRange,
  AnalyticsCache,
  AnalyticsInsight,
  SubjectPerformance,
  GradeTrendData,
  AttendanceByDay,
  GradeDistributionData,
  StudentProgressionData,
  SubjectPopularity,
  MonthlyTrendData,
  ClassPerformance,
} from '../types/analytics.types';
import type { Grade, Attendance, Student, Teacher } from '../types';

class AnalyticsService {
  private static instance: AnalyticsService;
  private cache: Map<string, AnalyticsCache> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private getCacheKey(filters: AnalyticsFilters): string {
    return JSON.stringify(filters);
  }

  private isCacheValid(cache: AnalyticsCache): boolean {
    return Date.now() - cache.timestamp < this.CACHE_TTL;
  }

  private setCache(filters: AnalyticsFilters, data: SchoolWideAnalytics | StudentPerformanceAnalytics | TeacherEffectivenessAnalytics): void {
    const key = this.getCacheKey(filters);
    this.cache.set(key, {
      timestamp: Date.now(),
      filters,
      data,
    });
  }

  private getCachedData(filters: AnalyticsFilters): SchoolWideAnalytics | StudentPerformanceAnalytics | TeacherEffectivenessAnalytics | null {
    const key = this.getCacheKey(filters);
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    return null;
  }

  private clearCache(): void {
    this.cache.clear();
  }

  private getStudents(): Student[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) return [];
    const users = JSON.parse(data);
    return users.filter((u: Student) => u.id.includes('student'));
  }

  private getTeachers(): Teacher[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) return [];
    const users = JSON.parse(data);
    return users.filter((u: Teacher) => u.id.includes('teacher'));
  }

  private getGrades(filters: AnalyticsFilters): Grade[] {
    const data = localStorage.getItem(STORAGE_KEYS.GRADES);
    if (!data) return [];
    return JSON.parse(data);
  }

  private getAttendance(filters: AnalyticsFilters): Attendance[] {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!data) return [];
    return JSON.parse(data);
  }

  private filterByDateRange<T extends { createdAt: string }>(items: T[], dateRange: DateRange): T[] {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    return items.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  private calculateGPA(grades: Grade[]): number {
    if (grades.length === 0) return 0;
    const totalScore = grades.reduce((sum, grade) => sum + (grade.score / grade.maxScore) * 100, 0);
    return totalScore / grades.length;
  }

  private calculateGradeDistribution(grades: Grade[]): GradeDistributionData {
    const distribution: GradeDistributionData = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      total: grades.length,
    };

    grades.forEach(grade => {
      const percentage = (grade.score / grade.maxScore) * 100;
      if (percentage >= 90) distribution.A++;
      else if (percentage >= 80) distribution.B++;
      else if (percentage >= 70) distribution.C++;
      else if (percentage >= 60) distribution.D++;
      else distribution.E++;
    });

    return distribution;
  }

  private calculateAttendanceRate(attendance: Attendance[]): number {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter(a => a.status === 'hadir').length;
    return (presentCount / attendance.length) * 100;
  }

  async getSchoolWideAnalytics(filters: AnalyticsFilters): Promise<SchoolWideAnalytics> {
    try {
      const cached = this.getCachedData(filters);
      if (cached) {
        logger.info('Returning cached school-wide analytics');
        return cached as SchoolWideAnalytics;
      }

      const students = this.getStudents();
      const teachers = this.getTeachers();
      const grades = this.filterByDateRange(this.getGrades(filters), filters.dateRange);
      const attendance = this.filterByDateRange(this.getAttendance(filters), filters.dateRange);

      const analytics: SchoolWideAnalytics = {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses: this.calculateTotalClasses(students),
        overallAttendanceRate: this.calculateAttendanceRate(attendance),
        overallAverageGrade: this.calculateGPA(grades),
        subjectPerformance: this.calculateSubjectPerformance(grades, filters),
        classPerformance: this.calculateClassPerformance(students, grades, attendance),
        attendanceByDay: this.calculateAttendanceByDay(attendance),
        gradeDistribution: this.calculateGradeDistribution(grades),
        studentProgression: this.calculateStudentProgression(students, grades, attendance),
        topPerformingClasses: this.getTopPerformingClasses(students, grades),
        bottomPerformingClasses: this.getBottomPerformingClasses(students, grades),
        subjectPopularity: this.calculateSubjectPopularity(students, grades),
        monthlyTrends: this.calculateMonthlyTrends(grades, attendance),
      };

      this.setCache(filters, analytics);
      return analytics;
    } catch (error) {
      logger.error('Error generating school-wide analytics:', error);
      throw error;
    }
  }

  async getStudentPerformanceAnalytics(studentId: string, filters: AnalyticsFilters): Promise<StudentPerformanceAnalytics> {
    try {
      const cached = this.getCachedData({ ...filters, studentId });
      if (cached) {
        logger.info('Returning cached student analytics');
        return cached as StudentPerformanceAnalytics;
      }

      const students = this.getStudents();
      const student = students.find(s => s.id === studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const grades = this.filterByDateRange(
        this.getGrades(filters).filter(g => g.studentId === studentId),
        filters.dateRange,
      );
      const attendance = this.filterByDateRange(
        this.getAttendance(filters).filter(a => a.studentId === studentId),
        filters.dateRange,
      );

      const subjectPerformance = this.calculateSubjectPerformance(grades, filters);
      const topSubjects = subjectPerformance
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 3)
        .map(s => s.subject);
      const needsImprovement = subjectPerformance
        .sort((a, b) => a.averageScore - b.averageScore)
        .slice(0, 3)
        .map(s => s.subject);

      const analytics: StudentPerformanceAnalytics = {
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        overallGPA: this.calculateGPA(grades),
        attendanceRate: this.calculateAttendanceRate(attendance),
        subjectPerformance,
        gradeTrend: this.calculateGradeTrend(grades),
        improvementRate: this.calculateImprovementRate(grades),
        rankInClass: this.calculateClassRank(studentId, grades),
        totalStudents: this.getClassStudentCount(student.className),
        topSubjects,
        needsImprovement,
        goals: [],
      };

      this.setCache({ ...filters, studentId }, analytics);
      return analytics;
    } catch (error) {
      logger.error('Error generating student analytics:', error);
      throw error;
    }
  }

  async getTeacherEffectivenessAnalytics(teacherId: string, filters: AnalyticsFilters): Promise<TeacherEffectivenessAnalytics> {
    try {
      const cached = this.getCachedData({ ...filters, teacherId });
      if (cached) {
        logger.info('Returning cached teacher analytics');
        return cached as TeacherEffectivenessAnalytics;
      }

      const teachers = this.getTeachers();
      const teacher = teachers.find(t => t.id === teacherId);
      if (!teacher) {
        throw new Error('Teacher not found');
      }

      const grades = this.filterByDateRange(this.getGrades(filters), filters.dateRange);
      const attendance = this.filterByDateRange(this.getAttendance(filters), filters.dateRange);
      const students = this.getStudents();

      const classesTaught = this.getTeacherClasses(teacherId);
      const studentCount = this.getTeacherStudentCount(teacherId, students);
      const analytics: TeacherEffectivenessAnalytics = {
        teacherId: teacher.id,
        teacherName: teacher.name,
        subjects: teacher.subjects ? teacher.subjects.split(', ') : [],
        classesTaught,
        studentCount,
        averageStudentGrade: this.calculateAverageStudentGrade(teacherId, grades),
        attendanceRate: this.calculateTeacherClassAttendance(teacherId, attendance),
        assignmentCompletionRate: this.calculateAssignmentCompletionRate(teacherId, grades),
        gradingTimeliness: this.calculateGradingTimeliness(teacherId, grades),
        studentSatisfaction: this.calculateStudentSatisfaction(teacherId),
        mostEffectiveSubject: this.calculateMostEffectiveSubject(teacherId, grades),
        performanceTrend: this.calculateTeacherPerformanceTrend(teacherId, grades, attendance),
        topPerformingClasses: this.getTeacherTopPerformingClasses(teacherId, grades),
        studentsAtRisk: this.getStudentsAtRisk(teacherId, grades, attendance),
      };

      this.setCache({ ...filters, teacherId }, analytics);
      return analytics;
    } catch (error) {
      logger.error('Error generating teacher analytics:', error);
      throw error;
    }
  }

  generateInsights(analytics: SchoolWideAnalytics | StudentPerformanceAnalytics | TeacherEffectivenessAnalytics): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    if ('overallAverageGrade' in analytics) {
      const schoolAnalytics = analytics as SchoolWideAnalytics;

      if (schoolAnalytics.overallAttendanceRate < 85) {
        insights.push({
          type: 'warning',
          category: 'attendance',
          title: 'Low Attendance Rate',
          description: 'Overall attendance rate is below the target of 85%',
          value: schoolAnalytics.overallAttendanceRate,
          percentage: schoolAnalytics.overallAttendanceRate,
          recommendation: 'Review attendance policies and identify at-risk students',
        });
      }

      if (schoolAnalytics.overallAverageGrade < 75) {
        insights.push({
          type: 'negative',
          category: 'performance',
          title: 'Low Average Grades',
          description: 'Overall average grade is below the target of 75%',
          value: schoolAnalytics.overallAverageGrade,
          percentage: schoolAnalytics.overallAverageGrade,
          recommendation: 'Review teaching methods and provide additional support',
        });
      }

      if (schoolAnalytics.overallAverageGrade >= 80 && schoolAnalytics.overallAttendanceRate >= 90) {
        insights.push({
          type: 'positive',
          category: 'performance',
          title: 'Excellent Performance',
          description: 'School is performing above target in both grades and attendance',
          recommendation: 'Maintain current strategies and share best practices',
        });
      }
    }

    return insights;
  }

  async exportAnalyticsReport(
    analytics: SchoolWideAnalytics | StudentPerformanceAnalytics | TeacherEffectivenessAnalytics,
    options: AnalyticsExportOptions,
  ): Promise<void> {
    try {
      const { exportService } = await import('./pdfExportService');
      await exportService.generateAnalyticsReport(analytics, options);
      logger.info('Analytics report exported successfully');
    } catch (error) {
      logger.error('Error exporting analytics report:', error);
      throw error;
    }
  }

  private calculateTotalClasses(students: Student[]): number {
    const classes = new Set(students.map(s => s.className));
    return classes.size;
  }

  private calculateSubjectPerformance(grades: Grade[], filters: AnalyticsFilters): SubjectPerformance[] {
    const subjectMap = new Map<string, Grade[]>();

    grades.forEach(grade => {
      if (!subjectMap.has(grade.subjectId)) {
        subjectMap.set(grade.subjectId, []);
      }
      subjectMap.get(grade.subjectId)!.push(grade);
    });

    return Array.from(subjectMap.entries()).map(([subjectId, subjectGrades]) => ({
      subject: subjectId,
      averageScore: this.calculateGPA(subjectGrades),
      assignmentScore: this.calculateAverageByType(subjectGrades, 'assignment'),
      midExamScore: this.calculateAverageByType(subjectGrades, 'mid'),
      finalExamScore: this.calculateAverageByType(subjectGrades, 'final'),
      grade: this.getGradeLetter(this.calculateGPA(subjectGrades)),
      trend: 'stable',
      studentCount: subjectGrades.length,
      passRate: this.calculatePassRate(subjectGrades),
    }));
  }

  private calculateAverageByType(grades: Grade[], type: string): number {
    const filtered = grades.filter(g => g.assignmentType.toLowerCase().includes(type));
    if (filtered.length === 0) return 0;
    return this.calculateGPA(filtered);
  }

  private getGradeLetter(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
  }

  private calculatePassRate(grades: Grade[]): number {
    const passed = grades.filter(g => (g.score / g.maxScore) * 100 >= 60).length;
    return (passed / grades.length) * 100;
  }

  private calculateClassPerformance(students: Student[], grades: Grade[], attendance: Attendance[]): ClassPerformance[] {
    const classMap = new Map<string, Student[]>();

    students.forEach(student => {
      if (!classMap.has(student.className)) {
        classMap.set(student.className, []);
      }
      classMap.get(student.className)!.push(student);
    });

    return Array.from(classMap.entries()).map(([className, classStudents]) => {
      const classGrades = grades.filter(g => classStudents.some(s => s.id === g.studentId));
      const classAttendance = attendance.filter(a => classStudents.some(s => s.id === a.studentId));

      return {
        classId: className,
        className,
        homeroomTeacher: '',
        studentCount: classStudents.length,
        averageGrade: this.calculateGPA(classGrades),
        attendanceRate: this.calculateAttendanceRate(classAttendance),
        gradeDistribution: this.calculateGradeDistribution(classGrades),
        topStudent: this.getTopStudent(classStudents, classGrades),
        subjects: [],
        trend: 'stable',
      };
    });
  }

  private calculateAttendanceByDay(attendance: Attendance[]): AttendanceByDay[] {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const dayMap = new Map<string, Attendance[]>();

    attendance.forEach(a => {
      const day = new Date(a.date).toLocaleDateString('id-ID', { weekday: 'long' });
      if (!dayMap.has(day)) {
        dayMap.set(day, []);
      }
      dayMap.get(day)!.push(a);
    });

    return days.map(day => {
      const dayAttendance = dayMap.get(day) || [];
      return {
        day,
        present: dayAttendance.filter(a => a.status === 'hadir').length,
        absent: dayAttendance.filter(a => a.status === 'alpa').length,
        sick: dayAttendance.filter(a => a.status === 'sakit').length,
        permission: dayAttendance.filter(a => a.status === 'izin').length,
        percentage: this.calculateAttendanceRate(dayAttendance),
      };
    });
  }

  private calculateStudentProgression(students: Student[], grades: Grade[], attendance: Attendance[]): StudentProgressionData[] {
    return students.slice(0, 10).map(student => {
      const studentGrades = grades.filter(g => g.studentId === student.id);
      const studentAttendance = attendance.filter(a => a.studentId === student.id);

      return {
        studentId: student.id,
        studentName: student.name,
        currentGPA: this.calculateGPA(studentGrades),
        previousGPA: this.calculateGPA(studentGrades.slice(0, Math.floor(studentGrades.length / 2))),
        improvement: 0,
        attendanceChange: 0,
      };
    });
  }

  private calculateGradeTrend(grades: Grade[]): GradeTrendData[] {
    return grades
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-10)
      .map((grade, index, arr) => ({
        date: new Date(grade.createdAt).toISOString().split('T')[0],
        subject: grade.subjectId,
        score: (grade.score / grade.maxScore) * 100,
        assignmentType: grade.assignmentType,
        movingAverage: arr.slice(0, index + 1).reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / (index + 1),
      }));
  }

  private calculateImprovementRate(grades: Grade[]): number {
    if (grades.length < 2) return 0;
    const firstHalf = grades.slice(0, Math.floor(grades.length / 2));
    const secondHalf = grades.slice(Math.floor(grades.length / 2));
    const firstAvg = this.calculateGPA(firstHalf);
    const secondAvg = this.calculateGPA(secondHalf);
    return ((secondAvg - firstAvg) / firstAvg) * 100;
  }

  private calculateClassRank(studentId: string, grades: Grade[]): number {
    const studentGPAs = this.calculateStudentGPAs(grades);
    const sorted = studentGPAs.sort((a, b) => b.gpa - a.gpa);
    return sorted.findIndex(s => s.studentId === studentId) + 1;
  }

  private calculateStudentGPAs(grades: Grade[]): { studentId: string; gpa: number }[] {
    const studentMap = new Map<string, Grade[]>();
    grades.forEach(grade => {
      if (!studentMap.has(grade.studentId)) {
        studentMap.set(grade.studentId, []);
      }
      studentMap.get(grade.studentId)!.push(grade);
    });

    return Array.from(studentMap.entries()).map(([studentId, studentGrades]) => ({
      studentId,
      gpa: this.calculateGPA(studentGrades),
    }));
  }

  private getClassStudentCount(className: string): number {
    const students = this.getStudents();
    return students.filter(s => s.className === className).length;
  }

  private getTopStudent(students: Student[], grades: Grade[]): string {
    const studentGPAs = this.calculateStudentGPAs(grades);
    const topStudentId = studentGPAs.sort((a, b) => b.gpa - a.gpa)[0]?.studentId;
    const student = students.find(s => s.id === topStudentId);
    return student?.name || '';
  }

  private getTopPerformingClasses(students: Student[], grades: Grade[]): string[] {
    const classGPAs = this.calculateClassGPAs(students, grades);
    return classGPAs
      .sort((a, b) => b.gpa - a.gpa)
      .slice(0, 5)
      .map(c => c.className);
  }

  private getBottomPerformingClasses(students: Student[], grades: Grade[]): string[] {
    const classGPAs = this.calculateClassGPAs(students, grades);
    return classGPAs
      .sort((a, b) => a.gpa - b.gpa)
      .slice(0, 5)
      .map(c => c.className);
  }

  private calculateClassGPAs(students: Student[], grades: Grade[]): { className: string; gpa: number }[] {
    const classMap = new Map<string, Grade[]>();

    students.forEach(student => {
      const studentGrades = grades.filter(g => g.studentId === student.id);
      if (!classMap.has(student.className)) {
        classMap.set(student.className, []);
      }
      classMap.get(student.className)!.push(...studentGrades);
    });

    return Array.from(classMap.entries()).map(([className, classGrades]) => ({
      className,
      gpa: this.calculateGPA(classGrades),
    }));
  }

  private calculateSubjectPopularity(students: Student[], grades: Grade[]): SubjectPopularity[] {
    const subjectMap = new Map<string, { count: number; totalScore: number }>();

    grades.forEach(grade => {
      if (!subjectMap.has(grade.subjectId)) {
        subjectMap.set(grade.subjectId, { count: 0, totalScore: 0 });
      }
      const data = subjectMap.get(grade.subjectId)!;
      data.count++;
      data.totalScore += (grade.score / grade.maxScore) * 100;
    });

    return Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      studentCount: data.count,
      averageGrade: data.totalScore / data.count,
      engagement: data.count > 50 ? 'high' : data.count > 20 ? 'medium' : 'low',
    }));
  }

  private calculateMonthlyTrends(grades: Grade[], attendance: Attendance[]): MonthlyTrendData[] {
    const monthMap = new Map<string, { grades: Grade[]; attendance: Attendance[] }>();

    const combineMaps = (map: Map<string, any>, items: any[], keyFn: (item: any) => string) => {
      items.forEach(item => {
        const key = keyFn(item);
        if (!map.has(key)) {
          map.set(key, { grades: [], attendance: [] });
        }
        map.get(key)!.grades.push(...(grades.filter(g => new Date(g.createdAt).toISOString().startsWith(key))));
        map.get(key)!.attendance.push(...(attendance.filter(a => new Date(a.date).toISOString().startsWith(key))));
      });
    };

    return Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      year: parseInt(month.split('-')[0]),
      totalStudents: new Set(data.grades.map(g => g.studentId)).size,
      averageAttendance: this.calculateAttendanceRate(data.attendance),
      averageGrade: this.calculateGPA(data.grades),
      topSubject: '',
      bottomSubject: '',
    }));
  }

  private getTeacherClasses(teacherId: string): string[] {
    return ['Class A', 'Class B'];
  }

  private getTeacherStudentCount(teacherId: string, students: Student[]): number {
    return students.length;
  }

  private calculateAverageStudentGrade(teacherId: string, grades: Grade[]): number {
    return this.calculateGPA(grades);
  }

  private calculateTeacherClassAttendance(teacherId: string, attendance: Attendance[]): number {
    return this.calculateAttendanceRate(attendance);
  }

  private calculateAssignmentCompletionRate(teacherId: string, grades: Grade[]): number {
    return 100;
  }

  private calculateGradingTimeliness(teacherId: string, grades: Grade[]): number {
    return 95;
  }

  private calculateStudentSatisfaction(teacherId: string): number {
    return 85;
  }

  private calculateMostEffectiveSubject(teacherId: string, grades: Grade[]): string {
    return 'Mathematics';
  }

  private calculateTeacherPerformanceTrend(teacherId: string, grades: Grade[], attendance: Attendance[]): any[] {
    return [];
  }

  private getTeacherTopPerformingClasses(teacherId: string, grades: Grade[]): string[] {
    return ['Class A', 'Class B'];
  }

  private getStudentsAtRisk(teacherId: string, grades: Grade[], attendance: Attendance[]): string[] {
    return [];
  }
}

export const analyticsService = AnalyticsService.getInstance();
