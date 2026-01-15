
import type { FeaturedProgram, LatestNews, User } from '../types';
import { IMAGE_URLS, EXTERNAL_LINKS } from '../constants';

export const INITIAL_PROGRAMS: FeaturedProgram[] = [
  {
    title: 'Tahfidz Al-Qur\'an',
    description: 'Program intensif menghafal Al-Qur\'an dengan bimbingan ustadz/ustadzah berkompeten.',
    imageUrl: IMAGE_URLS.UNSPLASH_TAHFIDZ
  },
  {
    title: 'Kajian Kitab Kuning',
    description: 'Pendalaman khazanah Islam klasik melalui kajian kitab-kitab kuning oleh para ahli.',
    imageUrl: IMAGE_URLS.UNSPLASH_KAJIAN
  },
  {
    title: 'Sains & Teknologi',
    description: 'Mengintegrasikan ilmu pengetahuan modern dengan nilai-nilai Islam untuk mencetak generasi unggul.',
    imageUrl: IMAGE_URLS.PLACEHOLDER_SAINS_TEKNOLOGI
  }
];

export const INITIAL_NEWS: LatestNews[] = [
    {
        title: 'MA Malnu Kananga Raih Juara 1 Lomba Cerdas Cermat Tingkat Kabupaten',
        date: '15 Juli 2024',
        category: 'Prestasi',
        imageUrl: IMAGE_URLS.UNSPLASH_PRESTASI
    },
    {
        title: 'Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2025/2026 Resmi Dibuka',
        date: '10 Juli 2024',
        category: 'Sekolah',
        imageUrl: IMAGE_URLS.UNSPLASH_PPDB
    },
    {
        title: 'Kegiatan Bakti Sosial Sukses Digelar di Desa Sekitar Sekolah',
        date: '5 Juli 2024',
        category: 'Kegiatan',
        imageUrl: IMAGE_URLS.UNSPLASH_BAKTI_SOSIAL
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
            href: EXTERNAL_LINKS.RDM_MALNU_KANANGA,
            icon: DocumentTextIcon,
            color: getColorIconClass('sky')
        },
        {
            name: 'Kemenag RI',
            href: EXTERNAL_LINKS.KEMENAG_RI,
            icon: BuildingLibraryIcon,
            color: getColorIconClass('emerald')
        },
        {
            name: 'EMIS Pendis',
            href: EXTERNAL_LINKS.EMIS_PENDIS,
            icon: ClipboardDocumentCheckIcon,
            color: getColorIconClass('amber')
        },
        {
            name: 'Simpatika',
            href: EXTERNAL_LINKS.SIMPATIKA,
            icon: UsersIcon,
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
        role: 'admin', 
        status: 'active' 
    },
    { 
        id: '2', 
        name: 'Siti Aminah, S.Pd.', 
        email: 'guru.staff@malnu.sch.id', 
        role: 'teacher', 
        extraRole: 'staff', // Guru merangkap Staff Tata Usaha/Sarpras
        status: 'active' 
    },
    { 
        id: '3', 
        name: 'Budi Santoso', 
        email: 'siswa.osis@malnu.sch.id', 
        role: 'student', 
        extraRole: 'osis', // Siswa merangkap Ketua OSIS
        status: 'active' 
    },
    { 
        id: '4', 
        name: 'Rudi Hartono, M.Pd.', 
        email: 'guru.biasa@malnu.sch.id', 
        role: 'teacher', 
        extraRole: null, 
        status: 'active' 
    },
    { 
        id: '5', 
        name: 'Dewi Sartika', 
        email: 'siswa.biasa@malnu.sch.id', 
        role: 'student', 
        extraRole: null, 
        status: 'active' 
    },
    {
        id: '6',
        name: 'Andi Pratama',
        email: 'andi.osis@malnu.sch.id',
        role: 'student',
        extraRole: 'osis', // Siswa merangkap Wakil Ketua OSIS
        status: 'active'
    },
    {
        id: '7',
        name: 'Nurul Hidayah, S.Kom',
        email: 'nurul.staff@malnu.sch.id',
        role: 'teacher',
        extraRole: 'staff', // Guru merangkap Staff IT/Laboran
        status: 'active'
    }
];
