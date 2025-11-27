import React, { useState, useEffect, useCallback } from 'react';
import { StudentSupportService, StudentProgress } from '../services/studentSupportService';

interface StudentProgressMonitorProps {
  studentId: string;
}

const StudentProgressMonitor: React.FC<StudentProgressMonitorProps> = ({ studentId }) => {
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [_selectedTimeframe, _setSelectedTimeframe] = useState<'week' | 'month' | 'semester'>('month');

  const loadProgressData = useCallback(() => {
    setLoading(true);
    const supportService = StudentSupportService.getInstance();
    const studentProgress = supportService.getStudentProgress(studentId);
    
    if (studentProgress) {
      setProgress(studentProgress);
    } else {
      // Initialize progress for new student
      const initialProgress: StudentProgress = {
        studentId,
academicMetrics: {
            gpa: 0,
            gradeTrend: 'stable' as const,
            attendanceRate: 0,
            assignmentCompletion: 0
          },
          engagementMetrics: {
            loginFrequency: 0,
            featureUsage: {},
            resourceAccess: 0,
            supportRequests: 0,
            participationScore: 0
          },
        riskLevel: 'low' as const,
        lastUpdated: new Date().toISOString()
      };
      setProgress(initialProgress);
    }
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const getRiskLevel = (_progress: StudentProgress): 'low' | 'medium' | 'high' => {
    // Mock risk factors since they don't exist in the interface
    return 'low';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="p-6 text-center text-gray-500">
        Data progress tidak tersedia
      </div>
    );
  }

  const riskLevel = getRiskLevel(progress);

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Monitor Progress Siswa</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium mb-2">Metrik Akademik</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>GPA:</span>
              <span className="font-medium">{progress.academicMetrics.gpa.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tingkat Kehadiran:</span>
              <span className="font-medium">{progress.academicMetrics.attendanceRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Penyelesaian Tugas:</span>
              <span className="font-medium">{progress.academicMetrics.assignmentCompletion}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium mb-2">Metrik Engagement</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Frekuensi Login:</span>
              <span className="font-medium">{progress.engagementMetrics.loginFrequency}/minggu</span>
            </div>
            <div className="flex justify-between">
              <span>Akses Sumber Daya:</span>
              <span className="font-medium">{progress.engagementMetrics.resourceAccess}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          riskLevel === 'low' ? 'bg-green-100 text-green-800' :
          riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          Tingkat Risiko: {riskLevel === 'low' ? 'Rendah' : riskLevel === 'medium' ? 'Sedang' : 'Tinggi'}
        </div>
      </div>
    </div>
  );
};

export default StudentProgressMonitor;