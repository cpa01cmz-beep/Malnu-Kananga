import React, { useState, useEffect, useCallback } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { BellIcon } from './icons/BellIcon';
import { BellSlashIcon } from './icons/BellSlashIcon';
import Card from './ui/Card';
import Badge from './ui/Badge';
import type { ParentChild, Grade, Attendance } from '../types';
import { parentProgressReportService, type ProgressReport, type ProgressReportSettings } from '../services/parentProgressReportService';
import { gradesAPI, attendanceAPI } from '../services/apiService';
import { logger } from '../utils/logger';

interface LearningProgressReportProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  child: ParentChild;
  parentId: string;
}

type ReportView = 'latest' | 'history' | 'settings';

const LearningProgressReport: React.FC<LearningProgressReportProps> = ({ onShowToast, child, parentId }) => {
  const [currentView, setCurrentView] = useState<ReportView>('latest');
  const [report, setReport] = useState<ProgressReport | null>(null);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [settings, setSettings] = useState<ProgressReportSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [gradesRes, attendanceRes] = await Promise.all([
        gradesAPI.getByStudent(child.studentId),
        attendanceAPI.getByStudent(child.studentId)
      ]);

      if (gradesRes.success && gradesRes.data) {
        setGrades(gradesRes.data);
      }
      if (attendanceRes.success && attendanceRes.data) {
        setAttendance(attendanceRes.data);
      }

      const cached = parentProgressReportService.getCachedReport(child.studentId, parentId);
      if (cached) {
        setReport(cached);
      }

      const reportSettings = parentProgressReportService.getSettings(parentId);
      if (reportSettings) {
        setSettings(reportSettings);
      } else {
        const defaults = parentProgressReportService.getDefaultSettings(parentId);
        setSettings(defaults);
        parentProgressReportService.saveSettings(defaults);
      }

      const allReports = parentProgressReportService.getParentReports(parentId);
      setReports(allReports);
    } catch (error) {
      logger.error('Failed to load initial data:', error);
      onShowToast('Gagal memuat data laporan', 'error');
    } finally {
      setLoading(false);
    }
  }, [child.studentId, parentId, onShowToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleGenerateReport = async (forceRefresh: boolean = false) => {
    setGenerating(true);
    try {
      const newReport = await parentProgressReportService.generateProgressReport(
        child.studentId,
        child.studentName,
        parentId,
        grades,
        attendance,
        forceRefresh
      );
      setReport(newReport);
      setReports(parentProgressReportService.getParentReports(parentId));
      onShowToast('Laporan progres berhasil dibuat', 'success');
    } catch (error) {
      logger.error('Failed to generate report:', error);
      onShowToast('Gagal membuat laporan progres', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteReport = (reportId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      const success = parentProgressReportService.deleteReport(reportId, child.studentId);
      if (success) {
        setReports(parentProgressReportService.getParentReports(parentId));
        if (report?.id === reportId) {
          setReport(null);
        }
        onShowToast('Laporan berhasil dihapus', 'success');
      } else {
        onShowToast('Gagal menghapus laporan', 'error');
      }
    }
  };

  const handleSaveSettings = () => {
    if (settings) {
      parentProgressReportService.saveSettings(settings);
      onShowToast('Pengaturan berhasil disimpan', 'success');
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Laporan Progres Belajar</h2>
          <p className="text-gray-600 mt-1">
            {report 
              ? `Terakhir diperbarui: ${new Date(report.generatedAt).toLocaleString('id-ID')}`
              : 'Belum ada laporan'}
          </p>
        </div>
        <button
          onClick={() => handleGenerateReport(true)}
          disabled={generating}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Membuat...</span>
            </>
          ) : (
            <>
              <ArrowPathIcon className="w-4 h-4" />
              <span>Buat Laporan Baru</span>
            </>
          )}
        </button>
      </div>

      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setCurrentView('latest')}
          className={`pb-3 px-4 font-medium ${
            currentView === 'latest'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Laporan Terbaru
        </button>
        <button
          onClick={() => setCurrentView('history')}
          className={`pb-3 px-4 font-medium ${
            currentView === 'history'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Riwayat
        </button>
        <button
          onClick={() => setCurrentView('settings')}
          className={`pb-3 px-4 font-medium ${
            currentView === 'settings'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pengaturan
        </button>
      </div>

      {currentView === 'latest' && (
        <div className="space-y-6">
          {report ? (
            <div className="space-y-6">
              <Card>
                <div className="flex items-start space-x-3">
                  <ChartBarIcon className="w-6 h-6 text-indigo-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Analisis AI</h3>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                      {report.analysis}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-indigo-600" />
                  Ringkasan Nilai
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Rata-rata Nilai</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {report.gradesData.averageScore}
                    </span>
                  </div>
                  <div className="grid gap-4">
                    {report.gradesData.subjects.map((subject, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{subject.subject}</div>
                          <div className="text-sm text-gray-600">
                            Nilai: {subject.score} • {subject.grade}
                          </div>
                        </div>
                        <Badge className={getTrendColor(subject.trend)}>
                          {getTrendIcon(subject.trend)} {subject.trend.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2 text-indigo-600" />
                  Ringkasan Kehadiran
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {report.attendanceData.percentage}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Tingkat Kehadiran</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {report.attendanceData.present}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Hadir</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {report.attendanceData.absent}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Tidak Hadir</div>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-700">
                      {report.attendanceData.totalDays}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Hari</div>
                  </div>
                </div>
              </Card>

              {report.trendsData.length > 0 && (
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-4">Tren Bulanan</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">Bulan</th>
                          <th className="text-right py-2 px-3">Rata-rata Nilai</th>
                          <th className="text-right py-2 px-3">Kehadiran</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.trendsData.map((trend, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2 px-3">{trend.month}</td>
                            <td className="text-right py-2 px-3">{trend.averageScore}</td>
                            <td className="text-right py-2 px-3">{trend.attendanceRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada laporan progres
                </h3>
                <p className="text-gray-600 mb-6">
                  Buat laporan progres untuk melihat analisis AI dari nilai dan kehadiran anak Anda.
                </p>
                <button
                  onClick={() => handleGenerateReport(false)}
                  disabled={generating}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {generating ? 'Memproses...' : 'Buat Laporan Pertama'}
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      {currentView === 'history' && (
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((r) => (
              <Card key={r.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {r.studentName}
                      </h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        {new Date(r.reportDate).toLocaleDateString('id-ID')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Rata-rata: {r.gradesData.averageScore} • 
                      Kehadiran: {r.attendanceData.percentage}%
                    </p>
                    <div className="text-xs text-gray-500">
                      Dibuat: {new Date(r.generatedAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setReport(r);
                      setCurrentView('latest');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Lihat Detail
                  </button>
                  <button
                    onClick={() => handleDeleteReport(r.id)}
                    className="ml-4 text-red-600 hover:text-red-800"
                    title="Hapus laporan"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada riwayat laporan</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {currentView === 'settings' && settings && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pengaturan Laporan</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frekuensi Laporan
              </label>
              <select
                value={settings.frequency}
                onChange={(e) => setSettings({
                  ...settings,
                  frequency: e.target.value as 'weekly' | 'bi-weekly' | 'monthly'
                })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="weekly">Mingguan</option>
                <option value="bi-weekly">Dua Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Notifikasi Laporan</div>
                <div className="text-sm text-gray-600">
                  Terima notifikasi saat laporan baru dibuat
                </div>
              </div>
              <button
                onClick={() => setSettings({
                  ...settings,
                  enableNotifications: !settings.enableNotifications
                })}
                className={`p-2 rounded-lg ${
                  settings.enableNotifications
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {settings.enableNotifications ? (
                  <BellIcon />
                ) : (
                  <BellSlashIcon />
                )}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jam Tenang (Jangan Kirim Notifikasi)
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-600 mb-1 block">Mulai</label>
                  <input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => setSettings({
                      ...settings,
                      quietHoursStart: e.target.value
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600 mb-1 block">Selesai</label>
                  <input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => setSettings({
                      ...settings,
                      quietHoursEnd: e.target.value
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LearningProgressReport;
