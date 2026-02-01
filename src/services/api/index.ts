// api/index.ts - Main API Service Entry Point

import { authAPI, getAuthToken, getRefreshToken, parseJwtPayload, isTokenExpired, type LoginResponse, type AuthPayload, type ApiResponse } from './auth';
import { request, type RequestOptions } from './client';
import {
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
  type FileUploadResponse,
  type UploadProgress,
  announcementsAPI,
  parentsAPI,
  messagesAPI,
  chatAPI,
  paymentsAPI,
  type CreatePaymentRequest,
  type PaymentData,
  type PaymentStatus,
  type PaymentStatusResponse,
} from './modules';

export type { LoginResponse, ApiResponse, AuthPayload, RequestOptions, FileUploadResponse, UploadProgress, CreatePaymentRequest, PaymentData, PaymentStatus, PaymentStatusResponse };

export const apiService = {
  auth: authAPI,
  users: usersAPI,
  students: studentsAPI,
  teachers: teachersAPI,
  subjects: subjectsAPI,
  classes: classesAPI,
  schedules: schedulesAPI,
  grades: gradesAPI,
  assignments: assignmentsAPI,
  assignmentSubmissions: assignmentSubmissionsAPI,
  attendance: attendanceAPI,
  ppdb: ppdbAPI,
  inventory: inventoryAPI,
  events: eventsAPI,
  eventRegistrations: eventRegistrationsAPI,
  eventBudgets: eventBudgetsAPI,
  eventPhotos: eventPhotosAPI,
  eventFeedback: eventFeedbackAPI,
  eLibrary: eLibraryAPI,
  fileStorage: fileStorageAPI,
  announcements: announcementsAPI,
  parents: parentsAPI,
  messages: messagesAPI,
  chat: chatAPI,
  payments: paymentsAPI,
  getAuthToken,
  getRefreshToken,
  parseJwtPayload,
};

export const api = apiService;

export { request, getAuthToken, getRefreshToken, parseJwtPayload, isTokenExpired, authAPI, paymentsAPI };
