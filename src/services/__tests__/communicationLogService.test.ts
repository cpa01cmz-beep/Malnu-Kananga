import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { communicationLogService } from '../communicationLogService';
import { STORAGE_KEYS } from '../../constants';
import { logger } from '../../utils/logger';

vi.mock('../../utils/logger');

const mockStorage: Record<string, string> = {};

describe('communicationLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage[STORAGE_KEYS.COMMUNICATION_LOG] = '[]';
    global.localStorage = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    global.document = {
      createElement: vi.fn(() => ({
        href: '',
        download: '',
        click: vi.fn(),
      })) as any,
    } as any;

    global.URL = {
      createObjectURL: vi.fn(() => 'blob:url') as any,
      revokeObjectURL: vi.fn() as any,
    } as any;
  });

  afterEach(() => {
    mockStorage[STORAGE_KEYS.COMMUNICATION_LOG] = '[]';
  });

  describe('logMessage', () => {
    it('should create and save message log entry', () => {
      const data = {
        messageId: 'msg_1',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'Can we discuss Alice\'s progress?',
        messageType: 'text' as const,
        sender: 'parent' as const,
        timestamp: '2026-01-31T10:00:00Z',
      };

      const result = communicationLogService.logMessage(data);

      expect(result).toBeDefined();
      expect(result.type).toBe('message');
      expect(result.status).toBe('logged');
      expect(result.parentId).toBe(data.parentId);
      expect(result.teacherId).toBe(data.teacherId);
      expect(result.studentId).toBe(data.studentId);
      expect(result.subject).toBe(data.subject);
      expect(result.message).toBe(data.message);
      expect(result.messageType).toBe(data.messageType);
      expect(result.sender).toBe(data.sender);
      expect(result.timestamp).toBe(data.timestamp);
      expect(result.createdBy).toBe(data.parentId);
      expect(result.createdByName).toBe(data.parentName);
      expect(result.id).toMatch(/^comm_log_\d+_[a-z0-9]+$/);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.COMMUNICATION_LOG,
        expect.stringContaining(data.message)
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Message logged to communication log:',
        expect.objectContaining({
          messageId: data.messageId,
        })
      );
    });

    it('should create message log with teacher as sender', () => {
      const data = {
        messageId: 'msg_2',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'Alice did well on test.',
        messageType: 'text' as const,
        sender: 'teacher' as const,
        timestamp: '2026-01-31T11:00:00Z',
      };

      const result = communicationLogService.logMessage(data);

      expect(result.createdBy).toBe(data.teacherId);
      expect(result.createdByName).toBe(data.teacherName);
    });

    it('should create message log with optional fields', () => {
      const data = {
        messageId: 'msg_3',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'Meeting scheduled.',
        messageType: 'text' as const,
        sender: 'parent' as const,
        timestamp: '2026-01-31T12:00:00Z',
        readAt: '2026-01-31T12:01:00Z',
        deliveredAt: '2026-01-31T12:00:30Z',
      };

      const result = communicationLogService.logMessage(data);

      expect(result.readAt).toBe(data.readAt);
      expect(result.deliveredAt).toBe(data.deliveredAt);
    });

    it('should generate unique IDs for each log entry', () => {
      const data = {
        messageId: 'msg_4',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'Test message 1',
        messageType: 'text' as const,
        sender: 'parent' as const,
        timestamp: '2026-01-31T13:00:00Z',
      };

      const result1 = communicationLogService.logMessage(data);
      const result2 = communicationLogService.logMessage({ ...data, messageId: 'msg_5', message: 'Test message 2' });

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('logMeeting', () => {
    it('should create and save meeting log entry', () => {
      const data = {
        meetingId: 'meeting_1',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        meetingDate: '2026-02-01',
        meetingStartTime: '14:00',
        meetingEndTime: '15:00',
        meetingAgenda: 'Discuss Alice\'s progress',
        meetingLocation: 'School Office',
        meetingStatus: 'completed' as const,
      };

      const result = communicationLogService.logMeeting(data);

      expect(result).toBeDefined();
      expect(result.type).toBe('meeting');
      expect(result.status).toBe('logged');
      expect(result.meetingId).toBe(data.meetingId);
      expect(result.meetingDate).toBe(data.meetingDate);
      expect(result.meetingStartTime).toBe(data.meetingStartTime);
      expect(result.meetingEndTime).toBe(data.meetingEndTime);
      expect(result.meetingAgenda).toBe(data.meetingAgenda);
      expect(result.meetingLocation).toBe(data.meetingLocation);
      expect(result.meetingStatus).toBe(data.meetingStatus);
      expect(result.createdBy).toBe(data.teacherId);
      expect(result.createdByName).toBe(data.teacherName);
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'Meeting logged to communication log:',
        expect.objectContaining({
          meetingId: data.meetingId,
        })
      );
    });

    it('should create meeting log with optional outcome and notes', () => {
      const data = {
        meetingId: 'meeting_2',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        meetingDate: '2026-02-02',
        meetingStartTime: '10:00',
        meetingEndTime: '11:00',
        meetingAgenda: 'Discuss behavior',
        meetingOutcome: 'Agreed on improvement plan',
        meetingNotes: 'Parents supportive',
        meetingLocation: 'School Office',
        meetingStatus: 'completed' as const,
      };

      const result = communicationLogService.logMeeting(data);

      expect(result.meetingOutcome).toBe(data.meetingOutcome);
      expect(result.meetingNotes).toBe(data.meetingNotes);
    });

    it('should create meeting log with scheduled status', () => {
      const data = {
        meetingId: 'meeting_3',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        meetingDate: '2026-02-03',
        meetingStartTime: '09:00',
        meetingEndTime: '10:00',
        meetingAgenda: 'Initial consultation',
        meetingLocation: 'School Office',
        meetingStatus: 'scheduled' as const,
      };

      const result = communicationLogService.logMeeting(data);

      expect(result.meetingStatus).toBe('scheduled');
    });
  });

  describe('logCall', () => {
    it('should create and save call log entry', () => {
      const data = {
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        callDate: '2026-02-04',
        callStartTime: '15:00',
        callEndTime: '15:15',
      };

      const result = communicationLogService.logCall(data);

      expect(result).toBeDefined();
      expect(result.type).toBe('call');
      expect(result.status).toBe('logged');
      expect(result.meetingDate).toBe(data.callDate);
      expect(result.meetingStartTime).toBe(data.callStartTime);
      expect(result.meetingEndTime).toBe(data.callEndTime);
      expect(result.createdBy).toBe(data.teacherId);
      expect(result.createdByName).toBe(data.teacherName);
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'Call logged to communication log:',
        expect.objectContaining({
          logId: result.id,
        })
      );
    });

    it('should create call log with optional notes', () => {
      const data = {
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        callDate: '2026-02-05',
        callStartTime: '16:00',
        callEndTime: '16:20',
        callNotes: 'Discussed homework issues',
      };

      const result = communicationLogService.logCall(data);

      expect(result.meetingNotes).toBe(data.callNotes);
    });
  });

  describe('logNote', () => {
    it('should create and save note log entry', () => {
      const data = {
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        note: 'Follow up on meeting',
        createdBy: 'teacher_1',
        createdByName: 'Jane Smith',
      };

      const result = communicationLogService.logNote(data);

      expect(result).toBeDefined();
      expect(result.type).toBe('note');
      expect(result.status).toBe('logged');
      expect(result.message).toBe(data.note);
      expect(result.createdBy).toBe(data.createdBy);
      expect(result.createdByName).toBe(data.createdByName);
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'Note logged to communication log:',
        expect.objectContaining({
          logId: result.id,
        })
      );
    });

    it('should create note log with parent as creator', () => {
      const data = {
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        note: 'Thank you for the meeting',
        createdBy: 'parent_1',
        createdByName: 'John Doe',
      };

      const result = communicationLogService.logNote(data);

      expect(result.createdBy).toBe('parent_1');
      expect(result.createdByName).toBe('John Doe');
    });
  });

  describe('getCommunicationHistory', () => {
    beforeEach(() => {
      communicationLogService.logMessage({
        messageId: 'msg_1',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'Test message 1',
        messageType: 'text',
        sender: 'parent',
        timestamp: '2026-01-31T10:00:00Z',
      });

      communicationLogService.logMeeting({
        meetingId: 'meeting_1',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        meetingDate: '2026-02-01',
        meetingStartTime: '14:00',
        meetingEndTime: '15:00',
        meetingAgenda: 'Discuss progress',
        meetingLocation: 'School Office',
        meetingStatus: 'completed',
      });

      communicationLogService.logCall({
        parentId: 'parent_2',
        parentName: 'Jane Roe',
        teacherId: 'teacher_2',
        teacherName: 'Bob Johnson',
        studentId: 'student_2',
        studentName: 'Bob Roe',
        callDate: '2026-02-02',
        callStartTime: '15:00',
        callEndTime: '15:15',
      });
    });

    it('should return all logs when no filter provided', () => {
      const result = communicationLogService.getCommunicationHistory();

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('call');
    });

    it('should filter by type', () => {
      const result = communicationLogService.getCommunicationHistory({ type: ['message'] });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('message');
    });

    it('should filter by multiple types', () => {
      const result = communicationLogService.getCommunicationHistory({ type: ['message', 'meeting'] });

      expect(result).toHaveLength(2);
      expect(result.every(log => ['message', 'meeting'].includes(log.type))).toBe(true);
    });

    it('should filter by status', () => {
      const result = communicationLogService.getCommunicationHistory({ status: ['logged'] });

      expect(result).toHaveLength(3);
      expect(result.every(log => log.status === 'logged')).toBe(true);
    });

    it('should filter by parentId', () => {
      const result = communicationLogService.getCommunicationHistory({ parentId: 'parent_1' });

      expect(result).toHaveLength(2);
      expect(result.every(log => log.parentId === 'parent_1')).toBe(true);
    });

    it('should filter by teacherId', () => {
      const result = communicationLogService.getCommunicationHistory({ teacherId: 'teacher_1' });

      expect(result).toHaveLength(2);
      expect(result.every(log => log.teacherId === 'teacher_1')).toBe(true);
    });

    it('should filter by studentId', () => {
      const result = communicationLogService.getCommunicationHistory({ studentId: 'student_1' });

      expect(result).toHaveLength(2);
      expect(result.every(log => log.studentId === 'student_1')).toBe(true);
    });

    it('should filter by date range', () => {
      const result = communicationLogService.getCommunicationHistory({
        dateRange: {
          startDate: '2026-01-31T00:00:00Z',
          endDate: '2026-02-01T23:59:59Z',
        },
      });

      expect(result).toHaveLength(2);
      expect(result.every(log => {
        const logDate = log.type === 'meeting' || log.type === 'call'
          ? new Date(log.meetingDate || '')
          : new Date(log.timestamp);
        return logDate >= new Date('2026-01-31T00:00:00Z') && 
               logDate <= new Date('2026-02-01T23:59:59Z');
      })).toBe(true);
    });

    it('should filter by keyword in message', () => {
      const result = communicationLogService.getCommunicationHistory({ keyword: 'Test' });

      expect(result).toHaveLength(1);
      expect(result[0].message).toContain('Test');
    });

    it('should filter by keyword in meeting agenda', () => {
      const result = communicationLogService.getCommunicationHistory({ keyword: 'progress' });

      expect(result).toHaveLength(1);
      expect(result[0].meetingAgenda).toContain('progress');
    });

    it('should filter by subject', () => {
      const result = communicationLogService.getCommunicationHistory({ subject: 'Mathematics' });

      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Mathematics');
    });

    it('should filter by meetingStatus', () => {
      const result = communicationLogService.getCommunicationHistory({ meetingStatus: 'completed' });

      expect(result).toHaveLength(1);
      expect(result[0].meetingStatus).toBe('completed');
    });

    it('should sort by timestamp ascending', () => {
      const result = communicationLogService.getCommunicationHistory({ sortBy: 'timestamp', sortOrder: 'asc' });

      expect(result).toHaveLength(3);
      expect(new Date(result[0].timestamp).getTime()).toBeLessThanOrEqual(new Date(result[1].timestamp).getTime());
      expect(new Date(result[1].timestamp).getTime()).toBeLessThanOrEqual(new Date(result[2].timestamp).getTime());
    });

    it('should sort by sender', () => {
      const result = communicationLogService.getCommunicationHistory({ sortBy: 'sender', sortOrder: 'asc' });

      expect(result).toHaveLength(3);
    });

    it('should sort by teacher name', () => {
      const result = communicationLogService.getCommunicationHistory({ sortBy: 'teacher', sortOrder: 'asc' });

      expect(result).toHaveLength(3);
    });

    it('should apply limit and offset', () => {
      const result = communicationLogService.getCommunicationHistory({ limit: 2, offset: 0 });

      expect(result).toHaveLength(2);
    });

    it('should apply offset correctly', () => {
      const result = communicationLogService.getCommunicationHistory({ limit: 1, offset: 1 });

      expect(result).toHaveLength(1);
    });

    it('should handle complex filter combinations', () => {
      const result = communicationLogService.getCommunicationHistory({
        type: ['message'],
        parentId: 'parent_1',
        teacherId: 'teacher_1',
      });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('message');
      expect(result[0].parentId).toBe('parent_1');
      expect(result[0].teacherId).toBe('teacher_1');
    });

    it('should return empty array when no matches', () => {
      const result = communicationLogService.getCommunicationHistory({ parentId: 'nonexistent' });

      expect(result).toHaveLength(0);
    });
  });

  describe('getStatistics', () => {
    beforeEach(() => {
      communicationLogService.logMessage({
        messageId: 'msg_1',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'Test 1',
        messageType: 'text',
        sender: 'parent',
        timestamp: '2026-01-31T10:00:00Z',
      });

      communicationLogService.logMessage({
        messageId: 'msg_2',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'Test 2',
        messageType: 'text',
        sender: 'parent',
        timestamp: '2026-01-31T11:00:00Z',
      });

      communicationLogService.logMeeting({
        meetingId: 'meeting_1',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        meetingDate: '2026-02-01',
        meetingStartTime: '14:00',
        meetingEndTime: '15:00',
        meetingAgenda: 'Progress',
        meetingLocation: 'School Office',
        meetingStatus: 'completed',
      });

      communicationLogService.logMeeting({
        meetingId: 'meeting_2',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_2',
        teacherName: 'Bob Johnson',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        meetingDate: '2026-02-02',
        meetingStartTime: '10:00',
        meetingEndTime: '11:00',
        meetingAgenda: 'Follow-up',
        meetingLocation: 'School Office',
        meetingStatus: 'scheduled',
      });

      communicationLogService.logCall({
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        callDate: '2026-02-03',
        callStartTime: '15:00',
        callEndTime: '15:15',
      });

      communicationLogService.logNote({
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        note: 'Follow up note',
        createdBy: 'teacher_1',
        createdByName: 'Jane Smith',
      });
    });

    it('should calculate correct statistics', () => {
      const result = communicationLogService.getStatistics();

      expect(result.totalMessages).toBe(2);
      expect(result.totalMeetings).toBe(2);
      expect(result.totalCalls).toBe(1);
      expect(result.totalNotes).toBe(1);
    });

    it('should calculate message count by parent', () => {
      const result = communicationLogService.getStatistics();

      expect(result.messageCountByParent['parent_1']).toBe(2);
    });

    it('should calculate message count by teacher', () => {
      const result = communicationLogService.getStatistics();

      expect(result.messageCountByTeacher['teacher_1']).toBe(2);
    });

    it('should calculate meeting count by status', () => {
      const result = communicationLogService.getStatistics();

      expect(result.meetingCountByStatus['completed']).toBe(1);
      expect(result.meetingCountByStatus['scheduled']).toBe(1);
    });

    it('should identify most active teachers', () => {
      const result = communicationLogService.getStatistics();

      expect(result.mostActiveTeachers).toContain('teacher_1');
    });

    it('should identify most active parents', () => {
      const result = communicationLogService.getStatistics();

      expect(result.mostActiveParents).toContain('parent_1');
    });

    it('should calculate statistics with filter', () => {
      const result = communicationLogService.getStatistics({ parentId: 'parent_1' });

      expect(result.totalMessages).toBe(2);
      expect(result.totalMeetings).toBe(2);
      expect(result.totalCalls).toBe(1);
      expect(result.totalNotes).toBe(1);
    });

    it('should return empty statistics when no logs', () => {
      mockStorage[STORAGE_KEYS.COMMUNICATION_LOG] = '[]';
      const result = communicationLogService.getStatistics();

      expect(result.totalMessages).toBe(0);
      expect(result.totalMeetings).toBe(0);
      expect(result.totalCalls).toBe(0);
      expect(result.totalNotes).toBe(0);
      expect(result.mostActiveTeachers).toHaveLength(0);
      expect(result.mostActiveParents).toHaveLength(0);
    });
  });

  describe('archiveEntries', () => {
    beforeEach(() => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);

      communicationLogService.logMessage({
        messageId: 'msg_old',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'Old message',
        messageType: 'text',
        sender: 'parent',
        timestamp: oldDate.toISOString(),
      });

      const newDate = new Date();
      newDate.setDate(newDate.getDate() - 10);

      communicationLogService.logMessage({
        messageId: 'msg_new',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'New message',
        messageType: 'text',
        sender: 'parent',
        timestamp: newDate.toISOString(),
      });
    });

    it('should archive entries older than specified days', () => {
      const archivedCount = communicationLogService.archiveEntries(90);

      expect(archivedCount).toBe(1);

      const logs = communicationLogService.getCommunicationHistory();
      const oldLog = logs.find(log => log.message === 'Old message');
      expect(oldLog?.status).toBe('archived');
      expect(oldLog?.archivedAt).toBeDefined();
    });

    it('should not archive recent entries', () => {
      communicationLogService.archiveEntries(90);

      const logs = communicationLogService.getCommunicationHistory();
      const newLog = logs.find(log => log.message === 'New message');
      expect(newLog?.status).toBe('logged');
      expect(newLog?.archivedAt).toBeUndefined();
    });

    it('should use default 90 days if not specified', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);

      communicationLogService.logMessage({
        messageId: 'msg_default',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'Default test',
        messageType: 'text',
        sender: 'parent',
        timestamp: oldDate.toISOString(),
      });

      const archivedCount = communicationLogService.archiveEntries();

      expect(archivedCount).toBeGreaterThan(0);
    });

    it('should return 0 if no entries to archive', () => {
      const archivedCount = communicationLogService.archiveEntries(365);

      expect(archivedCount).toBe(0);
    });
  });

  describe('clearArchivedEntries', () => {
    beforeEach(() => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);

      communicationLogService.logMessage({
        messageId: 'msg_old',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'Old message',
        messageType: 'text',
        sender: 'parent',
        timestamp: oldDate.toISOString(),
      });

      communicationLogService.archiveEntries(90);

      communicationLogService.logMessage({
        messageId: 'msg_new',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'New message',
        messageType: 'text',
        sender: 'parent',
        timestamp: new Date().toISOString(),
      });
    });

    it('should clear archived entries', () => {
      const deletedCount = communicationLogService.clearArchivedEntries();

      expect(deletedCount).toBe(1);

      const logs = communicationLogService.getCommunicationHistory();
      expect(logs).toHaveLength(1);
      expect(logs.every(log => log.status !== 'archived')).toBe(true);
    });

    it('should return 0 if no archived entries', () => {
      mockStorage[STORAGE_KEYS.COMMUNICATION_LOG] = '[]';
      const deletedCount = communicationLogService.clearArchivedEntries();

      expect(deletedCount).toBe(0);
    });
  });

  describe('deleteLogEntry', () => {
    beforeEach(() => {
      communicationLogService.logMessage({
        messageId: 'msg_1',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'Test message',
        messageType: 'text',
        sender: 'parent',
        timestamp: '2026-01-31T10:00:00Z',
      });
    });

    it('should delete log entry by ID', () => {
      const logs = communicationLogService.getCommunicationHistory();
      const entryId = logs[0].id;

      const result = communicationLogService.deleteLogEntry(entryId);

      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        'Communication log entry deleted:',
        { entryId }
      );

      const remainingLogs = communicationLogService.getCommunicationHistory();
      expect(remainingLogs).toHaveLength(0);
    });

    it('should return false if entry not found', () => {
      const result = communicationLogService.deleteLogEntry('nonexistent_id');

      expect(result).toBe(false);
    });
  });

  describe('updateLogEntry', () => {
    beforeEach(() => {
      communicationLogService.logMessage({
        messageId: 'msg_1',
        parentId: 'parent_1',
        parentName: 'John Doe',
        teacherId: 'teacher_1',
        teacherName: 'Jane Smith',
        studentId: 'student_1',
        studentName: 'Alice Doe',
        subject: 'Mathematics',
        message: 'Test message',
        messageType: 'text',
        sender: 'parent',
        timestamp: '2026-01-31T10:00:00Z',
      });
    });

    it('should update log entry', () => {
      const logs = communicationLogService.getCommunicationHistory();
      const entryId = logs[0].id;

      const updates = {
        message: 'Updated message',
        modifiedBy: 'teacher_1',
      };

      const result = communicationLogService.updateLogEntry(entryId, updates);

      expect(result).toBeDefined();
      expect(result?.message).toBe('Updated message');
      expect(result?.modifiedBy).toBe('teacher_1');
      expect(result?.modifiedAt).toBeDefined();
      expect(logger.info).toHaveBeenCalledWith(
        'Communication log entry updated:',
        {
          entryId,
          updates: expect.arrayContaining(['message', 'modifiedBy']),
        }
      );

      const updatedLogs = communicationLogService.getCommunicationHistory();
      expect(updatedLogs[0].message).toBe('Updated message');
    });

    it('should return null if entry not found', () => {
      const result = communicationLogService.updateLogEntry('nonexistent_id', { message: 'Updated' });

      expect(result).toBeNull();
    });

    it('should preserve original modifiedBy if not provided', () => {
      const logs = communicationLogService.getCommunicationHistory();
      const entryId = logs[0].id;

      const result = communicationLogService.updateLogEntry(entryId, { message: 'Updated' });

      expect(result?.modifiedBy).toBeUndefined();
      expect(result?.modifiedAt).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      global.localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => {
        communicationLogService.logMessage({
          messageId: 'msg_1',
          parentId: 'parent_1',
          parentName: 'John Doe',
          teacherId: 'teacher_1',
          teacherName: 'Jane Smith',
          studentId: 'student_1',
          studentName: 'Alice Doe',
          subject: 'Mathematics',
          message: 'Test',
          messageType: 'text',
          sender: 'parent',
          timestamp: '2026-01-31T10:00:00Z',
        });
      }).not.toThrow();

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle invalid JSON in storage', () => {
      mockStorage[STORAGE_KEYS.COMMUNICATION_LOG] = 'invalid json';

      const result = communicationLogService.getCommunicationHistory();

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle non-array data in storage', () => {
      mockStorage[STORAGE_KEYS.COMMUNICATION_LOG] = JSON.stringify({ invalid: 'object' });

      const result = communicationLogService.getCommunicationHistory();

      expect(result).toEqual([]);
    });

    it('should handle empty storage', () => {
      mockStorage[STORAGE_KEYS.COMMUNICATION_LOG] = '[]';

      const result = communicationLogService.getCommunicationHistory();

      expect(result).toEqual([]);
    });

    it('should handle missing storage', () => {
      delete mockStorage[STORAGE_KEYS.COMMUNICATION_LOG];

      const result = communicationLogService.getCommunicationHistory();

      expect(result).toEqual([]);
    });
  });
});
