
import type { FeaturedProgram, LatestNews, User } from '../types';

export const INITIAL_PROGRAMS: FeaturedProgram[] = [
  {
    title: 'Tahfidz Al-Qur\'an',
    description: 'Program intensif menghafal Al-Qur\'an dengan bimbingan ustadz/ustadzah berkompeten.',
    imageUrl: 'https://images.unsplash.com/photo-1599339942293-86b72a38547b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
  },
  {
    title: 'Kajian Kitab Kuning',
    description: 'Pendalaman khazanah Islam klasik melalui kajian kitab-kitab kuning oleh para ahli.',
    imageUrl: 'https://images.unsplash.com/photo-1585056701393-85835978f84e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
  },
  {
    title: 'Sains & Teknologi',
    description: 'Mengintegrasikan ilmu pengetahuan modern dengan nilai-nilai Islam untuk mencetak generasi unggul.',
    imageUrl: 'https://placehold.co/600x400?text=Sains+&+Teknologi'
  }
];

export const INITIAL_NEWS: LatestNews[] = [
    {
        title: 'MA Malnu Kananga Raih Juara 1 Lomba Cerdas Cermat Tingkat Kabupaten',
        date: '15 Juli 2024',
        category: 'Prestasi',
        imageUrl: 'https://images.unsplash.com/photo-1571260899204-42aebca5a2aa?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
    },
    {
        title: 'Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2025/2026 Resmi Dibuka',
        date: '10 Juli 2024',
        category: 'Sekolah',
        imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
    },
    {
        title: 'Kegiatan Bakti Sosial Sukses Digelar di Desa Sekitar Sekolah',
        date: '5 Juli 2024',
        category: 'Kegiatan',
        imageUrl: 'https://images.unsplash.com/photo-1618494955439-78a25c1b698a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
    }
];

export const getRelatedLinks = async () => {
    const [
        DocumentTextIconModule,
        BuildingLibraryIconModule,
        ClipboardDocumentCheckIconModule,
        UsersIconModule
    ] = await Promise.all([
        import('../components/icons/DocumentTextIcon'),
        import('../components/icons/BuildingLibraryIcon'),
        import('../components/icons/ClipboardDocumentCheckIcon'),
        import('../components/icons/UsersIcon')
    ]);

    const DocumentTextIcon = DocumentTextIconModule.default;
    const BuildingLibraryIcon = BuildingLibraryIconModule.default;
    const ClipboardDocumentCheckIcon = ClipboardDocumentCheckIconModule.default;
    const UsersIcon = UsersIconModule.default;

    return [
        {
            name: 'RDM Malnu Kananga',
            href: 'https://rdm.ma-malnukananga.sch.id',
            icon: DocumentTextIcon,
            color: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400'
        },
        {
            name: 'Kemenag RI',
            href: 'https://kemenag.go.id',
            icon: BuildingLibraryIcon,
            color: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
        },
        {
            name: 'EMIS Pendis',
            href: 'https://emis.kemenag.go.id',
            icon: ClipboardDocumentCheckIcon,
            color: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
        },
        {
            name: 'Simpatika',
            href: 'https://simpatika.kemenag.go.id',
            icon: UsersIcon,
            color: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
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
