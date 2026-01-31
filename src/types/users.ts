import type { UserRole, UserExtraRole } from './common';

export interface Student {
  id: string;
  userId: string;
  nisn: string;
  nis: string;
  class: string;
  className: string;
  address: string;
  phoneNumber: string;
  parentName: string;
  parentPhone: string;
  dateOfBirth: string;
  enrollmentDate: string;
}

export interface Teacher {
  id: string;
  userId: string;
  nip: string;
  subjects: string;
  joinDate: string;
}

export interface Parent {
  id: string;
  userId: string;
  children: ParentChild[];
}

export interface StudentParent {
  relationshipId: string;
  relationshipType: 'ayah' | 'ibu' | 'wali';
  isPrimaryContact: boolean;
  parentId: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  extraRole: UserExtraRole | null;
}

export interface ParentChild {
  relationshipId: string;
  relationshipType: 'ayah' | 'ibu' | 'wali';
  isPrimaryContact: boolean;
  studentId: string;
  nisn: string;
  nis: string;
  class: string;
  className: string;
  dateOfBirth: string;
  studentName: string;
  studentEmail: string;
  classNameFull?: string;
  academicYear?: string;
  semester?: string;
}

export interface ParentTeacher {
  teacherId: string;
  teacherName: string;
  subject: string;
  className: string;
  availableSlots?: TimeSlot[];
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface ParentMeeting {
  id: string;
  childId: string;
  childName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  agenda: string;
  notes?: string;
  location: string;
}

export interface ParentMessage {
  id: string;
  sender: 'parent' | 'teacher';
  teacherName?: string;
  childName?: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ParentPayment {
  id: string;
  childId?: string;
  paymentType: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: string;
  method?: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  extraRole?: UserExtraRole;
  status: 'active' | 'inactive';
  phone?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  dateOfBirth?: string;
}
