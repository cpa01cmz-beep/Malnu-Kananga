
import React, { useState, useEffect } from 'react';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import { TrashIcon } from './icons/TrashIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';

interface Material {
  id: string;
  title: string;
  subject: string;
  type: 'PDF' | 'DOCX' | 'PPT' | 'VIDEO';
  size: string;
  uploadDate: string;
}

interface MaterialUploadProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const STORAGE_KEY = 'malnu_materials';

const INITIAL_MATERIALS: Material[] = [
    { id: '1', title: 'Modul Bab 1: Limit Fungsi', subject: 'Matematika Wajib', type: 'PDF', size: '2.4 MB', uploadDate: '2024-07-20' },
    { id: '2', title: 'Slide Presentasi Sejarah Bani Umayyah', subject: 'Sejarah Kebudayaan Islam', type: 'PPT', size: '5.1 MB', uploadDate: '2024-07-22' },
    { id: '3', title: 'Latihan Soal Teks Eksplanasi', subject: 'Bahasa Indonesia', type: 'DOCX', size: '500 KB', uploadDate: '2024-07-25' },
];

const MaterialUpload: React.FC<MaterialUploadProps> = ({ onBack, onShowToast }) => {
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
  }, [materials]);

  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Matematika Wajib');
  const [newType, setNewType] = useState<'PDF' | 'DOCX' | 'PPT' | 'VIDEO'>('PDF');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newMaterial: Material = {
        id: Date.now().toString(),
        title: newTitle,
        subject: newSubject,
        type: newType,
        size: (Math.random() * 5 + 1).toFixed(1) + ' MB', // Mock size
        uploadDate: new Date().toISOString().split('T')[0]
    };

    setMaterials(prev => [newMaterial, ...prev]);
    setNewTitle('');
    onShowToast('Materi berhasil diunggah dan tersedia untuk siswa.', 'success');
  };

  const handleDelete = (id: string) => {
      if(window.confirm('Hapus materi ini? Siswa tidak akan bisa mengaksesnya lagi.')) {
          setMaterials(prev => prev.filter(m => m.id !== id));
          onShowToast('Materi dihapus.', 'info');
      }
  };

  return (
    <div className="animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
                    ← Kembali ke Dashboard
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Materi Pembelajaran</h2>
                <p className="text-gray-500 dark:text-gray-400">Bagikan modul, tugas, dan referensi belajar untuk siswa.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Form */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Formulir Upload</h3>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Materi</label>
                            <input 
                                type="text" 
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="Contoh: Modul Bab 3..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mata Pelajaran</label>
                            <select 
                                value={newSubject}
                                onChange={e => setNewSubject(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                            >
                                <option>Matematika Wajib</option>
                                <option>Matematika Peminatan</option>
                                <option>Bahasa Indonesia</option>
                                <option>Bahasa Inggris</option>
                                <option>Fisika</option>
                                <option>Biologi</option>
                                <option>Sejarah Kebudayaan Islam</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe File</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['PDF', 'DOCX', 'PPT', 'VIDEO'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setNewType(type as any)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg border ${
                                            newType === type 
                                            ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                                            : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Mock File Input UI */}
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                            <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Drag & Drop file di sini atau klik tombol upload di bawah.
                            </p>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30"
                        >
                            <CloudArrowUpIcon className="w-5 h-5" />
                            Upload Materi
                        </button>
                    </form>
                </div>
            </div>

            {/* List of Materials */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 dark:text-white">Daftar Materi Saya ({materials.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
                        {materials.length > 0 ? (
                            materials.map((item) => (
                                <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            item.type === 'PDF' ? 'bg-red-100 text-red-600' :
                                            item.type === 'DOCX' ? 'bg-blue-100 text-blue-600' :
                                            item.type === 'PPT' ? 'bg-orange-100 text-orange-600' :
                                            'bg-purple-100 text-purple-600'
                                        }`}>
                                            <DocumentTextIcon />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{item.title}</h4>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{item.subject}</span>
                                                <span>•</span>
                                                <span>{item.size}</span>
                                                <span>•</span>
                                                <span>{item.uploadDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                        title="Hapus Materi"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                Belum ada materi yang diunggah.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default MaterialUpload;
