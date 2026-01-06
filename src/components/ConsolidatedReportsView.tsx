import React, { useState, useEffect } from 'react';

import DocumentTextIcon from './icons/DocumentTextIcon';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import UsersIcon from './icons/UsersIcon';
import { ToastType } from './Toast';
import type { ParentChild } from '../types';
import { parentsAPI } from '../services/apiService';
import { logger } from '../utils/logger';

interface ParentReportsViewProps {
  onShowToast: (msg: string, type: ToastType) => void;
  children: ParentChild[];
}

interface ChildConsolidatedData {
  child: ParentChild;
  averageGrade: number;
  attendanceRate: number;
  totalAbsences: number;
  latestGrades: Array<{ subject: string; grade: number; date: string }>;
  recentActivity: string;
}

const ConsolidatedReportsView: React.FC<ParentReportsViewProps> = ({ onShowToast, children }) => {
  const [loading, setLoading] = useState(true);
  const [consolidatedData, setConsolidatedData] = useState<ChildConsolidatedData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'semester' | 'year'>('current');

  useEffect(() => {
    const fetchConsolidatedData = async () => {
      if (children.length === 0) return;
      
      setLoading(true);
      try {
        const dataPromises = children.map(async (child) => {
          const [gradesResponse, attendanceResponse] = await Promise.all([
            parentsAPI.getChildGrades(child.studentId),
            parentsAPI.getChildAttendance(child.studentId)
          ]);

          const grades = gradesResponse.success ? gradesResponse.data || [] : [];
          const attendance = attendanceResponse.success ? attendanceResponse.data || [] : [];

          const averageGrade = grades.length > 0 
            ? grades.reduce((sum: number, g: { grade: number }) => sum + g.grade, 0) / grades.length 
            : 0;

          const attendanceRate = attendance.length > 0 
            ? ((attendance.filter((a: { status: string }) => a.status === 'hadir').length / attendance.length) * 100)
            : 0;

          return {
            child,
            averageGrade: Math.round(averageGrade * 100) / 100,
            attendanceRate: Math.round(attendanceRate * 100) / 100,
            totalAbsences: attendance.filter((a: any) => a.status !== 'hadir').length,
            latestGrades: grades.slice(-3).map((g: { subject: string; grade: number; date: string }) => ({
              subject: g.subject,
              grade: g.grade,
              date: g.date
            })),
            recentActivity: grades.length > 0 ? `Nilai terakhir: ${grades[grades.length - 1].subject}` : 'Tidak ada aktivitas terkini'
          };
        });

        const results = await Promise.all(dataPromises);
        setConsolidatedData(results);
      } catch (error) {
        logger.error('Failed to fetch consolidated data:', error);
        onShowToast('Gagal memuat data konsolidasi', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchConsolidatedData();
  }, [children, onShowToast]);

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return 'text-green-600 dark:text-green-400';
    if (grade >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (grade >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600 dark:text-green-400';
    if (rate >= 90) return 'text-yellow-600 dark:text-yellow-400';
    if (rate >= 85) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const exportReport = () => {
    onShowToast('Mengunduh laporan konsolidasi...', 'info');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan Konsolidasi Semua Anak</h2>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'current' | 'semester' | 'year')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="current">Periode Saat Ini</option>
              <option value="semester">Semester Ini</option>
              <option value="year">Tahun Ajaran</option>
            </select>
            <button
              onClick={exportReport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <DocumentTextIcon />
              Unduh Laporan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {consolidatedData.map((data) => (
            <div key={data.child.studentId} className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {data.child.studentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{data.child.studentName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{data.child.className}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rata-rata Nilai</span>
                  <span className={`font-bold ${getGradeColor(data.averageGrade)}`}>
                    {data.averageGrade.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Kehadiran</span>
                  <span className={`font-bold ${getAttendanceColor(data.attendanceRate)}`}>
                    {data.attendanceRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ketidakhadiran</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {data.totalAbsences} hari
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Nilai Terkini</p>
                  <div className="space-y-1">
                    {data.latestGrades.slice(0, 3).map((grade, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{grade.subject}</span>
                        <span className={getGradeColor(grade.grade)}>{grade.grade}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{data.recentActivity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Ringkasan Keseluruhan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ClipboardDocumentCheckIcon />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rata-rata Nilai Keluarga</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {consolidatedData.length > 0 
                ? (consolidatedData.reduce((sum, d) => sum + d.averageGrade, 0) / consolidatedData.length).toFixed(1)
                : '0'
              }
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <UsersIcon />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rata-rata Kehadiran</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {consolidatedData.length > 0 
                ? Math.round(consolidatedData.reduce((sum, d) => sum + d.attendanceRate, 0) / consolidatedData.length)
                : '0'
              }%
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <UsersIcon />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Ketidakhadiran</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {consolidatedData.reduce((sum, d) => sum + d.totalAbsences, 0)} hari
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedReportsView;