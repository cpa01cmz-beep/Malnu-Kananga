import React, { useState, useEffect, useCallback } from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UserIcon } from './icons/UserIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { StarIcon } from './icons/MaterialIcons';
import { ClockIcon, TrendingUpIcon, TrendingDownIcon } from './icons/MaterialIcons';
import { ELibrary } from '../types';
import { logger } from '../utils/logger';

interface MaterialAnalyticsProps {
  material: ELibrary;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

interface AnalyticsData {
  totalDownloads: number;
  uniqueUsers: number;
  averageRating: number;
  totalReviews: number;
  lastAccessed: string;
  dailyStats: {
    date: string;
    downloads: number;
    uniqueUsers: number;
  }[];
  monthlyStats: {
    month: string;
    downloads: number;
    uniqueUsers: number;
  }[];
}

const MaterialAnalyticsComponent: React.FC<MaterialAnalyticsProps> = ({
  material,
  onShowToast
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const mockAnalytics: AnalyticsData = {
        totalDownloads: material.downloadCount + Math.floor(Math.random() * 50),
        uniqueUsers: Math.floor(material.downloadCount * 0.7) + Math.floor(Math.random() * 20),
        averageRating: 4.2 + Math.random() * 0.8,
        totalReviews: Math.floor(Math.random() * 15) + 3,
        lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        dailyStats: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          downloads: Math.floor(Math.random() * 10) + 1,
          uniqueUsers: Math.floor(Math.random() * 8) + 1,
        })).reverse(),
        monthlyStats: Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return {
            month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
            downloads: Math.floor(Math.random() * 100) + 20,
            uniqueUsers: Math.floor(Math.random() * 80) + 15,
          };
        }).reverse(),
      };
      setAnalytics(mockAnalytics);
    } catch (err) {
      logger.error('Error fetching analytics:', err);
      onShowToast('Gagal memuat analytics', 'error');
    } finally {
      setLoading(false);
    }
  }, [material, onShowToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, onShowToast]);

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return { isUp: true, percentage: 100 };
    const change = ((current - previous) / previous) * 100;
    return {
      isUp: change >= 0,
      percentage: Math.abs(change)
    };
  };

  const getEngagementLevel = (downloads: number, users: number): 'low' | 'medium' | 'high' => {
    const ratio = downloads / users;
    if (ratio < 1.5) return 'low';
    if (ratio < 2.5) return 'medium';
    return 'high';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysSinceLastAccess = (dateString: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <ChartBarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Analytics tidak tersedia</p>
      </div>
    );
  }

  const engagementLevel = getEngagementLevel(analytics.totalDownloads, analytics.uniqueUsers);
  const daysSinceLastAccess = getDaysSinceLastAccess(analytics.lastAccessed);
  
  // Calculate recent trends
  const recentDaily = analytics.dailyStats.slice(-7);
  const previousDaily = analytics.dailyStats.slice(-14, -7);
  const downloadsTrend = getTrend(
    recentDaily.reduce((sum, d) => sum + d.downloads, 0),
    previousDaily.reduce((sum, d) => sum + d.downloads, 0)
  );

  return (
    <div className="material-analytics">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          {showDetails ? 'Sederhanakan' : 'Detail Lengkap'}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownTrayIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Unduhan</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analytics.totalDownloads}
          </p>
          {downloadsTrend.isUp ? (
            <div className="flex items-center gap-1 mt-1">
              <TrendingUpIcon className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 dark:text-green-400">
                +{downloadsTrend.percentage.toFixed(1)}% minggu ini
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-1">
              <TrendingDownIcon className="w-3 h-3 text-red-500" />
              <span className="text-xs text-red-600 dark:text-red-400">
                -{downloadsTrend.percentage.toFixed(1)}% minggu ini
              </span>
            </div>
          )}
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Pengguna Unik</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analytics.uniqueUsers}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <div className={`w-2 h-2 rounded-full ${
              engagementLevel === 'high' ? 'bg-green-500' :
              engagementLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Engagement {engagementLevel}
            </span>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <StarIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Rating</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analytics.averageRating.toFixed(1)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {analytics.totalReviews} review
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Terakhir Diakses</span>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {daysSinceLastAccess === 0 ? 'Hari ini' :
             daysSinceLastAccess === 1 ? 'Kemarin' :
             `${daysSinceLastAccess} hari lalu`}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {formatDate(analytics.lastAccessed)}
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-6">
          {/* Daily Activity */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Aktivitas Harian (7 Hari Terakhir)</h4>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="space-y-2">
                {analytics.dailyStats.slice(-7).map((stat) => {
                  const isActive = stat.date === new Date().toISOString().split('T')[0];
                  return (
                    <div key={stat.date} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {new Date(stat.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })}
                        </span>
                        {isActive && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                            Hari ini
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{stat.downloads} unduhan</span>
                        <span>{stat.uniqueUsers} pengguna</span>
                        <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${(stat.downloads / Math.max(...analytics.dailyStats.map(d => d.downloads))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Trend Bulanan (6 Bulan Terakhir)</h4>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Unduhan per Bulan</h5>
                  <div className="space-y-1">
                    {analytics.monthlyStats.map((stat) => (
                      <div key={stat.month} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{stat.month}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{stat.downloads}</span>
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${(stat.downloads / Math.max(...analytics.monthlyStats.map(s => s.downloads))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Pengguna Unik per Bulan</h5>
                  <div className="space-y-1">
                    {analytics.monthlyStats.map((stat) => (
                      <div key={stat.month} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{stat.month}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{stat.uniqueUsers}</span>
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-green-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${(stat.uniqueUsers / Math.max(...analytics.monthlyStats.map(s => s.uniqueUsers))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Insights */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Insight Engagement</h4>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.totalDownloads / analytics.uniqueUsers > 0 ? 
                      (analytics.totalDownloads / analytics.uniqueUsers).toFixed(1) : '0'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Rata-rata Unduhan per Pengguna</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {recentDaily.reduce((sum, d) => sum + d.downloads, 0)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Unduhan 7 Hari Terakhir</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {recentDaily.reduce((sum, d) => sum + d.uniqueUsers, 0)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Pengguna Unik 7 Hari Terakhir</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialAnalyticsComponent;