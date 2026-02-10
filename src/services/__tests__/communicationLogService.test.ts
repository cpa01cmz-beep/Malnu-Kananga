import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { communicationLogService } from '../communicationLogService';
import { STORAGE_KEYS, TEST_CONSTANTS } from '../../constants';
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
        messageId: TEST_CONSTANTS.IDS.MSG_1,
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
        message: 'Can we discuss Alice\'s progress?',
        messageType: 'text' as const,
        sender: 'parent' as const,
        timestamp: TEST_CONSTANTS.TIMESTAMPS.JAN_31_10AM,
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
        messageId: TEST_CONSTANTS.IDS.MSG_2,
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
        message: 'Alice did well on test.',
        messageType: 'text' as const,
        sender: 'teacher' as const,
        timestamp: TEST_CONSTANTS.TIMESTAMPS.JAN_31_11AM,
      };

      const result = communicationLogService.logMessage(data);

      expect(result.createdBy).toBe(data.teacherId);
      expect(result.createdByName).toBe(data.teacherName);
    });

    it('should create message log with optional fields', () => {
      const data = {
        messageId: TEST_CONSTANTS.IDS.MSG_3,
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
        message: 'Meeting scheduled.',
        messageType: 'text' as const,
        sender: 'parent' as const,
        timestamp: TEST_CONSTANTS.TIMESTAMPS.JAN_31_12PM,
        readAt: '2026-01-31T12:01:00Z',
        deliveredAt: '2026-01-31T12:00:30Z',
      };

      const result = communicationLogService.logMessage(data);

      expect(result.readAt).toBe(data.readAt);
      expect(result.deliveredAt).toBe(data.deliveredAt);
    });

    it('should generate unique IDs for each log entry', () => {
      const data = {
        messageId: TEST_CONSTANTS.IDS.MSG_4,
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
        message: 'Test message 1',
        messageType: 'text' as const,
        sender: 'parent' as const,
        timestamp: TEST_CONSTANTS.TIMESTAMPS.JAN_31_1PM,
      };

      const result1 = communicationLogService.logMessage(data);
      const result2 = communicationLogService.logMessage({ ...data, messageId: TEST_CONSTANTS.IDS.MSG_5, message: 'Test message 2' });

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('logMeeting', () => {
    it('should create and save meeting log entry', () => {
      const data = {
        meetingId: TEST_CONSTANTS.IDS.MEETING_1,
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        meetingDate: TEST_CONSTANTS.DATES.FEB_1_2026,
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
        meetingId: TEST_CONSTANTS.IDS.MEETING_2,
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
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
        meetingId: TEST_CONSTANTS.IDS.MEETING_3,
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
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
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
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
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
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
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        note: 'Follow up on meeting',
        createdBy: TEST_CONSTANTS.IDS.TEACHER_1,
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
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        note: 'Thank you for the meeting',
        createdBy: TEST_CONSTANTS.IDS.PARENT_1,
        createdByName: 'John Doe',
      };

      const result = communicationLogService.logNote(data);

      expect(result.createdBy).toBe(TEST_CONSTANTS.IDS.PARENT_1);
      expect(result.createdByName).toBe('John Doe');
    });
  });

  describe('getCommunicationHistory', () => {
    beforeEach(() => {
      communicationLogService.logMessage({
        messageId: 'msg_1',
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
        message: 'Test message 1',
        messageType: 'text',
        sender: 'parent',
        timestamp: TEST_CONSTANTS.TIMESTAMPS.JAN_31_10AM,
      });

      communicationLogService.logMeeting({
        meetingId: TEST_CONSTANTS.IDS.MEETING_1,
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        meetingDate: TEST_CONSTANTS.DATES.FEB_1_2026,
        meetingStartTime: '14:00',
        meetingEndTime: '15:00',
        meetingAgenda: 'Discuss progress',
        meetingLocation: 'School Office',
        meetingStatus: 'completed',
      });

      communicationLogService.logCall({
        parentId: TEST_CONSTANTS.IDS.PARENT_2,
        parentName: 'Jane Roe',
        teacherId: TEST_CONSTANTS.IDS.TEACHER_2,
        teacherName: 'Bob Johnson',
        studentId: TEST_CONSTANTS.IDS.STUDENT_2,
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
      const result = communicationLogService.getCommunicationHistory({ parentId: TEST_CONSTANTS.IDS.PARENT_1 });

      expect(result).toHaveLength(2);
      expect(result.every(log => log.parentId === 'parent_1')).toBe(true);
    });

    it('should filter by teacherId', () => {
      const result = communicationLogService.getCommunicationHistory({ teacherId: TEST_CONSTANTS.IDS.TEACHER_1 });

      expect(result).toHaveLength(2);
      expect(result.every(log => log.teacherId === 'teacher_1')).toBe(true);
    });

    it('should filter by studentId', () => {
      const result = communicationLogService.getCommunicationHistory({ studentId: TEST_CONSTANTS.IDS.STUDENT_1 });

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
      const result = communicationLogService.getCommunicationHistory({ subject: TEST_CONSTANTS.NAMES.MATHEMATICS });

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
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
      });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('message');
      expect(result[0].parentId).toBe(TEST_CONSTANTS.IDS.PARENT_1);
      expect(result[0].teacherId).toBe(TEST_CONSTANTS.IDS.TEACHER_1);
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
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
        message: 'Test 1',
        messageType: 'text',
        sender: 'parent',
        timestamp: TEST_CONSTANTS.TIMESTAMPS.JAN_31_10AM,
      });

      communicationLogService.logMessage({
        messageId: TEST_CONSTANTS.IDS.MSG_2,
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
        message: 'Test 2',
        messageType: 'text',
        sender: 'parent',
        timestamp: TEST_CONSTANTS.TIMESTAMPS.JAN_31_11AM,
      });

      communicationLogService.logMeeting({
        meetingId: TEST_CONSTANTS.IDS.MEETING_1,
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        meetingDate: TEST_CONSTANTS.DATES.FEB_1_2026,
        meetingStartTime: '14:00',
        meetingEndTime: '15:00',
        meetingAgenda: 'Progress',
        meetingLocation: 'School Office',
        meetingStatus: 'completed',
      });

      communicationLogService.logMeeting({
        meetingId: TEST_CONSTANTS.IDS.MEETING_2,
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_2,
        teacherName: 'Bob Johnson',
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        meetingDate: '2026-02-02',
        meetingStartTime: '10:00',
        meetingEndTime: '11:00',
        meetingAgenda: 'Follow-up',
        meetingLocation: 'School Office',
        meetingStatus: 'scheduled',
      });

      communicationLogService.logCall({
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        callDate: '2026-02-03',
        callStartTime: '15:00',
        callEndTime: '15:15',
      });

      communicationLogService.logNote({
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        note: 'Follow up note',
        createdBy: TEST_CONSTANTS.IDS.TEACHER_1,
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
      const result = communicationLogService.getStatistics({ parentId: TEST_CONSTANTS.IDS.PARENT_1 });

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
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
        message: 'Old message',
        messageType: 'text',
        sender: 'parent',
        timestamp: oldDate.toISOString(),
      });

      const newDate = new Date();
      newDate.setDate(newDate.getDate() - 10);

      communicationLogService.logMessage({
        messageId: 'msg_new',
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
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
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
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
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
        message: 'Old message',
        messageType: 'text',
        sender: 'parent',
        timestamp: oldDate.toISOString(),
      });

      communicationLogService.archiveEntries(90);

      communicationLogService.logMessage({
        messageId: 'msg_new',
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
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
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
        message: 'Test message',
        messageType: 'text',
        sender: 'parent',
        timestamp: TEST_CONSTANTS.TIMESTAMPS.JAN_31_10AM,
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
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
        subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
        message: 'Test message',
        messageType: 'text',
        sender: 'parent',
        timestamp: TEST_CONSTANTS.TIMESTAMPS.JAN_31_10AM,
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
          parentId: TEST_CONSTANTS.IDS.PARENT_1,
          parentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
          teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
          teacherName: TEST_CONSTANTS.NAMES.JANE_SMITH,
          studentId: TEST_CONSTANTS.IDS.STUDENT_1,
          studentName: TEST_CONSTANTS.NAMES.ALICE_DOE,
          subject: TEST_CONSTANTS.NAMES.MATHEMATICS,
          message: 'Test',
          messageType: 'text',
          sender: 'parent',
          timestamp: TEST_CONSTANTS.TIMESTAMPS.JAN_31_10AM,
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

  describe('logEmail', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockStorage[STORAGE_KEYS.COMMUNICATION_LOG] = '[]';
    });

    it('should log an email entry', () => {
      const result = communicationLogService.logEmail({
        messageId: 'email_123',
        recipientEmail: 'parent@example.com',
        subject: 'Grade Update',
        bodyPreview: 'Your child received an A grade...',
        deliveryStatus: 'sent',
        hasAttachment: false,
        sender: 'system',
        timestamp: '2026-02-04T10:00:00Z',
      });

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^comm_log_/);
      expect(result.type).toBe('email');
      expect(result.emailMessageId).toBe('email_123');
      expect(result.recipientEmail).toBe('parent@example.com');
      expect(result.subject).toBe('Grade Update');
      expect(result.deliveryStatus).toBe('sent');
      expect(result.hasAttachment).toBe(false);
      expect(result.sender).toBe('system');
      expect(result.status).toBe('logged');

      const logs = communicationLogService.getCommunicationHistory();
      expect(logs).toHaveLength(1);
      expect(logs[0].id).toBe(result.id);
    });

    it('should log email with student and parent info', () => {
      const result = communicationLogService.logEmail({
        messageId: 'email_456',
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: 'Budi Santoso',
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: 'Ibu Guru',
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: 'Ahmad Dahlan',
        recipientEmail: 'parent@example.com',
        subject: 'Meeting Reminder',
        bodyPreview: 'Reminder about scheduled meeting...',
        deliveryStatus: 'sent',
        hasAttachment: true,
        sender: 'teacher',
        timestamp: '2026-02-04T11:00:00Z',
      });

      expect(result.studentId).toBe('student_1');
      expect(result.studentName).toBe('Ahmad Dahlan');
      expect(result.parentId).toBe('parent_1');
      expect(result.parentName).toBe('Budi Santoso');
      expect(result.teacherId).toBe('teacher_1');
      expect(result.teacherName).toBe('Ibu Guru');
      expect(result.hasAttachment).toBe(true);
    });

    it('should use current timestamp when not provided', () => {
      const beforeLog = Date.now();
      const result = communicationLogService.logEmail({
        messageId: 'email_789',
        recipientEmail: 'parent@example.com',
        subject: 'Test Email',
        sender: 'system',
      });
      const afterLog = Date.now();

      expect(new Date(result.timestamp!).getTime()).toBeGreaterThanOrEqual(beforeLog);
      expect(new Date(result.timestamp!).getTime()).toBeLessThanOrEqual(afterLog);
    });

    it('should trim body preview to 200 characters', () => {
      const longBody = 'a'.repeat(300);
      const result = communicationLogService.logEmail({
        messageId: 'email_long',
        recipientEmail: 'parent@example.com',
        subject: 'Long Email',
        bodyPreview: longBody,
        sender: 'system',
      });

      expect(result.message?.length).toBeLessThanOrEqual(203);
      expect(result.message?.endsWith('...')).toBe(true);
    });

    it('should log multiple emails in chronological order', () => {
      communicationLogService.logEmail({
        messageId: 'email_1',
        recipientEmail: 'parent1@example.com',
        subject: 'First Email',
        sender: 'system',
        timestamp: '2026-02-04T10:00:00Z',
      });

      communicationLogService.logEmail({
        messageId: 'email_2',
        recipientEmail: 'parent2@example.com',
        subject: 'Second Email',
        sender: 'system',
        timestamp: '2026-02-04T11:00:00Z',
      });

      const logs = communicationLogService.getCommunicationHistory();
      expect(logs).toHaveLength(2);
      expect(logs[0].emailMessageId).toBe('email_2');
      expect(logs[1].emailMessageId).toBe('email_1');
    });
  });

  describe('getStatistics with emails', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockStorage[STORAGE_KEYS.COMMUNICATION_LOG] = '[]';

      communicationLogService.logEmail({
        messageId: 'email_1',
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: 'Budi Santoso',
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: 'Ibu Guru',
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: 'Ahmad',
        recipientEmail: 'parent@example.com',
        subject: 'Test',
        sender: 'system',
      });

      communicationLogService.logEmail({
        messageId: 'email_2',
        parentId: TEST_CONSTANTS.IDS.PARENT_1,
        parentName: 'Budi Santoso',
        teacherId: TEST_CONSTANTS.IDS.TEACHER_1,
        teacherName: 'Ibu Guru',
        studentId: TEST_CONSTANTS.IDS.STUDENT_1,
        studentName: 'Ahmad',
        recipientEmail: 'parent@example.com',
        subject: 'Test 2',
        sender: 'system',
      });
    });

    it('should count total emails', () => {
      const stats = communicationLogService.getStatistics();

      expect(stats.totalEmails).toBe(2);
    });

    it('should count emails by parent', () => {
      const stats = communicationLogService.getStatistics();

      expect(stats.emailCountByParent).toEqual({ parent_1: 2 });
    });

    it('should count emails by teacher', () => {
      const stats = communicationLogService.getStatistics();

      expect(stats.emailCountByTeacher).toEqual({ teacher_1: 2 });
    });
  });
});
