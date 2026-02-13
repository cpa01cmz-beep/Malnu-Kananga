import React from 'react';
import type { FeaturedProgram, LatestNews, User } from '../types';
import { EXTERNAL_URLS, USER_ROLES, USER_STATUS, APP_CONFIG } from '../constants';

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

export const getRelatedLinks = async () => {
    const [
        DocumentTextIconModule,
        BuildingLibraryIconModule,
        ClipboardDocumentCheckIconModule,
        UsersIconModule,
        { getColorIconClass }
    ] = await Promise.all([
        import('../components/icons/DocumentTextIcon'),
        import('../components/icons/BuildingLibraryIcon'),
        import('../components/icons/ClipboardDocumentCheckIcon'),
        import('../components/icons/UsersIcon'),
        import('../config/colorIcons')
    ]);

    const DocumentTextIcon = DocumentTextIconModule.default;
    const BuildingLibraryIcon = BuildingLibraryIconModule.default;
    const ClipboardDocumentCheckIcon = ClipboardDocumentCheckIconModule.default;
    const UsersIcon = UsersIconModule.UsersIcon;

    return [
        {
            name: 'RDM Malnu Kananga',
            href: EXTERNAL_URLS.RDM_PORTAL,
            icon: <DocumentTextIcon />,
            color: getColorIconClass('sky')
        },
        {
            name: 'Kemenag RI',
            href: EXTERNAL_URLS.KEMENAG,
            icon: <BuildingLibraryIcon />,
            color: getColorIconClass('emerald')
        },
        {
            name: 'EMIS Pendis',
            href: EXTERNAL_URLS.EMIS,
            icon: <ClipboardDocumentCheckIcon />,
            color: getColorIconClass('amber')
        },
        {
            name: 'Simpatika',
            href: EXTERNAL_URLS.SIMPATIKA,
            icon: <UsersIcon />,
            color: getColorIconClass('indigo')
        }
    ];
};

// Legacy export for backward compatibility
export const RELATED_LINKS = [];

// DATA AKUN DUMMY UNTUK PENGUJIAN
// Digunakan sebagai default jika LocalStorage kosong atau di-reset
export const INITIAL_USERS: User[] = [
    { 
        id: '1', 
        name: 'Ahmad Dahlan', 
        email: 'admin@malnu.sch.id', 
        role: USER_ROLES.ADMIN, 
        status: USER_STATUS.ACTIVE 
    },
    { 
        id: '2', 
        name: 'Siti Aminah, S.Pd.', 
        email: 'guru.staff@malnu.sch.id', 
        role: USER_ROLES.TEACHER, 
        extraRole: 'staff', // Guru merangkap Staff Tata Usaha/Sarpras
        status: USER_STATUS.ACTIVE 
    },
    { 
        id: '3', 
        name: 'Budi Santoso', 
        email: 'siswa.osis@malnu.sch.id', 
        role: USER_ROLES.STUDENT, 
        extraRole: 'osis', // Siswa merangkap Ketua OSIS
        status: USER_STATUS.ACTIVE 
    },
    { 
        id: '4', 
        name: 'Rudi Hartono, M.Pd.', 
        email: 'guru.biasa@malnu.sch.id', 
        role: USER_ROLES.TEACHER, 
        extraRole: null, 
        status: USER_STATUS.ACTIVE 
    },
    { 
        id: '5', 
        name: 'Dewi Sartika', 
        email: 'siswa.biasa@malnu.sch.id', 
        role: USER_ROLES.STUDENT, 
        extraRole: null, 
        status: USER_STATUS.ACTIVE 
    },
    {
        id: '6',
        name: 'Andi Pratama',
        email: 'andi.osis@malnu.sch.id',
        role: USER_ROLES.STUDENT,
        extraRole: 'osis', // Siswa merangkap Wakil Ketua OSIS
        status: USER_STATUS.ACTIVE
    },
    {
        id: '7',
        name: 'Nurul Hidayah, S.Kom',
        email: 'nurul.staff@malnu.sch.id',
        role: USER_ROLES.TEACHER,
        extraRole: 'staff', // Guru merangkap Staff IT/Laboran
        status: USER_STATUS.ACTIVE
    }
];
