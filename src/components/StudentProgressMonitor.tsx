import React, { useState, useEffect } from 'react';
import { StudentSupportService, StudentProgress } from '../services/studentSupportService';

interface StudentProgressMonitorProps {
  studentId: string;
}

const StudentProgressMonitor: React.FC<StudentProgressMonitorProps> = ({ studentId }) => {
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [_selectedTimeframe, _setSelectedTimeframe] = useState<'week' | 'month' | 'semester'>('month');

  useEffect(() => {
    loadProgressData();
  }, [studentId]);

  const loadProgressData = () => {
    setLoading(true);
    const studentProgress = StudentSupportService.getStudentProgress(studentId);
    
    if (studentProgress) {
      setProgress(studentProgress);
    } else {
      // Initialize progress for new student
      const initialProgress: StudentProgress = {
        studentId,
        academicMetrics: {
          gpa: 0,
          attendanceRate: 0,
          assignmentCompletion: 0,
          subjectPerformance: {}
        },
        engagementMetrics: {
          portalLoginFrequency: 0,
          featureUsage: {},
          supportRequestsCount: 0,
          lastActiveDate: new Date().toISOString()
        },
        riskFactors: {
          lowGrades: false,
          poorAttendance: false,
          lowEngagement: false,
          frequentSupportRequests: false
        },
        recommendations: [],
        lastUpdated: new Date().toISOString()
      };
      
      StudentSupportService.updateStudentProgress(studentId, initialProgress);
      setProgress(initialProgress);
    }
    
    setLoading(false);
  };

  const getRiskLevel = (_progress: StudentProgress): 'low' | 'medium' | 'high' => {
    // Mock risk factors since they don't exist in the interface
    const mockRiskFactors = {
      lowGrades: false,
      poorAttendance: false,
      lowEngagement: false
    };
    const riskCount = Object.values(mockRiskFactors).filter(Boolean).length;
    if (riskCount === 0) return 'low';
    if (riskCount <= 2) return 'medium';
    return 'high';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementLevel = (frequency: number): 'low' | 'medium' | 'high' => {
    if (frequency >= 5) return 'high';
    if (frequency >= 3) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Data Progress Belum Tersedia
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Data progress akademik akan segera tersedia
          </p>
        </div>
      </div>
    );
  }

  const riskLevel = getRiskLevel(progress);
  const engagementLevel = getEngagementLevel(progress.engagementMetrics.loginFrequency);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📊 Monitoring Progress Siswa
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Pemantauan akademis dan engagement real-time
            </p>
          </div>
          
          <div className={`px-4 py-2 rounded-full font-medium ${getRiskColor(riskLevel)}`}>
            Risiko: {riskLevel.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Academic Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📚 Metrik Akademis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getPerformanceColor(progress.academicMetrics.gpa)}`}>
              {progress.academicMetrics.gpa.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">IPK</p>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold ${getPerformanceColor(progress.academicMetrics.attendanceRate)}`}>
              {progress.academicMetrics.attendanceRate}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Kehadiran</p>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold ${getPerformanceColor(progress.academicMetrics.assignmentCompletion)}`}>
              {progress.academicMetrics.assignmentCompletion}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Penyelesaian Tugas</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {Object.keys(progress.academicMetrics.subjectPerformance).length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Mata Pelajaran</p>
          </div>
        </div>

        {/* Subject Performance */}
        {Object.keys(progress.academicMetrics.subjectPerformance).length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Performa per Mata Pelajaran</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(progress.academicMetrics.subjectPerformance).map(([subject, score]) => (
                <div key={subject} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subject}</span>
                  <span className={`text-sm font-bold ${getPerformanceColor(parseInt(score) || 0)}`}>{score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📱 Engagement Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Aktivitas Portal</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Frekuensi Login (Mingguan)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {progress.engagementMetrics.loginFrequency}x
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Level Engagement</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  engagementLevel === 'high' ? 'bg-green-100 text-green-800' :
                  engagementLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {engagementLevel.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Request Support</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {progress.engagementMetrics.supportRequests}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Terakhir Aktif</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(progress.engagementMetrics.lastActiveDate).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Penggunaan Fitur</h3>
            
            {Object.keys(progress.engagementMetrics.featureUsage).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(progress.engagementMetrics.featureUsage).map(([feature, count]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{feature}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(count * 10, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada data penggunaan fitur</p>
            )}
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">⚠️ Faktor Risiko</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg border-2 ${
            progress.riskFactors.lowGrades 
              ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
              : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{progress.riskFactors.lowGrades ? '🔴' : '✅'}</span>
              <span className="font-medium text-gray-900 dark:text-white">Nilai Rendah</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {progress.riskFactors.lowGrades ? 'IPK < 70' : 'IPK ≥ 70'}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border-2 ${
            progress.riskFactors.poorAttendance 
              ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
              : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{progress.riskFactors.poorAttendance ? '🔴' : '✅'}</span>
              <span className="font-medium text-gray-900 dark:text-white">Kehadiran Buruk</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {progress.riskFactors.poorAttendance ? 'Kehadiran < 80%' : 'Kehadiran ≥ 80%'}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border-2 ${
            progress.riskFactors.lowEngagement 
              ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
              : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{progress.riskFactors.lowEngagement ? '🔴' : '✅'}</span>
              <span className="font-medium text-gray-900 dark:text-white">Engagement Rendah</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {progress.riskFactors.lowEngagement ? 'Login < 3x/minggu' : 'Login ≥ 3x/minggu'}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border-2 ${
            progress.riskFactors.frequentSupportRequests 
              ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
              : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{progress.riskFactors.frequentSupportRequests ? '🔴' : '✅'}</span>
              <span className="font-medium text-gray-900 dark:text-white">Request Sering</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {progress.riskFactors.frequentSupportRequests ? '> 5 request/bulan' : '≤ 5 request/bulan'}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {progress.recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">💡 Rekomendasi</h2>
          
          <div className="space-y-3">
            {progress.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-blue-600 mt-1">💡</span>
                <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📈 Trend Progress</h2>
        
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-600 dark:text-gray-400">Chart progress akan segera tersedia</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Menampilkan trend akademis dan engagement overtime
            </p>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Terakhir diperbarui: {new Date(progress.lastUpdated).toLocaleString('id-ID')}
      </div>
    </div>
  );
};

export default StudentProgressMonitor;