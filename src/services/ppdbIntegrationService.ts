/**
 * PPDB Integration Service
 * 
 * Handles the integration between PPDB registration and student management.
 * Provides automated workflow for converting approved registrants to students.
 * 
 * @module ppdbIntegrationService
 */

import { ppdbAPI, studentsAPI, usersAPI } from './apiService';
import { unifiedNotificationManager } from './notifications/unifiedNotificationManager';
import { emailService } from './emailService';
import { logger } from '../utils/logger';
import { STORAGE_KEYS, APP_CONFIG, DEFAULT_CLASS_CONFIG, EMAIL_COLORS, PPDB_CONFIG, ID_FORMAT } from '../constants';
import type { PPDBRegistrant, Student, User, PPDBAutoCreationConfig, PPDBAutoCreationAudit } from '../types';

/**
 * PPDB Pipeline Status - Extended admission pipeline
 * 
 * Pipeline flow:
 * registered → document_review → interview_scheduled → interview_completed → accepted → enrolled → rejected
 */
export type PPDBPipelineStatus =
  | 'registered'
  | 'document_review'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'accepted'
  | 'enrolled'
  | 'rejected';

/**
 * PPDB Pipeline Status - Maintains backward compatibility with existing PPDBManagement
 */
export type PPDBStatusLegacy = 'pending' | 'approved' | 'rejected';

/**
 * PPDB Pipeline Metrics - Dashboard funnel metrics
 */
export interface PPDBPipelineMetrics {
  total: number;
  registered: number;
  document_review: number;
  interview_scheduled: number;
  interview_completed: number;
  accepted: number;
  enrolled: number;
  rejected: number;
}

/**
 * PPDB Pipeline State - Per-registrant pipeline state
 */
export interface PPDBPipelineState {
  registrantId: string;
  status: PPDBPipelineStatus;
  statusHistory: Array<{
    status: PPDBPipelineStatus;
    timestamp: string;
    notes?: string;
  }>;
  studentId?: string;
  parentAccountId?: string;
  assignedClass?: string;
  enrollmentDate?: string;
  lastUpdated: string;
}

/**
 * Parent Account Credentials - For email notification
 */
export interface ParentAccountCredentials {
  username: string;
  password: string;
  userId: string;
  studentId: string;
  studentName: string;
}

/**
 * PPDB Integration Service Class
 */
class PPDBIntegrationService {
  private static instance: PPDBIntegrationService;

  private constructor() {
    logger.info('PPDBIntegrationService initialized');
  }

  public static getInstance(): PPDBIntegrationService {
    if (!PPDBIntegrationService.instance) {
      PPDBIntegrationService.instance = new PPDBIntegrationService();
    }
    return PPDBIntegrationService.instance;
  }

  /**
   * Generate unique NIS (Nomor Induk Siswa)
   * Format: YEAR + CLASS_CODE + SEQUENCE (e.g., 202510001)
   */
  public generateNIS(): string {
    try {
      const now = new Date();
      const year = now.getFullYear();

      // Get current counter from localStorage - Flexy: Use constants for formatting!
      const counterKey = STORAGE_KEYS.PPDB_NIS_COUNTER;
      let counter = parseInt(localStorage.getItem(counterKey) || PPDB_CONFIG.NIS_INITIAL_COUNTER.toString(), PPDB_CONFIG.NIS_COUNTER_RADIX);

      // Increment counter
      counter += 1;
      localStorage.setItem(counterKey, counter.toString());

      // Generate NIS: YEAR + CLASS + padded sequence
      const classCode = DEFAULT_CLASS_CONFIG.NEW_STUDENT_CODE;
      const sequence = counter.toString().padStart(PPDB_CONFIG.NIS_PADDING_LENGTH, ID_FORMAT.PAD_STRING);
      const nis = `${year}${classCode}${sequence}`;

      logger.info('Generated NIS', { nis, year, classCode, counter });
      return nis;
    } catch (error) {
      logger.error('Failed to generate NIS:', error);
      throw new Error('Gagal generate NIS');
    }
  }

  /**
   * Assign student to available class
   * Logic: Find class with available capacity (< 30 students)
   */
  public assignToClass(): { className: string; class: string } {
    try {
      // Default class assignment for new students
      // In production, this would load-balance based on existing student count
      const classCode = DEFAULT_CLASS_CONFIG.NEW_STUDENT_CODE;
      const className = DEFAULT_CLASS_CONFIG.NEW_STUDENT_NAME;

      logger.info('Assigned student to class', { assignedClass: classCode, assignedClassName: className });
      return { className, class: classCode };
    } catch (error) {
      logger.error('Failed to assign class:', error);
      throw new Error('Gagal menentukan kelas');
    }
  }

  /**
   * Create parent account for registrant
   * Generates random password and creates user record
   */
  public async createParentAccount(registrant: PPDBRegistrant): Promise<ParentAccountCredentials> {
    try {
      const password = this.generateRandomPassword();

      const parentUser: Partial<User> = {
        id: `user_${Date.now()}`,
        name: registrant.parentName,
        email: registrant.email,
        role: 'parent',
        extraRole: null,
        status: 'active',
      };

      const response = await usersAPI.create(parentUser);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Gagal membuat akun orang tua');
      }

      const credentials: ParentAccountCredentials = {
        username: registrant.email, // Use email as username for login
        password,
        userId: response.data.id,
        studentId: '', // Will be filled after student creation
        studentName: registrant.fullName,
      };

      logger.info('Parent account created', { userId: response.data.id, email: registrant.email });
      return credentials;
    } catch (error) {
      logger.error('Failed to create parent account:', error);
      throw new Error('Gagal membuat akun orang tua');
    }
  }

  /**
   * Convert PPDB registrant to student record
   * Maps PPDB fields to Student fields and creates student record
   */
  public async convertRegistrantToStudent(
    registrant: PPDBRegistrant,
    _parentAccountId: string
  ): Promise<Student> {
    try {
      const nis = this.generateNIS();
      const { className, class: classCode } = this.assignToClass();

      const student: Partial<Student> = {
        id: `student_${Date.now()}`,
        userId: `user_${Date.now()}`, // Student user account created separately
        nisn: registrant.nisn,
        nis,
        class: classCode,
        className,
        address: registrant.address,
        phoneNumber: registrant.phoneNumber,
        parentName: registrant.parentName,
        parentPhone: registrant.phoneNumber, // Use same phone as primary
        dateOfBirth: new Date().toISOString().split('T')[0], // Placeholder, will be updated
        enrollmentDate: new Date().toISOString().split('T')[0],
      };

      const response = await studentsAPI.create(student);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Gagal membuat data siswa');
      }

      // Note: Parent-student relationship is created via student.parentName field
      // In production, this would use a dedicated parent-student relationship service

      logger.info('Student record created', { nis, class: className, studentId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to convert registrant to student:', error);
      throw new Error('Gagal membuat data siswa dari pendaftar PPDB');
    }
  }

  /**
   * Transition PPDB registrant through pipeline
   * Handles status changes, executes actions, and sends notifications
   */
  public async transitionPipelineStatus(
    registrantId: string,
    newStatus: PPDBPipelineStatus,
    notes?: string
  ): Promise<void> {
    try {
      // Get registrant data
      const registrantResponse = await ppdbAPI.getById(registrantId);
      if (!registrantResponse.success || !registrantResponse.data) {
        throw new Error('Pendaftar tidak ditemukan');
      }

      const registrant = registrantResponse.data;

      // Validate status transition
      if (!this.isValidStatusTransition(registrant.status as PPDBPipelineStatus, newStatus)) {
        throw new Error(`Status transition invalid: ${registrant.status} → ${newStatus}`);
      }

      // Get or create pipeline state
      const pipelineState = this.getPipelineState(registrantId);

      // Update pipeline state (do NOT call ppdbAPI.updateStatus here - caller manages API update)
      const updatedPipelineState: PPDBPipelineState = {
        ...pipelineState,
        registrantId,
        status: newStatus,
        statusHistory: [
          ...pipelineState.statusHistory,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            notes,
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      // Execute pipeline actions based on new status
      if (newStatus === 'accepted') {
        await this.executeAutoCreationActions(registrant, updatedPipelineState);
      } else if (newStatus === 'enrolled') {
        await this.executeEnrollmentActions(registrant, updatedPipelineState);
      }

      // Save pipeline state
      this.savePipelineState(registrantId, updatedPipelineState);

      // Send notification
      await this.sendPipelineNotification(registrant, newStatus, notes);

      logger.info('Pipeline status transitioned', {
        registrantId,
        oldStatus: registrant.status,
        newStatus,
      });
    } catch (error) {
      logger.error('Failed to transition pipeline status:', error);
      throw error;
    }
  }

  /**
   * Execute auto-creation actions when status becomes "accepted"
   * Creates parent account and student record if auto-creation is enabled
   */
  private async executeAutoCreationActions(
    registrant: PPDBRegistrant,
    pipelineState: PPDBPipelineState
  ): Promise<void> {
    try {
      const config = this.getAutoCreationConfig();

      if (!config.enabled || !config.autoCreateOnApproval) {
        logger.info('Auto-creation disabled, skipping', { registrantId: registrant.id });
        return;
      }

      if (pipelineState.studentId && pipelineState.parentAccountId) {
        logger.info('Student already created, skipping auto-creation', {
          studentId: pipelineState.studentId,
        });
        return;
      }

      if (config.requireEnrollmentConfirmation) {
        logger.info('Enrollment confirmation required, auto-creation deferred', {
          registrantId: registrant.id,
        });
        return;
      }

      logger.info('Executing auto-creation for approved registrant', { registrantId: registrant.id });

      const audit: PPDBAutoCreationAudit = {
        id: `audit_${Date.now()}`,
        registrantId: registrant.id,
        status: 'success',
        timestamp: new Date().toISOString(),
      };

      try {
        if (config.createParentAccount) {
          const parentCredentials = await this.createParentAccount(registrant);
          pipelineState.parentAccountId = parentCredentials.userId;
          audit.parentAccountId = parentCredentials.userId;
        }

        const student = await this.convertRegistrantToStudent(
          registrant,
          pipelineState.parentAccountId || ''
        );

        pipelineState.studentId = student.id;
        pipelineState.assignedClass = student.className;
        pipelineState.enrollmentDate = student.enrollmentDate;
        audit.studentId = student.id;
        audit.nis = student.nis;

        if (config.sendWelcomeEmail) {
          await this.sendAutoCreationNotification(registrant, student.nis);
        }

        await unifiedNotificationManager.showNotification({
          id: `ppdb-auto-create-${registrant.id}`,
          type: 'ppdb',
          title: 'Siswa Otomatis Dibuat',
          body: `Siswa ${registrant.fullName} berhasil dibuat secara otomatis dengan NIS: ${student.nis}`,
          icon: '✅',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high',
          targetUsers: ['admin'],
          data: {
            action: 'view_student',
            studentId: student.id,
            registrantId: registrant.id,
          },
        });

        logger.info('Auto-creation completed successfully', {
          studentId: student.id,
          nis: student.nis,
        });
      } catch (error) {
        audit.status = 'failed';
        audit.reason = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Auto-creation failed:', error);
      }

      this.saveAutoCreationAudit(registrant.id, audit);
    } catch (error) {
      logger.error('Failed to execute auto-creation actions:', error);
      throw error;
    }
  }

  /**
   * Execute enrollment actions when status becomes "enrolled"
   * Creates parent account and student record
   */
  private async executeEnrollmentActions(
    registrant: PPDBRegistrant,
    pipelineState: PPDBPipelineState
  ): Promise<void> {
    try {
      if (pipelineState.studentId && pipelineState.parentAccountId) {
        logger.info('Student already enrolled, skipping', {
          studentId: pipelineState.studentId,
        });
        return;
      }

      // Create parent account
      const parentCredentials = await this.createParentAccount(registrant);

      // Convert to student record
      const student = await this.convertRegistrantToStudent(registrant, parentCredentials.userId);

      // Update pipeline state with new IDs
      pipelineState.parentAccountId = parentCredentials.userId;
      pipelineState.studentId = student.id;
      pipelineState.assignedClass = student.className;
      pipelineState.enrollmentDate = student.enrollmentDate;

      // Send enrollment confirmation with credentials
      await this.sendEnrollmentConfirmation(registrant, parentCredentials, student.nis);

      logger.info('Enrollment actions completed', {
        studentId: student.id,
        parentAccountId: parentCredentials.userId,
        nis: student.nis,
      });
    } catch (error) {
      logger.error('Failed to execute enrollment actions:', error);
      throw error;
    }
  }

  /**
   * Send enrollment confirmation email with credentials
   */
  private async sendEnrollmentConfirmation(
    registrant: PPDBRegistrant,
    credentials: ParentAccountCredentials,
    nis: string
  ): Promise<void> {
    try {
      await emailService.sendEmail({
        recipients: [
          {
            email: registrant.email,
            name: registrant.parentName,
          },
        ],
        subject: `Selamat! Siswa Diterima di ${APP_CONFIG.SCHOOL_NAME}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: ${EMAIL_COLORS.GREEN_SUCCESS};">Selamat! Pendaftaran Diterima</h2>
            <p>Dear ${registrant.parentName},</p>
            <p>Kami dengan senang hati menginformasikan bahwa <strong>${registrant.fullName}</strong> telah diterima di ${APP_CONFIG.SCHOOL_NAME}.</p>
            
            <div style="background-color: ${EMAIL_COLORS.GRAY_BG}; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Data Siswa</h3>
              <p><strong>Nama Lengkap:</strong> ${registrant.fullName}</p>
              <p><strong>NIS:</strong> ${nis}</p>
              <p><strong>Kelas:</strong> (Akan ditentukan kemudian)</p>
            </div>
            
            <div style="background-color: ${EMAIL_COLORS.INFO}; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Akun Orang Tua</h3>
              <p>Berikut adalah akun untuk mengakses portal orang tua:</p>
              <p><strong>Username:</strong> ${credentials.username}</p>
              <p><strong>Password:</strong> ${credentials.password}</p>
              <p style="color: ${EMAIL_COLORS.WARNING}; font-size: 14px;">Silakan ganti password setelah login pertama.</p>
            </div>
            
            <p>Silakan login ke portal orang tua untuk melihat jadwal, nilai, dan informasi lainnya.</p>
            <p>Terima kasih,</p>
            <p><strong>Panitia PPDB ${APP_CONFIG.SCHOOL_NAME}</strong></p>
          </div>
        `,
        text: `Selamat! ${registrant.fullName} telah diterima di ${APP_CONFIG.SCHOOL_NAME}.\n\nNIS: ${nis}\n\nAkun Orang Tua:\nUsername: ${credentials.username}\nPassword: ${credentials.password}\n\nSilakan login ke portal orang tua untuk informasi lebih lanjut.\n\nTerima kasih,\nPanitia PPDB ${APP_CONFIG.SCHOOL_NAME}`,
        data: {
          templateId: 'enrollment_confirmation',
          registrantId: registrant.id,
          studentId: credentials.studentId,
          nis,
        },
      });

      logger.info('Enrollment confirmation email sent', {
        email: registrant.email,
        nis,
      });
    } catch (error) {
      logger.error('Failed to send enrollment confirmation:', error);
    }
  }

  /**
   * Send pipeline status notification
   */
  public async sendPipelineNotification(
    registrant: PPDBRegistrant,
    status: PPDBPipelineStatus,
    notes?: string
  ): Promise<void> {
    try {
      const statusMessages: Record<PPDBPipelineStatus, { title: string; body: string }> = {
        registered: {
          title: 'Pendaftaran Diterima',
          body: 'Pendaftaran PPDB Anda telah diterima. Tunggu informasi selanjutnya.',
        },
        document_review: {
          title: 'Dokumen Sedang Ditinjau',
          body: 'Dokumen Anda sedang ditinjau oleh panitia PPDB.',
        },
        interview_scheduled: {
          title: 'Wawancara Dijadwalkan',
          body: 'Wawancara masuk telah dijadwalkan. Cek email untuk detail.',
        },
        interview_completed: {
          title: 'Wawancara Selesai',
          body: 'Wawancara telah selesai. Tunggu hasil seleksi.',
        },
        accepted: {
          title: 'Selamat! Anda Diterima',
          body: `Selamat! Anda telah diterima di ${APP_CONFIG.SCHOOL_NAME}. Tunggu informasi pendaftaran ulang.`,
        },
        enrolled: {
          title: 'Pendaftaran Selesai',
          body: 'Siswa telah terdaftar. Akun orang tua telah dibuat. Cek email untuk kredensial login.',
        },
        rejected: {
          title: 'Mohon Maaf',
          body: 'Terima kasih telah mendaftar. Mohon maaf, Anda belum dapat diterima pada tahun ajaran ini.',
        },
      };

      const message = statusMessages[status];

      // Send push notification
      unifiedNotificationManager.showNotification({
        id: `ppdb-${registrant.id}-${Date.now()}`,
        type: 'ppdb',
        title: message.title,
        body: notes ? `${message.body}\n\nCatatan: ${notes}` : message.body,
        icon: status === 'enrolled' ? '✅' : status === 'rejected' ? '❌' : '📋',
        timestamp: new Date().toISOString(),
        read: false,
        priority: status === 'enrolled' ? 'high' : 'normal',
        targetUsers: [registrant.userId || registrant.nisn],
        data: {
          action: 'view_ppdb_status',
          registrantId: registrant.id,
          status,
        },
      });

      logger.info('Pipeline notification sent', {
        registrantId: registrant.id,
        status,
      });
    } catch (error) {
      logger.error('Failed to send pipeline notification:', error);
    }
  }

  /**
   * Get pipeline metrics for dashboard
   */
  public async getPipelineMetrics(): Promise<PPDBPipelineMetrics> {
    try {
      const response = await ppdbAPI.getAll();
      if (!response.success || !response.data) {
        throw new Error('Gagal mendapatkan data PPDB');
      }

      const registrants = response.data;

      const metrics: PPDBPipelineMetrics = {
        total: registrants.length,
        registered: registrants.filter((r) => r.status === 'registered').length,
        document_review: registrants.filter((r) => r.status === 'document_review').length,
        interview_scheduled: registrants.filter((r) => r.status === 'interview_scheduled').length,
        interview_completed: registrants.filter((r) => r.status === 'interview_completed').length,
        accepted: registrants.filter((r) => r.status === 'accepted').length + registrants.filter((r) => r.status === 'approved').length, // Include legacy 'approved'
        enrolled: registrants.filter((r) => r.status === 'enrolled').length,
        rejected: registrants.filter((r) => r.status === 'rejected').length + registrants.filter((r) => r.status === 'pending').length, // Include legacy 'pending' in metrics
      };

      // Save metrics to localStorage for dashboard
      localStorage.setItem(STORAGE_KEYS.PPDB_METRICS, JSON.stringify(metrics));

      logger.info('Pipeline metrics calculated', metrics);
      return metrics;
    } catch (error) {
      logger.error('Failed to get pipeline metrics:', error);
      
      // Return empty metrics on error
      return {
        total: 0,
        registered: 0,
        document_review: 0,
        interview_scheduled: 0,
        interview_completed: 0,
        accepted: 0,
        enrolled: 0,
        rejected: 0,
      };
    }
  }

  /**
   * Get pipeline state for a registrant
   */
  private getPipelineState(registrantId: string): PPDBPipelineState {
    try {
      const key = STORAGE_KEYS.PPDB_PIPELINE_STATUS(registrantId);
      const saved = localStorage.getItem(key);
      
      if (saved) {
        return JSON.parse(saved);
      }

      // Return initial state if not found
      return {
        registrantId,
        status: 'registered',
        statusHistory: [],
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to get pipeline state:', error);
      return {
        registrantId,
        status: 'registered',
        statusHistory: [],
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  /**
   * Save pipeline state for a registrant
   */
  private savePipelineState(registrantId: string, state: PPDBPipelineState): void {
    try {
      const key = STORAGE_KEYS.PPDB_PIPELINE_STATUS(registrantId);
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      logger.error('Failed to save pipeline state:', error);
    }
  }

  /**
   * Validate if status transition is allowed
   */
  private isValidStatusTransition(
    fromStatus: PPDBPipelineStatus,
    toStatus: PPDBPipelineStatus
  ): boolean {
    const validTransitions: Record<PPDBPipelineStatus, PPDBPipelineStatus[]> = {
      registered: ['document_review', 'rejected'],
      document_review: ['interview_scheduled', 'rejected'],
      interview_scheduled: ['interview_completed', 'rejected'],
      interview_completed: ['accepted', 'rejected'],
      accepted: ['enrolled', 'rejected'],
      enrolled: [], // Final state
      rejected: [], // Final state
    };

    return validTransitions[fromStatus]?.includes(toStatus) ?? false;
  }

  /**
   * Generate random password for parent account
   * Format: 8 characters, mixed case, numbers
   */
  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Get auto-creation configuration
   */
  public getAutoCreationConfig(): PPDBAutoCreationConfig {
    try {
      const configJson = localStorage.getItem(STORAGE_KEYS.PPDB_AUTO_CREATION_CONFIG);
      if (configJson) {
        return JSON.parse(configJson);
      }

      return this.getDefaultAutoCreationConfig();
    } catch (error) {
      logger.error('Failed to get auto-creation config:', error);
      return this.getDefaultAutoCreationConfig();
    }
  }

  /**
   * Set auto-creation configuration
   */
  public setAutoCreationConfig(config: Partial<PPDBAutoCreationConfig>): void {
    try {
      const currentConfig = this.getAutoCreationConfig();
      const updatedConfig = { ...currentConfig, ...config };
      localStorage.setItem(
        STORAGE_KEYS.PPDB_AUTO_CREATION_CONFIG,
        JSON.stringify(updatedConfig)
      );
      logger.info('Auto-creation config updated', updatedConfig);
    } catch (error) {
      logger.error('Failed to set auto-creation config:', error);
    }
  }

  /**
   * Get default auto-creation configuration
   */
  private getDefaultAutoCreationConfig(): PPDBAutoCreationConfig {
    return {
      enabled: true,
      autoCreateOnApproval: true,
      requireEnrollmentConfirmation: false,
      createParentAccount: true,
      sendWelcomeEmail: true,
    };
  }

  /**
   * Rollback auto-created student and parent accounts
   */
  public async rollbackStudentAccount(registrantId: string): Promise<void> {
    try {
      const pipelineState = this.getPipelineState(registrantId);

      if (!pipelineState.studentId || !pipelineState.parentAccountId) {
        throw new Error('No auto-created accounts to rollback');
      }

      logger.info('Rolling back auto-created accounts', {
        registrantId,
        studentId: pipelineState.studentId,
        parentAccountId: pipelineState.parentAccountId,
      });

      const registrantResponse = await ppdbAPI.getById(registrantId);
      if (!registrantResponse.success || !registrantResponse.data) {
        throw new Error('Registrant not found');
      }

      await studentsAPI.delete(pipelineState.studentId);
      await usersAPI.delete(pipelineState.parentAccountId);

      const audit: PPDBAutoCreationAudit = {
        id: `audit_${Date.now()}`,
        registrantId,
        studentId: pipelineState.studentId,
        parentAccountId: pipelineState.parentAccountId,
        nis: pipelineState.assignedClass,
        status: 'rolled_back',
        timestamp: new Date().toISOString(),
      };

      this.saveAutoCreationAudit(registrantId, audit);

      pipelineState.studentId = undefined;
      pipelineState.parentAccountId = undefined;
      pipelineState.assignedClass = undefined;
      pipelineState.enrollmentDate = undefined;

      this.savePipelineState(registrantId, pipelineState);

      await unifiedNotificationManager.showNotification({
        id: `ppdb-rollback-${registrantId}`,
        type: 'ppdb',
        title: 'Rollback Berhasil',
        body: `Akun siswa untuk ${registrantResponse.data.fullName} telah dihapus (rollback)`,
        icon: '↩️',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high',
        targetUsers: ['admin'],
        data: {
          action: 'view_ppdb',
          registrantId,
        },
      });

      logger.info('Rollback completed successfully', {
        registrantId,
        studentId: pipelineState.studentId,
      });
    } catch (error) {
      logger.error('Failed to rollback student account:', error);
      throw new Error('Gagal melakukan rollback akun siswa');
    }
  }

  /**
   * Send auto-creation notification to parent
   */
  private async sendAutoCreationNotification(
    registrant: PPDBRegistrant,
    nis: string
  ): Promise<void> {
    try {
      await emailService.sendEmail({
        recipients: [
          {
            email: registrant.email,
            name: registrant.parentName,
          },
        ],
        subject: 'Selamat! Akun Siswa Telah Dibuat',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: ${EMAIL_COLORS.GREEN_SUCCESS};">Selamat! Pendaftaran Diterima</h2>
            <p>Dear ${registrant.parentName},</p>
            <p>Kami dengan senang hati menginformasikan bahwa akun siswa untuk <strong>${registrant.fullName}</strong> telah dibuat secara otomatis.</p>
            
            <div style="background-color: ${EMAIL_COLORS.INFO}; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Data Siswa</h3>
              <p><strong>Nama Lengkap:</strong> ${registrant.fullName}</p>
              <p><strong>NIS:</strong> ${nis}</p>
              <p><strong>Kelas:</strong> (Akan ditentukan kemudian)</p>
            </div>
            
            <p>Akun parent dan akun siswa telah dibuat. Silakan login ke portal orang tua untuk informasi lebih lanjut.</p>
            <p>Terima kasih,</p>
            <p><strong>Panitia PPDB ${APP_CONFIG.SCHOOL_NAME}</strong></p>
          </div>
        `,
        text: `Selamat! Akun siswa untuk ${registrant.fullName} telah dibuat secara otomatis.\n\nNIS: ${nis}\n\nAkun parent dan akun siswa telah dibuat. Silakan login ke portal orang tua untuk informasi lebih lanjut.\n\nTerima kasih,\nPanitia PPDB ${APP_CONFIG.SCHOOL_NAME}`,
        data: {
          templateId: 'auto_creation_confirmation',
          registrantId: registrant.id,
          nis,
        },
      });

      logger.info('Auto-creation notification sent', {
        email: registrant.email,
        nis,
      });
    } catch (error) {
      logger.error('Failed to send auto-creation notification:', error);
    }
  }

  /**
   * Save auto-creation audit log
   */
  private saveAutoCreationAudit(registrantId: string, audit: PPDBAutoCreationAudit): void {
    try {
      const key = STORAGE_KEYS.PPDB_AUTO_CREATION_AUDIT(registrantId);
      localStorage.setItem(key, JSON.stringify(audit));
    } catch (error) {
      logger.error('Failed to save auto-creation audit:', error);
    }
  }

  /**
   * Get auto-creation audit logs
   */
  public async getAutoCreationAuditLogs(): Promise<PPDBAutoCreationAudit[]> {
    try {
      const registrantResponse = await ppdbAPI.getAll();
      if (!registrantResponse.success || !registrantResponse.data) {
        return [];
      }

      const audits: PPDBAutoCreationAudit[] = [];

      for (const registrant of registrantResponse.data) {
        const key = STORAGE_KEYS.PPDB_AUTO_CREATION_AUDIT(registrant.id);
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            audits.push(JSON.parse(saved));
          } catch (error) {
            logger.error('Failed to parse audit log:', error);
          }
        }
      }

      return audits;
    } catch (error) {
      logger.error('Failed to get auto-creation audit logs:', error);
      return [];
    }
  }
}

// Export singleton instance
export const ppdbIntegrationService = PPDBIntegrationService.getInstance();
