// api/modules/index.ts - Re-export all API modules

export { usersAPI } from './users';
export { studentsAPI } from './users';
export { teachersAPI } from './users';
export { subjectsAPI } from './academic';
export { classesAPI } from './academic';
export { schedulesAPI } from './academic';
export { gradesAPI } from './academic';
export { assignmentsAPI } from './academic';
export { assignmentSubmissionsAPI } from './academic';
export { attendanceAPI } from './academic';
export { ppdbAPI } from './ppdb';
export { inventoryAPI } from './inventory';
export { eventsAPI } from './events';
export { eventRegistrationsAPI } from './events';
export { eventBudgetsAPI } from './events';
export { eventPhotosAPI } from './events';
export { eventFeedbackAPI } from './events';
export { eLibraryAPI, fileStorageAPI, type FileUploadResponse, type UploadProgress } from './materials';
export { announcementsAPI } from './announcements';
export { parentsAPI } from './messaging';
export { messagesAPI } from './messaging';
export { chatAPI } from './chat';
export { paymentsAPI } from './payments';
export type { CreatePaymentRequest, PaymentData, PaymentStatus, PaymentStatusResponse } from './payments';
export { auditAPI, type AuditLogEntry, type AuditLogFilter, type AuditLogExportOptions, type AuditLogStats } from './audit';
