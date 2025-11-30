
import React, { useState } from 'react';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';

interface Material {
  id: string;
  title: string;
  subject: string;
  type: 'PDF' | 'DOCX' | 'PPT' | 'VIDEO';
  size: string;
  uploadDate: string;
}

interface ELibraryProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const STORAGE_KEY = 'malnu_materials';

const INITIAL_MATERIALS: Material[] = [
    { id: '1', title: 'Modul Bab 1: Limit Fungsi', subject: 'Matematika Wajib', type: 'PDF', size: '2.4 MB', uploadDate: '2024-07-20' },
    { id: '2', title: 'Slide Presentasi Sejarah Bani Umayyah', subject: 'Sejarah Kebudayaan Islam', type: 'PPT', size: '5.1 MB', uploadDate: '2024-07-22' },
    { id: '3', title: 'Latihan Soal Teks Eksplanasi', subject: 'Bahasa Indonesia', type: 'DOCX', size: '500 KB', uploadDate: '2024-07-25' },
];

const ELibrary: React.FC<ELibraryProps> = ({ onBack, onShowToast }) => {
  // Read Only - Get from Shared LocalStorage
  const [materials] = useState<Material[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [filterSubject, setFilterSubject] = useState('Semua');
  const [search, setSearch] = useState('');

  // Get unique subjects for filter
  const subjects = ['Semua', ...Array.from(new Set(materials.map(m => m.subject)))];

  const filteredMaterials = materials.filter(m => {
      const matchSubject = filterSubject === 'Semua' || m.subject === filterSubject;
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
      return matchSubject && matchSearch;
  });

  const handleDownload = (title: string) => {
      onShowToast(`Mulai mengunduh "${title}"...`, 'success');
  };

  return (
    <div className="animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
                    ← Kembali ke Portal
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">E-Library & Materi</h2>
                <p className="text-gray-500 dark:text-gray-400">Akses modul pembelajaran dan tugas digital.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <input 
                    type="text" 
                    placeholder="Cari materi..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full md:w-48 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide">
            {subjects.map(subject => (
                <button
                    key={subject}
                    onClick={() => setFilterSubject(subject)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        filterSubject === subject
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    {subject}
                </button>
            ))}
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.length > 0 ? (
                filteredMaterials.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all hover:-translate-y-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${
                                item.type === 'PDF' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                                item.type === 'DOCX' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                                item.type === 'PPT' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20' :
                                'bg-purple-50 text-purple-600 dark:bg-purple-900/20'
                            }`}>
                                <DocumentTextIcon />
                            </div>
                            <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">
                                {item.type}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 flex-grow">
                            {item.title}
                        </h3>
                        
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                            <p>Mapel: <span className="text-gray-700 dark:text-gray-300">{item.subject}</span></p>
                            <div className="flex justify-between text-xs opacity-75">
                                <span>{item.uploadDate}</span>
                                <span>{item.size}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleDownload(item.title)}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors font-medium text-sm"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Download
                        </button>
                    </div>
                ))
            ) : (
                <div className="col-span-full py-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-4">
                        <DocumentTextIcon />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Tidak ada materi ditemukan untuk filter ini.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default ELibrary;
