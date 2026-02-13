import React, { useState } from 'react';
import { LineChart } from 'recharts/es6/chart/LineChart';
import { Line } from 'recharts/es6/cartesian/Line';
import { XAxis } from 'recharts/es6/cartesian/XAxis';
import { YAxis } from 'recharts/es6/cartesian/YAxis';
import { CartesianGrid } from 'recharts/es6/cartesian/CartesianGrid';
import { Tooltip } from 'recharts/es6/component/Tooltip';
import { ResponsiveContainer } from 'recharts/es6/component/ResponsiveContainer';
import { useStudentInsights } from '../hooks/useStudentInsights';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Card from './ui/Card';
import Heading from './ui/Heading';
import { CardSkeleton } from './ui/Skeleton';
import ErrorMessage from './ui/ErrorMessage';
import { GRADIENT_CLASSES } from '../config/gradients';
import { CHART_COLORS } from '../config/chartColors';
import { HEIGHT_CLASSES } from '../config/heights';

interface StudentInsightsProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const StudentInsights: React.FC<StudentInsightsProps> = ({ onBack, onShowToast }) => {
  const { insights, loading, error, refreshInsights, enabled, setEnabled, isGenerating } = useStudentInsights();
  const [showAIModal, setShowAIModal] = useState(false);

  const handleRefresh = async () => {
    await refreshInsights();
    onShowToast('Insight berhasil diperbarui', 'success');
  };

  const toggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    onShowToast(
      newEnabled ? 'Insight AI diaktifkan' : 'Insight AI dinonaktifkan',
      'info'
    );
  };

  if (loading && !insights) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Heading level={2} size="2xl" weight="bold">My Insights</Heading>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">Analisis AI performa akademik Anda</p>
          </div>
          <Button variant="ghost" onClick={onBack}>
            ← Kembali
          </Button>
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Heading level={2} size="2xl" weight="bold">My Insights</Heading>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">Analisis AI performa akademik Anda</p>
          </div>
          <Button variant="ghost" onClick={onBack}>
            ← Kembali
          </Button>
        </div>
        <ErrorMessage 
          title="Gagal Memuat Insights" 
          message={error} 
          variant="card" 
        />
        <div className="mt-4 flex gap-3">
          <Button onClick={handleRefresh} variant="primary" isLoading={isGenerating} shortcut="Ctrl+R">
            Coba Lagi
          </Button>
          <Button onClick={onBack} variant="ghost">
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Heading level={2} size="2xl" weight="bold">My Insights</Heading>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">Analisis AI performa akademik Anda</p>
          </div>
          <Button variant="ghost" onClick={onBack}>
            ← Kembali
          </Button>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 text-center border border-neutral-200 dark:border-neutral-700">
          <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <Heading level={3} size="lg" weight="semibold" className="mb-2">
            AI Insights Dinonaktifkan
          </Heading>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
            Aktifkan insight AI untuk mendapatkan analisis personal tentang performa akademik Anda.
          </p>
          <Button onClick={toggleEnabled} variant="primary">
            Aktifkan AI Insights
          </Button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Heading level={2} size="2xl" weight="bold">My Insights</Heading>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">Analisis AI performa akademik Anda</p>
          </div>
          <Button variant="ghost" onClick={onBack}>
            ← Kembali
          </Button>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 text-center border border-neutral-200 dark:border-neutral-700">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <Heading level={3} size="lg" weight="semibold" className="mb-2">
            Memuat Insights
          </Heading>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sedang menganalisis data performa Anda...
          </p>
        </div>
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A': 'text-green-600 dark:text-green-400',
      'A-': 'text-green-600 dark:text-green-400',
      'B+': 'text-blue-600 dark:text-blue-400',
      'B': 'text-blue-600 dark:text-blue-400',
      'B-': 'text-blue-600 dark:text-blue-400',
      'C+': 'text-yellow-600 dark:text-yellow-400',
      'C': 'text-yellow-600 dark:text-yellow-400',
      'C-': 'text-yellow-600 dark:text-yellow-400',
      'D': 'text-orange-600 dark:text-orange-400',
      'E': 'text-red-600 dark:text-red-400'
    };
    return colors[grade] || 'text-neutral-600 dark:text-neutral-400';
  };

  const getTrendIcon = (trend: string) => {
    const trendLabels: Record<string, { label: string; icon: string; colorClass: string }> = {
      improving: {
        label: 'Meningkat',
        icon: '↗',
        colorClass: 'text-green-600 dark:text-green-400'
      },
      declining: {
        label: 'Menurun',
        icon: '↘',
        colorClass: 'text-red-600 dark:text-red-400'
      },
      stable: {
        label: 'Stabil',
        icon: '→',
        colorClass: 'text-blue-600 dark:text-blue-400'
      }
    };

    const trendInfo = trendLabels[trend] || trendLabels.stable;
    
    return (
      <span 
        className={trendInfo.colorClass} 
        aria-label={`Tren ${trendInfo.label}`}
        role="img"
      >
        {trendInfo.icon}
        <span className="sr-only">{trendInfo.label}</span>
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="error" size="sm">Prioritas Tinggi</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Prioritas Sedang</Badge>;
      default:
        return <Badge variant="success" size="sm">Prioritas Rendah</Badge>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">My Insights</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Analisis AI performa akademik • Terakhir diperbarui: {new Date(insights.lastUpdated).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleRefresh} 
            variant="ghost" 
            isLoading={isGenerating}
            disabled={loading}
            shortcut="Ctrl+R"
          >
            {isGenerating ? 'Menganalisis...' : '🔄 Refresh'}
          </Button>
          <Button onClick={toggleEnabled} variant="ghost" size="sm">
            {enabled ? '🔴' : '⚫'}
          </Button>
          <Button variant="ghost" onClick={onBack}>
            ← Kembali
          </Button>
        </div>
      </div>

      {/* Motivational Message */}
      <div className={`${GRADIENT_CLASSES.BLUE_PURPLE} rounded-xl p-6 text-white mb-6`}>
        <h3 className="text-xl font-semibold mb-2">✨ Pesan Motivasi</h3>
        <p className="text-blue-50">{insights.motivationalMessage}</p>
      </div>

      {/* Overall Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">IPK</div>
          <div className="text-3xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
            {insights.overallPerformance.gpa.toFixed(2)}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Mata Pelajaran</div>
          <div className="text-3xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
            {insights.overallPerformance.totalSubjects}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Tingkat Perbaikan</div>
          <div className={`text-3xl sm:text-2xl font-bold ${
            insights.overallPerformance.improvementRate >= 0 ? 'text-green-600' : 'text-red-600'
          } dark:text-white`}>
            {insights.overallPerformance.improvementRate >= 0 ? '+' : ''}{insights.overallPerformance.improvementRate.toFixed(1)}%
          </div>
        </Card>

        <Card>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Kehadiran</div>
          <div className={`text-3xl sm:text-2xl font-bold ${
            insights.attendanceInsight.percentage >= 90 ? 'text-green-600' : 'text-yellow-600'
          } dark:text-white`}>
            {insights.attendanceInsight.percentage.toFixed(1)}%
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Grade Performance */}
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Performa Mata Pelajaran</h3>
          <div className="space-y-3">
            {insights.gradePerformance.map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div>{getTrendIcon(subject.trend)}</div>
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-white">{subject.subject}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Rata-rata: {subject.averageScore.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className={`text-xl font-bold ${getGradeColor(subject.grade)}`}>
                  {subject.grade}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Study Recommendations */}
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Rekomendasi Belajar</h3>
          <div className="space-y-4">
            {insights.studyRecommendations.map((rec, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  {getPriorityBadge(rec.priority)}
                  <span className="font-medium text-neutral-900 dark:text-white">{rec.subject}</span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{rec.recommendation}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">⏰ {rec.timeAllocation}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Trends Chart */}
      {insights.performanceTrends.length > 0 && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Tren Performa</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={insights.performanceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="averageScore"
                stroke={CHART_COLORS.sky}
                strokeWidth={2}
                name="Rata-rata Nilai"
              />
              <Line
                type="monotone"
                dataKey="attendanceRate"
                stroke={CHART_COLORS.emerald}
                strokeWidth={2}
                name="Kehadiran (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* AI Analysis */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">🤖 Analisis AI</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAIModal(true)}
          >
            Lihat Detail
          </Button>
        </div>
        <div className="prose dark:prose-invert max-w-none">
          <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
            {insights.aiAnalysis}
          </div>
        </div>
      </Card>

      {/* AI Analysis Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`bg-white dark:bg-neutral-800 rounded-xl max-w-4xl ${HEIGHT_CLASSES.PARENT.VIEW} overflow-auto p-6 w-full`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">🤖 Analisis Lengkap AI</h3>
              <Button variant="ghost" onClick={() => setShowAIModal(false)}>
                ✕
              </Button>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                {insights.aiAnalysis}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInsights;