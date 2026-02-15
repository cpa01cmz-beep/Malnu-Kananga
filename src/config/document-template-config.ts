/**
 * Document Template Configuration
 * Flexy: Centralized configuration for document templates
 */

import { APP_CONFIG, DOCUMENT_TEMPLATE, TIME_MS } from '../constants';

/** Template types available in the system */
export type DocumentTemplateType = 
  | 'certificate' 
  | 'report_card' 
  | 'letter' 
  | 'id_card'
  | 'enrollment';

/** Template output formats */
export type DocumentOutputFormat = 'pdf' | 'html';

/** Certificate template variants */
export type CertificateType = 
  | 'completion' 
  | 'achievement' 
  | 'attendance' 
  | 'excellence';

/** Letter template variants */
export type LetterType = 
  | 'official' 
  | 'recommendation' 
  | 'warning' 
  | 'announcement';

/** Report card format */
export type ReportCardFormat = 
  | 'semester' 
  | 'mid_semester' 
  | 'annual';

/** Document template interface */
export interface DocumentTemplate {
  id: string;
  name: string;
  type: DocumentTemplateType;
  description: string;
  fields: TemplateField[];
  defaultContent?: string;
  schoolBranding: boolean;
}

/** Individual field in a template */
export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'image' | 'signature';
  required: boolean;
  defaultValue?: string;
  options?: string[]; // For select type
  placeholder?: string;
}

/** Data context for template rendering */
export interface TemplateContext {
  // Student information
  studentName?: string;
  studentId?: string;
  studentNISN?: string;
  studentAddress?: string;
  studentBirthDate?: string;
  studentBirthPlace?: string;
  studentGender?: string;
  studentPhone?: string;
  studentEmail?: string;
  parentName?: string;
  parentPhone?: string;
  
  // Academic information
  className?: string;
  semester?: string;
  academicYear?: string;
  gradeLevel?: string;
  
  // Grades (for report cards)
  grades?: {
    subject: string;
    score: number;
    maxScore: number;
    letterGrade?: string;
  }[];
  averageScore?: number;
  rank?: number;
  totalStudents?: number;
  attendancePercentage?: number;
  absenceCount?: number;
  
  // Certificate specific
  certificateType?: CertificateType;
  certificateTitle?: string;
  certificateDescription?: string;
  issuedDate?: string;
  validityDate?: string;
  principalName?: string;
  principalTitle?: string;
  
  // Letter specific
  letterType?: LetterType;
  letterSubject?: string;
  letterBody?: string;
  recipientName?: string;
  recipientAddress?: string;
  
  // School information
  schoolName?: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  schoolNPSN?: string;
  
  // Custom fields
  [key: string]: string | number | boolean | undefined | unknown;
}

/** Batch generation options */
export interface BatchGenerationOptions {
  templateId: string;
  students: TemplateContext[];
  outputFormat: DocumentOutputFormat;
  fileNamePrefix?: string;
  onProgress?: (current: number, total: number) => void;
}

/** Certificate template configurations */
export const CERTIFICATE_TEMPLATES: Record<CertificateType, DocumentTemplate> = {
  completion: {
    id: 'certificate_completion',
    name: 'Sertifikat Penyelesaian',
    type: 'certificate',
    description: 'Sertifikat penyelesaian pembelajaran',
    schoolBranding: true,
    fields: [
      { key: 'studentName', label: 'Nama Siswa', type: 'text', required: true },
      { key: 'issuedDate', label: 'Tanggal Penerbitan', type: 'date', required: true },
      { key: 'certificateDescription', label: 'Deskripsi', type: 'text', required: false },
    ],
  },
  achievement: {
    id: 'certificate_achievement',
    name: 'Sertifikat Prestasi',
    type: 'certificate',
    description: 'Sertifikat penghargaan prestasi',
    schoolBranding: true,
    fields: [
      { key: 'studentName', label: 'Nama Siswa', type: 'text', required: true },
      { key: 'certificateTitle', label: 'Judul Prestasi', type: 'text', required: true },
      { key: 'certificateDescription', label: 'Deskripsi Prestasi', type: 'text', required: true },
      { key: 'issuedDate', label: 'Tanggal Penerbitan', type: 'date', required: true },
    ],
  },
  attendance: {
    id: 'certificate_attendance',
    name: 'Sertifikat Kehadiran',
    type: 'certificate',
    description: 'Sertifikat keterangan kehadiran',
    schoolBranding: true,
    fields: [
      { key: 'studentName', label: 'Nama Siswa', type: 'text', required: true },
      { key: 'className', label: 'Kelas', type: 'text', required: true },
      { key: 'academicYear', label: 'Tahun Ajaran', type: 'text', required: true },
      { key: 'attendancePercentage', label: 'Persentase Kehadiran', type: 'number', required: true },
    ],
  },
  excellence: {
    id: 'certificate_excellence',
    name: 'Sertifikat Keteladanan',
    type: 'certificate',
    description: 'Sertifikat siswa teladan',
    schoolBranding: true,
    fields: [
      { key: 'studentName', label: 'Nama Siswa', type: 'text', required: true },
      { key: 'className', label: 'Kelas', type: 'text', required: true },
      { key: 'certificateTitle', label: 'Judul', type: 'text', required: true },
      { key: 'certificateDescription', label: 'Alasan', type: 'text', required: true },
      { key: 'issuedDate', label: 'Tanggal Penerbitan', type: 'date', required: true },
    ],
  },
};

/** Report card template configuration */
export const REPORT_CARD_TEMPLATE: DocumentTemplate = {
  id: 'report_card',
  name: 'Raport Siswa',
  type: 'report_card',
  description: 'Laporan nilai akademik siswa',
  schoolBranding: true,
  fields: [
    { key: 'studentName', label: 'Nama Siswa', type: 'text', required: true },
    { key: 'studentId', label: 'NIS', type: 'text', required: true },
    { key: 'className', label: 'Kelas', type: 'text', required: true },
    { key: 'semester', label: 'Semester', type: 'select', required: true, options: ['1', '2'] },
    { key: 'academicYear', label: 'Tahun Ajaran', type: 'text', required: true },
    { key: 'grades', label: 'Nilai', type: 'text', required: true },
    { key: 'averageScore', label: 'Rata-rata', type: 'number', required: true },
    { key: 'rank', label: 'Peringkat', type: 'number', required: false },
    { key: 'attendancePercentage', label: 'Kehadiran (%)', type: 'number', required: true },
  ],
};

/** Letter template configurations */
export const LETTER_TEMPLATES: Record<LetterType, DocumentTemplate> = {
  official: {
    id: 'letter_official',
    name: 'Surat Resmi',
    type: 'letter',
    description: 'Surat resmi sekolah',
    schoolBranding: true,
    fields: [
      { key: 'letterSubject', label: 'Perihal', type: 'text', required: true },
      { key: 'recipientName', label: 'Nama Penerima', type: 'text', required: true },
      { key: 'recipientAddress', label: 'Alamat Penerima', type: 'text', required: false },
      { key: 'letterBody', label: 'Isi Surat', type: 'text', required: true },
    ],
  },
  recommendation: {
    id: 'letter_recommendation',
    name: 'Surat Rekomendasi',
    type: 'letter',
    description: 'Surat rekomendasi siswa',
    schoolBranding: true,
    fields: [
      { key: 'studentName', label: 'Nama Siswa', type: 'text', required: true },
      { key: 'className', label: 'Kelas', type: 'text', required: true },
      { key: 'recipientName', label: 'Nama Penerima', type: 'text', required: true },
      { key: 'letterBody', label: 'Isi Rekomendasi', type: 'text', required: true },
    ],
  },
  warning: {
    id: 'letter_warning',
    name: 'Surat Peringatan',
    type: 'letter',
    description: 'Surat peringatan kepada siswa/orang tua',
    schoolBranding: true,
    fields: [
      { key: 'studentName', label: 'Nama Siswa', type: 'text', required: true },
      { key: 'parentName', label: 'Nama Orang Tua', type: 'text', required: true },
      { key: 'letterSubject', label: 'Peringatan', type: 'text', required: true },
      { key: 'letterBody', label: 'Isi Surat', type: 'text', required: true },
    ],
  },
  announcement: {
    id: 'letter_announcement',
    name: 'Surat Pengumuman',
    type: 'letter',
    description: 'Surat pengumuman sekolah',
    schoolBranding: true,
    fields: [
      { key: 'letterSubject', label: 'Judul Pengumuman', type: 'text', required: true },
      { key: 'letterBody', label: 'Isi Pengumuman', type: 'text', required: true },
    ],
  },
};

/** ID Card template configuration */
export const ID_CARD_TEMPLATE: DocumentTemplate = {
  id: 'id_card',
  name: 'Kartu Identitas Siswa',
  type: 'id_card',
  description: 'Kartu identitas siswa',
  schoolBranding: true,
  fields: [
    { key: 'studentName', label: 'Nama Siswa', type: 'text', required: true },
    { key: 'studentId', label: 'NIS', type: 'text', required: true },
    { key: 'studentNISN', label: 'NISN', type: 'text', required: false },
    { key: 'className', label: 'Kelas', type: 'text', required: true },
    { key: 'academicYear', label: 'Tahun Ajaran', type: 'text', required: true },
  ],
};

/** Enrollment template configuration */
export const ENROLLMENT_TEMPLATE: DocumentTemplate = {
  id: 'enrollment',
  name: 'Bukti Pendaftaran',
  type: 'enrollment',
  description: 'Bukti pendaftaran ulang siswa',
  schoolBranding: true,
  fields: [
    { key: 'studentName', label: 'Nama Siswa', type: 'text', required: true },
    { key: 'studentId', label: 'NIS', type: 'text', required: true },
    { key: 'className', label: 'Kelas', type: 'text', required: true },
    { key: 'academicYear', label: 'Tahun Ajaran', type: 'text', required: true },
    { key: 'issuedDate', label: 'Tanggal Pendaftaran', type: 'date', required: true },
  ],
};

/** Document Template Configuration */
export const DOCUMENT_TEMPLATE_CONFIG = {
  /** All available certificate templates */
  CERTIFICATES: CERTIFICATE_TEMPLATES,
  
  /** Report card template */
  REPORT_CARD: REPORT_CARD_TEMPLATE,
  
  /** All available letter templates */
  LETTERS: LETTER_TEMPLATES,
  
  /** ID card template */
  ID_CARD: ID_CARD_TEMPLATE,
  
  /** Enrollment template */
  ENROLLMENT: ENROLLMENT_TEMPLATE,
  
  /** Get template by type and variant */
  getTemplate: (type: DocumentTemplateType, variant?: string): DocumentTemplate => {
    switch (type) {
      case 'certificate':
        return CERTIFICATE_TEMPLATES[variant as CertificateType] || CERTIFICATE_TEMPLATES.completion;
      case 'report_card':
        return REPORT_CARD_TEMPLATE;
      case 'letter':
        return LETTER_TEMPLATES[variant as LetterType] || LETTER_TEMPLATES.official;
      case 'id_card':
        return ID_CARD_TEMPLATE;
      case 'enrollment':
        return ENROLLMENT_TEMPLATE;
      default:
        return REPORT_CARD_TEMPLATE;
    }
  },
  
  /** Default school branding */
  DEFAULT_SCHOOL_NAME: APP_CONFIG.SCHOOL_NAME,
  DEFAULT_SCHOOL_ADDRESS: APP_CONFIG.SCHOOL_ADDRESS,
  
  /** PDF settings */
  PDF: {
    orientation: 'portrait' as const,
    unit: 'mm' as const,
    format: 'a4' as const,
    margins: {
      top: DOCUMENT_TEMPLATE.MARGIN_PX,
      right: DOCUMENT_TEMPLATE.MARGIN_PX,
      bottom: DOCUMENT_TEMPLATE.MARGIN_PX,
      left: DOCUMENT_TEMPLATE.MARGIN_PX,
    },
  },
  
  /** Batch generation settings */
  BATCH: {
    maxConcurrent: 5,
    delayBetweenBatches: TIME_MS.MS100, // Flexy: Use centralized time constant
  },
} as const;

export default DOCUMENT_TEMPLATE_CONFIG;
