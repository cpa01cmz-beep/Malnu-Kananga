import type { ParentChild, ParentMeeting, ParentTeacher, ParentMessage, ParentPayment } from '../types';

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

  const targetChild = children.find(child => child.studentId === childId);
  if (!targetChild) {
    errors.push(`Child with ID ${childId} not found in parent's children list`);
  }

  const duplicateIds = children
    .map(child => child.studentId)
    .filter((id, index, self) => self.indexOf(id) !== index);

  if (duplicateIds.length > 0) {
    errors.push(`Duplicate child IDs detected: ${duplicateIds.join(', ')}`);
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
    message: input.message.trim(),
    status: 'sent'
  };
}

export function validateAndSanitizeMeeting(meeting: Omit<ParentMeeting, 'id' | 'childName' | 'teacherName' | 'status'>): {
  isValid: boolean;
  errors: string[];
  sanitized?: Omit<ParentMeeting, 'id' | 'childName' | 'teacherName' | 'status'>;
} {
  const sanitized = sanitizeMeetingInput(meeting);
  const tempMeeting = {
    ...sanitized,
    id: 'temp',
    childName: 'temp',
    teacherName: 'temp',
    status: 'scheduled' as const
  };

  const validation = validateParentMeeting(tempMeeting);

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
