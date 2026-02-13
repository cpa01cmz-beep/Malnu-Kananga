import React, { useState, useEffect, useCallback } from 'react';
import { communicationLogService } from '../services/communicationLogService';
import type { CommunicationLogEntry, CommunicationLogFilter, CommunicationLogStats } from '../types';
import { logger } from '../utils/logger';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import { EmptyState } from './ui/LoadingState';
import ConfirmationDialog from './ui/ConfirmationDialog';

interface CommunicationDashboardProps {
  _currentUser?: { id: string; name: string; role: string };
}

export function CommunicationDashboard({ _currentUser }: CommunicationDashboardProps) {
  const [logs, setLogs] = useState<CommunicationLogEntry[]>([]);
  const [stats, setStats] = useState<CommunicationLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CommunicationLogFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | null>(null);
  const [exporting, setExporting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    entryId: string | null;
  }>({ isOpen: false, entryId: null });

  const loadLogs = useCallback(() => {
    try {
      setLoading(true);
      const logsData = communicationLogService.getCommunicationHistory(filter);
      setLogs(logsData);
      
      const statsData = communicationLogService.getStatistics(filter);
      setStats(statsData);
    } catch (error) {
      logger.error('Failed to load communication logs:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadLogs();
  }, [filter, loadLogs]);

  const handleFilterChange = (key: keyof CommunicationLogFilter, value: unknown) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const _handleExport = async () => {
    if (!exportFormat) return;

    try {
      setExporting(true);
      await communicationLogService[`exportTo${exportFormat === 'pdf' ? 'PDF' : 'CSV'}`]({
        format: exportFormat,
        filters: filter,
      });
    } catch (error) {
      logger.error('Failed to export communication logs:', error);
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  const handleDelete = async (entryId: string) => {
    setConfirmDialog({ isOpen: true, entryId });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.entryId) return;

    try {
      const deleted = communicationLogService.deleteLogEntry(confirmDialog.entryId);
      if (deleted) {
        loadLogs();
      }
    } catch (error) {
      logger.error('Failed to delete log entry:', error);
    } finally {
      setConfirmDialog({ isOpen: false, entryId: null });
    }
  };

  const formatLogType = (type: string) => {
    const typeMap: Record<string, string> = {
      message: 'Pesan',
      meeting: 'Pertemuan',
      call: 'Telepon',
      note: 'Catatan',
    };
    return typeMap[type] || type;
  };

  const formatLogStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      logged: 'Tercatat',
      synced: 'Disinkronkan',
      archived: 'Diarsipkan',
    };
    return statusMap[status] || status;
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-sm border border-neutral-100 dark:border-neutral-700">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-6"></div>
          <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-sm border border-neutral-100 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-xl font-bold text-neutral-900 dark:text-white">
            Log Komunikasi
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              size="sm"
              aria-pressed={showFilters}
            >
              {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={() => _handleExport()}
                variant="outline"
                size="sm"
                disabled={exporting || exportFormat !== 'pdf'}
                aria-label="Ekspor komunikasi ke file PDF"
              >
                {exporting && exportFormat === 'pdf' ? 'Mengekspor...' : 'Ekspor PDF'}
              </Button>
              <Button
                onClick={() => _handleExport()}
                variant="outline"
                size="sm"
                disabled={exporting || exportFormat !== 'csv'}
                aria-label="Ekspor komunikasi ke file CSV"
              >
                {exporting && exportFormat === 'csv' ? 'Mengekspor...' : 'Ekspor CSV'}
              </Button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Jenis
                </label>
                <Select
                  value={filter.type?.[0] || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value ? [e.target.value as 'message' | 'meeting' | 'call' | 'note'] : undefined)}
                >
                  <option value="">Semua Jenis</option>
                  <option value="message">Pesan</option>
                  <option value="meeting">Pertemuan</option>
                  <option value="call">Telepon</option>
                  <option value="note">Catatan</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Status
                </label>
                <Select
                  value={filter.status?.[0] || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value ? [e.target.value as 'logged' | 'synced' | 'archived'] : undefined)}
                >
                  <option value="">Semua Status</option>
                  <option value="logged">Tercatat</option>
                  <option value="synced">Disinkronkan</option>
                  <option value="archived">Diarsipkan</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Kata Kunci
                </label>
                <Input
                  type="text"
                  placeholder="Cari kata kunci..."
                  value={filter.keyword || ''}
                  onChange={(e) => handleFilterChange('keyword', e.target.value || undefined)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setFilter({})}
                variant="ghost"
                size="sm"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        )}

        {stats && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalMessages}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Total Pesan</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalMeetings}</p>
              <p className="text-sm text-green-700 dark:text-green-300">Total Pertemuan</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalCalls}</p>
              <p className="text-sm text-purple-700 dark:text-purple-300">Total Telepon</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalNotes}</p>
              <p className="text-sm text-orange-700 dark:text-orange-300">Total Catatan</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <EmptyState
              message="Belum ada catatan komunikasi"
              size="md"
              variant="illustrated"
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left p-3 font-semibold text-neutral-700 dark:text-neutral-300">Jenis</th>
                  <th className="text-left p-3 font-semibold text-neutral-700 dark:text-neutral-300">Tanggal</th>
                  <th className="text-left p-3 font-semibold text-neutral-700 dark:text-neutral-300">Orang Tua</th>
                  <th className="text-left p-3 font-semibold text-neutral-700 dark:text-neutral-300">Guru</th>
                  <th className="text-left p-3 font-semibold text-neutral-700 dark:text-neutral-300">Siswa</th>
                  <th className="text-left p-3 font-semibold text-neutral-700 dark:text-neutral-300">Subjek/Isi</th>
                  <th className="text-left p-3 font-semibold text-neutral-700 dark:text-neutral-300">Status</th>
                  <th className="text-left p-3 font-semibold text-neutral-700 dark:text-neutral-300">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {formatLogType(log.type)}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-600 dark:text-neutral-400">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="p-3 text-neutral-900 dark:text-white">
                      {log.parentName || '-'}
                    </td>
                    <td className="p-3 text-neutral-900 dark:text-white">
                      {log.teacherName || '-'}
                    </td>
                    <td className="p-3 text-neutral-900 dark:text-white">
                      {log.studentName || '-'}
                    </td>
                    <td className="p-3 text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                      {log.subject || log.message || log.meetingAgenda || log.meetingNotes || '-'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        {formatLogStatus(log.status)}
                      </span>
                    </td>
                    <td className="p-3">
                      <Button
                        onClick={() => handleDelete(log.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title="Hapus Catatan Komunikasi"
        message="Apakah Anda yakin ingin menghapus catatan komunikasi ini? Tindakan ini tidak dapat dibatalkan."
        type="danger"
        confirmText="Hapus"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, entryId: null })}
      />
    </div>
  );
}

export default CommunicationDashboard;
