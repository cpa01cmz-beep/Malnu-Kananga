import React from 'react';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import BuildingLibraryIcon from '../icons/BuildingLibraryIcon';
import ClipboardDocumentCheckIcon from '../icons/ClipboardDocumentCheckIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { BrainIcon } from '../icons/BrainIcon';
import AssignmentIcon from '../icons/AssignmentIcon';
import { LightBulbIcon } from '../icons/LightBulbIcon';
import type { ColorTheme } from '../ui/DashboardActionCard';
import type { UserExtraRole } from '../../types';
import type { UserRole, UserExtraRole as PermUserExtraRole } from '../../types/permissions';
import { permissionService } from '../../services/permissionService';

interface MenuItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  colorTheme: ColorTheme;
  action: () => void;
  permission: string;
  active: boolean;
}

export const allMenuItems: MenuItem[] = [
  {
    title: 'Jadwal Pelajaran',
    description: 'Lihat jadwal kelas mingguan Anda.',
    icon: <DocumentTextIcon />,
    colorTheme: 'blue',
    action: () => { },
    permission: 'academic.schedule',
    active: true
  },
  {
    title: 'E-Library',
    description: 'Akses buku digital dan materi pelajaran.',
    icon: <BuildingLibraryIcon />,
    colorTheme: 'purple',
    action: () => { },
    permission: 'content.read',
    active: true
  },
  {
    title: 'Tugas Saya',
    description: 'Lihat dan kumpulkan tugas.',
    icon: <AssignmentIcon />,
    colorTheme: 'blue',
    action: () => { },
    permission: 'academic.assignments.submit',
    active: true
  },
  {
    title: 'Grup Diskusi',
    description: 'Bergabung ke grup kelas dan mata pelajaran.',
    icon: <UsersIcon />,
    colorTheme: 'indigo',
    action: () => { },
    permission: 'communication.messages',
    active: true
  },
  {
    title: 'Nilai Akademik',
    description: 'Pantau hasil belajar dan transkrip nilai.',
    icon: <ClipboardDocumentCheckIcon />,
    colorTheme: 'green',
    action: () => { },
    permission: 'content.read',
    active: true
  },
  {
    title: 'Kehadiran',
    description: 'Cek rekapitulasi absensi semester ini.',
    icon: <UsersIcon />,
    colorTheme: 'orange',
    action: () => { },
    permission: 'content.read',
    active: true
  },
  {
    title: 'My Insights',
    description: 'Analisis AI performa akademik personal.',
    icon: <BrainIcon />,
    colorTheme: 'purple',
    action: () => { },
    permission: 'content.read',
    active: true
  },
  {
    title: 'Rencana Belajar AI',
    description: 'Buat rencana belajar personal berbasis AI.',
    icon: <LightBulbIcon />,
    colorTheme: 'yellow',
    action: () => { },
    permission: 'content.read',
    active: true
  },
  {
    title: 'Analitik Rencana Belajar',
    description: 'Lacak kemajuan dan efektivitas rencana belajar.',
    icon: <ClipboardDocumentCheckIcon />,
    colorTheme: 'blue',
    action: () => { },
    permission: 'content.read',
    active: true
  },
  {
    title: 'Kuis',
    description: 'Kerjakan kuis dan ujian online.',
    icon: <ClipboardDocumentCheckIcon />,
    colorTheme: 'indigo',
    action: () => { },
    permission: 'quizzes.take',
    active: true
  },
  {
    title: 'Riwayat Kuis',
    description: 'Lihat riwayat hasil kuis dan skor.',
    icon: <ClipboardDocumentCheckIcon />,
    colorTheme: 'purple',
    action: () => { },
    permission: 'quizzes.view_history',
    active: true
  },
];

export const useFilteredMenuItems = (extraRole: UserExtraRole) => {
  const checkPermission = (permission: string) => {
    const result = permissionService.hasPermission('student' as UserRole, extraRole as PermUserExtraRole, permission);
    return result.granted;
  };

  return allMenuItems.filter(item => checkPermission(item.permission));
};

export default allMenuItems;
