
import React from 'react';
import type { FeaturedProgram, LatestNews, User } from '../types';
import { EXTERNAL_URLS, USER_ROLES, APP_CONFIG } from '../constants';
import { ENV } from '../config/env';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import BuildingLibraryIcon from '../components/icons/BuildingLibraryIcon';
import ClipboardDocumentCheckIcon from '../components/icons/ClipboardDocumentCheckIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { getColorIconClass } from '../config/colorIcons';

export const INITIAL_PROGRAMS: FeaturedProgram[] = [
  {
    title: 'Tahfidz Al-Qur\'an',
    description: 'Program intensif menghafal Al-Qur\'an dengan bimbingan ustadz/ustadzah berkompeten.',
    imageUrl: '/images/placeholder.svg'
  },
  {
    title: 'Kajian Kitab Kuning',
    description: 'Pendalaman khazanah Islam klasik melalui kajian kitab-kitab kuning oleh para ahli.',
    imageUrl: '/images/placeholder.svg'
  },
  {
    title: 'Sains & Teknologi',
    description: 'Mengintegrasikan ilmu pengetahuan modern dengan nilai-nilai Islam untuk mencetak generasi unggul.',
    imageUrl: '/images/placeholder.svg'
  }
];

export const INITIAL_NEWS: LatestNews[] = [
    {
        title: `${APP_CONFIG.SCHOOL_NAME} Raih Juara 1 Lomba Cerdas Cermat Tingkat Kabupaten`,
        date: '15 Juli 2024',
        category: 'Prestasi',
        imageUrl: '/images/placeholder.svg'
    },
    {
        title: 'Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2025/2026 Resmi Dibuka',
        date: '10 Juli 2024',
        category: 'Sekolah',
        imageUrl: '/images/placeholder.svg'
    },
    {
        title: 'Kegiatan Bakti Sosial Sukses Digelar di Desa Sekitar Sekolah',
        date: '5 Juli 2024',
        category: 'Kegiatan',
        imageUrl: '/images/placeholder.svg'
    }
];

export const getRelatedLinks = () => {
    return [
        {
            name: `RDM ${APP_CONFIG.SCHOOL_NAME}`,
            href: EXTERNAL_URLS.RDM_PORTAL,
            icon: React.createElement(DocumentTextIcon, { className: "w-8 h-8 sm:w-10 sm:h-10" }),
            colorClass: getColorIconClass('sky')
        },
        {
            name: 'Kemenag RI',
            href: EXTERNAL_URLS.KEMENAG,
            icon: React.createElement(BuildingLibraryIcon),
            colorClass: getColorIconClass('emerald')
        },
        {
            name: 'EMIS Pendis',
            href: EXTERNAL_URLS.EMIS,
            icon: React.createElement(ClipboardDocumentCheckIcon),
            colorClass: getColorIconClass('amber')
        },
        {
            name: 'Simpatika',
            href: EXTERNAL_URLS.SIMPATIKA,
            icon: React.createElement(UsersIcon, { className: "w-8 h-8 sm:w-10 sm:h-10" }),
            colorClass: getColorIconClass('indigo')
        }
    ];
};

// Legacy export for backward compatibility
export const RELATED_LINKS = [];

// DATA AKUN DUMMY UNTUK PENGUJIAN
// Digunakan sebagai default jika LocalStorage kosong atau di-reset
// Flexy: Using ENV-driven domain for multi-tenant compatibility
const DUMMY_DOMAIN = ENV.SCHOOL.WEBSITE.replace('https://', '') || 'example.sch.id';

export const INITIAL_USERS: User[] = [
    { 
        id: '1', 
        name: 'Ahmad Dahlan', 
        email: `admin@${DUMMY_DOMAIN}`, 
        role: USER_ROLES.ADMIN, 
        status: 'active' 
    },
    { 
        id: '2', 
        name: 'Siti Aminah, S.Pd.', 
        email: `guru.staff@${DUMMY_DOMAIN}`, 
        role: USER_ROLES.TEACHER, 
        extraRole: 'staff', // Guru merangkap Staff Tata Usaha/Sarpras
        status: 'active' 
    },
    { 
        id: '3', 
        name: 'Budi Santoso', 
        email: `siswa.osis@${DUMMY_DOMAIN}`, 
        role: USER_ROLES.STUDENT, 
        extraRole: 'osis', // Siswa merangkap Ketua OSIS
        status: 'active' 
    },
    { 
        id: '4', 
        name: 'Rudi Hartono, M.Pd.', 
        email: `guru.biasa@${DUMMY_DOMAIN}`, 
        role: USER_ROLES.TEACHER, 
        extraRole: null, 
        status: 'active' 
    },
    { 
        id: '5', 
        name: 'Dewi Sartika', 
        email: `siswa.biasa@${DUMMY_DOMAIN}`, 
        role: USER_ROLES.STUDENT, 
        extraRole: null, 
        status: 'active' 
    },
    {
        id: '6',
        name: 'Andi Pratama',
        email: `andi.osis@${DUMMY_DOMAIN}`,
        role: USER_ROLES.STUDENT,
        extraRole: 'osis', // Siswa merangkap Wakil Ketua OSIS
        status: 'active'
    },
    {
        id: '7',
        name: 'Nurul Hidayah, S.Kom',
        email: `nurul.staff@${DUMMY_DOMAIN}`,
        role: USER_ROLES.TEACHER,
        extraRole: 'staff', // Guru merangkap Staff IT/Laboran
        status: 'active'
    }
];
