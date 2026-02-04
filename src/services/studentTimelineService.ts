import { STORAGE_KEYS } from '../constants';
import {
  type Grade,
  type Attendance,
  type Assignment,
  type AssignmentSubmission,
  type ELibrary,
  type Bookmark,
  type MaterialRating,
  type DirectMessage,
  type Announcement,
  AnnouncementCategory,
  type SchoolEvent,
} from '../types';
import { logger } from '../utils/logger';
import type {
  TimelineEvent,
  TimelineEventType,
  TimelineFilter,
  TimelineOptions,
  TimelineStats,
  GradeEventData,
  AssignmentEventData,
  SubmissionEventData,
  AttendanceEventData,
  MaterialAccessEventData,
  MaterialDownloadEventData,
  MaterialRatingEventData,
  MaterialBookmarkEventData,
  MessageEventData,
  AnnouncementEventData,
  EventEventData,
} from '../types/timeline';

const TIMELINE_CACHE_TTL = 300000;

interface TimelineCache {
  events: TimelineEvent[];
  timestamp: number;
  filters: TimelineFilter;
}

class StudentTimelineService {
  private static instance: StudentTimelineService;
  private cache: Map<string, TimelineCache> = new Map();

  private constructor() {}

  static getInstance(): StudentTimelineService {
    if (!StudentTimelineService.instance) {
      StudentTimelineService.instance = new StudentTimelineService();
    }
    return StudentTimelineService.instance;
  }

  async getTimeline(
    studentId: string,
    options?: TimelineOptions
  ): Promise<TimelineEvent[]> {
    const cacheKey = JSON.stringify({ studentId, options });
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < TIMELINE_CACHE_TTL) {
      logger.debug(`TimelineService: Returning cached timeline for ${studentId}`);
      return this.applyOptions(cached.events, options);
    }

    logger.info(`TimelineService: Building timeline for ${studentId}`);

    const events: TimelineEvent[] = [];

    try {
      const [
        grades,
        assignments,
        submissions,
        attendance,
        materials,
        bookmarks,
        ratings,
        messages,
        announcements,
        schoolEvents,
      ] = await Promise.all([
        this.getGrades(studentId),
        this.getAssignments(studentId),
        this.getSubmissions(studentId),
        this.getAttendance(studentId),
        this.getMaterials(studentId),
        this.getBookmarks(studentId),
        this.getRatings(studentId),
        this.getMessages(studentId),
        this.getAnnouncements(),
        this.getSchoolEvents(studentId),
      ]);

      events.push(...grades);
      events.push(...assignments);
      events.push(...submissions);
      events.push(...attendance);
      events.push(...materials);
      events.push(...bookmarks);
      events.push(...ratings);
      events.push(...messages);
      events.push(...announcements);
      events.push(...schoolEvents);

      const sortedEvents = this.applyOptions(events, options);

      this.cache.set(cacheKey, {
        events: sortedEvents,
        timestamp: Date.now(),
        filters: {},
      });

      this.saveTimelineToStorage(studentId, sortedEvents);

      return sortedEvents;
    } catch (error) {
      logger.error(`TimelineService: Failed to build timeline for ${studentId}`, error);
      throw error;
    }
  }

  async getFilteredTimeline(
    studentId: string,
    filter: TimelineFilter,
    options?: TimelineOptions
  ): Promise<TimelineEvent[]> {
    logger.debug(`TimelineService: Getting filtered timeline for ${studentId}`, filter);

    const allEvents = await this.getTimeline(studentId);
    const filteredEvents = StudentTimelineService.applyFilter(allEvents, filter);

    return this.applyOptions(filteredEvents, options);
  }

  static applyFilter(events: TimelineEvent[], filter: TimelineFilter): TimelineEvent[] {
    return events.filter((event) => {
      if (filter.eventTypes && filter.eventTypes.length > 0) {
        if (!filter.eventTypes.includes(event.type)) {
          return false;
        }
      }

      if (filter.dateRange) {
        const eventDate = new Date(event.timestamp);
        const startDate = new Date(filter.dateRange.startDate);
        const endDate = new Date(filter.dateRange.endDate);
        if (eventDate < startDate || eventDate > endDate) {
          return false;
        }
      }

      if (filter.minScore !== undefined && event.type === 'grade') {
        const gradeData = event.data as GradeEventData;
        if (gradeData.score < filter.minScore) {
          return false;
        }
      }

      if (filter.maxScore !== undefined && event.type === 'grade') {
        const gradeData = event.data as GradeEventData;
        if (gradeData.score > filter.maxScore) {
          return false;
        }
      }

      return true;
    });
  }

  async getTimelineStats(studentId: string): Promise<TimelineStats> {
    logger.debug(`TimelineService: Getting stats for ${studentId}`);

    const events = await this.getTimeline(studentId);

    const eventsByType: Record<TimelineEventType, number> = {
      grade: 0,
      assignment: 0,
      submission: 0,
      attendance: 0,
      material_access: 0,
      material_download: 0,
      material_rating: 0,
      material_bookmark: 0,
      message_sent: 0,
      message_received: 0,
      announcement: 0,
      event: 0,
      system: 0,
    };

    let totalScore = 0;
    let gradeCount = 0;
    let presentCount = 0;
    let totalAttendance = 0;

    for (const event of events) {
      eventsByType[event.type]++;

      if (event.type === 'grade') {
        const gradeData = event.data as GradeEventData;
        totalScore += gradeData.score;
        gradeCount++;
      }

      if (event.type === 'attendance') {
        const attendanceData = event.data as AttendanceEventData;
        totalAttendance++;
        if (attendanceData.status === 'hadir') {
          presentCount++;
        }
      }
    }

    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      totalEvents: events.length,
      eventsByType,
      dateRange: {
        firstEvent: sortedEvents[0]?.timestamp || '',
        lastEvent: sortedEvents[sortedEvents.length - 1]?.timestamp || '',
      },
      averageScore: gradeCount > 0 ? totalScore / gradeCount : undefined,
      attendanceRate:
        totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : undefined,
      totalMaterialsAccessed: eventsByType.material_access,
      totalMessages: eventsByType.message_sent + eventsByType.message_received,
    };
  }

  async addEvent(event: TimelineEvent): Promise<void> {
    logger.info(`TimelineService: Adding event ${event.id} for ${event.studentId}`);

    const cacheKey = JSON.stringify({ studentId: event.studentId });
    const cached = this.cache.get(cacheKey);

    if (cached) {
      cached.events.push(event);
      cached.timestamp = Date.now();
      this.cache.set(cacheKey, cached);
      this.saveTimelineToStorage(event.studentId, cached.events);
    }
  }

  private applyOptions(events: TimelineEvent[], options?: TimelineOptions): TimelineEvent[] {
    let result = [...events];

    if (options?.sortBy === 'timestamp') {
      result.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return options.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    if (options?.limit !== undefined) {
      const offset = options.offset || 0;
      result = result.slice(offset, offset + options.limit);
    }

    return result;
  }

  private async getGrades(studentId: string): Promise<TimelineEvent[]> {
    try {
      const grades = this.getItem<Grade[]>(STORAGE_KEYS.GRADES) || [];
      return grades
        .filter((g) => g.studentId === studentId)
        .map((grade) => this.mapGradeToEvent(grade));
    } catch (error) {
      logger.error('TimelineService: Failed to load grades', error);
      return [];
    }
  }

  private async getAssignments(studentId: string): Promise<TimelineEvent[]> {
    try {
      const assignments = this.getItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS) || [];
      return assignments
        .filter((a) => a.classId)
        .map((assignment) => this.mapAssignmentToEvent(assignment, studentId));
    } catch (error) {
      logger.error('TimelineService: Failed to load assignments', error);
      return [];
    }
  }

  private async getSubmissions(studentId: string): Promise<TimelineEvent[]> {
    try {
      const submissions =
        this.getItem<AssignmentSubmission[]>(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS) || [];
      const assignments = this.getItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS) || [];

      return submissions
        .filter((s) => s.studentId === studentId)
        .map((submission) => {
          const assignment = assignments.find((a) => a.id === submission.assignmentId);
          return this.mapSubmissionToEvent(submission, assignment);
        });
    } catch (error) {
      logger.error('TimelineService: Failed to load submissions', error);
      return [];
    }
  }

  private async getAttendance(studentId: string): Promise<TimelineEvent[]> {
    try {
      const attendances = this.getItem<Attendance[]>(STORAGE_KEYS.GRADES) || [];
      return attendances
        .filter((a) => a.studentId === studentId)
        .map((attendance) => this.mapAttendanceToEvent(attendance));
    } catch (error) {
      logger.error('TimelineService: Failed to load attendance', error);
      return [];
    }
  }

  private async getMaterials(studentId: string): Promise<TimelineEvent[]> {
    try {
      const materials = this.getItem<ELibrary[]>(STORAGE_KEYS.MATERIALS) || [];
      const downloadKey = STORAGE_KEYS.STUDENT_OFFLINE_DOWNLOADS.replace('{userId}', studentId);
      const downloads = this.getItem<string[]>(downloadKey) || [];

      const events: TimelineEvent[] = [];

      for (const material of materials) {
        const accessEvent = this.mapMaterialAccessToEvent(material, studentId);
        events.push(accessEvent);

        if (downloads.includes(material.id)) {
          events.push(this.mapMaterialDownloadToEvent(material, studentId));
        }
      }

      return events;
    } catch (error) {
      logger.error('TimelineService: Failed to load materials', error);
      return [];
    }
  }

  private async getBookmarks(studentId: string): Promise<TimelineEvent[]> {
    try {
      const bookmarkKey = STORAGE_KEYS.STUDENT_BOOKMARKS.replace('{userId}', studentId);
      const bookmarks = this.getItem<Bookmark[]>(bookmarkKey) || [];
      const materials = this.getItem<ELibrary[]>(STORAGE_KEYS.MATERIALS) || [];

      return bookmarks
        .map((bookmark) => {
          const material = materials.find((m) => m.id === bookmark.materialId);
          if (!material) return null;
          return this.mapBookmarkToEvent(bookmark, material, studentId);
        })
        .filter((e): e is TimelineEvent => e !== null);
    } catch (error) {
      logger.error('TimelineService: Failed to load bookmarks', error);
      return [];
    }
  }

  private async getRatings(studentId: string): Promise<TimelineEvent[]> {
    try {
      const ratings = this.getItem<MaterialRating[]>(STORAGE_KEYS.MATERIAL_RATINGS) || [];
      const materials = this.getItem<ELibrary[]>(STORAGE_KEYS.MATERIALS) || [];

      return ratings
        .filter((r) => r.userId === studentId)
        .map((rating) => {
          const material = materials.find((m) => m.id === rating.materialId);
          if (!material) return null;
          return this.mapRatingToEvent(rating, material, studentId);
        })
        .filter((e): e is TimelineEvent => e !== null);
    } catch (error) {
      logger.error('TimelineService: Failed to load ratings', error);
      return [];
    }
  }

  private async getMessages(studentId: string): Promise<TimelineEvent[]> {
    try {
      const messages = this.getItem<DirectMessage[]>(STORAGE_KEYS.MESSAGES) || [];
      return messages
        .filter((m) => m.senderId === studentId || m.recipientId === studentId)
        .map((message) => this.mapMessageToEvent(message, studentId));
    } catch (error) {
      logger.error('TimelineService: Failed to load messages', error);
      return [];
    }
  }

  private async getAnnouncements(): Promise<TimelineEvent[]> {
    try {
      const announcements = this.getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS) || [];
      return announcements
        .filter((a) => a.isActive)
        .map((announcement) => this.mapAnnouncementToEvent(announcement));
    } catch (error) {
      logger.error('TimelineService: Failed to load announcements', error);
      return [];
    }
  }

  private async getSchoolEvents(studentId: string): Promise<TimelineEvent[]> {
    try {
      const events = this.getItem<SchoolEvent[]>(STORAGE_KEYS.EVENTS) || [];
      return events.map((event) => this.mapEventToEvent(event, studentId));
    } catch (error) {
      logger.error('TimelineService: Failed to load school events', error);
      return [];
    }
  }

  private mapGradeToEvent(grade: Grade): TimelineEvent {
    const score = typeof grade.score === 'number' ? grade.score : 0;
    const maxScore = typeof grade.maxScore === 'number' ? grade.maxScore : 100;
    const percentage = (score / maxScore) * 100;

    let color = 'text-gray-600';
    if (percentage >= 90) color = 'text-green-600';
    else if (percentage >= 80) color = 'text-blue-600';
    else if (percentage >= 70) color = 'text-yellow-600';
    else if (percentage >= 60) color = 'text-orange-600';
    else color = 'text-red-600';

    return {
      id: `grade-${grade.id}`,
      type: 'grade',
      studentId: grade.studentId,
      title: `Nilai ${grade.assignmentName || 'Tugas'}`,
      description: `${grade.subjectName || 'Mata Pelajaran'}: ${score}/${maxScore}`,
      icon: '📊',
      color,
      timestamp: grade.createdAt,
      data: {
        gradeId: grade.id,
        subjectId: grade.subjectId,
        subjectName: grade.subjectName,
        score,
        maxScore,
        assignmentType: grade.assignmentType,
        assignmentName: grade.assignmentName,
        teacherId: grade.createdBy,
      } as GradeEventData,
      relatedId: grade.id,
      relatedType: 'grade',
      createdBy: grade.createdBy,
    };
  }

  private mapAssignmentToEvent(assignment: Assignment, studentId: string): TimelineEvent {
    return {
      id: `assignment-${assignment.id}`,
      type: 'assignment',
      studentId,
      title: `Tugas: ${assignment.title}`,
      description: `Mata Pelajaran: ${assignment.subjectName || '-'} | Deadline: ${this.formatDate(assignment.dueDate)}`,
      icon: '📝',
      color: 'text-purple-600',
      timestamp: assignment.createdAt,
      data: {
        assignmentId: assignment.id,
        subjectId: assignment.subjectId,
        subjectName: assignment.subjectName,
        title: assignment.title,
        type: assignment.type,
        maxScore: assignment.maxScore,
        dueDate: assignment.dueDate,
        teacherId: assignment.teacherId,
      } as AssignmentEventData,
      relatedId: assignment.id,
      relatedType: 'assignment',
      createdBy: assignment.teacherId,
    };
  }

  private mapSubmissionToEvent(submission: AssignmentSubmission, assignment?: Assignment): TimelineEvent {
    let color = 'text-gray-600';
    if (submission.status === 'graded') color = 'text-green-600';
    else if (submission.status === 'submitted') color = 'text-blue-600';
    else if (submission.status === 'late') color = 'text-orange-600';

    const assignmentTitle = assignment?.title || 'Tugas';
    const subjectName = assignment?.subjectName || '';

    return {
      id: `submission-${submission.id}`,
      type: 'submission',
      studentId: submission.studentId,
      studentName: submission.studentName,
      title: `Pengumpulan: ${assignmentTitle}`,
      description: `Dikumpulkan: ${this.formatDate(submission.submittedAt)}${submission.score !== undefined ? ` | Nilai: ${submission.score}` : ''}`,
      icon: '📤',
      color,
      timestamp: submission.submittedAt,
      data: {
        submissionId: submission.id,
        assignmentId: submission.assignmentId,
        assignmentTitle,
        subjectId: assignment?.subjectId || '',
        subjectName,
        submittedAt: submission.submittedAt,
        score: submission.score,
        feedback: submission.feedback,
        gradedBy: submission.gradedBy,
        gradedAt: submission.gradedAt,
        status: submission.status,
      } as SubmissionEventData,
      relatedId: submission.id,
      relatedType: 'submission',
      createdBy: submission.studentId,
    };
  }

  private mapAttendanceToEvent(attendance: Attendance): TimelineEvent {
    let icon = '✅';
    let color = 'text-green-600';

    switch (attendance.status) {
      case 'hadir':
        icon = '✅';
        color = 'text-green-600';
        break;
      case 'sakit':
        icon = '🤒';
        color = 'text-blue-600';
        break;
      case 'izin':
        icon = '📋';
        color = 'text-yellow-600';
        break;
      case 'alpa':
        icon = '❌';
        color = 'text-red-600';
        break;
    }

    return {
      id: `attendance-${attendance.id}`,
      type: 'attendance',
      studentId: attendance.studentId,
      title: `Absensi: ${this.formatDate(attendance.date)}`,
      description: `Kelas: ${attendance.className || '-'} | Status: ${attendance.status.toUpperCase()}${attendance.notes ? ` | ${attendance.notes}` : ''}`,
      icon,
      color,
      timestamp: attendance.createdAt,
      data: {
        attendanceId: attendance.id,
        classId: attendance.classId,
        className: attendance.className,
        date: attendance.date,
        status: attendance.status,
        notes: attendance.notes,
        recordedBy: attendance.recordedBy,
      } as AttendanceEventData,
      relatedId: attendance.id,
      relatedType: 'attendance',
      createdBy: attendance.recordedBy,
    };
  }

  private mapMaterialAccessToEvent(material: ELibrary, studentId: string): TimelineEvent {
    return {
      id: `material-access-${material.id}-${studentId}`,
      type: 'material_access',
      studentId,
      title: `Akses Materi: ${material.title}`,
      description: `Kategori: ${material.category}`,
      icon: '📖',
      color: 'text-indigo-600',
      timestamp: material.uploadedAt,
      data: {
        materialId: material.id,
        materialTitle: material.title,
        category: material.category,
        subjectId: material.subjectId,
        teacherId: material.uploadedBy,
        teacherName: material.uploadedByTeacherName,
      } as MaterialAccessEventData,
      relatedId: material.id,
      relatedType: 'material',
      createdBy: material.uploadedBy,
    };
  }

  private mapMaterialDownloadToEvent(material: ELibrary, studentId: string): TimelineEvent {
    return {
      id: `material-download-${material.id}-${studentId}`,
      type: 'material_download',
      studentId,
      title: `Unduh Materi: ${material.title}`,
      description: `Ukuran: ${this.formatFileSize(material.fileSize)} | Tipe: ${material.fileType}`,
      icon: '⬇️',
      color: 'text-blue-600',
      timestamp: material.uploadedAt,
      data: {
        materialId: material.id,
        materialTitle: material.title,
        category: material.category,
        subjectId: material.subjectId,
        teacherId: material.uploadedBy,
        teacherName: material.uploadedByTeacherName,
        fileSize: material.fileSize,
        fileType: material.fileType,
      } as MaterialDownloadEventData,
      relatedId: material.id,
      relatedType: 'material',
      createdBy: studentId,
    };
  }

  private mapBookmarkToEvent(bookmark: Bookmark, material: ELibrary, studentId: string): TimelineEvent {
    return {
      id: `bookmark-${bookmark.id}`,
      type: 'material_bookmark',
      studentId,
      title: `Disimpan: ${material.title}`,
      description: bookmark.note ? `Catatan: ${bookmark.note}` : 'Materi disimpan ke penanda buku',
      icon: '🔖',
      color: 'text-pink-600',
      timestamp: bookmark.createdAt,
      data: {
        bookmarkId: bookmark.id,
        materialId: bookmark.materialId,
        materialTitle: material.title,
        pageNumber: bookmark.pageNumber,
        note: bookmark.note,
      } as MaterialBookmarkEventData,
      relatedId: bookmark.materialId,
      relatedType: 'material',
      createdBy: studentId,
    };
  }

  private mapRatingToEvent(rating: MaterialRating, material: ELibrary, studentId: string): TimelineEvent {
    return {
      id: `rating-${rating.id}`,
      type: 'material_rating',
      studentId,
      title: `Rating: ${material.title}`,
      description: `Diberi rating: ${'⭐'.repeat(rating.rating)}${rating.review ? ` | ${rating.review}` : ''}`,
      icon: '⭐',
      color: 'text-yellow-500',
      timestamp: rating.createdAt,
      data: {
        ratingId: rating.id,
        materialId: rating.materialId,
        materialTitle: material.title,
        rating: rating.rating,
        review: rating.review,
      } as MaterialRatingEventData,
      relatedId: rating.materialId,
      relatedType: 'material',
      createdBy: studentId,
    };
  }

  private mapMessageToEvent(message: DirectMessage, studentId: string): TimelineEvent {
    const isOutgoing = message.senderId === studentId;

    return {
      id: `message-${message.id}`,
      type: isOutgoing ? 'message_sent' : 'message_received',
      studentId,
      title: isOutgoing
        ? `Pesan terkirim ke ${message.recipientName}`
        : `Pesan dari ${message.senderName}`,
      description: message.content,
      icon: isOutgoing ? '✉️' : '📨',
      color: isOutgoing ? 'text-green-600' : 'text-blue-600',
      timestamp: message.createdAt,
      data: {
        messageId: message.id,
        conversationId: message.conversationId,
        content: message.content,
        messageType: message.messageType,
        senderId: message.senderId,
        senderName: message.senderName,
        senderRole: message.senderRole,
        recipientId: message.recipientId,
        recipientName: message.recipientName,
        isOutgoing,
      } as MessageEventData,
      relatedId: message.conversationId,
      relatedType: 'conversation',
      createdBy: message.senderId,
    };
  }

  private mapAnnouncementToEvent(announcement: Announcement): TimelineEvent {
    let color = 'text-gray-600';
    if (announcement.category === AnnouncementCategory.AKADEMIK) color = 'text-blue-600';
    else if (announcement.category === AnnouncementCategory.KEUANGAN) color = 'text-green-600';
    else if (announcement.category === AnnouncementCategory.KEGIATAN) color = 'text-purple-600';

    return {
      id: `announcement-${announcement.id}`,
      type: 'announcement',
      studentId: '',
      title: `Pengumuman: ${announcement.title}`,
      description: announcement.content.substring(0, 150) + (announcement.content.length > 150 ? '...' : ''),
      icon: '📢',
      color,
      timestamp: announcement.createdAt,
      data: {
        announcementId: announcement.id,
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        targetAudience: announcement.targetAudience,
        authorId: announcement.createdBy,
      } as AnnouncementEventData,
      relatedId: announcement.id,
      relatedType: 'announcement',
      createdBy: announcement.createdBy,
    };
  }

  private mapEventToEvent(schoolEvent: SchoolEvent, studentId: string): TimelineEvent {
    let color = 'text-gray-600';
    if (schoolEvent.status === 'Upcoming') color = 'text-blue-600';
    else if (schoolEvent.status === 'Ongoing') color = 'text-green-600';
    else if (schoolEvent.status === 'Completed') color = 'text-gray-600';

    return {
      id: `event-${schoolEvent.id}`,
      type: 'event',
      studentId,
      title: `Kegiatan: ${schoolEvent.eventName}`,
      description: `📅 ${this.formatDate(schoolEvent.date)} | 📍 ${schoolEvent.location}`,
      icon: '🎉',
      color,
      timestamp: schoolEvent.date,
      data: {
        eventId: schoolEvent.id,
        title: schoolEvent.eventName,
        description: schoolEvent.description,
        date: schoolEvent.date,
        startTime: '',
        endTime: '',
        location: schoolEvent.location,
      } as EventEventData,
      relatedId: schoolEvent.id,
      relatedType: 'event',
      createdBy: schoolEvent.createdBy,
    };
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  }

  private saveTimelineToStorage(studentId: string, events: TimelineEvent[]): void {
    try {
      const key = STORAGE_KEYS.TIMELINE_CACHE(studentId);
      localStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      logger.error('TimelineService: Failed to save timeline to storage', error);
    }
  }

  clearCache(studentId?: string): void {
    if (studentId) {
      for (const [key] of this.cache) {
        if (key.includes(studentId)) {
          this.cache.delete(key);
        }
      }
      localStorage.removeItem(STORAGE_KEYS.TIMELINE_CACHE(studentId));
    } else {
      this.cache.clear();
    }
    logger.debug(`TimelineService: Cache cleared${studentId ? ` for ${studentId}` : ''}`);
  }
}

export const studentTimelineService = StudentTimelineService.getInstance();
