import React, { useState } from 'react';
import type { PPDBRegistrant, PPDBFilterOptions, PPDBSortOptions, PPDBTemplate, PPDBRubric, User, UserRole, UserExtraRole } from '../types';

import { STORAGE_KEYS } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { permissionService } from '../services/permissionService';
import { logger } from '../utils/logger';
import Button from './ui/Button';
import AccessDenied from './AccessDenied';

interface PPDBManagementProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const PPDBManagement: React.FC<PPDBManagementProps> = ({ onBack, onShowToast }) => {
  const [registrants, setRegistrants] = useLocalStorage<PPDBRegistrant[]>(STORAGE_KEYS.PPDB_REGISTRANTS, []);
  
  // Get current user for permission checking
  const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem('malnu_user');
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

  const updateStatus = (id: string, newStatus: PPDBRegistrant['status'], templateId?: string) => {
    const updated = registrants.map(r => {
      if (r.id === id) {
        const template = templates.find(t => t.id === templateId);
        if (template && template.type === (newStatus === 'approved' ? 'approval' : 'rejection')) {
          logger.info('Sending email:', template.subject, template.body.replace('{fullName}', r.fullName));
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Penerimaan Siswa Baru</h2>
                <p className="text-gray-500 dark:text-gray-400">Kelola data calon siswa yang mendaftar online.</p>
            </div>
            {selectedIds.length > 0 && canApprovePPDB && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedIds.length} dipilih</span>
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Terima Semua
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Tolak Semua
                </button>
              </div>
            )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Pendaftar</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{registrants.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Perlu Verifikasi</p>
                <p className="text-xl font-bold text-yellow-600">{registrants.filter(r => r.status === 'pending').length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Diterima</p>
                <p className="text-xl font-bold text-green-600">{registrants.filter(r => r.status === 'approved').length}</p>
            </div>
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Ditolak</p>
                <p className="text-xl font-bold text-red-600">{registrants.filter(r => r.status === 'rejected').length}</p>
            </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value as PPDBFilterOptions['status'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">Semua</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Diterima</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Tanggal</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value as PPDBFilterOptions['dateRange'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">Semua waktu</option>
                <option value="today">Hari ini</option>
                <option value="week">7 hari terakhir</option>
                <option value="month">30 hari terakhir</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Skor</label>
              <select
                value={filters.scoreRange}
                onChange={(e) => setFilters({...filters, scoreRange: e.target.value as PPDBFilterOptions['scoreRange'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">Semua skor</option>
                <option value="high">Tinggi (80-100)</option>
                <option value="medium">Sedang (60-79)</option>
                <option value="low">Rendah (&lt;60)</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Asal Sekolah</label>
              <input
                type="text"
                value={filters.schoolFilter}
                onChange={(e) => setFilters({...filters, schoolFilter: e.target.value})}
                placeholder="Cari sekolah..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Urutkan:</label>
              <select
                value={sort.field}
                onChange={(e) => setSort({...sort, field: e.target.value as PPDBSortOptions['field'] })}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-xs"
              >
                <option value="registrationDate">Tanggal</option>
                <option value="fullName">Nama</option>
                <option value="score">Skor</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSort({...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc'})}
                className="p-1 text-gray-600 hover:text-gray-900 dark:hover:text-white"
              >
                {sort.direction === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.length === filteredRegistrants.length && filteredRegistrants.length > 0}
                                onChange={(e) => setSelectedIds(e.target.checked ? filteredRegistrants.map(r => r.id) : [])}
                                className="rounded border-gray-300 dark:border-gray-600"
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
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredRegistrants.length > 0 ? (
                            filteredRegistrants.map((reg) => (
                                <tr key={reg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
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
                                        className="rounded border-gray-300 dark:border-gray-600"
                                      />
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono">{reg.registrationDate}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{reg.fullName}</div>
                                        <div className="text-xs text-gray-500">NISN: {reg.nisn}</div>
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
                                                <button
                                                  onClick={() => setShowScoringModal(reg.id)}
                                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                  title="Edit skor"
                                                >
                                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                </button>
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
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold capitalize ${
                                            reg.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                            reg.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        }`}>
                                            {reg.status === 'pending' ? 'Verifikasi' : reg.status === 'approved' ? 'Diterima' : 'Ditolak'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {reg.documentUrl && (
                                              <button 
                                                onClick={() => setShowDocumentPreview(reg.id)}
                                                className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                                title="Lihat dokumen"
                                              >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                              </button>
                                            )}
                                            {reg.status === 'pending' && canApprovePPDB && (
                                              <>
                                                <button 
                                                  onClick={() => {
                                                    updateStatus(reg.id, 'approved', 'approval-default');
                                                    generatePDFLetter(reg, 'approval');
                                                  }}
                                                  className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                                  title="Terima"
                                                >
                                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                                </button>
                                                <button 
                                                  onClick={() => {
                                                    updateStatus(reg.id, 'rejected', 'rejection-default');
                                                    generatePDFLetter(reg, 'rejection');
                                                  }}
                                                  className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                                  title="Tolak"
                                                >
                                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                                </button>
                                              </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    Belum ada data pendaftar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Scoring Modal */}
        {showScoringModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Penilaian Calon Siswa</h3>
              <div className="space-y-4">
                {rubric.criteria.map(criterion => {
                  const registrant = registrants.find(r => r.id === showScoringModal);
                  const currentScore = registrant?.rubricScores?.[criterion.id] || 0;
                  
                  return (
                    <div key={criterion.id}>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {criterion.name}
                        </label>
                        <span className="text-xs text-gray-500">{criterion.weight * 100}%</span>
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
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span className="font-semibold">{currentScore}</span>
                        <span>{criterion.maxScore}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{criterion.description}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowScoringModal(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {showDocumentPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preview Dokumen</h3>
                <button
                  onClick={() => setShowDocumentPreview(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Preview dokumen akan ditampilkan di sini</p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default PPDBManagement;