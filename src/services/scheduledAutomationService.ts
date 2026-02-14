import { STORAGE_KEYS, TIME_MS, ID_PREFIXES } from '../constants';
import { logger } from '../utils/logger';
import { generateId } from '../utils/idGenerator';
import { dataExportImportService } from './dataExportImportService';

export interface BackupTaskConfig {
  entityTypes: string[];
  format: 'json' | 'csv';
  keepHistory: number;
  notifyOnComplete: boolean;
  recipientEmail?: string;
}

export interface AttendanceNotificationConfig {
  time: string; // HH:MM format
  days: number[]; // 0-6, where 0 is Sunday
  advanceDays: number;
  notifyParents: boolean;
  notifyTeachers: boolean;
}

export interface GradeReminderConfig {
  time: string;
  daysBeforeEnd: number;
  notifyParents: boolean;
  notifyStudents: boolean;
  minimumGrade?: number;
}

export interface AcademicCalendarConfig {
  events: string[];
  advanceNotice: number;
  notifyRoles: string[];
}

export type ScheduledTaskType = 
  | 'backup'
  | 'attendance_notification'
  | 'grade_reminder'
  | 'academic_calendar'
  | 'custom';

export type ScheduledTaskStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ScheduledTask {
  id: string;
  type: ScheduledTaskType;
  name: string;
  description?: string;
  cronExpression?: string;
  intervalMs?: number;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  status: ScheduledTaskStatus;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledAutomationSettings {
  enabled: boolean;
  defaultIntervalMs: number;
  notificationsEnabled: boolean;
  maxConcurrentTasks: number;
}

const DEFAULT_SETTINGS: ScheduledAutomationSettings = {
  enabled: true,
  defaultIntervalMs: TIME_MS.ONE_HOUR,
  notificationsEnabled: true,
  maxConcurrentTasks: 5
};

class ScheduledAutomationService {
  private tasks: ScheduledTask[] = [];
  private settings: ScheduledAutomationSettings = DEFAULT_SETTINGS;
  private taskIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const storedTasks = localStorage.getItem(STORAGE_KEYS.SCHEDULED_TASKS);
      if (storedTasks) {
        this.tasks = JSON.parse(storedTasks);
      }
      
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SCHEDULED_AUTOMATION_SETTINGS);
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }
    } catch (error) {
      logger.error('Failed to load scheduled automation data:', error);
      this.tasks = [];
      this.settings = DEFAULT_SETTINGS;
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULED_TASKS, JSON.stringify(this.tasks));
      localStorage.setItem(STORAGE_KEYS.SCHEDULED_AUTOMATION_SETTINGS, JSON.stringify(this.settings));
    } catch (error) {
      logger.error('Failed to save scheduled automation data:', error);
    }
  }

  getSettings(): ScheduledAutomationSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<ScheduledAutomationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveToStorage();
    logger.info('Scheduled automation settings updated:', this.settings);
  }

  getAllTasks(): ScheduledTask[] {
    return [...this.tasks];
  }

  getTaskById(id: string): ScheduledTask | undefined {
    return this.tasks.find(task => task.id === id);
  }

  getTasksByType(type: ScheduledTaskType): ScheduledTask[] {
    return this.tasks.filter(task => task.type === type);
  }

  createTask(
    taskData: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): ScheduledTask {
    const now = new Date().toISOString();
    const task: ScheduledTask = {
      ...taskData,
      id: generateId({ prefix: ID_PREFIXES.SCHEDULED_TASK }),
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };

    this.tasks.push(task);
    this.saveToStorage();
    logger.info(`Scheduled task created: ${task.name} (${task.id})`);
    
    return task;
  }

  updateTask(id: string, updates: Partial<ScheduledTask>): ScheduledTask | null {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) {
      logger.warn(`Scheduled task not found: ${id}`);
      return null;
    }

    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage();
    logger.info(`Scheduled task updated: ${id}`);
    
    return this.tasks[index];
  }

  deleteTask(id: string): boolean {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) {
      logger.warn(`Scheduled task not found for deletion: ${id}`);
      return false;
    }

    this.stopTask(id);
    this.tasks.splice(index, 1);
    this.saveToStorage();
    logger.info(`Scheduled task deleted: ${id}`);
    
    return true;
  }

  startTask(id: string): boolean {
    const task = this.getTaskById(id);
    if (!task || !task.enabled) {
      return false;
    }

    if (this.taskIntervals.has(id)) {
      logger.info(`Task already running: ${id}`);
      return true;
    }

    if (task.intervalMs) {
      const intervalId = setInterval(() => {
        this.runTask(id);
      }, task.intervalMs);
      
      this.taskIntervals.set(id, intervalId);
      this.updateTask(id, { status: 'running' });
      logger.info(`Scheduled task started: ${task.name}`);
      return true;
    }

    return false;
  }

  stopTask(id: string): boolean {
    const intervalId = this.taskIntervals.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      this.taskIntervals.delete(id);
      this.updateTask(id, { status: 'pending' });
      logger.info(`Scheduled task stopped: ${id}`);
      return true;
    }
    return false;
  }

  private async runTask(id: string): Promise<void> {
    const task = this.getTaskById(id);
    if (!task || !task.enabled) {
      return;
    }

    this.updateTask(id, { 
      status: 'running',
      lastRun: new Date().toISOString()
    });

    try {
      switch (task.type) {
        case 'backup':
          await this.executeBackupTask(task);
          break;
        case 'attendance_notification':
          await this.executeAttendanceNotificationTask(task);
          break;
        case 'grade_reminder':
          await this.executeGradeReminderTask(task);
          break;
        case 'academic_calendar':
          await this.executeAcademicCalendarTask(task);
          break;
        default:
          logger.warn(`Unknown scheduled task type: ${task.type}`);
      }
      
      this.updateTask(id, { status: 'completed' });
    } catch (error) {
      logger.error(`Scheduled task failed: ${id}`, error);
      this.updateTask(id, { status: 'failed' });
    }
  }

  private async executeBackupTask(task: ScheduledTask): Promise<void> {
    const config = task.config as unknown as BackupTaskConfig;
    logger.info(`Executing backup task: ${task.name}`, { config });

    try {
      const result = await dataExportImportService.executeScheduledBackup();
      if (result) {
        logger.info(`Backup completed successfully: ${task.name}`);
      } else {
        logger.warn(`Backup returned no result: ${task.name}`);
      }
    } catch (error) {
      logger.error(`Backup task failed: ${task.name}`, error);
      throw error;
    }
  }

  private async executeAttendanceNotificationTask(task: ScheduledTask): Promise<void> {
    const config = task.config as unknown as AttendanceNotificationConfig;
    logger.info(`Executing attendance notification task: ${task.name}`, { config });

    try {
      const today = new Date();
      const dayOfWeek = today.getDay();

      if (config.days.includes(dayOfWeek)) {
        logger.info(`Sending attendance notifications for day: ${dayOfWeek}`);
      }
    } catch (error) {
      logger.error(`Attendance notification task failed: ${task.name}`, error);
      throw error;
    }
  }

  private async executeGradeReminderTask(task: ScheduledTask): Promise<void> {
    const config = task.config as unknown as GradeReminderConfig;
    logger.info(`Executing grade reminder task: ${task.name}`, { config });

    try {
      logger.info(`Checking for grade reminders`);
    } catch (error) {
      logger.error(`Grade reminder task failed: ${task.name}`, error);
      throw error;
    }
  }

  private async executeAcademicCalendarTask(task: ScheduledTask): Promise<void> {
    const config = task.config as unknown as AcademicCalendarConfig;
    logger.info(`Executing academic calendar task: ${task.name}`, { config });

    try {
      logger.info(`Processing academic calendar events`);
    } catch (error) {
      logger.error(`Academic calendar task failed: ${task.name}`, error);
      throw error;
    }
  }

  startAllEnabled(): void {
    this.tasks
      .filter(task => task.enabled)
      .forEach(task => this.startTask(task.id));
  }

  stopAll(): void {
    this.taskIntervals.forEach((_, id) => this.stopTask(id));
  }

  getTaskHistory(): ScheduledTask[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SCHEDULED_TASK_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  addToHistory(task: ScheduledTask): void {
    try {
      const history = this.getTaskHistory();
      history.push(task);
      const limitedHistory = history.slice(-100);
      localStorage.setItem(STORAGE_KEYS.SCHEDULED_TASK_HISTORY, JSON.stringify(limitedHistory));
    } catch (error) {
      logger.error('Failed to add task to history:', error);
    }
  }
}

export const scheduledAutomationService = new ScheduledAutomationService();
export default scheduledAutomationService;
