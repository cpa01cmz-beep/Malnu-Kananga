// apiService.ts - Backward Compatibility Shim
// This file re-exports from new modular structure for backward compatibility
// New code should import from './services/api' instead

export { apiService, api, request, getAuthToken, getRefreshToken, parseJwtPayload, isTokenExpired, authAPI, type LoginResponse, type AuthPayload, type ApiResponse, type RequestOptions } from './api';

export type { FileUploadResponse, UploadProgress, CreatePaymentRequest, PaymentData, PaymentStatus, PaymentStatusResponse } from './api';

export {
  usersAPI,
  studentsAPI,
  teachersAPI,
  subjectsAPI,
  classesAPI,
  schedulesAPI,
  gradesAPI,
  assignmentsAPI,
  assignmentSubmissionsAPI,
  attendanceAPI,
  ppdbAPI,
  inventoryAPI,
  eventsAPI,
  eventRegistrationsAPI,
  eventBudgetsAPI,
  eventPhotosAPI,
  eventFeedbackAPI,
  eLibraryAPI,
  fileStorageAPI,
  announcementsAPI,
  parentsAPI,
  messagesAPI,
  chatAPI,
  paymentsAPI,
} from './api';
