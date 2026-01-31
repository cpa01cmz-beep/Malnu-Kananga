import type { UserRole, UserExtraRole } from './common';

export type OCRStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface OCRUpdate {
  ocrStatus: OCRStatus;
  ocrProgress?: number;
  ocrText?: string;
  ocrConfidence?: number;
  ocrProcessedAt?: string;
  ocrError?: string;
  isSearchable?: boolean;
  ocrQuality?: OCRTextQuality;
  documentType?: 'unknown' | 'academic' | 'administrative' | 'form' | 'certificate';
  aiSummary?: string;
  plagiarismFlags?: PlagiarismFlag[];
}

export interface OCRTextQuality {
  isSearchable: boolean;
  isHighQuality: boolean;
  estimatedAccuracy: number;
  wordCount: number;
  characterCount: number;
  hasMeaningfulContent: boolean;
  documentType: 'unknown' | 'academic' | 'administrative' | 'form' | 'certificate';
}

export interface PlagiarismFlag {
  materialId: string;
  similarity: number;
  matchedText: string;
  details: string;
  flaggedAt: string;
}

export interface OCRProcessingState {
  materialId: string;
  status: OCRStatus;
  progress: number;
  startTime: Date;
  estimatedTimeRemaining?: number;
  error?: string;
}

export interface SearchOptions {
  includeOCR?: boolean;
  minConfidence?: number;
  limit?: number;
  offset?: number;
}

export interface ReadingProgress {
  materialId: string;
  userId: string;
  currentPosition: number;
  totalPages?: number;
  lastReadAt: string;
  readTime: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Bookmark {
  id: string;
  materialId: string;
  userId: string;
  pageNumber?: number;
  position?: number;
  note?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  materialId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfflineDownload {
  id: string;
  materialId: string;
  userId: string;
  downloadUrl: string;
  downloadedAt: string;
  fileSize: number;
  isAvailable: boolean;
}

export interface MaterialFavorite {
  materialId: string;
  userId: string;
  createdAt: string;
}

export interface MaterialRating {
  id: string;
  materialId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialFolder {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  description?: string;
  color: string;
  icon: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  materialCount: number;
  subfolders: MaterialFolder[];
}

export interface MaterialVersion {
  id: string;
  materialId: string;
  version: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  changeLog: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface MaterialSharing {
  id: string;
  materialId: string;
  sharedWith: string[];
  sharedRoles?: UserRole[];
  sharedExtraRoles?: UserExtraRole[];
  isPublic: boolean;
  sharedBy: string;
  permission: 'view' | 'edit' | 'admin';
  sharedAt: string;
  expiresAt?: string;
  auditLog?: MaterialShareAudit[];
}

export interface MaterialTemplate {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: string;
  subjectId?: string;
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
}

export interface MaterialAnalytics {
  id: string;
  materialId: string;
  totalDownloads: number;
  uniqueUsers: number;
  averageRating: number;
  totalReviews: number;
  lastAccessed: string;
  dailyStats: {
    date: string;
    downloads: number;
    uniqueUsers: number;
  }[];
  monthlyStats: {
    month: string;
    downloads: number;
    uniqueUsers: number;
  }[];
}

export interface MaterialSharePermission {
  id: string;
  userId?: string;
  role?: UserRole;
  extraRole?: UserExtraRole;
  permission: 'view' | 'edit' | 'admin';
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  lastAccessed?: string;
  accessCount: number;
}

export interface MaterialShareSettings {
  isPublic: boolean;
  allowAnonymous: boolean;
  requirePassword: boolean;
  password?: string;
  publicLink?: string;
  publicLinkExpiresAt?: string;
}

export interface MaterialShareAudit {
  id: string;
  materialId: string;
  userId: string;
  userName: string;
  action: 'shared' | 'accessed' | 'downloaded' | 'revoked' | 'permission_changed';
  details: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ELibrary {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  subjectId: string;
  uploadedBy: string;
  uploadedByTeacherName?: string;
  uploadedAt: string;
  downloadCount: number;
  folderId?: string;
  isShared: boolean;
  sharedWith?: string[];
  sharePermissions?: MaterialSharePermission[];
  shareSettings?: MaterialShareSettings;
  currentVersion?: string;
  versions?: MaterialVersion[];
  analytics?: MaterialAnalytics;
  templates?: MaterialTemplate[];
  averageRating?: number;
  totalReviews?: number;
  readingProgress?: ReadingProgress;
  isBookmarked?: boolean;
  isFavorite?: boolean;
  ocrStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  ocrProgress?: number;
  ocrText?: string;
  ocrConfidence?: number;
  ocrProcessedAt?: string;
  ocrError?: string;
  isSearchable?: boolean;
  ocrQuality?: OCRTextQuality;
  documentType?: 'unknown' | 'academic' | 'administrative' | 'form' | 'certificate';
  aiSummary?: string;
  plagiarismFlags?: PlagiarismFlag[];
}

export interface MaterialSearchFilters {
  subject?: string;
  teacher?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  fileType?: string;
  minRating?: number;
}
