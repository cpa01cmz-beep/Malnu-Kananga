import { useState, useEffect, useCallback } from 'react';
import DataTable from './DataTable';
import type { Column } from './DataTable';
import SearchInput from './SearchInput';
import Select from './Select';
import Button from './Button';
import Card from './Card';
import { auditService } from '../../services/auditService';
import type { AuditLogEntry, AuditLogFilter, AuditLogExportOptions } from '../../services/api';
import { logger } from '../../utils/logger';

const DEBOUNCE_DELAY = 500;

const ACTION_OPTIONS = [
  { value: '', label: 'Semua Aksi' },
  { value: 'create', label: 'Buat' },
  { value: 'read', label: 'Baca' },
  { value: 'update', label: 'Ubah' },
  { value: 'delete', label: 'Hapus' },
  { value: 'export', label: 'Ekspor' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
];

const RESOURCE_OPTIONS = [
  { value: '', label: 'Semua Sumber' },
  { value: 'grade', label: 'Nilai' },
  { value: 'user', label: 'Pengguna' },
  { value: 'settings', label: 'Pengaturan' },
  { value: 'attendance', label: 'Absensi' },
  { value: 'assignment', label: 'Tugas' },
  { value: 'class', label: 'Kelas' },
  { value: 'subject', label: 'Mata Pelajaran' },
  { value: 'other', label: 'Lainnya' },
];

interface AuditLogViewerProps {
  onClose?: () => void;
}

export default function AuditLogViewer({ onClose }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AuditLogFilter>({
    page: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await auditService.logRead(filter);
      setLogs(result);
    } catch (err) {
      setError('Gagal memuat log audit');
      logger.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const savedFilters = auditService.getSavedFilters();
    if (savedFilters) {
      setFilter(prev => ({ ...prev, ...savedFilters }));
    }
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter(prev => ({ ...prev, searchQuery: searchQuery || undefined, page: 1 }));
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, filter.action, filter.resource, filter.page]);

  const handleFilterChange = (key: keyof AuditLogFilter, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
    auditService.saveFilters({ ...filter, [key]: value || undefined });
  };

  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true);
    try {
      const options: AuditLogExportOptions = { format };
      const result = await auditService.logExport(options, filter);
      if (result) {
        const blob = new Blob([result], { type: format === 'json' ? 'application/json' : 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      logger.error('Audit log export failed', err);
    } finally {
      setExporting(false);
    }
  };

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      title: 'Waktu',
      sortable: true,
      width: '180px',
      render: (value) => {
        const date = new Date(value as string);
        return date.toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      key: 'userName',
      title: 'Pengguna',
      width: '150px',
    },
    {
      key: 'userRole',
      title: 'Peran',
      width: '100px',
      render: (value) => (
        <span className="capitalize">{value as string}</span>
      ),
    },
    {
      key: 'action',
      title: 'Aksi',
      width: '100px',
      render: (value) => {
        const colors: Record<string, string> = {
          create: 'bg-green-100 text-green-800',
          read: 'bg-blue-100 text-blue-800',
          update: 'bg-yellow-100 text-yellow-800',
          delete: 'bg-red-100 text-red-800',
          export: 'bg-purple-100 text-purple-800',
          login: 'bg-cyan-100 text-cyan-800',
          logout: 'bg-gray-100 text-gray-800',
        };
        const labels: Record<string, string> = {
          create: 'Buat',
          read: 'Baca',
          update: 'Ubah',
          delete: 'Hapus',
          export: 'Ekspor',
          login: 'Login',
          logout: 'Logout',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value as string] || 'bg-gray-100 text-gray-800'}`}>
            {String(labels[value as string] || value)}
          </span>
        );
      },
    },
    {
      key: 'resource',
      title: 'Sumber',
      width: '120px',
    },
    {
      key: 'description',
      title: 'Deskripsi',
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari log audit..."
            aria-label="Cari log audit"
          />
        </div>
        <div className="w-40">
          <Select
            value={filter.action || ''}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            options={ACTION_OPTIONS}
            aria-label="Filter berdasarkan aksi"
          />
        </div>
        <div className="w-40">
          <Select
            value={filter.resource || ''}
            onChange={(e) => handleFilterChange('resource', e.target.value)}
            options={RESOURCE_OPTIONS}
            aria-label="Filter berdasarkan sumber"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            Ekspor CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
            disabled={exporting}
          >
            Ekspor JSON
          </Button>
        </div>
      </div>

      <DataTable
        data={logs as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        loading={loading}
        error={error}
        empty={logs.length === 0}
        emptyMessage="Tidak ada log audit"
        pagination={{
          currentPage: filter.page || 1,
          totalPages: Math.ceil(logs.length / (filter.limit || 20)),
          totalItems: logs.length,
          itemsPerPage: filter.limit || 20,
          onPageChange: (page) => setFilter(prev => ({ ...prev, page })),
        }}
        onRowClick={() => undefined}
      />

      {onClose && (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      )}
    </Card>
  );
}
