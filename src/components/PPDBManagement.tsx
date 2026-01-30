import React, { useState } from 'react';
import type { PPDBRegistrant, PPDBFilterOptions, PPDBSortOptions, PPDBTemplate, PPDBRubric, User, UserRole, UserExtraRole, DocumentPreview } from '../types';

import { STORAGE_KEYS } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { permissionService } from '../services/permissionService';
import { emailService } from '../services/emailService';
import { pdfExportService } from '../services/pdfExportService';
import { ocrService, type OCRExtractionResult } from '../services/ocrService';
import { logger } from '../utils/logger';
import { ppdbIntegrationService } from '../services/ppdbIntegrationService';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import AccessDenied from './AccessDenied';
import Badge from './ui/Badge';
import SearchInput from './ui/SearchInput';
import { EmptyState } from './ui/LoadingState';
import Card from './ui/Card';
import ProgressBar from './ui/ProgressBar';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CheckIcon, XMarkIcon } from './icons/MaterialIcons';
import { HEIGHTS } from '../config/heights';

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
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<{ status: string; progress: number }>({ status: 'Idle', progress: 0 });

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
    try {
      // Convert legacy status to pipeline status
      const pipelineStatus = convertLegacyStatusToPipelineStatus(newStatus);
      
      // Use PPDB Integration Service for pipeline transitions
      await ppdbIntegrationService.transitionPipelineStatus(id, pipelineStatus);
      
      // Update local state
      const updated = registrants.map(r => {
        if (r.id === id) {
          return { ...r, status: newStatus };
        }
        return r;
      });
      setRegistrants(updated);
      
      // Legacy template handling for 'approved' and 'rejected' (backward compatibility)
      if ((newStatus === 'approved' || newStatus === 'rejected') && templateId) {
        const r = registrants.find(reg => reg.id === id);
        if (!r) return;
        
        const template = templates.find(t => t.id === templateId);
        if (template) {
          const body = template.body
            .replace('{fullName}', r.fullName)
            .replace('{registrationDate}', r.registrationDate);

          // Send email with template
          emailService.sendEmail({
            recipients: [{
              email: r.email,
              name: r.fullName
            }],
            subject: template.subject,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${template.subject}</h2>
              <p>Dear ${r.fullName},</p>
              <div style="white-space: pre-wrap;">${body}</div>
              <p>Terima kasih,</p>
              <p><strong>Panitia PPDB MA Malnu Kananga</strong></p>
            </div>`,
            text: body,
            data: {
              templateId: template.id,
              registrantId: r.id,
              status: newStatus
            }
          }).then(() => {
            logger.info('Email sent successfully to:', r.email);
          }).catch((error) => {
            logger.error('Failed to send email:', error);
          });
        }
      }
      
      onShowToast(`Status pendaftar berhasil diubah menjadi ${newStatus === 'approved' ? 'Diterima' : newStatus === 'rejected' ? 'Ditolak' : newStatus}.`, newStatus === 'approved' ? 'success' : 'info');
    } catch (error) {
      logger.error('Failed to update status:', error);
      onShowToast('Gagal memperbarui status pendaftar', 'error');
    }
  };

  /**
   * Convert legacy status to pipeline status for backward compatibility
   */
  const convertLegacyStatusToPipelineStatus = (status: PPDBRegistrant['status']): 'registered' | 'accepted' | 'rejected' => {
    switch (status) {
      case 'pending':
        return 'registered';
      case 'approved':
        return 'accepted';
      case 'rejected':
        return 'rejected';
      default:
        return status as 'registered' | 'accepted' | 'rejected';
    }
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

  const generatePDFLetter = (registrant: PPDBRegistrant, type: 'approval' | 'rejection') => {
    const template = templates.find(t => t.type === type);
    if (!template) return;

    const body = template.body
      .replace('{fullName}', registrant.fullName)
      .replace('{registrationDate}', registrant.registrationDate);

    pdfExportService.createReport({
      title: template.subject,
      studentName: registrant.fullName,
      studentId: registrant.nisn,
      date: registrant.registrationDate,
      headers: [],
      data: [[body]],
      summary: {
        'NISN': registrant.nisn,
        'Nama Lengkap': registrant.fullName,
        'Asal Sekolah': registrant.originSchool,
        'Tanggal Pendaftaran': registrant.registrationDate,
        'Status': type === 'approval' ? 'Diterima' : 'Ditolak'
      }
    });

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

  const handleRerunOCR = async (registrantId: string) => {
    const registrant = registrants.find(r => r.id === registrantId);
    if (!registrant?.documentUrl) {
      onShowToast('Tidak ada dokumen untuk diproses', 'error');
      return;
    }

    setIsProcessingOCR(true);
    setOcrProgress({ status: 'Memuat dokumen...', progress: 0 });

    try {
      await ocrService.initialize((progress) => {
        setOcrProgress(progress);
      });

      const response = await fetch(registrant.documentUrl);
      const blob = await response.blob();
      const file = new File([blob], 'document.jpg', { type: 'image/jpeg' });

      const result: OCRExtractionResult = await ocrService.extractTextFromImage(file, (progress) => {
        setOcrProgress(progress);
      });

      const updated = registrants.map(r => {
        if (r.id === registrantId) {
          return {
            ...r,
            ocrMetadata: {
              extractedGrades: result.data.grades,
              extractedFullName: result.data.fullName,
              extractedNisn: result.data.nisn,
              extractedSchoolName: result.data.schoolName,
              confidence: result.confidence,
              quality: result.quality,
              processedAt: new Date().toISOString(),
            }
          };
        }
        return r;
      });
      setRegistrants(updated);
      onShowToast('OCR berhasil diproses ulang', 'success');
    } catch (error) {
      logger.error('Rerun OCR error:', error);
      onShowToast('Gagal memproses ulang OCR', 'error');
    } finally {
      setIsProcessingOCR(false);
      setOcrProgress({ status: 'Idle', progress: 0 });
    }
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
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {reg.documentUrl && (
                                              <IconButton
                                                icon={<DocumentTextIcon className="w-5 h-5" />}
                                                ariaLabel="Lihat dokumen untuk pendaftar ini"
                                                tooltip="Lihat dokumen"
                                                variant="default"
                                                size="sm"
                                                onClick={() => setShowDocumentPreview(reg.id)}
                                              />
                                            )}
                                            {reg.ocrMetadata && (
                                              <IconButton
                                                icon={<span className="text-lg">🔍</span>}
                                                ariaLabel="Lihat hasil OCR untuk pendaftar ini"
                                                tooltip="Hasil OCR"
                                                variant="info"
                                                size="sm"
                                                onClick={() => setShowOCRModal(reg.id)}
                                              />
                                            )}
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
                                    <td colSpan={7}>
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

        {/* OCR Results Modal */}
        {showOCRModal && (() => {
          const registrant = registrants.find(r => r.id === showOCRModal);
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card rounded="xl" padding="md" className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Hasil OCR</h3>
                    <p className="text-sm text-neutral-500">{registrant?.fullName} - {registrant?.nisn}</p>
                  </div>
                  <IconButton
                    icon={<XMarkIcon className="w-5 h-5" />}
                    ariaLabel="Tutup hasil OCR"
                    variant="ghost"
                    size="md"
                    onClick={() => setShowOCRModal(null)}
                  />
                </div>

                {isProcessingOCR && (
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Memproses OCR...
                      </span>
                      <span className="text-xs text-blue-700 dark:text-blue-300">{ocrProgress.progress.toFixed(0)}%</span>
                    </div>
                    <ProgressBar
                      value={ocrProgress.progress}
                      size="md"
                      color="info"
                      aria-label={`OCR processing: ${ocrProgress.status}`}
                    />
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">{ocrProgress.status}</p>
                  </Card>
                )}

                {!isProcessingOCR && registrant?.ocrMetadata ? (
                  <div className="space-y-4">
                    <Card className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Kualitas & Keakuratan</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-neutral-500">Confidence</p>
                          <p className="text-lg font-bold text-neutral-900 dark:text-white">
                            {registrant.ocrMetadata.confidence?.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Akurasi Est.</p>
                          <p className="text-lg font-bold text-neutral-900 dark:text-white">
                            {registrant.ocrMetadata.quality?.estimatedAccuracy?.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Jumlah Kata</p>
                          <p className="text-lg font-bold text-neutral-900 dark:text-white">
                            {registrant.ocrMetadata.quality?.wordCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Tipe Dokumen</p>
                          <Badge
                            variant={registrant.ocrMetadata.quality?.documentType === 'academic' ? 'success' : 'info'}
                            size="sm"
                          >
                            {registrant.ocrMetadata.quality?.documentType || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {registrant.ocrMetadata.quality?.isHighQuality && (
                          <Badge variant="success" size="sm">High Quality</Badge>
                        )}
                        {registrant.ocrMetadata.quality?.isSearchable && (
                          <Badge variant="success" size="sm">Searchable</Badge>
                        )}
                        {registrant.ocrMetadata.quality?.hasMeaningfulContent && (
                          <Badge variant="success" size="sm">Valid Content</Badge>
                        )}
                      </div>
                    </Card>

                    {registrant.ocrMetadata.extractedGrades && Object.keys(registrant.ocrMetadata.extractedGrades).length > 0 && (
                      <Card className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Nilai yang Diekstrak</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(registrant.ocrMetadata.extractedGrades).map(([subject, grade]) => (
                            <div key={subject} className="flex justify-between text-sm bg-white dark:bg-neutral-800 rounded px-2 py-1">
                              <span className="text-neutral-700 dark:text-neutral-300">{subject}</span>
                              <span className="font-bold text-green-600 dark:text-green-400">{grade}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    <Card className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Data yang Diekstrak</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Nama Lengkap:</span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {registrant.ocrMetadata.extractedFullName || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">NISN:</span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {registrant.ocrMetadata.extractedNisn || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Asal Sekolah:</span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {registrant.ocrMetadata.extractedSchoolName || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Diproses Pada:</span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {registrant.ocrMetadata.processedAt
                              ? new Date(registrant.ocrMetadata.processedAt).toLocaleString('id-ID')
                              : '-'}
                          </span>
                        </div>
                      </div>
                    </Card>

                    <div className="flex justify-end gap-2">
                      {registrant?.documentUrl && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRerunOCR(registrant.id)}
                          disabled={isProcessingOCR}
                        >
                          {isProcessingOCR ? 'Memproses...' : 'Proses Ulang OCR'}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOCRModal(null)}
                      >
                        Tutup
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                    <p className="text-center text-sm text-yellow-900 dark:text-yellow-100">
                      Belum ada data OCR untuk pendaftar ini.
                    </p>
                    {registrant?.documentUrl && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRerunOCR(registrant.id)}
                          disabled={isProcessingOCR}
                        >
                          {isProcessingOCR ? 'Memproses...' : 'Jalankan OCR Sekarang'}
                        </Button>
                      </div>
                    )}
                  </Card>
                )}
              </Card>
            </div>
          );
        })()}

        {/* Document Preview Modal */}
        {showDocumentPreview && (() => {
          const registrant = registrants.find(r => r.id === showDocumentPreview);
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card rounded="xl" padding="md" className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Preview Dokumen</h3>
                    <p className="text-sm text-neutral-500">{registrant?.fullName} - {registrant?.nisn}</p>
                  </div>
                  <IconButton
                    icon={<XMarkIcon className="w-5 h-5" />}
                    ariaLabel="Tutup preview dokumen"
                    variant="ghost"
                    size="md"
                    onClick={() => setShowDocumentPreview(null)}
                  />
                </div>
                <div className="space-y-4">
                  {/* Document URL preview */}
                  {registrant?.documentUrl && (
                    <Card className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Dokumen</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(registrant.documentUrl, '_blank')}
                        >
                          Buka di Tab Baru
                        </Button>
                      </div>
                      <div className={`${HEIGHTS.CONTENT.TABLE} overflow-hidden bg-white dark:bg-neutral-800 rounded-lg`}>
                        {registrant.documentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img
                            src={registrant.documentUrl}
                            alt="Document preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const errorMsg = e.currentTarget.nextElementSibling as HTMLElement;
                              if (errorMsg) errorMsg.style.display = 'block';
                            }}
                          />
                        ) : null}
                        {registrant.documentUrl.match(/\.(pdf)$/i) ? (
                          <object
                            data={registrant.documentUrl}
                            type="application/pdf"
                            className="w-full h-full"
                          >
                            <div className="flex items-center justify-center h-full p-4 text-center">
                              <p className="text-neutral-500">Tidak dapat mempratinjau PDF. Silakan buka di tab baru.</p>
                            </div>
                          </object>
                        ) : null}
                        {!registrant.documentUrl.match(/\.(jpg|jpeg|png|gif|pdf)$/i) ? (
                          <div className="hidden flex items-center justify-center h-full p-4 text-center">
                            <p className="text-neutral-500">Format dokumen tidak didukung untuk preview. Silakan unduh file.</p>
                          </div>
                        ) : null}
                        <div className="hidden text-center text-red-500 mt-2">
                          Gagal memuat dokumen. Silakan buka di tab baru.
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Document Previews */}
                  {registrant?.documentPreviews && registrant.documentPreviews.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {registrant.documentPreviews.map((doc: DocumentPreview) => (
                        <Card key={doc.id} className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">{doc.name}</span>
                            <span className="text-xs text-neutral-500">{(doc.size / 1024).toFixed(1)} KB</span>
                          </div>
                          <div className="h-64 overflow-hidden bg-white dark:bg-neutral-800 rounded-lg">
                            {doc.type === 'image' ? (
                              <img
                                src={doc.url}
                                alt={doc.name}
                                className="w-full h-full object-contain"
                              />
                            ) : doc.type === 'pdf' ? (
                              <object
                                data={doc.url}
                                type="application/pdf"
                                className="w-full h-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <DocumentTextIcon className="w-12 h-12 text-neutral-400" />
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {!registrant?.documentUrl && (!registrant?.documentPreviews || registrant.documentPreviews.length === 0) && (
                    <Card className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-8 text-center">
                      <DocumentTextIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                      <p className="text-neutral-500 dark:text-neutral-400">Tidak ada dokumen yang diunggah</p>
                    </Card>
                  )}
                </div>
              </Card>
            </div>
          );
        })()}
    </div>
  );
};

export default PPDBManagement;