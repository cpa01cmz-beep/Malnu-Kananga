import type { ParentChild, ParentMeeting, ParentTeacher, ParentMessage, ParentPayment } from '../types';
import { TIME_MS } from '../constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateParentChild(child: ParentChild): ValidationResult {
  const errors: string[] = [];

  if (!child.studentId || child.studentId.trim() === '') {
    errors.push('Student ID is required');
  }

  if (!child.studentName || child.studentName.trim() === '') {
    errors.push('Student name is required');
  }

  if (!child.relationshipId || child.relationshipId.trim() === '') {
    errors.push('Relationship ID is required');
  }

  if (!['ayah', 'ibu', 'wali'].includes(child.relationshipType)) {
    errors.push('Invalid relationship type');
  }

  if (!child.nisn || child.nisn.trim() === '') {
    errors.push('NISN is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateParentMeeting(meeting: ParentMeeting): ValidationResult {
  const errors: string[] = [];

  if (!meeting.id || meeting.id.trim() === '') {
    errors.push('Meeting ID is required');
  }

  if (!meeting.childId || meeting.childId.trim() === '') {
    errors.push('Child ID is required');
  }

  if (!meeting.teacherId || meeting.teacherId.trim() === '') {
    errors.push('Teacher ID is required');
  }

  if (!meeting.date || meeting.date.trim() === '') {
    errors.push('Meeting date is required');
  } else {
    const meetingDate = new Date(meeting.date);
    if (isNaN(meetingDate.getTime())) {
      errors.push('Invalid meeting date');
    }
  }

  if (!meeting.startTime || meeting.startTime.trim() === '') {
    errors.push('Start time is required');
  }

  if (!meeting.endTime || meeting.endTime.trim() === '') {
    errors.push('End time is required');
  }

  if (!['scheduled', 'completed', 'cancelled'].includes(meeting.status)) {
    errors.push('Invalid meeting status');
  }

  if (!meeting.agenda || meeting.agenda.trim() === '') {
    errors.push('Meeting agenda is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateParentTeacher(teacher: ParentTeacher): ValidationResult {
  const errors: string[] = [];

  if (!teacher.teacherId || teacher.teacherId.trim() === '') {
    errors.push('Teacher ID is required');
  }

  if (!teacher.teacherName || teacher.teacherName.trim() === '') {
    errors.push('Teacher name is required');
  }

  if (!teacher.subject || teacher.subject.trim() === '') {
    errors.push('Subject is required');
  }

  if (!teacher.className || teacher.className.trim() === '') {
    errors.push('Class name is required');
  }

  if (teacher.availableSlots && Array.isArray(teacher.availableSlots)) {
    teacher.availableSlots.forEach((slot, index) => {
      if (!slot.day || slot.day.trim() === '') {
        errors.push(`Slot ${index + 1}: Day is required`);
      }
      if (!slot.startTime || slot.startTime.trim() === '') {
        errors.push(`Slot ${index + 1}: Start time is required`);
      }
      if (!slot.endTime || slot.endTime.trim() === '') {
        errors.push(`Slot ${index + 1}: End time is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateParentMessage(message: ParentMessage): ValidationResult {
  const errors: string[] = [];

  if (!message.id || message.id.trim() === '') {
    errors.push('Message ID is required');
  }

  if (!['parent', 'teacher'].includes(message.sender)) {
    errors.push('Invalid sender type');
  }

  if (!message.subject || message.subject.trim() === '') {
    errors.push('Message subject is required');
  }

  if (!message.message || message.message.trim() === '') {
    errors.push('Message content is required');
  }

  if (!message.timestamp || message.timestamp.trim() === '') {
    errors.push('Message timestamp is required');
  } else {
    const timestamp = new Date(message.timestamp);
    if (isNaN(timestamp.getTime())) {
      errors.push('Invalid message timestamp');
    }
  }

  if (!['sent', 'delivered', 'read'].includes(message.status)) {
    errors.push('Invalid message status');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateParentPayment(payment: ParentPayment): ValidationResult {
  const errors: string[] = [];

  if (!payment.id || payment.id.trim() === '') {
    errors.push('Payment ID is required');
  }

  if (!payment.paymentType || payment.paymentType.trim() === '') {
    errors.push('Payment type is required');
  }

  if (typeof payment.amount !== 'number' || payment.amount < 0) {
    errors.push('Payment amount must be a positive number');
  }

  if (!payment.dueDate || payment.dueDate.trim() === '') {
    errors.push('Payment due date is required');
  } else {
    const dueDate = new Date(payment.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.push('Invalid payment due date');
    }
  }

  if (!['pending', 'paid', 'overdue'].includes(payment.status)) {
    errors.push('Invalid payment status');
  }

  if (payment.paymentDate) {
    const paymentDate = new Date(payment.paymentDate);
    if (isNaN(paymentDate.getTime())) {
      errors.push('Invalid payment date');
    }
  }

  if (!payment.description || payment.description.trim() === '') {
    errors.push('Payment description is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateMultiChildDataIsolation(children: ParentChild[], childId: string): ValidationResult {
  const errors: string[] = [];

  // Only validate target child if a childId is provided
  if (childId) {
    const targetChild = children.find(child => child.studentId === childId);
    if (!targetChild) {
      errors.push(`Child with ID ${childId} not found in parent's children list`);
    }
  }

  const duplicateIds = children
    .map(child => child.studentId)
    .filter((id, index, self) => self.indexOf(id) !== index);

  if (duplicateIds.length > 0) {
    errors.push(`Duplicate child IDs detected: ${duplicateIds.join(', ')}`);
  }

  // Use Set for O(n) duplicate detection instead of O(n²)
  const seenNisns = new Set<string>();
  const duplicateNISNs = new Set<string>();
  for (const child of children) {
    if (child.nisn) {
      if (seenNisns.has(child.nisn)) {
        duplicateNISNs.add(child.nisn);
      } else {
        seenNisns.add(child.nisn);
      }
    }
  }

  if (duplicateNISNs.size > 0) {
    errors.push(`Duplicate NISN detected: ${Array.from(duplicateNISNs).join(', ')}`);
  }

  children.forEach((child, index) => {
    const validation = validateParentChild(child);
    if (!validation.isValid) {
      errors.push(`Child at index ${index}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function sanitizeMeetingInput(input: Omit<ParentMeeting, 'id' | 'childName' | 'teacherName' | 'status'>): Omit<ParentMeeting, 'id' | 'childName' | 'teacherName' | 'status'> {
  return {
    childId: input.childId.trim(),
    teacherId: input.teacherId.trim(),
    subject: input.subject.trim(),
    date: input.date.trim(),
    startTime: input.startTime.trim(),
    endTime: input.endTime.trim(),
    agenda: input.agenda.trim(),
    location: input.location.trim(),
    notes: input.notes?.trim() || undefined
  };
}

export function sanitizeMessageInput(input: Omit<ParentMessage, 'id' | 'timestamp' | 'status'>): Omit<ParentMessage, 'id' | 'timestamp' | 'status'> {
  return {
    sender: input.sender,
    teacherName: input.teacherName?.trim(),
    childName: input.childName?.trim(),
    subject: input.subject.trim(),
    message: input.message.trim()
  };
}

export function validateAndSanitizeMeeting(meeting: Omit<ParentMeeting, 'id' | 'childName' | 'teacherName' | 'status'>): {
  isValid: boolean;
  errors: string[];
  sanitized?: Omit<ParentMeeting, 'id' | 'childName' | 'teacherName' | 'status'>;
} {
  const sanitized = sanitizeMeetingInput(meeting);
  const tempMeeting: Partial<ParentMeeting> = {
    ...sanitized,
    id: 'temp',
    childName: 'temp',
    teacherName: 'temp',
    status: 'scheduled'
  };

  const validation = validateParentMeeting(tempMeeting as ParentMeeting);

  return {
    isValid: validation.isValid,
    errors: validation.errors,
    sanitized: validation.isValid ? sanitized : undefined
  };
}

export function validateAndSanitizeMessage(message: Omit<ParentMessage, 'id' | 'timestamp' | 'status'>): {
  isValid: boolean;
  errors: string[];
  sanitized?: Omit<ParentMessage, 'id' | 'timestamp' | 'status'>;
} {
  const sanitized = sanitizeMessageInput(message);
  const tempMessage = {
    ...sanitized,
    id: 'temp',
    timestamp: new Date().toISOString(),
    status: 'sent' as const
  };

  const validation = validateParentMessage(tempMessage);

  return {
    isValid: validation.isValid,
    errors: validation.errors,
    sanitized: validation.isValid ? sanitized : undefined
  };
}

export interface DataAccessValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateParentChildDataAccess(childId: string, children: ParentChild[], dataType: 'grades' | 'attendance' | 'schedule' | 'messages' | 'payments' | 'meetings' = 'grades'): DataAccessValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const targetChild = children.find(child => child.studentId === childId);
  if (!targetChild) {
    errors.push(`Access denied: Child with ID ${childId} not found in parent's children list`);
    return { isValid: false, errors, warnings };
  }

  switch (dataType) {
    case 'grades':
    case 'attendance':
    case 'payments':
    case 'meetings':
      // No specific validation needed here as child existence is already checked.
      break;
    case 'schedule':
      if (!targetChild.className) {
        warnings.push('Schedule may be incomplete: No class information available');
      }
      break;
    case 'messages':
      if (!targetChild.studentName) {
        warnings.push('Message context may be incomplete: No student name available');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateChildDataIsolation(childId: string, data: Array<{studentId?: string}>, dataType: string = 'grades'): DataAccessValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    errors.push(`Invalid ${dataType} data: Expected array`);
    return { isValid: false, errors, warnings };
  }

  const childSpecificData = data.filter(item => item.studentId === childId);
  
  if (childSpecificData.length === 0 && data.length > 0) {
    warnings.push(`No ${dataType} data found for child ${childId}`);
  }

  const otherChildData = data.filter(item => item.studentId && item.studentId !== childId);
  if (otherChildData.length > 0) {
    errors.push(`Data isolation breach: Found ${otherChildData.length} ${dataType} records belonging to other children`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateOfflineDataIntegrity(cachedData: { children?: ParentChild[]; lastUpdated?: number }, currentChildren: ParentChild[]): DataAccessValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!cachedData) {
    errors.push('No cached data available');
    return { isValid: false, errors, warnings };
  }

  if (!cachedData.children || !Array.isArray(cachedData.children)) {
    errors.push('Invalid cached children data structure');
    return { isValid: false, errors, warnings };
  }

  const cachedChildIds = cachedData.children.map((child: ParentChild) => child.studentId);
  const currentChildIds = currentChildren.map(child => child.studentId);

  const missingChildren = currentChildIds.filter(id => !cachedChildIds.includes(id));
  if (missingChildren.length > 0) {
    warnings.push(`Missing cached data for children: ${missingChildren.join(', ')}`);
  }

  const extraChildren = cachedChildIds.filter((id: string) => !currentChildIds.includes(id));
  if (extraChildren.length > 0) {
    warnings.push(`Cached data contains children no longer assigned: ${extraChildren.join(', ')}`);
  }

  const now = Date.now();
  const cacheAge = cachedData.lastUpdated ? now - cachedData.lastUpdated : Infinity;
  const MAX_CACHE_AGE = TIME_MS.ONE_DAY; // 24 hours

  if (cacheAge > MAX_CACHE_AGE) {
    warnings.push(`Cached data is stale: ${Math.floor(cacheAge / TIME_MS.ONE_HOUR)} hours old`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateGradeVisibilityRestriction(grades: Array<{studentId?: string; id?: string; isPublished?: boolean; publishDate?: string; subject?: string; academicPeriod?: string}>, childId: string, parentRole: string = 'parent'): DataAccessValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const childGrades = grades.filter(grade => grade.studentId === childId);
  
  if (childGrades.length === 0) {
    warnings.push('No grades found for this child');
    return { isValid: true, errors, warnings };
  }

  childGrades.forEach((grade, index) => {
    if (!grade.isPublished && parentRole !== 'admin') {
      errors.push(`Grade ${grade.id || index} is not yet published and cannot be viewed`);
    }

    if (grade.publishDate && new Date(grade.publishDate) > new Date()) {
      errors.push(`Grade ${grade.id || index} has a future publish date`);
    }

    if (!grade.subject || !grade.academicPeriod) {
      warnings.push(`Grade ${grade.id || index} has incomplete metadata`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
