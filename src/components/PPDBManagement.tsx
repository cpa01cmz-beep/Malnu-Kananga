import React, { useState, useCallback } from 'react';
import type { PPDBRegistrant, PPDBFilterOptions, PPDBSortOptions, PPDBTemplate, PPDBRubric, User, UserRole, UserExtraRole, OCRExtractionResult, OCRProgress } from '../types';

import { STORAGE_KEYS } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { permissionService } from '../services/permissionService';
import { unifiedNotificationManager } from '../services/unifiedNotificationManager';
import { ocrService } from '../services/ocrService';
import { logger } from '../utils/logger';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import AccessDenied from './AccessDenied';
import Badge from './ui/Badge';
import SearchInput from './ui/SearchInput';
import { EmptyState } from './ui/LoadingState';
import Card from './ui/Card';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CheckIcon, XMarkIcon } from './icons/MaterialIcons';
import { HEIGHTS } from '../config/heights';
import Modal from './ui/Modal';
import ProgressBar from './ui/ProgressBar';
import { SparklesIcon } from './icons/SparklesIcon';

interface PPDBManagementProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const PPDBManagement: React.FC<PPDBManagementProps> = ({ onBack, onShowToast }) => {
  const [registrants, setRegistrants] = useLocalStorage<PPDBRegistrant[]>(STORAGE_KEYS.PPDB_REGISTRANTS, []);

  const [filters, setFilters] = useState<PPDBFilterOptions>({
    status: 'all',
    dateRange: 'all',
    scoreRange: 'all',
    schoolFilter: ''
  });

  const [sort, setSort] = useState<PPDBSortOptions>({
    field: 'registrationDate',
    direction: 'desc'
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDocumentPreview, setShowDocumentPreview] = useState<string | null>(null);
  const [showScoringModal, setShowScoringModal] = useState<string | null>(null);
  const [showOCRModal, setShowOCRModal] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<OCRProgress>({ status: 'Idle', progress: 0 });
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRExtractionResult | null>(null);
  const [showApplyOCRData, setShowApplyOCRData] = useState(false);

  // Default templates for bulk actions
  const [templates] = useState<PPDBTemplate[]>([
    {
      id: 'approval-default',
      name: 'Persetujuan Standar',
      type: 'approval',
      subject: 'Selamat! Diterima di SMA Negeri 1 Malang',
      body: 'Dear {fullName},\n\nKami dengan senang hati menginformasikan bahwa Anda telah diterima di SMA Negeri 1 Malang untuk tahun ajaran 2025/2026.\n\nSilakan melakukan daftar ulang pada {registrationDate}.\n\nHormat kami,\nPanitia PPDB',
      variables: ['fullName', 'registrationDate']
    },
    {
      id: 'rejection-default',
      name: 'Penolakan Standar',
      type: 'rejection',
      subject: 'Hasil Seleksi PPDB SMA Negeri 1 Malang',
      body: 'Dear {fullName},\n\nTerima kasih telah mendaftar di SMA Negeri 1 Malang. Setelah melalui proses seleksi, mohon maaf kami belum dapat menerima Anda pada tahun ajaran ini.\n\nJangan menyerah dan tetap semangat!\n\nHormat kami,\nPanitia PPDB',
      variables: ['fullName']
    }
  ]);

  // Default rubric for scoring
  const [rubric] = useState<PPDBRubric>({
    id: 'ppdb-rubric',
    name: 'Rubrik Seleksi PPDB',
    criteria: [
      { id: 'academic', name: 'Prestasi Akademik', weight: 0.4, maxScore: 100, description: 'Nilai rapor dan prestasi akademik' },
      { id: 'behavior', name: 'Sikap & Perilaku', weight: 0.3, maxScore: 100, description: 'Penilaian perilaku dan sikap' },
      { id: 'interview', name: 'Wawancara', weight: 0.3, maxScore: 100, description: 'Hasil wawancara dengan calon siswa' }
    ]
  });

  // Get current user for permission checking
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  };

  const authUser = getCurrentUser();
  const userRole = authUser?.role as UserRole || 'student';
  const userExtraRole = authUser?.extraRole as UserExtraRole;

  // Check permissions
  const canManagePPDB = permissionService.hasPermission(userRole, userExtraRole, 'ppdb.manage').granted;
  const canApprovePPDB = permissionService.hasPermission(userRole, userExtraRole, 'ppdb.approve').granted;

  // If user cannot manage PPDB, show access denied
  if (!canManagePPDB) {
    return <AccessDenied onBack={onBack} message="You don't have permission to manage PPDB registrations" requiredPermission="ppdb.manage" />;
  }

  const updateStatus = async (id: string, newStatus: PPDBRegistrant['status'], templateId?: string) => {
    const updated = registrants.map(r => {
      if (r.id === id) {
        const template = templates.find(t => t.id === templateId);
        if (template && template.type === (newStatus === 'approved' ? 'approval' : 'rejection')) {
          logger.info('Sending email:', template.subject, template.body.replace('{fullName}', r.fullName));
          
          // Send push notification to applicant
          unifiedNotificationManager.showNotification({
            id: `ppdb-status-${id}-${Date.now()}`,
            type: 'ppdb',
            title: newStatus === 'approved' ? 'Selamat! Anda Diterima' : 'Hasil Seleksi PPDB',
            body: newStatus === 'approved' 
              ? `Selamat ${r.fullName}, Anda telah diterima di MA Malnu Kananga!`
              : `Terima kasih ${r.fullName} telah mendaftar. Mohon maaf, Anda belum dapat diterima pada tahun ajaran ini.`,
            icon: newStatus === 'approved' ? '✅' : '❌',
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'high',
            targetUsers: [r.userId || r.nisn], // Use userId or fallback to NISN
            data: {
              action: 'view_ppdb_status',
              registrantId: r.id,
              status: newStatus
            }
          });
        }
        return { ...r, status: newStatus };
      }
      return r;
    });
    setRegistrants(updated);
    onShowToast(`Status pendaftar berhasil diubah menjadi ${newStatus === 'approved' ? 'Diterima' : 'Ditolak'}.`, newStatus === 'approved' ? 'success' : 'info');
  };

  const updateScore = (id: string, rubricScores: Record<string, number>) => {
    // Calculate weighted score
    let totalScore = 0;
    Object.entries(rubricScores).forEach(([criterionId, score]) => {
      const criterion = rubric.criteria.find(c => c.id === criterionId);
      if (criterion) {
        totalScore += score * criterion.weight;
      }
    });

    const updated = registrants.map(r =>
      r.id === id ? { ...r, score: Math.round(totalScore), rubricScores } : r
    );
    setRegistrants(updated);
    onShowToast('Skor berhasil diperbarui', 'success');
    setShowScoringModal(null);
  };

  const processDocumentOCR = async (registrant: PPDBRegistrant) => {
    if (!registrant.documentUrl) {
      onShowToast('Tidak ada dokumen untuk diproses', 'error');
      return;
    }

    setIsProcessingOCR(true);
    setOcrProgress({ status: 'Initializing', progress: 0 });
    setShowOCRModal(registrant.id);

    try {
      await ocrService.initialize((progress) => {
        setOcrProgress(progress);
      });

      const fileUrl = registrant.documentUrl.startsWith('http')
        ? registrant.documentUrl
        : `${import.meta.env.VITE_R2_PUBLIC_URL || ''}/${registrant.documentUrl}`;

      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Failed to fetch document');
      const blob = await response.blob();
      const file = new File([blob], `document-${registrant.id}`, { type: blob.type });

      const result: OCRExtractionResult = await ocrService.extractTextFromImage(file, (progress) => {
        setOcrProgress(progress);
      });

      setOcrResult(result);

      const updated = registrants.map(r =>
        r.id === registrant.id ? {
          ...r,
          ocrResults: result,
          ocrProcessed: true,
          ocrConfidence: result.confidence
        } : r
      );
      setRegistrants(updated);

      if (result.data.grades && Object.keys(result.data.grades).length > 0) {
        setShowApplyOCRData(true);
        onShowToast(`Berhasil mengekstrak ${Object.keys(result.data.grades).length} nilai dan data identitas`, 'success');
      } else {
        onShowToast('Dokumen berhasil diproses tetapi data terbatas', 'info');
      }
    } catch (error) {
      logger.error('OCR processing error:', error);
      onShowToast('Gagal memproses dokumen. Pastikan file berupa gambar dengan kualitas baik.', 'error');
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const applyOCRDataToRegistrant = (registrantId: string) => {
    if (!ocrResult) return;

    const registrant = registrants.find(r => r.id === registrantId);
    if (!registrant) return;

    const updatedData: Partial<PPDBRegistrant> = {
      fullName: ocrResult.data.fullName || registrant.fullName,
      nisn: ocrResult.data.nisn || registrant.nisn,
      originSchool: ocrResult.data.schoolName || registrant.originSchool
    };

    const updated = registrants.map(r =>
      r.id === registrantId ? { ...r, ...updatedData } : r
    );
    setRegistrants(updated);
    setShowApplyOCRData(false);
    setShowOCRModal(null);
    onShowToast('Data dari OCR berhasil diterapkan', 'success');
  };

  const generatePDFLetter = (registrant: PPDBRegistrant, type: 'approval' | 'rejection') => {
    const template = templates.find(t => t.type === type);
    if (!template) return;
    
    const letter = template.body
      .replace('{fullName}', registrant.fullName)
      .replace('{registrationDate}', registrant.registrationDate);

    logger.info('Generating PDF:', template.subject, letter);
    onShowToast(`Surat ${type === 'approval' ? 'penerimaan' : 'penolakan'} berhasil dibuat`, 'success');
  };

  const getFilteredAndSortedRegistrants = () => {
    let filtered = [...registrants];

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(r => {
        const regDate = new Date(r.registrationDate);
        switch (filters.dateRange) {
          case 'today':
            return regDate >= today;
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return regDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return regDate >= monthAgo;
          }
          default:
            return true;
        }
      });
    }

    if (filters.scoreRange !== 'all') {
      filtered = filtered.filter(r => {
        if (r.score === undefined) return false;
        switch (filters.scoreRange) {
          case 'high':
            return r.score >= 80;
          case 'medium':
            return r.score >= 60 && r.score < 80;
          case 'low':
            return r.score < 60;
          default:
            return true;
        }
      });
    }

    if (filters.schoolFilter) {
      filtered = filtered.filter(r => 
        r.originSchool.toLowerCase().includes(filters.schoolFilter.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | undefined = a[sort.field];
      let bValue: string | number | undefined = b[sort.field];
      
      if (sort.field === 'fullName') {
        aValue = (aValue as string).toLowerCase();
        bValue = (bValue as string).toLowerCase();
      } else if (sort.field === 'registrationDate') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (sort.direction === 'asc') {
        return (aValue ?? '') > (bValue ?? '') ? 1 : -1;
      } else {
        return (aValue ?? '') < (bValue ?? '') ? 1 : -1;
      }
    });

    return filtered;
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    const template = templates.find(t => t.type === (action === 'approve' ? 'approval' : 'rejection'));
    if (!template || selectedIds.length === 0) return;

    selectedIds.forEach(id => {
      updateStatus(id, action === 'approve' ? 'approved' : 'rejected', template.id);
      generatePDFLetter(registrants.find(r => r.id === id)!, action === 'approve' ? 'approval' : 'rejection');
    });

    setSelectedIds([]);
  };

  const filteredRegistrants = getFilteredAndSortedRegistrants();

  return (
    <div className="animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
                <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
                    ← Kembali ke Dashboard
                </Button>
                <h2 className="text-2xl sm:text-xl font-bold text-neutral-900 dark:text-white">Penerimaan Siswa Baru</h2>
                <p className="text-neutral-500 dark:text-neutral-400">Kelola data calon siswa yang mendaftar online.</p>
            </div>
             {selectedIds.length > 0 && canApprovePPDB && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">{selectedIds.length} dipilih</span>
                <Button
                  variant="green-solid"
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                >
                  Terima Semua
                </Button>
                <Button
                  variant="red-solid"
                  size="sm"
                  onClick={() => handleBulkAction('reject')}
                >
                  Tolak Semua
                </Button>
              </div>
            )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card padding="sm" rounded="xl" shadow="sm" border="neutral-100">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Pendaftar</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{registrants.length}</p>
            </Card>
            <Card padding="sm" rounded="xl" shadow="sm" border="neutral-100">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Perlu Verifikasi</p>
                <p className="text-xl font-bold text-yellow-600">{registrants.filter(r => r.status === 'pending').length}</p>
            </Card>
            <Card padding="sm" rounded="xl" shadow="sm" border="neutral-100">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Diterima</p>
                <p className="text-xl font-bold text-green-600">{registrants.filter(r => r.status === 'approved').length}</p>
            </Card>
             <Card padding="sm" rounded="xl" shadow="sm" border="neutral-100">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Ditolak</p>
                <p className="text-xl font-bold text-red-600">{registrants.filter(r => r.status === 'rejected').length}</p>
            </Card>
        </div>

        {/* Advanced Filters */}
        <Card rounded="xl" shadow="sm" border="neutral-200" padding="sm" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value as PPDBFilterOptions['status'] })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-sm"
              >
                <option value="all">Semua</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Diterima</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Tanggal</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value as PPDBFilterOptions['dateRange'] })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-sm"
              >
                <option value="all">Semua waktu</option>
                <option value="today">Hari ini</option>
                <option value="week">7 hari terakhir</option>
                <option value="month">30 hari terakhir</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Skor</label>
              <select
                value={filters.scoreRange}
                onChange={(e) => setFilters({...filters, scoreRange: e.target.value as PPDBFilterOptions['scoreRange'] })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-sm"
              >
                <option value="all">Semua skor</option>
                <option value="high">Tinggi (80-100)</option>
                <option value="medium">Sedang (60-79)</option>
                <option value="low">Rendah (&lt;60)</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Asal Sekolah</label>
              <SearchInput
                value={filters.schoolFilter}
                onChange={(e) => setFilters({...filters, schoolFilter: e.target.value})}
                placeholder="Cari sekolah..."
                size="sm"
                fullWidth
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Urutkan:</label>
              <select
                value={sort.field}
                onChange={(e) => setSort({...sort, field: e.target.value as PPDBSortOptions['field'] })}
                className="px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-xs"
              >
                <option value="registrationDate">Tanggal</option>
                <option value="fullName">Nama</option>
                <option value="score">Skor</option>
                <option value="status">Status</option>
              </select>
              <IconButton
                icon={sort.direction === 'asc' ? '↑' : '↓'}
                ariaLabel={`Urutkan berdasarkan ${sort.field} dalam urutan ${sort.direction === 'asc' ? 'naik' : 'turun'}`}
                variant="ghost"
                size="sm"
                onClick={() => setSort({...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc'})}
              />
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card rounded="2xl" shadow="sm" border="neutral-200" padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
                    <thead className="bg-neutral-50 dark:bg-neutral-700 text-xs uppercase font-semibold text-neutral-500 dark:text-neutral-400">
                        <tr>
                            <th className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.length === filteredRegistrants.length && filteredRegistrants.length > 0}
                                onChange={(e) => setSelectedIds(e.target.checked ? filteredRegistrants.map(r => r.id) : [])}
                                className="rounded border-neutral-300 dark:border-neutral-600"
                              />
                            </th>
                            <th className="px-6 py-4">Tanggal</th>
                            <th className="px-6 py-4">Nama Siswa</th>
                            <th className="px-6 py-4">Asal Sekolah</th>
                            <th className="px-6 py-4">Skor</th>
                            <th className="px-6 py-4">Status</th>
                             <th className="px-6 py-4 text-center">Dokumen</th>
                             <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {filteredRegistrants.length > 0 ? (
                            filteredRegistrants.map((reg) => (
                                <tr key={reg.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                                    <td className="px-6 py-4">
                                      <input
                                        type="checkbox"
                                        checked={selectedIds.includes(reg.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedIds([...selectedIds, reg.id]);
                                          } else {
                                            setSelectedIds(selectedIds.filter(id => id !== reg.id));
                                          }
                                        }}
                                        className="rounded border-neutral-300 dark:border-neutral-600"
                                      />
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono">{reg.registrationDate}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-neutral-900 dark:text-white">{reg.fullName}</div>
                                        <div className="text-xs text-neutral-500">NISN: {reg.nisn}</div>
                                    </td>
                                    <td className="px-6 py-4">{reg.originSchool}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {reg.score !== undefined ? (
                                              <>
                                                <span className={`font-semibold ${
                                                  reg.score >= 80 ? 'text-green-600' :
                                                  reg.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                  {reg.score}
                                                 </span>
                                                <IconButton
                                                  onClick={() => setShowScoringModal(reg.id)}
                                                  variant="ghost"
                                                  size="sm"
                                                  ariaLabel="Edit skor"
                                                  tooltip="Edit skor"
                                                  icon={<PencilIcon />}
                                                />
                                              </>
                                            ) : (
                                              <button
                                                onClick={() => setShowScoringModal(reg.id)}
                                                className="text-xs text-blue-600 hover:text-blue-700"
                                              >
                                                Beri Skor
                                              </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={reg.status === 'approved' ? 'success' : reg.status === 'rejected' ? 'error' : 'warning'}
                                            size="md"
                                        >
                                            {reg.status === 'pending' ? 'Verifikasi' : reg.status === 'approved' ? 'Diterima' : 'Ditolak'}
                                        </Badge>
                                    </td>
                                     <td className="px-6 py-4">
                                         <div className="flex items-center justify-end gap-2">
                                             {reg.documentUrl && (
                                               <>
                                                 {reg.ocrProcessed && (
                                                   <Badge variant="info" size="sm">
                                                     OCR ✓
                                                   </Badge>
                                                 )}
                                                 <IconButton
                                                   icon={<DocumentTextIcon className="w-5 h-5" />}
                                                   ariaLabel="Lihat dokumen untuk pendaftar ini"
                                                   tooltip="Lihat dokumen"
                                                   variant="default"
                                                   size="sm"
                                                   onClick={() => setShowDocumentPreview(reg.id)}
                                                 />
                                               </>
                                             )}
                                         </div>
                                     </td>
                                      <td className="px-6 py-4 text-right">
                                         <div className="flex justify-end gap-2">
                                             {reg.status === 'pending' && canApprovePPDB && (
                                               <>
                                                 <IconButton
                                                   icon={<CheckIcon className="w-5 h-5" />}
                                                   ariaLabel="Terima pendaftaran ini"
                                                   tooltip="Terima"
                                                   variant="success"
                                                   size="sm"
                                                   onClick={() => {
                                                     updateStatus(reg.id, 'approved', 'approval-default');
                                                     generatePDFLetter(reg, 'approval');
                                                   }}
                                                 />
                                                 <IconButton
                                                   icon={<XMarkIcon className="w-5 h-5" />}
                                                   ariaLabel="Tolak pendaftaran ini"
                                                   tooltip="Tolak"
                                                   variant="danger"
                                                   size="sm"
                                                   onClick={() => {
                                                     updateStatus(reg.id, 'rejected', 'rejection-default');
                                                     generatePDFLetter(reg, 'rejection');
                                                   }}
                                                 />
                                               </>
                                             )}
                                         </div>
                                     </td>
                                </tr>
                            ))
                             ) : (
                                 <tr>
                                     <td colSpan={8}>
                                         <EmptyState message="Belum ada data pendaftar" size="md" variant="minimal" />
                                     </td>
                                 </tr>
                             )}
                    </tbody>
                </table>
            </div>
        </Card>

        {/* Scoring Modal */}
        {showScoringModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card rounded="xl" padding="md" className="w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Penilaian Calon Siswa</h3>
              <div className="space-y-4">
                {rubric.criteria.map(criterion => {
                  const registrant = registrants.find(r => r.id === showScoringModal);
                  const currentScore = registrant?.rubricScores?.[criterion.id] || 0;
                  
                  return (
                    <div key={criterion.id}>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {criterion.name}
                        </label>
                        <span className="text-xs text-neutral-500">{criterion.weight * 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={criterion.maxScore}
                        value={currentScore}
                        onChange={(e) => {
                          const newScore = parseInt(e.target.value);
                          const currentScores = registrant?.rubricScores || {};
                          updateScore(showScoringModal, {
                            ...currentScores,
                            [criterion.id]: newScore
                          });
                        }}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-neutral-500 mt-1">
                        <span>0</span>
                        <span className="font-semibold">{currentScore}</span>
                        <span>{criterion.maxScore}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{criterion.description}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  onClick={() => setShowScoringModal(null)}
                  variant="secondary"
                >
                  Tutup
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* OCR Processing Modal */}
        {showOCRModal && (() => {
          const registrant = registrants.find(r => r.id === showOCRModal);
          if (!registrant) return null;

          return (
            <Modal
              isOpen={!!showOCRModal}
              onClose={() => {
                if (!isProcessingOCR) setShowOCRModal(null);
              }}
              title="OCR Document Processing"
              size="lg"
              closeOnBackdropClick={!isProcessingOCR}
              closeOnEscape={!isProcessingOCR}
            >
              <div className="space-y-6">
                {isProcessingOCR && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
                      <span>{ocrProgress.status}</span>
                      <span>{ocrProgress.progress.toFixed(0)}%</span>
                    </div>
                    <ProgressBar
                      value={ocrProgress.progress}
                      size="md"
                      color="primary"
                      aria-label={`OCR processing: ${ocrProgress.status}`}
                    />
                  </div>
                )}

                {!isProcessingOCR && ocrResult && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Hasil Ekstraksi OCR</h4>
                      </div>
                      <div className="text-xs space-y-1 text-blue-800 dark:text-blue-200">
                        <p>Akurasi: <span className="font-semibold">{ocrResult.confidence.toFixed(1)}%</span></p>
                        <p>Kata terdeteksi: <span className="font-semibold">{ocrResult.quality.wordCount}</span></p>
                        <p>Jenis dokumen: <span className="font-semibold capitalize">{ocrResult.quality.documentType}</span></p>
                        <p>Kualitas: <span className={`font-semibold ${ocrResult.quality.isHighQuality ? 'text-green-600' : 'text-amber-600'}`}>
                          {ocrResult.quality.isHighQuality ? 'Tinggi' : 'Sedang'}
                        </span></p>
                      </div>
                    </div>

                    {ocrResult.data.grades && Object.keys(ocrResult.data.grades).length > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-yellow-900 dark:text-yellow-100 mb-3">Nilai Terdeteksi</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(ocrResult.data.grades).map(([subject, grade]) => (
                            <div
                              key={subject}
                              className="flex justify-between text-sm bg-white dark:bg-neutral-800 rounded px-2 py-1"
                            >
                              <span className="text-neutral-700 dark:text-neutral-300">{subject}</span>
                              <span className="font-bold text-green-600 dark:text-green-400">{grade}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {showApplyOCRData && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-green-900 dark:text-green-100 mb-2">Data Identitas Tersedia</h4>
                        <div className="text-xs space-y-1 text-green-800 dark:text-green-200">
                          {ocrResult.data.fullName && <p>Nama: <span className="font-semibold">{ocrResult.data.fullName}</span></p>}
                          {ocrResult.data.nisn && <p>NISN: <span className="font-semibold">{ocrResult.data.nisn}</span></p>}
                          {ocrResult.data.schoolName && <p>Sekolah: <span className="font-semibold">{ocrResult.data.schoolName}</span></p>}
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Button
                            onClick={() => applyOCRDataToRegistrant(registrant.id)}
                            variant="green-solid"
                            size="sm"
                          >
                            Terapkan Data
                          </Button>
                          <Button
                            onClick={() => setShowApplyOCRData(false)}
                            variant="ghost"
                            size="sm"
                          >
                            Tidak
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">Teks Penuh</h4>
                      <div className="text-xs text-neutral-600 dark:text-neutral-300 max-h-60 overflow-y-auto whitespace-pre-wrap">
                        {ocrResult.text || 'Tidak ada teks yang diekstrak'}
                      </div>
                    </div>
                  </div>
                )}

                {!isProcessingOCR && !ocrResult && (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">Klik tombol di bawah untuk memproses dokumen</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <Button
                    onClick={() => processDocumentOCR(registrant)}
                    variant="primary"
                    size="md"
                    disabled={isProcessingOCR || registrant.ocrProcessed}
                    isLoading={isProcessingOCR}
                  >
                    {isProcessingOCR ? 'Memproses...' : registrant.ocrProcessed ? 'Sudah Diproses' : 'Proses dengan OCR'}
                  </Button>
                  <Button
                    onClick={() => setShowOCRModal(null)}
                    variant="ghost"
                    size="md"
                    disabled={isProcessingOCR}
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            </Modal>
          );
        })()}

        {/* Document Preview Modal */}
        {showDocumentPreview && (() => {
          const registrant = registrants.find(r => r.id === showDocumentPreview);
          if (!registrant) return null;

          return (
            <Modal
              isOpen={!!showDocumentPreview}
              onClose={() => setShowDocumentPreview(null)}
              title="Preview Dokumen"
              size="lg"
            >
              <div className="space-y-4">
                <Card className={`bg-neutral-100 dark:bg-neutral-700 rounded-lg p-4 ${HEIGHTS.CONTENT.TABLE} flex items-center justify-center`}>
                  <p className="text-neutral-500 dark:text-neutral-400">Preview dokumen akan ditampilkan di sini</p>
                </Card>

                {registrant.ocrProcessed && registrant.ocrResults && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        <span className="text-sm font-bold text-blue-900 dark:text-blue-100">Dokumen telah diproses dengan OCR</span>
                      </div>
                      <Badge
                        variant={registrant.ocrConfidence && registrant.ocrConfidence >= 80 ? 'success' : 'warning'}
                        size="sm"
                      >
                        {registrant.ocrConfidence?.toFixed(0)}% Akurasi
                      </Badge>
                    </div>
                    {registrant.ocrResults.data.grades && Object.keys(registrant.ocrResults.data.grades).length > 0 && (
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        {Object.keys(registrant.ocrResults.data.grades).length} nilai terdeteksi
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setShowDocumentPreview(null);
                      setShowOCRModal(registrant.id);
                    }}
                    variant="primary"
                    size="md"
                  >
                    Proses dengan OCR
                  </Button>
                  <Button
                    onClick={() => setShowDocumentPreview(null)}
                    variant="ghost"
                    size="md"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            </Modal>
          );
        })()}
    </div>
  );
};

export default PPDBManagement;