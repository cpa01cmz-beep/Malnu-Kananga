import React from 'react';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import BuildingLibraryIcon from '../components/icons/BuildingLibraryIcon';
import ClipboardDocumentCheckIcon from '../components/icons/ClipboardDocumentCheckIcon';
import UsersIcon from '../components/icons/UsersIcon';

export interface RelatedLink {
    name: string;
    href: string;
    icon: React.ReactElement;
    color: string;
}

export const relatedLinks: RelatedLink[] = [
    {
        name: 'RDM Malnu Kananga',
        href: 'https://rdm.ma-malnukananga.sch.id',
        icon: <DocumentTextIcon />,
        color: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400'
    },
    {
        name: 'Kemenag RI',
        href: 'https://kemenag.go.id',
        icon: <BuildingLibraryIcon />,
        color: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
    },
    {
        name: 'EMIS Pendis',
        href: 'https://emis.kemenag.go.id',
        icon: <ClipboardDocumentCheckIcon />,
        color: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
    },
    {
        name: 'Simpatika',
        href: 'https://simpatika.kemenag.go.id',
        icon: <UsersIcon />,
        color: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
    }
];