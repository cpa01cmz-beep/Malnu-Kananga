// Related links data for the portal
// This file contains the same data as relatedLinks.tsx but in a format suitable for database seeding

export interface RelatedLinkData {
    id: number;
    name: string;
    href: string;
    iconName: string;
    colorClass: string;
    isActive: boolean;
    sortOrder: number;
}

export const relatedLinks: RelatedLinkData[] = [
    {
        id: 1,
        name: 'RDM Malnu Kananga',
        href: 'https://rdm.ma-malnukananga.sch.id',
        iconName: 'DocumentTextIcon',
        colorClass: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400',
        isActive: true,
        sortOrder: 1
    },
    {
        id: 2,
        name: 'Kemenag RI',
        href: 'https://kemenag.go.id',
        iconName: 'BuildingLibraryIcon',
        colorClass: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
        isActive: true,
        sortOrder: 2
    },
    {
        id: 3,
        name: 'EMIS Pendis',
        href: 'https://emis.kemenag.go.id',
        iconName: 'ClipboardDocumentCheckIcon',
        colorClass: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
        isActive: true,
        sortOrder: 3
    },
    {
        id: 4,
        name: 'Simpatika',
        href: 'https://simpatika.kemenag.go.id',
        iconName: 'UsersIcon',
        colorClass: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
        isActive: true,
        sortOrder: 4
    }
];