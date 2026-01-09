import React, { useState, useEffect, useCallback } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { PlusIcon } from './icons/PlusIcon';
import { StarIcon } from './icons/MaterialIcons';
import { DownloadIcon, MagnifyingGlassIcon } from './icons/MaterialIcons';
import { MaterialTemplate, Subject } from '../types';
import { logger } from '../utils/logger';
import Button from './ui/Button';

interface MaterialTemplatesProps {
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onSelectTemplate?: (template: MaterialTemplate) => void;
}

const MaterialTemplatesLibrary: React.FC<MaterialTemplatesProps> = ({
  onShowToast,
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<MaterialTemplate[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'created'>('usage');
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    description: '',
    category: '',
    subjectId: '',
  });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const mockTemplates: MaterialTemplate[] = [
        {
          id: 'template1',
          title: 'Template Soal Pilihan Ganda',
          description: 'Template standar untuk membuat soal pilihan ganda dengan header dan format penilaian',
          fileUrl: '/templates/soal-pg.docx',
          fileType: 'docx',
          fileSize: 45000,
          category: 'Penilaian',
          subjectId: 'general',
          isActive: true,
          usageCount: 45,
          createdBy: 'admin',
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'template2',
          title: 'Template RPP K-13',
          description: 'Rencana Pelaksanaan Pembelajaran Kurikulum 2013 lengkap',
          fileUrl: '/templates/rpp-k13.docx',
          fileType: 'docx',
          fileSize: 75000,
          category: 'Perencanaan',
          isActive: true,
          usageCount: 32,
          createdBy: 'admin',
          createdAt: '2024-01-20T09:30:00Z',
        },
        {
          id: 'template3',
          title: 'Template Laporan Praktikum',
          description: 'Format laporan praktikum IPA dengan tabel observasi dan analisis',
          fileUrl: '/templates/laporan-praktikum.docx',
          fileType: 'docx',
          fileSize: 55000,
          category: 'Laporan',
          subjectId: 'ipa',
          isActive: true,
          usageCount: 28,
          createdBy: 'teacher1',
          createdAt: '2024-02-01T14:15:00Z',
        },
        {
          id: 'template4',
          title: 'Template Bahan Ajar PowerPoint',
          description: 'Slide presentasi dengan desain modern untuk materi pembelajaran',
          fileUrl: '/templates/presentasi.pptx',
          fileType: 'pptx',
          fileSize: 125000,
          category: 'Presentasi',
          subjectId: 'general',
          isActive: true,
          usageCount: 67,
          createdBy: 'admin',
          createdAt: '2024-01-10T08:00:00Z',
        },
        {
          id: 'template5',
          title: 'Template Soal Essay',
          description: 'Format soal essay dengan kriteria penilaian dan rubrik',
          fileUrl: '/templates/soal-essay.docx',
          fileType: 'docx',
          fileSize: 40000,
          category: 'Penilaian',
          subjectId: 'general',
          isActive: true,
          usageCount: 23,
          createdBy: 'teacher2',
          createdAt: '2024-02-05T11:45:00Z',
        },
      ];
      setTemplates(mockTemplates);
    } catch (err) {
      logger.error('Error fetching templates:', err);
      onShowToast('Gagal memuat template', 'error');
    } finally {
      setLoading(false);
    }
  }, [onShowToast]);

  const fetchSubjects = useCallback(async () => {
    try {
      // Mock API call - replace with actual implementation
      const mockSubjects: Subject[] = [
        { id: 'general', name: 'Umum', code: 'GEN', description: 'Template umum untuk semua mata pelajaran', creditHours: 0 },
        { id: 'ipa', name: 'IPA', code: 'IPA', description: 'Ilmu Pengetahuan Alam', creditHours: 4 },
        { id: 'matematika', name: 'Matematika', code: 'MTK', description: 'Matematika', creditHours: 4 },
        { id: 'bahasa', name: 'Bahasa Indonesia', code: 'BHS', description: 'Bahasa Indonesia', creditHours: 3 },
      ];
      setSubjects(mockSubjects);
    } catch (err) {
      logger.error('Error fetching subjects:', err);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchSubjects();
  }, [fetchTemplates, fetchSubjects, onShowToast]);

  const downloadTemplate = async (template: MaterialTemplate) => {
    try {
      // Mock API call - replace with actual implementation
      window.open(`/api/templates/download/${template.id}`, '_blank');
      
      // Update usage count
      setTemplates(templates.map(t => 
        t.id === template.id 
          ? { ...t, usageCount: t.usageCount + 1 }
          : t
      ));
      
      onShowToast(`Template "${template.title}" berhasil diunduh`, 'success');
    } catch (err) {
      logger.error('Error downloading template:', err);
      onShowToast('Gagal mengunduh template', 'error');
    }
  };

  const createTemplate = async () => {
    if (!newTemplate.title.trim() || !newTemplate.description.trim() || !newTemplate.category.trim()) {
      onShowToast('Lengkapi semua field yang diperlukan', 'error');
      return;
    }

    try {
      // Mock API call - replace with actual implementation
      const template: MaterialTemplate = {
        id: `template-${Date.now()}`,
        title: newTemplate.title.trim(),
        description: newTemplate.description.trim(),
        fileUrl: '', // Would be set after file upload
        fileType: 'docx',
        fileSize: 0,
        category: newTemplate.category.trim(),
        subjectId: newTemplate.subjectId || 'general',
        isActive: true,
        usageCount: 0,
        createdBy: 'current-user', // Replace with actual user
        createdAt: new Date().toISOString(),
      };

      setTemplates([...templates, template]);
      setNewTemplate({ title: '', description: '', category: '', subjectId: '' });
      setShowCreateTemplate(false);
      onShowToast('Template berhasil dibuat', 'success');
    } catch (err) {
      logger.error('Error creating template:', err);
      onShowToast('Gagal membuat template', 'error');
    }
  };

  // Filtering and sorting
  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || template.category === selectedCategory;
      const matchesSubject = !selectedSubject || template.subjectId === selectedSubject;
      return matchesSearch && matchesCategory && matchesSubject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const categories = Array.from(new Set(templates.map(t => t.category)));
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-neutral-200 dark:bg-neutral-700 rounded-xl h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="material-templates">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Template Materi</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Gunakan template untuk mempercepat pembuatan materi</p>
        </div>
        <Button
          onClick={() => setShowCreateTemplate(true)}
          variant="blue-solid"
          icon={<PlusIcon className="w-4 h-4" />}
          iconPosition="left"
        >
          Template Baru
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari template..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Semua Mata Pelajaran</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'usage' | 'created')}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="usage">Paling Populer</option>
            <option value="name">Nama (A-Z)</option>
            <option value="created">Terbaru</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-5 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${
                  template.fileType === 'pptx' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20' :
                  'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                }`}>
                  <DocumentTextIcon />
                </div>
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{template.usageCount}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 line-clamp-2">
                {template.title}
              </h3>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
                {template.description}
              </p>

              <div className="flex items-center gap-2 mb-4 text-xs">
                <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded">
                  {template.category}
                </span>
                {template.subjectId !== 'general' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 rounded">
                    {subjects.find(s => s.id === template.subjectId)?.name}
                  </span>
                )}
              </div>

              <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                <div>📁 {formatFileSize(template.fileSize)}</div>
                <div>👤 {template.createdBy}</div>
                <div>📅 {formatDate(template.createdAt)}</div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => downloadTemplate(template)}
                  variant="blue-solid"
                  className="flex-1"
                  size="sm"
                  icon={<DownloadIcon className="w-4 h-4" />}
                  iconPosition="left"
                >
                  Unduh
                </Button>
                {onSelectTemplate && (
                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors text-sm font-medium"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Gunakan
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600">
              <DocumentTextIcon />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">
              {searchTerm || selectedCategory || selectedSubject 
                ? 'Tidak ada template yang cocok dengan filter' 
                : 'Belum ada template tersedia'}
            </p>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <div className="fixed inset-0 bg-black/50% flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Buat Template Baru
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Judul Template
                </label>
                <input
                  type="text"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                  placeholder="Contoh: Template Soal Ulangan"
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Jelaskan kegunaan template ini..."
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                  placeholder="Contoh: Penilaian, Presentasi, Laporan"
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Mata Pelajaran (opsional)
                </label>
                <select
                  value={newTemplate.subjectId}
                  onChange={(e) => setNewTemplate({...newTemplate, subjectId: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Umum (semua mata pelajaran)</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  File Template
                </label>
                <input
                  type="file"
                  accept=".doc,.docx,.ppt,.pptx,.pdf"
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateTemplate(false)}
                className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Batal
              </button>
              <Button
                onClick={createTemplate}
                disabled={!newTemplate.title.trim() || !newTemplate.description.trim() || !newTemplate.category.trim()}
              >
                Buat Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialTemplatesLibrary;